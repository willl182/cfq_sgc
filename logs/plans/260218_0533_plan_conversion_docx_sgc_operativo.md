# Plan: Conversion MD a DOCX (SGC Operativo)

**Created**: 2026-02-18 05:33
**Status**: completed
**Slug**: conversion-docx-sgc-operativo

## Objetivo

Convertir con Pandoc los documentos markdown operativos del SGC a formato `.docx` para uso documental y auditoria ICA, manteniendo los archivos en su misma carpeta de origen.

## Alcance confirmado por usuario

- Incluir solo SGC operativo (recomendado):
  - POEs y Actas del modulo `03_Procedimientos`
  - Anexos del modulo `03_Procedimientos`
  - Documentos de referencia operativa en `00_Inbox` y `01_Requisitos_Generales`
- Excluir:
  - `logs/`, `eval/`, `poe_rev/`
  - `PENDIENTES_CARGA.md` del modulo de dossiers
  - Documentos de analisis generales fuera de alcance (ej. `qms_new.md`, `cambio_norma.md`)

## Plan de Ejecucion

### Fase 1: Inventario y validacion de entradas
- [x] Enumerar todos los `.md` del alcance confirmado.
- [x] Validar que `pandoc` este disponible en el entorno.

### Fase 2: Conversion operativa principal
- [x] Convertir `03_Procedimientos/*/POE/*.md` a `.docx`.
- [x] Convertir `03_Procedimientos/*/Anexos/*.md` a `.docx`.

### Fase 3: Conversion de referencia operativa
- [x] Convertir:
  - `SGC_CALFERQUIM/00_Inbox/Matriz_ICA_Procedimientos_3.x_20260217.md`
  - `SGC_CALFERQUIM/00_Inbox/Estado_Dossiers_20260217.md`
  - `SGC_CALFERQUIM/01_Requisitos_Generales/1.5_Asesor_Tecnico/Contrato_Asesor_Tecnico_Borrador_V1.md`

### Fase 4: Verificacion y reporte
- [x] Verificar cantidad de `.docx` generados.
- [x] Reportar archivos convertidos y cualquier fallo.

## Criterios de exito

- Se generan `.docx` para la totalidad de archivos `.md` del alcance confirmado.
- Cada salida queda en la misma ruta de su archivo fuente.
- No se modifica el contenido original de los `.md`.

## Cierre de ejecucion (2026-02-18 05:35)

- Archivos seleccionados para conversion: 54
- Conversiones exitosas: 54
- Fallos: 0
- Salida generada en la misma carpeta de cada fuente (`*.docx`).
