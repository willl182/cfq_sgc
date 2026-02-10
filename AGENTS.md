# AGENTS.md - SGC CALFERQUIM S.A.S.

## Descripcion del Proyecto

Este repositorio contiene el Sistema de Gestion de Calidad (SGC) digital de **CALFERQUIM S.A.S.**, empresa colombiana fabricante, formuladora y registradora de fertilizantes y acondicionadores de suelos bajo regulacion del **ICA (Instituto Colombiano Agropecuario)**.

La empresa se encuentra en transicion regulatoria critica: de la **Resolucion ICA No. 150 de 2003 (R150)** hacia la **propuesta de resolucion (pv0)**, que exige un sistema de gestion operacional basado en riesgos, Buenas Practicas de Manufactura (BPM/GMP) y Buenas Practicas de Distribucion (BPD/GDP), con interoperabilidad digital a traves de la plataforma **SimplifICA**.

## Estructura del Repositorio

```
cfq_sgc/
├── README.md                      # Contexto regulatorio, estado actual, diagnostico de brechas
├── PLAN_MIGRACION_SGC.md          # Plan detallado de 14 fases para migrar el SGC
├── qms_new.md                     # Estructura nueva propuesta alineada a pv0 (8 carpetas PHVA)
├── cambio_norma.md                # Comparacion completa R150 vs pv0
├── analisis_norma_sgc_demas.md    # Analisis estrategico (ingles): 18 pilares, adopcion GMP/GDP
├── sgc_r150_rnueva.md             # Comparacion requisitos de calidad R150 vs pv0
├── AGENTS.md                      # Este archivo
├── logs/                          # Memoria persistente del agente (ver Protocolo de Memoria)
│   ├── CURRENT_SESSION.md
│   ├── history/
│   └── plans/
└── 202_CALFERQUIM/                # Directorio principal del SGC actual (~2,047 archivos)
    ├── 00 Inbox/
    ├── 01 Documentacion Legal/
    ├── 02 Gestion Ambiental/
    ├── 03 Operacion/
    ├── 04 Calidad/
    ├── 05 Laboratorio/
    ├── 06 SST/
    ├── 07 Hojas de Seguridad/     # ~152 archivos (93 PT + 59 MP)
    ├── 08 Registros ICA/          # ~544 archivos (22+ productos, duplicados masivos)
    ├── 09 Fichas Tecnicas/        # ~280 archivos (extrema duplicacion: 5-10 copias por producto)
    ├── 10 Tramites ICA/
    ├── 11 Laboratorios Externos/
    ├── 12 Resultados Externos/    # ~70 PDFs certificados de analisis
    ├── 13 Base Datos/
    ├── 99 Revision/               # ~800 archivos SGC legacy, ZIPs, dispersos
    └── despachos/
```

## Marco Regulatorio Critico

### Transicion R150 -> pv0

| Concepto | Detalle |
|----------|---------|
| **SimplifICA** | Plataforma digital del ICA para tramites en linea |
| **Plazo** | 6 meses tras activacion de SimplifICA para migrar toda la informacion |
| **Regla "Dos Strikes"** | Si la informacion tiene errores: 15 dias habiles para corregir + posible prorroga de 15 dias. Si falla la segunda vez, el registro se pierde y se requiere "Nuevo Registro" (catastrofe financiera) |
| **Riesgo** | Perder registros de ~300 productos = inoperabilidad comercial |

### Los 18 Pilares Procedimentales (Anexo I-A/I-B de pv0)

1. Control de Proveedores
2. Balance de Materias Primas
3. Codificacion de Lotes
4. Procedimientos de Muestreo
5. Liberacion de Lotes
6. Almacenamiento de Contramuestras **(FALTA)**
7. Mantenimiento de Equipos
8. Calibracion
9. Limpieza y Desinfeccion
10. Manejo de Residuos/Barreduras
11. Capacitacion del Personal
12. Control Documental **(FALTA)**
13. Retiro de Producto/Trazabilidad **(FALTA)**
14. Servicio al Cliente (PQR)
15. Auditorias Internas
16. Gestion del Laboratorio **(FALTA)**
17. Controles del Proceso de Produccion
18. Mantenimiento de Instalaciones e Higiene

**Estado**: 6 existen, 8 parciales/dispersos, **4 faltantes** (marcados arriba).

## Plan de Migracion Activo

El plan completo esta en `PLAN_MIGRACION_SGC.md`. Tiene **14 fases** que migran de `202_CALFERQUIM/` hacia una nueva estructura `SGC_CALFERQUIM/`.

