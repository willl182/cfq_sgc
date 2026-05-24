#!/usr/bin/env python3
"""
Extrae materias primas y cantidades (Kg/Ton) de los balances de masa
# de los productos registrados en SGC_CALFERQUIM/05_Dossier_Productos.
# 
# Genera un CSV consolidado: producto, materia_prima, kg_por_ton, porcentaje
# """

import os
import re
import sys
import csv
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("Se requiere pandas: pip install pandas openpyxl")
    sys.exit(1)

BASE_DIR = Path(__file__).resolve().parent.parent / "05_Dossier_Productos"
OUTPUT_CSV = Path(__file__).resolve().parent.parent.parent / "balance_masas_consolidado.csv"

# Palabras clave que indican fin de la sección de materias primas
STOP_WORDS = [
    "aditivos", "inertes", "sumatoria", "total", "grado",
    "certificado", "contenidos", "tolerancia", "resultados",
    "solicitud", "cumple", "desviaciones", "suma"
]

# Palabras que NO son materias primas (headers, secciones, etc.)
SKIP_WORDS = [
    "materia prima", "formulacion", "balance", "sistema",
    "calferquim", "elemento", "composición", "composicion"
]


def is_stop_row(val):
    """Determina si una fila marca el fin de la sección de MPs."""
    if pd.isna(val):
        return False
    s = str(val).strip().lower()
    return any(w in s for w in STOP_WORDS)


def is_skip_row(val):
    """Determina si una fila es un header o sección que NO es materia prima."""
    if pd.isna(val):
        return True
    s = str(val).strip().lower()
    if s == "" or s == "nan":
        return True
    return any(w in s for w in SKIP_WORDS)


def get_product_name(folder_name):
    """Extrae nombre del producto del nombre de la carpeta."""
    # Quitar prefijo numérico: "01_1-CRECIMIENTO" -> "1-CRECIMIENTO"
    match = re.match(r'^\d+_(.+)$', folder_name)
    return match.group(1) if match else folder_name


def select_best_balance_file(xlsx_files):
    """Selecciona el mejor archivo de balance cuando hay varios.
    Prioridad: archivos con '3.1-C_' (copia controlada) > otros con 'Balance' > el primero.
    """
    # Preferir copia controlada (3.1-C_)
    controlled = [f for f in xlsx_files if "3.1-C_" in f or "3-C_" in f]
    if controlled:
        return controlled[0]

    # Preferir archivos con 'Balance' en el nombre (no TODERO genérico)
    balance = [f for f in xlsx_files if "balance" in f.lower() and "todero" not in f.lower()]
    if balance:
        return balance[0]

    # Cualquier archivo con Balance
    balance_any = [f for f in xlsx_files if "balance" in f.lower()]
    if balance_any:
        return balance_any[0]

    return xlsx_files[0]


def extract_from_format_calferquim(df, product_name):
    """
    Formato Calferquim: Col 0 = MATERIA PRIMA, Col 2 = Kg/Ton, Col 3 = %/100 Kg.
    Header en fila donde col 0 contiene 'MATERIA PRIMA'.
    """
    results = []
    header_row = None

    for i in range(min(10, len(df))):
        val = str(df.iloc[i, 0]).strip().upper() if pd.notna(df.iloc[i, 0]) else ""
        if "MATERIA PRIMA" in val:
            header_row = i
            break

    if header_row is None:
        return results

    for i in range(header_row + 1, len(df)):
        mp_name = df.iloc[i, 0]

        if is_stop_row(mp_name):
            break
        if is_skip_row(mp_name):
            continue

        mp_name = str(mp_name).strip()
        kg_ton = df.iloc[i, 2] if len(df.columns) > 2 else None
        pct = df.iloc[i, 3] if len(df.columns) > 3 else None

        if pd.notna(kg_ton):
            try:
                kg_ton = float(kg_ton)
            except (ValueError, TypeError):
                kg_ton = None

        if pd.notna(pct):
            try:
                pct = float(pct)
            except (ValueError, TypeError):
                pct = None

        if kg_ton is not None or mp_name:
            results.append({
                "producto": product_name,
                "materia_prima": mp_name,
                "kg_por_ton": kg_ton,
                "porcentaje": pct
            })

    return results


def extract_from_format_sgi(df, product_name):
    """
    Formato SGI: Col 0 es NaN/vacía, Col 1 = MATERIA PRIMA, Col 2 = kg/Ton, Col 3 = %/100 kg.
    Header en fila donde col 1 contiene 'MATERIA PRIMA'.
    """
    results = []
    header_row = None

    # Buscar columna con "MATERIA PRIMA"
    mp_col = None
    kg_col = None
    pct_col = None

    for i in range(min(10, len(df))):
        for j in range(min(5, len(df.columns))):
            val = str(df.iloc[i, j]).strip().upper() if pd.notna(df.iloc[i, j]) else ""
            if "MATERIA PRIMA" in val:
                header_row = i
                mp_col = j
                kg_col = j + 1
                pct_col = j + 2
                break
        if header_row is not None:
            break

    if header_row is None:
        return results

    for i in range(header_row + 1, len(df)):
        mp_name = df.iloc[i, mp_col] if mp_col < len(df.columns) else None

        if is_stop_row(mp_name):
            break
        if is_skip_row(mp_name):
            continue

        mp_name = str(mp_name).strip()
        kg_ton = df.iloc[i, kg_col] if kg_col < len(df.columns) else None
        pct = df.iloc[i, pct_col] if pct_col < len(df.columns) else None

        if pd.notna(kg_ton):
            try:
                kg_ton = float(kg_ton)
            except (ValueError, TypeError):
                kg_ton = None

        if pd.notna(pct):
            try:
                pct = float(pct)
            except (ValueError, TypeError):
                pct = None

        if kg_ton is not None or mp_name:
            results.append({
                "producto": product_name,
                "materia_prima": mp_name,
                "kg_por_ton": kg_ton,
                "porcentaje": pct
            })

    return results


