export { NUTRIENT_KEYS, NUTRIENT_LABELS, NUTRIENT_GROUPS, emptyNutrients, CLASES, TIPOS, BASE_KG } from "./constants";
export type { NutrientKey, Clase, Tipo } from "./constants";

export {
  calcTolerancia,
  evaluar,
  evaluarTodos,
  calcularComposicion,
} from "./tolerancias";
export type { TolStatus, TolResult, TolDetail, GeneralStatus, EvalAllResult } from "./tolerancias";

export function fmtNum(val: number, decimals = 2): string {
  if (val === 0) return "0";
  return val.toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtGrade(val: number): string {
  if (val === 0) return "\u2014";
  return val.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function fmtDisplay(val: number): string {
  if (val === 0) return "\u2014";
  if (Number.isInteger(val)) return val.toString();
  return val.toLocaleString("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

export function parseNum(val: string | number | null | undefined): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/"/g, "").trim();
  if (cleaned === "") return 0;
  return parseFloat(cleaned.replace(",", ".")) || 0;
}

export function generateDisplayCode(
  targetInternalId: string | null | undefined,
  consecutive: number,
  isDraft: boolean
): string {
  const num = String(consecutive).padStart(3, "0");
  if (!targetInternalId || isDraft) {
    return `BORRADOR-${num}`;
  }
  return `${targetInternalId}-L${num}`;
}

export function isLocalStorageAdmin(): boolean {
  try {
    return localStorage.getItem("cfq_admin") === "true";
  } catch {
    return false;
  }
}

export function setLocalStorageAdmin(val: boolean): void {
  try {
    if (val) {
      localStorage.setItem("cfq_admin", "true");
    } else {
      localStorage.removeItem("cfq_admin");
    }
  } catch {}
}