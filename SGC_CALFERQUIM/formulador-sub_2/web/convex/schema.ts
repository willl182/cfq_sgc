import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const nutrientFields = {
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
};

export default defineSchema({
  catalogItems: defineTable({
    internalId: v.string(),
    nombre: v.string(),
    clase: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
    tipo: v.union(v.literal("G"), v.literal("P"), v.literal("L"), v.literal("C")),
    externalCode: v.optional(v.string()),
    originalCode: v.optional(v.string()),
    origen: v.optional(v.string()),
    ...nutrientFields,
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_internalId", ["internalId"])
    .index("by_clase", ["clase"])
    .index("by_externalCode", ["externalCode"])
    .index("by_archivedAt", ["archivedAt"]),

  catalogChangeHistory: defineTable({
    catalogItemId: v.id("catalogItems"),
    internalId: v.string(),
    actor: v.string(),
    changedFields: v.array(
      v.object({
        field: v.string(),
        before: v.optional(v.string()),
        after: v.optional(v.string()),
      })
    ),
    reason: v.optional(v.string()),
    source: v.string(),
    changedAt: v.number(),
  })
    .index("by_catalogItemId", ["catalogItemId"])
    .index("by_internalId", ["internalId"])
    .index("by_changedAt", ["changedAt"]),

  productLists: defineTable({
    displayCode: v.string(),
    targetProductId: v.optional(v.id("catalogItems")),
    targetProductSnapshot: v.optional(
      v.object({
        internalId: v.string(),
        nombre: v.string(),
        ...nutrientFields,
      })
    ),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        internalId: v.string(),
        nombre: v.string(),
        cantidadKg: v.number(),
        nutrientSnapshot: v.object(nutrientFields),
      })
    ),
    totalKg: v.number(),
    generalStatus: v.union(
      v.literal("CUMPLE"),
      v.literal("CUMPLE_S"),
      v.literal("NO_CUMPLE"),
      v.literal("SIN_OBJETIVO")
    ),
    createdBy: v.optional(v.string()),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_targetProductId", ["targetProductId"])
    .index("by_displayCode", ["displayCode"])
    .index("by_archivedAt", ["archivedAt"]),

  productListSnapshots: defineTable({
    productListId: v.id("productLists"),
    displayCode: v.string(),
    targetProductId: v.optional(v.id("catalogItems")),
    targetProductSnapshot: v.optional(
      v.object({
        internalId: v.string(),
        nombre: v.string(),
        ...nutrientFields,
      })
    ),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        internalId: v.string(),
        nombre: v.string(),
        cantidadKg: v.number(),
        nutrientSnapshot: v.object(nutrientFields),
      })
    ),
    computedComposition: v.object(nutrientFields),
    toleranceDetail: v.array(
      v.object({
        nutrient: v.string(),
        calculado: v.number(),
        declarado: v.number(),
        tolerancia: v.number(),
        min: v.number(),
        max: v.number(),
        status: v.union(v.literal("C"), v.literal("NC"), v.literal("SUP")),
        informativo: v.boolean(),
      })
    ),
    generalStatus: v.union(
      v.literal("CUMPLE"),
      v.literal("CUMPLE_S"),
      v.literal("NO_CUMPLE"),
      v.literal("SIN_OBJETIVO")
    ),
    totalKg: v.number(),
    alertas: v.array(v.string()),
    snapshotVersion: v.number(),
    createdBy: v.optional(v.string()),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_productListId", ["productListId"])
    .index("by_targetProductId", ["targetProductId"])
    .index("by_displayCode", ["displayCode"])
    .index("by_createdAt", ["createdAt"]),
});