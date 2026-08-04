import { type ReactNode, useEffect, useState } from "react";
import type { Member } from "@/lib/members";
import { OnboardingContext } from "@/lib/onboarding-context";

const DRAFT_KEY = "onboarding:draft";
const LEGACY_MATCHES_KEY = "onboarding:matches";

function load<T>(key: string, fallback: T): T {
  if (typeof sessionStorage === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage unavailable (private mode / quota) — degrade to in-memory.
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<Member | null>(() =>
    load<Member | null>(DRAFT_KEY, null),
  );

  useEffect(() => {
    // Match results left by pre-P0 builds are inert and must not survive as a
    // hidden local capability after the route and API have been removed.
    sessionStorage.removeItem(LEGACY_MATCHES_KEY);
  }, []);
  const setDraft = (member: Member) => {
    setDraftState(member);
    save(DRAFT_KEY, member);
  };

  const clear = () => {
    setDraftState(null);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(LEGACY_MATCHES_KEY);
    }
  };

  return (
    <OnboardingContext.Provider value={{ draft, setDraft, clear }}>
      {children}
    </OnboardingContext.Provider>
  );
}
