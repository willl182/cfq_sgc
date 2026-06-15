import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const compositionValidator = v.object({
  C: v.number(), N: v.number(), N_NH4: v.number(), N_NO3: v.number(), N_org: v.number(), N_ur: v.number(),
  P: v.number(), K: v.number(), CaO: v.number(), MgO: v.number(), S: v.number(), B: v.number(), Co: v.number(),
  Cu: v.number(), Fe: v.number(), Mn: v.number(), Mo: v.number(), SiO2: v.number(), Zn: v.number(), Na: v.number(),
})

const itemValidator = v.object({
  internalId: v.string(),
  externalCode: v.string(),
  originalCode: v.string(),
  name: v.string(),
  class: v.union(v.literal('MP'), v.literal('PT'), v.literal('MZR')),
  type: v.string(),
  origin: v.union(v.literal('csv'), v.literal('manual')),
  composition: compositionValidator,
})

const actorValidator = v.object({ id: v.string(), role: v.union(v.literal('user'), v.literal('admin')) })

export const list = query({
  args: { includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const items = await ctx.db.query('catalogItems').collect()
    return args.includeArchived ? items : items.filter((item) => item.archivedAt === undefined)
  },
})

export const recentChanges = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200)
    const changes = await ctx.db.query('catalogChangeHistory').withIndex('by_changedAt').order('desc').take(limit)
    return changes
  },
})

export const seedIfEmpty = mutation({
  args: { items: v.array(itemValidator), actor: actorValidator },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('catalogItems').take(1)
    if (existing.length > 0) throw new Error('El catalogo ya contiene registros; seed bloqueado.')
    const now = Date.now()
    for (const item of args.items) {
      await ctx.db.insert('catalogItems', { ...item, createdAt: now, updatedAt: now })
    }
    return { rowsRead: args.items.length, inserted: args.items.length, rejected: 0 }
  },
})

export const createManual = mutation({
  args: {
    item: itemValidator,
    actor: actorValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.actor.role !== 'admin') throw new Error('Solo admin puede crear items manuales.')
    if (args.item.origin !== 'manual') throw new Error('createManual solo acepta origin=manual.')
    const existing = await ctx.db.query('catalogItems').withIndex('by_internalId', (q) => q.eq('internalId', args.item.internalId)).unique()
    if (existing) throw new Error(`Ya existe catalog item ${args.item.internalId}`)
    const now = Date.now()
    const catalogItemId = await ctx.db.insert('catalogItems', { ...args.item, createdAt: now, updatedAt: now })
    await ctx.db.insert('catalogChangeHistory', {
      catalogItemId,
      internalId: args.item.internalId,
      changedAt: now,
      actor: args.actor,
      reason: args.reason,
      origin: 'catalog.manual_create',
      changes: [{ field: 'item', before: null, after: args.item }],
    })
    return { catalogItemId }
  },
})

export const updateComposition = mutation({
  args: {
    internalId: v.string(),
    composition: compositionValidator,
    actor: actorValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.query('catalogItems').withIndex('by_internalId', (q) => q.eq('internalId', args.internalId)).unique()
    if (!item) throw new Error(`No existe catalog item ${args.internalId}`)
    if (args.actor.role !== 'admin' && item.class !== 'MP') throw new Error('Usuario normal solo puede editar MP.')
    const changes = Object.entries(args.composition)
      .filter(([key, value]) => item.composition[key as keyof typeof item.composition] !== value)
      .map(([key, value]) => ({ field: `composition.${key}`, before: item.composition[key as keyof typeof item.composition], after: value }))
    if (changes.length === 0) return { changed: false }
    await ctx.db.patch(item._id, { composition: args.composition, updatedAt: Date.now() })
    await ctx.db.insert('catalogChangeHistory', {
      catalogItemId: item._id,
      internalId: item.internalId,
      changedAt: Date.now(),
      actor: args.actor,
      reason: args.reason,
      origin: 'catalog.inline_edit',
      changes,
    })
    return { changed: true }
  },
})

export const archive = mutation({
  args: {
    internalId: v.string(),
    actor: actorValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.actor.role !== 'admin') throw new Error('Solo admin puede archivar items.')
    const item = await ctx.db.query('catalogItems').withIndex('by_internalId', (q) => q.eq('internalId', args.internalId)).unique()
    if (!item) throw new Error(`No existe catalog item ${args.internalId}`)
    if (item.archivedAt !== undefined) return { archived: false }
    const now = Date.now()
    await ctx.db.patch(item._id, { archivedAt: now, updatedAt: now })
    await ctx.db.insert('catalogChangeHistory', {
      catalogItemId: item._id,
      internalId: item.internalId,
      changedAt: now,
      actor: args.actor,
      reason: args.reason,
      origin: 'catalog.archive',
      changes: [{ field: 'archivedAt', before: null, after: now }],
    })
    return { archived: true }
  },
})
