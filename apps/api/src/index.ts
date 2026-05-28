import "dotenv/config";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createAnthropicAI } from "@myapp/ai";
import { createAuth } from "@myapp/auth";
import { loadConfig } from "@myapp/config";
import { createDb } from "@myapp/db";
import { createNoopEmail, createResendEmail, createRestEmail } from "@myapp/email";

import { createApp } from "./app";

const config = loadConfig();

const db = createDb(config.DATABASE_URL);
const auth = createAuth({
  db,
  GOOGLE_CLIENT_ID: config.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: config.GOOGLE_CLIENT_SECRET,
  BETTER_AUTH_URL: config.BETTER_AUTH_URL ?? config.APP_URL,
  BETTER_AUTH_SECRET: config.BETTER_AUTH_SECRET,
});
const ai = createAnthropicAI(config.ANTHROPIC_API_KEY ?? "");

const email = config.RESEND_API_KEY
  ? createResendEmail({ apiKey: config.RESEND_API_KEY })
  : config.CF_EMAIL_ACCOUNT_ID && config.CF_EMAIL_API_TOKEN
    ? createRestEmail({ accountId: config.CF_EMAIL_ACCOUNT_ID, apiToken: config.CF_EMAIL_API_TOKEN })
    : createNoopEmail();

const allowedOrigins = config.ALLOWED_ORIGINS
  ? config.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [config.APP_URL];

const app = createApp({
  db,
  auth,
  ai,
  email,
  allowedOrigins,
  gitSha: process.env.GIT_SHA,
});

// In single-container mode (SERVE_STATIC=true or unset) the Node server also
// serves the frontend bundles. In 3-tier EC2 mode set SERVE_STATIC=false so
// only the API runs here and a dedicated nginx VM handles static assets.
const serveStatics = process.env.SERVE_STATIC !== "false";
if (serveStatics) {
  app.use(
    "/app/*",
    serveStatic({
      root: "./public/spa",
      rewriteRequestPath: (p) => p.replace(/^\/app/, ""),
    }),
  );
  app.get("/app/*", serveStatic({ path: "./public/spa/index.html" }));
  app.use("/*", serveStatic({ root: "./public/landing" }));
}

serve({ fetch: app.fetch, port: config.PORT }, () => {
  console.log(`🚀 Server ready at http://localhost:${config.PORT}`);
});

export default app;
