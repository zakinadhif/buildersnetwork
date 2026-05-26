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
 * Returns an object that behaves like a Drizzle (postgres-js) query builder
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
