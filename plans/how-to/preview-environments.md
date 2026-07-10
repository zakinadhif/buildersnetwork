# Preview environments

*Non-authoritative working knowledge — trust the code when they diverge.*

Ratified decisions for per-PR preview environments. Discussion: [#23](https://github.com/zakinadhif/buildersnetwork/issues/23). The prerequisite data-layer migration is [#40](https://github.com/zakinadhif/buildersnetwork/issues/40).

> **State of the world:** provisioning landed in [#44](https://github.com/zakinadhif/buildersnetwork/issues/44) — `.github/workflows/preview.yml` creates a per-PR D1 database, R2 bucket and Worker for trusted PRs. Teardown ([#45](https://github.com/zakinadhif/buildersnetwork/issues/45)) has not; previews are reaped by hand until it does.
>
> The *previous* `preview.yml` (deleted in `15cdbb2`) is a different thing: it uploaded a Worker version bound to *production* secrets, including the prod `DATABASE_URL`. Mockup PRs still get an isolated static preview (`preview-mockups.yml` + `preview-mockups-deploy.yml`); that is unrelated and stays.

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

**Open constraint:** D1 caps the number of databases per account — **10 on the free tier**, which this account deliberately stays on until Al-Fath Berkarya is formalised. Prod takes one, leaving nine for previews. Per-PR ephemeral databases consume that quota, and it sets the hard ceiling on concurrent previews. Each preview now also consumes an R2 bucket (see below), but R2 allows a million per account, so D1 remains the binding constraint.

### Trusted PRs only

Fork PRs get the existing static mockup preview and CI. They do not get an app preview.

The split-workflow pattern already in the repo — `preview-mockups.yml` (untrusted build, zero secrets) plus `preview-mockups-deploy.yml` (`workflow_run`, trusted, never executes PR code) — works because its deploy half only publishes static files.

An app preview's deploy half must run `db:migrate`, **and the migrations come from the PR**. There is no way to apply PR-authored migrations against a real database without executing PR-authored code holding database credentials. The `workflow_run` split does not rescue this case; it is structurally harder than the mockup one.

Revisit behind a GitHub Environment approval gate (required reviewers) if community PR volume ever justifies the cost.

### Deterministic `*.workers.dev` routing

`wrangler deploy --name buildersnetwork-pr-<n>` yields a URL computable *before* deploy. Zero DNS records, zero certificates.

A wildcard `*.preview.buildersnetwork.web.id` buys nothing: cookies are host-only either way, and `APP_URL` is per-PR under both options.

**Preview deploys from a separate config file, not an `[env.preview]` block.** Per the [wrangler config docs](https://developers.cloudflare.com/workers/wrangler/configuration/), bindings (`d1_databases`, `r2_buckets`, `send_email`, `vars`) are *non-inheritable*. For email and OAuth that hands us the omission-based isolation below for free; for D1 and R2 it means a preview must name its own database and bucket explicitly, and so cannot silently attach to production's. But `routes` **is** inheritable, so any preview deploying against the top-level `wrangler.toml` would inherit the production custom domain `buildersnetwork.web.id`. A config file that simply has no `routes` key sidesteps this; an env block cannot drop an inheritable key by omission.

### Side effects are absent, not trapped

Preview omits bindings rather than redirecting them.

| Concern | Mechanism | Why nothing to build |
|---|---|---|
| Email | Omit `RESEND_API_KEY` (and `[[send_email]]`) | Prod email actually runs through **Resend** (`RESEND_API_KEY`); the `[[send_email]]` binding needs Workers Paid and is dormant on the free-tier account, so omitting `RESEND_API_KEY` is the operative step. With neither set, both entrypoints fall back to `createNoopEmail()`: `apps/api/src/index.ts` always did; the Worker path was closed in [#42](https://github.com/zakinadhif/buildersnetwork/issues/42) (`apps/api/src/lib/email.ts`). |
| Google OAuth | Omit `GOOGLE_CLIENT_ID` | `libs/auth/src/index.ts` only enables `socialProviders` when it is present. No per-PR redirect URI to register. |
| Auth secret | Preview-only `BETTER_AUTH_SECRET` | Never the production value. |

No runtime feature-flag mechanism is required. The earlier belief that one was is the single largest thing #23 got wrong: provider selection is already driven by binding presence, so *absence is the flag*.

### R2 storage is duplicated, not absent

The one exception, and the exception proves the rule.

Omitting a binding isolates a side effect only when the side effect is the *point* of the binding. Email and OAuth reach outward: absent, nothing escapes, and nothing of value is lost inside the preview. Storage is different. Omitting `UPLOADS` doesn't isolate anything — it **turns the feature off**. `apps/api/src/routes/karya.ts` returns `503` when storage is absent, which means a PR that touches cover uploads cannot be reviewed in its own preview. The reviewer clicks upload and gets an error. That is a coverage hole wearing the costume of graceful degradation.

So each preview gets its **own R2 bucket**, `buildersnetwork-pr-<n>-uploads`, bound as `UPLOADS`. Same invariant as the database: every preview URL is a window into its own storage. It also keeps the preview tier purely orchestration — no application code learns what a preview is.

A single shared bucket namespaced by key prefix was considered and rejected. It would work, and it would let the teardown credential be scoped to one bucket. But it collides by default: `coverKeyFor` (`apps/api/src/lib/cover.ts`) returns `karya/${karyaId}/cover.${ext}` and the seeders plant fixed ids (`seed_k1`…`seed_k3`) into *every* preview database, so two reviewers uploading a cover for the same seeded karya write byte-identical keys — and `karya.ts` deletes the previous object when the extension differs. Avoiding that needs a prefix wrapper at the storage boundary plus a var threaded into `worker.ts`, i.e. application code that exists solely to serve previews. Per-PR buckets buy the same isolation with none of it.

Nothing seeds into it. No seeder sets `coverKey` (`libs/db/src/schema/app.ts:94`, nullable → client shows a placeholder), so a preview bucket starts empty and the reviewer fills it by exercising the feature. That is the behaviour under test.

Two consequences worth stating before someone implements this:

- **Teardown grows a third resource, and it is the awkward one.** Deleting a D1 database is one synchronous call. Deleting an R2 bucket is two phases: [the R2 docs](https://developers.cloudflare.com/r2/buckets/delete-buckets/) state *"a bucket must be completely empty before it can be deleted."* Wrangler offers no bulk delete and no `r2 object list`, and `--force` on `r2 bucket delete` only skips the confirmation prompt. So emptying happens via a script over the S3 API (`rclone purge` or equivalent), synchronously, at PR close. A lifecycle expiry rule set at creation is the backstop for when teardown never runs at all — not the mechanism. Tracked in [#45](https://github.com/zakinadhif/buildersnetwork/issues/45).
- **The production bucket joins the production database inside the reaper's blast radius.** An R2 token cannot be scoped to buckets that do not exist yet, so the credential that manages per-PR buckets is necessarily account-wide and can purge `buildersnetwork-uploads`, which R2 does not version.

  This is not a new class of exposure — it is a second instance of one CI already carries and cannot shed. Per-PR *databases* are the whole design, Cloudflare's `D1:Edit` permission is account-scoped with no way to restrict it to a set of databases, and so `CLOUDFLARE_API_TOKEN` can already run `wrangler d1 delete buildersnetwork` against production. D1 Time Travel restores a point in time *within* a database; it does not resurrect a deleted one. Teardown already deletes a resource whose name is computed from a PR number, on a token that reaches production, on every PR close.

  Accepted, deliberately, because the alternative buys a narrower credential with application code. The mitigation is therefore uniform across both resources and lives in the script, not the credential: anchored `^buildersnetwork-pr-[0-9]+$` and `^buildersnetwork-pr-[0-9]+-uploads$` matches, names built from `github.event.pull_request.number`, and explicit tests that the production database and bucket names are refused.

### Seeding reaches D1 by transplant, not by connection

Decided while implementing [#44](https://github.com/zakinadhif/buildersnetwork/issues/44).

`pnpm db:seed` builds a libSQL client from `DATABASE_URL`, and D1 speaks neither `file:` nor `libsql://` — it has its own HTTP API. From outside a Worker the only thing in CI that speaks that API is `wrangler`, and wrangler takes **SQL**, not driver calls. So the problem is not "connect, then insert"; it is "produce SQL, and let wrangler apply it."

The workflow therefore seeds a throwaway local SQLite file with the existing, unmodified toolchain — which is where the hard part lives, since Better Auth password hashing runs in Node and bakes the hash into the row — then dumps the rows table by table (`sqlite3 … .dump --data-only`) and applies them to the already-migrated D1 with `wrangler d1 execute --file`. Zero new runtime drivers, zero application-code changes.

Schema still arrives the production way, `wrangler d1 migrations apply`, so previews exercise the same migration path and the same D1 ledger as prod. Dumping per table (rather than filtering one big dump) is what keeps the local `__drizzle_migrations` ledger out of the transplant.

**On a second push, seed data is reset and reloaded**, not merged. The generated SQL deletes every table children-first before re-inserting, so it is replayable. The alternative — `INSERT OR IGNORE` — is non-destructive but leaves a preview showing the seed data of the *first* push, which quietly defeats the point of previewing the commit under review. The accepted cost: a seeded karya returns to `coverKey = NULL`, so a cover a reviewer uploaded on an earlier push is orphaned in the bucket until teardown. **The bucket itself is never emptied** — reviewers' uploads survive every push, which is why an existing bucket is reused untouched rather than recreated.

Two version traps, both guarded in the workflow rather than assumed: `.dump --data-only` needs sqlite3 ≥ 3.41, and sqlite3 ≥ 3.47 encodes control characters as `unistr('…')`, a function D1's older SQLite does not have — such a dump loads locally and fails on D1. No seed value contains a control character today.

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
