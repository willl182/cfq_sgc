# Plan de Migración SGC CALFERQUIM - Opción B
## Espejo del Checklist ICA (Anexo I-B)

**Versión**: 2.0 (Opción B)  
**Fecha**: 2026-02-10  
**Basado en**: Estructura definida en `estructura.md`

---

## Cambios vs Versión 1.0 (Opción A)

| Aspecto | Opción A (Anterior) | Opción B (Esta versión) |
|---|---|---|
| **Filosofía** | Por proceso de negocio | Espejo del checklist ICA |
| **Estructura** | 11 carpetas de primer nivel | 8 carpetas de primer nivel + puntos N/A |
| **Mapeo ICA** | Indirecto (requiere tabla) | Directo 1:1 |
| **Ventaja auditoría** | Media | **Alta** - inspector ve mismo orden |
| **Puntos 3.XX** | Dispersos en 4 carpetas | Consolidados en `03_Procedimientos/` |
| **Hojas de Seguridad MP** | `02_.../02_Hojas_Seguridad_MP/` | `01_.../1.2_Materias_Primas_Listado/` |
| **Archivo físico** | 13 AZ adaptados | 13 AZ idénticos al digital |

---

## Resumen Ejecutivo

| Métrica | Valor Actual | Valor Final | Diferencia |
|---|---|---|---|
| Total archivos | ~2,043 | ~800 útiles | -1,243 eliminados/archivados |
| Carpetas 1er nivel | 14 | 8 + 1 Archivo | Simplificación |
| Productos con dossier | 0 estructurado | 59 con 5 subcarpetas cada uno | Nuevo módulo crítico |
| Brechas documentales | 10 | 5 por crear + 2 N/A justificados | 75% cobertura |
| Duplicación | Extrema (5-10 copias) | 0 (una versión activa) | Limpieza completa |
| Puntos N/A marcados | 0 | 2 (3.4 pirolisis, 3.7 reacciones) | Justificación documentada |

---

## Inventario Actual (Fuente: `202_CALFERQUIM/`)

### Archivos por Carpeta Principal

| Carpeta | Archivos | Observaciones |
|---|---|---|
| `07 Hojas de Seguridad/` | 152 (93 PT + 59 MP) | Mezclados sin clasificar |
| `08 Registros ICA/` | 544 (59 productos) | Duplicados masivos |
| `09 Fichas Tecnicas/` | 280 | Extrema duplicación: cada producto 5-10 copias |
| `99 Revision/` | 800 | SGC legacy completo, ZIPs respaldo |
| `06 SST/` | 13 | Procedimientos seguros |
| `04 Calidad/` | 9 | Documentos controlados |
| `03 Operacion/` | 8 | Procedimientos operativos |
| `05 Laboratorio/` | 10 | Herramientas VERIFICADOR, FORMULADOR |
| `12 Resultados Externos/` | ~70 PDFs | Certificados de análisis |
| Otros (`00`, `01`, `02`, `10-13`, `despachos`) | ~50 | Variados |

**Total: ~2,043 archivos estimados**

---

## 59 Productos para Dossier

