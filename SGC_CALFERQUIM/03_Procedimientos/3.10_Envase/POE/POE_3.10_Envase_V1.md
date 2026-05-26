# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: ENVASE Y ROTULADO

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| CGC-POE-3.10 | 01 | 2026-02-17 | 12 meses o ante cambio regulatorio |

---

## 1. OBJETIVO

Estandarizar las operaciones de envasado, pesado, sellado y etiquetado para garantizar que cada unidad comercial cumpla con el contenido neto declarado y posea la informacion legal obligatoria (Registro ICA, Lote, Fecha Vencimiento) para su trazabilidad y venta.

## 2. ALCANCE

Este procedimiento aplica a las dos presentaciones comerciales utilizadas en CALFERQUIM S.A.S.: **sacos** y **bigbag**. No aplica a productos liquidos ni a otros tipos de envase.

## 3. DEFINICIONES

- Saco: Presentacion en bolsa de polipropileno tejido, sellada tras el llenado.
- Bigbag: Presentacion a granel en contenedor flexible de gran capacidad.
- Contenido Neto: Cantidad de producto contenido en el empaque, excluyendo la tara.
- Lote: Codigo unico de identificacion que permite trazar la historia de fabricacion.
- Etiqueta Aprobada: Arte grafico autorizado por el ICA en la Resolucion de Registro del producto.
- Doble pesaje: Verificacion del peso en dos puntos del proceso: en planta (produccion) y en alistamiento.

## 4. DOCUMENTOS DE REFERENCIA

- Resolucion ICA pv0 (Propuesta): Anexo II-F "Requisitos de Etiquetado".
- NTC 1000: Sistema Internacional de Unidades.
- Resolucion 16379 de 2003: Control metrologico del contenido neto.

## 4.1. CONSIDERACIONES GMP (BUENAS PRACTICAS DE MANUFACTURA)

Antes de iniciar el envasado, se debe realizar un despeje de linea riguroso para retirar cualquier etiqueta, envase o producto del lote anterior. Se prohibe tener etiquetas de diferentes productos en la misma mesa de trabajo. Las balanzas utilizadas para el control de peso deben verificarse con pesas patron al inicio de cada turno y registrarse.

## 5. RESPONSABILIDADES Y POLITICAS

### 5.1. Jefe de Produccion
- Debe asegurar la disponibilidad de los materiales de empaque correctos segun la Orden de Produccion.
- Es responsable de configurar las basulas para cumplir con el peso objetivo.

### 5.2. Supervisor de Linea
- Debe verificar que el codificador (inkjet/sello) tenga la fecha y lote correctos antes de imprimir la primera unidad.
- Tiene la autoridad para detener la linea si detecta fallas en el sellado o peso fuera de tolerancia.

### 5.3. Operario de Envase
- Debe inspeccionar visualmente cada saco o bigbag vacio para asegurar que este en buen estado.
- Se prohibe liberar unidades con peso fuera de la tolerancia del ±1%.

### 5.4. Control de Calidad
- Debe cotejar la etiqueta fisica contra el "Arte Aprobado ICA" vigente para el producto.

## 6. PROCEDIMIENTO

### 6.1. Alistamiento de Linea

1. SUPERVISOR: Verificar orden de produccion y solicitar materiales de empaque al almacen.
2. SUPERVISOR: Realizar despeje de linea (retirar materiales del lote anterior).
3. CALIDAD: Entregar al Supervisor el "Patron de Etiqueta" aprobado para ese lote.
   - Punto Critico: Verificar Textos Legales, Registro ICA, Composicion Garantizada.

### 6.2. Configuracion de Codificacion

4. OPERARIO: Ajustar el codificador con:
   - Lote: [Segun Orden]
   - Fecha Fab: [Hoy]
   - Fecha Venc: [Segun vida util]
5. SUPERVISOR: Imprimir una prueba y verificar legibilidad. Firmar el visto bueno en el registro.

### 6.3. Operacion de Llenado y Pesado

6. OPERARIO: Iniciar el llenado de sacos o bigbag segun la presentacion indicada en la Orden de Produccion.
7. OPERARIO (PLANTA - PRODUCCION): Verificar el peso de cada unidad con la basula de produccion.
   - Tolerancia: ±1% del Contenido Neto declarado.
   - Si una unidad esta fuera de tolerancia: ajustar el contenido y re-pesar antes de sellar.
