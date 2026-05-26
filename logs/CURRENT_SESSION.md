# Session State: SGC Calferquim - Reestructuración de Carpetas Internas en Procedimientos

**Last Updated**: 2026-05-26 09:47 -05

## Session Objective

Renombrar las carpetas internas de los 20 procedimientos obligatorios en `03_Procedimientos/` para que la visualización y ordenamiento sea secuencial (01_POE, 02_Formatos, 03_Registros) y no alfabético por defecto, y actualizar todas las referencias textuales a estas carpetas dentro del repositorio.

## Current State

- [x] Renombrado físico de 56 carpetas internas (`POE` -> `01_POE`, `Formatos` -> `02_Formatos`, `Registros` -> `03_Registros`) dentro de `SGC_CALFERQUIM/03_Procedimientos/3.01_*` a `3.20_*`.
- [x] Actualización de 8 archivos de índice, auditoría y procedimientos de postventa para corregir las rutas modificadas y evitar enlaces rotos en el SGC.
- [x] Consolidación y trackeo de los cambios en el index de Git (`git add .`).
- [x] Registro del hito técnico en `logs/history/260526_0945_findings.md`.

## Critical Technical Context

- La ruta principal activa del SGC es `SGC_CALFERQUIM/`.
- Las subcarpetas internas dentro de cada procedimiento en `03_Procedimientos/` ahora siguen la nomenclatura ordenada:
  - `01_POE` (Procedimientos Operativos Estándar)
  - `02_Formatos` (Formatos vacíos)
  - `03_Registros` (Registros diligenciados)
- Esto soluciona el problema del visor de archivos que listaba primero `Formatos`, luego `POE` y finalmente `Registros`, afectando la lógica de navegación para las auditorías del ICA.
- Todos los cambios se encuentran agregados al área de preparación de Git (`staged`), garantizando un historial de versión limpio.

## Next Steps

1. **Continuación con procedimientos del SGC:** Elaborar y normalizar los procedimientos obligatorios faltantes (Contramuestras, Control Documental, Retiro de Mercado/Recall, y Gestión del Laboratorio) directamente bajo las nuevas subcarpetas ordenadas en `SGC_CALFERQUIM/03_Procedimientos/`.
2. **Conciliación de Dossiers:** Mantener la coherencia de las etiquetas y balances de masa en `08_Dossier_Productos_Registrados/` y `10_Base_Datos_Tecnica/`.
