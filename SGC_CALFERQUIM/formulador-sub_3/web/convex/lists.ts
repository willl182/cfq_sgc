import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { calcularComposicion, NUTRIENTES } from "../lib/calculation";
import { evaluarTolerancia } from "../lib/tolerancia";
import type { CatalogItem } from "../lib/calculation";

export const listProductLists = query({
  args: {
    targetProductId: v.optional(v.string()),
    includeArchived: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("productLists"),
      displayCode: v.string(),
      targetProductId: v.optional(v.id("catalogItems")),
      alias: v.optional(v.string()),
      totalComponents: v.number(),
      archivedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    let items = await ctx.db.query("productLists").collect();

    if (!args.includeArchived) {
      items = items.filter((i) => !i.archivedAt);
    }

    if (args.targetProductId) {
      items = items.filter(
        (i) => i.targetProductId === args.targetProductId
      );
    }

    return items.map((i) => ({
      _id: i._id,
      displayCode: i.displayCode,
      targetProductId: i.targetProductId,
      alias: i.alias,
      totalComponents: i.components.length,
      archivedAt: i.archivedAt,
    }));
  },
});

export const getProductList = query({
  args: { id: v.id("productLists") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("productLists"),
      displayCode: v.string(),
      targetProductId: v.optional(v.id("catalogItems")),
      alias: v.optional(v.string()),
      components: v.array(
        v.object({
          catalogItemId: v.id("catalogItems"),
          internalId: v.string(),
          quantityKg: v.number(),
        })
      ),
      archivedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, { id }) => {
    return (await ctx.db.get(id)) ?? null;
  },
});

export const saveProductList = mutation({
  args: {
    id: v.optional(v.id("productLists")),
    displayCode: v.string(),
    targetProductId: v.optional(v.id("catalogItems")),
    alias: v.optional(v.string()),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        internalId: v.string(),
        quantityKg: v.number(),
      })
    ),
    user: v.string(),
  },
  returns: v.object({
    listId: v.id("productLists"),
    snapshotId: v.id("productListSnapshots"),
    snapshotVersion: v.number(),
  }),
  handler: async (ctx, args) => {
    // Upsert lista viva
    let listId: Id<"productLists">;
    if (args.id) {
      await ctx.db.patch(args.id, {
        displayCode: args.displayCode,
        targetProductId: args.targetProductId,
        alias: args.alias,
        components: args.components,
      });
      listId = args.id;
    } else {
      listId = await ctx.db.insert("productLists", {
        displayCode: args.displayCode,
        targetProductId: args.targetProductId,
        alias: args.alias,
        components: args.components,
      });
    }

    // Calcular composición
    const itemsById: Record<string, CatalogItem> = {};
    for (const comp of args.components) {
      const item = await ctx.db.get(comp.catalogItemId);
      if (item) {
        const nutrients: Partial<Record<string, number>> = {};
        for (const n of NUTRIENTES) {
          nutrients[n] = (item as any)[n];
        }
        itemsById[comp.internalId] = {
          internalId: item.internalId,
          class: item.class,
          name: item.name,
          externalCode: item.externalCode,
          originalCode: item.originalCode,
          tipo: item.tipo,
          test: item.test,
          archivedAt: item.archivedAt,
          ...nutrients,
        };
      }
    }

    const { composition, totalKg } = calcularComposicion(
      args.components.map((c) => ({ ...c, item: itemsById[c.internalId] })),
      itemsById
    );

    // Target
    let target: CatalogItem | null = null;
    if (args.targetProductId) {
      const t = await ctx.db.get(args.targetProductId);
      if (t) {
        const nutrients: Partial<Record<string, number>> = {};
        for (const n of NUTRIENTES) {
          nutrients[n] = (t as any)[n];
        }
        target = {
          internalId: t.internalId,
          class: t.class,
          name: t.name,
          externalCode: t.externalCode,
          originalCode: t.originalCode,
          tipo: t.tipo,
          test: t.test,
          archivedAt: t.archivedAt,
          ...nutrients,
        };
      }
    }

    const evaluation = evaluarTolerancia(composition, totalKg, target);

    const alerts: string[] = [];
    if (totalKg !== 1000) {
      alerts.push(`Total ${totalKg} kg ≠ 1000 kg`);
    }
    if (evaluation.generalStatus === "NO_CUMPLE") {
      alerts.push("No cumple tolerancia");
    }

    // Determinar versión
    const lastSnapshot = await ctx.db
      .query("productListSnapshots")
      .withIndex("by_productListId", (q) => q.eq("productListId", listId))
      .order("desc")
      .take(1);

    const snapshotVersion = (lastSnapshot[0]?.snapshotVersion ?? 0) + 1;

    const snapshotId = await ctx.db.insert("productListSnapshots", {
      productListId: listId,
      targetProductId: args.targetProductId,
      snapshotVersion,
      components: args.components.map((c) => {
        const item = itemsById[c.internalId];
        const compNutrients: Record<string, number> = {};
        if (item) {
          for (const n of NUTRIENTES) {
            const val = item[n];
            if (typeof val === "number") {
              compNutrients[n] = val;
            }
          }
        }
        return {
          internalId: c.internalId,
          name: item?.name ?? c.internalId,
          quantityKg: c.quantityKg,
          composition: compNutrients,
        };
      }),
      calculatedComposition: composition,
      evaluation,
      totalKg,
      alerts,
      user: args.user,
      createdAt: Date.now(),
    });

    return { listId, snapshotId, snapshotVersion };
  },
});

