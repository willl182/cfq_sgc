import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { NUTRIENT_KEYS, type NutrientRecord } from "../src/lib/nutrients";

const CSV_NUTRIENT_MAP: Record<string, string> = {
  C: "C",
  N: "N",
  "N-NH4": "N_NH4",
  "N-NO3": "N_NO3",
  "N-org": "N_org",
  "N-ur": "N_ur",
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

function parseCsvLine(line: string, delimiter = ";"): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseNumber(raw: string): number {
  const cleaned = raw.trim().replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function isMzrCode(cod: string): boolean {
  return /^R\d*$/.test(cod.trim());
}

function normalizeClass(
  csvClass: string,
  cod: string
): "MP" | "PT" | "MZR" {
  const c = csvClass.trim().toUpperCase();
  if (c === "MP") return "MP";
  if (isMzrCode(cod)) return "MZR";
  return "PT";
}

export const seedFromCsv = mutation({
  args: {
    csvText: v.string(),
    actor: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    rowsRead: v.number(),
    inserted: v.number(),
    rejected: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, { csvText, actor }) => {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      return {
        success: false,
        message: "CSV vacío o sin encabezados",
        rowsRead: 0,
        inserted: 0,
        rejected: 0,
        errors: [],
      };
    }

    // Verificar que catalogItems esté vacío
    const existing = await ctx.db.query("catalogItems").collect();
    if (existing.length > 0) {
      return {
        success: false,
        message: "El catálogo ya tiene datos. La carga inicial solo se ejecuta si está vacío.",
        rowsRead: 0,
        inserted: 0,
        rejected: 0,
        errors: [],
      };
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.trim());
    const required = ["COD", "PRODUCTO", "CLASE", "TIPO"];
    const missing = required.filter((r) => !headers.includes(r));
    if (missing.length > 0) {
      return {
        success: false,
        message: `Faltan encabezados obligatorios: ${missing.join(", ")}`,
        rowsRead: 0,
        inserted: 0,
        rejected: 0,
        errors: [],
      };
    }

    const idxCod = headers.indexOf("COD");
    const idxProducto = headers.indexOf("PRODUCTO");
    const idxClase = headers.indexOf("CLASE");
    const idxTipo = headers.indexOf("TIPO");
    const nutrientIdx: Record<string, number> = {};
    for (const [csvKey, internalKey] of Object.entries(CSV_NUTRIENT_MAP)) {
      const i = headers.indexOf(csvKey);
      if (i !== -1) nutrientIdx[internalKey] = i;
    }

    const errors: string[] = [];
    const items: {
      externalCode: string;
      originalCode: string;
      name: string;
      class: "MP" | "PT" | "MZR";
      type: "G" | "P" | "L" | "C";
      nutrients: NutrientRecord;
    }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length < 4) {
        errors.push(`Fila ${i + 1}: columnas insuficientes`);
        continue;
      }
      const cod = cols[idxCod].trim();
      const name = cols[idxProducto].trim();
      const csvClass = cols[idxClase].trim();
      const csvType = cols[idxTipo].trim();
      if (!cod) {
        errors.push(`Fila ${i + 1}: COD vacío`);
        continue;
      }
      if (!name) {
        errors.push(`Fila ${i + 1}: PRODUCTO vacío`);
        continue;
      }
      const cls = normalizeClass(csvClass, cod);
      const type = (csvType.toUpperCase() as "G" | "P" | "L" | "C") ?? "G";
      const nutrients: NutrientRecord = Object.fromEntries(
        NUTRIENT_KEYS.map((k) => {
          const idx = nutrientIdx[k];
          const val = idx !== undefined && idx < cols.length ? parseNumber(cols[idx]) : 0;
          return [k, val];
        })
      ) as NutrientRecord;
      items.push({
        externalCode: cod,
        originalCode: cod,
        name,
        class: cls,
        type,
        nutrients,
      });
    }

    // Asignar IDs secuenciales por clase
    const counters = { MP: 0, PT: 0, MZR: 0 };
    const toInsert = items.map((item) => {
      counters[item.class]++;
      const internalId = `${item.class}${String(counters[item.class]).padStart(4, "0")}`;
      return { ...item, internalId };
    });

    const insertedIds: string[] = [];
    for (const item of toInsert) {
      const id = await ctx.db.insert("catalogItems", {
        internalId: item.internalId,
        class: item.class,
        externalCode: item.externalCode,
        originalCode: item.originalCode,
        name: item.name,
        type: item.type,
        nutrients: item.nutrients,
      });
      insertedIds.push(id);
      await ctx.db.insert("catalogChangeHistory", {
        catalogItemId: id,
        internalId: item.internalId,
        changedAt: Date.now(),
        actor,
        fieldsChanged: Object.keys(item.nutrients).filter((k) => item.nutrients[k as keyof NutrientRecord] !== 0),
        after: item.nutrients,
        reason: "Carga inicial desde CSV",
        origin: "seed",
      });
    }

    return {
      success: true,
      message: `Carga completada: ${toInsert.length} items insertados`,
      rowsRead: lines.length - 1,
      inserted: toInsert.length,
      rejected: errors.length,
      errors,
    };
  },
});
