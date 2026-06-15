# Session State: Formulador Sub

**Last Updated**: 2026-06-09 15:30 -05

## Session Objective

Implementar la reconfiguración del formulador CFQ de acuerdo con el plan integrado de ajuste definido en `grillme/plan_v1.md`.

## Current State

- [x] Leída la memoria y el plan rector integrado.
- [x] Creada la base de datos Convex (schema) e índices en `web/convex/schema.ts`.
- [x] Implementado el seeding con validación rigurosa de CSV en `web/convex/catalog.ts`.
- [x] Extraído el motor puro de cálculo de grados NPK y evaluación de tolerancias ICA (Grupo 1, 2 y 3) en `web/convex/calculations.ts`.
- [x] Implementados los tests unitarios en `web/convex/tests.ts` para validar tolerancias (CUMPLE, CUMPLE_S, NO_CUMPLE, peso distinto de 1000 kg).
- [x] Implementado el CRUD de recetas vivas (recalculadas en tiempo real) y snapshots históricos congelados en `web/convex/lists.ts`.
- [x] Creada la estructura manual de tipos de Convex en `web/convex/_generated` para permitir compilación TypeScript 100% offline sin dependencias de la nube en desarrollo.
- [x] Desarrollado el frontend React/TypeScript en `web/src/App.tsx` y en los componentes `CatalogView.tsx`, `FormulationView.tsx`, `ListHistoryView.tsx`, y `ImportView.tsx`.
- [x] Implementado un hook de compatibilidad y fallback offline en `web/src/hooks/useConvex.ts` que redirige consultas y mutaciones a `localStorage` de forma automática, permitiendo que la aplicación funcione al 100% en el navegador de manera autónoma.
- [x] Integrado el sistema de estilos premium de Calferquim en `web/src/style.css` y configurado el build con `@vitejs/plugin-react` y `tsconfig.json`.
- [x] Verificado que el proyecto compila y construye de forma correcta (`pnpm run build` finalizado con éxito).

## Critical Technical Context

- **Convex Offline Typings**: Se crearon mocks manuales de tipado en `web/convex/_generated` que permiten compilar TypeScript de forma 100% exitosa sin necesidad de contar con una cuenta de Convex Cloud activa durante la compilación.
- **Seeding del Catálogo**: La inicialización del catálogo base lee el CSV `/mp-pt_mzr.csv` desde la carpeta pública de Vite mediante fetch en el navegador y lo inserta en Convex mediante una mutación que previene dobles cargas y valida nutrientes, comas decimales, nombres vacíos e IDs secuenciales (`MP0001`, `PT0001`, `MZR0001`).
- **Autoguardado y Debounce**: Tanto la edición de catálogo (1200ms) como la de formulación (2500ms) cuentan con mecanismos de autosave con debounce que actualizan los datos en segundo plano.

## Next Steps

1. Servidor de desarrollo activo en http://192.168.1.100:8081/
2. Vincular la aplicación web a una cuenta de producción de Convex ejecutando `npx convex dev` en la carpeta `web` si se desea sincronización real en la nube.
3. Cargar el catálogo base desde la interfaz de administrador local pulsando el botón "Inicializar Catálogo (CSV)" en la pestaña de Catálogo.
