/**
 * Motor de tolerancia ICA para fertilizantes.
 * Módulo puro — funciona en cliente y servidor.
 */

import { NUTRIENTES, type Nutriente, type CatalogItem } from "./calculation";

export type EstadoNutriente = "C" | "NC" | "SUP" | "NA";

export interface EvaluacionTolerancia {
  byNutrient: Record<string, EstadoNutriente>;
  generalStatus: "CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO";
}

function calcularToleranciaGrupo1(x: number): number {
  if (x === 0) return 0;
  if (x < 0.04) return 0.84;
  if (x > 32) return 1.46;
  return -0.0005 * (x * x) + 0.0413 * x + 0.6533;
}

function calcularToleranciaGrupo2(x: number): number {
  if (x === 0) return 0;
  if (x < 0.04) return 0.69;
  if (x > 32) return 2.14;
  return -0.0007 * (x * x) + 0.0769 * x + 0.3941;
}

function calcularToleranciaGrupo3(
  nutrient: Nutriente,
  x: number
): number {
  const opcion1 = x / 2;
  const opcion2 = 1.5;
  let opcion3: number;

  switch (nutrient) {
    case "CaO":
      opcion3 = 0.42 + 0.105 * x;
      break;
    case "MgO":
      opcion3 = 0.5 + 0.125 * x;
      break;
    case "S":
      opcion3 = 0.3 + 0.075 * x;
      break;
    case "B":
      opcion3 = 0.005 + 0.25 * x;
      break;
    case "Co":
    case "Mo":
      opcion3 = 0.000125 + 0.375 * x;
      break;
    case "Cu":
    case "Fe":
    case "Mn":
    case "Zn":
    case "Na":
      opcion3 = 0.015 + 0.3 * x;
      break;
    default:
      opcion3 = Infinity;
  }

  return Math.min(opcion1, opcion2, opcion3);
}

function evaluarNutriente(
  teorico: number,
  declarado: number,
  tolerancia: number
): EstadoNutriente {
  const diff = Math.abs(teorico - declarado);
  if (diff <= tolerancia) return "C";
  if (teorico > declarado) return "SUP";
  return "NC";
}

export function evaluarTolerancia(
  composition: Record<string, number>,
  totalKg: number,
  target: CatalogItem | null | undefined
): EvaluacionTolerancia {
  const byNutrient: Record<string, EstadoNutriente> = {};

  if (!target) {
    return { byNutrient, generalStatus: "SIN_OBJETIVO" };
  }

  const declarados = NUTRIENTES.filter((n) => {
    const v = target[n];
    return typeof v === "number" && v > 0;
  });

  for (const n of NUTRIENTES) {
    const teoricoRaw = composition[n];
    const teorico =
      typeof teoricoRaw === "number" && !isNaN(teoricoRaw) ? teoricoRaw : 0;

    const declarado = target[n];
    const isDeclarado = typeof declarado === "number" && declarado > 0;

    if (!isDeclarado) {
      // Nutriente no declarado: informativo, no afecta estado general
      byNutrient[n] = "NA";
      continue;
    }

    let tolerancia: number;
    if (n === "N" || n === "P") {
      tolerancia = calcularToleranciaGrupo1(teorico);
    } else if (n === "K") {
      tolerancia = calcularToleranciaGrupo2(teorico);
    } else {
      tolerancia = calcularToleranciaGrupo3(n as Nutriente, teorico);
    }

    byNutrient[n] = evaluarNutriente(teorico, declarado, tolerancia);
  }

  const valores = Object.values(byNutrient);
  const hasNC = valores.some((v) => v === "NC");
  const hasSUP = valores.some((v) => v === "SUP");

  let generalStatus: EvaluacionTolerancia["generalStatus"];
  if (hasNC) {
    generalStatus = "NO_CUMPLE";
  } else if (hasSUP) {
    generalStatus = "CUMPLE_S";
  } else {
    generalStatus = "CUMPLE";
  }

  return { byNutrient, generalStatus };
}

export function calcularTolerancia(
  nutrient: Nutriente,
  teorico: number
): number {
  if (nutrient === "N" || nutrient === "P") {
    return calcularToleranciaGrupo1(teorico);
  }
  if (nutrient === "K") {
    return calcularToleranciaGrupo2(teorico);
  }
  return calcularToleranciaGrupo3(nutrient, teorico);
}
