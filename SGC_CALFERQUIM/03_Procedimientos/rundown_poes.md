# BALANCE GENERAL Y AUDITORÍA DEL MÓDULO DE PROCEDIMIENTOS (03_Procedimientos)
## SISTEMA DE GESTIÓN DE CALIDAD (SGC) - CALFERQUIM S.A.S.

**Fecha del balance:** 2026-05-26 (actualizado)
**Normativa de referencia:** Propuesta de Resolución ICA No. pv0 (Buenas Prácticas de Manufactura - BPM)
**Alcance de auditoría:** Módulo `SGC_CALFERQUIM/03_Procedimientos/` (Subcarpetas oficiales 3.01 a 3.20)

---

## 1. RESUMEN EJECUTIVO

CALFERQUIM S.A.S. se encuentra en un proceso estratégico de transición regulatoria desde la **Resolución ICA 150 de 2003 (R150)** hacia la nueva propuesta de resolución. Este cambio exige que el SGC no sea solo un archivo documental pasivo, sino un sistema operacional activo con procedimientos estructurados y registros reales y auditables.

El foco de este balance es la consistencia documental, la trazabilidad interna y la evidencia real de aplicación de los procedimientos.

Este balance documental consolida el estado actual de las **20 carpetas oficiales de procedimientos (numeradas del 3.01 al 3.20)** del SGC digital, reflejando la arquitectura simplificada vigente.

### Indicadores Clave de Cumplimiento (KPI)

| Métrica | Valor | Observación |
| :--- | :---: | :--- |
| **Total Carpetas de Procedimiento** | **20** | Del 3.01 al 3.20 de acuerdo al Acta de Visita del ICA (Anexo I-B). |
| **Procedimientos Aplicables Activos** | **16** | Con estructura documental completa de soporte operacional. |
| **Procedimientos No Aplicables (NA)** | **4** | Molienda Primaria (3.03), Pirólisis (3.04), Reacciones Químicas (3.07) y Molienda Secundaria (3.09). |
| **Actas de No Aplicabilidad Oficiales** | **4 / 4** | Creadas y aprobadas en formato formal para evitar vacíos regulatorios ante el auditor del ICA. |
| **Cobertura de Pilotos / Evidencias ICA** | **7 / 16** | Pilotos implementados y documentados físicamente para los procesos críticos. |
| **Estructura Interna Homologada** | **100%** | Todos los procedimientos aplicables tienen la triada estándar: `POE/`, `Formatos/`, `Registros/`. |
| **GAPs Documentales Pendientes** | **0** | El único GAP conocido (3.06 Mezcla — referencias técnicas) fue subsanado el 2026-05-26. |

---

## 2. ARQUITECTURA DOCUMENTAL VIGENTE

### Triada Estándar (estructura de cada procedimiento)

```
3.XX_NombreProcedimiento/
├── POE/          ← Procedimiento Operativo Estándar (.md + .docx) + referencias técnicas
│                    integradas + archivos Legacy históricos
├── Formatos/     ← Plantillas de recolección de datos en planta (.csv, .docx)
└── Registros/    ← Archivos de ejecución histórica real (.csv)
```

> **Nota de arquitectura:** La subcarpeta `Anexos/` fue eliminada el 2026-05-26 de todos los procedimientos. Su contenido fue integrado directamente en el cuerpo de cada `POE/*.md` bajo la sección `## 9. ANEXOS`, o promovido a `Formatos/` cuando se trataba de plantillas operativas de uso directo en planta. Ver `relevancia_anexos.md` para el análisis detallado y justificación de cada decisión.

### Tipos de Documento por Carpeta

