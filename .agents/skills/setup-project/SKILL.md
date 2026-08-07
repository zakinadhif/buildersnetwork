---
name: setup-project
description: Set up and verify Builders Network for local development from a new or existing clone. Use when onboarding a contributor, preparing a fresh clone, installing prerequisites or dependencies, configuring the local environment and SQLite database, starting the API and SPA, diagnosing setup failures, or checking that a workstation is ready to contribute.
---

# Set up Builders Network

Establish a reproducible local environment, prove that the app runs, and explain failures with evidence. Treat `package.json`, `.nvmrc`, runtime configuration, and current code as authoritative; use `README.md` for orientation.

## Protect existing work

1. Resolve the repository root and inspect `git status --short`.
2. Never overwrite an existing `apps/api/.env` or `libs/db/local.db`. The environment helper only fills a missing local auth secret; database commands may change local data, so ask before resetting or deleting it.
3. If asked to test a fresh clone, clone `origin` into a unique temporary directory outside the current worktree. Run every setup command there. Keep the clone until diagnostics are captured, then remove it when the user requested a disposable test.

## Preflight prerequisites

Run:

```bash
git --version
node --version
pnpm --version
```

Require Node.js 24 or newer (`.nvmrc` is `24`) and pnpm 10 or newer; `package.json` pins pnpm 11.9.0. Prefer the user's Node version manager or Corepack rather than silently installing global software. If pnpm reports an engine warning with a different Node version than `node --version`, inspect command resolution (`where node` / `where pnpm` on Windows, `command -v` on Unix) and fix the mismatched shim before continuing.

For the GitHub task workflow, also require GitHub CLI 2.94.0 or newer because native issue dependencies are used. Local app development does not require `gh`.

## Install and configure

From the repository root, run each command separately and stop on the first failure:

```bash
pnpm install --frozen-lockfile
pnpm codegen
node .agents/skills/setup-project/scripts/configure-local-env.mjs
pnpm db:push
pnpm db:seed
node .agents/skills/setup-project/scripts/doctor.mjs
```

`configure-local-env.mjs` copies `deploy/.env.example` only when `apps/api/.env` is absent and generates a local `BETTER_AUTH_SECRET` without printing it. It preserves every existing nonblank secret. `pnpm codegen` is mandatory on a fresh clone because generated API client and Zod files are ignored by Git.

Do not require Docker, cloud credentials, storage credentials, email credentials, or an AI key for the ordinary local loop. Local uploads use `apps/api/.data/uploads/`; AI-specific behavior needs `GEMINI_API_KEY` when exercised.

## Start and prove the local loop

Start two long-running terminals:

```bash
pnpm dev:api
pnpm dev:app
```

Wait for the API to report port 8080 and Vite to report port 5173. Then run:

```bash
node .agents/skills/setup-project/scripts/doctor.mjs --running
```

The proof must cover the API health endpoint, the SPA, and the SPA's `/api` proxy. A `serveStatic` warning about a missing `apps/api/public/spa` directory is expected during split dev-server operation; the Vite server owns frontend assets.

Tell the contributor to open `http://localhost:5173/app/` and sign in with any seed account listed in `README.md` (password `seedpassword123`). Keep the servers running for the contributor; stop only verification processes that the agent itself launched in a disposable clone.

## Verify contribution readiness

Run the checks relevant to the contributor's intended work. For a full first-time verification, run:

```bash
pnpm lint
pnpm test:db
pnpm test:api
pnpm test:app
pnpm build:frontend
pnpm test:e2e
```

Report each pass or failure independently. Do not hide a repository failure behind a combined command. The end-to-end suite starts its own Vite server and uses Chromium; if Playwright reports a missing browser, run `pnpm exec playwright install chromium` only after explaining that it downloads a browser.

## Enable the team workflow

When the contributor will use project-board skills, run:

```bash
gh auth login
gh auth refresh -s project,read:project
node .agents/skills/setup-project/scripts/doctor.mjs --github
```

Authentication is interactive and belongs to the contributor. Never request, print, or reuse their token. After success, point them to `$project-status` and `$pick-task`; do not claim a task unless they ask.

## Diagnose common failures

- Generated-module import errors: rerun `pnpm codegen` and verify both generated output trees.
- Blank feed with a healthy API: confirm `apps/api/.env` uses `DATABASE_URL=file:../../libs/db/local.db`, then rerun `pnpm db:push` and `pnpm db:seed` without deleting the database.
- Auth startup error: run the environment helper and verify `BETTER_AUTH_SECRET` is at least 32 characters; never echo its value.
- Registry/network errors during install: distinguish proxy, DNS, certificate, and permission failures. Do not weaken TLS or supply-chain checks.
- `EPERM`/`EACCES` in a temporary or agent sandbox: retry only with the user's approval outside that sandbox; do not label it a repository defect until it reproduces in the contributor's normal shell.
- Windows long-path errors under `node_modules`: recommend enabling Git/Windows long paths rather than relocating generated packages by hand.

Finish with the versions used, commands run, URLs verified, checks passed/failed, and any optional capability still unconfigured. Never claim setup succeeded unless the health checks pass.
