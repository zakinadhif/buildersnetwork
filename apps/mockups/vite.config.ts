import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Standalone static build of the mockup gallery. This app owns its whole deploy
// host (a Cloudflare Pages preview per mockup/design PR — see
// .github/workflows/preview-mockups.yml), so `base` stays the default "/" and
// assets resolve at the deploy root. No API/DB, no path aliases: each mockup is
// self-contained and imports only `react` and `./images`.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});
