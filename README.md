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
| **Propuesta de resolución (pv0)** | Nueva normativa en transición | Requiere ajuste documental y técnico |

**Implicación**: El cambio representa una transición de cumplimiento documental estático (R150) a un sistema de gestión operacional basado en riesgos, Buenas Prácticas de Manufactura (BPM) y Buenas Prácticas de Distribución (BPD). El SGC ya no es un archivo pasivo, sino un sistema dinámico con exigencias de control, trazabilidad y evidencia técnica.

---

## 2. Estado Actual del SGC (Estructura de Trabajo)

El directorio principal del SGC activo se ubica en `SGC_CALFERQUIM/` y está organizado en concordancia con el Acta de Visita de Verificación de Requisitos del ICA (Anexo I-B) de la siguiente manera:

```
SGC_CALFERQUIM/
├── 00_Inbox/                           # Recepción y procesamiento temporal de nuevos documentos
├── 01_Requisitos_Generales/            # Croquis de áreas, listado de materias primas, contratos de producción y asesor técnico
├── 02_Control_Calidad/                 # Habilitación de laboratorios externos y certificados de análisis
├── 03_Procedimientos/                  # Los 20 procedimientos obligatorios (muestreo, contramuestras, balance de masas, etc.)
├── 04_Instalaciones/                   # Planos de producción, señalizaciones y archivo documental físico/digital
├── 05_Dossier_Productos/               # Especificaciones técnicas detalladas y subcarpetas numéricas por producto
├── 06_Documentacion_Legal/             # Resoluciones ICA, certificados de existencia legal y representación
├── 07_Postventa_Servicio_Cliente/      # Peticiones, quejas y reclamos (PQRS) y plan de retiro del mercado (recall)
├── 08_Dossier_Productos_Registrados/   # Dossiers normalizados de los productos registrados oficiales ante el ICA (26 dossiers activos)
├── 09_SST/                             # Seguridad y Salud en el Trabajo (EPP, bioseguridad, procedimientos LOTO)
└── 10_Base_Datos_Tecnica/              # Abreviaturas de productos, inventario de materias primas y base técnica
```

La carpeta heredada `202_CALFERQUIM/` ha sido trasladada a `_Legacy_y_Otros/` como archivo histórico.

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
| **Organización documental** | 2,047 archivos (PDF, DOCX, XLSX) | Categorizar y etiquetar todos los archivos en los 18 pilares procedimentales |
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

| # | Pilar Procedimental | Estado Calferquim | Carpeta Actual en SGC_CALFERQUIM/ | Acción |
|---|---------------------|-------------------|----------------------------------|--------|
| 1 | **Control de Proveedores** | Normalizado | `01_Requisitos_Generales/1.2_` y `03_Procedimientos/3.01_` | Procedimiento y formatos de control de insumos y MP |
| 2 | **Balance de Materias Primas** | Implementado | `03_Procedimientos/3.05_Balance_Materias_Primas/` | Habilitación de balances mensuales de masa |
| 3 | **Codificación de Lotes** | Normalizado | `03_Procedimientos/3.11_Codificacion_Lotes/` | Identificación inequívoca por lote y planta |
| 4 | **Procedimientos de Muestreo** | Existe | `03_Procedimientos/3.13_Muestreo_Control_Calidad/` | Instructivo y planes de muestreo de calidad |
| 5 | **Liberación de Lotes** | Existe | `03_Procedimientos/3.12_Liberacion_Lotes/` | Control del flujo de inspección técnica |
| 6 | **Almacenamiento de Contramuestras** | Implementado | `03_Procedimientos/3.14_Contramuestras/` | Nuevo procedimiento e instalaciones físicas de retención |
| 7 | **Mantenimiento de Equipos** | Normalizado | `03_Procedimientos/3.15_Higiene_Seguridad_Industrial/` | Gestión preventiva y correctiva en planta |
| 8 | **Calibración** | Normalizado | `03_Procedimientos/3.13_Muestreo_Control_Calidad/` | Frecuencias de ajuste y verificación de balanzas/equipos |
| 9 | **Limpieza y Desinfección** | Normalizado | `03_Procedimientos/3.02_Limpieza_Desinfeccion/` | Protocolos estrictos de saneamiento y orden |
| 10 | **Manejo de Residuos (Barreduras)** | Existe | `03_Procedimientos/3.18_Disposicion_Residuos/` | Prohibición explícita de reutilización en procesos |
| 11 | **Capacitación del Personal** | Normalizado | `03_Procedimientos/3.15_Higiene_Seguridad_Industrial/` | Registros de inducción y capacitaciones |
| 12 | **Control Documental** | Normalizado | `04_Instalaciones/4.12_Archivo_Documental/` | Control y ciclo de vigencia del SGC digital |
| 13 | **Retiro de Producto / Trazabilidad** | Implementado | `07_Postventa_Servicio_Cliente/` | Procedimiento formal de retiro de producto (recall) |
| 14 | **Servicio al Cliente (PQR)** | Existe | `03_Procedimientos/3.16_Servicio_Cliente_PQR/` | Atención formal y registros de PQRS |
| 15 | **Auditorías Internas** | Existe | `01_Requisitos_Generales/1.5_Asesor_Tecnico/` | Plan y actas de auditoría operativa |
| 16 | **Gestión del Laboratorio** | Normalizado | `02_Control_Calidad/2.1_Laboratorio_Registrado/` | Gestión de laboratorios con alcance registrado ICA |
| 17 | **Controles del Proceso de Producción** | Existe | `03_Procedimientos/` | POEs normalizados de molienda, mezcla y empaque |
| 18 | **Mantenimiento de Instalaciones e Higiene** | Normalizado | `03_Procedimientos/3.15_Higiene_Seguridad_Industrial/` | Control estructural de limpieza y saneamiento de planta |

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

