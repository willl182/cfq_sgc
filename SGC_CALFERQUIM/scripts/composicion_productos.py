"""
Calcula la composición teórica de productos terminados
cruzando list.csv (BOM/fórmulas) con comp.csv (composición de MPs).
Solo usa stdlib (csv).
"""
import csv
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
COMP_PATH = PROJECT_ROOT / "_Legacy_y_Otros" / "_Otros_Archivos" / "comp.csv"
LIST_PATH = PROJECT_ROOT / "_Legacy_y_Otros" / "_Otros_Archivos" / "list.csv"
RESULT_PATH = PROJECT_ROOT / "_Legacy_y_Otros" / "_Otros_Archivos" / "composicion_productos_resultado.csv"

NUTRIENTES = ["C","N","N-NH4","N-NO3","N-org","N-ur","P","K","CaO","MgO","S",
              "B","Co","Cu","Fe","Mn","Mo","SiO2","Zn","Na"]

def to_float(val):
    try:
        return float(val.strip()) if val and val.strip() else 0.0
    except ValueError:
        return 0.0

# --- Cargar comp.csv: composición de materias primas ---
# Tomar una fila por COD (preferir menor Cprov)
comp = {}  # COD -> {nutriente: valor}
with open(COMP_PATH, newline="", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

for row in rows:
    cod = row["COD"].strip()
    cprov = to_float(row.get("Cprov", "1"))
    entry = {"_cprov": cprov, "_producto": row.get("PRODUCTO", "").strip()}
    for n in NUTRIENTES:
        entry[n] = to_float(row.get(n, "0"))
    has_data = any(entry[n] > 0 for n in NUTRIENTES)
    if cod not in comp:
        comp[cod] = entry
    else:
        old_has_data = any(comp[cod][n] > 0 for n in NUTRIENTES)
        if (has_data and not old_has_data) or \
           (has_data == old_has_data and cprov < comp[cod]["_cprov"]):
            comp[cod] = entry

# --- Cargar list.csv: BOM ---
bom_rows = []
with open(LIST_PATH, newline="", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        cod_padre = row["ITEM PADRE"].strip()
        desc_padre = row["DESC ITEM PADRE"].strip()
        cod_mp = row["ITEM MP"].strip().lstrip("0") or "0"
        desc_mp = row["DESC ITEM M.P"].strip()
        cantidad = to_float(row["CANTIDAD R"])
        bom_rows.append({
            "cod_padre": cod_padre,
            "desc_padre": desc_padre,
            "cod_mp": cod_mp,
            "desc_mp": desc_mp,
            "cantidad": cantidad
        })

# --- Calcular composición por producto ---
# Agrupar BOM por producto padre
productos = defaultdict(list)
for r in bom_rows:
    productos[(r["cod_padre"], r["desc_padre"])].append(r)

# Calcular
resultados = []
detalles = []

for (cod_p, desc_p), mps in sorted(productos.items(), key=lambda x: int(x[0][0]) if x[0][0].isdigit() else 0):
    # Excluir VINAZA y reescalar a 1000 kg/ton
    mps_filtradas = [mp for mp in mps if "VINAZA" not in mp["desc_mp"].upper()]
    suma_sin_vinaza = sum(mp["cantidad"] for mp in mps_filtradas)
    factor = 1000 / suma_sin_vinaza if suma_sin_vinaza > 0 else 1

    total_nut = {n: 0.0 for n in NUTRIENTES}
    det_lines = []

    for mp in mps_filtradas:
        cod = mp["cod_mp"]
        cant = mp["cantidad"] * factor
        comp_mp = comp.get(cod, None)

        aportes = {}
        if comp_mp:
            for n in NUTRIENTES:
                aporte = cant / 1000 * comp_mp[n]
                if aporte > 0:
                    aportes[n] = aporte
                    total_nut[n] += aporte

        det_lines.append((mp["desc_mp"], cant, aportes))

    resultados.append((cod_p, desc_p, total_nut))
    detalles.append((cod_p, desc_p, det_lines))

# --- Imprimir resumen ---
print("=" * 90)
print("COMPOSICIÓN TEÓRICA DE PRODUCTOS (% calculado a partir de BOM × composición MP)")
print("=" * 90)

for cod_p, desc_p, nuts in resultados:
    vals = {n: v for n, v in nuts.items() if v > 0.005}
    if vals:
        print(f"\n{cod_p:>5} | {desc_p}")
        parts = [f"{k}: {v:.2f}%" for k, v in vals.items()]
        print("       " + "  |  ".join(parts))
    else:
        print(f"\n{cod_p:>5} | {desc_p}")
        print("       (sin datos de composición en MPs)")

# --- Imprimir detalle ---
print("\n\n" + "=" * 90)
print("DETALLE: APORTE POR MATERIA PRIMA EN CADA PRODUCTO")
print("=" * 90)

for cod_p, desc_p, det_lines in detalles:
    print(f"\n{'-'*70}")
    print(f"{cod_p} | {desc_p}")
    print(f"{'-'*70}")
    for mp_name, cant, aportes in det_lines:
        if aportes:
            aporte_str = ", ".join(f"{k}:{v:.2f}%" for k, v in aportes.items())
        else:
            aporte_str = "(sin comp. en comp.csv)"
        print(f"  {mp_name:<42} {cant:>6.0f} kg/ton  -> {aporte_str}")

# --- Guardar CSV con detalle por MP + fila TOTAL ---
with open(RESULT_PATH, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["COD_PADRE", "DESC_PRODUCTO", "COD_MP", "DESC_MP", "KG_TON"] + NUTRIENTES)
    for (cod_p, desc_p, total_nut), (_, _, det_lines) in zip(resultados, detalles):
        # Filas individuales por MP
        for mp_name, cant, aportes in det_lines:
            row = [cod_p, desc_p, "", mp_name, cant]
            row += [round(aportes.get(n, 0), 4) for n in NUTRIENTES]
            writer.writerow(row)
        # Fila TOTAL del producto
        row = [cod_p, desc_p, "", "TOTAL", ""]
        row += [round(total_nut[n], 4) for n in NUTRIENTES]
        writer.writerow(row)

print(f"\n\nCSV guardado: {RESULT_PATH}")
