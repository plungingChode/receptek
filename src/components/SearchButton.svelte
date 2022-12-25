<script lang="ts">
import SearchDialog from "./SearchDialog.svelte";
import Portal from "svelte-portal";

let dialogOpen = false;

const openDialog = () => (dialogOpen = true);
const closeDialog = () => (dialogOpen = false);
</script>

<button
  class="
    flex items-center ml-auto px-3 md:px-5 py-2 md:py-1 text-lg rounded-lg text-white
    md:bg-cozy-brown-600/70 hover:bg-cozy-brown-500/50 active:bg-cozy-brown-500/70
    dark:md:bg-cozy-brown-800 dark:hover:bg-cozy-brown-700/50 dark:active:bg-cozy-brown-700/70
  "
  title="Keresés"
  on:click={openDialog}
>
  <span class="hidden md:inline font-body mr-10 ">Keresés...</span>
  <span class="font-icon">search</span>
</button>

{#if dialogOpen}
  <Portal target="body">
    <SearchDialog on:close={closeDialog} />
  </Portal>
{/if}
