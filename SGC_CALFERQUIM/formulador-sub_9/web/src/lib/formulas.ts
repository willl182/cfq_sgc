/**
 * Motor de cálculo puro para el formulador.
 * Sin dependencias de Convex ni React.
 * Usado tanto en client-side preview como en server-side mutations.
 */

// Los 20 nutrientes según el schema
export const NUTRIENTS = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur",
  "P", "K", "CaO", "MgO", "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
] as const;

export type NutrientKey = typeof NUTRIENTS[number];

export interface CatalogItemNutrients {
  [key: string]: number;
  C: number; N: number; N_NH4: number; N_NO3: number;
  N_org: number; N_ur: number; P: number; K: number;
  CaO: number; MgO: number; S: number; B: number;
  Co: number; Cu: number; Fe: number; Mn: number;
  Mo: number; SiO2: number; Zn: number; Na: number;
}

export interface Component {
  catalogItemId: string;
  name: string;
  cantidadKg: number;
  nutrients: CatalogItemNutrients;
}

export interface CalculatedComposition {
  [key: string]: number;
  C: number; N: number; N_NH4: number; N_NO3: number;
  N_org: number; N_ur: number; P: number; K: number;
  CaO: number; MgO: number; S: number; B: number;
  Co: number; Cu: number; Fe: number; Mn: number;
  Mo: number; SiO2: number; Zn: number; Na: number;
}

/**
 * Calcula la composición final de una mezcla.
 * aporte = cantidadKg * concentracion / 1000
 */
export function calculateComposition(components: Component[]): CalculatedComposition {
  const result: CalculatedComposition = {} as CalculatedComposition;
  
  for (const nutrient of NUTRIENTS) {
    let total = 0;
    for (const comp of components) {
      total += comp.cantidadKg * (comp.nutrients[nutrient] || 0) / 1000;
    }
    // Guardar con 4 decimales, mostrar con 2
    result[nutrient] = Math.round(total * 10000) / 10000;
  }
  
  return result;
}

/**
 * Calcula el total de kg de los componentes
 */
export function calculateTotalKg(components: Component[]): number {
  return components.reduce((sum, c) => sum + c.cantidadKg, 0);
}

/**
 * Redondea cantidad a máximo 2 decimales
 */
export function roundCantidad(kg: number): number {
  return Math.round(kg * 100) / 100;
}

// ─── Tolerancias ICA ──────────────────────────────────────────

type NutrientStatus = "C" | "NC" | "SUP";
type GeneralStatus = "CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO";

interface NutrientTolerance {
  target: number;
  calculated: number;
  tolerance: number;
  status: NutrientStatus;
}

interface ToleranceEvaluation {
  generalStatus: GeneralStatus;
  nutrients: Record<string, NutrientTolerance>;
}

/**
 * Calcula tolerancia para Grupo 1 (N, P)
 */
function toleranciaGrupo1(valor: number): number {
  if (valor === 0) return 0;
  if (valor < 0.04) return 0.84;
  if (valor > 32) return 1.46;
  return -0.0005 * valor * valor + 0.0413 * valor + 0.6533;
}

/**
 * Calcula tolerancia para Grupo 2 (K)
 */
function toleranciaGrupo2(valor: number): number {
  if (valor === 0) return 0;
  if (valor < 0.04) return 0.69;
  if (valor > 32) return 2.14;
  return -0.0007 * valor * valor + 0.0769 * valor + 0.3941;
}

/**
 * Calcula tolerancia para Grupo 3 (secundarios y micros)
 */
function toleranciaGrupo3(valor: number, nutrient: string): number {
  const ecuaciones: Record<string, number> = {
    CaO: 0.42 + 0.105 * valor,
    MgO: 0.5 + 0.125 * valor,
    S: 0.3 + 0.075 * valor,
    B: 0.005 + 0.25 * valor,
    Co: 0.000125 + 0.375 * valor,
    Mo: 0.000125 + 0.375 * valor,
    Cu: 0.015 + 0.3 * valor,
    Fe: 0.015 + 0.3 * valor,
    Mn: 0.015 + 0.3 * valor,
    Zn: 0.015 + 0.3 * valor,
    Na: 0.015 + 0.3 * valor,
    SiO2: 0.015 + 0.3 * valor,
  };

  const ecuacion = ecuaciones[nutrient] ?? 0.015 + 0.3 * valor;
  return Math.min(valor / 2, 1.5, ecuacion);
}

/**
 * Obtiene la tolerancia para un nutriente dado su valor objetivo
 */
export function getTolerancia(nutrient: string, valor: number): number {
  if (valor === 0) return 0;

  if (["N", "P"].includes(nutrient)) {
    return toleranciaGrupo1(valor);
  }
  if (nutrient === "K") {
    return toleranciaGrupo2(valor);
  }
  return toleranciaGrupo3(valor, nutrient);
}

/**
 * Evalúa si un nutriente está dentro de la tolerancia
 */
function evaluarNutriente(target: number, calculated: number, nutrient: string): NutrientTolerance {
  if (target === 0) {
    // Nutriente no declarado: informativo, no afecta el estado general
    return { target: 0, calculated, tolerance: 0, status: "C" as NutrientStatus };
  }

  const tolerance = getTolerancia(nutrient, target);
  const min = target - tolerance;
  const max = target + tolerance;

  let status: NutrientStatus;
  if (calculated < min) {
    status = "NC";
  } else if (calculated > max) {
    status = "SUP";
  } else {
    status = "C";
  }

  return { target, calculated, tolerance, status };
}

/**
 * Evalúa la tolerancia completa contra un producto objetivo
 */
export function evaluateTolerance(
  calculatedComposition: CalculatedComposition,
  targetProduct: CatalogItemNutrients
): ToleranceEvaluation {
  const nutrients: Record<string, NutrientTolerance> = {};
  let tieneNC = false;
  let tieneSUP = false;
  let tieneDeclarado = false;

  for (const nutrient of NUTRIENTS) {
    const target = targetProduct[nutrient] || 0;
    const calculated = calculatedComposition[nutrient] || 0;
    
    if (target > 0) {
      tieneDeclarado = true;
      nutrients[nutrient] = evaluarNutriente(target, calculated, nutrient);
      
      if (nutrients[nutrient].status === "NC") tieneNC = true;
      if (nutrients[nutrient].status === "SUP") tieneSUP = true;
    } else {
      // Nutriente no declarado: informativo
      nutrients[nutrient] = { target: 0, calculated, tolerance: 0, status: "C" as NutrientStatus };
    }
  }

  let generalStatus: GeneralStatus;
  if (!tieneDeclarado) {
    generalStatus = "SIN_OBJETIVO";
  } else if (tieneNC) {
    generalStatus = "NO_CUMPLE";
  } else if (tieneSUP) {
    generalStatus = "CUMPLE_S";
  } else {
    generalStatus = "CUMPLE";
  }

  return { generalStatus, nutrients };
}

/**
 * Formatea un valor nutricional para display
 */
export function formatNutrient(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}