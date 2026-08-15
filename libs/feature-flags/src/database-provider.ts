import type { Db } from "@myapp/db";
import { featureFlags } from "@myapp/db/schema";
import { eq } from "drizzle-orm";
import {
  defaultFeatureSnapshot,
  type FeatureKey,
  type FeatureSnapshot,
  isFeatureKey,
} from "./definitions";
import type { FeatureFlagProvider } from "./provider";

export function createDatabaseFeatureFlagProvider(db: Db): FeatureFlagProvider {
  return {
    async isEnabled(key: FeatureKey) {
      const [row] = await db
        .select({ enabled: featureFlags.enabled })
        .from(featureFlags)
        .where(eq(featureFlags.key, key))
        .limit(1);

      return row?.enabled ?? defaultFeatureSnapshot()[key];
    },
    async snapshot() {
      const snapshot: FeatureSnapshot = defaultFeatureSnapshot();
      const rows = await db
        .select({ key: featureFlags.key, enabled: featureFlags.enabled })
        .from(featureFlags);

      for (const row of rows) {
        if (isFeatureKey(row.key)) snapshot[row.key] = row.enabled;
      }

      return snapshot;
    },
  };
}
