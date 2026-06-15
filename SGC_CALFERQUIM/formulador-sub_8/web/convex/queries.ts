/**
 * Queries del Formulador CFQ v2
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Obtener todos los items del catálogo activos (no archivados)
 */
export const getCatalog = query({
  args: {
    clase: v.optional(v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let items;
    if (args.clase) {
      items = await ctx.db
        .query("catalogItems")
        .withIndex("by_clase", (q) => q.eq("clase", args.clase!))
        .collect();
    } else {
      items = await ctx.db.query("catalogItems").collect();
    }

    // Filtrar archivados
    items = items.filter((item) => item.archivedAt === undefined);

    // Filtrar por búsqueda
    if (args.search) {
      const term = args.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.nombre.toLowerCase().includes(term) ||
          item.internalId.toLowerCase().includes(term) ||
          item.externalCode.toLowerCase().includes(term)
      );
    }

    return items.sort((a, b) => {
      if (a.clase !== b.clase) return a.clase.localeCompare(b.clase);
      return a.internalId.localeCompare(b.internalId);
    });
  },
});

/**
 * Obtener un item del catálogo por internalId
 */
export const getCatalogItem = query({
  args: { internalId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", (q) => q.eq("internalId", args.internalId))
      .collect();
    return items[0] ?? null;
  },
});

/**
 * Obtener el catálogo completo para cálculos (sin filtros)
 */
export const getCatalogAll = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("catalogItems").collect();
    return items.filter((item) => item.archivedAt === undefined);
  },
});

/**
 * Obtener todas las listas de producto activas
 */
export const getProductLists = query({
  args: {
    targetProductId: v.optional(v.id("catalogItems")),
  },
  handler: async (ctx, args) => {
    let lists;
    if (args.targetProductId) {
      lists = await ctx.db
        .query("productLists")
        .withIndex("by_targetProductId", (q) =>
          q.eq("targetProductId", args.targetProductId)
        )
        .collect();
    } else {
      lists = await ctx.db.query("productLists").collect();
    }
    return lists.filter((l) => l.archivedAt === undefined);
  },
});

/**
 * Obtener una lista por displayCode
 */
export const getProductListByCode = query({
  args: { displayCode: v.string() },
  handler: async (ctx, args) => {
    const lists = await ctx.db
      .query("productLists")
      .withIndex("by_displayCode", (q) => q.eq("displayCode", args.displayCode))
      .collect();
    return lists[0] ?? null;
  },
});

/**
 * Obtener snapshots de una lista
 */
export const getSnapshotsForList = query({
  args: { productListId: v.id("productLists") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productListSnapshots")
      .withIndex("by_productListId", (q) =>
        q.eq("productListId", args.productListId)
      )
      .collect();
  },
});

/**
 * Obtener snapshots por producto objetivo
 */
export const getSnapshotsForProduct = query({
  args: { targetProductId: v.id("catalogItems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productListSnapshots")
      .withIndex("by_targetProductId", (q) =>
        q.eq("targetProductId", args.targetProductId)
      )
      .collect();
  },
});

/**
 * Obtener historial de cambios de un item del catálogo
 */
export const getChangeHistory = query({
  args: {
    catalogItemId: v.optional(v.id("catalogItems")),
    internalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.catalogItemId) {
      return await ctx.db
        .query("catalogChangeHistory")
        .withIndex("by_catalogItemId", (q) =>
          q.eq("catalogItemId", args.catalogItemId!)
        )
        .order("desc")
        .collect();
    }
    if (args.internalId) {
      return await ctx.db
        .query("catalogChangeHistory")
        .withIndex("by_internalId", (q) =>
          q.eq("internalId", args.internalId!)
        )
        .order("desc")
        .collect();
    }
    // Últimos 100 cambios globales
    return await ctx.db
      .query("catalogChangeHistory")
      .withIndex("by_changedAt")
      .order("desc")
      .take(100);
  },
});

/**
 * Verificar si el catálogo tiene datos (para seed)
 */
export const isCatalogEmpty = query({
  handler: async (ctx) => {
    const first = await ctx.db.query("catalogItems").first();
    return first === null;
  },
});

/**
 * Obtener el conteo del catálogo por clase
 */
export const getCatalogCounts = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("catalogItems").collect();
    const active = items.filter((i) => i.archivedAt === undefined);
    return {
      total: active.length,
      MP: active.filter((i) => i.clase === "MP").length,
      PT: active.filter((i) => i.clase === "PT").length,
      MZR: active.filter((i) => i.clase === "MZR").length,
    };
  },
});