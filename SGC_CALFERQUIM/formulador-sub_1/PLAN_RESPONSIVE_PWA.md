# Plan: Responsive + PWA para Formulador Móvil

**Proyecto**: `formulador-sub_1/web` — CALFERQUIM SGC  
**Fecha**: 2026-06-17  
**Última auditoría**: 2026-06-17 (verificado contra código real)  
**Estimación**: 1 día de trabajo (2-3 sesiones de agente)  
**Depende de**: Código actual funcional en desktop, build Vite estable.

---

## 1. Objetivo

Que la app formulador funcione cómodamente en pantallas de 320px a 900px, se pueda instalar como PWA en Android/iOS, y mantenga todas las funcionalidades actuales (catálogo, formulador, escala, historial, importación) sin pérdida de datos.

---

## 2. Estado actual del código (auditoría 2026-06-17)

> [!NOTE]
> Esta sección documenta el estado real del código para evitar supuestos incorrectos durante la implementación.

### Stack verificado

| Concepto | Valor |
|----------|-------|
| Vite | `^8.0.12` |
| React | `^19.2.7` |
| TypeScript | `~6.0.2` |
| Convex | `^1.40.0` |
| Vitest | `^4.1.8` |
| Icons | `lucide-react ^1.17.0` |
| CSS | Vanilla CSS, 988 líneas, **sin Tailwind** (instalado pero no usado) |
| Monolito UI | `main.tsx` — 2,017 líneas, `style.css` — 988 líneas |
| Root DOM | `#app` (no `#root`) |
| Navegación | Estado local `useState<View>` — **sin React Router** (instalado pero no usado) |

### Media queries existentes (solo 2)

| Breakpoint | Líneas | Qué hace |
|------------|--------|----------|
| `max-width: 900px` | 950–981 | Sidebar → barra horizontal top sticky, todos los grids → `1fr`, drawer → full width |
| `max-width: 540px` | 984–987 | Solo `.npk-hero` → `1fr` y `.nutrient-grid` → 2 columnas |

### Estado responsive actual

| Elemento | Estado actual | ¿Necesita trabajo? |
|----------|--------------|---------------------|
| Sidebar → horizontal bar (≤900px) | ✅ Funciona, solo iconos | Sí: mover a **bottom nav** |
| `.form-grid` → `1fr` (≤900px) | ✅ Funciona | No |
| `.scale-grid` → `1fr` (≤900px) | ✅ Funciona | No |
| `.import-grid` → `1fr` (≤900px) | ✅ Funciona | No |
| `.create-catalog-item` → `1fr` (≤900px) | ✅ Funciona | No |
| `.target-create-fields` → `1fr` (≤900px) | ✅ Funciona | No |
| `.contribution-table` (min-width: 720px) | Scroll horizontal | Sí: card layout o mejorar |
| `.scale-table` (min-width: 680px) | Scroll horizontal | Sí: card layout o mejorar |
| Botones / inputs `min-height: 44px` | ❌ No existe | **Sí** |
| `.combo-menu` override móvil | ❌ No existe (absolute, 280px max-h) | **Sí** |
| `.composition-editor` (2 cols) | ❌ Sin override | **Sí** |
| Drag-and-drop (HTML5 nativo) | ❌ No funciona en touch | **Sí** |
| PWA (manifest, SW, icons) | ❌ No existe nada | **Sí** |

### Dependencias no usadas (limpieza)

Las siguientes deps están en `package.json` pero **no se usan en ningún archivo fuente**:

| Dependencia | Tipo | Acción |
|-------------|------|--------|
| `tailwindcss ^4.3.0` | devDep | Eliminar |
| `autoprefixer ^10.5.0` | devDep | Eliminar |
| `postcss ^8.5.15` | devDep | Eliminar |
| `react-router-dom ^7.17.0` | dep | Eliminar |

### Archivos de scaffold sobrantes

| Archivo | Acción |
|---------|--------|
| `src/counter.ts` | Eliminar |
| `src/assets/typescript.svg` | Eliminar |
| `src/assets/vite.svg` | Eliminar |
| `src/assets/hero.png` | Verificar si se usa, si no → eliminar |
| `public/favicon.svg` | Reemplazar con favicon CALFERQUIM |

