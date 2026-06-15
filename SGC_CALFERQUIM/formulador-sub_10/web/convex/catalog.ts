import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Lista todos los items del catálogo (con filtros opcionales)
 */
export const list = query({
  args: {
    classFilter: v.optional(v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR"))),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("catalogItems").collect();
    
    // Filtrar por clase si se especifica
    if (args.classFilter) {
      items = items.filter(item => item.class === args.classFilter);
    }
    
    // Excluir archivados por defecto
    if (!args.includeArchived) {
      items = items.filter(item => !item.archivedAt);
    }
    
    return items;
  },
});

/**
 * Obtiene un item del catálogo por ID
 */
export const get = query({
  args: { id: v.id("catalogItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Obtiene un item del catálogo por internalId
 */
export const getByInternalId = query({
  args: { internalId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("catalogItems")
      .withIndex("by_internalId", q => q.eq("internalId", args.internalId))
      .collect();
    
    return items[0] || null;
  },
});

/**
 * Búsqueda por nombre o código
 */
export const search = query({
  args: { 
    query: v.string(),
    classFilter: v.optional(v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR"))),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("catalogItems").collect();
    const queryLower = args.query.toLowerCase();
    
    let results = items.filter(item => {
      if (item.archivedAt) return false;
      
      const matchesQuery = 
        item.name.toLowerCase().includes(queryLower) ||
        item.internalId.toLowerCase().includes(queryLower) ||
        (item.externalCode && item.externalCode.toLowerCase().includes(queryLower));
      
      const matchesClass = !args.classFilter || item.class === args.classFilter;
      
      return matchesQuery && matchesClass;
    });
    
    return results;
  },
});

/**
 * Actualiza los nutrientes de un item del catálogo
 * Registra auditoría en catalogChangeHistory
 */
export const update = mutation({
  args: {
    id: v.id("catalogItems"),
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
    reason: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Item no encontrado");
    }
    
    // Detectar campos cambiados
    const fieldsChanged: string[] = [];
    const before: Record<string, any> = {};
    const after: Record<string, any> = {};
    
    const nutrients = [
      "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur",
      "P", "K", "CaO", "MgO", "S", "B",
      "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
    ];
    
    for (const nutrient of nutrients) {
      if (item.composition[nutrient as keyof typeof item.composition] !== args.composition[nutrient as keyof typeof args.composition]) {
        fieldsChanged.push(nutrient);
        before[nutrient] = item.composition[nutrient as keyof typeof item.composition];
        after[nutrient] = args.composition[nutrient as keyof typeof args.composition];
      }
    }
    
    // Actualizar item
    await ctx.db.patch(args.id, {
      composition: args.composition,
      updatedAt: Date.now(),
      updatedBy: args.updatedBy,
    });
    
    // Registrar auditoría si hubo cambios
    if (fieldsChanged.length > 0) {
      await ctx.db.insert("catalogChangeHistory", {
        catalogItemId: args.id,
        internalId: item.internalId,
        changedAt: Date.now(),
        changedBy: args.updatedBy,
        fieldsChanged,
        before,
        after,
        reason: args.reason,
        source: "user",
      });
    }
  },
});

/**
 * Archiva un item del catálogo
 */
export const archive = mutation({
  args: { id: v.id("catalogItems") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      archivedAt: Date.now(),
    });
  },
});

/**
 * Elimina físicamente un item del catálogo (solo admin)
 */
export const remove = mutation({
  args: { id: v.id("catalogItems") },
  handler: async (ctx, args) => {
    // Verificar si el item está en alguna lista viva
    const lists = await ctx.db.query("productLists").collect();
    const inUse = lists.some(list => 
      list.components.some(comp => comp.catalogItemId === args.id)
    );
    
    if (inUse) {
      throw new Error("No se puede eliminar: el item está en uso en listas vivas");
    }
    
    await ctx.db.delete(args.id);
  },
});

/**
 * Obtiene el historial de cambios de un item
 */
export const getHistory = query({
  args: { catalogItemId: v.id("catalogItems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("catalogChangeHistory")
      .withIndex("by_catalogItemId", q => q.eq("catalogItemId", args.catalogItemId))
      .order("desc")
      .collect();
  },
});
