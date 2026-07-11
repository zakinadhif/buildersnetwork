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

## Backmerging a branch across a migration squash

If a long-lived branch adds its own migration (e.g. a new table) and `main`
later **squashes** the migration history (as `cf2fc7d` did for the
Postgres→SQLite move), merging `main` into that branch can go "clean" —
no conflict markers — while leaving the migration set broken:

- The branch's migration file/snapshot predates the squash, so it's still
  written in the old dialect (e.g. Postgres `ALTER TABLE ... ADD CONSTRAINT`,
  `USING btree`, `timestamp DEFAULT now()` instead of SQLite syntax). It never
  conflicts with the new squashed baseline because the two touch different
  files (`libs/db/migrations/000N_*.sql` vs. the new `0000_*.sql`) — git just
  keeps both.
- Same story in `libs/db/src/schema/*.ts`: a table added on the branch (e.g.
  `pgTable(...)`) can merge verbatim into a file the squash converted to
  `sqliteTable(...)`, leaving one table definition in the old dialect next to
  everything else in the new one.
- The result type-checks fine (drizzle's table builders return compatible
  shapes) and often builds fine, but the migration is invalid SQL on the
  actual runtime (D1/libSQL) and `pnpm db:generate` will refuse to run over
  the mismatched snapshot version until it's cleaned up.

**After backmerging `main` into a branch with its own migrations**, check for
this before trusting a clean merge:

```bash
grep -rn "pgTable\|timestamp(" libs/db/src/schema/*.ts   # dialect leftovers
pnpm db:check                                            # journal/file mismatch
pnpm db:generate                                         # errors on stale snapshot version
```

Fix by deleting the branch's stale migration `.sql` + its `meta/000N_snapshot.json`,
removing its entry from `meta/_journal.json`, converting any leftover
`pgTable`/`timestamp()` table definitions to `sqliteTable`/`integer(...,
{ mode: "timestamp_ms" })`, then re-running `pnpm db:generate` to emit a
correct migration on top of the new squashed baseline. Confirm with
`pnpm db:check` and the package's test suite before pushing.

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
