import { CreateKaryaBody } from "@myapp/api-zod";
import { normalizeStages } from "@myapp/db";
import { karya, karyaMembers, profiles, users } from "@myapp/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import type { AppEnv } from "../app";
import {
  interestsByKaryaIds,
  interestsForKarya,
  reconcileKaryaInterests,
} from "../lib/interests";

const app = new Hono<AppEnv>();

async function getSession(c: Context<AppEnv>) {
  return c.get("auth").api.getSession({ headers: c.req.raw.headers });
}

type Db = AppEnv["Variables"]["db"];

// One roster row per karya membership, joined to the member's profile + user
// (for the face). Carries `role`/`status` so callers can filter approved
// members vs pending requests and sort the owner first.
interface RosterRow {
  karyaId: string;
  userId: string;
  role: string;
  status: string;
  createdAt: Date;
  name: string;
  handle: string | null;
  image: string | null;
}

/**
 * Fetch every roster row for the given karya in one grouped query — don't N+1
 * the listing (mirrors `interestsByKaryaIds`). Members without a profile are
 * dropped (no name to render a face from).
 */
async function rostersByKaryaIds(
  db: Db,
  karyaIds: string[],
): Promise<Map<string, RosterRow[]>> {
  const grouped = new Map<string, RosterRow[]>();
  if (karyaIds.length === 0) return grouped;

  const rows = await db
    .select({
      karyaId: karyaMembers.karyaId,
      userId: karyaMembers.userId,
      role: karyaMembers.role,
      status: karyaMembers.status,
      createdAt: karyaMembers.createdAt,
      name: profiles.name,
      handle: profiles.handle,
      image: users.image,
    })
    .from(karyaMembers)
    .innerJoin(profiles, eq(karyaMembers.userId, profiles.userId))
    .innerJoin(users, eq(karyaMembers.userId, users.id))
    .where(inArray(karyaMembers.karyaId, karyaIds));

  for (const r of rows) {
    const list = grouped.get(r.karyaId);
    if (list) list.push(r);
    else grouped.set(r.karyaId, [r]);
  }
  return grouped;
}

/** Owner first, then by join time — stable roster order for the faces. */
function sortRoster(rows: RosterRow[]): RosterRow[] {
  return [...rows].sort((a, b) => {
    if (a.role !== b.role) return a.role === "owner" ? -1 : 1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

function toRosterMember(r: RosterRow) {
  return { id: r.userId, name: r.name, handle: r.handle, image: r.image };
}

// Create a karya (FR-10). Authenticated; the creator becomes owner + member in
// one row (DECISION-G). Returns the new id so the client can redirect.
app.post("/", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const db = c.get("db");

  const parsed = CreateKaryaBody.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "invalid request" },
      400,
    );
  }
  const { title, description, stages, interests = [] } = parsed.data;

  const id = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(karya).values({
      id,
      title,
      description,
      stages: normalizeStages(stages),
      createdBy: session.user.id,
    });
    await tx.insert(karyaMembers).values({
      karyaId: id,
      userId: session.user.id,
      role: "owner",
      status: "member",
    });
    await reconcileKaryaInterests(tx, id, interests);
  });

  return c.json({ id });
});

// List all karya, reverse-chron (FR-22 forward-look). Roster shows approved
// members only, owner first; batch interests + rosters — don't N+1.
app.get("/", async (c) => {
  const db = c.get("db");

  const rows = await db.select().from(karya).orderBy(desc(karya.createdAt));
  if (rows.length === 0) return c.json([]);

  const ids = rows.map((k) => k.id);
  const interestsByKarya = await interestsByKaryaIds(db, ids);
  const rosters = await rostersByKaryaIds(db, ids);

  return c.json(
    rows.map((k) => {
      const members = sortRoster(
        (rosters.get(k.id) ?? []).filter((r) => r.status === "member"),
      );
      return {
        id: k.id,
        title: k.title,
        description: k.description,
        stages: k.stages,
        interests: interestsByKarya.get(k.id) ?? [],
        roster: members.map(toRosterMember),
        memberCount: members.length,
      };
    }),
  );
});

