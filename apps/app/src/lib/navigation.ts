/** Navigation state carried between app routes, never browser history. */
export interface AppNavigationState {
  back?: string;
}

/**
 * The current in-app URL, including filters expressed as query parameters.
 * Keeping this explicitly lets a detail screen return to the precise catalog
 * or directory that opened it without relying on `history.go(-1)`.
 */
export function currentAppPath(pathname: string): string {
  if (typeof window === "undefined") return pathname;
  return `${pathname}${window.location.search}`;
}

export function backNavigationState(pathname: string): AppNavigationState {
  return { back: currentAppPath(pathname) };
}

export function isInternalAppPath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

/** Resolve a secondary screen's return target without consulting tab history. */
export function resolveBackDestination(backTo?: string): string | undefined {
  const state =
    typeof window === "undefined"
      ? undefined
      : (window.history.state as AppNavigationState | null);

  return isInternalAppPath(state?.back) ? state.back : backTo;
}
