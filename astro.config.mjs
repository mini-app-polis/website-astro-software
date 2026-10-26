import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import requireEnv from "./integrations/require-env.mjs";

export default defineConfig({
  // The canonical origin. Canonical and Open Graph URLs are built from
  // Astro.site, so they name this domain whichever URL served the build.
  site: "https://software.kaianolevine.com",
  // No adapter. Every page in this site prerenders — there is no
  // `prerender = false`, no API route, no astro:assets Image and no
  // session use — so the build is plain static HTML and an adapter
  // does nothing except split the output into dist/client and
  // dist/server, which is what broke the Pages deploy.
  //
  // Dropping it also removes @astrojs/cloudflare, whose /_image SSRF
  // was one of the advisories this upgrade set out to clear.
  output: "static",
  integrations: [requireEnv(["PUBLIC_API_URL", "PUBLIC_TURNSTILE_SITE_KEY"])],
  vite: { plugins: [tailwindcss()] },
});
