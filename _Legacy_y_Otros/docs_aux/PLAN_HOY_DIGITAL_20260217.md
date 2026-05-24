# Plan de Hoy - Ejecucion Digital SGC (17-02-2026)

## Objetivo del dia

Migrar el foco de trabajo a revision digital (sin archivo fisico), dejando una base auditable en `SGC_CALFERQUIM/` y avanzando sobre dossiers priorizados por `reg_ica_actu.csv`.

## Alcance hoy

1. Crear estructura digital Opcion B completa en `SGC_CALFERQUIM/`.
2. Crear los 59 dossiers base (estructura de 5 subcarpetas por producto).
3. Generar matriz de priorizacion y trazabilidad (`reg_ica_actu.csv` + mapeos confirmados).
4. Iniciar carga documental de productos prioritarios (`DOCUMENTO=S`) sin eliminar fuentes.
5. Dejar pendientes documentales criticos listos para redaccion por plantilla (3.05, 3.14, 3.18, 3.19, 3.20, contrato asesor).

## Reglas operativas del dia

- Estrategia `copy-first`: copiar primero, depurar despues.
- No renombrar ni alterar evidencias legales de origen en `202_CALFERQUIM/08 Registros ICA/`.
- `BIOPLANTAS` y `BIOCalfer` se manejan como productos separados.
- `CALFERCOBRE` se mantiene como `CALFERCOBRE` (no `CALCOBRE`).
- Todo faltante va con marca visible `PENDIENTE_*.md` para auditoria digital.

## Priorizacion de dossiers

- Capa 1: Productos de `reg_ica_actu.csv`.
- Capa 2 (dentro de Capa 1): `DOCUMENTO=S` -> `DOCUMENTO=N` -> sin dato.
- Capa 3: Completar el resto hasta cerrar 59 dossiers.

## Mapeos de nombres confirmados

- `CALFERBORO` -> `BORO GRANULADO`
- `CALFERQUIM SILIMAGRAN 30` -> `SILIMAGRAM`
- `RAIFOS` -> `RAIFOS 20`
- `CALFERCOBRE` -> `CALFERCOBRE`
- `ZUELO-CA` -> `ZUELOCa`
- `AFOS-K 0-40-50` -> `AFOSK`
- `SOLURAIFOS` -> `SOLURaiFOS`

## Entregables de hoy

1. Estructura `SGC_CALFERQUIM/` creada.
2. `08_Dossier_Productos_Registrados/` con 59 productos base.
3. `SGC_CALFERQUIM/00_Inbox/Priorizacion_Dossiers_20260217.csv`.
4. Primer bloque de dossiers prioritarios con documentos cargados y faltantes marcados.
5. Estado actualizado en `logs/CURRENT_SESSION.md`.

## Criterio de cierre del dia

- Existe navegacion digital completa por estructura ICA.
- Hay evidencia documental en los dossiers prioritarios.
- Queda lista la cola de redaccion de documentos faltantes ALTA.
