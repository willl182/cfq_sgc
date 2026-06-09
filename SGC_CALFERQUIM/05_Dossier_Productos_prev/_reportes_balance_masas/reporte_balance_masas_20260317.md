# Reporte de balance de masas

Generado automaticamente desde `list.csv` y `comp.csv`.

- Dossiers revisados: 57
- Balances generados: 16
- Productos con match en `comp.csv` pero sin formula en `list.csv`: 11
- Dossiers sin match confiable en `comp.csv`: 30

## Balances generados

- `03_NUCLEO 4` -> codigo `65`; filas_formula=5; masa_total_kg=1000; masa_formulacion_kg=1000; mp_sin_comp=0; mp_ambiguas=1
- `04_25-4-24` -> codigo `82`; filas_formula=4; masa_total_kg=1000; masa_formulacion_kg=1000; mp_sin_comp=1; mp_ambiguas=0
- `05_10-30-10` -> codigo `86`; filas_formula=3; masa_total_kg=1000; masa_formulacion_kg=1000; mp_sin_comp=1; mp_ambiguas=0
- `05_18-18-18` -> codigo `83`; filas_formula=4; masa_total_kg=1000; masa_formulacion_kg=1000; mp_sin_comp=1; mp_ambiguas=0
- `07_15-15-15` -> codigo `85`; filas_formula=4; masa_total_kg=1000; masa_formulacion_kg=1000; mp_sin_comp=1; mp_ambiguas=0
- `17_CALFERCORRECTIVO` -> codigo `311`; filas_formula=6; masa_total_kg=1000; masa_formulacion_kg=1000; mp_sin_comp=0; mp_ambiguas=2
- `23_CALFERZINC-P` -> codigo `150`; filas_formula=4; masa_total_kg=1000; masa_formulacion_kg=1000; mp_sin_comp=0; mp_ambiguas=1
- `24_FERTIMENORES` -> codigo `161`; filas_formula=11; masa_total_kg=1150; masa_formulacion_kg=1150; mp_sin_comp=0; mp_ambiguas=3
- `29_K2K` -> codigo `300`; filas_formula=8; masa_total_kg=1200; masa_formulacion_kg=1200; mp_sin_comp=0; mp_ambiguas=0
- `31_MAGNE-3` -> codigo `154`; filas_formula=8; masa_total_kg=1100; masa_formulacion_kg=1100; mp_sin_comp=0; mp_ambiguas=2
- `38_NUCLEO CAMASI YARA` -> codigo `563`; filas_formula=5; masa_total_kg=1050; masa_formulacion_kg=1050; mp_sin_comp=0; mp_ambiguas=2
- `39_NUCLEO FOSFORO-1` -> codigo `574`; filas_formula=6; masa_total_kg=1100; masa_formulacion_kg=1100; mp_sin_comp=0; mp_ambiguas=1
- `43_NUCLEO MAGNESIO-S` -> codigo `803`; filas_formula=5; masa_total_kg=1100; masa_formulacion_kg=1100; mp_sin_comp=0; mp_ambiguas=1
- `46_RAIFOS 20` -> codigo `155`; filas_formula=7; masa_total_kg=1200; masa_formulacion_kg=1200; mp_sin_comp=0; mp_ambiguas=2
- `55_SULFATO ZINC 22` -> codigo `997`; filas_formula=4; masa_total_kg=1000; masa_formulacion_kg=1000; mp_sin_comp=0; mp_ambiguas=1
- `60_BIOPLANTAS` -> codigo `393`; filas_formula=1; masa_total_kg=1000; masa_formulacion_kg=1000; mp_sin_comp=0; mp_ambiguas=0

## En comp pero no en list

- `01_1-CRECIMIENTO` -> codigo `x1` / `1-CRECIMIENTO`
- `02_2-AVANCE` -> codigo `x2` / `2-AVANCE`
- `03_3-PRODUCTOR` -> codigo `x3` / `3-PRODUCTOR`
- `04_10-20-20` -> codigo `137` / `MF 10-20-20`
- `06_17-6-18-2` -> codigo `21` / `MF-17-6-18-2`
- `20_CALFER LLENADO` -> codigo `x4` / `CALFER LLENADO`
- `22_CALFER MENORES` -> codigo `x5` / `CALFER MENORES`
- `33_MICRON-C` -> codigo `164` / `MICRON C`
- `34_MICRON CS` -> codigo `188` / `MICRON CS`
- `42_NUCLEO MAGNESIO-SILICIO` -> codigo `604` / `NUCLEO MAGNESIO-SILICIO`
- `63_CALFERMAGNESIO` -> codigo `26` / `CALFERMAGNESIO`

## Sin match confiable

- `02_NUCLEO CAMASI` -> estado `missing_comp` (sin_producto_en_comp)
- `06_13-5-27` -> estado `missing_comp` (sin_producto_en_comp)
- `08_BORO GRANULADO` -> estado `missing_comp` (sin_producto_en_comp)
- `11_AFOSK` -> estado `missing_comp` (sin_producto_en_comp)
- `12_AZUFREA MALLA 100` -> estado `missing_comp` (sin_producto_en_comp)
- `13_B-ZINC 15` -> estado `missing_comp` (sin_producto_en_comp)
- `16_CALFERCOBRE` -> estado `missing_comp` (sin_producto_en_comp)
- `18_CAL DESARROLLO` -> estado `missing_comp` (sin_producto_en_comp)
- `19_CALFER FLORACION` -> estado `missing_comp` (sin_producto_en_comp)
- `25_FERTICORRECTIVO` -> estado `missing_comp` (sin_producto_en_comp)
- `26_FOLLAJE` -> estado `missing_comp` (sin_producto_en_comp)
- `27_FOSFORITA NEIVA` -> estado `missing_comp` (sin_producto_en_comp)
- `28_GANADERO` -> estado `missing_comp` (sin_producto_en_comp)
- `30_KIESERITA P` -> estado `missing_comp` (sin_producto_en_comp)
- `40_NUCLEO MAGNE3` -> estado `missing_comp` (sin_producto_en_comp)
- `41_NUCLEO MAGNESIO-AZUFRE` -> estado `missing_comp` (sin_producto_en_comp)
- `44_NUCLEO N` -> estado `ambiguous_comp` (multiples_productos_comp)
- `45_PRODUCCION 17` -> estado `missing_comp` (sin_producto_en_comp)
- `47_R-VITAL 17` -> estado `missing_comp` (sin_producto_en_comp)
- `48_SILICATO DE MAGNESIO` -> estado `missing_comp` (sin_producto_en_comp)
- `51_SUELO-Ca` -> estado `missing_comp` (sin_producto_en_comp)
- `52_SULFA K 50` -> estado `missing_comp` (sin_producto_en_comp)
- `53_SULFATO DE POTASIO` -> estado `missing_comp` (sin_producto_en_comp)
- `54_SULFATO DE ZINC AL 35%` -> estado `missing_comp` (sin_producto_en_comp)
- `56_TODERO` -> estado `missing_comp` (sin_producto_en_comp)
- `57_YESO EN POLVO` -> estado `missing_comp` (sin_producto_en_comp)
- `58_YESO GRANULADO` -> estado `missing_comp` (sin_producto_en_comp)
- `59_ZUELOCa` -> estado `missing_comp` (sin_producto_en_comp)
- `61_ORGANIC_M` -> estado `missing_comp` (sin_producto_en_comp)
- `62_SILIMAGRAN 30` -> estado `missing_comp` (sin_producto_en_comp)
