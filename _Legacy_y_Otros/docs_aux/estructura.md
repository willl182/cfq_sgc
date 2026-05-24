# Estructura del SGC CALFERQUIM
## Opción B: Espejo del Checklist ICA (Anexo I-B)

**Versión**: 1.0  
**Fecha**: 2026-02-10  
**Basado en**: Anexo I-B - Acta de Visita de Verificación de Requisitos (pv0)

---

## Filosofía

Esta estructura replica **exactamente** las 4 secciones del Anexo I-B del ICA. Cada carpeta lleva el número del punto de verificación que usará el inspector durante la visita técnica.

**Ventaja clave**: Cuando el inspector pida "punto 3.14 contramuestras", navegas directo a `03_Procedimientos/3.14_Contramuestras/`. No hay traducción mental.

---

## Estructura Digital

```
SGC_CALFERQUIM/
|
|--- 00_Inbox/
|   `--- [Archivos pendientes de clasificación]
|
|--- 01_Requisitos_Generales/                    # Sección 1 del Anexo I-B
|   |--- 1.1_Croquis_Instalaciones/
|   |   `--- [Plano planta con áreas y equipos señalizados]
|   |
|   |--- 1.2_Materias_Primas_Listado/
|   |   |--- Listado_Materias_Primas.xlsx
|   |   `--- [59 HS de materias primas de proveedores]
|   |
|   |--- 1.3_Contratos_Produccion/
|   |   `--- [Contratos vigentes si aplica maquila/terceros]
|   |
|   |--- 1.4_Diagramas_Flujo/
|   |   `--- [Diagrama de flujo del proceso completo]
|   |
|   `--- 1.5_Asesor_Tecnico/
|       `--- [FALTA] Contrato asesor técnico permanente
|
|--- 02_Control_Calidad/                         # Sección 2 del Anexo I-B
|   |--- 2.1_Laboratorio_Registrado/
|   |   |--- [FALTA] Resolución registro ICA del laboratorio propio/contratado
|   |   `--- Contratos_Laboratorios_Externos/
|   |       |--- Contrato_Dr_Calderon.pdf
|   |       |--- Contrato_Agrilab.pdf
|   |       `--- Contrato_Campolab.pdf
|   |
|   `--- 2.1.1_Certificados_Analisis/
|       `--- [Certificados de análisis último año por producto]
|
|--- 03_Procedimientos/                          # Sección 3 (puntos 3.1 a 3.20)
|   |
|   |--- 3.01_Recepcion_Almacenamiento_MP/       # Punto 3.1
|   |   |--- POE/
|   |   |   `--- [DC-SI26 u otro - Procedimiento recepción y almacenamiento MP]
|   |   |--- Formatos/
|   |   |   `--- [Formatos en blanco para recepción MP]
|   |   `--- Registros/
|   |       `--- [Registros llenados últimos 6 meses]
|   |
|   |--- 3.03_Molienda_Primaria/                 # Punto 3.3
|   |   |--- POE/
|   |   |   `--- [PC-SI01 PROCESO DE MOLIDO.pdf]
|   |   |--- Formatos/
|   |   `--- Registros/
|   |
|   |--- 3.04_NA_Pirolisis/                      # Punto 3.4 - N/A
|   |   `--- NO_APLICA_Pirolisis_Justificacion.pdf
|   |
|   |--- 3.05_Balance_Materias_Primas/           # Punto 3.5 - CRÍTICO pv0
|   |   |--- POE/
|   |   |   `--- [FALTA] Procedimiento balance de masas
|   |   |--- Formatos/
|   |   |   `--- [Plantillas Excel por producto]
|   |   `--- Registros/
|   |       `--- [Balances llenados último año]
|   |
|   |--- 3.06_Mezcla_Homogenizacion/             # Punto 3.6
|   |   |--- POE/
|   |   |   `--- [DC-SI04 Procedimiento de Mezclas.pdf]
|   |   |   `--- [PC-SI03 PROCESO DE MEZCLA.pdf]
|   |   |--- Formatos/
|   |   `--- Registros/
|   |
|   |--- 3.07_NA_Reacciones_Quimicas/            # Punto 3.7 - N/A
|   |   `--- NO_APLICA_Reacciones_Quimicas_Justificacion.pdf
|   |
|   |--- 3.08_Presentacion_Fisica_Granulacion/   # Punto 3.8
|   |   |--- POE/
|   |   |   `--- [DC-SI14 Procedimiento de Granulación.pdf]
|   |   |   `--- [PC-SI04 PROCESO DE GRANULACIÓN.pdf]
|   |   |--- Formatos/
|   |   `--- Registros/
|   |
|   |--- 3.09_Molienda_Secundaria/               # Punto 3.9
|   |   |--- POE/
|   |   |   `--- [Procedimiento molienda post-granulación/finos]
|   |   |   `--- [PC-SI06 PROCESO DE SEPARACIÓN DE FINOS.pdf]
|   |   |--- Formatos/
|   |   `--- Registros/
|   |
|   |--- 3.10_Envase/                            # Punto 3.10
|   |   |--- POE/
|   |   |   `--- [Procedimiento envasado y etiquetado]
|   |   |--- Formatos/
|   |   `--- Registros/
|   |
|   |--- 3.11_Codificacion_Lotes/                # Punto 3.11
|   |   |--- POE/
|   |   |   `--- [DC-SI12 Asignación de Lotes.pdf]
|   |   |--- Formatos/
|   |   `--- Registros/
|   |
|   |--- 3.12_Liberacion_Lotes/                  # Punto 3.12
|   |   |--- POE/
|   |   |   `--- [DC-SI10 Liberación de Lotes al Mercado.pdf]
|   |   |--- Formatos/
|   |   |   `--- [Formato de liberación cuarentena -> aprobado]
|   |   `--- Registros/
|   |
|   |--- 3.13_Muestreo_Control_Calidad/          # Punto 3.13
|   |   |--- POE/
|   |   |   `--- [DC-SI34 Ensayos Fisicoquímicos.pdf]
|   |   |--- Formatos/
|   |   `--- Registros/
|   |
|   |--- 3.14_Contramuestras/                    # Punto 3.14 - NUEVO pv0
|   |   |--- POE/
|   |   |   `--- [FALTA] Procedimiento almacenamiento contramuestras
|   |   |--- Formatos/
|   |   `--- Registros/
|   |
|   |--- 3.15_Higiene_Seguridad_Industrial/      # Punto 3.15
|   |   |--- POE/
|   |   |   `--- [DC-SI30 Protocolo de Bioseguridad.pdf]
|   |   |   `--- [DC-SI37 Almacenamiento Seguro y Conteo Bultos.pdf]
|   |   |--- Formatos/
|   |   `--- Registros/
|   |
|   |--- 3.16_Servicio_Cliente_PQR/              # Punto 3.16
|   |   |--- POE/
|   |   |   `--- [DC-SI07 Quejas y Reclamos.pdf]
|   |   |   `--- [DC-SI11 Servicio al Cliente.pdf]
|   |   |   `--- [DC-SI13 Política Servicio al Cliente.pdf]
|   |   |   `--- [DC-SI15 Política de Quejas y Reclamos.pdf]
|   |   |--- Formatos/
|   |   |   `--- [RC-SI08 Formulario Control de Quejas y Reclamos]
|   |   `--- Registros/
|   |
|   |--- 3.17_Almacenamiento_PT/                 # Punto 3.17
|   |   |--- POE/
|   |   |--- Formatos/
|   |   `--- Registros/
|   |       `--- [RC-SI53 Traslado de Producto Terminado al Almacen]
|   |
|   |--- 3.18_Disposicion_Residuos/              # Punto 3.18
|   |   |--- POE/
|   |   |   `--- [FALTA] Procedimiento disposición de barreduras
|   |   |--- Formatos/
|   |   `--- Registros/
|   |
|   |--- 3.19_Formulaciones_Terceros/            # Punto 3.19
|   |   |--- POE/
|   |   |   `--- [FALTA] Procedimiento formulaciones a terceros
|   |   |--- Formatos/
|   |   `--- Registros/
|   |
|   `--- 3.20_Entrega_MP_Importacion_Terceros/   # Punto 3.20
|       |--- POE/
|       |   `--- [FALTA] Procedimiento entrega MP importación a terceros
|       |--- Formatos/
|       `--- Registros/
|
|--- 04_Instalaciones/                           # Sección 4 del Anexo I-B
|   |--- 4.1_Senalizacion_Demarcacion/
|   |   `--- [Fotos señalización áreas, demarcación piso]
|   |
|   |--- 4.2_Equipos_Herramientas/
|   |   `--- [RC-SI55 Hoja de Vida y Mantenimientos de Maquinaria]
|   |   `--- [Inventario de equipos vs croquis]
|   |
|   |--- 4.3_Avisos_Seguridad/
|   |   `--- [Fotos avisos de seguridad según HS en cada área]
|   |
|   |--- 4.11_Manejo_Residuos_PNC/
|   |   `--- [Evidencias disposición final residuos]
|   |
|   `--- 4.12_Archivo_Documental/
|       `--- INDICE_ARCHIVO_SGC.md
|       `--- [Inventario del sistema de archivos]
|
|--- 05_Dossier_Productos/                       # 59 productos registrados
|   |--- [PRODUCTO_NOMBRE]/                      # Ej: 01_CALFERCORRECTIVO/
|   |   |--- 01_Registro_Venta/
|   |   |   `--- [Resolución ICA + modificaciones]
|   |   |--- 02_Ficha_Tecnica/
|   |   |   `--- [FT V2 actual del producto]
|   |   |--- 03_Etiqueta_Aprobada/
|   |   |   `--- [Proyecto de rotulado aprobado PDF]
|   |   |--- 04_Hoja_Seguridad/
|   |   |   `--- [HS del producto terminado]
|   |   `--- 05_Soportes_Ensayo/
|   |       `--- [Certificados de análisis, informes eficacia]
|   |
|   |--- [PRODUCTO_2]/
|   |--- ...
|   |--- [PRODUCTO_59]/
|   |
|   `--- _Indice_HS/
|       `--- Indice_Hojas_Seguridad_PT.xlsx
|
|--- 06_Documentacion_Legal/
|   |--- Camara_Comercio/
|   |--- RUT/
|   |--- Cédula_RL/
|   `--- Resoluciones_Empresa_ICA/
|
|--- 07_SST/
|   |--- Politicas/
|   |   `--- [DC-SI03 Política y Objetivos SST]
|   |--- Procedimientos_Seguros/
|   |   |--- [PC-SI01 a PC-SI10]
|   |   `--- [DC-SI22 Bloqueo y Etiquetado]
|   `--- EPP_Bioseguridad/
|       |--- [DC-SI16 Entrega y Reemplazo de EPP]
|       `--- [DC-SI30 Protocolo de Bioseguridad]
|
|--- 08_Base_Datos_Tecnica/
|   |--- Herramientas/
|   |   |--- VERIFICADOR_V1.xlsm
|   |   |--- VERIFICADOR_FM2.xlsm
|   |   |--- VERIFICADOR_FM3.xlsm
|   |   `--- FORMULADOR_V0.2.xlsm
|   `--- Referencia/
|       `--- [Libros, artículos, bibliografía técnica]
|
`--- _Archivo/
    |--- Registros_[AÑO]/                        # Archivo anual
    |   `--- [Registros de cada enero al enero]
    |--- SGC_Legacy/
    |   |--- RRHH/
    |   |--- Compras/
    |   `--- ZIP_Backups/
    |--- FT_Versiones_Anteriores/
    |   `--- [V1, V2 antiguas, versiones "ya"]
    |--- HS_Versiones_Anteriores/
    `--- Registros_ICA_Legacy/
```

