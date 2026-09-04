import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  // Astro 5 removed `output: "hybrid"`. "static" with an adapter is its
  // exact replacement: pages prerender by default and opt into SSR with
  // `export const prerender = false`. No page in this site opts in, so
  // the built output is unchanged.
  output: "static",
  adapter: cloudflare(),
  // @astrojs/tailwind is abandoned — 6.0.2 is its last release and it
  // peers on astro ^3 || ^4 || ^5, so it cannot follow astro past 5.
  // Tailwind ships its own Vite plugin now, which is the supported path.
  vite: { plugins: [tailwindcss()] },
});
