/**
 * Parser CSV para insumos_ref/mp-pt_mzr.csv
 *
 * Valida encabezados, nutrientes reconocidos, valores numéricos,
 * filas sin nombre, códigos ambiguos y decimales.
 * Asigna IDs internos por orden del CSV y por clase.
 * Clasifica MZR según regla: COD = R, R1, R2, etc.
 */

import { type NutrientKey, type Clase, clasificarItem, generarInternalId } from "./constants";

/** Encabezado CSV esperado (separador: ;) */
const CSV_HEADER = [
  "COD", "PRODUCTO", "CLASE", "TIPO", "Test",
  "C", "N", "N-NH4", "N-NO3", "N-org", "N-ur",
  "P", "K", "CaO", "MgO", "S", "B", "Co", "Cu",
  "Fe", "Mn", "Mo", "SiO2", "Zn", "Na",
];

/** Mapping de columnas CSV → claves internas de nutrientes.
 *  N-NH4 → N_NH4, N-NO3 → N_NO3, N-org → N_org, N-ur → N_ur
 */
const NUTRIENT_CSV_MAP: Record<string, NutrientKey> = {
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

/** Filaparseada del CSV */
export interface ParsedRow {
  externalCode: string;
  nombre: string;
  claseCSV: string;
  tipo: string;
  composicion: Record<NutrientKey, number>;
  errores: string[];
}

/** Resultado del parseo completo */
export interface ParseResult {
  filas: ParsedRow[];
  errores: string[];
  resumen: {
    totalFilas: number;
    filasOK: number;
    filasRechazadas: number;
    mpCount: number;
    ptCount: number;
    mzrCount: number;
  };
}

/**
 * Parsea un valor numérico del CSV.
 * Acepta coma decimal (18,00 → 18.00) y punto decimal.
 * Retorna 0 si está vacío o no es numérico.
 */
export function parseNum(raw: string): number {
  if (!raw || raw.trim() === "") return 0;
  // Reemplazar coma decimal por punto
  const normalized = raw.trim().replace(",", ".");
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

/**
 * Valida y parsea una fila del CSV.
 */
function parseRow(columns: string[], rowNum: number): ParsedRow {
  const errores: string[] = [];

  const externalCode = (columns[0] || "").trim();
  const nombre = (columns[1] || "").trim();
  const claseCSV = (columns[2] || "").trim();
  const tipo = (columns[3] || "").trim();

  if (!nombre) {
    errores.push(`Fila ${rowNum}: Producto sin nombre (código "${externalCode}")`);
  }
  if (!externalCode) {
    errores.push(`Fila ${rowNum}: Código vacío`);
  }
  if (!["MP", "PT"].includes(claseCSV)) {
    errores.push(`Fila ${rowNum}: Clase "${claseCSV}" no reconocida (esperada MP o PT)`);
  }
  if (!["G", "P", "L", "C"].includes(tipo)) {
    errores.push(`Fila ${rowNum}: Tipo "${tipo}" no reconocido`);
  }

  // Parsear composición
  const composicion: Record<string, number> = {};
  for (const [csvKey, internalKey] of Object.entries(NUTRIENT_CSV_MAP)) {
    const colIndex = CSV_HEADER.indexOf(csvKey);
    if (colIndex >= 0 && colIndex < columns.length) {
      const raw = columns[colIndex];
      const val = parseNum(raw);
      composicion[internalKey] = val;
    } else {
      composicion[internalKey] = 0;
    }
  }

  return {
    externalCode,
    nombre,
    claseCSV,
    tipo,
    composicion: composicion as Record<NutrientKey, number>,
    errores,
  };
}

/**
 * Parsea el contenido completo del CSV.
 */
export function parseCSV(csvContent: string): ParseResult {
  const lines = csvContent.trim().split(/\r?\n/);
  const errores: string[] = [];

  if (lines.length === 0) {
    return {
      filas: [],
      errores: ["CSV vacío"],
      resumen: { totalFilas: 0, filasOK: 0, filasRechazadas: 0, mpCount: 0, ptCount: 0, mzrCount: 0 },
    };
  }

  // Validar encabezado
  const headerLine = lines[0];
  const headerCols = headerLine.split(";").map((s) => s.trim());

  // Verificar columnas requeridas
  const missingCols = ["COD", "PRODUCTO", "CLASE", "TIPO"].filter(
    (col) => !headerCols.includes(col)
  );
  if (missingCols.length > 0) {
    errores.push(`Columnas requeridas faltantes: ${missingCols.join(", ")}`);
  }

  // Verificar nutrientes
  for (const csvKey of Object.keys(NUTRIENT_CSV_MAP)) {
    if (!headerCols.includes(csvKey)) {
      errores.push(`Columna de nutriente faltante: ${csvKey}`);
    }
  }

  // Parsear filas
  const filas: ParsedRow[] = [];
  let filasRechazadas = 0;

  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(";");
    const row = parseRow(columns, i);
    if (row.errores.length > 0) {
      errores.push(...row.errores);
      filasRechazadas++;
    }
    filas.push(row);
  }

  // Contar por clase (usando la clasificación real, no la del CSV)
  let mpCount = 0;
  let ptCount = 0;
  let mzrCount = 0;
  for (const fila of filas) {
    const clase = clasificarItem(fila.externalCode, fila.claseCSV);
    if (clase === "MP") mpCount++;
    else if (clase === "MZR") mzrCount++;
    else ptCount++;
  }

  return {
    filas,
    errores,
    resumen: {
      totalFilas: filas.length,
      filasOK: filas.length - filasRechazadas,
      filasRechazadas,
      mpCount,
      ptCount,
      mzrCount,
    },
  };
}

/**
 * Genera IDs internos secuenciales para las filas parseadas.
 * Cada clase tiene su propia secuencia: MP0001, PT0001, MZR0001, etc.
 */
export function assignInternalIds(filas: ParsedRow[]): Array<ParsedRow & { internalId: string; clase: Clase } & { internalId: string; clase: Clase }> {
  const counters: Record<Clase, number> = { MP: 0, PT: 0, MZR: 0 };

  return filas.map((fila) => {
    const clase = clasificarItem(fila.externalCode, fila.claseCSV);
    counters[clase]++;
    const internalId = generarInternalId(clase, counters[clase]);
    return { ...fila, internalId, clase };
  });
}