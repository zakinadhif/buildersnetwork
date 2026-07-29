import type { KaryaStage } from "@myapp/db";
import type { StorageProvider } from "@myapp/storage";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import type { AppEnv } from "../src/app";
import { toKaryaListItem } from "../src/lib/karya";
import {
  contentTypeForKey,
  extForContentType,
  screenshotKeyFor,
  screenshotUrlFor,
} from "../src/lib/screenshots";
import karyaRouter from "../src/routes/karya";
import { createAuthMock, createDbMock, type MockUser } from "./helpers/harness";
import { fakeStorage } from "./helpers/storage";

// ── Pure helpers ────────────────────────────────────────────────────────────

describe("screenshot helpers", () => {
  it("maps accepted content-types to an extension (tolerating params/casing)", () => {
    expect(extForContentType("image/png")).toBe("png");
    expect(extForContentType("image/jpeg")).toBe("jpg");
    expect(extForContentType("image/webp")).toBe("webp");
    expect(extForContentType("IMAGE/JPEG; charset=binary")).toBe("jpg");
  });

  it("rejects unsupported or missing content-types", () => {
    expect(extForContentType("image/gif")).toBeNull();
    expect(extForContentType(undefined)).toBeNull();
  });

  it("recovers the content-type from a stored key's extension", () => {
    expect(contentTypeForKey("karya/k1/screenshots/s1.png")).toBe("image/png");
    expect(contentTypeForKey("karya/k1/screenshots/s1.bin")).toBe(
      "application/octet-stream",
    );
  });

  it("builds storage keys and serve URLs", () => {
    expect(screenshotKeyFor("k1", "s1", "png")).toBe(
      "karya/k1/screenshots/s1.png",
    );
    expect(screenshotUrlFor("k1", "s1")).toBe("/api/karya/k1/screenshots/s1");
  });

  it("toKaryaListItem exposes ordered screenshots, empty when none", () => {
    const base = {
      id: "k1",
      title: "T",
      description: "D",
      stages: ["idea"] as KaryaStage[],
      coverKey: null,
    };
    expect(toKaryaListItem(base, [], []).screenshots).toEqual([]);
    expect(
      toKaryaListItem(
        base,
        [],
        [],
        [
          {
            id: "s1",
            karyaId: "k1",
            key: "k",
            orientation: "landscape",
            position: 0,
          },
        ],
      ).screenshots,
    ).toEqual([
      {
        id: "s1",
        url: "/api/karya/k1/screenshots/s1",
        orientation: "landscape",
        position: 0,
      },
    ]);
  });
});

// ── Route behaviour ───────────────────────────────────────────────────────────

function mount(opts: {
  user?: MockUser | null;
  reads?: unknown[][];
  storage?: StorageProvider;
}) {
  const { db, writes } = createDbMock(opts.reads ?? []);
  const auth = createAuthMock(opts.user ?? null);
  const app = new Hono<AppEnv>();
  app.use("*", async (c, next) => {
    c.set("db", db as unknown as AppEnv["Variables"]["db"]);
    c.set("auth", auth as unknown as AppEnv["Variables"]["auth"]);
    c.set("adminEmails", []);
    c.set("storage", opts.storage);
    await next();
  });
  app.route("/api/karya", karyaRouter);
  return { app, writes };
}

const OWNER: MockUser = { id: "u-owner", email: "owner@test.com" };
const OWNED = [{ createdBy: OWNER.id }];

function pngUpload(
  orientation = "landscape",
  bytes = new Uint8Array([1, 2, 3]),
) {
  const form = new FormData();
  form.append("file", new File([bytes], "shot.png", { type: "image/png" }));
  form.append("orientation", orientation);
  return { method: "POST", body: form } as const;
}

