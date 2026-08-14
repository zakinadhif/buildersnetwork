export const featureFlagDefaults = {
  aiAssistant: false,
} as const satisfies Record<string, boolean>;

export type FeatureKey = keyof typeof featureFlagDefaults;
export type FeatureSnapshot = Record<FeatureKey, boolean>;

export const featureKeys = Object.keys(featureFlagDefaults) as FeatureKey[];

export function defaultFeatureSnapshot(): FeatureSnapshot {
  return { ...featureFlagDefaults };
}

export function isFeatureKey(value: string): value is FeatureKey {
  return Object.hasOwn(featureFlagDefaults, value);
}
