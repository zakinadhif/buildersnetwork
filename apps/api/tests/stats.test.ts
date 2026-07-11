import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import type { AppEnv } from "../src/app";
import { statsRouter } from "../src/routes/stats";
import { createDbMock } from "./helpers/harness";

// Community-pulse counts for the Launchpad rail (issue #20). The route issues
// three count(*) selects in order — karya, profiles, then posts (this week) —
// and shapes them into the wire `CommunityStats`. Mount the real router with an
// injected db so the mapping + key names are exercised, not just typechecked.

function mount(reads: unknown[][]): Hono<AppEnv> {
  const { db } = createDbMock(reads);
  const app = new Hono<AppEnv>();
  app.use("*", async (c, next) => {
    c.set("db", db as unknown as AppEnv["Variables"]["db"]);
    await next();
  });
  app.route("/api/stats", statsRouter);
  return app;
}

describe("GET /api/stats — community pulse", () => {
  it("maps the three counts onto the wire shape", async () => {
    const app = mount([[{ n: 7 }], [{ n: 12 }], [{ n: 4 }]]);
    const res = await app.request("/api/stats");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      karya: 7,
      builders: 12,
      updatesThisWeek: 4,
    });
  });

  it("falls back to 0 when a count query returns no row", async () => {
    const app = mount([[], [], []]);
    const res = await app.request("/api/stats");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      karya: 0,
      builders: 0,
      updatesThisWeek: 0,
    });
  });
});
