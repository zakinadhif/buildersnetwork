import type { Db } from "@myapp/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

interface AuthConfig {
  db?: Db;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_SECRET?: string;
}

/**
 * Creates a Better Auth instance.
 *
 * - Pass a full `config` at runtime (inside the Hono request handler).
 * - Omit `config` for CLI usage (e.g. `pnpm better-auth:generate`) — uses a
 *   mock drizzle adapter so the CLI can introspect the auth schema without
 *   needing a real database connection.
 */
function createAuth(config?: AuthConfig) {
  return betterAuth({
    // `||`, not `??`: a blank env var (`BETTER_AUTH_URL=`) is unset, and `??`
    // would pass "" straight through as the base URL. Falls back to APP_URL, the
    // origin the browser actually talks to — in dev that's the Vite server, which
    // proxies /api through to the API port.
    baseURL:
      config?.BETTER_AUTH_URL ||
      process.env.BETTER_AUTH_URL ||
      process.env.APP_URL ||
      "http://localhost:5173",
    secret: config?.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
    // biome-ignore lint/suspicious/noExplicitAny: empty object is a CLI-only placeholder; real db is always passed at runtime
    database: drizzleAdapter(config?.db ?? ({} as any), {
      provider: "sqlite",
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: config?.GOOGLE_CLIENT_ID
      ? {
          google: {
            enabled: true,
            clientId: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET ?? "",
          },
        }
      : {},
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
    },
    advanced: {
      // Cloudflare forwards the real client IP in CF-Connecting-IP. Without
      // this, Better Auth can't determine the client IP and skips rate limiting.
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },
  });
}

// Export for CLI schema generation (`pnpm better-auth:generate`)
export const auth = createAuth();

// Export for runtime usage inside the Hono server
export { createAuth };
