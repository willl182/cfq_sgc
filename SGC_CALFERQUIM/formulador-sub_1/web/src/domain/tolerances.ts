import { NUTRIENTS, roundTo, type Composition, type NutrientKey } from './nutrients'

export type NutrientStatus = 'C' | 'NC' | 'SUP' | 'INFO'
export type GeneralStatus = 'CUMPLE' | 'NO_CUMPLE' | 'CUMPLE_S' | 'SIN_OBJETIVO'

export type NutrientEvaluation = {
  nutrient: NutrientKey
  calculated: number
  declared: number
  tolerance: number
  min: number
  max: number
  status: NutrientStatus
}

const GROUP_3_LINEAR: Partial<Record<NutrientKey, (x: number) => number>> = {
  CaO: (x) => 0.42 + 0.105 * x,
  MgO: (x) => 0.5 + 0.125 * x,
  S: (x) => 0.3 + 0.075 * x,
  B: (x) => 0.005 + 0.25 * x,
  Co: (x) => 0.000125 + 0.375 * x,
  Mo: (x) => 0.000125 + 0.375 * x,
  Cu: (x) => 0.015 + 0.3 * x,
  Fe: (x) => 0.015 + 0.3 * x,
  Mn: (x) => 0.015 + 0.3 * x,
  Zn: (x) => 0.015 + 0.3 * x,
  Na: (x) => 0.015 + 0.3 * x,
  C: (x) => 0.3 + 0.075 * x,
  SiO2: (x) => 0.3 + 0.075 * x,
}

function group1(x: number): number {
  if (x === 0) return 0
  if (x < 0.04) return 0.84
  if (x > 32) return 1.46
  return -0.0005 * x * x + 0.0413 * x + 0.6533
}

function group2(x: number): number {
  if (x === 0) return 0
  if (x < 0.04) return 0.69
  if (x > 32) return 2.14
  return -0.0007 * x * x + 0.0769 * x + 0.3941
}

function group3(nutrient: NutrientKey, x: number): number {
  if (x === 0) return 0
  const linear = GROUP_3_LINEAR[nutrient]
  if (!linear) return 0
  return Math.min(x / 2, 1.5, linear(x))
}

export function calcTolerance(nutrient: NutrientKey, declaredValue: number): number {
  const x = Math.abs(declaredValue)
  if (['N', 'N_NH4', 'N_NO3', 'N_org', 'N_ur', 'P'].includes(nutrient)) return group1(x)
  if (nutrient === 'K') return group2(x)
  return group3(nutrient, x)
}

export function evaluateComposition(calculated: Composition, declared?: Composition | null) {
  if (!declared) {
    return {
      generalStatus: 'SIN_OBJETIVO' as GeneralStatus,
      evaluations: NUTRIENTS.map((nutrient) => ({
        nutrient,
        calculated: roundTo(calculated[nutrient] ?? 0, 4),
        declared: 0,
        tolerance: 0,
        min: 0,
        max: 0,
        status: 'INFO' as NutrientStatus,
      })),
    }
  }

  let hasNC = false
  let hasSUP = false
  const evaluations = NUTRIENTS.map((nutrient) => {
    const calculatedValue = calculated[nutrient] ?? 0
    const declaredValue = declared[nutrient] ?? 0
    if (declaredValue <= 0) {
      return {
        nutrient,
        calculated: roundTo(calculatedValue, 4),
        declared: roundTo(declaredValue, 4),
        tolerance: 0,
        min: 0,
        max: 0,
        status: 'INFO' as NutrientStatus,
      }
    }

    const tolerance = calcTolerance(nutrient, declaredValue)
    const min = Math.max(0, declaredValue - tolerance)
    const max = declaredValue + tolerance
    const status: NutrientStatus = calculatedValue < min ? 'NC' : calculatedValue > max ? 'SUP' : 'C'
    if (status === 'NC') hasNC = true
    if (status === 'SUP') hasSUP = true

    return {
      nutrient,
      calculated: roundTo(calculatedValue, 4),
      declared: roundTo(declaredValue, 4),
      tolerance: roundTo(tolerance, 4),
      min: roundTo(min, 4),
      max: roundTo(max, 4),
      status,
    }
  })

  const generalStatus: GeneralStatus = hasNC ? 'NO_CUMPLE' : hasSUP ? 'CUMPLE_S' : 'CUMPLE'
  return { generalStatus, evaluations }
}