### Estructura Destino

```
SGC_CALFERQUIM/
├── 00_Inbox_Pendientes/
├── 01_Direccion_Tecnica_Legal/
├── 02_Gestion_Proveedores_Insumos/
├── 03_Produccion_Manufactura/
├── 04_Laboratorio_Control_Calidad/
├── 05_Trazabilidad_Liberacion/         # NUEVO modulo critico
├── 06_Gestion_Residuos_Ambiental/
├── 07_Postventa_Servicio_Cliente/
├── 08_Dossier_Productos_Registrados/   # 59 productos x 5 subcarpetas cada uno
├── 09_SST/
├── 10_Base_Datos_Tecnica/
└── _Archivo/                           # Versiones anteriores y SGC legacy
```

### Fases Resumidas

| Fase | Descripcion | Archivos estimados |
|------|-------------|-------------------|
| 1 | Limpieza (temporales, duplicados, basura) | ~61 eliminados |
| 2 | Crear estructura vacia | 11 modulos + subcarpetas |
| 3-9 | Migrar modulos 01-07 | ~441 archivos |
| 10 | Crear dossiers por producto (CRITICA) | ~450 archivos |
| 11 | Migrar SST | 13 archivos |
| 12-14 | Base datos + indice HS + archivar versiones | ~500 archivos archivados |

## Convenciones de Nombrado

### Sistema de Codigos Legacy (actual)

| Prefijo | Significado | Ejemplo |
|---------|------------|---------|
| `DC-SI##` | Documento de Sistema Institucional | DC-SI04 Procedimiento de Mezclas |
| `PC-SI##` | Procedimiento de Sistema Institucional | PC-SI01 Proceso de Molido |
| `RC-SI##` | Registro de Sistema Institucional | RC-SI53 Traslado Producto Terminado |
| `CGC-POE-###` | Procedimiento de Calidad | CGC-POE-018 Mezcla |
| `CGC-IOE-###` | Instructivo Operativo de Equipo | CGC-IOE-001 pHmetro |
| `MF-SI##` | Manual de Funciones | MF-SI01 a MF-SI29 |

### Convencion Nueva (destino)

```
[CODIGO]-[Nombre_Descriptivo]_V[version].[ext]

Ejemplos:
- DC-SI04_Procedimiento_Mezclas_V1.pdf
- FT_CALFERCORRECTIVO_V2.pdf
- HS_SULFATO_ZINC_35_V1.pdf
- CERT_ANALISIS_SULFAK50_20251101.pdf
```

### Tipos de Archivo

| Extension | Cantidad | Uso |
|-----------|----------|-----|
| `.pdf` | ~1,086 (53%) | Regulacion, resultados laboratorio, certificados |
| `.docx` | ~633 (31%) | Procedimientos editables, hojas de seguridad |
| `.xlsx` | ~223 (11%) | Balance de masas, formulaciones, registros |
| `.xlsm` | ~16 (<1%) | Macros verificacion NPK y composicion |
| `.doc` | ~26 (<1%) | Formularios ICA legacy (Forma 3-896) |

## Restricciones Criticas para Agentes

### NUNCA hacer sin confirmacion explicita del usuario:

1. **Eliminar archivos** - Siempre mover a `_Archivo/` antes de eliminar. Verificar contenido primero.
2. **Renombrar archivos de registro ICA** - Son documentos legales con valor probatorio.
3. **Modificar archivos `.xlsm`** - Contienen macros de verificacion NPK criticas para cumplimiento regulatorio.
4. **Mover archivos entre carpetas de productos diferentes** - La trazabilidad es requisito legal.

### Siempre considerar:

- Los archivos duplicados deben verificarse antes de eliminar (el contenido puede diferir entre versiones).
- Las Hojas de Seguridad (HS) se clasifican en **MP** (materias primas, 59 archivos) y **PT** (productos terminados, 93 archivos). No mezclar.
- Cada producto en `08_Dossier_Productos_Registrados/` tiene 5 subcarpetas obligatorias: `01_Registro_Venta/`, `02_Ficha_Tecnica/`, `03_Etiqueta_Aprobada/`, `04_Hoja_Seguridad/`, `05_Soportes_Ensayo/`.
- Los archivos con prefijo `ya` o `ya#_` en `12 Resultados Externos/` son certificados ya procesados.

## Brechas Documentales Prioritarias

### Documentos por CREAR (Prioridad ALTA):

