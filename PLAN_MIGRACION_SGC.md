# Plan de Migración SGC CALFERQUIM
# Estructura alineada a pv0 (propuesta resolución ICA)

---

## 1. RESUMEN EJECUTIVO

| Métrica | Valor Actual | Valor Final | Diferencia |
|----------|--------------|-------------|------------|
| Total de archivos | ~2,043 | ~800 útiles | -1,243 eliminados/archivados |
| Carpetas principales | 14 | 11 + 1 Archivo | Simplificación |
| Productos con dossier | 0 | 22 | Nuevos dossiers estructurados |
| Brechas documentales | 10 críticas | 5 por crear | 5 documentos nuevos requeridos |
| Duplicación | Masiva (5-10 copias) | 0 (una versión activa) | Limpieza completa |

---

## 2. INVENTARIO ACTUAL

### 2.1. Archivos por Carpeta Principal

| Carpeta | Archivos | Observaciones |
|---------|----------|----------------|
| `07 Hojas de Seguridad/` | 152 (93 PT + 59 MP) | Mezclados sin clasificar |
| `08 Registros ICA/` | 544 (22 productos) | Duplicados masivos entre subcarpetas |
| `09 Fichas Técnicas/` | 280 | **Extrema duplicación**: cada producto 5-10 copias |
| `99 Revisión/` | 800 | SGC legacy completo, ZIPs respaldo, dispersos |
| `06 SST/` | 13 | Procedimientos seguros (PC-SI) + políticas |
| `04 Calidad/` | 9 | Documentos controlados activos |
| `03 Operación/` | 8 | Procedimientos operativos |
| `05 Laboratorio/` | 10 | Herramientas (VERIFICADOR, FORMULADOR) |
| `12 Resultados Externos/` | ~70 PDFs | Certificados de análisis |
| Otros (`00`, `01`, `02`, `10-13`, `despachos`) | ~50 | Variados |

**Total: ~2,043 archivos estimados**

### 2.2. 22 Productos Identificados para 08_Dossier

| # | Producto | Registro ICA | FT V2 | HS disponible |
|---|----------|:---:|:---:|:---:|
| 1 | CALFERCORRECTIVO | Si | Si | Si |
| 2 | CALFER FLORACION | Si | No (V1) | Si |
| 3 | CALFER LLENADO | Si | Si (como FT CALFER LLENADO) | Si |
| 4 | CALFER MENORES | Si | Si | Si |
| 5 | 2-AVANCE | Si | Si (FT 2 AVANCE) | Si |
| 6 | 1-CRECIMIENTO | Si | Si (FT 1 CRECIMIENTO) | Si |
| 7 | 3-PRODUCTOR | Si | Si (FT 3 PRODUCTOR) | Si |
| 8 | TODERO | Si | No en V2 | Si |
| 9 | SOLURAIFOS | Si | Si | Si |
| 10 | SULFAK 50 | Si | Si | Si |
| 11 | B-ZINC 15 | Si | No en V2 | No identificada |
| 12 | FERTIMENORES | Si | Si | Si |
| 13 | 10-20-20 | Si | No en V2 | Si |
| 14 | 10-30-10 | Si | No en V2 | No identificada |
| 15 | 13-5-27 | Si | No en V2 | Si |
| 16 | BIOCalfer | Si | No en V2 | Si |
| 17 | CALFER DESARROLLO | Si | No en V2 | Si |
| 18 | ZUELOCa | Si | Si | Si |
| 19 | PRODUCCION 17 | Si | Si | No identificada |
| 20 | K2K | Si | Si | Si |
| 21 | CALFERZINC-P | Si | Si | Si |
| 22 | RAIFOS 20 | Si | Si | Si |

---

## 3. ESTRUCTURA FINAL PROPUESTA

