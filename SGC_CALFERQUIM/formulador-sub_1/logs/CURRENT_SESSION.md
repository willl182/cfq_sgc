# Session State: formulador-sub_1

**Last Updated**: 2026-06-11 10:52 America/Bogota

## Session Objective

Implementar feature para exportar listas desde la app React/Convex del formulador.

## Current State

- [x] Creado modulo puro `web/src/domain/exportLists.ts` para exportar listas vivas y snapshots.
- [x] Agregados botones CSV/JSON en vista Formulador para exportar listas vivas.
- [x] Agregados botones CSV/JSON en vista Historico para exportar snapshots congelados.
- [x] Agregadas pruebas de exportacion CSV con separador `;` y escape de campos.
- [x] Verificado con `npm test` y `npm run build` en `web/`.

## Critical Technical Context

- La exportacion es solo lectura: no modifica Convex, localStorage, catalogo ni snapshots.
- Los CSV se generan por componente, con una fila por componente de lista/snapshot.
- Los archivos descargados usan nombres `cfq-listas-vivas-YYYYMMDDHHMMSS.csv|json` y `cfq-snapshots-listas-YYYYMMDDHHMMSS.csv|json`.
- El formato CSV usa `;`, alineado con los CSV existentes del proyecto.

## Next Steps

1. Probar manualmente en navegador que las descargas salen desde las vistas Formulador e Historico.
2. Si se requiere interoperabilidad con importacion futura, alinear cabeceras exportadas con `productoObjetivoId, listaAlias, componenteId, cantidad`.
