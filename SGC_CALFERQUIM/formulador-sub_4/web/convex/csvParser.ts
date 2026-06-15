import { nutrients } from "./schema";

export interface ParsedCatalogItem {
  externalCode: string;
  originalCode: string;
  name: string;
  class: "MP" | "PT" | "MZR";
  type: "G" | "P" | "L" | "C";
  nutrients: {
    C: number;
    N: number;
    N_NH4: number;
    N_NO3: number;
    N_org: number;
    N_ur: number;
    P: number;
    K: number;
    CaO: number;
    MgO: number;
    S: number;
    B: number;
    Co: number;
    Cu: number;
    Fe: number;
    Mn: number;
    Mo: number;
    SiO2: number;
    Zn: number;
    Na: number;
  };
}

export interface CsvParseResult {
  success: boolean;
  rowsRead: number;
  rowsInserted: number;
  rowsRejected: number;
  errors: Array<{ row: number; message: string }>;
  items: ParsedCatalogItem[];
}

const NUTRIENT_KEYS = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur", "P", "K", "CaO", "MgO", "S",
  "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
] as const;

const CSV_HEADERS = [
  "COD", "PRODUCTO", "CLASE", "TIPO", "Test",
  "C", "N", "N-NH4", "N-NO3", "N-org", "N-ur",
  "P", "K", "CaO", "MgO", "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
];

const EXPECTED_HEADERS = CSV_HEADERS.join(";");

function parseNum(value: string): number {
  if (!value || value.trim() === "") return 0;
  const normalized = value.replace(",", ".");
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

function normalizeClass(clase: string, cod: string): "MP" | "PT" | "MZR" {
  if (clase === "MP") return "MP";
  if (clase === "MZR") return "MZR";
  if (clase === "PT") {
    if (cod === "R" || /^R\d+$/.test(cod)) return "MZR";
    return "PT";
  }
  return "PT";
}

export function classifyMZR(cod: string): boolean {
  return cod === "R" || /^R\d+$/.test(cod);
}

export function validateHeaders(headerLine: string): { valid: boolean; message?: string } {
  const normalizedHeader = headerLine.trim();
  if (normalizedHeader !== EXPECTED_HEADERS) {
    return {
      valid: false,
      message: `Encabezados no coinciden. Esperado: ${EXPECTED_HEADERS}. Encontrado: ${normalizedHeader}`
    };
  }
  return { valid: true };
}

export function parseCsvLine(line: string): Record<string, string> {
  const values = line.split(";");
  const result: Record<string, string> = {};
  CSV_HEADERS.forEach((header, idx) => {
    result[header] = values[idx]?.trim() || "";
  });
  return result;
}

export function parseNutrients(row: Record<string, string>) {
  const nutrients: Record<string, number> = {};
  for (const key of NUTRIENT_KEYS) {
    const csvKey = key.replace("_", "-");
    nutrients[key] = parseNum(row[csvKey] || row[key] || "");
  }
  return nutrients as ParsedCatalogItem["nutrients"];
}

export function parseCatalogItem(row: Record<string, string>, rowNumber: number): {
  item: ParsedCatalogItem | null;
  errors: string[];
} {
  const errors: string[] = [];

  const cod = row["COD"]?.trim();
  const producto = row["PRODUCTO"]?.trim();
  const clase = row["CLASE"]?.trim();
  const tipo = row["TIPO"]?.trim();

  if (!cod) errors.push(`Fila ${rowNumber}: COD vacío`);
  if (!producto) errors.push(`Fila ${rowNumber}: PRODUCTO vacío`);

  if (clase !== "MP" && clase !== "PT" && clase !== "MZR") {
    errors.push(`Fila ${rowNumber}: CLASE inválida '${clase}' (esperado MP, PT o MZR)`);
  }

  if (tipo !== "G" && tipo !== "P" && tipo !== "L" && tipo !== "C") {
    errors.push(`Fila ${rowNumber}: TIPO inválido '${tipo}' (esperado G, P, L o C)`);
  }

  if (errors.length > 0) {
    return { item: null, errors };
  }

  const nutrientValues = NUTRIENT_KEYS.map(key => {
    const csvKey = key.replace("_", "-");
    return parseNum(row[csvKey] || row[key] || "");
  });

  const allZero = nutrientValues.every(v => v === 0);
  if (allZero) {
    errors.push(`Fila ${rowNumber}: Todos los nutrientes son cero o vacíos`);
  }

  const anyNegative = nutrientValues.some(v => v < 0);
  if (anyNegative) {
    errors.push(`Fila ${rowNumber}: Nutriente con valor negativo`);
  }

  const parsedClass = normalizeClass(clase, cod);

  return {
    item: {
      externalCode: cod,
      originalCode: cod,
      name: producto,
      class: parsedClass,
      type: tipo as "G" | "P" | "L" | "C",
      nutrients: parseNutrients(row),
    },
    errors,
  };
}

export function parseCsv(csvContent: string): CsvParseResult {
  const lines = csvContent.trim().split("\n");
  const result: CsvParseResult = {
    success: false,
    rowsRead: 0,
    rowsInserted: 0,
    rowsRejected: 0,
    errors: [],
    items: [],
  };

  if (lines.length < 2) {
    result.errors.push({ row: 0, message: "CSV vacío o sin datos" });
    return result;
  }

  const headerValidation = validateHeaders(lines[0]);
  if (!headerValidation.valid) {
    result.errors.push({ row: 0, message: headerValidation.message || "Encabezados inválidos" });
    return result;
  }

  result.rowsRead = lines.length - 1;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row = parseCsvLine(line);
    const { item, errors } = parseCatalogItem(row, i);

    if (errors.length > 0) {
      result.errors.push(...errors.map(e => ({ row: i, message: e })));
      result.rowsRejected++;
    } else if (item) {
      result.items.push(item);
      result.rowsInserted++;
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

export function assignInternalIds(items: ParsedCatalogItem[]): Array<ParsedCatalogItem & { internalId: string }> {
  const mpItems = items.filter(i => i.class === "MP");
  const ptItems = items.filter(i => i.class === "PT");
  const mzrItems = items.filter(i => i.class === "MZR");

  let mpCounter = 1;
  let ptCounter = 1;
  let mzrCounter = 1;

  const result: Array<ParsedCatalogItem & { internalId: string }> = [];

  for (const item of items) {
    let internalId: string;
    if (item.class === "MP") {
      internalId = `MP${String(mpCounter).padStart(4, "0")}`;
      mpCounter++;
    } else if (item.class === "PT") {
      internalId = `PT${String(ptCounter).padStart(4, "0")}`;
      ptCounter++;
    } else {
      internalId = `MZR${String(mzrCounter).padStart(4, "0")}`;
      mzrCounter++;
    }
    result.push({ ...item, internalId });
  }

  return result;
}