```
SGC_CALFERQUIM/
│
├── 00_Inbox_Pendientes/
│   └── [Archivos pendientes de clasificación]
│
├── 01_Direccion_Tecnica_Legal/
│   ├── 01_Registro_Empresa_ICA/
│   │   ├── Resolución ICA 107688.pdf
│   │   ├── Resolución ICA 5783 2024.pdf
│   │   └── [Documentos para SimplifICA]
│   ├── 02_Asesor_Tecnico/
│   │   └── [FALTA] Contrato asesor técnico permanente
│   └── 03_Representacion_Legal/
│       ├── Cámara de Comercio CALFERQUIM SAS.pdf
│       ├── RUT CALFERQUIM SAS.pdf
│       └── Cédula Representante Legal.pdf
│
├── 02_Gestion_Proveedores_Insumos/
│   ├── 01_Seleccion_Evaluacion/
│   │   ├── DC-SI26 Compras y Gestión de Proveedores.pdf
│   │   ├── RC-SI17 Seleccion de Proveedores.xlsx
│   │   ├── RC-SI35 Orden de Compra.xlsx
│   │   ├── RC-SI36 Vinculacion de Proveedores.pdf
│   │   └── RC-SI47 Desempeño de Proveedores.xlsx
│   ├── 02_Hojas_Seguridad_MP/
│   │   └── [59 HS de materias primas clasificadas]
│   ├── 03_Recepcion_Almacenamiento/
│   │   └── [FALTA] Procedimiento recepción y ubicación
│   └── 04_Fichas_Tecnicas_MP/
│       └── [~130 FT de materias primas de 99 Rev/203.10]
│
├── 03_Produccion_Manufactura/
│   ├── 01_Ordenes_Produccion/
│   │   └── [~80 OPs de 99 Rev/203.7]
│   ├── 02_Procedimientos_POE/
│   │   ├── DC-SI04 Procedimiento de mezclas.pdf
│   │   ├── DC-SI05 Identificación y Control de Puntos Criticos.pdf
│   │   ├── DC-SI14 Procedimiento de Granulación.pdf
│   │   └── DC-SI22 Procedimiento Bloqueo y Etiquetado.pdf
│   ├── 03_Balance_Masas/
│   │   └── [PARCIAL] Hojas Excel por producto (actualizar procedimiento)
│   ├── 04_Envasado_Etiquetado/
│   │   ├── DC-SI22 Procedimiento Bloqueo y Etiquetado.pdf
│   │   ├── 6- PLANO PLANTA PRODUCCION.pdf
│   │   └── [Proyectos de etiquetado]
│   └── 05_Mantenimiento_Equipos/
│       ├── RC-SI55 Hoja de Vida y Mantenimientos de Maquinaria.xlsx
│       ├── RC-SI57 Inspeccion de Equipos en Planta de Granulacion.xlsx
│       └── [Evidencias mantenimiento]
│
├── 04_Laboratorio_Control_Calidad/
│   ├── 01_Registro_Laboratorio/
│   │   ├── Contrato Laboratorio Dr Calderon.pdf
│   │   ├── Contrato Agrilab.pdf
│   │   ├── Contrato Campolab.pdf
│   │   └── [FALTA] Resolución laboratorio propio/contratado ICA
│   ├── 02_Plan_Muestreo/
│   │   ├── DC-SI12 Asignación de Lotes, Muestreo y Control de Calidad.pdf
│   │   ├── DC-SI34 Ensayos Fisicoquimicos en Laboratorio.pdf
│   │   ├── 20241102- SC-SI## Procedimiento Verificacion Formulaciones_V0.docx
│   │   ├── VERIFICADOR_V1.xlsm
│   │   ├── VERIFICADOR_FM2.xlsm
│   │   ├── VERIFICADOR_FM3.xlsm
│   │   └── FORMULADOR_V0.2.xlsm
│   ├── 03_Resultados_Analisis/
│   │   └── [~70 PDFs de 12 Resultados Externos]
│   ├── 04_Contramuestras/
│   │   └── [FALTA] Procedimiento contramuestras
│   └── 05_Verificacion_Equipos/
│       ├── [Certificados de pesas patrón]
│       └── [Registros calibración]
│
├── 05_Trazabilidad_Liberacion/
│   ├── 01_Codificacion_Lotes/
│   │   ├── DC-SI12 Asignación de Lotes, Muestreo y Control de Calidad.pdf
│   │   └── [FALTA] Procedimiento específico loteado
│   ├── 02_Liberacion_Lotes/
│   │   ├── DC-SI10 Liberación de Lotes al Mercado.pdf
│   │   └── [Formatos de liberación cuarentena → aprobado]
│   └── 03_Trazabilidad_Ventas/
│       ├── RC-SI53 Traslado de Producto Terminado al Almacen.xlsx
│       ├── [~290 certificados calidad de 99 Rev/202.5]
│       └── [FALTA] Sistema trazabilidad ventas
│
├── 06_Gestion_Residuos_Ambiental/
│   ├── 01_Disposicion_Barreduras/
│   │   └── [FALTA] Procedimiento manejo barreduras (prohibición reutilización)
│   ├── 02_Residuos_Liquidos/
│   │   └── [Contenido actual 02 Gestion Ambiental]
│   └── 03_Plan_Gestion_Ambiental/
│
├── 07_Postventa_Servicio_Cliente/
│   ├── 01_PQRS/
│   │   ├── DC-SI07 Quejas y Reclamos.pdf
│   │   ├── DC-SI11 Servicio al Cliente.pdf
│   │   ├── DC-SI13 Politica Servicio al Cliente.pdf
│   │   ├── DC-SI15 Politica de Quejas y Reclamos.pdf
│   │   ├── RC-SI08 Formulario Control de Quejas y Reclamos.xlsx
│   │   └── [Registros respuesta reclamaciones]
│   └── 02_Retiro_Producto/
│       └── [FALTA] Procedimiento recall
│
├── 08_Dossier_Productos_Registrados/
│   ├── 01_CALFERCORRECTIVO/
│   │   ├── 01_Registro_Venta/
│   │   ├── 02_Ficha_Tecnica/
│   │   ├── 03_Etiqueta_Aprobada/
│   │   ├── 04_Hoja_Seguridad/
│   │   └── 05_Soportes_Ensayo/
│   ├── 02_CALFER_FLORACION/
│   │   └── [misma estructura]
│   ├── ... (22 productos con misma estructura)
│   └── _Indice_HS/
│       └── Índice central de todas las HS
│
├── 09_SST/
│   ├── Politicas/
│   │   └── DC-SI03 Politica y Objetivos V.0.pdf
│   ├── Procedimientos_Seguridad/
│   │   ├── PC-SI01 PROCESO DE MOLIDO.pdf
│   │   ├── PC-SI03 PROCESO DE MEZCLA.pdf
│   │   ├── PC-SI04 PROCESO DE GRANULACIÓN.pdf
│   │   ├── PC-SI05 PROCESO DE SECADO.pdf
│   │   ├── PC-SI06 PROCESO DE SEPARACIÓN DE FINOS.pdf
│   │   ├── PC-SI09 PROCESO DE ENFRIAMIENTO.pdf
│   │   ├── PC-SI10 PROCEDIMIENTO SEGURO DE DESATASCO DE MEZCLADORA.pdf
│   │   └── DC-SI22 Procedimiento de Bloqueo y Etiquetado.pdf
│   └── EPP_Bioseguridad/
│       ├── DC-SI16 Entrega y Reemplazo de EPP.pdf
│       ├── DC-SI30 Protocolo de Bioseguridad.pdf
│       └── DC-SI37 Procedimiento para el Almacenamiento Seguro y Conteo de Bultos.pdf
│
├── 10_Base_Datos_Tecnica/
│   ├── Libros/
│   └── Articulos/
│
└── _Archivo/
    ├── SGC_Legacy/
    │   ├── RRHH/                          # DC-SI19, MF-SI01-29, formatos
    │   ├── Compras/
    │   ├── Calidad/
    │   ├── Operaciones/
    │   └── ZIP_Backups/
    ├── FT_Versiones_Anteriores/
    │   ├── V1_ya/                       # Versiones "ya" de 09 FT
    │   └── Nueva_carpeta/               # Set completo duplicado
    ├── HS_Versiones_Anteriores/
    │   └── [Versiones obsoletas de HS]
    └── Registros_ICA_Legacy/
        └── [Carpetas antiguas de 08 Registros ICA]
```

