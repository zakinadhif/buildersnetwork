import { createContext, useContext } from "react";

/** Top-level gallery screens, navigated via each mockup's left sidebar. */
export type Screen = "launchpad" | "jelajahi" | "cari";

/** Which gallery screen (if any) a left-nav label routes to. Items that have no
 *  screen of their own (Minat Saya, Karya Saya) map to nothing. */
export const NAV_SCREEN: Partial<Record<string, Screen>> = {
  Launchpad: "launchpad",
  "Jelajahi Karya": "jelajahi",
  "Cari Kolaborator": "cari",
};

const NavContext = createContext<(screen: Screen) => void>(() => {});
export const NavProvider = NavContext.Provider;

/** Navigate between gallery screens. Provided by main.tsx's Gallery. */
export function useNavigate(): (screen: Screen) => void {
  return useContext(NavContext);
}
