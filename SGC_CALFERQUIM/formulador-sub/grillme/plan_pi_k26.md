# Plan de Implementación — Formulador CFQ v2 (Convex + React + TS + Tailwind)

## Contexto
Reconfiguración completa del aplicativo `formulador-sub` migrando de vanilla JS + Google Apps Script a React + TypeScript + Tailwind CSS + Convex como backend único.

---

## Fases

### F1 — Scaffolding (Fundación)
- [x] Crear proyecto Vite React + TypeScript
- [x] Instalar dependencias: `convex`, `react-router-dom`, `clsx`, `lucide-react`
- [x] Instalar devDeps: `tailwindcss`, `postcss`, `autoprefixer`, `@types/*`
- [ ] Configurar Tailwind CSS v4 (`tailwind.config.js` / `postcss.config.js`)
- [ ] Configurar estructura de carpetas:
  ```
  web/src/
  ├── main.tsx
  ├── App.tsx
  ├── index.css
  ├── convex/
  │   ├── schema.ts
  │   ├── seed.ts
  │   ├── mutations/
  │   │   ├── insumos.ts
  │   │   ├── productos.ts
  │   │   ├── listas.ts
  │   │   └── snapshots.ts
  │   └── queries/
  │       ├── insumos.ts
  │       ├── productos.ts
  │       ├── listas.ts
  │       └── snapshots.ts
  ├── components/
  ├── views/
  ├── hooks/
  ├── lib/
  │   ├── tolerancias.ts
  │   └── formulas.ts
  └── types/
      └── index.ts
  ```
- [ ] Inicializar Convex: `npx convex dev --init` (crear `convex.json`, conectar con proyecto Convex)
- [ ] Verificar build sin errores

### F2 — Schema Convex + Seed
- [ ] Escribir `convex/schema.ts` con 4 tablas: `insumos`, `productos`, `listas`, `snapshots`
- [ ] Escribir tipos TypeScript compartidos (`web/src/types/index.ts`)
- [ ] Escribir `convex/seed.ts`:
  - Parsear `../insumos_ref/mp-pt_mzr.csv`
  - Generar códigos secuenciales: `MP####`, `PT####`, `MZR####`
  - MZRs = PTs con COD = `R`, `R1`, `R2`...
  - Insertar en `insumos` (todos) y `productos` (solo PT/MZR con target)
- [ ] Ejecutar seed en dev: `npx convex run seed:populate`

### F3 — Layout + Router
- [ ] Crear `App.tsx` con `<ConvexProvider>` y `<BrowserRouter>`
- [ ] Crear componente `Sidebar` con navegación principal
- [ ] Configurar React Router con rutas anidadas:
  - `/` → Dashboard
  - `/productos` → ProductosList
  - `/productos/:id` → ProductoDetail
  - `/productos/:id/nueva-lista` → Formulador (lista vacía)
  - `/productos/:id/listas/:listaId` → Formulador (editar)
  - `/insumos` → InsumosCatalogo
  - `/historico` → HistoricoSnapshots
  - `/sustitucion` → Sustitucion
  - `/comparador` → Comparador
- [ ] Crear layout responsive (sidebar colapsable en mobile)
- [ ] Definir paleta de colores CALFERQUIM en Tailwind

### F4 — Vista Insumos (Catálogo Editable)
- [ ] Query `getInsumos` (paginada/filtrable por clase)
- [ ] Tabla editable inline: al hacer click en celda de nutriente, se edita MP
- [ ] Solo MPs editables por defecto. PT/MZR con indicación visual de "solo admin"
- [ ] Filtros: por clase (MP/PT/MZR), por tipo (G/P/L/C), búsqueda por nombre/código
- [ ] Mutation `updateInsumo` con recálculo en cascada de `listas` globales afectadas
- [ ] Toast/alerta de confirmación cuando se recalculan N listas

### F5 — Vista Productos
- [ ] Query `getProductos`
- [ ] Grid/tabla de productos con target resumido (N-P-K)
- [ ] Indicador visual: ¿tiene listas globales? ¿alguna es NC?
- [ ] Botón "Crear producto manual": formulario con target nutricional editable
- [ ] Vista detalle `/productos/:id`: muestra target completo + listas globales del producto
- [ ] Desde detalle: botón "Nueva lista" → navega a formulador vacío

### F6 — Motor de Cálculo
- [ ] `lib/formulas.ts`: función `calcularComposicion(componentes, insumosMap)`
- [ ] `lib/tolerancias.ts`: función `calcularTolerancias(composicion, target)`
  - Grupo 1 (N, P): polinómica con topes
  - Grupo 2 (K): polinómica con topes
  - Grupo 3 (secundarios/micros): min(X/2, 1.5, ecuación_lineal)
