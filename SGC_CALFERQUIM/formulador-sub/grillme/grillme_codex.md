# Sesion grill-me: reconfiguracion del formulador

**Fecha**: 2026-06-09
**Directorio**: `/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/formulador-sub`
**Skill usado**: `grill-me`

## Contexto inicial del usuario

El usuario quiere reconfigurar el aplicativo usando como base `insumos_ref/mp-pt_mzr.csv`, que contiene materias primas, productos terminados y mezclas para reemplazo.

Requisitos iniciales:

- Precargar esa base de datos, posiblemente en Convex.
- Permitir editar composiciones desde la vista.
- Armar productos en una vista de formulacion.
- Calcular composicion siguiendo `insumos_ref/formula.md`.
- Calcular tolerancia siguiendo `insumos_ref/tolerancia.md`.
- Mostrar alerta si cumple o no cumple.
- Guardar listas/mezclas/productos creados con componentes y composicion.
- La lista global debe actualizar su composicion si cambia la composicion de algun insumo.
- Mantener historico tipo snapshot que no cambie si despues cambia una materia prima.
- Dejar opcion para cargar listas desde archivo en una fase futura.

## Preguntas y decisiones

### 1. Backend principal

**Pregunta**: ¿Convex debe ser la fuente de verdad y reemplazar el backend actual de Google Sheets/Apps Script?

**Recomendacion**: si, Convex.

**Respuesta del usuario**: si.

**Decision**: Convex sera el backend principal.

### 2. Guardado vivo e historico

**Pregunta**: ¿Cada guardado debe crear dos registros: uno vivo y uno snapshot?

**Recomendacion**: si.

**Respuesta del usuario**: si.

**Decision**: cada guardado crea/actualiza una entidad viva y genera un snapshot historico.

### 3. Composicion objetivo

**Pregunta**: ¿La composicion objetivo debe venir del PT seleccionado o ser editable manualmente?

**Respuesta del usuario**: la composicion solo cambia al cambiar la materia prima. Los cambios futuros no afectan snapshots. Las recetas si son vivas y pueden cambiar.

**Decision**: no se crea una composicion objetivo manual independiente. La receta viva cambia por cambios en catalogo; snapshots quedan congelados.

### 4. Componentes seleccionables

**Pregunta**: ¿Los componentes pueden ser `MP`, `PT` y `MZR`, o solo `MP`?

**Respuesta del usuario**: si, por cualquiera de los 3.

**Decision**: las listas/formulas pueden usar componentes `MP`, `PT` o `MZR`.

### 5. Limite de componentes y base

**Pregunta**: ¿Mantener limite de 11 componentes y base 1000 kg?

**Respuesta del usuario**: la base es 1000. Genera alerta si no suma. Si es facil flexibilizar el limite, flexible.

**Decision**: base 1000 kg, componentes dinamicos sin limite rigido de 11.

### 6. Guardar con suma distinta de 1000

**Pregunta**: Si la suma no es 1000, ¿bloquear guardar o solo advertir?

**Respuesta del usuario**: con alerta, si.

**Decision**: se permite guardar con alerta.

### 7. Tratamiento de `SUP`

**Pregunta**: ¿`SUP` debe considerarse no conforme para aprobacion?

**Respuesta del usuario**: SUP solo marca. no es no aprueba.

**Decision**: `SUP` no bloquea cumplimiento.

### 8. Estado general

**Pregunta**: ¿Usar `NO_CUMPLE`, `CUMPLE_CON_ALERTA`, `CUMPLE`?

**Respuesta del usuario**: si, pero `CUMPLE_S` mejor que con alerta.

**Decision**:

- `NO_CUMPLE`: si hay algun `NC`.
- `CUMPLE_S`: si no hay `NC`, pero hay `SUP`.
- `CUMPLE`: si todos estan en `C`.

### 9. Historial de cambios de catalogo

**Pregunta**: ¿Guardar historial/auditoria cuando cambia composicion de un item?

**Respuesta del usuario**: si crea un historial de cambios, es importante. igual se actualiza y se muestra la mas reciente.

**Decision**: el catalogo muestra la composicion vigente, pero cada cambio queda en historial.

### 10. Identidad del catalogo

