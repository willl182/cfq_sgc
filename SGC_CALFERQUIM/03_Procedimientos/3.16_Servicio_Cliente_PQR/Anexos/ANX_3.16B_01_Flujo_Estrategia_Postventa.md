# ANX 3.16B-01 - FLUJO GENERAL DE LA ESTRATEGIA POSTVENTA

## Flujo principal

```
ENTREGA DEL PRODUCTO AL CLIENTE
         |
         v
+-----------------------------+
| SOPORTE TECNICO CONTINUO    |
| (almacenamiento, aplicacion,|
|  dosificacion, consultas)   |
+-----------------------------+
         |
         v
    ¿Incidencia reportada?
    /              \
  NO               SI
   |                |
   v                v
ENCUESTA       REGISTRO PQR
SATISFACCION   (POE-3.16)
(semestral)         |
   |                v
   |          CLASIFICACION
   |          (tipo + criticidad)
   |           /          \
   |      CRITICA      NORMAL
   |         |            |
   |         v            v
   |    ¿Riesgo S3?   INVESTIGACION
   |      /     \      (contramuestra,
   |    SI      NO      lab, campo)
   |     |       |         |
   |     v       |         v
   |  RECALL     |    DICTAMEN +
   |  POE-3.16A  |    RESPUESTA
   |     |       |         |
   |     v       v         v
   |    CAPA + VERIFICACION
   |         |
   v         v
CONSOLIDACION DE INDICADORES
         |
         v
REVISION POR LA DIRECCION
```

## Flujo de devoluciones

```
SOLICITUD DE DEVOLUCION
         |
         v
VERIFICACION DE ELEGIBILIDAD
(empaque, lote, evidencia compra)
     /          \
  ELEGIBLE    NO ELEGIBLE
     |             |
     v             v
  AUTORIZAR    COMUNICAR
  (RMA)        RECHAZO
     |
     v
RECOJO / RECEPCION EN PLANTA
     |
     v
INSPECCION + SEGREGACION
("HOLD - NO USAR")
     |
     v
DISPOSICION
  /    |     \
REINTEGRO  REPROCESO  DESTRUCCION
     |        |          |
     v        v          v
REGISTRO EN Registro_Devoluciones_V1.csv
```
