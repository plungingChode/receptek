<script lang="ts">
type Theme = "light" | "dark" | null;

let theme = getTheme();

function prefersDark(): boolean {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

function getTheme(): Theme | null {
  if (typeof localStorage !== "undefined") {
    const theme = localStorage.getItem("theme") as Theme | null;
    if (theme) {
      return theme;
    }
  }
  if (prefersDark()) {
    return "dark";
  }
  return "light";
}

const setTheme = (newTheme: Theme) => {
  if (newTheme !== null) {
    localStorage.setItem("theme", newTheme);
  } else {
    localStorage.removeItem("theme");
  }

  if (newTheme === "light") {
    document.documentElement.classList.remove("dark");
  } else if (newTheme === "dark" || prefersDark()) {
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
  class="header-btn mr-2 w-9 h-9 font-icon text-xl text-white"
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
