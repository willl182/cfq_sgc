/**
 * FORMULADOR_CFQ — Motor de Cálculo Puro
 * Sin dependencias DOM. Funciona en Node y navegador.
 * Fórmula: aporte_nutriente = Σ(kg_insumo × concentración_nutriente) / 1000
 */

export const NUTRIENT_KEYS = [
  'C', 'N', 'N_NH4', 'N_NO3', 'N_org', 'N_ur',
  'P', 'K', 'CaO', 'MgO', 'S',
  'B', 'Co', 'Cu', 'Fe', 'Mn', 'Mo', 'SiO2', 'Zn', 'Na'
];

export const NUTRIENTES = [
  { key: 'C', label: 'C (Orgánico)', group: 'secondary' },
  { key: 'N', label: 'N (Total)', group: 'np' },
  { key: 'N_NH4', label: 'N-NH4', group: 'np' },
  { key: 'N_NO3', label: 'N-NO3', group: 'np' },
  { key: 'N_org', label: 'N-org', group: 'np' },
  { key: 'N_ur', label: 'N-ur', group: 'np' },
  { key: 'P', label: 'P₂O₅', group: 'np' },
  { key: 'K', label: 'K₂O', group: 'k' },
  { key: 'CaO', label: 'CaO', group: 'secondary' },
  { key: 'MgO', label: 'MgO', group: 'secondary' },
  { key: 'S', label: 'S', group: 'secondary' },
  { key: 'B', label: 'B', group: 'micro' },
  { key: 'Co', label: 'Co', group: 'micro' },
  { key: 'Cu', label: 'Cu', group: 'micro' },
  { key: 'Fe', label: 'Fe', group: 'micro' },
  { key: 'Mn', label: 'Mn', group: 'micro' },
  { key: 'Mo', label: 'Mo', group: 'micro' },
  { key: 'SiO2', label: 'SiO₂', group: 'secondary' },
  { key: 'Zn', label: 'Zn', group: 'micro' },
  { key: 'Na', label: 'Na', group: 'micro' }
];

/**
 * Calcula la composición de una mezcla a partir de sus componentes.
 * @param {Array<{cantidadKg: number, insumo: Object}>} componentes
 * @returns {Object} Composición calculada {N: 25.3, P: 4.2, ...}
 */
export function calcularComposicion(componentes) {
  const resultado = {};
  for (const key of NUTRIENT_KEYS) {
    resultado[key] = 0;
  }

  for (const comp of componentes) {
    if (!comp.cantidadKg || !comp.insumo) continue;
    for (const key of NUTRIENT_KEYS) {
      resultado[key] += comp.cantidadKg * (comp.insumo[key] || 0);
    }
  }

  for (const key of NUTRIENT_KEYS) {
    resultado[key] = Math.round((resultado[key] / 1000) * 10000) / 10000;
  }

  return resultado;
}

/**
 * Calcula el total de kg de los componentes
 */
export function calcularTotalKg(componentes) {
  return componentes.reduce((sum, c) => sum + (c.cantidadKg || 0), 0);
}

/**
 * Snapshot: congela la composición de cada insumo al momento del guardado
 */
export function congelarComponentes(componentes, catalogo) {
  return componentes.map(comp => {
    const insumo = comp.insumo || catalogo.find(i => i.internalId === comp.insumoId);
    const composicionSnapshot = {};
    for (const key of NUTRIENT_KEYS) {
      composicionSnapshot[key] = insumo ? (insumo[key] || 0) : 0;
    }
    return {
      insumoId: comp.insumoId || insumo?.internalId || '',
      cod: insumo?.externalCode || insumo?.COD || comp.cod || '',
      nombre: insumo?.PRODUCTO || insumo?.nombre || comp.nombre || '',
      cantidadKg: comp.cantidadKg || 0,
      composicionSnapshot
    };
  });
}