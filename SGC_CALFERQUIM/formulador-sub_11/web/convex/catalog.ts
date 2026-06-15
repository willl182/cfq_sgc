import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

const NUTRIENT_KEYS = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur", "P", "K", "CaO", "MgO", 
  "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
] as const;

type NutrientKey = typeof NUTRIENT_KEYS[number];

// Helper to parse float from Spanish decimal comma or standard format
function parseDecimal(val: string): number {
  if (!val) return 0;
  const clean = val.trim().replace(/\s/g, "").replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

// Helper to check if COD matches MZR rule
function isMZRCode(code: string): boolean {
  const clean = code.trim().toUpperCase();
  return clean === "R" || /^R\d+$/.test(clean);
}

export const seedCatalog = mutation({
  args: { csvText: v.string() },
  handler: async (ctx, args) => {
    // 1. Verify catalog is empty
    const existing = await ctx.db.query("catalogItems").first();
    if (existing !== null) {
      throw new Error("El catálogo ya contiene elementos. No se puede realizar la carga inicial.");
    }

    const report = {
      readCount: 0,
      insertedCount: 0,
      rejectedCount: 0,
      rejectedRows: [] as { row: number; reason: string; name?: string }[],
    };

    // 2. Parse CSV text line by line
    const rawLines = args.csvText.split(/\r?\n/);
    if (rawLines.length < 2) {
      throw new Error("El archivo CSV no contiene suficientes líneas.");
    }

    // Determine separator: usually semicolon in Colombian CSVs or comma
    const headerLine = rawLines[0];
    const separator = headerLine.includes(";") ? ";" : ",";

    // Split line parsing CSV rules (handling quoted values)
    const splitCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      let i = 0;

      while (i < line.length) {
        const char = line[i];
        if (inQuotes) {
          if (char === '"') {
            if (i + 1 < line.length && line[i + 1] === '"') {
              current += '"';
              i += 2;
            } else {
              inQuotes = false;
              i++;
            }
          } else {
            current += char;
            i++;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
            i++;
          } else if (char === separator) {
            result.push(current);
            current = "";
            i++;
          } else {
            current += char;
            i++;
          }
        }
      }
      result.push(current);
      return result;
    };

    const headers = splitCsvLine(headerLine).map(h => h.trim().toUpperCase());
    
    // Check required columns
    const codIdx = headers.indexOf("COD");
    const nameIdx = headers.indexOf("PRODUCTO");
    const classIdx = headers.indexOf("CLASE");
    const typeIdx = headers.indexOf("TIPO");

    if (codIdx === -1 || nameIdx === -1 || classIdx === -1) {
      throw new Error(`Faltan columnas requeridas en el CSV. Debe contener al menos COD, PRODUCTO y CLASE. Separador detectado: ${separator}`);
    }

    // Map nutrient columns
    const nutrientIndices: Record<NutrientKey, number> = {} as any;
    for (const key of NUTRIENT_KEYS) {
      // CSV headers might use dash instead of underscore, e.g. N-NH4
      const csvHeaderName = key.replace("_", "-");
      let idx = headers.indexOf(csvHeaderName);
      if (idx === -1) {
        idx = headers.indexOf(key); // Fallback to underscore
      }
      nutrientIndices[key] = idx;
    }

    let mpCounter = 1;
    let ptCounter = 1;
    let mzrCounter = 1;

    // Process rows
    for (let r = 1; r < rawLines.length; r++) {
      const line = rawLines[r].trim();
      if (!line) continue;

      report.readCount++;
      const cells = splitCsvLine(line);

      const rawCod = cells[codIdx] || "";
      const rawName = cells[nameIdx] || "";
      const rawClass = cells[classIdx] || "";
      const rawType = typeIdx !== -1 ? (cells[typeIdx] || "") : "";

      const cod = rawCod.trim();
      const name = rawName.trim();
      const cls = rawClass.trim().toUpperCase();
      const type = rawType.trim().toUpperCase();

      // Validations
      if (!name) {
        report.rejectedCount++;
        report.rejectedRows.push({ row: r + 1, reason: "El nombre del producto (PRODUCTO) está vacío." });
        continue;
      }

      if (!cod) {
        report.rejectedCount++;
        report.rejectedRows.push({ row: r + 1, reason: "El código (COD) está vacío.", name });
        continue;
      }

      if (cls !== "MP" && cls !== "PT") {
        report.rejectedCount++;
        report.rejectedRows.push({ row: r + 1, reason: `Clase inválida: '${cls}'. Debe ser MP o PT.`, name });
        continue;
      }

      // Determine actual classification
      let finalClass: "MP" | "PT" | "MZR" = "MP";
      if (cls === "MP") {
        finalClass = "MP";
      } else if (cls === "PT") {
        if (isMZRCode(cod)) {
          finalClass = "MZR";
        } else {
          finalClass = "PT";
        }
      }

      // Assign internal IDs sequentially
      let internalId = "";
      if (finalClass === "MP") {
        internalId = `MP${String(mpCounter++).padStart(4, "0")}`;
      } else if (finalClass === "PT") {
        internalId = `PT${String(ptCounter++).padStart(4, "0")}`;
      } else {
        internalId = `MZR${String(mzrCounter++).padStart(4, "0")}`;
      }

      // Parse nutrients
      const nutrients: Record<NutrientKey, number> = {} as any;
      let nutrientError = false;
      let nutrientReason = "";

      for (const key of NUTRIENT_KEYS) {
        const idx = nutrientIndices[key];
        if (idx === -1 || idx >= cells.length) {
          nutrients[key] = 0;
        } else {
          const rawVal = cells[idx] || "";
          if (rawVal.trim() !== "") {
            // Check numeric format
            const clean = rawVal.trim().replace(",", ".");
            if (isNaN(parseFloat(clean))) {
              nutrientError = true;
              nutrientReason = `Valor no numérico en nutriente ${key}: '${rawVal}'`;
              break;
            }
            nutrients[key] = parseDecimal(rawVal);
          } else {
            nutrients[key] = 0;
          }
        }
      }

      if (nutrientError) {
        report.rejectedCount++;
        report.rejectedRows.push({ row: r + 1, reason: nutrientReason, name });
        continue;
      }

      // Provider details (if columns exist)
      const provIdx = headers.indexOf("PROVEEDOR");
      const cprovIdx = headers.indexOf("CPROV");
      const testIdx = headers.indexOf("TEST");
      const extrasIdx = headers.indexOf("EXTRAS");

      const provider = provIdx !== -1 ? (cells[provIdx] || "").trim() : undefined;
      const cprov = cprovIdx !== -1 ? (cells[cprovIdx] || "").trim() : undefined;
      const extras = extrasIdx !== -1 ? (cells[extrasIdx] || "").trim() : undefined;

      await ctx.db.insert("catalogItems", {
        internalId,
        class: finalClass,
        externalCode: cod,
        originalCode: cod,
        producto: name,
        tipo: type || "G", // Default to Granulado if empty
        nutrients,
        archivedAt: null,
        provider,
        cprov,
        origen: "BASE_CSV",
        extras,
      });

      report.insertedCount++;
    }

    return report;
  },
});