| # | Producto | Registro ICA | FT | HS |
|---|---|:---:|:---:|:---:|
| 1 | 1-CRECIMIENTO | ✅ | ✅ | ✅ |
| 2 | 2-AVANCE | ✅ | ✅ | ✅ |
| 3 | 3-PRODUCTOR | ✅ | ✅ | ✅ |
| 4 | 10-20-20 | ✅ | V1 | ✅ |
| 5 | 10-30-10 | ✅ | V1 | ❓ |
| 6 | 13-5-27 | ✅ | V1 | ✅ |
| 7 | 15-15-15 | ✅ | ✅ | ✅ |
| 8 | 17-6-18-2 | ✅ | ✅ | ✅ |
| 9 | 18-18-18 | ✅ | ✅ | ✅ |
| 10 | 25-4-24 | ✅ | ✅ | ✅ |
| 11 | AFOSK | ✅ | ✅ | ✅ |
| 12 | AZUFREA MALLA 100 | ✅ | ✅ | ✅ |
| 13 | B-ZINC 15 | ✅ | V1 | ❓ |
| 14 | BIOCalfer | ✅ | V1 | ✅ |
| 15 | BORO GRANULADO | ✅ | ✅ | ✅ |
| 16 | CALCOBRE | ✅ | ✅ | ✅ |
| 17 | CALCORRECTIVO | ✅ | ✅ | ✅ |
| 18 | CAL DESARROLLO | ✅ | V1 | ✅ |
| 19 | CALFER FLORACION | ✅ | V1 | ✅ |
| 20 | CALFER LLENADO | ✅ | ✅ | ✅ |
| 21 | CALFER MAGNESIO | ✅ | ✅ | ✅ |
| 22 | CALFER MENORES | ✅ | ✅ | ✅ |
| 23 | CALFERZINC-P | ✅ | ✅ | ✅ |
| 24 | FERTIMENORES | ✅ | ✅ | ✅ |
| 25 | FERTICORRECTIVO | ✅ | ✅ | ✅ |
| 26 | FOLLAJE | ✅ | ✅ | ✅ |
| 27 | FOSFORITA NEIVA | ✅ | ✅ | ✅ |
| 28 | GANADERO | ✅ | ✅ | ✅ |
| 29 | K2K | ✅ | ✅ | ✅ |
| 30 | KIESERITA P | ✅ | ✅ | ✅ |
| 31 | MAGNE-3 | ✅ | ✅ | ✅ |
| 32 | MAGNE 3 | ✅ | ✅ | ✅ |
| 33 | MICRON-C | ✅ | ✅ | ✅ |
| 34 | MICRON CS | ✅ | ✅ | ✅ |
| 35 | N4 | ✅ | ✅ | ✅ |
| 36 | NUCLEO 4 | ✅ | ✅ | ✅ |
| 37 | NUCLEO CAMASI | ✅ | ✅ | ✅ |
| 38 | NUCLEO CAMASI YARA | ✅ | ✅ | ✅ |
| 39 | NUCLEO FOSFORO-1 | ✅ | ✅ | ✅ |
| 40 | NUCLEO MAGNE3 | ✅ | ✅ | ✅ |
| 41 | NUCLEO MAGNESIO-AZUFRE | ✅ | ✅ | ✅ |
| 42 | NUCLEO MAGNESIO-SILICIO | ✅ | ✅ | ✅ |
| 43 | NUCLEO MAGNESIO-S | ✅ | ✅ | ✅ |
| 44 | NUCLEO N | ✅ | ✅ | ✅ |
| 45 | PRODUCCION 17 | ✅ | ✅ | ❓ |
| 46 | RAIFOS 20 | ✅ | ✅ | ✅ |
| 47 | R-VITAL 17 | ✅ | ✅ | ✅ |
| 48 | SILICATO DE MAGNESIO | ✅ | ✅ | ✅ |
| 49 | SILIMAGRAM | ✅ | ✅ | ✅ |
| 50 | SOLURaiFOS | ✅ | ✅ | ✅ |
| 51 | SUELO-Ca | ✅ | ✅ | ✅ |
| 52 | SULFA K 50 | ✅ | ✅ | ✅ |
| 53 | SULFATO DE POTASIO | ✅ | ✅ | ✅ |
| 54 | SULFATO DE ZINC AL 35% | ✅ | ✅ | ✅ |
| 55 | SULFATO ZINC 22 | ✅ | ✅ | ✅ |
| 56 | TODERO | ✅ | V1 | ✅ |
| 57 | YESO EN POLVO | ✅ | ✅ | ✅ |
| 58 | YESO GRANULADO | ✅ | ✅ | ✅ |
| 59 | ZUELOCa | ✅ | ✅ | ✅ |

**Leyenda:** ✅ Disponible | V1 Solo versión 1 disponible | ❓ No identificado

---

## Plan de Ejecución por Fases

### Fase 1: Limpieza Inicial (~61 archivos)

| Acción | Detalle | Archivos |
|---|---|---|
| 1.1 Eliminar temporales | `~$VERIFICADOR_FM2.xlsm`, `~$T BASE.docx`, `~WRL3668.tmp` | ~4 |
| 1.2 Eliminar basura | Video WhatsApp, paper académico, shapefile GIS | ~3 |
| 1.3 Eliminar accesos directos | Archivos `.lnk` | ~1 |
| 1.4 Eliminar ZIPs redundantes | 10 ZIP en `99 Revision/203.8_sgc-ica/` | ~10 |
| 1.5 Eliminar carpeta duplicada ZUELOCA | `FICHA TECNICA ZUELOCA/` completa | ~35 |
| 1.6 Eliminar copias explícitas | `* - copia.*`, versiones obvias duplicadas | ~8 |

