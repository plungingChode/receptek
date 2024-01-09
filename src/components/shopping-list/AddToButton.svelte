<script lang="ts" context="module">
import type { Ingredient } from "~/types";
import { type Ingredients, isIngredientList, isIngredientGroups } from "~/ingredients";
import { type ShoppingListIngredient, persistentShoppingList } from "./store.svelte";

function toShoppingListIngredient(i: Ingredient): ShoppingListIngredient {
  return { ...i, marked: false };
}

function flattenIngredients(i: Ingredients): ShoppingListIngredient[] {
  if (isIngredientList(i)) {
    return i.list.map(toShoppingListIngredient);
  } else if (isIngredientGroups(i)) {
    return i.groups.flatMap((g) => g.ingredients.map(toShoppingListIngredient));
  } else {
    throw new Error("unknown ingredients variant");
  }
}
</script>

<script lang="ts">
let { recipeName, ingredients, slug } = $props<{
  recipeName: string;
  ingredients: Ingredients;
  slug: string;
}>();

function addCurrent() {
  persistentShoppingList.add({
    id: slug,
    name: recipeName,
    ingredients: flattenIngredients(ingredients),
    count: 1,
  });
}
</script>

<button
  class="
    btn mt-2 h-9 px-2 text-white text-base font-normal
    dark:hover:bg-cozy-brown-700/80
  "
  title="Hozzávalók hozzáadása a bevásárlólistára"
  on:click={addCurrent}
>
  <span class="font-icon text-xl mr-1">shopping_cart</span>
  Bevásárlólistára
</button>
