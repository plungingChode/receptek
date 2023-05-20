import "@total-typescript/ts-reset";
import type { Ingredient } from "~/types";
import { writable } from "svelte/store";
import { z } from "zod";
import { INDEX_NOT_FOUND, __SERVER__ } from "~/consts";

export type ShoppingListIngredient = Ingredient & {
  /** Whether this ingredient is marked as collected/bought. */
  marked: boolean;
};

export type ShoppingListEntry = {
  /**
   * A unique ID for a particular recipe (usually the page slug).
   */
  id: string;
  /** The recipe name */
  recipeName: string;
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
const shoppingListEntrySchema: z.ZodType<ShoppingListEntry> = z.object({
  id: z.string(),
  recipeName: z.string(),
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
const shoppingListSchema: z.ZodType<ShoppingListEntry[]> = z.array(shoppingListEntrySchema);

/**
 * A shopping list loaded from and saved to persistent storage.
 */
export const persistentShoppingList = (() => {
  const shoppingList = initialize();
  const w = writable<ShoppingListEntry[]>(shoppingList);

  return {
    subscribe: w.subscribe,
    /**
     * Add a new entry to the shopping list. If one with the same `id` already
     * exists, increment its count instead.
     */
    add: (newEntry: ShoppingListEntry) =>
      w.update((list) => {
        const idx = list.findIndex((e) => e.id === newEntry.id);
        if (idx === INDEX_NOT_FOUND) {
          list.push(newEntry);
        } else {
          list[idx]!.count += newEntry.count;
        }
        save(list);
        return list;
      }),

    /**
     * Remove an entry from the shopping list by its `id`.
     */
    remove: (id: string) =>
      w.update((list) => {
        const idx = list.findIndex((e) => e.id === id);
        if (idx !== INDEX_NOT_FOUND) {
          list.splice(idx, 1);
        }
        save(list);
        return list;
      }),

    setMarked: (itemId: string, ingredientName: string, isMarked: boolean) =>
      w.update((list) => {
        const idx = list.findIndex((e) => e.id === itemId);
        if (idx === INDEX_NOT_FOUND) {
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
  };
})();

/**
 * Load the stored shopping list from persistent storage (in this case,
 * `localStorage`).
 */
function load(): z.SafeParseReturnType<unknown, ShoppingListEntry[]> {
  if (__SERVER__) {
    return { success: true, data: [] };
  }
  const stored = window.localStorage.getItem(SHOPPING_LIST_KEY) ?? "[]";
  return shoppingListSchema.safeParse(JSON.parse(stored));
}

/**
 * Serialize and write a shopping list to persistent storage.
 */
function save(l: ShoppingListEntry[]) {
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
  let shoppingList: ShoppingListEntry[];
  if (loadResult.success) {
    shoppingList = loadResult.data;
  } else {
    console.error("Invalid shopping list data. Resetting");
    shoppingList = [];
    save(shoppingList);
  }
  return shoppingList;
}
