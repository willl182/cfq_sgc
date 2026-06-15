# Plan: Formulador CFQ v1 Integrado

**Created**: 2026-06-09 13:40
**Updated**: 2026-06-09 13:40
**Status**: draft
**Slug**: formulador-v1

## Objetivo

Consolidar los planes y sesiones `grillme` de Codex, OC y Pi K26 en una especificacion unica para ajustar el formulador CFQ con Convex, catalogo vivo, listas recalculables y snapshots historicos.

## Resultado

Se creo `grillme/plan_v1.md` con el plan integrado. El documento adopta `plan_codex.md` como rector, incorpora trazabilidad y autosave de `plan_oc.md`, y toma de `plan_pi_k26.md` solo la estructura frontend y funciones avanzadas compatibles.

## Fases

| # | Area | Accion | Notas |
|---|------|--------|-------|
| 1 | Convex | Definir schema canonico e indices | `catalogItems`, `catalogChangeHistory`, `productLists`, `productListSnapshots` |
| 2 | Seed | Validar y cargar `mp-pt_mzr.csv` | Solo admin, solo si catalogo esta vacio |
| 3 | Calculo | Extraer motor puro de formulas y tolerancias | Base 1000 kg, sin normalizacion |
| 4 | Catalogo | Implementar vista editable con permisos y auditoria | MP normal; PT/MZR admin |
| 5 | Listas | Implementar listas vivas y snapshots versionados | Snapshot en cada guardado persistente |
| 6 | Historico | Mostrar snapshots congelados | Filtrable por producto, lista, fecha y estado |
| 7 | Importacion | Preview de importacion futura | Validar sin persistir |

## Log de Ejecucion

- [x] Comparacion de registros `grillme_*` completada con subagente.
- [x] Comparacion de planes `plan_*` completada con subagente.
- [x] Plan integrado guardado en `grillme/plan_v1.md`.
- [ ] Implementacion pendiente.