| Carpeta | Tipo | Formato | Propósito |
| :--- | :--- | :--- | :--- |
| `POE/` | Procedimiento maestro | `.md` + `.docx` | Paso a paso operacional + tablas técnicas de referencia |
| `POE/Legacy/` | Documentos históricos | `.pdf` | SGC anterior (R150), conservados para trazabilidad |
| `Formatos/` | Plantillas vacías | `.csv` / `.docx` | Captura de datos en tiempo real en planta |
| `Registros/` | Historial diligenciado | `.csv` | Evidencia de cumplimiento operacional |

---

## 3. TABLA DE ESTADO DOCUMENTAL (ESTRUCTURA VIGENTE)

| Código | Procedimiento | Estado | POE | Formato | Registro | Piloto ICA |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **3.01** | Recepción y Almacenamiento MP | **Conforme** | ✅ V1 | ✅ V1 | ✅ V1 | ✅ PILOTO |
| **3.02** | Limpieza y Desinfección | **Conforme** | ✅ V1 | ✅ V1 | ✅ V1 | ✅ PILOTO |
| **3.03** | Molienda Primaria | **NA (Acta)** | ✅ Acta + POE respaldo | ✅ Plantilla | ✅ Plantilla | — |
| **3.04** | Tratamiento Térmico (Pirólisis) | **NA (Acta)** | ✅ Acta NA | — | — | — |
| **3.05** | Balance de Materias Primas | **Conforme** | ✅ V1 | ✅ V1 | ✅ V1 | — |
| **3.06** | Mezcla y Homogenización | **Conforme** | ✅ V1 | ✅ V1 | ✅ V1 | — |
| **3.07** | Reacciones Químicas / Bioquímicas | **NA (Acta)** | ✅ Acta NA | — | — | — |
| **3.08** | Presentación Física (Granulación) | **Conforme** | ✅ V1 | ✅ V1 | ✅ V1 | — |
| **3.09** | Molienda Secundaria | **NA (Acta)** | ✅ Acta + POE respaldo | ✅ Plantilla | ✅ Plantilla | — |
| **3.10** | Envase | **Conforme** | ✅ V1 | ✅ V1 | ✅ V1 | — |
| **3.11** | Codificación de Lotes | **Conforme** | ✅ V1 | ✅ V1 | ✅ V1 | ✅ PILOTO |
| **3.12** | Liberación de Lotes | **Conforme** | ✅ V1 | ✅ 3 archivos | ✅ V1 | — |
| **3.13** | Toma de Muestras (Lab / Calidad) | **Conforme** | ✅ 2 POEs | ✅ V1 | ✅ V1 | ✅ PILOTO |
| **3.14** | Almacenamiento de Contramuestras | **Conforme** | ✅ V1 | ✅ 2 archivos | ✅ V1 | — |
| **3.15** | Higiene y Seguridad Industrial | **Conforme** | ✅ V1 | ✅ V1 | ✅ V1 | ✅ PILOTO |
| **3.16** | Servicio al Cliente y PQRS / Recall | **Conforme** | ✅ 3 POEs | ✅ 5 archivos | ✅ 4 archivos | ✅ PILOTO |
| **3.17** | Almacenamiento de Producto Terminado | **Conforme** | ✅ V1 | ✅ V1 | ✅ 2 archivos | ✅ PILOTO |
| **3.18** | Disposición de Residuos (Barreduras) | **Conforme** | ✅ V1 | ✅ V1 | ✅ V1 | — |
| **3.19** | Formulaciones a Terceros | **Conforme** | ✅ V1 | ✅ 2 archivos | ✅ V1 | — |
| **3.20** | Entrega MP (Importación a Terceros) | **Conforme** | ✅ V1 | ✅ 2 archivos | ✅ V1 | — |

**Nota (3.03 y 3.09):** Los formatos y registros en las carpetas de Molienda se mantienen como plantillas digitales inactivas como previsión tecnológica. Operan bajo Acta de No Aplicabilidad.

---

## 4. DETALLE POR PROCEDIMIENTO

