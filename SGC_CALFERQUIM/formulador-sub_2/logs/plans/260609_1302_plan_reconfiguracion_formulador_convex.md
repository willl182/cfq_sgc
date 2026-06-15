# Plan: Reconfiguracion Formulador Convex

**Created**: 2026-06-09 13:02 America/Bogota
**Updated**: 2026-06-09 13:02 America/Bogota
**Status**: draft
**Slug**: reconfiguracion-formulador-convex

## Objetivo

Reconfigurar `formulador-sub` para usar Convex como base operativa, precargar `insumos_ref/mp-pt_mzr.csv`, calcular composiciones base 1000 kg, validar tolerancias, guardar listas vivas por producto y conservar snapshots historicos.

## Fases

### Fase 1: Base Convex

| # | Archivo | Accion | Notas |
|---|---------|--------|-------|
| 1.1 | `package.json` | Crear/Modificar | Agregar dependencia y scripts de Convex si no existen. |
| 1.2 | `convex/schema.*` | Crear | Tablas `catalogItems`, `formulaLists`, `formulaSnapshots`, `catalogChangeLog`. |
| 1.3 | `convex/*` | Crear | Queries/mutations para catalogo, listas, snapshots y logs. |

### Fase 2: Seed Inicial

| # | Archivo | Accion | Notas |
|---|---------|--------|-------|
| 2.1 | `insumos_ref/mp-pt_mzr.csv` | Leer | Fuente inicial, Convex debe estar vacio. |
| 2.2 | `scripts/*` o `convex/*` | Crear | Importar en orden CSV. |
| 2.3 | `catalogItems` | Poblar | `MP000X`, `PT000X`, `MZR000X`; `COD_ORIGINAL`; `ORIGEN=BASE_CSV`. |

### Fase 3: API y Catalogo

| # | Archivo | Accion | Notas |
|---|---------|--------|-------|
| 3.1 | `modules/api.js` | Modificar | Reemplazar dependencia operativa de Sheets por Convex. |
| 3.2 | `modules/catalogo.js` | Modificar | Leer catalogo vivo desde Convex. |
| 3.3 | `modules/inventario-editor.js` | Modificar | Permisos MP/PT/MZR, autosave con debounce y log. |

### Fase 4: Formulador y Listas

| # | Archivo | Accion | Notas |
|---|---------|--------|-------|
| 4.1 | `modules/formulador.js` | Modificar | Listas `L1`, `L2`, `L3` por producto destino. |
| 4.2 | `modules/formulador.js` | Modificar | Componentes permitidos: `MP`, `PT`, `MZR`. |
| 4.3 | `modules/formulador.js` | Modificar | Alertas persistentes si total distinto de 1000 kg. |

### Fase 5: Snapshots y Tolerancias

| # | Archivo | Accion | Notas |
|---|---------|--------|-------|
| 5.1 | `modules/formulas-guardadas.js` | Modificar | Mostrar listas vivas y snapshots. |
| 5.2 | `modules/tolerancias.js` | Modificar | Evaluar solo nutrientes declarados del PT destino. |
| 5.3 | `convex/*` | Crear/Modificar | Snapshot automatico antes de sobrescribir lista existente. |

## Log de Ejecucion

- [x] Sesion grill-me completada.
- [x] Plan operativo escrito en `plan_oc.md`.
- [x] Registro de decisiones escrito en `grillme_oc.md`.
- [ ] Fase 1 iniciada.
