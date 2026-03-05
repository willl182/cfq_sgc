# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: MEZCLA Y HOMOGENIZACION

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| CGC-POE-3.06 | 01 | 2026-02-17 | 12 meses o ante cambio regulatorio |

---

## 1. OBJETIVO

Estandarizar las operaciones de carga y mezcla para garantizar la homogeneidad quimica y fisica de cada lote, asegurando que el producto final contenga la concentracion de nutrientes declarada en el Registro ICA.

## 2. ALCANCE

Aplica a los dos tipos de proceso de mezcla ejecutados en la planta de CALFERQUIM S.A.S.:

- **Tipo A — Mezcla fisica:** proceso manual de vaciado intercalado y paleado. El granel resultante va directamente a envase (POE 3.10).
- **Tipo B — Mezcla en tolva para granulacion:** vaciado intercalado en tolva mecanica. El granel resultante pasa al proceso de granulacion (POE 3.08).

## 3. DEFINICIONES

- Vaciado intercalado: Tecnica de carga en que los ingredientes de mayor proporcion se dividen en dos partes y los de menor proporcion se intercalan entre ellas (metodo sandwich).
- Paleado: Homogenizacion manual del material mediante pala, complementando el vaciado intercalado en el proceso de mezcla fisica.
- Mezcla fisica (blending): Proceso manual de combinacion de materias primas sin equipo mecanico de agitacion.
- Tolva: Equipo de mezcla mecanica usado en la preparacion del material para granulacion.
- Tiempo de Mezcla Efectivo: Tiempo transcurrido desde el cierre de la tolva hasta la apertura para descarga, en el proceso Tipo B.
- Segregacion: Separacion indeseada de particulas por diferencia de tamano o densidad.

## 4. DOCUMENTOS DE REFERENCIA

- Resolucion ICA pv0 (Propuesta): Anexo I-B, Pilar 17 "Controles del Proceso de Produccion".
- POE 3.08 Presentacion Fisica y Granulacion.

## 4.1. CONSIDERACIONES GMP

El orden de adicion de materias primas debe respetarse para asegurar la distribucion uniforme de todos los componentes. La limpieza entre lotes de diferente formula es obligatoria (POE 3.02).

## 5. RESPONSABILIDADES Y POLITICAS

### 5.1. Jefe de Produccion
- Define que tipo de proceso aplica para cada producto (Tipo A o Tipo B) segun la Orden de Produccion.
- En Tipo B, asegura el cumplimiento del tiempo de mezcla de 4 minutos.
- Recibe el reporte del operario en caso de anomalia visual y define la accion correctiva.

### 5.2. Operario de Mezcla
- Ejecuta la secuencia de carga y el proceso segun el tipo indicado en la Orden de Produccion.
- Reporta al Jefe de Produccion cualquier anomalia visual durante el proceso.

---

## 6. PROCEDIMIENTO

### 6.1. Tipo A — Mezcla Fisica (Vaciado Intercalado y Paleado)

Este proceso aplica a productos que no requieren granulacion. La mezcla se realiza de forma manual.

1. OPERARIO: Verificar que el area de mezcla este limpia y libre de residuos del lote anterior (POE 3.02).
2. OPERARIO: Vaciar la primera mitad de los ingredientes de mayor proporcion (segun Orden de Produccion).
3. OPERARIO: Vaciar los ingredientes de menor proporcion sobre la primera capa.
4. OPERARIO: Vaciar la segunda mitad de los ingredientes de mayor proporcion cubriendo la carga anterior.
5. OPERARIO: Palear el conjunto de manera uniforme hasta obtener una mezcla homogenea en color y textura.
6. OPERARIO: Verificar visualmente la homogeneidad del material (color y textura uniformes, sin zonas diferenciadas).
7. SI CUMPLE: El granel queda listo para envase (POE 3.10).
8. SI NO CUMPLE: Continuar paleando y reportar al Jefe de Produccion si la anomalia persiste.

---

### 6.2. Tipo B — Mezcla en Tolva para Granulacion

Este proceso aplica a productos que pasan por granulacion (POE 3.08). La mezcla se realiza en tolva mecanica.

1. OPERARIO: Verificar limpieza interna de la tolva y compuerta de descarga cerrada y asegurada (POE 3.02).
2. OPERARIO: Cargar la primera mitad de los ingredientes de mayor proporcion (segun Orden de Produccion).
3. OPERARIO: Cargar los ingredientes de menor proporcion sobre la primera capa.
4. OPERARIO: Cargar la segunda mitad de los ingredientes de mayor proporcion cubriendo la carga anterior.
5. OPERARIO: Cerrar la tolva y cronometrar el Tiempo de Mezcla Efectivo.
   - Punto Critico: Respetar tiempo minimo de 4 minutos de mezcla efectiva.
6. OPERARIO: Al completar los 4 minutos, abrir la compuerta de descarga.
7. OPERARIO: Verificar visualmente la homogeneidad del material durante la descarga (color y textura uniformes, sin puntos diferenciados).
8. SI CUMPLE: El granel pasa al proceso de granulacion (POE 3.08).
9. SI NO CUMPLE: Detener la descarga y reportar al Jefe de Produccion para definir la accion correctiva. Registrar la desviacion.

---

## 7. CRITERIOS DE CONTROL Y ACEPTACION

| PROCESO | PARAMETRO | CRITERIO | ACCION SI FALLA |
|:---|:---|:---|:---|
| Tipo A | Aspecto visual | Homogeneo, color y textura uniformes tras el paleado | Continuar paleando. Reportar si persiste. |
| Tipo B | Tiempo de Mezcla | Minimo 4 minutos exactos (cronometrado) | Completar el tiempo. Registrar causa. |
| Tipo B | Aspecto visual | Homogeneo, sin puntos diferenciados durante descarga | Detener descarga. Reportar a Jefe de Produccion. |

## 8. REGISTROS ASOCIADOS

- `Formato_Control_Mezcla_Homogenizacion_V1.csv`: Registro de tipo de proceso, secuencia de carga y controles.
- `Registro_Mezcla_Homogenizacion_V1.csv`: Historico de lotes mezclados.

## 9. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION DEL CAMBIO |
|---|---|---|
| 01 | 2026-02-17 | Emision inicial. |
| 01 | 2026-03-05 | Ajuste operacional: metodo sandwich; eliminacion de firma supervisor, rol Calidad en muestreo, criterio CV<10% y remezcla. Verificacion visual por operario. |
| 01 | 2026-03-05 | Se incluyen dos tipos de proceso: Tipo A (mezcla fisica manual con vaciado intercalado y paleado, granel va a envase) y Tipo B (mezcla en tolva mecanica para granulacion, 4 minutos, granel va a POE 3.08). |
