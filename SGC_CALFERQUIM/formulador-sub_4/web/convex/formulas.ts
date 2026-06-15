import type { Nutrients } from "./types";

export function calcularAporte(cantidadKg: number, concentracion: number): number {
  return (cantidadKg * concentracion) / 1000;
}

export function calcularComposicion(
  componentes: Array<{ cantidadKg: number; nutrients: Nutrients }>
): Nutrients {
  const composicion: Nutrients = {
    C: 0, N: 0, N_NH4: 0, N_NO3: 0, N_org: 0, N_ur: 0,
    P: 0, K: 0, CaO: 0, MgO: 0, S: 0, B: 0,
    Co: 0, Cu: 0, Fe: 0, Mn: 0, Mo: 0, SiO2: 0, Zn: 0, Na: 0,
  };

  const nutrientKeys = Object.keys(composicion) as Array<keyof Nutrients>;

  for (const componente of componentes) {
    for (const key of nutrientKeys) {
      composicion[key] += calcularAporte(componente.cantidadKg, componente.nutrients[key]);
    }
  }

  for (const key of nutrientKeys) {
    composicion[key] = Math.round(composicion[key] * 10000) / 10000;
  }

  return composicion;
}

export function redondearComposicion(composicion: Nutrients, decimales: number = 2): Nutrients {
  const factor = Math.pow(10, decimales);
  const result: Nutrients = {} as Nutrients;
  const keys = Object.keys(composicion) as Array<keyof Nutrients>;
  for (const key of keys) {
    result[key] = Math.round(composicion[key] * factor) / factor;
  }
  return result;
}