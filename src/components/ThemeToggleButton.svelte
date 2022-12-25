<script lang="ts">
type Theme = "light" | "dark" | null;

const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

let theme = (() => {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("theme") as Theme;
  }
  if (prefersDark()) {
    return "dark";
  }
  return "light";
})();

const setTheme = (newTheme: Theme) => {
  if (newTheme !== null) {
    localStorage.setItem("theme", newTheme);
  } else {
    localStorage.removeItem("theme");
  }

  if (newTheme === "light") {
    document.documentElement.classList.remove("dark");
  } else if (theme === "dark" || prefersDark()) {
    document.documentElement.classList.add("dark");
  }

  theme = newTheme;
};

// system -> dark -> light
const cycleTheme = () => {
  if (theme === null) {
    setTheme("dark");
  } else if (theme === "dark") {
    setTheme("light");
  } else {
    setTheme(null);
  }
};
</script>

<button
  class="
    flex items-center justify-center mr-2 w-9 h-9 rounded-lg font-icon text-xl
    text-white
    md:bg-cozy-brown-600/70 hover:bg-cozy-brown-500/50 active:bg-cozy-brown-500/70
    dark:md:bg-cozy-brown-800 dark:hover:bg-cozy-brown-700/50 dark:active:bg-cozy-brown-700/70
  "
  on:click={cycleTheme}
>
  {#if theme === "dark"}
    <span title="Sötét téma">dark_mode</span>
  {:else if theme === "light"}
    <span title="Világos téma">light_mode</span>
  {:else}
    <span title="Rendszer téma">brightness_medium</span>
  {/if}
</button>
