import {
  getGetFeatureFlagsQueryKey,
  useGetFeatureFlags,
} from "@myapp/api-client-react";
import {
  defaultFeatureSnapshot,
  type FeatureSnapshot,
} from "@myapp/feature-flags";
import { type ReactNode, useMemo } from "react";
import {
  FeatureFlagsContext,
  type FeatureFlagsValue,
} from "@/lib/feature-flags-context";

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
