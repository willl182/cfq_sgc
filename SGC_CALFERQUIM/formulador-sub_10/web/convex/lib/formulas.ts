/**
 * Motor de cálculo puro - Fórmula de composición
 * 
 * Formula: aporte = cantidadKg * concentracion / 1000
 * Composición final = suma de aportes
 * 
 * Este módulo es puro y puede usarse tanto en backend (Convex) como en frontend (React)
 */

export interface Composition {
  C: number;
  N: number;
  N_NH4: number;
  N_NO3: number;
  N_org: number;
  N_ur: number;
  P: number;
  K: number;
  CaO: number;
  MgO: number;
  S: number;
  B: number;
  Co: number;
  Cu: number;
  Fe: number;
  Mn: number;
  Mo: number;
  SiO2: number;
  Zn: number;
  Na: number;
}

export interface Component {
  catalogItemId: string;
  internalId: string;
  name: string;
  quantityKg: number;
  composition: Composition;
}

// Lista de todos los nutrientes
export const NUTRIENTS: (keyof Composition)[] = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur",
  "P", "K", "CaO", "MgO", "S", "B",
  "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
];

// Crear composición vacía (todos los valores en 0)
export function emptyComposition(): Composition {
  return {
    C: 0, N: 0, N_NH4: 0, N_NO3: 0, N_org: 0, N_ur: 0,
    P: 0, K: 0, CaO: 0, MgO: 0, S: 0, B: 0,
    Co: 0, Cu: 0, Fe: 0, Mn: 0, Mo: 0, SiO2: 0, Zn: 0, Na: 0
  };
}

/**
 * Calcula el aporte de un componente a la composición final
 * Formula: aporte = cantidadKg * concentracion / 1000
 */
export function calculateComponentContribution(
  composition: Composition,
  quantityKg: number
): Composition {
  const contribution = emptyComposition();
  
  for (const nutrient of NUTRIENTS) {
    contribution[nutrient] = (quantityKg * composition[nutrient]) / 1000;
  }
  
  return contribution;
}

/**
 * Calcula la composición final de una lista de componentes
 * Composición final = suma de aportes de todos los componentes
 */
export function calculateFinalComposition(components: Component[]): Composition {
  const finalComposition = emptyComposition();
  
  for (const component of components) {
    const contribution = calculateComponentContribution(
      component.composition,
      component.quantityKg
    );
    
    for (const nutrient of NUTRIENTS) {
      finalComposition[nutrient] += contribution[nutrient];
    }
  }
  
  // Redondear a 4 decimales (guardado interno)
  for (const nutrient of NUTRIENTS) {
    finalComposition[nutrient] = Math.round(finalComposition[nutrient] * 10000) / 10000;
  }
  
  return finalComposition;
}

/**
 * Calcula el total de kg de una lista de componentes
 */
export function calculateTotalKg(components: Component[]): number {
  return components.reduce((sum, comp) => sum + comp.quantityKg, 0);
}

/**
 * Valida que las cantidades tengan máximo 2 decimales
 */
export function validateQuantity(quantityKg: number): boolean {
  const decimals = (quantityKg.toString().split('.')[1] || '').length;
  return decimals <= 2 && quantityKg >= 0;
}

/**
 * Formatea un valor de composición para visualización (2 decimales)
 */
export function formatCompositionValue(value: number): string {
  return value.toFixed(2);
}
