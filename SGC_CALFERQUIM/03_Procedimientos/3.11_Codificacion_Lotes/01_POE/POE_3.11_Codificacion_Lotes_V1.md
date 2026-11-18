# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: CODIFICACION DE LOTES

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| POE-3.11 | 02 | 2026-11-05 | 12 meses o ante cambio regulatorio |

## 1. OBJETIVO

Estandarizar la asignacion y marcado del codigo de lote para asegurar trazabilidad del producto terminado.

## 2. ALCANCE

Aplica a todos los lotes de producto terminado fabricados en CALFERQUIM S.A.S.

## 3. DEFINICIONES

- Codigo de lote: Identificador unico asignado a cada lote de fabricacion con la estructura CODIGO-DDMMAA.
- Codigo de producto: Codigo de item (facturacion) asignado al producto terminado.
- Marcado: Impresion o inscripcion del codigo de lote sobre el saco o bigbag.

## 3.1. ESTRUCTURA DEL CODIGO DE LOTE

```
CODIGO-DDMMAA
```

Donde:
- `CODIGO` — Codigo de item del producto terminado.
- `DDMMAA` — Fecha de fabricacion en formato dia-mes-año (dos digitos cada uno).

**Ejemplo:** `65-030326` corresponde al producto con codigo 65 fabricado el 03 de marzo de 2026.

Por estructura, cada producto tiene un solo codigo de lote por dia de fabricacion. Este es el unico formato de lote valido en el SGC; cualquier otro formato citado en otros documentos queda sin efecto.

## 4. DOCUMENTOS DE REFERENCIA

- DC-SI12 Asignacion de Lotes, Muestreo y Control de Calidad (legacy).
- POE 3.12 Liberacion de Lotes.

## 5. RESPONSABILIDADES Y POLITICAS

- Bodega asigna el codigo de lote al generar la orden de produccion y verifica que no sea duplicado.
- Bodega ejecuta el marcado del codigo sobre el empaque (saco o bigbag).
- Alistamiento confirma que el codigo marcado coincide con el de la orden de produccion.
- Se prohibe despachar producto sin codigo de lote marcado y confirmado.

## 6. PROCEDIMIENTO

1. BODEGA: Al generar la orden de produccion, asignar el codigo de lote segun la estructura CODIGO-DDMMAA (seccion 3.1).
2. BODEGA: Verificar en `Registro_Codificacion_Lotes_V1.xlsx` que el codigo asignado no exista (no duplicidad).
3. BODEGA: Registrar el codigo en la orden de produccion y en `Formato_Asignacion_Lotes_V1.xlsx`.
4. BODEGA: Ejecutar el marcado del codigo de lote sobre cada saco o bigbag del lote.
5. ALISTAMIENTO: Confirmar que el codigo marcado en el empaque coincide exactamente con el registrado en la orden de produccion.
6. Si hay discrepancia: corregir el marcado antes de continuar. Reportar al Jefe de Produccion.

## 7. CRITERIOS DE CONTROL Y ACEPTACION

| PARAMETRO | CRITERIO |
|---|---|
| Unicidad | Sin codigos de lote duplicados |
| Estructura | Cumple formato CODIGO-DDMMAA (ej: 65-030326) |
| Consistencia | Codigo identico en orden de produccion y empaque |
| Legibilidad | Codigo legible en todos los empaques del lote |

## 8. REGISTROS ASOCIADOS

- Orden de produccion (campo codigo de lote).
- `Formato_Asignacion_Lotes_V1.xlsx`
- `Registro_Codificacion_Lotes_V1.xlsx`

## 9. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION |
|---|---|---|
| 01 | 2026-02-18 | Emision inicial. |
| 02 | 2026-11-05 | Formato unico de lote CODIGO-DDMMAA (codigo de item del producto + fecha). Se elimina el formato alterno AAAAMMDD-PROD-SERIE y se vinculan formato y registro. |