| # | Documento | Carpeta Destino |
|---|----------|----------------|
| 1 | Contrato Asesor Tecnico | `01_.../02_Asesor_Tecnico/` |
| 2 | Procedimiento Balance de Masas | `03_.../03_Balance_Masas/` |
| 3 | Procedimiento Contramuestras | `04_.../04_Contramuestras/` |
| 4 | Procedimiento Recall/Retiro | `07_.../02_Retiro_Producto/` |
| 5 | Procedimiento Disposicion Barreduras | `06_.../01_Disposicion_Barreduras/` |

### Brechas Adicionales (Prioridad MEDIA):

- Etiquetas aprobadas por producto (parcial)
- Procedimiento Codificacion Lotes (solo DC-SI12)
- Trazabilidad Ventas (no existe formalmente)
- Procedimiento Recepcion/Almacenamiento MP
- Resolucion laboratorio registrado ICA

## Productos Registrados

Se han identificado **59 productos** con registro ICA para dossier. Cada uno requiere su carpeta en `08_Dossier_Productos_Registrados/` con la estructura estandar de 5 subcarpetas.

Los 22 productos originales del plan estan en la seccion 2.2 del `PLAN_MIGRACION_SGC.md`. La lista completa de 59 esta en la seccion 13 (Anexo).

## Requisitos Tecnicos Clave

### Minimos NPK (Fertilizantes Inorganicos)

- Un solo nutriente mayor: minimo **10%**
- Dos o mas (solido edafico): sumatoria >= **18%**
- Dos o mas (fertirriego): sumatoria >= **15%**

### Limites Metales Pesados

- As: 41 mg/kg, Cd: 39 mg/kg, Pb: 20 mg/kg, Ni: 420 mg/kg (solo organicos)

## Idioma y Comunicacion

- **Idioma principal**: Espanol (documentos del SGC, comunicacion con usuario)
- `analisis_norma_sgc_demas.md` esta en ingles (analisis estrategico)
- Todos los demas documentos estan en espanol
- Comunicarse siempre en espanol con el usuario

## Decisiones Confirmadas

| Decision | Valor |
|----------|-------|
| Estructura base | `qms_new.md` (alineada a pv0) |
| SST | Carpeta separada `09_SST/` |
| HS productos terminados | Por producto + indice central en `08_Dossier/_Indice_HS/` |
| Convencion de nombres | Codigo primero: `[CODIGO]-[Nombre]_V[version]` |
| Archivo historico | `_Archivo/` con versiones anteriores |
| RRHH | NO crear modulo activo; archivar en `_Archivo/SGC_Legacy/RRHH/` |
| Base de datos tecnica | `10_Base_Datos_Tecnica/` |

## Protocolo de Memoria Universal

### 1. Inicio de Sesion (Boot Sequence)

La primera accion al iniciar cualquier tarea es verificar la memoria del proyecto:

1. Verificar si existe `logs/CURRENT_SESSION.md`.
2. Si existe, leerlo con `read` para cargar el estado actual del proyecto.
3. Si la tarea implica continuar trabajo tecnico complejo, revisar los ultimos archivos en `logs/history/` para ver si hubo "problems" recientes que evitar.

### 2. Estructura de Logs

```
logs/
├── CURRENT_SESSION.md                          # Estado "vivo" y mutable. Snapshot actual del proyecto.
├── history/
│   ├── YYMMDD_HHMM_findings.md                # Hitos de exito (ej: "Migrada carpeta 03", "Creado dossier SULFAK50")
│   └── YYMMDD_HHMM_problems.md                # Bloqueantes y troubleshooting (ej: "Duplicado no identificado", "HS mal clasificada")
└── plans/
    └── YYMMDD_HHMM_plan_[slug].md             # Planes de trabajo con seguimiento de ciclo de vida
```

### 3. Persistencia (Fin de Sesion)

**Al finalizar cada sesion de trabajo**, usar el skill `saver` para guardar el contexto. Esto es **OBLIGATORIO**. El skill:

- Sobreescribe `logs/CURRENT_SESSION.md` con el estado actual (tareas completadas, pendientes, contexto tecnico critico, proximos pasos).
- Genera archivos inmutables en `logs/history/` si hubo hallazgos tecnicos (`_findings.md`) o problemas resueltos (`_problems.md`).
- Genera o actualiza planes en `logs/plans/` si se creo o avanzo un plan de trabajo.

### 4. Cuando Guardar (Ademas de fin de sesion)

- Al resolver un problema tecnico complejo.
- Al completar un hito clave (ej: completar una fase de migracion).
- Cuando el usuario solicite guardar el estado o crear un plan.
- Cuando el usuario solicite correcciones que deben preservarse como aprendizajes.
