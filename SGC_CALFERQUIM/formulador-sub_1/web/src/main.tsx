import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from 'convex/react'
import { Archive, Beaker, Calculator, ChevronLeft, ChevronRight, Clock3, Copy, Database, Download, FileUp, History, ListChecks, PackagePlus, Pencil, Plus, RotateCcw, Save, Search, Shield, Trash2, UserCog, X } from 'lucide-react'
import './style.css'
import { api } from '../convex/_generated/api'
import { parseCatalogCsv, type CatalogItem } from './domain/catalog'
import { exportCatalogCsv, exportLiveListsCsv, exportLiveListsJson, exportSnapshotsCsv, exportSnapshotsJson } from './domain/exportLists'
import { calculateComponentContributions, summarizeFormula, type FormulaComponentInput } from './domain/formulation'
import { parseListImportCsv, type ParseListImportResult } from './domain/importLists'
import { summarizeRequiredInputs } from './domain/listTotals'
import { canonicalNutrientLabel, emptyComposition, normalizeComposition, NUTRIENTS, type CatalogClass, type NutrientKey } from './domain/nutrients'

type Role = 'user' | 'admin'
type View = 'catalog' | 'formulator' | 'scale' | 'history' | 'import'
const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined

function formatGrade(composition: CatalogItem['composition']) {
  return `${formatPct(composition.N)}-${formatPct(composition.P)}-${formatPct(composition.K)}`
}

type LiveComponent = {
  id: string
  itemId: string
  quantityKg: number
}

type ProductList = {
  id: string
  displayCode: string
  targetProductId: string | null
  components: LiveComponent[]
  updatedAt: number
  archivedAt?: number
}

type ConvexCatalogItem = CatalogItem & {
  _id: string
  _creationTime: number
  createdAt: number
  updatedAt: number
}

type ConvexProductList = {
  _id: string
  _creationTime: number
  displayCode: string
  targetProductId?: string
  components: { itemInternalId: string; quantityKg: number }[]
  archivedAt?: number
  createdAt: number
  updatedAt: number
}

type ConvexSnapshot = {
  _id: string
  _creationTime: number
  productListId: string
  displayCode: string
  snapshotVersion: string
  targetProductId?: string
  frozenTarget?: CatalogItem
  frozenComponents: FormulaComponentInput[]
  calculatedComposition: ReturnType<typeof emptyComposition>
  evaluation: ReturnType<typeof summarizeFormula>['evaluation']
  generalStatus: string
  totalKg: number
  alerts: string[]
  actor: { id: string; role: Role }
  archivedAt?: number
  createdAt: number
}

type ConvexCatalogChange = {
  _id: string
  _creationTime: number
  internalId: string
  changedAt: number
  actor: { id: string; role: Role }
  origin: string
  changes: { field: string; before: number | null; after: number | CatalogItem | null }[]
}

type Snapshot = {
  id: string
  productListId: string
  displayCode: string
  snapshotVersion: string
  targetProductId: string | null
  frozenTarget: CatalogItem | null
  frozenComponents: FormulaComponentInput[]
  summary: ReturnType<typeof summarizeFormula>
  createdAt: number
  actor: string
}

type CatalogChange = {
  id: string
  itemInternalId: string
  itemName: string
  changedAt: number
  actor: Role
  field: string
  before: number
  after: number
  origin: 'catalog.detail_edit'
}

type ScaleSelection = {
  id: string
  listId: string
  multiplier: number
}

type SnapshotSortKey = 'displayCode' | 'targetName' | 'createdAt' | 'totalKg' | 'status'
type SortDirection = 'asc' | 'desc'

function useLocalState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : initialValue
  })
  const setStored = (next: T) => {
    localStorage.setItem(key, JSON.stringify(next))
    setValue(next)
  }
  return [value, setStored] as const
}

function mapConvexList(list: ConvexProductList): ProductList {
  return {
    id: list._id,
    displayCode: list.displayCode,
    targetProductId: list.targetProductId ?? null,
    components: list.components.map((component) => ({
      id: `${list._id}-${component.itemInternalId}-${component.quantityKg}`,
      itemId: component.itemInternalId,
      quantityKg: component.quantityKg,
    })),
    updatedAt: list.updatedAt,
    archivedAt: list.archivedAt,
  }
}

function mapConvexSnapshot(snapshot: ConvexSnapshot): Snapshot {
  return {
    id: snapshot._id,
    productListId: snapshot.productListId,
    displayCode: snapshot.displayCode,
    snapshotVersion: snapshot.snapshotVersion,
    targetProductId: snapshot.targetProductId ?? null,
    frozenTarget: snapshot.frozenTarget ?? null,
    frozenComponents: snapshot.frozenComponents,
    summary: {
      totalKg: snapshot.totalKg,
      composition: snapshot.calculatedComposition,
      evaluation: snapshot.evaluation,
      alerts: snapshot.alerts,
    },
    createdAt: snapshot.createdAt,
    actor: snapshot.actor.role,
  }
}

function mapConvexChange(change: ConvexCatalogChange, catalog: CatalogItem[]): CatalogChange {
  const firstChange = change.changes[0]
  const item = catalog.find((catalogItem) => catalogItem.internalId === change.internalId)
  return {
    id: change._id,
    itemInternalId: change.internalId,
    itemName: item?.name ?? change.internalId,
    changedAt: change.changedAt,
    actor: change.actor.role,
    field: firstChange?.field ?? change.origin,
    before: typeof firstChange?.before === 'number' ? firstChange.before : 0,
    after: typeof firstChange?.after === 'number' ? firstChange.after : 0,
    origin: 'catalog.detail_edit',
  }
}

function formatPct(value: number) {
  if (value === 0 || Math.abs(value) < 0.001) {
    return ''
  }
  return value.toFixed(2)
}

function normalizeCatalogItem(item: CatalogItem): CatalogItem {
  return { ...item, composition: normalizeComposition(item.composition) }
}

function formatCompositionField(field: string) {
  const key = field.replace('composition.', '') as NutrientKey
  return NUTRIENTS.includes(key) ? canonicalNutrientLabel(key) : field
}

function formatKg(value: number) {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function latestSnapshotsOnly(snapshots: Snapshot[]) {
  const latestByList = new Map<string, Snapshot>()
  for (const snapshot of snapshots) {
    const current = latestByList.get(snapshot.productListId)
    if (!current || snapshot.createdAt > current.createdAt) {
      latestByList.set(snapshot.productListId, snapshot)
    }
  }
  return Array.from(latestByList.values())
}

function createDisplayCode(target: CatalogItem | null, lists: ProductList[]) {
  const base = target?.internalId ?? 'BORRADOR'
  const count = lists.filter((list) => list.displayCode.startsWith(`${base}-L`)).length + 1
  return `${base}-L${String(count).padStart(3, '0')}`
}

function exportStamp() {
  return new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')
}

function downloadTextFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function nextCatalogInternalId(catalog: CatalogItem[], itemClass: CatalogClass) {
  const maxNumber = catalog
    .filter((item) => item.class === itemClass)
    .map((item) => Number(item.internalId.replace(itemClass, '')))
    .filter(Number.isFinite)
    .reduce((max, value) => Math.max(max, value), 0)
  return `${itemClass}${String(maxNumber + 1).padStart(4, '0')}`
}

function catalogOptionLabel(item: CatalogItem) {
  return `${item.internalId} · ${item.class} · ${item.name}`
}

function CatalogCombobox({
  value,
  items,
  onChange,
  placeholder,
  emptyLabel = 'Sin resultados',
}: {
  value: string
  items: CatalogItem[]
  onChange: (value: string) => void
  placeholder: string
  emptyLabel?: string
}) {
  const selected = items.find((item) => item.internalId === value) ?? null
  const [inputValue, setInputValue] = useState(selected ? catalogOptionLabel(selected) : '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setInputValue(selected ? catalogOptionLabel(selected) : '')
  }, [selected?.internalId])

  const filteredItems = useMemo(() => {
    const needle = inputValue.trim().toLowerCase()
    if (!needle || selected?.internalId === value && inputValue === catalogOptionLabel(selected)) return items.slice(0, 20)
    return items.filter((item) => {
      const haystack = `${item.internalId} ${item.class} ${item.name} ${item.externalCode} ${item.type}`.toLowerCase()
      return haystack.includes(needle)
    }).slice(0, 20)
  }, [inputValue, items, selected, value])

  function selectItem(item: CatalogItem) {
    onChange(item.internalId)
    setInputValue(catalogOptionLabel(item))
    setOpen(false)
  }

  return (
    <div className="combo">
      <input
        value={inputValue}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setInputValue(event.target.value)
          setOpen(true)
          if (event.target.value.trim() === '') onChange('')
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false)
            setInputValue(selected ? catalogOptionLabel(selected) : '')
          }, 120)
        }}
        placeholder={placeholder}
      />
      <button type="button" className="combo-arrow" onMouseDown={(event) => { event.preventDefault(); setOpen((current) => !current) }}>⌄</button>
      {open && (
        <div className="combo-menu">
          {filteredItems.map((item) => (
            <button type="button" className="combo-option" key={item.internalId} onMouseDown={(event) => { event.preventDefault(); selectItem(item) }}>
              <strong>{item.internalId}</strong>
              <span>{item.class}</span>
              <small>{item.name}</small>
            </button>
          ))}
          {filteredItems.length === 0 && <div className="combo-empty">{emptyLabel}</div>}
        </div>
      )}
    </div>
  )
}

