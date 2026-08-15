import {
  defaultFeatureSnapshot,
  type FeatureKey,
  type FeatureSnapshot,
} from "./definitions";
import type { FeatureFlagProvider } from "./provider";

export function createEnvFeatureFlagProvider(
  values: Partial<FeatureSnapshot>,
): FeatureFlagProvider {
  const flags = { ...defaultFeatureSnapshot(), ...values };

  return {
    async isEnabled(key: FeatureKey) {
      return flags[key];
    },
    async snapshot() {
      return { ...flags };
    },
  };
}
