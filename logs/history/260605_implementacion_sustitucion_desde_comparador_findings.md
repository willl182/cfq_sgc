# Hallazgo

Se conectó la vista comparativa del `formulador_sub` con el flujo de sustitución para que una receta guardada pueda abrirse como contexto base de trabajo.

## Detalles

- `app.js` ahora enruta `comparador` y `sustitucion` con opciones de contexto.
- `modules/formulador.js` muestra `grado original`, `grado nuevo` y diferencias por nutriente en modo comparativo.
- `modules/formulador.js` expone un botón `Sustitución` en el comparador para saltar al módulo de sustitución.
- `modules/sustitucion.js` acepta una receta base, extrae sus slots y muestra el contexto origen.

## Validación

- `node --check` pasó en:
  - `SGC_CALFERQUIM/formulador-sub/app.js`
  - `SGC_CALFERQUIM/formulador-sub/modules/comparador.js`
  - `SGC_CALFERQUIM/formulador-sub/modules/formulador.js`
  - `SGC_CALFERQUIM/formulador-sub/modules/sustitucion.js`
  - `SGC_CALFERQUIM/formulador-sub/modules/formulas-guardadas.js`

## Nota

- La validación fue estática. Falta una prueba real en navegador para confirmar que el flujo visual y los eventos del DOM se comportan como se espera.
