# Plan Integrado de Ajuste del Formulador CFQ

## Resumen

Usar `grillme/plan_codex.md` como plan rector, incorporar de `plan_oc.md` la trazabilidad operativa fina, e incorporar de `plan_pi_k26.md` solo la estructura frontend y modulos avanzados que no contradigan las decisiones cerradas.

El ajuste debe resolver estas decisiones incompatibles antes de implementar:

- Catalogo unificado en Convex, no duplicar `insumos` y `productos`.
- Snapshot en cada guardado persistente de lista, no solo en "Guardar Final".
- Listas vivas recalculadas al leer/renderizar con catalogo vigente, no recalculo persistido en cascada.
- Componentes dinamicos sin limite rigido de 11.
- Admin local por `localStorage`; proveedor de auth futuro no definido.
- Comparador, sustitucion, creacion manual de productos y minimos NPK quedan fuera del nucleo inicial.

## Modelo Canonico

Implementar 4 tablas Convex:

- `catalogItems`: fuente viva unica para `MP`, `PT` y `MZR`.
- `catalogChangeHistory`: auditoria de cambios del catalogo.
- `productLists`: listas/recetas vivas recalculables.
- `productListSnapshots`: historico congelado e inmutable.

Campos clave:

- IDs internos exactos: `MP0001`, `PT0001`, `MZR0001`, con 4 digitos y padding.
- `internalId` es la clave funcional estable.
- `externalCode` y `originalCode` conservan `COD` del CSV para trazabilidad.
- Nutrientes normalizados internamente: `N_NH4`, `N_NO3`, `N_org`, `N_ur`; no usar guiones en claves internas.
- Composicion con 20 nutrientes: `C`, `N`, `N_NH4`, `N_NO3`, `N_org`, `N_ur`, `P`, `K`, `CaO`, `MgO`, `S`, `B`, `Co`, `Cu`, `Fe`, `Mn`, `Mo`, `SiO2`, `Zn`, `Na`.

Indices minimos:

- `catalogItems`: `internalId`, `class`, `externalCode`, `archivedAt`.
- `productLists`: `targetProductId`, `displayCode`, `archivedAt`.
- `productListSnapshots`: `productListId`, `targetProductId`, `snapshotVersion`, `createdAt`.
- `catalogChangeHistory`: `catalogItemId`, `internalId`, `changedAt`.

## Reglas De Dominio

Carga inicial:

- Cargar desde `insumos_ref/mp-pt_mzr.csv` por boton admin.
- Ejecutar solo si `catalogItems` esta vacio.
- Validar encabezados, nutrientes reconocidos, valores numericos, filas sin nombre, codigos ambiguos y decimales antes de insertar.
- Asignar IDs por orden del CSV y por clase.
- Clasificar MZR con regla documentada y testeada; verificar si aplica solo `COD = R` o tambien `R1`, `R2`, etc.

Catalogo:

- Usuario normal edita solo `MP`.
- Admin local edita `MP`, `PT` y `MZR`.
- IDs internos no editables.
- Autosave con debounce y estados `Guardando`, `Guardado`, `Error`.
- Cada cambio guarda auditoria con actor local, timestamp, campos cambiados, antes/despues, razon opcional y origen.

Listas vivas:

- Una lista puede tener objetivo `PT` opcional.
- Sin objetivo usa grupo `BORRADOR` o `SIN_OBJETIVO`.
- Codigo visible: `PT0008-L001`, `PT0008-L002`; borradores con consecutivo propio.
- Componentes permitidos: `MP`, `PT`, `MZR`.
- Cantidades maximo 2 decimales.
- Base fija: 1000 kg.
- Si total no suma 1000, mostrar alerta persistente y permitir guardar.
- No normalizar automaticamente.
- La lista viva guarda estructura y cantidades, no composicion final como fuente de verdad.

Snapshots:

- Todo guardado persistente crea/actualiza la lista viva y crea snapshot en la misma mutacion server-side.
- Snapshots versionados por lista: `v1`, `v2`, `v3`.
- Snapshot congela objetivo, componentes, composiciones, cantidades, composicion calculada, evaluacion, estado general, total kg, alertas, usuario y fecha.
- Snapshots no se recalculan nunca.
- Usuario archiva; eliminacion fisica solo admin.

Calculo y tolerancia:

- Formula: `aporte = cantidadKg * concentracion / 1000`; composicion final es suma de aportes.
- Calculo server-side es autoridad para guardado y snapshot.
- Preview client-side permitido para UX, usando el mismo modulo puro compartido.
- Composiciones guardadas hasta 4 decimales; visibles con 2.
- Evaluar tolerancia contra nutrientes declarados del PT objetivo con valor mayor a 0.
- Nutrientes no declarados se muestran como informativos y no afectan estado general.
- Estados por nutriente: `C`, `NC`, `SUP`.
- Estado general: `NO_CUMPLE` si hay `NC`; `CUMPLE_S` si hay `SUP` sin `NC`; `CUMPLE` si todos evaluados son `C`; `SIN_OBJETIVO` si no hay PT objetivo.

