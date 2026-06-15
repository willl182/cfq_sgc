export const NUTRIENT_KEYS = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur", "P", "K",
  "CaO", "MgO", "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na",
] as const;

export type NutrientKey = (typeof NUTRIENT_KEYS)[number];

export const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  C: "C (Org\u00e1nico)",
  N: "N (Total)",
  N_NH4: "N-NH\u2084",
  N_NO3: "N-NO\u2083",
  N_org: "N-org",
  N_ur: "N-ur",
  P: "P\u2082O\u2085",
  K: "K\u2082O",
  CaO: "CaO",
  MgO: "MgO",
  S: "S",
  B: "B",
  Co: "Co",
  Cu: "Cu",
  Fe: "Fe",
  Mn: "Mn",
  Mo: "Mo",
  SiO2: "SiO\u2082",
  Zn: "Zn",
  Na: "Na",
};

export const NUTRIENT_GROUPS: Record<NutrientKey, "np" | "k" | "secondary" | "micro"> = {
  C: "secondary",
  N: "np",
  N_NH4: "np",
  N_NO3: "np",
  N_org: "np",
  N_ur: "np",
  P: "np",
  K: "k",
  CaO: "secondary",
  MgO: "secondary",
  S: "secondary",
  B: "micro",
  Co: "micro",
  Cu: "micro",
  Fe: "micro",
  Mn: "micro",
  Mo: "micro",
  SiO2: "secondary",
  Zn: "micro",
  Na: "micro",
};

export function emptyNutrients(): Record<NutrientKey, number> {
  const obj: Record<string, number> = {};
  for (const key of NUTRIENT_KEYS) {
    obj[key] = 0;
  }
  return obj as Record<NutrientKey, number>;
}

export const CLASES = ["MP", "PT", "MZR"] as const;
export type Clase = (typeof CLASES)[number];

export const TIPOS = ["G", "P", "L", "C"] as const;
export type Tipo = (typeof TIPOS)[number];

export const BASE_KG = 1000;