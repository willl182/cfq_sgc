import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Catálogo unificado: MPs, PTs y MZRs
  catalogItems: defineTable({
    internalId: v.string(),        // "MP0001", "PT0001", "MZR0001"
    class: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
    name: v.string(),
    tipo: v.optional(v.string()),  // "G", "P", "L", "C"
    externalCode: v.optional(v.string()), // COD del CSV original
    originalCode: v.optional(v.string()), // Valor original de COD
    // Nutrientes (20 columnas)
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
    archivedAt: v.optional(v.number()), // timestamp si archivado
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_internalId", ["internalId"])
    .index("by_class", ["class"])
    .index("by_externalCode", ["externalCode"])
    .index("by_archivedAt", ["archivedAt"]),

  // Auditoria de cambios del catalogo
  catalogChangeHistory: defineTable({
    catalogItemId: v.id("catalogItems"),
    internalId: v.string(),
    changedBy: v.string(),         // usuario o "system"
    changedAt: v.number(),         // timestamp
    changedFields: v.array(v.string()),
    before: v.optional(v.string()), // JSON stringificado
    after: v.optional(v.string()), // JSON stringificado
    reason: v.optional(v.string()),
    origin: v.string(),            // "manual", "csv_import", "bulk_edit"
  })
    .index("by_catalogItemId", ["catalogItemId"])
    .index("by_internalId", ["internalId"])
    .index("by_changedAt", ["changedAt"]),

  // Listas/recetas vivas
  productLists: defineTable({
    displayCode: v.string(),       // "PT0008-L001", "PT0008-L002", "DRAFT-001"
    targetProductId: v.optional(v.id("catalogItems")), // null si sin objetivo
    components: v.array(v.object({
      catalogItemId: v.id("catalogItems"),
      cantidadKg: v.number(),     // max 2 decimales
    })),
    group: v.string(),             // "BORRADOR", "SIN_OBJETIVO", o "PT0008"
    totalKg: v.number(),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_targetProductId", ["targetProductId"])
    .index("by_displayCode", ["displayCode"])
    .index("by_archivedAt", ["archivedAt"]),

  // Snapshots inmutables
  productListSnapshots: defineTable({
    productListId: v.id("productLists"),
    snapshotVersion: v.string(),   // "v1", "v2", "v3"
    displayCode: v.string(),      // copiado al momento del snapshot
    targetProductId: v.optional(v.id("catalogItems")),
    // Componentes congelados con composicion al momento
    components: v.array(v.object({
      catalogItemId: v.id("catalogItems"),
      internalId: v.string(),
      name: v.string(),
      cantidadKg: v.number(),
      // Composicion de ese componente al momento del snapshot
      composition: v.object({
        C: v.number(), N: v.number(), N_NH4: v.number(), N_NO3: v.number(),
        N_org: v.number(), N_ur: v.number(), P: v.number(), K: v.number(),
        CaO: v.number(), MgO: v.number(), S: v.number(), B: v.number(),
        Co: v.number(), Cu: v.number(), Fe: v.number(), Mn: v.number(),
        Mo: v.number(), SiO2: v.number(), Zn: v.number(), Na: v.number(),
      }),
    })),
    // Composicion final calculada
    calculatedComposition: v.object({
      C: v.number(), N: v.number(), N_NH4: v.number(), N_NO3: v.number(),
      N_org: v.number(), N_ur: v.number(), P: v.number(), K: v.number(),
      CaO: v.number(), MgO: v.number(), S: v.number(), B: v.number(),
      Co: v.number(), Cu: v.number(), Fe: v.number(), Mn: v.number(),
      Mo: v.number(), SiO2: v.number(), Zn: v.number(), Na: v.number(),
    }),
    // Evaluacion de tolerancia
    toleranceEvaluation: v.optional(v.object({
      generalStatus: v.union(
        v.literal("CUMPLE"),
        v.literal("CUMPLE_S"),
        v.literal("NO_CUMPLE"),
        v.literal("SIN_OBJETIVO")
      ),
      nutrients: v.record(v.string(), v.object({
        target: v.number(),
        calculated: v.number(),
        tolerance: v.number(),
        status: v.union(v.literal("C"), v.literal("NC"), v.literal("SUP")),
      })),
    })),
    totalKg: v.number(),
    alerts: v.array(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_productListId", ["productListId"])
    .index("by_targetProductId", ["targetProductId"])
    .index("by_snapshotVersion", ["snapshotVersion"])
    .index("by_createdAt", ["createdAt"]),
});