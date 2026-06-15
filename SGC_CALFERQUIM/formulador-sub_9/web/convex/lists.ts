/**
 * Mutations para listas de productos y snapshots.
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { NUTRIENTS, calculateComposition, calculateTotalKg, roundCantidad, evaluateTolerance } from "../src/lib/formulas";

// ─── Guardar/crear lista con snapshot automático ─────────────────────────────

export const saveProductList = mutation({
  args: {
    id: v.optional(v.id("productLists")), // null = nueva
    targetProductId: v.optional(v.id("catalogItems")),
    components: v.array(v.object({
      catalogItemId: v.id("catalogItems"),
      cantidadKg: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const { id, targetProductId, components } = args;
    const now = Date.now();

    // Obtener items del catálogo para los componentes
    const catalogItems = new Map<string, any>();
    for (const comp of components) {
      const item = await ctx.db.get(comp.catalogItemId);
      if (item) {
        catalogItems.set(comp.catalogItemId.toString(), item);
      }
    }

    // Preparar componentes con nutrientes para cálculo
    const componentsForCalc = components.map(comp => {
      const item = catalogItems.get(comp.catalogItemId.toString());
      const nutrients: Record<string, number> = {};
      for (const n of NUTRIENTS) {
        nutrients[n] = item ? (item[n] || 0) : 0;
      }
      return {
        catalogItemId: comp.catalogItemId.toString(),
        name: item?.name || "Desconocido",
        cantidadKg: roundCantidad(comp.cantidadKg),
        nutrients,
      };
    });

    // Calcular composición
    const calculatedComposition = calculateComposition(componentsForCalc);
    const totalKg = calculateTotalKg(componentsForCalc);

    // Verificar si hay alertas
    const alertas: string[] = [];
    if (Math.abs(totalKg - 1000) > 0.01) {
      alertas.push(`Total ${totalKg} kg ≠ 1000 kg`);
    }

    // Obtener producto objetivo para evaluación de tolerancia
    let targetProduct = null;
    let evaluation = null;
    
    if (targetProductId) {
      targetProduct = await ctx.db.get(targetProductId);
      if (targetProduct) {
        const targetNutrients: Record<string, number> = {};
        for (const n of NUTRIENTS) {
          targetNutrients[n] = targetProduct[n] || 0;
        }
        evaluation = evaluateTolerance(calculatedComposition, targetNutrients);
        
        if (evaluation.generalStatus === "NO_CUMPLE") {
          alertas.push("Mezcla NO CUMPLE tolerancias");
        } else if (evaluation.generalStatus === "CUMPLE_S") {
          alertas.push("Mezcla supera algunas tolerancias");
        }
      }
    }

    // Determinar código de visualización y grupo
    let displayCode: string;
    let group: string;

    if (id) {
      // Editando lista existente
      const existing = await ctx.db.get(id);
      if (!existing) throw new Error("Lista no encontrada");
      displayCode = existing.displayCode;
      group = existing.group;
    } else {
      // Nueva lista
      if (targetProductId && targetProduct) {
        displayCode = `${targetProduct.internalId}-L${String(Date.now()).slice(-6)}`;
        group = targetProduct.internalId;
      } else {
        displayCode = `DRAFT-${String(Date.now()).slice(-6)}`;
        group = "BORRADOR";
      }
    }

    // Determinar versión del snapshot
    const existingSnapshots = id
      ? await ctx.db.query("productListSnapshots")
          .withIndex("by_productListId", q => q.eq("productListId", id))
          .collect()
      : [];
    const nextVersion = `v${existingSnapshots.length + 1}`;

    // Guardar o actualizar la lista
    let listId: string;
    
    if (id) {
      await ctx.db.patch(id, {
        targetProductId: targetProductId || undefined,
        components: components.map(c => ({
          catalogItemId: c.catalogItemId,
          cantidadKg: roundCantidad(c.cantidadKg),
        })),
        group,
        totalKg,
        updatedAt: now,
      });
      listId = id.toString();
    } else {
      const newId = await ctx.db.insert("productLists", {
        displayCode,
        targetProductId: targetProductId || undefined,
        components: components.map(c => ({
          catalogItemId: c.catalogItemId,
          cantidadKg: roundCantidad(c.cantidadKg),
        })),
        group,
        totalKg,
        archivedAt: undefined,
        createdAt: now,
        updatedAt: now,
      });
      listId = newId.toString();
    }

    // Crear snapshot automáticamente
    await ctx.db.insert("productListSnapshots", {
      productListId: listId as any,
      snapshotVersion: nextVersion,
      displayCode,
      targetProductId: targetProductId || undefined,
      components: componentsForCalc.map(c => ({
        catalogItemId: c.catalogItemId as any,
        internalId: catalogItems.get(c.catalogItemId)?.internalId || "",
        name: c.name,
        cantidadKg: c.cantidadKg,
        composition: c.nutrients as any,
      })),
      calculatedComposition: calculatedComposition as any,
      toleranceEvaluation: evaluation as any,
      totalKg,
      alerts: alertas,
      createdBy: typeof window !== "undefined" && localStorage.getItem("formulador_admin") === "true" 
        ? "admin" 
        : "user",
      createdAt: now,
    });

    return {
      listId,
      displayCode,
      snapshotVersion: nextVersion,
      totalKg,
      calculatedComposition,
      toleranceEvaluation: evaluation,
      alerts,
    };
  },
});

// ─── Archivar lista ──────────────────────────────────────────────────────────

export const archiveProductList = mutation({
  args: {
    id: v.id("productLists"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// ─── Clonar snapshot a nueva lista ─────────────────────────────────────────

export const cloneSnapshotToList = mutation({
  args: {
    snapshotId: v.id("productListSnapshots"),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot) throw new Error("Snapshot no encontrado");

    const now = Date.now();
    const newDisplayCode = snapshot.targetProductId
      ? `${snapshot.displayCode.split("-")[0]}-CLONE-${String(now).slice(-4)}`
      : `CLONE-${String(now).slice(-6)}`;

    const newListId = await ctx.db.insert("productLists", {
      displayCode: newDisplayCode,
      targetProductId: snapshot.targetProductId || undefined,
      components: snapshot.components.map(c => ({
        catalogItemId: c.catalogItemId,
        cantidadKg: c.cantidadKg,
      })),
      group: snapshot.targetProductId 
        ? (await ctx.db.get(snapshot.targetProductId))?.internalId || "BORRADOR"
        : "BORRADOR",
      totalKg: snapshot.totalKg,
      archivedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return {
      newListId: newListId.toString(),
      displayCode: newDisplayCode,
    };
  },
});

// ─── Eliminar snapshot (solo admin) ─────────────────────────────────────────

export const deleteSnapshot = mutation({
  args: {
    id: v.id("productListSnapshots"),
  },
  handler: async (ctx, args) => {
    const isAdmin = typeof window !== "undefined" && 
      localStorage.getItem("formulador_admin") === "true";
    
    if (!isAdmin) {
      throw new Error("Solo admins pueden eliminar snapshots");
    }
    
    await ctx.db.delete(args.id);
  },
});