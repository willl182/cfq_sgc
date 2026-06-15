/**
 * Mutations del Formulador CFQ v2
 *
 * Seed: carga CSV inicial (solo si catálogo vacío)
 * Catálogo: edición inline con auditoría
 * Listas: guardado con snapshot automático
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

const NUTRIENT_KEYS = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur",
  "P", "K", "CaO", "MgO", "S", "B", "Co", "Cu",
  "Fe", "Mn", "Mo", "SiO2", "Zn", "Na",
] as const;

type NutrientKey = (typeof NUTRIENT_KEYS)[number];

// ---- NUTRIENT FIELDS HELPER ----

function emptyNutrients(): Record<string, number> {
  const obj: Record<string, number> = {};
  for (const key of NUTRIENT_KEYS) {
    obj[key] = 0;
  }
  return obj;
}

// ---- SEED: CARGA CSV INICIAL ----

/**
 * Carga inicial del catálogo desde CSV.
 * Solo funciona si el catálogo está vacío.
 * El client debe parsear el CSV y enviar los items como argumento.
 */
export const seedCatalog = mutation({
  args: {
    items: v.array(
      v.object({
        internalId: v.string(),
        externalCode: v.string(),
        originalCode: v.optional(v.string()),
        nombre: v.string(),
        clase: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
        tipo: v.union(v.literal("G"), v.literal("P"), v.literal("L"), v.literal("C")),
        composicion: v.object({
          C: v.number(), N: v.number(), N_NH4: v.number(), N_NO3: v.number(),
          N_org: v.number(), N_ur: v.number(), P: v.number(), K: v.number(),
          CaO: v.number(), MgO: v.number(), S: v.number(), B: v.number(),
          Co: v.number(), Cu: v.number(), Fe: v.number(), Mn: v.number(),
          Mo: v.number(), SiO2: v.number(), Zn: v.number(), Na: v.number(),
        }),
      })
    ),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    // Verificar que el catálogo está vacío
    const existing = await ctx.db.query("catalogItems").first();
    if (existing !== null) {
      throw new Error("El catálogo ya tiene datos. No se puede hacer seed.");
    }

    const now = Date.now();
    let inserted = 0;
    const errors: string[] = [];

    for (const item of args.items) {
      try {
        // Validar que internalId no exista
        const dup = await ctx.db
          .query("catalogItems")
          .withIndex("by_internalId", (q) => q.eq("internalId", item.internalId))
          .first();
        if (dup !== null) {
          errors.push(`ID duplicado: ${item.internalId}`);
          continue;
        }

        const itemId = await ctx.db.insert("catalogItems", {
          internalId: item.internalId,
          externalCode: item.externalCode,
          originalCode: item.originalCode,
          nombre: item.nombre,
          clase: item.clase,
          tipo: item.tipo,
          composicion: item.composicion,
          updatedAt: now,
          createdAt: now,
        });

        // Registrar auditoría de seed
        await ctx.db.insert("catalogChangeHistory", {
          catalogItemId: itemId,
          internalId: item.internalId,
          actor: args.actor,
          changes: [
            { field: "create", after: `${item.internalId} - ${item.nombre}` },
          ],
          source: "seed",
          changedAt: now,
        });

        inserted++;
      } catch (e) {
        errors.push(`Error insertando ${item.internalId}: ${e}`);
      }
    }

    return {
      inserted,
      rejected: args.items.length - inserted,
      errors,
    };
  },
});

// ---- CATÁLOGO: EDICIÓN ----

/**
 * Actualizar un item del catálogo con auditoría.
 * Usuario normal solo puede editar MP.
 * Admin local puede editar MP, PT y MZR.
 */
export const updateCatalogItem = mutation({
  args: {
    catalogItemId: v.id("catalogItems"),
    nombre: v.optional(v.string()),
    composicion: v.optional(
      v.object({
        C: v.number(), N: v.number(), N_NH4: v.number(), N_NO3: v.number(),
        N_org: v.number(), N_ur: v.number(), P: v.number(), K: v.number(),
        CaO: v.number(), MgO: v.number(), S: v.number(), B: v.number(),
        Co: v.number(), Cu: v.number(), Fe: v.number(), Mn: v.number(),
        Mo: v.number(), SiO2: v.number(), Zn: v.number(), Na: v.number(),
      })
    ),
    actor: v.string(),
    isAdmin: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.catalogItemId);
    if (!item) throw new Error("Item no encontrado");
    if (item.archivedAt !== undefined) throw new Error("Item archivado");

    // Verificar permisos
    if (!args.isAdmin && item.clase !== "MP") {
      throw new Error("Usuario normal solo puede editar Materias Primas (MP)");
    }

    const changes: Array<{ field: string; before?: string; after?: string }> = [];
    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.nombre !== undefined && args.nombre !== item.nombre) {
      changes.push({ field: "nombre", before: item.nombre, after: args.nombre });
      updates.nombre = args.nombre;
    }

    if (args.composicion !== undefined) {
      for (const key of NUTRIENT_KEYS) {
        const newVal = args.composicion[key as NutrientKey];
        const oldVal = item.composicion[key as NutrientKey];
        if (newVal !== oldVal) {
          changes.push({
            field: key,
            before: String(oldVal),
            after: String(newVal),
          });
        }
      }
      updates.composicion = args.composicion;
    }

    if (changes.length > 0) {
      await ctx.db.patch(args.catalogItemId, updates);

      // Registrar auditoría
      await ctx.db.insert("catalogChangeHistory", {
        catalogItemId: args.catalogItemId,
        internalId: item.internalId,
        actor: args.actor,
        changes,
        reason: args.reason,
        source: "manual",
        changedAt: Date.now(),
      });
    }

    return { updated: true, changes: changes.length };
  },
});

