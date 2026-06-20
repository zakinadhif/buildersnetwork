import { profiles } from "@myapp/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../app";

const app = new Hono<AppEnv>();

app.get("/", async (c) => {
  const db = c.get("db");

  const allProfiles = await db.select().from(profiles);

  return c.json(
    allProfiles.map((p) => ({
      id: p.userId,
      name: p.name,
      handle: p.handle,
      bio: p.bio,
      interests: p.interests as string[],
      year: p.year,
      major: p.major,
      skills: p.skills as string[],
    })),
  );
});

app.get("/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, id))
    .limit(1);

  if (!profile) return c.json({ error: "not found" }, 404);

  return c.json({
    id: profile.userId,
    name: profile.name,
    handle: profile.handle,
    bio: profile.bio,
    interests: profile.interests as string[],
    year: profile.year,
    major: profile.major,
    skills: profile.skills as string[],
  });
});

export default app;
