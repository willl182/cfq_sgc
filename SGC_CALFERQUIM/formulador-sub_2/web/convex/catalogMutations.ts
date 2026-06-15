import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { NUTRIENT_KEYS } from "../src/lib/constants";

const nutrientVal = () =>
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
  });

function parseNum(val: string | number | null | undefined): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/"/g, "").trim();
  if (cleaned === "") return 0;
  return parseFloat(cleaned.replace(",", ".")) || 0;
}

const NUTRIENT_FIELD_NAMES = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur", "P", "K",
  "CaO", "MgO", "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na",
];

const CSV_HEADER_MAP: Record<string, string> = {
  "N-NH4": "N_NH4",
  "N-NO3": "N_NO3",
  "N-org": "N_org",
  "N-ur": "N_ur",
};

export const seedFromCsv = mutation({
  args: {
    csvData: v.array(
      v.object({
        COD: v.string(),
        PRODUCTO: v.string(),
        CLASE: v.string(),
        TIPO: v.string(),
        Test: v.optional(v.string()),
        nutrientes: v.optional(v.record(v.string(), v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("catalogItems").first();
    if (existing) {
      return { error: "Catalog already has data. Clear it first.", inserted: 0, rejected: 0, errors: [] as string[] };
    }

    let mpCount = 0;
    let ptCount = 0;
    let mzrCount = 0;
    let inserted = 0;
    let rejected = 0;
    const errors: string[] = [];

    const sorted = [...args.csvData].sort((a, b) => {
      const order: Record<string, number> = { MP: 0, PT: 1, MZR: 2 };
      const oa = order[a.CLASE] ?? 3;
      const ob = order[b.CLASE] ?? 3;
      if (oa !== ob) return oa - ob;
      return a.PRODUCTO.localeCompare(b.PRODUCTO);
    });

    for (const row of sorted) {
      const nombre = row.PRODUCTO.trim();
      if (!nombre) {
        rejected++;
        errors.push(`Row with COD=${row.COD}: empty name`);
        continue;
      }

      const claseRaw = row.CLASE.trim().toUpperCase();
      let clase: "MP" | "PT" | "MZR";
      if (claseRaw === "MP") {
        clase = "MP";
      } else if (claseRaw === "PT") {
        const cod = row.COD.trim();
        if (cod === "R" || /^R\d+$/.test(cod)) {
          clase = "MZR";
        } else {
          clase = "PT";
        }
      } else {
        rejected++;
        errors.push(`Row ${nombre}: invalid CLASE="${claseRaw}"`);
        continue;
      }

      const tipoRaw = (row.TIPO || "G").trim().toUpperCase();
      const tipo = tipoRaw === "P" || tipoRaw === "L" || tipoRaw === "C" ? tipoRaw : "G";

      const nutrientes: Record<string, number> = {};
      for (const key of NUTRIENT_FIELD_NAMES) {
        const rawVal = row.nutrientes?.[key] ?? row.nutrientes?.[CSV_HEADER_MAP[key]] ?? "0";
        nutrientes[key] = parseNum(rawVal);
      }
      const nutrientObj = Object.fromEntries(NUTRIENT_FIELD_NAMES.map(k => [k, nutrientes[k] ?? 0]));

      const externalCode = row.COD.trim() || undefined;
      const originalCode = externalCode;

      let prefix: string;
      if (clase === "MP") {
        prefix = "MP";
      } else if (clase === "PT") {
        prefix = "PT";
      } else {
        prefix = "MZR";
      }

      const seq = clase === "MP" ? String(++mpCount).padStart(4, "0")
        : clase === "PT" ? String(++ptCount).padStart(4, "0")
        : String(++mzrCount).padStart(4, "0");

      const internalId = `${prefix}${seq}`;
      const now = Date.now();

      await ctx.db.insert("catalogItems", {
        internalId,
        nombre,
        clase,
        tipo,
        externalCode,
        originalCode,
        origen: "csv_seed",
        C: nutrientObj.C,
        N: nutrientObj.N,
        N_NH4: nutrientObj.N_NH4,
        N_NO3: nutrientObj.N_NO3,
        N_org: nutrientObj.N_org,
        N_ur: nutrientObj.N_ur,
        P: nutrientObj.P,
        K: nutrientObj.K,
        CaO: nutrientObj.CaO,
        MgO: nutrientObj.MgO,
        S: nutrientObj.S,
        B: nutrientObj.B,
        Co: nutrientObj.Co,
        Cu: nutrientObj.Cu,
        Fe: nutrientObj.Fe,
        Mn: nutrientObj.Mn,
        Mo: nutrientObj.Mo,
        SiO2: nutrientObj.SiO2,
        Zn: nutrientObj.Zn,
        Na: nutrientObj.Na,
        createdAt: now,
        updatedAt: now,
      });

      inserted++;
    }

    return { inserted, rejected, errors };
  },
});

export const updateCatalogItem = mutation({
  args: {
    id: v.id("catalogItems"),
    updates: v.object({
      nombre: v.optional(v.string()),
      C: v.optional(v.number()),
      N: v.optional(v.number()),
      N_NH4: v.optional(v.number()),
      N_NO3: v.optional(v.number()),
      N_org: v.optional(v.number()),
      N_ur: v.optional(v.number()),
      P: v.optional(v.number()),
      K: v.optional(v.number()),
      CaO: v.optional(v.number()),
      MgO: v.optional(v.number()),
      S: v.optional(v.number()),
      B: v.optional(v.number()),
      Co: v.optional(v.number()),
      Cu: v.optional(v.number()),
      Fe: v.optional(v.number()),
      Mn: v.optional(v.number()),
      Mo: v.optional(v.number()),
      SiO2: v.optional(v.number()),
      Zn: v.optional(v.number()),
      Na: v.optional(v.number()),
    }),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    const changedFields: { field: string; before?: string; after?: string }[] = [];
    for (const [key, value] of Object.entries(args.updates)) {
      if (value === undefined) continue;
      const before = String((item as Record<string, unknown>)[key] ?? "");
      const after = String(value);
      if (before !== after) {
        changedFields.push({ field: key, before, after });
      }
    }

    if (changedFields.length === 0) return item;

    const now = Date.now();
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: now,
    });

    await ctx.db.insert("catalogChangeHistory", {
      catalogItemId: args.id,
      internalId: item.internalId,
      actor: "local_user",
      changedFields,
      reason: args.reason,
      source: "manual_edit",
      changedAt: now,
    });

    return await ctx.db.get(args.id);
  },
});

export const archiveCatalogItem = mutation({
  args: {
    id: v.id("catalogItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    await ctx.db.patch(args.id, { archivedAt: Date.now() });
    return true;
  },
});

export const clearCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("catalogItems").collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    const history = await ctx.db.query("catalogChangeHistory").collect();
    for (const h of history) {
      await ctx.db.delete(h._id);
    }
    return { deleted: items.length };
  },
});