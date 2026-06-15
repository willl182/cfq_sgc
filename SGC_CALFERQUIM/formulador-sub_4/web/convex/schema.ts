import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const nutrients = v.object({
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
});

export const catalogItems = defineTable({
  internalId: v.string(),
  externalCode: v.string(),
  originalCode: v.string(),
  name: v.string(),
  class: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
  type: v.union(v.literal("G"), v.literal("P"), v.literal("L"), v.literal("C")),
  nutrients,
  archivedAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_internalId", ["internalId"])
  .index("by_class", ["class"])
  .index("by_externalCode", ["externalCode"])
  .index("by_archivedAt", ["archivedAt"]);

export const catalogChangeHistory = defineTable({
  catalogItemId: v.id("catalogItems"),
  internalId: v.string(),
  actor: v.string(),
  changedAt: v.number(),
  reason: v.optional(v.string()),
  origin: v.string(),
  changes: v.array(
    v.object({
      field: v.string(),
      oldValue: v.any(),
      newValue: v.any(),
    })
  ),
}).index("by_catalogItemId", ["catalogItemId"]).index("by_internalId", ["internalId"]).index("by_changedAt", ["changedAt"]);

export const productLists = defineTable({
  displayCode: v.string(),
  targetProductId: v.optional(v.id("catalogItems")),
  components: v.array(
    v.object({
      catalogItemId: v.id("catalogItems"),
      cantidadKg: v.number(),
    })
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.string(),
  archivedAt: v.number(),
})
  .index("by_targetProductId", ["targetProductId"])
  .index("by_displayCode", ["displayCode"])
  .index("by_archivedAt", ["archivedAt"]);

export const productListSnapshots = defineTable({
  productListId: v.id("productLists"),
  displayCode: v.string(),
  targetProductId: v.optional(v.id("catalogItems")),
  targetProductSnapshot: v.optional(nutrients),
  componentsSnapshot: v.array(
    v.object({
      catalogItemId: v.id("catalogItems"),
      internalId: v.string(),
      name: v.string(),
      cantidadKg: v.number(),
      nutrientsSnapshot: nutrients,
    })
  ),
  composicionCalculada: nutrients,
  estadoGeneral: v.union(
    v.literal("CUMPLE"),
    v.literal("CUMPLE_S"),
    v.literal("NO_CUMPLE"),
    v.literal("SIN_OBJETIVO")
  ),
  detalleTolerancia: v.record(
    v.string(),
    v.object({
      valor: v.number(),
      tolerancia: v.number(),
      estado: v.union(v.literal("C"), v.literal("NC"), v.literal("SUP")),
    })
  ),
  totalKg: v.number(),
  alertas: v.array(v.string()),
  snapshotVersion: v.number(),
  createdAt: v.number(),
  createdBy: v.string(),
  notas: v.optional(v.string()),
})
  .index("by_productListId", ["productListId"])
  .index("by_targetProductId", ["targetProductId"])
  .index("by_snapshotVersion", ["snapshotVersion"])
  .index("by_createdAt", ["createdAt"]);

export default defineSchema({
  catalogItems,
  catalogChangeHistory,
  productLists,
  productListSnapshots,
});