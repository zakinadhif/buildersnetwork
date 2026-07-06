import type { KaryaStage } from "@myapp/db";
import type { StorageProvider } from "@myapp/storage";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import type { AppEnv } from "../src/app";
import {
  contentTypeForKey,
  coverKeyFor,
  coverUrlFor,
  extForContentType,
} from "../src/lib/cover";
import { toKaryaListItem } from "../src/lib/karya";
import karyaRouter from "../src/routes/karya";
import { createAuthMock, createDbMock, type MockUser } from "./helpers/harness";

// ── Pure helpers ────────────────────────────────────────────────────────────

describe("cover helpers", () => {
  it("maps accepted content-types to an extension (tolerating params/casing)", () => {
    expect(extForContentType("image/png")).toBe("png");
    expect(extForContentType("image/jpeg")).toBe("jpg");
    expect(extForContentType("image/webp")).toBe("webp");
    expect(extForContentType("IMAGE/JPEG; charset=binary")).toBe("jpg");
  });

  it("rejects unsupported or missing content-types", () => {
    expect(extForContentType("image/gif")).toBeNull();
    expect(extForContentType(undefined)).toBeNull();
    expect(extForContentType("")).toBeNull();
  });

  it("recovers the content-type from a stored key's extension", () => {
    expect(contentTypeForKey("karya/abc/cover.png")).toBe("image/png");
    expect(contentTypeForKey("karya/abc/cover.jpg")).toBe("image/jpeg");
    expect(contentTypeForKey("karya/abc/cover.webp")).toBe("image/webp");
    expect(contentTypeForKey("karya/abc/cover.bin")).toBe(
      "application/octet-stream",
    );
  });

  it("builds storage keys and serve URLs", () => {
    expect(coverKeyFor("k1", "png")).toBe("karya/k1/cover.png");
    expect(coverUrlFor("k1", "karya/k1/cover.png")).toBe("/api/karya/k1/cover");
    expect(coverUrlFor("k1", null)).toBeNull();
  });

  it("toKaryaListItem exposes coverUrl only when a coverKey is present", () => {
    const base = {
      id: "k1",
      title: "T",
      description: "D",
      stages: ["idea"] as KaryaStage[],
    };
    expect(
      toKaryaListItem({ ...base, coverKey: "karya/k1/cover.png" }, [], [])
        .coverUrl,
    ).toBe("/api/karya/k1/cover");
    expect(toKaryaListItem({ ...base, coverKey: null }, [], []).coverUrl).toBe(
      null,
    );
  });
});

// ── Route behaviour ───────────────────────────────────────────────────────────

/** In-memory StorageProvider that records puts/deletes for assertions. */
function fakeStorage() {
  const store = new Map<string, Buffer>();
  const puts: { key: string; contentType?: string }[] = [];
  const deletes: string[] = [];
  const storage: StorageProvider = {
    async put(key, body, opts) {
      store.set(
        key,
        Buffer.isBuffer(body) ? body : Buffer.from(body as Uint8Array),
      );
      puts.push({ key, contentType: opts?.contentType });
    },
    async get(key) {
      return store.get(key) ?? null;
    },
    async delete(key) {
      store.delete(key);
      deletes.push(key);
    },
    async getSignedUrl() {
      return "unused";
    },
  };
  return { storage, store, puts, deletes };
}

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

function pngUpload(bytes = new Uint8Array([1, 2, 3])) {
  const form = new FormData();
  form.append("file", new File([bytes], "cover.png", { type: "image/png" }));
  return { method: "POST", body: form } as const;
}

describe("POST /api/karya/:id/cover — owner-only upload", () => {
  it("401 when unauthenticated", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({ user: null, storage });
    const res = await app.request("/api/karya/k1/cover", pngUpload());
    expect(res.status).toBe(401);
  });

  it("403 when the viewer is not the owner", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({
      user: { id: "u-other", email: "other@test.com" },
      reads: [OWNED],
      storage,
    });
    const res = await app.request("/api/karya/k1/cover", pngUpload());
    expect(res.status).toBe(403);
  });

  it("503 when storage is not configured", async () => {
    const { app } = mount({ user: OWNER, reads: [OWNED], storage: undefined });
    const res = await app.request("/api/karya/k1/cover", pngUpload());
    expect(res.status).toBe(503);
  });

  it("400 when no file is provided", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({ user: OWNER, reads: [OWNED], storage });
    const res = await app.request("/api/karya/k1/cover", {
      method: "POST",
      body: new FormData(),
    });
    expect(res.status).toBe(400);
  });

  it("400 for an unsupported image type", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({ user: OWNER, reads: [OWNED], storage });
    const form = new FormData();
    form.append(
      "file",
      new File([new Uint8Array([1])], "c.gif", { type: "image/gif" }),
    );
    const res = await app.request("/api/karya/k1/cover", {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(400);
  });

  it("200 + stores the object and sets coverKey", async () => {
    const { storage, puts } = fakeStorage();
    const { app, writes } = mount({
      user: OWNER,
      // requireOwner read, then the existing-coverKey read.
      reads: [OWNED, [{ coverKey: null }]],
      storage,
    });
    const res = await app.request("/api/karya/k1/cover", pngUpload());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ coverUrl: "/api/karya/k1/cover" });
    expect(puts).toEqual([
      { key: "karya/k1/cover.png", contentType: "image/png" },
    ]);
    expect(writes.find((w) => w.op === "update")?.set).toMatchObject({
      coverKey: "karya/k1/cover.png",
    });
  });
});

describe("GET /api/karya/:id/cover — public serve", () => {
  it("404 when the karya has no cover", async () => {
    const { storage } = fakeStorage();
    const { app } = mount({ reads: [[{ coverKey: null }]], storage });
    const res = await app.request("/api/karya/k1/cover");
    expect(res.status).toBe(404);
  });

  it("200 + streams the bytes with the recovered content-type", async () => {
    const { storage, store } = fakeStorage();
    store.set("karya/k1/cover.png", Buffer.from([9, 8, 7]));
    const { app } = mount({
      reads: [[{ coverKey: "karya/k1/cover.png" }]],
      storage,
    });
    const res = await app.request("/api/karya/k1/cover");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(
      new Uint8Array([9, 8, 7]),
    );
  });
});

describe("DELETE /api/karya/:id/cover — owner-only", () => {
  it("200 + deletes the object and clears coverKey", async () => {
    const { storage, store, deletes } = fakeStorage();
    store.set("karya/k1/cover.png", Buffer.from([1]));
    const { app, writes } = mount({
      user: OWNER,
      reads: [OWNED, [{ coverKey: "karya/k1/cover.png" }]],
      storage,
    });
    const res = await app.request("/api/karya/k1/cover", { method: "DELETE" });
    expect(res.status).toBe(200);
    expect(deletes).toEqual(["karya/k1/cover.png"]);
    expect(writes.find((w) => w.op === "update")?.set).toMatchObject({
      coverKey: null,
    });
  });
});
