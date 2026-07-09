import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema";

export interface CreateDbOptions {
  /** Turso auth token. Only needed for a remote `libsql://` URL. */
  authToken?: string;
}

/**
 * Creates a Drizzle client over libSQL — the Node-side driver.
 *
 * `url` is a libSQL URL:
 * - `file:./local.db` — an on-disk SQLite file (local dev, single-node self-host)
 * - `:memory:`        — ephemeral, used by tests
 * - `libsql://…`      — a remote Turso database (pass `authToken`)
 *
 * Inside a Cloudflare Worker there is no client to construct: bind a D1 database
 * and hand the binding straight to `drizzle-orm/d1` (see `apps/api/src/worker.ts`).
 * Both drivers speak the same SQLite dialect and both expose `batch()`, which is
 * what lets `atomicWrite` stay driver-agnostic.
 */
export const createDb = (url: string, options: CreateDbOptions = {}) => {
  const client = createClient({ url, authToken: options.authToken });
  return drizzle(client, { schema });
};

export type Db = ReturnType<typeof createDb>;

/**
 * Runs pending SQL migrations. Intended for one-shot deploy steps, not runtime
 * request handling. Migrating a *D1* database is a separate path — `wrangler d1
 * migrations apply`, or drizzle-kit's `d1-http` driver from CI.
 */
export async function runMigrations(
  url: string,
  migrationsFolder: string,
  options: CreateDbOptions = {},
) {
  const client = createClient({ url, authToken: options.authToken });
  try {
    await migrate(drizzle(client), { migrationsFolder });
  } finally {
    client.close();
  }
}

export { type AtomicExec, atomicWrite } from "./atomic";
export { dedupeBySlug, slugifyInterest } from "./interests";
export { KARYA_STAGES, type KaryaStage, normalizeStages } from "./karya";
export { normalizePostKind, POST_KINDS, type PostKind } from "./posts";
export type { SeedContext, SeedDb, Seeder } from "./seed";
export { runSeedCli, seeders } from "./seed";
