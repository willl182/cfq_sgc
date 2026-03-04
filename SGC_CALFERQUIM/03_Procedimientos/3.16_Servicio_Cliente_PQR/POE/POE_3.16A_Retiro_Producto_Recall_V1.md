# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: RETIRO DE PRODUCTO (RECALL)

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| POE-3.16A | 01 | 2026-03-04 | 12 meses o ante cambio regulatorio |

## 1. OBJETIVO

Definir el protocolo para activar, ejecutar y cerrar el retiro de producto del mercado cuando exista riesgo para el cliente, incumplimiento de especificacion o no conformidad critica.

## 2. ALCANCE

Aplica a todo producto fabricado, distribuido o comercializado por CALFERQUIM S.A.S., incluyendo lotes en bodega, en ruta y en clientes.

## 3. DEFINICIONES

- Recall: retiro controlado de producto distribuido.
- Contencion: inmovilizacion inmediata de inventario interno relacionado.
- Trazabilidad de lote: capacidad de identificar origen, destinos y cantidades por lote.
- Comité de retiro: Direccion Tecnica, Calidad, Servicio al Cliente, Comercial y Logistica.

## 4. DOCUMENTOS DE REFERENCIA

- POE-3.16 Servicio al Cliente y PQR.
- POE-3.12 Liberacion de lotes.
- POE-3.13 Muestreo y control de calidad.
- Registros de trazabilidad de despachos y ventas.

## 5. CRITERIOS DE ACTIVACION

Se activa de inmediato cuando ocurra al menos uno de los siguientes eventos:

1. Resultado analitico fuera de especificacion con impacto en seguridad o eficacia.
2. Error de etiquetado que induzca uso incorrecto del producto.
3. Contaminacion fisica/quimica/microbiologica confirmada o probable.
4. Requerimiento de autoridad competente.
5. Tendencia de PQR criticas sobre un mismo lote o familia de lotes.

## 6. RESPONSABILIDADES

- Direccion Tecnica: lidera el comite, define alcance y aprueba cierre.
- Calidad: confirma evidencia tecnica, define lotes afectados y verifica efectividad.
- Servicio al Cliente: ejecuta comunicacion a clientes y consolida respuestas.
- Logistica: bloquea inventario y coordina retorno fisico.
- Comercial: asegura contacto con distribuidores y recuperacion de producto.

## 7. PROCEDIMIENTO

### 7.1 Deteccion y decision inicial (0 a 4 horas)

1. Area detecta evento y notifica a Calidad y Direccion Tecnica.
2. Calidad diligencia `Formato_Activacion_Recall_3.16A_V1.csv`.
3. Direccion Tecnica convoca Comite de Retiro y clasifica nivel:
   - Nivel 1: critico (riesgo alto, accion inmediata).
   - Nivel 2: mayor (incumplimiento relevante sin riesgo alto inmediato).
   - Nivel 3: preventivo (retiro voluntario por control preventivo).

### 7.2 Contencion interna (0 a 8 horas)

4. Logistica inmoviliza inventario interno de lotes afectados.
5. Calidad bloquea liberaciones relacionadas en sistema y registros manuales.
6. Se identifica universo de trazabilidad: producido, despachado, en clientes y recuperable.

### 7.3 Comunicacion externa (maximo 24 horas)

7. Servicio al Cliente emite notificacion formal a cada cliente/distribuidor afectado.
8. La notificacion incluye: lote, cantidad, riesgo, instrucciones de aislamiento y canal de devolucion.
9. Si aplica, Direccion Tecnica notifica autoridad competente con soporte tecnico.

### 7.4 Recuperacion y conciliacion

10. Logistica coordina retorno y segregacion fisica del producto retirado.
11. Cada movimiento se registra en `Registro_Trazabilidad_Recall_3.16A_V1.csv`.
12. Calidad verifica cantidades recuperadas vs. despachadas.

### 7.5 Cierre del recall

13. Comite evalua efectividad del retiro y define disposicion final del material recuperado.
14. Direccion Tecnica aprueba acta de cierre con causa raiz, CAPA y lecciones aprendidas.

## 8. INDICADORES MINIMOS

| INDICADOR | META |
|---|---|
| Tiempo activacion comite | <= 4 horas |
| Tiempo primera notificacion clientes | <= 24 horas |
| Cobertura de contacto clientes afectados | 100% |
| Trazabilidad documental por lote | 100% |

## 9. REGISTROS ASOCIADOS

- `Formato_Activacion_Recall_3.16A_V1.csv`
- `Registro_Trazabilidad_Recall_3.16A_V1.csv`

## 10. ANEXOS

- `ANX_3.16A_01_Niveles_Recall.md`
- `ANX_3.16A_02_Guion_Comunicacion_Recall.md`

## 11. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION |
|---|---|---|
| 01 | 2026-03-04 | Emision inicial para cierre de brecha de retiro de producto. |
