# Plan de reconfiguracion del aplicativo formulador

**Base de decision**: sesion `grill-me` realizada el 2026-06-09.
**Archivo base**: `insumos_ref/mp-pt_mzr.csv`.
**Reglas de calculo**: `insumos_ref/formula.md`.
**Reglas de tolerancia**: `insumos_ref/tolerancia.md`.

## Objetivo

Reconfigurar el aplicativo para trabajar con un catalogo vivo de materias primas, productos terminados y mezclas de reemplazo; permitir armar listas/formulas por producto; calcular composicion y tolerancia; guardar recetas vivas recalculables y snapshots historicos congelados.

## Decisiones confirmadas

- Convex sera la fuente de verdad principal.
- El catalogo se precarga desde `insumos_ref/mp-pt_mzr.csv`.
- El catalogo contiene items de clase `MP`, `PT` y `MZR`.
- Los componentes de una lista/formula pueden ser cualquiera de las tres clases: `MP`, `PT` o `MZR`.
- Los IDs internos son secuenciales por clase:
  - `MP0001`, `MP0002`, ...
  - `PT0001`, `PT0002`, ...
  - `MZR0001`, `MZR0002`, ...
- En la precarga inicial, la numeracion respeta el orden del archivo.
- El `COD` original del CSV se conserva como codigo externo/trazabilidad, pero no es la llave interna.
- Los IDs internos no son editables por el usuario.
- Solo las materias primas (`MP`) son editables en modo normal.
- `PT` y `MZR` solo son editables en modo admin.
- El modo admin sera una configuracion local para pruebas internas, persistida en `localStorage`; despues se reemplazara por autenticacion real para produccion.
- La carga base del catalogo se hace con boton, solo admin, y solo si Convex esta vacio.
- Futuras importaciones de listas deben usar IDs internos (`PT0001`, `MP0001`, `MZR0001`).

## Modelo de datos propuesto en Convex

### `catalogItems`

Catalogo vivo de insumos, productos terminados y mezclas.

Campos:

- `internalId`: `MP0001`, `PT0001`, `MZR0001`.
- `class`: `MP | PT | MZR`.
- `externalCode`: valor de `COD` en el CSV.
- `name`: producto/nombre visible.
- `type`: valor de `TIPO`.
- `test`: valor original de `Test`, si aplica.
- `composition`: objeto con nutrientes.
- `createdAt`.
- `updatedAt`.
- `archivedAt`, opcional.

Nutrientes:

`C`, `N`, `N_NH4`, `N_NO3`, `N_org`, `N_ur`, `P`, `K`, `CaO`, `MgO`, `S`, `B`, `Co`, `Cu`, `Fe`, `Mn`, `Mo`, `SiO2`, `Zn`, `Na`.

Nota: el CSV usa encabezados con guion (`N-NH4`, `N-NO3`, `N-org`, `N-ur`). En el modelo interno conviene normalizarlos a `N_NH4`, `N_NO3`, `N_org`, `N_ur`.

### `catalogChangeHistory`

Historial/auditoria de cambios del catalogo.

Campos:

- `catalogItemId`.
- `internalId`.
- `class`.
- `changedAt`.
- `changedBy`: marcador local por ahora; usuario real cuando exista auth.
- `reason`, opcional.
- `previousComposition`.
- `newComposition`.
- `previousFields`, si cambia algo adicional.
- `newFields`, si cambia algo adicional.

Regla: el catalogo muestra siempre la composicion vigente, pero cada cambio queda registrado.

### `productLists`

Lista/formula viva. Representa una forma de fabricar un producto.

Campos:

- `targetProductId`, opcional.
- `targetProductInternalId`, opcional.
- `listCode`: consecutivo por producto, por ejemplo `L001`, `L002`.
- `displayCode`: por ejemplo `PT0008-L001` o `BORRADOR-L001`.
- `alias`, opcional.
- `components`: arreglo de componentes vivos.
- `createdAt`.
- `updatedAt`.
- `archivedAt`, opcional.

Componente vivo:

- `catalogItemId`.
- `internalId`.
- `quantity`: maximo 2 decimales.

Reglas:

- Un producto puede tener multiples listas/formas de fabricacion.
- La numeracion de listas es consecutiva por producto objetivo.
- Si no hay producto objetivo, se usa grupo `BORRADOR` o `SIN_OBJETIVO`, con numeracion propia.
- Si despues se asigna un producto objetivo a un borrador, se le asigna el siguiente consecutivo de ese producto.
- La lista viva no guarda composicion final como fuente de verdad; recalcula al leer/renderizar usando el catalogo vigente.

### `productListSnapshots`

Historico congelado de una lista/formula.

Campos:

- `productListId`.
- `snapshotVersion`: `v1`, `v2`, `v3`, consecutivo por lista.
- `targetProductSnapshot`: copia del PT objetivo del momento, si existe.
- `listCode`.
- `displayCode`.
- `alias`.
- `componentsSnapshot`: copia completa de componentes.
- `calculatedComposition`: composicion final calculada al momento.
- `toleranceEvaluation`: evaluacion por nutriente.
- `generalStatus`: `CUMPLE | CUMPLE_S | NO_CUMPLE | SIN_OBJETIVO`.
- `totalQuantity`.
- `sumAlert`: true si la suma no da 1000.
- `createdAt`.
- `createdBy`: marcador local por ahora; usuario real cuando exista auth.
- `archivedAt`, opcional.

Componente congelado:

- `catalogItemId`.
- `internalId`.
- `class`.
- `externalCode`.
- `name`.
- `quantity`.
- `composition`: copia vigente del componente en ese momento.

Reglas:

- Cada guardado crea o actualiza la lista viva y crea un snapshot historico.
- Los snapshots no se recalculan si cambia una materia prima, PT o MZR.
- Usuarios normales archivan; solo admin elimina fisicamente.

