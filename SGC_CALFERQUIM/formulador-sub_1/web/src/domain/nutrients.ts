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

export const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  C: 'C',
  N: 'N',
  N_NH4: 'N-NH4',
  N_NO3: 'N-NO3',
  N_org: 'N-org',
  N_ur: 'N-ur',
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

export const CSV_NUTRIENT_MAP: Record<string, NutrientKey> = {
  C: 'C',
  N: 'N',
  'N-NH4': 'N_NH4',
  'N-NO3': 'N_NO3',
  'N-org': 'N_org',
  'N-ur': 'N_ur',
  'N-ORG': 'N_org',
  'N-UR': 'N_ur',
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
  CAO: 'CaO',
  MGO: 'MgO',
  CO: 'Co',
  CU: 'Cu',
  FE: 'Fe',
  MN: 'Mn',
  MO: 'Mo',
  SIO2: 'SiO2',
  ZN: 'Zn',
  NA: 'Na',
}

export function emptyComposition(): Composition {
  return Object.fromEntries(NUTRIENTS.map((key) => [key, 0])) as Composition
}

export function canonicalNutrientLabel(nutrient: NutrientKey): string {
  return NUTRIENT_LABELS[nutrient]
}

export function normalizeComposition(composition: Partial<Record<string, number>>): Composition {
  const normalized = emptyComposition()
  for (const [rawKey, rawValue] of Object.entries(composition)) {
    const nutrientKey = CSV_NUTRIENT_MAP[rawKey] ?? CSV_NUTRIENT_MAP[rawKey.toUpperCase()]
    if (!nutrientKey) continue
    normalized[nutrientKey] = typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : 0
  }
  return normalized
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}
