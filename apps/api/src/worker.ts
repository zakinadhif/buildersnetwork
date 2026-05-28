import { createWorkersAI, type WorkersAIBinding } from "@myapp/ai";
import { createAuth } from "@myapp/auth";
import { createDb, type Db } from "@myapp/db";
import { createWorkersEmail, type WorkersEmailBinding } from "@myapp/email";

import { createApp, type AppServices } from "./app";

// Cloudflare Workers environment bindings + secrets.
// Secrets (DATABASE_URL, BETTER_AUTH_SECRET, etc.) are set via `wrangler secret put`.
interface Env {
  // Workers Assets binding (configured in wrangler.toml)
  ASSETS: Fetcher;
  // Workers AI binding (configured in wrangler.toml)
  AI: WorkersAIBinding;
  // Cloudflare Email Service binding (configured in wrangler.toml)
  EMAIL: WorkersEmailBinding;
  // Vars / secrets
  APP_URL: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  ALLOWED_ORIGINS?: string;
  AI_WORKERS_MODEL?: string;
}

// Lazy singleton — initialized once per isolate, reused across requests.
let services: AppServices | null = null;

function getServices(env: Env): AppServices {
  if (services) return services;

  const db = createDb(env.DATABASE_URL, "neon-http") as unknown as Db;
  const auth = createAuth({
    db,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL ?? env.APP_URL,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
  });
  const ai = createWorkersAI(env.AI, env.AI_WORKERS_MODEL);
  const email = createWorkersEmail(env.EMAIL);

  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : [env.APP_URL];

  services = { db, auth, ai, email, allowedOrigins };
  return services;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Workers Assets serves exact static file matches before this handler runs.
    // For client-side routes under /app/ (no file extension), serve the SPA shell.
    if (
      url.pathname.startsWith("/app/") &&
      !url.pathname.match(/\.\w+$/)
    ) {
      return env.ASSETS.fetch(new Request(new URL("/app/index.html", url.origin), request));
    }

    return createApp(getServices(env)).fetch(request, env);
  },
} satisfies ExportedHandler<Env>;
