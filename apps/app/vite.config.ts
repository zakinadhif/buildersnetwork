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

  // Rollup entry points. Typed as Record<string, string> so both branches share
  // one declared type — otherwise TS widens the mockups-only arm to
  // `{ mockups: string; main?: undefined }`, which is not a valid Rollup `input`
  // (TS2769). The regular build ships the main SPA entry alongside the standalone
  // mockup gallery (served at /app/mockups.html for review); the mockups-only
  // build drops the SPA and serves the gallery at the deploy root.
  const input: Record<string, string> = mockupsOnly
    ? { mockups: path.resolve(__dirname, "mockups.html") }
    : {
        main: path.resolve(__dirname, "index.html"),
        mockups: path.resolve(__dirname, "mockups.html"),
      };

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
      rollupOptions: { input },
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