**Total**: ~61 archivos eliminados

**Entregable**: `01_reporte_limpieza.md`

---

### Fase 2: Crear Estructura Vacía

Crear todas las carpetas de la estructura Opción B en `/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/`:

```bash
# Estructura principal
mkdir -p SGC_CALFERQUIM/{00_Inbox,01_Requisitos_Generales,02_Control_Calidad,03_Procedimientos,04_Instalaciones,05_Dossier_Productos,06_Documentacion_Legal,07_SST,08_Base_Datos_Tecnica,_Archivo}

# Subcarpetas 01
mkdir -p SGC_CALFERQUIM/01_Requisitos_Generales/{1.1_Croquis_Instalaciones,1.2_Materias_Primas_Listado,1.3_Contratos_Produccion,1.4_Diagramas_Flujo,1.5_Asesor_Tecnico}

# Subcarpetas 02
mkdir -p SGC_CALFERQUIM/02_Control_Calidad/{2.1_Laboratorio_Registrado,2.1.1_Certificados_Analisis}
mkdir -p SGC_CALFERQUIM/02_Control_Calidad/2.1_Laboratorio_Registrado/Contratos_Laboratorios_Externos

# Subcarpetas 03 (18 puntos del Anexo I-B)
mkdir -p SGC_CALFERQUIM/03_Procedimientos/{3.01_Recepcion_Almacenamiento_MP,3.03_Molienda_Primaria,3.04_NA_Pirolisis,3.05_Balance_Materias_Primas,3.06_Mezcla_Homogenizacion,3.07_NA_Reacciones_Quimicas,3.08_Presentacion_Fisica_Granulacion,3.09_Molienda_Secundaria,3.10_Envase,3.11_Codificacion_Lotes,3.12_Liberacion_Lotes,3.13_Muestreo_Control_Calidad,3.14_Contramuestras,3.15_Higiene_Seguridad_Industrial,3.16_Servicio_Cliente_PQR,3.17_Almacenamiento_PT,3.18_Disposicion_Residuos,3.19_Formulaciones_Terceros,3.20_Entrega_MP_Importacion_Terceros}

# Crear subcarpetas POE/02_Formatos/Registros en cada punto 3.XX
for dir in SGC_CALFERQUIM/03_Procedimientos/3.*[^A]/; do
  mkdir -p "$dir"/{POE,Formatos,Registros}
done

# Subcarpetas 04
mkdir -p SGC_CALFERQUIM/04_Instalaciones/{4.1_Senalizacion_Demarcacion,4.2_Equipos_Herramientas,4.3_Avisos_Seguridad,4.11_Manejo_Residuos_PNC,4.12_Archivo_Documental}

# Subcarpetas 06
mkdir -p SGC_CALFERQUIM/06_Documentacion_Legal/{Camara_Comercio,RUT,Cedula_RL,Resoluciones_Empresa_ICA}

# Subcarpetas 07
mkdir -p SGC_CALFERQUIM/07_SST/{Politicas,Procedimientos_Seguros,EPP_Bioseguridad}

# Subcarpetas 08
mkdir -p SGC_CALFERQUIM/08_Base_Datos_Tecnica/{Herramientas,Referencia}

# Subcarpetas _Archivo
mkdir -p SGC_CALFERQUIM/_Archivo/{Registros_2024,Registros_2025,SGC_Legacy/{RRHH,Compras,ZIP_Backups},FT_Versiones_Anteriores,HS_Versiones_Anteriores,Registros_ICA_Legacy}
```

**Entregable**: Árbol de carpetas creado y verificado

---

### Fase 3: Migrar 01_Requisitos_Generales

| Origen | Destino | Archivos |
|---|---|---|
| `01 Documentacion Legal/Cámara de Comercio CALFERQUIM SAS.pdf` | `06_Documentacion_Legal/Camara_Comercio/` | 1 |
| `01 Documentacion Legal/RUT CALFERQUIM SAS.pdf` | `06_Documentacion_Legal/RUT/` | 1 |
| `01 Documentacion Legal/Cédula Representante Legal.pdf` | `06_Documentacion_Legal/Cedula_RL/` | 1 |
| `01 Documentacion Legal/Res ICA 107688 2021.pdf` | `06_Documentacion_Legal/Resoluciones_Empresa_ICA/` | 1 |
| `01 Documentacion Legal/Res ICA 5783 2024.pdf` | `06_Documentacion_Legal/Resoluciones_Empresa_ICA/` | 1 |
| `03 Operacion/6- PLANO PLANTA PRODUCCION.pdf` | `01_.../1.1_Croquis_Instalaciones/` | 1 |
| `99 Revision/203.10_fichas_tecnicas_mp/` | `01_.../1.2_Materias_Primas_Listado/` (listado) | ~130 |
| `07 Hojas de Seguridad/` (59 HS MP) | `01_.../1.2_Materias_Primas_Listado/` | 59 |

