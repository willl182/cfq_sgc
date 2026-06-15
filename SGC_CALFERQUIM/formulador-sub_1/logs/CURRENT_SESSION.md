# Session State: formulador-sub_1

**Last Updated**: 2026-06-15 12:22 America/Bogota

## Session Objective

Implementar suma de varias listas guardadas para obtener el total requerido de MP/insumos por cada insumo.

## Current State

- [x] Creado `web/src/domain/listTotals.ts` con `summarizeRequiredInputs()` para consolidar cantidades por `itemId`.
- [x] Agregada prueba unitaria que valida suma de dos listas con multiplicadores distintos.
- [x] Extendida la vista `Escalar` en `web/src/main.tsx` con bloque `Total por insumo`.
- [x] El usuario puede agregar varias listas, asignar multiplicador individual y ver total requerido por insumo.
- [x] La tabla muestra desglose de origen por lista (`displayCode: kg`) para trazabilidad operacional.
- [x] Ajustados estilos responsive en `web/src/style.css`.
- [x] Ejecutado `pnpm test`: 14/14 tests pasaron.
- [x] Ejecutado `pnpm build`: build de TypeScript/Vite exitoso.
- [x] Desplegado a Vercel produccion con `pnpm exec vercel --prod`.
- [x] Alias de produccion actualizado: `https://formulador-sub.vercel.app`.
- [x] Actualizado `AGENTS.md` para exigir despliegue a produccion despues de tests/build en cambios web, salvo instruccion explicita en contra.

## Critical Technical Context

- La suma no modifica ni guarda snapshots; es una vista operacional para calcular requerimientos de preparación/compras.
- Las cantidades se agrupan por `CatalogItem.internalId` y se ignoran listas/insumos inexistentes o archivados.
- Cada selección usa un `multiplier`; si la lista base está en 1000 kg, el multiplicador representa cuántas veces preparar esa lista.
- La función de dominio redondea cantidades a 2 decimales para mantener consistencia con la normalización existente.
- URL activa de produccion: `https://formulador-sub.vercel.app`.

## Next Steps

1. Probar visualmente la vista `Escalar` en produccion con datos reales de listas guardadas.
2. Si se requiere para operación, agregar exportación CSV del consolidado `Total por insumo`.
