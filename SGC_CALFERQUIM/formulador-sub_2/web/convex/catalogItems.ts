import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {
    clase: v.optional(v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR"))),
    search: v.optional(v.string()),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let items;
    if (args.clase) {
      items = await ctx.db.query("catalogItems").withIndex("by_clase", (q) => q.eq("clase", args.clase!)).collect();
    } else {
      items = await ctx.db.query("catalogItems").collect();
    }

    if (!args.includeArchived) {
      items = items.filter((i) => i.archivedAt === undefined);
    }

    if (args.search) {
      const term = args.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.internalId.toLowerCase().includes(term) ||
          i.nombre.toLowerCase().includes(term) ||
          (i.externalCode ?? "").toLowerCase().includes(term)
      );
    }

    return items.sort((a, b) => a.internalId.localeCompare(b.internalId));
  },
});

export const getByInternalId = query({
  args: { internalId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", (q) => q.eq("internalId", args.internalId))
      .first();
    return results ?? null;
  },
});

export const getById = query({
  args: { id: v.id("catalogItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("catalogItems").collect();
    const active = items.filter((i) => i.archivedAt === undefined);
    return {
      total: items.length,
      active: active.length,
      mp: active.filter((i) => i.clase === "MP").length,
      pt: active.filter((i) => i.clase === "PT").length,
      mzr: active.filter((i) => i.clase === "MZR").length,
    };
  },
});

export const getCatalogChangeHistory = query({
  args: {
    internalId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("catalogChangeHistory").withIndex("by_changedAt");
    const items = await query.order("desc").collect();

    const filtered = args.internalId
      ? items.filter((i) => i.internalId === args.internalId)
      : items;

    return filtered.slice(0, args.limit ?? 50);
  },
});

export const isEmpty = query({
  args: {},
  handler: async (ctx) => {
    const first = await ctx.db.query("catalogItems").first();
    return first === null;
  },
});