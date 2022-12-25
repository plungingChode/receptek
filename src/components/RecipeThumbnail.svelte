<script lang="ts">
import { href } from "~/util.js";

export let title: string;
export let author: string | undefined = undefined;
export let slug: string;
export let ingredients: string;
</script>

<a
  class="
    h-52 py-3 border border-cozy-red-500/20 
    bg-cozy-beige-200 hover:bg-cozy-beige-100 focus-visible:bg-cozy-beige-100 
    text-cozy-beige-200 hover:text-cozy-beige-100 focus-visible:text-cozy-beige-100 shadow-md  
    shadow-cozy-brown-700/20 cursor-pointer 
    dark:border-cozy-red-800/20
    dark:bg-cozy-beige-900 dark:hover:bg-cozy-beige-800 dark:shadow-black
  "
  href={href(slug)}
>
  <h3
    class="
      ribbon relative w-10/12 p-1 pl-3 -ml-2 
      text-lg text-inherit font-bold truncate 
      bg-cozy-red-500 rounded-r-lg rounded-t-lg 
      shadow-sm shadow-cozy-red-500/75 
      dark:bg-cozy-red-700 dark:shadow-cozy-red-900/75
    "
  >
    <span class="ml-2">{title}</span>
  </h3>
  <p class="ml-3 mt-1 italic text-black dark:text-cozy-beige-200">
    {#if author}
      <strong>{author}</strong>
      <span> receptje</span>
    {:else}
      &nbsp;
    {/if}
  </p>
  <p class="m-3 max-4-lines text-black dark:text-cozy-beige-200">
    {ingredients}
  </p>
</a>

<style>
.max-4-lines {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
}

.ribbon {
  overflow: visible;
}

.ribbon::before {
  content: "";
  position: absolute;
  width: 0.5rem;
  left: 0;
  bottom: -5px;
  height: 5px;
  border-bottom-left-radius: 0.5rem;
  background-color: #603029;
}

:global(html.dark) .ribbon::before {
  background-color: rgb(62, 32, 27);
}

@media (prefers-color-scheme: dark) {
  .ribbon::before {
    background-color: rgb(52, 27, 22);
  }
}
</style>
