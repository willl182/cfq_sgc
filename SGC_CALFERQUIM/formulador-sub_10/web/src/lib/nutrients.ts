/**
 * Constantes de nutrientes - Nombres legibles y orden de visualización
 */

export interface NutrientInfo {
  key: string;
  label: string;
  group: "macronutriente" | "secundario" | "micronutriente";
}

export const NUTRIENTS_INFO: NutrientInfo[] = [
  // Macronutrientes
  { key: "C", label: "Carbono", group: "macronutriente" },
  { key: "N", label: "Nitrógeno Total", group: "macronutriente" },
  { key: "N_NH4", label: "N-Amónico", group: "macronutriente" },
  { key: "N_NO3", label: "N-Nítrico", group: "macronutriente" },
  { key: "N_org", label: "N-Orgánico", group: "macronutriente" },
  { key: "N_ur", label: "N-Ureico", group: "macronutriente" },
  { key: "P", label: "Fósforo", group: "macronutriente" },
  { key: "K", label: "Potasio", group: "macronutriente" },
  
  // Secundarios
  { key: "CaO", label: "Calcio", group: "secundario" },
  { key: "MgO", label: "Magnesio", group: "secundario" },
  { key: "S", label: "Azufre", group: "secundario" },
  
  // Micronutrientes
  { key: "B", label: "Boro", group: "micronutriente" },
  { key: "Co", label: "Cobalto", group: "micronutriente" },
  { key: "Cu", label: "Cobre", group: "micronutriente" },
  { key: "Fe", label: "Hierro", group: "micronutriente" },
  { key: "Mn", label: "Manganeso", group: "micronutriente" },
  { key: "Mo", label: "Molibdeno", group: "micronutriente" },
  { key: "SiO2", label: "Silicio", group: "micronutriente" },
  { key: "Zn", label: "Zinc", group: "micronutriente" },
  { key: "Na", label: "Sodio", group: "micronutriente" },
];

export const NUTRIENT_KEYS = NUTRIENTS_INFO.map(n => n.key);

export function getNutrientLabel(key: string): string {
  return NUTRIENTS_INFO.find(n => n.key === key)?.label || key;
}

export function getNutrientGroup(key: string): string {
  return NUTRIENTS_INFO.find(n => n.key === key)?.group || "desconocido";
}
