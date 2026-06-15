import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const NUTRIENT_KEYS = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur", "P", "K", "CaO", "MgO",
  "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na",
] as const;

export type NutrientKey = (typeof NUTRIENT_KEYS)[number];

const nutrientRecord = () =>
  v.object(
    Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, v.number()])) as Record<
      NutrientKey,
      ReturnType<typeof v.number>
    >
  );

export default defineSchema({
  catalogItems: defineTable({
    internalId: v.string(),
    class: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
    externalCode: v.string(),
    originalCode: v.string(),
    name: v.string(),
    type: v.union(v.literal("G"), v.literal("P"), v.literal("L"), v.literal("C")),
    nutrients: nutrientRecord(),
    archivedAt: v.optional(v.number()),
  })
    .index("by_internalId", ["internalId"])
    .index("by_class", ["class"])
    .index("by_externalCode", ["externalCode"])
    .index("by_archivedAt", ["archivedAt"]),

  catalogChangeHistory: defineTable({
    catalogItemId: v.id("catalogItems"),
    internalId: v.string(),
    changedAt: v.number(),
    actor: v.string(),
    fieldsChanged: v.array(v.string()),
    before: v.optional(nutrientRecord()),
    after: v.optional(nutrientRecord()),
    reason: v.optional(v.string()),
    origin: v.union(v.literal("user"), v.literal("seed"), v.literal("import")),
  })
    .index("by_catalogItemId", ["catalogItemId"])
    .index("by_internalId", ["internalId"])
    .index("by_changedAt", ["changedAt"]),

  productLists: defineTable({
    targetProductId: v.optional(v.string()),
    displayCode: v.string(),
    alias: v.optional(v.string()),
    components: v.array(
      v.object({
        internalId: v.string(),
        cantidadKg: v.number(),
      })
    ),
    archivedAt: v.optional(v.number()),
  })
    .index("by_targetProductId", ["targetProductId"])
    .index("by_displayCode", ["displayCode"])
    .index("by_archivedAt", ["archivedAt"]),

  productListSnapshots: defineTable({
    productListId: v.id("productLists"),
    targetProductId: v.optional(v.string()),
    snapshotVersion: v.number(),
    createdAt: v.number(),
    targetSnapshot: v.optional(nutrientRecord()),
    componentsSnapshot: v.array(
      v.object({
        internalId: v.string(),
        name: v.string(),
        cantidadKg: v.number(),
        compositionSnapshot: nutrientRecord(),
      })
    ),
    compositionCalculated: nutrientRecord(),
    evaluation: v.record(
      v.string(),
      v.object({
        valor: v.number(),
        tolerancia: v.number(),
        estado: v.union(v.literal("C"), v.literal("NC"), v.literal("SUP")),
      })
    ),
    generalStatus: v.union(
      v.literal("CUMPLE"),
      v.literal("CUMPLE_S"),
      v.literal("NO_CUMPLE"),
      v.literal("SIN_OBJETIVO")
    ),
    totalKg: v.number(),
    alerts: v.array(v.string()),
    user: v.string(),
    date: v.number(),
    archivedAt: v.optional(v.number()),
  })
    .index("by_productListId", ["productListId"])
    .index("by_targetProductId", ["targetProductId"])
    .index("by_snapshotVersion", ["snapshotVersion"])
    .index("by_createdAt", ["createdAt"]),
});