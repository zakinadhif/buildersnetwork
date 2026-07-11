import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Standalone static build of the mockup gallery. This app owns its whole deploy
// host (a Cloudflare Pages preview per mockup/design PR — see
// .github/workflows/preview-mockups.yml), so `base` stays the default "/" and
// assets resolve at the deploy root. No API/DB and no path aliases: screens
// import React plus the app's own src/{components,data,gallery,lib} by relative
// path.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});