**Notas**:
- Crear `Listado_Materias_Primas.xlsx` con todas las MP utilizadas
- HS MP: clasificar las 59 de proveedores (CIAMSA, CONAGRAN, YARA, etc.)
- `1.5_Asesor_Tecnico/` queda vacía pendiente contrato

**Total**: ~195 archivos

---

### Fase 4: Migrar 02_Control_Calidad

| Origen | Destino | Archivos |
|---|---|---|
| `11 Laboratorios Externos/Contrato Laboratorio Dr Calderon.pdf` | `02_.../2.1_Laboratorio_Registrado/Contratos_Laboratorios_Externos/` | 1 |
| `11 Laboratorios Externos/Contrato Agrilab.pdf` | `02_.../2.1_Laboratorio_Registrado/Contratos_Laboratorios_Externos/` | 1 |
| `11 Laboratorios Externos/Contrato Campolab.pdf` | `02_.../2.1_Laboratorio_Registrado/Contratos_Laboratorios_Externos/` | 1 |
| `12 Resultados Externos/` | `02_.../2.1.1_Certificados_Analisis/` | ~70 |

**Notas**:
- `2.1_Laboratorio_Registrado/` falta resolución ICA del laboratorio (pendiente)

**Total**: ~73 archivos

---

### Fase 5: Migrar 03_Procedimientos - Producción (3.01-3.10)

| Origen | Destino | Archivos |
|---|---|---|
| `99 Revision/203.8_sgc-ica/1) SISTEMA DE CALIDAD/1. Compras/DC-SI26 Compras y Gestión de Proveedores.pdf` | `03_.../3.01_Recepcion_Almacenamiento_MP/01_POE/` | 1 |
| `99 Revision/203.8_sgc-ica/1) SISTEMA DE CALIDAD/1. Compras/RC-SI17, RC-SI35, RC-SI36, RC-SI47` | `03_.../3.01_Recepcion_Almacenamiento_MP/02_Formatos/` | 4 |
| `06 SST/PC-SI01 PROCESO DE MOLIDO.pdf` | `03_.../3.03_Molienda_Primaria/01_POE/` | 1 |
| `03 Operacion/DC-SI04 Procedimiento de Mezclas.pdf` | `03_.../3.06_Mezcla_Homogenizacion/01_POE/` | 1 |
| `06 SST/PC-SI03 PROCESO DE MEZCLA.pdf` | `03_.../3.06_Mezcla_Homogenizacion/01_POE/` | 1 |
| `03 Operacion/DC-SI14 Procedimiento de Granulación.pdf` | `03_.../3.08_Presentacion_Fisica_Granulacion/01_POE/` | 1 |
| `06 SST/PC-SI04 PROCESO DE GRANULACIÓN.pdf` | `03_.../3.08_Presentacion_Fisica_Granulacion/01_POE/` | 1 |
| `06 SST/PC-SI06 PROCESO DE SEPARACIÓN DE FINOS.pdf` | `03_.../3.09_Molienda_Secundaria/01_POE/` | 1 |
| `99 Revision/203.7_orden_produccion/` (OPs) | `03_.../3.06_Mezcla_Homogenizacion/03_Registros/` | ~80 |

**Brechas a crear**:
- `3.05_Balance_Materias_Primas/01_POE/` - Procedimiento balance de masas
- `3.10_Envase/01_POE/` - Procedimiento envasado (si no existe)

**Total**: ~90 archivos

---

### Fase 6: Migrar 03_Procedimientos - Calidad (3.11-3.14)

