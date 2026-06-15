import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { NUTRIENT_KEYS, type NutrientRecord } from "../src/lib/nutrients";


export const list = query({
  args: {
    class: v.optional(v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR"))),
    search: v.optional(v.string()),
    archived: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("catalogItems"),
      internalId: v.string(),
      class: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
      externalCode: v.string(),
      name: v.string(),
      type: v.union(v.literal("G"), v.literal("P"), v.literal("L"), v.literal("C")),
      nutrients: v.record(v.string(), v.number()),
      archivedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, { class: cls, search, archived }) => {
    let items = await ctx.db.query("catalogItems").collect();
    if (cls) {
      items = items.filter((i) => i.class === cls);
    }
    if (archived === false) {
      items = items.filter((i) => !i.archivedAt);
    } else if (archived === true) {
      items = items.filter((i) => i.archivedAt);
    }
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(s) ||
          i.internalId.toLowerCase().includes(s) ||
          i.externalCode.toLowerCase().includes(s)
      );
    }
    return items.map((i) => ({
      _id: i._id,
      internalId: i.internalId,
      class: i.class,
      externalCode: i.externalCode,
      name: i.name,
      type: i.type,
      nutrients: i.nutrients as Record<string, number>,
      archivedAt: i.archivedAt,
    }));
  },
});

export const getByInternalId = query({
  args: { internalId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("catalogItems"),
      internalId: v.string(),
      class: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
      externalCode: v.string(),
      name: v.string(),
      type: v.union(v.literal("G"), v.literal("P"), v.literal("L"), v.literal("C")),
      nutrients: v.record(v.string(), v.number()),
      archivedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, { internalId }) => {
    const item = await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", (q) => q.eq("internalId", internalId))
      .unique();
    if (!item) return null;
    return {
      _id: item._id,
      internalId: item.internalId,
      class: item.class,
      externalCode: item.externalCode,
      name: item.name,
      type: item.type,
      nutrients: item.nutrients as Record<string, number>,
      archivedAt: item.archivedAt,
    };
  },
});

export const updateItem = mutation({
  args: {
    internalId: v.string(),
    updates: v.record(v.string(), v.number()),
    actor: v.string(),
    reason: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, { internalId, updates, actor, reason }) => {
    const item = await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", (q) => q.eq("internalId", internalId))
      .unique();
    if (!item) {
      return { success: false, message: "Item no encontrado" };
    }

    const fieldsChanged: string[] = [];
    const before: Partial<NutrientRecord> = {};
    const after: Partial<NutrientRecord> = {};
    const newNutrients = { ...item.nutrients } as NutrientRecord;

    for (const [key, val] of Object.entries(updates)) {
      if (NUTRIENT_KEYS.includes(key as typeof NUTRIENT_KEYS[number])) {
        const k = key as typeof NUTRIENT_KEYS[number];
        const oldVal = newNutrients[k];
        const newVal = Number(val);
        if (oldVal !== newVal) {
          fieldsChanged.push(k);
          before[k] = oldVal;
          after[k] = newVal;
          newNutrients[k] = newVal;
        }
      }
    }

    if (fieldsChanged.length === 0) {
      return { success: true, message: "Sin cambios" };
    }

    await ctx.db.patch(item._id, { nutrients: newNutrients });
    await ctx.db.insert("catalogChangeHistory", {
      catalogItemId: item._id,
      internalId: item.internalId,
      changedAt: Date.now(),
      actor,
      fieldsChanged,
      before: before as NutrientRecord,
      after: after as NutrientRecord,
      reason,
      origin: "user",
    });

    return { success: true, message: `Actualizado: ${fieldsChanged.join(", ")}` };
  },
});

export const archiveItem = mutation({
  args: {
    internalId: v.string(),
    actor: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, { internalId, actor }) => {
    const item = await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", (q) => q.eq("internalId", internalId))
      .unique();
    if (!item) {
      return { success: false, message: "Item no encontrado" };
    }
    await ctx.db.patch(item._id, { archivedAt: Date.now() });
    await ctx.db.insert("catalogChangeHistory", {
      catalogItemId: item._id,
      internalId: item.internalId,
      changedAt: Date.now(),
      actor,
      fieldsChanged: ["archivedAt"],
      after: { archivedAt: Date.now() } as unknown as NutrientRecord,
      reason: "Archivado",
      origin: "user",
    });
    return { success: true, message: "Item archivado" };
  },
});

export const historyForItem = query({
  args: { internalId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("catalogChangeHistory"),
      catalogItemId: v.id("catalogItems"),
      internalId: v.string(),
      changedAt: v.number(),
      actor: v.string(),
      fieldsChanged: v.array(v.string()),
      reason: v.optional(v.string()),
      origin: v.string(),
    })
  ),
  handler: async (ctx, { internalId }) => {
    const changes = await ctx.db
      .query("catalogChangeHistory")
      .withIndex("by_internalId", (q) => q.eq("internalId", internalId))
      .collect();
    return changes.map((c) => ({
      _id: c._id,
      catalogItemId: c.catalogItemId,
      internalId: c.internalId,
      changedAt: c.changedAt,
      actor: c.actor,
      fieldsChanged: c.fieldsChanged,
      reason: c.reason,
      origin: c.origin,
    }));
  },
});