### 3.01 Recepción y Almacenamiento de MP
- **Ubicación:** `3.01_Recepcion_Almacenamiento_MP/`
- **POE:** `POE_3.01_Recepcion_Almacenamiento_MP_V1.md/.docx`. Sección `## 9. ANEXOS` integra: lista de verificación visual de recepción y estándares de almacenamiento (estibas, segregación, FEFO).
- **Formato:** `Formato_Inspeccion_Recepcion_MP_V1.csv`
- **Registro:** `Registro_Recepcion_Almacenamiento_MP_V1.csv`
- **Piloto ICA:** ✅ Implementado. Acta de simulación y checklist de recepción firmado.
- **Evaluación:** **Conforme.**

### 3.02 Limpieza y Desinfección
- **Ubicación:** `3.02_Limpieza_Desinfeccion/`
- **POE:** `POE_3.02_Limpieza_Desinfeccion_V1.md/.docx`. Sección `## 9. ANEXOS` integra: tabla de agentes de limpieza autorizados con dosis y tabla de frecuencias de higienización por área.
- **Formato:** `Formato_Control_Limpieza_Desinfeccion_V1.csv`
- **Registro:** `Registro_Limpieza_Desinfeccion_V1.csv`
- **Piloto ICA:** ✅ Implementado. Actas de validación piloto firmadas.
- **Evaluación:** **Conforme.**

### 3.03 Molienda Primaria (No Aplica)
- **Ubicación:** `3.03_NA_Molienda_Primaria/`
- **POE:** `ACTA_NA_3.03_Molienda_Primaria_V1.md/.docx` (justifica que las MP se adquieren pre-molidas) + `POE_3.03_Molienda_Primaria_V1.md` de respaldo tecnológico. Sección `## 9. ANEXOS` integra: checklist preoperacional del molino y parámetros de referencia de mallas.
- **Formato/Registro:** Plantillas inactivas.
- **Evaluación:** **Conforme** (Acta NA formal vigente).

### 3.04 Tratamiento Térmico / Pirólisis (No Aplica)
- **Ubicación:** `3.04_NA_Pirolisis/`
- **POE:** `ACTA_NA_3.04_Tratamiento_Termico_Pirolisis_V1.md/.docx`. Justifica formulación en frío sin tratamientos térmicos.
- **Evaluación:** **Conforme** (Acta NA formal vigente).

### 3.05 Balance de Materias Primas
- **Ubicación:** `3.05_Balance_Materias_Primas/`
- **POE:** `POE_3.05_Balance_Materias_Primas_V1.md/.docx`. Sección `## 9. ANEXOS` integra: ejemplo completo de cálculo de balance de lote SULFAK50 con cálculo de merma, evaluación de conformidad (≤ 2%) y protocolo de escalada ante mermas > 2%.
- **Formato:** `Formato_Balance_Materias_Primas_V1.csv`
- **Registro:** `Registro_Balance_Materias_Primas_V1.csv`
- **Evaluación:** **Conforme.**

### 3.06 Mezcla y Homogenización
- **Ubicación:** `3.06_Mezcla_Homogenizacion/`
- **POE:** `POE_3.06_Mezcla_Homogenizacion_V1.md/.docx`. Sección `## 9. ANEXOS` integra: flujograma de ruta del material (Tipo A y Tipo B), tabla de parámetros operativos y tiempos de mezcla, tabla de límites de tolerancia de homogeneidad (criterios de aceptación y rechazo visual).
- **Formato:** `Formato_Control_Mezcla_Homogenizacion_V1.csv`
- **Registro:** `Registro_Mezcla_Homogenizacion_V1.csv`
- **Evaluación:** **Conforme.** *(GAP anterior subsanado el 2026-05-26.)*

### 3.07 Reacciones Químicas o Bioquímicas (No Aplica)
- **Ubicación:** `3.07_NA_Reacciones_Quimicas/`
- **POE:** `ACTA_NA_3.07_Reacciones_Quimicas_Bioquimicas_V1.md/.docx`. Justifica producción física estable sin síntesis química ni fermentación.
- **Evaluación:** **Conforme** (Acta NA formal vigente).

