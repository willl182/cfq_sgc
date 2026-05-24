#!/usr/bin/env python3
"""Analisis de produccion de plantas granuladoras.

Genera fichas Markdown por producto y un resumen general a partir de
`produccion_plantas.csv`, usando solo biblioteca estandar.
"""

from __future__ import annotations

import argparse
import csv
import math
import re
import shutil
import statistics
import subprocess
import unicodedata
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent
CSV_PATH = PROJECT_ROOT / "_Legacy_y_Otros" / "_Otros_Archivos" / "produccion_plantas.csv"
RESPRODFIN_PATH = PROJECT_ROOT / "_Legacy_y_Otros" / "_Otros_Archivos" / "resprodfin.csv"
OUTPUT_ROOT = PROJECT_ROOT / "SGC_CALFERQUIM" / "00_Inbox"

ITEM_MAP = {
    "35": "SILIMAGRAN",
    "62": "NUCLEO CAMASI GRIS",
    "65": "NUCLEO 4",
    "123": "BORO GRANULADO",
    "141": "SULFATO DE CALCIO",
    "155": "RAIFOS 20",
    "160": "ZUELO CA",
    "161": "FERTIMENORES",
    "208": "NUCLEO MAGNESIO",
    "300": "K2K",
    "452": "NUCLEO CAMASI ROJO",
    "558": "NUCLEO MAGNESIO-SILICIO EM",
    "563": "NUCLEO CAMASI YARA",
    "574": "NUCLEO FOSFORO 1",
    "579": "NUCLEO MANGANESO",
    "643": "FE SULFATO ZINC 22",
    "679": "NUCLEO FOSFORO 10",
    "803": "NUCLEO MAGNESIO-S",
    "997": "FE SULFATO ZINC 22",
}

OMIT_ITEMS = {"410", "564", "1275"}
INVALID_ITEM_VALUES = {"", "NA", "#N/A", "N/A"}
INVALID_TEXT_VALUES = {"", "NA", "N/A", "#N/A", "#ERROR!", "NULL", "NONE"}
NUMERIC_FIELDS = [
    "Cantidad produccion",
    "Materias primas consumo",
    "Polvillo vaciado",
    "Polvillo qqdo",
    "V. banda alimentadora",
    "Inclinacion olla",
    "V. olla granuladora",
    "V. tubo secador",
    "V. tubo enfriador",
    "# Trabajadores",
    "Horas trabajadas",
    "Minutos trabajados",
    "Tiempo promedio de producción",
]
PROCESS_FIELDS = [
    "V. banda alimentadora",
    "Inclinacion olla",
    "V. olla granuladora",
    "V. tubo secador",
    "V. tubo enfriador",
]
QUALITY_FIELDS = [
    "Prueba laboratorio # 1",
    "Prueba laboratorio #2",
    "Prueba laboratorio #3",
]
PLANTS = ["PLANTA 1", "PLANTA 2"]


