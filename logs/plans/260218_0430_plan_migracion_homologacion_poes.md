# Plan: Migración y Homologación de POEs (Track A + Track B)

**Created**: 2026-02-18 04:30
**Status**: completed
**Slug**: migracion-homologacion-poes

## Objetivo

Migrar los 13 documentos normalizados de `poe_rev/` a la estructura definitiva `SGC_CALFERQUIM/`, y homologar los 6 procedimientos legacy pendientes (más 1 nuevo crítico) para completar la matriz de 20 POEs operativos del Módulo 3.

## Track A: Migración `poe_rev/` → `SGC_CALFERQUIM/`

### Fase A1: Sobreescritura de POEs Normalizados
Copiar versiones finales de `poe_rev/` a `SGC_CALFERQUIM/03_Procedimientos/`, reemplazando versiones pre-normalización.

- [ ] `POE_3.03_Molienda_Primaria_V1.md`
- [ ] `POE_3.05_Balance_Materias_Primas_V1.md`
- [ ] `POE_3.06_Mezcla_Homogenizacion_V1.md`
- [ ] `POE_3.08_Presentacion_Fisica_Granulacion_V1.md`
- [ ] `POE_3.09_Molienda_Secundaria_V1.md`
- [ ] `POE_3.10_Envase_V1.md`
- [ ] `POE_3.12_Liberacion_Lotes_V1.md` (Nuevo)
- [ ] `POE_3.14_Contramuestras_V1.md`
- [ ] `POE_3.18_Disposicion_Barreduras_V1.md`
- [ ] `POE_3.19_Formulaciones_Terceros_V1.md`
- [ ] `POE_3.20_Entrega_MP_Importacion_Terceros_V1.md`
- [ ] `ACTA_NA_3.04_Tratamiento_Termico_Pirolisis_V1.md`
- [ ] `ACTA_NA_3.07_Reacciones_Quimicas_Bioquimicas_V1.md`

### Fase A2: Estructura de Anexos
Crear subdirectorios `Anexos/` y distribuir los 18 archivos de `poe_rev/anexos/`.

### Fase A3: Formatos y Registros
Verificar y actualizar los 22 CSVs en `SGC_CALFERQUIM/`, asegurando que `Registro_Liberacion_Lotes_V1.csv` esté presente.

### Fase A4: Limpieza
Eliminar archivos `PENDIENTE_*.md` ya resueltos.

## Track B: Homologación Legacy (Creación de 7 POEs Nuevos)

Redacción en estilo Opus/GLM (Estándar de Oro) con formatos y anexos.

### Fase B1: 3.01 Recepción y Almacenamiento MP
- Fuente: DC-SI26, DC-SI37.
- Entregables: POE, Formato Inspección, Registro Recepción, Anexos (Lista Chequeo, Condiciones).

### Fase B2: 3.02 Limpieza y Desinfección (Brecha Crítica - Pilar 9)
- Fuente: Requisitos BPM/GMP (nuevo desde cero).
- Entregables: POE, Formato Control, Registro Limpieza, Anexos (Productos, Frecuencias).

### Fase B3: 3.11 Codificación de Lotes
- Fuente: DC-SI12 (sección asignación).
- Entregables: POE, Formato Asignación, Registro Codificación, Anexo (Estructura Código).

### Fase B4: 3.13 Muestreo y Control de Calidad
- Fuente: DC-SI12, DC-SI34, Borrador Muestreo Granel.
- Entregables: POE, Formato Control, Registro Muestreo, Anexos (Plan Muestreo, Criterios).

### Fase B5: 3.15 Higiene y Seguridad Industrial (Pilar 18)
- Fuente: DC-SI30, DC-SI37, PC-SIxx.
- Entregables: POE, Formato Verificación, Registro Inspecciones, Anexo (Lista Verificación).

### Fase B6: 3.16 Servicio al Cliente y PQR
- Fuente: DC-SI07, DC-SI11, DC-SI13, DC-SI15, RC-SI08.
- Entregables: POE, Formato PQR, Registro Seguimiento, Anexos (Flujo, Tiempos).

### Fase B7: 3.17 Almacenamiento Producto Terminado
- Fuente: DC-SI37, RC-SI53, RC-SI54.
- Entregables: POE, Formato Control, Registro Almacenamiento, Anexos (Condiciones, Matriz Compatibilidad).

## Criterios de Éxito
- 20 Carpetas en `03_Procedimientos/` con estructura estandarizada: `POE/`, `Formatos/`, `Registros/`, `Anexos/`.
- Todos los POEs en estilo Opus/GLM.
- Todos los procedimientos referencian sus formatos CSV correspondientes.
- 12 de 18 Pilares ICA cubiertos en este módulo.

## Cierre de ejecucion (2026-02-18)

- Track A ejecutado: POEs normalizados migrados, anexos distribuidos y pendientes eliminados.
- Track B ejecutado: creados 7 POEs homologados (3.01, 3.02, 3.11, 3.13, 3.15, 3.16, 3.17) con formatos, registros y anexos.
- Validacion estructural completada con resultado OK para carpetas y archivos esperados.