### 3.08 Presentación Física / Granulación
- **Ubicación:** `3.08_Presentacion_Fisica_Granulacion/`
- **POE:** `POE_3.08_Presentacion_Fisica_Granulacion_V1.md/.docx`. Sección `## 9. ANEXOS` integra: especificaciones técnicas de mallas y rangos granulométricos por familia de producto.
- **Formato:** `Formato_Control_Presentacion_Fisica_V1.csv`
- **Registro:** `Registro_Presentacion_Fisica_V1.csv`
- **Evaluación:** **Conforme.**

### 3.09 Molienda Secundaria (No Aplica)
- **Ubicación:** `3.09_NA_Molienda_Secundaria/`
- **POE:** `POE_3.09_Molienda_Secundaria_V1.md` (estado inactivo documentado) + Acta de NA. Sección `## 9. ANEXOS` integra: especificaciones de molienda fina y finos admisibles.
- **Formato/Registro:** Plantillas inactivas.
- **Evaluación:** **Conforme** (Acta NA formal vigente).

### 3.10 Envase
- **Ubicación:** `3.10_Envase/`
- **POE:** `POE_3.10_Envase_V1.md/.docx`. Sección `## 9. ANEXOS` integra: tabla de tolerancias de peso por presentación (20 kg, 40 kg, 50 kg) y catálogo de defectos críticos del envase.
- **Formato:** `Formato_Control_Envase_V1.csv`
- **Registro:** `Registro_Envase_V1.csv`
- **Evaluación:** **Conforme.**

### 3.11 Codificación de Lotes
- **Ubicación:** `3.11_Codificacion_Lotes/`
- **POE:** `POE_3.11_Codificacion_Lotes_V1.md/.docx`. Sección `## 9. ANEXOS` integra: estructura y reglas del código alfanumérico (`AAAAMMDD-PROD-SERIE`) y lista maestra de abreviaturas de producto. *Nota: la lista maestra también se copió a `10_Base_Datos_Tecnica/` para gestión centralizada.*
- **Formato:** `Formato_Asignacion_Lotes_V1.csv`
- **Registro:** `Registro_Codificacion_Lotes_V1.csv`
- **Piloto ICA:** ✅ Implementado. Valida aplicación del código físico en saco.
- **Evaluación:** **Conforme.**

### 3.12 Liberación de Lotes
- **Ubicación:** `3.12_Liberacion_Lotes/`
- **POE:** `POE_3.12_Liberacion_Lotes_V1.md/.docx`. Sección `## 9. ANEXOS` integra: flujograma de decisión de liberación de calidad (Aprobado / Rechazado / Cuarentena).
- **Formatos:** `Formato_Liberacion_Lotes_V1.csv`, `ACTA_Liberacion_Lote_Mercado_V1.md/.docx`, `Formato_Etiquetas_Estatus_Lote_V1.docx` (plantilla visual de etiquetas de estatus).
- **Registro:** `Registro_Liberacion_Lotes_V1.csv`
- **Evaluación:** **Conforme.**

### 3.13 Toma de Muestras y Control de Calidad
- **Ubicación:** `3.13_Muestreo_Control_Calidad/`
- **POEs:** `POE_3.13_Muestreo_Control_Calidad_V1.md/.docx` (general) y `POE_3.13A_Toma_Muestra_Mezclas_Fisicas_V1.md/.docx` (especializado en blending). Sección `## 9. ANEXOS` integra: plan de muestreo sistemático por tipo de producto y tabla de criterios de aceptación y rechazo analítico.
- *Archivo adicional en raíz del módulo:* `POE_3.13_Trazabilidad_V1.md/.docx` — permanece en `03_Procedimientos/` como documento de referencia de apoyo.
- **Formato:** `Formato_Control_Muestreo_V1.csv`
- **Registro:** `Registro_Muestreo_V1.csv`
- **Piloto ICA:** ✅ Implementado. Soportes de toma de muestras y remisión a laboratorio externo.
- **Evaluación:** **Conforme.**

