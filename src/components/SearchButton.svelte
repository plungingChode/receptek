<script lang="ts">
import SearchDialog from "./SearchDialog.svelte";
import Portal from "svelte-portal";

let dialogOpen = false;

const openDialog = () => (dialogOpen = true);
const closeDialog = () => (dialogOpen = false);
</script>

<button
  class="header-btn ml-auto px-3 md:px-5 py-2 md:py-1 text-lg text-white"
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
