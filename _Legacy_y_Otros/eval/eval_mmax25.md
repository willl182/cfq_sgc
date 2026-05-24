# Evaluación Integral de POE - CALFERQUIM S.A.S

## Resumen Ejecutivo

Se evaluaron 10 POE y 2 Actas N/A correspondientes al módulo 3 (Producción y Manufactura) del Sistema de Gestión de Calidad, junto con 43 archivos de formatos y registros asociados. El conjunto documental presenta una estructura sólida y alineada a los requisitos del Anexo I-B de la propuesta de resolución pv0, aunque se identificaron áreas de mejora en cuanto a completitud y precisión técnica.

---

## 1. Evaluación de Estructura Formal

### 1.1 Conformidad Estructural

Todos los POE siguen una estructura normalizada de 9 secciones que facilita la consulta y el entrenamiento del personal. Esta uniformidad es particularmente valiosa en un contexto donde la empresa opera con personal de diferentes niveles de formación técnica. La existencia de un formato estándar permite que cualquier operario o supervisor pueda localizar rápidamente la información que necesita, reduciendo el riesgo de errores por desconocimiento procedural.

| Sección | Presencia |
|---------|-----------|
| Código y Versión | 100% |
| Objetivo | 100% |
| Alcance | 100% |
| Definiciones | 100% |
| Responsabilidades | 100% |
| Procedimiento | 100% |
| Criterios de Control | 100% |
| Registros Asociados | 100% |
| Control de Cambios | 100% |

### 1.2 Elementos de Identificación

Todos los documentos incluyen los metadatos requeridos: código, versión, fecha de vigencia y responsable. Sin embargo, se observa que la fecha de vigencia aparece como "2026-02-17" en todos los POE, lo cual sugiere que fueron generados simultáneamente, posiblemente como parte de un ejercicio de creación documental masiva. Este dato no representa un problema en sí, pero debe tenerse en cuenta para futuras actualizaciones, ya que el control de cambios indica únicamente "V1: Creación inicial" sin especificar fechas de elaboración, revisión o aprobación. Sería conveniente adicionar un campo de firma electrónica o approval block que refleje quién elaboró, revisó y aprobó cada procedimiento, requisito habitual en auditorías ICA.

---

## 2. Análisis de Contenido Técnico por POE

### 2.1 POE 3.03 - Molienda Primaria

Este procedimiento establece las bases para la operación de reducción de tamaño de partículas, cubriendo aspectos críticos como la verificación preoperacional, el control de variables operativas y la toma de muestras para granulometría. El contenido técnico es apropiado para el alcance propuesto, aunque presenta algunas oportunidades de mejora.

En cuanto a fortalezas, el procedimiento incluye una lista de chequeo preoperacional como anexo y define parámetros de referencia por familia de producto, lo cual permite adaptar el proceso a las características específicas de cada material. La definición de responsabilidades tripartitas (operario, supervisor, calidad) garantiza la separación de funciones requerida por las BPM. Los criterios de aceptación se refieren al rango de granulometría definido por producto, lo cual es correcto desde el punto de vista técnico.

Como áreas de mejora, el procedimiento no especifica la frecuencia exacta de muestreo durante la molienda, limitándose a indicar "mínimo una verificación por lote". En operaciones de molienda, la frecuencia de muestreo puede ser crítica para detectar desviaciones a tiempo, especialmente cuando se procesan materiales con alta variabilidad. Sería recomendable definir una frecuencia mínima basada en el tiempo de procesamiento o la cantidad producida. Adicionalmente, no se incluyen criterios para determinar cuándo un lote debe ser rechazado versus reprocesado, lo cual genera ambigüedad operativa.

### 2.2 POE 3.05 - Balance de Materias Primas

Este es uno de los procedimientos más robustos del conjunto evaluado. El POE 3.05 establece un método claro y cuantificable para verificar el balance de masas por lote, con fórmulas explícitas, tolerancias definidas y escalamiento por desviación. Este nivel de especificidad es exactamente lo que requiere un sistema de gestión de calidad basado en riesgos.

