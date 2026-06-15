import type { CatalogItem } from './catalog'

export type ListImportRow = {
  productTargetId: string
  listAlias: string
  componentId: string
  quantityKg: number
}

export type ListImportGroup = {
  key: string
  productTargetId: string | null
  listAlias: string
  rows: ListImportRow[]
  totalKg: number
  missingComponentIds: string[]
}

export type ListImportError = {
  row: number
  field: string
  message: string
}

export type ParseListImportResult = {
  groups: ListImportGroup[]
  errors: ListImportError[]
  summary: {
    rowsRead: number
    validRows: number
    groups: number
  }
}

const REQUIRED_HEADERS = ['productoObjetivoId', 'listaAlias', 'componenteId', 'cantidad']

function parseDelimitedCsv(text: string): string[][] {
  const delimiter = text.includes(';') ? ';' : ','
  return text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(delimiter).map((cell) => cell.trim()))
}

function parseQuantity(value: string): number | null {
  const parsed = Number(value.trim().replace(',', '.'))
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.round(parsed * 100) / 100
}

export function parseListImportCsv(text: string, catalog: CatalogItem[]): ParseListImportResult {
  const rows = parseDelimitedCsv(text)
  const [headers = [], ...dataRows] = rows
  const errors: ListImportError[] = []
  const validRows: ListImportRow[] = []
  const activeIds = new Set(catalog.filter((item) => !item.archivedAt).map((item) => item.internalId))
  const targetIds = new Set(catalog.filter((item) => !item.archivedAt && item.class === 'PT').map((item) => item.internalId))

  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      errors.push({ row: 1, field: required, message: `Falta encabezado requerido ${required}` })
    }
  }

  if (errors.length > 0) {
    return { groups: [], errors, summary: { rowsRead: dataRows.length, validRows: 0, groups: 0 } }
  }

  const index = Object.fromEntries(headers.map((header, i) => [header, i]))

  dataRows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 2
    const productTargetId = row[index.productoObjetivoId] ?? ''
    const listAlias = row[index.listaAlias] ?? ''
    const componentId = row[index.componenteId] ?? ''
    const quantityRaw = row[index.cantidad] ?? ''
    const rowErrors: ListImportError[] = []

    if (productTargetId && !targetIds.has(productTargetId)) {
      rowErrors.push({ row: rowNumber, field: 'productoObjetivoId', message: `PT objetivo inexistente o no activo: ${productTargetId}` })
    }
    if (!listAlias.trim()) rowErrors.push({ row: rowNumber, field: 'listaAlias', message: 'Alias de lista vacio' })
    if (!componentId.trim()) rowErrors.push({ row: rowNumber, field: 'componenteId', message: 'Componente vacio' })
    if (componentId && !activeIds.has(componentId)) {
      rowErrors.push({ row: rowNumber, field: 'componenteId', message: `Componente inexistente o no activo: ${componentId}` })
    }

    const quantityKg = parseQuantity(quantityRaw)
    if (quantityKg === null) {
      rowErrors.push({ row: rowNumber, field: 'cantidad', message: `Cantidad invalida: ${quantityRaw}` })
    }

    if (rowErrors.length > 0 || quantityKg === null) {
      errors.push(...rowErrors)
      return
    }

    validRows.push({
      productTargetId: productTargetId.trim(),
      listAlias: listAlias.trim(),
      componentId: componentId.trim(),
      quantityKg,
    })
  })

  const groupsByKey = new Map<string, ListImportGroup>()
  for (const row of validRows) {
    const key = `${row.productTargetId || 'SIN_OBJETIVO'}::${row.listAlias}`
    const group = groupsByKey.get(key) ?? {
      key,
      productTargetId: row.productTargetId || null,
      listAlias: row.listAlias,
      rows: [],
      totalKg: 0,
      missingComponentIds: [],
    }
    group.rows.push(row)
    group.totalKg = Math.round((group.totalKg + row.quantityKg) * 100) / 100
    groupsByKey.set(key, group)
  }

  return {
    groups: [...groupsByKey.values()],
    errors,
    summary: {
      rowsRead: dataRows.length,
      validRows: validRows.length,
      groups: groupsByKey.size,
    },
  }
}