8. OPERARIO: Cerrar y sellar el saco o bigbag inmediatamente.
9. OPERARIO (ALISTAMIENTO): Pesar nuevamente cada unidad en la basula de alistamiento para verificacion.
   - Si el peso en alistamiento coincide con el de produccion (dentro de ±1%): unidad conforme.
   - Si hay discrepancia: re-pesar en ambas basulas. Reportar al Supervisor para definir accion correctiva.

### 6.4. Etiquetado y Embalaje Final

10. OPERARIO: Adherir o verificar la etiqueta en el saco o bigbag.
    - Sacos: la etiqueta va impresa o adherida al saco; verificar que sea legible y correcta.
    - Bigbag: verificar que la identificacion del lote este correctamente marcada.
    - Control: ningun texto diferente al del Arte Aprobado ICA.
11. PRODUCCION: Notificar fin de lote a Calidad para inicio del proceso de Liberacion (POE 3.12).

## 7. CRITERIOS DE CONTROL Y ACEPTACION

| VARIABLE | CRITERIO | ACCION SI FALLA |
|:---|:---|:---|
| Peso Individual (Produccion) | Dentro de ±1% del Contenido Neto | Ajustar y re-pesar antes de sellar. |
| Verificacion de Peso (Alistamiento) | Coincide con peso de produccion dentro de ±1% | Doble pesaje en ambas basulas. Reportar al Supervisor. |
| Legibilidad Lote/Venc | 100% legible y adherido | Borrar y re-imprimir. Rechazar envase. |
| Hermeticidad Sello | Saco o bigbag sellado correctamente, sin aberturas | Re-sellar. Cambiar empaque si esta danado. |
| Texto Etiqueta | Coincide 100% con Arte Aprobado ICA | DETENER LINEA. Segregar todo el lote. Incidente Critico. |

## 8. REGISTROS ASOCIADOS

- `Formato_Control_Envase_V1.csv`: Registro de pesos y verificacion de etiquetas.
- `Registro_Envase_V1.csv`: Consolidado de unidades producidas por turno.

## 9. ANEXOS

### Tolerancias de Peso por Presentación

## Instrucciones

Esta tabla define las tolerancias de peso neto permitidas por presentación. **Debe** verificarse en la báscula de envase antes, durante y al final de cada lote. **Se prohíbe** despachar producto fuera de tolerancia.

## Tolerancias por Presentación

| PRESENTACIÓN | PESO NOMINAL | TOLERANCIA INDIVIDUAL | PESO MÍNIMO ACEPTABLE | PESO MÁXIMO ACEPTABLE | FRECUENCIA DE VERIFICACIÓN |
|:---|:---:|:---:|:---:|:---:|:---|
| **Saco 50 kg** | 50.00 kg | ± 1.0% (± 500 g) | 49.50 kg | 50.50 kg | 1 de cada 10 sacos |
| **Saco 25 kg** | 25.00 kg | ± 1.5% (± 375 g) | 24.625 kg | 25.375 kg | 1 de cada 10 sacos |
| **Saco 10 kg** | 10.00 kg | ± 2.0% (± 200 g) | 9.80 kg | 10.20 kg | 1 de cada 15 sacos |
| **Bolsa 5 kg** | 5.00 kg | ± 2.0% (± 100 g) | 4.90 kg | 5.10 kg | 1 de cada 20 bolsas |
| **Bolsa 1 kg** | 1.00 kg | ± 3.0% (± 30 g) | 0.970 kg | 1.030 kg | 1 de cada 25 bolsas |
| **Frasco 500 g** | 0.50 kg | ± 3.0% (± 15 g) | 0.485 kg | 0.515 kg | 1 de cada 25 frascos |
| **Big Bag 1,000 kg** | 1,000.0 kg | ± 0.5% (± 5 kg) | 995.0 kg | 1,005.0 kg | Cada unidad |

## Requisito de Báscula

| PARÁMETRO | REQUISITO |
|:---|:---|
| **Calibración** | Vigente (certificado anual por laboratorio acreditado) |
| **Verificación interna** | Diaria con pesa patrón antes de iniciar turno |
| **Resolución mínima** | ≤ 10 g para presentaciones ≤ 5 kg; ≤ 50 g para > 5 kg |

