import {
  createFixedFeatureFlagProvider,
  type FeatureFlagProvider,
} from "@myapp/feature-flags";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import type { AppEnv } from "../src/app";
import { requireFeature } from "../src/middleware/feature-flags";
import featuresRouter from "../src/routes/features";

function mount(featureFlags: FeatureFlagProvider) {
  const app = new Hono<AppEnv>();
  app.use("*", async (c, next) => {
    c.set("featureFlags", featureFlags);
    await next();
  });
  app.route("/api/features", featuresRouter);
  app.use("/api/assistant/*", requireFeature("aiAssistant"));
  app.get("/api/assistant/conversations", (c) => c.json({ ok: true }));
  return app;
}

describe("feature flag API", () => {
  it("returns the evaluated snapshot", async () => {
    const app = mount(createFixedFeatureFlagProvider({ aiAssistant: true }));

    const response = await app.request("/api/features");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ aiAssistant: true });
  });

  it("blocks a disabled backend surface", async () => {
    const app = mount(createFixedFeatureFlagProvider({ aiAssistant: false }));

    const response = await app.request("/api/assistant/conversations");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "feature_disabled" });
  });

  it("allows an enabled backend surface", async () => {
    const app = mount(createFixedFeatureFlagProvider({ aiAssistant: true }));

    const response = await app.request("/api/assistant/conversations");

    expect(response.status).toBe(200);
  });
});
