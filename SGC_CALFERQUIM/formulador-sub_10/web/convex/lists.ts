import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { calculateFinalComposition, calculateTotalKg } from "./lib/formulas";
import { evaluateTolerance } from "./lib/tolerances";

/**
 * Lista todas las listas de productos (con filtros opcionales)
 */
export const list = query({
  args: {
    targetProductId: v.optional(v.id("catalogItems")),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let lists = await ctx.db.query("productLists").collect();
    
    // Filtrar por producto objetivo si se especifica
    if (args.targetProductId) {
      lists = lists.filter(list => list.targetProductId === args.targetProductId);
    }
    
    // Excluir archivadas por defecto
    if (!args.includeArchived) {
      lists = lists.filter(list => !list.archivedAt);
    }
    
    return lists;
  },
});

/**
 * Obtiene una lista por ID
 */
export const get = query({
  args: { id: v.id("productLists") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Obtiene todas las listas de un producto objetivo
 */
export const getByTarget = query({
  args: { targetProductId: v.id("catalogItems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productLists")
      .withIndex("by_targetProductId", q => q.eq("targetProductId", args.targetProductId))
      .collect();
  },
});

/**
 * Guarda una lista (crea o actualiza) y crea un snapshot automáticamente
 * Cada guardado persistente crea/actualiza la lista viva y crea snapshot en la misma mutación
 */
export const save = mutation({
  args: {
    id: v.optional(v.id("productLists")), // Si existe, actualiza; si no, crea
    targetProductId: v.optional(v.id("catalogItems")),
    name: v.optional(v.string()),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        quantityKg: v.number(),
      })
    ),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Obtener composiciones de los componentes
    const componentsWithComposition = await Promise.all(
      args.components.map(async (comp) => {
        const catalogItem = await ctx.db.get(comp.catalogItemId);
        if (!catalogItem) {
          throw new Error(`Item de catálogo no encontrado: ${comp.catalogItemId}`);
        }
        
        return {
          catalogItemId: comp.catalogItemId,
          internalId: catalogItem.internalId,
          name: catalogItem.name,
          quantityKg: comp.quantityKg,
          compositionSnapshot: catalogItem.composition,
        };
      })
    );
    
    // Calcular composición final
    const calculatedComposition = calculateFinalComposition(componentsWithComposition);
    
    // Calcular total de kg
    const totalKg = calculateTotalKg(componentsWithComposition);
    
    // Obtener composición objetivo si existe
    let targetComposition = undefined;
    if (args.targetProductId) {
      const targetProduct = await ctx.db.get(args.targetProductId);
      if (targetProduct) {
        targetComposition = targetProduct.composition;
      }
    }
    
    // Evaluar tolerancia
    const toleranceEvaluation = evaluateTolerance(calculatedComposition, targetComposition);
    
    // Generar alertas
    const alerts: string[] = [];
    if (Math.abs(totalKg - 1000) > 0.01) {
      alerts.push(`Total: ${totalKg.toFixed(2)} kg (esperado: 1000 kg)`);
    }
    
    let listId: any;
    let displayCode: string;
    
    if (args.id) {
      // Actualizar lista existente
      const existingList = await ctx.db.get(args.id);
      if (!existingList) {
        throw new Error("Lista no encontrada");
      }
      
      displayCode = existingList.displayCode;
      
      await ctx.db.patch(args.id, {
        targetProductId: args.targetProductId,
        name: args.name,
        components: args.components,
        totalKg,
        updatedAt: now,
        updatedBy: args.updatedBy,
      });
      
      listId = args.id;
      
      // Obtener la versión actual de snapshots para esta lista
      const existingSnapshots = await ctx.db
        .query("productListSnapshots")
        .withIndex("by_productListId", q => q.eq("productListId", args.id))
        .collect();
      
      const nextVersion = existingSnapshots.length + 1;
      
      // Crear nuevo snapshot
      await ctx.db.insert("productListSnapshots", {
        productListId: args.id,
        targetProductId: args.targetProductId,
        snapshotVersion: nextVersion,
        displayCode,
        name: args.name,
        targetComposition,
        components: componentsWithComposition,
        calculatedComposition,
        toleranceEvaluation,
        totalKg,
        alerts,
        createdAt: now,
        createdBy: args.updatedBy,
      });
    } else {
      // Crear nueva lista
      // Generar displayCode
      if (args.targetProductId) {
        const targetProduct = await ctx.db.get(args.targetProductId);
        if (!targetProduct) {
          throw new Error("Producto objetivo no encontrado");
        }
        
        // Obtener listas existentes para este producto
        const existingLists = await ctx.db
          .query("productLists")
          .withIndex("by_targetProductId", q => q.eq("targetProductId", args.targetProductId))
          .collect();
        
        const listNumber = existingLists.length + 1;
        displayCode = `${targetProduct.internalId}-L${String(listNumber).padStart(3, "0")}`;
      } else {
        // Borrador sin objetivo
        const allLists = await ctx.db.query("productLists").collect();
        const borradorCount = allLists.filter(l => l.displayCode.startsWith("BORRADOR-")).length;
        displayCode = `BORRADOR-${String(borradorCount + 1).padStart(3, "0")}`;
      }
      
      listId = await ctx.db.insert("productLists", {
        targetProductId: args.targetProductId,
        displayCode,
        name: args.name,
        components: args.components,
        totalKg,
        updatedAt: now,
        updatedBy: args.updatedBy,
      });
      
      // Crear snapshot v1
      await ctx.db.insert("productListSnapshots", {
        productListId: listId,
        targetProductId: args.targetProductId,
        snapshotVersion: 1,
        displayCode,
        name: args.name,
        targetComposition,
        components: componentsWithComposition,
        calculatedComposition,
        toleranceEvaluation,
        totalKg,
        alerts,
        createdAt: now,
        createdBy: args.updatedBy,
      });
    }
    
    return {
      listId,
      displayCode,
      totalKg,
      calculatedComposition,
      toleranceEvaluation,
      alerts,
    };
  },
});

/**
 * Archiva una lista
 */
export const archive = mutation({
  args: { id: v.id("productLists") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      archivedAt: Date.now(),
    });
  },
});
