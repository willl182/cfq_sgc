# Plan Feature: Formulador de Reemplazo de Insumos por MZR

**Proyecto:** SGC CALFERQUIM - Formulador-sub_1 Web  
**Fecha:** 2026-06-17  
**Estado:** Plan aprobado, listo para implementacion  

---

## 1. Resumen Ejecutivo

Nueva vista **`replacer`** (sustitucion por MZR) que permite, partiendo de una lista/formulacion de un **PT mezcla** (`MF` / `MFE`), seleccionar **un solo insumo** de la lista y ver todas las **MZR del catalogo ordenadas por distancia/similitud NPK**, priorizando un nutriente (`N`, `P` o `K`). Al aplicar la sustitucion, el sistema clona la lista con la MZR seleccionada y **lleva al usuario a la vista Formular** para revision antes de guardar.

---

## 2. Requerimientos Confirmados por Product Owner

| # | Requerimiento | Decision |
|---|---------------|----------|
| 1 | Uno a la vez | Solo un insumo se reemplaza por operacion. Para reemplazar otro, se repite el flujo. |
| 2 | Llevar al formular | Al aplicar la sustitucion, se navega a `view === 'formulator'` con la lista clonada precargada. El usuario revisa y guarda manualmente. |
| 3 | Acceso desde ambos lados | Boton disponible tanto en la vista **Formular** (cuando se carga un PT mezcla) como en la vista **Listas** (history) en cada snapshot de mezcla. |

---

## 3. Flujo de Usuario

```
Punto de entrada A (Formular)              Punto de entrada B (Listas)
        |                                           |
        | Carga PT mezcla (MF/MFE)                 | Snapshot de PT mezcla
        |                                           |
        v                                           v
   Boton "Sustituir insumo"              Boton "Sustituir por MZR"
        |                                           |
        +-------------------+-----------------------+
                            |
                            v
                   Vista Replacer cargada
                   - PT objetivo (solo lectura)
                   - Tabla de componentes con boton "Sustituir" por fila
                            |
                            v
                   Click en "Sustituir" de un componente
                   - Componente bloqueado como "base"
                   - Selector N/P/K habilitado
                            |
                            v
                   Tabla de MZR candidatas (top 20)
                   Ordenadas por distancia + prioridad
                   Columnas: Nombre, N, P, K, Distancia, Kg sugeridos, Accion
                            |
                            v
                   Click "Aplicar" en una MZR
                   - Calcula kg sugeridos
                   - Genera nueva lista clonada (sin guardar)
                            |
                            v
                   Navegacion a vista Formular
                   - Lista precargada con MZR aplicada
                   - Usuario revisa, ajusta si quiere, y guarda
```

---

## 4. Arquitectura Tecnica

### 4.1 Nuevo Archivo de Dominio: `src/domain/replacer.ts`

Logica pura, sin dependencias de React/UI. Reutiliza el algoritmo del legacy `sustitucion.js` adaptado al modelo de datos moderno.

#### Tipos exportados:

```typescript
export type ReplacementPriority = 'N' | 'P' | 'K'

export type SuggestedReplacement = {
  item: CatalogItem
  distance: number          // distancia euclidiana NPK
  priorityDelta: number     // |base[priority] - mzr[priority]|
  suggestedKg: number       // kg calculados para mantener nutriente prioritario
}

export type ReplacerState = {
  baseList: ProductList
  baseComponentIndex: number | null
  priority: ReplacementPriority
  suggestions: SuggestedReplacement[]
}
```

#### Funciones exportadas:

```typescript
export function euclideanDistanceNPK(a: Composition, b: Composition): number
// Calcula sqrt((N1-N2)^2 + (P1-P2)^2 + (K1-K2)^2)

export function suggestMZRReplacements(
  baseItem: CatalogItem,
  baseQuantityKg: number,
  mzrs: CatalogItem[],
  priority: ReplacementPriority
): SuggestedReplacement[]
// Ordena MZR por: 1) priorityDelta ascendente, 2) distance ascendente
// Excluye MZR donde mzr[priority] <= 0 (suggestedKg = 0, deshabilitada)

export function calculateSuggestedQuantity(
  baseItem: CatalogItem,
  baseQuantityKg: number,
  mzr: CatalogItem,
  priority: ReplacementPriority
): number
// Formula: round((baseQuantityKg * base[priority]) / mzr[priority], 1)
// Si mzr[priority] <= 0, retorna 0

export function applyReplacementToComponents(
  originalComponents: LiveComponent[],
  catalog: CatalogItem[],
  replaceIndex: number,
  mzrInternalId: string,
  suggestedKg: number
): LiveComponent[]
// Clona componentes, reemplaza el item en replaceIndex por la MZR con nueva cantidad.
// Genera nuevos IDs (crypto.randomUUID) para evitar colisiones.

export function isMixProduct(item: CatalogItem | null | undefined): boolean
// Detecta si el PT es mezcla por nombre:
// name.toUpperCase().startsWith('MF ') || name.toUpperCase().startsWith('MFE ')
```

