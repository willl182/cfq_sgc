# Session State: formulador-sub_1 — Indicador de composición en catálogo

**Last Updated**: 2026-06-17 11:25

## Session Objective

Agregar un feature al catálogo del formulador web para identificar rápidamente qué productos tienen información de composición nutricional y cuáles no.

## Current State

- [x] Helper `hasCompositionInfo()` en `web/src/domain/catalog.ts`.
- [x] Filtro de catálogo: "Toda la composición" / "Con composición" / "Sin composición".
- [x] Badge visual en cada fila del catálogo (`Con composición` / `Sin composición`).
- [x] Estadísticas resumen: contadores de items con y sin composición.
- [x] Estilos CSS para badge y contadores en `web/src/style.css`.
- [x] Tests unitarios para `hasCompositionInfo` en `web/src/domain/catalog.test.ts`.
- [x] `pnpm test` pasa (29/29).
- [x] `pnpm build` y `vercel build` locales OK.
- [x] Deploy a producción en Vercel OK.

## Critical Technical Context

- Proyecto real está en `web/`; despliegue Vercel sirve desde `formulador-sub_1/web/`.
- El helper considera que un item tiene composición si **algún nutriente** de la lista `NUTRIENTS` es mayor a `0`.
- El filtro opera sobre `activeCatalog` junto con los filtros existentes de clase y búsqueda.
- Producción aliased a: https://formulador-sub.vercel.app

## URLs

- Producción: https://formulador-sub.vercel.app
- Deploy directo: https://formulador-6fw962213-will-salas-projects.vercel.app

## Next Steps

1. Verificar visualmente en producción el badge y el filtro con el catálogo cargado.
2. Considerar si se necesita exportar la columna "tiene composición" en el CSV de catálogo.
