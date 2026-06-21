import { featured, karya } from "@myapp/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../app";
import { karyaListItems } from "../lib/karya";
import { recentPosts, toPost } from "../lib/posts";

// Fixed feed size — no ranking, no cursor pagination this sprint (DECISION-E,
// NFR-6). Pull this many of each item type, merge, then slice to the same cap.
const FEED_LIMIT = 50;

// Reverse-chronological global feed (FR-22, DECISION-E). A merged, in-memory
// union of two item types — recent posts + newly created karya — tagged with a
// discriminated `type` and sorted by `createdAt` desc. No scoring (Risk §15).
export const feedRouter = new Hono<AppEnv>();

feedRouter.get("/", async (c) => {
  const db = c.get("db");

  const postRows = await recentPosts(db, FEED_LIMIT);
  const karyaRows = await db
    .select()
    .from(karya)
    .orderBy(desc(karya.createdAt))
    .limit(FEED_LIMIT);

  // Batch the karya enrichment once (interests + rosters) — same builder the
  // listing/featured reads use, so the feed never N+1s.
  const karyaItems = await karyaListItems(db, karyaRows);

  const items = [
    ...postRows.map((r) => ({
      sortAt: r.createdAt.getTime(),
      value: {
        ...toPost(r),
        type: "post" as const,
        karya: { id: r.karyaId, title: r.karyaTitle },
      },
    })),
    ...karyaRows.map((k, i) => ({
      sortAt: k.createdAt.getTime(),
      value: {
        ...karyaItems[i],
        type: "karya" as const,
        createdAt: k.createdAt.toISOString(),
      },
    })),
  ];

  items.sort((a, b) => b.sortAt - a.sortAt);
  return c.json(items.slice(0, FEED_LIMIT).map((i) => i.value));
});

// Hand-curated "Top picked" karya for the homepage (FR-23/24, DECISION-A).
// Featured rows joined to their karya, ordered by `rank` asc, each rendered as
// a `KaryaListItem` via the shared builder.
export const featuredRouter = new Hono<AppEnv>();

featuredRouter.get("/", async (c) => {
  const db = c.get("db");

  const rows = await db
    .select({
      id: karya.id,
      title: karya.title,
      description: karya.description,
      stages: karya.stages,
    })
    .from(featured)
    .innerJoin(karya, eq(featured.karyaId, karya.id))
    .orderBy(asc(featured.rank));

  return c.json(await karyaListItems(db, rows));
});
