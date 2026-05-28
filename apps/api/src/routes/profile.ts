import { matches as matchesTable, profiles } from "@myapp/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import type { AppEnv } from "../app";

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
    year: profile.year,
    major: profile.major,
    skills: profile.skills as string[],
    building: profile.building,
    wants: profile.wants,
    vibe: profile.vibe,
  });
});

app.post("/profile", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const db = c.get("db");

  const body = await c.req.json<{
    name: string;
    year: string;
    major: string;
    skills: string[];
    building: string;
    wants: string;
    vibe: string;
  }>();

  await db
    .insert(profiles)
    .values({ userId: session.user.id, ...body })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { ...body, updatedAt: new Date() },
    });

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

  return c.json(
    userMatches
      .map((m) => {
        const p = profileMap.get(m.matchedUserId);
        if (!p) return null;
        return {
          id: p.userId,
          name: p.name,
          year: p.year,
          major: p.major,
          skills: p.skills as string[],
          building: p.building,
          wants: p.wants,
          vibe: p.vibe,
          reason: m.reason,
        };
      })
      .filter(Boolean),
  );
});

export default app;
