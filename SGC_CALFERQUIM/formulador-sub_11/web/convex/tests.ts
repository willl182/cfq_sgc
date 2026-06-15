import { query } from "./_generated/server";
import { calculateCompositionAndEvaluation, ComponentInput, Nutrients } from "./calculations";

export const run = query({
  args: {},
  handler: async (ctx) => {
    const results: { name: string; passed: boolean; error?: string }[] = [];

    const assert = (name: string, condition: boolean, message = "Assertion failed") => {
      if (!condition) {
        results.push({ name, passed: false, error: message });
      } else {
        results.push({ name, passed: true });
      }
    };

    // Test Case 1: SIN_OBJETIVO (No target product)
    try {
      const components: ComponentInput[] = [
        {
          internalId: "MP0001",
          producto: "UREA",
          quantity: 500,
          nutrients: createEmptyNutrients({ N: 46 })
        },
        {
          internalId: "MP0002",
          producto: "DAP",
          quantity: 500,
          nutrients: createEmptyNutrients({ N: 18, P: 46 })
        }
      ];
      
      const res = calculateCompositionAndEvaluation(components, null);
      assert("SIN_OBJETIVO: status check", res.evaluation.status === "SIN_OBJETIVO");
      assert("SIN_OBJETIVO: total weight", res.totalKg === 1000);
      assert("SIN_OBJETIVO: grade N calculation", res.calculatedComposition.N === 32); // (500*46 + 500*18)/1000 = 32
      assert("SIN_OBJETIVO: grade P calculation", res.calculatedComposition.P === 23); // (500*46)/1000 = 23
    } catch (e: any) {
      results.push({ name: "SIN_OBJETIVO test case", passed: false, error: e.message });
    }

    // Test Case 2: CUMPLE (Exact target match)
    try {
      const components: ComponentInput[] = [
        {
          internalId: "MP0001",
          producto: "UREA",
          quantity: 1000,
          nutrients: createEmptyNutrients({ N: 46 })
        }
      ];
      const target = createEmptyNutrients({ N: 46 });
      const res = calculateCompositionAndEvaluation(components, target);
      assert("CUMPLE: status check", res.evaluation.status === "CUMPLE");
      assert("CUMPLE: N status conforms", res.evaluation.nutrientStatuses.N === "C");
    } catch (e: any) {
      results.push({ name: "CUMPLE test case", passed: false, error: e.message });
    }

    // Test Case 3: CUMPLE_S (Nutrient exceeds target but within or above tolerance)
    try {
      const components: ComponentInput[] = [
        {
          internalId: "MP0001",
          producto: "UREA",
          quantity: 1000,
          nutrients: createEmptyNutrients({ N: 47.5 }) // 47.5% vs 46% target
        }
      ];
      const target = createEmptyNutrients({ N: 46 });
      const res = calculateCompositionAndEvaluation(components, target);
      // N group 1 tolerance for 46: -0.0005*(46^2) + 0.0413*46 + 0.6533 = 1.4865
      // 47.5 is larger than 46 + 1.4865 = 47.4865, so it should be SUP
      assert("CUMPLE_S: status check", res.evaluation.status === "CUMPLE_S");
      assert("CUMPLE_S: N status is SUP", res.evaluation.nutrientStatuses.N === "SUP");
    } catch (e: any) {
      results.push({ name: "CUMPLE_S test case", passed: false, error: e.message });
    }

    // Test Case 4: NO_CUMPLE (Nutrient is below tolerance limit)
    try {
      const components: ComponentInput[] = [
        {
          internalId: "MP0001",
          producto: "UREA",
          quantity: 1000,
          nutrients: createEmptyNutrients({ N: 44 }) // 44% vs 46% target
        }
      ];
      const target = createEmptyNutrients({ N: 46 });
      const res = calculateCompositionAndEvaluation(components, target);
      assert("NO_CUMPLE: status check", res.evaluation.status === "NO_CUMPLE");
      assert("NO_CUMPLE: N status is NC", res.evaluation.nutrientStatuses.N === "NC");
    } catch (e: any) {
      results.push({ name: "NO_CUMPLE test case", passed: false, error: e.message });
    }

    // Test Case 5: Weight Mismatch (Total not 1000 kg)
    try {
      const components: ComponentInput[] = [
        {
          internalId: "MP0001",
          producto: "UREA",
          quantity: 950,
          nutrients: createEmptyNutrients({ N: 46 })
        }
      ];
      const res = calculateCompositionAndEvaluation(components, null);
      assert("Weight mismatch: alerts count", res.alerts.length === 1);
      assert("Weight mismatch: alert content contains total kg", res.alerts[0].includes("950"));
    } catch (e: any) {
      results.push({ name: "Weight mismatch test case", passed: false, error: e.message });
    }

    // Test Case 6: Undeclared nutrients (Not in target PT, should not trigger NC/SUP)
    try {
      const components: ComponentInput[] = [
        {
          internalId: "MP0001",
          producto: "DAP",
          quantity: 1000,
          nutrients: createEmptyNutrients({ N: 18, P: 46, Zn: 2 }) // contains Zinc (2%)
        }
      ];
      const target = createEmptyNutrients({ N: 18, P: 46 }); // Zn not declared
      const res = calculateCompositionAndEvaluation(components, target);
      assert("Undeclared nutrients: status is CUMPLE", res.evaluation.status === "CUMPLE");
      assert("Undeclared nutrients: Zn evaluation is C", res.evaluation.nutrientStatuses.Zn === "C");
    } catch (e: any) {
      results.push({ name: "Undeclared nutrients test case", passed: false, error: e.message });
    }

    return {
      success: results.every(r => r.passed),
      results
    };
  }
});

function createEmptyNutrients(overrides: Partial<Nutrients>): Nutrients {
  const nutrients = {} as Nutrients;
  const keys = [
    "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur", "P", "K", "CaO", "MgO", 
    "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
  ] as const;
  for (const k of keys) {
    nutrients[k] = overrides[k] ?? 0;
  }
  return nutrients;
}
