import type { KaryaStage } from "@myapp/api-client-react";
import { createContext, useContext, useState } from "react";

export interface KaryaDraft {
  title: string;
  description: string;
  stages: KaryaStage[];
  interests: string[];
}

export const EMPTY_KARYA_DRAFT: KaryaDraft = {
  title: "",
  description: "",
  stages: ["idea"],
  interests: [],
};

interface KaryaDraftCtxValue {
  draft: KaryaDraft;
  setDraft: (d: KaryaDraft) => void;
  clear: () => void;
}

const KaryaDraftCtx = createContext<KaryaDraftCtxValue | null>(null);

// Persist the in-progress karya draft to sessionStorage so a reload on
// /karya/new (or a hop to the AI pre-fill and back) doesn't lose edits (NFR-7).
// Mirrors onboarding-ctx — both AI pre-fill and the direct form write here, and
// the review form reads it as its initial state (DECISION-D).
const DRAFT_KEY = "karya:draft";

function load(): KaryaDraft {
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

export function KaryaDraftProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraftState] = useState<KaryaDraft>(load);

  const setDraft = (d: KaryaDraft) => {
    setDraftState(d);
    if (typeof sessionStorage !== "undefined") {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
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
    <KaryaDraftCtx.Provider value={{ draft, setDraft, clear }}>
      {children}
    </KaryaDraftCtx.Provider>
  );
}

export function useKaryaDraft() {
  const ctx = useContext(KaryaDraftCtx);
  if (!ctx)
    throw new Error("useKaryaDraft must be used within KaryaDraftProvider");
  return ctx;
}
