#!/usr/bin/env python3
"""Genera balances de masas trazables para dossiers desde list.csv y comp.csv.

Salida:
- Un CSV de detalle por dossier en `05_Balance_Masas/`
- Un CSV de resumen de nutrientes por dossier
- Un reporte maestro Markdown y CSV de cobertura

No modifica archivos historicos existentes.
"""

from __future__ import annotations

import csv
import re
import unicodedata
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


BASE_DIR = Path(__file__).resolve().parent
LIST_PATH = BASE_DIR / "list.csv"
COMP_PATH = BASE_DIR / "comp.csv"
DOSSIER_ROOT = BASE_DIR / "SGC_CALFERQUIM" / "05_Dossier_Productos"
REPORT_DIR = DOSSIER_ROOT / "_reportes_balance_masas"

NUTRIENT_COLUMNS = [
    "N",
    "N-NH4",
    "N-NO3",
    "N-org",
    "N-ur",
    "P",
    "K",
    "CaO",
    "MgO",
    "S",
    "B",
    "Co",
    "Cu",
    "Fe",
    "Mn",
    "Mo",
    "SiO2",
    "Zn",
    "Na",
]

PACKAGING_TOKENS = ("EMPAQUE", "LINER", "SACO", "BULTO", "BOLSA", "ETIQUETA")

# Alias manuales conservadores para casos muy evidentes en el repositorio.
DOSSIER_CODE_OVERRIDES = {
    "15_BORO GRANULADO": "123",
    "24_FERTIMENORES": "161",
    "49_SILIMAGRAM": "35",
    "55_SULFATO ZINC 22": "997",
}


