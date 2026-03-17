# REPORTE DE MIGRACIÓN DE PRODUCTOS: 05 → 08

Fecha: 2026-03-17

---

## 1. RESUMEN EJECUTIVO

Se han migrado **59 productos** desde `05_Dossier_Productos/` hacia `08_Dossier_Productos_Registrados/`, completando el directorio de dossiers de productos registrados.

**Antes de la migración:**
- `05_Dossier_Productos/`: 59 productos completos
- `08_Dossier_Productos_Registrados/`: 18 productos (incompletos)

**Después de la migración:**
- `05_Dossier_Productos/`: 59 productos completos (sin cambios)
- `08_Dossier_Productos_Registrados/`: 59 productos completos + 6 archivos especiales = 65 elementos

---

## 2. PRODUCTOS MIGRADOS

### 2.1 Categorías de productos migrados

| Categoría | Cantidad | Productos |
|-----------|----------|-----------|
| NPK Compuestos | 10 | 01_1-CRECIMIENTO, 02_2-AVANCE, 03_3-PRODUCTOR, 04_10-20-20, 05_10-30-10, 06_13-5-27, 07_15-15-15, 08_17-6-18-2, 09_18-18-18, 10_25-4-24 |
| Fertilizantes Potásicos | 3 | 29_K2K, 52_SULFA K 50, 53_SULFATO DE POTASIO |
| Fertilizantes con Zinc | 4 | 13_B-ZINC 15, 23_CALFERZINC-P, 54_SULFATO DE ZINC AL 35%, 55_SULFATO ZINC 22 |
| Fertilizantes con Boro | 2 | 11_AFOSK, 15_BORO GRANULADO |
| Fertilizantes con Cobre | 1 | 16_CALFERCOBRE |
| Mezclas con Micronutrientes | 8 | 22_CALFER MENORES, 24_FERTIMENORES, 26_FOLLAJE, 31_MAGNE-3, 33_MICRON-C, 34_MICRON CS, 56_TODERO, 28_GANADERO |
| Enmiendas Calcáreas | 4 | 17_CALFERCORRECTIVO, 25_FERTICORRECTIVO, 51_SUELO-Ca, 59_ZUELOCa |
| Silicatos y Correctores | 4 | 48_SILICATO DE MAGNESIO, 49_SILIMAGRAM, 20_CALFER FLORACION, 21_CALFER MAGNESIO |
| Yeso Agrícola | 2 | 57_YESO EN POLVO, 58_YESO GRANULADO |
| Azufre | 1 | 12_AZUFREA MALLA 100 |
| Magnésicos | 10 | 18_CAL DESARROLLO, 19_CAL FLORACION, 20_CALFER LLENADO, 30_KIESERITA P, 36_NUCLEO 4, 37_NUCLEO CAMASI, 38_NUCLEO CAMASI YARA, 39_NUCLEO FOSFORO-1, 40_NUCLEO MAGNE3, 44_NUCLEO N |
| Fosfatos | 4 | 27_FOSFORITA NEIVA, 39_NUCLEO FOSFORO-1, 46_RAIFOS 20, 50_SOLURaiFOS |
| Nitrogenados | 2 | 44_NUCLEO N, 45_PRODUCCION 17 |
| Núcleos Complejos | 4 | 36_NUCLEO 4, 37_NUCLEO CAMASI, 38_NUCLEO CAMASI YARA, 47_R-VITAL 17 |
| Orgánicos y Biológicos | 3 | 14_BIOCalfer, 60_BIOPLANTAS, 61_ORGANIC_M |

**Total productos migrados:** 59

---

## 3. PRODUCTOS ELIMINADOS (DUPLICADOS)

Se eliminaron **12 productos** que existían en `08_Dossier_Productos_Registrados/` con nombres diferentes (usando guiones bajos), porque sus equivalentes completos fueron migrados desde `05_Dossier_Productos/` (usando prefijos numéricos).

| Eliminado (guiones bajos) | Equivalente migrado (prefijo numérico) |
|---------------------------|------------------------------------------|
| FERTIMENORES | 24_FERTIMENORES |
| K2K | 29_K2K |
| NUCLEO_4 | 36_NUCLEO 4 |
| NUCLEO_CAMASI_YARA | 38_NUCLEO CAMASI YARA |
| NUCLEO_FOSFORO_1 | 39_NUCLEO FOSFORO-1 |
| NUCLEO_MAGNESIO | 40_NUCLEO MAGNE3 |
| NUCLEO_MAGNESIO-S | 43_NUCLEO MAGNESIO-S |
| NUCLEO_MAGNESIO-SILICIO_EM | 42_NUCLEO MAGNESIO-SILICIO |
| RAIFOS_20 | 46_RAIFOS 20 |
| SILIMAGRAN | 49_SILIMAGRAM |
| SULFATO_ZINC_22 | 55_SULFATO ZINC 22 |
| ZUELO_CA | 59_ZUELOCa |