### 3.14 Almacenamiento de Contramuestras
- **Ubicación:** `3.14_Contramuestras/`
- **POE:** `POE_3.14_Contramuestras_V1.md/.docx`. Sección `## 9. ANEXOS` integra: distribución física y zonificación de la Muestroteca (4 estantes A-D, condiciones ambientales T < 30°C / HR < 70%) y reglas de control de inventario.
- **Formatos:** `Formato_Control_Contramuestras_V1.csv`, `Formato_Rotulo_Contramuestra_V1.md/.docx` (plantilla de etiqueta inviolable para rotular cada contramuestra).
- **Registro:** `Registro_Contramuestras_V1.csv`
- **Evaluación:** **Conforme.**

### 3.15 Higiene y Seguridad Industrial
- **Ubicación:** `3.15_Higiene_Seguridad_Industrial/`
- **POE:** `POE_3.15_Higiene_Seguridad_Industrial_V1.md/.docx`. Sección `## 9. ANEXOS` integra: lista de verificación preoperacional de higiene y orden en áreas de producción.
- **Formato:** `Formato_Verificacion_Higiene_V1.csv`
- **Registro:** `Registro_Inspecciones_Higiene_V1.csv`
- **Piloto ICA:** ✅ Implementado. Rondas de seguridad y verificación de EPP documentadas.
- **Evaluación:** **Conforme.**

### 3.16 Servicio al Cliente / PQRS / Retiro de Producto (Recall)
- **Ubicación:** `3.16_Servicio_Cliente_PQR/`
- **POEs:**
  1. `POE_3.16_Servicio_Cliente_PQR_V1.md/.docx` — integra: flujograma de atención y plazos regulatorios de respuesta.
  2. `POE_3.16A_Retiro_Producto_Recall_V1.md/.docx` — integra: clasificación de niveles de retiro (Nivel 1 Crítico / Nivel 2 Mayor / Nivel 3 Preventivo).
  3. `POE_3.16B_Estrategia_Postventa_V1.md/.docx` — integra: flujograma de estrategia de postventa.
- **Formatos:** `Formato_Registro_PQR_V1.csv`, `Formato_Activacion_Recall_3.16A_V1.csv`, `Formato_Plantilla_Comunicado_Recall_V1.md/.docx` (comunicado de crisis), `Formato_Encuesta_Satisfaccion_Cliente_V1.md/.docx`, `RC-SI08 Formulario Control de Quejas (Respuestas).xlsx`.
- **Registros:** `Registro_Seguimiento_PQR_V1.csv`, `Registro_Trazabilidad_Recall_3.16A_V1.csv`, `Registro_Consultas_Tecnicas_V1.csv`, `Registro_Devoluciones_V1.csv`.
- **Piloto ICA:** ✅ Implementado. Simula atención a reclamo + activación de Recall + recuperación de saco defectuoso.
- **Evaluación:** **Conforme** (módulo más robusto del SGC).

### 3.17 Almacenamiento de Producto Terminado
- **Ubicación:** `3.17_Almacenamiento_PT/`
- **POE:** `POE_3.17_Almacenamiento_Producto_Terminado_V1.md/.docx`. Sección `## 9. ANEXOS` integra: estándares de almacenamiento de PT (estibas, temperatura, humedad) y matriz de segregación y compatibilidad química para bodega.
- **Formato:** `Formato_Control_Almacenamiento_PT_V1.csv`
- **Registros:** `Registro_Almacenamiento_PT_V1.csv`, `RC-SI53 Traslado Producto Terminado.xlsx` (legacy conservado).
- **Piloto ICA:** ✅ Implementado. Control de estibas, rotulación de estatus y arqueo físico.
- **Evaluación:** **Conforme.**

