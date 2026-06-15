import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  catalogItems: defineTable({
    internalId: v.string(), // ID format MP0001, PT0001, MZR0001
    class: v.string(), // "MP" | "PT" | "MZR"
    externalCode: v.string(), // COD from CSV
    originalCode: v.string(), // COD from CSV (for safety/traceability)
    producto: v.string(), // PRODUCTO column
    tipo: v.string(), // TIPO column: e.g., "G", "P", "L", "C"
    nutrients: v.object({
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
    }),
    archivedAt: v.union(v.number(), v.null()), // Timestamp or null
    provider: v.optional(v.string()), // PROVEEDOR from CSV
    cprov: v.optional(v.string()), // Cprov from CSV
    origen: v.string(), // "BASE_CSV" or "WEB"
    extras: v.optional(v.string()), // EXTRAS column from CSV
  })
  .index("by_internalId", ["internalId"])
  .index("by_class", ["class"])
  .index("by_externalCode", ["externalCode"])
  .index("by_archivedAt", ["archivedAt"]),

  catalogChangeHistory: defineTable({
    catalogItemId: v.id("catalogItems"),
    internalId: v.string(),
    changedAt: v.number(),
    actor: v.string(), // User name/role
    fields: v.array(v.string()), // Array of field names modified
    before: v.any(), // JSON representation of fields before modification
    after: v.any(), // JSON representation of fields after modification
    reason: v.optional(v.string()),
    origin: v.string(), // e.g. "WEB"
  })
  .index("by_catalogItemId", ["catalogItemId"])
  .index("by_internalId", ["internalId"])
  .index("by_changedAt", ["changedAt"]),

  productLists: defineTable({
    targetProductId: v.union(v.id("catalogItems"), v.null()), // Target PT (optional)
    displayCode: v.string(), // e.g., PT0008-L001 or BORRADOR-L001
    name: v.string(),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        internalId: v.string(),
        quantity: v.number(), // Quantity in kg (max 2 decimals)
      })
    ),
    archivedAt: v.union(v.number(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_targetProductId", ["targetProductId"])
  .index("by_displayCode", ["displayCode"])
  .index("by_archivedAt", ["archivedAt"]),

  productListSnapshots: defineTable({
    productListId: v.id("productLists"),
    targetProductId: v.union(v.id("catalogItems"), v.null()),
    snapshotVersion: v.number(), // 1, 2, 3...
    totalKg: v.number(),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        internalId: v.string(),
        producto: v.string(),
        quantity: v.number(),
        nutrients: v.object({
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
        }),
      })
    ),
    calculatedComposition: v.object({
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
    }),
    evaluation: v.object({
      status: v.string(), // "CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO"
      nutrientStatuses: v.any(), // Record<string, "C" | "NC" | "SUP">
    }),
    alerts: v.array(v.string()),
    user: v.string(),
    createdAt: v.number(),
  })
  .index("by_productListId", ["productListId"])
  .index("by_targetProductId", ["targetProductId"])
  .index("by_snapshotVersion", ["snapshotVersion"])
  .index("by_createdAt", ["createdAt"]),
});
