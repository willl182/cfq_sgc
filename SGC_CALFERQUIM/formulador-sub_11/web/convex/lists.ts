import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { calculateCompositionAndEvaluation, ComponentInput, Nutrients } from "./calculations";

export const saveList = mutation({
  args: {
    id: v.optional(v.id("productLists")),
    targetProductId: v.union(v.id("catalogItems"), v.null()),
    name: v.string(),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        quantity: v.number(),
      })
    ),
    actor: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Resolve components current state from catalog
    const resolvedComponents: ComponentInput[] = [];
    const dbComponents: { catalogItemId: Id<"catalogItems">; internalId: string; quantity: number }[] = [];

    for (const comp of args.components) {
      const item = await ctx.db.get(comp.catalogItemId);
      if (!item) {
        throw new Error(`Insumo con ID ${comp.catalogItemId} no existe en el catálogo.`);
      }
      resolvedComponents.push({
        internalId: item.internalId,
        producto: item.producto,
        quantity: comp.quantity,
        nutrients: item.nutrients,
      });
      dbComponents.push({
        catalogItemId: comp.catalogItemId,
        internalId: item.internalId,
        quantity: comp.quantity,
      });
    }

    // 2. Resolve target product nutrients
    let targetNutrients: Nutrients | null = null;
    let targetItemName = "Sin Objetivo";
    let targetInternalId = "";

    if (args.targetProductId) {
      const targetItem = await ctx.db.get(args.targetProductId);
      if (!targetItem) {
        throw new Error(`Producto objetivo con ID ${args.targetProductId} no encontrado.`);
      }
      targetNutrients = targetItem.nutrients;
      targetItemName = targetItem.producto;
      targetInternalId = targetItem.internalId;
    }

    // 3. Compute live composition and evaluation
    const calculation = calculateCompositionAndEvaluation(resolvedComponents, targetNutrients);

    let listId: Id<"productLists">;
    let displayCode = "";
    let nextVersion = 1;

    const timestamp = Date.now();

    if (args.id) {
      // Edit existing list
      const existing = await ctx.db.get(args.id);
      if (!existing) {
        throw new Error("La lista a editar no existe.");
      }
      listId = args.id;
      displayCode = existing.displayCode;

      // Update the live list record
      await ctx.db.patch(listId, {
        targetProductId: args.targetProductId,
        name: args.name,
        components: dbComponents,
        updatedAt: timestamp,
      });

      // Calculate next version by counting snapshots
      const snapshots = await ctx.db
        .query("productListSnapshots")
        .withIndex("by_productListId", (q) => q.eq("productListId", listId))
        .collect();
      nextVersion = snapshots.length + 1;
    } else {
      // Create new list
      // Generate displayCode: e.g. PT0008-L001 or BORRADOR-L001
      let prefix = "BORRADOR";
      if (args.targetProductId && targetInternalId) {
        prefix = targetInternalId;
      }

      // Count existing lists with this target/prefix to assign next suffix
      const existingLists = await ctx.db.query("productLists").collect();
      const matchingPrefixCount = existingLists.filter(l => {
        if (args.targetProductId) {
          return l.targetProductId === args.targetProductId;
        } else {
          return l.targetProductId === null;
        }
      }).length;

      const suffix = String(matchingPrefixCount + 1).padStart(3, "0");
      displayCode = `${prefix}-L${suffix}`;

      listId = await ctx.db.insert("productLists", {
        targetProductId: args.targetProductId,
        displayCode,
        name: args.name,
        components: dbComponents,
        archivedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // 4. Freeze snapshot in the same mutation
    const snapshotComponents = resolvedComponents.map((c, idx) => ({
      catalogItemId: dbComponents[idx].catalogItemId,
      internalId: c.internalId,
      producto: c.producto,
      quantity: c.quantity,
      nutrients: c.nutrients,
    }));

    await ctx.db.insert("productListSnapshots", {
      productListId: listId,
      targetProductId: args.targetProductId,
      snapshotVersion: nextVersion,
      totalKg: calculation.totalKg,
      components: snapshotComponents,
      calculatedComposition: calculation.calculatedComposition,
      evaluation: {
        status: calculation.evaluation.status,
        nutrientStatuses: calculation.evaluation.nutrientStatuses,
      },
      alerts: calculation.alerts,
      user: args.actor,
      createdAt: timestamp,
    });

    return { listId, displayCode, version: nextVersion };
  },
});

