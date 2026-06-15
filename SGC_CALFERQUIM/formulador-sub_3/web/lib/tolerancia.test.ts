import { describe, it, expect } from "vitest";
import { evaluarTolerancia } from "../lib/tolerancia";
import type { CatalogItem } from "../lib/calculation";

function makeTarget(nutrients: Record<string, number>): CatalogItem {
  return {
    internalId: "PT001",
    class: "PT",
    name: "Test",
    ...nutrients,
  };
}

describe("evaluarTolerancia", () => {
  it("SIN_OBJETIVO cuando no hay target", () => {
    const result = evaluarTolerancia({ N: 10 }, 1000, null);
    expect(result.generalStatus).toBe("SIN_OBJETIVO");
  });

  it("CUMPLE cuando todos los nutrientes evaluados están dentro de tolerancia", () => {
    const target = makeTarget({ N: 10 });
    const result = evaluarTolerancia({ N: 10 }, 1000, target);
    expect(result.generalStatus).toBe("CUMPLE");
    expect(result.byNutrient.N).toBe("C");
  });

  it("NO_CUMPLE cuando hay NC", () => {
    const target = makeTarget({ N: 10 });
    const result = evaluarTolerancia({ N: 5 }, 1000, target);
    expect(result.generalStatus).toBe("NO_CUMPLE");
    expect(result.byNutrient.N).toBe("NC");
  });

  it("CUMPLE_S cuando hay SUP sin NC", () => {
    const target = makeTarget({ N: 10 });
    const result = evaluarTolerancia({ N: 15 }, 1000, target);
    expect(result.generalStatus).toBe("CUMPLE_S");
    expect(result.byNutrient.N).toBe("SUP");
  });

  it("nutrientes no declarados aparecen como NA", () => {
    const target = makeTarget({ N: 10 });
    const result = evaluarTolerancia({ N: 10, P: 5 }, 1000, target);
    expect(result.byNutrient.N).toBe("C");
    expect(result.byNutrient.P).toBe("NA");
  });

  it("evalúa múltiples nutrientes correctamente", () => {
    const target = makeTarget({ N: 10, P: 20, K: 30 });
    const result = evaluarTolerancia({ N: 10, P: 20, K: 30 }, 1000, target);
    expect(result.generalStatus).toBe("CUMPLE");
    expect(result.byNutrient.N).toBe("C");
    expect(result.byNutrient.P).toBe("C");
    expect(result.byNutrient.K).toBe("C");
  });
});
