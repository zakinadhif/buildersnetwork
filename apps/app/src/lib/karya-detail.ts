import type { KaryaScreenshot } from "@myapp/api-client-react";

export type KaryaDetailState = "loading" | "error" | "not-found" | "ready";

export function karyaDetailState({
  loading,
  failed,
  errorStatus,
  hasData,
}: {
  loading: boolean;
  failed: boolean;
  errorStatus?: number;
  hasData: boolean;
}): KaryaDetailState {
  if (loading) return "loading";
  if (failed) return errorStatus === 404 ? "not-found" : "error";
  return hasData ? "ready" : "not-found";
}

export function orderedScreenshots(
  screenshots: KaryaScreenshot[],
): KaryaScreenshot[] {
  return [...screenshots].sort((a, b) =>
    a.orientation === b.orientation
      ? a.position - b.position
      : a.orientation === "landscape"
        ? -1
        : 1,
  );
}