### 4.2 Tests Unitarios: `src/domain/replacer.test.ts`

Casos obligatorios:

1. `distancia entre UREA (N=46) y MZR R2 (N=43.5) ≈ 2.5`
2. `prioridad N: MZR con N mas cercano al base aparece primero`
3. `cantidad sugerida: UREA 100kg (N=46) -> MZR (N=23) = 200kg`
4. `MZR sin nutriente prioritario: suggestedKg = 0, no incluir en tabla`
5. `applyReplacement: reemplaza solo el indice indicado, mantiene demas componentes`
6. `isMixProduct: true para "MF 10-20-20", "MFE 15-15-15", false para "UREA"`

### 4.3 Cambios en `src/main.tsx`

#### A. Tipos y Estados

```typescript
type View = 'catalog' | 'formulator' | 'scale' | 'history' | 'import' | 'replacer'

// Nuevos estados locales (linea ~490):
const [replacerList, setReplacerList] = useState<ProductList | null>(null)
const [replacerComponentIndex, setReplacerComponentIndex] = useState<number | null>(null)
const [replacerPriority, setReplacerPriority] = useState<'N' | 'P' | 'K'>('N')
const [replacerSuggestions, setReplacerSuggestions] = useState<SuggestedReplacement[]>([])
```

#### B. Funciones nuevas

```typescript
function openReplacer(sourceList: ProductList, componentIndex?: number) {
  setReplacerList(sourceList)
  setReplacerComponentIndex(componentIndex ?? null)
  setReplacerPriority('N')
  setView('replacer')
}

function computeReplacerSuggestions() {
  if (!replacerList || replacerComponentIndex === null) return
  const component = replacerList.components[replacerComponentIndex]
  const baseItem = catalog.find((item) => item.internalId === component.itemId)
  if (!baseItem) return
  const mzrs = catalog.filter((item) => item.class === 'MZR')
  const suggestions = suggestMZRReplacements(baseItem, component.quantityKg, mzrs, replacerPriority)
  setReplacerSuggestions(suggestions)
}

function applyReplacerSuggestion(suggestion: SuggestedReplacement) {
  if (!replacerList || replacerComponentIndex === null) return
  const newComponents = applyReplacementToComponents(
    replacerList.components,
    catalog,
    replacerComponentIndex,
    suggestion.item.internalId,
    suggestion.suggestedKg
  )
  const newList: ProductList = {
    id: crypto.randomUUID(),
    displayCode: createDisplayCode(target, lists), // genera nuevo codigo
    targetProductId: replacerList.targetProductId,
    components: newComponents,
    updatedAt: Date.now(),
  }
  // Cargar en formular sin guardar
  setEditingListId(null) // es una lista nueva, no existente
  setScaleListId('')
  setTargetId(newList.targetProductId ?? '')
  setComponents(newList.components)
  setView('formulator')
  setSaveState('idle')
  // Limpiar estado replacer
  setReplacerList(null)
  setReplacerComponentIndex(null)
  setReplacerSuggestions([])
}
```

#### C. Integracion en vista Formular (linea ~1484)

Cuando `target` existe y `isMixProduct(target) === true`, mostrar boton adicional en el header de componentes:

```tsx
{target && isMixProduct(target) && (
  <button className="secondary" onClick={() => openReplacer({
    id: crypto.randomUUID(),
    displayCode: 'BORRADOR',
    targetProductId: target.internalId,
    components,
    updatedAt: Date.now(),
  })}>
    <RotateCcw size={17} /> Sustituir insumo por MZR
  </button>
)}
```

Ademas, en cada fila de componentes, mostrar icono/boton de sustitucion:

```tsx
// En la tabla de componentes del formular (~linea 1550):
<button
  className="icon-button"
  title="Sustituir por MZR"
  onClick={() => openReplacer({
    id: crypto.randomUUID(),
    displayCode: 'BORRADOR',
    targetProductId: target?.internalId ?? null,
    components,
    updatedAt: Date.now(),
  }, index)}
>
  <RotateCcw size={14} />
</button>
```

#### D. Integracion en vista Listas/History (linea ~1917)

En cada `snapshot` card, detectar mezcla y mostrar boton:

