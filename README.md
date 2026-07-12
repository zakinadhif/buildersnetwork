# Al-Fath Berkarya

Community platform for builder students at Telkom University. Students discover collaborators through an AI-powered onboarding chat, get matched with compatible members, and explore the community directory.

---

## Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 22 |
| **API** | Hono v4 |
| **Database ORM** | Drizzle ORM (SQLite dialect — D1 on Workers, libSQL on Node) |
| **Auth** | Better Auth (drizzle adapter, DB-backed sessions) |
| **AI** | Pluggable — Gemini API (Node/Docker), Anthropic API, or Cloudflare Workers AI |
| **Storage** | Pluggable — AWS S3, Cloudflare R2, GCS, MinIO |
| **Frontend** | React 19 + Vite + TailwindCSS v4 |
| **Routing** | Wouter (URL-based) |
| **Data Fetching** | TanStack Query v5 |
| **Monorepo** | pnpm workspaces |
| **Language** | TypeScript ~5.9 |

---

## Architecture

```
buildersnetwork/
├── apps/
│   ├── api/       # Hono API server
│   │   ├── src/app.ts        # Pure Hono app factory (runtime-agnostic)
│   │   ├── src/index.ts      # Node.js / Docker entry (Gemini AI)
│   │   ├── src/worker.ts     # Cloudflare Workers entry (Workers AI)
│   │   └── src/routes/
│   │       └── ai.ts         # POST /api/ai/complete  POST /api/ai/stream
│   ├── app/       # React SPA (served at /app/*)
│   └── landing/   # Astro landing (served at /)
├── libs/
│   ├── ai/        # AI provider interface — Anthropic, Gemini, Workers AI adapters
│   │   └── src/react.ts      # useStream hook for frontend streaming
│   ├── auth/      # Better Auth config
│   ├── config/    # Zod-validated env loader
│   ├── db/        # Drizzle schema (SQLite) + libSQL (Node) / D1 (Workers) clients
│   └── storage/   # S3-compatible / GCS storage adapters
└── deploy/
    ├── Dockerfile            # Single-container image (API + SPA + landing)
    ├── Dockerfile.api        # API-only image for 2-tier EC2 deployment
    ├── ansible/              # 2-tier EC2 deployment (api / web VMs; DB is a SQLite file)
    ├── docker-compose.dev.yml
    ├── docker-compose.selfhost.yml
    └── docs/
```

### App flow

```
Welcome → Login → VerifyEmail → Mulai (one-field name) → Launchpad shell (/home)
```

A newly-verified member enters straight into the **Launchpad shell** via a quick one-field start (`/mulai`) — onboarding is **no longer a gate**. The AI onboarding chat lives on as an always-available **assistant tab** (`/assistant`) that produces an editable profile draft; the older linear flow (`/onboarding` → `/review` → `/matches`) still works for those who opt into it.

Logged-in surfaces render inside a **persistent left-sidebar shell** (`Shell` + rail): Launchpad home (`/home`), Minat Saya (`/minat`), the assistant (`/assistant`), plus "segera hadir" placeholders (`/jelajahi`, `/karya-saya`) and a disabled "Cari Kolaborator" that lights up in the Matchmaking milestone. All screens are URL-routed via Wouter (`/welcome`, `/mulai`, `/assistant`, `/onboarding`, `/review`, `/matches`, `/home`, `/minat`, `/member/:id`, `/karya/new`, `/karya/new/ai`, `/karya/:id`). Detail/creation pages (`/karya/*`, `/member/:id`) currently open as focused full-screen routes reachable from the shell.

Beyond the linear onboarding flow, **karya** (projects) are a recurring surface reached from `/home`: a member creates one at `/karya/new` — either filling the draft directly or letting the AI pre-fill it at `/karya/new/ai` — then publishes to a live karya page (`/karya/:id`) with stage chips, interest tags, and a contributor roster shown as avatar faces. An owner can also attach an icon-style cover and a Play Store-style **screenshot gallery**: landscape shots surface above the karya's row in the feed, portrait shots as a scroll-snap gallery on the detail page. Others can request to join; the owner approves or declines. Backed by the `karya` / `karya_members` / `karya_interests` / `karya_screenshots` tables and the `/api/karya` routes (list, create, detail, join, approve/decline).