### 3.1. Convención de Nombres

```
[CODIGO]-[Nombre_Descriptivo]_V[version].[ext]

Ejemplos:
- DC-SI04_Procedimiento_Mezclas_V1.pdf
- FT_CALFERCORRECTIVO_V2.pdf
- HS_SULFATO_ZINC_35_V1.pdf
- RC-SI08_Control_Quejas_Reclamos_V1.xlsx
- CERT_ANALISIS_SULFAK50_20251101.pdf
```

---

## 4. BRECHAS DOCUMENTALES (Requisitos pv0 sin soporte)

| # | Requisito pv0 | Carpeta Destino | Estado Actual | Prioridad |
|---|--------------|----------------|----------------|-----------|
| 1 | **Contrato Asesor Técnico** | `01_.../02_Asesor_Tecnico/` | No encontrado | ALTA |
| 2 | **Procedimiento Balance de Masas** | `03_.../03_Balance_Masas/` | Solo hojas Excel por producto | ALTA |
| 3 | **Procedimiento Contramuestras** | `04_.../04_Contramuestras/` | No existe | ALTA |
| 4 | **Procedimiento Recall/Retiro** | `07_.../02_Retiro_Producto/` | No existe | ALTA |
| 5 | **Procedimiento Disposición Barreduras** | `06_.../01_Disposicion_Barreduras/` | No existe | ALTA |
| 6 | **Etiquetas Aprobadas por producto** | `08_.../03_Etiqueta_Aprobada/` | Parcial (solo algunos productos) | MEDIA |
| 7 | **Procedimiento Codificación Lotes** | `05_.../01_Codificacion_Lotes/` | Solo DC-SI12 existente | MEDIA |
| 8 | **Trazabilidad Ventas** | `05_.../03_Trazabilidad_Ventas/` | No existe formalmente | MEDIA |
| 9 | **Recepción/Almacenamiento MP** | `02_.../03_Recepcion_Almacenamiento/` | No existe procedimiento formal | MEDIA |
| 10 | **Laboratorio registrado ICA** | `04_.../01_Registro_Laboratorio/` | Tiene contrato pero falta resolución lab | MEDIA |

---

## 5. LIMPIEZA INMEDIATA (Archivos a Eliminar)

