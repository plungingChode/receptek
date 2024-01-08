<script lang="ts" context="module">
import type { ShoppingListRecipe, ShoppingListIngredient } from "./store";
import { CombinedIngredient, IngredientWithSource, isMeasuredIngredient } from "./util";
</script>

<script lang="ts">
export let setMarked: (recipeId: string, ingredientName: string, isMarked: boolean) => void;
export let setGroupMarked: (group: CombinedIngredient, isMarked: boolean) => void;

import { href } from "~/util";

export let ingredient: CombinedIngredient;

let isExpanded = false;

$: allMarked = ingredient.marked === ingredient.combinedFrom.length;
$: noneMarked = ingredient.marked === 0;

function onIngredientCheckClick(ingredient: IngredientWithSource): () => void {
  return () => {
    setMarked(ingredient.recipeId, ingredient.name, !ingredient.marked);
  };
}

function toggleGroupMarked() {
  const newMarked = allMarked ? false : true;
  setGroupMarked(ingredient, newMarked);
}
</script>

<div class="ingredient2 mb-2" class:marked={allMarked} class:expanded={isExpanded}>
  <label class="header check py-2 font-icon">
    <input
      id={ingredient.name}
      type="checkbox"
      checked={allMarked}
      indeterminate={!allMarked && !noneMarked}
      on:click={toggleGroupMarked}
      class="sr-only"
    />
    {#if allMarked}
      check_box
    {:else if noneMarked}
      check_box_outline_blank
    {:else}
      indeterminate_check_box
    {/if}
  </label>
  <label for={ingredient.name} class="header title py-2">
    {ingredient.name}
  </label>
  {#if isMeasuredIngredient(ingredient)}
    <label for={ingredient.name} class="header qty py-2">
      {ingredient.qty}
      {ingredient.unit}
    </label>
  {/if}
  <button
    class="expand-button ml-2 w-10 h-10 font-icon rounded-full"
    on:click={() => (isExpanded = !isExpanded)}
  >
    {isExpanded ? "expand_less" : "expand_more"}
  </button>
  {#if isExpanded}
    {#each ingredient.combinedFrom as source, i (source.recipeName)}
      <label class="check font-icon" style="grid-row: {i + 2};">
        <input
          type="checkbox"
          checked={source.marked}
          on:click={onIngredientCheckClick(source)}
          class="sr-only"
        />
        {source.marked ? "check_box" : "check_box_outline_blank"}
      </label>
      <span class="title flex items-center" style="grid-row: {i + 2};">
        <a href={href("/recept/" + source.recipeId)} class="hover:underline">
          {source.recipeName}
        </a>
        {#if isMeasuredIngredient(source)}
          <hr class="flex-grow ml-2 mt-1" />
        {/if}
      </span>
      {#if isMeasuredIngredient(source)}
        <span class="qty flex items-center" style="grid-row: {i + 2};">
          <hr class="flex-grow mt-1 mr-2" />
          {source.qty}
          {source.unit}
        </span>
      {/if}
    {/each}
  {/if}
</div>

<style>
.ingredient2 {
  display: grid;
  align-items: center;
  grid-template-areas: "check title qty button";
  grid-template-columns: 2rem 2fr 1fr 3rem;

  border-radius: theme("borderRadius.lg");
  border-width: theme("borderWidth.DEFAULT");
  border-color: transparent;
  background-color: theme("colors.cozy-brown.600");
  color: white;
}

hr {
  border-color: currentColor;
  opacity: 0.5;
}

.ingredient2.hovered {
  background-color: theme("colors.cozy-brown.500/0.5");
}

.ingredient2.marked {
  color: inherit;
  opacity: 0.3;
  border-color: theme("colors.cozy-brown.600/0.7");
  background-color: transparent;
}

:global(.dark) .ingredient2.marked {
  border-color: theme("colors.cozy-brown.600/0.7");
}

.ingredient2.expanded > .header {
  font-weight: bold;
}

.ingredient2.expanded {
  padding-bottom: theme("spacing.2");
}

.ingredient2 > label {
  cursor: pointer;
}

.ingredient2 .check {
  grid-area: check;
  text-align: center;
  /* background-color: green; */
}
.ingredient2 .title {
  grid-area: title;
  /* background-color: red; */
}
.ingredient2 .qty {
  grid-area: qty;
  text-align: end;
  /* background-color: blue; */
}
.ingredient2 .expand-button {
  grid-area: button;
  /* background-color: yellow; */
}
</style>
