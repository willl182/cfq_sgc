/**
 * Motor de Tolerancias ICA del Formulador CFQ v2
 *
 * Grupo 1 (N, P): polinómica con topes
 * Grupo 2 (K): polinómica con topes diferentes
 * Grupo 3 (secundarios y micros): min(X/2, 1.5, ecuación_lineal)
 *
 * Nutrientes sub-fracción de N (N_NH4, N_NO3, N_org, N_ur) usan Grupo 1.
 * El estado general:
 * - NO_CUMPLE si cualquier nutriente declarado con valor > 0 es NC
 * - CUMPLE_S si hay SUP sin NC
 * - CUMPLE si todos los evaluados son C
 * - SIN_OBJETIVO si no hay PT objetivo
 */

import { NUTRIENT_KEYS, type NutrientKey, type EstadoNutriente, type EstadoGeneral } from "./constants";

/** Mapeo de nutriente → grupo de tolerancia */
const GRUPO: Record<NutrientKey, 1 | 2 | 3> = {
  N: 1, N_NH4: 1, N_NO3: 1, N_org: 1, N_ur: 1, P: 1,
  K: 2,
  C: 3, CaO: 3, MgO: 3, S: 3, B: 3, Co: 3, Cu: 3,
  Fe: 3, Mn: 3, Mo: 3, SiO2: 3, Zn: 3, Na: 3,
};

/** Ecuaciones lineales específicas para Grupo 3 */
const ECUACIONES_LINEALES: Record<string, (x: number) => number> = {
  CaO:  (x: number) => 0.42 + 0.105 * x,
  MgO:  (x: number) => 0.5 + 0.125 * x,
  S:    (x: number) => 0.3 + 0.075 * x,
  B:    (x: number) => 0.005 + 0.25 * x,
  Co:   (x: number) => 0.000125 + 0.375 * x,
  Mo:   (x: number) => 0.000125 + 0.375 * x,
  Cu:   (x: number) => 0.015 + 0.3 * x,
  Fe:   (x: number) => 0.015 + 0.3 * x,
  Mn:   (x: number) => 0.015 + 0.3 * x,
  Zn:   (x: number) => 0.015 + 0.3 * x,
  Na:   (x: number) => 0.015 + 0.3 * x,
  C:    (x: number) => 0.3 + 0.075 * x,
  SiO2: (x: number) => 0.3 + 0.075 * x,
};

/**
 * Grupo 1: N, P (y sub-fracciones de N)
 * Tolerancia = -0.0005·X² + 0.0413·X + 0.6533
 * Topes: X < 0.04 → 0.84; X > 32 → 1.46
 */
function toleranciaGrupo1(x: number): number {
  if (x === 0) return 0;
  if (x < 0.04) return 0.84;
  if (x > 32) return 1.46;
  return -0.0005 * (x * x) + 0.0413 * x + 0.6533;
}

/**
 * Grupo 2: K
 * Tolerancia = -0.0007·X² + 0.0769·X + 0.3941
 * Topes: X < 0.04 → 0.69; X > 32 → 2.14
 */
function toleranciaGrupo2(x: number): number {
  if (x === 0) return 0;
  if (x < 0.04) return 0.69;
  if (x > 32) return 2.14;
  return -0.0007 * (x * x) + 0.0769 * x + 0.3941;
}

/**
 * Grupo 3: Secundarios y Micronutrientes
 * Tolerancia = min(X/2, 1.5, ecuación_lineal)
 */
function toleranciaGrupo3(nutriente: string, x: number): number {
  if (x === 0) return 0;
  const ecLineal = ECUACIONES_LINEALES[nutriente];
  if (!ecLineal) return 0;
  const mitad = x / 2;
  const tope = 1.5;
  const lineal = ecLineal(x);
  return Math.min(mitad, tope, lineal);
}

/**
 * Calcula la tolerancia permitida para un nutriente dado su valor declarado.
 */