- [ ] Server-side: mutations `calcularYGuardarLista`, `recalcularListasAfectadas`
- [ ] Client-side: hook `usePreviewCalculado` para preview en tiempo real

### F7 — Formulador Completo
- [ ] Componente `Formulador`:
  - Selector de insumos (MP/PT/MZR) con cantidad en kg
  - Hasta 11 componentes
  - Total kg (esperado ~1000)
  - Preview en tiempo real: grado calculado vs target
  - Alertas visuales por nutriente: C ✓ / NC ✗ / SUP ⚠
- [ ] Estado global del formulador: React state local (no persiste hasta guardar)
- [ ] Botón "Guardar": mutation `upsertLista` (crea o actualiza lista global)
- [ ] Botón "Guardar Final": mutation `guardarFinal` → `upsertLista` + `createSnapshot`
- [ ] Botón "Nueva Lista": crear lista alternativa para el mismo producto
- [ ] Botón "Deshacer cambios" / "Restaurar guardado"
- [ ] Deep link: `/productos/:id/listas/:listaId` carga lista existente

### F8 — Histórico de Snapshots
- [ ] Query `getSnapshots` con filtros: por producto, por fecha, por estado
- [ ] Tabla inmutable: nombre, fecha, componentes, composición, estado C/NC/SUP
- [ ] Vista detalle de snapshot con desglose por nutriente (target vs calculado)
- [ ] Botón "Clonar a nueva lista" (crea lista global copiando componentes del snapshot)
- [ ] Notas opcionales en snapshot

### F9 — Comparador
- [ ] Vista `/comparador`:
  - Seleccionar producto
  - Seleccionar múltiples listas del mismo producto
  - Tabla comparativa: lado a lado, nutriente por nutriente
  - Resaltado de diferencias y estados de tolerancia
- [ ] Opcional: comparar snapshot vs lista global

### F10 — Módulo de Sustitución
- [ ] Vista independiente `/sustitucion`:
  - Paso 1: seleccionar MP a reemplazar
  - Paso 2: seleccionar nutriente priorizado (N / P / K)
  - Paso 3: sistema sugiere MZRs ordenados por:
    - Distancia euclidiana N-P-K al MP
    - Desempate por cercanía en nutriente priorizado
  - Paso 4: seleccionar MZR y cantidad en kg
  - Paso 5: sugerencia automática de cantidad para mantener aporte del nutriente priorizado:
    - `kg_mzr = (kg_mp * conc_mp) / conc_mzr`
  - Paso 6: simular impacto (calcular composición resultante)
  - Paso 7: "Aplicar en formulador" → navega a `/productos/:id/nueva-lista` con los componentes pre-cargados

### F11 — Responsive + Polishes
- [ ] Media queries para tablet y mobile
- [ ] Touch targets mínimo 44px
- [ ] Sidebar colapsable a drawer en mobile
- [ ] Optimistic updates en Convex mutations
- [ ] Estados de carga (skeletons) y error boundaries
- [ ] Testing manual con datos reales del CSV

---

## Decisiones Arquitectónicas Clave

| Decisión | Valor |
|----------|-------|
| Backend | Convex único (sin GAS) |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Routing | React Router v6, sidebar + rutas anidadas |
| Auth | Dev: sin auth. Prod: WorkOS (preparar hooks sin hardcodear) |
| Cálculos | Hybrid: preview client-side, persistencia server-side |
| Códigos | Auto-generados: MP####, PT####, MZR#### |
| Recálculo | Síncrono inmediato en mutation de edición de MP |
| Snapshot | Denormalizado, inmutable, con targetSnapshot + composicionSnapshot |
| Guardado | "Guardar" = lista global mutable. "Guardar Final" = lista global + snapshot automático |
| Validación | Solo tolerancias ICA vs target. No mínimos NPK. |
| Sustitución | Vista independiente `/sustitucion`. Sugiere MZRs por cercanía nutricional. |

## Archivos de Referencia

- Base de datos: `insumos_ref/mp-pt_mzr.csv`
- Fórmulas: `insumos_ref/formula.md`
- Tolerancias: `insumos_ref/tolerancia.md`
- Diseño técnico: `DESIGN.md`

## Estado Actual

- F1 en progreso: scaffolding Vite creado, dependencias instaladas
- Próximo: configurar Tailwind + inicializar Convex
