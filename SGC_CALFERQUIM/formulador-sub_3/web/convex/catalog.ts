import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { NUTRIENTES } from "../lib/calculation";
import { getUserFromToken } from "./auth";

export const listCatalogItems = query({
  args: {
    class: v.optional(v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR"))),
    search: v.optional(v.string()),
    includeArchived: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("catalogItems"),
      internalId: v.string(),
      class: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
      name: v.string(),
      externalCode: v.optional(v.string()),
      tipo: v.optional(v.string()),
      archivedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    let items = await ctx.db.query("catalogItems").collect();

    if (args.class) {
      items = items.filter((i) => i.class === args.class);
    }

    if (!args.includeArchived) {
      items = items.filter((i) => !i.archivedAt);
    }

    if (args.search) {
      const q = args.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.internalId.toLowerCase().includes(q) ||
          (i.externalCode?.toLowerCase().includes(q) ?? false)
      );
    }

    return items.map((i) => ({
      _id: i._id,
      internalId: i.internalId,
      class: i.class,
      name: i.name,
      externalCode: i.externalCode,
      tipo: i.tipo,
      archivedAt: i.archivedAt,
    }));
  },
});

export const getCatalogItem = query({
  args: { internalId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("catalogItems"),
      internalId: v.string(),
      class: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
      name: v.string(),
      externalCode: v.optional(v.string()),
      originalCode: v.optional(v.string()),
      tipo: v.optional(v.string()),
      test: v.optional(v.string()),
      archivedAt: v.optional(v.number()),
      nutrients: v.record(v.string(), v.number()),
    })
  ),
  handler: async (ctx, { internalId }) => {
    const item = await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", (q) => q.eq("internalId", internalId))
      .unique();
    if (!item) return null;

    const nutrients: Record<string, number> = {};
    for (const n of NUTRIENTES) {
      const val = (item as any)[n];
      if (typeof val === "number") {
        nutrients[n] = val;
      }
    }

    return {
      _id: item._id,
      internalId: item.internalId,
      class: item.class,
      name: item.name,
      externalCode: item.externalCode,
      originalCode: item.originalCode,
      tipo: item.tipo,
      test: item.test,
      archivedAt: item.archivedAt,
      nutrients,
    };
  },
});

export const updateCatalogItem = mutation({
  args: {
    internalId: v.string(),
    updates: v.record(v.string(), v.any()),
    actor: v.string(),
    reason: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { internalId, updates, actor, reason, token }) => {
    const user = await getUserFromToken(ctx, token);
    const item = await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", (q) => q.eq("internalId", internalId))
      .unique();
    if (item && item.class !== "MP" && (!user || user.role !== "admin")) {
      return { success: false, error: "Solo administradores pueden editar PT/MZR" };
    }
    if (!item) {
      return { success: false, error: "Item no encontrado" };
    }

    const before: Record<string, number | undefined> = {};
    const after: Record<string, number | undefined> = {};
    const fieldsChanged: string[] = [];

    const allowedFields = new Set([...NUTRIENTES, "name", "tipo", "test"]);

    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.has(key)) continue;
      const oldVal = (item as any)[key];
      const newVal = typeof value === "number" ? value : undefined;
      if (oldVal !== newVal) {
        fieldsChanged.push(key);
        before[key] = oldVal;
        after[key] = newVal;
      }
    }

    if (fieldsChanged.length === 0) {
      return { success: true };
    }

    await ctx.db.patch(item._id, updates);

    await ctx.db.insert("catalogChangeHistory", {
      catalogItemId: item._id,
      internalId,
      actor,
      changedAt: Date.now(),
      fieldsChanged,
      before: before as any,
      after: after as any,
      reason: reason ?? undefined,
      origin: "manual",
    });

    return { success: true };
  },
});

export const archiveCatalogItem = mutation({
  args: {
    internalId: v.string(),
    actor: v.string(),
    token: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { internalId, actor, token }) => {
    const user = await getUserFromToken(ctx, token);
    const item = await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", (q) => q.eq("internalId", internalId))
      .unique();
    if (!item) {
      return { success: false, error: "Item no encontrado" };
    }
    if (item.class !== "MP" && (!user || user.role !== "admin")) {
      return { success: false, error: "Solo administradores pueden archivar PT/MZR" };
    }

    await ctx.db.patch(item._id, { archivedAt: Date.now() });

    await ctx.db.insert("catalogChangeHistory", {
      catalogItemId: item._id,
      internalId,
      actor,
      changedAt: Date.now(),
      fieldsChanged: ["archivedAt"],
      before: { archivedAt: undefined } as any,
      after: { archivedAt: Date.now() } as any,
      reason: "Archivado",
      origin: "manual",
    });

    return { success: true };
  },
});

export const createCatalogItem = mutation({
  args: {
    class: v.union(v.literal("PT"), v.literal("MZR")),
    name: v.string(),
    externalCode: v.optional(v.string()),
    tipo: v.optional(v.string()),
    nutrients: v.record(v.string(), v.number()),
    actor: v.string(),
    token: v.optional(v.string()),
  },
  returns: v.object({
    internalId: v.string(),
    _id: v.id("catalogItems"),
  }),
  handler: async (ctx, { class: cls, name, externalCode, tipo, nutrients, actor, token }) => {
    const user = await getUserFromToken(ctx, token);
    if (!user || user.role !== "admin") {
      throw new Error("Solo administradores pueden crear PT/MZR");
    }
    const prefix = cls === "PT" ? "PT" : "MZR";
    const existing = await ctx.db
      .query("catalogItems")
      .withIndex("by_class", (q) => q.eq("class", cls))
      .collect();

    let maxNum = 0;
    for (const item of existing) {
      const match = item.internalId.match(new RegExp(`^${prefix}(\\d+)$`));
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const nextNum = String(maxNum + 1).padStart(4, "0");
    const internalId = `${prefix}${nextNum}`;

    const doc: any = {
      internalId,
      class: cls,
      name,
      externalCode: externalCode ?? undefined,
      originalCode: externalCode ?? undefined,
      tipo: tipo ?? undefined,
      archivedAt: undefined,
    };
    for (const [key, value] of Object.entries(nutrients)) {
      if (typeof value === "number") {
        doc[key] = value;
      }
    }

    const _id = await ctx.db.insert("catalogItems", doc);

    await ctx.db.insert("catalogChangeHistory", {
      catalogItemId: _id,
      internalId,
      actor,
      changedAt: Date.now(),
      fieldsChanged: ["created"],
      before: {},
      after: nutrients as any,
      reason: "Creación manual",
      origin: "manual",
    });

    return { internalId, _id };
  },
});

export const listChangeHistory = query({
  args: {
    internalId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("catalogChangeHistory"),
      internalId: v.string(),
      actor: v.string(),
      changedAt: v.number(),
      fieldsChanged: v.array(v.string()),
      before: v.record(v.string(), v.number()),
      after: v.record(v.string(), v.number()),
      reason: v.optional(v.string()),
      origin: v.string(),
    })
  ),
  handler: async (ctx, { internalId, limit }) => {
    let items = await ctx.db
      .query("catalogChangeHistory")
      .order("desc")
      .take(limit ?? 100);

    if (internalId) {
      items = items.filter((i) => i.internalId === internalId);
    }

    return items;
  },
});
