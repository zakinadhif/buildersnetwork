import { createContext, useContext, useState } from "react";
import type { Member, MemberMatch } from "./members";

interface OnboardingCtxValue {
  draft: Member | null;
  matches: MemberMatch[];
  setDraft: (m: Member) => void;
  setMatches: (m: MemberMatch[]) => void;
  clear: () => void;
}

const OnboardingCtx = createContext<OnboardingCtxValue | null>(null);

// Persist the in-progress onboarding draft/matches to sessionStorage so a
// reload on /review (or /matches) preserves edits instead of bouncing the user
// back to /onboarding (NFR-7).
const DRAFT_KEY = "onboarding:draft";
const MATCHES_KEY = "onboarding:matches";

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

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraftState] = useState<Member | null>(() =>
    load<Member | null>(DRAFT_KEY, null),
  );
  const [matches, setMatchesState] = useState<MemberMatch[]>(() =>
    load<MemberMatch[]>(MATCHES_KEY, []),
  );

  const setDraft = (m: Member) => {
    setDraftState(m);
    save(DRAFT_KEY, m);
  };

  const setMatches = (m: MemberMatch[]) => {
    setMatchesState(m);
    save(MATCHES_KEY, m);
  };

  const clear = () => {
    setDraftState(null);
    setMatchesState([]);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(MATCHES_KEY);
    }
  };

  return (
    <OnboardingCtx.Provider
      value={{ draft, matches, setDraft, setMatches, clear }}
    >
      {children}
    </OnboardingCtx.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingCtx);
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
