/**
 * Motor de cálculo de composición y tolerancia para formulador CFQ.
 * Módulo puro — funciona en cliente y servidor.
 */

export const NUTRIENTES = [
  "C","N","N_NH4","N_NO3","N_org","N_ur","P","K","CaO","MgO",
  "S","B","Co","Cu","Fe","Mn","Mo","SiO2","Zn","Na"
] as const;

export type Nutriente = typeof NUTRIENTES[number];

export interface CatalogItem {
  internalId: string;
  class: "MP" | "PT" | "MZR";
  name: string;
  externalCode?: string;
  originalCode?: string;
  tipo?: string;
  test?: string;
  archivedAt?: number;
  [key: string]: any;
}

export interface ListComponent {
  catalogItemId: string;
  internalId: string;
  quantityKg: number;
  item?: CatalogItem;
}

export interface CalculatedComposition {
  composition: Record<string, number>;
  totalKg: number;
}

export function calcularComposicion(
  components: ListComponent[],
  itemsById: Record<string, CatalogItem>
): CalculatedComposition {
  const composition: Record<string, number> = {};
  let totalKg = 0;

  for (const comp of components) {
    const item = itemsById[comp.internalId];
    if (!item) continue;
    totalKg += comp.quantityKg;
    for (const n of NUTRIENTES) {
      const val = item[n];
      if (typeof val === "number" && !isNaN(val)) {
        const aporte = (comp.quantityKg * val) / 1000;
        composition[n] = (composition[n] ?? 0) + aporte;
      }
    }
  }

  // Redondear a 4 decimales para guardar
  for (const n of Object.keys(composition)) {
    composition[n] = Math.round((composition[n] ?? 0) * 10000) / 10000;
  }

  totalKg = Math.round(totalKg * 100) / 100;

  return { composition, totalKg };
}

export function formatearComposicion(
  composition: Record<string, number>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const n of NUTRIENTES) {
    const v = composition[n];
    if (v !== undefined && v !== 0) {
      out[n] = v.toFixed(2);
    }
  }
  return out;
}

export function getNutrientesDeclarados(
  target: CatalogItem
): Nutriente[] {
  return NUTRIENTES.filter((n) => {
    const v = target[n];
    return typeof v === "number" && v > 0;
  });
}

export const MINIMOS_NPK = {
  UNO_SOLO: 10,
  SOLIDO_EDAFICO: 18,
  FERTIRRIEGO: 15,
} as const;

export function suggestAlternatives(
  item: CatalogItem,
  candidates: CatalogItem[],
  topN = 3
): { item: CatalogItem; similarity: number }[] {
  const itemVec = NUTRIENTES.map((n) => (typeof item[n] === "number" ? item[n] : 0));
  const scored = candidates
    .filter((c) => c.internalId !== item.internalId)
    .map((c) => {
      const cVec = NUTRIENTES.map((n) => (typeof c[n] === "number" ? c[n] : 0));
      let dot = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < itemVec.length; i++) {
        dot += itemVec[i] * cVec[i];
        normA += itemVec[i] * itemVec[i];
        normB += cVec[i] * cVec[i];
      }
      const similarity = normA === 0 || normB === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
      return { item: c, similarity: Math.round(similarity * 10000) / 10000 };
    });
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topN);
}
