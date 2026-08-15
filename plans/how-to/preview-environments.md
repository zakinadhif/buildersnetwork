# Preview environments

*Non-authoritative working knowledge — trust the code when they diverge.*

Ratified decisions for per-PR preview environments. Discussion: [#23](https://github.com/zakinadhif/buildersnetwork/issues/23). The prerequisite data-layer migration is [#40](https://github.com/zakinadhif/buildersnetwork/issues/40).

> **State of the world:** provisioning landed in [#44](https://github.com/zakinadhif/buildersnetwork/issues/44) — `.github/workflows/preview.yml` creates a per-PR D1 database, R2 bucket and Worker for trusted PRs, capped at 7 concurrent previews. Teardown landed in [#45](https://github.com/zakinadhif/buildersnetwork/issues/45): `preview-teardown.yml` reaps all three resources when a PR closes, and `preview-reaper.yml` sweeps stragglers on a schedule — both through the shared, guard-tested `.github/scripts/preview-reaper.mjs`.
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
| Auth secret | `BETTER_AUTH_SECRET` generated fresh per run | Never the production value, and never a stored one: `wrangler deploy`'s bindings banner leaks a truncated prefix into the public Actions log past GitHub's exact-substring mask, so the value must be a single-deploy throwaway. Cookies don't survive a push anyway (`--reset` empties `users`, sessions cascade). |

No runtime feature-flag mechanism is required. The earlier belief that one was is the single largest thing #23 got wrong: provider selection is already driven by binding presence, so *absence is the flag*.

### R2 storage is duplicated, not absent

The one exception, and the exception proves the rule.

Omitting a binding isolates a side effect only when the side effect is the *point* of the binding. Email and OAuth reach outward: absent, nothing escapes, and nothing of value is lost inside the preview. Storage is different. Omitting `UPLOADS` doesn't isolate anything — it **turns the feature off**. `apps/api/src/routes/karya.ts` returns `503` when storage is absent, which means a PR that touches cover uploads cannot be reviewed in its own preview. The reviewer clicks upload and gets an error. That is a coverage hole wearing the costume of graceful degradation.

So each preview gets its **own R2 bucket**, `buildersnetwork-pr-<n>-uploads`, bound as `UPLOADS`. Same invariant as the database: every preview URL is a window into its own storage. It also keeps the preview tier purely orchestration — no application code learns what a preview is.

A single shared bucket namespaced by key prefix was considered and rejected. It would work, and it would let the teardown credential be scoped to one bucket. But it collides by default: `coverKeyFor` (`apps/api/src/lib/cover.ts`) returns `karya/${karyaId}/cover.${ext}` and the seeders plant fixed ids (`seed_k1`…`seed_k3`) into *every* preview database, so two reviewers uploading a cover for the same seeded karya write byte-identical keys — and `karya.ts` deletes the previous object when the extension differs. Avoiding that needs a prefix wrapper at the storage boundary plus a var threaded into `worker.ts`, i.e. application code that exists solely to serve previews. Per-PR buckets buy the same isolation with none of it.

Nothing seeds into it. No seeder sets `coverKey` (`libs/db/src/schema/app.ts:94`, nullable → client shows a placeholder), so a preview bucket starts empty and the reviewer fills it by exercising the feature. That is the behaviour under test.

Two consequences worth stating before someone implements this:

- **Teardown grows a third resource, and it is the awkward one.** Deleting a D1 database is one synchronous call. Deleting an R2 bucket is two phases: [the R2 docs](https://developers.cloudflare.com/r2/buckets/delete-buckets/) state *"a bucket must be completely empty before it can be deleted."* Wrangler offers no bulk delete and no `r2 object list`, and `--force` on `r2 bucket delete` only skips the confirmation prompt. So emptying happens via a script over the S3 API (`aws s3 rm --recursive`), synchronously, at PR close. A lifecycle expiry rule set at creation is the backstop for when teardown never runs at all — not the mechanism. Shipped in [#45](https://github.com/zakinadhif/buildersnetwork/issues/45): `.github/scripts/preview-reaper.mjs` empties over the S3 API then `wrangler r2 bucket delete`s, shared by `preview-teardown.yml` and `preview-reaper.yml`.
- **The production bucket joins the production database inside the reaper's blast radius.** An R2 token cannot be scoped to buckets that do not exist yet, so the credential that manages per-PR buckets is necessarily account-wide and can purge `buildersnetwork-uploads`, which R2 does not version.

  This is not a new class of exposure — it is a second instance of one CI already carries and cannot shed. Per-PR *databases* are the whole design, Cloudflare's `D1:Edit` permission is account-scoped with no way to restrict it to a set of databases, and so `CLOUDFLARE_API_TOKEN` can already run `wrangler d1 delete buildersnetwork` against production. D1 Time Travel restores a point in time *within* a database; it does not resurrect a deleted one. Teardown already deletes a resource whose name is computed from a PR number, on a token that reaches production, on every PR close.

  Accepted, deliberately, because the alternative buys a narrower credential with application code. The mitigation is therefore uniform across both resources and lives in the script, not the credential: anchored `^buildersnetwork-pr-[0-9]+$` and `^buildersnetwork-pr-[0-9]+-uploads$` matches, names built from `github.event.pull_request.number`, and explicit tests that the production database and bucket names are refused.

### Seeding connects to D1 directly, over its HTTP API

Decided while implementing [#44](https://github.com/zakinadhif/buildersnetwork/issues/44); reworked immediately after, before the PR merged.

Neither shipped driver can reach a remote D1 from Node: `@libsql/client` speaks `file:` and `libsql://`, and `drizzle-orm/d1` needs a Worker binding that CI does not have. The first implementation worked around that by producing **SQL** instead of making driver calls — seed a throwaway local SQLite file, `sqlite3 … .dump --data-only` it table by table, apply with `wrangler d1 execute --file`. It worked, but the dump pipeline was a second, divergent implementation of the seeding logic: it carried a hand-maintained `INSERT_ORDER` list of every table, so adding one table to a seeder meant editing CI.

The fix was to add the missing driver rather than route around it. `libs/db/src/d1-http.ts` wires `drizzle-orm/sqlite-proxy` to D1's REST API, and `pnpm db:seed` picks it up whenever `D1_DATABASE_ID` is set — so CI seeds with the same command, seeders, and registry order as local dev. The workflow step is now `pnpm db:seed -- --reset --yes`, and **a new table is registered in its seeder's `tables`, nowhere else.**

Four things pin the design, all discovered the hard way:

- **`/raw`, not `/query`.** sqlite-proxy maps result rows *positionally* against the selected fields, so it needs D1's array-of-arrays rows. `/query` returns row objects, which map to `undefined` columns without erroring.
- **No transactions.** The runner normally hands each seeder a transaction. sqlite-proxy fakes `transaction()` by issuing `begin`/`commit` as ordinary statements and D1 rejects both — it has no interactive transactions at any layer. Hence `supportsTransactions: false`, which unwraps the seeder. A preview seed that dies halfway leaves partly-written tables; that is only tolerable because the next push re-seeds from scratch.
- **D1 binds at most 100 parameters per query**; libSQL allows 32766. The old dump pipeline never met this limit because `wrangler d1 execute --file` inlined literals rather than binding them — seeding over a driver binds. 28 interests × 4 columns = 112 was the first statement to trip it. Multi-row inserts therefore go through `insertInChunks` (`libs/db/src/seed/chunk.ts`), which slices by the table's *column count* rather than the row's keys, because Drizzle also binds a parameter for any JS-valued default (`$defaultFn`) the row omits. A long `inArray()` list binds one parameter per element and hits the same ceiling, so the find-or-create lookups go through the companion `selectInChunks`. The driver rewrites D1's "too many SQL variables" into a message naming both helpers, because the raw error suggests no fix.
- **A seeder must declare every table it resets.** `--reset` empties only the tables a seeder names. `memberSeeder` inserts into `users` but used to declare only `[profiles, userInterests]`, so switching to `--reset` would have left the first push's users in place, where `onConflictDoNothing` silently preserves them — the exact staleness bug reset-then-seed exists to prevent. `users` and `accounts` are now declared; `accounts` explicitly rather than by cascade, since it holds the credential hash that preview login depends on.

Schema still arrives the production way, `wrangler d1 migrations apply`, so previews exercise the same migration path and the same D1 ledger as prod. Nothing else can: the seeder writes rows, never DDL.

**On a second push, seed data is reset and reloaded**, not merged. The alternative — `INSERT OR IGNORE` — is non-destructive but leaves a preview showing the seed data of the *first* push, which quietly defeats the point of previewing the commit under review. The accepted cost: a seeded karya returns to `coverKey = NULL`, so a cover a reviewer uploaded on an earlier push is orphaned in the bucket until teardown. **The bucket itself is never emptied** — reviewers' uploads survive every push, which is why an existing bucket is reused untouched rather than recreated.

## Operating it — what a PR actually gets

Every pull request **from a branch in this repo** gets a full ephemeral environment at `https://buildersnetwork-pr-<n>.<subdomain>.workers.dev`: its own D1 database (created, migrated, seeded), its own R2 bucket (`buildersnetwork-pr-<n>-uploads`), and its own Worker. A sticky comment posts the URL and the seed credentials.

**The concurrency cap is counted live, not tracked.** `preview.yml` counts the D1 databases that actually exist and stops at **7** (a knob in the workflow) — the free tier allows 10, prod takes one, and the margin keeps provisioning clear of D1's hard limit. A PR that *already has* a preview is never blocked by the cap; a PR that hits it gets a sticky comment telling it to close another preview, then push or re-run.

**Preview deploys from `wrangler.preview.toml`, rendered in CI from `wrangler.preview.template.toml`** — a separate file rather than an `[env.preview]` block, for the inheritable-`routes` reason above. Bindings are non-inheritable, so *omitting* `RESEND_API_KEY`, `GOOGLE_CLIENT_ID` and `[[send_email]]` is what disables email and Google sign-in in previews: absence is the flag.

Product feature flags have a separate, explicit lifecycle. The git-tracked
`wrangler.preview.template.toml` contains literal, reviewable, non-secret
preview settings: `FEATURE_FLAG_PROVIDER = "env"` and each `FEATURE_*`
boolean. CI substitutes only the PR number, D1 database ID, `APP_URL`, and the
temporary `BETTER_AUTH_SECRET` to produce `wrangler.preview.toml`. That rendered
file is ephemeral and gitignored because it contains live resource identifiers
and a generated secret; all literal feature settings pass through unchanged.

To change flags for a PR preview, edit the tracked template in that PR. The next
preview deployment picks up those values. The SPA has no `VITE_FEATURE_*`
configuration: it reads the server-evaluated snapshot from `/api/features`.

The auth-signing secret is **generated fresh per run, not stored**.

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

## Configuring the credentials

Every preview workflow follows the same secret-guard idiom as `release.yml`: it **no-ops until its inputs exist**, so the workflows can merge before any credential is set and simply do nothing until you configure them. Provisioning ([#44](https://github.com/zakinadhif/buildersnetwork/issues/44)) and teardown/reaper ([#45](https://github.com/zakinadhif/buildersnetwork/issues/45)) gate on overlapping but different sets.

| Name | Kind | Provision (`preview.yml`) | Teardown / reaper | What it is |
|---|---|:---:|:---:|---|
| `CLOUDFLARE_API_TOKEN` | secret | ✅ | ✅ | Cloudflare API token wrangler authenticates with — creates/deletes D1, R2 buckets, Workers. |
| `CLOUDFLARE_ACCOUNT_ID` | secret | ✅ | ✅ | Account id. Also builds the R2 S3 endpoint `https://<id>.r2.cloudflarestorage.com`. |
| `CLOUDFLARE_WORKERS_SUBDOMAIN` | **variable** | ✅ | — | The `*.workers.dev` subdomain, used to compute `APP_URL` before deploy. |
| `R2_S3_ACCESS_KEY_ID` | secret | — | ✅ | R2 **S3-API** access key id — the emptying phase only. |
| `R2_S3_SECRET_ACCESS_KEY` | secret | — | ✅ | R2 **S3-API** secret access key — paired with the above. |

Until all four teardown inputs are set, `preview-teardown.yml` and `preview-reaper.yml` skip, and closed previews accumulate until reaped by hand (the 7-day object-lifecycle rule keeps buckets from filling forever in the meantime).

### Why the emptying phase needs S3-shaped credentials

`CLOUDFLARE_API_TOKEN` drives everything wrangler does, but **emptying a bucket is not one of those things**. [R2 refuses to delete a non-empty bucket](https://developers.cloudflare.com/r2/buckets/delete-buckets/) — *"a bucket must be completely empty before it can be deleted"* — and wrangler has no bulk object delete and no `r2 object list`, so there is no wrangler path to empty it. Cloudflare's own documented workaround is to script the deletes over the **S3-compatible API**, which `.github/scripts/preview-reaper.mjs` does with `aws s3 rm --recursive`. The `aws` CLI authenticates with S3-style HMAC credentials (an Access Key ID + Secret Access Key), **not** a Cloudflare bearer token — hence `R2_S3_ACCESS_KEY_ID` / `R2_S3_SECRET_ACCESS_KEY`.

Note what this credential does **not** buy: it is *not* a smaller blast radius. An R2 token cannot be scoped to buckets that do not exist yet, so it is account-wide and can purge production `buildersnetwork-uploads` — exactly like `CLOUDFLARE_API_TOKEN` can already `d1 delete buildersnetwork`. The mitigation is the script's anchored name guard, not the credential (see *R2 storage is duplicated* above). The credential exists purely because the S3 protocol needs S3-shaped keys, which is why the two options below are equivalent on safety and differ only on operational hygiene.

### Providing the credentials — two options

Cloudflare lets **any** API token double as S3 credentials ([R2 tokens docs](https://developers.cloudflare.com/r2/api/tokens/)): the Access Key ID is the token's `id`, and the Secret Access Key is the **SHA-256 hash of the token's value**. That means the emptying credential can either be minted fresh or derived from the token the workflows already use.

**Option A — dedicated R2 token (recommended default).** Cleanest to reason about: named for its job, unambiguously carries object permissions, and rotatable/revocable independently of `CLOUDFLARE_API_TOKEN`.

1. Cloudflare dashboard → **R2** → **Manage R2 API Tokens** → **Create API token**.
2. Permission **Object Read & Write** (or **Admin Read & Write**). Account-wide, per the note above.
3. On creation Cloudflare shows an **Access Key ID** and a **Secret Access Key** *once*. Copy both → `R2_S3_ACCESS_KEY_ID` / `R2_S3_SECRET_ACCESS_KEY`.

**Option B — reuse the existing `CLOUDFLARE_API_TOKEN`.** Avoids creating a second credential, and slots into the workflows with **no code change** — the script only ever sees `R2_S3_ACCESS_KEY_ID` / `R2_S3_SECRET_ACCESS_KEY`. Valid only if **both** hold:

- the existing token carries R2 **Admin Read & Write** (per the docs, `Object *` permissions are S3-only, but `Admin Read & Write` works for both the Cloudflare REST API *and* S3 object operations — so a token that already creates/deletes buckets can also delete objects over S3); **and**
- you still have the token's **raw value**, because GitHub secrets are write-only and you cannot read `CLOUDFLARE_API_TOKEN` back out to hash it.

Then set:

- `R2_S3_ACCESS_KEY_ID` = the token's **ID** (its identifier, not the value).
- `R2_S3_SECRET_ACCESS_KEY` = the **hex SHA-256** of the token value, e.g. `printf '%s' "$TOKEN_VALUE" | sha256sum`.

The trade-off is pure hygiene, not security (blast radius is identical): Option B couples object-purge to the credential everything else uses, so you can no longer rotate or revoke the purge capability on its own.

### Wiring the secrets

Repo → **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_WORKERS_SUBDOMAIN` goes under **Variables**.
- everything else, including the two R2 keys from whichever option above, under **Secrets**.

The two R2 keys are exposed **only to the reap step's `env:`** in each workflow, never job-wide, so nothing else in the job can read the credential that can purge production storage.

## Not decided here

- **Trunk-based development / continuous delivery** ([#12](https://github.com/zakinadhif/buildersnetwork/issues/12)). Per-PR previews are useful under any branching model; nothing above assumes trunk-based. The two were coupled in #23 and are hereby decoupled.
- **A locked staging tier** with a scrubbed production snapshot. Implied as the right home for realism testing, but not designed.
- **Fork support**, per above.
