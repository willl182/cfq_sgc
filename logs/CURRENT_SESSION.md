# Session State: formulador_sub

**Last Updated**: 2026-06-05 00:00 America/Bogota

## Session Objective

Conectar el flujo de sustitución múltiple desde la vista comparativa del `formulador_sub` y validar la integración.

## Current State

- [x] Se agregó la vista `comparador` al router de `app.js`.
- [x] Se creó `modules/comparador.js` como wrapper ligero sobre `Formulador`.
- [x] Se extendió `Formulador` para soportar modo `comparar`.
- [x] Se añadió una strip comparativa con resumen de `grado original` y diferencias por nutriente.
- [x] Se expuso acción `Comparar` desde `FormulasGuardadas`.
- [x] Se conectó el botón `Sustitución` desde la vista comparativa hacia `Sustitucion` con receta base precargada.
- [x] Se añadió carga de receta base y slots origen en `modules/sustitucion.js`.
- [x] Se validó sintaxis con `node --check` en los archivos tocados.

## Critical Technical Context

- La comparación reutiliza el motor actual de cálculo y la misma UI responsive del formulario.
- El comparador abre la sustitución con la fórmula original como contexto, evitando perder trazabilidad.
- `node --check` pasó en todos los archivos modificados, pero no se ejecutó una validación en navegador.

## Next Steps

1. Probar en navegador el flujo: receta guardada -> comparar -> sustitución.
2. Si hace falta, completar la aplicación efectiva de varias sustituciones sobre una copia de la fórmula.
