import { type ReactNode, useState } from "react";
import {
  EMPTY_KARYA_DRAFT,
  type KaryaDraft,
  KaryaDraftContext,
} from "@/lib/karya-draft-context";

const DRAFT_KEY = "karya:draft";

function loadDraft(): KaryaDraft {
  if (typeof sessionStorage === "undefined") return EMPTY_KARYA_DRAFT;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw
      ? { ...EMPTY_KARYA_DRAFT, ...(JSON.parse(raw) as KaryaDraft) }
      : EMPTY_KARYA_DRAFT;
  } catch {
    return EMPTY_KARYA_DRAFT;
  }
}

export function KaryaDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<KaryaDraft>(loadDraft);

  const setDraft = (nextDraft: KaryaDraft) => {
    setDraftState(nextDraft);
    if (typeof sessionStorage !== "undefined") {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(nextDraft));
      } catch {
        // sessionStorage unavailable (private mode / quota) — degrade to memory.
      }
    }
  };

  const clear = () => {
    setDraftState(EMPTY_KARYA_DRAFT);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(DRAFT_KEY);
    }
  };

  return (
    <KaryaDraftContext.Provider value={{ draft, setDraft, clear }}>
      {children}
    </KaryaDraftContext.Provider>
  );
}