def clean_text(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    return re.sub(r"\s+", " ", value)


def is_invalid_text(value: str) -> bool:
    return clean_text(value).upper() in INVALID_TEXT_VALUES


def parse_number(value: str) -> float | None:
    text = clean_text(value)
    if is_invalid_text(text):
        return None
    text = text.replace(".", "").replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return None


def parse_date(value: str) -> date | None:
    text = clean_text(value)
    if not text:
        return None
    for fmt in ("%d/%m/%Y", "%d/%m/%y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^A-Za-z0-9]+", "_", value).strip("_")
    return value or "producto"


def fmt_number(value: float | None, digits: int = 1) -> str:
    if value is None:
        return "N/D"
    return f"{value:,.{digits}f}".replace(",", "_").replace(".", ",").replace("_", ".")


def fmt_int(value: float | int | None) -> str:
    if value is None:
        return "N/D"
    return f"{int(round(value)):,}".replace(",", ".")


def fmt_pct(value: float | None) -> str:
    if value is None:
        return "N/D"
    return f"{value:.1f}%".replace(".", ",")


def fmt_date(value: date | None) -> str:
    if value is None:
        return "N/D"
    return value.isoformat()


def group_label(value: float | None) -> str:
    if value is None:
        return "N/D"
    if value <= 20:
        return "A - Rapido"
    if value <= 30:
        return "B - Medio"
    if value <= 45:
        return "C - Lento"
    return "D - Muy lento"


def summarize_numeric(values: list[float]) -> dict[str, float | None]:
    if not values:
        return {"n": 0, "mean": None, "median": None, "min": None, "max": None, "stdev": None}
    stdev = statistics.stdev(values) if len(values) > 1 else 0.0
    return {
        "n": len(values),
        "mean": statistics.mean(values),
        "median": statistics.median(values),
        "min": min(values),
        "max": max(values),
        "stdev": stdev,
    }


def infer_product_name(item: str, reference: str) -> str | None:
    item = clean_text(item)
    reference = clean_text(reference)
    if item in OMIT_ITEMS or item in INVALID_ITEM_VALUES:
        return None
    if item in ITEM_MAP:
        return ITEM_MAP[item]
    if reference and not is_invalid_text(reference):
        return reference
    return None


def parse_novedad(novedad: str, notes: str) -> bool:
    novedad = clean_text(novedad)
    notes = clean_text(notes)
    if novedad and not is_invalid_text(novedad):
        return True
    return bool(notes and notes.lower() != "sin registro")


def load_rows(path: Path) -> list[dict]:
    rows = []
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        for raw in reader:
            item = clean_text(raw.get("Item", ""))
            product = infer_product_name(item, raw.get("Referencia", ""))
            plant = clean_text(raw.get("Planta", ""))
            if not product or plant not in PLANTS:
                continue

            parsed = {field: parse_number(raw.get(field, "")) for field in NUMERIC_FIELDS}
            worked_minutes = None
            if parsed["Horas trabajadas"] is not None or parsed["Minutos trabajados"] is not None:
                worked_minutes = (parsed["Horas trabajadas"] or 0) * 60 + (parsed["Minutos trabajados"] or 0)

            qty = parsed["Cantidad produccion"]
            time_per_ton = parsed["Tiempo promedio de producción"]
            if time_per_ton in (None, 0) and qty and worked_minutes and qty > 0 and worked_minutes > 0:
                time_per_ton = worked_minutes / (qty / 1000)
            productivity = None
            if qty and worked_minutes and worked_minutes > 0:
                productivity = qty / (worked_minutes / 60)

            notes = clean_text(raw.get("Notas", ""))
            row = {
                "date": parse_date(raw.get("Fecha Produccion", "")),
                "week": clean_text(raw.get("SEMANA", "")),
                "day": clean_text(raw.get("DIA", "")),
                "item": item,
                "reference": clean_text(raw.get("Referencia", "")),
                "product": product,
                "shift": clean_text(raw.get("Turno", "")),
                "plant": plant,
                "quantity_kg": qty,
                "worked_minutes": worked_minutes,
                "time_per_ton": time_per_ton if time_per_ton and time_per_ton > 0 else None,
                "productivity_kg_h": productivity,
                "notes": notes,
                "novedad": parse_novedad(raw.get("Novedad", ""), notes),
                "granulador": clean_text(raw.get("Granulador", "")),
                "nombre": clean_text(raw.get("Nombre", "")),
                "quality": {field: clean_text(raw.get(field, "")) for field in QUALITY_FIELDS},
                "process": {field: parsed[field] for field in PROCESS_FIELDS},
            }
            rows.append(row)
    return rows


def load_resprodfin(path: Path) -> dict[str, dict[str, str]]:
    """Carga resprodfin.csv y devuelve un dict {item_code: {col: valor}}."""
    data: dict[str, dict[str, str]] = {}
    if not path.exists():
        return data
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        for raw in reader:
            codigo = clean_text(raw.get("Codigo", ""))
            match = re.match(r"Total\s+(\d+)", codigo)
            if not match:
                continue
            item_code = match.group(1)
            data[item_code] = {
                "Humedad": clean_text(raw.get("Humedad", "")),
                "Dureza": clean_text(raw.get("Dureza", "")),
                "% Tamiz 4": clean_text(raw.get("% Tamiz 4", "")),
                "% Tamiz 5": clean_text(raw.get("% Tamiz 5", "")),
                "% Tamiz 10": clean_text(raw.get("% Tamiz 10", "")),
                "% Tamiz 18": clean_text(raw.get("% Tamiz 18", "")),
                "% Bandeja": clean_text(raw.get("% Bandeja", "")),
                "Abrasion": clean_text(raw.get("Abrasion", "")),
            }
    return data


def get_product_characteristics(items: list[str], resprodfin: dict[str, dict[str, str]]) -> list[dict[str, str]]:
    """Devuelve las filas de resprodfin que corresponden a los items del producto."""
    rows = []
    seen = set()
    for item in sorted(items):
        if item in resprodfin and item not in seen:
            seen.add(item)
            rows.append({"item": item, **resprodfin[item]})
    return rows


def index_by_product(rows: list[dict]) -> dict[str, dict[str, list[dict]]]:
    grouped: dict[str, dict[str, list[dict]]] = defaultdict(lambda: defaultdict(list))
    for row in rows:
        grouped[row["product"]][row["plant"]].append(row)
    for product in grouped.values():
        for records in product.values():
            records.sort(key=lambda entry: (entry["date"] or date.min, entry["shift"]))
    return dict(grouped)


def plant_metrics(records: list[dict]) -> dict:
    times = [r["time_per_ton"] for r in records if r["time_per_ton"] is not None]
    quantities = [r["quantity_kg"] for r in records if r["quantity_kg"] is not None and r["quantity_kg"] > 0]
    productivities = [r["productivity_kg_h"] for r in records if r["productivity_kg_h"] is not None]
    outliers = [r for r in records if r["time_per_ton"] is not None and r["time_per_ton"] > 100]

    quality_summary = {}
    for field in QUALITY_FIELDS:
        observed = [r["quality"][field] for r in records if clean_text(r["quality"][field])]
        if observed:
            quality_summary[field] = 100.0 * sum(v.upper() == "CUMPLE" for v in observed) / len(observed)
        else:
            quality_summary[field] = None

    process_summary = {
        field: summarize_numeric([r["process"][field] for r in records if r["process"][field] is not None])
        for field in PROCESS_FIELDS
    }

    novedad_rows = [r for r in records if r["novedad"]]
    normal_rows = [r for r in records if not r["novedad"]]
    notes_counter = Counter(r["notes"] for r in novedad_rows if r["notes"])
    granuladores = Counter(r["granulador"] for r in records if r["granulador"])
    nombres = Counter(r["nombre"] for r in records if r["nombre"])

    return {
        "records": len(records),
        "date_min": min((r["date"] for r in records if r["date"]), default=None),
        "date_max": max((r["date"] for r in records if r["date"]), default=None),
        "time": summarize_numeric(times),
        "quantity": summarize_numeric(quantities),
        "quantity_total": sum(quantities) if quantities else None,
        "productivity": summarize_numeric(productivities),
        "quality": quality_summary,
        "process": process_summary,
        "novedad_pct": 100.0 * len(novedad_rows) / len(records) if records else None,
        "novedad_time": summarize_numeric([r["time_per_ton"] for r in novedad_rows if r["time_per_ton"] is not None]),
        "normal_time": summarize_numeric([r["time_per_ton"] for r in normal_rows if r["time_per_ton"] is not None]),
        "notes": notes_counter,
        "granuladores": granuladores,
        "nombres": nombres,
        "outliers": outliers,
        "small_sample": len(records) < 5,
    }


def product_metrics(product: str, plant_rows: dict[str, list[dict]]) -> dict:
    all_rows = [row for records in plant_rows.values() for row in records]
    all_rows.sort(key=lambda entry: (entry["date"] or date.min, entry["plant"], entry["shift"]))
    plant_stats = {plant: plant_metrics(plant_rows.get(plant, [])) for plant in PLANTS}
    overall_times = [r["time_per_ton"] for r in all_rows if r["time_per_ton"] is not None]
    overall_qty = [r["quantity_kg"] for r in all_rows if r["quantity_kg"] is not None and r["quantity_kg"] > 0]
    return {
        "product": product,
        "items": sorted({r["item"] for r in all_rows}),
        "date_min": min((r["date"] for r in all_rows if r["date"]), default=None),
        "date_max": max((r["date"] for r in all_rows if r["date"]), default=None),
        "records": len(all_rows),
        "plants": plant_stats,
        "overall_time": summarize_numeric(overall_times),
        "overall_quantity": summarize_numeric(overall_qty),
        "overall_quantity_total": sum(overall_qty) if overall_qty else None,
        "group": group_label(statistics.mean(overall_times) if overall_times else None),
    }


def markdown_table(headers: list[str], rows: list[list[str]]) -> str:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
    lines.extend("| " + " | ".join(row) + " |" for row in rows)
    return "\n".join(lines)


def render_warnings(metrics: dict) -> list[str]:
    warnings = []
    for plant in PLANTS:
        stats = metrics["plants"][plant]
        if stats["small_sample"]:
            warnings.append(f"- {plant}: solo {stats['records']} turnos; estadisticas poco representativas.")
        if stats["outliers"]:
            warnings.append(
                f"- {plant}: {len(stats['outliers'])} turno(s) con tiempo > 100 min/ton; revisar outliers operativos."
            )
    return warnings


def render_product_file(metrics: dict, output_dir: Path, resprodfin: dict[str, dict[str, str]] | None = None) -> Path:
    product = metrics["product"]
    headers = ["Indicador", "PLANTA 1", "PLANTA 2"]
    rendimiento_rows = []
    variable_rows = []
    quality_rows = []
    novedad_lines = []
    operadores_rows = []

    for label, extractor, formatter in [
        ("Turnos analizados", lambda s: s["records"], fmt_int),
        ("Tiempo promedio (min/ton)", lambda s: s["time"]["mean"], lambda v: fmt_number(v, 2)),
        ("Mediana tiempo (min/ton)", lambda s: s["time"]["median"], lambda v: fmt_number(v, 2)),
        ("Min tiempo (min/ton)", lambda s: s["time"]["min"], lambda v: fmt_number(v, 2)),
        ("Max tiempo (min/ton)", lambda s: s["time"]["max"], lambda v: fmt_number(v, 2)),
        ("Desv. std tiempo", lambda s: s["time"]["stdev"], lambda v: fmt_number(v, 2)),
        ("Produccion promedio (kg)", lambda s: s["quantity"]["mean"], lambda v: fmt_number(v, 0)),
        ("Produccion total (kg)", lambda s: s["quantity_total"], fmt_int),
        ("Productividad promedio (kg/h)", lambda s: s["productivity"]["mean"], lambda v: fmt_number(v, 0)),
    ]:
        row = [label]
        for plant in PLANTS:
            row.append(formatter(extractor(metrics["plants"][plant])))
        rendimiento_rows.append(row)

    for field in PROCESS_FIELDS:
        row = [field]
        for plant in PLANTS:
            stat = metrics["plants"][plant]["process"][field]
            if stat["mean"] is None:
                row.append("N/D")
            else:
                row.append(
                    f"{fmt_number(stat['mean'], 1)} (min {fmt_number(stat['min'], 1)} / max {fmt_number(stat['max'], 1)})"
                )
        variable_rows.append(row)

    for field in QUALITY_FIELDS:
        quality_rows.append([field] + [fmt_pct(metrics["plants"][plant]["quality"][field]) for plant in PLANTS])

    for plant in PLANTS:
        stats = metrics["plants"][plant]
        top_notes = "; ".join(f"{note} ({count})" for note, count in stats["notes"].most_common(5)) or "Sin detalle"
        novedad_lines.append(
            f"- {plant}: {fmt_pct(stats['novedad_pct'])} con novedad. "
            f"Tiempo con novedad {fmt_number(stats['novedad_time']['mean'], 2)} min/ton vs "
            f"sin novedad {fmt_number(stats['normal_time']['mean'], 2)} min/ton. "
            f"Notas frecuentes: {top_notes}"
        )

        operadores_rows.append(
            [
                plant,
                ", ".join(f"{name} ({count})" for name, count in stats["granuladores"].most_common(3)) or "N/D",
                ", ".join(f"{name} ({count})" for name, count in stats["nombres"].most_common(3)) or "N/D",
            ]
        )

    warnings = render_warnings(metrics)
    content = [
        f"# Ficha de Produccion - {product}",
        "",
        f"- Items: {', '.join(metrics['items'])}",
        f"- Periodo analizado: {fmt_date(metrics['date_min'])} a {fmt_date(metrics['date_max'])}",
        f"- Grupo de velocidad: {metrics['group']}",
        f"- Turnos totales: {metrics['records']}",
        f"- Produccion total acumulada: {fmt_int(metrics['overall_quantity_total'])} kg",
        "",
        "## Rendimiento",
        "",
        markdown_table(headers, rendimiento_rows),
        "",
    ]

    # Tabla de caracteristicas del producto desde resprodfin.csv
    if resprodfin:
        char_rows = get_product_characteristics(metrics["items"], resprodfin)
        if char_rows:
            char_headers = ["Item", "Humedad", "Dureza", "Tamiz 4", "Tamiz 5", "Tamiz 10", "Tamiz 18", "Bandeja", "Abrasion"]
            char_table_rows = [
                [r["item"], r["Humedad"], r["Dureza"], r["% Tamiz 4"], r["% Tamiz 5"],
                 r["% Tamiz 10"], r["% Tamiz 18"], r["% Bandeja"], r["Abrasion"]]
                for r in char_rows
            ]
            content.extend([
                "## Caracteristicas del Producto",
                "",
                markdown_table(char_headers, char_table_rows),
                "",
            ])

    content.extend([
        "## Variables de Proceso",
        "",
        markdown_table(headers, variable_rows),
        "",
        "## Calidad",
        "",
        markdown_table(headers, quality_rows),
        "",
        "## Novedades y Paradas",
        "",
        *novedad_lines,
        "",
        "## Operadores Frecuentes",
        "",
        markdown_table(["Planta", "Granuladores", "Apoyo/Nombres"], operadores_rows),
    ])
    if warnings:
        content.extend(["", "## Alertas", "", *warnings])

    target = output_dir / f"Ficha_{slugify(product)}.md"
    target.write_text("\n".join(content) + "\n", encoding="utf-8")
    return target


def render_summary(product_stats: list[dict], output_dir: Path) -> Path:
    groups = defaultdict(list)
    for stats in product_stats:
        groups[stats["group"]].append(stats)
    for values in groups.values():
        values.sort(key=lambda entry: entry["overall_time"]["mean"] or math.inf)

    comparison_rows = []
    for stats in sorted(product_stats, key=lambda entry: entry["overall_quantity"]["mean"] or 0, reverse=True):
        comparison_rows.append(
            [
                stats["product"],
                stats["group"],
                fmt_number(stats["plants"]["PLANTA 1"]["time"]["mean"], 2),
                fmt_number(stats["plants"]["PLANTA 2"]["time"]["mean"], 2),
                fmt_int(sum(stats["plants"][plant]["quantity_total"] or 0 for plant in PLANTS)),
            ]
        )

    top_volume = sorted(
        product_stats,
        key=lambda entry: sum(entry["plants"][plant]["quantity_total"] or 0 for plant in PLANTS),
        reverse=True,
    )[:5]

    lines = [
        "# Resumen de Produccion de Plantas",
        "",
        f"- Fecha de generacion: {date.today().isoformat()}",
        f"- Productos analizados: {len(product_stats)}",
        "",
        "## Clasificacion por Velocidad",
        "",
    ]
    for group in ["A - Rapido", "B - Medio", "C - Lento", "D - Muy lento", "N/D"]:
        items = groups.get(group, [])
        if not items:
            continue
        lines.append(f"### {group}")
        lines.append("")
        for stats in items:
            lines.append(
                f"- {stats['product']}: {fmt_number(stats['overall_time']['mean'], 2)} min/ton, "
                f"{fmt_int(sum(stats['plants'][plant]['quantity_total'] or 0 for plant in PLANTS))} kg"
            )
        lines.append("")

    lines.extend(
        [
            "## Comparativo Planta 1 vs Planta 2",
            "",
            markdown_table(
                ["Producto", "Grupo", "P1 min/ton", "P2 min/ton", "Volumen total (kg)"],
                comparison_rows,
            ),
            "",
            "## Top 5 por Volumen",
            "",
        ]
    )
    for idx, stats in enumerate(top_volume, start=1):
        total_qty = sum(stats["plants"][plant]["quantity_total"] or 0 for plant in PLANTS)
        lines.append(f"{idx}. {stats['product']} - {fmt_int(total_qty)} kg")

    lines.extend(["", "## Indice de Fichas", ""])
    for stats in sorted(product_stats, key=lambda entry: entry["product"]):
        lines.append(f"- `Ficha_{slugify(stats['product'])}.md`")

    target = output_dir / f"Resumen_Produccion_Plantas_{date.today().strftime('%Y%m%d')}.md"
    target.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return target


def convert_to_docx(markdown_files: list[Path]) -> list[Path]:
    if not shutil.which("pandoc"):
        raise RuntimeError("pandoc no esta disponible para conversion a DOCX.")
    outputs = []
    for md_file in markdown_files:
        docx_path = md_file.with_suffix(".docx")
        subprocess.run(["pandoc", str(md_file), "-o", str(docx_path)], check=True)
        outputs.append(docx_path)
    return outputs


def main() -> int:
    parser = argparse.ArgumentParser(description="Genera fichas de produccion por producto.")
    parser.add_argument("--csv", default=str(CSV_PATH), help="Ruta al CSV de produccion.")
    parser.add_argument("--docx", action="store_true", help="Convierte las salidas Markdown a DOCX con pandoc.")
    args = parser.parse_args()

    csv_path = Path(args.csv).resolve()
    rows = load_rows(csv_path)
    if not rows:
        raise SystemExit("No se encontraron registros validos para analizar.")

    output_dir = OUTPUT_ROOT / f"Fichas_Produccion_{date.today().strftime('%Y%m%d')}"
    output_dir.mkdir(parents=True, exist_ok=True)

    resprodfin = load_resprodfin(RESPRODFIN_PATH)

    grouped = index_by_product(rows)
    product_stats = [product_metrics(product, plant_rows) for product, plant_rows in sorted(grouped.items())]
    markdown_files = [render_product_file(stats, output_dir, resprodfin) for stats in product_stats]
    summary_file = render_summary(product_stats, output_dir)
    markdown_files.append(summary_file)

    if args.docx:
        convert_to_docx(markdown_files)

    print(f"Registros analizados: {len(rows)}")
    print(f"Productos analizados: {len(product_stats)}")
    print(f"Directorio de salida: {output_dir}")
    if args.docx:
        print("Conversion DOCX completada.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
