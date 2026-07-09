import { createWorkersAI, type WorkersAIBinding } from "@myapp/ai";
import { createAuth } from "@myapp/auth";
import type { Db } from "@myapp/db";
import * as schema from "@myapp/db/schema";
import {
  createResendEmail,
  createWorkersEmail,
  DEFAULT_EMAIL_FROM,
  type WorkersEmailBinding,
} from "@myapp/email";
import { createR2Storage } from "@myapp/storage";
import { drizzle } from "drizzle-orm/d1";

import { type AppServices, createApp } from "./app";

// Cloudflare Workers environment bindings + secrets.
// Secrets (BETTER_AUTH_SECRET, etc.) are set via `wrangler secret put`.
interface Env {
  // Workers Assets binding (configured in wrangler.toml)
  ASSETS: Fetcher;
  // Workers AI binding (configured in wrangler.toml)
  AI: WorkersAIBinding;
  // D1 database binding (configured in wrangler.toml as [[d1_databases]]).
  // Replaces the old DATABASE_URL secret — there is no connection string.
  DB: D1Database;
  // Cloudflare Email Service binding (configured in wrangler.toml) — default sender.
  EMAIL: WorkersEmailBinding;
  // Vars / secrets
  APP_URL: string;
  BETTER_AUTH_SECRET: string;
  // Optional: set via `wrangler secret put RESEND_API_KEY` to send via Resend
  // instead of the Cloudflare Email Service binding.
  RESEND_API_KEY?: string;
  // Optional sender override (var in wrangler.toml); defaults to DEFAULT_EMAIL_FROM.
  EMAIL_FROM?: string;
  BETTER_AUTH_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  ALLOWED_ORIGINS?: string;
  ADMIN_EMAILS?: string;
  AI_WORKERS_MODEL?: string;
  // R2 bucket binding for uploads (karya covers). Configured in wrangler.toml as
  // an [[r2_buckets]] entry. Optional — absent → the upload/serve routes 503.
  UPLOADS?: R2Bucket;
}

// Lazy singleton — initialized once per isolate, reused across requests.
let services: AppServices | null = null;

function getServices(env: Env): AppServices {
  if (services) return services;

  // D1 speaks the same SQLite dialect as the libSQL client `createDb` builds for
  // Node, and exposes `batch()` too — so `atomicWrite` and every query work
  // unchanged. The cast bridges the two drivers' nominally distinct types.
  const db = drizzle(env.DB, { schema }) as unknown as Db;
  const auth = createAuth({
    db,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL ?? env.APP_URL,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
  });
  const ai = createWorkersAI(env.AI, env.AI_WORKERS_MODEL);
  // Default to the Cloudflare Email Service binding; switch to Resend when a
  // RESEND_API_KEY secret is present.
  const email = env.RESEND_API_KEY
    ? createResendEmail({ apiKey: env.RESEND_API_KEY })
    : createWorkersEmail(env.EMAIL);

  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",")
        .map((o) => o.trim())
        .filter(Boolean)
    : [env.APP_URL];

  const adminEmails = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const emailFrom = env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;

  // Only build the storage adapter when the R2 binding is present; deploys
  // without it run fine and the cover upload/serve routes 503 until it's set.
  const storage = env.UPLOADS ? createR2Storage(env.UPLOADS) : undefined;

  services = {
    db,
    auth,
    ai,
    email,
    emailFrom,
    allowedOrigins,
    adminEmails,
    storage,
  };
  return services;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Workers Assets serves exact static file matches before this handler runs.
    // For client-side routes under /app/ (no file extension), serve the SPA shell.
    if (url.pathname.startsWith("/app/") && !url.pathname.match(/\.\w+$/)) {
      return env.ASSETS.fetch(
        new Request(new URL("/app/index.html", url.origin), request),
      );
    }

    return createApp(getServices(env)).fetch(request, env);
  },
} satisfies ExportedHandler<Env>;