| Origen | Destino | Archivos |
|---|---|---|
| `04 Calidad/DC-SI12 Asignación de Lotes, Muestreo y Control de Calidad.pdf` | `03_.../3.11_Codificacion_Lotes/01_POE/` y `03_.../3.13_Muestreo_Control_Calidad/01_POE/` | 1 (copia o shortcut) |
| `04 Calidad/DC-SI10 Liberación de Lotes al Mercado.pdf` | `03_.../3.12_Liberacion_Lotes/01_POE/` | 1 |
| `05 Laboratorio/DC-SI34 Ensayos Fisicoquímicos en Laboratorio.pdf` | `03_.../3.13_Muestreo_Control_Calidad/01_POE/` | 1 |

**Brechas a crear**:
- `3.14_Contramuestras/01_POE/` - Procedimiento contramuestras
- `3.12_Liberacion_Lotes/02_Formatos/` - Formato liberación cuarentena → aprobado

**Total**: ~5 archivos

---

### Fase 7: Migrar 03_Procedimientos - Soporte (3.15-3.20)

| Origen | Destino | Archivos |
|---|---|---|
| `06 SST/DC-SI30 Protocolo de Bioseguridad.pdf` | `03_.../3.15_Higiene_Seguridad_Industrial/01_POE/` | 1 |
| `06 SST/DC-SI37 Almacenamiento Seguro y Conteo Bultos.pdf` | `03_.../3.15_Higiene_Seguridad_Industrial/01_POE/` y `03_.../3.17_Almacenamiento_PT/01_POE/` | 1 |
| `04 Calidad/DC-SI07 Quejas y Reclamos.pdf` | `03_.../3.16_Servicio_Cliente_PQR/01_POE/` | 1 |
| `04 Calidad/DC-SI11 Servicio al Cliente.pdf` | `03_.../3.16_Servicio_Cliente_PQR/01_POE/` | 1 |
| `04 Calidad/DC-SI13 Política Servicio al Cliente.pdf` | `03_.../3.16_Servicio_Cliente_PQR/01_POE/` | 1 |
| `04 Calidad/DC-SI15 Política de Quejas y Reclamos.pdf` | `03_.../3.16_Servicio_Cliente_PQR/01_POE/` | 1 |
| `04 Calidad/RC-SI08 Formulario Control de Quejas y Reclamos.xlsx` | `03_.../3.16_Servicio_Cliente_PQR/02_Formatos/` | 1 |
| `99 Revision/203.8_sgc-ica/.../Respuesta a Reclamaciones/` | `03_.../3.16_Servicio_Cliente_PQR/03_Registros/` | ~7 |
| `99 Revision/203.8_sgc-ica/.../Reportes de Problema de Calidad/` | `03_.../3.16_Servicio_Cliente_PQR/03_Registros/` | ~11 |
| `despachos/RC-SI53 Traslado de Producto Terminado al Almacen.xlsx` | `03_.../3.17_Almacenamiento_PT/03_Registros/` | 1 |

**Brechas a crear**:
- `3.18_Disposicion_Residuos/01_POE/` - Procedimiento disposición barreduras
- `3.19_Formulaciones_Terceros/01_POE/` - Procedimiento formulaciones a terceros
- `3.20_Entrega_MP_Importacion_Terceros/01_POE/` - Procedimiento entrega MP importación

**Notas**:
- Revisar si existe `RC-SI53` en `despachos/` o `99 Revision/`

**Total**: ~25 archivos

---

### Fase 8: Migrar 04_Instalaciones

| Origen | Destino | Archivos |
|---|---|---|
| `06 SST/RC-SI55 Hoja de Vida y Mantenimientos de Maquinaria.xlsx` | `04_.../4.2_Equipos_Herramientas/` | 1 |
| `06 SST/` (fotos EPP, señalización si existen) | `04_.../4.1_Senalizacion_Demarcacion/` y `04_.../4.3_Avisos_Seguridad/` | Varias |

**Brechas**:
- Tomar fotos actuales de señalización y demarcación
- Tomar fotos de avisos de seguridad según HS en cada área
- Documentar manejo de residuos y PNC

**Total**: ~10 archivos

---

### Fase 9: Migrar 05_Dossier_Productos (CRÍTICA)

Para cada uno de los **59 productos**:

```
05_Dossier_Productos/[NOMBRE_PRODUCTO]/
├── 01_Registro_Venta/          ← Desde 08 Registros ICA/[producto]/
├── 02_Ficha_Tecnica/           ← Desde 09 FT/FICHAS_TECNICAS_V2/ (versión más reciente)
├── 03_Etiqueta_Aprobada/       ← Desde 08 Registros ICA/[producto]/ y despachos/
├── 04_Hoja_Seguridad/          ← Desde 07 Hojas de Seguridad/ (93 PT)
└── 05_Soportes_Ensayo/         ← Desde 08 Registros ICA/[producto]/ y 12 Resultados/
```