**Pregunta**: ¿Usar `COD` como identificador unico?

**Respuesta del usuario**: para MP, `MP0001`; para PT, `PT0001`; y asi.

**Decision**: IDs internos secuenciales por clase, no usar solo `COD`.

### 11. IDs por clase

**Pregunta**: ¿Confirmar `MP0001`, `PT0001`, `MZR0001`?

**Respuesta del usuario**: si.

**Decision**: se usan esos prefijos por clase. El `COD` original se conserva como dato externo.

### 12. Orden de precarga

**Pregunta**: ¿La numeracion inicial respeta el orden del archivo?

**Respuesta del usuario**: si.

**Decision**: la precarga inicial numera segun el orden del CSV, por clase.

### 13. Importaciones futuras

**Pregunta**: ¿Como identificar filas existentes en cargas futuras?

**Respuesta del usuario**: para eso esa ID `MP0001`, `PT0001`, `MZR0001` y asi. pero aja dale.

**Decision**: las importaciones futuras deben traer ID interno. Si no lo traen, se podra usar una coincidencia conservadora como respaldo.

### 14. Edicion de IDs

**Pregunta**: ¿Los IDs internos deben ser editables?

**Respuesta del usuario**: solo las materias primas son editables. los PT y MZR solo por admin.

**Decision**: IDs internos no editables. La edicion de composicion depende de clase y permisos.

### 15. Permisos

**Pregunta**: ¿Separacion simple en interfaz o autenticacion real?

**Respuesta del usuario**: modo admin por configuracion local, luego auth para produccion.

**Decision**: admin local temporal; auth real despues.

### 16. Configuracion admin local

**Pregunta**: ¿Admin local en `localStorage`?

**Respuesta del usuario**: si para pruebas internas.

**Decision**: modo admin temporal persistido en `localStorage`.

### 17. Recalculo de recetas vivas

**Pregunta**: ¿Recalcular recetas al leer/renderizar o guardar campos actualizados?

**Respuesta del usuario**: recalcular. si.

**Decision**: recetas vivas guardan estructura y se recalculan al leer con catalogo vigente.

### 18. Contenido del snapshot

**Pregunta**: ¿Snapshot copia composicion vigente de cada componente?

**Respuesta del usuario**: si.

**Decision**: snapshot guarda componentes, composiciones de componentes, resultado final y evaluacion del momento.

### 19. PT objetivo opcional

**Pregunta**: ¿Permitir recetas sin PT objetivo?

**Respuesta del usuario**: si.

**Decision**: el PT objetivo es opcional; sin objetivo se calcula composicion pero no se evalua tolerancia.

### 20. PT objetivo vivo

**Pregunta**: Si el PT objetivo cambia en catalogo, ¿la receta viva evalua contra el nuevo objetivo?

**Respuesta del usuario**: la composicion vigente del PT objetivo para evaluar tolerancia no cambia pero aja, usar receta viva siempre.

**Decision**: receta viva usa catalogo vigente; snapshot conserva objetivo del momento.

### 21. Vistas separadas

**Pregunta**: ¿Vistas separadas para Catalogo, Armado, Recetas vivas, Historico e Importacion futura?

**Respuesta del usuario**: separadas si.

**Decision**: se implementaran vistas separadas.

### 22. Historial visible

**Pregunta**: ¿Historial por item y tabla global de cambios recientes?

**Respuesta del usuario**: si.

**Decision**: historial por item; si alcanza, tabla global de cambios recientes.

### 23. Edicion de recetas vivas

**Pregunta**: ¿Recetas vivas editables o cada cambio crea receta nueva?

**Respuesta del usuario**: crea una opcion de listas para cada formula. cada producto se puede hacer de diferentes maneras. las listas siguen orden consecutivo.

**Decision**: el modelo requiere listas por producto/formula.

### 24. Listas por producto

**Pregunta**: ¿Producto objetivo con listas `L001`, `L002`, etc., consecutivas por producto?

**Respuesta del usuario**: si.

**Decision**: cada producto puede tener multiples listas; consecutivo por producto objetivo.

### 25. Listas sin objetivo

**Pregunta**: ¿Usar grupo `BORRADOR` o `SIN_OBJETIVO` para listas sin PT objetivo?

