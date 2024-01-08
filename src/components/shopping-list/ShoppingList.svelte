<script lang="ts" context="module">
import type { Ingredient, MeasuredIngredient } from "~/types";
import { persistentShoppingList as shoppingList } from "./store";

import ShoppingListDefault from "./ShoppingListDefault.svelte";
import ShoppingListOverview from "./ShoppingListOverview.svelte";

// TODO finish overview mode (add delete functionality)
// TODO add ability to add arbitrary entries
// TODO add message when empty
</script>

<main class="max-w-lg mx-auto p-4">
  {#if $shoppingList.length === 0}
    <em>A bevásárlólista üres</em>
  {:else}
    <ShoppingListDefault store={shoppingList} />
    <!-- <ShoppingListOverview store={shoppingList} /> -->
  {/if}
</main>