export const listSnapshots = query({
  args: {
    productListId: v.optional(v.id("productLists")),
    targetProductId: v.optional(v.id("catalogItems")),
    includeArchived: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("productListSnapshots"),
      productListId: v.id("productLists"),
      snapshotVersion: v.number(),
      totalKg: v.number(),
      generalStatus: v.string(),
      alerts: v.array(v.string()),
      user: v.string(),
      createdAt: v.number(),
      archivedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    let items = await ctx.db.query("productListSnapshots").collect();

    if (!args.includeArchived) {
      items = items.filter((i) => !i.archivedAt);
    }

    if (args.productListId) {
      items = items.filter((i) => i.productListId === args.productListId);
    }

    if (args.targetProductId) {
      items = items.filter((i) => i.targetProductId === args.targetProductId);
    }

    return items.map((i) => ({
      _id: i._id,
      productListId: i.productListId,
      snapshotVersion: i.snapshotVersion,
      totalKg: i.totalKg,
      generalStatus: i.evaluation.generalStatus,
      alerts: i.alerts,
      user: i.user,
      createdAt: i.createdAt,
      archivedAt: i.archivedAt,
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
      targetProductId: v.optional(v.id("catalogItems")),
      snapshotVersion: v.number(),
      components: v.array(
        v.object({
          internalId: v.string(),
          name: v.string(),
          quantityKg: v.number(),
          composition: v.record(v.string(), v.number()),
        })
      ),
      calculatedComposition: v.record(v.string(), v.number()),
      evaluation: v.object({
        byNutrient: v.record(v.string(), v.string()),
        generalStatus: v.string(),
      }),
      totalKg: v.number(),
      alerts: v.array(v.string()),
      user: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, { id }) => {
    const snap = await ctx.db.get(id);
    if (!snap) return null;
    return {
      _id: snap._id,
      productListId: snap.productListId,
      targetProductId: snap.targetProductId,
      snapshotVersion: snap.snapshotVersion,
      components: snap.components,
      calculatedComposition: snap.calculatedComposition,
      evaluation: {
        byNutrient: snap.evaluation.byNutrient,
        generalStatus: snap.evaluation.generalStatus,
      },
      totalKg: snap.totalKg,
      alerts: snap.alerts,
      user: snap.user,
      createdAt: snap.createdAt,
    };
  },
});

export const cloneSnapshotToList = mutation({
  args: {
    snapshotId: v.id("productListSnapshots"),
    user: v.string(),
  },
  returns: v.object({
    listId: v.id("productLists"),
  }),
  handler: async (ctx, { snapshotId, user }) => {
    const snap = await ctx.db.get(snapshotId);
    if (!snap) {
      throw new Error("Snapshot no encontrado");
    }

    const count = await ctx.db.query("productLists").collect();
    const borradorCount = count.filter((c) =>
      c.displayCode.startsWith("BORRADOR")
    ).length;
    const displayCode = `BORRADOR-L${String(borradorCount + 1).padStart(3, "0")}`;

    const components: { catalogItemId: Id<"catalogItems">; internalId: string; quantityKg: number }[] = [];
    for (const c of snap.components) {
      const item = await ctx.db
        .query("catalogItems")
        .withIndex("by_internalId", (q) => q.eq("internalId", c.internalId))
        .unique();
      if (item) {
        components.push({
          catalogItemId: item._id,
          internalId: c.internalId,
          quantityKg: c.quantityKg,
        });
      }
    }

    const listId = await ctx.db.insert("productLists", {
      displayCode,
      targetProductId: snap.targetProductId,
      alias: `Clonado de ${snap.snapshotVersion}`,
      components,
    });

    // Crear snapshot inicial
    const lastSnapshot = await ctx.db
      .query("productListSnapshots")
      .withIndex("by_productListId", (q) => q.eq("productListId", listId))
      .order("desc")
      .take(1);
    const snapshotVersion = (lastSnapshot[0]?.snapshotVersion ?? 0) + 1;

    await ctx.db.insert("productListSnapshots", {
      productListId: listId,
      targetProductId: snap.targetProductId,
      snapshotVersion,
      components: snap.components,
      calculatedComposition: snap.calculatedComposition,
      evaluation: snap.evaluation,
      totalKg: snap.totalKg,
      alerts: snap.alerts,
      user,
      createdAt: Date.now(),
    });

    return { listId };
  },
});

export const compareSnapshots = query({
  args: {
    a: v.id("productListSnapshots"),
    b: v.id("productListSnapshots"),
  },
  returns: v.object({
    a: v.id("productListSnapshots"),
    b: v.id("productListSnapshots"),
    componentChanges: v.array(
      v.object({
        internalId: v.string(),
        name: v.string(),
        aQty: v.optional(v.number()),
        bQty: v.optional(v.number()),
        delta: v.number(),
      })
    ),
    compositionDelta: v.record(v.string(), v.number()),
    totalDelta: v.number(),
    statusChange: v.string(),
  }),
  handler: async (ctx, { a: aId, b: bId }) => {
    const a = await ctx.db.get(aId);
    const b = await ctx.db.get(bId);
    if (!a || !b) {
      throw new Error("Snapshot no encontrado");
    }

    const aMap = new Map(a.components.map((c) => [c.internalId, c]));
    const bMap = new Map(b.components.map((c) => [c.internalId, c]));

    const allIds = new Set([...aMap.keys(), ...bMap.keys()]);
    const componentChanges: {
      internalId: string;
      name: string;
      aQty?: number;
      bQty?: number;
      delta: number;
    }[] = [];

    for (const id of allIds) {
      const aComp = aMap.get(id);
      const bComp = bMap.get(id);
      const aQty = aComp?.quantityKg ?? 0;
      const bQty = bComp?.quantityKg ?? 0;
      if (aQty !== bQty) {
        componentChanges.push({
          internalId: id,
          name: aComp?.name ?? bComp?.name ?? id,
          aQty: aComp ? aQty : undefined,
          bQty: bComp ? bQty : undefined,
          delta: bQty - aQty,
        });
      }
    }

    const compositionDelta: Record<string, number> = {};
    const allNutrients = new Set([
      ...Object.keys(a.calculatedComposition),
      ...Object.keys(b.calculatedComposition),
    ]);
    for (const n of allNutrients) {
      const aVal = a.calculatedComposition[n] ?? 0;
      const bVal = b.calculatedComposition[n] ?? 0;
      const delta = Math.round((bVal - aVal) * 10000) / 10000;
      if (delta !== 0) {
        compositionDelta[n] = delta;
      }
    }

    return {
      a: aId,
      b: bId,
      componentChanges,
      compositionDelta,
      totalDelta: Math.round((b.totalKg - a.totalKg) * 100) / 100,
      statusChange: `${a.evaluation.generalStatus} → ${b.evaluation.generalStatus}`,
    };
  },
});

export const archiveSnapshot = mutation({
  args: { snapshotId: v.id("productListSnapshots"), actor: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, { snapshotId }) => {
    await ctx.db.patch(snapshotId, { archivedAt: Date.now() });
    return { success: true };
  },
});
