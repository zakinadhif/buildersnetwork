import { defineConfig } from "vitest/config";

// Unit tests only (pure logic under src/). The Playwright suite under e2e/ is
// run separately via `pnpm test:e2e` and must not be picked up by Vitest.
export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    environment: "node",
  },
});
