# Hallazgo

Se implementó una vista `comparador` para `formulador-sub` que reutiliza el motor actual del formulador y añade un resumen de `grado original` para apoyar el flujo de edición y sustitución.

## Detalles

- `app.js` ahora enruta a `comparador`.
- `modules/comparador.js` actúa como entrada ligera al modo comparativo.
- `modules/formulador.js` soporta `modo: 'comparar'` y conserva el editor responsive para el `grado nuevo`.
- `modules/formulas-guardadas.js` expone una acción `Comparar` para abrir una receta guardada en la vista nueva.

## Impacto

- Se evita duplicar la lógica de cálculo.
- El grado original y el grado nuevo quedan visibles en la misma experiencia.
- La comparación parte de una receta guardada, que es la base más estable para trazabilidad.
