import { v } from "convex/vertices";
import { mutation, query } from "./functions/_generated";
import { productLists, productListSnapshots, catalogItems } from "./schema";
import { calcularComposicion, redondearComposicion } from "./formulas";
import { evaluarTolerancia } from "./tolerancias";
import type { Nutrients } from "./types";

function zerosNutrients(): Nutrients {
  return {
    C: 0, N: 0, N_NH4: 0, N_NO3: 0, N_org: 0, N_ur: 0,
    P: 0, K: 0, CaO: 0, MgO: 0, S: 0, B: 0,
    Co: 0, Cu: 0, Fe: 0, Mn: 0, Mo: 0, SiO2: 0, Zn: 0, Na: 0,
  };
}

export const list = query({
  args: {
    targetProductId: v.optional(v.id("catalogItems")),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let lists = await ctx.db.query("productLists").collect();

    if (!args.includeArchived) {
      lists = lists.filter(list => list.archivedAt === 0);
    }

    if (args.targetProductId) {
      lists = lists.filter(list => list.targetProductId === args.targetProductId);
    }

    return lists.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getById = query({
  args: { id: v.id("productLists") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByDisplayCode = query({
  args: { displayCode: v.string() },
  handler: async (ctx, args) => {
    const lists = await ctx.db
      .query("productLists")
      .withIndex("by_displayCode", (q) => q.eq("displayCode", args.displayCode))
      .collect();
    return lists[0] || null;
  },
});

export const getLiveListWithCalculation = query({
  args: { id: v.id("productLists") },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.id);
    if (!list) return null;

    const componentes = [];
    for (const comp of list.components) {
      const item = await ctx.db.get(comp.catalogItemId);
      if (item) {
        componentes.push({
          cantidadKg: comp.cantidadKg,
          nutrients: item.nutrients,
        });
      }
    }

    const composicionCalculada = calcularComposicion(componentes);

    let targetNutrients: Nutrients | null = null;
    if (list.targetProductId) {
      const targetProduct = await ctx.db.get(list.targetProductId);
      if (targetProduct) {
        targetNutrients = targetProduct.nutrients;
      }
    }

    const { detalle, estadoGeneral } = targetNutrients
      ? evaluarTolerancia(composicionCalculada, targetNutrients)
      : { detalle: {}, estadoGeneral: "SIN_OBJETIVO" as const };

    const totalKg = list.components.reduce((sum, c) => sum + c.cantidadKg, 0);

    const alertas: string[] = [];
    if (Math.abs(totalKg - 1000) > 0.01) {
      alertas.push(`Total ${totalKg} kg no suma 1000 kg`);
    }

    return {
      ...list,
      composicionCalculada,
      targetNutrients,
      detalle,
      estadoGeneral,
      totalKg,
      alertas,
    };
  },
});

export const listSnapshots = query({
  args: {
    productListId: v.optional(v.id("productLists")),
    targetProductId: v.optional(v.id("catalogItems")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let snapshots = await ctx.db.query("productListSnapshots").collect();

    if (args.productListId) {
      snapshots = snapshots.filter(s => s.productListId === args.productListId);
    }

    if (args.targetProductId) {
      snapshots = snapshots.filter(s => s.targetProductId === args.targetProductId);
    }

    snapshots = snapshots.sort((a, b) => b.createdAt - a.createdAt);

    const limit = args.limit ?? 100;
    return snapshots.slice(0, limit);
  },
});

export const getSnapshotById = query({
  args: { id: v.id("productListSnapshots") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

function generateDisplayCode(targetProductId: v.Id<"catalogItems"> | null, existingLists: Awaited<ReturnType<typeof ctx.db.query("productLists").collect>>): string {
  let prefix = "BORRADOR";
  if (targetProductId) {
    const target = {} as any;
    if (target) {
      prefix = `PTXXXX`;
    }
  }

  const existingCodes = existingLists
    .filter(l => l.displayCode.startsWith(prefix))
    .map(l => {
      const match = l.displayCode.match(/L(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });

  const maxSeq = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
  const nextSeq = maxSeq + 1;

  if (targetProductId) {
    return `PT0000-L${String(nextSeq).padStart(3, "0")}`;
  }
  return `BORRADOR-L${String(nextSeq).padStart(3, "0")}`;
}

export const create = mutation({
  args: {
    targetProductId: v.optional(v.id("catalogItems")),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        cantidadKg: v.number(),
      })
    ),
    createdBy: v.string(),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const allLists = await ctx.db.query("productLists").collect();
    const displayCode = generateDisplayCode(args.targetProductId ?? null, allLists);

    const listId = await ctx.db.insert("productLists", {
      displayCode,
      targetProductId: args.targetProductId ?? undefined,
      components: args.components,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
      archivedAt: 0,
    });

    await createSnapshotInternal(ctx, listId, displayCode, args.targetProductId ?? null, args.components, args.createdBy, args.notas);

    return { listId, displayCode };
  },
});

export const update = mutation({
  args: {
    id: v.id("productLists"),
    components: v.array(
      v.object({
        catalogItemId: v.id("catalogItems"),
        cantidadKg: v.number(),
      })
    ),
    createdBy: v.string(),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.id);
    if (!list) throw new Error("Lista no encontrada");

    await ctx.db.patch(args.id, {
      components: args.components,
      updatedAt: Date.now(),
    });

    await createSnapshotInternal(
      ctx,
      args.id,
      list.displayCode,
      list.targetProductId ?? null,
      args.components,
      args.createdBy,
      args.notas
    );

    return { success: true };
  },
});

async function createSnapshotInternal(
  ctx: any,
  listId: v.Id<"productLists">,
  displayCode: string,
  targetProductId: v.Id<"catalogItems"> | null,
  components: Array<{ catalogItemId: v.Id<"catalogItems">; cantidadKg: number }>,
  createdBy: string,
  notas?: string
) {
  const now = Date.now();

  const existingSnapshots = await ctx.db
    .query("productListSnapshots")
    .withIndex("by_productListId", (q: any) => q.eq("productListId", listId))
    .collect();

  const maxVersion = existingSnapshots.reduce((max: number, s: any) => Math.max(max, s.snapshotVersion), 0);
  const newVersion = maxVersion + 1;

  const componentes = [];
  let targetNutrients: Nutrients | null = null;

  if (targetProductId) {
    const targetProduct = await ctx.db.get(targetProductId);
    if (targetProduct) {
      targetNutrients = targetProduct.nutrients;
    }
  }

  for (const comp of components) {
    const item = await ctx.db.get(comp.catalogItemId);
    if (item) {
      componentes.push({
        catalogItemId: comp.catalogItemId,
        internalId: item.internalId,
        name: item.name,
        cantidadKg: comp.cantidadKg,
        nutrientsSnapshot: item.nutrients,
      });
    }
  }

  const componentesParaCalculo = componentes.map(c => ({
    cantidadKg: c.cantidadKg,
    nutrients: c.nutrientsSnapshot,
  }));

  const composicionCalculada = calcularComposicion(componentesParaCalculo);

  const { detalle, estadoGeneral } = targetNutrients
    ? evaluarTolerancia(composicionCalculada, targetNutrients)
    : { detalle: {}, estadoGeneral: "SIN_OBJETIVO" as const };

  const totalKg = components.reduce((sum, c) => sum + c.cantidadKg, 0);

  const alertas: string[] = [];
  if (Math.abs(totalKg - 1000) > 0.01) {
    alertas.push(`Total ${totalKg} kg no suma 1000 kg`);
  }

  await ctx.db.insert("productListSnapshots", {
    productListId: listId,
    displayCode,
    targetProductId: targetProductId ?? undefined,
    targetProductSnapshot: targetNutrients,
    componentsSnapshot: componentes,
    composicionCalculada,
    estadoGeneral,
    detalleTolerancia: detalle,
    totalKg,
    alertas,
    snapshotVersion: newVersion,
    createdAt: now,
    createdBy,
    notas,
  });
}

export const archiveList = mutation({
  args: {
    id: v.id("productLists"),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.id);
    if (!list) throw new Error("Lista no encontrada");

    await ctx.db.patch(args.id, {
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const cloneSnapshotToList = mutation({
  args: {
    snapshotId: v.id("productListSnapshots"),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot) throw new Error("Snapshot no encontrado");

    const allLists = await ctx.db.query("productLists").collect();
    const newDisplayCode = generateDisplayCode(snapshot.targetProductId ?? null, allLists);

    const components = snapshot.componentsSnapshot.map(c => ({
      catalogItemId: c.catalogItemId,
      cantidadKg: c.cantidadKg,
    }));

    const now = Date.now();
    const listId = await ctx.db.insert("productLists", {
      displayCode: newDisplayCode,
      targetProductId: snapshot.targetProductId ?? undefined,
      components,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
      archivedAt: 0,
    });

    return { listId, displayCode: newDisplayCode };
  },
});