---

## 3. Entregables

| # | Entregable | Criterio de aceptación |
|---|-----------|------------------------|
| D1 | Layout responsive optimizado | Navegación usable en iPhone SE (375px) sin scroll horizontal forzado en vistas principales |
| D2 | PWA instalable | `manifest.json` válido, iconos, tema, y service worker para cache estático. Lighthouse PWA score ≥ 90 |
| D3 | UX táctil mejorada | Botones ≥ 44×44px, inputs con altura ≥ 44px, combo-menus no se desbordan en móvil |
| D4 | Build y despliegue funcionando | `pnpm build` sin errores, desplegado en Vercel con misma URL, visible en móvil |
| D5 | Limpieza de deps no usadas | Sin dependencias huérfanas ni archivos scaffold |

---

## 4. Paquetes de Trabajo

### WP0 — Limpieza de dependencias y archivos ⚡ (nuevo)
**Archivos**: `package.json`, `src/counter.ts`, `src/assets/`  
**Tareas**:
- T0.1: Eliminar devDependencies no usadas: `tailwindcss`, `autoprefixer`, `postcss`.
- T0.2: Eliminar dependency no usada: `react-router-dom`.
- T0.3: Eliminar archivos scaffold: `src/counter.ts`, `src/assets/typescript.svg`, `src/assets/vite.svg`. Verificar `src/assets/hero.png`.
- T0.4: Ejecutar `pnpm install` para actualizar lockfile.
- T0.5: Ejecutar `pnpm test` y `pnpm build` para confirmar que nada se rompió.

**Criterio de aceptación**: Build pasa, no hay dependencias sin usar.

### WP1 — Refactor de navegación móvil
**Archivos**: `style.css`, `main.tsx`  
**Tareas**:
- T1.1: En `@media (max-width: 900px)`, reemplazar la barra horizontal top (sidebar sticky-top actual) por un **bottom navigation bar** fijo. La barra debe tener 5 tabs: Formular, Preparar, Catálogo, Listas, Importar — con íconos Lucide existentes.
- T1.2: Mover el role-box (selector admin/user) fuera del bottom nav en móvil. Opciones: (a) ícono de engranaje en el topbar, (b) drawer deslizable, (c) posición fija tipo FAB.
- T1.3: Ocultar texto de marca ("Formulador SGC" / "Catalogo y listas guardadas") en móvil; dejar solo el badge `CFQ`.
- T1.4: Asegurar que el `<section class="workspace">` tenga `padding-bottom` suficiente (≥ 70px) para no quedar tapado por el bottom nav.

**Criterio de aceptación**: En pantalla 375px se accede a todas las vistas desde el bottom nav sin scroll vertical para navegar.

### WP2 — Grids y tablas responsivos
**Archivos**: `style.css`  
**Tareas**:
- T2.1: Verificar que los grids que ya cambian a `1fr` en ≤900px no tengan fugas de `min-width` que causen overflow-x. Clases: `.form-grid`, `.scale-grid`, `.import-grid`, `.create-catalog-item`, `.target-create-fields`, `.scale-selection-row`, `.snapshot`.
- T2.2: Para `.contribution-table` (min-width: 720px) y `.scale-table` (min-width: 680px): el scroll horizontal actual vía `.contribution-table-wrap { overflow-x: auto }` funciona, pero evaluar si un **card-based layout** en ≤600px sería mejor UX. Si se implementa cards, las filas de tabla se convierten en cards apiladas mostrando "Componente: valor, N: x%, P₂O₅: y%".
- T2.3: Añadir override para `.composition-editor` en ≤900px → `grid-template-columns: 1fr` (actualmente queda en 2 cols en móvil).
- T2.4: Verificar la tabla del catálogo (`.table-head`, `.table-row` con `min-width: 900px`) — en móvil depende de `overflow-x: auto` del padre `.catalog-table`. Evaluar si necesita card layout.
- T2.5: Verificar `.scale-total-summary` (2 cols sin override móvil) y `.combo-option` (3 cols sin override).

**Criterio de aceptación**: No hay overflow-x no intencional en ninguna vista a 375px.

