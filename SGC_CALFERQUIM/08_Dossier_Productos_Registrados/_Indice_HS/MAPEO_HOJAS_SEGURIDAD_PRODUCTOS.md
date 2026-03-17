# Mapeo Completo de Hojas de Seguridad - Productos de Producción

**Fecha de creación**: 2026-03-16  
**Proyecto**: SGC CALFERQUIM - Migración R150 a pv0  
**Objetivo**: Documentar la asignación de Hojas de Seguridad a productos de producción

---

## Resumen Ejecutivo

- **Total productos analizados**: 18
- **Productos con HS propias**: 5
- **Productos con HS reutilizables**: 13
- **Productos sin HS**: 0
- **Cobertura**: 100% ✅

---

## Productos con HS Propias

Estos productos ya tienen Hojas de Seguridad específicas en el directorio de materias primas.

| Item | Producto | Archivo HS Propia | Ubicación |
|------|----------|-------------------|-----------|
| 155 | RAIFOS 20 | HOJA SEGURIDAD RaiFOS 20.docx | 07 Hojas de Seguridad/ |
| 160 | ZUELO CA | HOJA SEGURIDAD ZUELOCa.docx | 07 Hojas de Seguridad/ |
| 161 | FERTIMENORES | HOJA DE SEGURIDAD - FERTIMENORES.docx | 07 Hojas de Seguridad/ |
| 65 | NUCLEO 4 | Hoja de Seguridad Nucleo 4.docx | 07 Hojas de Seguridad/ |
| 563 | NUCLEO CAMASI YARA | HS DE NÚCLEO CAMASI YARA.docx | 07 Hojas de Seguridad/ |

---

## Productos con HS Reutilizables

Estos productos utilizan Hojas de Seguridad de materias primas o comparten HS con otros productos.

### De Materia Prima

| Item | Producto | HS Fuente (MP) | Archivo Copiado | Justificación |
|------|----------|----------------|-----------------|----------------|
| 141 | SULFATO DE CALCIO | Yeso Agrícola Santa Rosa | HS_SULFATO_DE_CALCIO_Item141.pdf | Sulfato de calcio = Yeso agrícola |
| 208 | NUCLEO MAGNESIO | Kieserita (Sulfato de Magnesio) | HS_NUCLEO_MAGNESIO_Item208.pdf | Núcleo magnesio = Kieserita |
| 643 | FE SULFATO ZINC 22 | Sulfato de Zinc 22% | HS_FE_SULFATO_ZINC_22_Item643.docx | Usar HS de materia prima |
| 997 | SULFATO ZINC 22 | Sulfato de Zinc 22% | HS_SULFATO_ZINC_22_Item997.docx | Duplicado de Item 643 |

### Compartiendo HS con Otros Productos

| Item | Producto | HS Compartida Con | Archivo Copiado | Justificación |
|------|----------|-------------------|-----------------|----------------|
| 35 | SILIMAGRAN | NUCLEO 4 (Item 65) | HS_SILIMAGRAN_Item35.docx | Usar HS de NUCLEO 4 |
| 62 | NUCLEO CAMASI GRIS | NUCLEO CAMASI 2 | HS_NUCLEO_CAMASI_GRIS_Item62.docx | Familia CAMASI |
| 452 | NUCLEO CAMASI ROJO | NUCLEO CAMASI 2 | HS_NUCLEO_CAMASI_ROJO_Item452.docx | Familia CAMASI |
| 574 | NUCLEO FOSFORO 1 | NUCLEO FOSFORO | HS_NUCLEO_FOSFORO_1_Item574.docx | Familia FOSFORO |
| 679 | NUCLEO FOSFORO 10 | NUCLEO FOSFORO | HS_NUCLEO_FOSFORO_10_Item679.docx | Familia FOSFORO |
| 803 | NUCLEO MAGNESIO-S | Kieserita (Item 208) | HS_NUCLEO_MAGNESIO-S_Item803.pdf | Compartir con Item 208 |
| 558 | NUCLEO MAGNESIO-SILICIO EM | Kieserita (Item 208) | HS_NUCLEO_MAGNESIO-SILICIO_EM_Item558.pdf | Compartir con Item 208 |

---

## Archivos de Hojas de Seguridad Copiados

