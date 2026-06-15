import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByProductList = query({
  args: {
    productListId: v.id("productLists"),
  },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("productListSnapshots")
      .withIndex("by_productListId", (q) => q.eq("productListId", args.productListId))
      .collect();
    return snapshots.sort((a, b) => b.snapshotVersion - a.snapshotVersion);
  },
});

export const listByTargetProduct = query({
  args: {
    targetProductId: v.id("catalogItems"),
  },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("productListSnapshots")
      .withIndex("by_targetProductId", (q) => q.eq("targetProductId", args.targetProductId))
      .collect();
    return snapshots.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const snapshots = await ctx.db
      .query("productListSnapshots")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    return snapshots;
  },
});

export const listAll = query({
  args: {
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let snapshots = await ctx.db.query("productListSnapshots").collect();
    if (!args.includeArchived) {
      snapshots = snapshots.filter((s) => s.archivedAt === undefined);
    }
    return snapshots.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getById = query({
  args: { id: v.id("productListSnapshots") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByDisplayCode = query({
  args: {
    displayCode: v.string(),
  },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("productListSnapshots")
      .withIndex("by_displayCode", (q) => q.eq("displayCode", args.displayCode))
      .collect();
    return snapshots.sort((a, b) => b.snapshotVersion - a.snapshotVersion);
  },
});

export const archiveSnapshot = mutation({
  args: { id: v.id("productListSnapshots") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { archivedAt: Date.now() });
    return true;
  },
});

export const cloneSnapshotToList = mutation({
  args: {
    snapshotId: v.id("productListSnapshots"),
    newDisplayCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot) throw new Error("Snapshot not found");

    const now = Date.now();
    const displayCode = args.newDisplayCode ?? `${snapshot.displayCode}-copia`;

    const listId = await ctx.db.insert("productLists", {
      displayCode,
      targetProductId: snapshot.targetProductId ?? undefined,
      targetProductSnapshot: snapshot.targetProductSnapshot ?? undefined,
      components: snapshot.components,
      totalKg: snapshot.totalKg,
      generalStatus: snapshot.generalStatus,
      createdBy: "cloned_from_snapshot",
      createdAt: now,
      updatedAt: now,
    });

    return listId;
  },
});