---

## Estructura Física (Archivo en AZ)

| AZ | Etiqueta | Separadores | Contenido |
|---|---|---|---|
| **AZ 1** | Requisitos Generales (1.1-1.5) | 5 tabs | Croquis, listado MP + HS MP (59), contratos, diagramas, asesor técnico |
| **AZ 2** | Control de Calidad (2.1) | 2 tabs | Registro laboratorio + certificados análisis último año |
| **AZ 3A** | Proc. Producción (3.1-3.10) | 8 tabs | POE + formatos de recepción, molienda 1, balance, mezcla, granulación, molienda 2, envase, N/A pirolisis |
| **AZ 3B** | Proc. Calidad (3.11-3.14) | 4 tabs | POE + formatos de codificación, liberación, muestreo, contramuestras |
| **AZ 3C** | Proc. Soporte (3.15-3.20) | 6 tabs | POE + formatos de higiene, PQR, almac. PT, residuos, formulaciones terceros, entrega MP |
| **AZ 4** | Instalaciones (4.1-4.12) | 5 tabs | Fotos señalización, equipos, avisos seguridad, manejo residuos, índice archivo |
| **AZ 5** | Documentación Legal | 3 tabs | Cámara comercio, RUT, resoluciones ICA empresa |
| **AZ 6** | SST | 3 tabs | Políticas, procedimientos seguros por proceso, EPP |
| **AZ 7** | Dossiers A-H (productos 1-8) | 5 tabs por producto | Registro, FT, etiqueta, HS, soportes |
| **AZ 8** | Dossiers I-P (productos 9-16) | 5 tabs por producto | Registro, FT, etiqueta, HS, soportes |
| **AZ 9** | Dossiers Q-X (productos 17-24) | 5 tabs por producto | Registro, FT, etiqueta, HS, soportes |
| **AZ 10** | Dossiers Y-59 (productos 25-32) | 5 tabs por producto | Registro, FT, etiqueta, HS, soportes |
| **AZ 11** | Dossiers 33-40 | 5 tabs por producto | Registro, FT, etiqueta, HS, soportes |
| **AZ 12** | Dossiers 41-48 | 5 tabs por producto | Registro, FT, etiqueta, HS, soportes |
| **AZ 13** | Dossiers 49-59 | 5 tabs por producto | Registro, FT, etiqueta, HS, soportes |
| **AZ ARCH** | Registros Históricos | Por año | AZ etiquetadas "ARCHIVO 2025", "ARCHIVO 2026", etc. |

