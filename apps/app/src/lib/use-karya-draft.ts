import { useContext } from "react";
import { KaryaDraftContext } from "@/lib/karya-draft-context";

export function useKaryaDraft() {
  const context = useContext(KaryaDraftContext);
  if (!context) {
    throw new Error("useKaryaDraft must be used within KaryaDraftProvider");
  }
  return context;
}
