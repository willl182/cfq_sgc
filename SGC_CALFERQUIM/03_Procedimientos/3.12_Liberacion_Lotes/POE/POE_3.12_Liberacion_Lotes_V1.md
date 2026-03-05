# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: LIBERACION DE LOTES DE PRODUCTO TERMINADO

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| CGC-POE-3.12 | 01 | 2026-02-18 | 12 meses o ante cambio regulatorio |

---

## 1. OBJETIVO

Establecer el proceso de verificacion y liberacion de cada lote de producto terminado antes de su despacho al mercado, asegurando que todos los controles del proceso hayan sido ejecutados y documentados.

## 2. ALCANCE

Aplica al 100% de los lotes de fertilizantes y acondicionadores fabricados en CALFERQUIM S.A.S. Inicia con el traslado del lote a bodega y finaliza con el dictamen de liberacion.

## 3. DEFINICIONES

- Liberacion: Dictamen formal que autoriza el despacho del lote al mercado.
- En Revision: Estado del lote mientras se verifica el cumplimiento de los requisitos de liberacion.
- Aprobado: Lote que cumple todos los requisitos y puede ser despachado.
- Rechazado: Lote que presenta incumplimiento critico y no puede ser despachado.

## 4. DOCUMENTOS DE REFERENCIA

- Resolucion ICA pv0 (Propuesta): Anexo I-B, Pilar 5 "Liberacion de Lotes".
- POE 3.11 Codificacion de Lotes.
- POE 3.10 Envase.

## 5. RESPONSABILIDADES Y POLITICAS

- Direccion Tecnica verifica la orden de produccion y las etiquetas de los bultos.
- Calidad emite el certificado de calidad interno del lote.
- Jefe de Produccion diligencia los datos del proceso en el formato correspondiente.
- Jefe de Bodega verifica el marcado de lote en los empaques.
- Se prohibe despachar producto sin dictamen de liberacion firmado.

## 6. PROCEDIMIENTO

### 6.1. Traslado a Bodega

1. PRODUCCION: Al finalizar el envase y marcado, trasladar el lote a la bodega asignada. El lote queda en estado EN REVISION hasta el dictamen.

### 6.2. Verificaciones Previas al Dictamen

Las siguientes verificaciones se realizan durante o inmediatamente despues de la produccion del lote:

2. DIRECCION TECNICA: Verificar la orden de produccion (formulacion, cantidades y datos del lote).
3. DIRECCION TECNICA: Verificar las etiquetas de los bultos (saco o bigbag) contra el arte aprobado por el ICA.
4. CALIDAD: Emitir el certificado de calidad interno con el resultado analitico del lote.
5. JEFE DE PRODUCCION: Diligenciar el formato de produccion con los datos y controles del proceso.
6. JEFE DE BODEGA: Verificar que el marcado de codigo de lote en los empaques sea legible, correcto y coincida con la orden de produccion.

### 6.3. Dictamen de Liberacion

7. DIRECCION TECNICA: Revisar que las seis verificaciones anteriores esten completas y conformes. Registrar el dictamen en `Formato_Liberacion_Lotes_V1.csv`:

   - **APROBADO:** Todas las verificaciones conformes. Se autoriza el despacho al mercado.

   - **RECHAZADO:** Incumplimiento critico en alguna verificacion. El lote no puede despacharse. Se abre reporte de no conformidad y se define disposicion final.

   - **EN REVISION:** Alguna verificacion pendiente o con duda tecnica. El lote permanece en bodega sin despachar hasta resolver.

### 6.4. Comunicacion

8. DIRECCION TECNICA / CALIDAD: Notificar el dictamen al Jefe de Produccion y al Jefe de Bodega.
9. BODEGA: Despachar el lote unicamente con dictamen APROBADO firmado.

## 7. CRITERIOS DE ACEPTACION

| VERIFICACION | RESPONSABLE | CRITERIO |
|:---|:---|:---|
| Orden de produccion | Direccion Tecnica | Formulacion y cantidades correctas, documento completo |
| Etiquetas de bultos | Direccion Tecnica | Coinciden con arte aprobado por ICA |
| Certificado de calidad interno | Calidad | Resultado analitico conforme con el Registro ICA |
| Datos del proceso | Jefe de Produccion | Formato diligenciado y sin desviaciones criticas abiertas |
| Marcado de lote | Jefe de Bodega | Codigo legible, correcto y coherente con la orden |

## 8. REGISTROS ASOCIADOS

- `Formato_Liberacion_Lotes_V1.csv`: Registro del dictamen de liberacion.
- `Registro_Liberacion_Lotes_V1.csv`: Historico de lotes con su estatus final.

## 9. ANEXOS

- Anexo 1: Flujo de Decision de Liberacion.

## 10. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION |
|---|---|---|
| 01 | 2026-02-18 | Emision inicial. |
| 01 | 2026-03-05 | Multiples ajustes operacionales: eliminacion de colores, simplificacion de expediente. |
| 01 | 2026-03-05 | Ajuste definitivo: flujo real de liberacion. Traslado a bodega asignada. Verificaciones por Direccion Tecnica (OP + etiquetas), Calidad (certificado), Jefe Produccion (datos proceso) y Jefe Bodega (marcado). Estados: Aprobado, Rechazado, En Revision. |
