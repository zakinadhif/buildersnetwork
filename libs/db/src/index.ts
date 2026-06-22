import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema";

export type DbDriver = "postgres-js" | "neon-http";

/**
 * Creates a Drizzle client.
 *
 * - `postgres-js` (default): full TCP connection via postgres-js. Works in
 *   Node.js / Docker / EC2.
 * - `neon-http`: Neon's serverless HTTP driver. Works in Cloudflare Workers
 *   (no raw TCP sockets). Requires a Neon database URL.
 */
export const createDb = (url: string, driver: DbDriver = "postgres-js") => {
  if (driver === "neon-http") {
    const sql = neon(url);
    return drizzleNeon(sql, { schema });
  }
  const client = postgres(url);
  return drizzle(client, { schema });
};

export type Db = ReturnType<typeof createDb>;

/**
 * Runs pending SQL migrations. Always uses postgres-js (TCP) — intended for
 * one-shot deploy steps, not runtime request handling.
 */
export async function runMigrations(url: string, migrationsFolder: string) {
  const client = postgres(url, { max: 1 });
  try {
    await migrate(drizzle(client), { migrationsFolder });
  } finally {
    await client.end();
  }
}

export { type AtomicExec, atomicWrite } from "./atomic";
export { dedupeBySlug, slugifyInterest } from "./interests";
export { KARYA_STAGES, type KaryaStage, normalizeStages } from "./karya";
export { normalizePostKind, POST_KINDS, type PostKind } from "./posts";
export type { SeedContext, SeedDb, Seeder } from "./seed";
export { runSeedCli, seeders } from "./seed";
