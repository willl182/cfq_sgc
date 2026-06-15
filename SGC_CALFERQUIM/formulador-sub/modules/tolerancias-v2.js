/**
 * FORMULADOR_CFQ — Motor de Tolerancias ICA (versión pura)
 * Sin dependencias DOM. Compatible con módulo legacy tolerancias.js
 *
 * Grupos:
 *   Grupo 1 (N, P): polinómica con topes
 *   Grupo 2 (K): polinómica con topes diferentes
 *   Grupo 3 (secundarios + micros): min(X/2, 1.5, ecuación_lineal)
 *
 * Estados:
 *   C  = Conforme (dentro de tolerancia)
 *   NC = No Conforme (por debajo del rango)
 *   SUP = Supera (por encima del rango)
 *
 * Estado general:
 *   NO_CUMPLE    si algún nutriente declarado es NC
 *   CUMPLE_S     si algún nutriente declarado es SUP pero ninguno NC
 *   CUMPLE       si todos los evaluados son C
 *   SIN_OBJETIVO si no hay PT objetivo
 */

function _grupo1(x) {
  if (x === 0) return 0;
  if (x < 0.04) return 0.84;
  if (x > 32) return 1.46;
  return -0.0005 * (x * x) + 0.0413 * x + 0.6533;
}

function _grupo2(x) {
  if (x === 0) return 0;
  if (x < 0.04) return 0.69;
  if (x > 32) return 2.14;
  return -0.0007 * (x * x) + 0.0769 * x + 0.3941;
}

const _ecuacionesLineales = {
  CaO:  (x) => 0.42 + 0.105 * x,
  MgO:  (x) => 0.5 + 0.125 * x,
  S:    (x) => 0.3 + 0.075 * x,
  B:    (x) => 0.005 + 0.25 * x,
  Co:   (x) => 0.000125 + 0.375 * x,
  Mo:   (x) => 0.000125 + 0.375 * x,
  Cu:   (x) => 0.015 + 0.3 * x,
  Fe:   (x) => 0.015 + 0.3 * x,
  Mn:   (x) => 0.015 + 0.3 * x,
  Zn:   (x) => 0.015 + 0.3 * x,
  Na:   (x) => 0.015 + 0.3 * x,
  C:    (x) => 0.3 + 0.075 * x,
  SiO2: (x) => 0.3 + 0.075 * x,
};

function _grupo3(nutriente, x) {
  if (x === 0) return 0;
  const ecLineal = _ecuacionesLineales[nutriente];
  if (!ecLineal) return 0;
  return Math.min(x / 2, 1.5, ecLineal(x));
}

const _grupoNutriente = {
  N: 1, N_NH4: 1, N_NO3: 1, N_org: 1, N_ur: 1, P: 1,
  K: 2,
  C: 3, CaO: 3, MgO: 3, S: 3, B: 3, Co: 3, Cu: 3,
  Fe: 3, Mn: 3, Mo: 3, SiO2: 3, Zn: 3, Na: 3
};

/**
 * Calcula la tolerancia permitida para un nutriente
 * @param {string} nutriente - Clave del nutriente
 * @param {number} valorTeorico - Valor teórico (%)
 * @returns {number} Tolerancia (%)
 */
export function calcTolerancia(nutriente, valorTeorico) {
  const x = Math.abs(valorTeorico);
  const grupo = _grupoNutriente[nutriente];
  switch (grupo) {
    case 1: return _grupo1(x);
    case 2: return _grupo2(x);
    case 3: return _grupo3(nutriente, x);
    default: return 0;
  }
}

/**
 * Evalúa si un valor calculado cumple la tolerancia contra el declarado
 * @returns {{ status: 'C'|'NC'|'SUP', tolerancia: number, min: number, max: number }}
 */
export function evaluar(nutriente, valorCalculado, valorDeclarado) {
  if (valorDeclarado === 0 && valorCalculado === 0) {
    return { status: 'C', tolerancia: 0, min: 0, max: 0 };
  }
  const tolerancia = calcTolerancia(nutriente, valorDeclarado);
  const min = Math.max(0, valorDeclarado - tolerancia);
  const max = valorDeclarado + tolerancia;

  let status;
  if (valorCalculado < min) status = 'NC';
  else if (valorCalculado > max) status = 'SUP';
  else status = 'C';

  return { status, tolerancia, min, max };
}

/**
 * Evalúa todos los nutrientes contra un PT objetivo
 * @param {Object} calculados - { N: 25.3, P: 4.2, ... }
 * @param {Object} declarados - { N: 25.0, P: 4.0, ... }
 * @returns {Object} { N: {status, tolerancia, min, max, calc, decl}, ... }
 */
export function evaluarTodos(calculados, declarados) {
  const resultados = {};
  for (const key of Object.keys(calculados)) {
    const calc = calculados[key] || 0;
    const decl = declarados[key] || 0;
    if (calc === 0 && decl === 0) {
      resultados[key] = { status: 'C', tolerancia: 0, min: 0, max: 0, calc: 0, decl: 0 };
    } else {
      const ev = evaluar(key, calc, decl);
      resultados[key] = { ...ev, calc, decl };
    }
  }
  return resultados;
}

/**
 * Retorna el estado general según plan_v1:
 * - NO_CUMPLE si algún declarado > 0 es NC
 * - CUMPLE_S si algún declarado > 0 es SUP pero ninguno NC
 * - CUMPLE si todos los declarados > 0 son C
 * - SIN_OBJETIVO si no hay objetivo (declarados vacío)
 */
export function estadoGeneral(evaluaciones, tieneObjetivo = true) {
  if (!tieneObjetivo) return 'SIN_OBJETIVO';

  let tieneNC = false;
  let tieneSUP = false;

  for (const key of Object.keys(evaluaciones)) {
    const { status, decl } = evaluaciones[key];
    if (decl > 0) {
      if (status === 'NC') tieneNC = true;
      if (status === 'SUP') tieneSUP = true;
    }
  }

  if (tieneNC) return 'NO_CUMPLE';
  if (tieneSUP) return 'CUMPLE_S';
  return 'CUMPLE';
}

/**
 * Formatea estado general para UI
 */
export function formatoEstado(estado) {
  switch (estado) {
    case 'CUMPLE': return '✓ CONFORME';
    case 'CUMPLE_S': return '⚠ SUPERA TOLERANCIA';
    case 'NO_CUMPLE': return '✕ NO CONFORME';
    case 'SIN_OBJETIVO': return '— SIN OBJETIVO';
    default: return estado;
  }
}

export function formatoEstadoCorto(estado) {
  switch (estado) {
    case 'CUMPLE': return '✓ C';
    case 'CUMPLE_S': return '⚠ SUP';
    case 'NO_CUMPLE': return '✕ NC';
    case 'SIN_OBJETIVO': return '—';
    default: return estado;
  }
}