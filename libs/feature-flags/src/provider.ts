import type { FeatureKey, FeatureSnapshot } from "./definitions";

export interface FeatureFlagProvider {
  isEnabled(key: FeatureKey): Promise<boolean>;
  snapshot(): Promise<FeatureSnapshot>;
}
