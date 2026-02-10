# Plan: Migración SGC CALFERQUIM

**Creado**: 2026-02-09 19:04
**Actualizado**: 2026-02-09 19:04
**Estado**: approved
**Slug**: migracion-sgc

## Objetivo

Migrar el Sistema de Gestión de Calidad de CALFERQUIM SAS desde estructura actual (~2,043 archivos en 14 carpetas) a nueva estructura alineada con propuesta de resolución pv0 del ICA, reduciendo duplicación y consolidando dossiers por producto.

## Fases

| # | Archivo | Acción | Notas |
|---|---------|--------|--------|
| 1.1 | `~$VERIFICADOR_FM2.xlsm` | Eliminar temporal | Lock file de Excel |
| 1.2 | `~$VERIFICADOR_V1.xlsm` | Eliminar temporal | Lock file de Excel |
| 1.3 | `~WRL3668.tmp` | Eliminar temporal | Recovery temp file de Word |
| 1.4 | `~$T BASE.docx` | Eliminar temporal | Lock file de Word |
| 1.5 | `.lnk` files | Eliminar acceso directo | En certificados |
| 1.6 | WhatsApp video, academic paper, GIS shapefile | Eliminar archivos no relacionados | Video WhatsApp, paper `.shp` |
| 1.7 | ZIP backups en `99 Revision/203.8_sgc-ica/` | Eliminar ZIPs redundantes | 8 archivos |
| 1.8 | `FICHA TECNICA ZUELOCA/` | Eliminar carpeta duplicada completa | 35 archivos duplicados |
| 1.9 | `FT MFE 13-36-10 - copia.docx` | Eliminar copia explícita | Duplicado |
| 2.1 | `SGC_CALFERQUIM/` | Crear estructura vacía | 11 módulos + subcarpetas |
| 3.1 | `01 Doc Legal/Cámara de Comercio CALFERQUIM SAS.pdf` | Mover a `03_Representacion_Legal/` | 1 archivo |
| 3.2 | `01 Doc Legal/RUT CALFERQUIM SAS.pdf` | Mover a `03_Representacion_Legal/` | 1 archivo |
| 3.3 | `01 Doc Legal/Cédula Representante Legal CALFERQUIM SAS.pdf` | Mover a `03_Representacion_Legal/` | 1 archivo |
| 3.4 | `01 Doc Legal/Res ICA 107688 2021.pdf` | Mover a `01_Registro_Empresa_ICA/` | 1 archivo |
| 3.5 | `01 Doc Legal/Res ICA 5783 2024.pdf` | Mover a `01_Registro_Empresa_ICA/` | 1 archivo |
| 4.1 | `07 Hojas de Seguridad/` (clasificar MP) | Mover a `02_Hojas_Seguridad_MP/` | 59 HS de materias primas |
| 4.2 | `09 Fichas Tecnicas/203.15_fichas-tecnicas_N/` (FT MP) | Mover a `04_Fichas_Tecnicas_MP/` | ~15 FT |
| 4.3 | `99 Revision/203.10_fichas_tecnicas_mp/` | Mover a `04_Fichas_Tecnicas_MP/` | ~130 FT |
| 4.4 | `99 Revision/203.8_sgc-ica/1) SISTEMA DE CALIDAD/1. Compras/` | Mover a `01_Seleccion_Evaluacion/` | DC-SI26, RC-SI17, RC-SI35, RC-SI36, RC-SI47 |
| 5.1 | `03 Operacion/` (procedimientos) | Mover a `02_Procedimientos_POE/` | DC-SI04, DC-SI05, DC-SI14, DC-SI22 |
| 5.2 | `99 Revision/203.7_orden_produccion/` (OPs) | Mover a `01_Ordenes_Produccion/` | ~80 OPs |
| 5.3 | `08 Registros ICA/` (balances masas) | Mover a `03_Balance_Masas/` | ~22 hojas Excel |
| 6.1 | `05 Laboratorio/` | Mover a `02_Plan_Muestreo/` | DC-SI34, procedimiento, VERIFICADOR*.xlsm, FORMULADOR.xlsm |
| 6.2 | `11 Laboratorios Externos/` | Mover a `01_Registro_Laboratorio/` | Contratos Dr Calderon, Agrilab, Campolab |
| 6.3 | `12 Resultados Externos/` | Mover a `03_Resultados_Analisis/` | ~70 PDFs |
| 6.4 | `99 Revision/202.5_certificados/` | Mover a `05_Verificacion_Equipos/` o `03_Trazabilidad_Ventas/` | ~290 certificados |
| 7.1 | `04 Calidad/DC-SI10 Liberación de Lotes al Mercado.pdf` | Mover a `02_Liberacion_Lotes/` | 1 archivo |
| 7.2 | `04 Calidad/DC-SI12 Asignación de Lotes...pdf` | Mover a `01_Codificacion_Lotes/` | 1 archivo |
| 7.3 | `despachos/` | Mover a `03_Trazabilidad_Ventas/` | Certificados, FT, HS |
| 8.1 | `02 Gestion Ambiental/` | Mover a `06_Gestion_Residuos_Ambiental/` | ~5 archivos |
| 9.1 | `04 Calidad/DC-SI07 Quejas y Reclamos.pdf` | Mover a `01_PQRS/` | 1 archivo |
| 9.2 | `04 Calidad/DC-SI11 Servicio al Cliente.pdf` | Mover a `01_PQRS/` | 1 archivo |
| 9.3 | `04 Calidad/DC-SI13 Política Servicio al Cliente.pdf` | Mover a `01_PQRS/` | 1 archivo |
| 9.4 | `04 Calidad/DC-SI15 Política de Quejas y Reclamos.pdf` | Mover a `01_PQRS/` | 1 archivo |
| 9.5 | `99 Revision/203.8_sgc-ica/2. Gestion Calidad/3. Registros/` | Mover a `01_PQRS/` | ~18 archivos |
| 10.1 | `08_Dossier_Productos_Registrados/CALFERCORRECTIVO/` | Crear estructura 5 subcarpetas | Por cada uno de 22 productos |
| 10.2 | `08 Registros ICA/[producto]/` → `01_Registro_Venta/` | Migrar registro venta | RVF, resoluciones |
| 10.3 | `09 Fichas Tecnicas/FICHAS_TECNICAS_V2/` → `02_Ficha_Tecnica/` | Migrar FT V2 | Versión más reciente con prefijo 250718_ |
| 10.4 | `08 Registros ICA/[producto]/` → `03_Etiqueta_Aprobada/` | Migrar etiqueta | Proyecto de rotulado |
| 10.5 | `07 Hojas de Seguridad/` → `04_Hoja_Seguridad/` | Migrar HS PT | Clasificada como producto terminado |
| 10.6 | `08 Registros ICA/[producto]/` → `05_Soportes_Ensayo/` | Migrar soportes ensayo | Certificados análisis |
| 11.1 | `06 SST/` (todas políticas y procedimientos) | Mover a `09_SST/` | 13 archivos |
| 12.1 | `13 Base Datos/` | Mover a `10_Base_Datos_Tecnica/` | Completo |
| 13.1 | `09 Fichas Tecnicas/203.15_fichas-tecnicas_N/` (V1 y "ya") | Archivar en `FT_Versiones_Anteriores/` | ~53 archivos |
| 13.2 | `09 Fichas Tecnicas/203.15_fichas-tecnicas_N/Nueva carpeta/` | Archivar en `FT_Versiones_Anteriores/` | ~80 archivos |
| 13.3 | `08 Registros ICA/` (carpetas antiguas) | Archivar en `Registros_ICA_Legacy/` | Versiones anteriores |
| 13.4 | `99 Revision/203.8_sgc-ica/` (SGC legacy completo) | Archivar en `SGC_Legacy/` | Todo el contenido ~800 archivos |
| 13.5 | `99 Revision/203.8_sgc-ica/4. Gestion de Recursos Humanos/` | Archivar en `SGC_Legacy/RRHH/` | ~30 archivos |

## Log de Ejecución

- [ ] Fase 1 iniciada
- [ ] Fase 1 completada (Limpieza ~61 archivos)
- [ ] Fase 2 iniciada
- [ ] Fase 2 completada (Estructura creada)
- [ ] Fases 3-14 iniciadas
- [ ] Fases 3-14 completadas
- [ ] Verificación final realizada
- [ ] Documentos faltantes creados (prioridad ALTA)

## Documentos Referenciados

- `qms_new.md` - Estructura propuesta alineada a pv0
- `PLAN_MIGRACION_SGC.md` - Plan detallado completo con 14 fases
- `logs/history/260209_1904_findings.md` - Hallazgos técnicos del análisis
- `AGENTS.md` - Protocolo de memoria universal del proyecto
