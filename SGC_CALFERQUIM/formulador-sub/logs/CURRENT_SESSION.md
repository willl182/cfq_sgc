# Session State: formulador-sub

**Last Updated**: 2026-06-10 12:15 America/Bogota

## Session Objective

Implementar las funcionalidades del plan_v1.md dentro de la app vanilla JS existente.

## Current State

- [x] F1: Módulo seed.js con validación CSV, IDs secuenciales, auditoría, admin local
- [x] F2: Motor de cálculo puro (formulas.js)
- [x] F2: Motor de tolerancias v2 con CUMPLE/CUMPLE_S/NO_CUMPLE/SIN_OBJETIVO
- [x] F3: Catálogo unificado con edición inline, auditoría, admin toggle
- [x] F4: Módulo productLists con listas vivas + snapshots versionados
- [x] F4: Formulador.js reescrito — integrado con Seed, ProductLists, formulas.js, tolerancias-v2
- [x] F4: Componentes dinámicos sin límite de 11 (slots.push/pop)
- [x] F5: Vista Histórico de snapshots
- [x] CSS para nuevos componentes
- [ ] Verificar carga del CSV con separador ; desde navegador
- [ ] F6: Importación futura de listas (baja prioridad)

## Critical Technical Context

- `formulador.js` ahora usa `Seed.search('')` como catálogo en vez de `Api.fetchMP()`
- Guardado usa `ProductLists.create()` + `ProductLists.saveWithSnapshot()` (localStorage)
- También trata de guardar en Google Sheets vía `Api.saveFormula()` como backup
- Estado general usa nueva nomenclatura: `CUMPLE`, `CUMPLE_S`, `NO_CUMPLE`, `SIN_OBJETIVO`
- Botón "Guardar Final" crea lista viva + snapshot versionado
- Botón "Guardar" solo crea/actualiza lista viva
- Slots son dinámicos (sin límite de 11) — se usa `this._slots.push()` y `splice()`
- Fórmulas legacy (Google Sheets) se convierten a formato internalId al cargar
- `cargarLista(listaId)` permite editar una lista existente de ProductLists
- CSV usa separador `;` — `seed.js.loadFromText()` convierte a `,` antes de parsear

## Next Steps

1. Probar la app completa en navegador (verificar CSV carga, cálculos, guardado)
2. Integrar `formulas-guardadas.js` con ProductLists para ver/editar/clonar listas
3. F6: Vista de importación de listas (prioridad baja)