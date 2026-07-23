# Hallazgos Técnicos - Extracción y Registro de Venta de Fertilizantes (RVF)

**Fecha**: 2026-06-17 11:52 -05

## Descripción de la Tarea
Se procesaron 5 archivos PDF de Registros de Venta de Fertilizantes (RVF) asignados para extraer sus datos técnicos y guardarlos en formato Markdown (.md) en las carpetas de los dossiers correspondientes, siguiendo la estructura regulatoria definida del SGC de CALFERQUIM S.A.S.

## Resultados
Se generaron con éxito los siguientes 5 archivos Markdown con su respectiva información técnica (composición garantizada, clasificación, fuentes, límites microbiológicos y metales pesados):

1. **RVF 2812 (FOSFORITA NEIVA)**
   - **Archivo origen**: `01 RVF 2812 FOSFORITA NEIVA.pdf` (Escaneado)
   - **Destino**: `08_Dossier_Productos_Registrados/01_RVF2812_FOSFORITA_NEIVA/01_Registro_Venta/RVF_2812.md`
   - **Estado**: ÉXITO

2. **RVF 2949 (CALFERZINC-P)**
   - **Archivo origen**: `02 RVF 2949 CALFERZINC-P 030.txt` (Homólogo del PDF)
   - **Destino**: `08_Dossier_Productos_Registrados/02_RVF2949_CALFERZINC-P/01_Registro_Venta/RVF_2949.md`
   - **Estado**: ÉXITO

3. **RVF 3537 (CALFERQUIM 15-15-15)**
   - **Archivo origen**: `03 RVF 3537 CALFERQUIM 15-15-15.txt` (Homólogo del PDF)
   - **Destino**: `08_Dossier_Productos_Registrados/03_RVF3537_CALFERQUIM_15-15-15/01_Registro_Venta/RVF_3537.md`
   - **Estado**: ÉXITO

4. **RVF 3601 (CALFERQUIM SILIMAGRAN 30)**
   - **Archivo origen**: `04 RVF 3601 SILIMAGRAN 30.PDF` (Escaneado)
   - **Destino**: `08_Dossier_Productos_Registrados/04_RVF3601_SILIMAGRAN_30/01_Registro_Venta/RVF_3601.md`
   - **Estado**: ÉXITO

5. **RVF 4415 (AFOS-K 0-40-50)**
   - **Archivo origen**: `05 RVF 4415 AFOS-K 0-40-50.txt` (Homólogo del PDF)
   - **Destino**: `08_Dossier_Productos_Registrados/05_RVF4415_AFOS-K_0-40-50/01_Registro_Venta/RVF_4415.md`
   - **Estado**: ÉXITO

## Detalles Técnicos
- Se dio formato exacto a la composición garantizada usando fórmulas químicas correctas y con formato de subíndice (e.g. `P₂O₅`, `K₂O`, `CaO`, `MgO`, `SiO₂`).
- Se formatearon los porcentajes con dos cifras decimales uniformemente (`.00 %`).
- Las clasificaciones se determinaron a partir del USO ESPECÍFICO e indicando la formulación y la vía de aplicación de acuerdo al marco normativo colombiano (ICA).
