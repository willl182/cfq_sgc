/**
 * Queries para listas y snapshots.
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

export const listProductLists = query({
  args: {
    targetProductId: v.optional(v.id("catalogItems")),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let lists = await ctx.db.query("productLists").collect();

    if (!args.includeArchived) {
      lists = lists.filter(l => !l.archivedAt);
    }

    if (args.targetProductId) {
      lists = lists.filter(l => l.targetProductId?.toString() === args.targetProductId?.toString());
    }

    return lists;
  },
});

export const getProductList = query({
  args: {
    id: v.id("productLists"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listSnapshots = query({
  args: {
    productListId: v.optional(v.id("productLists")),
    targetProductId: v.optional(v.id("catalogItems")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let snapshots = await ctx.db.query("productListSnapshots").collect();

    if (args.productListId) {
      snapshots = snapshots.filter(s => s.productListId?.toString() === args.productListId?.toString());
    }

    if (args.targetProductId) {
      snapshots = snapshots.filter(s => s.targetProductId?.toString() === args.targetProductId?.toString());
    }

    // Ordenar por fecha descendente
    snapshots.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      snapshots = snapshots.slice(0, args.limit);
    }

    return snapshots;
  },
});

export const getSnapshot = query({
  args: {
    id: v.id("productListSnapshots"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getSnapshotsByListId = query({
  args: {
    productListId: v.id("productLists"),
  },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("productListSnapshots")
      .withIndex("by_productListId", q => q.eq("productListId", args.productListId))
      .collect();

    // Ordenar por versión
    snapshots.sort((a, b) => {
      const vA = parseInt(a.snapshotVersion.replace("v", "")) || 0;
      const vB = parseInt(b.snapshotVersion.replace("v", "")) || 0;
      return vA - vB;
    });

    return snapshots;
  },
});