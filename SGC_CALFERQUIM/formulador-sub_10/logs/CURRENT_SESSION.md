# Session State: Formulador Sub

**Last Updated**: 2026-06-09 13:40 -05

## Session Objective

Comparar los registros y planes `grillme` producidos por Codex, OC y Pi K26, consolidar fortalezas/debilidades/faltantes, y guardar un plan integrado de ajuste para la reconfiguracion del formulador.

## Current State

- [x] Leida memoria previa del proyecto.
- [x] Revisados los registros `grillme/grillme_codex.md`, `grillme/grillme_oc.md` y `grillme/grillme_pi_k26.md` mediante subagente.
- [x] Revisados los planes `grillme/plan_codex.md`, `grillme/plan_oc.md` y `grillme/plan_pi_k26.md` mediante subagente.
- [x] Identificadas fortalezas, debilidades, faltantes y contradicciones principales entre los seis documentos.
- [x] Creado `grillme/plan_v1.md` como plan integrado de ajuste.
- [ ] Implementar la reconfiguracion en codigo.

## Critical Technical Context

Decisiones consolidadas en `grillme/plan_v1.md`:

- `plan_codex.md` queda como fuente primaria cuando haya conflicto.
- Modelo canónico recomendado: `catalogItems`, `catalogChangeHistory`, `productLists`, `productListSnapshots`.
- No duplicar catalogo en tablas separadas `insumos` y `productos`.
- Convex sera fuente de verdad principal.
- Catalogo base desde `insumos_ref/mp-pt_mzr.csv`, cargado por boton admin solo si Convex esta vacio.
- IDs internos exactos: `MP0001`, `PT0001`, `MZR0001`, no editables, con `COD`/`COD_ORIGINAL` conservados para trazabilidad.
- Componentes de listas pueden ser `MP`, `PT` o `MZR`.
- Recetas/listas vivas recalculan al leer/renderizar con catalogo vigente; no persistir recalculos derivados como fuente de verdad.
- Todo guardado persistente de lista crea snapshot versionado (`v1`, `v2`, `v3`) en la misma mutacion server-side.
- Base fija 1000 kg; no normalizar; permitir guardar con alerta si total no suma 1000.
- Cantidades maximo 2 decimales; composiciones guardadas hasta 4 y visibles con 2.
- `SUP` produce `CUMPLE_S`, no `NO_CUMPLE`.
- Minimos NPK quedan como validacion regulatoria posterior o advertencia separada, no bloquean la fase inicial.
- Auth real queda para futuro; no fijar WorkOS todavia.
- Comparador, sustitucion y creacion manual de productos quedan fuera del nucleo inicial.

## Key Files

- `grillme/plan_v1.md`
- `grillme/plan_codex.md`
- `grillme/plan_oc.md`
- `grillme/plan_pi_k26.md`
- `grillme/grillme_codex.md`
- `grillme/grillme_oc.md`
- `grillme/grillme_pi_k26.md`
- `insumos_ref/mp-pt_mzr.csv`
- `insumos_ref/formula.md`
- `insumos_ref/tolerancia.md`

## Next Steps

1. Verificar el estado real del scaffold actual (`package.json`, estructura `src/`, `convex/`) antes de tocar codigo.
2. Verificar contra `insumos_ref/mp-pt_mzr.csv` la regla exacta para clasificar `MZR` (`R`, `R1`, `R2`, etc.).
3. Implementar Fase 1 del plan: schema Convex canonico, indices, validacion CSV y carga inicial admin.
4. Implementar Fase 2: motor puro de calculo/tolerancia y pruebas unitarias.
