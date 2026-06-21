import { profiles } from "@myapp/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../app";
import { interestsByUserIds, interestsForUser } from "../lib/interests";

const app = new Hono<AppEnv>();

app.get("/", async (c) => {
  const db = c.get("db");

  const allProfiles = await db.select().from(profiles);
  // One batched query for every listed member — don't N+1 the directory.
  const interestsByUser = await interestsByUserIds(
    db,
    allProfiles.map((p) => p.userId),
  );

  return c.json(
    allProfiles.map((p) => ({
      id: p.userId,
      name: p.name,
      handle: p.handle,
      bio: p.bio,
      interests: interestsByUser.get(p.userId) ?? [],
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
    interests: await interestsForUser(db, profile.userId),
    year: profile.year,
    major: profile.major,
    skills: profile.skills as string[],
  });
});

export default app;
