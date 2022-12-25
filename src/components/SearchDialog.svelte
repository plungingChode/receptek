<script lang="ts" context="module">
import { createEventDispatcher, onDestroy, onMount } from "svelte";
import { createFocusTrap, type FocusTrap } from "focus-trap";
import { deaccent, href } from "~/util.js";
import { debounce } from "lodash-es";
import fuzzysort from "fuzzysort";
import recipeIndex from "../data/recipe-index.json";

type PreparedRecipeIndex = typeof recipeIndex[number] & {
  prepared_search: Fuzzysort.Prepared;
  prepared_title: Fuzzysort.Prepared;
};

const EMPTY_RESULT_SET: Fuzzysort.KeysResults<PreparedRecipeIndex> = Object.assign([], {
  total: 0,
});

const preparedIndex: PreparedRecipeIndex[] = recipeIndex.map((i) => ({
  ...i,
  prepared_search: fuzzysort.prepare(i.ingredients_search),
  prepared_title: fuzzysort.prepare(i.title_search),
}));

const documentOverflow = {
  set: (overflow: string) => {
    document.documentElement.style.overflow = overflow;
  },
  get: () => {
    const cs = getComputedStyle(document.documentElement);
    return cs.overflow;
  },
};
</script>

<script lang="ts">
let container: HTMLDivElement;
let focusTrap: FocusTrap | null = null;
let originalOverflow: string = "auto auto";
let search: string = "";
let searchResult = EMPTY_RESULT_SET;

const dispatch = createEventDispatcher<{
  close: void;
}>();

const close = () => dispatch("close");

const closeOnContainerClicked = (e: Event) => {
  if (e.target === container) {
    close();
    e.preventDefault();
  }
};

const closeOnEscape = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    close();
    e.preventDefault();
  }
};

const onInputKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    sortDebounced.flush();
    e.preventDefault();
  }
};

const sortIndex = (search: string, index: typeof preparedIndex) => {
  if (!search) {
    searchResult = EMPTY_RESULT_SET;
    return;
  }

  const normalizedSearch = deaccent(search.trim().toLowerCase());

  const results = fuzzysort.go(normalizedSearch, index, {
    keys: ["prepared_title", "prepared_search"],
    limit: 20,
    threshold: -10_000,
  });

  searchResult = results;
};

const sortDebounced = debounce(sortIndex, 250, {
  leading: false,
  trailing: true,
});

$: sortDebounced(search, preparedIndex);

onMount(() => {
  focusTrap = createFocusTrap(container);
  focusTrap.activate();
  originalOverflow = documentOverflow.get();
  documentOverflow.set("hidden hidden");
  window.addEventListener("popstate", close);
});

onDestroy(() => {
  documentOverflow.set(originalOverflow);
  focusTrap?.deactivate();
  window.removeEventListener("popstate", close);
});
</script>

<div
  bind:this={container}
  class="
    fixed flex flex-col z-50 top-0 left-0 w-screen h-screen p-[2vh] sm:p-[10vh] 
    bg-cozy-brown-500/50 
    dark:bg-cozy-brown-900/50 
    backdrop-blur-sm
  "
  on:click={closeOnContainerClicked}
  on:keydown={closeOnEscape}
>
  <div
    class="
      flex flex-col w-full max-w-2xl mx-auto 
      bg-cozy-beige 
      dark:bg-cozy-beige-900 dark:text-cozy-beige-50
      rounded-lg shadow-md dark:shadow-black/50
      overflow-hidden
    "
  >
    <header class="px-4 border-b border-cozy-beige-300 dark:border-cozy-beige-800/70">
      <form class="flex items-center">
        <label for="search-box" class="mr-3 font-icon text-xl">
          search
        </label>
        <input
          type="text"
          id="search-box"
          placeholder="Keresés"
          autocomplete="off"
          enterkeyhint="search"
          bind:value={search}
          class="
            w-full h-14 bg-transparent outline-none 
            placeholder:text-cozy-beige-800/70 
            dark:placeholder:text-cozy-beige-200/80
          "
          on:keydown={onInputKeydown}
        />
      </form>
    </header>
    <div class="results flex flex-col gap-2 py-4 px-5 overflow-y-auto">
      {#if searchResult.length === 0}
        <p class="py-8 px-2 mx-auto">Nincs találat</p>
      {:else}
        {#each searchResult as result, i (result.obj.slug)}
          <a
            href={href(result.obj.slug)}
            class="
              flex flex-col w-full py-3 px-4 
              bg-cozy-beige-50/70 hover:bg-cozy-beige-500 hover:text-white
              focus-visible:bg-cozy-beige-500 focus-visible:text-white 
              dark:bg-cozy-beige-800/50 dark:hover:bg-cozy-beige-800 
              dark:focus-visible:bg-cozy-beige-800
              font-normal rounded-lg
            "
          >
            <span>
              {result.obj.title}
            </span>
            <span class="max-2-lines md:mr-5 font-light text-sm">
              {result.obj.ingredients}
            </span>
          </a>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
label[for="search-box"] {
  transform: rotateY(10deg);
}
.max-2-lines {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
