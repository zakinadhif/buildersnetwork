import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_DEV_TARGET || "http://127.0.0.1:8080";

  // `--mode mockups` produces a standalone static build of ONLY the mockup
  // gallery, served from the root of its own preview host (Cloudflare Pages,
  // see .github/workflows/preview-mockups.yml). It drops the SPA entry and the
  // "/app/" base prefix so assets resolve at the deploy root — the regular
  // build keeps mockups under /app/mockups.html alongside the app.
  const mockupsOnly = mode === "mockups";

  return {
    // Production builds are served under /app/* by the Hono container, so
    // assets and the Wouter base (import.meta.env.BASE_URL) must be prefixed.
    // Dev keeps "/" so the Vite server and e2e tests run at the root. The
    // standalone mockups build also uses "/" since it owns its whole host.
    base: command === "build" && !mockupsOnly ? "/app/" : "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: mockupsOnly ? "dist-mockups" : "dist",
      rollupOptions: {
        input: mockupsOnly
          ? {
              // Standalone gallery deploy — mockups.html only, at the root.
              mockups: path.resolve(__dirname, "mockups.html"),
            }
          : {
              // Main SPA entry.
              main: path.resolve(__dirname, "index.html"),
              // Standalone UI mockup gallery, shipped at /app/mockups.html so it
              // can be shared for review alongside the deployed app.
              mockups: path.resolve(__dirname, "mockups.html"),
            },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
