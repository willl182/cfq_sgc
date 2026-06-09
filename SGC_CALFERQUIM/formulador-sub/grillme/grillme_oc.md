# Sesion Grill-Me - Reconfiguracion Formulador Sub

## Contexto Inicial

El usuario quiere reconfigurar el aplicativo usando como base `insumos_ref/mp-pt_mzr.csv`, que contiene materias primas, productos terminados y mezclas de reemplazo. La base debe precargarse en Convex. Las composiciones deben ser editables desde la vista segun permisos. El formulador debe calcular composicion con `insumos_ref/formula.md`, tolerancias con `insumos_ref/tolerancia.md`, alertar cumplimiento y guardar listas vivas e historicos snapshot.

## Decisiones Confirmadas

### Lista global vs historico

Decision: separar lista global viva e historico snapshot.

- La lista global referencia el catalogo vivo y recalcula si cambia la composicion de un insumo.
- El historico snapshot conserva composiciones y resultados del momento.

### Codigos e identificadores

Problema detectado: `COD` no sirve como clave estable porque los codigos van a cambiar y en el CSV hay `COD = R` repetido.

Decision: usar identificadores internos por clase.

- `MP0001`, `MP0002`, ... para materias primas.
- `PT0001`, `PT0002`, ... para productos terminados.
- `MZR0001`, `MZR0002`, ... para mezclas de reemplazo.
- IDs asignados por orden del CSV inicial.
- `COD` se conserva como dato operativo/migrable.
- `COD_ORIGINAL` se conserva para trazabilidad.

### Clasificacion MZR

Decision: las filas actuales con `COD = R` son mezclas de reemplazo y pasan a `CLASE = MZR` con ID `MZR000X`.

- `MZR` puede ser reusable como componente.
- `MZR` no se edita por usuario normal; solo admin.

### Campo ORIGEN

Decision: guardar `ORIGEN`.

- `BASE_CSV`: registros precargados desde `mp-pt_mzr.csv`.
- `USUARIO`: registros/listas creados desde el aplicativo.

### Edicion de catalogo

Decision: edicion directa del catalogo vivo, con autosave y log.

- Autosave con debounce, no en cada tecla inmediata.
- Registrar log por campo cambiado.
- No hacer versionado operativo completo de cada insumo.

### Permisos iniciales

Decision: modo admin local por ahora; Auth despues.

- Usuario normal puede editar `MP`.
- Usuario normal no puede editar `PT` ni `MZR`.
- Admin local puede editar `MP`, `PT` y `MZR`.
- Los PT deben permanecer estables porque son la composicion declarada contra la que se compara.

### Backend

Decision: usar Convex desde ya.

- No iniciar con `localStorage` como base operativa.
- Convex debe estar vacio para el cargue inicial.

### Colecciones Convex

Decision: crear 4 colecciones principales.

- `catalogItems`
- `formulaLists`
- `formulaSnapshots`
- `catalogChangeLog`

### Componentes permitidos

Decision: el formulador permite usar `MP`, `PT` y `MZR` como componentes.

- No se quiere alerta especial cuando se use un `PT` como componente.

### Base de calculo

Decision: base unica de 1000 kg.

- Toda formula se prepara a 1000 kg.
- La composicion se calcula como `(cantidadKg / 1000) * concentracion`.
- No existe escenario de 100 kg.
- Si la suma no da 1000 kg, se muestra alerta persistente.
- Se permite guardar con alerta.
- No normalizar automaticamente.

### Listas por producto

Decision: cada producto puede tener varias listas con consecutivo reiniciado por producto.

Ejemplo:

- `PT0001`: `L1`, `L2`, `L3`.
- `PT0002`: `L1`, `L2`.

### Snapshots

Decision: crear snapshot automatico antes de sobrescribir una lista viva existente.

El snapshot debe incluir:

- Producto destino con datos y composicion del momento.
- Componentes con datos, cantidades y composicion del momento.
- Resultado calculado.
- Evaluacion de tolerancia.
- Total kg y alertas.
- Fecha, usuario y razon, por ejemplo `AUTO_BEFORE_UPDATE`.

### Tolerancias y cumplimiento

Decision: evaluar contra la composicion declarada del PT destino.

- Evaluar solo nutrientes declarados en el PT destino con valor mayor a 0.
- Nutrientes calculados pero no declarados se muestran como informativos y no afectan estado general.
- `NC` solo cuando hay deficit por debajo del minimo.
- `SUP` es advertencia discreta, no alerta critica.
- `C` es conforme.

## Preguntas Resueltas

1. Se confirmo separacion entre lista global viva e historico snapshot.
2. Se descarto `COD` como clave estable por migracion de codigos.
3. Se eligio esquema simple `MP000X`, `PT000X`, `MZR000X`.
4. Se decidio que mezclas de reemplazo con `R` sean `MZR`.
5. Se omitio control de `ESTADO` por ahora.
6. Se acepto `ORIGEN` para trazabilidad minima.
7. Se acepto autosave con debounce.
8. Se acepto log historico por campo cambiado.
9. Se aclaro que PT no es editable por usuario normal.
10. Se eligio Convex desde la reconfiguracion inicial.
11. Se confirmaron cuatro colecciones Convex.
12. Se permitio usar `MP`, `PT` y `MZR` como componentes.
13. Se descarto alerta al usar PT como componente.
14. Se fijo base unica 1000 kg.
15. Se acepto guardar con alerta si total no suma 1000.
16. Se definio consecutivo `L1`, `L2`, `L3` reiniciado por producto.
17. Se acepto snapshot automatico antes de editar/sobrescribir lista existente.
18. Se decidio evaluar solo nutrientes declarados.
19. Se definio `SUP` como advertencia discreta y `NC` como critico.
20. Se confirmo cargue inicial con Convex vacio y orden del CSV.

## Pendientes para Implementacion

- Definir mecanismo exacto del modo admin local.
- Definir comandos de seed Convex.
- Ajustar UI para listas por producto.
- Ajustar persistencia actual que venia de Google Apps Script/Sheets.
- Validar formulas existentes contra la regla base 1000.
- Guardar logs de cambios y snapshots con fechas consistentes.