On a karya page, approved members post short **updates** (`progress` / `challenge` / `achievement`) into a reverse-chron stream; non-members see the stream read-only. Each update also surfaces in the **global feed** — a reverse-chronological, *unranked* interleave of recent posts and newly created karya. `/home` is **feed-first**: a hand-curated "Top picked inspiring projects" section (the `featured` table) sits atop that feed. Team members on the `ADMIN_EMAILS` allowlist see a ✦ feature toggle on each karya page to mark/unmark it featured (an env allowlist, not a role system — server-enforced). Backed by the `posts` / `featured` tables and the `/api/karya/:id/posts`, `/api/karya/:id/feature`, `/api/feed`, and `/api/featured` routes. *(The Sprint-2 AI-discovery chat + members list were removed from `/home`; they return on the Sprint-4 search/discovery page.)*

### AI endpoints

The `@myapp/ai` lib exposes a common `AIProvider` interface (`complete`, `stream`, `agentComplete`) implemented by three adapters. Two HTTP endpoints hang off `/api/ai`:

| Endpoint | Protocol | Use case | Frontend |
|---|---|---|---|
| `POST /api/ai/complete` | JSON request → `{ text: string }` | One-shot completions, agent runs | Generated hook `aiComplete` / `useAiComplete` |
| `POST /api/ai/stream` | JSON request → `text/plain` chunked body | Live typing effect in onboarding chat | `useStream` hook from `@myapp/ai/react` |

**The stream endpoint is not a regular JSON API.** It returns a plain-text chunked response consumed by reading `Response.body` directly. The orval-generated client cannot handle it — always use `useStream` for streaming.

The AI provider is selected per runtime entrypoint, not via env var:
- **Node.js / Docker** (`src/index.ts`) — `createGeminiAI`, requires `GEMINI_API_KEY`
- **Cloudflare Workers** (`src/worker.ts`) — `createWorkersAI`, uses CF `AI` binding, no API key

---

## Prerequisites

- **Node.js** >= 22
- **pnpm** >= 10 — `npm i -g pnpm`

---

## Quick start

```bash
pnpm install

# Start local backing services (MinIO — the DB is a local SQLite file, no server)
docker compose -f deploy/docker-compose.dev.yml up -d

# Copy and fill in env vars
cp deploy/.env.example apps/api/.env

# Generate auth schema and push to DB
pnpm better-auth:generate
pnpm db:push

# Start dev servers
pnpm dev:api   # Hono API on :3000
pnpm dev:app   # React SPA on :5173
```

---

## OpenAPI-first workflow (CRUD / JSON endpoints)

`libs/api-spec/openapi.yaml` is the single source of truth for standard JSON endpoints. This workflow applies to CRUD-style routes that take a JSON body and return a JSON response.

