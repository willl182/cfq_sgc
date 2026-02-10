# SGC CALFERQUIM S.A.S. - Sistema de Gestión de Calidad

Archivo digital del Sistema de Gestión de Calidad (SGC) para CALFERQUIM S.A.S., empresa fabricante, formuladora y registradora de fertilizantes y acondicionadores de suelos bajo la regulación del **ICA (Instituto Colombiano Agropecuario)**.

---

## Tabla de Contenido

1. [Contexto Regulatorio](#1-contexto-regulatorio)
2. [Estado Actual del SGC](#2-estado-actual-del-sgc-estructura-vigente)
3. [Inventario Digital](#3-inventario-digital)
4. [Diagnóstico de Brechas](#4-diagnóstico-de-brechas-r150-vs-pv0)
5. [Los 18 Pilares Procedimentales (pv0)](#5-los-18-pilares-procedimentales-pv0-anexo-i-ai-b)
6. [Requisitos Técnicos Críticos](#6-requisitos-técnicos-críticos)
7. [Nueva Estructura Propuesta (pv0)](#7-nueva-estructura-propuesta-pv0)
8. [Hoja de Ruta de Transición](#8-hoja-de-ruta-de-transición)
9. [Documentos de Referencia](#9-documentos-de-referencia-en-este-repositorio)
10. [Convenciones de Nombrado](#10-convenciones-de-nombrado)

---

## 1. Contexto Regulatorio

La empresa se encuentra en un periodo de transición regulatoria crítica:

| Marco Legal | Estado | Plazo |
|-------------|--------|-------|
| **Resolución ICA No. 150 de 2003** | Normativa vigente actual (marco legacy) | Sustituida por pv0 |
| **Propuesta de resolución (pv0)** | Nueva normativa digital | 6 meses tras activación de **SimplifICA** |
| **SimplifICA** | Plataforma de trámites en línea del ICA | - |

**Implicación**: El cambio representa una transición de cumplimiento documental estático (R150) a un sistema de gestión operacional basado en riesgos, Buenas Prácticas de Manufactura (BPM) y Buenas Prácticas de Distribución (BPD). El SGC ya no es un archivo pasivo, sino un sistema dinámico con requisitos de interoperabilidad digital.

**Riesgo crítico**: Si la información cargada a SimplifICA contiene errores y no se corrige en dos oportunidades de 15 días hábiles, el registro se pierde y se requiere un "Nuevo Registro" (proceso completo desde cero).

---

## 2. Estado Actual del SGC (Estructura Vigente)

El directorio principal del SGC se ubica en `202_CALFERQUIM/` y contiene **152 directorios** con **2,047 archivos** organizados de la siguiente manera:

```
202_CALFERQUIM/
├── 00 Inbox/                    # Recepción de documentos pendientes de procesamiento
├── 01 Documentacion Legal/      # Cámara de comercio, RUT, resoluciones ICA, contratos
├── 02 Gestion Ambiental/        # Protocolos ambientales
├── 03 Operacion/                # POE de mezcla, granulación, muestreo, liberación de lotes
├── 04 Calidad/                  # Organigrama, PQRS, compras, procesos de calidad
├── 05 Laboratorio/              # Macros XLSM para formulación y verificación
├── 06 SST/                      # Seguridad y Salud en el Trabajo (EPP, bioseguridad, LOTO)
├── 07 Hojas de Seguridad/       # Hojas de seguridad de MP y productos terminados (~300 productos)
├── 08 Registros ICA/            # Dossiers de registros de productos (sección más grande)
├── 09 Fichas Tecnicas/          # Fichas técnicas de productos
├── 10 Tramites ICA/             # Trámites regulatorios (IVA, RVF)
├── 11 Laboratorios Externos/    # Contratos y análisis con Dr. Calderon, Agrilab, Campolab
├── 12 Resultados Externos/      # Certificados de análisis externos (73 archivos)
├── 13 Base Datos/              # Libros, artículos, recursos técnicos
├── 99 Revision/                 # Área de trabajo y revisión (incluye plantilla SGC ICA)
└── despachos/                  # Documentos de despacho y envío
```

### Sistema de Codificación Legacy

Los documentos utilizan el siguiente sistema de códigos:

| Prefijo | Significado | Ejemplo |
|---------|------------|---------|
| `CGC-POE-###` | Procedimiento de Calidad | CGC-POE-018: Mezcla |
| `CGC-IOE-###` | Instructivo Operativo de Equipo | CGC-IOE-001: pHmetro |
| `CGA-POE-###` | Procedimiento de Gestión Ambiental | CGA-POE-001: S.G.M.A. |
| `CGS-POE-###` | Procedimiento de Seguridad | CGS-POE-001: Riesgos y seguridad |
| `DC-SI##` | Documento de Sistema Institucional | DC-SI04 |
| `PC-SI##` | Procedimiento de Sistema Institucional | PC-SI01 |
| `RC-SI##` | Registro de Sistema Institucional | RC-SI53 |

---

## 3. Inventario Digital

| Tipo de Archivo | Cantidad | Porcentaje | Descripción |
|----------------|----------|------------|-------------|
| `.pdf` | 1,086 | 53% | Regulación, resultados de laboratorio, certificados |
| `.docx` | 633 | 31% | Procedimientos editables, hojas de seguridad |
| `.xlsx` | 223 | 11% | Balance de masas, formulaciones, métodos, registros |
| `.xlsm` | 16 | <1% | Macros con verificación NPK y composición |
| `.doc` | 26 | <1% | Formularios ICA legacy (Forma 3-896) |
| `.zip` | 25 | <1% | Dossiers comprimidos |
| `.md` | 9 | <1% | Documentos de análisis |
| **TOTAL** | **2,047** | **100%** | |

### Portafolio de Productos

- ~300 productos registrados ante el ICA
- Líneas principales: NPK (10-20-20, 10-30-10, 13-5-27), especialidades (FERTICORRECTIVO, FERTIMENORES, B-ZINC 15, CALFER LLENADO, CALFER MENORES, TODERO, ZUELOCA, SULFAK 50, SOLURAIFOS, K2K, RAIFOS 20)

---

## 4. Diagnóstico de Brechas (R150 vs pv0)

| Nuevo Mandato (pv0) | Activo SGC Actual | Acción Estratégica Requerida |
|---------------------|------------------|-------------------------------|
| **Interoperabilidad Digital** | 2,047 archivos (PDF, DOCX, XLSX) | Categorizar y etiquetar todos los archivos en los 18 pilares procedimentales para carga a SimplifICA |
| **Análisis de Calidad Anual** | Resultados en `12 Resultados Externos/` | Establecer cronograma anual formal; verificar que Dr. Calderon/Agrilab tienen registro ICA para CADA parámetro garantizado |
| **Prohibición de "Barreduras"** | Procedimientos en `02 Gestion Ambiental/` | Actualizar protocolos ambientales para prohibir explícitamente reutilización; implementar registros de destrucción |
| **Expansión Procedimental** | Carpetas `03/` y `04/` (DC-SI / PC-SI) | Convertir documentos `DC-SI` a formato `CGC-POE` para cumplir con los 18 pilares GMP |
| **Cumplimiento NPK** | 16 macros `.xlsm` en carpeta `05/` | Auditar macros para asegurar mínimos: 10% (individual), 18% (sólido edáfico), 15% (fertirriego) |
| **Laboratorios Registrados ICA** | Contratos en `01/` y análisis en `11/` | Verificar que TODOS los laboratorios (internos/externos) están registrados ante ICA para CADA parámetro analizado |
| **Trazabilidad Completa** | Disperso entre `03/`, `04/` y `08/` | Centralizar procedimientos de codificación, liberación y trazabilidad en módulo dedicado |
| **Balance de Masas** | Parcialmente documentado | Formalizar procedimiento obligatorio de balance de MP vs producto + inventario + residuos |
| **Contramuestras** | No existe carpeta dedicada | Crear procedimiento y sistema de almacenamiento de contramuestras (nuevo requisito explícito pv0) |
| **Asesor Técnico (vs Director Técnico)** | Rol de Director Técnico definido | Revisar contratos para reflejar el requisito de "acompañamiento permanente" |

---

## 5. Los 18 Pilares Procedimentales (pv0 - Anexo I-A/I-B)

La nueva resolución exige formalizar y documentar procedimientos, formatos y registros para 18 puntos específicos. El SGC actual tiene brechas en varios de estos.

| # | Pilar Procedimental | Estado Calferquim | Carpeta Actual | Acción |
|---|---------------------|-------------------|----------------|--------|
| 1 | **Control de Proveedores** | Parcial | `04 Calidad/` | Formalizar procedimiento CGC-POE de auditoría y calificación |
| 2 | **Balance de Materias Primas** | Parcial | `05 Laboratorio/` | Formalizar CGC-POE obligatorio con formatos de balance |
| 3 | **Codificación de Lotes** | Disperso | `03 Operacion/` | Procedimiento estandarizado para identificación de lotes |
| 4 | **Procedimientos de Muestreo** | Existe | `03 Operacion/` | CGC-POE-013 ya cubre muestreo según NTC 8633 |
| 5 | **Liberación de Lotes** | Existe | `03 Operacion/` | CGC-POE-021 cubre liberación al mercado |
| 6 | **Almacenamiento de Contramuestras** | **FALTA** | - | Crear procedimiento nuevo para gestión de contramuestras |
| 7 | **Mantenimiento de Equipos** | Parcial | `06 SST/` | Formalizar CGC-POE preventivo y correctivo |
| 8 | **Calibración** | Disperso | `04 Calidad/` | Centralizar procedimiento de calibración de instrumentos |
| 9 | **Limpieza y Desinfección** | Parcial | `06 SST/` | Formalizar CGC-POE de protocolos de higiene |
| 10 | **Manejo de Residuos (Barreduras)** | Existe | `02 Gestion Ambiental/` | Actualizar con prohibición explícita de reutilización |
| 11 | **Capacitación del Personal** | Parcial | `06 SST/` | Formalizar CGC-POE con cronograma y registros |
| 12 | **Control Documental** | Disperso | `99 Revision/` | Procedimiento de ciclo de vida del SGC |
| 13 | **Retiro de Producto / Trazabilidad** | Disperso | `04 Calidad/` | Crear procedimiento de recall |
| 14 | **Servicio al Cliente (PQR)** | Existe | `04 Calidad/` | CGC-POE-024 cubre atención de quejas |
| 15 | **Auditorías Internas** | Existe | `04 Calidad/` | CGC-POE-026 ya existe |
| 16 | **Gestión del Laboratorio** | Disperso | `05/` y `11/` | Centralizar control de laboratorio propio/contratado |
| 17 | **Controles del Proceso de Producción** | Existe | `03 Operacion/` | POEs de molienda, mezcla, granulación |
| 18 | **Mantenimiento de Instalaciones e Higiene** | Parcial | `06 SST/` | Integrar con limpieza/desinfección |

**Resumen**: 6 pilares existen, 8 están parciales o dispersos, **4 están faltantes** (Contramuestras, Control Documental, Retiro de Producto, Gestión Centralizada del Laboratorio).

---

## 6. Requisitos Técnicos Críticos

### 6.1 Minimos de NPK (Fertilizantes Inorgánicos)

| Tipo de Formulación | Mínimo Exigido |
|---------------------|----------------|
| Un solo nutriente mayor (N, P₂O₅ o K₂O) | **10%** |
| Dos o más nutrientes mayores (sólido uso edáfico) | Sumatoria ≥ **18%** |
| Dos o más nutrientes mayores (sólido uso fertirriego) | Sumatoria ≥ **15%** |

### 6.2 Límites de Metales Pesados (Aplicables a todos los productos)

| Metal | Límite Máximo |
|-------|---------------|
| Arsénico (As) | 41 mg/kg |
| Cadmio (Cd) | 39 mg/kg |
| Plomo (Pb) | 20 mg/kg |
| Níquel (Ni) | 420 mg/kg (solo orgánicos y organo-minerales) |

### 6.3 Inocuidad Microbiológica (Productos con materia orgánica)

| Parámetro | Límite |
|-----------|--------|
| *Salmonella* spp. | Ausente en 25 g o mL |
| Coliformes totales | < 1,000 UFC o NMP/g o mL |
| Huevos de Helminto viables | < 1 individuo en 4 g de muestra |

### 6.4 Fertilizantes Orgánicos y Organo-Minerales

| Tipo | COOT Mínimo | Suma NPK Mínima |
|------|-------------|-----------------|
| Orgánico Sólido | **12%** | **2%** |
| Organo-Mineral Sólido | **5%** | **8%** |

### 6.5 Propiedades Físico-Químicas Obligatorias

| Propiedad | Rango/Requisito |
|-----------|-----------------|
| pH en solución | Rango máximo de dos unidades |
| Densidad | Garantizar valor especificado |
| Humedad máxima | 1.5% (inorgánicos sólidos), 20% (orgánicos de origen animal) |
| Solubilidad en agua | Para foliares, fertirriego e hidroponía |
| Conductividad eléctrica | Para orgánicos y sustratos |
| Capacidad de Intercambio Catiónico (CIC) | Para orgánicos y sustratos |
| PRNT (Poder Relativo de Neutralización Total) | Mínimo 50% para enmiendas (excepto azufre) |

---

## 7. Nueva Estructura Propuesta (pv0)

Esta estructura reemplaza la organización numérica anterior por una lógica de flujo de proceso (Ciclo PHVA), alineada con los 18 pilares procedimentales.

```
SGC_CALFERQUIM_NUEVA_RESOLUCION/

├── 00_Inbox_Pendientes/                      # Recepción de documentos

├── 01_Direccion_Tecnica_Legal/               # Resoluciones ICA, contratos asesor técnico, representación legal

├── 02_Gestion_Proveedores_Insumos/           # Control de proveedores, hojas seguridad MP, recepción/almacenamiento, fichas técnicas MP

├── 03_Produccion_Manufactura/                # Órdenes de producción, POE, balance de masas, envasado/etiquetado, mantenimiento equipos

├── 04_Laboratorio_Control_Calidad/           # Registro laboratorio (propio/contrato), plan muestreo, resultados análisis, contramuestras, verificación equipos

├── 05_Trazabilidad_Liberacion/               # (NUEVO MÓDULO CRÍTICO) Codificación lotes, liberación lotes, trazabilidad ventas

├── 06_Gestion_Residuos_Ambiental/           # Disposición barreduras (prohibida reutilización), residuos líquidos, plan ambiental

├── 07_Postventa_Servicio_Cliente/            # PQRS, retiro de producto (recall)

└── 08_Dossier_Productos_Registrados/         # Por producto: registro venta, ficha técnica, etiqueta aprobada, hoja seguridad, soportes ensayo
```

### Justificación de los Cambios Clave

1. **Centralización de Laboratorio (04)**: Unifica gestión para demostrar que todos los análisis provienen de laboratorios registrados ICA. Añade carpeta de Contramuestras (requisito nuevo).

2. **Creación del Módulo de Trazabilidad (05)**: Eleva visibilidad de codificación y liberación de lotes. El inspector ICA verificará el flujo completo desde orden de producción hasta autorización de venta.

3. **Gestión Estricta de Residuos (06)**: Separa claramente material recuperable de residuo/barredura. Demuestra control sobre prohibición explícita de reutilización.

4. **Producción y Balance de Masas (03)**: Integra POE en una ubicación. Añade "Balance de Masas" para auditar rendimientos y evitar desvíos.

5. **Gestión de Proveedores (02)**: Directorio dedicado para demostrar que solo se compran MP a proveedores aprobados con documentación actualizada.

---

## 8. Hoja de Ruta de Transición

### Fase 1: Auditoría Crítica (Inmediata)

| Acción | Responsabilidad | Entregable |
|--------|----------------|------------|
| **Auditoría de Laboratorios** | Calidad/Legal | Lista de laboratorios con registro ICA por parámetro analizado |
| **Auditoría de Macros** | Laboratorio/TI | Reporte de macros que rechazan formulaciones fuera de NPK/metales |
| **Inventario de Barreduras** | Operaciones/Calidad | Procedimiento actualizado con prohibición explícita y registros de destrucción |

### Fase 2: Reestructuración Procedimental

| Acción | Carpeta Fuente | Formato Destino |
|--------|----------------|-----------------|
| Conversión DC-SI → CGC-POE | `03 Operacion/` y `04 Calidad/` | Formato CGC-POE para los 18 pilares |
| Creación de procedimientos faltantes | - | CGC-POE: Contramuestras, Control Documental, Recall, Gestión Laboratorio |
| Actualización del Director Técnico a Asesor Técnico | `01 Documentacion Legal/` | Revisión de contratos para "acompañamiento permanente" |

### Fase 3: Sincronización Digital

| Acción | Herramienta | Objetivo |
|--------|-------------|----------|
| Categorización de 2,047 archivos | Manual/Script | Etiquetar cada archivo en los 18 pilares procedimentales |
| Preparación para SimplifICA | - | Organizar documentos para carga en 6 meses |

### Regla de los "Dos Strikes"

- Plazo corrección primera oportunidad: **15 días hábiles**
- Prórroga posible: **15 días hábiles adicionales**
- Si falla segunda oportunidad: **Registro perdido → Nuevo Registro** (catástrofe financiera)

### Riesgos y Mitigación

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Laboratorio externo sin registro ICA por parámetro | Análisis inválido, producto no liberable | Verificar registro ICA antes de enviar muestras; iniciar proceso de registro si falta |
| Formulación fuera de mínimos NPK | Rechazo en registro o inspección | Auditoría de macros para endurecer validaciones |
| Uso no intencional de barreduras | Sanción administrativa o multa | Protocolo explícito con firmas de compromiso y registros de destrucción |
| Falta de contramuestras | Incumplimiento inspección ICA | Crear sistema de almacenamiento con rotulación y trazabilidad |

---

## 9. Documentos de Referencia en este Repositorio

Los siguientes archivos markdown contienen análisis detallados que respaldan este README:

| Archivo | Idioma | Contenido |
|---------|--------|-----------|
| `qms_new.md` | Español | Propuesta de nueva estructura del SGC alineada a pv0 (8 carpetas PHVA) |
| `cambio_norma.md` | Español | Comparación completa R150 vs pv0 (alcance, definiciones, registro, digitalización, requisitos técnicos) |
| `analisis_norma_sgc_demas.md` | Inglés | Análisis estratégico de la evolución del SGC, los 18 pilares, y adopción GMP/GDP |
| `sgc_r150_rnueva.md` | Español | Comparación de requisitos de calidad entre R150 y la nueva resolución |

---

## 10. Convenciones de Nombrado

### Prefijos de Carpetas (Nivel raíz)

| Rango | Dominio |
|-------|---------|
| `00` | Inbox / Recepción |
| `01-06` | Departamentos funcionales actuales |
| `07` | Hojas de seguridad |
| `08-10` | Registros y trámites regulatorios |
| `11-13` | Soporte externo y conocimiento |
| `99` | Revisión y documentos en progreso |

### Codificación de Productos y Dossiers

| Patrón | Ejemplo | Significado |
|--------|---------|-------------|
| `_01-nombre` | `_01-bzinc-15/`, `_02-ferticorrectivo/` | Secuencia numérica + nombre del producto |
| `202.3_` | `202.3_registros_ica-n/` | Nuevos registros |
| `203.1_` | `203.1_registros_ica/` | Registros activos |
| `203.12_` | `203.12_registros/` | Aprobaciones de etiquetas/empaque (RVF) |
| `01.1_`, `01.2_`, `03_`, `04_`, `06_`, `07_`, `10_`, `12_` | Numeración de checklist | Secuencia de documentos dentro del dossier |

### Versionado

- Prefijos de fecha: `20241015-`, `20250617-`
- Indicadores de versión: `_v2`, `_v0`, `V.0`, `V-1`

---

## Contacto y Preguntas

Para dudas sobre la estructura del SGC, los requisitos de la nueva resolución, o el proceso de transición, consulte los documentos de referencia listados en la sección 9 o contacte al área de Calidad y Regulatory Affairs.

---

*Última actualización: 2025*  
*Estado: En transición R150 → pv0*