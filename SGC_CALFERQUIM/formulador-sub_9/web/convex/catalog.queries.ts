/**
 * Queries para el catálogo de items.
 */

import { query } from "./_generated/server";

export const listCatalogItems = query({
  args: {
    clase: v.optional(v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR"))),
    search: v.optional(v.string()),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("catalogItems").collect();

    // Filtrar por clase
    if (args.clase) {
      items = items.filter(i => i.class === args.clase);
    }

    // Filtrar archivados
    if (!args.includeArchived) {
      items = items.filter(i => !i.archivedAt);
    }

    // Búsqueda por nombre o código
    if (args.search) {
      const termino = args.search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(termino) ||
        i.internalId.toLowerCase().includes(termino) ||
        (i.externalCode && i.externalCode.toLowerCase().includes(termino))
      );
    }

    return items;
  },
});

export const getCatalogItem = query({
  args: {
    id: v.id("catalogItems"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCatalogItemByInternalId = query({
  args: {
    internalId: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", q => q.eq("internalId", args.internalId))
      .collect();
    return items[0] || null;
  },
});

export const getChangeHistory = query({
  args: {
    catalogItemId: v.optional(v.id("catalogItems")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let history;
    
    if (args.catalogItemId) {
      history = await ctx.db
        .query("catalogChangeHistory")
        .withIndex("by_catalogItemId", q => q.eq("catalogItemId", args.catalogItemId!))
        .collect();
    } else {
      history = await ctx.db.query("catalogChangeHistory").collect();
    }

    // Ordenar por fecha descendente
    history.sort((a, b) => b.changedAt - a.changedAt);

    // Limitar resultados
    if (args.limit) {
      history = history.slice(0, args.limit);
    }

    return history;
  },
});

export const getCatalogStats = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("catalogItems").collect();
    
    const stats = {
      total: items.length,
      MP: items.filter(i => i.class === "MP").length,
      PT: items.filter(i => i.class === "PT").length,
      MZR: items.filter(i => i.class === "MZR").length,
      archived: items.filter(i => i.archivedAt).length,
      active: items.filter(i => !i.archivedAt).length,
    };

    return stats;
  },
});