### WP3 — UX táctil y componentes
**Archivos**: `style.css`, `main.tsx`  
**Tareas**:
- T3.1: En `@media (max-width: 900px)`, añadir `min-height: 44px; min-width: 44px` a: `.primary`, `.secondary`, `.danger`, `nav button`, `.role-box button`, `.icon-button`, `.sort-buttons button`.
- T3.2: En `@media (max-width: 900px)`, añadir `min-height: 44px; font-size: 16px` a: `input`, `select`, `.component-row input`, `.component-row select`. El `font-size: 16px` evita el zoom automático en iOS.
- T3.3: Añadir `@media (max-width: 700px)` para `.combo-menu`: cambiar a `position: fixed; bottom: 0; left: 0; right: 0; top: unset; max-height: 50vh; z-index: 999; border-radius: 12px 12px 0 0;` — comportamiento tipo bottom sheet.
- T3.4: Drag-and-drop: el código actual usa **HTML5 DnD nativo** (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) que **no funciona en dispositivos táctiles**. Implementar botones ▲/▼ visibles siempre como alternativa accesible. Opcionalmente, migrar a `@hello-pangea/dnd` (ya en `package.json` pero sin usar) que soporta touch nativamente.

**Criterio de aceptación**: Se puede formular una lista completa usando solo el dedo, sin teclado físico.

### WP4 — PWA (Manifest + Service Worker)
**Archivos nuevos**: `public/manifest.json`, `public/icons/`, `src/sw.ts` (o vite-plugin-pwa)  
**Archivos a modificar**: `index.html`, `vite.config.ts` (si aplica)  
**Tareas**:
- T4.1: Crear `manifest.json` con:
  - `name`: "Formulador SGC CALFERQUIM"
  - `short_name`: "Formulador"
  - `start_url`: "/"
  - `display`: "standalone"
  - `background_color`: "#f4f6f1"
  - `theme_color`: "#162119"
  - Íconos PNG: 192×192 y 512×512 (generar desde SVG de CALFERQUIM o crear nuevos).
- T4.2: Inyectar en `index.html`:
  - `<link rel="manifest" href="/manifest.json">`
  - `<meta name="theme-color" content="#162119">`
  - `<link rel="apple-touch-icon" href="/icons/icon-192.png">`
- T4.3: Crear/configurar service worker que cachee:
  - Shell de la app: `index.html`, `.js`, `.css`, iconos.
  - Datos estáticos: `/data/mp-pt_mzr.csv`.
  - **Google Fonts (Inter)**: precachear o añadir fallback `font-family: system-ui` cuando offline.
  - **Opción A** (recomendada): usar `vite-plugin-pwa` — compatible con Vite 8.
  - **Opción B** (fallback): escribir SW manual con `self.addEventListener('install', ...)` y estrategia Cache-First.
- T4.4: Reemplazar `public/favicon.svg` (default Vite) con favicon CALFERQUIM. Puede ser el SVG `calferquim_icon_green.svg` ya existente en `public/` (confirmar — puede ser de una estructura anterior).

**Criterio de aceptación**: Chrome/Edge/Safari sugieren "Agregar a pantalla de inicio". La app abre offline (al menos el shell).

### WP5 — Optimización de meta y viewport
**Archivos**: `index.html`  
**Tareas**:
- T5.1: El viewport actual `width=device-width, initial-scale=1.0` es correcto. **NO** añadir `user-scalable=no` ni `maximum-scale=1.0` — esto perjudica la accesibilidad (WCAG 1.4.4). El zoom automático en inputs se evita con `font-size: 16px` (ver T3.2).
- T5.2: Añadir meta tags de iOS:
  ```html
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  ```
- T5.3: Considerar `<meta name="description">` para SEO básico.

### WP6 — Test, Build y Despliegue
**Tareas**:
- T6.1: Ejecutar `pnpm test` (Vitest) para confirmar que lógica de dominio no se rompe.
- T6.2: Ejecutar `pnpm build` (`tsc && vite build`) y verificar que no hay errores de TypeScript ni de Vite.
- T6.3: Abrir el build local con `pnpm preview` y validar en DevTools modo iPhone SE + Galaxy S8.
- T6.4: Desplegar a Vercel (`pnpm exec vercel --prod`).
- T6.5: Validar en dispositivo físico o BrowserStack: instalación PWA, navegación, guardar lista, ver escala.

