import { atomicWrite } from "@myapp/db";
import { profiles } from "@myapp/db/schema";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import type { AppEnv } from "../app";
import {
  interestsForUser,
  resolveInterestIds,
  userInterestWrites,
} from "../lib/interests";

const app = new Hono<AppEnv>();

async function getSession(c: Context<AppEnv>) {
  return c.get("auth").api.getSession({ headers: c.req.raw.headers });
}

app.get("/me", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json(null);
  const db = c.get("db");

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  if (!profile) return c.json(null);

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

app.post("/profile", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const db = c.get("db");

  const body = await c.req.json<{
    name: string;
    handle?: string;
    bio?: string;
    interests?: string[];
    year: string;
    major: string;
    skills: string[];
  }>();

  // Interests are normalized into their own tables — strip from the profile row
  // and reconcile separately (DECISION-B). Full replace of the link set, since
  // the Review screen always sends the complete interest list.
  const { interests: interestNames = [], ...profileValues } = body;

  // Find-or-create the shared interest catalog first (interactive reads — the
  // neon-http driver has no interactive transactions), then commit the profile
  // upsert and interest-link replacement as one atomic block.
  const { deduped, idBySlug } = await resolveInterestIds(db, interestNames);
  await atomicWrite(db, (e) => [
    e
      .insert(profiles)
      .values({ userId: session.user.id, ...profileValues })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { ...profileValues, updatedAt: new Date() },
      }),
    ...userInterestWrites(e, session.user.id, deduped, idBySlug),
  ]);

  return c.json({ ok: true });
});

export default app;
