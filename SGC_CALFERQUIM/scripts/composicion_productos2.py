"""
Composición teórica v2: usa materias_primas_balances.csv como BOM
y cruza con comp.csv para calcular composición.
"""
import csv
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
COMP_PATH = PROJECT_ROOT / "_Legacy_y_Otros" / "_Otros_Archivos" / "comp.csv"
RESULT_PATH = PROJECT_ROOT / "_Legacy_y_Otros" / "_Otros_Archivos" / "composicion_productos_resultado2.csv"

NUTRIENTES = ["C","N","N-NH4","N-NO3","N-org","N-ur","P","K","CaO","MgO","S",
              "B","Co","Cu","Fe","Mn","Mo","SiO2","Zn","Na"]

def to_float(val):
    try:
        return float(val.strip().replace(",", ".")) if val and val.strip() else 0.0
    except ValueError:
        return 0.0

# === Cargar comp.csv ===
comp = {}  # COD -> {nutriente: valor, _producto: nombre}
with open(COMP_PATH, newline="", encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
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
            # Preferir fila con datos; si ambas tienen (o no), preferir menor Cprov
            if (has_data and not old_has_data) or \
               (has_data == old_has_data and cprov < comp[cod]["_cprov"]):
                comp[cod] = entry

# Índice por nombre normalizado para buscar por nombre
comp_by_name = {}
for cod, entry in comp.items():
    name_norm = entry["_producto"].upper().strip()
    if name_norm not in comp_by_name:
        comp_by_name[name_norm] = entry

# === Mapeo manual: nombre en balance → COD en comp.csv ===
MP_MAP = {
    "ACIDO BORICO": "132",
    "BENTONITA": "370",  # asume gris por defecto
    "BENTONITA GRIS - DIDIER HOYOS": "370",
    "CAL DOLOMITA": "120",
    "CAL DOLOMITA - BOLIVARIANA MINERALES": "120",
    "CAOLIN": "110",
    "CARBONATO CA": "105",
    "CARBONATO CALCIO - AGROCALES": "105",
    "CLORURO POTASIO (KCL)": "144",
    "DAP": "97",
    "DOLOMITA": "120",
    "DOLOMITA - BOLIV. MINERALES": "120",
    "FOSFATO DE AMONIO (MAP)": "72",
    "FOSFATO MONOAMONICO (MAP)": "72",
    "FOSFATO DIPOTASICO (DKP)": "79",
    "FOSFATO MONOPOTASICO (MKP)": "178",
    "KCL": "144",
    "KCL - NUTRICION PLANTAS": "144",
    "KCL ESTÁNDAR": "143",
    "KIESERITA": "74",
    "MAP - PRECISAGRO": "72",
    "OXIDO ZN": "56",
    "RAIFOS20": "155",
    "ROCA FOSFORICA": "290",
    "ROCA FOSFORICA - FOSFATOS HUILA": "290",
    "SAM": "32",
    "SAM - PRECISAGRO": "32",
    "SILICATO DE MAGNESIO - JULIAN SALDARRIAGA": "274",
    "SILICATO MAGNESIO": "274",
    "SILICATO MAGNESIO - JULIAN SALDARRIAGA": "274",
    "SILICATO MG": "274",
    "SULFATO CA": "5",
    "SULFATO CALCIO - ANIBAL ARANGO": "5",
    "SULFATO CALCIO - SANTA ROSA": "5",
    "SULFATO CALCIO - YESO AGRICOLA": "5",
    "SULFATO DE AMONIO (SAM)": "32",
    "SULFATO DE COBRE": "30",
    "SULFATO DE HIERRO": "28",
    "SULFATO DE MANGANESO": "425",
    "SULFATO DE POTASIO": "197",
    "SULFATO DE ZINC": "23",
    "SULFATO FERROSO": "28",
    "SULFATO FERROSO MONOHIDRATO": "28",
    "SULFATO MAGNESIO": "74",      # kieserita = sulfato de magnesio
    "SULFATO MAGNESIO ANHIDRO": "74",
    "SULFATO DE MAGNESIO ANHIDRO": "74",
    "SULFATO POTASIO": "197",
    "SULFATO ZN": "23",
    "ULEXITA": "16",
    "UREA": "12",
    "UREA - NUTRICION PLANTAS": "12",
    "VINAZA (BIORGANIK)": "214",
    "NITRATO DE POTASIO": None,     # no está en comp.csv
    "NITRATO DE POTASIO (KNO3)": None,
    "MOLIBDATO DE SODIO": None,
    "SULFATO DE COBALTO": None,
    "DEXTROSA MONOHIDRATADA": None,
    "Dextrosa Monohidradatada": None,
    "DIÓXIDO SILICIO": None,
    "E.D.T.A": None,
    "QUITINA ORGÁNICA (HYT-C)": None,
    "SUMA": None,  # fila de suma, ignorar
}

def lookup_comp(mp_name):
    """Busca composición de una MP por nombre."""
    name = mp_name.strip()
    if name in MP_MAP:
        cod = MP_MAP[name]
        if cod and cod in comp:
            return comp[cod]
        return None
    # Fallback: buscar por nombre en comp_by_name
    name_upper = name.upper()
    if name_upper in comp_by_name:
        return comp_by_name[name_upper]
    return None

# === Cargar balances ===
BAL_PATH = PROJECT_ROOT / "SGC_CALFERQUIM" / "05_Dossier_Productos" / "_reportes_balance_masas" / "materias_primas_balances.csv"
bal_rows = []
with open(BAL_PATH, newline="", encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        bal_rows.append({
            "dossier": row["dossier"].strip(),
            "archivo": row["archivo_balance"].strip(),
            "hoja": row["hoja"].strip(),
            "mp": row["materia_prima"].strip(),
            "kg_ton": to_float(row["kg_ton"]),
        })

# === Deduplicar: por dossier, tomar solo un archivo+hoja ===
# Agrupar por (dossier, archivo, hoja)
groups = defaultdict(list)
for r in bal_rows:
    if r["mp"].upper() != "SUMA":
        groups[(r["dossier"], r["archivo"], r["hoja"])].append(r)

# Por dossier, elegir el mejor grupo (preferir "3.1-C" en archivo, luego primera hoja)
by_dossier = defaultdict(list)
for (dossier, archivo, hoja), rows in groups.items():
    by_dossier[dossier].append((archivo, hoja, rows))

productos = {}
for dossier in sorted(by_dossier):
    options = by_dossier[dossier]
    # Preferir archivo con "3.1-C" o "3.1_C"
    preferred = [o for o in options if "3.1-C" in o[0] or "3.1_C" in o[0]]
    if not preferred:
        preferred = options
    # Tomar la primera hoja de las preferidas
    archivo, hoja, mps = preferred[0]
    productos[(dossier, hoja)] = mps

# === Calcular composición ===
resultados = []
sin_match = set()

for (dossier, hoja), mps in sorted(productos.items()):
    # Excluir VINAZA y reescalar a 1000 kg/ton
    mps_filtradas = [mp for mp in mps if "VINAZA" not in mp["mp"].upper()]
    suma_sin_vinaza = sum(mp["kg_ton"] for mp in mps_filtradas)
    factor = 1000 / suma_sin_vinaza if suma_sin_vinaza > 0 else 1

    total_nut = {n: 0.0 for n in NUTRIENTES}
    det_lines = []

    for mp in mps_filtradas:
        comp_mp = lookup_comp(mp["mp"])
        cant = mp["kg_ton"] * factor
        aportes = {}
        if comp_mp:
            for n in NUTRIENTES:
                aporte = cant / 1000 * comp_mp[n]
                if aporte > 0:
                    aportes[n] = aporte
                    total_nut[n] += aporte
        else:
            if mp["mp"] not in MP_MAP or MP_MAP.get(mp["mp"]) is not None:
                sin_match.add(mp["mp"])

        det_lines.append((mp["mp"], cant, aportes))

    resultados.append((dossier, hoja, total_nut, det_lines))

# === Imprimir resumen ===
print("=" * 90)
print("COMPOSICIÓN TEÓRICA v2 (desde balances de masa × comp.csv)")
print("=" * 90)

for dossier, hoja, nuts, det_lines in resultados:
    vals = {n: v for n, v in nuts.items() if v > 0.005}
    print(f"\n{dossier} | {hoja}")
    if vals:
        parts = [f"{k}: {v:.2f}%" for k, v in vals.items()]
        print("  " + "  |  ".join(parts))
    else:
        print("  (sin datos de composición)")

# === Detalle ===
print("\n\n" + "=" * 90)
print("DETALLE POR MATERIA PRIMA")
print("=" * 90)

for dossier, hoja, nuts, det_lines in resultados:
    print(f"\n{'-'*70}")
    print(f"{dossier} | {hoja}")
    print(f"{'-'*70}")
    for mp_name, cant, aportes in det_lines:
        if aportes:
            aporte_str = ", ".join(f"{k}:{v:.2f}%" for k, v in aportes.items())
        else:
            aporte_str = "(sin comp.)"
        print(f"  {mp_name:<45} {cant:>7.1f} kg/ton -> {aporte_str}")

# === Guardar CSV con detalle + TOTAL ===
with open(RESULT_PATH, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["DOSSIER", "PRODUCTO", "MATERIA_PRIMA", "KG_TON"] + NUTRIENTES)
    for dossier, hoja, total_nut, det_lines in resultados:
        for mp_name, cant, aportes in det_lines:
            row = [dossier, hoja, mp_name, cant]
            row += [round(aportes.get(n, 0), 4) for n in NUTRIENTES]
            writer.writerow(row)
        # Fila TOTAL
        row = [dossier, hoja, "TOTAL", ""]
        row += [round(total_nut[n], 4) for n in NUTRIENTES]
        writer.writerow(row)

print(f"\n\nCSV guardado: {RESULT_PATH}")

if sin_match:
    print(f"\nWARNING: MPs sin match en comp.csv (no mapeadas):")
    for m in sorted(sin_match):
        print(f"  - {m}")
