<script lang="ts">
import type { ShoppingListRecipe, PersistentShoppingList, ShoppingListIngredient } from "./store.svelte";
import { href } from "~/util";
import ShoppingListDefaultItem from "./ShoppingListDefaultItem.svelte";

let { store } = $props<{ store: PersistentShoppingList }>();

// TODO replace with custom modal
function deleteWithConfirm(item: ShoppingListRecipe): void {
  if (window.confirm("Biztosan törlöd a bevásárlólistáról?")) {
    store.remove(item.id);
  }
}

function toggleMarked(recipe: ShoppingListRecipe, ingredient: ShoppingListIngredient): void {
  store.setMarked(recipe.id, ingredient.name, !ingredient.marked);
}
</script>

<main class="max-w-lg mx-auto p-4">
  {#each store.recipes as recipe, idx (recipe.id)}
    <div class="flex items-center" class:mt-6={idx !== 0}>
      <a class="flex-shrink truncate" href={href("/recept/" + recipe.id)}>
        <h2
          id={recipe.id}
          class="flex pb-2 bg-cozy-beight-300/75 dark:bg-cozy-brown-900 font-bold text-lg"
        >
          {recipe.name}
        </h2>
      </a>
      <button class="ml-auto mb-1.5 font-icon text-xl" on:click={() => deleteWithConfirm(recipe)}>
        close
      </button>
    </div>
    {#each recipe.ingredients as ingredient (ingredient.name)}
      <ShoppingListDefaultItem {recipe} {ingredient} {toggleMarked} />
    {/each}
  {/each}
</main>

<style>
main :global(.ingredient) {
  cursor: pointer;
  border-radius: theme("borderRadius.lg");
  border-width: theme("borderWidth.DEFAULT");
  border-color: transparent;
  background-color: theme("colors.cozy-brown.600");
  color: white;
}
main :global(.dark .ingredient) {
  background-color: theme("colors.cozy-brown.600/0.7");
}
main :global(.ingredient:hover) {
  background-color: theme("colors.cozy-brown.600/0.9");
}
main :global(.dark .ingredient:hover) {
  background-color: theme("colors.cozy-brown.500/0.5");
}
main :global(.ingredient.marked) {
  color: inherit;
  opacity: 0.5;
  border-color: theme("colors.cozy-brown.600/0.7");
  background-color: transparent;
}
main :global(.dark .marked) {
  border-color: theme("colors.cozy-brown.600/0.7");
}
main :global(.ingredient.marked:hover) {
  background-color: theme("colors.cozy-brown.500/0.2");
}
main :global(.dark .ingredient.marked:hover) {
  background-color: theme("colors.cozy-brown.500/0.2");
}
main :global(.ingredient-description) {
  position: relative;
}
</style>
