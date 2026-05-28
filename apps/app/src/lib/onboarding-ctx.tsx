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

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState<Member | null>(null);
  const [matches, setMatches] = useState<MemberMatch[]>([]);

  const clear = () => {
    setDraft(null);
    setMatches([]);
  };

  return (
    <OnboardingCtx.Provider value={{ draft, matches, setDraft, setMatches, clear }}>
      {children}
    </OnboardingCtx.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingCtx);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
