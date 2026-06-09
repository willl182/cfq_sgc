# Plan de Reconfiguracion - Formulador Sub

## Objetivo

Reconfigurar el aplicativo para trabajar con una base viva de insumos en Convex, precargada inicialmente desde `insumos_ref/mp-pt_mzr.csv`, permitiendo formular productos sobre base 1000 kg, calcular composicion y tolerancias, guardar listas vivas por producto y conservar snapshots historicos trazables.

## Fuente Inicial

- Archivo base: `insumos_ref/mp-pt_mzr.csv`.
- Convex debe iniciar vacio para el cargue inicial.
- El cargue inicial asigna IDs segun el orden actual del CSV.
- El `COD` original se conserva como `COD` inicial y tambien como `COD_ORIGINAL`.

## Identificadores

- Materias primas: `MP0001`, `MP0002`, ...
- Productos terminados: `PT0001`, `PT0002`, ...
- Mezclas de reemplazo: `MZR0001`, `MZR0002`, ...
- Las filas con `COD = R` del CSV se clasifican como `MZR`.
- `ID_PROD` es la clave interna estable.
- `COD` es un codigo operativo/migrable y no debe usarse como clave de relaciones.

## Modelo de Datos Convex

### `catalogItems`

Catalogo vivo de MP, PT y MZR.

Campos principales:

- `ID_PROD`
- `COD`
- `COD_ORIGINAL`
- `PRODUCTO`
- `CLASE`: `MP`, `PT`, `MZR`
- `TIPO`
- `ORIGEN`: `BASE_CSV` o `USUARIO`
- composicion nutricional: `C`, `N`, `N-NH4`, `N-NO3`, `N-org`, `N-ur`, `P`, `K`, `CaO`, `MgO`, `S`, `B`, `Co`, `Cu`, `Fe`, `Mn`, `Mo`, `SiO2`, `Zn`, `Na`
- metadatos: `createdAt`, `updatedAt`, `updatedBy`

Reglas:

- Usuarios normales pueden editar solo `MP`.
- `PT` y `MZR` solo son editables en modo admin local.
- Todos los cambios editables generan log.

### `formulaLists`

Listas vivas/recalculables por producto destino.

Campos principales:

- `listId`
- `productoDestinoId`
- `listNumber`: consecutivo reiniciado por cada producto (`L1`, `L2`, `L3`, ...)
- `nombreLista`
- `componentes`: lista de `{ itemId, cantidadKg }`
- `baseKg`: `1000`
- `totalKg`
- `alertas`
- `createdAt`, `updatedAt`, `updatedBy`

Reglas:

- Cada producto puede tener multiples listas: `L1`, `L2`, `L3`, etc.
- La lista viva referencia componentes por `ID_PROD`; por eso se recalcula automaticamente con el catalogo vigente.
- Se permite guardar aunque `totalKg` no sea 1000, pero queda alerta persistente.
- Componentes permitidos: `MP`, `PT` y `MZR`.

### `formulaSnapshots`

Historico congelado de listas.

Campos principales:

- `snapshotId`
- `listId`
- `productoDestinoSnapshot`: datos completos del PT destino al momento
- `componentesSnapshot`: componentes con `ID_PROD`, `COD`, `PRODUCTO`, `CLASE`, `cantidadKg` y composicion completa al momento
- `resultadoCalculado`
- `evaluacionTolerancia`
- `totalKg`
- `alertas`
- `createdAt`, `createdBy`
- `reason`: por ejemplo `AUTO_BEFORE_UPDATE`

Reglas:

- Antes de sobrescribir una lista viva existente, crear automaticamente un snapshot de la version anterior.
- El snapshot no cambia si luego cambia la composicion de una MP, PT o MZR.

### `catalogChangeLog`

Log de auditoria de cambios de composicion/catalogo.

Campos principales:

- `changeId`
- `ID_PROD`
- `COD`
- `PRODUCTO`
- `CLASE`
- `changedAt`
- `changedBy`
- `field`
- `oldValue`
- `newValue`
- `reason` opcional

