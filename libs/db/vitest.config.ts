import { defineConfig } from "vitest/config";

// Pure-logic unit tests under src/ (e.g. interest-name normalization). These
// must not touch a database.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
