import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import type { Db } from "../index";

/**
 * The db handle passed to a seeder. This is the parameter type of
 * `db.transaction(cb)` — i.e. a `SQLiteTransaction` over the project's schema.
 * Seeders always receive a transaction, so a partial failure rolls back
 * the seeder's writes (and any prior `--reset` deletes in the same run).
 */
export type SeedDb = Parameters<Parameters<Db["transaction"]>[0]>[0];

export interface SeedContext {
  db: SeedDb;
  /** Indented logger scoped to the current seeder. */
  log: (msg: string) => void;
}

export interface Seeder {
  /** Stable identifier used by `--only` and in log lines. */
  name: string;
  /** Optional short description shown by `--list`. */
  description?: string;
  /**
   * Tables this seeder owns. When `--reset` is passed, the runner empties these
   * inside the seeder's transaction before invoking `run`. Omit to opt out of
   * `--reset` for this seeder.
   */
  tables?: readonly AnySQLiteTable[];
  run(ctx: SeedContext): Promise<void>;
}
