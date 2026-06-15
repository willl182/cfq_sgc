# Session State: formulador-sub_2

**Last Updated**: 2026-06-10 14:01 America/Bogota

## Session Objective

Verificar carga CSV en navegador e integrar formulas-guardadas.js con ProductLists (catálogo).

## Current State

- [x] CsvParser detecta automáticamente delimitador ";" (puntoycoma) vs "," vs tab
- [x] parseProductos() maneja columnas faltantes (ID_PROD ausente → fallback a COD)
- [x] Catalogo._preloadFromBundledCsv() busca insumos_ref/mp-pt_mzr.csv como fuente primaria
- [x] FormulasGuardadas carga catálogo vía Api.fetchMP() y resuelve NOMBRE_DESTINO desde el catálogo
- [x] Prueba de integración: 296 productos parseados (8 MP, 288 PT)

## Critical Technical Context

- `insumos_ref/mp-pt_mzr.csv` usa `;` como delimitador (no `,`)
- El CSV no tiene columna `ID_PROD`; el código ahora usa `COD` como fallback para `ID_PROD`
- `FormulasGuardadas` ahora carga catálogo en `_loadCatalogo()` y usa `_resolveNombreDestino()` para mostrar nombres de producto
- `_preloadFromBundledCsv()` intenta rutas con `import.meta.url` y luego rutas relativas como fallback
- El backend real sigue siendo Google Apps Script; CORS es el bloqueo para carga directa desde navegador

## Next Steps

1. Verificar que el servidor local (Vercel dev o similar) sirva insumos_ref/mp-pt_mzr.csv correctamente
2. Probar la importación manual de CSV desde el botón "Importar CSV" en Catálogo
3. Validar que el flujo Recetas → Formulador mantiene datos del catálogo al editar/clonar