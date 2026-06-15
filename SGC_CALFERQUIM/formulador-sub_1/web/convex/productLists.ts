import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const nutrients = [
  'C',
  'N',
  'N_NH4',
  'N_NO3',
  'N_org',
  'N_ur',
  'P',
  'K',
  'CaO',
  'MgO',
  'S',
  'B',
  'Co',
  'Cu',
  'Fe',
  'Mn',
  'Mo',
  'SiO2',
  'Zn',
  'Na',
] as const

type Nutrient = (typeof nutrients)[number]
type Composition = Record<Nutrient, number>

const actorValidator = v.object({ id: v.string(), role: v.union(v.literal('user'), v.literal('admin')) })

function emptyComposition(): Composition {
  return Object.fromEntries(nutrients.map((nutrient) => [nutrient, 0])) as Composition
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function normalizeQuantity(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return roundTo(value, 2)
}

const group3Linear: Partial<Record<Nutrient, (x: number) => number>> = {
  CaO: (x) => 0.42 + 0.105 * x,
  MgO: (x) => 0.5 + 0.125 * x,
  S: (x) => 0.3 + 0.075 * x,
  B: (x) => 0.005 + 0.25 * x,
  Co: (x) => 0.000125 + 0.375 * x,
  Mo: (x) => 0.000125 + 0.375 * x,
  Cu: (x) => 0.015 + 0.3 * x,
  Fe: (x) => 0.015 + 0.3 * x,
  Mn: (x) => 0.015 + 0.3 * x,
  Zn: (x) => 0.015 + 0.3 * x,
  Na: (x) => 0.015 + 0.3 * x,
  C: (x) => 0.3 + 0.075 * x,
  SiO2: (x) => 0.3 + 0.075 * x,
}

function group1(x: number): number {
  if (x === 0) return 0
  if (x < 0.04) return 0.84
  if (x > 32) return 1.46
  return -0.0005 * x * x + 0.0413 * x + 0.6533
}

function group2(x: number): number {
  if (x === 0) return 0
  if (x < 0.04) return 0.69
  if (x > 32) return 2.14
  return -0.0007 * x * x + 0.0769 * x + 0.3941
}

function calcTolerance(nutrient: Nutrient, declaredValue: number): number {
  const x = Math.abs(declaredValue)
  if (['N', 'N_NH4', 'N_NO3', 'N_org', 'N_ur', 'P'].includes(nutrient)) return group1(x)
  if (nutrient === 'K') return group2(x)
  const linear = group3Linear[nutrient]
  return x === 0 || !linear ? 0 : Math.min(x / 2, 1.5, linear(x))
}

function evaluateComposition(calculated: Composition, declared?: Composition | null) {
  if (!declared) {
    return {
      generalStatus: 'SIN_OBJETIVO',
      evaluations: nutrients.map((nutrient) => ({
        nutrient,
        calculated: roundTo(calculated[nutrient] ?? 0, 4),
        declared: 0,
        tolerance: 0,
        min: 0,
        max: 0,
        status: 'INFO',
      })),
    }
  }

  let hasNC = false
  let hasSUP = false
  const evaluations = nutrients.map((nutrient) => {
    const calculatedValue = calculated[nutrient] ?? 0
    const declaredValue = declared[nutrient] ?? 0
    if (declaredValue <= 0) {
      return {
        nutrient,
        calculated: roundTo(calculatedValue, 4),
        declared: roundTo(declaredValue, 4),
        tolerance: 0,
        min: 0,
        max: 0,
        status: 'INFO',
      }
    }

    const tolerance = calcTolerance(nutrient, declaredValue)
    const min = Math.max(0, declaredValue - tolerance)
    const max = declaredValue + tolerance
    const status = calculatedValue < min ? 'NC' : calculatedValue > max ? 'SUP' : 'C'
    if (status === 'NC') hasNC = true
    if (status === 'SUP') hasSUP = true

    return {
      nutrient,
      calculated: roundTo(calculatedValue, 4),
      declared: roundTo(declaredValue, 4),
      tolerance: roundTo(tolerance, 4),
      min: roundTo(min, 4),
      max: roundTo(max, 4),
      status,
    }
  })

  const generalStatus = hasNC ? 'NO_CUMPLE' : hasSUP ? 'CUMPLE_S' : 'CUMPLE'
  return { generalStatus, evaluations }
}

export const liveLists = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query('productLists').collect()).filter((list) => list.archivedAt === undefined),
})

