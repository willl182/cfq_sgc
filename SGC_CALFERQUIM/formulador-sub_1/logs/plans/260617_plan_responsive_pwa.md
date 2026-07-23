# Plan: Responsive + PWA para Formulador Móvil (Opción A)

**Proyecto**: `formulador-sub_1/web` — CALFERQUIM SGC  
**Fecha**: 2026-06-17  
**Estimación**: 1 día de trabajo (2-3 sesiones de agente)  
**Depende de**: Código actual funcional en desktop, build Vite estable.

---

## 1. Objetivo

Que la app formulador funcione cómodamente en pantallas de 320px a 900px, se pueda instalar como PWA en Android/iOS, y mantenga todas las funcionalidades actuales (catálogo, formulador, escala, historial, importación) sin pérdida de datos.

---

## 2. Entregables

| # | Entregable | Criterio de aceptación |
|---|-----------|------------------------|
| D1 | Layout responsive optimizado | Navegación usable en iPhone SE (375px) sin scroll horizontal forzado en vistas principales |
| D2 | PWA instalable | `manifest.json` válido, iconos, tema, y service worker para cache estático. Lighthouse PWA score ≥ 90 |
| D3 | UX táctil mejorada | Botones ≥ 44x44px, inputs con altura ≥ 44px, dropdowns no se cortan en móvil |
| D4 | Build y despliegue funcionando | `pnpm build` sin errores, desplegado en Vercel con misma URL, visible en móvil |

---

## 3. Paquetes de Trabajo

### WP1 — Refactor de navegación móvil
**Archivos**: `style.css`, `main.tsx`  
**Tareas**:
- T1.1: Reemplazar sidebar sticky-top en `@media (max-width: 900px)` por **bottom navigation bar** fija (barra inferior con 4-5 tabs: Formular, Catálogo, Escala, Historial, Importar).
- T1.2: Mover selector de rol (admin/user) a un menú hamburguesa o dentro de un sheet/drawer deslizable en móvil.
- T1.3: Ocultar texto de marca en móvil; dejar solo icono/marca compacta.

**Criterio de aceptación**: En pantalla 375px se accede a todas las vistas sin scroll vertical para navegar.

### WP2 — Grids y tablas responsivos
**Archivos**: `style.css`  
**Tareas**:
- T2.1: En `.form-grid`, `.scale-grid`, `.import-grid` cambiar a `grid-template-columns: 1fr` en ≤900px (ya existe, verificar que no haya fugas de min-width).
- T2.2: En tablas con `min-width: 720px` (`.contribution-table`, `.scale-table`) implementar **scroll horizontal envuelto** o **card-based layout** en ≤600px (convertir filas de tabla en cards apiladas).
- T2.3: Revisar `.create-catalog-item`, `.target-create-fields` para que en ≤540px sean columnas únicas sin desbordamiento.

**Criterio de aceptación**: No hay overflow-x no intencional en ninguna vista a 375px.

### WP3 — UX táctil y componentes
**Archivos**: `style.css`, `main.tsx`  
**Tareas**:
- T3.1: Aumentar padding de botones en móvil (`min-height: 44px`, `min-width: 44px`).
- T3.2: Aumentar altura de `input` y `select` a `min-height: 44px` en táctil.
- T3.3: Revisar `.combo-menu` en móvil: que no se desborde de viewport (usar `position: fixed` o `max-height: 50vh` con `z-index` alto).
- T3.4: Drag-and-drop de componentes: en táctil, añadir botones ▲/▼ como alternativa a drag, o usar un polyfill de touch-DnD.

**Criterio de aceptación**: Se puede formular una lista completa usando solo el dedo, sin teclado físico.

