import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { NUTRIENT_KEYS } from "../src/lib/constants";
import { calcularComposicion, evaluarTodos } from "../src/lib/tolerancias";
import type { NutrientKey } from "../src/lib/constants";

const nutrientVal = v.object({
  C: v.number(), N: v.number(), N_NH4: v.number(), N_NO3: v.number(),
  N_org: v.number(), N_ur: v.number(), P: v.number(), K: v.number(),
  CaO: v.number(), MgO: v.number(), S: v.number(), B: v.number(),
  Co: v.number(), Cu: v.number(), Fe: v.number(), Mn: v.number(),
  Mo: v.number(), SiO2: v.number(), Zn: v.number(), Na: v.number(),
});

export const listAll = query({
  args: {
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let lists = await ctx.db.query("productLists").collect();
    if (!args.includeArchived) {
      lists = lists.filter((l) => l.archivedAt === undefined);
    }
    lists.sort((a, b) => b.createdAt - a.createdAt);

    const enriched = await Promise.all(
      lists.map(async (l) => {
        let targetProduct = null;
        if (l.targetProductId) {
          targetProduct = await ctx.db.get(l.targetProductId);
        }
        return { ...l, targetProduct };
      })
    );
    return enriched;
  },
});

export const getByDisplayCode = query({
  args: { displayCode: v.string() },
  handler: async (ctx, args) => {
    const list = await ctx.db
      .query("productLists")
      .withIndex("by_displayCode", (q) => q.eq("displayCode", args.displayCode))
      .first();
    if (!list) return null;
    let targetProduct = null;
    if (list.targetProductId) {
      targetProduct = await ctx.db.get(list.targetProductId);
    }
    return { ...list, targetProduct };
  },
});

export const getById = query({
  args: { id: v.id("productLists") },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.id);
    if (!list) return null;
    let targetProduct = null;
    if (list.targetProductId) {
      targetProduct = await ctx.db.get(list.targetProductId);
    }
    return { ...list, targetProduct };
  },
});

export const getNextConsecutive = query({
  args: {
    targetInternalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lists = await ctx.db.query("productLists").collect();
    const prefix = args.targetInternalId ?? "BORRADOR";
    const existing = lists
      .filter((l) => l.displayCode.startsWith(prefix + "-L"))
      .map((l) => {
        const match = l.displayCode.match(/-L(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
    return existing.length > 0 ? Math.max(...existing) + 1 : 1;
  },
});

export const save = mutation({
  args: {
    displayCode: v.string(),
    targetProductId: v.optional(v.id("catalogItems")),
    targetProductSnapshot: v.optional(v.object({
      internalId: v.string(),
      nombre: v.string(),
      ...Object.fromEntries(NUTRIENT_KEYS.map((k: NutrientKey) => [k, v.number()])),
    })),
    components: v.array(v.object({
      catalogItemId: v.id("catalogItems"),
      internalId: v.string(),
      nombre: v.string(),
      cantidadKg: v.number(),
      nutrientSnapshot: nutrientVal,
    })),
    totalKg: v.number(),
    createdBy: v.optional(v.string()),
    existingListId: v.optional(v.id("productLists")),
  },
  handler: async (ctx, args) => {
    const computed = calcularComposicion(
      args.components.map((c) => ({
        cantidadKg: c.cantidadKg,
        nutrientSnapshot: c.nutrientSnapshot as Record<NutrientKey, number>,
      }))
    );

    let declarados: Record<string, number> = {};
    if (args.targetProductSnapshot) {
      const snap = args.targetProductSnapshot as any;
      for (const key of NUTRIENT_KEYS) {
        declarados[key] = snap[key] ?? 0;
      }
    }

    const { details, generalStatus } = evaluarTodos(
      computed as Record<NutrientKey, number>,
      declarados as Record<NutrientKey, number>
    );

    const alertas: string[] = [];
    if (Math.abs(args.totalKg - 1000) > 0.01) {
      alertas.push(`Total ${args.totalKg.toFixed(2)} kg distinto de 1000 kg`);
    }

    const now = Date.now();

    let listId;
    if (args.existingListId) {
      await ctx.db.patch(args.existingListId, {
        displayCode: args.displayCode,
        targetProductId: args.targetProductId,
        targetProductSnapshot: args.targetProductSnapshot as any,
        components: args.components,
        totalKg: args.totalKg,
        generalStatus,
        updatedAt: now,
      });
      listId = args.existingListId;
    } else {
      listId = await ctx.db.insert("productLists", {
        displayCode: args.displayCode,
        targetProductId: args.targetProductId,
        targetProductSnapshot: args.targetProductSnapshot as any,
        components: args.components,
        totalKg: args.totalKg,
        generalStatus,
        createdBy: args.createdBy,
        createdAt: now,
        updatedAt: now,
      });
    }

    const existingSnapshots = await ctx.db
      .query("productListSnapshots")
      .withIndex("by_productListId", (q) => q.eq("productListId", listId))
      .collect();

    const snapshotVersion = existingSnapshots.length > 0
      ? Math.max(...existingSnapshots.map((s) => s.snapshotVersion)) + 1
      : 1;

    await ctx.db.insert("productListSnapshots", {
      productListId: listId,
      displayCode: args.displayCode,
      targetProductId: args.targetProductId,
      targetProductSnapshot: args.targetProductSnapshot as any,
      components: args.components,
      computedComposition: computed as any,
      toleranceDetail: details,
      generalStatus,
      totalKg: args.totalKg,
      alertas,
      snapshotVersion,
      createdBy: args.createdBy,
      createdAt: now,
    });

    return { listId, generalStatus, snapshotVersion, computed, alertas };
  },
});

export const archiveList = mutation({
  args: { id: v.id("productLists") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { archivedAt: Date.now() });
    return true;
  },
});