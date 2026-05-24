#!/usr/bin/env python3
"""Extrae materias primas y cantidades desde balances .xlsx de dossiers.

Recorre `SGC_CALFERQUIM/08_Dossier_Productos_Registrados`, detecta los libros
de balance en `05_Balance_Masas/`, ubica la tabla que contiene
`MATERIA PRIMA` + `Kg/Ton` y exporta un consolidado CSV con:

- dossier
- archivo_balance
- hoja
- fila_excel
- materia_prima
- kg_ton
- pct_100kg

Usa solo biblioteca estandar. No modifica los archivos fuente.
"""

from __future__ import annotations

import argparse
import csv
import re
from dataclasses import dataclass
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent
DEFAULT_ROOT = BASE_DIR.parent / "05_Dossier_Productos"
DEFAULT_OUTPUT = DEFAULT_ROOT / "_reportes_balance_masas" / "materias_primas_balances.csv"

NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}

STOP_NAME_TOKENS = (
    "TOTAL",
    "SUMATORIA",
    "GRADO",
    "CERTIFICADO",
    "RESULTADOS",
    "RESULTADO",
    "CONTENIDOS",
    "CONTENIDO",
    "SOLICITUD DE REGISTRO",
    "TOLERANCIA",
    "CUMPLE CON CONTENIDO",
    "RESOLUCION ICA",
)

SKIP_FILE_PATTERNS = (
    r"m[ée]todo",
    r"origen\s*materia",
)


@dataclass
class ExtractedRow:
    dossier: str
    archivo_balance: str
    hoja: str
    fila_excel: int
    materia_prima: str
    kg_ton: float
    pct_100kg: str


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())


def normalize_key(value: str) -> str:
    text = clean_text(value).upper()
    text = text.replace("Ó", "O").replace("Í", "I").replace("Á", "A")
    text = text.replace("É", "E").replace("Ú", "U").replace("Ü", "U")
    return text


def parse_number(value: str) -> float | None:
    text = clean_text(value)
    if not text:
        return None
    text = text.replace("%", "")
    if "," in text and "." in text:
        if text.rfind(",") > text.rfind("."):
            text = text.replace(".", "").replace(",", ".")
        else:
            text = text.replace(",", "")
    elif "," in text:
        text = text.replace(".", "").replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return None


def should_skip_file(path: Path) -> bool:
    return any(re.search(pattern, path.name, re.IGNORECASE) for pattern in SKIP_FILE_PATTERNS)


def iter_balance_files(root: Path) -> list[Path]:
    files = []
    for path in sorted(root.glob("*/05_Balance_Masas/*.xlsx")):
        if should_skip_file(path):
            continue
        files.append(path)
    return files


def column_index(cell_ref: str) -> int:
    letters = "".join(ch for ch in cell_ref if ch.isalpha()).upper()
    idx = 0
    for ch in letters:
        idx = idx * 26 + (ord(ch) - ord("A") + 1)
    return idx - 1


def read_shared_strings(archive: ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    values = []
    for item in root.findall("a:si", NS):
        values.append("".join(node.text or "" for node in item.iterfind(".//a:t", NS)))
    return values


def workbook_sheets(archive: ZipFile) -> list[tuple[str, str]]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    rel_map = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels}
    sheets = []
    for sheet in workbook.find("a:sheets", NS):
        rid = sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
        target = rel_map[rid]
        if target.startswith("/"):
            target = target.lstrip("/")
        if not target.startswith("xl/"):
            target = "xl/" + target
        sheets.append((sheet.attrib["name"], target))
    return sheets


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "s":
        value = cell.find("a:v", NS)
        return shared_strings[int(value.text)] if value is not None else ""
    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.iterfind(".//a:t", NS))
    value = cell.find("a:v", NS)
    return value.text if value is not None else ""


def read_sheet_rows(archive: ZipFile, sheet_target: str, shared_strings: list[str]) -> list[tuple[int, dict[int, str]]]:
    root = ET.fromstring(archive.read(sheet_target))
    rows = []
    for row in root.findall(".//a:sheetData/a:row", NS):
        row_num = int(row.attrib["r"])
        values: dict[int, str] = {}
        for cell in row.findall("a:c", NS):
            ref = cell.attrib.get("r", "")
            idx = column_index(ref)
            values[idx] = clean_text(cell_value(cell, shared_strings))
        rows.append((row_num, values))
    return rows


