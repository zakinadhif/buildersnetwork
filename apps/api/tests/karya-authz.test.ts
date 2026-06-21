import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import type { AppEnv } from "../src/app";
import karyaRouter from "../src/routes/karya";
import {
  createAuthMock,
  createDbMock,
  type MockUser,
  type WriteCall,
} from "./helpers/harness";

// Server-side authorization coverage for the karya routes (sprint-3 follow-up).
// The e2e suite mocks the API, so the real 401/403/404 guard logic never runs
// there. Here we mount the *real* router with an injected db + auth and drive
// it through `app.request`, exercising the actual handler control flow.
//
// `reads` is the queue of results for each awaited `select(...)` chain, in the
// order the handler issues them (see each test). Writes are recorded so a
// success path can assert what was saved.

function mount(opts: {
  user?: MockUser | null;
  adminEmails?: string[];
  reads?: unknown[][];
}): { app: Hono<AppEnv>; writes: WriteCall[] } {
  const { db, writes } = createDbMock(opts.reads ?? []);
  const auth = createAuthMock(opts.user ?? null);
  const app = new Hono<AppEnv>();
  app.use("*", async (c, next) => {
    c.set("db", db as unknown as AppEnv["Variables"]["db"]);
    c.set("auth", auth as unknown as AppEnv["Variables"]["auth"]);
    c.set("adminEmails", opts.adminEmails ?? []);
    await next();
  });
  app.route("/api/karya", karyaRouter);
  return { app, writes };
}

const MEMBER: MockUser = { id: "u-member", email: "member@test.com" };
const ADMIN: MockUser = { id: "u-admin", email: "admin@test.com" };
const KARYA_EXISTS = [{ id: "k1" }];

const json = (body: unknown) => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

describe("POST /api/karya/:id/posts — member-only (DECISION-C)", () => {
  it("401 when unauthenticated", async () => {
    const { app } = mount({ user: null });
    const res = await app.request(
      "/api/karya/k1/posts",
      json({ kind: "progress", body: "hi" }),
    );
    expect(res.status).toBe(401);
  });

  it("404 when the karya is missing", async () => {
    const { app } = mount({ user: MEMBER, reads: [[]] });
    const res = await app.request(
      "/api/karya/k1/posts",
      json({ kind: "progress", body: "hi" }),
    );
    expect(res.status).toBe(404);
  });

  it("403 when the viewer has no membership row", async () => {
    const { app } = mount({ user: MEMBER, reads: [KARYA_EXISTS, []] });
    const res = await app.request(
      "/api/karya/k1/posts",
      json({ kind: "progress", body: "hi" }),
    );
    expect(res.status).toBe(403);
  });

  it("403 when the viewer is only pending (not an approved member)", async () => {
    const { app } = mount({
      user: MEMBER,
      reads: [KARYA_EXISTS, [{ status: "pending" }]],
    });
    const res = await app.request(
      "/api/karya/k1/posts",
      json({ kind: "progress", body: "hi" }),
    );
    expect(res.status).toBe(403);
  });

  it("400 when the body is blank after trimming", async () => {
    const { app } = mount({
      user: MEMBER,
      reads: [KARYA_EXISTS, [{ status: "member" }]],
    });
    const res = await app.request(
      "/api/karya/k1/posts",
      json({ kind: "progress", body: "   " }),
    );
    expect(res.status).toBe(400);
  });

  it("400 when the kind is not a known PostKind", async () => {
    const { app } = mount({
      user: MEMBER,
      reads: [KARYA_EXISTS, [{ status: "member" }]],
    });
    const res = await app.request(
      "/api/karya/k1/posts",
      json({ kind: "rambling", body: "hi" }),
    );
    expect(res.status).toBe(400);
  });

  it("200 + inserts the post when an approved member posts", async () => {
    const createdAt = new Date("2026-06-10T00:00:00Z");
    const { app, writes } = mount({
      user: MEMBER,
      reads: [
        KARYA_EXISTS,
        [{ status: "member" }],
        // getPostById row (joined author face + parent karya title)
        [
          {
            id: "p-new",
            karyaId: "k1",
            kind: "progress",
            body: "shipped it",
            createdAt,
            authorId: MEMBER.id,
            authorName: "Member One",
            authorHandle: "member",
            authorImage: null,
            karyaTitle: "Loom",
          },
        ],
      ],
    });

    const res = await app.request(
      "/api/karya/k1/posts",
      json({ kind: "progress", body: "shipped it" }),
    );
    expect(res.status).toBe(200);

    const post = (await res.json()) as {
      id: string;
      kind: string;
      author: { id: string };
    };
    expect(post.kind).toBe("progress");
    expect(post.author.id).toBe(MEMBER.id);

    // The post was inserted with the session user as author (not client-supplied).
    const insert = writes.find((w) => w.op === "insert");
    expect(insert?.values).toMatchObject({
      karyaId: "k1",
      authorId: MEMBER.id,
      kind: "progress",
      body: "shipped it",
    });
  });
});

