import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internalQuery, internalMutation } from "./_generated/server";
import { parseCsvInsumos, classifyClass } from "../lib/csvParser";
import { NUTRIENTES } from "../lib/calculation";

export const seedCatalog = mutation({
  args: { csvText: v.string(), actor: v.string() },
  returns: v.object({
    read: v.number(),
    inserted: v.number(),
    rejected: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, { csvText, actor }) => {
    const existing = await ctx.db.query("catalogItems").take(1);
    if (existing.length > 0) {
      return {
        read: 0,
        inserted: 0,
        rejected: 1,
        errors: ["Catálogo no vacío — carga bloqueada."],
      };
    }

    const { rows, errors: parseErrors } = parseCsvInsumos(csvText);

    let inserted = 0;
    let rejected = 0;
    const errors = [...parseErrors];

    const mpRows = rows.filter((r) => classifyClass(r.cod, r.clase) === "MP");
    const ptRows = rows.filter((r) => classifyClass(r.cod, r.clase) === "PT");
    const mzrRows = rows.filter((r) => classifyClass(r.cod, r.clase) === "MZR");

    let mpCounter = 1;
    let ptCounter = 1;
    let mzrCounter = 1;

    function pad4(n: number) {
      return String(n).padStart(4, "0");
    }

    function makeInternalId(cls: "MP" | "PT" | "MZR") {
      if (cls === "MP") return `MP${pad4(mpCounter++)}`;
      if (cls === "PT") return `PT${pad4(ptCounter++)}`;
      return `MZR${pad4(mzrCounter++)}`;
    }

    for (const row of rows) {
      const cls = classifyClass(row.cod, row.clase);
      const internalId = makeInternalId(cls);

      const doc: any = {
        internalId,
        class: cls,
        name: row.producto,
        externalCode: row.cod,
        originalCode: row.cod,
        tipo: row.tipo,
        test: row.test,
        archivedAt: undefined,
      };

      for (const n of NUTRIENTES) {
        const val = row.nutrients[n];
        if (typeof val === "number") {
          doc[n] = val;
        }
      }

      try {
        await ctx.db.insert("catalogItems", doc);
        inserted++;
      } catch (e) {
        rejected++;
        errors.push(`Error insertando ${row.cod}: ${String(e)}`);
      }
    }

    return { read: rows.length, inserted, rejected, errors };
  },
});

export const isCatalogEmpty = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const count = await ctx.db.query("catalogItems").collect();
    return count.length === 0;
  },
});
