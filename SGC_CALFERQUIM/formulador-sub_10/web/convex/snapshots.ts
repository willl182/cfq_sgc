import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Lista todos los snapshots (con filtros opcionales)
 */
export const list = query({
  args: {
    targetProductId: v.optional(v.id("catalogItems")),
    productListId: v.optional(v.id("productLists")),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let snapshots = await ctx.db.query("productListSnapshots").collect();
    
    // Filtrar por producto objetivo si se especifica
    if (args.targetProductId) {
      snapshots = snapshots.filter(s => s.targetProductId === args.targetProductId);
    }
    
    // Filtrar por lista si se especifica
    if (args.productListId) {
      snapshots = snapshots.filter(s => s.productListId === args.productListId);
    }
    
    // Excluir archivados por defecto
    if (!args.includeArchived) {
      snapshots = snapshots.filter(s => !s.archivedAt);
    }
    
    // Ordenar por fecha de creación (más reciente primero)
    snapshots.sort((a, b) => b.createdAt - a.createdAt);
    
    return snapshots;
  },
});

/**
 * Obtiene un snapshot por ID
 */
export const get = query({
  args: { id: v.id("productListSnapshots") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Obtiene todos los snapshots de una lista
 */
export const getByList = query({
  args: { productListId: v.id("productLists") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productListSnapshots")
      .withIndex("by_productListId", q => q.eq("productListId", args.productListId))
      .order("desc")
      .collect();
  },
});

/**
 * Archiva un snapshot
 */
export const archive = mutation({
  args: { id: v.id("productListSnapshots") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      archivedAt: Date.now(),
    });
  },
});

/**
 * Elimina físicamente un snapshot (solo admin)
 */
export const remove = mutation({
  args: { id: v.id("productListSnapshots") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Clona un snapshot a una nueva lista
 */
export const cloneToList = mutation({
  args: {
    snapshotId: v.id("productListSnapshots"),
    name: v.optional(v.string()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot) {
      throw new Error("Snapshot no encontrado");
    }
    
    // Extraer componentes del snapshot
    const components = snapshot.components.map(comp => ({
      catalogItemId: comp.catalogItemId,
      quantityKg: comp.quantityKg,
    }));
    
    // Crear nueva lista
    const now = Date.now();
    let displayCode: string;
    
    if (snapshot.targetProductId) {
      const targetProduct = await ctx.db.get(snapshot.targetProductId);
      if (!targetProduct) {
        throw new Error("Producto objetivo no encontrado");
      }
      
      // Obtener listas existentes para este producto
      const existingLists = await ctx.db
        .query("productLists")
        .withIndex("by_targetProductId", q => q.eq("targetProductId", snapshot.targetProductId))
        .collect();
      
      const listNumber = existingLists.length + 1;
      displayCode = `${targetProduct.internalId}-L${String(listNumber).padStart(3, "0")}`;
    } else {
      // Borrador sin objetivo
      const allLists = await ctx.db.query("productLists").collect();
      const borradorCount = allLists.filter(l => l.displayCode.startsWith("BORRADOR-")).length;
      displayCode = `BORRADOR-${String(borradorCount + 1).padStart(3, "0")}`;
    }
    
    const listId = await ctx.db.insert("productLists", {
      targetProductId: snapshot.targetProductId,
      displayCode,
      name: args.name || `Copia de ${snapshot.displayCode} v${snapshot.snapshotVersion}`,
      components,
      totalKg: snapshot.totalKg,
      updatedAt: now,
      updatedBy: args.createdBy,
    });
    
    // Crear snapshot v1 para la nueva lista
    await ctx.db.insert("productListSnapshots", {
      productListId: listId,
      targetProductId: snapshot.targetProductId,
      snapshotVersion: 1,
      displayCode,
      name: args.name || `Copia de ${snapshot.displayCode} v${snapshot.snapshotVersion}`,
      targetComposition: snapshot.targetComposition,
      components: snapshot.components,
      calculatedComposition: snapshot.calculatedComposition,
      toleranceEvaluation: snapshot.toleranceEvaluation,
      totalKg: snapshot.totalKg,
      alerts: snapshot.alerts,
      createdAt: now,
      createdBy: args.createdBy,
    });
    
    return {
      listId,
      displayCode,
    };
  },
});
