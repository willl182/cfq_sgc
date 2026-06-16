import { CSV_NUTRIENT_MAP, type CatalogClass, type Composition, emptyComposition } from './nutrients'

export type CatalogItem = {
  internalId: string
  externalCode: string
  originalCode: string
  name: string
  class: CatalogClass
  type: string
  origin: 'csv' | 'manual'
  composition: Composition
  archivedAt?: number
}

export type CsvValidationError = {
  row: number
  field: string
  message: string
}

export type ParseCatalogResult = {
  items: CatalogItem[]
  errors: CsvValidationError[]
  summary: {
    rowsRead: number
    inserted: number
    rejected: number
  }
}

const REQUIRED_HEADERS = ['COD', 'PRODUCTO', 'CLASE', 'TIPO']

export function classifyCatalogRow(rawClass: string, code: string): CatalogClass | null {
  if (/^R\d*$/i.test(code.trim())) return 'MZR'
  const normalizedClass = rawClass.trim().toUpperCase()
  if (normalizedClass === 'MP' || normalizedClass === 'PT' || normalizedClass === 'MZR') return normalizedClass
  return null
}

function nextInternalId(counters: Record<CatalogClass, number>, itemClass: CatalogClass): string {
  counters[itemClass] += 1
  return `${itemClass}${String(counters[itemClass]).padStart(4, '0')}`
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return 0
  const normalized = trimmed.replace(',', '.')
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

function parseDelimitedCsv(text: string): string[][] {
  const delimiter = text.includes(';') ? ';' : ','
  return text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(delimiter).map((cell) => cell.trim()))
}

export function parseCatalogCsv(text: string): ParseCatalogResult {
  const rows = parseDelimitedCsv(text)
  const [headers = [], ...dataRows] = rows
  const errors: CsvValidationError[] = []
  const items: CatalogItem[] = []
  const counters: Record<CatalogClass, number> = { MP: 0, PT: 0, MZR: 0 }

  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      errors.push({ row: 1, field: required, message: `Falta encabezado requerido ${required}` })
    }
  }

  for (const header of headers) {
    if (header.includes('-') && !(header in CSV_NUTRIENT_MAP) && !(header.toUpperCase() in CSV_NUTRIENT_MAP)) {
      errors.push({ row: 1, field: header, message: `Nutriente no reconocido: ${header}` })
    }
  }

  if (errors.some((error) => error.row === 1)) {
    return { items: [], errors, summary: { rowsRead: dataRows.length, inserted: 0, rejected: dataRows.length } }
  }

  const index = Object.fromEntries(headers.map((header, i) => [header, i]))
  const nutrientIndex = Object.fromEntries(
    headers.flatMap((header, i) => {
      const nutrientKey = CSV_NUTRIENT_MAP[header] ?? CSV_NUTRIENT_MAP[header.toUpperCase()]
      return nutrientKey ? [[nutrientKey, i]] : []
    }),
  ) as Partial<Record<keyof Composition, number>>
  dataRows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 2
    const code = row[index.COD] ?? ''
    const name = row[index.PRODUCTO] ?? ''
    const rawClass = row[index.CLASE] ?? ''
    const type = row[index.TIPO] ?? ''
    const itemErrors: CsvValidationError[] = []

    if (!name.trim()) itemErrors.push({ row: rowNumber, field: 'PRODUCTO', message: 'Fila sin nombre de producto' })
    if (!code.trim()) itemErrors.push({ row: rowNumber, field: 'COD', message: 'Fila sin codigo original' })

    const itemClass = classifyCatalogRow(rawClass, code)
    if (!itemClass) itemErrors.push({ row: rowNumber, field: 'CLASE', message: `Clase no reconocida: ${rawClass}` })

    const composition = emptyComposition()
    for (const nutrientKey of Object.values(CSV_NUTRIENT_MAP)) {
      const cell = row[nutrientIndex[nutrientKey] ?? -1] ?? ''
      const parsed = parseNumber(cell)
      if (parsed === null) {
        itemErrors.push({ row: rowNumber, field: nutrientKey, message: `Valor numerico invalido: ${cell}` })
      } else {
        composition[nutrientKey] = parsed
      }
    }

    if (itemErrors.length > 0 || !itemClass) {
      errors.push(...itemErrors)
      return
    }

    items.push({
      internalId: nextInternalId(counters, itemClass),
      externalCode: code.trim(),
      originalCode: code.trim(),
      name: name.trim(),
      class: itemClass,
      type: type.trim(),
      origin: 'csv',
      composition,
    })
  })

  return {
    items,
    errors,
    summary: {
      rowsRead: dataRows.length,
      inserted: items.length,
      rejected: dataRows.length - items.length,
    },
  }
}
