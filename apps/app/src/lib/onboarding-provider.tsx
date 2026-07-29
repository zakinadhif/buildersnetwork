import { type ReactNode, useState } from "react";
import type { Member, MemberMatch } from "@/lib/members";
import { OnboardingContext } from "@/lib/onboarding-context";

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

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<Member | null>(() =>
    load<Member | null>(DRAFT_KEY, null),
  );
  const [matches, setMatchesState] = useState<MemberMatch[]>(() =>
    load<MemberMatch[]>(MATCHES_KEY, []),
  );

  const setDraft = (member: Member) => {
    setDraftState(member);
    save(DRAFT_KEY, member);
  };

  const setMatches = (nextMatches: MemberMatch[]) => {
    setMatchesState(nextMatches);
    save(MATCHES_KEY, nextMatches);
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
    <OnboardingContext.Provider
      value={{ draft, matches, setDraft, setMatches, clear }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
