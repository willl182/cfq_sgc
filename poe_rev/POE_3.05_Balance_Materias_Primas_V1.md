# POE 3.05 - Balance de Materias Primas

- Codigo: POE-3.05
- Version: V1
- Vigencia: 2026-02-17
- Responsable: Jefe de Produccion / Control de Calidad

## 1. Objetivo

Establecer el metodo para verificar el balance de masas por lote, asegurando coherencia entre materias primas recibidas, consumo en produccion, inventario y residuos.

## 2. Alcance

Aplica a todos los lotes fabricados en CALFERQUIM para productos acondicionadores y fertilizantes.

## 3. Definiciones

- Entrada total (kg): suma de materias primas cargadas al lote.
- Salida total (kg): producto terminado + mermas + residuos + retenciones.
- Diferencia de masa (kg): Entrada total - Salida total.
- Desviacion porcentual (%): (Diferencia de masa / Entrada total) x 100.
- Tolerancia: limite maximo de desviacion aceptado para liberar el lote.

## 4. Responsabilidades

- Produccion: registrar pesajes de entrada y salida por lote.
- Calidad: revisar calculo, tolerancias y liberar observaciones.
- Direccion Tecnica: aprobar acciones cuando hay desviaciones fuera de tolerancia.

## 5. Procedimiento

1. Al cierre de cada lote, Produccion consolida pesos de materias primas cargadas (entrada total).
2. Produccion registra salidas del lote: producto conforme, producto no conforme, mermas, residuos y retenciones.
3. Calidad verifica unidades de medida y coherencia entre orden de produccion, pesajes y registros de proceso.
4. Calidad calcula diferencia de masa y desviacion porcentual con la formula oficial del numeral 6.
5. Calidad compara el resultado contra la tolerancia vigente y define estado del balance.
6. Si cumple, se marca "Conforme" y se habilita continuidad del flujo de liberacion de lote.
7. Si no cumple, se abre no conformidad, se bloquea liberacion y se activa analisis de causa.
8. Direccion Tecnica define accion: ajuste documental, reproceso controlado, rechazo o investigacion ampliada.
9. Se archiva registro final firmado en `3.05_Balance_Materias_Primas/Registros/`.

## 6. Criterios de control y aceptacion

- Formula oficial:
  - Diferencia de masa (kg) = Entrada total - Salida total
  - Desviacion porcentual (%) = (Diferencia de masa / Entrada total) x 100
- Tolerancia inicial de control por lote: +/- 2.0%.
- Frecuencia: 100% de los lotes fabricados.
- Escalamiento por desviacion:
  - Hasta +/- 2.0%: Conforme.
  - Mayor a +/- 2.0% y hasta +/- 3.0%: Observado, requiere evaluacion y autorizacion de Calidad.
  - Mayor a +/- 3.0%: No conforme, requiere apertura de no conformidad y aprobacion de Direccion Tecnica.

## 7. Registros asociados

- `Formato_Balance_Materias_Primas_V1.csv`
- Registro de no conformidades (si aplica).
- Consolidado semanal o mensual de balance.

## 8. Anexos

- Anexo 1. Ejemplo de calculo de balance por lote.
- Anexo 2. Matriz de causas frecuentes de desviacion.

## 9. Control de cambios

- V1: Creacion inicial del procedimiento.
