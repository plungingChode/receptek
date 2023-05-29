<script lang="ts" context="module">
import type { Ingredient, MeasuredIngredient } from "~/types";
import { persistentShoppingList as shoppingList } from "./store";

import ShoppingListDefault from "./ShoppingListDefault.svelte";
import ShoppingListOverview from "./ShoppingListOverview.svelte";
</script>

<main class="max-w-lg mx-auto p-4">
  <!-- <ShoppingListDefault store={shoppingList} /> -->
  <ShoppingListOverview store={shoppingList} />
</main>
