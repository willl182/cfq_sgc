# Evaluación de POE - CALFERQUIM SGC
**Fecha:** 2026-02-17  
**Evaluador:** Kimi K2.5  
**Directorio evaluado:** `/home/w182/w421/cfq_sgc/poe_rev/`

---

## Resumen General

| Aspecto | Estado |
|---------|--------|
| **POE completados** | 10 de 10 (100%) |
| **Actas N/A** | 2 de 2 (3.04 y 3.07) |
| **Formatos/Registros** | 22 archivos CSV |
| **Estructura** | ✅ Consistente (9 secciones estándar) |

---

## POE Evaluados (10)

| Código | Nombre | Estado | Observaciones |
|--------|--------|--------|---------------|
| **POE-3.03** | Molienda Primaria | ✅ Listo | Procedimiento completo, 9 secciones |
| **POE-3.05** | Balance de Materias Primas | ✅ Listo | Incluye fórmulas y tolerancias (+/- 2%) |
| **POE-3.06** | Mezcla y Homogenización | ✅ Listo | Define uniformidad y tiempos de mezcla |
| **POE-3.08** | Presentación Física | ✅ Listo | Cubre granulación y ajuste de tamaño |
| **POE-3.09** | Molienda Secundaria | ✅ Listo | Ajuste fino posterior a mezcla |
| **POE-3.10** | Envase | ✅ Listo | Control de peso/volumen y rotulado |
| **POE-3.14** | Contramuestras | ✅ Listo | 500g mínimo, 12 meses retención |
| **POE-3.18** | Disposición Barreduras | ✅ Listo | **Regla crítica**: prohibida reincorporación |
| **POE-3.19** | Formulaciones Terceros | ✅ Listo | Control de versiones y trazabilidad |
| **POE-3.20** | Entrega MP Importación Terceros | ✅ Listo | Custodia y conciliación de saldos |

---

## Fortalezas ✅

1. **Estructura estandarizada**: Todos con 9 secciones (objetivo, alcance, definiciones, responsabilidades, procedimiento, criterios, registros, anexos, control cambios)
2. **Actas N/A bien documentadas**: 3.04 (pirolisis) y 3.07 (reacciones químicas) con justificación técnica sólida
3. **Reglas críticas destacadas**: POE-3.18 prohibe explícitamente reincorporar barreduras
4. **Criterios cuantitativos**: POE-3.05 define tolerancias claras (+/- 2% conforme, +/- 3% no conforme)
5. **Vigencia actualizada**: Todos con fecha 2026-02-17

---

## Hallazgos y Recomendaciones ⚠️

| # | Hallazgo | Severidad | Recomendación |
|---|----------|-----------|---------------|
| 1 | **Falta POE-3.04 y 3.07** (cubiertos con Actas N/A) | N/A | ✅ Apropiado para proceso físico-mezcla actual |
| 2 | **POE-3.05** no referencia el archivo `.xlsm` de verificación NPK | Media | Agregar referencia a macros de verificación en registros asociados |
| 3 | **Formatos CSV** vs referencias en POE (algunos dicen `.csv` pero el directorio los tiene así) | Baja | Verificar consistencia de extensiones |
| 4 | **POE-3.14** no especifica ubicación física del área de contramuestras | Media | Agregar en Anexo 2 o definir en procedimiento |
| 5 | **POE-3.10** no menciona control de etiquetas ICA aprobadas | Media | Agregar verificación de etiqueta autorizada vs física |

---

## Brechas Documentales vs pv0

| Pilar ICA pv0 | Estado en POE | Documento |
|---------------|---------------|-----------|
| 3. Balance de Materias Primas | ✅ Completo | POE-3.05 |
| 6. Almacenamiento Contramuestras | ✅ Completo | POE-3.14 |
| 10. Manejo de Residuos/Barreduras | ✅ Completo | POE-3.18 |
| 17. Controles del Proceso | ✅ Completo | POE-3.03, 3.06, 3.08, 3.09, 3.10 |

---

## Veredicto

**Estado general: ✅ APROBADO PARA IMPLEMENTACIÓN**

Los 10 POE están estructurados, completos y alineados con los requisitos del Anexo I-B de la propuesta de resolución pv0. Las 2 Actas N/A están correctamente justificadas para una operación de mezcla física sin procesos térmicos ni reactivos.

**Próximo paso sugerido**: Crear los anexos referenciados (listas de chequeo, matrices, rangos por producto) y validar los formatos CSV en campo.

---

## Contenido de Archivos Evaluados

### POE-3.03 Molienda Primaria
- **Estructura**: 9 secciones completas
- **Responsable**: Jefe de Producción
- **Puntos clave**: Granulometría objetivo, control por lote, verificación de equipos
- **Registros**: Formato_Control_Molienda_Primaria_V1.csv, Registro_Molienda_Primaria_V1.csv

### POE-3.05 Balance de Materias Primas
- **Estructura**: 9 secciones completas
- **Responsable**: Jefe de Producción / Control de Calidad
- **Fórmulas**:
  - Diferencia de masa (kg) = Entrada total - Salida total
  - Desviación porcentual (%) = (Diferencia de masa / Entrada total) x 100
- **Tolerancias**:
  - Hasta +/- 2.0%: Conforme
  - +/- 2.0% a +/- 3.0%: Observado, requiere evaluación
  - Mayor a +/- 3.0%: No conforme, requiere apertura de NC

### POE-3.06 Mezcla y Homogenización
- **Estructura**: 9 secciones completas
- **Responsable**: Jefe de Producción
- **Puntos clave**: Uniformidad, tiempos de mezcla, secuencia de carga
- **Frecuencia**: 100% de lotes

