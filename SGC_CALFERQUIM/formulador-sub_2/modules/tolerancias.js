/**
 * FORMULADOR_CFQ — Motor de Tolerancias
 * Implementación exacta de las fórmulas de tolerancia.md
 * 
 * 3 grupos:
 *   Grupo 1 (N, P): polinómica con topes
 *   Grupo 2 (K): polinómica con topes diferentes
 *   Grupo 3 (secundarios + micros): min(X/2, 1.5, ecuación lineal)
 */

export const Tolerancias = {

  /**
   * Grupo 1: Nitrógeno Total (N) y Fósforo (P)
   * @param {number} x - Valor teórico del nutriente (%)
   * @returns {number} Tolerancia permitida (%)
   */
  _grupo1(x) {
    if (x === 0) return 0;
    if (x < 0.04) return 0.84;
    if (x > 32) return 1.46;
    return -0.0005 * (x * x) + 0.0413 * x + 0.6533;
  },

  /**
   * Grupo 2: Potasio (K)
   * @param {number} x - Valor teórico del nutriente (%)
   * @returns {number} Tolerancia permitida (%)
   */
  _grupo2(x) {
    if (x === 0) return 0;
    if (x < 0.04) return 0.69;
    if (x > 32) return 2.14;
    return -0.0007 * (x * x) + 0.0769 * x + 0.3941;
  },

  /**
   * Ecuaciones lineales específicas para Grupo 3
   */
  _ecuacionesLineales: {
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
    // C orgánico y SiO2 — usar la misma regla que secundarios genéricos
    C:    (x) => 0.3 + 0.075 * x,
    SiO2: (x) => 0.3 + 0.075 * x,
  },

  /**
   * Grupo 3: Secundarios y Micronutrientes
   * T = min(X/2, 1.5, ecuación_lineal(X))
   * Si X = 0, T = 0
   * @param {string} nutriente - Clave del nutriente
   * @param {number} x - Valor teórico (%)
   * @returns {number} Tolerancia permitida (%)
   */
  _grupo3(nutriente, x) {
    if (x === 0) return 0;
    const ecLineal = this._ecuacionesLineales[nutriente];
    if (!ecLineal) return 0;
    
    const mitad = x / 2;
    const tope = 1.5;
    const lineal = ecLineal(x);
    
    return Math.min(mitad, tope, lineal);
  },

  /**
   * Mapeo de nutrientes a su grupo de tolerancia
   */
  _grupoNutriente: {
    N: 1, N_NH4: 1, N_NO3: 1, N_org: 1, N_ur: 1, P: 1,
    K: 2,
    C: 3, CaO: 3, MgO: 3, S: 3, B: 3, Co: 3, Cu: 3, 
    Fe: 3, Mn: 3, Mo: 3, SiO2: 3, Zn: 3, Na: 3
  },

  /**
   * Para el grupo 3, la clave del nutriente en la ecuación lineal
   * (N_NH4 no aplica para grupo 3, pero por si acaso)
   */
  _nutrienteParaEcuacion(key) {
    // Las subfracciones de N usan la misma tolerancia de N (grupo 1)
    // Los demás usan su propia clave
    return key;
  },

  /**
   * Calcula la tolerancia permitida para un nutriente
   * @param {string} nutriente - Clave del nutriente (N, P, K, CaO, etc.)
   * @param {number} valorTeorico - Valor teórico del nutriente (%)
   * @returns {number} Tolerancia (%)
   */
  calcTolerancia(nutriente, valorTeorico) {
    const x = Math.abs(valorTeorico);
    const grupo = this._grupoNutriente[nutriente];
    
    switch (grupo) {
      case 1: return this._grupo1(x);
      case 2: return this._grupo2(x);
      case 3: return this._grupo3(nutriente, x);
      default: return 0;
    }
  },

  /**
   * Evalúa si un valor calculado cumple la tolerancia
   * @param {string} nutriente - Clave del nutriente
   * @param {number} valorCalculado - Valor obtenido de la fórmula
   * @param {number} valorDeclarado - Valor objetivo del PT
   * @returns {{ status: 'C'|'NC'|'SUP', tolerancia: number, min: number, max: number }}
   */
  evaluar(nutriente, valorCalculado, valorDeclarado) {
    // Si el valor declarado es 0, no se evalúa tolerancia
    if (valorDeclarado === 0 && valorCalculado === 0) {
      return { status: 'C', tolerancia: 0, min: 0, max: 0 };
    }

    const tolerancia = this.calcTolerancia(nutriente, valorDeclarado);
    const min = Math.max(0, valorDeclarado - tolerancia);
    const max = valorDeclarado + tolerancia;

    let status;
    if (valorCalculado < min) {
      status = 'NC'; // No conforme — por debajo
    } else if (valorCalculado > max) {
      status = 'SUP'; // Supera — por encima
    } else {
      status = 'C'; // Conforme
    }

    return { status, tolerancia, min, max };
  },

  /**
   * Evalúa todos los nutrientes de una fórmula contra un PT objetivo
   * @param {Object} calculados - { N: 25.3, P: 4.2, K: 18.0, ... }
   * @param {Object} declarados - { N: 25.0, P: 4.0, K: 18.0, ... } (composición del PT)
   * @returns {Object} { N: {status, tolerancia, min, max, calc, decl}, ... }
   */
  evaluarTodos(calculados, declarados) {
    const resultados = {};
    for (const key of Object.keys(calculados)) {
      const calc = calculados[key] || 0;
      const decl = declarados[key] || 0;
      
      if (calc === 0 && decl === 0) {
        resultados[key] = { status: 'C', tolerancia: 0, min: 0, max: 0, calc: 0, decl: 0 };
      } else {
        const eval_ = this.evaluar(key, calc, decl);
        resultados[key] = { ...eval_, calc, decl };
      }
    }
    return resultados;
  },

  /**
   * Retorna el estado general de una evaluación
   * NC si cualquier nutriente es NC, SUP si alguno es SUP, C si todos son C
   */
  estadoGeneral(evaluaciones) {
    let hasNC = false;
    let hasSUP = false;
    
    for (const key of Object.keys(evaluaciones)) {
      const { status, calc, decl } = evaluaciones[key];
      // Solo evaluar nutrientes que tienen valor declarado > 0
      if (decl > 0 || calc > 0) {
        if (status === 'NC') hasNC = true;
        if (status === 'SUP') hasSUP = true;
      }
    }
    
    if (hasNC) return 'NC';
    if (hasSUP) return 'SUP';
    return 'C';
  }
};
