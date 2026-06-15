export const NUTRIENTS = [
  'C',
  'N',
  'N_NH4',
  'N_NO3',
  'N_org',
  'N_ur',
  'P',
  'K',
  'CaO',
  'MgO',
  'S',
  'B',
  'Co',
  'Cu',
  'Fe',
  'Mn',
  'Mo',
  'SiO2',
  'Zn',
  'Na',
] as const

export type NutrientKey = (typeof NUTRIENTS)[number]
export type Composition = Record<NutrientKey, number>
export type CatalogClass = 'MP' | 'PT' | 'MZR'

export const CSV_NUTRIENT_MAP: Record<string, NutrientKey> = {
  C: 'C',
  N: 'N',
  'N-NH4': 'N_NH4',
  'N-NO3': 'N_NO3',
  'N-org': 'N_org',
  'N-ur': 'N_ur',
  P: 'P',
  K: 'K',
  CaO: 'CaO',
  MgO: 'MgO',
  S: 'S',
  B: 'B',
  Co: 'Co',
  Cu: 'Cu',
  Fe: 'Fe',
  Mn: 'Mn',
  Mo: 'Mo',
  SiO2: 'SiO2',
  Zn: 'Zn',
  Na: 'Na',
}

export function emptyComposition(): Composition {
  return Object.fromEntries(NUTRIENTS.map((key) => [key, 0])) as Composition
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}
