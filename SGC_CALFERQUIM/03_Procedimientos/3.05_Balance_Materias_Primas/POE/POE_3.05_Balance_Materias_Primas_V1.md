# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: BALANCE DE MATERIAS PRIMAS

| CÓDIGO | VERSIÓN | VIGENCIA | PRÓXIMA REVISIÓN |
|
|
|
|
|
| **CGC-POE-3.05** | **01** | **2026-02-17** | **12 meses o ante cambio regulatorio** |

---

## 1. OBJETIVO

Establecer la metodología estandarizada para verificar el balance de masas por lote, asegurando la conciliación cuantitativa entre las materias primas dispensadas y el producto obtenido (incluyendo mermas y residuos), garantizando así la detección de pérdidas, desviaciones de proceso o posibles desvíos de material.

## 2. ALCANCE

Este procedimiento es de aplicación **obligatoria** para el 100% de los lotes de fertilizantes y acondicionadores de suelo fabricados en **CALFERQUIM S.A.S.**, y es requisito indispensable para la liberación del lote.

## 3. DEFINICIONES

*   **Entrada Total (kg):** Sumatoria de todas las materias primas cargadas a la orden de producción.
*   **Salida Total (kg):** Sumatoria de Producto Terminado Conforme + Producto No Conforme + Mermas de Proceso + Residuos (Barreduras) + Muestras de Retención/Calidad.
*   **Diferencia de Masa (kg):** Entrada Total - Salida Total.
*   **Rendimiento (%):** (Salida Total / Entrada Total) x 100.
*   **Desviación (%):** ((Salida Total - Entrada Total) / Entrada Total) x 100.

## 4. DOCUMENTOS DE REFERENCIA

*   **Resolución ICA pv0 (Propuesta):** Anexo I-B, Pilar 2 "Balance de Materias Primas".
*   **Manual de Buenas Prácticas de Manufactura (BPM):** Control de Producción.

## 4.1. CONSIDERACIONES GMP (BUENAS PRÁCTICAS DE MANUFACTURA)

Para que el balance sea válido, todas las básculas utilizadas **deben** estar verificadas con pesas patrón antes de iniciar el lote. **Se prohíbe** el "ajuste cosmético" de cifras para forzar el cierre del balance. Cualquier discrepancia real debe ser investigada, ya que puede indicar problemas de formulación, fugas en equipos o errores de dosificación críticos para la calidad del producto.

## 5. RESPONSABILIDADES Y POLÍTICAS (Estilo Opus)

### 5.1. Jefe de Producción
*   **Debe** garantizar que todo material que entre o salga del proceso sea pesado y registrado en tiempo real.
*   **Es responsable** de justificar técnicamente cualquier pérdida de proceso (merma) que supere los estándares históricos.
*   **Debe** asegurar la recolección y pesaje de barreduras y residuos para su inclusión en el balance.

### 5.2. Supervisor de Producción
*   **Debe** consolidar los registros de pesaje de materias primas y producto terminado al cierre del lote.
*   **Debe** firmar el cierre de balance antes de entregarlo a Calidad.

### 5.3. Control de Calidad
*   **Debe** verificar aritméticamente el cálculo del balance.
*   **Tiene la autoridad** para rechazar un lote si el balance de materias primas no cierra dentro de las tolerancias establecidas, impidiendo su liberación hasta que se esclarezca la causa.

## 6. PROCEDIMIENTO (Estilo GLM-4.7)

### 6.1. Recopilación de Datos de Entrada

1.  **PRODUCCIÓN:** **Sumar** los pesos netos de todas las materias primas dispensadas para el lote (según Orden de Producción y vales de almacén).
    *   *Registro:* `Entrada Total` en `Formato_Balance_Materias_Primas_V1.csv`.
2.  **PRODUCCIÓN:** **Verificar** que no existan devoluciones de materia prima al almacén pendientes por descontar.

### 6.2. Recopilación de Datos de Salida

3.  **PRODUCCIÓN:** Al finalizar el envase, **sumar** el peso neto de todo el Producto Terminado (Conforme + No Conforme).
4.  **PRODUCCIÓN:** **Pesar** y registrar las Mermas y Barreduras generadas (POE 3.18).
5.  **CALIDAD:** **Reportar** el peso de las muestras tomadas para análisis y contramuestra (POE 3.14).
6.  **PRODUCCIÓN:** **Calcular** la `Salida Total` sumando todos los componentes anteriores.

### 6.3. Cálculo y Verificación

7.  **CALIDAD:** **Aplicar** la fórmula de balance:
    *   `Diferencia = Entrada Total - Salida Total`
    *   `% Desviación = (Diferencia / Entrada Total) * 100`
8.  **CALIDAD:** **Comparar** el resultado contra la Tabla de Tolerancias (Sección 7).

### 6.4. Dictamen del Balance

9.  **SI CUMPLE (Zona Verde):** **Aprobar** el balance firmando el registro y autorizar el paso a Liberación de Lote.
10. **SI ESTÁ EN ALERTA (Zona Amarilla):** **Solicitar** al Jefe de Producción una justificación técnica escrita en el campo "Observaciones". **Aprobar** solo si la causa es identificada y no afecta la calidad (ej: derrame accidental registrado).
11. **SI NO CUMPLE (Zona Roja):** **Abrir** inmediatamente un Reporte de No Conformidad (NC).
    *   **Bloquear** el lote.
    *   **Investigar** posibles causas: error de báscula, error de formulación, fuga masiva, robo.
    *   **Escalar** a Dirección Técnica para decisión final.

## 7. CRITERIOS DE CONTROL Y ACEPTACIÓN

| ZONA | RANGO DE DESVIACIÓN | ACCIÓN REQUERIDA | RESPONSABLE APROBACIÓN |
|
|
|:---|:---|
| **CONFORME** | **0.0% a ±2.0%** | Archivar y continuar proceso. | Analista de Calidad |
| **ALERTA** | **> ±2.0% a ±3.0%** | Justificación técnica obligatoria. | Jefe de Calidad |
| **NO CONFORME** | **> ±3.0%** | Investigación de NC y Bloqueo. | Dirección Técnica |

## 8. REGISTROS ASOCIADOS

*   `Formato_Balance_Materias_Primas_V1.csv`: Hoja de cálculo del balance por lote.
*   `Registro_Balance_Materias_Primas_V1.csv`: Log histórico de desviaciones.

## 9. ANEXOS

*   **Anexo 1:** Ejemplo de Cálculo de Balance.

## 10. CONTROL DE CAMBIOS

| VERSIÓN | FECHA | DESCRIPCIÓN DEL CAMBIO |
|