Ubicación: `SGC_CALFERQUIM/08_Dossier_Productos_Registrados/_Indice_HS/`

| Archivo | Producto | Item | Tipo HS |
|---------|----------|------|---------|
| HS_SULFATO_DE_CALCIO_Item141.pdf | SULFATO DE CALCIO | 141 | Materia Prima |
| HS_SILIMAGRAN_Item35.docx | SILIMAGRAN | 35 | Compartida |
| HS_NUCLEO_MAGNESIO_Item208.pdf | NUCLEO MAGNESIO | 208 | Materia Prima |
| HS_NUCLEO_CAMASI_YARA_Item563.docx | NUCLEO CAMASI YARA | 563 | Propia |
| HS_FE_SULFATO_ZINC_22_Item643.docx | FE SULFATO ZINC 22 | 643 | Materia Prima |
| HS_SULFATO_ZINC_22_Item997.docx | SULFATO ZINC 22 | 997 | Materia Prima |
| HS_NUCLEO_CAMASI_GRIS_Item62.docx | NUCLEO CAMASI GRIS | 62 | Compartida |
| HS_NUCLEO_CAMASI_ROJO_Item452.docx | NUCLEO CAMASI ROJO | 452 | Compartida |
| HS_NUCLEO_FOSFORO_1_Item574.docx | NUCLEO FOSFORO 1 | 574 | Compartida |
| HS_NUCLEO_FOSFORO_10_Item679.docx | NUCLEO FOSFORO 10 | 679 | Compartida |
| HS_NUCLEO_MAGNESIO-S_Item803.pdf | NUCLEO MAGNESIO-S | 803 | Materia Prima |
| HS_NUCLEO_MAGNESIO-SILICIO_EM_Item558.pdf | NUCLEO MAGNESIO-SILICIO EM | 558 | Materia Prima |

---

## Familias de Productos y HS Compartidas

### Familia CAMASI
- **HS Fuente**: HS DE NÚCLEO CAMASI YARA.docx
- **Productos**:
  - NUCLEO CAMASI GRIS (Item 62)
  - NUCLEO CAMASI ROJO (Item 452)
  - NUCLEO CAMASI YARA (Item 563)

### Familia FOSFORO
- **HS Fuente**: HOJA DE SEGURIDAD -NUCLEO FOSFORO.docx
- **Productos**:
  - NUCLEO FOSFORO 1 (Item 574)
  - NUCLEO FOSFORO 10 (Item 679)

### Familia MAGNESIO
- **HS Fuente**: Ficha de datos de seguridad de Kieserita - Sulfato de magnesio monohidratado, kieserite.pdf
- **Productos**:
  - NUCLEO MAGNESIO (Item 208)
  - NUCLEO MAGNESIO-S (Item 803)
  - NUCLEO MAGNESIO-SILICIO EM (Item 558)

### Familia SULFATO DE ZINC
- **HS Fuente**: Hoja de Seguridad SulfatoZinc22 FE.docx
- **Productos**:
  - FE SULFATO ZINC 22 (Item 643)
  - SULFATO ZINC 22 (Item 997) - Duplicado

---

## Productos con Ficha Técnica y Hoja de Seguridad

| Item | Producto | FT? | HS? | Estado Documental |
|------|----------|-----|-----|-------------------|
| 35 | SILIMAGRAN | ✓ | ✓ | Completo |
| 62 | NUCLEO CAMASI GRIS | ✗ | ✓ | Falta FT |
| 65 | NUCLEO 4 | ✓ | ✓ | Completo |
| 141 | SULFATO DE CALCIO | ✓ | ✓ | Completo |
| 155 | RAIFOS 20 | ✓ | ✓ | Completo |
| 160 | ZUELO CA | ✓ | ✓ | Completo |
| 161 | FERTIMENORES | ✓ | ✓ | Completo |
| 208 | NUCLEO MAGNESIO | ✓ | ✓ | Completo |
| 300 | K2K | ✓ | ✓ | Completo |
| 452 | NUCLEO CAMASI ROJO | ✗ | ✓ | Falta FT |
| 558 | NUCLEO MAGNESIO-SILICIO EM | ✓ | ✓ | Completo |
| 563 | NUCLEO CAMASI YARA | ✓ | ✓ | Completo |
| 574 | NUCLEO FOSFORO 1 | ✗ | ✓ | Falta FT |
| 643 | FE SULFATO ZINC 22 | ✓ | ✓ | Completo |
| 679 | NUCLEO FOSFORO 10 | ✗ | ✓ | Falta FT |
| 803 | NUCLEO MAGNESIO-S | ✓ | ✓ | Completo |
| 997 | SULFATO ZINC 22 | ✓ | ✓ | Completo |

