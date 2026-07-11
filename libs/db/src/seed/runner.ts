import { parseArgs } from "node:util";
import { getTableName } from "drizzle-orm";
import type { D1HttpDb } from "../d1-http";
import type { Db } from "../index";
import type { SeedDb, Seeder } from "./types";

/** Any client the runner can drive: libSQL on Node, or D1 over its HTTP API. */
export type SeedRunnerDb = Db | D1HttpDb;

export interface SeedRuntimeConfig {
  /**
   * An already-constructed client. The runner is deliberately written against
   * the driver-agnostic `Db` type rather than any one vendor's CLI, so seeding
   * a remote libSQL/Turso or D1 database from Node stays possible without
   * changing this file.
   */
  db: SeedRunnerDb;
  /** When true, refuse to run without `--force`; require `--yes` for `--reset`. */
  isProduction: boolean;
  /**
   * Whether the driver has interactive transactions. Defaults to true.
   *
   * D1 has none — at any layer. `sqlite-proxy` fakes `transaction()` by issuing
   * `begin`/`commit` as ordinary statements, which D1 rejects. When false, each
   * seeder's `--reset` deletes and inserts run unwrapped: a seeder that fails
   * halfway leaves its tables partly written. That is acceptable only because
   * the run is against a disposable preview database whose next push re-seeds it
   * from scratch. Never pass false for a database anyone relies on.
   */
  supportsTransactions?: boolean;
  /** Optional teardown for the underlying client, run after the last seeder. */
  close?: () => void | Promise<void>;
}

export interface RunSeedOptions {
  /**
   * Called lazily — only when a command actually needs to connect (so
   * `--help` and `--list` work in a fresh checkout with no `.env`).
   */
  loadConfig: () => SeedRuntimeConfig;
  seeders: readonly Seeder[];
  /** Defaults to `process.argv.slice(2)`. */
  argv?: string[];
}

interface ParsedFlags {
  only: string[];
  reset: boolean;
  force: boolean;
  yes: boolean;
  list: boolean;
  help: boolean;
}

const HELP = `Usage: seed [options]

Options:
  --only <name>     Run only the named seeder (repeatable)
  --reset           Empty each seeder's tables before running it
  --force           Allow running when NODE_ENV=production
  --yes             Confirm destructive flags (required with --reset)
  --list            List available seeders and exit
  -h, --help        Show this help and exit

Examples:
  pnpm db:seed
  pnpm db:seed -- --only items
  pnpm db:seed -- --reset --yes
  pnpm db:seed -- --force --reset --yes      # production (be careful)

Seed accounts:
  The members seeder creates Better Auth credentials for each seed user, so
  they can sign in with email + password (needed to review anything behind
  auth in a preview environment).

    email     hafiz@seed.local, fatimah@seed.local, rizal@seed.local,
              dinda@seed.local, arya@seed.local
    password  seedpassword123

  Not a secret: seed data is for local dev and previews only, and this runner
  refuses to run under NODE_ENV=production without --force.
`;

/**
 * SQLite has no `TRUNCATE`. An unfiltered `DELETE FROM` is the equivalent, and
 * needs no `CASCADE` keyword: SQLite enforces `ON DELETE CASCADE` for us —
 * libSQL and D1 both have `PRAGMA foreign_keys` on by default. There is no
 * `RESTART IDENTITY` analogue and no purpose for one here: every table keys on
 * a `text` id, so there are no sequences to reset.
 *
 * Tables are emptied children-first (reverse of declaration order) so the
 * result doesn't depend on cascade doing the work.
 */
async function emptyTables(
  tx: SeedDb,
  tables: NonNullable<Seeder["tables"]>,
): Promise<void> {
  for (const table of [...tables].reverse()) {
    await tx.delete(table);
  }
}

