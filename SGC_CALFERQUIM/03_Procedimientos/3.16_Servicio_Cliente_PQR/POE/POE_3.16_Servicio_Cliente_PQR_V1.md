# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: SERVICIO AL CLIENTE Y PQR

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| POE-3.16 | 02 | 2026-03-17 | 12 meses o ante cambio regulatorio |

## 1. OBJETIVO

Definir el flujo para recepcion, registro, analisis, respuesta y cierre de peticiones, quejas y reclamos (PQR), garantizando oportunidad de respuesta, analisis tecnico suficiente, trazabilidad de decisiones y mejora continua.

## 2. ALCANCE

Aplica a PQR de clientes, distribuidores y terceros relacionadas con producto, despacho, servicio, entregas, documentacion comercial y soporte asociado, desde la captacion por cualquier canal hasta la respuesta final y cierre documentado del caso.

## 3. DEFINICIONES

- PQR: Peticion, queja o reclamo.
- RPC: Reporte de problema de calidad asociado a una PQR tecnica.
- Cierre: Estado final con respuesta formal emitida y evidencia archivada.
- Caso no procedente: PQR verificada como no atribuible a Calferquim, pero igualmente respondida y cerrada con justificacion.

## 4. DOCUMENTOS DE REFERENCIA

- DC-SI07 Quejas y Reclamos.
- DC-SI11 Servicio al Cliente.
- DC-SI13 Politica Servicio al Cliente.
- DC-SI15 Politica de Quejas y Reclamos.
- POE-3.16A Retiro de Producto (Recall).

## 5. RESPONSABILIDADES Y POLITICAS

- Servicio al Cliente debe registrar toda PQR recibida por cualquier canal.
- Calidad debe investigar causas cuando exista impacto de calidad.
- Comercial, Logistica, Produccion o Facturacion deben suministrar informacion cuando la PQR involucre su proceso.
- Direccion Tecnica debe aprobar respuestas tecnicas criticas.
- La evaluacion del caso debe involucrar las areas necesarias segun la naturaleza del hecho.
- Se prohibe cerrar PQR sin evidencia de analisis y respuesta emitida.
- Toda PQR debe recibir respuesta formal, incluso cuando se determine que no procede.

## 6. PROCEDIMIENTO

1. Servicio al Cliente, asesor comercial, Gerencia o area administrativa recibe la PQR y remite el caso para su registro inmediato.
2. Servicio al Cliente asigna consecutivo en `Formato_Registro_PQR_V1.csv` y registra como minimo: fecha, cliente, contacto, producto, lote cuando aplique, descripcion, cantidad afectada y soportes.
3. Servicio al Cliente clasifica tipo (peticion, queja, reclamo), origen del caso y criticidad.
4. Calidad coordina el analisis del caso con las areas involucradas. Si la situacion corresponde a calidad del producto, se revisan lote, antecedentes, condiciones de almacenamiento, despacho y soportes tecnicos.
5. Cuando la informacion disponible no sea suficiente, se puede realizar visita tecnica al cliente o toma de muestra en sitio para ampliar el analisis.
6. Si requiere investigacion tecnica, se abre RPC y se integra resultado; si aplica, se gestionan acciones correctivas/preventivas conforme al sistema de mejora.
7. Si la PQR implica riesgo sanitario, incumplimiento de especificacion o posible afectacion de multiples lotes, se activa de inmediato `POE_3.16A_Retiro_Producto_Recall_V1.md`.
8. Responsable del caso redacta la respuesta formal indicando hallazgos, causa, decision, acciones y, cuando aplique, justificacion de no procedencia.
9. Direccion Tecnica aprueba la respuesta para casos tecnicos criticos o de alto impacto.
10. Servicio al Cliente comunica la respuesta al cliente y registra fecha, canal y evidencia.
11. Calidad cierra seguimiento en `Registro_Seguimiento_PQR_V1.csv`, verificando que toda accion comprometida quede trazable.

## 7. CRITERIOS DE CONTROL Y ACEPTACION

| PARAMETRO | CRITERIO |
|---|---|
| Registro inicial | PQR con consecutivo, cliente, lote y descripcion |
| Tiempo de acuse | Maximo 2 dias habiles |
| Tiempo de respuesta | Maximo 10 dias habiles |
| Gatillo de retiro/contencion | Activacion inmediata ante riesgo critico documentado |
| Cierre | Con decision definida, evidencia de comunicacion y trazabilidad del analisis |

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
| 02 | 2026-03-17 | Se ajusta a legacy: plazo maximo 10 dias habiles, analisis multidisciplinario, visita tecnica y respuesta obligatoria a casos no procedentes. |
