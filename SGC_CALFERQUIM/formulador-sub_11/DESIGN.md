# Diseño Técnico — Formulador CFQ v2 (Convex + React + TS + Tailwind)

## 1. Resumen de Decisiones

| Aspecto | Decisión |
|---------|----------|
| Backend | Convex único (elimina Google Apps Script) |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Routing | React Router v6 con rutas anidadas |
| Auth | Desarrollo: sin auth. Producción: WorkOS (diseñar sin hardcodear auth) |
| Cálculos | Hybrid: preview client-side (React), persistencia server-side (Convex mutations) |
| Códigos | Auto-generados secuenciales: MP####, PT####, MZR#### |

## 2. Modelo de Datos (Convex Schema)

### 2.1 `insumos`
Fuente de verdad viva. MPs editables por cualquier usuario. PTs/MZRs editables solo por admin.

```typescript
insumos: defineTable({
  cod: v.string(),              // "MP0001", "PT0056", "MZR0003"
  nombre: v.string(),
  clase: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
  tipo: v.union(v.literal("G"), v.literal("P"), v.literal("L"), v.literal("C")),
  codLegacy: v.optional(v.string()), // "145", "R", "R1" del CSV original
  // Nutrientes (campos individuales tipados)
  C: v.number(), N: v.number(), N_NH4: v.number(), N_NO3: v.number(),
  N_org: v.number(), N_ur: v.number(), P: v.number(), K: v.number(),
  CaO: v.number(), MgO: v.number(), S: v.number(), B: v.number(),
  Co: v.number(), Cu: v.number(), Fe: v.number(), Mn: v.number(),
  Mo: v.number(), SiO2: v.number(), Zn: v.number(), Na: v.number(),
  updatedAt: v.number(),        // timestamp
})
.index("by_cod", ["cod"])
.index("by_clase", ["clase"])
```

### 2.2 `productos`
PTs y MZRs del CSV vienen precargados como productos. También se pueden crear manualmente.

```typescript
productos: defineTable({
  cod: v.string(),              // "PT0056" o "MZR0003"
  nombre: v.string(),
  clase: v.union(v.literal("PT"), v.literal("MZR")),
  tipo: v.union(v.literal("G"), v.literal("P"), v.literal("L"), v.literal("C")),
  // Target = composición del CSV (para PT/MZR) o manual (para nuevos)
  target: v.object({
    C: v.number(), N: v.number(), N_NH4: v.number(), N_NO3: v.number(),
    N_org: v.number(), N_ur: v.number(), P: v.number(), K: v.number(),
    CaO: v.number(), MgO: v.number(), S: v.number(), B: v.number(),
    Co: v.number(), Cu: v.number(), Fe: v.number(), Mn: v.number(),
    Mo: v.number(), SiO2: v.number(), Zn: v.number(), Na: v.number(),
  }),
  createdAt: v.number(),
})
.index("by_cod", ["cod"])
.index("by_clase", ["clase"])
```

### 2.3 `listas` (Listas Globales)
Un producto puede tener N listas globales. Recalculan automáticamente si cambia una MP.

```typescript
listas: defineTable({
  nombre: v.string(),
  productoId: v.id("productos"),
  componentes: v.array(v.object({
    insumoId: v.id("insumos"),
    cantidadKg: v.number(),     // kg en la mezcla (base 1000 kg)
  })),
  composicionCalculada: v.object({
    C: v.number(), N: v.number(), N_NH4: v.number(), N_NO3: v.number(),
    N_org: v.number(), N_ur: v.number(), P: v.number(), K: v.number(),
    CaO: v.number(), MgO: v.number(), S: v.number(), B: v.number(),
    Co: v.number(), Cu: v.number(), Fe: v.number(), Mn: v.number(),
    Mo: v.number(), SiO2: v.number(), Zn: v.number(), Na: v.number(),
  }),
  estadoTolerancia: v.union(v.literal("C"), v.literal("NC"), v.literal("SUP")),
  detalleTolerancia: v.record(v.string(), v.object({
    valor: v.number(),
    tolerancia: v.number(),
    estado: v.string(),          // "C" | "NC" | "SUP"
  })),
  totalKg: v.number(),          // sumatoria de cantidades (esperado 1000)
  updatedAt: v.number(),
})
.index("by_productoId", ["productoId"])
.index("by_estado", ["estadoTolerancia"])
```

### 2.4 `snapshots`
Inmutables. Denormalizados. Creados automáticamente al "Guardar Final".

```typescript
snapshots: defineTable({
  listaOrigenId: v.optional(v.id("listas")),
  productoId: v.id("productos"),
  nombre: v.string(),
  // Copia del target en el momento del snapshot
  targetSnapshot: v.object({ /* mismos campos que productos.target */ }),
  componentesSnapshot: v.array(v.object({
    insumoId: v.id("insumos"),
    cod: v.string(),
    nombre: v.string(),
    cantidadKg: v.number(),
    composicionSnapshot: v.object({ /* mismos campos que insumos nutrientes */ }),
  })),
  composicionCalculada: v.object({ /* mismos campos */ }),
  estadoTolerancia: v.string(),
  detalleTolerancia: v.record(v.string(), v.object({
    valor: v.number(),
    tolerancia: v.number(),
    estado: v.string(),
  })),
  totalKg: v.number(),
  creadoEn: v.number(),
  notas: v.optional(v.string()),
})
.index("by_productoId", ["productoId"])
.index("by_listaOrigenId", ["listaOrigenId"])
.index("by_creadoEn", ["creadoEn"])
```

