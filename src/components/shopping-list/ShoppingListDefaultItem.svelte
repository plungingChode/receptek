<script lang="ts">
import type { ShoppingListRecipe, ShoppingListIngredient } from "./store";
import { isMeasuredIngredient } from "./util";

export let toggleMarked: (recipe: ShoppingListRecipe, ingredient: ShoppingListIngredient) => void;
export let recipe: ShoppingListRecipe;
export let ingredient: ShoppingListIngredient;
</script>

<label class="ingredient flex px-4 py-2 mb-2" class:marked={ingredient.marked}>
  <input
    type="checkbox"
    checked={ingredient.marked}
    on:click={() => toggleMarked(recipe, ingredient)}
    class="sr-only"
  />
  <span class="font-icon mr-2">
    {ingredient.marked ? "check_box" : "check_box_outline_blank"}
  </span>
  <div class="flex flex-grow">
    <span>{ingredient.name}</span>
    <span class="ml-auto">
      {#if isMeasuredIngredient(ingredient)}
        {ingredient.qty}
        {ingredient.unit}
      {/if}
    </span>
  </div>
</label>
