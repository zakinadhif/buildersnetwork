/**
 * Test harness for API route unit tests.
 *
 * Pattern: create a minimal Hono app that mounts only the router under test,
 * inject an in-memory db mock and a configurable auth mock via middleware.
 * No module-level vi.mock() needed — just swap state between tests.
 *
 * The `makeQueryResult` helper satisfies both Drizzle usage patterns at once:
 *
 *   await db.select().from(table)                    → list query (awaitable)
 *   await db.select().from(table).where(...).limit(1) → single-row query
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MockUser = { id: string; email: string };

// ---------------------------------------------------------------------------
// Drizzle query result helper
// ---------------------------------------------------------------------------

/**
 * Returns an object that behaves like a Drizzle (libSQL) query builder
 * result:
 * - Awaitable directly as a list  (`await db.select().from(table)`)
 * - Chainable `.limit(n)`          (`await db.select().from(table).where(...).limit(1)`)
 */
export const makeQueryResult = <T>(rows: T[]): QueryResult<T> => ({
  limit: (_n: number) => makeQueryResult(rows),
  // biome-ignore lint/suspicious/noThenProperty: intentional thenable — mocks Drizzle's awaitable query builder
  then: <R>(resolve: (value: T[]) => R, reject?: (reason: unknown) => R) =>
    Promise.resolve(rows).then(resolve, reject),
});

type QueryResult<T> = {
  limit: (n: number) => QueryResult<T>;
  then: <R>(
    resolve: (value: T[]) => R,
    reject?: (reason: unknown) => R,
  ) => Promise<R>;
};

// ---------------------------------------------------------------------------
// Auth mock factory
// ---------------------------------------------------------------------------

export type MockAuth = {
  api: {
    getSession: () => Promise<{
      user: MockUser;
      session: { id: string };
    } | null>;
  };
};

/**
 * Returns a mock auth object. Pass a `user` to simulate an authenticated
 * request; omit (or pass null) for anonymous.
 */
export const createAuthMock = (user: MockUser | null = null): MockAuth => ({
  api: {
    getSession: async () =>
      user ? { user, session: { id: "test-session-id" } } : null,
  },
});

// ---------------------------------------------------------------------------
// Full chainable db mock
// ---------------------------------------------------------------------------
//
// `makeQueryResult` above only models `.limit()`. Real routes chain longer
// (`.from().innerJoin().where().orderBy().limit()`), so `createDbMock` returns
// a builder where *every* chain method returns the same thenable. Reads are
// drained from a queue in call order — one entry per awaited `select(...)`
// chain (default `[]` once drained). Writes (`insert/update/delete`) resolve to
// `undefined` and are recorded in `writes` so a test can assert what was saved.

/** A recorded write — `values` from inserts, `set` from updates. */
export interface WriteCall {
  op: "insert" | "update" | "delete";
  values?: unknown;
  set?: unknown;
}

interface ReadBuilder {
  from: (...a: unknown[]) => ReadBuilder;
  innerJoin: (...a: unknown[]) => ReadBuilder;
  leftJoin: (...a: unknown[]) => ReadBuilder;
  where: (...a: unknown[]) => ReadBuilder;
  orderBy: (...a: unknown[]) => ReadBuilder;
  limit: (...a: unknown[]) => ReadBuilder;
  then: <R>(
    resolve: (v: unknown[]) => R,
    reject?: (e: unknown) => R,
  ) => Promise<R>;
}

interface WriteBuilder {
  values: (v: unknown) => WriteBuilder;
  set: (v: unknown) => WriteBuilder;
  where: (...a: unknown[]) => WriteBuilder;
  onConflictDoNothing: (...a: unknown[]) => WriteBuilder;
  onConflictDoUpdate: (...a: unknown[]) => WriteBuilder;
  then: <R>(
    resolve: (v: unknown) => R,
    reject?: (e: unknown) => R,
  ) => Promise<R>;
}

interface DbLike {
  select: (...a: unknown[]) => ReadBuilder;
  insert: (...a: unknown[]) => WriteBuilder;
  update: (...a: unknown[]) => WriteBuilder;
  delete: (...a: unknown[]) => WriteBuilder;
  transaction: (cb: (tx: DbLike) => unknown) => Promise<unknown>;
}

export interface DbMock {
  /** Cast to the Drizzle `Db` type when injecting into the request context. */
  db: DbLike;
  /** Writes recorded in order, for assertions. */
  writes: WriteCall[];
}

export const createDbMock = (reads: unknown[][] = []): DbMock => {
  const queue = [...reads];
  const writes: WriteCall[] = [];
  const nextRead = (): unknown[] => queue.shift() ?? [];

  const readBuilder = (): ReadBuilder => {
    const b: ReadBuilder = {
      from: () => b,
      innerJoin: () => b,
      leftJoin: () => b,
      where: () => b,
      orderBy: () => b,
      limit: () => b,
      // biome-ignore lint/suspicious/noThenProperty: intentional thenable — mocks Drizzle's awaitable query builder
      then: (resolve, reject) =>
        Promise.resolve(nextRead()).then(resolve, reject),
    };
    return b;
  };

  const writeBuilder = (call: WriteCall): WriteBuilder => {
    const b: WriteBuilder = {
      values: (v) => {
        call.values = v;
        return b;
      },
      set: (v) => {
        call.set = v;
        return b;
      },
      where: () => b,
      onConflictDoNothing: () => b,
      onConflictDoUpdate: () => b,
      // biome-ignore lint/suspicious/noThenProperty: intentional thenable — mocks Drizzle's awaitable query builder
      then: (resolve, reject) =>
        Promise.resolve(undefined).then(resolve, reject),
    };
    return b;
  };

  const record = (op: WriteCall["op"]): WriteBuilder => {
    const call: WriteCall = { op };
    writes.push(call);
    return writeBuilder(call);
  };

  const db: DbLike = {
    select: () => readBuilder(),
    insert: () => record("insert"),
    update: () => record("update"),
    delete: () => record("delete"),
    transaction: (cb) => Promise.resolve(cb(db)),
  };

  return { db, writes };
};
