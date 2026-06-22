import { atomicWrite } from "@myapp/db";
import { matches as matchesTable, profiles } from "@myapp/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import type { AppEnv } from "../app";
import {
  interestsByUserIds,
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

app.post("/matches", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const db = c.get("db");

  const body = await c.req.json<{
    matches: { memberId: string; reason: string }[];
  }>();

  await db.delete(matchesTable).where(eq(matchesTable.userId, session.user.id));

  if (body.matches.length > 0) {
    await db.insert(matchesTable).values(
      body.matches.map((m) => ({
        id: crypto.randomUUID(),
        userId: session.user.id,
        matchedUserId: m.memberId,
        reason: m.reason,
      })),
    );
  }

  return c.json({ ok: true });
});

app.get("/matches", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const db = c.get("db");

  const userMatches = await db
    .select()
    .from(matchesTable)
    .where(eq(matchesTable.userId, session.user.id));

  if (userMatches.length === 0) return c.json([]);

  const matchedProfiles = await db
    .select()
    .from(profiles)
    .where(
      inArray(
        profiles.userId,
        userMatches.map((m) => m.matchedUserId),
      ),
    );

  const profileMap = new Map(matchedProfiles.map((p) => [p.userId, p]));
  const interestsByUser = await interestsByUserIds(
    db,
    matchedProfiles.map((p) => p.userId),
  );

  return c.json(
    userMatches
      .map((m) => {
        const p = profileMap.get(m.matchedUserId);
        if (!p) return null;
        return {
          id: p.userId,
          name: p.name,
          handle: p.handle,
          bio: p.bio,
          interests: interestsByUser.get(p.userId) ?? [],
          year: p.year,
          major: p.major,
          skills: p.skills as string[],
          reason: m.reason,
        };
      })
      .filter(Boolean),
  );
});

export default app;
