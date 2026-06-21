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

Workers can't run migrations themselves (no long-lived scripts), so they run
*before* the Worker is published.

- **In CI (normal path):** `.github/workflows/release.yml` runs `pnpm db:migrate`
  against the prod `DATABASE_URL` secret on every push to `main`, then deploys.
  No manual step needed.
- **Manually (initial schema / out-of-band):**

  ```bash
  # run from a local machine against the Neon DB directly
  DATABASE_URL=postgres://... pnpm db:migrate   # apply migration files
  ```

> **Use `db:migrate`, never `db:push`, on any DB the release workflow targets.**
> `db:push` creates tables directly and records nothing in the
> `drizzle.__drizzle_migrations` ledger, so a later `db:migrate` thinks nothing
> is applied, tries to run `0000` from scratch, and fails on the already-existing
> tables. `db:push` is for throwaway local iteration only.

## Redeploy after code changes

```bash
pnpm cf:deploy
```

## PR preview deploys (CI)

`.github/workflows/preview.yml` uploads a Worker *version* on every PR and
comments its `*.workers.dev` preview URL. `wrangler versions upload` does **not**
shift production traffic — it's a clickable build for eyeballing changes.

It runs only when both repo secrets are set (otherwise the job no-ops, like the
guarded deploys in `release.yml`):

```
CLOUDFLARE_API_TOKEN    # token with "Edit Workers" permission
CLOUDFLARE_ACCOUNT_ID   # Cloudflare account ID
```

The preview version uses the **production** bindings/secrets, including the prod
`DATABASE_URL`. So it's safe for frontend/logic PRs but not schema-changing ones
— those need per-branch DB isolation (Neon branching), tracked as Tier 2 in
`plans/sprint/retro.txt`.

## Redeploy after frontend-only changes

```bash
pnpm build:frontend
node -e "const fs=require('fs');fs.cpSync('apps/landing/dist','apps/api/public/landing',{recursive:true});fs.cpSync('apps/app/dist','apps/api/public/spa',{recursive:true});"
wrangler deploy
```