export const snapshots = query({
  args: { productListId: v.optional(v.id('productLists')) },
  handler: async (ctx, args) => {
    if (args.productListId) {
      return ctx.db.query('productListSnapshots').withIndex('by_productListId', (q) => q.eq('productListId', args.productListId!)).collect()
    }
    return ctx.db.query('productListSnapshots').withIndex('by_createdAt').collect()
  },
})

export const saveWithSnapshot = mutation({
  args: {
    productListId: v.optional(v.id('productLists')),
    displayCode: v.string(),
    targetProductId: v.optional(v.string()),
    components: v.array(v.object({ itemInternalId: v.string(), quantityKg: v.number() })),
    actor: actorValidator,
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const target = args.targetProductId
      ? await ctx.db.query('catalogItems').withIndex('by_internalId', (q) => q.eq('internalId', args.targetProductId!)).unique()
      : null
    if (args.targetProductId && (!target || target.archivedAt !== undefined || target.class !== 'PT')) {
      throw new Error(`Producto objetivo invalido o archivado: ${args.targetProductId}`)
    }

    const frozenComponents = []
    const calculatedComposition = emptyComposition()
    let totalKg = 0
    for (const component of args.components) {
      const item = await ctx.db.query('catalogItems').withIndex('by_internalId', (q) => q.eq('internalId', component.itemInternalId)).unique()
      if (!item || item.archivedAt !== undefined) throw new Error(`Componente invalido o archivado: ${component.itemInternalId}`)
      const quantityKg = normalizeQuantity(component.quantityKg)
      totalKg = roundTo(totalKg + quantityKg, 2)
      frozenComponents.push({ item, quantityKg })
      for (const nutrient of nutrients) {
        calculatedComposition[nutrient] += (quantityKg * (item.composition[nutrient] ?? 0)) / 1000
      }
    }
    for (const nutrient of nutrients) {
      calculatedComposition[nutrient] = roundTo(calculatedComposition[nutrient], 4)
    }

    const evaluation = evaluateComposition(calculatedComposition, target?.composition)
    const alerts = totalKg === 1000 ? [] : [`Total ${totalKg.toFixed(2)} kg: la base fija es 1000 kg y no se normaliza automaticamente.`]
    const normalizedComponents = args.components.map((component) => ({
      itemInternalId: component.itemInternalId,
      quantityKg: normalizeQuantity(component.quantityKg),
    }))

    const productListId = args.productListId ?? await ctx.db.insert('productLists', {
      displayCode: args.displayCode,
      targetProductId: args.targetProductId,
      components: normalizedComponents,
      createdAt: now,
      updatedAt: now,
    })
    if (args.productListId) {
      await ctx.db.patch(args.productListId, {
        displayCode: args.displayCode,
        targetProductId: args.targetProductId,
        components: normalizedComponents,
        updatedAt: now,
      })
    }

    const existingSnapshots = await ctx.db.query('productListSnapshots').withIndex('by_productListId', (q) => q.eq('productListId', productListId)).collect()
    const snapshotVersion = `v${existingSnapshots.length + 1}`
    const snapshotId = await ctx.db.insert('productListSnapshots', {
      productListId,
      targetProductId: args.targetProductId,
      displayCode: args.displayCode,
      snapshotVersion,
      frozenTarget: target ?? undefined,
      frozenComponents,
      calculatedComposition,
      evaluation,
      generalStatus: evaluation.generalStatus,
      totalKg,
      alerts,
      actor: args.actor,
      createdAt: now,
    })
    return { productListId, snapshotId, snapshotVersion, generalStatus: evaluation.generalStatus, totalKg, alerts }
  },
})
