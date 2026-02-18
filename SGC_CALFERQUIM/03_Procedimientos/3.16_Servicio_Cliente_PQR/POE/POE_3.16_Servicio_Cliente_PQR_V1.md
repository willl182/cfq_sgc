# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: SERVICIO AL CLIENTE Y PQR

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| POE-3.16 | 01 | 2026-02-18 | 12 meses o ante cambio regulatorio |

## 1. OBJETIVO

Definir el flujo para recepcion, analisis, respuesta y cierre de peticiones, quejas y reclamos (PQR), garantizando oportunidad de respuesta y trazabilidad de decisiones.

## 2. ALCANCE

Aplica a PQR de clientes, distribuidores y terceros relacionadas con producto, despacho y servicio.

## 3. DEFINICIONES

- PQR: Peticion, queja o reclamo.
- RPC: Reporte de problema de calidad asociado a una PQR tecnica.
- Cierre: Estado final con respuesta formal emitida y evidencia archivada.

## 4. DOCUMENTOS DE REFERENCIA

- DC-SI07 Quejas y Reclamos.
- DC-SI11 Servicio al Cliente.
- DC-SI13 Politica Servicio al Cliente.
- DC-SI15 Politica de Quejas y Reclamos.
- Procedimiento interno vigente de retiro/contencion de producto.

## 5. RESPONSABILIDADES Y POLITICAS

- Servicio al Cliente debe registrar toda PQR recibida por cualquier canal.
- Calidad debe investigar causas cuando exista impacto de calidad.
- Direccion Tecnica debe aprobar respuestas tecnicas criticas.
- Se prohibe cerrar PQR sin evidencia de analisis y respuesta emitida.

## 6. PROCEDIMIENTO

1. Servicio al Cliente recibe PQR y asigna consecutivo en `Formato_Registro_PQR_V1.csv`.
2. Servicio al Cliente clasifica tipo (peticion, queja, reclamo) y criticidad.
3. Calidad analiza soporte, lote y antecedentes cuando aplique.
4. Si requiere investigacion tecnica, se abre RPC y se integra resultado.
5. Si la PQR implica riesgo sanitario, incumplimiento de especificacion o posible afectacion de multiples lotes, se activa de inmediato el protocolo interno de retiro/contencion con Direccion Tecnica y Calidad.
6. Responsable redacta respuesta y define acciones correctivas/preventivas.
7. Direccion Tecnica aprueba respuesta para casos de alto impacto.
8. Servicio al Cliente comunica respuesta al cliente y registra fecha.
9. Calidad cierra seguimiento en `Registro_Seguimiento_PQR_V1.csv`.

## 7. CRITERIOS DE CONTROL Y ACEPTACION

| PARAMETRO | CRITERIO |
|---|---|
| Registro inicial | PQR con consecutivo, cliente, lote y descripcion |
| Tiempo de acuse | Maximo 2 dias habiles |
| Tiempo de respuesta | Maximo 15 dias habiles, salvo casos complejos justificados |
| Gatillo de retiro/contencion | Activacion inmediata ante riesgo critico documentado |
| Cierre | Con accion definida y evidencia de comunicacion |

## 8. REGISTROS ASOCIADOS

- `Formato_Registro_PQR_V1.csv`
- `Registro_Seguimiento_PQR_V1.csv`

## 9. ANEXOS

- Anexo 1: Flujo de atencion PQR.
- Anexo 2: Tiempos de respuesta por criticidad.

## 10. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION |
|---|---|---|
| 01 | 2026-02-18 | Emision inicial homologada unificando DC-SI07/DC-SI11. |
