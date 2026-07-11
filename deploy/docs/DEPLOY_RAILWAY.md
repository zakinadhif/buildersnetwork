# Deploy to Railway

Manifest: [`deploy/railway.json`](../railway.json)

## Prerequisites
- A Railway account and project
- (Optional) the Railway CLI: `npm i -g @railway/cli && railway login`

## Initial setup
1. Create a new service from your GitHub repo.
2. Settings → Config: point the config path at `deploy/railway.json` (it sets the
   Dockerfile, start command, health check, and `preDeployCommand`).
3. Provision a managed libSQL/Turso database (Railway has no first-party SQLite
   plugin — create one on Turso and copy its `libsql://` URL + auth token).
4. Variables → add everything from [`deploy/.env.example`](../.env.example):
   `APP_URL`, `DATABASE_URL` (the `libsql://` URL), `DATABASE_AUTH_TOKEN`,
   `BETTER_AUTH_SECRET`, `STORAGE_*`, etc.

## First deploy
Trigger a deploy (push to the connected branch, or `railway up`). The
`preDeployCommand` runs `node dist/scripts/migrate.js` before the new release.

## Subsequent deploys
Push to the connected branch.

## Rollback
Railway dashboard → Deployments → pick a previous deployment → "Redeploy".

## Cost (rough)
- 100 MAU: hobby plan ≈ $5/mo + Turso free tier
- 1k MAU: ≈ $10–20/mo
- 10k MAU: ≈ $40–80/mo depending on the Turso tier
