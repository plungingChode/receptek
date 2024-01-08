import "@total-typescript/ts-reset";
import type { Ingredient } from "~/types";
import { type Readable, writable } from "svelte/store";
import { z } from "zod";
import { INDEX_NOT_FOUND, __SERVER__ } from "~/consts";

export type ShoppingListIngredient = Ingredient & {
  /** Whether this ingredient is marked as collected/bought. */
  marked: boolean;
};

export type ShoppingListRecipe = {
  /**
   * A unique ID for a particular recipe (usually the page slug).
   */
  id: string;
  /** The recipe name */
  name: string;
  /**
   * The number of times this recipe was added to the shopping list.
   * Essentially equivalent to portions.
   */
  count: number;
  /**
   * The ingredients required to prepare this recipe.
   */
  ingredients: ShoppingListIngredient[];
};

/** Local storage entry key for the persistent shopping list. */
const SHOPPING_LIST_KEY = "shopping_list";

/** Validates a `ShoppingListEntry` object */
const shoppingListEntrySchema: z.ZodType<ShoppingListRecipe> = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number().int().nonnegative(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      qty: z.number().optional(),
      unit: z.string().optional(),
      marked: z.boolean(),
    })
  ),
});

/** Validates a `ShoppingListEntry[]` array */
const shoppingListSchema: z.ZodType<ShoppingListRecipe[]> = z.array(shoppingListEntrySchema);

export type PersistentShoppingList = {
  subscribe: Readable<ShoppingListRecipe[]>["subscribe"];
  add: (newEntry: ShoppingListRecipe) => void;
  remove: (recipeId: string) => void;
  setMarked: (recipeId: string, ingredientName: string, isMarked: boolean) => void;
  setAllMarked: (ingredients: [string, string][], isMarked: boolean) => void;
};

/**
 * A shopping list loaded from and saved to persistent storage.
 */
export const persistentShoppingList: PersistentShoppingList = (() => {
  const shoppingList = initialize();
  const w = writable<ShoppingListRecipe[]>(shoppingList);

  let recipeIndex: Record<string, number> = reindex(shoppingList);

  return {
    subscribe: w.subscribe,
    /**
     * Add a new recipe to the shopping list. If one with the same `id` already
     * exists, increment its count instead.
     */
    add: (newEntry: ShoppingListRecipe) =>
      w.update((list) => {
        const idx = recipeIndex[newEntry.id];
        if (typeof idx === "undefined") {
          list.push(newEntry);
        } else {
          list[idx]!.count += newEntry.count;
        }
        recipeIndex = reindex(list);
        save(list);
        return list;
      }),

    /**
     * Remove a recipe from the shopping list by its `id`.
     */
    remove: (id: string) =>
      w.update((list) => {
        const idx = recipeIndex[id];
        if (typeof idx === "undefined") {
          return list;
        }
        list.splice(idx, 1);
        recipeIndex = reindex(list);
        save(list);
        return list;
      }),

    setMarked: (itemId: string, ingredientName: string, isMarked: boolean) =>
      w.update((list) => {
        const idx = recipeIndex[itemId];
        if (typeof idx === "undefined") {
          return list;
        }
        const ingredients = list[idx]!.ingredients;
        const ingredient = ingredients.find((x) => x.name === ingredientName);
        if (!ingredient) {
          return list;
        }
        ingredient.marked = isMarked;
        save(list);
        return list;
      }),

    setAllMarked: (ingredients: [string, string][], isMarked: boolean) =>
      w.update((list) => {
        for (const [recipeId, ingredientName] of ingredients) {
          const idx = recipeIndex[recipeId];
          if (typeof idx === "undefined") {
            continue;
          }
          const recipe = list[idx]!;
          const ingredient = recipe.ingredients.find((x) => x.name === ingredientName);
          if (!ingredient) {
            continue;
          }
          ingredient.marked = isMarked;
        }
        save(list);
        return list;
      }),
  };
})();

/**
 * Load the stored shopping list from persistent storage (in this case,
 * `localStorage`).
 */
function load(): z.SafeParseReturnType<unknown, ShoppingListRecipe[]> {
  if (__SERVER__) {
    return { success: true, data: [] };
  }
  const stored = window.localStorage.getItem(SHOPPING_LIST_KEY) ?? "[]";
  return shoppingListSchema.safeParse(JSON.parse(stored));
}

/**
 * Serialize and write a shopping list to persistent storage.
 */
function save(l: ShoppingListRecipe[]) {
  if (__SERVER__) {
    return;
  }
  const serialized = JSON.stringify(l);
  window.localStorage.setItem(SHOPPING_LIST_KEY, serialized);
}

/**
 * Load the stored shopping list. If it's corrupted or doesn't exist, load
 * an empty list instead.
 */
function initialize() {
  const loadResult = load();
  let shoppingList: ShoppingListRecipe[];
  if (loadResult.success) {
    shoppingList = loadResult.data;
  } else {
    console.error("Invalid shopping list data. Resetting");
    shoppingList = [];
    save(shoppingList);
  }
  return shoppingList;
}

function reindex(list: ShoppingListRecipe[]): Record<string, number> {
  const index: Record<string, number> = {};
  for (let i = 0; i < list.length; i++) {
    index[list[i]!.id] = i;
  }
  return index;
}
