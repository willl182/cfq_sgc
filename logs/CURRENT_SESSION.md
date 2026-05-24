# Session State: SGC Calferquim - Cierre Documental

**Last Updated**: 2026-05-24 18:20 -05

## Session Objective

Llevar a cabo el cierre documental y los ajustes de scripts y rutas del SGC, incluyendo:
1. Eliminación y archivo de carpetas vacías/redundantes.
2. Corrección del formato y cierre del formulario F-001 (SimplifICA).
3. Resolución de la colisión de código en el POE de Retiro de Producto (Recall).
4. Verificación e igualación del SLA en el POE de PQR.
5. Cierre de brechas, distribución y consolidación del índice centralizado de Hojas de Seguridad (Fase 13).
6. Corrección de rutas relativas y problemas de codificación de caracteres en los scripts de automatización del SGC.

## Current State

- [x] Eliminación de carpetas vacías y duplicados en `05_Dossier_Productos` (movidas a `_Legacy_y_Otros/08_Dossier_Productos_Registrados_Legacy`).
- [x] Corrección del autoincremento en el campo NIT del F-001, estableciéndolo permanentemente en `8150005411` para todas las filas activas.
- [x] Limpieza de las columnas extra R-Y en el formulario F-001.
- [x] Actualización del número de registro de FERTIMENORES NP a `3538` en la fila 27 de F-001.
- [x] Corrección de la colisión de códigos para el POE de Retiro de Producto: se actualizó de `POE 3.14` a `POE 7.02`, renombrando el archivo a `POE_7.02_Retiro_Producto_Recall_V1.md` y de manera segura archivando y regenerando el archivo `.docx` respectivo.
- [x] Unificación del SLA en la atención de PQR a un máximo de 10 días hábiles (cambiando el valor de "Baja" criticidad en el anexo de tiempos de respuesta de 15 a 10 días hábiles) y recompilación del anexo y POE principal en formato `.docx`.
- [x] Traslado del archivo extraviado `Hoja de Seguridad GANADERO.docx` desde `26_FOLLAJE/04_Hoja_Seguridad/` a su ubicación correcta en `28_GANADERO/04_Hoja_Seguridad/`.
- [x] Recuperación de Hojas de Seguridad faltantes desde el histórico para `45_PRODUCCION 17` y `43_NUCLEO MAGNESIO-S`.
- [x] Generación del índice centralizado y formateado de Hojas de Seguridad del SGC en `SGC_CALFERQUIM/05_Dossier_Productos/_Indice_HS/Indice_Hojas_Seguridad.xlsx`, catalogando 95 archivos de Hojas de Seguridad activos (tanto de Productos Terminados como de Materias Primas).
- [x] Corrección y estandarización de las rutas relativas en todos los scripts de python en `SGC_CALFERQUIM/scripts/` para evitar `FileNotFoundError` al ser ejecutados en entornos multiplataforma (Windows/Linux) desde la raíz del espacio de trabajo.
- [x] Corrección del error de codificación de caracteres en consola (`UnicodeEncodeError`) en los scripts de python reemplazando símbolos no soportados por CP1252 en Windows por equivalentes ASCII estándar.
- [x] Corrección de las asignaciones de nombres en `organizar_hs_dossiers.py` para mapear los insumos y productos directamente a los dossiers numerados oficiales (ej. `62_SILIMAGRAN 30`, `24_FERTIMENORES`, `29_K2K`, `02_NUCLEO CAMASI`, etc.).
- [x] Re-ejecución exitosa de `organizar_hs_dossiers.py` para distribuir de manera estandarizada los archivos de Hojas de Seguridad (`HS_*.docx`/`*.pdf`) a las carpetas `04_Hoja_Seguridad` de cada dossier numerado.
- [x] Identificación, saneamiento y archivo de 17 carpetas un-numbered duplicadas en `05_Dossier_Productos` (ej. `K2K`, `FERTIMENORES`, etc.), movidas a `_Legacy_y_Otros/08_Dossier_Productos_Registrados_Legacy/`.
- [x] Ejecución y validación técnica exitosa de todos los scripts (`generar_balance_masas_dossiers.py`, `composicion_productos.py`, `composicion_productos2.py`, `extraer_balance_masas.py`, `extraer_materias_primas_balances.py`, `copiar_hs_productos.py`, `organizar_hs_dossiers.py`, `analisis_produccion.py`), operando sin errores.
- [x] Reubicación (por el usuario) de 13 archivos markdown históricos y planes obsoletos de la raíz a `_Legacy_y_Otros/docs_aux/` para limpiar el repositorio.

## Critical Technical Context

- Las carpetas del dossier y los procedimientos ya no tienen colisiones de nombres o códigos.
- Todos los dossiers en `SGC_CALFERQUIM/05_Dossier_Productos/` siguen estrictamente la convención de nomenclatura numérica y legal (57 dossiers activos en total).
- El archivo maestro del F-001 queda limpio de auto-incrementos inválidos de Excel en la ruta `SGC_CALFERQUIM/08_Base_Datos_Tecnica/F-001-FERTILIZANTES_DILIGENCIADO.xlsx`.
- El índice centralizado de Hojas de Seguridad cataloga 95 archivos (PT y MP) y se ubica en `SGC_CALFERQUIM/05_Dossier_Productos/_Indice_HS/Indice_Hojas_Seguridad.xlsx`.
- Todos los scripts en `SGC_CALFERQUIM/scripts/` resuelven sus dependencias de archivos (`list.csv`, `comp.csv`, `materias_primas_balances.csv`, etc.) de forma robusta con respecto a `Path(__file__)`.
- Los archivos históricos y planes antiguos de la raíz se trasladaron a `_Legacy_y_Otros/docs_aux/`, lo cual mantiene el repositorio limpio y no afecta la funcionalidad del sistema ni de los scripts.

## Next Steps

1. Presentar el cierre completo de la reorganización documental, la distribución de Hojas de Seguridad a los dossiers numerados, y la confirmación de la correcta ejecución de todos los scripts de automatización al usuario.
