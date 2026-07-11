import { describe, expect, it } from "vitest";
import { interests, karyaInterests } from "../schema";
import { D1_MAX_BOUND_PARAMS, insertInChunks, selectInChunks } from "./chunk";

describe("insertInChunks", () => {
  it("issues no query for an empty list", async () => {
    const chunks: unknown[][] = [];
    await insertInChunks(interests, [], async (c) => chunks.push(c));
    expect(chunks).toEqual([]);
  });

  it("keeps every chunk within D1's bound-parameter cap", async () => {
    // `interests` has 5 columns, so a chunk may hold at most 20 rows.
    const rows = Array.from({ length: 28 }, (_, i) => ({ i }));
    const sizes: number[] = [];
    await insertInChunks(interests, rows, async (c) => sizes.push(c.length));

    expect(sizes).toEqual([20, 8]);
    for (const size of sizes) {
      expect(size * 5).toBeLessThanOrEqual(D1_MAX_BOUND_PARAMS);
    }
  });

  it("sizes chunks from the table, not the row keys", async () => {
    // Two columns, so twice the rows fit even though the rows look identical.
    const rows = Array.from({ length: 60 }, (_, i) => ({ i }));
    const sizes: number[] = [];
    await insertInChunks(karyaInterests, rows, async (c) =>
      sizes.push(c.length),
    );

    expect(sizes).toEqual([50, 10]);
  });

  it("passes every row through exactly once, in order", async () => {
    const rows = Array.from({ length: 45 }, (_, i) => i);
    const seen: number[] = [];
    await insertInChunks(interests, rows, async (c) => seen.push(...c));

    expect(seen).toEqual(rows);
  });
});

describe("selectInChunks", () => {
  it("issues no query for an empty list", async () => {
    const calls: unknown[][] = [];
    await selectInChunks([], async (c) => {
      calls.push(c);
      return [];
    });
    expect(calls).toEqual([]);
  });

  it("splits an inArray list at the cap and concatenates the rows", async () => {
    const slugs = Array.from({ length: 250 }, (_, i) => `s${i}`);
    const sizes: number[] = [];
    const rows = await selectInChunks(slugs, async (chunk) => {
      sizes.push(chunk.length);
      return chunk.map((slug) => ({ slug }));
    });

    expect(sizes).toEqual([100, 100, 50]);
    expect(rows).toHaveLength(250);
    expect(rows.map((r) => r.slug)).toEqual(slugs);
  });

  it("leaves room for parameters the query binds outside the list", async () => {
    const slugs = Array.from({ length: 100 }, (_, i) => `s${i}`);
    const sizes: number[] = [];
    await selectInChunks(
      slugs,
      async (chunk) => {
        sizes.push(chunk.length);
        return [];
      },
      3,
    );

    expect(sizes).toEqual([97, 3]);
    for (const size of sizes) {
      expect(size + 3).toBeLessThanOrEqual(D1_MAX_BOUND_PARAMS);
    }
  });

  it("does not exceed the cap when the list length equals it exactly", async () => {
    const slugs = Array.from(
      { length: D1_MAX_BOUND_PARAMS },
      (_, i) => `s${i}`,
    );
    const sizes: number[] = [];
    await selectInChunks(slugs, async (chunk) => {
      sizes.push(chunk.length);
      return [];
    });

    expect(sizes).toEqual([D1_MAX_BOUND_PARAMS]);
  });
});
