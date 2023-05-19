<script lang="ts">
import { persistentShoppingList as shoppingList } from "./store.js";
import { href } from "~/util.js";

function getCounterBadgeText(itemCount: number): string | undefined {
  if (itemCount === 0) {
    return undefined;
  } else if (itemCount <= 9) {
    return itemCount.toString();
  } else {
    return "*";
  }
}

$: counterBadgeText = getCounterBadgeText($shoppingList.length);

</script>

<a
  class="header-btn relative mr-2 w-9 h-9 rounded-lg font-body text-white"
  href={href("/bevasarlolista")}
>
  <span title="Bevásárlólista nézet" class="font-icon text-xl">shopping_cart</span>
  {#if counterBadgeText}
    <div class="
      text-sm text-center absolute -top-1 -right-1 w-4 h-4 rounded-full
      bg-cozy-red-800 dark:bg-cozy-red-500 leading-4
    ">{counterBadgeText}</div>
  {/if}
</a>
