import type { CatalogItem } from './catalog'
import type { Composition } from './nutrients'
import { roundTo } from './nutrients'

export type ReplacementPriority = 'N' | 'P' | 'K'

export type SuggestedReplacement = {
  item: CatalogItem
  distance: number
  priorityDelta: number
  suggestedKg: number
}

export type LiveComponent = {
  id: string
  itemId: string
  quantityKg: number
}

export type ProductList = {
  id: string
  displayCode: string
  targetProductId: string | null
  components: LiveComponent[]
  updatedAt: number
}

export type ReplacerState = {
  baseList: ProductList
  baseComponentIndex: number | null
  priority: ReplacementPriority
  suggestions: SuggestedReplacement[]
}

export function euclideanDistanceNPK(a: Composition, b: Composition): number {
  const dN = a.N - b.N
  const dP = a.P - b.P
  const dK = a.K - b.K
  return Math.sqrt(dN * dN + dP * dP + dK * dK)
}

export function calculateSuggestedQuantity(
  baseItem: CatalogItem,
  baseQuantityKg: number,
  mzr: CatalogItem,
  priority: ReplacementPriority,
): number {
  const mzrPriority = mzr.composition[priority]
  if (mzrPriority <= 0) return 0
  return roundTo((baseQuantityKg * baseItem.composition[priority]) / mzrPriority, 1)
}

export function suggestMZRReplacements(
  baseItem: CatalogItem,
  baseQuantityKg: number,
  mzrs: CatalogItem[],
  priority: ReplacementPriority,
): SuggestedReplacement[] {
  const candidates = mzrs
    .filter((mzr) => mzr.composition[priority] > 0)
    .map((mzr) => {
      const distance = euclideanDistanceNPK(baseItem.composition, mzr.composition)
      const priorityDelta = Math.abs(baseItem.composition[priority] - mzr.composition[priority])
      const suggestedKg = calculateSuggestedQuantity(baseItem, baseQuantityKg, mzr, priority)
      return {
        item: mzr,
        distance,
        priorityDelta,
        suggestedKg,
      }
    })
    .filter((candidate) => candidate.suggestedKg > 0)

  candidates.sort((a, b) => {
    if (a.priorityDelta !== b.priorityDelta) return a.priorityDelta - b.priorityDelta
    return a.distance - b.distance
  })

  return candidates
}

export function applyReplacementToComponents(
  originalComponents: LiveComponent[],
  catalog: CatalogItem[],
  replaceIndex: number,
  mzrInternalId: string,
  suggestedKg: number,
): LiveComponent[] {
  const mzr = catalog.find((item) => item.internalId === mzrInternalId)
  if (!mzr) return originalComponents.map((component) => ({ ...component }))
  if (replaceIndex < 0 || replaceIndex >= originalComponents.length) {
    return originalComponents.map((component) => ({ ...component }))
  }

  return originalComponents.map((component, index) => {
    if (index !== replaceIndex) {
      return { ...component, id: crypto.randomUUID() }
    }
    return {
      id: crypto.randomUUID(),
      itemId: mzr.internalId,
      quantityKg: suggestedKg,
    }
  })
}

export function isMixProduct(item: CatalogItem | null | undefined): boolean {
  if (!item) return false
  const name = item.name.toUpperCase()
  return name.startsWith('MF ') || name.startsWith('MFE ')
}
