# Estado de sesión: exportación de balances del formulador

Actualizado: 2026-10-29.

## Completado
- Leída memoria al inicio. Exportador localizado en `SGC_CALFERQUIM/formulador-sub_1/web/src/main.tsx`.
- CSV de balance incluye primera fila `Producto;<nombre>` y nombre `balance_<producto-saneado>_<fecha>.csv`.
- Nuevo helper `src/domain/exportBalance.ts` y 3 pruebas en `exportBalance.test.ts`.
- `pnpm test`: 32 pruebas aprobadas en 4 archivos. `pnpm build`: correcto.
- Commit `1b89f75`, solo 3 archivos de implementación/pruebas; atribución exacta solicitada por usuario.

## Bloqueo de publicación
- Vercel CLI 65.5.0: Logged out.
- `gh auth status`: token de willl182 inválido. Consultas públicas API sí funcionan.
- Integración Git Vercel confirmada por estados de commits y deployments Production del repositorio.
- `git push origin HEAD:main` falló: `fatal: could not read Username for 'https://github.com': No such device or address`.
- NO se desplegó esta corrección y NO se confirmó actualización de formulador-sub.vercel.app.
- Para continuar: autenticar GitHub y push a main; revisar estado Vercel y verificar bundle en dominio solicitado. Alternativa: autenticar Vercel y enlazar proyecto correcto antes de --prod.

## Contexto local
- pnpm 11 generó `SGC_CALFERQUIM/formulador-sub_1/web/pnpm-workspace.yaml` local; se permitió esbuild para completar instalación y build. No incluido en commit.
- No se incluyeron ni alteraron carpetas ajenas sin rastrear `Solicitudes_Analisis_Nucleos_Word/` y `situacion/`.
- Skill saver no disponible en lista de skills; contexto guardado manualmente.

## Revisión de continuación (2026-10-29 09:31 Colombia)
- Revalidación: 32/32 tests y build correctos; no se cambió código ni el commit 1b89f75.
- GitHub remoto main sigue en 5b34712012e8d38dc17fc53ea0b5ad188859f846. CLI gh inválida; conexión GitHub de la conversación sí autenticada como willl182. Sus herramientas crean commits nuevos, no permiten publicar el commit local conservando SHA y metadatos.
- Producción sirve /assets/index-BEpWCB4h.js y todavía no contiene el prefijo balance_.
- Hallazgo: memoria anidada SGC_CALFERQUIM/formulador-sub_1/logs/CURRENT_SESSION.md documenta despliegues de formulador-sub_1/web al proyecto Vercel formulador-sub, dominio formulador-sub.vercel.app. El status GitHub actual apunta a OTRO proyecto Vercel, cfq_sgc. Un push NO prueba actualización del dominio objetivo.
- Configuración Vercel actual no accesible sin login (redirige a /login). Debe confirmar proyecto/alias antes de desplegar.
- Backend de producción documentado: https://sensible-goose-293.convex.cloud. Build local sin VITE_CONVEX_URL pasa pero no sirve para publicar una app conectada; usar entorno production del proyecto correcto.
- Iniciados flujos interactivos gh auth login y pnpm dlx vercel login, esperando autorización humana. Códigos temporales enviados al usuario; no guardar como credenciales persistentes. Si expiraron, reiniciar login.
- Siguiente paso: completar auth, push del commit original, desplegar proyecto formulador-sub con entorno production, verificar descarga CSV en dominio objetivo.
- Skill saver buscado en ~/.codex, ~/.agents y ~/.claude: no disponible. Memoria persistida manualmente.

## Confirmación del usuario (2026-10-29)
- El usuario confirma la copia formulador-sub_1 como proyecto correcto; ruta existente exacta: SGC_CALFERQUIM/formulador-sub_1/web.
- Comprobadas nuevamente las sesiones: gh sigue con token inválido; flujos GitHub y Vercel siguen esperando autorización humana. No hubo push ni despliegue.

## Cierre (2026-11-05)
- Commit 1b89f75 ya está en origin/main. formulador-sub.vercel.app sirve bundle con prefijo balance_ (verificado). Tarea terminada.
- 2026-11-05: commit 722a8a5 agrega nutrientes declarados del objetivo (y sus tolerancias) a la Tabla balance. Desplegado con `vercel --prod` desde formulador-sub_1/web (el push solo despliega el proyecto cfq_sgc, NO formulador-sub). Verificado con Playwright en producción.
- 2026-11-05: commit 81e1225 agrega botón "Balance Excel" (exceljs, carga diferida) con plantilla CALFERQUIM; botón CSV renombrado "Balance CSV". Desplegado con vercel --prod y verificado en producción. Nota: build local sin VITE_CONVEX_URL omite la app (usar URL convex para probar).
