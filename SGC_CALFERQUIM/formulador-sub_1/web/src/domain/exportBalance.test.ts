import { describe, expect, it } from 'vitest'
import { exportBalanceCsv } from './exportBalance'

describe('exportBalanceCsv', () => {
  it('identifies the product in the filename and the first CSV row', () => {
    const result = exportBalanceCsv('Ácido / NPK 10-20-30', ['Materia Prima', 'kg'], [['Urea', '100.00']], '2026-10-29')
    expect(result.filename).toBe('balance_acido_npk_10_20_30_2026-10-29.csv')
    expect(result.csv).toBe('Producto;Ácido / NPK 10-20-30\nMateria Prima;kg\nUrea;100.00')
  })

  it('escapes product names and preserves balance rows', () => {
    const result = exportBalanceCsv('Mezcla; "Especial"\nNPK', ['kg'], [['100']], '2026-10-29')
    expect(result.csv).toBe('Producto;"Mezcla; ""Especial""\nNPK"\nkg\n100')
    expect(result.filename).toBe('balance_mezcla_especial_npk_2026-10-29.csv')
  })

  it('provides a safe fallback when no product is selected', () => {
    expect(exportBalanceCsv(' ', [], [], '2026-10-29').filename).toBe('balance_sin_producto_2026-10-29.csv')
    expect(exportBalanceCsv(' ', [], [], '2026-10-29').csv).toMatch(/^Producto;Sin producto\n/)
    expect(exportBalanceCsv('***', [], [], '2026-10-29').filename).toBe('balance_sin_producto_2026-10-29.csv')
  })
})
