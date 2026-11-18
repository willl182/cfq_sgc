import type { Borders, Cell, Fill } from 'exceljs'

export type BalanceSheetData = {
  productName: string
  productCode: string
  generalStatus: string
  baseKg: number
  nutrients: string[]
  components: { name: string; kg: number; values: number[] }[]
  total: { kg: number; values: number[] }
  target?: { declared: number[]; min: number[]; max: number[]; status: string[] }
}

const BRAND = 'FF1F5F3A'
const STATUS_LABEL: Record<string, string> = {
  C: 'Cumple', NC: 'No cumple', SUP: 'Supera', INFO: '',
  CUMPLE: 'CUMPLE', NO_CUMPLE: 'NO CUMPLE', CUMPLE_S: 'CUMPLE (supera)', SIN_OBJETIVO: 'SIN OBJETIVO',
}
const STATUS_COLOR: Record<string, string> = { C: 'FFD8F0DD', NC: 'FFF8D3D3', SUP: 'FFFFF0C2' }

const solid = (argb: string): Fill => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
const thin: Partial<Borders> = {
  top: { style: 'thin', color: { argb: 'FFBFBFBF' } }, bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  left: { style: 'thin', color: { argb: 'FFBFBFBF' } }, right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
}
const num = (value: number) => (Math.abs(value) < 0.001 ? null : value)

export async function buildBalanceXlsx(data: BalanceSheetData, generatedAt = new Date()): Promise<Blob> {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Formulador SGC CALFERQUIM'
  wb.created = generatedAt
  const ws = wb.addWorksheet('Balance', { views: [{ state: 'frozen', ySplit: 8 }], pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 } })
  const lastCol = 2 + data.nutrients.length

  ws.mergeCells(1, 1, 1, lastCol)
  const title = ws.getCell(1, 1)
  title.value = 'CALFERQUIM S.A.S. — Balance de formulación'
  title.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
  title.fill = solid(BRAND)
  title.alignment = { vertical: 'middle', horizontal: 'center' }
  ws.getRow(1).height = 26

  const info: [string, string | number][] = [
    ['Producto', data.productName],
    ['Código', data.productCode || '—'],
    ['Base (kg)', data.baseKg],
    ['Estado general', STATUS_LABEL[data.generalStatus] ?? data.generalStatus],
    ['Fecha', generatedAt.toLocaleString('es-CO')],
  ]
  info.forEach(([label, value], i) => {
    const row = ws.getRow(2 + i)
    row.getCell(1).value = label
    row.getCell(1).font = { bold: true }
    ws.mergeCells(2 + i, 2, 2 + i, lastCol)
    row.getCell(2).value = value
    row.getCell(2).alignment = { horizontal: 'left' }
  })
  const statusCell = ws.getCell(5, 2)
  statusCell.font = { bold: true, color: { argb: data.generalStatus === 'NO_CUMPLE' ? 'FFC00000' : BRAND } }

  const headerRow = ws.getRow(8)
  ;['Materia prima', 'kg', ...data.nutrients.map((n) => `${n} (%)`)].forEach((text, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = text
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = solid(BRAND)
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = thin
  })
  headerRow.height = 20

  const style = (cell: Cell, opts: { bold?: boolean; fill?: string; fmt?: string } = {}) => {
    cell.border = thin
    if (opts.bold) cell.font = { bold: true }
    if (opts.fill) cell.fill = solid(opts.fill)
    if (opts.fmt) cell.numFmt = opts.fmt
  }
  const addRow = (label: string, kg: number | null, values: (number | string | null)[], opts: { bold?: boolean; fill?: string; fills?: (string | undefined)[] } = {}) => {
    const row = ws.addRow([label, kg, ...values])
    for (let c = 1; c <= lastCol; c += 1) {
      const fill = opts.fills?.[c - 3] ?? opts.fill
      style(row.getCell(c), { bold: opts.bold, fill, fmt: c === 2 ? '#,##0.00' : c > 2 ? '0.00' : undefined })
      if (c > 2) row.getCell(c).alignment = { horizontal: 'center' }
    }
    return row
  }

  data.components.forEach((c, i) => addRow(c.name, c.kg, c.values.map(num), { fill: i % 2 ? 'FFF5F8F6' : undefined }))
  addRow('TOTAL CALCULADO', data.total.kg, data.total.values.map(num), { bold: true, fill: 'FFE2EFE6' })

  if (data.target) {
    const t = data.target
    addRow('OBJETIVO (declarado)', null, t.declared.map(num), { bold: true, fill: 'FFEAF1FB' })
    addRow('TOLERANCIA MÍN', null, t.min.map((v, i) => (t.declared[i] > 0 ? v : null)), { fill: 'FFF7F9FC' })
    addRow('TOLERANCIA MÁX', null, t.max.map((v, i) => (t.declared[i] > 0 ? v : null)), { fill: 'FFF7F9FC' })
    addRow('CUMPLIMIENTO', null, t.status.map((s) => STATUS_LABEL[s] || null), { bold: true, fills: t.status.map((s) => STATUS_COLOR[s]) })
  }

  ws.getColumn(1).width = Math.max(22, ...data.components.map((c) => c.name.length + 2))
  ws.getColumn(2).width = 12
  for (let c = 3; c <= lastCol; c += 1) ws.getColumn(c).width = 11

  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