| Tipo | Cantidad | Ubicación | Descripción |
|------|----------|-------------|-------------|
| Archivos temporales `~$*` | ~4 | `05 Laboratorio/`, `09 Fichas Tecnicas/FICHAS_TECNICAS_V2/` | Lock files de Word/Excel |
| Archivos `.tmp` | 1 | `09 Fichas Tecnicas/` | `~WRL3668.tmp` |
| Archivos `.lnk` | 1 | `99 Revision/202.5_certificados/` | Acceso directo Windows |
| Archivos no relacionados | 3 | Varias ubicaciones | Video WhatsApp, paper académico, `.shp` (GIS) |
| ZIPs de backup redundantes | ~10 | `99 Revision/203.8_sgc-ica/` | Backup de carpetas ya extraídas |
| Carpeta duplicada completa | 35 files | `09 Fichas Tecnicas/203.15_fichas-tecnicas_N/Nueva carpeta/FICHA TECNICA ZUELOCA/` | Copia casi idéntica de `Nueva carpeta/` |
| Copias explícitas | ~5 | `09 Fichas Tecnicas/` | `FT MFE 13-36-10 - copia.docx`, etc. |

**Total estimado para limpieza: ~61 archivos**

---

## 6. PLAN DE EJECUCIÓN POR FASES

### Fase 1: Limpieza (Archivos a eliminar: ~61)

| Acción | Detalle | Archivos afectados |
|--------|---------|-------------------|
| 1.1 Eliminar temporales | `~$VERIFICADOR_FM2.xlsm`, `~$VERIFICADOR_V1.xlsm`, `~$T BASE.docx`, `~WRL3668.tmp` | 4 |
| 1.2 Eliminar archivos basura | Video WhatsApp, paper académico, shapefile GIS | 3 |
| 1.3 Eliminar accesos directos | Archivos `.lnk` | 1 |
| 1.4 Eliminar ZIPs redundantes | 10 ZIP en `99 Revision/203.8_sgc-ica/` | 10 |
| 1.5 Eliminar carpeta duplicada ZUELOCA | `FICHA TECNICA ZUELOCA/` completa | 35 |
| 1.6 Eliminar copias explícitas | `* - copia.*`, versiones duplicadas obvias | ~8 |

**Entregable:** Reporte de archivos eliminados

---

### Fase 2: Crear estructura (Nueva ubicación: `/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/`)

| Acción | Carpetas a crear |
|--------|-----------------|
| 2.1 Crear estructura vacía | 11 módulos principales + subcarpetas según árbol |

**Entregable:** Árbol de carpetas vacío listo para migración

---

### Fase 3: Migrar 01_Direccion_Tecnica_Legal

| Origen | Destino | Archivos |
|--------|---------|----------|
| `01 Documentacion Legal/Cámara de Comercio CALFERQUIM SAS.pdf` | `03_Representacion_Legal/` | 1 |
| `01 Documentacion Legal/RUT CALFERQUIM SAS.pdf` | `03_Representacion_Legal/` | 1 |
| `01 Documentacion Legal/Cédula Representante Legal CALFERQUIM SAS.pdf` | `03_Representacion_Legal/` | 1 |
| `01 Documentacion Legal/Res ICA 107688 2021.pdf` | `01_Registro_Empresa_ICA/` | 1 |
| `01 Documentacion Legal/Res ICA 5783 2024.pdf` | `01_Registro_Empresa_ICA/` | 1 |
| `01 Documentacion Legal/Contrato Laboratorio Dr Calderon.pdf` | `04_Registro_Laboratorio/` | 1 (revisar si es asesor o lab) |
| `10 Tramites ICA/` | `00_Inbox_Pendientes/` | Trámites pendientes ICA |

**Total:** ~7 archivos

---

### Fase 4: Migrar 02_Gestion_Proveedores_Insumos

| Origen | Destino | Archivos |
|--------|---------|----------|
| `07 Hojas de Seguridad/` → clasificar MP | `02_Hojas_Seguridad_MP/` | 59 HS de materias primas |
| `09 Fichas Tecnicas/203.15_fichas-tecnicas_N/` (FT materias primas) | `04_Fichas_Tecnicas_MP/` | ~15 FT |
| `99 Revision/203.10_fichas_tecnicas_mp/` | `04_Fichas_Tecnicas_MP/` | ~130 FT |
| `99 Revision/203.8_sgc-ica/1) SISTEMA DE CALIDAD/1. Compras/` | `01_Seleccion_Evaluacion/` | DC-SI26, RC-SI17, RC-SI35, RC-SI36, RC-SI47 |

**Total:** ~214 archivos

---

### Fase 5: Migrar 03_Produccion_Manufactura