describe("GET /api/karya/:id/posts", () => {
  it("404 when the karya is missing", async () => {
    const { app } = mount({ reads: [[]] });
    const res = await app.request("/api/karya/k1/posts");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/karya/:id/feature — admin-only (DECISION-A)", () => {
  it("401 when unauthenticated", async () => {
    const { app } = mount({ user: null });
    const res = await app.request("/api/karya/k1/feature", json({}));
    expect(res.status).toBe(401);
  });

  it("404 when the karya is missing", async () => {
    const { app } = mount({
      user: ADMIN,
      adminEmails: [ADMIN.email],
      reads: [[]],
    });
    const res = await app.request("/api/karya/k1/feature", json({}));
    expect(res.status).toBe(404);
  });

  it("403 when the viewer's email is not in the allowlist", async () => {
    const { app } = mount({
      user: MEMBER,
      adminEmails: [ADMIN.email],
      reads: [KARYA_EXISTS],
    });
    const res = await app.request("/api/karya/k1/feature", json({}));
    expect(res.status).toBe(403);
  });

  it("200 + upserts the featured row for an allowlisted admin", async () => {
    const { app, writes } = mount({
      user: ADMIN,
      adminEmails: [ADMIN.email],
      reads: [KARYA_EXISTS],
    });
    const res = await app.request("/api/karya/k1/feature", json({ rank: 3 }));
    expect(res.status).toBe(200);

    const insert = writes.find((w) => w.op === "insert");
    expect(insert?.values).toMatchObject({ karyaId: "k1", rank: 3 });
  });
});

describe("DELETE /api/karya/:id/feature — admin-only", () => {
  it("403 for a non-admin", async () => {
    const { app } = mount({
      user: MEMBER,
      adminEmails: [ADMIN.email],
      reads: [KARYA_EXISTS],
    });
    const res = await app.request("/api/karya/k1/feature", {
      method: "DELETE",
    });
    expect(res.status).toBe(403);
  });

  it("200 + deletes for an admin", async () => {
    const { app, writes } = mount({
      user: ADMIN,
      adminEmails: [ADMIN.email],
      reads: [KARYA_EXISTS],
    });
    const res = await app.request("/api/karya/k1/feature", {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
    expect(writes.some((w) => w.op === "delete")).toBe(true);
  });
});

describe("POST /api/karya/:id/members/:userId/approve — owner-only", () => {
  it("403 when the viewer is not the owner", async () => {
    const { app } = mount({
      user: MEMBER,
      reads: [[{ createdBy: "someone-else" }]],
    });
    const res = await app.request("/api/karya/k1/members/u2/approve", {
      method: "POST",
    });
    expect(res.status).toBe(403);
  });

  it("200 + updates the row when the owner approves", async () => {
    const { app, writes } = mount({
      user: MEMBER,
      reads: [[{ createdBy: MEMBER.id }]],
    });
    const res = await app.request("/api/karya/k1/members/u2/approve", {
      method: "POST",
    });
    expect(res.status).toBe(200);
    expect(writes.some((w) => w.op === "update")).toBe(true);
  });
});
