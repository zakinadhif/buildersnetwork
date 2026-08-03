import { createContext } from "react";
import type { Member } from "@/lib/members";

export interface OnboardingContextValue {
  draft: Member | null;
  setDraft: (member: Member) => void;
  clear: () => void;
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(
  null,
);