// Karya detail (FR-11/FR-12). `pendingRequests` is owner-only — never leak the
// pending list to non-owners. `viewerMembership` drives the client CTA.
app.get("/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const [k] = await db.select().from(karya).where(eq(karya.id, id)).limit(1);
  if (!k) return c.json({ error: "not found" }, 404);

  const session = await getSession(c);
  const viewerId = session?.user.id ?? null;

  const all = (await rostersByKaryaIds(db, [id])).get(id) ?? [];
  const members = sortRoster(all.filter((r) => r.status === "member"));
  const isOwner = viewerId != null && k.createdBy === viewerId;
  const viewerRow = viewerId
    ? all.find((r) => r.userId === viewerId)
    : undefined;

  return c.json({
    id: k.id,
    title: k.title,
    description: k.description,
    stages: k.stages,
    interests: await interestsForKarya(db, id),
    createdBy: k.createdBy,
    roster: members.map(toRosterMember),
    viewerMembership: viewerRow
      ? { role: viewerRow.role, status: viewerRow.status }
      : null,
    pendingRequests: isOwner
      ? all.filter((r) => r.status === "pending").map(toRosterMember)
      : [],
  });
});

// Request to join (FR-12). Idempotent: an existing membership (owner / member /
// pending) is returned unchanged rather than duplicated. 404 if karya missing.
app.post("/:id/join", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const db = c.get("db");
  const id = c.req.param("id");
  const userId = session.user.id;

  const [k] = await db
    .select({ id: karya.id })
    .from(karya)
    .where(eq(karya.id, id))
    .limit(1);
  if (!k) return c.json({ error: "not found" }, 404);

  const [existing] = await db
    .select({ role: karyaMembers.role, status: karyaMembers.status })
    .from(karyaMembers)
    .where(and(eq(karyaMembers.karyaId, id), eq(karyaMembers.userId, userId)))
    .limit(1);
  if (existing) return c.json(existing);

  await db
    .insert(karyaMembers)
    .values({ karyaId: id, userId, role: "member", status: "pending" })
    .onConflictDoNothing();
  return c.json({ role: "member", status: "pending" });
});

/** Resolve the karya and verify the session user owns it (403 otherwise). */
async function requireOwner(
  c: Context<AppEnv>,
): Promise<{ ok: true } | { ok: false; res: Response }> {
  const session = await getSession(c);
  if (!session)
    return { ok: false, res: c.json({ error: "unauthorized" }, 401) };
  const db = c.get("db");
  const id = c.req.param("id") ?? "";

  const [k] = await db
    .select({ createdBy: karya.createdBy })
    .from(karya)
    .where(eq(karya.id, id))
    .limit(1);
  if (!k) return { ok: false, res: c.json({ error: "not found" }, 404) };
  if (k.createdBy !== session.user.id) {
    return { ok: false, res: c.json({ error: "forbidden" }, 403) };
  }
  return { ok: true };
}

// Approve a pending request → member (owner-only). Operates only on pending
// rows so it can't, e.g., demote the owner.
app.post("/:id/members/:userId/approve", async (c) => {
  const guard = await requireOwner(c);
  if (!guard.ok) return guard.res;
  const db = c.get("db");
  const id = c.req.param("id");
  const memberId = c.req.param("userId");

  await db
    .update(karyaMembers)
    .set({ status: "member" })
    .where(
      and(
        eq(karyaMembers.karyaId, id),
        eq(karyaMembers.userId, memberId),
        eq(karyaMembers.status, "pending"),
      ),
    );
  return c.json({ ok: true });
});

// Decline a pending request → delete the row (owner-only).
app.post("/:id/members/:userId/decline", async (c) => {
  const guard = await requireOwner(c);
  if (!guard.ok) return guard.res;
  const db = c.get("db");
  const id = c.req.param("id");
  const memberId = c.req.param("userId");

  await db
    .delete(karyaMembers)
    .where(
      and(
        eq(karyaMembers.karyaId, id),
        eq(karyaMembers.userId, memberId),
        eq(karyaMembers.status, "pending"),
      ),
    );
  return c.json({ ok: true });
});

export default app;
