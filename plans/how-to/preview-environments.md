# Preview environments

*Non-authoritative working knowledge — trust the code when they diverge.*

Ratified decisions for per-PR preview environments. Discussion: [#23](https://github.com/zakinadhif/buildersnetwork/issues/23). The prerequisite data-layer migration is [#40](https://github.com/zakinadhif/buildersnetwork/issues/40).

> **State of the world:** there is no app preview today. `.github/workflows/preview.yml` was deleted in `15cdbb2` — it uploaded a Worker version bound to *production* secrets, including the prod `DATABASE_URL`. Mockup PRs still get an isolated static preview (`preview-mockups.yml` + `preview-mockups-deploy.yml`); that is unrelated and stays.

## Decisions

### Preview data is synthetic, always

A preview DB only ever contains seed data. Never a copy of production, never a scrubbed snapshot.

Every preview URL is a window into its database. If that database descends from production, each preview becomes a copy of real student PII — names, emails, auth rows — landing in the least-guarded tier there is: a public link, pasted into a PR comment, screenshotted. Under UU PDP each copy is its own compliance burden.

If a preview DB has only ever held seed data, there is nothing to scrub, gate, or delete-on-close. The whole preview tier leaves compliance scope, and previews may stay public.

Corollary: **realistic production snapshots do not belong in per-PR previews.** Catching scale and messiness bugs is a job for a single locked-down staging environment with a scrubbed snapshot — a separate tier, not this one.

### SQLite dialect (D1), not Postgres

Decided in [#40](https://github.com/zakinadhif/buildersnetwork/issues/40). Through the preview lens D1 and Neon are equivalent — both can serve a seeded, PII-free database. The decision rests elsewhere: cost, staying inside Cloudflare, and dialect portability (the same `sqlite-core` schema runs on D1, Turso/libSQL, and `better-sqlite3`).

What it changes here: **D1 has no branching.** There is no copy-on-write branch from a seeded template, and no `preview-base` template to keep fresh as the schema moves. The lifecycle is create → migrate → seed → delete.

Neon's copy-on-write was never the appealing part; branching *from production* is precisely what creates the PII problem above.

**Open constraint:** D1 caps the number of databases per account. Per-PR ephemeral databases consume that quota, and it sets the hard ceiling on concurrent previews. Establish the number before designing the reaper.

### Trusted PRs only

Fork PRs get the existing static mockup preview and CI. They do not get an app preview.

The split-workflow pattern already in the repo — `preview-mockups.yml` (untrusted build, zero secrets) plus `preview-mockups-deploy.yml` (`workflow_run`, trusted, never executes PR code) — works because its deploy half only publishes static files.

An app preview's deploy half must run `db:migrate`, **and the migrations come from the PR**. There is no way to apply PR-authored migrations against a real database without executing PR-authored code holding database credentials. The `workflow_run` split does not rescue this case; it is structurally harder than the mockup one.

Revisit behind a GitHub Environment approval gate (required reviewers) if community PR volume ever justifies the cost.

### Deterministic `*.workers.dev` routing

`wrangler deploy --name buildersnetwork-pr-<n>` yields a URL computable *before* deploy. Zero DNS records, zero certificates.

A wildcard `*.preview.buildersnetwork.web.id` buys nothing: cookies are host-only either way, and `APP_URL` is per-PR under both options.

### Side effects are absent, not trapped

Preview omits bindings rather than redirecting them.

| Concern | Mechanism | Why nothing to build |
|---|---|---|
| Email | Omit `[[send_email]]`, omit `RESEND_API_KEY` | `apps/api/src/index.ts` already falls back to `createNoopEmail()`. `worker.ts` does not — that fallback is the one gap. |
| Google OAuth | Omit `GOOGLE_CLIENT_ID` | `libs/auth/src/index.ts` only enables `socialProviders` when it is present. No per-PR redirect URI to register. |
| R2 uploads | Omit the `UPLOADS` binding | `apps/api/src/routes/karya.ts` already returns `503` when storage is absent. |
| Auth secret | Preview-only `BETTER_AUTH_SECRET` | Never the production value. |

No runtime feature-flag mechanism is required. The earlier belief that one was is the single largest thing #23 got wrong: provider selection is already driven by binding presence, so *absence is the flag*.

## How preview login works

Worth stating plainly, because it is easy to get backwards.

`apps/api/src/routes/otp.ts` is a custom route, not Better Auth. Its `/verify` sets `emailVerified: true` and **never creates a session** — it is a signup step, not a login path. Actual login is Better Auth `emailAndPassword`.

So preview login needs **no email delivery at all**, which is why the noop provider suffices. What it did need was the credential itself: the seeder used to insert users with no `accounts` rows, meaning no password, meaning seeded users could not log in. Resolved in [#43](https://github.com/zakinadhif/buildersnetwork/issues/43) — `seeders/members.ts` now writes a `providerId: "credential"` account per seed user, hashed with `better-auth/crypto`'s `hashPassword` (the same function Better Auth verifies against).

Sign in to a preview as any seed user — `hafiz@seed.local`, `fatimah@seed.local`, `rizal@seed.local`, `dinda@seed.local`, `arya@seed.local` — with the password `seedpassword123`. It is not a secret: preview databases hold only seed data, and the seed runner refuses to run under `NODE_ENV=production` without `--force`.

Exercising the OTP *signup* flow inside a preview would require reading the code back out of the `verifications` table. Deferred.

## What the app already gets right

Almost all the work is orchestration, not application code.

- `apps/app/src/lib/auth-client.ts` falls back to `window.location.origin`, so the **frontend needs no per-PR build configuration**.
- Setting the Worker's `APP_URL` var drives `BETTER_AUTH_URL` and `ALLOWED_ORIGINS` for free (`apps/api/src/worker.ts`). That one variable is what makes auth cookies and redirects consistent within each preview.
- `libs/db/src/atomic.ts` already abstracts over batch-vs-interactive transactions, so the D1 driver needs no changes to the write surface.

## Not decided here

- **Trunk-based development / continuous delivery** ([#12](https://github.com/zakinadhif/buildersnetwork/issues/12)). Per-PR previews are useful under any branching model; nothing above assumes trunk-based. The two were coupled in #23 and are hereby decoupled.
- **A locked staging tier** with a scrubbed production snapshot. Implied as the right home for realism testing, but not designed.
- **Fork support**, per above.