def detect_and_extract(df, product_name):
    """Detecta el formato y extrae los datos."""
    # Verificar si col 0 es mayormente NaN (formato SGI)
    first_col_nan = sum(1 for i in range(min(8, len(df))) if pd.isna(df.iloc[i, 0]))

    if first_col_nan >= 5:
        return extract_from_format_sgi(df, product_name)
    else:
        return extract_from_format_calferquim(df, product_name)


def select_best_sheet(sheets, product_name):
    """Selecciona la hoja más relevante del workbook."""
    if len(sheets) == 1:
        return list(sheets.keys())[0]

    def normalize(s):
        return re.sub(r'[^a-z0-9]', '', s.lower())

    prod_norm = normalize(product_name)

    # Buscar hoja cuyo nombre coincida con el producto
    for name in sheets:
        sheet_norm = normalize(name)
        if prod_norm in sheet_norm or sheet_norm in prod_norm:
            return name

    # Buscar hoja donde la fila 1 (nombre del producto) coincida
    for name, df in sheets.items():
        if len(df) > 1:
            cell = str(df.iloc[1, 0]).strip() if pd.notna(df.iloc[1, 0]) else ""
            cell_norm = normalize(cell)
            if prod_norm in cell_norm or cell_norm in prod_norm:
                return name

    # Buscar hoja que contenga "balance" o "entrada"
    for name in sheets:
        nl = name.lower()
        if "balance" in nl or "entrada" in nl:
            return name

    # Primera hoja
    return list(sheets.keys())[0]


def process_product(product_dir, folder_name):
    """Procesa un producto y extrae sus materias primas."""
    product_name = get_product_name(folder_name)
    bm_dir = product_dir / "05_Balance_Masas"

    if not bm_dir.is_dir():
        return [], "sin carpeta 05_Balance_Masas"

    xlsx_files = [f for f in os.listdir(bm_dir)
                  if f.endswith('.xlsx') and 'balance' in f.lower()]

    if not xlsx_files:
        return [], "sin archivo de balance .xlsx"

    best_file = select_best_balance_file(xlsx_files)
    filepath = bm_dir / best_file

    try:
        sheets = pd.read_excel(filepath, sheet_name=None, header=None)
    except Exception as e:
        return [], f"error leyendo {best_file}: {e}"

    best_sheet = select_best_sheet(sheets, product_name)
    df = sheets[best_sheet]

    results = detect_and_extract(df, product_name)

    if not results:
        # Intentar con otra hoja
        for sname, sdf in sheets.items():
            if sname == best_sheet:
                continue
            results = detect_and_extract(sdf, product_name)
            if results:
                break

    if not results:
        return [], f"no se encontraron MPs en {best_file} (hoja: {best_sheet})"

    return results, f"OK: {len(results)} MPs de {best_file} [{best_sheet}]"


def main():
    if not BASE_DIR.is_dir():
        print(f"ERROR: No se encontró el directorio {BASE_DIR}")
        sys.exit(1)

    all_results = []
    sin_balance = []

    product_dirs = sorted([
        d for d in os.listdir(BASE_DIR)
        if os.path.isdir(BASE_DIR / d) and not d.startswith('_')
    ])

    print(f"Procesando {len(product_dirs)} productos...\n")

    for folder in product_dirs:
        product_path = BASE_DIR / folder
        results, status = process_product(product_path, folder)

        if results:
            all_results.extend(results)
            print(f"  [OK] {folder}: {status}")
        else:
            sin_balance.append((folder, status))
            print(f"  [ERR] {folder}: {status}")

    # Escribir CSV
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["producto", "materia_prima", "kg_por_ton", "porcentaje"])
        writer.writeheader()
        for row in all_results:
            writer.writerow(row)

    print(f"\n{'='*60}")
    print(f"RESUMEN")
    print(f"{'='*60}")
    print(f"Productos con balance extraído: {len(product_dirs) - len(sin_balance)}")
    print(f"Productos sin balance:          {len(sin_balance)}")
    print(f"Total materias primas extraídas: {len(all_results)}")
    print(f"\nCSV generado: {OUTPUT_CSV}")

    if sin_balance:
        print(f"\nProductos sin balance de masa:")
        for folder, status in sin_balance:
            print(f"  - {get_product_name(folder)}: {status}")

    # Resumen por producto
    print(f"\n{'='*60}")
    print(f"DETALLE POR PRODUCTO")
    print(f"{'='*60}")
    from collections import defaultdict
    por_producto = defaultdict(list)
    for r in all_results:
        por_producto[r["producto"]].append(r)

    for prod in sorted(por_producto):
        mps = por_producto[prod]
        total_kg = sum(m["kg_por_ton"] for m in mps if m["kg_por_ton"])
        print(f"\n{prod} ({len(mps)} MPs, {total_kg:.1f} kg/ton):")
        for m in mps:
            kg = f'{m["kg_por_ton"]:.1f}' if m["kg_por_ton"] else "?"
            pct = f'{m["porcentaje"]:.2f}' if m["porcentaje"] else "?"
            print(f"  {m['materia_prima']:45s} {kg:>8s} kg/ton  ({pct}%)")


if __name__ == "__main__":
    main()
