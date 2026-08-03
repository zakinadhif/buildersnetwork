import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";
import { describe, expect, it } from "vitest";

describe("body-only post migration", () => {
  it("preserves legacy post rows and the required karya link", async () => {
    const client = createClient({ url: ":memory:" });
    try {
      await client.executeMultiple(`
        CREATE TABLE posts (
          id text PRIMARY KEY NOT NULL,
          karya_id text NOT NULL,
          author_id text NOT NULL,
          kind text NOT NULL,
          body text NOT NULL,
          created_at integer NOT NULL
        );
        INSERT INTO posts (id, karya_id, author_id, kind, body, created_at)
        VALUES ('p1', 'k1', 'u1', 'progress', 'post lama tetap ada', 1234);
      `);

      const migration = await readFile(
        new URL("../migrations/0002_hot_hydra.sql", import.meta.url),
        "utf8",
      );
      await client.executeMultiple(migration);

      const columns = await client.execute("PRAGMA table_info('posts')");
      const byName = new Map(
        columns.rows.map((column) => [String(column.name), column]),
      );
      expect(byName.has("kind")).toBe(false);
      expect(byName.get("karya_id")?.notnull).toBe(1);

      const rows = await client.execute(
        "SELECT id, karya_id, author_id, body, created_at FROM posts",
      );
      expect(rows.rows).toEqual([
        {
          id: "p1",
          karya_id: "k1",
          author_id: "u1",
          body: "post lama tetap ada",
          created_at: 1234,
        },
      ]);
    } finally {
      client.close();
    }
  });
});
