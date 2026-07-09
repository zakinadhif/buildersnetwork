import path from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWrite, createDb, type Db } from "@myapp/db";
import { karya } from "@myapp/db/schema";
import { count, eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it } from "vitest";

// Proves `atomicWrite` still gives an all-or-nothing guarantee after the move
// off the previous SQL drivers to the SQLite dialect (D1 on Workers, libSQL on
// Node).
//
// On Node the driver is `@libsql/client`, which exposes `batch()` — so this
// exercises the *batch* branch of `atomicWrite` (the same branch D1 takes on
// Workers; D1 has no interactive transactions, so batch is the only path there).
// An in-memory database keeps it hermetic; the real baseline migration is
// applied so the write runs against the actual shipped schema.

const migrationsFolder = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../libs/db/migrations",
);

let db: Db;

beforeEach(async () => {
  // A fresh in-memory database per test. `migrate` runs on the same client
  // createDb opened, so the tables persist for the duration of the test.
  db = createDb(":memory:");
  await migrate(db, { migrationsFolder });
});

const karyaCount = async () => {
  const [row] = await db.select({ n: count() }).from(karya);
  return row.n;
};

describe("atomicWrite on SQLite (libsql batch branch)", () => {
  it("takes the batch branch — the libsql driver exposes batch()", () => {
    expect(typeof (db as { batch?: unknown }).batch).toBe("function");
  });

  it("commits every statement in a successful batch", async () => {
    await atomicWrite(db, (e) => [
      e.insert(karya).values({ id: "k1", title: "One", description: "first" }),
      e.insert(karya).values({ id: "k2", title: "Two", description: "second" }),
    ]);

    expect(await karyaCount()).toBe(2);
  });

  it("rolls the whole batch back when a later statement fails", async () => {
    // The second insert duplicates k1's primary key, so it fails. If the batch
    // were not atomic, the first (valid) insert would leak; the assertion below
    // proves it does not.
    await expect(
      atomicWrite(db, (e) => [
        e
          .insert(karya)
          .values({ id: "k1", title: "One", description: "first" }),
        e
          .insert(karya)
          .values({ id: "k1", title: "Dup", description: "conflict" }),
      ]),
    ).rejects.toThrow();

    expect(await karyaCount()).toBe(0);
    expect(
      await db.select().from(karya).where(eq(karya.id, "k1")),
    ).toHaveLength(0);
  });
});
