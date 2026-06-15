# Plan: Reconfiguracion Convex del Formulador

**Created**: 2026-06-09 13:03
**Updated**: 2026-06-09 13:03
**Status**: draft
**Slug**: reconfiguracion-convex

## Objetivo

Implementar el plan definido en `plan_codex.md`: migrar el aplicativo a Convex con catalogo vivo auditable, listas/formulas recalculables y snapshots historicos congelados.

## Fases

### Fase 1: Convex y catalogo

| # | Archivo | Accion | Notas |
|---|---------|--------|-------|
| 1.1 | `convex/schema.ts` | Crear | Tablas `catalogItems`, `catalogChangeHistory`, `productLists`, `productListSnapshots` |
| 1.2 | `insumos_ref/mp-pt_mzr.csv` | Usar | Fuente para carga inicial |
| 1.3 | UI Catalogo | Crear/Modificar | Edicion MP, PT/MZR solo admin local |

### Fase 2: Calculo y tolerancia

| # | Archivo | Accion | Notas |
|---|---------|--------|-------|
| 2.1 | modulo de calculo | Crear/Modificar | Base 1000, sin normalizacion automatica |
| 2.2 | `modules/tolerancias.js` | Modificar | Estado general `CUMPLE`, `CUMPLE_S`, `NO_CUMPLE`, `SIN_OBJETIVO` |

### Fase 3: Listas vivas

| # | Archivo | Accion | Notas |
|---|---------|--------|-------|
| 3.1 | vista Armado | Modificar/Crear | Componentes dinamicos `MP`, `PT`, `MZR` |
| 3.2 | vista Listas | Crear | Consecutivos por producto y alias opcional |

### Fase 4: Historico

| # | Archivo | Accion | Notas |
|---|---------|--------|-------|
| 4.1 | vista Historico | Crear | Snapshots congelados con versiones |
| 4.2 | permisos admin | Crear/Modificar | Usuarios archivan; admin elimina |

### Fase 5: Importacion futura

| # | Archivo | Accion | Notas |
|---|---------|--------|-------|
| 5.1 | vista Importacion | Crear | Seleccion de archivo, validacion y preview sin guardar |

## Log de Ejecucion

- [x] Sesion de decisiones completada.
- [x] Plan tecnico escrito en `plan_codex.md`.
- [x] Registro de grill-me escrito en `grillme_codex.md`.
- [ ] Implementacion iniciada.
