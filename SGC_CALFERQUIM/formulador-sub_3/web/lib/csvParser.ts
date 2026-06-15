/**
 * Parser de CSV de insumos (mp-pt_mzr.csv).
 * Separador: punto y coma (;)
 * Codificación: esperado UTF-8 con BOM opcional.
 */

import { NUTRIENTES, type Nutriente } from "./calculation";

export interface ParsedRow {
  cod: string;
  producto: string;
  clase: string;
  tipo: string;
  test: string;
  nutrients: Partial<Record<Nutriente, number>>;
}

export function parseCsvInsumos(csvText: string): {
  rows: ParsedRow[];
  errors: string[];
} {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .trimEnd()
    .split("\n");

  if (lines.length < 2) {
    return { rows: [], errors: ["CSV vacío o sin datos"] };
  }

  const header = lines[0].trim().split(";");
  const expected = [
    "COD", "PRODUCTO", "CLASE", "TIPO", "Test", "C", "N", "N-NH4", "N-NO3",
    "N-org", "N-ur", "P", "K", "CaO", "MgO", "S", "B", "Co", "Cu", "Fe",
    "Mn", "Mo", "SiO2", "Zn", "Na"
  ];

  const errors: string[] = [];

  // Validar header
  if (header.length < expected.length) {
    errors.push(`Header incompleto: ${header.length} columnas, esperado ${expected.length}`);
  }

  const nutrientMap: Record<string, Nutriente> = {
    "N-NH4": "N_NH4",
    "N-NO3": "N_NO3",
    "N-org": "N_org",
    "N-ur": "N_ur",
    C: "C",
    N: "N",
    P: "P",
    K: "K",
    CaO: "CaO",
    MgO: "MgO",
    S: "S",
    B: "B",
    Co: "Co",
    Cu: "Cu",
    Fe: "Fe",
    Mn: "Mn",
    Mo: "Mo",
    SiO2: "SiO2",
    Zn: "Zn",
    Na: "Na",
  };

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(";");
    const cod = cols[0]?.trim() ?? "";
    const producto = cols[1]?.trim() ?? "";
    const clase = cols[2]?.trim() ?? "";
    const tipo = cols[3]?.trim() ?? "";
    const test = cols[4]?.trim() ?? "";

    if (!cod) {
      errors.push(`Fila ${i + 1}: COD vacío`);
      continue;
    }
    if (!producto) {
      errors.push(`Fila ${i + 1}: PRODUCTO vacío`);
      continue;
    }

    const nutrients: Partial<Record<Nutriente, number>> = {};
    for (let j = 5; j < header.length; j++) {
      const key = header[j]?.trim();
      const raw = cols[j]?.trim() ?? "";
      if (!raw) continue;
      const mapped = nutrientMap[key];
      if (!mapped) continue;
      const val = parseFloat(raw.replace(",", "."));
      if (isNaN(val)) {
        errors.push(`Fila ${i + 1}: valor no numérico para ${key}: ${raw}`);
      } else {
        nutrients[mapped] = val;
      }
    }

    rows.push({ cod, producto, clase, tipo, test, nutrients });
  }

  return { rows, errors };
}

export function classifyClass(cod: string, claseCsv: string): "MP" | "PT" | "MZR" {
  if (cod.startsWith("R") && /^R\d*$/.test(cod)) {
    return "MZR";
  }
  if (claseCsv === "MP") return "MP";
  if (claseCsv === "PT") return "PT";
  // Fallback: si no se reconoce, asumir PT
  return "PT";
}
