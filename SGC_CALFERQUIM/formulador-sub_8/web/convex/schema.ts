import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Schema canónico del Formulador CFQ v2
 *
 * 4 tablas:
 * - catalogItems: fuente viva única para MP, PT y MZR
 * - catalogChangeHistory: auditoría de cambios del catálogo
 * - productLists: listas/recetas vivas recalculables
 * - productListSnapshots: histórico congelado e inmutable
 *
 * Convenciones:
 * - internalId: MP0001, PT0001, MZR0001 (4 dígitos, padding cero)
 * - externalCode: conserva el COD original del CSV (ej: "145", "R", "R1")
 * - Nutrientes normalizados sin guiones: N_NH4, N_NO3, N_org, N_ur
 * - 20 nutrientes: C, N, N_NH4, N_NO3, N_org, N_ur, P, K, CaO, MgO, S, B, Co, Cu, Fe, Mn, Mo, SiO2, Zn, Na
 */

// Nutrient composition object schema (reused in multiple places)
const composicionSchema = v.object({
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
});

// ---- Tabla 1: catalogItems ----

export const catalogItems = defineTable({
  /** ID interno estable: MP0001, PT0001, MZR0001 */
  internalId: v.string(),
  /** Código original del CSV ("145", "R", "R1") */
  externalCode: v.string(),
  /** Alias/legacy code alternativo */
  originalCode: v.optional(v.string()),
  /** Nombre del insumo/producto */
  nombre: v.string(),
  /** Clase: MP (materia prima), PT (producto terminado), MZR (mezcla física) */
  clase: v.union(v.literal("MP"), v.literal("PT"), v.literal("MZR")),
  /** Tipo: G (granulado), P (polvo), L (líquido), C (cristalino) */
  tipo: v.union(v.literal("G"), v.literal("P"), v.literal("L"), v.literal("C")),
  /** Composición nutricional (porcentajes) */
  composicion: composicionSchema,
  /** Timestamp de archivado; undefined = activo */
  archivedAt: v.optional(v.number()),
  /** Timestamp de última modificación */
  updatedAt: v.number(),
  /** Timestamp de creación */
  createdAt: v.number(),
})
  .index("by_internalId", ["internalId"])
  .index("by_clase", ["clase"])
  .index("by_externalCode", ["externalCode"])
  .index("by_archivedAt", ["archivedAt"]);

// ---- Tabla 2: catalogChangeHistory ----

export const catalogChangeHistory = defineTable({
  /** ID del item de catálogo afectado */
  catalogItemId: v.id("catalogItems"),
  /** internalId del item (redundancia para queries) */
  internalId: v.string(),
  /** Actor que realizó el cambio (localStorage admin) */
  actor: v.string(),
  /** Campos cambiados con antes/después */
  changes: v.array(v.object({
    field: v.string(),
    before: v.optional(v.string()),
    after: v.optional(v.string()),
  })),
  /** Razón del cambio (opcional) */
  reason: v.optional(v.string()),
  /** Origen del cambio: seed, manual, import */
  source: v.union(v.literal("seed"), v.literal("manual"), v.literal("import")),
  /** Timestamp */
  changedAt: v.number(),
})
  .index("by_catalogItemId", ["catalogItemId"])
  .index("by_internalId", ["internalId"])
  .index("by_changedAt", ["changedAt"]);

// ---- Tabla 3: productLists ----

export const productLists = defineTable({
  /** Código visible: PT0008-L001, BORRADOR-L001 */
  displayCode: v.string(),
  /** PT objetivo opcional (null = SIN_OBJETIVO/BORRADOR) */
  targetProductId: v.optional(v.id("catalogItems")),
  /** Nombre descriptivo */
  nombre: v.optional(v.string()),
  /** Componentes de la mezcla */
  componentes: v.array(v.object({
    catalogItemId: v.id("catalogItems"),
    cantidadKg: v.number(),
  })),
  /** Total kg (sumatoria de componentes) */
  totalKg: v.number(),
  /** Composición calculada (se recalcula al leer) */
  composicionCalculada: v.optional(composicionSchema),
  /** Estado general: CUMPLE, CUMPLE_S, NO_CUMPLE, SIN_OBJETIVO */
  estadoGeneral: v.optional(v.union(
    v.literal("CUMPLE"),
    v.literal("CUMPLE_S"),
    v.literal("NO_CUMPLE"),
    v.literal("SIN_OBJETIVO"),
  )),
  /** Detalle de tolerancia por nutriente */
  detalleTolerancia: v.optional(v.array(v.object({
    nutriente: v.string(),
    calculado: v.number(),
    declarado: v.number(),
    tolerancia: v.number(),
    min: v.number(),
    max: v.number(),
    estado: v.union(v.literal("C"), v.literal("NC"), v.literal("SUP")),
  }))),
  /** Versión actual del snapshot */
  snapshotVersion: v.number(),
  /** Timestamp de archivado */
  archivedAt: v.optional(v.number()),
  /** Timestamp de última modificación */
  updatedAt: v.number(),
  /** Timestamp de creación */
  createdAt: v.number(),
})
  .index("by_targetProductId", ["targetProductId"])
  .index("by_displayCode", ["displayCode"])
  .index("by_archivedAt", ["archivedAt"]);

// ---- Tabla 4: productListSnapshots ----

export const productListSnapshots = defineTable({
  /** Lista origen */
  productListId: v.id("productLists"),
  /** PT objetivo congelado al momento del snapshot */
  targetProductId: v.optional(v.id("catalogItems")),
  /** displayCode al momento del snapshot */
  displayCode: v.string(),
  /** Nombre al momento del snapshot */
  nombre: v.optional(v.string()),
  /** Versión del snapshot: v1, v2, v3... */
  snapshotVersion: v.number(),
  /** Componentes congelados con datos del catálogo al momento del snapshot */
  componentesSnapshot: v.array(v.object({
    catalogItemId: v.id("catalogItems"),
    internalId: v.string(),
    nombre: v.string(),
    cantidadKg: v.number(),
    composicionSnapshot: composicionSchema,
  })),
  /** Composición declarada del PT objetivo (congelada) */
  targetComposicion: v.optional(composicionSchema),
  /** Composición calculada de la mezcla (congelada) */
  composicionCalculada: composicionSchema,
  /** Total kg */
  totalKg: v.number(),
  /** Estado general congelado */
  estadoGeneral: v.union(
    v.literal("CUMPLE"),
    v.literal("CUMPLE_S"),
    v.literal("NO_CUMPLE"),
    v.literal("SIN_OBJETIVO"),
  ),
  /** Detalle de tolerancia congelado */
  detalleTolerancia: v.array(v.object({
    nutriente: v.string(),
    calculado: v.number(),
    declarado: v.number(),
    tolerancia: v.number(),
    min: v.number(),
    max: v.number(),
    estado: v.union(v.literal("C"), v.literal("NC"), v.literal("SUP")),
  })),
  /** Alertas (ej: "Total no suma 1000 kg") */
  alertas: v.optional(v.array(v.string())),
  /** Usuario que creó el snapshot */
  creadoPor: v.string(),
  /** Timestamp de creación */
  createdAt: v.number(),
})
  .index("by_productListId", ["productListId"])
  .index("by_targetProductId", ["targetProductId"])
  .index("by_snapshotVersion", ["productListId", "snapshotVersion"])
  .index("by_createdAt", ["createdAt"]);

export default defineSchema({
  catalogItems,
  catalogChangeHistory,
  productLists,
  productListSnapshots,
});