# Hallazgos - Implementación `formulador-sub`

- Se creó la base funcional de `SGC_CALFERQUIM/formulador-sub/` clonando el formulador existente y adaptando navegación, título y almacenamiento.
- Se añadió una vista inicial de sustitución que ordena MFs por distancia euclidiana y prioridad de nutriente.
- La carga de `modules/api.js` y `modules/sustitucion.js` fue verificada con éxito en Node usando stubs de navegador.
- El módulo todavía requiere datos reales de `mf_gastar.csv` y el flujo de persistencia de recetas nuevas para completar el plan.
