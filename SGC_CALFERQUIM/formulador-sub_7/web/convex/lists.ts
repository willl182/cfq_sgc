import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import {
  calcularComposicion,
  evaluarLista,
  round4,
  type NutrientRecord,
} from "../src/lib/nutrients";
import type { Id } from "./_generated/dataModel";

export const listAll = query({
  args: {
    targetProductId: v.optional(v.string()),
    archived: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("productLists"),
      targetProductId: v.optional(v.string()),
      displayCode: v.string(),
      alias: v.optional(v.string()),
      components: v.array(v.object({ internalId: v.string(), cantidadKg: v.number() })),
      totalKg: v.number(),
      archivedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, { targetProductId, archived }) => {
    let lists = await ctx.db.query("productLists").collect();
    if (targetProductId) {
      lists = lists.filter((l) => l.targetProductId === targetProductId);
    }
    if (archived === false) {
      lists = lists.filter((l) => !l.archivedAt);
    } else if (archived === true) {
      lists = lists.filter((l) => l.archivedAt);
    }
    return lists.map((l) => ({
      _id: l._id,
      targetProductId: l.targetProductId,
      displayCode: l.displayCode,
      alias: l.alias,
      components: l.components,
      totalKg: l.components.reduce((sum, c) => sum + c.cantidadKg, 0),
      archivedAt: l.archivedAt,
    }));
  },
});

export const getList = query({
  args: { id: v.id("productLists") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("productLists"),
      targetProductId: v.optional(v.string()),
      displayCode: v.string(),
      alias: v.optional(v.string()),
      components: v.array(v.object({ internalId: v.string(), cantidadKg: v.number() })),
      totalKg: v.number(),
    })
  ),
  handler: async (ctx, { id }) => {
    const list = await ctx.db.get(id);
    if (!list) return null;
    return {
      _id: list._id,
      targetProductId: list.targetProductId,
      displayCode: list.displayCode,
      alias: list.alias,
      components: list.components,
      totalKg: list.components.reduce((sum, c) => sum + c.cantidadKg, 0),
    };
  },
});

export const saveList = mutation({
  args: {
    id: v.optional(v.id("productLists")),
    targetProductId: v.optional(v.string()),
    alias: v.optional(v.string()),
    components: v.array(v.object({ internalId: v.string(), cantidadKg: v.number() })),
    user: v.string(),
  },
  returns: v.object({
    listId: v.id("productLists"),
    snapshotId: v.id("productListSnapshots"),
    version: v.number(),
  }),
  handler: async (ctx, { id, targetProductId, alias, components, user }) => {
    // 1. Obtener datos del catálogo para calcular composición
    const enrichedComponents: { internalId: string; cantidadKg: number; nutrients: NutrientRecord }[] = [];
    for (const c of components) {
      const item = await ctx.db
        .query("catalogItems")
        .withIndex("by_internalId", (q) => q.eq("internalId", c.internalId))
        .unique();
      if (!item) {
        throw new Error(`Item de catálogo no encontrado: ${c.internalId}`);
      }
      enrichedComponents.push({
        internalId: c.internalId,
        cantidadKg: c.cantidadKg,
        nutrients: item.nutrients as NutrientRecord,
      });
    }

    const composicion = calcularComposicion(enrichedComponents);
    const targetProduct = targetProductId
      ? await ctx.db
          .query("catalogItems")
          .withIndex("by_internalId", (q) => q.eq("internalId", targetProductId))
          .unique()
      : null;

    const targetSnapshot = targetProduct
      ? (targetProduct.nutrients as NutrientRecord)
      : null;

    const { evaluation, generalStatus, alerts } = evaluarLista(composicion, targetSnapshot);

    const totalKg = components.reduce((sum, c) => sum + c.cantidadKg, 0);
    if (Math.abs(totalKg - 1000) > 0.01) {
      alerts.push(`Total ${round4(totalKg)} kg ≠ 1000 kg`);
    }

    // 2. Guardar o actualizar lista viva
    let listId: Id<"productLists">;
    let version: number;
    if (id) {
      const existing = await ctx.db.get(id);
      if (!existing) {
        throw new Error("Lista no encontrada");
      }
      listId = existing._id;
      version = (await ctx.db
        .query("productListSnapshots")
        .withIndex("by_productListId", (q) => q.eq("productListId", listId))
        .collect()
      ).length + 1;
      await ctx.db.patch(listId, {
        targetProductId,
        alias,
        components,
      });
    } else {
      const existingCount = targetProductId
        ? await ctx.db
            .query("productLists")
            .withIndex("by_targetProductId", (q) => q.eq("targetProductId", targetProductId))
            .collect()
        : await ctx.db.query("productLists").collect();
      const prefix = targetProductId ?? "BORRADOR";
      const suffix = String(existingCount.length + 1).padStart(3, "0");
      const displayCode = `${prefix}-L${suffix}`;
      listId = await ctx.db.insert("productLists", {
        targetProductId,
        displayCode,
        alias,
        components,
      });
      version = 1;
    }

    // 3. Crear snapshot
    const componentsSnapshot = enrichedComponents.map((c) => ({
      internalId: c.internalId,
      name: c.internalId,
      cantidadKg: c.cantidadKg,
      compositionSnapshot: c.nutrients,
    }));

    // Obtener nombres para snapshot
    for (const cs of componentsSnapshot) {
      const found = await ctx.db
        .query("catalogItems")
        .withIndex("by_internalId", (q) => q.eq("internalId", cs.internalId))
        .unique();
      if (found) cs.name = found.name;
    }

    const snapshotId = await ctx.db.insert("productListSnapshots", {
      productListId: listId,
      targetProductId,
      snapshotVersion: version,
      createdAt: Date.now(),
      targetSnapshot: targetSnapshot ?? undefined,
      componentsSnapshot,
      compositionCalculated: composicion,
      evaluation,
      generalStatus,
      totalKg,
      alerts,
      user,
      date: Date.now(),
    });

    return { listId, snapshotId, version };
  },
});

