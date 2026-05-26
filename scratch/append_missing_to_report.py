import os

def main():
    report_path = "/home/w182/.gemini/antigravity-cli/brain/5e66441f-082c-42ae-b084-ee963ffa15ac/analisis_contraste_formulador.md"
    
    extra_content = """
---

## 6. Inventario de Dossiers Faltantes (Productos Terminados en el Catálogo)

La auditoría determinó que existen **293 productos terminados (PT)** registrados operativamente en `FORMULADOR - PROD.csv` que no cuentan con una carpeta en `05_Dossier_Productos/`. A continuación, se detalla su clasificación exacta para definir qué acciones tomar en cada grupo:

### 🅰️ Productos Comerciales / Complejos Faltantes (12 Productos)
Estos productos tienen códigos de línea comercial en el formulador pero **carecen de dossier físico**. Representan una brecha regulatoria crítica si la empresa los comercializa o planea comercializar bajo SimplifICA:

1. **ALTOMG** (`DS001-ALTOMG-CALFERQUIM 1-G`) - Acondicionador granulado de magnesio.
2. **BIORGANIK** (`9999-BIORGANIK-CALFERQUIM 1-P`) - Enmienda orgánica.
3. **CALFERCAT** (`325-CALFERCAT-CALFERQUIM 1-P`) - Enmienda/fertilizante especial.
4. **FOSFORO ESPECIAL** (`410-FOSFORO ESPECIAL-CALFERQUIM 1-G`) - Acondicionador fosfatado.
5. **NUCLEO CALCIO 40** (`1275-NUCLEO CALCIO 40-CALFERQUIM 1-G`) - Concentrado calcáreo.
6. **NUCLEO FERCON** (`140-NUCLEO FERCON-CALFERQUIM 1-G`) - Núcleo/Concentrado especial.
7. **NUCLEO FOSFORO 10** (`679-NUCLEO FOSFORO 10-CALFERQUIM 1-G`) - Núcleo fosfatado.
8. **NUCLEO FOSFORO 2** (`575-NUCLEO FOSFORO 2-CALFERQUIM 1-G`) - Núcleo fosfatado.
9. **NUCLEO MANGANESO** (`579-NUCLEO MANGANESO-CALFERQUIM 1-G`) - Núcleo de micronutrientes.
10. **NUCLEO MENORES** (`61-NUCLEO MENORES-CALFERQUIM 1-G`) - Concentrado de elementos menores.
11. **SULFOCAL2** (`DS002-SULFOCAL2-CALFERQUIM 1-G`) - Acondicionador/enmienda de azufre y calcio.
12. **TERRAFERTIL** (`322-TERRAFERTIL-CALFERQUIM 1-P`) - Acondicionador orgánico/mineral.

* **Recomendación:** Consultar al Director Técnico para confirmar si estos registros están vigentes y requieren la creación de sus carpetas de dossier correspondientes, o si son fórmulas obsoletas.

---

### 🅱️ Mapeos de Nombre Desalineados (5 Productos)
Aparecen como "faltantes" en el cruce automático debido a variaciones tipográficas leves entre la carpeta física y el catálogo de producción:

1. **AFOS-K** (`379-AFOS-K`) $\rightarrow$ Carpeta física: `11_AFOSK` (Falta guion).
2. **BZINC-15** (`576-BZINC-15`) $\rightarrow$ Carpeta física: `13_B-ZINC 15` (Diferencia de espacio y guion).
3. **NUCLEO FOSFORO** (`365-NUCLEO FOSFORO`) $\rightarrow$ Carpeta física: `39_NUCLEO FOSFORO-1` (Falta sufijo `-1`).
4. **ZUELO CA** (`160-ZUELO CA`) $\rightarrow$ Carpeta física: `59_ZUELOCa` y `51_SUELO-Ca` (Variación en espacios y 'S'/'Z').
5. **MF-23-3-20-4Ca-3Si** $\rightarrow$ Mezcla física clasificada operativamente en la línea comercial.

* **Recomendación:** Renombrar y estandarizar las carpetas físicas para evitar duplicaciones tipográficas.

---

### 🅲 Mezclas Físicas y Fórmulas Especiales Faltantes (276 Recetas)
Representan fórmulas internas de mezcla, subproductos o recetas a medida. **No requieren dossiers regulatorios individuales** ya que se acogen bajo el registro de mezcla física genérico o son de uso meramente industrial:

* **Mezclas Físicas (MF - 145 Recetas):** Fórmulas de mezcla NPK preparadas a medida (ej. `MF 0-15-15+EM`, `MF 10N-10P-20K+EM`).
* **Mezclas Físicas Especiales (MFE - 107 Recetas):** Pedidos especiales de mezclas (ej. `MFE 0N-1P0K+EM`, `MFE 10N 11P 29K`).
* **Polvillos (POLVILLO - 16 Recetas):** Subproductos o remanentes de barreado en polvo (ej. `POLVILLO BORO`, `POLVILLO CALFERZINC P`).
* **Fórmulas Especiales (FE - 7 Recetas):** Ensayos u órdenes piloto de planta (ej. `FE FERTIMENORES`, `FE NUCLEO N`).
"""

    if os.path.exists(report_path):
        with open(report_path, "r") as f:
            content = f.read()
            
        # Avoid appending duplicates if run multiple times
        if "## 6. Inventario de Dossiers Faltantes" not in content:
            new_content = content + extra_content
            with open(report_path, "w") as f:
                f.write(new_content)
            print("Successfully appended inventory to report.")
        else:
            print("Inventory already exists in report.")
            
if __name__ == "__main__":
    main()