## Implementacion Por Fases

Fase 1: Base Convex y seed

- Configurar Convex sobre el proyecto existente.
- Definir schema canonico e indices.
- Implementar validacion de CSV y carga inicial admin.
- Bloquear carga si catalogo no esta vacio.
- Registrar resumen de importacion: filas leidas, insertadas, rechazadas y errores por fila.
- Tests de seed, parsing, clasificacion `MP/PT/MZR` e IDs secuenciales.

Fase 2: Motor de calculo y tolerancia

- Extraer `formulas` y `tolerancias` como modulos puros.
- Implementar redondeos y validaciones de cantidad.
- Implementar estado general.
- Cubrir con tests unitarios: suma 1000, suma distinta de 1000, `SUP`, `NC`, sin objetivo, nutrientes no declarados.

Fase 3: Catalogo editable

- Vista con busqueda y filtros por clase, codigo, nombre y tipo.
- Edicion inline de nutrientes.
- Permisos UI y validacion en mutaciones.
- Historial por item y tabla global de cambios recientes.
- Manejo de archivado de items con advertencia si aparecen en listas vivas.

Fase 4: Armado y listas vivas

- Vista de formulacion con PT objetivo opcional.
- Componentes dinamicos `MP/PT/MZR`.
- Preview calculado en tiempo real.
- Alertas de total kg y tolerancia.
- Guardado persistente que crea lista viva y snapshot.
- Edicion de listas existentes conservando codigo y generando nueva version snapshot.

Fase 5: Historico

- Vista de snapshots filtrable por producto, lista, fecha y estado.
- Detalle congelado: objetivo, componentes, composicion, tolerancia y alertas.
- Archivado de snapshots.
- Clonar snapshot a nueva lista como funcionalidad util tomada de `plan_pi_k26`.

Fase 6: Importacion futura de listas

- Vista funcional sin persistencia inicial.
- Seleccion de archivo, validacion de cabeceras, agrupacion por producto/lista y preview.
- Formato esperado minimo: `productoObjetivoId`, `listaAlias`, `componenteId`, `cantidad`.
- Reportar componentes inexistentes, IDs invalidos, cantidades no numericas y listas incompletas.

Fase 7: Funciones avanzadas posteriores

- Comparador de listas.
- Sustitucion de MP por MZR con criterio nutricional.
- Creacion manual de productos solo para admin y con auditoria fuerte.
- Validacion de minimos NPK como advertencia regulatoria separada.
- Auth real y roles persistidos; no fijar WorkOS todavia.

## Ajustes A Los Planes Existentes

- De `plan_codex.md`: conservar modelo, reglas de calculo/tolerancia, vistas principales, snapshots versionados, importacion futura y preferencias visuales.
- De `plan_oc.md`: incorporar `COD_ORIGINAL`, `ORIGEN`, autosave con debounce, estados de guardado y auditoria por campo.
- De `plan_pi_k26.md`: usar estructura React/TypeScript, rutas, responsive, preview client-side y modulos frontend; retirar duplicidad `insumos/productos`, recalculo persistido en cascada, limite de 11 componentes, WorkOS prematuro y snapshot solo por "Guardar Final".

## Pruebas Y Aceptacion

- Seed no permite doble carga y asigna IDs reproducibles.
- Cambiar una MP actualiza el calculo visible de listas vivas sin alterar snapshots previos.
- Guardar una lista crea snapshot `v1`; volver a guardar crea `v2`.
- Una formula con total distinto de 1000 se guarda con alerta.
- `SUP` produce `CUMPLE_S`, no `NO_CUMPLE`.
- Nutrientes no declarados aparecen como informativos.
- Usuario normal no puede editar `PT/MZR` ni eliminar fisicamente.
- Admin local puede editar `PT/MZR` y eliminar segun reglas.
- Snapshot conserva datos aunque se archive un item de catalogo.
- Importacion futura previsualiza y valida sin persistir.

## Supuestos

- El plan integrado no modifica codigo de aplicacion todavia; es especificacion para ejecucion posterior.
- `plan_codex.md` es la fuente primaria cuando haya conflicto.
- La validacion de minimos NPK no bloquea fase inicial; se agrega como modulo regulatorio posterior o advertencia explicita.
- El proveedor de autenticacion de produccion queda sin decidir.
- La regla exacta de clasificacion MZR se verifica contra el CSV antes de codificarla.
