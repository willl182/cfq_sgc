import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Esquema de nutrientes reutilizable (20 nutrientes normalizados)
const nutrientSchema = {
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
  // Fuente viva única para MP, PT y MZR
  catalogItems: defineTable({
    internalId: v.string(), // "MP0001", "PT0001", "MZR0001"
    name: v.string(),
    class: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
    type: v.union(v.literal("G"), v.literal("P"), v.literal("L"), v.literal("C")),
    externalCode: v.optional(v.string()), // COD del CSV ("145", "97")
    originalCode: v.optional(v.string()), // COD original completo ("R", "R1", "R2")
    composition: v.object(nutrientSchema),
    archivedAt: v.optional(v.number()),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
    .index("by_internalId", ["internalId"])
    .index("by_class", ["class"])
    .index("by_externalCode", ["externalCode"])
    .index("by_archivedAt", ["archivedAt"]),

  // Auditoría de cambios del catálogo
  catalogChangeHistory: defineTable({
    catalogItemId: v.id("catalogItems"),
    internalId: v.string(),
    changedAt: v.number(),
    changedBy: v.optional(v.string()),
    fieldsChanged: v.array(v.string()),
    before: v.record(v.string(), v.any()),
    after: v.record(v.string(), v.any()),
    reason: v.optional(v.string()),
    source: v.optional(v.string()), // "admin", "user", "seed"
  })
    .index("by_catalogItemId", ["catalogItemId"])
    .index("by_internalId", ["internalId"])
    .index("by_changedAt", ["changedAt"]),

  // Listas/recetas vivas recalculables
  productLists: defineTable({
    targetProductId: v.optional(v.id("catalogItems")), // PT objetivo (opcional)
    displayCode: v.string(), // "PT0008-L001", "BORRADOR-001"
    name: v.optional(v.string()),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        quantityKg: v.number(), // Máximo 2 decimales
      })
    ),
    totalKg: v.number(),
    archivedAt: v.optional(v.number()),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
    .index("by_targetProductId", ["targetProductId"])
    .index("by_displayCode", ["displayCode"])
    .index("by_archivedAt", ["archivedAt"]),

  // Histórico congelado e inmutable
  productListSnapshots: defineTable({
    productListId: v.id("productLists"),
    targetProductId: v.optional(v.id("catalogItems")),
    snapshotVersion: v.number(), // 1, 2, 3...
    displayCode: v.string(),
    name: v.optional(v.string()),
    targetComposition: v.optional(v.object(nutrientSchema)),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        internalId: v.string(),
        name: v.string(),
        quantityKg: v.number(),
        compositionSnapshot: v.object(nutrientSchema),
      })
    ),
    calculatedComposition: v.object(nutrientSchema),
    toleranceEvaluation: v.object({
      overallStatus: v.union(
        v.literal("CUMPLE"),
        v.literal("NO_CUMPLE"),
        v.literal("CUMPLE_S"),
        v.literal("SIN_OBJETIVO")
      ),
      details: v.record(
        v.string(),
        v.object({
          value: v.number(),
          target: v.number(),
          tolerance: v.number(),
          status: v.union(
            v.literal("C"),
            v.literal("NC"),
            v.literal("SUP"),
            v.literal("INFO")
          ),
        })
      ),
    }),
    totalKg: v.number(),
    alerts: v.array(v.string()),
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
    archivedAt: v.optional(v.number()),
  })
    .index("by_productListId", ["productListId"])
    .index("by_targetProductId", ["targetProductId"])
    .index("by_snapshotVersion", ["snapshotVersion"])
    .index("by_createdAt", ["createdAt"]),
});