Las fortalezas principales incluyen la fórmula oficial claramente enunciada en el numeral 6, la tolerancia inicial de +/- 2.0% con escalamiento hasta +/- 3.0% para observaciones y rechazo por encima de 3%, y los criterios de escalamiento que involucran a diferentes niveles de autoridad (Calidad para observaciones, Dirección Técnica para no conformidades). El procedimiento además define claramente las responsabilidades de cada área involucrada.

Las áreas de mejora son menores. El procedimiento se refiere a un "formato oficial" pero no incluye una plantilla real en los anexos. Si bien existe un archivo CSV (Formato_Balance_Materias_Primas_V1.csv), sería conveniente incluir una muestra del formato dentro del documento markdown para facilitar la comprensión visual durante el entrenamiento. También sería útil adicionar un ejemplo numérico concreto que ilustré el cálculo con valores reales, más allá de la referencia genérica del Anexo 1.

### 2.3 POE 3.06 - Mezcla y Homogenización

El procedimiento de mezcla presenta una estructura clara y secuencia lógica de operaciones. Define los conceptos de homogenización, tiempo de mezcla y uniformidad de manera apropiada, estableciendo los controles necesarios para asegurar la distribución homogénea de componentes.

Las fortalezas incluyen la definición de secuencia de carga por familia de producto (Anexo 1) y criterios de uniformidad por producto (Anexo 2), reconociendo que diferentes formulaciones pueden tener requisitos distintos. El procedimiento también establece controles en tres momentos: al inicio, durante el proceso y al cierre del lote para el caso de envase.

Como oportunidad de mejora, el procedimiento no especifica el método para verificar la uniformidad (por ejemplo, si se utiliza análisis de nutrientes por submuestras, coeficiente de variación máximo permitido, etc.). Esta información debería estar más explícita o referenciada claramente en los anexos. Adicionalmente, no se define un tiempo máximo de mezcla adicional permitido antes de escalar a Dirección Técnica, lo cual podría resultar en reprocesos excesivos sin control.

### 2.4 POE 3.08 - Presentación Física (Granulación)

Este procedimiento aborda adecuadamente la etapa de presentación física del producto, incluyendo granulación, tamizado y ajuste de tamaño. El alcance cubre productos que requieren presentación física controlada, reconociendo que no todos los fertilizantes pasan por esta etapa.

Las fortalezas incluyen la segregación explícita del material fuera de especificación como reproceso controlado o no conforme, y los anexos con rangos de tamaño por producto y parámetros de operación por equipo.

Como área de mejora, es necesario definir con mayor precisión los criterios de aceptación para la distribución de tamaño (por ejemplo, porcentaje máximo permitido en cada fracción: retenido, pasante, finos, etc.). El procedimiento actual se limita a indicar "dentro del rango definido para el producto" sin especificar umbrales.

### 2.5 POE 3.09 - Molienda Secundaria

Este procedimiento complementa el POE 3.03 al abordar la etapa de ajuste fino posterior a la molienda primaria. Su estructura es similar y ambos procedimientos podrían beneficiarse de una integración más explícita para evitar redundancias o contradicciones.

La principal fortaleza es el criterio claro de escalamiento: "reproceso recurrente en el mismo lote: escalar a Dirección Técnica", lo cual evita ciclos infinitos de reproceso sin supervisión.

Como área de mejora, sería conveniente definir qué constituye un "reproceso recurrente" (¿2 intentos? ¿3?), para evitar interpretaciones subjetivas.

### 2.6 POE 3.10 - Envase

El procedimiento de envase es completo y aborda todos los aspectos críticos: llenado, sellado, etiquetado y control de peso/volumen. La inclusión de controles en tres momentos (inicio, durante, cierre) es una buena práctica de control de calidad.

Las fortalezas incluyen los criterios de rechazo de empaque y sellado (Anexo 2), la segregación de unidades no conformes, y la identificación de lote en cada unidad o empaque.

Como oportunidad de mejora, el procedimiento no aborda explícitamente la verificación de la etiqueta en cuanto a cumplimiento regulatorio (contenido de nutrientes según registro ICA, marca, precauciones, información del fabricante). Este es un aspecto crítico para la conformidad con la normatividad ICA y debería ser más explícito o referenciado a otro procedimiento específico de etiquetado.

