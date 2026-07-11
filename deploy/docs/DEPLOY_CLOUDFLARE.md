# Deploy to Cloudflare Workers

Single Worker that serves the API and all static assets (SPA + landing).
Free Workers AI replaces the Anthropic API for AI inference.

## Prerequisites

- Cloudflare account
- `wrangler` (installed as a devDep: `pnpm --filter api exec wrangler`)

The database is a **D1** binding, not a connection string — there is no
`DATABASE_URL` secret on the Worker.

## 1. Authenticate Wrangler

```bash
wrangler login
```

## 2. Create the D1 database

```bash
wrangler d1 create buildersnetwork
```

Paste the returned `database_id` into the `[[d1_databases]]` block in
`wrangler.toml` (replacing `REPLACE_WITH_D1_DATABASE_ID`). This is a one-time
step per Cloudflare account.

## 3. Set secrets

```bash
wrangler secret put BETTER_AUTH_SECRET  # random 32+ char string
wrangler secret put APP_URL             # https://yourapp.workers.dev
# Optional:
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put ALLOWED_ORIGINS     # comma-separated if needed
wrangler secret put RESEND_API_KEY      # the live email sender (Resend) — [[send_email]] needs Workers Paid
```

There is no `DATABASE_URL` secret — the Worker reaches the database through the
D1 binding (`env.DB`) declared in `wrangler.toml`.

### Email

This deployment sends transactional email (the OTP code) through
[Resend](https://resend.com) — set the `RESEND_API_KEY` secret. The Worker's
provider chain prefers Resend, then the Cloudflare Email Service `[[send_email]]`
binding, then a no-op. The `[[send_email]]` binding in `wrangler.toml` requires
the Workers Paid plan (a sender domain verified via Email Routing); the account
is on the free tier, so that binding is dormant and Resend is the live sender.
The Worker detects `RESEND_API_KEY` at startup and selects providers — no config
change needed.

The sender address comes from the `EMAIL_FROM` var in `wrangler.toml` (override
per-deploy with `wrangler secret put EMAIL_FROM` if you'd rather not commit it);
it falls back to `DEFAULT_EMAIL_FROM` when unset. Its domain must be verified
with whichever provider is active.

## 4. Build and deploy

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

## Viewing logs / API errors

Stream the deployed Worker's runtime logs (console output + uncaught
exceptions) live — no config needed:

```bash
wrangler tail                       # stream all requests
wrangler tail --status error        # only failed invocations
```

This only shows logs while it's running. For a persisted, searchable history in
the dashboard, enable Workers Logs by adding an `[observability]` block to
`wrangler.toml` (`enabled = true`) and redeploying.

## How it works

- Workers Assets binding serves `/` (landing) and `/app/*` (SPA) directly from Cloudflare's CDN.
- The Worker's `fetch` handler only runs for `/api/*` and `/healthz`.
- `AI_PROVIDER` defaults to `workers-ai` via the `AI` binding configured in `wrangler.toml`.
- The database is a **D1** binding (`env.DB`) — SQLite at the edge, no TCP sockets, no connection string. `apps/api/src/worker.ts` hands the binding to `drizzle-orm/d1`.

## Run database migrations

Workers can't run migrations themselves (no long-lived scripts), so they run
*before* the Worker is published. D1 has its own migration runner —
`wrangler d1 migrations apply` — which reads the same `libs/db/migrations`
directory (`migrations_dir` in `wrangler.toml`) and tracks applied migrations in
D1's own ledger.

- **In CI (normal path):** `.github/workflows/release.yml` runs
  `wrangler d1 migrations apply buildersnetwork --remote` on every push to
  `main`, then deploys. No manual step needed.
- **Manually (initial schema / out-of-band):**

  ```bash
  # applies libs/db/migrations to the remote D1 database
  pnpm exec wrangler d1 migrations apply buildersnetwork --remote
  # drop --remote to apply to the local D1 simulator instead
  ```

> The D1 migration runner tracks applied files itself — don't reach for
> `db:push` against a D1 database the release workflow targets. `db:push` is for
> throwaway local iteration against a `file:` SQLite database only.

## Redeploy after code changes

```bash
pnpm cf:deploy
```

## PR preview deploys (CI)

There is **no app preview today.** The old `.github/workflows/preview.yml` —
which uploaded a Worker version bound to *production* secrets — was deleted in
`15cdbb2` precisely because sharing the production database with previews leaks
real PII into public links.

The ratified replacement is a per-PR ephemeral D1 database (create → migrate →
seed → delete), giving each preview a synthetic, PII-free database. The design
and its open constraints (D1's per-account database cap, trusted-PRs-only) live
in [`plans/how-to/preview-environments.md`](../../plans/how-to/preview-environments.md);
it is not yet implemented. Mockup PRs still get an isolated *static* preview via
`preview-mockups.yml` + `preview-mockups-deploy.yml` — that path is unrelated
and unaffected.

## Redeploy after frontend-only changes

```bash
pnpm build:frontend
node -e "const fs=require('fs');fs.cpSync('apps/landing/dist','apps/api/public/landing',{recursive:true});fs.cpSync('apps/app/dist','apps/api/public/spa',{recursive:true});"
wrangler deploy
```