export function calcTolerancia(nutriente: string, valorDeclarado: number): number {
  const x = Math.abs(valorDeclarado);
  const grupo = GRUPO[nutriente as NutrientKey] ?? 3;
  switch (grupo) {
    case 1: return toleranciaGrupo1(x);
    case 2: return toleranciaGrupo2(x);
    case 3: return toleranciaGrupo3(nutriente, x);
  }
}

/** Resultado de evaluar un nutriente */
export interface EvaluacionNutriente {
  nutriente: string;
  calculado: number;
  declarado: number;
  tolerancia: number;
  min: number;
  max: number;
  estado: EstadoNutriente;
}

/**
 * Evalúa un nutriente contra su valor declarado.
 * Si declarado = 0 y calculado = 0 → C (no se evalúa)
 * Si declarado = 0 y calculado > 0 → informativo (C, no afecta estado general)
 */
export function evaluarNutriente(
  nutriente: string,
  calculado: number,
  declarado: number
): EvaluacionNutriente {
  // Ambos cero: no hay nada que evaluar
  if (declarado === 0 && calculado === 0) {
    return {
      nutriente,
      calculado: 0,
      declarado: 0,
      tolerancia: 0,
      min: 0,
      max: 0,
      estado: "C",
    };
  }

  // Declarado = 0 pero calculado > 0: informativo, no afecta estado general
  if (declarado === 0) {
    return {
      nutriente,
      calculado,
      declarado: 0,
      tolerancia: 0,
      min: 0,
      max: 0,
      estado: "C", // Informativo, no bloqueante
    };
  }

  const tolerancia = calcTolerancia(nutriente, declarado);
  const min = Math.max(0, declarado - tolerancia);
  const max = declarado + tolerancia;

  let estado: EstadoNutriente;
  if (calculado < min) {
    estado = "NC";
  } else if (calculado > max) {
    estado = "SUP";
  } else {
    estado = "C";
  }

  return {
    nutriente,
    calculado,
    declarado,
    tolerancia: parseFloat(tolerancia.toFixed(4)),
    min: parseFloat(min.toFixed(4)),
    max: parseFloat(max.toFixed(4)),
    estado,
  };
}

/**
 * Evalúa todos los nutrientes de una composición calculada contra un PT objetivo.
 * Retorna array de evaluaciones y el estado general.
 */
export function evaluarComposicion(
  composicionCalculada: Record<string, number>,
  composicionObjetivo: Record<string, number> | null
): { evaluaciones: EvaluacionNutriente[]; estadoGeneral: EstadoGeneral } {
  // Sin objetivo → SIN_OBJETIVO
  if (!composicionObjetivo) {
    const evaluaciones: EvaluacionNutriente[] = NUTRIENT_KEYS.map((key) => ({
      nutriente: key,
      calculado: composicionCalculada[key] ?? 0,
      declarado: 0,
      tolerancia: 0,
      min: 0,
      max: 0,
      estado: "C" as EstadoNutriente,
    }));
    return { evaluaciones, estadoGeneral: "SIN_OBJETIVO" };
  }

  let hasNC = false;
  let hasSUP = false;

  const evaluaciones: EvaluacionNutriente[] = NUTRIENT_KEYS.map((key) => {
    const calc = composicionCalculada[key] ?? 0;
    const decl = composicionObjetivo[key] ?? 0;
    const ev = evaluarNutriente(key, calc, decl);

    // Solo nutrientes con valor declarado > 0 afectan el estado general
    if (decl > 0) {
      if (ev.estado === "NC") hasNC = true;
      if (ev.estado === "SUP") hasSUP = true;
    }

    return ev;
  });

  let estadoGeneral: EstadoGeneral;
  if (hasNC) estadoGeneral = "NO_CUMPLE";
  else if (hasSUP) estadoGeneral = "CUMPLE_S";
  else estadoGeneral = "CUMPLE";

  return { evaluaciones, estadoGeneral };
}