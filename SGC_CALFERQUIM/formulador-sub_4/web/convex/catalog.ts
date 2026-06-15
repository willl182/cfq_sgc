import { v } from "convex/vertices";
import { mutation, query } from "./functions/_generated";
import { catalogItems, catalogChangeHistory } from "./schema";
import { parseCsv, assignInternalIds, classifyMZR } from "./csvParser";

export const list = query({
  args: {
    clase: v.optional(v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR"))),
    search: v.optional(v.string()),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("catalogItems").collect();

    if (!args.includeArchived) {
      items = items.filter(item => item.archivedAt === 0);
    }

    if (args.clase) {
      items = items.filter(item => item.class === args.clase);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      items = items.filter(
        item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.internalId.toLowerCase().includes(searchLower) ||
          item.externalCode.toLowerCase().includes(searchLower)
      );
    }

    return items.sort((a, b) => a.internalId.localeCompare(b.internalId));
  },
});

export const getById = query({
  args: { id: v.id("catalogItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByInternalId = query({
  args: { internalId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", (q) => q.eq("internalId", args.internalId))
      .first();
    return items;
  },
});

export const isEmpty = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("catalogItems").collect();
    return items.length === 0;
  },
});

export const listRecentChanges = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let changes = await ctx.db.query("catalogChangeHistory").collect();
    changes = changes.sort((a, b) => b.changedAt - a.changedAt);
    const limit = args.limit ?? 50;
    return changes.slice(0, limit);
  },
});

export const getChangesForItem = query({
  args: { catalogItemId: v.id("catalogItems") },
  handler: async (ctx, args) => {
    const changes = await ctx.db
      .query("catalogChangeHistory")
      .withIndex("by_catalogItemId", (q) => q.eq("catalogItemId", args.catalogItemId))
      .collect();
    return changes.sort((a, b) => b.changedAt - a.changedAt);
  },
});

export const seedFromCsv = mutation({
  args: {
    csvContent: v.string(),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const existingItems = await ctx.db.query("catalogItems").collect();
    if (existingItems.length > 0) {
      throw new Error("El catálogo ya contiene datos. No se puede realizar la carga inicial.");
    }

    const parseResult = parseCsv(args.csvContent);
    if (parseResult.errors.length > 0 && !parseResult.success) {
      throw new Error(
        `Errores al parsear CSV: ${parseResult.errors.map(e => e.message).join("; ")}`
      );
    }

    const itemsWithIds = assignInternalIds(parseResult.items);
    const now = Date.now();

    for (const item of itemsWithIds) {
      await ctx.db.insert("catalogItems", {
        internalId: item.internalId,
        externalCode: item.externalCode,
        originalCode: item.originalCode,
        name: item.name,
        class: item.class,
        type: item.type,
        nutrients: item.nutrients,
        archivedAt: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      rowsRead: parseResult.rowsRead,
      rowsInserted: parseResult.rowsInserted,
      rowsRejected: parseResult.rowsRejected,
      errors: parseResult.errors,
    };
  },
});

export const updateNutrients = mutation({
  args: {
    id: v.id("catalogItems"),
    nutrients: v.object({
      C: v.number(),
      N: v.number(),
      N_NH4: v.number(),
      N_NO3: v.number(),
      N_org: v.number(),
      N_ur: v.number(),
      P: v.number(),
      K: v.number(),
      CaO: v.number(),
      MgO: v.number(),
      S: v.number(),
      B: v.number(),
      Co: v.number(),
      Cu: v.number(),
      Fe: v.number(),
      Mn: v.number(),
      Mo: v.number(),
      SiO2: v.number(),
      Zn: v.number(),
      Na: v.number(),
    }),
    actor: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item no encontrado");

    const oldNutrients = item.nutrients;
    const newNutrients = args.nutrients;
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    const nutrientKeys = Object.keys(oldNutrients) as Array<keyof typeof oldNutrients>;
    for (const key of nutrientKeys) {
      if (oldNutrients[key] !== newNutrients[key]) {
        changes.push({
          field: `nutrients.${key}`,
          oldValue: oldNutrients[key],
          newValue: newNutrients[key],
        });
      }
    }

    if (changes.length === 0) return;

    await ctx.db.patch(args.id, {
      nutrients: newNutrients,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("catalogChangeHistory", {
      catalogItemId: args.id,
      internalId: item.internalId,
      actor: args.actor,
      changedAt: Date.now(),
      reason: args.reason,
      origin: "catalog_edit",
      changes,
    });
  },
});

export const archive = mutation({
  args: {
    id: v.id("catalogItems"),
    actor: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item no encontrado");

    await ctx.db.patch(args.id, {
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("catalogChangeHistory", {
      catalogItemId: args.id,
      internalId: item.internalId,
      actor: args.actor,
      changedAt: Date.now(),
      reason: args.reason,
      origin: "archive",
      changes: [{ field: "archivedAt", oldValue: 0, newValue: Date.now() }],
    });
  },
});