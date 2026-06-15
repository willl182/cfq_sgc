import { emptyComposition, NUTRIENTS, roundTo, type Composition } from './nutrients'
import { evaluateComposition } from './tolerances'
import type { CatalogItem } from './catalog'

export type FormulaComponentInput = {
  item: CatalogItem
  quantityKg: number
}

export function normalizeQuantity(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return roundTo(value, 2)
}

export function calculateComposition(components: FormulaComponentInput[]): Composition {
  const composition = emptyComposition()
  for (const component of components) {
    const quantity = normalizeQuantity(component.quantityKg)
    for (const nutrient of NUTRIENTS) {
      composition[nutrient] += (quantity * (component.item.composition[nutrient] ?? 0)) / 1000
    }
  }
  for (const nutrient of NUTRIENTS) {
    composition[nutrient] = roundTo(composition[nutrient], 4)
  }
  return composition
}

export function calculateComponentContributions(components: FormulaComponentInput[]) {
  return components.map((component) => {
    const quantity = normalizeQuantity(component.quantityKg)
    const contribution = emptyComposition()

    for (const nutrient of NUTRIENTS) {
      contribution[nutrient] = roundTo((quantity * (component.item.composition[nutrient] ?? 0)) / 1000, 4)
    }

    return {
      item: component.item,
      quantityKg: quantity,
      contribution,
    }
  })
}

export function summarizeFormula(components: FormulaComponentInput[], target?: CatalogItem | null) {
  const totalKg = roundTo(components.reduce((sum, component) => sum + normalizeQuantity(component.quantityKg), 0), 2)
  const composition = calculateComposition(components)
  const evaluation = evaluateComposition(composition, target?.composition)
  const alerts = totalKg === 1000 ? [] : [`Total ${totalKg.toFixed(2)} kg: la base fija es 1000 kg y no se normaliza automaticamente.`]
  return { totalKg, composition, evaluation, alerts }
}