| Origen | Destino | Archivos |
|--------|---------|----------|
| `03 Operacion/` | `02_Procedimientos_POE/` | DC-SI04, DC-SI05, DC-SI14, DC-SI22 |
| `03 Operacion/6- PLANO PLANTA PRODUCCION.pdf` | `05_Mantenimiento_Equipos/` | 1 |
| `99 Revision/203.7_orden_produccion/` | `01_Ordenes_Produccion/` | ~80 OPs |
| `99 Revision/203.7_orden_produccion/` (fórmulas, verificadores) | `01_Ordenes_Produccion/` (herramientas) | ~6 archivos Excel |
| `99 Revision/203.8_sgc-ica/3. Operaciones/` | `02_Procedimientos_POE/` | DC-SI04, DC-SI05, DC-SI10, DC-SI14, RC-SI01, RC-SI44, RC-SI51 |
| `08 Registros ICA/` (balances masas por producto) | `03_Balance_Masas/` | ~22 hojas Excel |

**Total:** ~90 archivos

---

### Fase 6: Migrar 04_Laboratorio_Control_Calidad

| Origen | Destino | Archivos |
|--------|---------|----------|
| `05 Laboratorio/` | `02_Plan_Muestreo/` | DC-SI34, procedimiento verificación, VERIFICADOR*.xlsm, FORMULADOR.xlsm |
| `11 Laboratorios Externos/` | `01_Registro_Laboratorio/` | Contratos Dr Calderon, Agrilab, Campolab |
| `12 Resultados Externos/` | `03_Resultados_Analisis/` | ~70 PDFs |
| `99 Revision/202.5_certificados/` | `03_Trazabilidad_Ventas/` (certificados calidad) o `05_Verificacion_Equipos/` (calibración) | ~290 certificados |

**Total:** ~85 archivos

---

### Fase 7: Migrar 05_Trazabilidad_Liberacion

| Origen | Destino | Archivos |
|--------|---------|----------|
| `04 Calidad/DC-SI10 Liberación de Lotes al Mercado.pdf` | `02_Liberacion_Lotes/` | 1 |
| `04 Calidad/DC-SI12 Asignación de Lotes...pdf` | `01_Codificacion_Lotes/` | 1 |
| `despachos/` | `03_Trazabilidad_Ventas/` | Certificados, FT, HS |

**Total:** ~20 archivos

---

### Fase 8: Migrar 06_Gestion_Residuos_Ambiental

| Origen | Destino | Archivos |
|--------|---------|----------|
| `02 Gestion Ambiental/` | `06_Gestion_Residuos_Ambiental/` | ~5 archivos |

**Total:** ~5 archivos

---

### Fase 9: Migrar 07_Postventa_Servicio_Cliente

| Origen | Destino | Archivos |
|--------|---------|----------|
| `04 Calidad/DC-SI07 Quejas y Reclamos.pdf` | `01_PQRS/` | 1 |
| `04 Calidad/DC-SI11 Servicio al Cliente.pdf` | `01_PQRS/` | 1 |
| `04 Calidad/DC-SI13 Politica Servicio al Cliente.pdf` | `01_PQRS/` | 1 |
| `04 Calidad/DC-SI15 Politica de Quejas y Reclamos.pdf` | `01_PQRS/` | 1 |
| `99 Revision/203.8_sgc-ica/2. Gestion Calidad/3. Registros/1) Respuesta a Reclamaciones/` | `01_PQRS/` | ~7 registros |
| `99 Revision/203.8_sgc-ica/2. Gestion Calidad/3. Registros/3) Reportes de Problema de Calidad/` | `01_PQRS/` | ~11 reportes |

**Total:** ~20 archivos

---

### Fase 10: Crear 08_Dossier_Productos_Registrados (CRÍTICA)

Para cada uno de los 22 productos:

| Acción | Detalle |
|--------|----------|
| 10.1 Crear carpeta producto | `08_Dossier_Productos_Registrados/[NOMBRE_PRODUCTO]/` |
| 10.2 Migrar Registro Venta | Desde `08 Registros ICA/[producto]/` y `99 Revision/IVA/` → `01_Registro_Venta/` |
| 10.3 Migrar Ficha Técnica | Desde `09 Fichas Tecnicas/FICHAS_TECNICAS_V2/` (V2 más reciente) → `02_Ficha_Tecnica/` |
| 10.4 Migrar Etiqueta | Desde `08 Registros ICA/[producto]/` y `despachos/` → `03_Etiqueta_Aprobada/` |
| 10.5 Migrar Hoja Seguridad | Desde `07 Hojas de Seguridad/` → `04_Hoja_Seguridad/` |
| 10.6 Migrar Soportes Ensayo | Desde `08 Registros ICA/[producto]/` → `05_Soportes_Ensayo/` |

**Total estimado:** ~450 archivos (22 productos × ~20 archivos promedio)

---

### Fase 11: Migrar 09_SST

