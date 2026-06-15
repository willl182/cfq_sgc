/**
 * Parser de CSV con separador ;
 * Convierte el CSV del ICA a formato estructurado
 */

import type { Composition } from "../../convex/lib/formulas";

export interface CSVRow {
  externalCode: string;
  name: string;
  class: "MP" | "PT" | "MZR";
  type: "G" | "P" | "L" | "C";
  originalCode?: string;
  composition: Composition;
}

export interface ParseResult {
  rows: CSVRow[];
  errors: string[];
  summary: {
    total: number;
    valid: number;
    mp: number;
    pt: number;
    mzr: number;
  };
}

// Mapeo de columnas del CSV a claves de composición
const COLUMN_MAP: Record<string, keyof Composition> = {
  "C": "C",
  "N": "N",
  "N-NH4": "N_NH4",
  "N-NO3": "N_NO3",
  "N-org": "N_org",
  "N-ur": "N_ur",
  "P": "P",
  "K": "K",
  "CaO": "CaO",
  "MgO": "MgO",
  "S": "S",
  "B": "B",
  "Co": "Co",
  "Cu": "Cu",
  "Fe": "Fe",
  "Mn": "Mn",
  "Mo": "Mo",
  "SiO2": "SiO2",
  "Zn": "Zn",
  "Na": "Na",
};

/**
 * Parsea una línea del CSV
 */
function parseLine(line: string, headers: string[]): Record<string, string> | null {
  const values = line.split(";");
  if (values.length !== headers.length) {
    return null;
  }
  
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = values[index]?.trim() || "";
  });
  
  return record;
}

/**
 * Determina la clase de un item (MP, PT, MZR)
 */
function determineClass(clase: string, cod: string): "MP" | "PT" | "MZR" {
  if (clase === "MP") return "MP";
  
  // MZR son PTs con COD = "R", "R1", "R2", etc.
  if (/^R\d*$/.test(cod)) return "MZR";
  
  return "PT";
}

/**
 * Parsea un valor numérico del CSV
 */
function parseNumericValue(value: string): number {
  if (!value || value.trim() === "") return 0;
  
  // Reemplazar coma por punto para decimales
  const normalized = value.replace(",", ".");
  const num = parseFloat(normalized);
  
  return isNaN(num) ? 0 : num;
}

/**
 * Parsea el CSV completo
 */
export function parseCSV(csvText: string): ParseResult {
  const lines = csvText.split("\n").filter(line => line.trim() !== "");
  
  if (lines.length === 0) {
    return {
      rows: [],
      errors: ["CSV vacío"],
      summary: { total: 0, valid: 0, mp: 0, pt: 0, mzr: 0 },
    };
  }
  
  // Parsear headers
  const headers = lines[0].split(";").map(h => h.trim());
  
  // Validar headers requeridos
  const requiredHeaders = ["COD", "PRODUCTO", "CLASE", "TIPO"];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    return {
      rows: [],
      errors: [`Headers faltantes: ${missingHeaders.join(", ")}`],
      summary: { total: 0, valid: 0, mp: 0, pt: 0, mzr: 0 },
    };
  }
  
  const rows: CSVRow[] = [];
  const errors: string[] = [];
  let mpCount = 0;
  let ptCount = 0;
  let mzrCount = 0;
  
  // Parsear cada línea de datos
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const record = parseLine(line, headers);
    
    if (!record) {
      errors.push(`Línea ${i + 1}: Número de columnas incorrecto`);
      continue;
    }
    
    const cod = record["COD"];
    const producto = record["PRODUCTO"];
    const clase = record["CLASE"];
    const tipo = record["TIPO"];
    
    // Validar campos requeridos
    if (!cod || !producto || !clase || !tipo) {
      errors.push(`Línea ${i + 1}: Campos requeridos faltantes`);
      continue;
    }
    
    // Determinar clase
    const itemClass = determineClass(clase, cod);
    
    // Parsear composición
    const composition: Composition = {
      C: 0, N: 0, N_NH4: 0, N_NO3: 0, N_org: 0, N_ur: 0,
      P: 0, K: 0, CaO: 0, MgO: 0, S: 0, B: 0,
      Co: 0, Cu: 0, Fe: 0, Mn: 0, Mo: 0, SiO2: 0, Zn: 0, Na: 0,
    };
    
    for (const [csvCol, nutrientKey] of Object.entries(COLUMN_MAP)) {
      if (record[csvCol] !== undefined) {
        composition[nutrientKey] = parseNumericValue(record[csvCol]);
      }
    }
    
    // Crear fila
    const row: CSVRow = {
      externalCode: cod,
      name: producto,
      class: itemClass,
      type: tipo as "G" | "P" | "L" | "C",
      composition,
    };
    
    // Agregar originalCode si es MZR
    if (itemClass === "MZR") {
      row.originalCode = cod;
    }
    
    rows.push(row);
    
    // Contar por clase
    if (itemClass === "MP") mpCount++;
    else if (itemClass === "MZR") mzrCount++;
    else ptCount++;
  }
  
  return {
    rows,
    errors,
    summary: {
      total: lines.length - 1, // Excluir header
      valid: rows.length,
      mp: mpCount,
      pt: ptCount,
      mzr: mzrCount,
    },
  };
}