export const getItems = query({
  args: { includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const query = ctx.db.query("catalogItems");
    if (!args.includeArchived) {
      return await query
        .withIndex("by_archivedAt", (q) => q.eq("archivedAt", null))
        .collect();
    }
    return await query.collect();
  },
});

export const getItemByInternalId = query({
  args: { internalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", (q) => q.eq("internalId", args.internalId))
      .first();
  },
});

export const updateItem = mutation({
  args: {
    id: v.id("catalogItems"),
    producto: v.optional(v.string()),
    tipo: v.optional(v.string()),
    nutrients: v.optional(
      v.object({
        C: v.number(),
        N: v.number(),
        N_NH4: v.number(),
        N_NO3: v.number(),
        N_org: v.number(),
        N_ur: v.number(),
        P: v.number(),
        K: v.number(),
        CaO: v.number(),
        MgO: v.number(),
        S: v.number(),
        B: v.number(),
        Co: v.number(),
        Cu: v.number(),
        Fe: v.number(),
        Mn: v.number(),
        Mo: v.number(),
        SiO2: v.number(),
        Zn: v.number(),
        Na: v.number(),
      })
    ),
    provider: v.optional(v.string()),
    cprov: v.optional(v.string()),
    extras: v.optional(v.string()),
    actor: v.string(), // name or role
    role: v.string(), // "admin" | "user"
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error(`Elemento del catálogo con ID ${args.id} no encontrado.`);
    }

    // Role check
    // "Usuario normal edita solo MP. Admin local edita MP, PT y MZR."
    if (args.role !== "admin" && item.class !== "MP") {
      throw new Error("No tiene permisos para modificar productos terminados (PT) o mezclas de referencia (MZR).");
    }

    const { id, actor, role, reason, ...updates } = args;

    // Compare fields and record change audit history
    const fieldsChanged: string[] = [];
    const before: Record<string, any> = {};
    const after: Record<string, any> = {};

    for (const [key, val] of Object.entries(updates)) {
      const currentVal = (item as any)[key];
      if (JSON.stringify(currentVal) !== JSON.stringify(val)) {
        fieldsChanged.push(key);
        before[key] = currentVal;
        after[key] = val;
      }
    }

    if (fieldsChanged.length === 0) {
      return item; // No changes
    }

    // Perform database update
    await ctx.db.patch(args.id, updates);

    // Save in audit history
    await ctx.db.insert("catalogChangeHistory", {
      catalogItemId: args.id,
      internalId: item.internalId,
      changedAt: Date.now(),
      actor: args.actor,
      fields: fieldsChanged,
      before,
      after,
      reason: args.reason,
      origin: "WEB",
    });

    return await ctx.db.get(args.id);
  },
});