## 3. Fórmulas de Cálculo (Server-Side en Convex)

### 3.1 Composición Calculada de una Lista
```
Para cada nutriente nutrienteKey:
  total = 0
  Para cada componente en lista.componentes:
    insumo = db.get(componente.insumoId)
    aporte = componente.cantidadKg * insumo[nutrienteKey] / 1000
    total += aporte
  composicionCalculada[nutrienteKey] = total
```

### 3.2 Tolerancias ICA
**Grupo 1 (N, P):**
- Si X = 0 → tolerancia = 0
- Si X < 0.04 → tolerancia = 0.84
- Si X > 32 → tolerancia = 1.46
- Si 0.04 ≤ X ≤ 32 → tolerancia = -0.0005 * X² + 0.0413 * X + 0.6533

**Grupo 2 (K):**
- Si X = 0 → tolerancia = 0
- Si X < 0.04 → tolerancia = 0.69
- Si X > 32 → tolerancia = 2.14
- Si 0.04 ≤ X ≤ 32 → tolerancia = -0.0007 * X² + 0.0769 * X + 0.3941

**Grupo 3 (secundarios y micros):**
Tolerancia = min(X/2, 1.5, ecuación_lineal)
- CaO: 0.42 + 0.105 * X
- MgO: 0.5 + 0.125 * X
- S: 0.3 + 0.075 * X
- B: 0.005 + 0.25 * X
- Co, Mo: 0.000125 + 0.375 * X
- Cu, Fe, Mn, Zn, Na: 0.015 + 0.3 * X

**Evaluación:**
- Si valorCalculado < (target - tolerancia) → "NC"
- Si valorCalculado > (target + tolerancia) → "SUP"
- Else → "C"

### 3.3 Recálculo en Cascada
Al editar un insumo MP (`updateInsumo` mutation):
1. Actualizar el insumo.
2. Buscar todas las `listas` donde `componentes` contenga `insumoId`.
3. Para cada lista afectada: recalcular `composicionCalculada`, `estadoTolerancia`, `detalleTolerancia`.
4. Batch update.

## 4. Flujo de Vistas y Navegación

```
/                           → Dashboard (default)
/productos                  → Lista de productos
/productos/:id              → Detalle del producto + listas globales
/productos/:id/nueva        → Formulador vacío para este producto
/productos/:id/listas/:listaId  → Formulador editando lista existente
/insumos                    → Catálogo editable de MPs/PTs/MZRs
/historico                  → Snapshots (histórico inmutable)
/sustitucion                → Vista independiente de sugerencias MZR
/comparador                 → Comparador de listas
```

## 5. Flujo de Guardado en Formulador

1. Usuario arma mezcla en el formulador (React state local, preview client-side).
2. **"Guardar"** → mutation `saveLista`: crea o actualiza la `lista global` en Convex.
3. **"Guardar Final"** → mutation `saveListaFinal`: actualiza la `lista global` + crea automáticamente un `snapshot` denormalizado con `targetSnapshot` y `composicionSnapshot` por componente.
4. Lista global sigue editable. Snapshot es inmutable.

## 6. Módulo de Sustitución (Vista Independiente `/sustitucion`)

1. Usuario selecciona una MP (ej. "Urea").
2. Sistema calcula distancia euclidiana N-P-K de todos los MZRs.
3. Ordena por cercanía. Permite priorizar N, P o K.
4. Muestra MZR candidatos con su composición.
5. Usuario selecciona MZR y cantidad en kg.
6. Sistema sugiere cantidad ajustada para mantener aporte del nutriente priorizado.

## 7. Carga Inicial

- Seed script (`convex/seed.ts`) que lee `insumos_ref/mp-pt_mzr.csv`, parsea, genera códigos secuenciales (MP####, PT####, MZR####), y popula `insumos` + `productos`.
- MZRs = PTs con COD original = "R", "R1", "R2", etc.

## 8. Plan de Implementación

| Fase | Descripción |
|------|-------------|
| F1 | Scaffolding: Vite + React + TS + Tailwind + Convex |
| F2 | Schema Convex + seed script CSV |
| F3 | Layout: Sidebar + React Router |
| F4 | Vista Insumos (catálogo editable, carga CSV) |
| F5 | Vista Productos + creación manual |
| F6 | Motor de cálculo client-side (preview) + server-side (mutations) |
| F7 | Formulador completo (guardar / guardar final / snapshot) |
| F8 | Histórico de snapshots |
| F9 | Comparador de listas |
| F10 | Módulo de Sustitución |
| F11 | Responsive + polishes |
