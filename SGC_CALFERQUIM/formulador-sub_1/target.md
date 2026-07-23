# Targets — Responsive + PWA para Formulador Móvil

Proyecto: `formulador-sub_1/web` — CALFERQUIM SGC  
Plan base: `PLAN_RESPONSIVE_PWA.md`  
Creado: 2026-06-17

---

## Estado de Targets

| # | Target | Estado | Notas |
|---|--------|--------|-------|
| WP0 | Limpieza de dependencias y archivos scaffold | `COMPLETADO` | Eliminadas tailwindcss, autoprefixer, postcss, react-router-dom; eliminados counter.ts, typescript.svg, vite.svg, hero.png. pnpm test y pnpm build pasan. |
| WP1 | Refactor de navegación móvil (bottom nav) | `COMPLETADO` | Sidebar oculto en ≤900px, bottom-nav fijo con 5 tabs, role-toggle en topbar, workspace con padding-bottom. |
| WP2 | Grids y tablas responsivos | `COMPLETADO` | composition-editor 1 col, scale-total-summary 1 col, tablas con scroll-x controlado y max-width 100%, grids adaptados. |
| WP3 | UX táctil y componentes | `COMPLETADO` | Botones/inputs min 44px en móvil, combo-menu como bottom sheet ≤700px, controles ▲/▼ para reordenar componentes. |
| WP4 | PWA (manifest + service worker + iconos) | `COMPLETADO` | manifest.json, iconos 192/512, favicon CALFERQUIM, vite-plugin-pwa con precache y runtime caching de Google Fonts. |
| WP5 | Meta tags y viewport optimizados | `COMPLETADO` | viewport correcto, theme-color, apple-mobile-web-app, description, apple-touch-icon. |
| WP6 | Test, build y despliegue | `COMPLETADO` | pnpm test 19/19, pnpm build OK, deploy exitoso a https://formulador-sub.vercel.app |

---

## Métricas de Aceptación Final

- [x] iPhone SE (375×667) sin overflow-x — implementado vía CSS (pendiente validación en dispositivo físico)
- [x] Galaxy S8 (360×740) sin overflow-x — implementado vía CSS (pendiente validación en dispositivo físico)
- [x] Bottom nav funcional en ≤900px
- [x] Botones/inputs ≥44px en móvil
- [x] Combo-menu bottom sheet en ≤700px
- [x] `.composition-editor` 1 columna en ≤900px
- [x] Reordenar componentes funciona con táctil (▲/▼)
- [x] Lighthouse ≥90 en performance y categorías principales — Performance 90, Accessibility 96, Best-Practices 100, SEO 100 (Lighthouse 13 ya no expone categoría PWA independiente; manifest, SW e icons validados).
- [x] `pnpm test` pasa (19/19)
- [x] `pnpm build` pasa sin warnings críticos
- [x] Instalable en Android/iOS — manifest + SW + icons deployados
- [x] Flujo completo táctil: formular → guardar → escala → historial (UI táctil habilitada)
- [x] Deploy en Vercel con URL reportada: https://formulador-sub.vercel.app
- [x] Dependencias huérfanas eliminadas
- [x] Favicon/iconos CALFERQUIM
