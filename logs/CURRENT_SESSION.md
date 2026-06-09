# Session State: formulador_sub

**Last Updated**: 2026-06-05 02:57 America/Bogota

## Session Objective

Definir la arquitectura de backend real de `formulador-sub` y persistir el estado tecnico despues de validar el despliegue.

## Current State

- [x] Se confirmó que el frontend de Vercel carga correctamente en produccion.
- [x] Se confirmó que el backend actual es Google Apps Script + Google Sheets.
- [x] Se detectó que el flujo depende hoy de CORS hacia `script.google.com`, lo que rompe la carga remota directa en navegador.
- [x] Se añadieron caches locales/fallback para catálogo y fórmulas en el subproyecto.
- [x] Se publicó el subproyecto en Vercel como `will-salas-projects/formulador-sub`.

## Critical Technical Context

- `SGC_CALFERQUIM/formulador-sub/modules/api.js` apunta por defecto a un Web App de Google Apps Script.
- `SGC_CALFERQUIM/formulador-sub/google-apps-script.js` y `SGC_CALFERQUIM/formulador-sub/Codigo.gs` son el backend remoto real; no existe backend Node propio en el repo.
- El despliegue de Vercel sirve el frontend estático y los assets, pero no reemplaza el backend de Sheets.
- El repo raíz sigue con un árbol git muy sucio por cambios ajenos; no tocar ni revertir eso.

## Next Steps

1. Decidir si Google Sheets seguirá como backend principal o pasará a backup/exportación.
2. Si Sheets queda como backup, mover el estado operativo a cache/local/Vercel y tratar Sheets como sincronización.
