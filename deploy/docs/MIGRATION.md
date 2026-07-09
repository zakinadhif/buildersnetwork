# Database migrations & moving between managed/self-hosted

## How migrations work here

- Schema lives in `libs/db/src/schema/*.ts` (Drizzle, SQLite dialect).
- `pnpm db:generate` writes SQL migration files to `libs/db/migrations/`.
  **Commit these.**
- The image copies `libs/db/migrations` to `/app/migrations`.
- On **Node** targets (a `file:` SQLite or a remote Turso database) migrations
  are applied by a **separate one-shot step**, never on app startup:
  `node dist/scripts/migrate.js`. Each platform wires this up:
  - Fly: `release_command` in `fly.toml`
  - Railway / Render: `preDeployCommand`
  - Cloud Run: a Cloud Run **Job** run before traffic shifts
  - Compose / Ansible: the `migrate` service / container
- On **Cloudflare** the database is D1, which has its own runner:
  `wrangler d1 migrations apply buildersnetwork --remote` (wired into
  `.github/workflows/release.yml`) reads the same `libs/db/migrations` dir.
- Local dev can skip migration files and use `pnpm db:push` to sync the schema
  directly to a local `file:` SQLite database.

## First-time setup (auth tables included)

Better Auth owns its own tables. Generate them into the schema, then create the
migration:

```bash
pnpm better-auth:generate          # writes libs/db/src/schema/auth.ts
# uncomment `export * from "./auth"` in libs/db/src/schema/index.ts
pnpm db:generate                   # emits SQL into libs/db/migrations
git add libs/db/src/schema/auth.ts libs/db/migrations
```

## Moving the database between D1, Turso, and a file

The schema is one SQLite dialect (`sqlite-core`), so the *same* migrations and
application code run on all three backends — D1 on Workers, a managed
Turso/libSQL database for a Node deploy, or a plain `file:` SQLite for
self-host. "No code change to switch" is a property of the dialect plus the S3
storage adapter; only the bindings/env and the data move.

Move the data with SQLite's own dump/restore — no dialect translation:

1. **Export from the source.**
   - D1: `wrangler d1 export buildersnetwork --remote --output=dump.sql`
   - Turso: `turso db shell <db> .dump > dump.sql`
   - file: `sqlite3 local.db .dump > dump.sql`
2. **Load into the target.**
   - D1: `wrangler d1 execute buildersnetwork --remote --file=dump.sql`
   - Turso: `turso db shell <db> < dump.sql`
   - file: `sqlite3 app.db < dump.sql`
3. Copy bucket contents: `rclone copy r2:bucket minio:bucket`.
4. Update the bindings/env: the `[[d1_databases]]` binding for Workers, or
   `DATABASE_URL` (+ `DATABASE_AUTH_TOKEN` for a remote `libsql://`) for Node;
   plus `STORAGE_*`.
5. Deploy.