**Mapeo de origen**:
- **Registro Venta**: `08 Registros ICA/[producto]/` + `99 Revision/IVA/`
- **Ficha Técnica**: `09 Fichas Tecnicas/FICHAS_TECNICAS_V2/` (buscar versión más reciente con fecha tipo `250718_`)
- **Etiqueta**: `08 Registros ICA/[producto]/` + `despachos/`
- **Hoja Seguridad**: `07 Hojas de Seguridad/` (buscar por nombre del producto)
- **Soportes Ensayo**: `08 Registros ICA/[producto]/` + certificados de análisis específicos

**Notas importantes**:
- Algunos productos NO tienen FT V2: usar V1 más reciente y marcar para actualización
- Algunos productos NO tienen HS identificada: marcar y buscar en `99 Revision/`
- Usar prefijo numérico para ordenar: `01_CALFERCORRECTIVO`, `02_CALFER_FLORACION`, etc.

**Total estimado**: ~590 archivos (59 productos × ~10 archivos promedio)

---

### Fase 10: Migrar 06_Documentacion_Legal

Ya migrada en Fase 3. Verificar que estén completos:

- [ ] Cámara de Comercio actualizada
- [ ] RUT
- [ ] Cédula Representante Legal
- [ ] Resoluciones ICA de la empresa (107688, 5783)

**Total**: 5 archivos (ya contados en Fase 3)

---

### Fase 11: Migrar 07_SST

| Origen | Destino | Archivos |
|---|---|---|
| `06 SST/DC-SI03 Política y Objetivos V.0.pdf` | `07_SST/Politicas/` | 1 |
| `06 SST/PC-SI01 a PC-SI10` | `07_SST/Procedimientos_Seguros/` | 8 |
| `06 SST/DC-SI16 Entrega y Reemplazo de EPP.pdf` | `07_SST/EPP_Bioseguridad/` | 1 |
| `06 SST/DC-SI22 Bloqueo y Etiquetado.pdf` | `07_SST/EPP_Bioseguridad/` | 1 |
| `06 SST/DC-SI30 Protocolo de Bioseguridad.pdf` | `07_SST/EPP_Bioseguridad/` | 1 |
| `06 SST/DC-SI37 Almacenamiento Seguro y Conteo Bultos.pdf` | `07_SST/EPP_Bioseguridad/` | 1 |

**Total**: 13 archivos

---

### Fase 12: Migrar 08_Base_Datos_Tecnica

| Origen | Destino | Archivos |
|---|---|---|
| `05 Laboratorio/VERIFICADOR_V1.xlsm` | `08_Base_Datos_Tecnica/Herramientas/` | 1 |
| `05 Laboratorio/VERIFICADOR_FM2.xlsm` | `08_Base_Datos_Tecnica/Herramientas/` | 1 |
| `05 Laboratorio/VERIFICADOR_FM3.xlsm` | `08_Base_Datos_Tecnica/Herramientas/` | 1 |
| `05 Laboratorio/FORMULADOR_V0.2.xlsm` | `08_Base_Datos_Tecnica/Herramientas/` | 1 |
| `13 Base Datos/` | `08_Base_Datos_Tecnica/Referencia/` | Completo |

**Total**: ~20 archivos

---

### Fase 13: Crear Archivo Histórico

| Origen | Destino | Archivos |
|---|---|---|
| `09 Fichas Tecnicas/203.15_fichas-tecnicas_N/` (V1, "ya") | `_Archivo/FT_Versiones_Anteriores/` | ~53 |
| `09 Fichas Tecnicas/203.15_fichas-tecnicas_N/Nueva carpeta/` | `_Archivo/FT_Versiones_Anteriores/` | ~40 |
| `07 Hojas de Seguridad/` (versiones obsoletas) | `_Archivo/HS_Versiones_Anteriores/` | ~20 |
| `99 Revision/203.8_sgc-ica/` (SGC legacy completo) | `_Archivo/SGC_Legacy/` | ~800 |
| `99 Revision/203.8_sgc-ica/4. Gestión de Recursos Humanos/` | `_Archivo/SGC_Legacy/RRHH/` | ~30 |
| `08 Registros ICA/` (carpetas antiguas/versiones) | `_Archivo/Registros_ICA_Legacy/` | ~200 |
| `99 Revision/203.7_orden_produccion/` (OPs antiguas > 1 año) | `_Archivo/Registros_2024/` | ~40 |
| `12 Resultados Externos/` (certificados > 1 año) | `_Archivo/Registros_2024/` | ~35 |

