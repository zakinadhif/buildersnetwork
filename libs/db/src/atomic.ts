import type { Db } from "./index";

/**
 * The write surface an atomic block uses. Shared by the base `Db` and a
 * transaction handle, so {@link atomicWrite}'s callback works under either
 * driver.
 */
export type AtomicExec = Pick<Db, "insert" | "update" | "delete">;

/**
 * Run a set of write statements atomically, abstracting over how a driver gets
 * its all-or-nothing guarantee:
 *
 * - Drivers exposing `batch()` (both the ones we ship — `libsql` on Node and
 *   `d1` on Cloudflare Workers) run the queries in a single implicit
 *   transaction. D1 has no interactive transactions at all, so this is the only
 *   path there.
 * - Anything else falls back to an interactive `transaction()`. Note this
 *   requires a driver whose `transaction()` awaits an async callback; a
 *   *synchronous* one (e.g. `better-sqlite3`, whose native `transaction()`
 *   rejects a promise-returning function) will not work here.
 *
 * `build` must return statements that don't depend on one another's results —
 * resolve any reads *before* calling this (see `resolveInterestIds`). That's what
 * lets the same list run as a `batch` array or a sequential `transaction`.
 */
export async function atomicWrite(
  db: Db,
  build: (e: AtomicExec) => unknown[],
): Promise<void> {
  // Both shipped drivers (libsql, d1) expose `batch`.
  const batch = (db as { batch?: unknown }).batch;
  if (typeof batch === "function") {
    const stmts = build(db as AtomicExec);
    if (stmts.length === 0) return;
    await (batch as (q: readonly unknown[]) => Promise<unknown>).call(
      db,
      stmts,
    );
    return;
  }

  await (
    db as {
      transaction: (fn: (tx: AtomicExec) => Promise<void>) => Promise<void>;
    }
  ).transaction(async (tx) => {
    for (const stmt of build(tx)) {
      await stmt;
    }
  });
}