function parseFlags(argv: string[]): ParsedFlags {
  const { values } = parseArgs({
    args: argv,
    options: {
      only: { type: "string", multiple: true },
      reset: { type: "boolean" },
      force: { type: "boolean" },
      yes: { type: "boolean" },
      list: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });
  return {
    only: (values.only as string[] | undefined) ?? [],
    reset: values.reset === true,
    force: values.force === true,
    yes: values.yes === true,
    list: values.list === true,
    help: values.help === true,
  };
}

function selectSeeders(
  all: readonly Seeder[],
  only: string[],
): readonly Seeder[] {
  if (only.length === 0) return all;
  const known = new Set(all.map((s) => s.name));
  const unknown = only.filter((n) => !known.has(n));
  if (unknown.length > 0) {
    const available = all.map((s) => s.name).join(", ");
    throw new Error(
      `Unknown seeder(s): ${unknown.join(", ")}. Available: ${available}`,
    );
  }
  // Preserve registry order (matters for FK dependencies).
  const wanted = new Set(only);
  return all.filter((s) => wanted.has(s.name));
}

function formatList(seeders: readonly Seeder[]): string {
  if (seeders.length === 0) return "(no seeders registered)";
  const width = Math.max(...seeders.map((s) => s.name.length));
  return seeders
    .map((s) => {
      const tables = s.tables?.map((t) => getTableName(t)).join(", ") ?? "—";
      const desc = s.description ?? "";
      return `  ${s.name.padEnd(width)}  tables: ${tables}${desc ? `  · ${desc}` : ""}`;
    })
    .join("\n");
}

/**
 * CLI entrypoint for seeding. Parses flags from `argv`, applies safety guards,
 * then runs the selected seeders one at a time, each inside its own transaction.
 *
 * Safety:
 *   - Refuses to run when `isProduction` is true unless `--force` is passed.
 *   - Refuses `--reset` unless `--yes` is also passed.
 *
 * Exits the process via `throw` on error — callers should let it bubble so
 * the non-zero exit code reaches the shell.
 */
export async function runSeedCli(opts: RunSeedOptions): Promise<void> {
  // Strip `--` separators. `pnpm db:seed -- --reset --yes` forwards through two
  // `pnpm run` hops (root script -> api script), and the inner one receives the
  // separator as a literal argv entry. `parseArgs` reads `--` as end-of-options
  // and reports every flag after it as a positional, which `allowPositionals:
  // false` then rejects — so every documented `pnpm db:seed -- <flag>` form
  // fails from the repo root without this.
  const argv = (opts.argv ?? process.argv.slice(2)).filter((a) => a !== "--");
  let flags: ParsedFlags;
  try {
    flags = parseFlags(argv);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`seed: ${msg}\n\n${HELP}`);
    throw err;
  }

  if (flags.help) {
    process.stdout.write(HELP);
    return;
  }

  if (flags.list) {
    process.stdout.write(`Registered seeders:\n${formatList(opts.seeders)}\n`);
    return;
  }

  if (flags.reset && !flags.yes) {
    throw new Error("seed: --reset empties tables. Pass --yes to confirm.");
  }

  const selected = selectSeeders(opts.seeders, flags.only);
  if (selected.length === 0) {
    process.stdout.write("seed: nothing to run\n");
    return;
  }

  const config = opts.loadConfig();

  if (config.isProduction && !flags.force) {
    throw new Error(
      "seed: refusing to run with NODE_ENV=production. Pass --force to override.",
    );
  }

  const { db } = config;

  const startedAll = Date.now();
  process.stdout.write(
    `seed: running ${selected.length} seeder(s)${flags.reset ? " (with --reset)" : ""}\n`,
  );

  try {
    for (const seeder of selected) {
      const started = Date.now();
      process.stdout.write(`  → ${seeder.name}\n`);

      const runOne = async (handle: SeedDb) => {
        if (flags.reset && seeder.tables && seeder.tables.length > 0) {
          const names = seeder.tables.map((t) => getTableName(t)).join(", ");
          process.stdout.write(`    reset: emptying ${names}\n`);
          await emptyTables(handle, seeder.tables);
        }
        await seeder.run({
          db: handle,
          log: (m) => process.stdout.write(`    ${m}\n`),
        });
      };

      if (config.supportsTransactions === false) {
        // No transaction to open. A seeder only ever needs insert/delete/select,
        // so the base handle satisfies `SeedDb` structurally.
        await runOne(db as unknown as SeedDb);
      } else {
        await (db as Db).transaction(runOne);
      }

      process.stdout.write(`    ok (${Date.now() - started}ms)\n`);
    }
    process.stdout.write(`seed: done in ${Date.now() - startedAll}ms\n`);
  } finally {
    await config.close?.();
  }
}
