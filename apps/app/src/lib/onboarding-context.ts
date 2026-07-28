import { createContext } from "react";
import type { Member, MemberMatch } from "@/lib/members";

export interface OnboardingContextValue {
  draft: Member | null;
  matches: MemberMatch[];
  setDraft: (member: Member) => void;
  setMatches: (matches: MemberMatch[]) => void;
  clear: () => void;
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(
  null,
);
