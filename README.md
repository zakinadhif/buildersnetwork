# Al-Fath Berkarya

Community platform for builder students at Telkom University. Students discover collaborators through an AI-powered onboarding chat, get matched with compatible members, and explore the community directory.

---

## Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 22 |
| **API** | Hono v4 |
| **Database ORM** | Drizzle ORM (PostgreSQL) |
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
│   ├── db/        # Drizzle schema + postgres-js / Neon HTTP clients
│   └── storage/   # S3-compatible / GCS storage adapters
└── deploy/
    ├── Dockerfile            # Single-container image (API + SPA + landing)
    ├── Dockerfile.api        # API-only image for 3-tier EC2 deployment
    ├── ansible/              # 3-tier EC2 deployment (database / api / web VMs)
    ├── docker-compose.dev.yml
    ├── docker-compose.selfhost.yml
    └── docs/
```

### App flow

```
Welcome → Login → VerifyEmail → Onboarding (AI chat, 8–10 turns) → Review (editable profile) → Matches (3 AI-picked members) → CommunityHome → MemberProfile
```

All screens are URL-routed via Wouter (`/welcome`, `/onboarding`, `/review`, `/matches`, `/home`, `/member/:id`).

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

# Start local backing services (Postgres + MinIO)
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
| `pnpm db:push` | Push Drizzle schema to Postgres |
| `pnpm db:generate` | Write SQL migration files from schema changes |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Run seeders against `DATABASE_URL` |
| `pnpm format` | Format with Biome |
| `pnpm lint` | Lint with Biome |
| `pnpm test:api` | Run Vitest unit tests |
| `pnpm build:frontend` | Build SPA + landing (runs codegen first) |
| `pnpm cf:deploy` | Build everything and deploy to Cloudflare Workers |

---

## Environment variables

All vars are validated at startup by `@myapp/config`. See [`deploy/.env.example`](deploy/.env.example) for the full reference.

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `8080`) |
| `APP_URL` | Public origin the app is served from |
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Secret for signing auth tokens (min 32 chars) |
| `BETTER_AUTH_URL` | Base URL for auth callbacks (defaults to `APP_URL`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist (defaults to `APP_URL`) |
| `GEMINI_API_KEY` | Required for Node.js / Docker deployments (Gemini AI) |
| `ANTHROPIC_API_KEY` | Required only if switching `index.ts` to `createAnthropicAI` |
| `AI_WORKERS_MODEL` | Workers AI model override (default: `@cf/meta/llama-3.1-8b-instruct`) |
| `RESEND_API_KEY` | Resend email API key (preferred for Node.js / Docker) |
| `CF_EMAIL_ACCOUNT_ID` | Cloudflare Email REST API — alternative to Resend |
| `CF_EMAIL_API_TOKEN` | Cloudflare Email REST API — alternative to Resend |
| `STORAGE_*` | S3-compatible object storage — see [STORAGE_PROVIDERS.md](deploy/docs/STORAGE_PROVIDERS.md) |
| `SERVE_STATIC` | `false` to disable Hono's static file serving (3-tier EC2 mode) |

---

## Deployment

Two deployment targets are supported. The same codebase, switched by env vars:

| Target | AI | DB driver | Static files | Guide |
|---|---|---|---|---|
| **Cloudflare Workers** | Workers AI (free) | Neon HTTP | Workers Assets | [DEPLOY_CLOUDFLARE.md](deploy/docs/DEPLOY_CLOUDFLARE.md) |
| **AWS EC2 3-tier (Ansible)** | Gemini API | postgres-js | nginx VM | [DEPLOY_EC2_ANSIBLE.md](deploy/docs/DEPLOY_EC2_ANSIBLE.md) |
| Fly.io | Gemini API | postgres-js | Hono static | [DEPLOY_FLY.md](deploy/docs/DEPLOY_FLY.md) |
| Railway | Gemini API | postgres-js | Hono static | [DEPLOY_RAILWAY.md](deploy/docs/DEPLOY_RAILWAY.md) |
| Render | Gemini API | postgres-js | Hono static | [DEPLOY_RENDER.md](deploy/docs/DEPLOY_RENDER.md) |
| Cloud Run | Gemini API | postgres-js | Hono static | [DEPLOY_CLOUD_RUN.md](deploy/docs/DEPLOY_CLOUD_RUN.md) |
| Coolify / Dokploy | Gemini API | postgres-js | Hono static | [DEPLOY_COOLIFY.md](deploy/docs/DEPLOY_COOLIFY.md) |
| Bare VPS (Compose) | Gemini API | postgres-js | Hono static | [DEPLOY_COMPOSE.md](deploy/docs/DEPLOY_COMPOSE.md) |

### Local single-container

```bash
docker build -f deploy/Dockerfile -t buildersnetwork .
docker run --rm -p 8080:8080 --env-file deploy/.env buildersnetwork
```

### Cloudflare Workers

```bash
wrangler login
wrangler secret put DATABASE_URL
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put APP_URL
pnpm cf:deploy
```

### EC2 3-tier (Ansible)

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

- **Schema**: `libs/db/src/schema/*.ts` — add a file per entity, re-export from `index.ts`
- **Auth schema**: auto-generated by `pnpm better-auth:generate` — do not edit manually
- **Local dev**: `pnpm db:push` syncs schema directly
- **Production**: `pnpm db:generate` writes migration files to `libs/db/migrations/`; applied by `node dist/scripts/migrate.js` as a deploy step

---

## Design system

Hyper-minimalist. Warm off-white background (`#f1efe9`), Plus Jakarta Sans for UI, IBM Plex Mono for AI voice. No decoration, heavy whitespace. All UI copy is Bahasa Indonesia kasual.

---

## License

MIT
