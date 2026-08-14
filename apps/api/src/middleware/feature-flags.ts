import type { FeatureKey } from "@myapp/feature-flags";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../app";

export function requireFeature(key: FeatureKey): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    if (!(await c.get("featureFlags").isEnabled(key))) {
      return c.json({ error: "feature_disabled" }, 404);
    }
    return next();
  };
}
