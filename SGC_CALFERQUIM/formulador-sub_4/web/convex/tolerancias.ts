import type {
  Nutrients,
  NutrientKey,
  NutrientToleranceResult,
  NutrientStatus,
  GROUP1_NUTRIENTS,
  GROUP2_NUTRIENTS,
  GROUP3_NUTRIENTS,
} from "./types";

export function toleranciaGrupo1(X: number): number {
  if (X === 0) return 0;
  if (X < 0.04) return 0.84;
  if (X > 32) return 1.46;
  return -0.0005 * X * X + 0.0413 * X + 0.6533;
}

export function toleranciaGrupo2(X: number): number {
  if (X === 0) return 0;
  if (X < 0.04) return 0.69;
  if (X > 32) return 2.14;
  return -0.0007 * X * X + 0.0769 * X + 0.3941;
}

export function toleranciaGrupo3(X: number, nutriente: NutrientKey): number {
  if (X === 0) return 0;
  const minHalfX = X / 2;
  const min15 = 1.5;
  let ecuacionLineal: number;
  switch (nutriente) {
    case "CaO":
      ecuacionLineal = 0.42 + 0.105 * X;
      break;
    case "MgO":
      ecuacionLineal = 0.5 + 0.125 * X;
      break;
    case "S":
      ecuacionLineal = 0.3 + 0.075 * X;
      break;
    case "B":
      ecuacionLineal = 0.005 + 0.25 * X;
      break;
    case "Co":
    case "Mo":
      ecuacionLineal = 0.000125 + 0.375 * X;
      break;
    case "Cu":
    case "Fe":
    case "Mn":
    case "Zn":
    case "Na":
      ecuacionLineal = 0.015 + 0.3 * X;
      break;
    case "C":
    case "N_NH4":
    case "N_NO3":
    case "N_org":
    case "N_ur":
    case "N":
    case "P":
    case "K":
    case "SiO2":
      ecuacionLineal = X / 2;
      break;
    default:
      ecuacionLineal = X / 2;
  }
  return Math.min(minHalfX, min15, ecuacionLineal);
}

export function evaluarNutriente(
  valorCalculado: number,
  valorDeclarado: number,
  nutriente: NutrientKey
): NutrientToleranceResult {
  if (valorDeclarado <= 0) {
    return { valor: valorCalculado, tolerancia: 0, estado: "C" };
  }

  let tolerancia: number;
  if (nutriente === "N" || nutriente === "P") {
    tolerancia = toleranciaGrupo1(valorDeclarado);
  } else if (nutriente === "K") {
    tolerancia = toleranciaGrupo2(valorDeclarado);
  } else {
    tolerancia = toleranciaGrupo3(valorDeclarado, nutriente);
  }

  const minimo = valorDeclarado - tolerancia;
  const maximo = valorDeclarado + tolerancia;

  let estado: NutrientStatus;
  if (valorCalculado < minimo) {
    estado = "NC";
  } else if (valorCalculado > maximo) {
    estado = "SUP";
  } else {
    estado = "C";
  }

  return { valor: valorCalculado, tolerancia, estado };
}

export function evaluarTolerancia(
  composicionCalculada: Nutrients,
  objetivo: Nutrients
): {
  detalle: Record<string, NutrientToleranceResult>;
  estadoGeneral: "CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO";
} {
  const detalle: Record<string, NutrientToleranceResult> = {};
  const keys = Object.keys(composicionCalculada) as NutrientKey[];

  let hasNC = false;
  let hasSUP = false;
  let hasEvaluated = false;

  for (const key of keys) {
    const valorDeclarado = objetivo[key];
    if (valorDeclarado > 0) {
      detalle[key] = evaluarNutriente(composicionCalculada[key], valorDeclarado, key);
      hasEvaluated = true;
      if (detalle[key].estado === "NC") hasNC = true;
      if (detalle[key].estado === "SUP") hasSUP = true;
    } else {
      detalle[key] = {
        valor: composicionCalculada[key],
        tolerancia: 0,
        estado: "C",
      };
    }
  }

  let estadoGeneral: "CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO";
  if (!hasEvaluated) {
    estadoGeneral = "SIN_OBJETIVO";
  } else if (hasNC) {
    estadoGeneral = "NO_CUMPLE";
  } else if (hasSUP) {
    estadoGeneral = "CUMPLE_S";
  } else {
    estadoGeneral = "CUMPLE";
  }

  return { detalle, estadoGeneral };
}