---

## Puntos N/A Justificados

| Punto | Proceso | Justificación |
|---|---|---|
| **3.4** | Tratamiento térmico (pirólisis) | CALFERQUIM no realiza procesos de pirólisis. Proceso es mezcla física de ingredientes. |
| **3.7** | Reacciones químicas o bioquímicas | No se realizan síntesis químicas ni fermentaciones. Proceso de mezcla física solamente. |

---

## Documentos Faltantes (Brechas)

| Prioridad | Documento | Carpeta | Impacto |
|---|---|---|---|
| **ALTA** | Contrato Asesor Técnico | `01_.../1.5_Asesor_Tecnico/` | Requisito de registro empresa |
| **ALTA** | Procedimiento Balance de Masas | `03_.../3.05_.../POE/` | Nuevo requisito crítico pv0 |
| **ALTA** | Procedimiento Contramuestras | `03_.../3.14_.../POE/` | Nuevo requisito explícito Anexo I-B |
| **ALTA** | Procedimiento Recall/Retiro | [En 3.16 o carpeta aparte] | Requisito obligatorio retiros mercado |
| **ALTA** | Procedimiento Disposición Barreduras | `03_.../3.18_.../POE/` | Prohibición explícita pv0 |
| MEDIA | Procedimiento Formulaciones Terceros | `03_.../3.19_.../POE/` | Aplica a CALFERQUIM |
| MEDIA | Procedimiento Entrega MP Importación | `03_.../3.20_.../POE/` | Aplica a CALFERQUIM |
| MEDIA | Etiquetas aprobadas por producto | `05_.../[X]/03_Etiqueta_Aprobada/` | Requerido en Anexo II-F |
| MEDIA | Resolución Laboratorio Registrado ICA | `02_.../2.1_Laboratorio_Registrado/` | Obligatorio para certificados |