## 7. Estructura Implementada del SGC (Alineación pv0 / Anexo I-B)

Esta estructura organiza de forma definitiva el SGC digital de Calferquim en concordancia exacta con la lista de verificación del inspector del ICA (Anexo I-B), facilitando el proceso de auditoría y demostración de conformidad.

```
SGC_CALFERQUIM/
├── 00_Inbox/                           # Recepción y procesamiento temporal de nuevos documentos
├── 01_Requisitos_Generales/            # Croquis de áreas, listado de materias primas, contratos de producción y asesor técnico
├── 02_Control_Calidad/                 # Habilitación de laboratorios externos y certificados de análisis
├── 03_Procedimientos/                  # Los 20 procedimientos obligatorios (muestreo, contramuestras, balance de masas, etc.)
├── 04_Instalaciones/                   # Planos de producción, señalizaciones y archivo documental físico/digital
├── 05_Dossier_Productos/               # Especificaciones técnicas detalladas y subcarpetas numéricas por producto
├── 06_Documentacion_Legal/             # Resoluciones ICA, certificados de existencia legal y representación
├── 07_Postventa_Servicio_Cliente/      # Peticiones, quejas y reclamos (PQRS) y plan de retiro del mercado (recall)
├── 08_Dossier_Productos_Registrados/   # Dossiers normalizados de los productos registrados oficiales ante el ICA (26 dossiers activos)
├── 09_SST/                             # Seguridad y Salud en el Trabajo (EPP, bioseguridad, procedimientos LOTO)
└── 10_Base_Datos_Tecnica/              # Abreviaturas de productos, inventario de materias primas y base técnica
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
| Preparación documental | - | Organizar documentos, evidencias y soportes técnicos para transición regulatoria |

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

### Prefijos de Carpetas (Estructura SGC_CALFERQUIM)

| Carpeta | Dominio / Uso |
|---------|---------------|
| `00_Inbox` | Recepción y procesamiento temporal de nuevos documentos |
| `01_Requisitos_Generales` | Croquis de planta, flujos de producción, contratos y asesor técnico |
| `02_Control_Calidad` | Laboratorios registrados ICA y reportes analíticos consolidados |
| `03_Procedimientos` | Los 20 procedimientos operativos estandarizados exigidos por el ICA |
| `04_Instalaciones` | Evidencias de señalización, planos y control de archivo digital/físico |
| `05_Dossier_Productos` | Especificaciones de productos y fichas técnicas legacy |
| `06_Documentacion_Legal` | Resoluciones ICA, certificados de representación y actas legales |
| `07_Postventa_Servicio_Cliente` | PQRS y planes de retiro (recall) |
| `08_Dossier_Productos_Registrados` | Los 26 dossiers normalizados oficiales de las marcas registradas |
| `09_SST` | Seguridad y Salud en el Trabajo, EPP y LOTO |
| `10_Base_Datos_Tecnica` | Abreviaturas, inventario de materias primas y base técnica |

### Codificación de Dossiers de Producto (en `08_Dossier_Productos_Registrados/`)

Cada dossier comercial se nombra bajo el patrón: `##_RVF[Número]_Nombre_Producto` (Ejemplo: `05_RVF4415_AFOS-K_0-40-50/`).
Dentro de cada dossier se mantiene una estructura obligatoria de 5 subcarpetas:
1. `01_Registro_Venta/`: Resoluciones de venta y aprobaciones oficiales del ICA.
2. `02_Ficha_Tecnica/`: Ficha técnica del producto terminado.
3. `03_Etiqueta_Aprobada/`: Arte final de la etiqueta aprobada legalmente por el ICA.
4. `04_Hoja_Seguridad/`: Hoja de datos de seguridad del producto terminado (HDS).
5. `05_Soportes_Ensayo/`: Certificados de análisis de laboratorio externos con registro ICA.

### Versionado

- Prefijos de fecha: `20241015-`, `20250617-`
- Indicadores de versión: `_v2`, `_v0`, `V.0`, `V-1`

---

## Contacto y Preguntas

Para dudas sobre la estructura del SGC, los requisitos de la nueva resolución, o el proceso de transición, consulte los documentos de referencia listados en la sección 9 o contacte al área de Calidad y Regulatory Affairs.

---

*Última actualización: 2025*  
*Estado: En transición R150 → pv0*