export const listSnapshots = query({
  args: {
    productListId: v.optional(v.id("productLists")),
    targetProductId: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("productListSnapshots"),
      productListId: v.id("productLists"),
      snapshotVersion: v.number(),
      createdAt: v.number(),
      generalStatus: v.string(),
      totalKg: v.number(),
      alerts: v.array(v.string()),
      user: v.string(),
    })
  ),
  handler: async (ctx, { productListId, targetProductId }) => {
    let snaps = await ctx.db.query("productListSnapshots").collect();
    if (productListId) {
      snaps = snaps.filter((s) => s.productListId === productListId);
    }
    if (targetProductId) {
      snaps = snaps.filter((s) => s.targetProductId === targetProductId);
    }
    return snaps.map((s) => ({
      _id: s._id,
      productListId: s.productListId,
      snapshotVersion: s.snapshotVersion,
      createdAt: s.createdAt,
      generalStatus: s.generalStatus,
      totalKg: s.totalKg,
      alerts: s.alerts,
      user: s.user,
    }));
  },
});

export const getSnapshot = query({
  args: { id: v.id("productListSnapshots") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("productListSnapshots"),
      productListId: v.id("productLists"),
      targetProductId: v.optional(v.string()),
      snapshotVersion: v.number(),
      createdAt: v.number(),
      targetSnapshot: v.optional(v.record(v.string(), v.number())),
      componentsSnapshot: v.array(
        v.object({
          internalId: v.string(),
          name: v.string(),
          cantidadKg: v.number(),
          compositionSnapshot: v.record(v.string(), v.number()),
        })
      ),
      compositionCalculated: v.record(v.string(), v.number()),
      evaluation: v.record(
        v.string(),
        v.object({
          valor: v.number(),
          tolerancia: v.number(),
          estado: v.union(v.literal("C"), v.literal("NC"), v.literal("SUP")),
        })
      ),
      generalStatus: v.string(),
      totalKg: v.number(),
      alerts: v.array(v.string()),
      user: v.string(),
      date: v.number(),
    })
  ),
  handler: async (ctx, { id }) => {
    const s = await ctx.db.get(id);
    if (!s) return null;
    return {
      _id: s._id,
      productListId: s.productListId,
      targetProductId: s.targetProductId,
      snapshotVersion: s.snapshotVersion,
      createdAt: s.createdAt,
      targetSnapshot: s.targetSnapshot as Record<string, number> | undefined,
      componentsSnapshot: s.componentsSnapshot.map((c) => ({
        internalId: c.internalId,
        name: c.name,
        cantidadKg: c.cantidadKg,
        compositionSnapshot: c.compositionSnapshot as Record<string, number>,
      })),
      compositionCalculated: s.compositionCalculated as Record<string, number>,
      evaluation: s.evaluation as Record<string, { valor: number; tolerancia: number; estado: "C" | "NC" | "SUP" }>,
      generalStatus: s.generalStatus,
      totalKg: s.totalKg,
      alerts: s.alerts,
      user: s.user,
      date: s.date,
    };
  },
});
