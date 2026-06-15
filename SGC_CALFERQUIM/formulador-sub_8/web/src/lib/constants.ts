/**
 * Constantes del Formulador CFQ v2
 *
 * Nutrientes: 20 nutrientes estandarizados
 * Clases: MP, PT, MZR
 * Tipos: G, P, L, C
 */

export const NUTRIENT_KEYS = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur",
  "P", "K", "CaO", "MgO", "S", "B", "Co", "Cu",
  "Fe", "Mn", "Mo", "SiO2", "Zn", "Na",
] as const;

export type NutrientKey = (typeof NUTRIENT_KEYS)[number];

/** Mapping de nombres legibles para nutrientes */
export const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  C: "Carbono",
  N: "Nitrógeno Total",
  N_NH4: "N Amoniacal",
  N_NO3: "N Nítrico",
  N_org: "N Orgánico",
  N_ur: "N de Urea",
  P: "Fósforo",
  K: "Potasio",
  CaO: "Calcio (CaO)",
  MgO: "Magnesio (MgO)",
  S: "Azufre",
  B: "Boro",
  Co: "Cobalto",
  Cu: "Cobre",
  Fe: "Hierro",
  Mn: "Manganeso",
  Mo: "Molibdeno",
  SiO2: "Silicio (SiO2)",
  Zn: "Zinc",
  Na: "Sodio",
};

/** Clases de catálogo */
export const CLASES = ["MP", "PT", "MZR"] as const;
export type Clase = (typeof CLASES)[number];

export const CLASE_LABELS: Record<Clase, string> = {
  MP: "Materia Prima",
  PT: "Producto Terminado",
  MZR: "Mezcla Física",
};

/** Tipos de producto */
export const TIPOS = ["G", "P", "L", "C"] as const;
export type Tipo = (typeof TIPOS)[number];

export const TIPO_LABELS: Record<Tipo, string> = {
  G: "Granulado",
  P: "Polvo",
  L: "Líquido",
  C: "Cristalino",
};

/** Prefijos de IDs internos por clase */
export const ID_PREFIX: Record<Clase, string> = {
  MP: "MP",
  PT: "PT",
  MZR: "MZR",
};

/** Base fija para formulación */
export const BASE_KG = 1000;

/** Número de dígitos para padding de IDs */
export const ID_PADDING = 4;

/**
 * Genera un ID interno con formato CLASE#### 
 * Ej: MP0001, PT0001, MZR0001
 */
export function generarInternalId(clase: Clase, secuencia: number): string {
  return `${ID_PREFIX[clase]}${String(secuencia).padStart(ID_PADDING, "0")}`;
}

/**
 * Clasifica un item como MZR si su código externo empieza con "R" 
 * seguido opcionalmente de dígitos.
 * Regla: R, R1, R2, R3... → MZR
 */
export function clasificarItem(codExterno: string, claseCSV: string): Clase {
  if (/^R\d*$/.test(codExterno)) {
    return "MZR";
  }
  if (claseCSV === "MP") return "MP";
  return "PT";
}

/**
 * Estados de tolerancia por nutriente
 */
export type EstadoNutriente = "C" | "NC" | "SUP";
export type EstadoGeneral = "CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO";