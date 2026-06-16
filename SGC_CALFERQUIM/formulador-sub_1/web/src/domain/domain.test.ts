import { describe, expect, it } from 'vitest'
import { parseCatalogCsv } from './catalog'
import { exportCatalogCsv, exportLiveListsCsv, exportSnapshotsCsv } from './exportLists'
import { calculateComponentContributions, calculateComposition, summarizeFormula } from './formulation'
import { parseListImportCsv } from './importLists'
import { summarizeRequiredInputs } from './listTotals'
import { canonicalNutrientLabel, emptyComposition, normalizeComposition } from './nutrients'

describe('catalog seed parsing', () => {
  it('asigna IDs secuenciales reproducibles por clase', () => {
    const csv = 'COD;PRODUCTO;CLASE;TIPO;C;N;N-NH4;N-NO3;N-org;N-ur;P;K;CaO;MgO;S;B;Co;Cu;Fe;Mn;Mo;SiO2;Zn;Na\n1;Urea;MP;G;;46;;;;;;;;;;;;;;;;;;\n2;Producto;PT;L;;20;;;;;;;;;;;;;;;;;;'
    const result = parseCatalogCsv(csv)
    expect(result.errors).toEqual([])
    expect(result.items.map((item) => item.internalId)).toEqual(['MP0001', 'PT0001'])
  })

  it('clasifica COD R, R1 y R2 como MZR si la clase no viene normalizada', () => {
    const csv = 'COD;PRODUCTO;CLASE;TIPO;C;N;N-NH4;N-NO3;N-org;N-ur;P;K;CaO;MgO;S;B;Co;Cu;Fe;Mn;Mo;SiO2;Zn;Na\nR;Mezcla base;;G;;10;;;;;;;;;;;;;;;;;;\nR2;Mezcla dos;;G;;12;;;;;;;;;;;;;;;;;;'
    const result = parseCatalogCsv(csv)
    expect(result.items.map((item) => item.internalId)).toEqual(['MZR0001', 'MZR0002'])
  })

  it('permite COD duplicado porque internalId es la clave funcional estable', () => {
    const csv = 'COD;PRODUCTO;CLASE;TIPO;C;N;N-NH4;N-NO3;N-org;N-ur;P;K;CaO;MgO;S;B;Co;Cu;Fe;Mn;Mo;SiO2;Zn;Na\nA;Producto A;PT;G;;10;;;;;;;;;;;;;;;;;;\nA;Producto B;PT;G;;12;;;;;;;;;;;;;;;;;;'
    const result = parseCatalogCsv(csv)
    expect(result.errors).toEqual([])
    expect(result.items.map((item) => item.internalId)).toEqual(['PT0001', 'PT0002'])
    expect(result.items.map((item) => item.externalCode)).toEqual(['A', 'A'])
  })

  it('COD R tiene precedencia sobre CLASE PT y queda como MZR', () => {
    const csv = 'COD;PRODUCTO;CLASE;TIPO;C;N;N-NH4;N-NO3;N-org;N-ur;P;K;CaO;MgO;S;B;Co;Cu;Fe;Mn;Mo;SiO2;Zn;Na\nR;Mezcla repetida;PT;G;;10;;;;;;;;;;;;;;;;;;\nR;Otra mezcla;PT;G;;12;;;;;;;;;;;;;;;;;;'
    const result = parseCatalogCsv(csv)
    expect(result.errors).toEqual([])
    expect(result.items.map((item) => item.internalId)).toEqual(['MZR0001', 'MZR0002'])
    expect(result.items.map((item) => item.class)).toEqual(['MZR', 'MZR'])
  })

  it('acepta nutrientes con encabezados en mayuscula total y conserva claves canonicas', () => {
    const csv = 'COD;PRODUCTO;CLASE;TIPO;N-ORG;N-UR;CAO;MGO;CU;FE;MN;MO;SIO2;ZN;NA\n1;Mineral;MP;S;10;11;1;2;3;4;5;6;7;8;9'
    const result = parseCatalogCsv(csv)

    expect(result.errors).toEqual([])
    expect(result.items[0].composition.N_org).toBe(10)
    expect(result.items[0].composition.N_ur).toBe(11)
    expect(result.items[0].composition.CaO).toBe(1)
    expect(result.items[0].composition.MgO).toBe(2)
    expect(result.items[0].composition.Cu).toBe(3)
    expect(result.items[0].composition.Fe).toBe(4)
    expect(result.items[0].composition.Mn).toBe(5)
    expect(result.items[0].composition.Mo).toBe(6)
    expect(result.items[0].composition.SiO2).toBe(7)
    expect(result.items[0].composition.Zn).toBe(8)
    expect(result.items[0].composition.Na).toBe(9)
  })
})

describe('nutrient nomenclature', () => {
  it('normaliza composiciones heredadas sin persistir claves en mayuscula total', () => {
    const composition = normalizeComposition({ 'N-ORG': 10, 'N-UR': 11, CAO: 1, MGO: 2, CU: 3, FE: 4, MN: 5, MO: 6, SIO2: 7, ZN: 8, NA: 9 })

    expect(composition.N_org).toBe(10)
    expect(composition.N_ur).toBe(11)
    expect(composition.CaO).toBe(1)
    expect(composition.MgO).toBe(2)
    expect(composition.Cu).toBe(3)
    expect(composition.Fe).toBe(4)
    expect(composition.Mn).toBe(5)
    expect(composition.Mo).toBe(6)
    expect(composition.SiO2).toBe(7)
    expect(composition.Zn).toBe(8)
    expect(composition.Na).toBe(9)
  })

  it('muestra etiquetas quimicas canonicas', () => {
    expect(canonicalNutrientLabel('CaO')).toBe('CaO')
    expect(canonicalNutrientLabel('MgO')).toBe('MgO')
    expect(canonicalNutrientLabel('Cu')).toBe('Cu')
    expect(canonicalNutrientLabel('Na')).toBe('Na')
  })
})

describe('future list import preview', () => {
  const catalog = [
    {
      internalId: 'PT0001',
      externalCode: 'P1',
      originalCode: 'P1',
      name: 'Producto objetivo',
      class: 'PT' as const,
      type: 'L',
      origin: 'manual' as const,
      composition: emptyComposition(),
    },
    {
      internalId: 'MP0001',
      externalCode: 'M1',
      originalCode: 'M1',
      name: 'Materia prima',
      class: 'MP' as const,
      type: 'S',
      origin: 'manual' as const,
      composition: emptyComposition(),
    },
  ]

  it('agrupa filas validas por producto objetivo y alias sin persistir', () => {
    const csv = 'productoObjetivoId;listaAlias;componenteId;cantidad\nPT0001;L-A;MP0001;600\nPT0001;L-A;PT0001;400'
    const result = parseListImportCsv(csv, catalog)
    expect(result.errors).toEqual([])
    expect(result.summary).toEqual({ rowsRead: 2, validRows: 2, groups: 1 })
    expect(result.groups[0].totalKg).toBe(1000)
  })

  it('reporta componentes inexistentes y cantidades invalidas', () => {
    const csv = 'productoObjetivoId;listaAlias;componenteId;cantidad\nPT0001;L-A;MP9999;abc'
    const result = parseListImportCsv(csv, catalog)
    expect(result.groups).toEqual([])
    expect(result.errors.map((error) => error.field)).toEqual(['componenteId', 'cantidad'])
  })
})

describe('formulation engine', () => {
  const mp = {
    internalId: 'MP0001',
    externalCode: '1',
    originalCode: '1',
    name: 'Urea',
    class: 'MP' as const,
    type: 'G',
    origin: 'csv' as const,
    composition: { ...emptyComposition(), N: 46 },
  }

  it('calcula aporte con formula cantidadKg * concentracion / 1000', () => {
    const composition = calculateComposition([{ item: mp, quantityKg: 500 }])
    expect(composition.N).toBe(23)
  })

  it('calcula contribucion por insumo y cuadra con la composicion total', () => {
    const kcl = { ...mp, internalId: 'MP0002', name: 'KCL', composition: { ...emptyComposition(), K: 60 } }
    const components = [{ item: mp, quantityKg: 500 }, { item: kcl, quantityKg: 250 }]
    const contributions = calculateComponentContributions(components)
    const composition = calculateComposition(components)

    expect(contributions[0].contribution.N).toBe(23)
    expect(contributions[1].contribution.K).toBe(15)
    expect(contributions.reduce((sum, row) => sum + row.contribution.N, 0)).toBe(composition.N)
    expect(contributions.reduce((sum, row) => sum + row.contribution.K, 0)).toBe(composition.K)
  })

  it('permite guardar total distinto de 1000 con alerta', () => {
    const summary = summarizeFormula([{ item: mp, quantityKg: 500 }], null)
    expect(summary.totalKg).toBe(500)
    expect(summary.alerts[0]).toContain('1000 kg')
    expect(summary.evaluation.generalStatus).toBe('SIN_OBJETIVO')
  })

  it('SUP produce CUMPLE_S y no NO_CUMPLE', () => {
    const target = { ...mp, internalId: 'PT0001', class: 'PT' as const, composition: { ...emptyComposition(), N: 10 } }
    const summary = summarizeFormula([{ item: mp, quantityKg: 500 }], target)
    expect(summary.evaluation.generalStatus).toBe('CUMPLE_S')
  })

  it('un nutriente no declarado queda informativo', () => {
    const target = { ...mp, internalId: 'PT0001', class: 'PT' as const, composition: emptyComposition() }
    const summary = summarizeFormula([{ item: mp, quantityKg: 500 }], target)
    expect(summary.evaluation.evaluations.find((item) => item.nutrient === 'N')?.status).toBe('INFO')
  })
})

describe('list export', () => {
  const composition = emptyComposition()
  const mp = {
    internalId: 'MP0001',
    externalCode: 'M1',
    originalCode: 'M1',
    name: 'Materia; prima "especial"',
    class: 'MP' as const,
    type: 'S',
    origin: 'manual' as const,
    composition,
  }
  const pt = {
    internalId: 'PT0001',
    externalCode: 'P1',
    originalCode: 'P1',
    name: 'Producto objetivo',
    class: 'PT' as const,
    type: 'L',
    origin: 'manual' as const,
    composition,
  }

  it('exporta el catalogo activo con composicion completa', () => {
    const csv = exportCatalogCsv([{ ...mp, composition: { ...composition, N: 46, K: 1.5 } }])

    expect(csv.split('\n')[0]).toContain('idInterno;codigoExterno;codigoOriginal;producto;clase;tipo;origen;archivado;C;N;N-NH4')
    expect(csv).toContain('MP0001;M1;M1;"Materia; prima ""especial""";MP;S;manual;;0;46')
  })

  it('exporta listas vivas como CSV plano por componente', () => {
    const csv = exportLiveListsCsv([
      {
        id: 'lista-1',
        displayCode: 'PT0001-L001',
        targetProductId: 'PT0001',
        components: [{ itemId: 'MP0001', quantityKg: 500 }],
        updatedAt: Date.UTC(2026, 0, 2, 3, 4, 5),
      },
    ], [mp, pt])

    expect(csv.split('\n')[0]).toContain('listaId;codigoLista;productoObjetivoId')
    expect(csv).toContain('"Materia; prima ""especial"""')
    expect(csv).toContain('2026-01-02T03:04:05.000Z')
  })

  it('exporta snapshots congelados con version y estado', () => {
    const summary = summarizeFormula([{ item: mp, quantityKg: 500 }], pt)
    const csv = exportSnapshotsCsv([
      {
        id: 'snapshot-1',
        productListId: 'lista-1',
        displayCode: 'PT0001-L001',
        snapshotVersion: 'v1',
        targetProductId: 'PT0001',
        frozenTarget: pt,
        frozenComponents: [{ item: mp, quantityKg: 500 }],
        summary,
        createdAt: Date.UTC(2026, 0, 2, 3, 4, 5),
        actor: 'admin',
      },
    ])

    expect(csv).toContain('snapshot-1;lista-1;PT0001-L001;v1')
    expect(csv).toContain(`admin;${summary.evaluation.generalStatus};500`)
  })
})

describe('required input totals', () => {
  const composition = emptyComposition()
  const catalog = [
    {
      internalId: 'MP0001',
      externalCode: 'M1',
      originalCode: 'M1',
      name: 'Urea',
      class: 'MP' as const,
      type: 'S',
      origin: 'manual' as const,
      composition,
    },
    {
      internalId: 'MP0002',
      externalCode: 'M2',
      originalCode: 'M2',
      name: 'KCL',
      class: 'MP' as const,
      type: 'S',
      origin: 'manual' as const,
      composition,
    },
  ]

  it('suma cantidades de varias listas por insumo', () => {
    const totals = summarizeRequiredInputs([
      {
        id: 'lista-1',
        displayCode: 'L1',
        components: [
          { itemId: 'MP0001', quantityKg: 100 },
          { itemId: 'MP0002', quantityKg: 25 },
        ],
      },
      {
        id: 'lista-2',
        displayCode: 'L2',
        components: [{ itemId: 'MP0001', quantityKg: 50 }],
      },
    ], [
      { listId: 'lista-1', multiplier: 2 },
      { listId: 'lista-2', multiplier: 3 },
    ], catalog)

    expect(totals.map((row) => [row.item.internalId, row.totalKg])).toEqual([
      ['MP0001', 350],
      ['MP0002', 50],
    ])
    expect(totals[0].sources.map((source) => source.quantityKg)).toEqual([200, 150])
  })
})
