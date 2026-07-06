import { karya, posts, profiles } from "@myapp/db/schema";
import { count, gte } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../app";

// Community pulse counts for the Launchpad right rail (issue #20). Three cheap
// aggregate COUNTs — no per-entity rows, no N+1 (NFR-6). "This week" is the
// trailing 7 days: the honest "denyut" (pulse) signal. The mockup's third stat,
// "cari kolaborator", has no backing model (stages are a fixed lifecycle
// vocabulary — none of them "seeking"), so recent-update volume stands in.
export const statsRouter = new Hono<AppEnv>();

statsRouter.get("/", async (c) => {
  const db = c.get("db");
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [[karyaCount], [builderCount], [updateCount]] = await Promise.all([
    db.select({ n: count() }).from(karya),
    db.select({ n: count() }).from(profiles),
    db.select({ n: count() }).from(posts).where(gte(posts.createdAt, weekAgo)),
  ]);

  return c.json({
    karya: karyaCount?.n ?? 0,
    builders: builderCount?.n ?? 0,
    updatesThisWeek: updateCount?.n ?? 0,
  });
});
