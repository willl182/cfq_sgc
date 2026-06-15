# Session State: Formulador Sub

**Last Updated**: 2026-06-09 14:36 -05

## Session Objective

Implementar el plan integrado `grillme/plan_v1.md` en código funcional.

## Current State

- [x] Leída memoria previa del proyecto.
- [x] Revisado el scaffold existente (`web/` con Vite + React + TS + Tailwind).
- [x] Configurado Convex local con schema canónico (`catalogItems`, `catalogChangeHistory`, `productLists`, `productListSnapshots`).
- [x] Implementado módulo puro de cálculo/tolerancia (`src/lib/nutrients.ts`).
- [x] Implementada carga inicial CSV con validación y asignación de IDs secuenciales (296 items insertados).
- [x] Implementada vista de catálogo editable con búsqueda, filtros y edición inline de nutrientes.
- [x] Implementado formulador con componentes dinámicos, preview calculado en tiempo real y guardado con snapshot.
- [x] Implementada vista de recetas/listas guardadas.
- [x] Implementada vista de histórico de snapshots con detalle congelado.
- [x] Build exitoso (`pnpm build` sin errores de TypeScript).
- [x] App corriendo local: Vite en http://localhost:5174/ + Convex en http://127.0.0.1:3210.
- [ ] Fase 6: Importación futura de listas (no iniciada, funcionalidad posterior).
- [ ] Fase 7: Comparador, sustitución, creación manual de productos (no iniciada, fuera del núcleo inicial según plan).

## Critical Technical Context

- Convex local corriendo en http://127.0.0.1:3210 (PID: `convex dev` en background).
- Vite dev corriendo en http://localhost:5174/ (PID: 151102, en background).
- Catálogo poblado desde `insumos_ref/mp-pt_mzr.csv` (296 items).
- IDs internos: MP0001-MP0008, PT0001-PT0273, MZR0001-MZR0015 (basado en COD=R, R1, R2).
- Regla MZR: `COD` que empieza con `R` seguido de dígitos opcionales (`/^R\d*$/`).
- Seed bloquea doble carga (solo si `catalogItems` está vacío).
- Snapshots se crean automáticamente en cada guardado persistente server-side.
- `targetSnapshot` nullable para listas sin objetivo.
- Cálculo server-side es autoridad; preview client-side usa módulo puro compartido.
- Admin local por `localStorage`/`true` hardcodeado en `App.tsx`.

## Key Files

- `convex/schema.ts` — Schema canónico con 4 tablas e índices.
- `convex/seed.ts` — Mutación de carga CSV con validación y auditoría.
- `convex/catalog.ts` — Queries/mutations de catálogo (list, get, update, archive, history).
- `convex/lists.ts` — Queries/mutations de listas y snapshots (save, list, get).
- `src/lib/nutrients.ts` — Motor puro de cálculo, tolerancias ICA y evaluación.
- `src/App.tsx` — Entry point con navegación por tabs.
- `src/components/AdminSeed.tsx` — UI de carga CSV para admin.
- `src/components/CatalogView.tsx` — Vista de catálogo editable.
- `src/components/FormulatorView.tsx` — Formulador con preview y guardado.
- `src/components/ListsView.tsx` — Recetas guardadas.
- `src/components/SnapshotsView.tsx` — Histórico de snapshots.

## Next Steps

1. Probar flujo completo en navegador: abrir http://localhost:5174/, crear lista, verificar snapshot y composición.
2. Implementar Fase 6 (Importación futura de listas) cuando sea prioridad.
3. Implementar Fase 7 (Comparador, sustitución, auth real) cuando sea prioridad.
4. Agregar tests unitarios al motor de cálculo (`src/lib/nutrients.ts`) según plan.
5. Revisar responsive y polishes de UI.