export const getLists = query({
  args: { includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let lists = await ctx.db.query("productLists").collect();
    if (!args.includeArchived) {
      lists = lists.filter(l => l.archivedAt === null);
    }

    // Resolve target details and current live values
    const results: any[] = [];
    for (const list of lists) {
      let targetProductInternalId = "";
      let targetProductName = "";
      let targetNutrients: Nutrients | null = null;

      if (list.targetProductId) {
        const target = await ctx.db.get(list.targetProductId);
        if (target) {
          targetProductInternalId = target.internalId;
          targetProductName = target.producto;
          targetNutrients = target.nutrients;
        }
      }

      // Resolve components from current live catalog
      const resolvedComponents: ComponentInput[] = [];
      let missingComponent = false;

      for (const comp of list.components) {
        const item = await ctx.db.get(comp.catalogItemId);
        if (item) {
          resolvedComponents.push({
            internalId: item.internalId,
            producto: item.producto,
            quantity: comp.quantity,
            nutrients: item.nutrients,
          });
        } else {
          missingComponent = true;
          // Fallback to placeholder/unresolved if catalog item is physically deleted (should be rare)
          resolvedComponents.push({
            internalId: comp.internalId,
            producto: "Elemento Eliminado",
            quantity: comp.quantity,
            nutrients: {} as any, // empty
          });
        }
      }

      // Recalculate live
      const calculation = calculateCompositionAndEvaluation(resolvedComponents, targetNutrients);

      results.push({
        ...list,
        targetProductInternalId,
        targetProductName,
        liveComposition: calculation.calculatedComposition,
        liveEvaluation: calculation.evaluation,
        liveTotalKg: calculation.totalKg,
        liveAlerts: calculation.alerts,
        hasMissingComponent: missingComponent,
      });
    }

    return results;
  },
});

export const getList = query({
  args: { id: v.id("productLists") },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.id);
    if (!list) return null;

    let targetProductInternalId = "";
    let targetProductName = "";
    let targetNutrients: Nutrients | null = null;

    if (list.targetProductId) {
      const target = await ctx.db.get(list.targetProductId);
      if (target) {
        targetProductInternalId = target.internalId;
        targetProductName = target.producto;
        targetNutrients = target.nutrients;
      }
    }

    // Resolve components live
    const resolvedComponents: any[] = [];
    for (const comp of list.components) {
      const item = await ctx.db.get(comp.catalogItemId);
      resolvedComponents.push({
        catalogItemId: comp.catalogItemId,
        internalId: item?.internalId ?? comp.internalId,
        producto: item?.producto ?? "Elemento Eliminado",
        quantity: comp.quantity,
        nutrients: item?.nutrients ?? {} as any,
        isArchived: item ? item.archivedAt !== null : false,
      });
    }

    // Recalculate live
    const calculation = calculateCompositionAndEvaluation(
      resolvedComponents.map(c => ({
        internalId: c.internalId,
        producto: c.producto,
        quantity: c.quantity,
        nutrients: c.nutrients,
      })),
      targetNutrients
    );

    return {
      ...list,
      targetProductInternalId,
      targetProductName,
      targetNutrients,
      resolvedComponents,
      liveComposition: calculation.calculatedComposition,
      liveEvaluation: calculation.evaluation,
      liveTotalKg: calculation.totalKg,
      liveAlerts: calculation.alerts,
    };
  },
});

export const archiveList = mutation({
  args: { id: v.id("productLists"), actor: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Lista no encontrada.");
    }
    await ctx.db.patch(args.id, { archivedAt: Date.now() });
    return { success: true };
  },
});

export const deleteList = mutation({
  args: { id: v.id("productLists"), role: v.string() },
  handler: async (ctx, args) => {
    if (args.role !== "admin") {
      throw new Error("Solo el administrador local puede eliminar físicamente listas.");
    }
    const list = await ctx.db.get(args.id);
    if (!list) {
      throw new Error("Lista no encontrada.");
    }

    // Delete snapshots first
    const snapshots = await ctx.db
      .query("productListSnapshots")
      .withIndex("by_productListId", (q) => q.eq("productListId", args.id))
      .collect();
    for (const snap of snapshots) {
      await ctx.db.delete(snap._id);
    }

    // Delete list
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const getSnapshots = query({
  args: {
    targetProductId: v.optional(v.union(v.id("catalogItems"), v.null())),
    productListId: v.optional(v.id("productLists")),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("productListSnapshots");
    if (args.productListId) {
      return await q
        .withIndex("by_productListId", (idx) => idx.eq("productListId", args.productListId!))
        .order("desc")
        .collect();
    }
    const snaps = await q.order("desc").collect();
    // In-memory filter for targetProductId since compound index is not standard
    if (args.targetProductId !== undefined) {
      return snaps.filter(s => s.targetProductId === args.targetProductId);
    }
    return snaps;
  },
});

export const getSnapshot = query({
  args: { id: v.id("productListSnapshots") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
