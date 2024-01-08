import type { Ingredient } from "../../types";
import { describe, test, expect } from "vitest";
import { intoOverview, type ReconciledMeasurement, reconcileUnits } from "./util";
import type { ShoppingListRecipe } from "./store";

describe("unit reconciliation", () => {
  test("merges quantities, if all units are the same", () => {
    const ingredients: Ingredient[] = [
      { name: "", unit: "a", qty: 1 },
      { name: "", unit: "a", qty: 1 },
    ];
    const expected: ReconciledMeasurement = {
      unit: "a",
      qty: 2,
    };
    expect(reconcileUnits(ingredients)).toEqual(expected);
  });

  test("fails, if units are incompatible", () => {
    const ingredients: Ingredient[] = [
      { name: "", unit: "a", qty: 1 },
      { name: "", unit: "b", qty: 1 },
    ];
    expect(reconcileUnits(ingredients)).toBe(false);
  });

  test("convertible units are converted to the largest available magnitude", () => {
    const ingredients: Ingredient[] = [
      { name: "", unit: "kg", qty: 1 },
      { name: "", unit: "g", qty: 1 },
    ];
    const result = reconcileUnits(ingredients) as ReconciledMeasurement;
    expect(result).toBeTruthy();
    expect(result.unit).toBe("kg");
    expect(result.qty).toBeCloseTo(1);
  });

  test("incompatible - but convertible - units are not merged", () => {
    const ingredients: Ingredient[] = [
      { name: "", unit: "ml", qty: 1 },
      { name: "", unit: "kg", qty: 1 },
    ];
    const result = reconcileUnits(ingredients) as ReconciledMeasurement;
    expect(result).toBeFalsy();
  });
});

describe("overview generation", () => {
  const simpleShoppingList: ShoppingListRecipe[] = [
    {
      id: 'a',
      count: 1,
      name: 'a',
      ingredients: [
        { name: 'a', marked: false },
      ]
    },
    {
      id: 'b',
      count: 1,
      name: 'b',
      ingredients: [
        { name: 'b', marked: true },
      ]
    }
  ];
  test("collects different ingredients from recipes", () => {
    const overview = intoOverview(simpleShoppingList);
    expect(overview.length).toBe(2);
    expect(overview).toContainEqual(
      expect.objectContaining({
        name: 'a',
        combinedFrom: [
          expect.objectContaining({ name: 'a', recipeName: 'a' })
        ]
      })
    );
    expect(overview).toContainEqual(
      expect.objectContaining({
        name: 'b',
        combinedFrom: [
          expect.objectContaining({ name: 'b', recipeName: 'b' })
        ]
      })
    );
  });
  test("counts marked ingredients", () => {
    const overview = intoOverview(simpleShoppingList);
    expect(overview.length).toBe(2);
    expect(overview).toContainEqual(
      expect.objectContaining({
        name: 'a',
        marked: 0
      })
    );
    expect(overview).toContainEqual(
      expect.objectContaining({
        name: 'b',
        marked: 1
      })
    );
  });
});