| Origen | Destino | Archivos |
|--------|---------|----------|
| `06 SST/DC-SI03 Politica y Objetivos V.0.pdf` | `01_Politicas/` | 1 |
| `06 SST/PC-SI01 PROCESO DE MOLIDO.pdf` | `02_Procedimientos_Seguridad/` | 1 |
| `06 SST/PC-SI03 PROCESO DE MEZCLA.pdf` | `02_Procedimientos_Seguridad/` | 1 |
| `06 SST/PC-SI04 PROCESO DE GRANULACIÓN.pdf` | `02_Procedimientos_Seguridad/` | 1 |
| `06 SST/PC-SI05 PROCESO DE SECADO.pdf` | `02_Procedimientos_Seguridad/` | 1 |
| `06 SST/PC-SI06 PROCESO DE SEPARACIÓN DE FINOS.pdf` | `02_Procedimientos_Seguridad/` | 1 |
| `06 SST/PC-SI09 PROCESO DE ENFRIAMIENTO.pdf` | `02_Procedimientos_Seguridad/` | 1 |
| `06 SST/PC-SI10 PROCEDIMIENTO SEGURO DE DESATASCO...pdf` | `02_Procedimientos_Seguridad/` | 1 |
| `06 SST/DC-SI16 Entrega y Reemplazo de EPP.pdf` | `03_EPP_Bioseguridad/` | 1 |
| `06 SST/DC-SI22 Procedimiento Bloqueo y Etiquetado.pdf` | `03_EPP_Bioseguridad/` | 1 |
| `06 SST/DC-SI30 Protocolo de Bioseguridad.pdf` | `03_EPP_Bioseguridad/` | 1 |
| `06 SST/DC-SI37 Procedimiento para el Almacenamiento Seguro...pdf` | `03_EPP_Bioseguridad/` | 1 |

**Total:** 13 archivos

---

### Fase 12: Migrar 10_Base_Datos_Tecnica

| Origen | Destino | Archivos |
|--------|---------|----------|
| `13 Base Datos/` | `10_Base_Datos_Tecnica/` | Completo |

---

### Fase 13: Crear índice HS central

| Acción | Detalle |
|--------|----------|
| 13.1 Extraer todas las HS de productos terminados | Desde `07 Hojas de Seguridad/` (93 archivos clasificados como PT) |
| 13.2 Crear índice | `08_Dossier_Productos_Registrados/_Indice_HS/Indice_Hojas_Seguridad.xlsx` |
| 13.3 Vincular | Cada HS apunta a su ubicación en el dossier del producto |

---

### Fase 14: Archivar versiones anteriores

| Origen | Destino | Archivos |
|--------|---------|----------|
| `09 Fichas Tecnicas/203.15_fichas-tecnicas_N/` (V1 y "ya") | `_Archivo/FT_Versiones_Anteriores/` | ~53 archivos |
| `09 Fichas Tecnicas/203.15_fichas-tecnicas_N/Nueva carpeta/` (duplicada ZUELOCA除外) | `_Archivo/FT_Versiones_Anteriores/` | ~40 archivos |
| `08 Registros ICA/` (carpetas antiguas) | `_Archivo/Registros_ICA_Legacy/` | Versiones anteriores |
| `99 Revision/203.8_sgc-ica/` (SGC legacy completo) | `_Archivo/SGC_Legacy/` | Todo el contenido ~800 archivos |
| `99 Revision/203.8_sgc-ica/4. Gestion de Recursos Humanos/` | `_Archivo/SGC_Legacy/RRHH/` | ~30 archivos (DC-SI19, MF-SI01-29, formatos) |

**Total estimado:** ~500 archivos archivados

---

## 7. VERIFICACIÓN POST-MIGRACIÓN

### 7.1. Checklist por módulo

| Módulo | Verificación | Estado esperado |
|---------|-------------|------------------|
| `01_Direccion_Tecnica_Legal` | 5 archivos activos + 1 carpeta vacía (FALTA) | ✅ |
| `02_Gestion_Proveedores_Insumos` | 214 archivos activos + 1 carpeta vacía (FALTA) | ✅ |
| `03_Produccion_Manufactura` | 90 archivos activos + 1 carpeta parcial | ✅ |
| `04_Laboratorio_Control_Calidad` | 85 archivos activos + 1 carpeta vacía (FALTA) | ✅ |
| `05_Trazabilidad_Liberacion` | 20 archivos activos + 1 carpeta vacía (FALTA) | ✅ |
| `06_Gestion_Residuos_Ambiental` | 5 archivos activos + 2 carpetas vacías (FALTA) | ✅ |
| `07_Postventa_Servicio_Cliente` | 20 archivos activos + 1 carpeta vacía (FALTA) | ✅ |
| `08_Dossier_Productos_Registrados` | 22 carpetas × 5 subcarpetas = 110 ubicaciones | ✅ |
| `09_SST` | 13 archivos activos | ✅ |
| `10_Base_Datos_Tecnica` | Completo | ✅ |
| `_Archivo` | ~500 archivos versiones anteriores | ✅ |

