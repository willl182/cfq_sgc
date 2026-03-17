# Session State: SGC CALFERQUIM

**Last Updated**: 2026-03-05 09:41

## Session Objective

Ubicar instructivos legacy de muestreo (bultos/sacos y granel) e integrarlos en el POE 3.06 de Mezcla/Homogeneizacion.

## Current State

- [x] Instructivos `Instructivo_Sacos.docx` e `Instructivo_Granel.docx` movidos a `SGC_CALFERQUIM/03_Procedimientos/3.06_Mezcla_Homogenizacion/POE/Legacy/`.
- [x] `POE_3.06_Mezcla_Homogenizacion_V1.md` actualizado para referenciar ambos instructivos legacy en la seccion de documentos de referencia.
- [x] Estructura `POE/Legacy` para 3.06 verificada con archivos en sitio.

## Critical Technical Context

- No se eliminaron archivos; solo se reubicaron dos `.docx` desde raiz del repositorio hacia `POE/Legacy`.
- El cambio documental se aplico en el POE markdown activo de `SGC_CALFERQUIM` (no en `poe_rev/`).
- Rutas de legacy usadas:
  - `Legacy/Instructivo_Sacos.docx`
  - `Legacy/Instructivo_Granel.docx`

## Next Steps

1. Si se requiere sincronizacion documental, replicar el mismo ajuste en `poe_rev/POE_3.06_Mezcla_Homogenizacion_V1.md`.
2. (Opcional) Convertir o vincular estos instructivos en el modulo `3.13_Muestreo_Control_Calidad` para trazabilidad cruzada.