## Acción ante Desviación

| SITUACIÓN | ACCIÓN |
|:---|:---|
| 1 unidad fuera de tolerancia | Ajustar dosificador. Re-pesar las 5 anteriores. |
| 3 unidades consecutivas fuera | **Detener** línea. Recalibrar dosificador. Registrar desviación. |
| Tendencia sostenida (+/-) | Mantenimiento preventivo del dosificador. Escalar a Supervisor. |

> **Nota legal:** El contenido neto declarado en la etiqueta aprobada ICA es vinculante. La tolerancia aplica al proceso interno, pero el promedio del lote **debe** ser ≥ al peso declarado.

### Catálogo de Defectos Críticos del Envase

## Instrucciones

Este catálogo clasifica los defectos de envase por severidad. **Debe** consultarse durante la inspección visual de cada lote. Cualquier defecto Crítico **obliga** a detener la línea y segregar el producto.

## Clasificación de Defectos

### DEFECTOS CRÍTICOS (Rechazo inmediato)

| # | DEFECTO | DESCRIPCIÓN | ACCIÓN |
|:---:|:---|:---|:---|
| C1 | **Saco perforado o roto** | Orificio visible que permite fuga de producto | Segregar. No despachar. Re-envasar. |
| C2 | **Costura/sellado deficiente** | Costura abierta, hilo suelto, sello térmico incompleto | Segregar. Re-sellar o re-envasar. |
| C3 | **Etiqueta ausente** | Producto sin etiqueta o rótulo visible | Segregar. Etiquetar antes de liberar. |
| C4 | **Etiqueta incorrecta** | Etiqueta de otro producto, lote erróneo, o no coincide con registro ICA | **BLOQUEO TOTAL**. No Conformidad Mayor. |
| C5 | **Contaminación visible** | Material extraño visible dentro del envase | Segregar. Investigar origen. |
| C6 | **Peso fuera de tolerancia** | Peso neto fuera de los límites del Anexo 1 | Ajustar peso. Re-pesar. |

### DEFECTOS MAYORES (Requieren corrección)

| # | DEFECTO | DESCRIPCIÓN | ACCIÓN |
|:---:|:---|:---|:---|
| M1 | **Etiqueta mal adherida** | Despegada parcialmente, arrugada o torcida | Re-etiquetar antes de despacho. |
| M2 | **Impresión de lote ilegible** | Fecha, lote o registro ICA borroso | Re-imprimir. Verificar inyector de tinta. |
| M3 | **Saco manchado** | Manchas de producto, grasa o suciedad externa | Limpiar si es posible. Si no, re-envasar. |
| M4 | **Palletizado inestable** | Sacos mal apilados, riesgo de caída | Re-paletizar. Verificar esquema de apilado. |

### DEFECTOS MENORES (Registro y monitoreo)

| # | DEFECTO | DESCRIPCIÓN | ACCIÓN |
|:---:|:---|:---|:---|
| m1 | **Arrugas en saco** | Pliegues cosméticos sin afectar integridad | Registrar. Monitorear frecuencia. |
| m2 | **Variación de color del envase** | Diferencia tonal entre lotes de empaques | Notificar a proveedor de empaques. |

## Campos Obligatorios en Etiqueta (Verificación ICA)

| CAMPO | REQUISITO |
|:---|:---|
| **Nombre comercial del producto** | Legible, coincide con registro ICA |
| **Número de Registro ICA** | En **negrilla**, visible a simple vista |
| **Composición garantizada** | % nutrientes según registro |
| **Contenido neto** | En kg o g, coincide con peso real |
| **Número de lote** | Trazable, legible, indeleble |
| **Fecha de fabricación** | Formato AAAA-MM-DD |
| **Nombre y dirección del fabricante** | CALFERQUIM S.A.S. completo |
| **Advertencias y precauciones** | Según Anexo II-F de pv0 |

> **Regla:** Los defectos C4 (etiqueta incorrecta) y C5 (contaminación) generan **No Conformidad Mayor** con investigación obligatoria y reporte a Dirección Técnica en un plazo máximo de 24 horas.

## 10. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION DEL CAMBIO |
|---|---|---|