**This workflow does not apply to the AI stream endpoint** (`POST /api/ai/stream`). That endpoint returns chunked plain text and is consumed with `useStream` — see [Streaming AI](#streaming-ai-frontend) below.

**Nor to binary upload/serve routes.** The karya cover routes (`POST`/`DELETE`/`GET /api/karya/:id/cover`) and screenshot routes (`POST /api/karya/:id/screenshots`, `DELETE`/`GET /api/karya/:id/screenshots/:screenshotId`, `POST /api/karya/:id/screenshots/reorder`) carry `multipart/form-data` or raw image bytes, not JSON, so they're hand-written in `routes/karya.ts` and called via `apps/app/src/lib/upload.ts` — outside the generated client. Only their read-side effect (a nullable `coverUrl` and a `screenshots[]` array on `Karya`) lives in the spec.

### 1. Update the spec

Add your path and schemas to `libs/api-spec/openapi.yaml`.

### 2. Run codegen

```bash
pnpm codegen
```

This generates two outputs:
- **`libs/api-client-react/src/generated/`** — typed TanStack Query hooks (e.g. `useListMembers`, `listMembers`) backed by `customFetch`
- **`libs/api-zod/src/generated/`** — Zod validators for every request/response schema (e.g. `ProfileInput`)

### 3. Implement the Hono route

Use the generated Zod validator for request parsing:

```ts
import { ProfileInput } from "@myapp/api-zod";

app.post("/profile", async (c) => {
  const parsed = ProfileInput.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "invalid request" }, 400);
  // ...
});
```

Register the route in `apps/api/src/app.ts`.

### 4. Call from the frontend

Use the generated imperative function or hook:

```ts
// Imperative (in async handlers)
import { saveProfile } from "@myapp/api-client-react";
await saveProfile(profileData);

// Hook (in React components)
import { useSaveProfile } from "@myapp/api-client-react";
const { mutateAsync } = useSaveProfile();
```

---

## Streaming AI (frontend)

The onboarding chat and any other live-text features use `useStream` from `@myapp/ai/react`, which reads `POST /api/ai/stream` as a chunked plain-text body.

```ts
import { useStream } from "@myapp/ai/react";

function OnboardingChat() {
  const { streamingText, stream } = useStream();
  // streamingText is null when idle, "" at start, accumulates chunks while streaming

  async function sendMessage(messages: Message[]) {
    const fullText = await stream(messages);
    // fullText is the complete response once done
  }
}
```

Do not use the orval-generated `aiStream` function for this — it does not consume the chunked body incrementally.

---

## Scripts

| Script | Description |
|---|---|
| `pnpm dev:api` | Start Hono API via tsx watch |
| `pnpm dev:app` | Start React SPA via Vite |
| `pnpm dev:landing` | Start Astro landing page |
| `pnpm codegen` | Regenerate React Query hooks + Zod validators from `openapi.yaml` |
| `pnpm better-auth:generate` | Regenerate `libs/db/src/schema/auth.ts` from auth config |
| `pnpm db:push` | Push Drizzle schema to a local SQLite file |
| `pnpm db:generate` | Write SQL migration files from schema changes |
| `pnpm db:migrate` | Apply migration files to `DATABASE_URL` (the deploy-step runner) |
| `pnpm db:check` | Verify every migration `.sql` is registered in the journal (no DB needed) |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Run seeders against `DATABASE_URL` (see [Seed accounts](#seed-accounts)) |
| `pnpm format` | Format with Biome |
| `pnpm lint` | Lint with Biome |
| `pnpm test:db` | Run `@myapp/db` Vitest unit tests (pure helpers, no DB) |
| `pnpm test:api` | Run API Vitest unit tests |
| `pnpm test:app` | Run SPA Vitest unit tests |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm build:frontend` | Build SPA + landing (runs codegen first) |
| `pnpm cf:deploy` | Build everything and deploy to Cloudflare Workers |

### Seed accounts

`pnpm db:seed` creates five members with Better Auth `emailAndPassword` credentials, so you can sign in immediately in local dev or a preview environment:

| Email | Password |
|---|---|
| `hafiz@seed.local`, `fatimah@seed.local`, `rizal@seed.local`, `dinda@seed.local`, `arya@seed.local` | `seedpassword123` |

The password is not a secret — seed data is for local dev and previews only, and the seed runner refuses to run under `NODE_ENV=production` without `--force`. Re-running the seeder is idempotent.

---

## Environment variables

All vars are validated at startup by `@myapp/config`. See [`deploy/.env.example`](deploy/.env.example) for the full reference.

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `8080`) |
| `APP_URL` | Public origin the app is served from |
| `DATABASE_URL` | libSQL URL (`file:` local SQLite, `libsql://` Turso). Not used on Cloudflare — the Worker binds a D1 database instead. |
| `DATABASE_AUTH_TOKEN` | Auth token for a remote `libsql://` (Turso) URL; unset for `file:` |
| `BETTER_AUTH_SECRET` | Secret for signing auth tokens (min 32 chars) |
| `BETTER_AUTH_URL` | Base URL for auth callbacks (defaults to `APP_URL`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist (defaults to `APP_URL`) |
| `ADMIN_EMAILS` | Comma-separated allowlist of team emails who can feature karya (optional; no RBAC) |
| `GEMINI_API_KEY` | Required for Node.js / Docker deployments (Gemini AI) |
| `ANTHROPIC_API_KEY` | Required only if switching `index.ts` to `createAnthropicAI` |
| `AI_WORKERS_MODEL` | Workers AI model override (default: `@cf/meta/llama-4-scout-17b-16e-instruct`) |
| `RESEND_API_KEY` | Resend email API key — the live email sender in production (the `[[send_email]]` binding needs Workers Paid and is dormant on the free tier). Also the email path for Node.js / Docker. |
| `CF_EMAIL_ACCOUNT_ID` | Cloudflare Email REST API — alternative to Resend |
| `CF_EMAIL_API_TOKEN` | Cloudflare Email REST API — alternative to Resend |
| `EMAIL_FROM` | Sender address for outgoing email (default: `Al-Fath Berkarya <noreply@buildersnetwork.web.id>`); domain must be verified with the active provider |
| `STORAGE_*` | S3-compatible object storage for the **Node/Docker** path (karya cover + screenshot uploads) — see [STORAGE_PROVIDERS.md](deploy/docs/STORAGE_PROVIDERS.md). Point at R2's S3 API for local dev. On **Cloudflare Workers**, uploads use the native R2 binding `UPLOADS` (in `wrangler.toml`) instead — run `wrangler r2 bucket create buildersnetwork-uploads` once before deploying. Absent storage → the cover/screenshot routes return 503. |
| `SERVE_STATIC` | `false` to disable Hono's static file serving (2-tier EC2 mode) |

---

## Deployment

Two deployment targets are supported. The same codebase, switched by env vars:

| Target | AI | Database | Static files | Guide |
|---|---|---|---|---|
| **Cloudflare Workers** | Workers AI (free) | D1 (SQLite binding) | Workers Assets | [DEPLOY_CLOUDFLARE.md](deploy/docs/DEPLOY_CLOUDFLARE.md) |
| **AWS EC2 2-tier (Ansible)** | Gemini API | SQLite file | nginx VM | [DEPLOY_EC2_ANSIBLE.md](deploy/docs/DEPLOY_EC2_ANSIBLE.md) |
| Fly.io | Gemini API | libSQL (Turso) | Hono static | [DEPLOY_FLY.md](deploy/docs/DEPLOY_FLY.md) |
| Railway | Gemini API | libSQL (Turso) | Hono static | [DEPLOY_RAILWAY.md](deploy/docs/DEPLOY_RAILWAY.md) |
| Render | Gemini API | libSQL (Turso) | Hono static | [DEPLOY_RENDER.md](deploy/docs/DEPLOY_RENDER.md) |
| Cloud Run | Gemini API | libSQL (Turso) | Hono static | [DEPLOY_CLOUD_RUN.md](deploy/docs/DEPLOY_CLOUD_RUN.md) |
| Coolify / Dokploy | Gemini API | SQLite file | Hono static | [DEPLOY_COOLIFY.md](deploy/docs/DEPLOY_COOLIFY.md) |
| Bare VPS (Compose) | Gemini API | SQLite file | Hono static | [DEPLOY_COMPOSE.md](deploy/docs/DEPLOY_COMPOSE.md) |

### Local single-container

```bash
docker build -f deploy/Dockerfile -t buildersnetwork .
docker run --rm -p 8080:8080 --env-file deploy/.env buildersnetwork
```

### Cloudflare Workers

```bash
wrangler login
wrangler d1 create buildersnetwork   # once — paste the database_id into wrangler.toml
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put APP_URL
wrangler secret put RESEND_API_KEY   # the live email sender ([[send_email]] needs Workers Paid; dormant on free tier)
pnpm cf:deploy
```

The Worker reaches the database through the D1 binding (`env.DB`), so there is
no `DATABASE_URL` secret. Migrations apply via
`wrangler d1 migrations apply buildersnetwork --remote` (run by `release.yml`).

### PR previews

Two independent previews, both gated on the `CLOUDFLARE_API_TOKEN` /
`CLOUDFLARE_ACCOUNT_ID` repo secrets and no-ops until those are set.

**App preview** (`preview.yml`). Every pull request **from a branch in this
repo** gets a full ephemeral environment at
`https://buildersnetwork-pr-<n>.<subdomain>.workers.dev`: its own D1 database
(created, migrated, seeded), its own R2 bucket
(`buildersnetwork-pr-<n>-uploads`), and its own Worker. A sticky comment posts
the URL and the seed credentials. Sign in with any [seed account](#seed-accounts).

Concurrent previews are **capped at 7** (a knob in `preview.yml`), counted live
from the D1 databases that exist — the free tier allows 10, prod takes one, and
the margin keeps provisioning off D1's hard limit. A PR that already has a
preview is never blocked; a PR that hits the cap gets a sticky comment telling it
to close another preview, then push or re-run.

The earlier `wrangler versions upload` shortcut was deleted (`15cdbb2`) because
it bound the preview to *production* bindings and login was broken on the
`*.workers.dev` origin. Both are fixed by isolation: each preview sets its own
`APP_URL`, which drives `BETTER_AUTH_URL` and `ALLOWED_ORIGINS` in `worker.ts`.

Preview deploys from **`wrangler.preview.toml`**, rendered in CI from
`wrangler.preview.template.toml` — a separate file rather than an
`[env.preview]` block, because `routes` is an *inheritable* wrangler key and a
preview deploying against the top-level `wrangler.toml` would try to claim the
production apex domain. Bindings are non-inheritable, so omitting
`RESEND_API_KEY`, `GOOGLE_CLIENT_ID` and `[[send_email]]` is what disables email
and Google sign-in in previews — absence is the flag.

Because applying PR-authored migrations means running PR-authored code with
database credentials, the app preview is **trusted PRs only**; fork PRs get CI
and the mockup preview. Seed data is reset on every push; the bucket is not.

**Teardown** (`preview-teardown.yml`) runs when a PR closes or merges, deleting
all three resources — the bucket emptied over the S3 API first, since R2 refuses
to delete a non-empty bucket, then deleted. A scheduled **reaper**
(`preview-reaper.yml`) is the backstop: it sweeps environments whose PR is no
longer open (derived from `d1 list` + `r2 bucket list`, since no wrangler
command lists Workers), and the 7-day object lifecycle rule catches the rest.
Both share one guarded script (`.github/scripts/preview-reaper.mjs`) whose
anchored `^buildersnetwork-pr-<n>$` name checks — unit-tested in CI against the
production names — are the only thing standing between an account-wide token and
deleting production D1/R2. Teardown and reaper additionally need the
`R2_S3_ACCESS_KEY_ID` / `R2_S3_SECRET_ACCESS_KEY` secrets (an R2 S3 token, used
only to empty buckets); they no-op until those are set.

Requires the `CLOUDFLARE_WORKERS_SUBDOMAIN` repo variable; the auth-signing
secret is generated fresh per run, not stored. Design notes:
[plans/how-to/preview-environments.md](plans/how-to/preview-environments.md).

**Mockup preview.** Any pull request that modifies `apps/mockups/**` also gets a
live static preview URL posted on it.

The mockup preview is **fork-safe** so community PRs get previews. It's split
into two workflows on purpose:

- `preview-mockups.yml` (`pull_request`, no secrets) runs the PR code to build
  the standalone gallery (`pnpm --filter mockups build` — the `apps/mockups`
  app, static, no API/DB) and uploads it as an artifact. No secret is in scope,
  so a fork PR has nothing to steal.
- `preview-mockups-deploy.yml` (`workflow_run`, trusted, has secrets) downloads
  that artifact and runs `wrangler pages deploy` to a dedicated Cloudflare
  **Pages** project. It never executes PR code, so the token stays safe.

Setup: enable "Require approval for all outside collaborators" (or first-time
contributors) in the repo's Actions settings, create the Pages project, and give
the API token the "Cloudflare Pages — Edit" permission:

```bash
wrangler pages project create buildersnetwork-mockups --production-branch=main
```

The gallery is its own Pages project, configured in `apps/mockups/wrangler.toml`
(`name`, `pages_build_output_dir`), served at **`mockups.buildersnetwork.web.id`**.
`deploy-mockups.yml` publishes it to production on every push to `main` that
touches `apps/mockups/**` (guarded on the same `CLOUDFLARE_*` secrets). To deploy
by hand — off a different branch, or before the automation is wired up:

```bash
pnpm --filter mockups deploy   # builds, then `wrangler pages deploy` (run on main)
```

The custom domain serves the **production** deployment (the `main` branch); per-PR
previews keep their own `*.buildersnetwork-mockups.pages.dev` URLs. Pages custom
domains can't live in
`wrangler.toml` — attach it once via the dashboard (Pages → project → Custom
domains) or the API (the zone is already in this account, so the CNAME is
auto-created):

```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/buildersnetwork-mockups/domains" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"mockups.buildersnetwork.web.id"}'
```

The preview-deploy workflow deliberately does **not** read the config: it passes
`--project-name`/`--branch` on the CLI so the trusted job never trusts config
from a forked PR (keep the project name in the two places in sync).

### EC2 2-tier (Ansible)

```bash
# 1. Build and transfer the API image to the backend EC2 VM
docker build -f deploy/Dockerfile.api -t buildersnetwork-api .

# 2. Build the frontend with the backend VM's address
VITE_API_URL=http://<BACKEND_IP>:8080 pnpm build:frontend

# 3. Fill in deploy/ansible/inventory.ini and group_vars/, then deploy
cd deploy/ansible
ansible-playbook -i inventory.ini playbooks/site.yml --ask-vault-pass
```

---

## Database

One SQLite dialect (`sqlite-core`) runs on all backends: **D1** on Cloudflare
Workers, **libSQL** (a `file:` SQLite or a remote Turso database) on Node.

- **Schema**: `libs/db/src/schema/*.ts` — add a file per entity, re-export from `index.ts`
- **Auth schema**: auto-generated by `pnpm better-auth:generate` — treat as read-only output; put your own tables in `app.ts` and point FKs at the generated `users` table
- **Local dev**: `pnpm db:push` syncs the schema straight to a local `file:` SQLite database
- **Production (Node)**: `pnpm db:generate` writes migration files to `libs/db/migrations/`; applied by `node dist/scripts/migrate.js` as a deploy step
- **Production (Cloudflare)**: the same migrations apply to D1 via `wrangler d1 migrations apply buildersnetwork --remote`

---

## Design system

Hyper-minimalist. Neutral gallery-white background, Lora (serif) for display/headings + Plus Jakarta Sans for UI, IBM Plex Mono for AI voice, a single terracotta accent, hairline dividers, heavy whitespace. All UI copy is Bahasa Indonesia kasual. Tokens live as CSS custom properties in `apps/app/src/index.css` (`--bg`, `--ink`, `--accent`, `--font`, `--font-display`, `--mono`), adopted from the Launchpad mockup (`apps/mockups/src/screens/Launchpad.tsx`).

---

## Contributing

Team workflow (milestones → task issues → project board) is defined in [plans/how-to/build-workflow.md](plans/how-to/build-workflow.md); roadmap in [plans/roadmap.md](plans/roadmap.md). One-time setup beyond Quick start: `gh auth login`, then `gh auth refresh -s project,read:project`. Claude Code users get the loop as repo skills: `/project-status` (where we are — phase, milestone countdowns, board), `/pick-task` (claim + load context), `/ship-task` (PR + board update).

---

## License

MIT