export const archiveItem = mutation({
  args: {
    id: v.id("catalogItems"),
    actor: v.string(),
    role: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Elemento del catálogo no encontrado.");
    }

    if (args.role !== "admin" && item.class !== "MP") {
      throw new Error("Solo los administradores pueden archivar elementos PT o MZR.");
    }

    // Warning validation: Check if item is used in active lists
    const activeLists = await ctx.db.query("productLists")
      .withIndex("by_archivedAt", (q) => q.eq("archivedAt", null))
      .collect();

    const usages = activeLists.filter(list => 
      list.components.some(comp => comp.catalogItemId === args.id)
    );

    const warning = usages.length > 0 
      ? `El elemento se archivará, pero está siendo usado actualmente en ${usages.length} listas activas: ${usages.map(u => u.displayCode).join(", ")}.`
      : undefined;

    await ctx.db.patch(args.id, { archivedAt: Date.now() });

    // Save in change history
    await ctx.db.insert("catalogChangeHistory", {
      catalogItemId: args.id,
      internalId: item.internalId,
      changedAt: Date.now(),
      actor: args.actor,
      fields: ["archivedAt"],
      before: { archivedAt: null },
      after: { archivedAt: Date.now() },
      reason: args.reason || "Archivado",
      origin: "WEB",
    });

    return { success: true, warning };
  },
});

export const deleteItem = mutation({
  args: {
    id: v.id("catalogItems"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.role !== "admin") {
      throw new Error("Solo el administrador local puede eliminar físicamente elementos del catálogo.");
    }

    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Elemento del catálogo no encontrado.");
    }

    // Physical delete
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

export const getHistory = query({
  args: { catalogItemId: v.optional(v.id("catalogItems")), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const q = args.catalogItemId
      ? ctx.db.query("catalogChangeHistory").withIndex("by_catalogItemId", (idx) => idx.eq("catalogItemId", args.catalogItemId!))
      : ctx.db.query("catalogChangeHistory");
    const results = await q.order("desc").collect();
    return args.limit ? results.slice(0, args.limit) : results;
  },
});