**Total estimado**: ~1,218 archivos archivados

---

### Fase 14: Verificación y Ajustes Finales

#### 14.1 Checklist por Módulo

| Módulo | Verificación | Estado esperado |
|---|---|---|
| `01_Requisitos_Generales` | 4 carpetas con contenido + 1 vacía (FALTA) | ✅ |
| `02_Control_Calidad` | 1 carpeta parcial + 1 con contenido | ⚠️ |
| `03_Procedimientos` | 14 carpetas con POE + 4 vacías (FALTA) + 2 N/A | ⚠️ |
| `04_Instalaciones` | 2-3 carpetas con contenido + resto pendiente fotos | ⚠️ |
| `05_Dossier_Productos` | 59 carpetas × 5 subcarpetas cada una | ✅ |
| `06_Documentacion_Legal` | 4 carpetas con contenido | ✅ |
| `07_SST` | 3 carpetas con contenido | ✅ |
| `08_Base_Datos_Tecnica` | 2 carpetas con contenido | ✅ |
| `_Archivo` | ~1,200 archivos archivados | ✅ |

#### 14.2 Crear Documentos de Justificación N/A

Crear archivos PDF con justificación de:
- `03_.../3.04_NA_Pirolisis/NO_APLICA_Pirolisis_Justificacion.pdf`
- `03_.../3.07_NA_Reacciones_Quimicas/NO_APLICA_Reacciones_Quimicas_Justificacion.pdf`

#### 14.3 Crear Índices

- `04_.../4.12_Archivo_Documental/INDICE_ARCHIVO_SGC.md`
- `05_.../_Indice_HS/Indice_Hojas_Seguridad_PT.xlsx`

#### 14.4 Lista de Documentos Faltantes

Actualizar `03_.../[carpetas vacías]/PENDIENTE.txt` con:
- Nombre del documento faltante
- Prioridad (ALTA/MEDIA)
- Fecha objetivo de creación

---

## Estimación de Tiempo

| Fase | Descripción | Tiempo estimado |
|---|---|---|
| 1 | Limpieza de archivos basura | 30 min |
| 2 | Crear estructura vacía | 20 min |
| 3 | Migrar Requisitos Generales | 1-1.5 horas |
| 4 | Migrar Control de Calidad | 30 min |
| 5 | Migrar Proc. Producción | 1-1.5 horas |
| 6 | Migrar Proc. Calidad | 20 min |
| 7 | Migrar Proc. Soporte | 40 min |
| 8 | Migrar Instalaciones | 30 min |
| 9 | Crear dossiers (59 productos) | 4-5 horas |
| 10 | Migrar Doc. Legal | (ya en Fase 3) | - |
| 11 | Migrar SST | 30 min |
| 12 | Migrar Base Datos Técnica | 20 min |
| 13 | Archivar versiones anteriores | 1-2 horas |
| 14 | Verificación y ajustes finales | 1 hora |

**Total estimado**: **12-16 horas** (puede dividirse en 3-4 sesiones)

---

## Brechas Documentales Post-Migración

| Prioridad | Documento | Carpeta | Tiempo estimado creación |
|---|---|---|---|
| **ALTA** | Contrato Asesor Técnico | `01_.../1.5_Asesor_Tecnico/` | 2 horas (redactar + firmar) |
| **ALTA** | Procedimiento Balance de Masas | `03_.../3.05_.../01_POE/` | 4 horas (redactar + aprobar) |
| **ALTA** | Procedimiento Contramuestras | `03_.../3.14_.../01_POE/` | 3 horas (redactar + aprobar) |
| **ALTA** | Procedimiento Disposición Barreduras | `03_.../3.18_.../01_POE/` | 3 horas (redactar + aprobar) |
| **ALTA** | Formato Liberación Lotes | `03_.../3.12_.../02_Formatos/` | 1 hora (diseñar en Excel) |
| MEDIA | Procedimiento Formulaciones Terceros | `03_.../3.19_.../01_POE/` | 3 horas |
| MEDIA | Procedimiento Entrega MP Importación | `03_.../3.20_.../01_POE/` | 3 horas |
| MEDIA | Resolución Laboratorio Registrado ICA | `02_.../2.1_Laboratorio_Registrado/` | Trámite ICA |
| MEDIA | Etiquetas aprobadas por producto (faltantes) | `05_.../[X]/03_Etiqueta_Aprobada/` | Variable por producto |
| MEDIA | Fotos señalización y demarcación | `04_.../4.1_Senalizacion_Demarcacion/` | 2 horas (tomar fotos) |
| MEDIA | Fotos avisos seguridad | `04_.../4.3_Avisos_Seguridad/` | 2 horas (tomar fotos) |

