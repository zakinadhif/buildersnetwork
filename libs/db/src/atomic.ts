import type { Db } from "./index";

/**
 * The write surface an atomic block uses. Shared by the base `Db` and a
 * transaction handle, so {@link atomicWrite}'s callback works under either
 * driver.
 */
export type AtomicExec = Pick<Db, "insert" | "update" | "delete">;

/**
 * Run a set of write statements atomically, abstracting over the two drivers we
 * ship:
 *
 * - `postgres-js` (Node) supports interactive transactions → wrap in
 *   `transaction()`.
 * - `neon-http` (Cloudflare Workers) has *no* interactive transactions — calling
 *   `transaction()` throws "No transactions support in neon-http driver". Its
 *   `batch()` runs the queries in a single implicit transaction, so we use that
 *   for the same all-or-nothing guarantee.
 *
 * `build` must return statements that don't depend on one another's results —
 * resolve any reads *before* calling this (see `resolveInterestIds`). That's what
 * lets the same list run as a `batch` array or a sequential `transaction`.
 */
export async function atomicWrite(
  db: Db,
  build: (e: AtomicExec) => unknown[],
): Promise<void> {
  // Only the neon-http driver exposes `batch`; postgres-js does not.
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