def find_header(rows: list[tuple[int, dict[int, str]]]) -> tuple[int, int, int, int | None] | None:
    for row_num, row in rows:
        materia_col = None
        kg_col = None
        pct_col = None
        for col_idx, raw_value in row.items():
            value = normalize_key(raw_value)
            if value == "MATERIA PRIMA":
                materia_col = col_idx
            elif value in {"KG/TON", "KG / TON", "KG TON", "KG/TON."}:
                kg_col = col_idx
            elif value in {"%/100 KG", "%/100KG", "% / 100 KG"}:
                pct_col = col_idx
        if materia_col is not None and kg_col is not None:
            return row_num, materia_col, kg_col, pct_col
    return None


def is_stop_row(name: str) -> bool:
    upper_name = normalize_key(name)
    return any(token in upper_name for token in STOP_NAME_TOKENS)


def extract_rows_from_sheet(
    dossier: str,
    balance_file: Path,
    sheet_name: str,
    rows: list[tuple[int, dict[int, str]]],
) -> list[ExtractedRow]:
    header = find_header(rows)
    if header is None:
        return []

    header_row, materia_col, kg_col, pct_col = header
    extracted: list[ExtractedRow] = []

    for row_num, row in rows:
        if row_num <= header_row:
            continue

        materia = clean_text(row.get(materia_col, ""))
        kg_raw = clean_text(row.get(kg_col, ""))
        pct_raw = clean_text(row.get(pct_col, "")) if pct_col is not None else ""

        if not materia:
            continue
        if is_stop_row(materia):
            break

        kg_value = parse_number(kg_raw)
        if kg_value is None:
            continue

        extracted.append(
            ExtractedRow(
                dossier=dossier,
                archivo_balance=str(balance_file.relative_to(balance_file.parents[2])),
                hoja=sheet_name,
                fila_excel=row_num,
                materia_prima=materia,
                kg_ton=kg_value,
                pct_100kg=pct_raw,
            )
        )

    return extracted


def extract_from_workbook(balance_file: Path) -> list[ExtractedRow]:
    dossier = balance_file.parents[1].name
    with ZipFile(balance_file) as archive:
        shared_strings = read_shared_strings(archive)
        extracted: list[ExtractedRow] = []
        for sheet_name, sheet_target in workbook_sheets(archive):
            rows = read_sheet_rows(archive, sheet_target, shared_strings)
            extracted.extend(extract_rows_from_sheet(dossier, balance_file, sheet_name, rows))
        return extracted


def write_csv(output_path: Path, rows: list[ExtractedRow]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "dossier",
                "archivo_balance",
                "hoja",
                "fila_excel",
                "materia_prima",
                "kg_ton",
                "pct_100kg",
            ],
        )
        writer.writeheader()
        for row in rows:
            pct_value = parse_number(row.pct_100kg)
            writer.writerow(
                {
                    "dossier": row.dossier,
                    "archivo_balance": row.archivo_balance,
                    "hoja": row.hoja,
                    "fila_excel": row.fila_excel,
                    "materia_prima": row.materia_prima,
                    "kg_ton": f"{row.kg_ton:.6f}".rstrip("0").rstrip("."),
                    "pct_100kg": (
                        f"{pct_value:.6f}".rstrip("0").rstrip(".")
                        if pct_value is not None
                        else row.pct_100kg
                    ),
                }
            )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extrae materias primas y cantidades desde balances .xlsx de dossiers."
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=DEFAULT_ROOT,
        help="Raiz del dossier de productos registrados.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Ruta del CSV consolidado de salida.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    balance_files = iter_balance_files(args.root)
    extracted: list[ExtractedRow] = []

    for balance_file in balance_files:
        extracted.extend(extract_from_workbook(balance_file))

    write_csv(args.output, extracted)

    dossiers = sorted({row.dossier for row in extracted})
    print(f"Balances revisados: {len(balance_files)}")
    print(f"Dossiers con extraccion: {len(dossiers)}")
    print(f"Filas extraidas: {len(extracted)}")
    print(f"CSV generado: {args.output}")


if __name__ == "__main__":
    main()
