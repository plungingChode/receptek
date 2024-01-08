import type { Ingredient, MeasuredIngredient } from "~/types";
import type { ShoppingListIngredient, ShoppingListRecipe } from "./store";

export function isMeasuredIngredient(i: Ingredient): i is MeasuredIngredient {
  return "qty" in i;
}

export type CombinedIngredient = {
  name: string;
  qty?: number;
  unit?: string;
  marked: number;
  combinedFrom: IngredientWithSource[];
};

export type IngredientWithSource = ShoppingListIngredient & {
  recipeId: string;
  recipeName: string;
};

export function intoOverview(items: ShoppingListRecipe[]): CombinedIngredient[] {
  // Collect ingredients from all recipes
  const combined: Record<string, CombinedIngredient> = {};
  for (const recipe of items) {
    for (const ingredient of recipe.ingredients) {
      const withSource: IngredientWithSource = {
        ...ingredient,
        recipeId: recipe.id,
        recipeName: recipe.name,
      };
      if (!(ingredient.name in combined)) {
        combined[ingredient.name] = {
          name: ingredient.name,
          marked: 0,
          combinedFrom: [],
        };
      }
      const c = combined[ingredient.name]!;
      c.combinedFrom.push(withSource);
      if (ingredient.marked) {
        c.marked += 1;
      }
    }
  }

  // Try to find a common unit for measurements
  const overview = Object.values(combined);
  for (const o of overview) {
    const common = reconcileUnits(o.combinedFrom);
    if (!common) {
      continue;
    }
    // TODO add a step to truncate units where possible, e.g.
    // 200 dkg -> 2 kg
    o.qty = common.qty;
    o.unit = common.unit;
  }

  return overview;
}

export type ReconciledMeasurement = {
  qty: number;
  unit: string;
};

export function reconcileUnits(ingredients: Ingredient[]): ReconciledMeasurement | false {
  if (!ingredients.length) {
    throw new Error("Cannot process empty list");
  }
  let totalQty: number = 0;
  let commonUnit: string | null = null;
  let commonBaseUnit: string | null = null;
  let commonMagnitude: number | null = null;
  for (const i of ingredients) {
    if (!isMeasuredIngredient(i)) {
      continue;
    }
    // Handle trivial cases
    if (commonUnit === null) {
      commonUnit = i.unit;
      totalQty = i.qty;
      if (i.unit in baseUnits) {
        const unit = i.unit as KnownUnit;
        commonBaseUnit = baseUnits[unit];
        commonMagnitude = magnitudes[unit];
      }
      continue;
    }
    if (i.unit === commonUnit) {
      totalQty += i.qty;
      continue;
    }
    // Check if the current unit can be converted to the common unit
    if (commonUnit && !commonBaseUnit && i.unit !== commonUnit) {
      return false;
    }
    const unitConvertible = i.unit in baseUnits;
    if (commonBaseUnit && !unitConvertible) {
      return false;
    }
    let qty = i.qty;
    const unit = i.unit as KnownUnit;
    const baseUnit = baseUnits[unit];
    const magnitude = magnitudes[unit];
    if (commonBaseUnit !== baseUnit) {
      return false;
    }
    // Perform the conversion, always use the largest encountered magnitude
    if (commonMagnitude === null) {
      throw new Error("Common magnitude should be set");
    }
    if (magnitude > commonMagnitude) {
      commonUnit = unit;
      totalQty = (totalQty / magnitude) * commonMagnitude;
    } else if (commonMagnitude > magnitude) {
      qty = (qty / commonMagnitude) * magnitude;
    }
    totalQty += qty;
  }
  // If common unit is not set, it means there wasn't a single measured ingredient.
  // These cannot be reconciled, count it as a failure.
  if (commonUnit === null) {
    return false;
  }
  return { unit: commonUnit, qty: totalQty };
}

type BaseUnit = "g" | "l";
type KnownUnit = "mg" | "g" | "dkg" | "kg" | "ml" | "cl" | "dl" | "l";

const baseUnits: Record<KnownUnit, BaseUnit> = {
  mg: "g",
  g: "g",
  dkg: "g",
  kg: "g",

  ml: "l",
  cl: "l",
  dl: "l",
  l: "l",
};

const magnitudes: Record<KnownUnit, number> = {
  mg: 1e-3,
  g: 1,
  dkg: 10,
  kg: 1e3,

  ml: 1e-3,
  cl: 1e-2,
  dl: 1e-1,
  l: 1,
};