/**
 * Archivar un item del catálogo.
 * Solo admin puede archivar.
 * Advierte si el item aparece en listas vivas.
 */
export const archiveCatalogItem = mutation({
  args: {
    catalogItemId: v.id("catalogItems"),
    actor: v.string(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.isAdmin) {
      throw new Error("Solo admin puede archivar items del catálogo");
    }

    const item = await ctx.db.get(args.catalogItemId);
    if (!item) throw new Error("Item no encontrado");

    // Verificar si aparece en listas vivas
    const activeLists = await ctx.db.query("productLists").collect();
    const usedInLists = activeLists.filter(
      (l) => l.archivedAt === undefined &&
        l.componentes.some((c) => c.catalogItemId === args.catalogItemId)
    );

    if (usedInLists.length > 0) {
      // Advertir pero permitir archivar
      // El frontend debe mostrar la advertencia antes de llamar
    }

    await ctx.db.patch(args.catalogItemId, {
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("catalogChangeHistory", {
      catalogItemId: args.catalogItemId,
      internalId: item.internalId,
      actor: args.actor,
      changes: [{ field: "archivedAt", after: String(Date.now()) }],
      source: "manual",
      changedAt: Date.now(),
    });

    return { archived: true, usedInLists: usedInLists.length };
  },
});

// ---- LISTAS DE PRODUCTO ----

/**
 * Crear o actualizar una lista de producto.
 * Crea snapshot en la misma mutación.
 */
export const saveProductList = mutation({
  args: {
    productListId: v.optional(v.id("productLists")),
    targetProductId: v.optional(v.id("catalogItems")),
    displayCode: v.string(),
    nombre: v.optional(v.string()),
    componentes: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        cantidadKg: v.number(),
      })
    ),
    composicionCalculada: v.optional(
      v.object({
        C: v.number(), N: v.number(), N_NH4: v.number(), N_NO3: v.number(),
        N_org: v.number(), N_ur: v.number(), P: v.number(), K: v.number(),
        CaO: v.number(), MgO: v.number(), S: v.number(), B: v.number(),
        Co: v.number(), Cu: v.number(), Fe: v.number(), Mn: v.number(),
        Mo: v.number(), SiO2: v.number(), Zn: v.number(), Na: v.number(),
      })
    ),
    estadoGeneral: v.optional(
      v.union(
        v.literal("CUMPLE"),
        v.literal("CUMPLE_S"),
        v.literal("NO_CUMPLE"),
        v.literal("SIN_OBJETIVO")
      )
    ),
    detalleTolerancia: v.optional(
      v.array(
        v.object({
          nutriente: v.string(),
          calculado: v.number(),
          declarado: v.number(),
          tolerancia: v.number(),
          min: v.number(),
          max: v.number(),
          estado: v.union(v.literal("C"), v.literal("NC"), v.literal("SUP")),
        })
      )
    ),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Calcular total
    const totalKg = args.componentes.reduce((sum, c) => sum + c.cantidadKg, 0);

    // Obtener datos de componentes para snapshot
    const componentesSnapshot = [];
    for (const comp of args.componentes) {
      const item = await ctx.db.get(comp.catalogItemId);
      if (!item) throw new Error(`Componente ${comp.catalogItemId} no encontrado`);
      componentesSnapshot.push({
        catalogItemId: comp.catalogItemId,
        internalId: item.internalId,
        nombre: item.nombre,
        cantidadKg: comp.cantidadKg,
        composicionSnapshot: item.composicion,
      });
    }

    // Obtener target para snapshot
    let targetForSnapshot: typeof args.composicionCalculada | undefined;
    if (args.targetProductId) {
      const target = await ctx.db.get(args.targetProductId);
      if (target) {
        targetForSnapshot = target.composicion;
      }
    }

    let listId: string;
    let snapshotVersion: number;

    if (args.productListId) {
      // Actualizar lista existente
      const existing = await ctx.db.get(args.productListId);
      if (!existing) throw new Error("Lista no encontrada");
      snapshotVersion = (existing.snapshotVersion || 0) + 1;

      await ctx.db.patch(args.productListId, {
        targetProductId: args.targetProductId,
        displayCode: args.displayCode,
        nombre: args.nombre,
        componentes: args.componentes,
        totalKg: parseFloat(totalKg.toFixed(2)),
        composicionCalculada: args.composicionCalculada,
        estadoGeneral: args.estadoGeneral,
        detalleTolerancia: args.detalleTolerancia,
        snapshotVersion,
        updatedAt: now,
      });

      listId = args.productListId;
    } else {
      // Crear nueva lista
      snapshotVersion = 1;

      listId = await ctx.db.insert("productLists", {
        targetProductId: args.targetProductId,
        displayCode: args.displayCode,
        nombre: args.nombre,
        componentes: args.componentes,
        totalKg: parseFloat(totalKg.toFixed(2)),
        composicionCalculada: args.composicionCalculada,
        estadoGeneral: args.estadoGeneral,
        detalleTolerancia: args.detalleTolerancia,
        snapshotVersion,
        updatedAt: now,
        createdAt: now,
      });
    }

    // Crear snapshot inmutable
    const alertas: string[] = [];
    if (totalKg !== 1000) {
      alertas.push(`Total ${totalKg} kg ≠ 1000 kg`);
    }

    await ctx.db.insert("productListSnapshots", {
      productListId: listId as any,
      targetProductId: args.targetProductId,
      displayCode: args.displayCode,
      nombre: args.nombre,
      snapshotVersion,
      componentesSnapshot,
      targetComposicion: targetForSnapshot as any,
      composicionCalculada: (args.composicionCalculada ?? emptyNutrients()) as any,
      totalKg: parseFloat(totalKg.toFixed(2)),
      estadoGeneral: args.estadoGeneral ?? "SIN_OBJETIVO",
      detalleTolerancia: args.detalleTolerancia ?? [],
      alertas,
      creadoPor: args.actor,
      createdAt: now,
    });

    return { listId, snapshotVersion };
  },
});

