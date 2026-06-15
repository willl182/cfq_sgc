export type NutrientKey =
  | "C" | "N" | "N_NH4" | "N_NO3" | "N_org" | "N_ur"
  | "P" | "K" | "CaO" | "MgO" | "S" | "B"
  | "Co" | "Cu" | "Fe" | "Mn" | "Mo" | "SiO2" | "Zn" | "Na";

export interface Nutrients {
  C: number;
  N: number;
  N_NH4: number;
  N_NO3: number;
  N_org: number;
  N_ur: number;
  P: number;
  K: number;
  CaO: number;
  MgO: number;
  S: number;
  B: number;
  Co: number;
  Cu: number;
  Fe: number;
  Mn: number;
  Mo: number;
  SiO2: number;
  Zn: number;
  Na: number;
}

export const NUTRIENT_KEYS: NutrientKey[] = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur",
  "P", "K", "CaO", "MgO", "S", "B",
  "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
];

export const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  C: "C",
  N: "N",
  N_NH4: "N-NH4",
  N_NO3: "N-NO3",
  N_org: "N-org",
  N_ur: "N-ur",
  P: "P",
  K: "K",
  CaO: "CaO",
  MgO: "MgO",
  S: "S",
  B: "B",
  Co: "Co",
  Cu: "Cu",
  Fe: "Fe",
  Mn: "Mn",
  Mo: "Mo",
  SiO2: "SiO2",
  Zn: "Zn",
  Na: "Na",
};

export type NutrientStatus = "C" | "NC" | "SUP";
export type GeneralStatus = "CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO";

export interface NutrientToleranceResult {
  valor: number;
  tolerancia: number;
  estado: NutrientStatus;
}

export interface ToleranciaDetalle {
  valor: number;
  tolerancia: number;
  estado: NutrientStatus;
}

export const GROUP1_NUTRIENTS: NutrientKey[] = ["N", "P"];
export const GROUP2_NUTRIENTS: NutrientKey[] = ["K"];
export const GROUP3_NUTRIENTS: NutrientKey[] = [
  "C", "CaO", "MgO", "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
];

export const SECONDARY_NUTRIENTS: NutrientKey[] = ["CaO", "MgO", "S"];
export const MICRO_NUTRIENTS: NutrientKey[] = ["B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"];