---

## Riesgos y Mitigación

| Riesgo | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| Pérdida de datos al eliminar duplicados | Alta | Media | Verificar contenido antes de eliminar; mantener en `_Archivo/` 6 meses |
| Error clasificación HS MP vs PT | Media | Media | Revisar manualmente las 59 HS de MP; validar contra lista proveedores |
| Dossiers incompletos por productos sin FT V2 | Media | Alta | Usar V1 más reciente; marcar para actualización; crear lista prioritaria |
| Tiempo excesivo en Fase 9 (dossiers) | Media | Media | Procesar por lotes de 10 productos; hacer primero los 22 del plan original |
| Documentos faltantes críticos no creados | Alta | Media | Priorizar los 5 de ALTA inmediatamente después de migración |
| Resolución laboratorio ICA demorada | Alta | Media | Iniciar trámite paralelo; usar contratos externos mientras tanto |
| Cambios estructura después de migrar | Alta | Baja | Validar Opción B con stakeholders antes de empezar |

---

## Entregables Post-Migración

1. **Reporte de migración** - Archivos movidos, eliminados, archivados por fase
2. **Matriz de mapeo** - Archivo origen → destino (Excel para trazabilidad)
3. **Índice de productos** - Lista de 59 productos con ubicación de dossier
4. **Índice HS Productos Terminados** - Hojas de seguridad centralizadas
5. **Lista de pendientes** - 11 documentos por crear/mejora
6. **Estructura física implementada** - 13 AZ etiquetados y organizados

---

## Decisiones Confirmadas

| Decisión | Valor |
|---|---|
| Estructura base | **Opción B: Espejo Checklist ICA (Anexo I-B)** |
| Puntos N/A | 3.4 (pirolisis) y 3.7 (reacciones químicas) |
| SST | Carpeta separada `07_SST/` |
| HS materias primas | En `01_.../1.2_Materias_Primas_Listado/` |
| HS productos terminados | Por producto en `05_Dossier/[X]/04_Hoja_Seguridad/` |
| Convención de nombres | `[CODIGO]-[Nombre]_V[version]` |
| Archivo histórico | `_Archivo/` con subcarpetas por tipo y año |
| RRHH | NO módulo activo → `_Archivo/SGC_Legacy/RRHH/` |
| Ciclo de archivo registros | **Anual** (cada enero) |
| Base de datos técnica | `08_Base_Datos_Tecnica/` con herramientas .xlsm |

---

## Próximos Pasos Inmediatos

1. ✅ **Revisar y aprobar** este plan de migración (Opción B)
2. 🔄 **Ejecutar Fase 1**: Limpieza de ~61 archivos basura
3. 🔄 **Ejecutar Fase 2**: Crear estructura vacía
4. 🔄 **Ejecutar Fases 3-8**: Migrar módulos principales (Requisitos, Control Calidad, Procedimientos, Instalaciones)
5. 🔄 **Ejecutar Fase 9**: Crear dossiers por producto (59 productos)
6. 🔄 **Ejecutar Fases 10-13**: SST, Base Datos, Archivar legacy
7. 🔄 **Ejecutar Fase 14**: Verificación y ajustes finales
8. 📋 **Crear 5 documentos críticos faltantes** (Asesor Técnico, Balance Masas, Contramuestras, Barreduras, Formato Liberación)
9. 📋 **Implementar archivo físico** en 13 AZ
10. 📋 **Iniciar trámite** resolución laboratorio ICA

---

**Documentos de referencia**:
- `estructura.md` - Estructura completa Opción B
- `ica_checklist.md` - Anexo I-B del ICA (checklist oficial)
- `cambio_norma.md` - Comparación R150 vs pv0
- `sgc_r150_rnueva.md` - Comparación requisitos de calidad

---

*Última actualización: 2026-02-10*
