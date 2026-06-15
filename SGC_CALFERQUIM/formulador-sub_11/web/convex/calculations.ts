export const NUTRIENT_KEYS = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur", "P", "K", "CaO", "MgO", 
  "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
] as const;

export type NutrientKey = typeof NUTRIENT_KEYS[number];

export type Nutrients = Record<NutrientKey, number>;

export interface ComponentInput {
  internalId: string;
  producto: string;
  quantity: number; // in kg
  nutrients: Nutrients;
}

export type EvaluationStatus = "C" | "NC" | "SUP";

export interface NutrientEvaluation {
  status: EvaluationStatus;
  tolerancia: number;
  min: number;
  max: number;
  calc: number;
  decl: number;
}

export interface FormulaEvaluation {
  status: "CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO";
  nutrientStatuses: Record<string, EvaluationStatus>;
  evaluations: Record<string, NutrientEvaluation>;
}

// Group 1: Nitrogen and Phosphorus
function calcGrupo1(x: number): number {
  if (x === 0) return 0;
  if (x < 0.04) return 0.84;
  if (x > 32) return 1.46;
  return -0.0005 * (x * x) + 0.0413 * x + 0.6533;
}

// Group 2: Potassium
function calcGrupo2(x: number): number {
  if (x === 0) return 0;
  if (x < 0.04) return 0.69;
  if (x > 32) return 2.14;
  return -0.0007 * (x * x) + 0.0769 * x + 0.3941;
}

// Group 3 Linear Equations
const grupo3LinearEquations: Record<string, (x: number) => number> = {
  CaO: (x) => 0.42 + 0.105 * x,
  MgO: (x) => 0.5 + 0.125 * x,
  S: (x) => 0.3 + 0.075 * x,
  B: (x) => 0.005 + 0.25 * x,
  Co: (x) => 0.000125 + 0.375 * x,
  Mo: (x) => 0.000125 + 0.375 * x,
  Cu: (x) => 0.015 + 0.3 * x,
  Fe: (x) => 0.015 + 0.3 * x,
  Mn: (x) => 0.015 + 0.3 * x,
  Zn: (x) => 0.015 + 0.3 * x,
  Na: (x) => 0.015 + 0.3 * x,
  C: (x) => 0.3 + 0.075 * x,
  SiO2: (x) => 0.3 + 0.075 * x,
};

// Group 3: Secondary and Micronutrients
function calcGrupo3(nutrient: string, x: number): number {
  if (x === 0) return 0;
  const eq = grupo3LinearEquations[nutrient];
  if (!eq) return 0;
  return Math.min(x / 2, 1.5, eq(x));
}

// Determine group group mapping
const nutrientGroups: Record<NutrientKey, number> = {
  N: 1, N_NH4: 1, N_NO3: 1, N_org: 1, N_ur: 1, P: 1,
  K: 2,
  C: 3, CaO: 3, MgO: 3, S: 3, B: 3, Co: 3, Cu: 3,
  Fe: 3, Mn: 3, Mo: 3, SiO2: 3, Zn: 3, Na: 3
};

export function calcTolerancia(nutrient: NutrientKey, valorTeorico: number): number {
  const x = Math.abs(valorTeorico);
  const grupo = nutrientGroups[nutrient];
  if (grupo === 1) return calcGrupo1(x);
  if (grupo === 2) return calcGrupo2(x);
  if (grupo === 3) return calcGrupo3(nutrient, x);
  return 0;
}

export function evaluateNutrient(
  nutrient: NutrientKey, 
  valorCalculado: number, 
  valorDeclarado: number
): NutrientEvaluation {
  const calc = Math.round(valorCalculado * 10000) / 10000;
  const decl = Math.round(valorDeclarado * 10000) / 10000;

  if (decl === 0) {
    return {
      status: "C",
      tolerancia: 0,
      min: 0,
      max: 0,
      calc,
      decl: 0
    };
  }

  const tolerancia = calcTolerancia(nutrient, decl);
  const min = Math.max(0, decl - tolerancia);
  const max = decl + tolerancia;

  let status: EvaluationStatus = "C";
  // Check with high-precision threshold to avoid float issues
  const epsilon = 0.00001;
  if (calc < min - epsilon) {
    status = "NC";
  } else if (calc > max + epsilon) {
    status = "SUP";
  }

  return {
    status,
    tolerancia: Math.round(tolerancia * 10000) / 10000,
    min: Math.round(min * 10000) / 10000,
    max: Math.round(max * 10000) / 10000,
    calc,
    decl
  };
}

export function calculateCompositionAndEvaluation(
  components: ComponentInput[],
  targetNutrients: Nutrients | null
): {
  calculatedComposition: Nutrients;
  evaluation: FormulaEvaluation;
  totalKg: number;
  alerts: string[];
} {
  const calculatedComposition = {} as Nutrients;
  for (const k of NUTRIENT_KEYS) {
    calculatedComposition[k] = 0;
  }

  let totalKg = 0;
  for (const c of components) {
    totalKg += c.quantity;
    for (const k of NUTRIENT_KEYS) {
      const concentration = c.nutrients[k] || 0;
      calculatedComposition[k] += (c.quantity * concentration) / 1000;
    }
  }

  // Round values
  for (const k of NUTRIENT_KEYS) {
    calculatedComposition[k] = Math.round(calculatedComposition[k] * 10000) / 10000;
  }

  const alerts: string[] = [];
  const roundedTotal = Math.round(totalKg * 100) / 100;
  if (Math.abs(roundedTotal - 1000) > 0.01) {
    alerts.push(`El peso total de la mezcla es de ${roundedTotal} kg. Debe ser exactamente de 1000 kg.`);
  }

  const evaluations: Record<string, NutrientEvaluation> = {};
  const nutrientStatuses: Record<string, EvaluationStatus> = {};

  let status: FormulaEvaluation["status"] = "SIN_OBJETIVO";

  if (targetNutrients) {
    let hasNC = false;
    let hasSUP = false;

    for (const k of NUTRIENT_KEYS) {
      const calcVal = calculatedComposition[k];
      const declVal = targetNutrients[k] || 0;

      const ev = evaluateNutrient(k, calcVal, declVal);
      evaluations[k] = ev;
      nutrientStatuses[k] = ev.status;

      if (declVal > 0) {
        if (ev.status === "NC") {
          hasNC = true;
        } else if (ev.status === "SUP") {
          hasSUP = true;
        }
      }
    }

    if (hasNC) {
      status = "NO_CUMPLE";
    } else if (hasSUP) {
      status = "CUMPLE_S";
    } else {
      status = "CUMPLE";
    }
  } else {
    // SIN_OBJETIVO
    for (const k of NUTRIENT_KEYS) {
      evaluations[k] = {
        status: "C",
        tolerancia: 0,
        min: 0,
        max: 0,
        calc: calculatedComposition[k],
        decl: 0
      };
      nutrientStatuses[k] = "C";
    }
  }

  return {
    calculatedComposition,
    evaluation: {
      status,
      nutrientStatuses,
      evaluations
    },
    totalKg: roundedTotal,
    alerts
  };
}
