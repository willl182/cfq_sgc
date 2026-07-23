import { describe, expect, it } from 'vitest'
import { emptyComposition } from './nutrients'
import {
  applyReplacementToComponents,
  calculateSuggestedQuantity,
  euclideanDistanceNPK,
  isMixProduct,
  suggestMZRReplacements,
} from './replacer'

function makeItem(
  internalId: string,
  name: string,
  itemClass: 'MP' | 'PT' | 'MZR',
  patch: Partial<typeof emptyComposition> = {},
) {
  return {
    internalId,
    externalCode: internalId,
    originalCode: internalId,
    name,
    class: itemClass,
    type: 'G',
    physicalState: 'G' as const,
    origin: 'manual' as const,
    composition: { ...emptyComposition(), ...patch },
  }
}

describe('replacer domain', () => {
  const urea = makeItem('MP0001', 'UREA', 'MP', { N: 46 })
  const mzrR2 = makeItem('MZR0001', 'MZR R2', 'MZR', { N: 43.5 })
  const mzrN23 = makeItem('MZR0002', 'MZR N23', 'MZR', { N: 23 })
  const mzrNoN = makeItem('MZR0003', 'MZR sin N', 'MZR', { P: 20, K: 20 })

  it('distancia entre UREA (N=46) y MZR R2 (N=43.5) es aproximadamente 2.5', () => {
    expect(euclideanDistanceNPK(urea.composition, mzrR2.composition)).toBeCloseTo(2.5, 1)
  })

  it('prioridad N: MZR con N mas cercano al base aparece primero', () => {
    const suggestions = suggestMZRReplacements(urea, 100, [mzrN23, mzrR2, mzrNoN], 'N')
    expect(suggestions[0].item.internalId).toBe('MZR0001')
    expect(suggestions[1].item.internalId).toBe('MZR0002')
  })

  it('cantidad sugerida: UREA 100kg (N=46) -> MZR (N=23) = 200kg', () => {
    expect(calculateSuggestedQuantity(urea, 100, mzrN23, 'N')).toBe(200)
  })

  it('MZR sin nutriente prioritario: suggestedKg = 0 y no aparece en sugerencias', () => {
    expect(calculateSuggestedQuantity(urea, 100, mzrNoN, 'N')).toBe(0)
    const suggestions = suggestMZRReplacements(urea, 100, [mzrNoN], 'N')
    expect(suggestions).toEqual([])
  })

  it('applyReplacement: reemplaza solo el indice indicado y mantiene los demas componentes', () => {
    const original = [
      { id: 'c1', itemId: 'MP0001', quantityKg: 100 },
      { id: 'c2', itemId: 'MP0002', quantityKg: 200 },
      { id: 'c3', itemId: 'MP0003', quantityKg: 300 },
    ]
    const catalog = [
      urea,
      makeItem('MP0002', 'KCL', 'MP', { K: 60 }),
      makeItem('MP0003', 'DAP', 'MP', { N: 18, P: 46 }),
      mzrN23,
    ]
    const result = applyReplacementToComponents(original, catalog, 1, 'MZR0002', 150)

    expect(result).toHaveLength(3)
    expect(result[0].itemId).toBe('MP0001')
    expect(result[0].quantityKg).toBe(100)
    expect(result[1].itemId).toBe('MZR0002')
    expect(result[1].quantityKg).toBe(150)
    expect(result[2].itemId).toBe('MP0003')
    expect(result[2].quantityKg).toBe(300)
    expect(result.every((component) => component.id !== 'c1' && component.id !== 'c2' && component.id !== 'c3')).toBe(true)
  })

  it('isMixProduct: true para MF/MFE y false para otros nombres', () => {
    expect(isMixProduct(makeItem('PT0001', 'MF 10-20-20', 'PT'))).toBe(true)
    expect(isMixProduct(makeItem('PT0002', 'MFE 15-15-15', 'PT'))).toBe(true)
    expect(isMixProduct(makeItem('MP0001', 'UREA', 'MP', { N: 46 }))).toBe(false)
    expect(isMixProduct(null)).toBe(false)
    expect(isMixProduct(undefined)).toBe(false)
  })
})
