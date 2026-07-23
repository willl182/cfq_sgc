import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const composition = v.object({
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
})

const catalogClass = v.union(v.literal('MP'), v.literal('PT'), v.literal('MZR'))
const physicalState = v.optional(v.union(v.literal('P'), v.literal('G'), v.literal('')))
const actor = v.object({ id: v.string(), role: v.union(v.literal('user'), v.literal('admin')) })

export default defineSchema({
  catalogItems: defineTable({
    internalId: v.string(),
    externalCode: v.string(),
    originalCode: v.string(),
    name: v.string(),
    class: catalogClass,
    type: v.string(),
    physicalState,
    origin: v.union(v.literal('csv'), v.literal('manual')),
    composition,
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_internalId', ['internalId'])
    .index('by_class', ['class'])
    .index('by_externalCode', ['externalCode'])
    .index('by_archivedAt', ['archivedAt']),

  catalogChangeHistory: defineTable({
    catalogItemId: v.id('catalogItems'),
    internalId: v.string(),
    changedAt: v.number(),
    actor,
    reason: v.optional(v.string()),
    origin: v.string(),
    changes: v.array(v.object({ field: v.string(), before: v.any(), after: v.any() })),
  })
    .index('by_catalogItemId', ['catalogItemId'])
    .index('by_internalId', ['internalId'])
    .index('by_changedAt', ['changedAt']),

  productLists: defineTable({
    displayCode: v.string(),
    targetProductId: v.optional(v.string()),
    components: v.array(v.object({ itemInternalId: v.string(), quantityKg: v.number() })),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_targetProductId', ['targetProductId'])
    .index('by_displayCode', ['displayCode'])
    .index('by_archivedAt', ['archivedAt']),

  productListSnapshots: defineTable({
    productListId: v.id('productLists'),
    targetProductId: v.optional(v.string()),
    displayCode: v.string(),
    snapshotVersion: v.string(),
    frozenTarget: v.optional(v.any()),
    frozenComponents: v.array(v.any()),
    calculatedComposition: composition,
    evaluation: v.any(),
    generalStatus: v.string(),
    totalKg: v.number(),
    alerts: v.array(v.string()),
    actor,
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_productListId', ['productListId'])
    .index('by_targetProductId', ['targetProductId'])
    .index('by_snapshotVersion', ['snapshotVersion'])
    .index('by_createdAt', ['createdAt']),
})