---

## 5. Hitos

| Hito | Descripción | Cuándo |
|------|-------------|--------|
| M0 | Limpieza deps y scaffold (WP0) | Inicio sesión 1 |
| M1 | Navegación móvil + touch sizing (WP1+WP3) | Fin sesión 1 |
| M2 | Layouts sin scroll horizontal (WP2) | Medio sesión 2 |
| M3 | PWA instalable y build verificado (WP4+WP5+T6.1-6.3) | Fin sesión 2 |
| M4 | Desplegado en producción y validado en móvil real (T6.4-6.5) | Sesión 3 |

---

## 6. Dependencias

- **Bloqueante**: Al modificar `index.html`, asegurar que `VITE_CONVEX_URL` sigue funcionando (se inyecta vía `import.meta.env` en `main.tsx`, no afecta al HTML).
- **Bloqueante**: No modificar lógica de dominio (`domain/*.ts`) ni funciones Convex; solo UI/CSS.
- **Bloqueante**: El root mount es `document.getElementById('app')` — no `'root'`. No cambiar.
- **Soft**: Si `vite-plugin-pwa` requiere versión mínima de Vite, verificar compatibilidad con `vite@^8.0.12`.
- **Soft**: Google Fonts (Inter) se carga desde CDN. Evaluar self-hosting o precaching para PWA offline.

---

## 7. Decisiones confirmadas

- **No** se crea una app nativa ni híbrida; se mantiene web responsive + PWA.
- **No** se añade autenticación ni backend nuevo; se usa Convex/localStorage existente.
- **No** se usa React Router; la navegación sigue siendo `useState<View>`.
- El bottom nav reemplaza al sidebar horizontal en ≤900px; en tablet/desktop (>900px) se mantiene sidebar actual.
- Offline: solo cache estático (shell + CSV + fonts). Operaciones contra Convex fallarán grácilmente sin red.
- `user-scalable=no` NO se usa — se evita zoom con `font-size: 16px` en inputs.

---

## 8. Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| PWA plugin complica el build | Media | Tener backup de `vite.config.ts` antes de tocar; si falla, usar SW manual |
| Touch-DnD no funciona bien | Baja | Implementar botones ▲/▼ como fallback inmediato; opcionalmente usar `@hello-pangea/dnd` |
| Vercel cachea old assets | Baja | Hacer deploy con `--prod` y forzar hard-refresh en móvil |
| Monolito de 2K líneas dificulta refactor | Media | NO refactorizar `main.tsx` en esta iteración — solo tocar CSS y bloques específicos |
| Google Fonts no carga offline | Media | Definir fallback `font-family: "Inter", system-ui, sans-serif` (ya existe) + precachear |
| Eliminar deps rompe el build | Baja | Ejecutar test+build después de cada eliminación (T0.5) |

---

## 9. Checklist de validación final

- [ ] Se abre en iPhone SE (375×667) sin overflow-x
- [ ] Se abre en Galaxy S8 (360×740) sin overflow-x
- [ ] Bottom nav visible y funcional en ≤900px
- [ ] Todos los botones/inputs ≥ 44px en móvil
- [ ] Combo-menu se comporta como bottom sheet en ≤700px
- [ ] `.composition-editor` colapsa a 1 columna en ≤900px
- [ ] Drag-and-drop tiene alternativa accesible (botones ▲/▼)
- [ ] Lighthouse PWA audit ≥ 90
- [ ] `pnpm test` pasa
- [ ] `pnpm build` pasa sin warnings críticos
- [ ] Se puede instalar en Android (Chrome) y iOS (Safari "Agregar a inicio")
- [ ] Se puede crear una fórmula, guardarla, ver escala y ver historial usando solo táctil
- [ ] Deploy activo en Vercel con URL reportada al usuario
- [ ] Dependencias huérfanas eliminadas
- [ ] Favicon/iconos con branding CALFERQUIM
