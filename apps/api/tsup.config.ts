import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/scripts/migrate.ts", "src/scripts/seed.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  clean: true,
  sourcemap: true,
  // Bundle workspace dependencies so we don't have to publish them
  noExternal: [
    "@myapp/ai",
    "@myapp/auth",
    "@myapp/email",
    "@myapp/config",
    "@myapp/db",
    "@myapp/api-zod",
    "@myapp/storage",
  ],
  // Keep AI SDKs external — their transitive CJS deps use dynamic require()
  // which breaks when bundled into ESM. They're direct deps of api so pnpm deploy includes them.
  external: ["@google/genai", "@anthropic-ai/sdk"],
});