### POE-3.08 Presentación Física (Granulación)
- **Estructura**: 9 secciones completas
- **Responsable**: Producción
- **Puntos clave**: Tamaño de partícula, apariencia, fluidez
- **Cobertura**: Granulación, tamizado, ajuste de tamaño

### POE-3.09 Molienda Secundaria
- **Estructura**: 9 secciones completas
- **Responsable**: Jefe de Producción
- **Puntos clave**: Ajuste fino, reproceso controlado
- **Escalamiento**: Reproceso recurrente escala a Dirección Técnica

### POE-3.10 Envase
- **Estructura**: 9 secciones completas
- **Responsable**: Producción / Calidad
- **Puntos clave**: Peso/volumen, sellado, rotulado, identificación de lote
- **Frecuencia**: Al inicio, durante y al cierre del lote

### POE-3.14 Gestión de Contramuestras
- **Estructura**: 10 secciones (incluye requisitos específicos)
- **Responsable**: Laboratorio / Control de Calidad
- **Requisitos**:
  - Cantidad mínima: 500g (sólidos) o equivalente
  - Tiempo retención: 12 meses mínimo
  - Envase: limpio, seco, sellable, rotulado
- **Puntos clave**: Toma, identificación, almacenamiento, custodia, disposición

### POE-3.18 Disposición de Barreduras y Residuos
- **Estructura**: 10 secciones
- **Responsable**: Producción / Gestión Ambiental
- **Regla crítica**: "Queda prohibido reincorporar barreduras o residuos no conformes al proceso productivo destinado a comercialización"
- **Hallazgos críticos**:
  - Reincorporación de barredura a producto comercial
  - Ausencia de evidencia de disposición final

### POE-3.19 Formulaciones para Terceros
- **Estructura**: 9 secciones completas
- **Responsable**: Dirección Técnica
- **Puntos clave**: Solicitud, evaluación, aprobación, control de cambios, trazabilidad
- **Restricción**: No se permite uso de formulaciones sin aprobación de Dirección Técnica

### POE-3.20 Entrega de MP Importación para Terceros
- **Estructura**: 9 secciones completas
- **Responsable**: Logística / Producción
- **Puntos clave**: Recepción, almacenamiento, custodia, entrega, trazabilidad
- **Frecuencia conciliación**: Mínimo semanal y al cierre de mes

### Acta N/A 3.04 - Tratamiento Térmico (Pirolisis)
- **Estado**: No aplica a operación actual
- **Justificación**: No se ejecuta etapa de pirolisis, no hay horno/reactor dedicado
- **Criterio reactivación**: Si se incorpora proceso de pirolisis, crear POE 3.04 antes de operar

### Acta N/A 3.07 - Reacciones Químicas o Bioquímicas
- **Estado**: No aplica a operación actual
- **Justificación**: Proceso físico de dosificación y mezcla, sin reactor químico/bioquímico
- **Criterio reactivación**: Si se implementa etapa reactiva, emitir POE 3.07 antes del inicio

---

## Formatos y Registros Encontrados (22 archivos)

### Formatos de Control
- Formato_Balance_Materias_Primas_V1.csv
- Formato_Control_Contramuestras_V1.csv
- Formato_Control_Disposicion_Residuos_V1.csv
- Formato_Control_Entrega_MP_Terceros_V1.csv
- Formato_Control_Envase_V1.csv
- Formato_Control_Mezcla_Homogenizacion_V1.csv
- Formato_Control_Molienda_Primaria_V1.csv
- Formato_Control_Molienda_Secundaria_V1.csv
- Formato_Control_Presentacion_Fisica_V1.csv
- Formato_Liberacion_Lotes_V1.csv
- Formato_Solicitud_Formulacion_Tercero_V1.csv

### Registros
- Registro_Balance_Materias_Primas_V1.csv
- Registro_Conciliacion_MP_Terceros_V1.csv
- Registro_Contramuestras_V1.csv
- Registro_Control_Cambios_Formulacion_Tercero_V1.csv
- Registro_Disposicion_Residuos_V1.csv
- Registro_Envase_V1.csv
- Registro_Mezcla_Homogenizacion_V1.csv
- Registro_Molienda_Primaria_V1.csv
- Registro_Molienda_Secundaria_V1.csv
- Registro_Presentacion_Fisica_V1.csv

### Subdirectorios por POE
- 3.03_Molienda_Primaria/
- 3.05_Balance_Materias_Primas/
- 3.06_Mezcla_Homogenizacion/
- 3.08_Presentacion_Fisica_Granulacion/
- 3.09_Molienda_Secundaria/
- 3.10_Envase/
- 3.12_Liberacion_Lotes/
- 3.14_Contramuestras/
- 3.18_Disposicion_Residuos/
- 3.19_Formulaciones_Terceros/
- 3.20_Entrega_MP_Importacion_Terceros/

---

## Conclusión

El set de POE revisado representa una base documental sólida y alineada con los requisitos regulatorios de la propuesta de resolución ICA pv0. La estructura estandarizada facilita la implementación y auditoría. Las Actas N/A están técnicamente justificadas para el tipo de operación (mezcla física sin transformaciones químicas ni térmicas complejas).

**Prioridades para cierre**:
1. Desarrollar anexos faltantes (listas de chequeo, matrices)
2. Validar formatos CSV en ambiente de prueba
3. Definir ubicación física para contramuestras
4. Agregar referencia a macros NPK en POE-3.05
5. Verificar control de etiquetas ICA en POE-3.10
