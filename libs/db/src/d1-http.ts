import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

export interface D1HttpOptions {
  accountId: string;
  databaseId: string;
  /** A Cloudflare API token with D1 edit permission on the account. */
  apiToken: string;
}

interface D1RawResponse {
  success: boolean;
  errors?: { code: number; message: string }[];
  result?: { results?: { columns: string[]; rows: unknown[][] } }[];
}

/**
 * Creates a Drizzle client that reaches a *remote* D1 database over Cloudflare's
 * HTTP API, from Node — the one thing neither shipped driver can do. `@libsql/client`
 * cannot dial D1, and `drizzle-orm/d1` needs a Worker binding that does not exist
 * in a CI runner. Without this, seeding a preview database means dumping a local
 * SQLite file and transplanting the bytes with `wrangler d1 execute`.
 *
 * Uses `/raw`, not `/query`: `sqlite-proxy` maps result rows positionally against
 * the selected fields, so it needs D1's array-of-arrays rows. `/query` returns
 * row objects, which silently map to `undefined` columns.
 *
 * The returned handle has NO interactive transactions. `sqlite-proxy` implements
 * `transaction()` by issuing `begin`/`commit` as separate statements, and D1
 * rejects both — it has no interactive transactions at any layer. Pass
 * `supportsTransactions: false` when handing this to the seed runner.
 */
export const createD1HttpDb = (options: D1HttpOptions) => {
  const endpoint =
    `https://api.cloudflare.com/client/v4/accounts/${options.accountId}` +
    `/d1/database/${options.databaseId}/raw`;

  return drizzle(
    async (sql, params, method) => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params }),
      });

      const body = (await response.json()) as D1RawResponse;

      if (!response.ok || !body.success) {
        const detail =
          body.errors?.map((e) => `${e.code}: ${e.message}`).join("; ") ??
          `HTTP ${response.status}`;
        // D1 caps bound parameters at 100 per query; libSQL allows 32766, so a
        // multi-row insert can pass locally and only fail here. Say so, because
        // "too many SQL variables" does not suggest its own fix.
        const hint = /too many SQL variables/i.test(detail)
          ? `\n  ${params.length} bound parameters exceeds D1's limit of 100.` +
            " Multi-row inserts go through insertInChunks()" +
            " (libs/db/src/seed/chunk.ts); a long inArray() list binds one" +
            " parameter per element and must be batched too."
          : "";
        throw new Error(
          `D1 HTTP query failed (${detail})${hint}\n  sql: ${sql}`,
        );
      }

      const rows = body.result?.[0]?.results?.rows ?? [];

      // `run` discards rows. `get` is handed the single row itself, not a list
      // of rows — see mapGetResult in drizzle's sqlite-proxy session.
      if (method === "run") return { rows: [] };
      if (method === "get") return { rows: rows[0] ?? [] };
      return { rows };
    },
    // sqlite-proxy defines `batch()` unconditionally and dispatches it to this
    // callback, so omitting it leaves `db.batch()` throwing "batchCLient is not
    // a function". Worse, `atomicWrite` feature-detects `typeof db.batch ===
    // "function"` and would take that branch.
    //
    // D1's HTTP surface is `/query` and `/raw`, each taking ONE sql string and
    // ONE flat params array — there is no batch endpoint, and no way to give N
    // statements their own bindings. Running them sequentially would return the
    // right rows while quietly dropping the all-or-nothing guarantee that is the
    // only reason to call `batch()`. Fail loudly instead.
    () => {
      throw new Error(
        "D1's HTTP API has no batch endpoint, so this driver cannot honour " +
          "batch()'s atomicity. Atomic writes need the Workers D1 binding " +
          "(drizzle-orm/d1); over HTTP, issue the statements individually and " +
          "make them idempotent.",
      );
    },
    { schema },
  );
};

export type D1HttpDb = ReturnType<typeof createD1HttpDb>;