**Respuesta del usuario**: si.

**Decision**: listas sin objetivo usan consecutivo propio de borradores.

### 26. Versiones en snapshots

**Pregunta**: Al guardar de nuevo, ¿mantener lista `L001` y versionar snapshot?

**Respuesta del usuario**: la version en el snapshot.

**Decision**: la lista viva conserva su codigo; los snapshots llevan `v1`, `v2`, etc.

### 27. Alias de lista

**Pregunta**: ¿Alias opcional para listas?

**Respuesta del usuario**: dale.

**Decision**: cada lista tiene codigo automatico y alias opcional.

### 28. Estado/preferida de lista

**Pregunta**: ¿Marcar lista como activa/preferida?

**Respuesta del usuario**: no, no me interesa eso.

**Decision**: no usar `status` ni `isPreferred` para listas.

### 29. Eliminacion y archivado

**Pregunta**: ¿Eliminar listas/snapshots o archivar?

**Respuesta del usuario**: archivado. solo el admin elimina.

**Decision**: usuarios archivan; admin elimina fisicamente.

### 30. Normalizacion automatica

**Pregunta**: ¿Mantener `cantidad * concentracion / 1000` aunque la suma no de 1000?

**Respuesta del usuario**: no normalizar automaticamente. alerta.

**Decision**: no normalizar; mostrar alerta.

### 31. Nutrientes visibles

**Pregunta**: ¿Que nutrientes mostrar?

**Respuesta del usuario**: todos, permite resaltar y ocultar.

**Decision**: mostrar todos, con opcion de resaltar/ocultar.

### 32. Preferencia visual

**Pregunta**: ¿Resaltar/ocultar por receta o preferencia global?

**Respuesta del usuario**: preferencia global.

**Decision**: preferencia global local, no parte de datos regulatorios.

### 33. Precision de composiciones

**Pregunta**: ¿Precision guardada y visible?

**Respuesta del usuario**: guardar hasta 4 visibles 2.

**Decision**: composiciones hasta 4 decimales guardadas, 2 visibles.

### 34. Precision de cantidades

**Pregunta**: ¿Cantidades con 4 decimales o enteros/kg?

**Respuesta del usuario**: no los componentes maximo 2 decimales.

**Decision**: cantidades de componentes maximo 2 decimales.

### 35. Carga inicial

**Pregunta**: ¿Carga automatica si Convex esta vacio o boton explicito?

**Respuesta del usuario**: boton.

**Decision**: boton explicito.

### 36. Permiso de carga

**Pregunta**: ¿Boton de carga inicial solo admin local?

**Respuesta del usuario**: si.

**Decision**: solo admin local puede cargar catalogo base/importaciones.

### 37. Carga con catalogo existente

**Pregunta**: Si Convex ya tiene datos, ¿que hace el boton?

**Respuesta del usuario**: solo si vacio.

**Decision**: carga base solo si catalogo esta vacio.

### 38. Carga futura de listas

**Pregunta**: ¿Placeholder visual o flujo de seleccionar archivo y validar?

**Respuesta del usuario**: si.

**Decision**: placeholder funcional con seleccion de archivo, validacion y preview; sin guardar.

### 39. Formato de importacion futura

**Pregunta**: ¿Importacion futura debe usar IDs internos?

**Respuesta del usuario**: si se supone, si.

**Decision**: futuras listas importadas usan IDs internos.

### 40. Plan antes de codigo

**Pregunta**: ¿Preparar plan tecnico antes de tocar codigo?

**Respuesta del usuario**: escribe el plan a partir de la sesion de grill-me en el directorio `plan_codex.md`. tambien guarda la sesion de grillme en `grillme_codex.md`.

**Decision**: crear `plan_codex.md` y `grillme_codex.md`.

## Resumen cerrado

La arquitectura queda centrada en Convex, con un catalogo vivo auditable, recetas/listas vivas recalculables y snapshots historicos congelados. La app debe separar vistas de Catalogo, Armado, Recetas/Listas vivas, Historico e Importacion futura. La trazabilidad se preserva mediante IDs internos por clase, historial de cambios de catalogo, snapshots versionados y archivado logico.
