/**
 * Motor de cálculo del Formulador CFQ v2
 *
 * Fórmula: aporte = cantidadKg * concentracion / 1000
 * Composición final = suma de aportes por nutriente
 * Base fija: 1000 kg
 */

import { NUTRIENT_KEYS } from "./constants";
import type { NutrientKey } from "./constants";

/** Composición nutricional: record de nutriente → valor porcentual */
export type Composicion = Record<NutrientKey, number>;

/** Resultado del cálculo de una lista */
export interface CalculationResult {
  composicionCalculada: Composicion;
  totalKg: number;
  alertas: string[];
}

/**
 * Calcula la composición de una mezcla dados sus componentes.
 * Cada componente aporta: cantidadKg * concentracionNutriente / 1000
 *
 * @param componentes - Array de { cantidadKg, composicion }
 * @returns Composición calculada, total kg y alertas
 */
export function calcularComposicion(
  componentes: Array<{ cantidadKg: number; composicion: Composicion }>
): CalculationResult {
  const result: Composicion = {} as Composicion;
  for (const key of NUTRIENT_KEYS) {
    result[key] = 0;
  }

  let totalKg = 0;

  for (const comp of componentes) {
    totalKg += comp.cantidadKg;
    for (const key of NUTRIENT_KEYS) {
      const concentracion = comp.composicion[key] ?? 0;
      // aporte = cantidadKg * concentracion / 1000
      result[key] += (comp.cantidadKg * concentracion) / 1000;
    }
  }

  // Redondear composición a 4 decimales (guardado), se muestra con 2
  for (const key of NUTRIENT_KEYS) {
    result[key] = parseFloat(result[key].toFixed(4));
  }

  totalKg = parseFloat(totalKg.toFixed(2));

  const alertas: string[] = [];
  if (totalKg !== 1000) {
    alertas.push(`Total ${totalKg} kg ≠ 1000 kg. Verifique las cantidades.`);
  }

  return { composicionCalculada: result, totalKg, alertas };
}

/**
 * Calcula el aporte de un solo nutriente para un componente.
 */
export function calcAporteNutriente(
  cantidadKg: number,
  concentracion: number
): number {
  return parseFloat(((cantidadKg * concentracion) / 1000).toFixed(4));
}

/**
 * Valida que una cantidad sea numérica, positiva y con máximo 2 decimales.
 */
export function validarCantidad(cantidad: number): { ok: boolean; error?: string } {
  if (isNaN(cantidad)) return { ok: false, error: "Cantidad inválida (NaN)" };
  if (cantidad < 0) return { ok: false, error: "Cantidad negativa" };
  // Verificar máximo 2 decimales
  const decimales = (cantidad.toString().split(".")[1] || "").length;
  if (decimales > 2) return { ok: false, error: "Máximo 2 decimales permitidos" };
  return { ok: true };
}