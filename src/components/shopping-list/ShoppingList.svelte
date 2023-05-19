<script lang="ts" context="module">
import type { Ingredient, MeasuredIngredient } from "~/types.js";
import type { ShoppingListEntry } from "./store.js";
import { persistentShoppingList as shoppingList } from "./store.js";

function isMeasuredIngredient(i: Ingredient): i is MeasuredIngredient {
  return "qty" in i;
}
</script>

<script lang="ts">
import { href } from "~/util.js";

// TODO replace with custom modal
function deleteWithConfirm(item: ShoppingListEntry): void {
  if (window.confirm("Biztosan törlöd a bevásárlólistáról?")) {
    shoppingList.remove(item.id);
  }
}
</script>

<main class="max-w-lg mx-auto p-4">
  {#each $shoppingList as item, idx (item.id)}
    <div class="flex items-center" class:mt-6={idx !== 0}>
      <a class="flex-shrink truncate" href={href("/recept/" + item.id)}>
        <h2
          id={item.id}
          class="flex pb-2 bg-cozy-beight-300/75 dark:bg-cozy-brown-900 font-bold text-lg"
        >
          {item.recipeName}
        </h2>
      </a>
      <button class="ml-auto mb-1.5 font-icon text-xl" on:click={() => deleteWithConfirm(item)}>
        close
      </button>
    </div>
    {#each item.ingredients as i (i.name)}
      <label class="ingredient flex px-4 py-2 mb-2" class:marked={i.marked}>
        <input
          type="checkbox"
          checked={i.marked}
          on:click={() => shoppingList.setMarked(item.id, i.name, !i.marked)}
          class="sr-only"
        />
        <span class="font-icon mr-2">
          {i.marked ? "check_circle" : "radio_button_unchecked"}
        </span>
        <div class="ingredient-description flex flex-grow">
          <span>{i.name}</span>
          <span class="ml-auto">
            {#if isMeasuredIngredient(i)}
              {i.qty}
              {i.unit}
            {/if}
          </span>
        </div>
      </label>
    {/each}
  {/each}
</main>

<style>
.ingredient {
  cursor: pointer;
  border-radius: theme("borderRadius.lg");
  border-width: theme("borderWidth.DEFAULT");
  border-color: transparent;
  background-color: theme("colors.cozy-brown.600");
  color: white;
}
:global(.dark) .ingredient {
  background-color: theme("colors.cozy-brown.600/0.7");
}
.ingredient:hover {
  background-color: theme("colors.cozy-brown.600/0.9");
}
:global(.dark) .ingredient:hover {
  background-color: theme("colors.cozy-brown.500/0.5");
}
.ingredient.marked {
  color: inherit;
  opacity: 0.5;
  border-color: theme("colors.cozy-brown.600/0.7");
  background-color: transparent;
}
:global(.dark) .marked {
  border-color: theme("colors.cozy-brown.600/0.7");
}
.ingredient.marked:hover {
  background-color: theme("colors.cozy-brown.500/0.2");
}
:global(.dark) .ingredient.marked:hover {
  background-color: theme("colors.cozy-brown.500/0.2");
}
.ingredient-description {
  position: relative;
}
</style>
