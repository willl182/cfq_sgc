# Rundown: cfq_sgc

**Date**: 2026-07-02

## Current State

- Se completo busqueda documental sobre Silicato de Sodio.
- Se completo filtro adicional en Markdown y presentaciones.
- No se modificaron documentos regulatorios, formularios, PDFs, XLSM ni carpetas de productos.
- Se actualizaron solo archivos de memoria en `logs/`.

## Critical Technical Context

- Silicato de Sodio esta como codigo interno 37 / `SILICATO SODIO`, materia prima `MP;P`, con composicion NPK en blanco en el formulador.
- Tambien aparece en inventario como `MP0010 SILICATO DE SODIO X KILO` y `PT0378 SILICATO DE SODIO X KILO`.
- Soportes localizados: ficha tecnica JADESI NP-41 de 1 pagina y HS JADESI NP-41 de 9 paginas, duplicadas entre `hds_test/` y legacy.
- No se encontro presentacion `.pptx` con mencion exacta a Silicato de Sodio o NP-41; las presentaciones CMC hablan de CMC como aglutinante y de silicatos de Mg, no de Silicato de Sodio.
- Markdown util: `mp_raras.md`, `LISTA_Materias_Primas_V1.md`, `_Legacy_y_Otros/_Otros_Archivos/claude_research.md` y `_Legacy_y_Otros/docs_aux/PLAN_MIGRACION_SGC.md`.
- Falta dossier normalizado en `SGC_CALFERQUIM/08_Base_Datos_Tecnica/01_Dossier_Materias_Primas/` para Silicato de Sodio.

## Next Steps

1. Crear dossier normalizado de materia prima para Silicato de Sodio si el usuario lo solicita.
2. Definir si el formulador debe mantener el insumo sin NPK o registrar propiedades auxiliares en tabla complementaria.

## Branch Status

- Branch: main
- Status: dirty; behind origin/main by 1 commit
- Pending changes: multiples cambios previos en `SGC_CALFERQUIM/formulador-sub_1/`, RVF, `listas_siesa.xlsx`, `ITEMS 17 JUNIO.txt`, resultados externos y logs; no fueron revisados ni revertidos.
