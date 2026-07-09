import "dotenv/config";
import { loadConfig } from "@myapp/config";
import { createDb, runSeedCli, seeders } from "@myapp/db";

/**
 * Seed CLI. Reads DATABASE_URL via @myapp/config, builds a libSQL client, and
 * dispatches to the seed runner in @myapp/db. The runner parses flags from
 * process.argv:
 *
 *   pnpm db:seed                           # run all seeders
 *   pnpm db:seed -- --only items           # run a single seeder
 *   pnpm db:seed -- --reset --yes          # empty tables then re-seed
 *   pnpm db:seed -- --list                 # list registered seeders
 *   pnpm db:seed -- --help                 # full usage
 *
 * DATABASE_URL is a libSQL URL — `file:./local.db` locally, `libsql://…` for a
 * remote Turso database. Seeding a Cloudflare D1 database is a separate path
 * (create → migrate → seed → delete per PR; see issue #23).
 *
 * Production safety: refuses to run when NODE_ENV=production unless
 * `--force` is also passed.
 */
await runSeedCli({
  loadConfig: () => {
    const config = loadConfig();
    const db = createDb(config.DATABASE_URL, {
      authToken: config.DATABASE_AUTH_TOKEN,
    });
    return {
      db,
      isProduction: config.NODE_ENV === "production",
      close: () => db.$client.close(),
    };
  },
  seeders,
});
