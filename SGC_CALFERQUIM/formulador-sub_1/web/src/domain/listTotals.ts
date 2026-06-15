import type { CatalogItem } from './catalog'

export type InputRequirementSource = {
  listId: string
  displayCode: string
  quantityKg: number
}

export type InputRequirement = {
  item: CatalogItem
  totalKg: number
  sources: InputRequirementSource[]
}

export type InputRequirementList = {
  id: string
  displayCode: string
  components: { itemId: string; quantityKg: number }[]
}

export type InputRequirementSelection = {
  listId: string
  multiplier: number
}

function roundKg(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function summarizeRequiredInputs(
  lists: InputRequirementList[],
  selections: InputRequirementSelection[],
  catalog: CatalogItem[],
): InputRequirement[] {
  const catalogById = new Map(catalog.filter((item) => !item.archivedAt).map((item) => [item.internalId, item]))
  const listsById = new Map(lists.map((list) => [list.id, list]))
  const requirements = new Map<string, InputRequirement>()

  for (const selection of selections) {
    const multiplier = Number.isFinite(selection.multiplier) && selection.multiplier > 0 ? selection.multiplier : 0
    if (multiplier === 0) continue

    const list = listsById.get(selection.listId)
    if (!list) continue


    for (const component of list.components) {
      const item = catalogById.get(component.itemId)
      if (!item) continue

      const quantityKg = roundKg(Math.max(0, component.quantityKg) * multiplier)
      if (quantityKg === 0) continue

      const current = requirements.get(component.itemId) ?? { item, totalKg: 0, sources: [] }
      current.totalKg = roundKg(current.totalKg + quantityKg)
      current.sources.push({ listId: list.id, displayCode: list.displayCode, quantityKg })
      requirements.set(component.itemId, current)
    }
  }

  return [...requirements.values()].sort((a, b) => a.item.internalId.localeCompare(b.item.internalId))
}
