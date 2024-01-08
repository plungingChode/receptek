import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://plungingchode.github.io",
  base: "/receptek",

  server: {
    port: 3000,
  },
  markdown: {
    syntaxHighlight: false
  },
  integrations: [svelte(), tailwind()],
});
