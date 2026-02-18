# Plan: Implementacion ICA fase 2 (campo + homologacion + brechas medias)

**Created**: 2026-02-17 20:25
**Updated**: 2026-02-17 20:25
**Status**: in_progress
**Slug**: implementacion-ica-fase2

## Objetivo

Pasar del cierre documental inicial a evidencia operativa verificable para visita ICA, cerrando pendientes de implementacion en campo, homologacion de legacy parcial y brechas medias del plan macro.

## Alcance

1. Implementacion en campo de procedimientos 3.x ya documentados.
2. Homologacion de legacy parcial en 3.1, 3.11, 3.13, 3.15, 3.16 y 3.17.
3. Cierre de brechas medias: recall 7.02, trazabilidad de ventas, recepcion/almacenamiento MP y evidencia/resolucion de laboratorio ICA.

## Fase 1 - Implementacion en campo (evidencia real)

| # | Accion | Entregable | Responsable |
|---|---|---|---|
| 1.1 | Ejecutar piloto de 1-2 lotes por proceso documentado (3.03, 3.05, 3.06, 3.08, 3.09, 3.10, 3.12, 3.14, 3.18, 3.19, 3.20) | Formatos y registros diligenciados por lote | Produccion + Calidad |
| 1.2 | Completar firmas internas en registros criticos | Evidencias firmadas por Produccion/Calidad/Direccion Tecnica | Produccion + Calidad + Direccion Tecnica |
| 1.3 | Consolidar carpeta de evidencia de implementacion | `SGC_CALFERQUIM/03_Procedimientos/_Evidencia_Implementacion_ICA/` | Calidad |

### Criterio de cierre Fase 1

- Cada proceso con al menos un registro real diligenciado.
- Registros criticos con firmas internas segun rol.
- Evidencia accesible por proceso y lote.

## Fase 2 - Homologacion legacy parcial (3.1, 3.11, 3.13, 3.15, 3.16, 3.17)

| # | Accion | Entregable | Responsable |
|---|---|---|---|
| 2.1 | Redactar POE homologado 3.1 recepcion/almacenamiento MP | `POE_3.01_..._V1.md` + formato + registro | Direccion Tecnica + Produccion |
| 2.2 | Separar y homologar 3.11 codificacion de lotes | `POE_3.11_..._V1.md` + formato + registro | Calidad |
| 2.3 | Homologar 3.13 muestreo control calidad | `POE_3.13_..._V1.md` + formato + registro | Laboratorio + Calidad |
| 2.4 | Homologar 3.15 higiene/seguridad industrial | `POE_3.15_..._V1.md` + registro de verificacion | SST + Produccion |
| 2.5 | Unificar 3.16 PQR en POE maestro | `POE_3.16_PQR_V1.md` + formato tiempos respuesta | Servicio al Cliente + Calidad |
| 2.6 | Homologar 3.17 almacenamiento producto terminado | `POE_3.17_..._V1.md` + formato segregacion/control | Logistica + Calidad |

### Criterio de cierre Fase 2

- Los 6 modulos quedan en formato ICA uniforme.
- Cada modulo cuenta con formato y registro operativo asociado.
- Se conserva referencia a legacy como respaldo historico.

## Fase 3 - Cierre de brechas medias del plan macro

| # | Accion | Entregable | Responsable |
|---|---|---|---|
| 3.1 | Crear POE 7.02 recall/retiro | `POE_7.02_Retiro_Producto_V1.md` + formato de simulacro/retiro | Direccion Tecnica + Calidad |
| 3.2 | Formalizar trazabilidad de ventas | `POE_Trazabilidad_Ventas_V1.md` + registro lote-cliente | Logistica + Comercial |
| 3.3 | Formalizar POE recepcion/almacenamiento MP (si no se integra en 3.1) | POE + formato inspeccion ingreso | Produccion + Compras |
| 3.4 | Consolidar evidencia/resolucion laboratorio ICA | Carpeta con soporte oficial y control de vigencia | Direccion Tecnica + Calidad |

### Criterio de cierre Fase 3

- Las 4 brechas medias pasan a estado cerrado o cerrado-condicionado (si depende de tercero).
- Evidencia documental y rutas definidas para auditoria.

## Salidas de control

1. Actualizar matriz 3.x con estado `OK/PARCIAL/N/A` por evidencia real.
2. Actualizar `logs/CURRENT_SESSION.md` al cierre de cada hito.
3. Registrar hallazgos en `logs/history/` por bloque finalizado.

## Riesgos y mitigacion

- Riesgo: falta de tiempo operativo para diligenciar pilotos.
  - Mitigacion: ejecutar piloto minimo de 1 lote por proceso critico y ampliar despues.
- Riesgo: firmas internas incompletas.
  - Mitigacion: ventana de firma semanal con lista de pendientes por responsable.
- Riesgo: evidencia externa de laboratorio incompleta.
  - Mitigacion: cierre condicionado con plan de solicitud y fecha compromiso.

## Secuencia recomendada de ejecucion

1. Fase 1 (evidencia real) para sostener auditoria en sitio.
2. Fase 2 (homologacion legacy) para uniformidad documental.
3. Fase 3 (brechas medias) para cierre integral de cumplimiento.