### 7.2. Documentos faltantes por crear

| # | Documento | Carpeta | Prioridad |
|---|------------|---------|-----------|
| 1 | Contrato Asesor Técnico | `01_.../02_Asesor_Tecnico/` | ALTA |
| 2 | Procedimiento Balance de Masas | `03_.../03_Balance_Masas/` | ALTA |
| 3 | Procedimiento Contramuestras | `04_.../04_Contramuestras/` | ALTA |
| 4 | Procedimiento Recall | `07_.../02_Retiro_Producto/` | ALTA |
| 5 | Procedimiento Disposición Barreduras | `06_.../01_Disposicion_Barreduras/` | ALTA |

---

## 8. RIESGOS Y MITIGACIÓN

| Riesgo | Impacto | Mitigación |
|----------|-----------|-------------|
| Pérdida de datos al eliminar duplicados | Alta | Verificar contenido antes de eliminar; mantener en `_Archivo/` por 6 meses |
| Error en clasificación HS MP vs PT | Media | Revisar manualmente las 59 HS de MP; validar contra lista proveedores |
| Dossiers incompletos por productos sin FT V2 | Media | Usar V1 más reciente; marcar para actualización futura |
| Documentos faltantes para ICA | Alta | Priorizar creación de 5 documentos críticos |
| Tiempo excesivo en Fase 10 (dossiers) | Media | Automatizar donde posible; procesar por lote de productos |

---

## 9. ESTIMACIÓN DE TIEMPO

| Fase | Descripción | Tiempo estimado |
|-------|-------------|-----------------|
| 1 | Limpieza de archivos basura | 30 min |
| 2 | Crear estructura vacía | 15 min |
| 3-9 | Migración módulos 1-7 | 2-3 horas |
| 10 | Crear dossiers por producto (22 × 6 subcarpetas) | 3-4 horas |
| 11 | Migrar SST | 30 min |
| 12-14 | Migrar Base Datos + archivar | 1-2 horas |
| Verificación | Validación final | 30 min |

**Total estimado:** 8-11 horas (puede dividirse en 2-3 sesiones)

---

## 10. DOCUMENTACIÓN Y ENTREGABLES

### 10.1. Al finalizar migración

1. **Reporte de migración** - Archivos movidos, eliminados, archivados
2. **Matriz de mapeo** - Archivo origen → destino (Excel para trazabilidad)
3. **Índice de productos** - Lista de 22 productos con ubicación de dossier
4. **Índice HS** - Hojas de seguridad centralizadas
5. **Lista de pendientes** - 5 documentos por crear + 10 mejoras

---

## 11. DECISIONES TOMADAS (CONFIRMADAS POR USUARIO)

| Decisión | Valor |
|----------|-------|
| Estructura base | `qms_new.md` (alineada a pv0) |
| SST | Mantener como carpeta separada `09_SST/` |
| HS productos terminados | Por producto + índice central en `08_Dossier/_Indice_HS/` |
| Convención de nombres | Código primero: `[CODIGO]-[Nombre]_V[version]` |
| Archivo histórico | Crear `_Archivo/` con versiones anteriores |
| RRHH | **NO** crear módulo activo → archivar en `_Archivo/SGC_Legacy/RRHH/` |
| Base de datos técnica | Mantener como `10_Base_Datos_Tecnica/` |

---

## 12. ANEXO: CLASIFICACIÓN HOJAS DE SEGURIDAD

### 12.1. Productos Terminados (PT) - 93 archivos

Van a `08_Dossier_Productos_Registrados/[PRODUCTO]/04_Hoja_Seguridad/`:

- CALFERCORRECTIVO, CALFER FLORACIÓN, CALFER LLENADO, CALFER MENORES
- 2-AVANCE, 1-CRECIMIENTO, 3-PRODUCTOR, TODERO
- SOLURAIFOS, SULFAK 50
- BORO CALFERQUIM, CALFERCOBRE, CALFERMAGNESIO, CALFERZINC-P
- FERTICORRECTIVO, FERTIMENORES
- K2K, MAGNE-3, MICRON-C, MICRON CS
- NUCLEO 4, NUCLEO CAMASI, NUCLEO FOSFORO-1, NUCLEO MAGNE3
- NUCLEO MAGNESIO-SILICIO, NUCLEO MAGNESIO-S, NUCLEO N
- RAIFOS 20, R-VITAL 17, SILIMAGRAN
- SOLURaiFOS, SUELO-Ca, SUELO CA
- SULFA K 50, SULFATO DE POTASIO, SULFATO DE ZINC AL 35%
- SulfatoZinc22, YESO EN POLVO, YESO GRANULADO, ZUELOCa

