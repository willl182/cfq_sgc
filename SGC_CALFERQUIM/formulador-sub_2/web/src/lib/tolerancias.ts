import { NUTRIENT_KEYS, type NutrientKey, NUTRIENT_GROUPS } from "./constants";

type TolGroup = 1 | 2 | 3;

const GROUP_MAP: Record<NutrientKey, TolGroup> = {
  C: 3,
  N: 1,
  N_NH4: 1,
  N_NO3: 1,
  N_org: 1,
  N_ur: 1,
  P: 1,
  K: 2,
  CaO: 3,
  MgO: 3,
  S: 3,
  B: 3,
  Co: 3,
  Cu: 3,
  Fe: 3,
  Mn: 3,
  Mo: 3,
  SiO2: 3,
  Zn: 3,
  Na: 3,
};

const LINEAR_EQUATIONS: Record<string, (x: number) => number> = {
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

function grupo1(x: number): number {
  if (x === 0) return 0;
  if (x < 0.04) return 0.84;
  if (x > 32) return 1.46;
  return -0.0005 * x * x + 0.0413 * x + 0.6533;
}

function grupo2(x: number): number {
  if (x === 0) return 0;
  if (x < 0.04) return 0.69;
  if (x > 32) return 2.14;
  return -0.0007 * x * x + 0.0769 * x + 0.3941;
}

function grupo3(nutriente: string, x: number): number {
  if (x === 0) return 0;
  const fn = LINEAR_EQUATIONS[nutriente];
  if (!fn) return 0;
  return Math.min(x / 2, 1.5, fn(x));
}

export function calcTolerancia(nutriente: NutrientKey, valorTeorico: number): number {
  const x = Math.abs(valorTeorico);
  const grupo = GROUP_MAP[nutriente];
  switch (grupo) {
    case 1:
      return grupo1(x);
    case 2:
      return grupo2(x);
    case 3:
      return grupo3(nutriente, x);
    default:
      return 0;
  }
}

export type TolStatus = "C" | "NC" | "SUP";

export interface TolResult {
  status: TolStatus;
  tolerancia: number;
  min: number;
  max: number;
}

export function evaluar(
  nutriente: NutrientKey,
  valorCalculado: number,
  valorDeclarado: number
): TolResult {
  if (valorDeclarado === 0 && valorCalculado === 0) {
    return { status: "C", tolerancia: 0, min: 0, max: 0 };
  }
  const tolerancia = calcTolerancia(nutriente, valorDeclarado);
  const min = Math.max(0, valorDeclarado - tolerancia);
  const max = valorDeclarado + tolerancia;
  let status: TolStatus;
  if (valorCalculado < min) {
    status = "NC";
  } else if (valorCalculado > max) {
    status = "SUP";
  } else {
    status = "C";
  }
  return { status, tolerancia, min, max };
}

export interface TolDetail {
  nutrient: NutrientKey;
  calculado: number;
  declarado: number;
  tolerancia: number;
  min: number;
  max: number;
  status: TolStatus;
  informativo: boolean;
}

export type GeneralStatus = "CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO";

export interface EvalAllResult {
  details: TolDetail[];
  generalStatus: GeneralStatus;
}

export function evaluarTodos(
  calculados: Record<NutrientKey, number>,
  declarados: Record<NutrientKey, number>
): EvalAllResult {
  const details: TolDetail[] = [];
  let hasNC = false;
  let hasSUP = false;

  for (const key of NUTRIENT_KEYS) {
    const calc = calculados[key] ?? 0;
    const decl = declarados[key] ?? 0;
    const informativo = decl === 0 && calc > 0;

    if (calc === 0 && decl === 0) {
      details.push({
        nutrient: key,
        calculado: 0,
        declarado: 0,
        tolerancia: 0,
        min: 0,
        max: 0,
        status: "C",
        informativo: false,
      });
      continue;
    }

    const result = evaluar(key, calc, decl);
    if (decl > 0) {
      if (result.status === "NC") hasNC = true;
      if (result.status === "SUP") hasSUP = true;
    }

    details.push({
      ...result,
      nutrient: key,
      calculado: calc,
      declarado: decl,
      informativo,
    });
  }

  let generalStatus: GeneralStatus;
  if (Object.values(declarados).every((v) => v === 0)) {
    generalStatus = "SIN_OBJETIVO";
  } else if (hasNC) {
    generalStatus = "NO_CUMPLE";
  } else if (hasSUP) {
    generalStatus = "CUMPLE_S";
  } else {
    generalStatus = "CUMPLE";
  }

  return { details, generalStatus };
}

export function calcularComposicion(
  componentes: { cantidadKg: number; nutrientSnapshot: Record<NutrientKey, number> }[]
): Record<NutrientKey, number> {
  const result: Record<string, number> = {};
  for (const key of NUTRIENT_KEYS) {
    result[key] = 0;
  }

  for (const comp of componentes) {
    for (const key of NUTRIENT_KEYS) {
      result[key] += (comp.cantidadKg * comp.nutrientSnapshot[key]) / 1000;
    }
  }

  for (const key of NUTRIENT_KEYS) {
    result[key] = Math.round(result[key] * 10000) / 10000;
  }

  return result as Record<NutrientKey, number>;
}

export { NUTRIENT_KEYS };