### 3.18 Disposición de Residuos (Barreduras)
- **Ubicación:** `3.18_Disposicion_Residuos/`
- **POE:** `POE_3.18_Disposicion_Barreduras_V1.md/.docx`. Sección `## 9. ANEXOS` integra: clasificación técnica de residuos y barreduras (aptos para enmiendas, peligrosos u ordinarios).
- **Formato:** `Formato_Control_Disposicion_Residuos_V1.csv`
- **Registro:** `Registro_Disposicion_Residuos_V1.csv`
- **Evaluación:** **Conforme.**

### 3.19 Formulaciones a Terceros
- **Ubicación:** `3.19_Formulaciones_Terceros/`
- **POE:** `POE_3.19_Formulaciones_Terceros_V1.md/.docx`. Sección `## 9. ANEXOS` integra: flujograma de aprobación técnica de formulaciones de maquila.
- **Formatos:** `Formato_Solicitud_Formulacion_Tercero_V1.csv`, `Formato_Plantilla_NDA_Maquila_V1.md/.docx` (modelo de contrato de confidencialidad).
- **Registro:** `Registro_Control_Cambios_Formulacion_Tercero_V1.csv`
- **Evaluación:** **Conforme.**

### 3.20 Entrega de MP (Importación a Terceros)
- **Ubicación:** `3.20_Entrega_MP_Importacion_Terceros/`
- **POE:** `POE_3.20_Entrega_MP_Importacion_Terceros_V1.md/.docx`. Sección `## 9. ANEXOS` integra: lista de chequeo documental de ingreso de MP importada.
- **Formatos:** `Formato_Control_Entrega_MP_Terceros_V1.csv`, `Formato_Acta_Entrega_MP_Terceros_V1.md/.docx` (modelo de acta de entrega formal firmada con el tercero).
- **Registro:** `Registro_Conciliacion_MP_Terceros_V1.csv`
- **Evaluación:** **Conforme.**

---

## 5. ANÁLISIS DE LAS ACTAS DE NO APLICABILIDAD (NA)

Las 4 carpetas de procedimientos No Aplicables (`3.03`, `3.04`, `3.07`, `3.09`) contienen Actas Formales aprobadas que justifican ante el ICA por qué el proceso no se realiza en planta. Esta estrategia transforma un potencial hallazgo de incumplimiento en una evidencia de rigurosidad técnica y control de cambios formal.

Cada Acta establece **Criterios de Reactivación**: si en el futuro se adquiere maquinaria o se activan procesos, el Acta pierde vigencia automáticamente y se obliga a reactivar el POE archivado.

---

## 6. CAMBIOS DOCUMENTALES — HISTORIAL DE ARQUITECTURA

| Fecha | Cambio | Detalle |
| :--- | :--- | :--- |
| 2026-05-26 | **Eliminación de subcarpeta `Anexos/`** | Todos los contenidos conceptuales de los 30+ archivos de `Anexos/` fueron integrados en la sección `## 9. ANEXOS` de sus POEs. 6 plantillas operativas fueron promovidas a `Formatos/`. Ver `relevancia_anexos.md`. |
| 2026-05-26 | **Cierre del GAP de 3.06** | Se creó la sección `## 9. ANEXOS` en `POE_3.06_Mezcla_Homogenizacion_V1.md` con flujograma de proceso y tablas de parámetros operativos. |
| 2026-05-26 | **Creación de `10_Base_Datos_Tecnica/`** | `Lista_Maestra_Abreviaturas_Producto_V1.md` es el primer archivo del repositorio técnico centralizado. |

---

*Balance elaborado y verificado mediante inspección computacional del SGC digital.*
*Última actualización: 2026-05-26 — SGC CALFERQUIM S.A.S.*
