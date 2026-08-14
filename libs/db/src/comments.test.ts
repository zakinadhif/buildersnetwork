import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";
import { describe, expect, it } from "vitest";

describe("comments migration", () => {
  it("creates first-layer comments with post/user cascade links", async () => {
    const client = createClient({ url: ":memory:" });
    try {
      await client.executeMultiple(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE users (id text PRIMARY KEY NOT NULL);
        CREATE TABLE posts (
          id text PRIMARY KEY NOT NULL,
          karya_id text NOT NULL,
          author_id text NOT NULL,
          body text NOT NULL,
          created_at integer NOT NULL
        );
        INSERT INTO users (id) VALUES ('u1'), ('u2');
        INSERT INTO posts (id, karya_id, author_id, body, created_at)
        VALUES ('p1', 'k1', 'u1', 'update', 1234);
      `);

      const migration = await readFile(
        new URL(
          "../migrations/0004_overconfident_adam_warlock.sql",
          import.meta.url,
        ),
        "utf8",
      );
      await client.executeMultiple(migration);
      await client.execute({
        sql: `INSERT INTO comments (id, post_id, author_id, body, created_at)
              VALUES (?, ?, ?, ?, ?)`,
        args: ["c1", "p1", "u2", "masukan", 2345],
      });

      const rows = await client.execute(
        "SELECT id, post_id, author_id, body FROM comments",
      );
      expect(rows.rows).toEqual([
        { id: "c1", post_id: "p1", author_id: "u2", body: "masukan" },
      ]);

      await client.execute({
        sql: "DELETE FROM posts WHERE id = ?",
        args: ["p1"],
      });
      const afterPostDelete = await client.execute("SELECT id FROM comments");
      expect(afterPostDelete.rows).toEqual([]);
    } finally {
      client.close();
    }
  });
});