describe("POST /api/karya/:id/screenshots — owner-only upload", () => {
  it("401 when unauthenticated", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({ user: null, storage });
    const res = await app.request("/api/karya/k1/screenshots", pngUpload());
    expect(res.status).toBe(401);
  });

  it("403 when the viewer is not the owner", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({
      user: { id: "u-other", email: "other@test.com" },
      reads: [OWNED],
      storage,
    });
    const res = await app.request("/api/karya/k1/screenshots", pngUpload());
    expect(res.status).toBe(403);
  });

  it("503 when storage is not configured", async () => {
    const { app } = mount({ user: OWNER, reads: [OWNED], storage: undefined });
    const res = await app.request("/api/karya/k1/screenshots", pngUpload());
    expect(res.status).toBe(503);
  });

  it("400 when no file is provided", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({ user: OWNER, reads: [OWNED], storage });
    const form = new FormData();
    form.append("orientation", "landscape");
    const res = await app.request("/api/karya/k1/screenshots", {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(400);
  });

  it("400 for an invalid orientation", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({ user: OWNER, reads: [OWNED], storage });
    const res = await app.request(
      "/api/karya/k1/screenshots",
      pngUpload("diagonal"),
    );
    expect(res.status).toBe(400);
  });

  it("400 for an unsupported image type", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({ user: OWNER, reads: [OWNED], storage });
    const form = new FormData();
    form.append("orientation", "landscape");
    form.append(
      "file",
      new File([new Uint8Array([1])], "c.gif", { type: "image/gif" }),
    );
    const res = await app.request("/api/karya/k1/screenshots", {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(400);
  });

  it("200 + stores the object and appends at the next position", async () => {
    const { storage, puts } = fakeStorage();
    const { app, writes } = mount({
      user: OWNER,
      // requireOwner read, then the existing-count-for-orientation read (2 rows).
      reads: [
        OWNED,
        [{ orientation: "landscape" }, { orientation: "landscape" }],
      ],
      storage,
    });
    const res = await app.request("/api/karya/k1/screenshots", pngUpload());
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      id: string;
      url: string;
      orientation: string;
      position: number;
    };
    expect(body.orientation).toBe("landscape");
    expect(body.position).toBe(2);
    expect(body.url).toBe(`/api/karya/k1/screenshots/${body.id}`);
    expect(puts).toEqual([
      { key: `karya/k1/screenshots/${body.id}.png`, contentType: "image/png" },
    ]);
    expect(writes.find((w) => w.op === "insert")?.values).toMatchObject({
      karyaId: "k1",
      orientation: "landscape",
      position: 2,
    });
  });
});

describe("GET /api/karya/:id/screenshots/:screenshotId — public serve", () => {
  it("404 when the screenshot doesn't exist", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({ reads: [[]], storage });
    const res = await app.request("/api/karya/k1/screenshots/s1");
    expect(res.status).toBe(404);
  });

  it("200 + streams the bytes with the recovered content-type", async () => {
    const { storage, store } = fakeStorage();
    store.set("karya/k1/screenshots/s1.png", Buffer.from([9, 8, 7]));
    const { app } = mount({
      reads: [[{ key: "karya/k1/screenshots/s1.png" }]],
      storage,
    });
    const res = await app.request("/api/karya/k1/screenshots/s1");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(
      new Uint8Array([9, 8, 7]),
    );
  });
});

describe("DELETE /api/karya/:id/screenshots/:screenshotId — owner-only", () => {
  it("404 when the screenshot doesn't exist", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({ user: OWNER, reads: [OWNED, []], storage });
    const res = await app.request("/api/karya/k1/screenshots/s1", {
      method: "DELETE",
    });
    expect(res.status).toBe(404);
  });

  it("200 + deletes the object and the row", async () => {
    const { storage, store, deletes } = fakeStorage();
    store.set("karya/k1/screenshots/s1.png", Buffer.from([1]));
    const { app, writes } = mount({
      user: OWNER,
      reads: [OWNED, [{ key: "karya/k1/screenshots/s1.png" }]],
      storage,
    });
    const res = await app.request("/api/karya/k1/screenshots/s1", {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
    expect(deletes).toEqual(["karya/k1/screenshots/s1.png"]);
    expect(writes.find((w) => w.op === "delete")).toBeTruthy();
  });
});

describe("POST /api/karya/:id/screenshots/reorder — owner-only", () => {
  it("401 when unauthenticated", async () => {
    const { app } = mount({ user: null });
    const res = await app.request("/api/karya/k1/screenshots/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orientation: "landscape", ids: ["s1"] }),
    });
    expect(res.status).toBe(401);
  });

  it("400 for an invalid orientation", async () => {
    const { app } = mount({ user: OWNER, reads: [OWNED] });
    const res = await app.request("/api/karya/k1/screenshots/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orientation: "sideways", ids: ["s1"] }),
    });
    expect(res.status).toBe(400);
  });

  it("400 for non-array ids", async () => {
    const { app } = mount({ user: OWNER, reads: [OWNED] });
    const res = await app.request("/api/karya/k1/screenshots/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orientation: "landscape", ids: "s1" }),
    });
    expect(res.status).toBe(400);
  });

  it("200 + writes each row's new position in order", async () => {
    const { app, writes } = mount({ user: OWNER, reads: [OWNED] });
    const res = await app.request("/api/karya/k1/screenshots/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orientation: "landscape", ids: ["s2", "s1"] }),
    });
    expect(res.status).toBe(200);
    const updates = writes.filter((w) => w.op === "update");
    expect(updates.map((w) => w.set)).toEqual([
      { position: 0 },
      { position: 1 },
    ]);
  });
});
