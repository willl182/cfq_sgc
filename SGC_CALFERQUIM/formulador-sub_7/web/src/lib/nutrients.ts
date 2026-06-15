export const NUTRIENT_KEYS = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur", "P", "K", "CaO", "MgO",
  "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na",
] as const;

export type NutrientKey = (typeof NUTRIENT_KEYS)[number];

export type NutrientRecord = Record<NutrientKey, number>;

export const EMPTY_NUTRIENTS: NutrientRecord = Object.fromEntries(
  NUTRIENT_KEYS.map((k) => [k, 0])
) as NutrientRecord;

export function parseNutrientValue(raw: string | number | undefined): number {
  if (raw === undefined || raw === null || raw === "") return 0;
  const n = typeof raw === "string" ? parseFloat(raw.replace(",", ".")) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function calcularComposicion(
  componentes: { internalId: string; cantidadKg: number; nutrients: NutrientRecord }[]
): NutrientRecord {
  const total: NutrientRecord = { ...EMPTY_NUTRIENTS };
  for (const c of componentes) {
    for (const k of NUTRIENT_KEYS) {
      total[k] += (c.cantidadKg * c.nutrients[k]) / 1000;
    }
  }
  return total;
}

export function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Tolerancias ICA

export function toleranciaNitrogenoFosforo(X: number): number {
  if (X === 0) return 0;
  if (X < 0.04) return 0.84;
  if (X > 32) return 1.46;
  return -0.0005 * X * X + 0.0413 * X + 0.6533;
}

export function toleranciaPotasio(X: number): number {
  if (X === 0) return 0;
  if (X < 0.04) return 0.69;
  if (X > 32) return 2.14;
  return -0.0007 * X * X + 0.0769 * X + 0.3941;
}

export function toleranciaSecundarioMicro(
  X: number,
  nutrient: "CaO" | "MgO" | "S" | "B" | "Co" | "Mo" | "Cu" | "Fe" | "Mn" | "Zn" | "Na" | "SiO2"
): number {
  const formulas: Record<string, number> = {
    CaO: 0.42 + 0.105 * X,
    MgO: 0.5 + 0.125 * X,
    S: 0.3 + 0.075 * X,
    B: 0.005 + 0.25 * X,
    Co: 0.000125 + 0.375 * X,
    Mo: 0.000125 + 0.375 * X,
    Cu: 0.015 + 0.3 * X,
    Fe: 0.015 + 0.3 * X,
    Mn: 0.015 + 0.3 * X,
    Zn: 0.015 + 0.3 * X,
    Na: 0.015 + 0.3 * X,
    SiO2: 0.5 + 0.125 * X,
  };
  const base = formulas[nutrient] ?? 0;
  return Math.min(X / 2, 1.5, base);
}

export function calcularTolerancia(nutrient: NutrientKey, X: number): number {
  if (nutrient === "N" || nutrient === "P") return toleranciaNitrogenoFosforo(X);
  if (nutrient === "K") return toleranciaPotasio(X);
  return toleranciaSecundarioMicro(
    X,
    nutrient as Parameters<typeof toleranciaSecundarioMicro>[1]
  );
}

export type EstadoNutriente = "C" | "NC" | "SUP";

export function evaluarNutriente(
  nutrient: NutrientKey,
  valor: number,
  target: number
): EstadoNutriente {
  if (target <= 0) return "C"; // no declarado -> informativo
  const tol = calcularTolerancia(nutrient, target);
  if (valor < target - tol) return "NC";
  if (valor > target + tol) return "SUP";
  return "C";
}

export type EstadoGeneral = "CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO";

export function evaluarEstadoGeneral(
  evaluaciones: Record<string, { estado: EstadoNutriente }>
): EstadoGeneral {
  const estados = Object.values(evaluaciones).map((e) => e.estado);
  if (estados.length === 0) return "SIN_OBJETIVO";
  if (estados.includes("NC")) return "NO_CUMPLE";
  if (estados.includes("SUP")) return "CUMPLE_S";
  return "CUMPLE";
}

export function evaluarLista(
  composicion: NutrientRecord,
  target: NutrientRecord | null
): {
  evaluation: Record<string, { valor: number; tolerancia: number; estado: EstadoNutriente }>;
  generalStatus: EstadoGeneral;
  alerts: string[];
} {
  const evaluation: Record<string, { valor: number; tolerancia: number; estado: EstadoNutriente }> = {};
  let tieneDeclarados = false;

  for (const k of NUTRIENT_KEYS) {
    const targetVal = target ? target[k] : 0;
    const valor = round4(composicion[k]);
    const tol = calcularTolerancia(k, targetVal);
    const estado = targetVal > 0 ? evaluarNutriente(k, valor, targetVal) : "C";
    if (targetVal > 0) tieneDeclarados = true;
    evaluation[k] = { valor, tolerancia: round4(tol), estado };
  }

  const generalStatus = tieneDeclarados ? evaluarEstadoGeneral(evaluation) : "SIN_OBJETIVO";
  const alerts: string[] = [];
  return { evaluation, generalStatus, alerts };
}