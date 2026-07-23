import { describe, expect, it } from 'vitest'
import { hasCompositionInfo, type CatalogItem } from './catalog'
import { emptyComposition } from './nutrients'

function makeItem(partial: Partial<CatalogItem>): CatalogItem {
  return {
    internalId: 'MP0001',
    externalCode: '1',
    originalCode: '1',
    name: 'Test',
    class: 'MP',
    type: 'G',
    physicalState: 'G',
    origin: 'csv',
    composition: emptyComposition(),
    ...partial,
  }
}

describe('hasCompositionInfo', () => {
  it('devuelve false cuando todos los nutrientes son cero', () => {
    const item = makeItem({ composition: emptyComposition() })
    expect(hasCompositionInfo(item)).toBe(false)
  })

  it('devuelve true cuando al menos un nutriente es mayor a cero', () => {
    const item = makeItem({ composition: { ...emptyComposition(), N: 46 } })
    expect(hasCompositionInfo(item)).toBe(true)
  })

  it('detecta composicion en micronutrientes', () => {
    const item = makeItem({ composition: { ...emptyComposition(), Zn: 0.5 } })
    expect(hasCompositionInfo(item)).toBe(true)
  })

  it('devuelve false con valores negativos o cero', () => {
    const item = makeItem({ composition: { ...emptyComposition(), N: 0, P: -1 } })
    expect(hasCompositionInfo(item)).toBe(false)
  })
})