---

## Convención de Nombres

```
[CODIGO]-[Nombre_Descriptivo]_V[version].[ext]

Ejemplos:
- DC-SI04_Procedimiento_Mezclas_V1.pdf
- PC-SI01_Proceso_Molido_V1.pdf
- FT_CALFERCORRECTIVO_V2.pdf
- HS_SULFATO_ZINC_35_V1.pdf
- RC-SI08_Control_Quejas_V1.xlsx
- CERT_ANALISIS_SULFAK50_20251101.pdf
```

---

## Protocolo de Archivo Anual

Cada **enero**:

1. **Registros/** de cada carpeta 3.XX -> `_Archivo/Registros_[AÑO_ANTERIOR]/`
2. **Certificados de análisis** del año anterior en 2.1.1 -> archivo
3. Dejar solo **POE y Formatos en blanco** activos
4. **Físico**: Mover registros llenados a caja/archivo etiquetado "2025", "2026", etc.

---

## Cobertura Anexo I-B

| Sección | Estado | Cobertura |
|---|---|---|
| 1. Requisitos Generales | [OK] Completa | 5/5 puntos cubiertos |
| 2. Control de Calidad | [WARN] Parcial | Falta resolución laboratorio ICA |
| 3. Procedimientos | [WARN] Parcial | 14/18 puntos con POE, 4 faltan crear |
| 4. Instalaciones | [WARN] Parcial | Falta completar fotos y evidencias |

**Total**: ~75% de cobertura documental (faltan 5 documentos críticos + mejoras)
