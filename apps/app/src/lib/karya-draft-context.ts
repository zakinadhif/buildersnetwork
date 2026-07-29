import type { KaryaStage } from "@myapp/api-client-react";
import { createContext } from "react";

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

export interface KaryaDraftContextValue {
  draft: KaryaDraft;
  setDraft: (draft: KaryaDraft) => void;
  clear: () => void;
}

export const KaryaDraftContext = createContext<KaryaDraftContextValue | null>(
  null,
);