function CatalogSearchCombobox({
  value,
  items,
  onChange,
  placeholder,
}: {
  value: string
  items: CatalogItem[]
  onChange: (value: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const filteredItems = useMemo(() => {
    const needle = value.trim().toLowerCase()
    if (!needle) return items.slice(0, 20)
    return items.filter((item) => {
      const haystack = `${item.internalId} ${item.class} ${item.name} ${item.externalCode} ${item.type}`.toLowerCase()
      return haystack.includes(needle)
    }).slice(0, 20)
  }, [items, value])

  return (
    <div className="combo catalog-search-combo">
      <input
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
      />
      <button type="button" className="combo-arrow" onMouseDown={(event) => { event.preventDefault(); setOpen((current) => !current) }}>⌄</button>
      {open && (
        <div className="combo-menu">
          {filteredItems.map((item) => (
            <button type="button" className="combo-option" key={item.internalId} onMouseDown={(event) => { event.preventDefault(); onChange(item.internalId); setOpen(false) }}>
              <strong>{item.internalId}</strong>
              <span>{item.class}</span>
              <small>{item.name}</small>
            </button>
          ))}
          {filteredItems.length === 0 && <div className="combo-empty">Sin resultados</div>}
        </div>
      )}
    </div>
  )
}

function SnapshotSearchCombobox({
  value,
  snapshots,
  getTargetName,
  onChange,
}: {
  value: string
  snapshots: Snapshot[]
  getTargetName: (snapshot: Snapshot) => string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const latestSnapshots = useMemo(() => latestSnapshotsOnly(snapshots), [snapshots])
  const filteredSnapshots = useMemo(() => {
    const needle = value.trim().toLowerCase()
    const source = needle
      ? latestSnapshots.filter((snapshot) => `${snapshot.displayCode} ${getTargetName(snapshot)} ${formatKg(snapshot.summary.totalKg)} kg ${snapshot.summary.evaluation.generalStatus} ${new Date(snapshot.createdAt).toLocaleString()}`.toLowerCase().includes(needle))
      : latestSnapshots
    return source.slice(0, 20)
  }, [getTargetName, latestSnapshots, value])

  return (
    <div className="combo catalog-search-combo">
      <input
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(event) => { onChange(event.target.value); setOpen(true) }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        placeholder="Buscar por codigo, producto, kg, fecha o estado"
      />
      <button type="button" className="combo-arrow" onMouseDown={(event) => { event.preventDefault(); setOpen((current) => !current) }}>⌄</button>
      {open && (
        <div className="combo-menu">
          {filteredSnapshots.map((snapshot) => (
            <button type="button" className="combo-option snapshot-combo-option" key={snapshot.id} onMouseDown={(event) => { event.preventDefault(); onChange(snapshot.displayCode); setOpen(false) }}>
              <strong>{snapshot.displayCode}</strong>
              <span>{snapshot.snapshotVersion}</span>
              <small>{getTargetName(snapshot)}</small>
            </button>
          ))}
          {filteredSnapshots.length === 0 && <div className="combo-empty">Sin resultados</div>}
        </div>
      )}
    </div>
  )
}

function App() {
  const remoteCatalog = useQuery(api.catalog.list, {}) as ConvexCatalogItem[] | undefined
  const remoteCatalogWithArchived = useQuery(api.catalog.list, { includeArchived: true }) as ConvexCatalogItem[] | undefined
  const remoteLists = useQuery(api.productLists.liveLists, {}) as ConvexProductList[] | undefined
  const remoteSnapshots = useQuery(api.productLists.snapshots, {}) as ConvexSnapshot[] | undefined
  const remoteChanges = useQuery(api.catalog.recentChanges, { limit: 200 }) as ConvexCatalogChange[] | undefined
  const seedRemoteCatalog = useMutation(api.catalog.seedIfEmpty)
  const createRemoteCatalogItem = useMutation(api.catalog.createManual)
  const updateRemoteComposition = useMutation(api.catalog.updateComposition)
  const archiveRemoteItem = useMutation(api.catalog.archive)
  const saveRemoteList = useMutation(api.productLists.saveWithSnapshot)
  const updateRemoteLiveList = useMutation(api.productLists.updateLiveList)
  const archiveRemoteLiveList = useMutation(api.productLists.archiveLiveList)
  const [localCatalog, setLocalCatalog] = useLocalState<CatalogItem[]>('cfq.catalogItems', [])
  const [localLists, setLocalLists] = useLocalState<ProductList[]>('cfq.productLists', [])
  const [localSnapshots, setLocalSnapshots] = useLocalState<Snapshot[]>('cfq.productListSnapshots', [])
  const [localCatalogChanges, setLocalCatalogChanges] = useLocalState<CatalogChange[]>('cfq.catalogChangeHistory', [])
  const [role, setRole] = useLocalState<Role>('cfq.localRole', 'user')
  const [view, setView] = useState<View>('formulator')
  const [query, setQuery] = useState('')
  const [snapshotQuery, setSnapshotQuery] = useState('')
  const [snapshotSort, setSnapshotSort] = useState<{ key: SnapshotSortKey; direction: SortDirection }>({ key: 'createdAt', direction: 'desc' })
  const [classFilter, setClassFilter] = useState<'ALL' | 'MP' | 'PT' | 'MZR'>('ALL')
  const [targetId, setTargetId] = useState('')
  const [components, setComponents] = useState<LiveComponent[]>([{ id: crypto.randomUUID(), itemId: '', quantityKg: 0 }])
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [scaleListId, setScaleListId] = useState('')
  const [scaleMultiplier, setScaleMultiplier] = useState(1)
  const [scaleSelections, setScaleSelections] = useState<ScaleSelection[]>([{ id: crypto.randomUUID(), listId: '', multiplier: 1 }])
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [newItemClass, setNewItemClass] = useState<CatalogClass>('MP')
  const [newItemCode, setNewItemCode] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState('')
  const [newTargetCode, setNewTargetCode] = useState('')
  const [newTargetName, setNewTargetName] = useState('')
  const [newTargetType, setNewTargetType] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [importResult, setImportResult] = useState<ParseListImportResult | null>(null)
  const [importFileName, setImportFileName] = useState('')
  const [compositionDrafts, setCompositionDrafts] = useState<Record<string, Partial<Record<NutrientKey, string>>>>({})
  const pendingCompositionValues = useRef<Record<string, Partial<Record<NutrientKey, number>>>>({})
  const liveCompositionValues = useRef<Record<string, CatalogItem['composition']>>({})
  const compositionSaveTimers = useRef<Record<string, number>>({})
  const liveListSaveTimer = useRef<number | null>(null)
  const loadedListSignature = useRef('')
  const rawCatalog = remoteCatalog ?? localCatalog
  const rawCatalogWithArchived = remoteCatalogWithArchived ?? localCatalog
  const catalog = useMemo(() => rawCatalog.map(normalizeCatalogItem), [rawCatalog])
  const catalogWithArchived = useMemo(() => rawCatalogWithArchived.map(normalizeCatalogItem), [rawCatalogWithArchived])
  const lists = remoteLists?.map(mapConvexList) ?? localLists
  const snapshots = remoteSnapshots?.map(mapConvexSnapshot) ?? localSnapshots
  const catalogChanges = remoteChanges?.map((change) => mapConvexChange(change, catalog)) ?? localCatalogChanges
  const usingConvex = Boolean(convexUrl)

  const activeCatalog = useMemo(() => catalog.filter((item) => !item.archivedAt), [catalog])
  const target = activeCatalog.find((item) => item.internalId === targetId) ?? null
  const resolvedComponents: FormulaComponentInput[] = components
    .map((component) => {
      const item = activeCatalog.find((catalogItem) => catalogItem.internalId === component.itemId)
      return item ? { item, quantityKg: component.quantityKg } : null
    })
    .filter(Boolean) as FormulaComponentInput[]
  const summary = summarizeFormula(resolvedComponents, target)
  const componentContributions = calculateComponentContributions(resolvedComponents)
  const contributionNutrients = NUTRIENTS.filter((nutrient) => componentContributions.some((row) => row.contribution[nutrient] > 0))
  const selectedCatalogItem = activeCatalog.find((item) => item.internalId === selectedCatalogId) ?? null
  const selectedScaleList = lists.find((list) => list.id === scaleListId) ?? lists.find((list) => list.id === editingListId) ?? lists[0] ?? null
  const selectedScaleTarget = selectedScaleList?.targetProductId ? activeCatalog.find((item) => item.internalId === selectedScaleList.targetProductId) ?? null : null
  const selectedScaleComponents = selectedScaleList?.components
    .map((component) => {
      const item = activeCatalog.find((catalogItem) => catalogItem.internalId === component.itemId)
      return item ? { component, item } : null
    })
    .filter(Boolean) as { component: LiveComponent; item: CatalogItem }[] | undefined
  const scaleBaseKg = selectedScaleList?.components.reduce((sum, component) => sum + Math.max(0, component.quantityKg), 0) ?? 0
  const safeScaleMultiplier = Number.isFinite(scaleMultiplier) && scaleMultiplier > 0 ? scaleMultiplier : 0
  const scaledTotalKg = scaleBaseKg * safeScaleMultiplier
  const selectedRequirements = summarizeRequiredInputs(
    lists,
    scaleSelections.map((selection) => ({ listId: selection.listId, multiplier: selection.multiplier })),
    activeCatalog,
  )
  const selectedRequirementsTotalKg = selectedRequirements.reduce((sum, requirement) => sum + requirement.totalKg, 0)
  const listIdsKey = lists.map((list) => list.id).join('|')

  useEffect(() => {
    return () => {
      Object.values(compositionSaveTimers.current).forEach((timer) => window.clearTimeout(timer))
      if (liveListSaveTimer.current !== null) window.clearTimeout(liveListSaveTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!editingListId) return
    const signature = JSON.stringify({ targetId, components: components.map((component) => ({ itemId: component.itemId, quantityKg: component.quantityKg })) })
    if (signature === loadedListSignature.current) return
    if (liveListSaveTimer.current !== null) window.clearTimeout(liveListSaveTimer.current)

    liveListSaveTimer.current = window.setTimeout(async () => {
      const existing = lists.find((list) => list.id === editingListId)
      if (!existing) return
      const now = Date.now()
      const validComponents = components.filter((component) => component.itemId)
      setSaveState('saving')
      try {
        if (usingConvex) {
          await updateRemoteLiveList({
            productListId: editingListId as never,
            targetProductId: target?.internalId,
            components: validComponents.map((component) => ({ itemInternalId: component.itemId, quantityKg: component.quantityKg })),
          })
        } else {
          setLocalLists(lists.map((list) => list.id === editingListId ? {
            ...list,
            targetProductId: target?.internalId ?? null,
            components,
            updatedAt: now,
          } : list))
        }
        loadedListSignature.current = signature
        setSaveState('saved')
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'No se pudo autoguardar la lista.')
        setSaveState('error')
      }
    }, 650)
  }, [components, editingListId, lists, setLocalLists, target?.internalId, targetId, updateRemoteLiveList, usingConvex])

  useEffect(() => {
    activeCatalog.forEach((item) => {
      if (!pendingCompositionValues.current[item.internalId]) {
        liveCompositionValues.current[item.internalId] = item.composition
      }
    })
  }, [activeCatalog])

  useEffect(() => {
    setScaleSelections((current) => {
      const next = current.map((selection, index) => ({
        ...selection,
        listId: selection.listId || lists[index]?.id || '',
      }))
      return next.some((selection, index) => selection.listId !== current[index]?.listId) ? next : current
    })
  }, [listIdsKey])

  const filteredCatalog = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return activeCatalog.filter((item) => {
      const classOk = classFilter === 'ALL' || item.class === classFilter
      const queryOk = !needle || `${item.internalId} ${item.externalCode} ${item.name} ${item.type}`.toLowerCase().includes(needle)
      return classOk && queryOk
    })
  }, [activeCatalog, classFilter, query])

  function snapshotTargetName(snapshot: Snapshot) {
    const liveList = lists.find((list) => list.id === snapshot.productListId)
    const liveTarget = liveList?.targetProductId ? activeCatalog.find((item) => item.internalId === liveList.targetProductId) ?? null : null
    return liveTarget?.name
      ?? snapshot.frozenTarget?.name
      ?? (snapshot.targetProductId ? activeCatalog.find((item) => item.internalId === snapshot.targetProductId)?.name : null)
      ?? 'SIN_OBJETIVO'
  }

  function snapshotVisibleSummary(snapshot: Snapshot) {
    const liveList = lists.find((list) => list.id === snapshot.productListId)
    const liveTarget = liveList?.targetProductId ? activeCatalog.find((item) => item.internalId === liveList.targetProductId) ?? null : null
    const liveComponents = liveList?.components
      .map((component) => {
        const item = activeCatalog.find((catalogItem) => catalogItem.internalId === component.itemId)
        return item ? { item, quantityKg: component.quantityKg } : null
      })
      .filter(Boolean) as FormulaComponentInput[] | undefined
    return liveComponents ? summarizeFormula(liveComponents, liveTarget) : snapshot.summary
  }

  function updateSnapshotSort(key: SnapshotSortKey) {
    setSnapshotSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }))
  }

  const visibleSnapshots = useMemo(() => {
    const needle = snapshotQuery.trim().toLowerCase()
    const latestSnapshots = latestSnapshotsOnly(snapshots)
    const filtered = latestSnapshots.filter((snapshot) => {
      if (!needle) return true
      const summary = snapshotVisibleSummary(snapshot)
      const haystack = `${snapshot.displayCode} ${snapshotTargetName(snapshot)} ${formatKg(summary.totalKg)} kg ${new Date(snapshot.createdAt).toLocaleString()} ${summary.evaluation.generalStatus}`.toLowerCase()
      return haystack.includes(needle)
    })
    return [...filtered].sort((a, b) => {
      const summaryA = snapshotVisibleSummary(a)
      const summaryB = snapshotVisibleSummary(b)
      const targetA = snapshotTargetName(a)
      const targetB = snapshotTargetName(b)
      const values: Record<SnapshotSortKey, [string | number, string | number]> = {
        displayCode: [a.displayCode, b.displayCode],
        targetName: [targetA, targetB],
        createdAt: [a.createdAt, b.createdAt],
        totalKg: [summaryA.totalKg, summaryB.totalKg],
        status: [summaryA.evaluation.generalStatus, summaryB.evaluation.generalStatus],
      }
      const [left, right] = values[snapshotSort.key]
      const result = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), 'es')
      return snapshotSort.direction === 'asc' ? result : -result
    })
  }, [activeCatalog, lists, snapshotQuery, snapshotSort, snapshots])

  async function seedCatalog() {
    if (catalog.length > 0) return
    setSaveState('saving')
    const response = await fetch('/data/mp-pt_mzr.csv')
    const result = parseCatalogCsv(await response.text())
    if (result.errors.length > 0) {
      window.alert(`CSV rechazado: ${result.errors.slice(0, 5).map((error) => `fila ${error.row} ${error.field}`).join(', ')}`)
      setSaveState('error')
      return
    }
    try {
      if (usingConvex) {
        await seedRemoteCatalog({ items: result.items, actor: { id: 'local', role } })
      } else {
        setLocalCatalog(result.items)
      }
      setSaveState('saved')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo cargar el catalogo.')
      setSaveState('error')
    }
  }

  function clearLocalData() {
    if (!window.confirm('Esto limpiara catalogo, listas guardadas, catalogo de listas y rol local de este navegador.')) return
    localStorage.removeItem('cfq.catalogItems')
    localStorage.removeItem('cfq.productLists')
    localStorage.removeItem('cfq.productListSnapshots')
    localStorage.removeItem('cfq.catalogChangeHistory')
    localStorage.removeItem('cfq.localRole')
    setLocalCatalog([])
    setLocalLists([])
    setLocalSnapshots([])
    setLocalCatalogChanges([])
    setRole('user')
    setTargetId('')
    setComponents([{ id: crypto.randomUUID(), itemId: '', quantityKg: 0 }])
    setEditingListId(null)
    setScaleListId('')
    setScaleMultiplier(1)
    setSelectedCatalogId(null)
    setEditorOpen(false)
    setNewItemClass('MP')
    setNewItemCode('')
    setNewItemName('')
    setNewItemType('')
    setNewTargetCode('')
    setNewTargetName('')
    setNewTargetType('')
    setView('formulator')
    setSaveState('idle')
  }

  function addScaleSelection() {
    setScaleSelections([...scaleSelections, { id: crypto.randomUUID(), listId: lists[0]?.id ?? '', multiplier: 1 }])
  }

  function updateScaleSelection(id: string, patch: Partial<Omit<ScaleSelection, 'id'>>) {
    setScaleSelections(scaleSelections.map((selection) => selection.id === id ? { ...selection, ...patch } : selection))
  }

  function removeScaleSelection(id: string) {
    setScaleSelections(scaleSelections.length > 1 ? scaleSelections.filter((selection) => selection.id !== id) : [{ id: crypto.randomUUID(), listId: '', multiplier: 1 }])
  }

  function startNewList() {
    setEditingListId(null)
    setTargetId('')
    setComponents([{ id: crypto.randomUUID(), itemId: '', quantityKg: 0 }])
    setSaveState('idle')
  }

  async function createCatalogItem() {
    if (role !== 'admin') return
    const name = newItemName.trim()
    const externalCode = newItemCode.trim() || nextCatalogInternalId(catalogWithArchived, newItemClass)
    if (!name) {
      window.alert('El nombre del insumo/producto es obligatorio.')
      return
    }
    const item: CatalogItem = {
      internalId: nextCatalogInternalId(catalogWithArchived, newItemClass),
      externalCode,
      originalCode: externalCode,
      name,
      class: newItemClass,
      type: newItemType.trim(),
      origin: 'manual',
      composition: emptyComposition(),
    }
    setSaveState('saving')
    try {
      if (usingConvex) {
        await createRemoteCatalogItem({ item, actor: { id: 'local', role }, reason: 'Creacion manual desde UI local' })
      } else {
        setLocalCatalog([...catalogWithArchived, item])
      }
      setSelectedCatalogId(item.internalId)
      setEditorOpen(true)
      setNewItemCode('')
      setNewItemName('')
      setNewItemType('')
      setSaveState('saved')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo crear el item.')
      setSaveState('error')
    }
  }

  async function createTargetProduct() {
    if (role !== 'admin') {
      window.alert('Cambia a Admin local para crear productos objetivo.')
      return
    }
    const name = newTargetName.trim()
    if (!name) {
      window.alert('El nombre del producto objetivo es obligatorio.')
      return
    }
    const externalCode = newTargetCode.trim() || nextCatalogInternalId(catalogWithArchived, 'PT')
    const item: CatalogItem = {
      internalId: nextCatalogInternalId(catalogWithArchived, 'PT'),
      externalCode,
      originalCode: externalCode,
      name,
      class: 'PT',
      type: newTargetType.trim(),
      origin: 'manual',
      composition: emptyComposition(),
    }
    setSaveState('saving')
    try {
      if (usingConvex) {
        await createRemoteCatalogItem({ item, actor: { id: 'local', role }, reason: 'Creacion de producto objetivo para verificacion' })
      } else {
        setLocalCatalog([...catalogWithArchived, item])
      }
      setTargetId(item.internalId)
      setSelectedCatalogId(item.internalId)
      setEditorOpen(true)
      setView('catalog')
      setNewTargetCode('')
      setNewTargetName('')
      setNewTargetType('')
      setSaveState('saved')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo crear el producto objetivo.')
      setSaveState('error')
    }
  }

  function getCompositionInputValue(item: CatalogItem, nutrient: NutrientKey) {
    const rawVal = compositionDrafts[item.internalId]?.[nutrient] ?? String(item.composition[nutrient])
    const num = Number(rawVal)
    if (rawVal === '0' || rawVal === '0.00' || (Number.isFinite(num) && num === 0 && rawVal !== '0.' && rawVal !== '0.0')) {
      return ''
    }
    return rawVal
  }

  function updateComposition(item: CatalogItem, nutrient: NutrientKey, rawValue: string) {
    if (role !== 'admin' && item.class !== 'MP') return
    setCompositionDrafts((drafts) => ({
      ...drafts,
      [item.internalId]: {
        ...drafts[item.internalId],
        [nutrient]: rawValue,
      },
    }))

    const value = Number(rawValue)
    if (!Number.isFinite(value)) return
    if (rawValue.endsWith('.') || rawValue === '-') return
    const roundedValue = Math.round(value * 10000) / 10000
    const before = item.composition[nutrient]
    if (before === roundedValue) return
    pendingCompositionValues.current[item.internalId] = {
      ...pendingCompositionValues.current[item.internalId],
      [nutrient]: roundedValue,
    }
    liveCompositionValues.current[item.internalId] = {
      ...(liveCompositionValues.current[item.internalId] ?? item.composition),
      [nutrient]: roundedValue,
    }

    const timerKey = `${item.internalId}.${nutrient}`
    window.clearTimeout(compositionSaveTimers.current[timerKey])
    compositionSaveTimers.current[timerKey] = window.setTimeout(async () => {
      setSaveState('saving')
      try {
        const nextComposition = liveCompositionValues.current[item.internalId] ?? item.composition
        if (usingConvex) {
          await updateRemoteComposition({
            internalId: item.internalId,
            composition: nextComposition,
            actor: { id: 'local', role },
            reason: 'Edicion de composicion desde UI',
          })
        } else {
          setLocalCatalog(
            catalog.map((catalogItem) =>
              catalogItem.internalId === item.internalId
                ? { ...catalogItem, composition: nextComposition }
                : catalogItem,
            ),
          )
          const change: CatalogChange = {
            id: crypto.randomUUID(),
            itemInternalId: item.internalId,
            itemName: item.name,
            changedAt: Date.now(),
            actor: role,
            field: `composition.${nutrient}`,
            before,
            after: roundedValue,
            origin: 'catalog.detail_edit',
          }
          setLocalCatalogChanges([change, ...catalogChanges].slice(0, 200))
        }
        setCompositionDrafts((drafts) => {
          const itemDraft = { ...drafts[item.internalId] }
          delete itemDraft[nutrient]
          return {
            ...drafts,
            [item.internalId]: itemDraft,
          }
        })
        delete pendingCompositionValues.current[item.internalId]?.[nutrient]
        setSaveState('saved')
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'No se pudo guardar la composicion.')
        setSaveState('error')
      }
    }, 450)
  }

  async function archiveItem(item: CatalogItem) {
    if (role !== 'admin') return
    const appearsInLiveLists = lists.some((list) => list.components.some((component) => component.itemId === item.internalId))
    if (appearsInLiveLists && !window.confirm('Este item aparece en listas guardadas. Se archivara sin alterar el catalogo de listas.')) return
    setSaveState('saving')
    try {
      if (usingConvex) {
        await archiveRemoteItem({ internalId: item.internalId, actor: { id: 'local', role }, reason: 'Archivado desde UI' })
      } else {
        setLocalCatalog(catalogWithArchived.map((catalogItem) => (catalogItem.internalId === item.internalId ? { ...catalogItem, archivedAt: Date.now() } : catalogItem)))
      }
      setSaveState('saved')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo archivar el item.')
      setSaveState('error')
    }
  }

  async function saveList() {
    setSaveState('saving')
    const now = Date.now()
    const liveId = editingListId ?? crypto.randomUUID()
    const existing = lists.find((list) => list.id === liveId)
    const displayCode = existing?.displayCode ?? createDisplayCode(target, lists)
    const liveList: ProductList = {
      id: liveId,
      displayCode,
      targetProductId: target?.internalId ?? null,
      components,
      updatedAt: now,
    }
    const version = `v${snapshots.filter((snapshot) => snapshot.productListId === liveId).length + 1}`
    const snapshot: Snapshot = {
      id: crypto.randomUUID(),
      productListId: liveId,
      displayCode,
      snapshotVersion: version,
      targetProductId: target?.internalId ?? null,
      frozenTarget: target,
      frozenComponents: resolvedComponents,
      summary,
      createdAt: now,
      actor: role,
    }
    try {
      if (usingConvex) {
        const result = await saveRemoteList({
          productListId: editingListId ? (editingListId as never) : undefined,
          displayCode,
          targetProductId: target?.internalId,
          components: components
            .filter((component) => component.itemId)
            .map((component) => ({ itemInternalId: component.itemId, quantityKg: component.quantityKg })),
          actor: { id: 'local', role },
        })
        setEditingListId(String(result.productListId))
      } else {
        setLocalLists(existing ? lists.map((list) => (list.id === liveId ? liveList : list)) : [liveList, ...lists])
        setLocalSnapshots([snapshot, ...snapshots])
        setEditingListId(liveId)
      }
      window.setTimeout(() => setSaveState('saved'), 200)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo guardar la lista.')
      setSaveState('error')
    }
  }

  function loadList(list: ProductList) {
    setEditingListId(list.id)
    setScaleListId(list.id)
    setTargetId(list.targetProductId ?? '')
    setComponents(list.components.length > 0 ? list.components : [{ id: crypto.randomUUID(), itemId: '', quantityKg: 0 }])
    loadedListSignature.current = JSON.stringify({ targetId: list.targetProductId ?? '', components: list.components.map((component) => ({ itemId: component.itemId, quantityKg: component.quantityKg })) })
    setView('formulator')
  }

  async function cloneListFromHistory(snapshot: Snapshot) {
    const liveList = lists.find((list) => list.id === snapshot.productListId)
    const sourceTargetId = liveList?.targetProductId ?? snapshot.targetProductId
    const cloneTarget = sourceTargetId ? activeCatalog.find((item) => item.internalId === sourceTargetId && item.class === 'PT') ?? null : null
    const sourceComponents = liveList?.components ?? snapshot.frozenComponents.map((component) => ({
      id: crypto.randomUUID(),
      itemId: component.item.internalId,
      quantityKg: component.quantityKg,
    }))
    const cloneComponents = sourceComponents
      .filter((component) => activeCatalog.some((item) => item.internalId === component.itemId))
      .map((component) => ({ ...component, id: crypto.randomUUID() }))

    if (sourceComponents.length > 0 && cloneComponents.length === 0) {
      window.alert('No se pudo clonar: los componentes de la lista no existen en el catalogo activo.')
      return
    }

    const now = Date.now()
    const cloneId = crypto.randomUUID()
    const displayCode = createDisplayCode(cloneTarget, lists)
    setSaveState('saving')
    try {
      if (usingConvex) {
        const result = await saveRemoteList({
          displayCode,
          targetProductId: cloneTarget?.internalId,
          components: cloneComponents.map((component) => ({ itemInternalId: component.itemId, quantityKg: component.quantityKg })),
          actor: { id: 'local', role },
        })
        const clonedListId = String(result.productListId)
        setEditingListId(clonedListId)
        setScaleListId(clonedListId)
      } else {
        const clonedList: ProductList = {
          id: cloneId,
          displayCode,
          targetProductId: cloneTarget?.internalId ?? null,
          components: cloneComponents,
          updatedAt: now,
        }
        const frozenComponents = cloneComponents
          .map((component) => {
            const item = activeCatalog.find((catalogItem) => catalogItem.internalId === component.itemId)
            return item ? { item, quantityKg: component.quantityKg } : null
          })
          .filter(Boolean) as FormulaComponentInput[]
        const cloneSummary = summarizeFormula(frozenComponents, cloneTarget)
        setLocalLists([clonedList, ...lists])
        setLocalSnapshots([{
          id: crypto.randomUUID(),
          productListId: cloneId,
          displayCode,
          snapshotVersion: 'v1',
          targetProductId: cloneTarget?.internalId ?? null,
          frozenTarget: cloneTarget,
          frozenComponents,
          summary: cloneSummary,
          createdAt: now,
          actor: role,
        }, ...snapshots])
        setEditingListId(cloneId)
        setScaleListId(cloneId)
      }
      setTargetId(cloneTarget?.internalId ?? '')
      setComponents(cloneComponents.length > 0 ? cloneComponents : [{ id: crypto.randomUUID(), itemId: '', quantityKg: 0 }])
      loadedListSignature.current = JSON.stringify({ targetId: cloneTarget?.internalId ?? '', components: cloneComponents.map((component) => ({ itemId: component.itemId, quantityKg: component.quantityKg })) })
      setView('formulator')
      setSaveState('saved')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo clonar la lista.')
      setSaveState('error')
    }
  }

  async function deleteListFromHistory(snapshot: Snapshot) {
    const confirmed = window.confirm(`Eliminar la lista ${snapshot.displayCode}? Se ocultara de listas guardadas y del catalogo de listas, pero el registro queda archivado.`)
    if (!confirmed) return

    setSaveState('saving')
    try {
      if (usingConvex) {
        await archiveRemoteLiveList({ productListId: snapshot.productListId as never })
      } else {
        setLocalLists(lists.filter((list) => list.id !== snapshot.productListId))
        setLocalSnapshots(snapshots.filter((item) => item.productListId !== snapshot.productListId))
      }
      if (editingListId === snapshot.productListId) {
        setEditingListId(null)
        setScaleListId('')
      }
      setSaveState('saved')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo eliminar la lista.')
      setSaveState('error')
    }
  }

  function exportLists(format: 'csv' | 'json') {
    if (lists.length === 0) {
      window.alert('No hay listas guardadas para exportar.')
      return
    }
    const stamp = exportStamp()
    if (format === 'csv') {
      downloadTextFile(exportLiveListsCsv(lists, catalog), `cfq-listas-guardadas-${stamp}.csv`, 'text/csv;charset=utf-8')
      return
    }
    downloadTextFile(exportLiveListsJson(lists, catalog), `cfq-listas-guardadas-${stamp}.json`, 'application/json;charset=utf-8')
  }

  function exportSnapshotHistory(format: 'csv' | 'json') {
    if (snapshots.length === 0) {
      window.alert('No hay listas en el catalogo para exportar.')
      return
    }
    const stamp = exportStamp()
    if (format === 'csv') {
      downloadTextFile(exportSnapshotsCsv(snapshots), `cfq-catalogo-listas-${stamp}.csv`, 'text/csv;charset=utf-8')
      return
    }
    downloadTextFile(exportSnapshotsJson(snapshots), `cfq-catalogo-listas-${stamp}.json`, 'application/json;charset=utf-8')
  }

  function exportCatalog() {
    if (activeCatalog.length === 0) {
      window.alert('No hay productos activos en el catalogo para exportar.')
      return
    }
    downloadTextFile(exportCatalogCsv(activeCatalog), `cfq-catalogo-productos-${exportStamp()}.csv`, 'text/csv;charset=utf-8')
  }

  async function previewListImport(file: File | null) {
    if (!file) return
    const text = await file.text()
    setImportFileName(file.name)
    setImportResult(parseListImportCsv(text, activeCatalog))
  }

  const title = view === 'catalog'
    ? 'Catalogo unificado'
    : view === 'history'
      ? 'Catalogo de listas'
      : view === 'import'
        ? 'Importacion futura'
        : view === 'scale'
          ? 'Preparacion por multiplicador'
          : 'Lista de formulacion'

  return (
    <main className={`app-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <aside className="sidebar">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} title={sidebarOpen ? 'Contraer menu' : 'Expandir menu'}>
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
        <div className="brand">
          <span className="brand-mark">CFQ</span>
          <div>
            <strong>Formulador SGC</strong>
            <small>Catalogo y listas guardadas</small>
          </div>
        </div>
        <nav>
          <button className={view === 'formulator' ? 'active' : ''} onClick={() => setView('formulator')} title="Formular"><Beaker size={18} /> <span>Formular</span></button>
          <button className={view === 'scale' ? 'active' : ''} onClick={() => setView('scale')} title="Preparar"><Calculator size={18} /> <span>Preparar</span></button>
          <button className={view === 'catalog' ? 'active' : ''} onClick={() => setView('catalog')} title="Catalogo"><Database size={18} /> <span>Catalogo</span></button>
          <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')} title="Catalogo de listas"><History size={18} /> <span>Listas</span></button>
          <button className={view === 'import' ? 'active' : ''} onClick={() => setView('import')} title="Importar"><FileUp size={18} /> <span>Importar</span></button>
        </nav>
        <div className="role-box">
          <Shield size={18} />
          <span>{role === 'admin' ? 'Admin local' : 'Usuario normal'}</span>
          <button onClick={() => setRole(role === 'admin' ? 'user' : 'admin')} title="Cambiar rol"><UserCog size={16} /> <span>Cambiar</span></button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p>Base fija 1000 kg, IDs internos no editables y recalculo contra catalogo vigente.</p>
          </div>
          <div className="topbar-actions">
            <button className="danger" onClick={clearLocalData}><RotateCcw size={16} /> Limpiar local</button>
            <div className={`save-pill ${saveState}`}>{saveState === 'saving' ? 'Guardando' : saveState === 'error' ? 'Error' : saveState === 'saved' ? 'Guardado' : 'Listo'}</div>
          </div>
        </header>

        {catalog.length === 0 ? (
          <section className="empty-panel">
            <Database size={30} />
            <h2>Cargar catalogo base</h2>
            <p>La carga inicial lee `mp-pt_mzr.csv` y solo se habilita cuando Convex/local esta vacio.</p>
            <button className="primary" onClick={seedCatalog}>Cargar CSV base</button>
          </section>
        ) : view === 'catalog' ? (
          <section className="catalog-layout">
            <div className="panel">
              <div className="toolbar">
                <div className="search"><Search size={17} /><CatalogSearchCombobox value={query} items={activeCatalog} onChange={setQuery} placeholder="Buscar por codigo, nombre o tipo" /></div>
                <select value={classFilter} onChange={(event) => setClassFilter(event.target.value as typeof classFilter)}>
                  <option value="ALL">Todas las clases</option>
                  <option value="MP">MP</option>
                  <option value="PT">PT</option>
                  <option value="MZR">MZR</option>
                </select>
              </div>
              <div className="catalog-stats">
                <span><strong>{activeCatalog.filter((item) => item.class === 'MP').length}</strong> MP</span>
                <span><strong>{activeCatalog.filter((item) => item.class === 'PT').length}</strong> PT</span>
                <span><strong>{activeCatalog.filter((item) => item.class === 'MZR').length}</strong> MZR</span>
                <button className="secondary" onClick={exportCatalog}><Download size={17} /> Exportar CSV</button>
              </div>
              <div className="create-catalog-item">
                <select value={newItemClass} disabled={role !== 'admin'} onChange={(event) => setNewItemClass(event.target.value as CatalogClass)}>
                  <option value="MP">MP</option>
                  <option value="PT">PT</option>
                  <option value="MZR">MZR</option>
                </select>
                <input value={newItemCode} disabled={role !== 'admin'} onChange={(event) => setNewItemCode(event.target.value)} placeholder="COD / codigo original" />
                <input value={newItemName} disabled={role !== 'admin'} onChange={(event) => setNewItemName(event.target.value)} placeholder="Nombre del insumo o producto" />
                <input value={newItemType} disabled={role !== 'admin'} onChange={(event) => setNewItemType(event.target.value)} placeholder="Tipo" />
                <button className="primary" disabled={role !== 'admin'} onClick={createCatalogItem}>Crear</button>
              </div>
              <div className="catalog-table">
                <div className="table-head"><span>ID</span><span>Clase</span><span>Producto</span><span>N</span><span>P</span><span>K</span><span></span></div>
                {filteredCatalog.map((item) => {
                  const canEdit = role === 'admin' || item.class === 'MP'
                  return (
                    <div className={`table-row ${selectedCatalogId === item.internalId ? 'selected' : ''}`} key={item.internalId}>
                      <span><strong>{item.internalId}</strong><small>COD {item.externalCode}</small></span>
                      <span className={`class-badge ${item.class}`}>{item.class}</span>
                      <span>{item.name}<small>{item.type || 'Sin tipo'} · origen {item.origin}</small></span>
                      {(['N', 'P', 'K'] as NutrientKey[]).map((nutrient) => (
                        <input
                          key={nutrient}
                          disabled={!canEdit}
                          value={getCompositionInputValue(item, nutrient)}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => updateComposition(item, nutrient, event.target.value)}
                        />
                      ))}
                      <div className="row-actions">
                        <button onClick={() => { setSelectedCatalogId(item.internalId); setEditorOpen(true) }} title="Editar detalle"><Pencil size={16} /></button>
                        <button disabled={role !== 'admin'} onClick={() => archiveItem(item)} title="Archivar"><Archive size={16} /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="panel global-changes">
              <div className="section-title">
                <h2>Auditoria global reciente</h2>
                <small>{catalogChanges.length} cambios locales retenidos</small>
              </div>
              <div className="change-table">
                {catalogChanges.slice(0, 18).map((change) => (
                  <div className="change-table-row" key={change.id}>
                    <span><strong>{change.itemInternalId}</strong><small>{change.itemName}</small></span>
                    <span>{formatCompositionField(change.field)}</span>
                    <span>{change.before} {'->'} {change.after}</span>
                    <small>{new Date(change.changedAt).toLocaleString()} · {change.actor}</small>
                  </div>
                ))}
                {catalogChanges.length === 0 && <p className="muted">Sin cambios de catalogo registrados todavia.</p>}
              </div>
            </div>

            {editorOpen && (
              <aside className="detail-drawer">
                <div className="panel detail-panel">
                  {selectedCatalogItem ? (
                <>
                  <div className="detail-head">
                    <div>
                      <strong>{selectedCatalogItem.internalId}</strong>
                      <small>{selectedCatalogItem.name} · COD {selectedCatalogItem.originalCode}</small>
                    </div>
                    <button className="icon-button" onClick={() => setEditorOpen(false)}><X size={16} /></button>
                  </div>
                  <div className="permission-note">
                    {role === 'admin' || selectedCatalogItem.class === 'MP'
                      ? 'Edicion habilitada. Las composiciones se guardan hasta 4 decimales.'
                      : 'Usuario normal: solo lectura para PT/MZR.'}
                  </div>
                  <div className="composition-editor">
                    {NUTRIENTS.map((nutrient) => (
                      <label key={nutrient}>
                        <span>{canonicalNutrientLabel(nutrient)}</span>
                        <input
                          type="number"
                          step="0.0001"
                          disabled={role !== 'admin' && selectedCatalogItem.class !== 'MP'}
                          value={getCompositionInputValue(selectedCatalogItem, nutrient)}
                          onChange={(event) => updateComposition(selectedCatalogItem, nutrient, event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="change-log">
                    <h3><ListChecks size={16} /> Cambios recientes</h3>
                    {catalogChanges.filter((change) => change.itemInternalId === selectedCatalogItem.internalId).slice(0, 8).map((change) => (
                      <div className="change-row" key={change.id}>
                        <strong>{formatCompositionField(change.field)}</strong>
                        <span>{change.before} {'->'} {change.after}</span>
                        <small>{new Date(change.changedAt).toLocaleString()} · {change.actor}</small>
                      </div>
                    ))}
                    {catalogChanges.filter((change) => change.itemInternalId === selectedCatalogItem.internalId).length === 0 && <p className="muted">Sin cambios registrados para este item.</p>}
                  </div>
                  </>
                ) : (
                <div className="empty-detail">
                  <Database size={26} />
                  <p>Selecciona un item para editar los 20 nutrientes y ver auditoria local.</p>
                </div>
                )}
                </div>
              </aside>
            )}
          </section>
        ) : view === 'formulator' ? (
          <section className="form-grid">
            <div className="panel">
              <div className="section-title">
                <h2>Objetivo y componentes</h2>
                <div className="form-actions">
                  <button className="secondary" onClick={startNewList}><Plus size={17} /> Nueva lista</button>
                  <button className="secondary" onClick={() => exportLists('csv')}><Download size={17} /> CSV</button>
                  <button className="secondary" onClick={() => exportLists('json')}><Download size={17} /> JSON</button>
                  <button className="primary" onClick={saveList}><Save size={17} /> Guardar snapshot</button>
                </div>
              </div>
              <label className="field">Producto objetivo opcional
                <CatalogCombobox
                  value={targetId}
                  items={activeCatalog.filter((item) => item.class === 'PT')}
                  onChange={setTargetId}
                  placeholder="Escribe codigo o nombre; vacio = SIN_OBJETIVO"
                />
              </label>
              <div className="target-create">
                <div className="target-create-header">
                  <strong>Nuevo producto objetivo</strong>
                  <small>Se crea como PT manual para declarar nutrientes y verificar cumplimiento.</small>
                </div>
                <div className="target-create-fields">
                  <input value={newTargetCode} disabled={role !== 'admin'} onChange={(event) => setNewTargetCode(event.target.value)} placeholder="COD opcional" />
                  <input value={newTargetName} disabled={role !== 'admin'} onChange={(event) => setNewTargetName(event.target.value)} placeholder="Nombre del producto nuevo" />
                  <input value={newTargetType} disabled={role !== 'admin'} onChange={(event) => setNewTargetType(event.target.value)} placeholder="Tipo" />
                  <button className="secondary" disabled={role !== 'admin'} onClick={createTargetProduct}><PackagePlus size={17} /> Crear PT</button>
                </div>
              </div>
              <div className="component-list">
                {components.map((component, index) => (
                  <div className="component-row" key={component.id}>
                    <span>{index + 1}</span>
                    <CatalogCombobox
                      value={component.itemId}
                      items={activeCatalog}
                      onChange={(value) => setComponents(components.map((row) => row.id === component.id ? { ...row, itemId: value } : row))}
                      placeholder="Seleccionar MP/PT/MZR"
                    />
                    <input type="number" step="0.01" value={component.quantityKg || ''} onChange={(event) => setComponents(components.map((row) => row.id === component.id ? { ...row, quantityKg: Number(event.target.value) } : row))} placeholder="kg" />
                    <button onClick={() => setComponents(components.filter((row) => row.id !== component.id))}>Quitar</button>
                  </div>
                ))}
              </div>
              <button className="secondary" onClick={() => setComponents([...components, { id: crypto.randomUUID(), itemId: '', quantityKg: 0 }])}>Agregar componente</button>
            </div>
            <div className="panel result-panel">
              <div className="status-strip" data-status={summary.evaluation.generalStatus}>
                <div>
                  <strong>
                    {summary.evaluation.generalStatus === 'CUMPLE' ? '✓ Cumple' :
                     summary.evaluation.generalStatus === 'NO_CUMPLE' ? '✕ No cumple' :
                     summary.evaluation.generalStatus === 'CUMPLE_S' ? '⚠ Cumple con exceso' :
                     'Sin objetivo'}
                  </strong>
                  <small>Grado {formatGrade(summary.composition)}</small>
                  {target && <small>Objetivo {formatGrade(target.composition)}</small>}
                </div>
                <span>{summary.totalKg.toFixed(2)} kg / 1000 kg</span>
              </div>
              {summary.alerts.map((alert) => <div className="alert" key={alert}>{alert}</div>)}

              {/* ── NPK Hero Cards ─── */}
              <div className="npk-hero">
                {(['N', 'P', 'K'] as const).map((nutrient) => {
                  const evaluation = summary.evaluation.evaluations.find((item) => item.nutrient === nutrient)
                  const color = nutrient === 'N' ? '#16a34a' : nutrient === 'P' ? '#d97706' : '#2563eb'
                  const label = nutrient === 'N' ? 'Nitrógeno (N)' : nutrient === 'P' ? 'Fósforo (P₂O₅)' : 'Potasio (K₂O)'
                  const pct = evaluation && evaluation.declared > 0 ? Math.min((evaluation.calculated / evaluation.declared) * 100, 150) : 0
                  return (
                    <div className="npk-hero-card" key={nutrient} style={{ '--npk-color': color } as React.CSSProperties}>
                      <div className="npk-label">{label}</div>
                      <div className="npk-value">{formatPct(summary.composition[nutrient])}</div>
                      {evaluation && evaluation.declared > 0 && (
                        <>
                          <div className="npk-target">Objetivo: {formatPct(evaluation.declared)} · {formatPct(evaluation.min)}–{formatPct(evaluation.max)}</div>
                          <div className="npk-bar"><div className="npk-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                          <em className={evaluation.status} style={{ justifySelf: 'start', fontStyle: 'normal', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, marginTop: 4, letterSpacing: '.02em', background: evaluation.status === 'C' ? '#dcfce7' : evaluation.status === 'NC' ? '#fee2e2' : '#fef3c7', color: evaluation.status === 'C' ? '#166534' : evaluation.status === 'NC' ? '#991b1b' : '#92400e' }}>{evaluation.status === 'C' ? '✓ Conforme' : evaluation.status === 'NC' ? '✕ No conforme' : '⚠ Supera'}</em>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ── Formas de N ─── */}
              {(() => {
                const nForms = (['N_NH4', 'N_NO3', 'N_org', 'N_ur'] as const).filter((n) => summary.composition[n] > 0 || (summary.evaluation.evaluations.find((e) => e.nutrient === n)?.declared ?? 0) > 0)
                if (nForms.length === 0) return null
                return (
                  <>
                    <div className="nutrient-section-title">Formas de nitrógeno</div>
                    <div className="nutrient-grid">
                      {nForms.map((nutrient) => {
                        const evaluation = summary.evaluation.evaluations.find((item) => item.nutrient === nutrient)
                        const val = summary.composition[nutrient]
                        return (
                          <div className={`nutrient-card${val === 0 ? ' zero-value' : ' has-value'}`} key={nutrient}>
                            <span>{canonicalNutrientLabel(nutrient)}</span>
                            <strong>{formatPct(val)}</strong>
                            {evaluation && evaluation.declared > 0 && (
                              <dl>
                                <div><dt>Obj</dt><dd>{formatPct(evaluation.declared)}</dd></div>
                                <div><dt>Rango</dt><dd>{formatPct(evaluation.min)}–{formatPct(evaluation.max)}</dd></div>
                              </dl>
                            )}
                            {evaluation && <em className={evaluation.status}>{evaluation.status}</em>}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )
              })()}

              {/* ── Secundarios ─── */}
              {(() => {
                const secondaries = (['C', 'CaO', 'MgO', 'S', 'SiO2'] as const).filter((n) => summary.composition[n] > 0 || (summary.evaluation.evaluations.find((e) => e.nutrient === n)?.declared ?? 0) > 0)
                if (secondaries.length === 0) return null
                return (
                  <>
                    <div className="nutrient-section-title">Secundarios</div>
                    <div className="nutrient-grid">
                      {secondaries.map((nutrient) => {
                        const evaluation = summary.evaluation.evaluations.find((item) => item.nutrient === nutrient)
                        const val = summary.composition[nutrient]
                        return (
                          <div className={`nutrient-card${val === 0 ? ' zero-value' : ' has-value'}`} key={nutrient}>
                            <span>{canonicalNutrientLabel(nutrient)}</span>
                            <strong>{formatPct(val)}</strong>
                            {evaluation && evaluation.declared > 0 && (
                              <dl>
                                <div><dt>Obj</dt><dd>{formatPct(evaluation.declared)}</dd></div>
                                <div><dt>Rango</dt><dd>{formatPct(evaluation.min)}–{formatPct(evaluation.max)}</dd></div>
                              </dl>
                            )}
                            {evaluation && <em className={evaluation.status}>{evaluation.status}</em>}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )
              })()}

              {/* ── Micronutrientes ─── */}
              {(() => {
                const micros = (['B', 'Co', 'Cu', 'Fe', 'Mn', 'Mo', 'Zn', 'Na'] as const).filter((n) => summary.composition[n] > 0 || (summary.evaluation.evaluations.find((e) => e.nutrient === n)?.declared ?? 0) > 0)
                if (micros.length === 0) return null
                return (
                  <>
                    <div className="nutrient-section-title">Micronutrientes</div>
                    <div className="nutrient-grid">
                      {micros.map((nutrient) => {
                        const evaluation = summary.evaluation.evaluations.find((item) => item.nutrient === nutrient)
                        const val = summary.composition[nutrient]
                        return (
                          <div className={`nutrient-card${val === 0 ? ' zero-value' : ' has-value'}`} key={nutrient}>
                            <span>{canonicalNutrientLabel(nutrient)}</span>
                            <strong>{formatPct(val)}</strong>
                            {evaluation && evaluation.declared > 0 && (
                              <dl>
                                <div><dt>Obj</dt><dd>{formatPct(evaluation.declared)}</dd></div>
                                <div><dt>Rango</dt><dd>{formatPct(evaluation.min)}–{formatPct(evaluation.max)}</dd></div>
                              </dl>
                            )}
                            {evaluation && <em className={evaluation.status}>{evaluation.status}</em>}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )
              })()}
            </div>
            <div className="panel contribution-panel">
              <div className="section-title">
                <h2>Contribucion por insumo</h2>
                <small>Aporte de cada componente al grado final sobre base 1000 kg.</small>
              </div>
              {componentContributions.length > 0 ? (
                <div className="contribution-table-wrap">
                  <table className="contribution-table">
                    <thead>
                      <tr>
                        <th>Insumo</th>
                        <th>kg</th>
                        {contributionNutrients.map((nutrient) => <th key={nutrient}>{canonicalNutrientLabel(nutrient)}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {componentContributions.map((row, index) => (
                        <tr key={`${row.item.internalId}-${index}`}>
                          <td><strong>{row.item.internalId}</strong><small>{row.item.name}</small></td>
                          <td>{row.quantityKg.toFixed(2)}</td>
                          {contributionNutrients.map((nutrient) => <td key={nutrient}>{formatPct(row.contribution[nutrient])}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="muted">Selecciona insumos para ver su aporte por elemento.</p>}
            </div>
          </section>
        ) : view === 'scale' ? (
          <section className="scale-grid">
            <div className="panel">
              <div className="section-title">
                <h2>Lista y cantidad a preparar</h2>
              </div>
              <label className="field">Lista guardada
                <select value={selectedScaleList?.id ?? ''} onChange={(event) => setScaleListId(event.target.value)}>
                  {lists.length === 0 && <option value="">No hay listas guardadas</option>}
                  {lists.map((list) => {
                    const listTarget = list.targetProductId ? activeCatalog.find((item) => item.internalId === list.targetProductId) : null
                    return <option key={list.id} value={list.id}>{list.displayCode} · {listTarget?.name ?? 'SIN_OBJETIVO'}</option>
                  })}
                </select>
              </label>
              <label className="field">Multiplicador
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={scaleMultiplier || ''}
                  onChange={(event) => setScaleMultiplier(Number(event.target.value))}
                  placeholder="Ej: 2.5"
                />
              </label>
              <div className="scale-summary">
                <span><strong>{formatKg(scaleBaseKg)}</strong><small>kg base de la lista</small></span>
                <span><strong>x {formatKg(safeScaleMultiplier)}</strong><small>multiplicador</small></span>
                <span><strong>{formatKg(scaledTotalKg)}</strong><small>kg total a preparar</small></span>
              </div>
                <p className="muted">Si la lista base esta en 1 kg, 1 tonelada o 1000 kg, solo ingresa el factor correspondiente. El calculo no cambia porcentajes ni guarda versiones nuevas.</p>
            </div>
            <div className="panel">
              <div className="section-title">
                <h2>Cantidades escaladas</h2>
                {selectedScaleList && <button className="secondary" onClick={() => loadList(selectedScaleList)}>Abrir en formulador</button>}
              </div>
              {selectedScaleList ? (
                <div className="scale-table-wrap">
                  <div className="scale-context">
                    <strong>{selectedScaleList.displayCode}</strong>
                    <small>{selectedScaleTarget?.name ?? 'SIN_OBJETIVO'} · actualizado {new Date(selectedScaleList.updatedAt).toLocaleString()}</small>
                  </div>
                  <table className="contribution-table scale-table">
                    <thead>
                      <tr>
                        <th>Insumo</th>
                        <th>Clase</th>
                        <th>Cantidad base</th>
                        <th>Total preparar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedScaleComponents ?? []).map(({ component, item }, index) => {
                        const scaledQuantity = Math.max(0, component.quantityKg) * safeScaleMultiplier
                        return (
                          <tr key={`${component.id}-${index}`}>
                            <td><strong>{item.internalId}</strong><small>{item.name}</small></td>
                            <td>{item.class}</td>
                            <td>{formatKg(component.quantityKg)} kg</td>
                            <td><strong>{formatKg(scaledQuantity)} kg</strong></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {(selectedScaleComponents ?? []).length === 0 && <p className="muted">La lista seleccionada no tiene componentes validos contra el catalogo activo.</p>}
                </div>
              ) : <p className="muted">Guarda una lista para poder escalar cantidades.</p>}
            </div>
            <div className="panel scale-total-panel">
              <div className="section-title">
                <h2>Total por insumo</h2>
                <button className="secondary" onClick={addScaleSelection} disabled={lists.length === 0}><Plus size={17} /> Agregar lista</button>
              </div>
              <div className="scale-selection-list">
                {scaleSelections.map((selection, index) => {
                  const selectedList = lists.find((list) => list.id === selection.listId)
                  const baseKg = selectedList?.components.reduce((sum, component) => sum + Math.max(0, component.quantityKg), 0) ?? 0
                  const multiplier = Number.isFinite(selection.multiplier) && selection.multiplier > 0 ? selection.multiplier : 0
                  return (
                    <div className="scale-selection-row" key={selection.id}>
                      <label className="field">Lista {index + 1}
                        <select value={selection.listId} onChange={(event) => updateScaleSelection(selection.id, { listId: event.target.value })}>
                          {lists.length === 0 && <option value="">No hay listas guardadas</option>}
                          {lists.map((list) => {
                            const listTarget = list.targetProductId ? activeCatalog.find((item) => item.internalId === list.targetProductId) : null
                            return <option key={list.id} value={list.id}>{list.displayCode} · {listTarget?.name ?? 'SIN_OBJETIVO'}</option>
                          })}
                        </select>
                      </label>
                      <label className="field">Multiplicador
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={selection.multiplier || ''}
                          onChange={(event) => updateScaleSelection(selection.id, { multiplier: Number(event.target.value) })}
                          placeholder="Ej: 3"
                        />
                      </label>
                      <span className="selection-total"><strong>{formatKg(baseKg * multiplier)} kg</strong><small>a preparar</small></span>
                      <button className="secondary icon-only" onClick={() => removeScaleSelection(selection.id)} aria-label="Quitar lista"><X size={17} /></button>
                    </div>
                  )
                })}
              </div>
              <div className="scale-summary scale-total-summary">
                <span><strong>{scaleSelections.filter((selection) => selection.listId).length}</strong><small>listas incluidas</small></span>
                <span><strong>{formatKg(selectedRequirementsTotalKg)} kg</strong><small>total de insumos</small></span>
              </div>
              {selectedRequirements.length > 0 ? (
                <div className="scale-table-wrap">
                  <table className="contribution-table scale-table">
                    <thead>
                      <tr>
                        <th>Insumo</th>
                        <th>Clase</th>
                        <th>Total requerido</th>
                        <th>Viene de</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequirements.map((requirement) => (
                        <tr key={requirement.item.internalId}>
                          <td><strong>{requirement.item.internalId}</strong><small>{requirement.item.name}</small></td>
                          <td>{requirement.item.class}</td>
                          <td><strong>{formatKg(requirement.totalKg)} kg</strong></td>
                          <td>{requirement.sources.map((source) => `${source.displayCode}: ${formatKg(source.quantityKg)} kg`).join(' · ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="muted">Selecciona una o varias listas guardadas para consolidar la necesidad total de MP por insumo.</p>}
            </div>
          </section>
        ) : view === 'history' ? (
          <section className="panel">
            <div className="section-title">
              <h2>Catalogo de listas</h2>
              <div className="form-actions">
                <button className="secondary" onClick={() => exportSnapshotHistory('csv')}><Download size={17} /> CSV</button>
                <button className="secondary" onClick={() => exportSnapshotHistory('json')}><Download size={17} /> JSON</button>
              </div>
            </div>
            <div className="snapshot-toolbar">
              <div className="search"><Search size={17} /><SnapshotSearchCombobox value={snapshotQuery} snapshots={snapshots} getTargetName={snapshotTargetName} onChange={setSnapshotQuery} /></div>
              <div className="sort-buttons" aria-label="Ordenar listas">
                {([
                  ['displayCode', 'Codigo'],
                  ['targetName', 'Producto'],
                  ['createdAt', 'Fecha'],
                  ['totalKg', 'Kg'],
                  ['status', 'Estado'],
                ] as [SnapshotSortKey, string][]).map(([key, label]) => (
                  <button className={snapshotSort.key === key ? 'active' : ''} key={key} onClick={() => updateSnapshotSort(key)}>
                    {label} {snapshotSort.key === key ? (snapshotSort.direction === 'asc' ? '↑' : '↓') : ''}
                  </button>
                ))}
              </div>
            </div>
            <div className="snapshot-list">
              {visibleSnapshots.map((snapshot) => {
                const visibleSummary = snapshotVisibleSummary(snapshot)
                const targetName = snapshotTargetName(snapshot)

                return (
                  <article className="snapshot" key={snapshot.id}>
                    <div>
                      <strong>{snapshot.displayCode} · {snapshot.snapshotVersion}</strong>
                      <small><Clock3 size={14} /> {new Date(snapshot.createdAt).toLocaleString()} · {snapshot.actor}</small>
                    </div>
                    <span className="snapshot-product">{targetName}</span>
                    <span className="status">{visibleSummary.evaluation.generalStatus}</span>
                    <span>{visibleSummary.totalKg.toFixed(2)} kg</span>
                    <div className="snapshot-actions">
                      <button onClick={() => loadList(lists.find((list) => list.id === snapshot.productListId) ?? {
                        id: crypto.randomUUID(),
                        displayCode: snapshot.displayCode,
                        targetProductId: snapshot.targetProductId,
                        components: snapshot.frozenComponents.map((component) => ({ id: crypto.randomUUID(), itemId: component.item.internalId, quantityKg: component.quantityKg })),
                        updatedAt: Date.now(),
                      })}>Abrir lista</button>
                      <button className="secondary" onClick={() => cloneListFromHistory(snapshot)}><Copy size={15} /> Clonar lista</button>
                      <button className="danger" onClick={() => deleteListFromHistory(snapshot)}><Trash2 size={15} /> Eliminar</button>
                    </div>
                  </article>
                )
              })}
              {snapshots.length === 0 && <p className="muted">Todavia no hay listas en el catalogo. Guarda una lista para crear `v1`.</p>}
              {snapshots.length > 0 && visibleSnapshots.length === 0 && <p className="muted">No hay listas que coincidan con el filtro.</p>}
            </div>
          </section>
        ) : (
          <section className="import-grid">
            <div className="panel">
              <div className="section-title">
                <h2>Preview sin persistencia</h2>
              </div>
              <label className="import-drop">
                <FileUp size={28} />
                <span>{importFileName || 'Seleccionar CSV de listas'}</span>
                <small>Cabeceras: productoObjetivoId, listaAlias, componenteId, cantidad</small>
                <input type="file" accept=".csv,text/csv" onChange={(event) => previewListImport(event.target.files?.[0] ?? null)} />
              </label>
              {importResult && (
                <div className="import-summary">
                  <span><strong>{importResult.summary.rowsRead}</strong> filas</span>
                  <span><strong>{importResult.summary.validRows}</strong> validas</span>
                  <span><strong>{importResult.summary.groups}</strong> listas</span>
                  <span><strong>{importResult.errors.length}</strong> errores</span>
                </div>
              )}
            </div>
            <div className="panel">
              <div className="section-title">
                <h2>Listas detectadas</h2>
              </div>
              <div className="import-preview-list">
                {importResult?.groups.map((group) => (
                  <article className="import-group" key={group.key}>
                    <div>
                      <strong>{group.productTargetId ?? 'SIN_OBJETIVO'} · {group.listAlias}</strong>
                      <small>{group.rows.length} componentes · {group.totalKg.toFixed(2)} kg</small>
                    </div>
                    {group.totalKg !== 1000 && <span className="warning-badge">Total distinto de 1000 kg</span>}
                  </article>
                ))}
                {(!importResult || importResult.groups.length === 0) && <p className="muted">Carga un archivo para previsualizar grupos validos.</p>}
              </div>
            </div>
            <div className="panel import-errors">
              <div className="section-title">
                <h2>Errores de validacion</h2>
              </div>
              <div className="change-table">
                {importResult?.errors.slice(0, 40).map((error, index) => (
                  <div className="change-table-row" key={`${error.row}-${error.field}-${index}`}>
                    <span><strong>Fila {error.row}</strong></span>
                    <span>{error.field}</span>
                    <small>{error.message}</small>
                  </div>
                ))}
                {(!importResult || importResult.errors.length === 0) && <p className="muted">Sin errores para mostrar.</p>}
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

const root = createRoot(document.getElementById('app')!)

if (convexUrl) {
  const convex = new ConvexReactClient(convexUrl)
  root.render(
    <React.StrictMode>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </React.StrictMode>,
  )
} else {
  root.render(
    <React.StrictMode>
      <main className="empty-panel missing-config">
        <Database size={30} />
        <h1>Falta configurar Convex</h1>
        <p>Define VITE_CONVEX_URL en .env.local y reinicia Vite.</p>
      </main>
    </React.StrictMode>,
  )
}
