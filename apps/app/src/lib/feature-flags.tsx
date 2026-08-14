import {
  getGetFeatureFlagsQueryKey,
  useGetFeatureFlags,
} from "@myapp/api-client-react";
import {
  defaultFeatureSnapshot,
  type FeatureKey,
  type FeatureSnapshot,
} from "@myapp/feature-flags";
import { createContext, type ReactNode, useContext, useMemo } from "react";

interface FeatureFlagsValue {
  enabled: (key: FeatureKey) => boolean;
  isLoading: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsValue | null>(null);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useGetFeatureFlags({
    query: {
      queryKey: getGetFeatureFlagsQueryKey(),
      staleTime: 30_000,
      retry: false,
    },
  });
  const snapshot: FeatureSnapshot = data ?? defaultFeatureSnapshot();
  const value = useMemo<FeatureFlagsValue>(
    () => ({
      enabled: (key) => snapshot[key],
      isLoading,
    }),
    [snapshot, isLoading],
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagsValue {
  const value = useContext(FeatureFlagsContext);
  if (!value) {
    throw new Error("useFeatureFlags must be used inside FeatureFlagsProvider");
  }
  return value;
}
