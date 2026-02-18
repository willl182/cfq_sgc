# Plan: Cierre POE pendientes (3.05, 3.12, 3.14, 3.18, 3.19, 3.20)

**Created**: 2026-02-17 19:33
**Updated**: 2026-02-17 19:33
**Status**: in_progress
**Slug**: cierre-poe-pendientes

## Objetivo

Cerrar los POE y formato pendientes del bloque critico ICA con estructura completa y estandarizada, excluyendo secciones de SST y ambiental por decision del usuario.

## Alcance

- `3.05` Balance de materias primas.
- `3.12` Formato de liberacion de lotes.
- `3.14` Contramuestras.
- `3.18` Disposicion de barreduras.
- `3.19` Formulaciones para terceros.
- `3.20` Entrega de MP importacion/terceros.

## Estructura documental objetivo

Todos los POE quedaran en formato completo con estos apartados:

1. Objetivo
2. Alcance
3. Definiciones
4. Responsabilidades
5. Procedimiento
6. Criterios de control/aceptacion
7. Registros asociados
8. Anexos (si aplica)
9. Control de cambios

Exclusion acordada: no incluir secciones de SST ni ambiental.

## Plan de implementacion

### Fase 1 - Normalizacion base (documental)

| # | Accion | Resultado esperado |
|---|---|---|
| 1.1 | Homologar plantilla de POE en los 5 borradores V1 | Misma estructura y lenguaje en todos los documentos |
| 1.2 | Ajustar encabezados (codigo, version, vigencia, responsable) | Trazabilidad documental consistente |
| 1.3 | Incluir apartados de definiciones y anexos donde falten | Formato completo en cada POE |

### Fase 2 - Cierre tecnico por POE

| # | Accion | Resultado esperado |
|---|---|---|
| 2.1 | Completar POE `3.05` (formula, tolerancia, frecuencia, escalamiento) | Criterio de balance por lote verificable |
| 2.2 | Completar POE `3.14` (retencion, custodia, acceso y descarte) | Trazabilidad de contramuestra por lote |
| 2.3 | Completar POE `3.18` (segregacion, destino final, evidencias) | Control de barreduras sin reincorporacion |
| 2.4 | Completar POE `3.19` (solicitud, aprobacion, versionado y cambios) | Flujo formal para formulaciones de terceros |
| 2.5 | Completar POE `3.20` (ingreso, segregacion, entrega y conciliacion) | Trazabilidad documental de MP a terceros |

### Fase 3 - Formato 3.12 y coherencia transversal

| # | Accion | Resultado esperado |
|---|---|---|
| 3.1 | Expandir `Formato_Liberacion_Lotes_V1.csv` con campos de decision y firma | Formato utilizable en operacion real |
| 3.2 | Alinear referencias cruzadas entre POE y formato 3.12 | Coherencia de codigos y registros asociados |
| 3.3 | Validar consistencia de estados de lote (Cuarentena/Aprobado/Rechazado) | Criterio unico de liberacion |

### Fase 4 - Cierre de pendientes y evidencia de cumplimiento

| # | Accion | Resultado esperado |
|---|---|---|
| 4.1 | Revisar cada archivo `PENDIENTE_*.md` contra version final | Pendientes tecnicos cerrados |
| 4.2 | Actualizar estado de sesion en `logs/CURRENT_SESSION.md` | Punto de reanudacion claro |
| 4.3 | Registrar hallazgos en `logs/history/` | Evidencia inmutable de avance |

## Entregables

- `SGC_CALFERQUIM/03_Procedimientos/3.05_Balance_Materias_Primas/POE/POE_3.05_Balance_Materias_Primas_V1.md`
- `SGC_CALFERQUIM/03_Procedimientos/3.14_Contramuestras/POE/POE_3.14_Contramuestras_V1.md`
- `SGC_CALFERQUIM/03_Procedimientos/3.18_Disposicion_Residuos/POE/POE_3.18_Disposicion_Barreduras_V1.md`
- `SGC_CALFERQUIM/03_Procedimientos/3.19_Formulaciones_Terceros/POE/POE_3.19_Formulaciones_Terceros_V1.md`
- `SGC_CALFERQUIM/03_Procedimientos/3.20_Entrega_MP_Importacion_Terceros/POE/POE_3.20_Entrega_MP_Importacion_Terceros_V1.md`
- `SGC_CALFERQUIM/03_Procedimientos/3.12_Liberacion_Lotes/Formatos/Formato_Liberacion_Lotes_V1.csv`

## Criterios de aceptacion

- Los 5 POE tienen formato completo y homogeno.
- Ningun POE contiene secciones de SST o ambiental.
- El formato 3.12 permite registrar lote, resultado, estado, responsables, firmas y observaciones.
- Cada POE referencia al menos un registro operativo verificable.
- No se modifican documentos legales ICA ni archivos `.xlsm`.

## Riesgos y mitigacion

- Riesgo: ambiguedad operativa en tolerancias y tiempos de retencion.
  - Mitigacion: dejar valores iniciales conservadores y marcados como revisables por Direccion Tecnica.
- Riesgo: diferencias entre practica actual y texto del POE.
  - Mitigacion: lenguaje operativo y verificable, evitando requisitos no ejecutables.

## Secuencia de ejecucion inmediata

1. Ejecutar Fase 1 completa.
2. Ejecutar Fase 2 por orden: 3.05 -> 3.14 -> 3.18 -> 3.19 -> 3.20.
3. Ejecutar Fase 3 (formato 3.12).
4. Ejecutar Fase 4 (cierre y trazabilidad en logs).
