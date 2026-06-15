# Session State: Formulador Sub v2

**Last Updated**: 2026-06-09 14:45 -05

## Session Objective

Implementar el plan integrado `grillme/plan_v1.md` (Fases 1 y 2): schema Convex canónico, motor de cálculo/tolerancia, parser CSV, y app React con carga CSV admin.

## Current State

- [x] Leído plan_v1.md y understood modelo canonico de 4 tablas.
- [x] Verificado CSV: 8 MP, 270 PT, 18 MZR (clasificados por COD=R/R1/R2).
- [x] Verificado scaffold existente: web/ con Vite vanilla TS, dependencias React+Convex+Tailwind ya instaladas.
- [x] Instaladas dependencias adicionales: react-dom, @vitejs/plugin-react, @tailwindcss/vite.
- [x] **Fase 1 COMPLETADA**: Schema Convex canónico con 4 tablas, indices, mutaciones.
- [x] **Fase 2 COMPLETADA**: Motor puro de cálculo (formulas.ts) y tolerancias ICA (tolerancias.ts).
- [x] Parser CSV implementado (csvParser.ts) con clasificación MP/PT/MZR.
- [x] Queries y Mutations Convex implementadas (seed, CRUD catálogo, listas, snapshots).
- [x] App React con routing (Dashboard, Catálogo, Formulador, Histórico).
- [x] TypeScript compila limpio (0 errores frontend, Convex sincronizado).
- [x] Convex local inicializado y schema desplegado exitosamente.
- [ ] Pendiente: probar carga CSV real con botón admin.
- [ ] Pendiente: pruebas unitarias del motor de cálculo y tolerancias.
- [ ] Pendiente: implementar Fase 3 (catálogo editable con autosave).
- [ ] Pendiente: implementar Fase 4 (armado y listas vivas con guardado persistente).

## Critical Technical Context

### Modelo de Datos (Convex)
- `catalogItems`: fuente viva única (MP/PT/MZR), con `internalId`, `externalCode`, `composicion` (20 nutrientes).
- `catalogChangeHistory`: auditoría por campo, actor local, timestamp, antes/después.
- `productLists`: listas vivas recalculables, `componentes[]`, `displayCode`, target opcional.
- `productListSnapshots`: versionados inmutables, congela objetivo y componentes al guardado.

### Reglás de Clasificación MZR
- CSV `CLASE` siempre dice PT, pero `COD` puede ser `R`, `R1`, `R2`.
- Regla: `/^R\d*$/` → MZR. Total: 18 MZR, 270 PT, 8 MP = 296 items.

### Decisions
- Convex deployment local en `http://127.0.0.1:3212`
- `.env.local` creado con `VITE_CONVEX_URL`
- Admin local por `localStorage` checkbox, sin auth real.
- Nutrientes normalizados sin guiones: `N_NH4`, `N_NO3`, `N_org`, `N_ur`.

### Key File Paths
- `web/convex/schema.ts` — Schema canónico (4 tablas + indices)
- `web/convex/queries.ts` — Queries (getCatalog, getProductLists, getSnapshots, etc.)
- `web/convex/mutations.ts` — Mutations (seedCatalog, updateCatalogItem, saveProductList, etc.)
- `web/src/lib/constants.ts` — Constantes, tipos, generación de IDs
- `web/src/lib/formulas.ts` — Motor de cálculo puro
- `web/src/lib/tolerancias.ts` — Motor de tolerancias ICA
- `web/src/lib/csvParser.ts` — Parser CSV con validación y clasificación
- `web/src/App.tsx` — App React con sidebar y routing
- `web/src/pages/` — DashboardPage, CatalogPage, FormuladorPage, HistoricoPage
- `web/vite.config.ts` — Vite + React + Tailwind
- `web/tsconfig.json` — TypeScript config
- `grillme/plan_v1.md` — Plan maestro

## Next Steps

1. Probar carga CSV real con botón admin (verificar seed en Convex local).
2. Agregar pruebas unitarias para motor de cálculo y tolerancias.
3. Implementar Fase 3: Catálogo editable con inline editing, autosave debounce, permisos UI.
4. Implementar Fase 4: Formulador completo con guardado persistente (lista viva + snapshot).
5. Implementar Fase 5: Vista de histórico con filtros y detalle congelado.
6. Fases 6-7 quedan fuera del núcleo inicial (importación, comparador, sustitución).