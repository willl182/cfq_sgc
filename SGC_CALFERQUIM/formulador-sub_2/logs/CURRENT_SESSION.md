# Session State: Formulador CFQ - Implementacion plan_v1.md

**Last Updated**: 2026-06-09 14:23

## Session Objective

Implementar el Plan Integrado de Ajuste del Formulador CFQ segun `grillme/plan_v1.md`. Migrar de la arquitectura Google Apps Script + JS vanilla a Convex + React + TypeScript.

## Current State

- [x] Fase 1: Base Convex y seed - Schema con 4 tablas, indices, mutacion seed con validacion CSV
- [x] Fase 2: Motor de calculo y tolerancia - Modulos puros TypeScript compartidos
- [x] Fase 3: Catalogo editable - Vista React con busqueda, filtros, edicion inline, importacion CSV, historial
- [x] Fase 4: Armado y listas vivas - Formulador con componentes dinamicos, preview en tiempo real, guardado con snapshot
- [x] Fase 5: Historico - Vista de snapshots filtrable, detalle congelado, clonar a nueva lista
- [ ] Fase 6: Importacion futura de listas (sin persistencia) - Pendiente

## Critical Technical Context

- **Convex backend** corre en `http://127.0.0.1:3210` (desarrollo local)
- **Vite frontend** en `web/` usa React + TypeScript + CSS custom (no Tailwind en produccion)
- **4 tablas Convex**: `catalogItems`, `catalogChangeHistory`, `productLists`, `productListSnapshots`
- **IDs internos**: MP0001, PT0001, MZR0001 (4 digitos, padding)
- **Clasificacion MZR**: `COD = "R"` o patrones `R1`, `R2` -> clase MZR
- **Calculo**: `aporte = cantidadKg * concentracion / 1000`
- **Snapshots**: Se crean en cada guardado persistente, versionados v1, v2, v3
- **Admin local**: localStorage key `cfq_admin`
- **CSV semilla**: `insumos_ref/mp-pt_mzr.csv` (separador `;`, 296 registros)
- **Composiciones guardadas**: 4 decimales interno, 2 visuales
- **Tolerancias**: 3 grupos (N/P polinomica, K polinomica distintos coef, resto min(X/2, 1.5, ecuacion_lineal))

## Architecture

```
web/
├── convex/                          # Backend Convex
│   ├── schema.ts                    # 4 tablas con indices
│   ├── catalogItems.ts             # Queries: getAll, getByInternalId, getById, getCount, isEmpty
│   ├── catalogMutations.ts         # Mutations: seedFromCsv, updateCatalogItem, archiveCatalogItem, clearCatalog
│   ├── productLists.ts              # Queries + Mutations: listAll, getByDisplayCode, getById, save, archiveList
│   ├── productListSnapshots.ts     # Queries + Mutations: list*, archive, cloneSnapshotToList
│   └── _generated/                  # Auto-generated Convex API types
├── src/
│   ├── main.tsx                     # React entry point with ConvexProvider + BrowserRouter
│   ├── App.tsx                      # Routes: /catalogo, /formulador, /formulador/:listId, /historico
│   ├── lib/
│   │   ├── constants.ts            # NUTRIENT_KEYS, tipos, BASE_KG
│   │   ├── tolerancias.ts          # Motor puro: calcTolerancia, evaluar, evaluarTodos, calcularComposicion
│   │   └── index.ts                # Re-exports + utilidades (fmtNum, fmtGrade, parseNum, etc.)
│   ├── components/
│   │   └── Layout.tsx              # Sidebar con nav + toggle admin
│   ├── views/
│   │   ├── CatalogView.tsx         # Vista catalogo con importar CSV, editar inline, archivar
│   │   ├── FormuladorView.tsx      # Formulador con componentes dinamicos, preview, guardado+snapshot
│   │   └── HistoricoView.tsx       # Historico de snapshots con filtros, detalle, clonar
│   └── styles/
│       └── index.css               # Estilos dark theme completos
├── index.html                       # SPA shell
├── vite.config.ts                   # Vite config con React plugin
└── tsconfig.json                    # TypeScript config con JSX
```

## Next Steps

1. Fase 6: Vista de importacion futura (CSV de listas, sin persistencia inicial)
2. Testing con datos reales del CSV `mp-pt_mzr.csv`
3. Automatizar dev workflow (Convex dev + Vite dev concurrently)
4. Considerar auth provider futuro (WorkOS o similar, no hardcodear)