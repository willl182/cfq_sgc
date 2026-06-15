# Session State: CFQ Formulador — Auth Real Implementado (Fase 7 Completada)

**Last Updated**: 2026-06-10 11:55

## Session Objective

Continuar la implementación del plan integrado `grillme/plan_v1.md` en el orden establecido:
1. Conectar Convex (`npx convex dev` + `.env`).
2. Configurar `VITE_CONVEX_URL`.
3. Probar carga de CSV.
4. Refinar UI/UX.
5. Implementar Fase 7.
6. **Implementar auth real y roles persistidos (Fase 7 restante)** ✅

## Current State

- [x] Fase 1: Conectar Convex local (deployment `anonymous:anonymous-web` en `127.0.0.1:3210`).
- [x] Fase 2: `.env.local` configurado con `VITE_CONVEX_URL` y `CONVEX_DEPLOYMENT`.
- [x] Fase 3: Carga de CSV probada exitosamente (296 filas insertadas, 0 errores).
- [x] Fase 4: UI/UX refinada:
  - Autosave de borrador en `localStorage` con debounce 1.5s.
  - Barra de progreso visual de total kg (verde/amarillo/rojo).
  - Filtro de componentes a solo MP en formulación.
  - Alerta de mínimos NPK (`MINIMOS_NPK.SOLIDO_EDAFICO = 18%`).
  - Corrección de tipos `Id<"catalogItems">` y `v.union(v.null(), ...)` para compatibilidad con Convex.
- [x] Fase 5: Fase 7 implementada:
  - Creación manual de productos (PT/MZR) solo para admin con `createCatalogItem` y auditoría.
  - Comparador de snapshots (`compareSnapshots`) con diff de componentes, composición y estado.
  - Sustitución con sugerencias nutricionales (`suggestAlternatives` usando similitud coseno) en `FormulatePage`.
  - Validación de mínimos NPK como advertencia regulatoria.
- [x] **Fase 7: Auth real y roles persistidos implementados**:
  - Tabla `users` en Convex con campos: `name`, `email`, `passwordHash`, `role`, `isActive`, `createdAt`, `lastLoginAt`.
  - Mutaciones de auth: `register`, `login`, `getCurrentUser`, `listUsers`, `updateUser`, `changePassword`.
  - Hook `useAuth` reemplaza `useLocalAuth` — usa token persistente en `localStorage` (`cfq_auth_token`).
  - Validación de admin en mutaciones protegidas (`createCatalogItem`, `updateCatalogItem`, `archiveCatalogItem`).
  - UI de admin actualizada: login con email/contraseña, registro de usuarios, gestión de roles (activar/desactivar, cambiar rol).
  - Todas las páginas actualizadas (`CatalogPage`, `FormulatePage`, `SnapshotsPage`, `AdminPage`, `Navbar`) para usar `useAuth`.

## Critical Technical Context

- **Convex local**: Corriendo en background (`nohup npx convex dev` en `web/`). Log: `web/convex-dev.log`.
- **Deployment**: `anonymous:anonymous-web` (local).
- **Catálogo**: 296 items cargados desde CSV + 1 producto de prueba creado (`PT0269`).
- **Tests**: 11/11 pasando (calculation + tolerancia). Build Vite exitoso.
- **Warnings**: `lightningcss` sobre `@theme` (Tailwind v4) — no bloqueantes.
- **TypeScript**: `strict: false` en `tsconfig.json`.
- **Auth**: Sistema real con persistencia en Convex. Hash simple de contraseña (no bcrypt). Admin puede crear/editar PT/MZR; usuario normal solo MP.
- **Proceso background**: PID del `convex dev` debe revisarse si se reinicia el sistema.

## Next Steps

1. Detener/limpiar el backend local de Convex si se va a desplegar en la nube.
2. Ejecutar `npx convex login` y configurar un proyecto real en Convex.dev.
3. Actualizar `.env.local` con la URL de producción/dev en la nube.
4. Revisar y potencialmente mejorar la clasificación MZR (actualmente solo `COD.startsWith("R")`).
5. Agregar tests de integración para `createCatalogItem`, `compareSnapshots` y `suggestAlternatives`.
6. **Mejorar seguridad de auth**: Implementar bcrypt o hashing más robusto para contraseñas.
7. Refinar estilos Tailwind v4 o degradar a v3 para eliminar warnings de `lightningcss`.
8. Implementar recuperación de contraseña y validación de email.
9. Agregar rate limiting a login para prevenir ataques de fuerza bruta.