```tsx
const isMix = snapshot.frozenTarget
  ? isMixProduct(snapshot.frozenTarget)
  : false

// Dentro de .snapshot-actions:
{isMix && (
  <button onClick={() => openReplacer({
    id: crypto.randomUUID(),
    displayCode: snapshot.displayCode,
    targetProductId: snapshot.targetProductId,
    components: snapshot.frozenComponents.map((c) => ({
      id: crypto.randomUUID(),
      itemId: c.item.internalId,
      quantityKg: c.quantityKg,
    })),
    updatedAt: Date.now(),
  })}>
    <RotateCcw size={15} /> Sustituir por MZR
  </button>
)}
```

#### E. Nueva vista condicional `view === 'replacer'`

Renderizado completo despues del bloque `view === 'formulator'` (antes de `view === 'scale'`):

```tsx
) : view === 'replacer' ? (
  <section className="panel replacer-panel">
    {/* Header */}
    <div className="section-title">
      <h2>Sustituir insumo por MZR</h2>
      <button className="secondary" onClick={() => setView('formulator')}>
        <ChevronLeft size={17} /> Volver al formular
      </button>
    </div>

    {/* PT Objetivo (solo lectura) */}
    {target && (
      <div className="replacer-target-card">
        <strong>{target.internalId} · {target.name}</strong>
        <span>N:{formatPct(target.composition.N)} P:{formatPct(target.composition.P)} K:{formatPct(target.composition.K)}</span>
      </div>
    )}

    {/* Tabla de componentes (seleccionar uno) */}
    <div className="replacer-components">
      <h3>Selecciona un insumo a sustituir</h3>
      <table className="data-table">
        <thead><tr><th>Insumo</th><th>Kg</th><th>N</th><th>P</th><th>K</th><th></th></tr></thead>
        <tbody>
          {replacerList?.components.map((component, index) => {
            const item = catalog.find((c) => c.internalId === component.itemId)
            if (!item) return null
            const selected = replacerComponentIndex === index
            return (
              <tr key={component.id} className={selected ? 'selected-row' : ''}>
                <td><strong>{item.internalId}</strong><small>{item.name}</small></td>
                <td className="num-col">{formatKg(component.quantityKg)}</td>
                <td className="num-col">{formatPct(item.composition.N)}</td>
                <td className="num-col">{formatPct(item.composition.P)}</td>
                <td className="num-col">{formatPct(item.composition.K)}</td>
                <td>
                  <button
                    className={selected ? 'primary' : 'secondary'}
                    onClick={() => {
                      setReplacerComponentIndex(index)
                      computeReplacerSuggestions()
                    }}
                  >
                    {selected ? 'Seleccionado' : 'Sustituir'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    {/* Selector de prioridad (solo visible si hay componente seleccionado) */}
    {replacerComponentIndex !== null && (
      <div className="replacer-priority">
        <h3>Priorizar nutriente a mantener</h3>
        <div className="segmented-control">
          {(['N', 'P', 'K'] as const).map((p) => (
            <button
              key={p}
              className={replacerPriority === p ? 'active' : ''}
              onClick={() => { setReplacerPriority(p); computeReplacerSuggestions() }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Tabla de MZR sugeridas */}
    {replacerSuggestions.length > 0 && (
      <div className="replacer-suggestions">
        <h3>MZR sugeridas ({replacerSuggestions.length})</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>MZR</th>
              <th className="num-col">N</th>
              <th className="num-col">P</th>
              <th className="num-col">K</th>
              <th className="num-col">Distancia</th>
              <th className="num-col">Kg sugeridos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {replacerSuggestions.slice(0, 20).map((s) => (
              <tr key={s.item.internalId}>
                <td><strong>{s.item.internalId}</strong><small>{s.item.name}</small></td>
                <td className="num-col">{formatPct(s.item.composition.N)}</td>
                <td className="num-col">{formatPct(s.item.composition.P)}</td>
                <td className="num-col">{formatPct(s.item.composition.K)}</td>
                <td className="num-col">{s.distance.toFixed(2)}</td>
                <td className="num-col">
                  {s.suggestedKg > 0 ? formatKg(s.suggestedKg) : '-'}
                </td>
                <td>
                  <button
                    className="primary"
                    disabled={s.suggestedKg <= 0}
                    onClick={() => applyReplacerSuggestion(s)}
                  >
                    Aplicar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {replacerComponentIndex !== null && replacerSuggestions.length === 0 && (
      <p className="muted">No hay MZR disponibles para este insumo con la prioridad seleccionada.</p>
    )}
  </section>
)
```

#### F. Estilos CSS minimos (`src/style.css`)

Agregar al final del archivo:

