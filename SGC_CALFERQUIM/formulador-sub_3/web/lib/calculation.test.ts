import { describe, it, expect } from "vitest";
import { calcularComposicion, NUTRIENTES } from "../lib/calculation";

function makeItem(
  internalId: string,
  nutrients: Record<string, number>
) {
  return {
    internalId,
    class: "MP" as const,
    name: internalId,
    ...nutrients,
  };
}

describe("calcularComposicion", () => {
  it("suma exactamente 1000 kg", () => {
    const items = {
      MP001: makeItem("MP001", { N: 46 }),
      MP002: makeItem("MP002", { P: 46 }),
    };
    const comps = [
      { catalogItemId: "a", internalId: "MP001", quantityKg: 500 },
      { catalogItemId: "b", internalId: "MP002", quantityKg: 500 },
    ];
    const { totalKg } = calcularComposicion(comps, items);
    expect(totalKg).toBe(1000);
  });

  it("suma distinta de 1000 kg", () => {
    const items = {
      MP001: makeItem("MP001", { N: 46 }),
    };
    const comps = [
      { catalogItemId: "a", internalId: "MP001", quantityKg: 700 },
    ];
    const { totalKg } = calcularComposicion(comps, items);
    expect(totalKg).toBe(700);
  });

  it("calcula nutrientes correctamente", () => {
    const items = {
      MP001: makeItem("MP001", { N: 20 }),
      MP002: makeItem("MP002", { N: 30 }),
    };
    const comps = [
      { catalogItemId: "a", internalId: "MP001", quantityKg: 500 },
      { catalogItemId: "b", internalId: "MP002", quantityKg: 500 },
    ];
    const { composition } = calcularComposicion(comps, items);
    // aporte = cantidadKg * concentracion / 1000
    expect(composition.N).toBeCloseTo(25, 4); // (500*20 + 500*30)/1000 = 25
  });

  it("ignora item inexistente", () => {
    const items = {};
    const comps = [
      { catalogItemId: "a", internalId: "MP001", quantityKg: 500 },
    ];
    const { composition, totalKg } = calcularComposicion(comps, items);
    expect(totalKg).toBe(0);
    expect(Object.keys(composition)).toHaveLength(0);
  });
});

describe("NUTRIENTES array", () => {
  it("tiene 20 nutrientes", () => {
    expect(NUTRIENTES).toHaveLength(20);
  });
});