### 2.7 POE 3.14 - Gestión de Contramuestras

Este procedimiento es crítico para la trazabilidad y el cumplimiento del pilar #6 de pv0 (Almacenamiento de Contramuestras). El documento es completo y bien estructurado, definiendo cantidad mínima (500g), tiempo de retención (12 meses), condiciones de almacenamiento y criterios de disposición.

Las fortalezas incluyen la definición de los elementos del rótulo obligatorio, el control de acceso al área de contramuestras, y la matriz de ubicación física por producto y lote (Anexo 2).

Las áreas de mejora incluyen la necesidad de especificar las condiciones exactas de almacenamiento (temperatura, humedad relativa si aplica) dependiendo del tipo de producto. Algunos fertilizantes pueden ser sensibles a condiciones ambientales que podrían afectar la representatividad de la contramuestra con el tiempo. También sería conveniente definir el tamaño mínimo de muestra por tipo de análisis (química, física, microbiológica si aplica), ya que 500g podrían no ser suficientes para todos los ensayos.

### 2.8 POE 3.18 - Disposición de Barreduras

Este procedimiento aborda directamente el pilar #10 de pv0 (Manejo de Residuos/Barreduras) y es fundamental para evitar la contaminación cruzada y la reutilización indebida de residuos en productos comerciales. La "Regla crítica de cumplimiento" al inicio del documento es muy apropiada para crear conciencia sobre la prohibición de reincorporación.

Las fortalezas incluyen la segregación por tipo de residuo, la evidencia mínima de disposición (acta, remisión, factura, certificado), y la clasificación de hallazgos críticos.

Como oportunidad de mejora, es necesario definir con mayor precisión los criterios para determinar cuándo una barredura puede ser reaprovechada (por ejemplo, en qué casos específicos, si los hay) versus cuándo debe disponerse como residuo. El procedimiento actual da a entender que toda barredura es residuo, pero en la práctica pueden existir casos donde el material recolectado tenga un destino diferente (por ejemplo, uso en área no crítica).

### 2.9 POE 3.19 - Formulaciones para Terceros

Este procedimiento aborda un proceso comercial y técnico específico: la fabricación de productos bajo especificaciones de terceros. Es relevante para empresas que ofrecen servicios de toll manufacturing o private label.

Las fortalezas incluyen el flujo de aprobación de formulaciones, el control de cambios por cliente, y la trazabilidad de cada lote al cliente y versión de formulación.

Como oportunidad de mejora, el procedimiento no especifica los criterios técnicos para evaluar "viabilidad regulatoria" (numeral 5.2). En el contexto de CALFERQUIM, donde los productos están sujetos a registro ICA, este aspecto es crítico y debería detallar qué verificaciones deben realizarse (por ejemplo, si el producto requiere registro, si el cliente tiene las autorizaciones necesarias, si la formulación viola restricciones de contenido de metales pesados, etc.).

### 2.10 POE 3.20 - Entrega de MP Importación para Terceros

Este procedimiento es específico para un proceso logístico que puede no ser central en la operación actual de CALFERQUIM, pero que documenta una actividad real. Abarca desde la recepción hasta la evidencia de recibido por el tercero.

Las fortalezas incluyen la conciliación de saldos (mínimo semanal y al cierre mensual) y la trazabilidad documental completa.

Las áreas de mejora incluyen la necesidad de clarificar el contexto operativo: ¿estas materias primas importadas son de CALFERQUIM o son de terceros que se almacenan en instalaciones de CALFERQUIM? El alcance debería ser más preciso para evitar confusiones. También sería conveniente incluir los requisitos documentales específicos (factura de importación, documento de transporte, declaración aduanera, etc.) que deben verificarse en el ingreso.

---

## 3. Evaluación de Actas N/A

### 3.1 ACTA NA 3.04 - Tratamiento Térmico (Pirolisis)

Este documento formaliza la no aplicabilidad del requisito 3.4 para el proceso actual. La justificación técnica es clara y las evidencias de soporte están bien identificadas. El criterio de reactivación es apropiado: si se incorpora pirolisis, debe crearse el POE correspondiente antes de operar.

### 3.2 ACTA NA 3.07 - Reacciones Químicas o Bioquímicas

