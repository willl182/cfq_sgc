import { mutation } from "./_generated/server";
import { v } from "convex/values";

interface ParsedRow {
  externalCode: string;
  name: string;
  class: "MP" | "PT" | "MZR";
  type: "G" | "P" | "L" | "C";
  originalCode?: string;
  composition: {
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

/**
 * Carga inicial desde CSV
 * Solo ejecuta si catalogItems está vacío
 */
export const loadFromCSV = mutation({
  args: {
    rows: v.array(v.object({
      externalCode: v.string(),
      name: v.string(),
      class: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
      type: v.union(v.literal("G"), v.literal("P"), v.literal("L"), v.literal("C")),
      originalCode: v.optional(v.string()),
      composition: v.object({
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
      }),
    })),
  },
  handler: async (ctx, args) => {
    // Verificar que el catálogo esté vacío
    const existingItems = await ctx.db.query("catalogItems").collect();
    if (existingItems.length > 0) {
      throw new Error("El catálogo ya tiene datos. No se puede ejecutar la carga inicial.");
    }
    
    // Contadores para IDs secuenciales
    let mpCount = 0;
    let ptCount = 0;
    let mzrCount = 0;
    
    const inserted: string[] = [];
    const errors: string[] = [];
    
    // Procesar cada fila
    for (let i = 0; i < args.rows.length; i++) {
      const row = args.rows[i];
      
      try {
        // Validar nombre
        if (!row.name || row.name.trim() === "") {
          errors.push(`Fila ${i + 1}: Nombre vacío`);
          continue;
        }
        
        // Asignar ID secuencial según clase
        let internalId: string;
        if (row.class === "MP") {
          mpCount++;
          internalId = `MP${String(mpCount).padStart(4, "0")}`;
        } else if (row.class === "MZR") {
          mzrCount++;
          internalId = `MZR${String(mzrCount).padStart(4, "0")}`;
        } else {
          ptCount++;
          internalId = `PT${String(ptCount).padStart(4, "0")}`;
        }
        
        // Insertar en catalogItems
        await ctx.db.insert("catalogItems", {
          internalId,
          name: row.name.trim(),
          class: row.class,
          type: row.type,
          externalCode: row.externalCode,
          originalCode: row.originalCode,
          composition: row.composition,
          updatedAt: Date.now(),
          updatedBy: "seed",
        });
        
        inserted.push(internalId);
      } catch (error) {
        errors.push(`Fila ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return {
      success: true,
      inserted: inserted.length,
      errors: errors.length,
      errorDetails: errors,
      summary: {
        mp: mpCount,
        pt: ptCount,
        mzr: mzrCount,
      },
    };
  },
});

/**
 * Verifica si el catálogo está vacío
 */
export const isEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("catalogItems").collect();
    return items.length === 0;
  },
});
