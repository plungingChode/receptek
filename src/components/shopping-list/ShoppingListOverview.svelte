<script lang="ts">
import ShoppingListOverviewItem from "./ShoppingListOverviewItem.svelte";
import type { PersistentShoppingList } from "./store.svelte";
import { type CombinedIngredient, intoOverview } from "./util";

let { store } = $props<{
  store: PersistentShoppingList;
}>();

const overview = $derived(intoOverview(store.recipes));

function setGroupMarked(group: CombinedIngredient, isMarked: boolean): void {
  const ingredients: [string, string][] = group.combinedFrom.map((x) => [x.recipeId, x.name]);
  store.setAllMarked(ingredients, isMarked);
}
</script>

{#each overview as ingredient (ingredient.name)}
  <ShoppingListOverviewItem {ingredient} setMarked={store.setMarked} {setGroupMarked} />
{/each}