Similar al anterior, este documento formaliza la no aplicabilidad del requisito 3.7. Ambos actos N/A son necesarios y apropiados para documentar las exclusiones del alcance del SGC.

**Observación:** Solo existen dos actos N/A para los numerales que no aplican. Según el Anexo I-B de pv0, hay varios numerales (3.01, 3.02, 3.04, 3.07, 3.11, 3.13, 3.15, 3.16, 3.17) que podrían requerir actos N/A o POE específicos. Se recomienda revisar la totalidad de numerales del 3.01 al 3.20 para determinar si hacen falta actos N/A adicionales.

---

## 4. Evaluación de Formatos y Registros

Se evaluaron 43 archivos CSV distribuidos en dos niveles: formatos de control (Formato_*) y registros de operación (Registro_*). La estructura general de los formatos es apropiada, con campos que corresponden a los requisitos de cada procedimiento.

### 4.1 Fortalezas

La duplicación de archivos tanto en la raíz de formatos_registros/ como en subcarpetas por numeral (3.03_Molienda_Primaria/, 3.05_Balance_Materias_Primas/, etc.) garantiza que los registros estén asociados al procedimiento correspondiente, facilitando la organización documental. Los campos incluidos en los CSV corresponden a los parámetros definidos en los procedimientos, lo cual asegura la trazabilidad.

### 4.2 Áreas de Mejora

No se realizó una auditoría detallada de cada campo CSV, pero se identificaron algunos aspectos generales a considerar. Primero, varios campos tienen nombres en español que incluyen espacios (por ejemplo, "Fecha de ", "Hora de "), lo cual puede causar problemas en algunas aplicaciones de hojas de cálculo o sistemas de importación. Segundo, los formatos no incluyen campos de firma o validación electrónica (aprobado por, fecha de aprobación), lo cual es importante para la conformidad regulatoria. Tercero, algunos formatos carecen de campos de observación o备注 que permitan registrar situaciones especiales o deviate de procedimiento.

---

## 5. Alineación con los 18 Pilares de pv0

Los POE evaluados cubren directamente varios de los 18 pilares procedimentales del Anexo I-B de pv0. A continuación se presenta la matriz de cobertura:

| Pilar | POE Asociado | Estado |
|-------|-------------|--------|
| 1. Control de Proveedores | Parcial (no hay POE específico) | Pendiente |
| 2. Balance de Materias Primas | POE 3.05 | Completo |
| 3. Codificación de Lotes | Mención en varios POE | Parcial |
| 4. Procedimientos de Muestreo | Varios POE | Parcial |
| 5. Liberación de Lotes | Formato_Liberacion_Lotes.csv | Parcial |
| 6. Almacenamiento de Contramuestras | POE 3.14 | Completo |
| 7. Mantenimiento de Equipos | No hay POE específico | Pendiente |
| 8. Calibración | No hay POE específico | Pendiente |
| 9. Limpieza y Desinfección | No hay POE específico | Pendiente |
| 10. Manejo de Residuos/Barreduras | POE 3.18 | Completo |
| 11. Capacitación del Personal | No hay POE específico | Pendiente |
| 12. Control Documental | No hay POE específico | Pendiente |
| 13. Retiro de Producto/Trazabilidad | Parcial (trazabilidad en varios POE) | Parcial |
| 14. Servicio al Cliente (PQR) | No hay POE específico | Pendiente |
| 15. Auditorías Internas | No hay POE específico | Pendiente |
| 16. Gestión del Laboratorio | No hay POE específico | Pendiente |
| 17. Controles del Proceso de Producción | POE 3.03, 3.06, 3.08, 3.09, 3.10 | Completo |
| 18. Mantenimiento de Instalaciones e Higiene | No hay POE específico | Pendiente |

**Hallazgo significativo:** Los POE del módulo 3 cubren adecuadamente los pilares relacionados con producción (2, 6, 10, 17), pero existen brechas en pilares de soporte como mantenimiento, calibración, control documental, capacitación y gestión de laboratorio. Estos gaps deberán abordarse en fases posteriores de la implementación del SGC.

---

## 6. Hallazgos y Recomendaciones

### 6.1 Hallazgos Positivos