Reglas:

- Registrar cambios por campo modificado.
- No se requiere versionado completo operativo de cada insumo.

## Roles Iniciales

- De momento el modo admin sera local, no Auth real.
- Luego se migrara a Auth/roles persistidos.
- Usuario normal:
  - puede editar `MP`.
  - no puede editar `PT` ni `MZR`.
- Admin local:
  - puede editar `MP`, `PT` y `MZR`.

## Autosave

- La edicion del catalogo debe usar autosave con debounce.
- No guardar en cada tecla inmediatamente.
- Mostrar estados de guardado: `Guardando`, `Guardado`, `Error`.
- Cada autosave exitoso debe generar logs por campo cambiado.

## Calculo de Formula

Base unica: 1000 kg.

Formula por nutriente:

```text
aporte = (cantidadKg / 1000) * concentracionDelComponente
composicionFinal[nutriente] = suma(aportes)
```

Reglas:

- La suma esperada de componentes es 1000 kg.
- Si `totalKg != 1000`, mostrar alerta persistente.
- Se puede guardar lista con alerta.
- No hay escenario de base 100 kg.
- No normalizar automaticamente a 1000 si el total no suma 1000.

## Tolerancias

Fuente: `insumos_ref/tolerancia.md`.

Reglas:

- Comparar la composicion calculada contra la composicion declarada del producto destino.
- Evaluar solo nutrientes declarados en el PT destino con valor mayor a 0.
- Si un nutriente no declarado aparece calculado, mostrarlo como informativo/no declarado, sin afectar el estado general.
- `NC` solo cuando un nutriente declarado queda por debajo del minimo permitido.
- `SUP` es una advertencia discreta, no critica.
- `C` indica cumplimiento dentro de tolerancia.

Prioridad visual:

- `NC`: critico.
- `SUP`: advertencia no escandalosa.
- `C`: conforme.

## Flujo de Listas

1. Usuario selecciona un producto destino, normalmente `PT`.
2. El sistema muestra/crea listas para ese producto: `L1`, `L2`, `L3`, etc.
3. Usuario arma la lista con componentes `MP`, `PT` o `MZR` y cantidades en kg base 1000.
4. El sistema calcula composicion final.
5. El sistema evalua tolerancia contra la composicion declarada del PT destino.
6. Usuario guarda la lista viva.
7. Si esta editando una lista existente, antes de sobrescribir se crea snapshot automatico de la version anterior.

## Cargue Inicial

Reglas de seed:

- Convex debe estar vacio.
- Leer `insumos_ref/mp-pt_mzr.csv`.
- Procesar en orden del archivo.
- Para filas `CLASE = MP`, asignar `MP000X`.
- Para filas con `COD = R`, asignar `MZR000X` y `CLASE = MZR`.
- Para las demas filas `CLASE = PT`, asignar `PT000X`.
- Guardar `ORIGEN = BASE_CSV`.
- Guardar `COD_ORIGINAL` igual al `COD` del CSV.

## Primer Corte Implementable

1. Agregar Convex al proyecto.
2. Definir schema de `catalogItems`, `formulaLists`, `formulaSnapshots`, `catalogChangeLog`.
3. Implementar seed inicial desde `insumos_ref/mp-pt_mzr.csv`.
4. Reemplazar acceso a Google Sheets/local cache por Convex para catalogo y formulas.
5. Implementar modo admin local.
6. Ajustar vista de catalogo para edicion con permisos: MP normal, PT/MZR admin.
7. Implementar autosave con debounce y log por campo.
8. Ajustar formulador a listas `L1`, `L2`, `L3` por producto.
9. Implementar snapshots automaticos antes de sobrescribir lista existente.
10. Ajustar calculo base 1000 y alertas persistentes por total distinto de 1000.
11. Ajustar evaluacion de tolerancias solo sobre nutrientes declarados.