## Reglas de calculo

La base de calculo es 1000 kg.

Para cada nutriente:

```text
aporte = cantidad_componente * concentracion_nutriente
valor_final = suma(aportes) / 1000
```

Reglas confirmadas:

- No normalizar automaticamente si la suma no da 1000.
- Si la suma no da 1000, mostrar alerta.
- Se permite guardar con alerta.
- Las cantidades de componentes se guardan con maximo 2 decimales.
- Las composiciones se guardan hasta 4 decimales.
- La UI muestra composiciones con 2 decimales.
- La evaluacion usa los valores completos guardados/calculados, no solo el redondeo visible.

## Reglas de tolerancia y cumplimiento

La tolerancia sigue `insumos_ref/tolerancia.md`.

Estados por nutriente:

- `C`: cumple rango.
- `NC`: por debajo del minimo.
- `SUP`: supera el maximo.

Estado general:

- `NO_CUMPLE`: existe al menos un nutriente `NC`.
- `CUMPLE_S`: no hay `NC`, pero existe uno o mas `SUP`.
- `CUMPLE`: todos los nutrientes evaluados estan en `C`.
- `SIN_OBJETIVO`: no hay producto terminado objetivo para evaluar tolerancia.

Reglas confirmadas:

- `SUP` solo marca; no se considera no aprobado.
- El PT objetivo es opcional.
- Si hay PT objetivo, la receta viva evalua contra la composicion vigente del PT.
- El snapshot conserva el PT objetivo del momento.

## Vistas propuestas

### Catalogo

Funciones:

- Ver `MP`, `PT`, `MZR`.
- Buscar y filtrar por clase, ID interno, codigo externo y nombre.
- Editar composicion de `MP` en modo normal.
- Editar `PT` y `MZR` solo en modo admin local.
- Ver historial por item.
- Mostrar, si alcanza, tabla global de cambios recientes.
- Boton admin para cargar catalogo base desde `mp-pt_mzr.csv`, solo si catalogo esta vacio.

### Armado de producto

Funciones:

- Seleccionar PT objetivo opcional.
- Crear o editar una lista/formula.
- Agregar componentes `MP`, `PT` o `MZR`.
- Componentes dinamicos, sin limite rigido de 11.
- Calcular composicion sobre base 1000.
- Alertar si la suma no da 1000.
- Evaluar tolerancia si hay objetivo.
- Guardar lista viva y snapshot automatico.

### Recetas/Listas vivas

Funciones:

- Listar por producto objetivo.
- Mostrar varias listas por producto: `PT0008-L001`, `PT0008-L002`, etc.
- Mostrar alias opcional.
- Recalcular siempre al leer con el catalogo vigente.
- Abrir para editar.
- Archivar lista.
- Eliminar solo en modo admin.

### Historico

Funciones:

- Listar snapshots por producto/lista.
- Mostrar versiones `v1`, `v2`, `v3`.
- Ver composicion final congelada.
- Ver componentes congelados con sus composiciones del momento.
- Archivar snapshots.
- Eliminar solo en modo admin.

### Importacion futura de listas

Fase inicial:

- Boton para seleccionar archivo.
- Validacion basica de cabeceras.
- Vista previa.
- No persistir todavia.

Formato esperado futuro:

```csv
productoObjetivoId,listaAlias,componenteId,cantidad
PT0008,Alternativa DAP,MP0002,300
PT0008,Alternativa DAP,MP0003,120
```

## Preferencias visuales

- Mostrar todos los nutrientes.
- Permitir resaltar y ocultar nutrientes desde una preferencia global local.
- La preferencia visual se guarda en `localStorage`.
- La receta y el snapshot siempre guardan todos los nutrientes.

## Fases de implementacion sugeridas

### Fase 1: Base Convex y catalogo

- Instalar/configurar Convex.
- Definir schema de `catalogItems` y `catalogChangeHistory`.
- Crear mutacion admin para cargar `mp-pt_mzr.csv` si el catalogo esta vacio.
- Crear vista Catalogo con edicion de MP y bloqueo de PT/MZR sin admin.
- Crear historial por item.

### Fase 2: Motor de calculo compartido

- Extraer calculo de composicion a modulo puro reutilizable.
- Extraer evaluacion de tolerancia a modulo puro compartido.
- Ajustar estado general a `CUMPLE`, `CUMPLE_S`, `NO_CUMPLE`, `SIN_OBJETIVO`.
- Agregar redondeos: composicion 4 decimales guardada, 2 visible; cantidades maximo 2.

### Fase 3: Listas vivas y armado

- Definir `productLists`.
- Crear consecutivos `L001` por producto objetivo y grupo `BORRADOR`.
- Construir vista Armado con componentes dinamicos.
- Guardar lista viva y crear snapshot automatico.

### Fase 4: Historico

- Definir `productListSnapshots`.
- Ver snapshots por lista.
- Mostrar detalle congelado.
- Archivar y eliminar segun permisos.

### Fase 5: Importacion futura

- Agregar vista/boton de importacion.
- Validar cabeceras esperadas.
- Mostrar preview sin guardar.

## Riesgos y controles

- Riesgo: duplicar catalogo por carga repetida.
  - Control: cargar base solo si catalogo esta vacio.
- Riesgo: perder trazabilidad por ediciones de composicion.
  - Control: `catalogChangeHistory` obligatorio.
- Riesgo: recetas vivas cambian sin evidencia visible.
  - Control: recalculo en UI y snapshots automaticos por cada guardado.
- Riesgo: confundir receta viva con historico.
  - Control: vistas separadas y etiquetas claras.
- Riesgo: `SUP` se trate como falla.
  - Control: estado general especial `CUMPLE_S`.