@dataclass
class MatchResult:
    status: str
    product_code: str = ""
    product_name: str = ""
    reason: str = ""


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = value.upper().replace("_", " ").replace("-", " ")
    value = re.sub(r"\bX\s+KILO\b", " ", value)
    value = re.sub(r"\bCALFERQUIM\b", " ", value)
    value = re.sub(r"\bSN\b", " ", value)
    value = re.sub(r"\bGRADO\b", " ", value)
    value = re.sub(r"\bMF\b", " ", value)
    value = re.sub(r"\bMFE\b", " ", value)
    value = re.sub(r"\bFE\b", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def parse_number(value: str) -> float:
    text = clean_text(value)
    if not text:
        return 0.0
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
        return 0.0


def fmt_num(value: float) -> str:
    return f"{value:.4f}".rstrip("0").rstrip(".")


def is_packaging(description: str) -> bool:
    desc = clean_text(description).upper()
    return any(token in desc for token in PACKAGING_TOKENS)


def load_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def nutrient_signature(row: dict[str, str]) -> tuple[float, ...]:
    return tuple(parse_number(row.get(column, "")) for column in NUTRIENT_COLUMNS)


def build_product_matcher(comp_rows: Iterable[dict[str, str]]) -> dict[str, list[dict[str, str]]]:
    by_norm: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in comp_rows:
        if clean_text(row.get("CLASE", "")) != "PT":
            continue
        by_norm[normalize(row.get("PRODUCTO", ""))].append(row)
    return dict(by_norm)


def choose_comp_mp_row(candidates: list[dict[str, str]], lista_code: str) -> tuple[dict[str, str] | None, str]:
    if not candidates:
        return None, "sin_fila_comp_mp"

    lista_code = clean_text(lista_code)
    if lista_code and lista_code != "0":
        exact = [row for row in candidates if clean_text(row.get("Cprov", "")) == lista_code]
        if exact:
            return exact[0], "proveedor_exacto"

    signatures = {nutrient_signature(row) for row in candidates}
    if len(signatures) == 1:
        return candidates[0], "proveedor_generico_misma_composicion"

    if len(candidates) == 1:
        return candidates[0], "fila_unica"

    return None, "proveedor_ambiguo"


def find_product_match(
    dossier_name: str,
    dossier_norm: str,
    comp_pt_by_norm: dict[str, list[dict[str, str]]],
    list_codes: set[str],
) -> MatchResult:
    if dossier_name in DOSSIER_CODE_OVERRIDES:
        code = DOSSIER_CODE_OVERRIDES[dossier_name]
        for rows in comp_pt_by_norm.values():
            for row in rows:
                if clean_text(row.get("COD", "")) == code:
                    return MatchResult(
                        status="matched_override",
                        product_code=code,
                        product_name=clean_text(row.get("PRODUCTO", "")),
                        reason="override_manual_conservador",
                    )

    exact = comp_pt_by_norm.get(dossier_norm, [])
    if len(exact) == 1:
        row = exact[0]
        return MatchResult(
            status="matched_exact",
            product_code=clean_text(row.get("COD", "")),
            product_name=clean_text(row.get("PRODUCTO", "")),
            reason="comp_exacto",
        )

    if len(exact) > 1:
        rows_in_list = [row for row in exact if clean_text(row.get("COD", "")) in list_codes]
        if len(rows_in_list) == 1:
            row = rows_in_list[0]
            return MatchResult(
                status="matched_exact_disambiguated",
                product_code=clean_text(row.get("COD", "")),
                product_name=clean_text(row.get("PRODUCTO", "")),
                reason="comp_exacto_desambiguado_por_list",
            )
        return MatchResult(status="ambiguous_comp", reason="multiples_productos_comp")

    return MatchResult(status="missing_comp", reason="sin_producto_en_comp")


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    ensure_dir(path.parent)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    list_rows = load_csv(LIST_PATH)
    comp_rows = load_csv(COMP_PATH)

    list_by_product: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in list_rows:
        list_by_product[clean_text(row.get("ITEM PADRE", ""))].append(row)

    list_codes = set(list_by_product)
    comp_pt_by_norm = build_product_matcher(comp_rows)

    comp_mp_by_code: dict[str, list[dict[str, str]]] = defaultdict(list)
    comp_product_by_code: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in comp_rows:
        code = clean_text(row.get("COD", ""))
        if not code:
            continue
        if clean_text(row.get("CLASE", "")) == "MP":
            comp_mp_by_code[code].append(row)
        elif clean_text(row.get("CLASE", "")) == "PT":
            comp_product_by_code[code].append(row)

    ensure_dir(REPORT_DIR)

    master_rows: list[dict[str, str]] = []

    for dossier_dir in sorted(path for path in DOSSIER_ROOT.iterdir() if path.is_dir() and not path.name.startswith("_")):
        dossier_name = dossier_dir.name
        display_name = re.sub(r"^\d+_", "", dossier_name)
        dossier_norm = normalize(display_name)
        match = find_product_match(dossier_name, dossier_norm, comp_pt_by_norm, list_codes)

        master_row = {
            "dossier": dossier_name,
            "producto_dossier": display_name,
            "norm_dossier": dossier_norm,
            "codigo_producto_comp": match.product_code,
            "producto_comp": match.product_name,
            "estado_match_comp": match.status,
            "motivo_match_comp": match.reason,
            "estado_list": "",
            "detalle_list": "",
            "archivo_detalle": "",
            "archivo_resumen": "",
        }

        if match.status.startswith("matched"):
            if match.product_code not in list_by_product:
                master_row["estado_list"] = "sin_formula_en_list"
                master_row["detalle_list"] = "codigo_en_comp_sin_ITEM_PADRE_en_list"
                master_rows.append(master_row)
                continue

            product_rows = list_by_product[match.product_code]
            product_comp = comp_product_by_code.get(match.product_code, [])
            product_comp_row = product_comp[0] if product_comp else {}

            detail_rows: list[dict[str, str]] = []
            nutrient_totals = {column: 0.0 for column in NUTRIENT_COLUMNS}
            total_mass = 0.0
            formulation_mass = 0.0
            missing_comp_mp = 0
            ambiguous_mp = 0

            for row in product_rows:
                mp_code = clean_text(row.get("ITEM MP", "")).lstrip("0") or "0"
                candidates = comp_mp_by_code.get(mp_code, [])
                chosen_mp, mp_match_reason = choose_comp_mp_row(candidates, row.get("LISTA", ""))
                qty = parse_number(row.get("CANTIDAD R", ""))
                packaging = is_packaging(row.get("DESC ITEM M.P", ""))

                total_mass += qty
                if not packaging:
                    formulation_mass += qty

                nutrient_values = {}
                for nutrient in NUTRIENT_COLUMNS:
                    pct = parse_number(chosen_mp.get(nutrient, "")) if chosen_mp else 0.0
                    kg = qty * pct / 100.0 if not packaging else 0.0
                    nutrient_values[nutrient] = kg
                    if not packaging:
                        nutrient_totals[nutrient] += kg

                if chosen_mp is None:
                    if candidates:
                        ambiguous_mp += 1
                    else:
                        missing_comp_mp += 1

                detail_row = {
                    "codigo_producto": match.product_code,
                    "producto_dossier": display_name,
                    "producto_comp": match.product_name,
                    "item_padre": clean_text(row.get("ITEM PADRE", "")),
                    "desc_item_padre": clean_text(row.get("DESC ITEM PADRE", "")),
                    "codigo_mp": mp_code,
                    "desc_mp": clean_text(row.get("DESC ITEM M.P", "")),
                    "lista_proveedor": clean_text(row.get("LISTA", "")),
                    "cantidad_kg": fmt_num(qty),
                    "es_empaque": "SI" if packaging else "NO",
                    "match_comp_mp": mp_match_reason,
                    "comp_mp_nombre": clean_text(chosen_mp.get("PRODUCTO", "")) if chosen_mp else "",
                    "comp_mp_proveedor": clean_text(chosen_mp.get("PROVEEDOR", "")) if chosen_mp else "",
                    "comp_mp_cprov": clean_text(chosen_mp.get("Cprov", "")) if chosen_mp else "",
                }

                for nutrient in NUTRIENT_COLUMNS:
                    detail_row[f"pct_{nutrient}"] = fmt_num(parse_number(chosen_mp.get(nutrient, "")) if chosen_mp else 0.0)
                    detail_row[f"kg_{nutrient}"] = fmt_num(nutrient_values[nutrient])

                detail_rows.append(detail_row)

            for row in detail_rows:
                qty = parse_number(row["cantidad_kg"])
                row["pct_masa_total"] = fmt_num((qty / total_mass * 100.0) if total_mass else 0.0)
                row["pct_masa_formulacion"] = fmt_num((qty / formulation_mass * 100.0) if formulation_mass and row["es_empaque"] == "NO" else 0.0)

            summary_rows: list[dict[str, str]] = []
            for nutrient in NUTRIENT_COLUMNS:
                declared = parse_number(product_comp_row.get(nutrient, "")) if product_comp_row else 0.0
                calculated = (nutrient_totals[nutrient] / formulation_mass * 100.0) if formulation_mass else 0.0
                summary_rows.append(
                    {
                        "codigo_producto": match.product_code,
                        "producto_dossier": display_name,
                        "producto_comp": match.product_name,
                        "nutriente": nutrient,
                        "declarado_comp_pct": fmt_num(declared),
                        "calculado_formula_pct": fmt_num(calculated),
                        "delta_pct": fmt_num(calculated - declared),
                        "kg_totales_en_formula": fmt_num(nutrient_totals[nutrient]),
                        "masa_formulacion_kg": fmt_num(formulation_mass),
                    }
                )

            balance_dir = dossier_dir / "05_Balance_Masas"
            ensure_dir(balance_dir)
            detail_path = balance_dir / "Balance_Masas_Generado_desde_list_comp_20260317.csv"
            summary_path = balance_dir / "Resumen_Nutrientes_Generado_desde_list_comp_20260317.csv"

            detail_fields = [
                "codigo_producto",
                "producto_dossier",
                "producto_comp",
                "item_padre",
                "desc_item_padre",
                "codigo_mp",
                "desc_mp",
                "lista_proveedor",
                "cantidad_kg",
                "pct_masa_total",
                "pct_masa_formulacion",
                "es_empaque",
                "match_comp_mp",
                "comp_mp_nombre",
                "comp_mp_proveedor",
                "comp_mp_cprov",
            ] + [f"pct_{nutrient}" for nutrient in NUTRIENT_COLUMNS] + [f"kg_{nutrient}" for nutrient in NUTRIENT_COLUMNS]

            summary_fields = [
                "codigo_producto",
                "producto_dossier",
                "producto_comp",
                "nutriente",
                "declarado_comp_pct",
                "calculado_formula_pct",
                "delta_pct",
                "kg_totales_en_formula",
                "masa_formulacion_kg",
            ]

            write_csv(detail_path, detail_fields, detail_rows)
            write_csv(summary_path, summary_fields, summary_rows)

            master_row["estado_list"] = "balance_generado"
            master_row["detalle_list"] = (
                f"filas_formula={len(product_rows)}; "
                f"masa_total_kg={fmt_num(total_mass)}; "
                f"masa_formulacion_kg={fmt_num(formulation_mass)}; "
                f"mp_sin_comp={missing_comp_mp}; "
                f"mp_ambiguas={ambiguous_mp}"
            )
            master_row["archivo_detalle"] = str(detail_path.relative_to(BASE_DIR))
            master_row["archivo_resumen"] = str(summary_path.relative_to(BASE_DIR))
            master_rows.append(master_row)
            continue

        master_row["estado_list"] = "sin_balance"
        master_row["detalle_list"] = "sin_correspondencia_comp"
        master_rows.append(master_row)

    master_csv_path = REPORT_DIR / "reporte_balance_masas_20260317.csv"
    write_csv(
        master_csv_path,
        [
            "dossier",
            "producto_dossier",
            "norm_dossier",
            "codigo_producto_comp",
            "producto_comp",
            "estado_match_comp",
            "motivo_match_comp",
            "estado_list",
            "detalle_list",
            "archivo_detalle",
            "archivo_resumen",
        ],
        master_rows,
    )

    generated = [row for row in master_rows if row["estado_list"] == "balance_generado"]
    missing_list = [row for row in master_rows if row["estado_list"] == "sin_formula_en_list"]
    unresolved = [row for row in master_rows if row["estado_list"] == "sin_balance"]

    report_lines = [
        "# Reporte de balance de masas",
        "",
        "Generado automaticamente desde `list.csv` y `comp.csv`.",
        "",
        f"- Dossiers revisados: {len(master_rows)}",
        f"- Balances generados: {len(generated)}",
        f"- Productos con match en `comp.csv` pero sin formula en `list.csv`: {len(missing_list)}",
        f"- Dossiers sin match confiable en `comp.csv`: {len(unresolved)}",
        "",
        "## Balances generados",
        "",
    ]

    for row in generated:
        report_lines.append(
            f"- `{row['dossier']}` -> codigo `{row['codigo_producto_comp']}`; {row['detalle_list']}"
        )

    report_lines.extend(["", "## En comp pero no en list", ""])
    for row in missing_list:
        report_lines.append(
            f"- `{row['dossier']}` -> codigo `{row['codigo_producto_comp']}` / `{row['producto_comp']}`"
        )

    report_lines.extend(["", "## Sin match confiable", ""])
    for row in unresolved:
        report_lines.append(
            f"- `{row['dossier']}` -> estado `{row['estado_match_comp']}` ({row['motivo_match_comp']})"
        )

    (REPORT_DIR / "reporte_balance_masas_20260317.md").write_text("\n".join(report_lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
