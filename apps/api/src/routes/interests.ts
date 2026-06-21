import { interests } from "@myapp/db/schema";
import { asc, desc } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../app";

const app = new Hono<AppEnv>();

// Browsable interest vocabulary (FR-14). Read-only this sprint — new rows are
// created implicitly by the profile save path (reconcile-on-save, DECISION-B).
app.get("/", async (c) => {
  const db = c.get("db");

  const rows = await db
    .select({
      id: interests.id,
      name: interests.name,
      slug: interests.slug,
      curated: interests.curated,
    })
    .from(interests)
    // Curated starter list first, then alphabetical.
    .orderBy(desc(interests.curated), asc(interests.name));

  return c.json(rows);
});

export default app;