**Resumen**:
- Productos completos (FT + HS): 14/18 (78%)
- Productos que necesitan FT: 4/18 (22%)
- Productos que necesitan HS: 0/18 (0%)

---

## Notas Técnicas

### 1. SULFATO DE CALCIO (Item 141)
- **Composición**: Yeso agrícola (CaSO4·2H2O)
- **Justificación**: El yeso agrícola es esencialmente sulfato de calcio dihidratado
- **HS Fuente**: 15) Yeso Agricola Natural Santa Rosa .pdf

### 2. NUCLEO MAGNESIO (Item 208)
- **Composición**: Mezcla con Kieserita (MgSO4·H2O)
- **Justificación**: Kieserita = Sulfato de magnesio monohidratado
- **HS Fuente**: Ficha de datos de seguridad de Kieserita

### 3. SILIMAGRAN (Item 35)
- **Justificación**: Producto similar a NUCLEO 4 en composición y peligrosidad
- **HS Fuente**: Hoja de Seguridad Nucleo 4.docx

### 4. SULFATO ZINC 22 (Items 643 y 997)
- **Composición**: Sulfato de zinc monohidratado (ZnSO4·H2O)
- **Justificación**: Es el mismo producto con diferentes nombres comerciales
- **HS Fuente**: Hoja de Seguridad SulfatoZinc22 FE.docx

---

## Recomendaciones para el SGC

### Estructura de Dossiers por Producto

Para cada producto en `08_Dossier_Productos_Registrados/`:

```
[PRODUCTO]/
├── 01_Registro_Venta/
├── 02_Ficha_Tecnica/
├── 03_Etiqueta_Aprobada/
├── 04_Hoja_Seguridad/
│   └── HS_[PRODUCTO]_Item[XXX].[ext]
└── 05_Soportes_Ensayo/
```

### Procedimiento para Actualizar HS

1. **Materias Prima**: Cuando se actualice la HS de una materia prima, actualizar todos los productos que la utilizan.
2. **Familias de Productos**: Mantener un registro de qué HS se comparten para facilitar actualizaciones.
3. **Documentación**: Mantener este documento actualizado con cualquier cambio en las asignaciones de HS.

### Validación de Cumplimiento pv0

Los siguientes productos tienen documentación completa para cumplir con pv0:

1. RAIFOS 20 (Item 155) ✅
2. ZUELO CA (Item 160) ✅
3. FERTIMENORES (Item 161) ✅
4. NUCLEO 4 (Item 65) ✅
5. SILIMAGRAN (Item 35) ✅
6. SULFATO DE CALCIO (Item 141) ✅
7. K2K (Item 300) ✅
8. NUCLEO MAGNESIO (Item 208) ✅
9. NUCLEO CAMASI YARA (Item 563) ✅
10. FE SULFATO ZINC 22 (Item 643) ✅
11. SULFATO ZINC 22 (Item 997) ✅
12. NUCLEO MAGNESIO-S (Item 803) ✅
13. NUCLEO MAGNESIO-SILICIO EM (Item 558) ✅

**Productos que necesitan crear Fichas Técnicas**:
- NUCLEO CAMASI GRIS (Item 62)
- NUCLEO CAMASI ROJO (Item 452)
- NUCLEO FOSFORO 1 (Item 574)
- NUCLEO FOSFORO 10 (Item 679)

---

## Historial de Cambios

| Fecha | Cambio | Responsable |
|-------|--------|-------------|
| 2026-03-16 | Creación del documento y copia inicial de HS | SGC Team |

---

**Documentos Relacionados**:
- PLAN_MIGRACION_SGC.md
- FORMULADOR_PROD.csv
- 202_CALFERQUIM/07 Hojas de Seguridad/
- 202_CALFERQUIM/09 Fichas Tecnicas/

