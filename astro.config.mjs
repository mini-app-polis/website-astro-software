import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  // No adapter. Every page in this site prerenders — there is no
  // `prerender = false`, no API route, no astro:assets Image and no
  // session use — so the build is plain static HTML and an adapter
  // does nothing except split the output into dist/client and
  // dist/server, which is what broke the Pages deploy.
  //
  // Dropping it also removes @astrojs/cloudflare, whose /_image SSRF
  // was one of the advisories this upgrade set out to clear.
  output: "static",
  vite: { plugins: [tailwindcss()] },
});