La estructura estandarizada de los POE facilita la comprensión y el entrenamiento. El nivel de detalle técnico es apropiado para procedimientos operativos, con un buen equilibrio entre prescriptividad y flexibilidad. Los criterios de aceptación están bien definidos en la mayoría de los procedimientos, especialmente en POE 3.05 (Balance de Materias Primas). Los actos N/A documentan adecuadamente las exclusiones del alcance. Los formatos y registros están bien organizados y vinculados a los procedimientos correspondientes. La fecha de vigencia unificada (2026-02-17) sugiere una creación reciente y controlada del set documental.

### 6.2 Hallazgos que Requieren Atención

Varios procedimientos se refieren a anexos que deberían contener información crítica (listas de chequeo, parámetros por producto, rangos, criterios) pero estos anexos no están incluidos como documentos separados ni forman parte del archivo markdown. Por ejemplo, el Anexo 1 del POE 3.03 menciona una "Lista de chequeo preoperacional de molino" que debería existir como documento independiente o como sección expandida dentro del mismo archivo.

Los campos de firma (elaboró, revisó, aprobó) no están incluidos en los documentos markdown, lo cual es habitual en auditorías de sistemas de gestión. El control de cambios se limita a "V1: Creación inicial" sin información de fecha de elaboración, revisión o aprobación. Los criterios de escalamiento en algunos procedimientos (por ejemplo, POE 3.09 "reproceso recurrente") son subjetivos y podrían interpretarse de manera diferente según el operario o supervisor. No se encontró un procedimiento específico para la Codificación de Lotes (pilar #3), aunque se menciona en varios POE.

### 6.3 Recomendaciones Prioritarias

En relación con la documentación, se recomienda crear los anexos mencionados en cada POE como documentos separados o como secciones expandidas dentro del mismo archivo markdown, asegurando que la información crítica esté disponible para los operarios. También sería conveniente adicionar un bloque de firmas al final de cada POE con campos para elaboración, revisión, aprobación, fechas y firmas (electrónicas o manuscritas). Adicionalmente, se sugiere revisar los nombres de campos en los CSV para eliminar espacios y caracteres especiales,换成 guiones bajos (_) o notación camelCase o snake_case.

En cuanto a la cobertura, es necesario crear los POE faltantes identificados en la matriz de pilares (mantenimiento, calibración, control documental, capacitación, laboratorio, etc.) o documentar su ubicación en otros módulos del SGC. También se debe verificar si faltan actos N/A para otros numerales del Anexo I-B que no aplican al alcance actual de CALFERQUIM.

Respecto a la precisión técnica, se recomienda definir con mayor especificidad los criterios numéricos en aquellos procedimientos que utilizan términos vagos ("mínimo", "recurrente", "adicional"). Adicionalmente, sería conveniente especificar las condiciones de almacenamiento para contramuestras según el tipo de producto, particularmente si existen productos sensibles a temperatura o humedad.

---

## 7. Conclusión

El conjunto de POE evaluados representa una base sólida para el módulo de Producción y Manufactura del Sistema de Gestión de Calidad de CALFERQUIM. La estructura documental es consistente, el contenido técnico es apropiado y los procedimientos están alineados con los requisitos del Anexo I-B de la propuesta de resolución pv0 en los aspectos relativos a producción.

Los principales logros incluyen la formalización del balance de materias primas con criterios cuantificables, la gestión de contramuestras con tiempos de retención definidos, y la disposición de barreduras con controles de no reincorporación. Estos tres elementos son críticos para el cumplimiento regulatorio y la trazabilidad.

Las áreas de mejora se concentran en tres frentes: la creación de anexos con información operativa específica, la definición de criterios más precisos para evitar subjetividad en la interpretación, y la expansión del alcance documental hacia los pilares de pv0 que aún no están cubiertos por procedimientos específicos.

Con las mejoras sugeridas, este conjunto documental estará en condiciones de soportar una auditoría de certificación y cumplir con los requisitos de la plataforma SimplifICA durante la transición regulatoria de R150 a pv0.

---

*Evaluación realizada el 17 de febrero de 2026*
*Archivos evaluados: 13 documentos POE/Acta N/A + 43 archivos de formatos y registros*