/**
 * Archivar una lista de producto.
 */
export const archiveProductList = mutation({
  args: {
    productListId: v.id("productLists"),
    actor: v.string(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.productListId);
    if (!list) throw new Error("Lista no encontrada");

    await ctx.db.patch(args.productListId, {
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { archived: true };
  },
});

/**
 * Archivar un snapshot.
 */
export const archiveSnapshot = mutation({
  args: {
    snapshotId: v.id("productListSnapshots"),
    actor: v.string(),
  },
  handler: async (_ctx, _args) => {
    // Snapshots no se eliminan físicamente, solo se archivan
    // La eliminación física es solo para admin (no implementada en fase inicial)
    throw new Error("Archivado de snapshots no implementado en fase inicial");
  },
});

/**
 * Clonar un snapshot a una nueva lista.
 */
export const cloneSnapshotToList = mutation({
  args: {
    snapshotId: v.id("productListSnapshots"),
    newDisplayCode: v.string(),
    newNombre: v.optional(v.string()),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot) throw new Error("Snapshot no encontrado");

    const now = Date.now();

    // Crear nueva lista desde el snapshot
    const componentes = snapshot.componentesSnapshot.map((cs) => ({
      catalogItemId: cs.catalogItemId,
      cantidadKg: cs.cantidadKg,
    }));

    const listId = await ctx.db.insert("productLists", {
      targetProductId: snapshot.targetProductId,
      displayCode: args.newDisplayCode,
      nombre: args.newNombre ?? `Clon de ${snapshot.nombre || snapshot.displayCode}`,
      componentes,
      totalKg: snapshot.totalKg,
      composicionCalculada: snapshot.composicionCalculada,
      estadoGeneral: snapshot.estadoGeneral,
      detalleTolerancia: snapshot.detalleTolerancia,
      snapshotVersion: 1,
      updatedAt: now,
      createdAt: now,
    });

    // Crear primer snapshot de la nueva lista
    await ctx.db.insert("productListSnapshots", {
      productListId: listId as any,
      targetProductId: snapshot.targetProductId,
      displayCode: args.newDisplayCode,
      nombre: args.newNombre ?? `Clon de ${snapshot.nombre || snapshot.displayCode}`,
      snapshotVersion: 1,
      componentesSnapshot: snapshot.componentesSnapshot,
      targetComposicion: snapshot.targetComposicion,
      composicionCalculada: snapshot.composicionCalculada as any,
      totalKg: snapshot.totalKg,
      estadoGeneral: snapshot.estadoGeneral,
      detalleTolerancia: snapshot.detalleTolerancia,
      alertas: snapshot.alertas,
      creadoPor: args.actor,
      createdAt: now,
    });

    return { listId };
  },
});