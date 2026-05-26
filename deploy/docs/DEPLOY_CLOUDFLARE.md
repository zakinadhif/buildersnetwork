# Deploy to Cloudflare Workers

Single Worker that serves the API and all static assets (SPA + landing).
Free Workers AI replaces the Anthropic API for AI inference.

## Prerequisites

- Cloudflare account
- `wrangler` (installed as a devDep: `pnpm --filter api exec wrangler`)
- A Neon Postgres database (free tier works) for `DATABASE_URL`

## 1. Authenticate Wrangler

```bash
wrangler login
```

## 2. Set secrets

```bash
wrangler secret put DATABASE_URL        # postgres://... (Neon connection string)
wrangler secret put BETTER_AUTH_SECRET  # random 32+ char string
wrangler secret put APP_URL             # https://yourapp.workers.dev
# Optional:
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put ALLOWED_ORIGINS     # comma-separated if needed
```

## 3. Build and deploy

```bash
pnpm cf:deploy
```

This runs:
1. `pnpm codegen` — regenerate API client
2. `pnpm --filter landing build` — Astro landing
3. `pnpm --filter app build` — React SPA
4. `pnpm --filter api build` — (unused at runtime, but validates the build)
5. Copies `apps/landing/dist` and `apps/app/dist` into `apps/api/public/`
6. `wrangler deploy` — uploads the Worker + static assets

## How it works

- Workers Assets binding serves `/` (landing) and `/app/*` (SPA) directly from Cloudflare's CDN.
- The Worker's `fetch` handler only runs for `/api/*` and `/healthz`.
- `AI_PROVIDER` defaults to `workers-ai` via the `AI` binding configured in `wrangler.toml`.
- Database uses the Neon HTTP driver (no TCP sockets — compatible with Workers).

## Run database migrations

Migrations must be run separately (Workers can't run long-lived scripts):

```bash
# Option A: run from local machine against Neon DB directly
DATABASE_URL=postgres://... pnpm db:push   # for initial schema

# Option B: use Neon dashboard or psql
```

## Redeploy after code changes

```bash
pnpm cf:deploy
```

## Redeploy after frontend-only changes

```bash
pnpm build:frontend
node -e "const fs=require('fs');fs.cpSync('apps/landing/dist','apps/api/public/landing',{recursive:true});fs.cpSync('apps/app/dist','apps/api/public/spa',{recursive:true});"
wrangler deploy
```
