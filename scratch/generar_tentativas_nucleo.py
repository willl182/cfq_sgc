#!/usr/bin/env python3
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VERIFY = ROOT / "SGC_CALFERQUIM" / "FORMULADOR - VERIFICAR.csv"
PROD = ROOT / "SGC_CALFERQUIM" / "FORMULADOR - PROD.csv"
OUT = ROOT / "scratch" / "tentativas_nucleo.csv"

TARGETS = {
    "NUCLEO N": ("611", "56f5a732"),
    "NUCLEO CAMASI GRIS": ("62", "62-L0"),
    "NUCLEO CAMASI ROJO": ("452", "452-L0"),
    "NUCLEO FERCON": ("140", "a609aee1"),
    "NUCLEO FOSFORO 10": ("679", "679-L03"),
    "NUCLEO MAGNESIO": ("208", "36dd6618"),
    "NUCLEO MAGNESIO-SILICIO EM": ("558", "558-L02"),
    "NUCLEO MENORES": ("61", "611fe1aa"),
}

NUTRIENTS = ["T_N", "T_P", "T_K", "T_CaO", "T_MgO", "T_S", "T_SiO2"]


def load_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def first_match(rows: list[dict[str, str]], cod: str, formula: str) -> dict[str, str] | None:
    for row in rows:
        if row.get("COD_PROD", "").strip() == cod and row.get("FORMULA", "").strip() == formula:
            return row
    for row in rows:
        if row.get("COD_PROD", "").strip() == cod:
            return row
    return None


def main() -> None:
    verify_rows = load_rows(VERIFY)
    prod_rows = load_rows(PROD)
    prod_by_name = {r["PRODUCTO"].strip().upper(): r for r in prod_rows}

    out_rows: list[dict[str, str]] = []
    for product, (cod, formula) in TARGETS.items():
        row = first_match(verify_rows, cod, formula)
        prod = prod_by_name.get(product.upper(), {})
        rec: dict[str, str] = {
            "producto": product,
            "cod": cod,
            "formula": formula,
            "hallado_en_verificar": "si" if row else "no",
            "hallado_en_prod": "si" if prod else "no",
        }
        for k in NUTRIENTS:
            rec[k] = row.get(k, "") if row else ""
        for k in ["P", "K", "CaO", "MgO", "S", "SiO2"]:
            if prod and prod.get(k, ""):
                rec[f"grado_{k}"] = prod.get(k, "")
        if row:
            for i in range(1, 12):
                cod_mp = row.get(f"{i}-COD", "").strip()
                nom_mp = row.get(f"{i}-NOMBRE", "").strip()
                cant_mp = row.get(f"{i}-CANTIDAD", "").strip()
                if cod_mp or nom_mp or cant_mp:
                    rec[f"mp{i}"] = f"{cod_mp}|{nom_mp}|{cant_mp}"
        out_rows.append(rec)

    fieldnames = sorted({k for row in out_rows for k in row.keys()})
    with OUT.open("w", newline="", encoding="utf-8") as handle:
        w = csv.DictWriter(handle, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(out_rows)

    print(OUT)


if __name__ == "__main__":
    main()
