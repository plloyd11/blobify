import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), tailwind()],
  output: "server",
  adapter: netlify()
});