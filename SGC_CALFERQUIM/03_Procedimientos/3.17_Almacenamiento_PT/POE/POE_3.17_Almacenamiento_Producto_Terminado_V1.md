# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: ALMACENAMIENTO DE PRODUCTO TERMINADO

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| POE-3.17 | 01 | 2026-02-18 | 12 meses o ante cambio regulatorio |

## 1. OBJETIVO

Estandarizar el almacenamiento de producto terminado (PT) para preservar calidad, evitar mezclas indebidas y asegurar despacho por lote correcto.

## 2. ALCANCE

Aplica a PT liberado o en cuarentena dentro de bodegas de CALFERQUIM S.A.S.

## 3. DEFINICIONES

- PT: Producto terminado en presentacion comercial.
- FEFO: First Expire First Out, salida por fecha de vencimiento mas cercana.
- Segregacion: Separacion fisica por estado o compatibilidad.

## 4. DOCUMENTOS DE REFERENCIA

- DC-SI37 Almacenamiento Seguro y Conteo de Bultos.
- RC-SI53 Traslado de Producto Terminado al Almacen.
- Formato_Control_Almacenamiento_PT_V1.csv.

## 5. RESPONSABILIDADES Y POLITICAS

- Bodega debe recibir solo PT con lote y estado documental valido.
- Calidad debe validar estatus de lote antes de despacho.
- Se prohibe mezclar lotes incompatibles o sin identificacion.
- Se debe aplicar FEFO en toda salida de inventario.

## 6. PROCEDIMIENTO

1. Bodega recibe PT con soporte de traslado y verifica integridad de empaque.
2. Bodega registra ingreso en `Formato_Control_Almacenamiento_PT_V1.csv`.
3. Bodega ubica PT por lote, estado y compatibilidad (anexo 2).
4. Calidad verifica identificacion y estatus de liberacion.
5. Bodega realiza conteo ciclico y control de condiciones ambientales.
6. Para despacho, Bodega selecciona lote por FEFO y valida con Calidad.
7. Bodega consolida trazabilidad de movimientos en `Registro_Almacenamiento_PT_V1.csv`.

## 7. CRITERIOS DE CONTROL Y ACEPTACION

| PARAMETRO | CRITERIO |
|---|---|
| Integridad empaque | Sin rotura, humedad ni fuga |
| Identificacion | Producto, lote, fecha y estado visibles |
| Condiciones de bodega | Area limpia, seca y con pasillos libres |
| Rotacion | FEFO aplicado en despacho |

## 8. REGISTROS ASOCIADOS

- `Formato_Control_Almacenamiento_PT_V1.csv`
- `Registro_Almacenamiento_PT_V1.csv`

## 9. ANEXOS

- Anexo 1: Condiciones de almacenamiento de PT.
- Anexo 2: Matriz de compatibilidad de almacenamiento.

## 10. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION |
|---|---|---|
| 01 | 2026-02-18 | Emision inicial homologada para almacenamiento PT. |