```css
.replacer-panel { display: flex; flex-direction: column; gap: var(--sp-5); }
.replacer-target-card { display: flex; align-items: center; gap: var(--sp-4); padding: var(--sp-3) var(--sp-4); background: var(--surface-2); border-radius: var(--radius); }
.replacer-components .selected-row { background: var(--accent-bg); }
.replacer-priority .segmented-control { display: flex; gap: var(--sp-2); }
.replacer-priority .segmented-control button { min-width: 48px; }
.replacer-priority .segmented-control button.active { background: var(--accent); color: var(--accent-text); }
.replacer-suggestions { margin-top: var(--sp-4); }
```

---

## 5. Fases de Implementacion

| Fase | Descripcion | Archivos | Criterio de aceptacion |
|------|-------------|----------|------------------------|
| **1** | **Motor de dominio:** Crear `replacer.ts` con funciones puras + tests. | `src/domain/replacer.ts`, `src/domain/replacer.test.ts` | Tests pasan (`pnpm test`). |
| **2** | **Estados y navegacion:** Agregar `replacer` a `View`, estados locales, funciones `openReplacer`, `computeReplacerSuggestions`, `applyReplacerSuggestion`. | `src/main.tsx` | Compila sin errores (`pnpm build`). |
| **3** | **Boton en Formular:** Detectar `isMixProduct(target)`, agregar boton en header y por fila de componente. | `src/main.tsx` | Boton visible solo para MF/MFE. Click abre replacer. |
| **4** | **Boton en History:** Detectar `isMixProduct(snapshot.frozenTarget)`, agregar boton por snapshot card. | `src/main.tsx` | Boton visible solo para snapshots de mezcla. |
| **5** | **UI vista Replacer:** Renderizar target, tabla de componentes, selector N/P/K, tabla MZR, boton aplicar. | `src/main.tsx`, `src/style.css` | Flujo completo navegable. |
| **6** | **Integracion final:** Aplicar sugerencia -> navegar a formular con lista precargada. Validar con datos reales. | `src/main.tsx` | Lista cargada en formular con MZR aplicada. `pnpm test` + `pnpm build` exitosos. |

**Estimado total:** 8-10 horas.

---

## 6. Reglas de Negocio

1. **Uno a la vez:** Solo se puede seleccionar un componente para sustituir en cada visita a la vista replacer.
2. **Solo PT mezclas:** La vista replacer es accesible unicamente cuando el PT objetivo es `MF` o `MFE`.
3. **Solo MZR como reemplazo:** El catalogo de candidatos se filtra a `class === 'MZR'`.
4. **Prioridad obligatoria:** El usuario debe seleccionar `N`, `P` o `K` antes de ver sugerencias (default: `N`).
5. **Cantidad sugerida:** `(kg_base * base[priority]) / mzr[priority]`, redondeado a 1 decimal. Si `mzr[priority] <= 0`, la fila muestra `-` y el boton esta deshabilitado.
6. **No guardar automaticamente:** Al aplicar, se navega al formular con la lista modificada pero **sin persistir**. El usuario debe hacer click en "Guardar snapshot".
7. **Clonacion limpia:** Los IDs de componentes se regeneran. El `displayCode` se genera como nueva lista.

---

## 7. Consideraciones de Diseno

- **Sin cambios en Convex schema:** Todo es calculo cliente con datos ya cargados.
- **Sin nuevas queries/mutations:** Se reutilizan `saveRemoteList` (solo al guardar desde formular).
- **Estilos minimos:** Se reutilizan las clases existentes (`panel`, `data-table`, `segmented-control`, `num-col`, etc.).
- **Icono:** Se usa `RotateCcw` de lucide-react para indicar sustitucion/reemplazo.
- **Responsive:** La tabla de MZR puede tener scroll horizontal en pantallas pequenas (ya soportado por `.table-wrapper`).

---

## 8. Riesgos y Mitigaciones

| Riesgo | Mitigacion |
|--------|------------|
| MZR sin el nutriente prioritario (ej. buscar reemplazo por K pero MZR tiene K=0) | Tabla muestra `-` y deshabilita boton. |
| Usuario aplica sustitucion y el total ya no da 1000 kg | Se muestra alerta nativa del formular (`Total X kg: la base fija es 1000 kg`). |
| Lista guardada ya no existe en catalogo (item archivado) | `cloneListFromHistory` ya tiene esta validacion; reutilizar logica. |
| Confusion entre "aplicar" y "guardar" | Boton dice "Aplicar" en replacer, y el formular muestra estado "Listo" hasta que se presione "Guardar snapshot". |

---

*Plan generado por OpenCode para SGC CALFERQUIM.*
