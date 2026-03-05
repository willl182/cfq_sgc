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

- Anexo 1: Tabla de Tolerancias de Peso por Presentacion (Sacos y Bigbag).

## 10. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION DEL CAMBIO |
|---|---|---|
| 01 | 2026-02-17 | Emision inicial. |
| 01 | 2026-03-05 | Ajuste operacional: doble pesaje (produccion + alistamiento); tolerancia ±1%. Alcance limitado a sacos y bigbag; se eliminan referencias a frascos, garrafas y productos liquidos. |
