import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const NUTRIENTES = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur", "P", "K", "CaO", "MgO",
  "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
] as const;

const nutrientSchema = Object.fromEntries(
  NUTRIENTES.map((n) => [n, v.optional(v.number())])
);

export default defineSchema({
  catalogItems: defineTable({
    internalId: v.string(), // MP0001, PT0001, MZR0001
    class: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
    name: v.string(),
    externalCode: v.optional(v.string()), // COD del CSV
    originalCode: v.optional(v.string()), // COD_ORIGINAL
    tipo: v.optional(v.string()),
    test: v.optional(v.string()),
    ...nutrientSchema,
    archivedAt: v.optional(v.number()),
  })
    .index("by_internalId", ["internalId"])
    .index("by_class", ["class"])
    .index("by_externalCode", ["externalCode"])
    .index("by_archived", ["archivedAt"]),

  catalogChangeHistory: defineTable({
    catalogItemId: v.id("catalogItems"),
    internalId: v.string(),
    actor: v.string(),
    changedAt: v.number(),
    fieldsChanged: v.array(v.string()),
    before: v.object(nutrientSchema as any),
    after: v.object(nutrientSchema as any),
    reason: v.optional(v.string()),
    origin: v.string(),
  })
    .index("by_catalogItemId", ["catalogItemId"])
    .index("by_internalId", ["internalId"])
    .index("by_changedAt", ["changedAt"]),

  productLists: defineTable({
    displayCode: v.string(), // PT0008-L001
    targetProductId: v.optional(v.id("catalogItems")),
    alias: v.optional(v.string()),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        internalId: v.string(),
        quantityKg: v.number(),
      })
    ),
    archivedAt: v.optional(v.number()),
  })
    .index("by_displayCode", ["displayCode"])
    .index("by_targetProductId", ["targetProductId"])
    .index("by_archived", ["archivedAt"]),

  productListSnapshots: defineTable({
    productListId: v.id("productLists"),
    targetProductId: v.optional(v.id("catalogItems")),
    snapshotVersion: v.number(),
    components: v.array(
      v.object({
        internalId: v.string(),
        name: v.string(),
        quantityKg: v.number(),
        composition: v.record(v.string(), v.number()),
      })
    ),
    calculatedComposition: v.record(v.string(), v.number()),
    evaluation: v.object({
      byNutrient: v.record(
        v.string(),
        v.union(v.literal("C"), v.literal("NC"), v.literal("SUP"), v.literal("NA"))
      ),
      generalStatus: v.union(
        v.literal("CUMPLE"),
        v.literal("CUMPLE_S"),
        v.literal("NO_CUMPLE"),
        v.literal("SIN_OBJETIVO")
      ),
    }),
    totalKg: v.number(),
    alerts: v.array(v.string()),
    user: v.string(),
    createdAt: v.number(),
    archivedAt: v.optional(v.number()),
  })
    .index("by_productListId", ["productListId"])
    .index("by_targetProductId", ["targetProductId"])
    .index("by_snapshotVersion", ["snapshotVersion"])
    .index("by_createdAt", ["createdAt"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"]),
});
