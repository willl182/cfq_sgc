/**
 * Motor de tolerancia puro - Evaluación ICA
 * 
 * Grupo 1 (N, P): Fórmula polinómica
 * Grupo 2 (K): Fórmula polinómica diferente
 * Grupo 3 (secundarios y micros): min(X/2, 1.5, ecuación_lineal)
 * 
 * Estados: C (cumple), NC (no cumple), SUP (supera), INFO (informativo)
 * Estado general: CUMPLE, NO_CUMPLE, CUMPLE_S, SIN_OBJETIVO
 */

import type { Composition } from "./formulas";

export type NutrientStatus = "C" | "NC" | "SUP" | "INFO";
export type OverallStatus = "CUMPLE" | "NO_CUMPLE" | "CUMPLE_S" | "SIN_OBJETIVO";

export interface ToleranceDetail {
  value: number;
  target: number;
  tolerance: number;
  status: NutrientStatus;
}

export interface ToleranceEvaluation {
  overallStatus: OverallStatus;
  details: Record<string, ToleranceDetail>;
}

/**
 * Calcula la tolerancia para Nitrógeno (N) y Fósforo (P) - Grupo 1
 */
function calculateToleranceGroup1(x: number): number {
  if (x === 0) return 0;
  if (x < 0.04) return 0.84;
  if (x > 32) return 1.46;
  
  // Fórmula polinómica: -0.0005 * X² + 0.0413 * X + 0.6533
  return -0.0005 * Math.pow(x, 2) + 0.0413 * x + 0.6533;
}

/**
 * Calcula la tolerancia para Potasio (K) - Grupo 2
 */
function calculateToleranceGroup2(x: number): number {
  if (x === 0) return 0;
  if (x < 0.04) return 0.69;
  if (x > 32) return 2.14;
  
  // Fórmula polinómica: -0.0007 * X² + 0.0769 * X + 0.3941
  return -0.0007 * Math.pow(x, 2) + 0.0769 * x + 0.3941;
}

/**
 * Calcula la tolerancia para secundarios y micros - Grupo 3
 * Tolerancia = min(X/2, 1.5, ecuación_lineal)
 */
function calculateToleranceGroup3(nutrient: keyof Composition, x: number): number {
  const halfValue = x / 2;
  const capValue = 1.5;
  
  let linearValue: number;
  
  switch (nutrient) {
    case "CaO":
      linearValue = 0.42 + 0.105 * x;
      break;
    case "MgO":
      linearValue = 0.5 + 0.125 * x;
      break;
    case "S":
      linearValue = 0.3 + 0.075 * x;
      break;
    case "B":
      linearValue = 0.005 + 0.25 * x;
      break;
    case "Co":
    case "Mo":
      linearValue = 0.000125 + 0.375 * x;
      break;
    case "Cu":
    case "Fe":
    case "Mn":
    case "Zn":
    case "Na":
      linearValue = 0.015 + 0.3 * x;
      break;
    default:
      // Para C, N, N_NH4, N_NO3, N_org, N_ur, P, K usar sus grupos
      return 0;
  }
  
  return Math.min(halfValue, capValue, linearValue);
}

/**
 * Calcula la tolerancia para un nutriente específico
 */
export function calculateTolerance(nutrient: keyof Composition, value: number): number {
  // Grupo 1: N y P
  if (nutrient === "N" || nutrient === "P") {
    return calculateToleranceGroup1(value);
  }
  
  // Grupo 2: K
  if (nutrient === "K") {
    return calculateToleranceGroup2(value);
  }
  
  // Grupo 3: Secundarios y micros
  return calculateToleranceGroup3(nutrient, value);
}

/**
 * Evalúa un nutriente individual contra su target
 */
export function evaluateNutrient(
  value: number,
  target: number,
  nutrient: keyof Composition
): ToleranceDetail {
  // Si el target es 0, el nutriente es informativo
  if (target === 0) {
    return {
      value,
      target,
      tolerance: 0,
      status: "INFO"
    };
  }
  
  const tolerance = calculateTolerance(nutrient, target);
  
  let status: NutrientStatus;
  if (value < (target - tolerance)) {
    status = "NC"; // No cumple (por debajo)
  } else if (value > (target + tolerance)) {
    status = "SUP"; // Supera (por encima)
  } else {
    status = "C"; // Cumple
  }
  
  return {
    value,
    target,
    tolerance,
    status
  };
}

/**
 * Evalúa la tolerancia completa de una composición contra un target
 */
export function evaluateTolerance(
  calculated: Composition,
  target: Composition | undefined
): ToleranceEvaluation {
  // Si no hay target, el estado es SIN_OBJETIVO
  if (!target) {
    return {
      overallStatus: "SIN_OBJETIVO",
      details: {}
    };
  }
  
  const details: Record<string, ToleranceDetail> = {};
  let hasNC = false;
  let hasSUP = false;
  let hasC = false;
  
  // Evaluar cada nutriente
  const nutrients: (keyof Composition)[] = [
    "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur",
    "P", "K", "CaO", "MgO", "S", "B",
    "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
  ];
  
  for (const nutrient of nutrients) {
    const detail = evaluateNutrient(calculated[nutrient], target[nutrient], nutrient);
    details[nutrient] = detail;
    
    if (detail.status === "NC") hasNC = true;
    if (detail.status === "SUP") hasSUP = true;
    if (detail.status === "C") hasC = true;
  }
  
  // Determinar estado general
  let overallStatus: OverallStatus;
  if (hasNC) {
    overallStatus = "NO_CUMPLE";
  } else if (hasSUP) {
    overallStatus = "CUMPLE_S";
  } else if (hasC) {
    overallStatus = "CUMPLE";
  } else {
    overallStatus = "SIN_OBJETIVO";
  }
  
  return {
    overallStatus,
    details
  };
}

/**
 * Obtiene el color CSS para un estado de nutriente
 */
export function getStatusColor(status: NutrientStatus): string {
  switch (status) {
    case "C":
      return "text-green-600 bg-green-50";
    case "NC":
      return "text-red-600 bg-red-50";
    case "SUP":
      return "text-yellow-600 bg-yellow-50";
    case "INFO":
      return "text-gray-500 bg-gray-50";
  }
}

/**
 * Obtiene el color CSS para un estado general
 */
export function getOverallStatusColor(status: OverallStatus): string {
  switch (status) {
    case "CUMPLE":
      return "text-green-700 bg-green-100 border-green-300";
    case "NO_CUMPLE":
      return "text-red-700 bg-red-100 border-red-300";
    case "CUMPLE_S":
      return "text-yellow-700 bg-yellow-100 border-yellow-300";
    case "SIN_OBJETIVO":
      return "text-gray-700 bg-gray-100 border-gray-300";
  }
}