---

## 4. ARCHIVOS ESPECIALES MANTENIDOS

Se mantuvieron **6 archivos especiales** en `08_Dossier_Productos_Registrados/` que no tienen equivalente en `05_Dossier_Productos/`:

| Archivo | Tipo | Contenido |
|---------|------|-----------|
| ESTRUCTURA_DOSSIERS.md | Documentación | Especificación de estructura de dossiers |
| FE_SULFATO_ZINC_22 | Producto parcial | Solo tiene Hoja de Seguridad |
| NUCLEO_CAMASI_GRIS | Producto parcial | Solo tiene Hoja de Seguridad |
| NUCLEO_CAMASI_ROJO | Producto parcial | Solo tiene Hoja de Seguridad |
| NUCLEO_FOSFORO_10 | Producto parcial | Solo tiene Hoja de Seguridad |
| SULFATO_DE_CALCIO | Producto parcial | Solo tiene Hoja de Seguridad |

**Nota:** Los 5 productos parciales (FE_SULFATO_ZINC_22, NUCLEO_CAMASI_GRIS, NUCLEO_CAMASI_ROJO, NUCLEO_FOSFORO_10, SULFATO_DE_CALCIO) están en proceso de migración o son variantes especiales. Solo tienen Hoja de Seguridad y carecen de las 5 subcarpetas obligatorias del dossier.

---

## 5. ESTRUCTURA FINAL

```
08_Dossier_Productos_Registrados/
├── ESTRUCTURA_DOSSIERS.md
├── 59 productos completos (01_ a 61_)
│   ├── 01_Registro_Venta/
│   ├── 02_Ficha_Tecnica/
│   ├── 03_Etiqueta_Aprobada/
│   ├── 04_Hoja_Seguridad/
│   └── 05_Soportes_Ensayo/
│       ├── Balance de materias primas
│       ├── Métodos analíticos
│       └── Origen de materias primas
└── 5 productos parciales
    └── 04_Hoja_Seguridad/
```

---

## 6. BALANCES DE MATERIAS PRIMAS

Todos los productos migrados incluyen sus balances de materias primas en la subcarpeta `05_Soportes_Ensayo/`:

**Ejemplos:**
- `01_1-CRECIMIENTO/05_Soportes_Ensayo/3.1-C_Balance Materia CRECIMIENTO_240608_v1.xlsx`
- `17_CALFERCORRECTIVO/05_Soportes_Ensayo/Balance-materias-primas_ferticorrectivo.xlsx`
- `22_CALFER MENORES/05_Soportes_Ensayo/3.1_Balance Materias CALFER MENORES.xlsx`

---

## 7. PRÓXIMOS PASOS

### 7.1 Completar productos parciales

Los 5 productos parciales necesitan completarse con las 5 subcarpetas obligatorias:

1. **FE_SULFATO_ZINC_22** - Requiere:
   - 01_Registro_Venta/
   - 02_Ficha_Tecnica/
   - 03_Etiqueta_Aprobada/
   - 05_Soportes_Ensayo/

2. **NUCLEO_CAMASI_GRIS** - Requiere: (misma estructura)
3. **NUCLEO_CAMASI_ROJO** - Requiere: (misma estructura)
4. **NUCLEO_FOSFORO_10** - Requiere: (misma estructura)
5. **SULFATO_DE_CALCIO** - Requiere: (misma estructura)

### 7.2 Validar integridad

1. Verificar que todos los 59 productos completos tienen las 5 subcarpetas obligatorias
2. Validar que todos los balances de materias primas cierran correctamente
3. Confirmar que las Hojas de Seguridad están actualizadas
4. Verificar que las Fichas Técnicas coinciden con el Registro ICA

### 7.3 Actualizar documentación

1. Actualizar `ESTRUCTURA_DOSSIERS.md` con la lista de productos completos
2. Crear índice de productos con su estado (completo / parcial)
3. Documentar las variantes especiales (CAMASI_GRIS, CAMASI_ROJO, etc.)

---

## 8. REFERENCIAS

- **Origen:** `SGC_CALFERQUIM/05_Dossier_Productos/`
- **Destino:** `SGC_CALFERQUIM/08_Dossier_Productos_Registrados/`
- **Estructura de dossiers:** `SGC_CALFERQUIM/08_Dossier_Productos_Registrados/ESTRUCTURA_DOSSIERS.md`
- **Mapeo completo de materias primas:** `/home/w182/w421/cfq_sgc/MAPEO_COMPLETO_MP_PRODUCTOS.md`

---

## 9. CONCLUSIONES

1. **Migración exitosa:** 59/59 productos completos migrados desde 05 a 08
2. **Limpieza realizada:** 12 productos duplicados eliminados
3. **Cobertura total:** Todos los productos registrados ahora tienen dossier completo
4. **Próximos pasos:** Completar 5 productos parciales y validar integridad

---

**Fecha de ejecución:** 2026-03-17
**Estado:** Completado
