/**
 * Mutations para gestión del catálogo.
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { NUTRIENTS } from "../src/lib/formulas";

// ─── Seed: carga inicial desde CSV ──────────────────────────────────────────

export const seedFromCSV = mutation({
  args: {
    csvContent: v.string(),
  },
  handler: async (ctx, args) => {
    const { csvContent } = args;

    // Verificar si ya hay items
    const existing = await ctx.db.query("catalogItems").first();
    if (existing) {
      throw new Error(
        "El catálogo ya tiene items. Solo se puede ejecutar seed con catálogo vacío."
      );
    }

    // Parsear CSV manualmente (sin dependencia del módulo client)
    const lineas = csvContent.split("\n").filter(l => l.trim());
    if (lineas.length < 2) {
      throw new Error("CSV vacío o sin datos válidos");
    }

    const headers = lineas[0].split(";").map(h => h.trim());
    
    // Contadores por clase
    const contadores = { MP: 0, PT: 0, MZR: 0 };
    const ahora = Date.now();

    for (let i = 1; i < lineas.length; i++) {
      const valores = lineas[i].split(";").map(v => v.trim());
      
      const getVal = (nombre: string): string => {
        const idx = headers.indexOf(nombre);
        return idx !== -1 ? (valores[idx] || "") : "";
      };

      const codigo = getVal("COD");
      const producto = getVal("PRODUCTO");
      const claseCSV = getVal("CLASE") || "MP";
      const tipo = getVal("TIPO") || "G";

      if (!producto) continue;

      // Clasificar MZR: código que empieza con R
      let clase: "MP" | "PT" | "MZR" = claseCSV.toUpperCase() as "MP" | "PT";
      if (/^R\d*$/i.test(codigo)) {
        clase = "MZR";
      }

      contadores[clase]++;
      const internalId = `${clase}${String(contadores[clase]).padStart(4, "0")}`;

      // Extraer nutrientes
      const nutrients: Record<string, number> = {};
      for (const n of NUTRIENTS) {
        const idx = headers.indexOf(n);
        const raw = idx !== -1 ? (valores[idx] || "") : "";
        nutrients[n] = raw ? parseFloat(raw.replace(",", ".")) || 0 : 0;
      }

      await ctx.db.insert("catalogItems", {
        internalId,
        class: clase,
        name: producto,
        tipo,
        externalCode: codigo || null,
        originalCode: codigo || null,
        C: nutrients.C || 0,
        N: nutrients.N || 0,
        N_NH4: nutrients.N_NH4 || 0,
        N_NO3: nutrients.N_NO3 || 0,
        N_org: nutrients.N_org || 0,
        N_ur: nutrients.N_ur || 0,
        P: nutrients.P || 0,
        K: nutrients.K || 0,
        CaO: nutrients.CaO || 0,
        MgO: nutrients.MgO || 0,
        S: nutrients.S || 0,
        B: nutrients.B || 0,
        Co: nutrients.Co || 0,
        Cu: nutrients.Cu || 0,
        Fe: nutrients.Fe || 0,
        Mn: nutrients.Mn || 0,
        Mo: nutrients.Mo || 0,
        SiO2: nutrients.SiO2 || 0,
        Zn: nutrients.Zn || 0,
        Na: nutrients.Na || 0,
        archivedAt: undefined,
        createdAt: ahora,
        updatedAt: ahora,
      });
    }

    return {
      insertadas: Object.values(contadores).reduce((a, b) => a + b, 0),
      detalle: contadores,
    };
  },
});

// ─── Actualizar un item del catálogo ────────────────────────────────────────

export const updateCatalogItem = mutation({
  args: {
    id: v.id("catalogItems"),
    name: v.optional(v.string()),
    tipo: v.optional(v.string()),
    nutrients: v.optional(v.object(
      Object.fromEntries(NUTRIENTS.map(n => [n, v.optional(v.number())]))
    )),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, name, tipo, nutrients, reason } = args;
    const now = Date.now();

    // Obtener el item actual para auditoría
    const item = await ctx.db.get(id);
    if (!item) {
      throw new Error(`Item ${id} no encontrado`);
    }

    // Verificar permisos (usuario normal solo puede editar MP)
    const isAdmin = typeof window !== "undefined" && 
      localStorage.getItem("formulador_admin") === "true";
    
    if (!isAdmin && item.class !== "MP") {
      throw new Error("Solo admins pueden editar PT y MZR");
    }

    // Preparar cambios
    const updates: Record<string, any> = { updatedAt: now };

    if (name !== undefined) updates.name = name;
    if (tipo !== undefined) updates.tipo = tipo;

    // Nutrientes individuales
    if (nutrients) {
      for (const [key, value] of Object.entries(nutrients)) {
        if (NUTRIENTS.includes(key as any) && value !== undefined) {
          updates[key] = value;
        }
      }
    }

    // Registrar en historial de cambios
    const changedFields = Object.keys(updates).filter(k => k !== "updatedAt");
    
    if (changedFields.length > 0) {
      await ctx.db.insert("catalogChangeHistory", {
        catalogItemId: id,
        internalId: item.internalId,
        changedBy: isAdmin ? "admin" : "user",
        changedAt: now,
        changedFields,
        before: JSON.stringify(
          changedFields.reduce((acc, f) => ({ ...acc, [f]: item[f as keyof typeof item] }), {})
        ),
        after: JSON.stringify(
          changedFields.reduce((acc, f) => ({ ...acc, [f]: updates[f] }), {})
        ),
        reason: reason || null,
        origin: "manual",
      });
    }

    await ctx.db.patch(id, updates);
  },
});

// ─── Archivar un item ────────────────────────────────────────────────────────

export const archiveCatalogItem = mutation({
  args: {
    id: v.id("catalogItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item no encontrado");
    
    await ctx.db.patch(args.id, {
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// ─── Restaurar un item archivado ────────────────────────────────────────────

export const restoreCatalogItem = mutation({
  args: {
    id: v.id("catalogItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item no encontrado");
    
    await ctx.db.patch(args.id, {
      archivedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});