# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: CODIFICACION DE LOTES

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| POE-3.11 | 01 | 2026-02-18 | 12 meses o ante cambio regulatorio |

## 1. OBJETIVO

Estandarizar la asignacion y marcado del codigo de lote para asegurar trazabilidad del producto terminado.

## 2. ALCANCE

Aplica a todos los lotes de producto terminado fabricados en CALFERQUIM S.A.S.

## 3. DEFINICIONES

- Codigo de lote: Identificador unico asignado a cada lote de fabricacion con la estructura ##-DDMMAA.
- Marcado: Impresion o inscripcion del codigo de lote sobre el saco o bigbag.

## 3.1. ESTRUCTURA DEL CODIGO DE LOTE

```
##-DDMMAA
```

Donde:
- `##` — Numero consecutivo del lote (dos digitos, ej: 01, 65, 99).
- `DDMMAA` — Fecha de fabricacion en formato dia-mes-año (dos digitos cada uno).

**Ejemplo:** `65-030326` corresponde al lote numero 65 fabricado el 03 de marzo de 2026.

El consecutivo es asignado por Bodega y se reinicia segun el periodo definido internamente. No puede repetirse dentro del mismo periodo.

## 4. DOCUMENTOS DE REFERENCIA

- POE 3.12 Liberacion de Lotes.

## 5. RESPONSABILIDADES Y POLITICAS

- Bodega asigna el codigo de lote al generar la orden de produccion y verifica que no sea duplicado.
- Bodega ejecuta el marcado del codigo sobre el empaque (saco o bigbag).
- Alistamiento confirma que el codigo marcado coincide con el de la orden de produccion.
- Se prohibe despachar producto sin codigo de lote marcado y confirmado.

## 6. PROCEDIMIENTO

1. BODEGA: Al generar la orden de produccion, asignar el codigo de lote segun la estructura ##-DDMMAA (seccion 3.1).
2. BODEGA: Verificar que el codigo asignado no exista ya en el periodo vigente (no duplicidad).
3. BODEGA: Registrar el codigo en la orden de produccion.
4. BODEGA: Ejecutar el marcado del codigo de lote sobre cada saco o bigbag del lote.
5. ALISTAMIENTO: Confirmar que el codigo marcado en el empaque coincide exactamente con el registrado en la orden de produccion.
6. Si hay discrepancia: corregir el marcado antes de continuar. Reportar al Jefe de Produccion.

## 7. CRITERIOS DE CONTROL Y ACEPTACION

| PARAMETRO | CRITERIO |
|---|---|
| Unicidad | Sin codigos duplicados en el periodo vigente |
| Estructura | Cumple formato ##-DDMMAA (ej: 65-030326) |
| Consistencia | Codigo identico en orden de produccion y empaque |
| Legibilidad | Codigo legible en todos los empaques del lote |

## 8. REGISTROS ASOCIADOS

- Orden de produccion (campo codigo de lote).


## REFERENCIA TÉCNICA

### Estructura y Reglas del Código de Lote

Formato base recomendado:

`AAAAMMDD-PROD-SERIE`

Ejemplo:

`20260218-SULFAK50-01`

Reglas:

- AAAAMMDD: fecha de fabricacion.
- PROD: abreviatura unica del producto.
- SERIE: consecutivo diario de 2 digitos.
- No se permite reutilizar el mismo codigo.

### Lista Maestra de Abreviaturas de Producto

| ABREVIATURA | PRODUCTO | ESTADO | FECHA APROBACION | RESPONSABLE |
|---|---|---|---|---|
| SULFAK50 | SULFAK 50 | Vigente | 2026-02-18 | Direccion Tecnica |
| CALFERC | CALFERCORRECTIVO | Vigente | 2026-02-18 | Direccion Tecnica |
| ZUELOCA | ZUELOCa | Vigente | 2026-02-18 | Direccion Tecnica |

Reglas de control:

- Toda abreviatura nueva requiere aprobacion de Direccion Tecnica y Calidad.
- No se permite reasignar abreviaturas retiradas.
- Este anexo debe actualizarse antes de usar una abreviatura nueva en lote.

## 9. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION |
|---|---|---|
