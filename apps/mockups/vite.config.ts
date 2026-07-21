import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Standalone static build of the mockup gallery. This app owns its whole deploy
// host (a Cloudflare Pages preview per mockup/design PR — see
// .github/workflows/preview-mockups.yml), so `base` stays the default "/" and
// assets resolve at the deploy root. No API/DB and no path aliases: screens
// import React plus the app's own src/{components,data,gallery} by relative
// path, and the design tokens from @myapp/design-tokens.
//
// Tailwind is here for the `@theme` block in the shared tokens, not because the
// screens are written in utilities — they aren't. See src/index.css.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: "dist",
  },
});
