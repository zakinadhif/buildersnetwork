import { createContext, useContext } from "react";

/** Every screen the gallery can show. The first three are the product's sidebar
 *  surfaces, reachable from any mockup's own left nav; the rest are flow surfaces
 *  (entry, detail, creation) that have no product nav — the screen switcher
 *  (bottom-left gallery chrome) is the only way into them. */
export type Screen =
  | "launchpad"
  | "jelajahi"
  | "cari"
  | "auth"
  | "mulai"
  | "karya-detail"
  | "karya-new"
  | "profil"
  | "minat";

/** Which gallery screen (if any) a left-nav label routes to. Items that have no
 *  screen of their own (Minat Saya, Karya Saya) map to nothing. */
export const NAV_SCREEN: Partial<Record<string, Screen>> = {
  Launchpad: "launchpad",
  "Jelajahi Karya": "jelajahi",
  "Cari Kolaborator": "cari",
  "Minat Saya": "minat",
};

/** The screen switcher's menu, grouped. Sidebar surfaces sit under "Surface";
 *  the standalone flows under "Alur". Grows as flow mockups land. */
export const SCREEN_META: { key: Screen; label: string; group: "Surface" | "Alur" | "Funnel" }[] = [
  { key: "launchpad", label: "Launchpad", group: "Surface" },
  { key: "jelajahi", label: "Jelajahi Karya", group: "Surface" },
  { key: "cari", label: "Cari Kolaborator", group: "Surface" },
  { key: "minat", label: "Minat Saya", group: "Surface" },
  { key: "auth", label: "Masuk / Daftar", group: "Alur" },
  { key: "mulai", label: "Mulai (profil minimal)", group: "Alur" },
  { key: "karya-detail", label: "Detail Karya", group: "Funnel" },
  { key: "karya-new", label: "Bikin Karya", group: "Funnel" },
  { key: "profil", label: "Profil Member", group: "Funnel" },
];

const NavContext = createContext<(screen: Screen) => void>(() => {});
export const NavProvider = NavContext.Provider;

/** Navigate between gallery screens. Provided by main.tsx's Gallery. */
export function useNavigate(): (screen: Screen) => void {
  return useContext(NavContext);
}
