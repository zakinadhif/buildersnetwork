import type { FeatureKey } from "@myapp/feature-flags";
import { createContext, useContext } from "react";

export interface FeatureFlagsValue {
  enabled: (key: FeatureKey) => boolean;
  isLoading: boolean;
}

export const FeatureFlagsContext = createContext<FeatureFlagsValue | null>(
  null,
);

export function useFeatureFlags(): FeatureFlagsValue {
  const value = useContext(FeatureFlagsContext);
  if (!value) {
    throw new Error("useFeatureFlags must be used inside FeatureFlagsProvider");
  }
  return value;
}
