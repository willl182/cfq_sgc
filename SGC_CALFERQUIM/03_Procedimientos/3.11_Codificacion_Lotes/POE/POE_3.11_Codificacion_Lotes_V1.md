# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: CODIFICACION DE LOTES

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| POE-3.11 | 01 | 2026-02-18 | 12 meses o ante cambio regulatorio |

## 1. OBJETIVO

Estandarizar la asignacion y control del codigo de lote para asegurar trazabilidad desde produccion hasta cliente final.

## 2. ALCANCE

Aplica a lotes de producto terminado, lotes en reproceso autorizados y lotes fabricados para terceros.

## 3. DEFINICIONES

- Codigo de lote: Identificador unico de fabricacion.
- Reproceso: Reingreso controlado de producto bajo aprobacion de Calidad.
- Serie diaria: Secuencia numerica del dia.

## 4. DOCUMENTOS DE REFERENCIA

- DC-SI12 Asignacion de Lotes, Muestreo y Control de Calidad.
- POE 3.12 Liberacion de Lotes.
- Anexo 2: Lista maestra de abreviaturas de producto.

## 5. RESPONSABILIDADES Y POLITICAS

- Produccion debe solicitar codigo antes de iniciar lote.
- Calidad debe validar estructura y no duplicidad del codigo.
- Se prohibe imprimir etiquetas con lote no aprobado.
- Todo cambio de lote debe quedar trazado y firmado.

## 6. PROCEDIMIENTO

1. Produccion solicita asignacion en `Formato_Asignacion_Lotes_V1.csv`.
2. Calidad genera codigo segun estructura definida en anexo 1 y abreviatura aprobada en anexo 2.
3. Calidad verifica que no exista lote repetido en el periodo vigente.
4. Produccion registra codigo en orden de produccion y etiquetas.
5. Calidad confirma consistencia entre orden, etiqueta y registro.
6. Bodega usa el codigo para trazabilidad de almacenamiento y despacho.
7. Calidad consolida historial en `Registro_Codificacion_Lotes_V1.csv`.

## 7. CRITERIOS DE CONTROL Y ACEPTACION

| PARAMETRO | CRITERIO |
|---|---|
| Unicidad | Sin codigos duplicados |
| Estructura | Cumple formato AAAAMMDD-PROD-SERIE |
| Abreviatura | Debe existir y estar vigente en lista maestra controlada |
| Consistencia documental | Mismo lote en OP, etiqueta y registro |
| Trazabilidad | Lote vinculable a materia prima y cliente |

## 8. REGISTROS ASOCIADOS

- `Formato_Asignacion_Lotes_V1.csv`
- `Registro_Codificacion_Lotes_V1.csv`

## 9. ANEXOS

- Anexo 1: Estructura oficial del codigo de lote.
- Anexo 2: Lista maestra de abreviaturas de producto.

## 10. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION |
|---|---|---|
| 01 | 2026-02-18 | Emision inicial separada de DC-SI12. |
