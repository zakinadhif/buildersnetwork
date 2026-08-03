import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import type { AppEnv } from "../src/app";
import profileRouter from "../src/routes/profile";

describe("profile P0 route contract", () => {
  it("does not expose match result reads or writes", async () => {
    const app = new Hono<AppEnv>();
    app.route("/api", profileRouter);

    const read = await app.request("/api/matches");
    const write = await app.request("/api/matches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ matches: [] }),
    });

    expect(read.status).toBe(404);
    expect(write.status).toBe(404);
  });
});