### 12.2. Materias Primas (MP) - 59 archivos

Van a `02_Gestion_Proveedores_Insumos/02_Hojas_Seguridad_MP/`:

- Proveedores: CIAMSA, CONAGRAN, JADESI, YARA, PQP, HELVECIA, INGREDION, SUCRO, Ingeol, Romeral, ASUAGRO, APDR, MAXIMO, Santa Rosa, TIERRA SA, CALES RIO CLARO
- Productos: DAP, MAP, KCL, Urea, Acido Borico, Cloruro de Potasio, Silicato de Sodio/Magnesio, Sulfato de Amonio/Calcio/Cobre/Cobalto/Ferroso/Magnesio/Manganeso/Potasio/Zinc, Ulexita, Kieserita

---

## 13. ANEXO: LISTADO COMPLETO DE PRODUCTOS PARA DOSSIER

| # | Nombre | Registro ICA | FT V2 | HS | Notas |
|---|--------|:---:|:---:|:---:|-------|
| 1 | 1-CRECIMIENTO | Si | Si | Si |
| 2 | 2-AVANCE | Si | Si | Si |
| 3 | 3-PRODUCTOR | Si | Si | Si |
| 4 | 10-20-20 | Si | No V1 | Si |
| 5 | 10-30-10 | Si | No V1 | No identificada |
| 6 | 13-5-27 | Si | No V1 | Si |
| 7 | 15-15-15 | Si | Si | Si |
| 8 | 17-6-18-2 | Si | Si | Si |
| 9 | 18-18-18 | Si | Si | Si |
| 10 | 25-4-24 | Si | Si | Si |
| 11 | AFOSK | Si | Si | Si |
| 12 | AZUFREA MALLA 100 | Si | Si | Si |
| 13 | B-ZINC 15 | Si | No V1 | No identificada |
| 14 | BIOCalfer | Si | No V1 | Si |
| 15 | BORO GRANULADO | Si | Si | Si |
| 16 | CALCOBRE | Si | Si | Si |
| 17 | CALCORRECTIVO | Si | Si | Si |
| 18 | CAL DESARROLLO | Si | No V1 | Si |
| 19 | CALFER FLORACION | Si | No V1 | Si |
| 20 | CALFER LLENADO | Si | Si | Si |
| 21 | CALFER MAGNESIO | Si | Si | Si |
| 22 | CALFER MENORES | Si | Si | Si |
| 23 | CALFERZINC-P | Si | Si | Si |
| 24 | FERTIMENORES | Si | Si | Si |
| 25 | FERTICORRECTIVO | Si | Si | Si |
| 26 | FOLLAJE | Si | Si | Si |
| 27 | FOSFORITA NEIVA | Si | Si | Si |
| 28 | GANADERO | Si | Si | Si |
| 29 | K2K | Si | Si | Si |
| 30 | KIESERITA P | Si | Si | Si |
| 31 | MAGNE-3 | Si | Si | Si |
| 32 | MAGNE 3 | Si | Si | Si |
| 33 | MICRON-C | Si | Si | Si |
| 34 | MICRON CS | Si | Si | Si |
| 35 | N4 | Si | Si | Si |
| 36 | NUCLEO 4 | Si | Si | Si |
| 37 | NUCLEO CAMASI | Si | Si | Si |
| 38 | NUCLEO CAMASI YARA | Si | Si | Si |
| 39 | NUCLEO FOSFORO-1 | Si | Si | Si |
| 40 | NUCLEO MAGNE3 | Si | Si | Si |
| 41 | NUCLEO MAGNESIO-AZUFRE | Si | Si | Si |
| 42 | NUCLEO MAGNESIO-SILICIO | Si | Si | Si |
| 43 | NUCLEO MAGNESIO-S | Si | Si | Si |
| 44 | NUCLEO N | Si | Si | Si |
| 45 | PRODUCCION 17 | Si | Si | No identificada |
| 46 | RAIFOS 20 | Si | Si | Si |
| 47 | R-VITAL 17 | Si | Si | Si |
| 48 | SILICATO DE MAGNESIO | Si | Si | Si |
| 49 | SILIMAGRAM | Si | Si | Si |
| 50 | SOLURaiFOS | Si | Si | Si |
| 51 | SUELO-Ca | Si | Si | Si |
| 52 | SULFA K 50 | Si | Si | Si |
| 53 | SULFATO DE POTASIO | Si | Si | Si |
| 54 | SULFATO DE ZINC AL 35% | Si | Si | Si |
| 55 | SULFATO ZINC 22 | Si | Si | Si |
| 56 | TODERO | Si | No V1 | Si |
| 57 | YESO EN POLVO | Si | Si | Si |
| 58 | YESO GRANULADO | Si | Si | Si |
| 59 | ZUELOCa | Si | Si | Si |

---

**FIN DEL PLAN DE MIGRACIÓN**
