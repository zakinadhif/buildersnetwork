import { CreateKaryaBody, CreatePostBody } from "@myapp/api-zod";
import { normalizePostKind, normalizeStages } from "@myapp/db";
import { featured, karya, karyaMembers, posts } from "@myapp/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import type { AppEnv } from "../app";
import { interestsForKarya, reconcileKaryaInterests } from "../lib/interests";
import {
  karyaListItems,
  rostersByKaryaIds,
  sortRoster,
  toRosterMember,
} from "../lib/karya";
import { getPostById, postsForKarya, toPost } from "../lib/posts";

const app = new Hono<AppEnv>();

async function getSession(c: Context<AppEnv>) {
  return c.get("auth").api.getSession({ headers: c.req.raw.headers });
}

type Session = Awaited<ReturnType<typeof getSession>>;

/** Email allowlist check (DECISION-A) — the entire feature authority model. */
function isAdmin(c: Context<AppEnv>, session: Session): boolean {
  const email = session?.user.email;
  if (!email) return false;
  return c.get("adminEmails").includes(email);
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
  return c.json(await karyaListItems(db, rows));
});

// Karya detail (FR-11/FR-12). `pendingRequests` is owner-only — never leak the
// pending list to non-owners. `viewerMembership` drives the client CTA;
// `featured`/`viewerIsAdmin` drive the admin feature toggle (S3.10a).
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

  const [feat] = await db
    .select({ karyaId: featured.karyaId })
    .from(featured)
    .where(eq(featured.karyaId, id))
    .limit(1);

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
    featured: !!feat,
    viewerIsAdmin: isAdmin(c, session),
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

// Karya update stream (FR-18/19, DECISION-D). Reverse-chron posts for the karya,
// each with its author face. Separate from `GET /:id` so the page can refetch
// the stream after posting without re-pulling roster/pending. 404 if missing.
app.get("/:id/posts", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const [k] = await db
    .select({ id: karya.id })
    .from(karya)
    .where(eq(karya.id, id))
    .limit(1);
  if (!k) return c.json({ error: "not found" }, 404);

  const rows = await postsForKarya(db, id);
  return c.json(rows.map(toPost));
});

// Post an update (FR-18). Authenticated; only an approved member of the karya
// may post (DECISION-C) — verified server-side, never trusted from the client.
app.post("/:id/posts", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const db = c.get("db");
  const id = c.req.param("id");

  const [k] = await db
    .select({ id: karya.id })
    .from(karya)
    .where(eq(karya.id, id))
    .limit(1);
  if (!k) return c.json({ error: "not found" }, 404);

  const [membership] = await db
    .select({ status: karyaMembers.status })
    .from(karyaMembers)
    .where(
      and(
        eq(karyaMembers.karyaId, id),
        eq(karyaMembers.userId, session.user.id),
      ),
    )
    .limit(1);
  if (!membership || membership.status !== "member") {
    return c.json({ error: "forbidden" }, 403);
  }

  const parsed = CreatePostBody.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "invalid request" },
      400,
    );
  }
  const kind = normalizePostKind(parsed.data.kind);
  const body = parsed.data.body.trim();
  if (!kind || !body) return c.json({ error: "invalid post" }, 400);

  const postId = crypto.randomUUID();
  await db.insert(posts).values({
    id: postId,
    karyaId: id,
    authorId: session.user.id,
    kind,
    body,
  });

  const created = await getPostById(db, postId);
  if (!created) return c.json({ error: "not found" }, 404);
  return c.json(toPost(created));
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

/** Resolve the karya and verify the session user is an admin (DECISION-A). */
async function requireAdmin(
  c: Context<AppEnv>,
): Promise<{ ok: true } | { ok: false; res: Response }> {
  const session = await getSession(c);
  if (!session)
    return { ok: false, res: c.json({ error: "unauthorized" }, 401) };
  const db = c.get("db");
  const id = c.req.param("id") ?? "";

  const [k] = await db
    .select({ id: karya.id })
    .from(karya)
    .where(eq(karya.id, id))
    .limit(1);
  if (!k) return { ok: false, res: c.json({ error: "not found" }, 404) };
  if (!isAdmin(c, session)) {
    return { ok: false, res: c.json({ error: "forbidden" }, 403) };
  }
  return { ok: true };
}

// Mark a karya featured (FR-24, admin-only). Upsert so re-featuring updates the
// rank. `rank` defaults to 0; lower sorts first in the homepage "Top picked".
app.post("/:id/feature", async (c) => {
  const guard = await requireAdmin(c);
  if (!guard.ok) return guard.res;
  const db = c.get("db");
  const id = c.req.param("id");

  const body = (await c.req.json().catch(() => ({}))) as { rank?: unknown };
  const rank = typeof body.rank === "number" ? body.rank : 0;

  await db
    .insert(featured)
    .values({ karyaId: id, rank })
    .onConflictDoUpdate({ target: featured.karyaId, set: { rank } });
  return c.json({ ok: true });
});

// Remove a karya from featured (admin-only).
app.delete("/:id/feature", async (c) => {
  const guard = await requireAdmin(c);
  if (!guard.ok) return guard.res;
  const db = c.get("db");
  const id = c.req.param("id");

  await db.delete(featured).where(eq(featured.karyaId, id));
  return c.json({ ok: true });
});

export default app;
