import { createWorkersAI, type WorkersAIBinding } from "@myapp/ai";
import { createAuth } from "@myapp/auth";
import type { Db } from "@myapp/db";
import * as schema from "@myapp/db/schema";
import { DEFAULT_EMAIL_FROM, type WorkersEmailBinding } from "@myapp/email";
import { createR2Storage } from "@myapp/storage/r2";
import { drizzle } from "drizzle-orm/d1";
import { createWorkersAI as createWorkersAIProvider } from "workers-ai-provider";

import { type AppServices, createApp } from "./app";
import { selectEmail } from "./lib/email";
import {
  createAppFeatureFlagProvider,
  parseFeatureFlagBoolean,
  parseFeatureFlagProviderKind,
} from "./lib/feature-flags";
import { withWorkersAIStreamCompatibility } from "./lib/workers-ai-model";

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
  // Optional — absent (and no RESEND_API_KEY) → email is suppressed, not sent.
  // Preview environments omit the [[send_email]] entry to disable delivery.
  EMAIL?: WorkersEmailBinding;
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
  FEATURE_FLAG_PROVIDER?: string;
  FEATURE_AI_ASSISTANT?: string;
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
  const assistantModel = createWorkersAIProvider({
    binding: withWorkersAIStreamCompatibility(
      env.AI as NonNullable<
        Parameters<typeof createWorkersAIProvider>[0]["binding"]
      >,
    ),
  })(env.AI_WORKERS_MODEL ?? "@cf/meta/llama-4-scout-17b-16e-instruct");
  const email = selectEmail(env);

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
  const featureFlags = createAppFeatureFlagProvider({
    kind: parseFeatureFlagProviderKind(env.FEATURE_FLAG_PROVIDER),
    db,
    aiAssistant: parseFeatureFlagBoolean(env.FEATURE_AI_ASSISTANT),
  });

  services = {
    db,
    auth,
    ai,
    assistantModel,
    email,
    emailFrom,
    allowedOrigins,
    adminEmails,
    storage,
    featureFlags,
  };
  return services;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // `run_worker_first` (wrangler.toml) routes all of /app/* through here
    // except /app/assets/* — including real files like /app/index.html, not
    // just extensionless SPA routes. Serve the exact match first (index.html,
    // favicon, ...); anything else means it's a client-side route (/app/minat,
    // /app/karya/:id, ...), so fall back to the SPA shell.
    //
    // Checking for `.ok`, not `status !== 404`: the ASSETS binding applies the
    // same auto-trailing-slash html_handling as Cloudflare's edge router, so a
    // miss on an extensionless path comes back as a 307 (e.g. to /app/), not a
    // 404 — forwarding that verbatim would reproduce the exact redirect this
    // fallback exists to avoid.
    if (url.pathname.startsWith("/app/")) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.ok) return assetResponse;

      // Only a miss on an EXTENSIONLESS path is a client-side SPA route.
      // A miss on a path with an extension (/app/favicon.ico, /app/foo.js,
      // a stale/broken asset reference, ...) is a genuine missing file —
      // masking it as a 200 HTML shell would hide broken asset URLs and
      // confuse caching (a browser expecting an image getting HTML back).
      if (url.pathname.match(/\.\w+$/)) return assetResponse;

      // The fallback target is "/app/" (trailing slash), NOT
      // "/app/index.html": requesting the literal index.html filename
      // undergoes the SAME auto-trailing-slash normalization and itself
      // 307s to "/app/" — fetching the already-canonical folder URL is
      // what actually returns 200.
      return env.ASSETS.fetch(
        new Request(new URL("/app/", url.origin), request),
      );
    }

    return createApp(getServices(env)).fetch(request, env);
  },
} satisfies ExportedHandler<Env>;
