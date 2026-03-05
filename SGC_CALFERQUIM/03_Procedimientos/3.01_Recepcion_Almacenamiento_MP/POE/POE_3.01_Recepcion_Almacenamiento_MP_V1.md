# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: RECEPCION Y ALMACENAMIENTO DE MATERIAS PRIMAS

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| POE-3.01 | 01 | 2026-02-18 | 12 meses o ante cambio regulatorio |

## 1. OBJETIVO

Establecer el metodo para recibir, inspeccionar, aceptar, rechazar y almacenar materias primas (MP), asegurando trazabilidad por lote y condiciones de conservacion aptas para fabricacion.

## 2. ALCANCE

Aplica a toda MP que ingresa a CALFERQUIM S.A.S. para produccion propia o formulaciones para terceros.

## 3. DEFINICIONES

- MP: Materia prima usada en formulacion o mezcla.
- Cuarentena: Estado temporal de la MP mientras permanece en el vehiculo de transporte, a la espera de verificacion documental y fisica por parte de Calidad.
- Lote MP: Identificador de trazabilidad del proveedor o codigo interno asignado.
- MP critica: Materia prima con impacto directo en seguridad/calidad del producto o con historial de desviaciones, definida por Direccion Tecnica y Calidad.

## 4. DOCUMENTOS DE REFERENCIA

- DC-SI26 Compras y Gestion de Proveedores.
- DC-SI37 Procedimiento para Almacenamiento Seguro y Conteo de Bultos.
- POE 3.13 Muestreo y Control de Calidad.

## 5. RESPONSABILIDADES Y POLITICAS

- Compras debe verificar proveedor aprobado antes de emitir orden.
- Calidad debe realizar la inspeccion, definir aceptacion o rechazo y emitir la autorizacion formal antes de que cualquier MP ingrese a bodega.
- El Jefe de Bodega da instrucciones de ubicacion una vez Calidad emite la autorizacion; solo MP aprobada puede ingresar a bodega.
- El vehiculo permanece en patio con la carga mientras la MP esta en cuarentena; no se descarga antes de la autorizacion de Calidad.
- Se prohibe usar MP sin registro completo en formato y registro oficial.
- En caso de rechazo, la coordinacion de la devolucion es responsabilidad del equipo comercial y la Gerencia, con apoyo de Compras.
- Se exige certificado de analisis (COA) para MP criticas o cuando aplique por especificacion.

## 6. PROCEDIMIENTO

1. El vehiculo llega a planta. Bodega verifica integridad de empaque y cantidad sin descargar.
2. Bodega revisa documentos: remision, ficha tecnica, hoja de seguridad vigente y COA cuando aplique.
3. Bodega diligencia `Formato_Inspeccion_Recepcion_MP_V1.csv` con los datos del vehiculo y la carga.
4. Calidad realiza inspeccion visual del material en el vehiculo y define si requiere muestreo segun riesgo, proveedor o historial de desviaciones.
5. Calidad define estado (Aprobado o Rechazado) y emite autorizacion formal.
6. Si Aprobado: el Jefe de Bodega indica la ubicacion de almacenamiento y se descarga el vehiculo directamente al lugar asignado.
7. Bodega registra ubicacion final en `Registro_Recepcion_Almacenamiento_MP_V1.csv`.
8. Si Rechazado: el vehiculo no se descarga. El equipo comercial y la Gerencia coordinan la devolucion. Bodega registra la no conformidad.

## 7. CRITERIOS DE CONTROL Y ACEPTACION

| PARAMETRO | CRITERIO |
|---|---|
| Documentos | Remision + FT + HS vigentes |
| COA (cuando aplique) | Debe coincidir con especificacion tecnica de compra |
| Estado empaque | Sin rotura, humedad ni contaminacion visible |
| Rotulado | Lote y producto legibles |
| Autorizacion de ingreso | Solo MP con autorizacion formal de Calidad ingresa a bodega |
| Ubicacion | Separada por compatibilidad y estatus |

## 8. REGISTROS ASOCIADOS

- `Formato_Inspeccion_Recepcion_MP_V1.csv`
- `Registro_Recepcion_Almacenamiento_MP_V1.csv`

## 9. ANEXOS

- Anexo 1: Lista de chequeo de inspeccion visual.
- Anexo 2: Condiciones de almacenamiento de MP.

## 10. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION |
|---|---|---|
