import type { CatalogItem } from './catalog'
import type { FormulaComponentInput } from './formulation'
import { canonicalNutrientLabel, NUTRIENTS } from './nutrients'

export type ExportLiveList = {
  id: string
  displayCode: string
  targetProductId: string | null
  components: { itemId: string; quantityKg: number }[]
  updatedAt: number
  archivedAt?: number
}

export type ExportSnapshot = {
  id: string
  productListId: string
  displayCode: string
  snapshotVersion: string
  targetProductId: string | null
  frozenTarget: CatalogItem | null
  frozenComponents: FormulaComponentInput[]
  summary: {
    totalKg: number
    evaluation: { generalStatus: string }
  }
  createdAt: number
  actor: string
}

const liveHeaders = [
  'listaId',
  'codigoLista',
  'productoObjetivoId',
  'productoObjetivoNombre',
  'componenteOrden',
  'componenteId',
  'componenteNombre',
  'componenteClase',
  'cantidadKg',
  'actualizado',
]

const snapshotHeaders = [
  'snapshotId',
  'listaId',
  'codigoLista',
  'version',
  'fecha',
  'actor',
  'estado',
  'totalKg',
  'productoObjetivoId',
  'productoObjetivoNombre',
  'componenteOrden',
  'componenteId',
  'componenteNombre',
  'componenteClase',
  'cantidadKg',
]

const catalogHeaders = [
  'idInterno',
  'codigoExterno',
  'codigoOriginal',
  'producto',
  'clase',
  'tipo',
  'origen',
  'archivado',
  ...NUTRIENTS.map(canonicalNutrientLabel),
]

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value)
  return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function toCsv(headers: string[], rows: unknown[][]) {
  return [headers, ...rows].map((row) => row.map(csvEscape).join(';')).join('\n')
}

export function exportLiveListsCsv(lists: ExportLiveList[], catalog: CatalogItem[]) {
  const catalogById = new Map(catalog.map((item) => [item.internalId, item]))
  const rows = lists.flatMap((list) => {
    const target = list.targetProductId ? catalogById.get(list.targetProductId) : null
    return list.components.map((component, index) => {
      const item = catalogById.get(component.itemId)
      return [
        list.id,
        list.displayCode,
        list.targetProductId ?? '',
        target?.name ?? '',
        index + 1,
        component.itemId,
        item?.name ?? '',
        item?.class ?? '',
        component.quantityKg,
        new Date(list.updatedAt).toISOString(),
      ]
    })
  })
  return toCsv(liveHeaders, rows)
}

export function exportSnapshotsCsv(snapshots: ExportSnapshot[]) {
  const rows = snapshots.flatMap((snapshot) =>
    snapshot.frozenComponents.map((component, index) => [
      snapshot.id,
      snapshot.productListId,
      snapshot.displayCode,
      snapshot.snapshotVersion,
      new Date(snapshot.createdAt).toISOString(),
      snapshot.actor,
      snapshot.summary.evaluation.generalStatus,
      snapshot.summary.totalKg,
      snapshot.targetProductId ?? '',
      snapshot.frozenTarget?.name ?? '',
      index + 1,
      component.item.internalId,
      component.item.name,
      component.item.class,
      component.quantityKg,
    ]),
  )
  return toCsv(snapshotHeaders, rows)
}

export function exportCatalogCsv(catalog: CatalogItem[]) {
  const rows = catalog.map((item) => [
    item.internalId,
    item.externalCode,
    item.originalCode,
    item.name,
    item.class,
    item.type,
    item.origin,
    item.archivedAt ? new Date(item.archivedAt).toISOString() : '',
    ...NUTRIENTS.map((nutrient) => item.composition[nutrient]),
  ])
  return toCsv(catalogHeaders, rows)
}

export function exportLiveListsJson(lists: ExportLiveList[], catalog: CatalogItem[]) {
  const catalogById = new Map(catalog.map((item) => [item.internalId, item]))
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    type: 'liveLists',
    lists: lists.map((list) => ({
      ...list,
      targetProduct: list.targetProductId ? catalogById.get(list.targetProductId) ?? null : null,
      components: list.components.map((component) => ({
        ...component,
        item: catalogById.get(component.itemId) ?? null,
      })),
    })),
  }, null, 2)
}

export function exportSnapshotsJson(snapshots: ExportSnapshot[]) {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    type: 'snapshots',
    snapshots,
  }, null, 2)
}