### WP4 — PWA (Manifest + Service Worker)
**Archivos nuevos**: `public/manifest.json`, `public/icons/`, `src/sw.ts` (o usar Vite PWA plugin)  
**Archivos a modificar**: `index.html`, `vite.config.ts` (si aplica)  
**Tareas**:
- T4.1: Crear `manifest.json` con nombre corto/largo, colores (`#162119`, `#2d8c5a`), íconos (favicon escalado a 192x192 y 512x512).
- T4.2: Inyectar `<link rel="manifest">` en `index.html`.
- T4.3: Generar service worker que cachee el shell de la app (`index.html`, `.js`, `.css`, iconos) y el CSV de datos (`/data/mp-pt_mzr.csv`).
  - Opción A (simple): usar `vite-plugin-pwa`.
  - Opción B (manual): escribir SW básico con `self.addEventListener('install', ...)` y estrategia Cache-First.
- T4.4: Añadir `theme-color` meta tag en `index.html`.

**Criterio de aceptación**: Chrome/Edge/Safari sugieren "Agregar a pantalla de inicio". La app abre offline (al menos el shell).

### WP5 — Optimización de meta y viewport
**Archivos**: `index.html`  
**Tareas**:
- T5.1: Verificar/ajustar `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` o equivalente accesible.
- T5.2: Añadir `apple-mobile-web-app-capable` y `apple-mobile-web-app-status-bar-style` para iOS.

### WP6 — Test, Build y Despliegue
**Tareas**:
- T6.1: Ejecutar `pnpm test` (Vitest) para confirmar que lógica de dominio no se rompe.
- T6.2: Ejecutar `pnpm build` y verificar que no hay errores de TypeScript ni de Vite.
- T6.3: Abrir el build local con `pnpm preview` y validar en DevTools modo iPhone SE + Galaxy S8.
- T6.4: Desplegar a Vercel (`pnpm exec vercel --prod` o `vercel --prod` según config).
- T6.5: Validar en dispositivo físico o BrowserStack: instalación PWA, navegación, guardar lista, ver escala.

---

## 4. Hitos

| Hito | Descripción | Cuándo |
|------|-------------|--------|
| M1 | Navegación móvil lista (WP1 completo) | Fin sesión 1 |
| M2 | Layouts sin scroll horizontal (WP2+WP3) | Medio sesión 2 |
| M3 | PWA instalable y build verificado (WP4+WP5+T6.1-6.3) | Fin sesión 2 |
| M4 | Desplegado en producción y validado en móvil real (T6.4-6.5) | Sesión 3 |

---

## 5. Dependencias

- **Bloqueante**: Si se toca `index.html` o `main.tsx`, asegurar que las variables de entorno `VITE_CONVEX_URL` siguen funcionando.
- **Bloqueante**: No modificar lógica de dominio (`domain/*.ts`) ni funciones Convex; solo UI/CSS.
- **Soft**: Si `vite-plugin-pwa` requiere versión mínima de Vite, verificar compatibilidad con `vite@^8.0.12`.

---

## 6. Decisiones confirmadas

- **No** se crea una app nativa ni híbrida; se mantiene web responsive + PWA.
- **No** se añade autenticación ni backend nuevo; se usa Convex/localStorage existente.
- El bottom nav reemplaza al sidebar en ≤900px; en tablet/desktop (>900px) se mantiene sidebar actual.
- Offline: solo cache estático (shell + CSV). Operaciones contra Convex fallarán grácilmente sin red.

---

## 7. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| PWA plugin complica el build | Tener backup de `vite.config.ts` antes de tocar; si falla, usar SW manual |
| Touch-DnD no funciona bien | Implementar botones ▲/▼ como fallback inmediato |
| Vercel cachea old assets | Hacer deploy con `--prod` y forzar hard-refresh en móvil |

---

## 8. Checklist de validación final

- [ ] Se abre en iPhone SE (375x667) sin overflow-x
- [ ] Se abre en Galaxy S8 (360x740) sin overflow-x
- [ ] Lighthouse PWA audit ≥ 90
- [ ] `pnpm test` pasa
- [ ] `pnpm build` pasa sin warnings críticos
- [ ] Se puede instalar en Android (Chrome) y iOS (Safari "Agregar a inicio")
- [ ] Se puede crear una fórmula, guardarla, ver escala y ver historial usando solo táctil
- [ ] Deploy activo en Vercel con URL reportada al usuario
