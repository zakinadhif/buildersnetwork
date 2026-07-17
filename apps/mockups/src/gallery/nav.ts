import { createContext, useContext } from "react";

/** Every screen the gallery can show. The first three are the product's sidebar
 *  surfaces, reachable from any mockup's own left nav. The funnel targets (Detail
 *  Karya, Bikin Karya, Profil Member) are drill-ins that also sit inside the shell
 *  — reached from a card or CTA, not the nav. The entry flows (auth, mulai,
 *  onboarding) carry no product nav; the screen switcher (bottom-left gallery
 *  chrome) reaches all of them. */
export type Screen =
  | "scroll"
  | "karya"
  | "people"
  | "cari"
  | "auth"
  | "mulai"
  | "karya-detail"
  | "karya-new"
  | "profil"
  | "minat"
  | "onboarding";

/** Which gallery screen a left-nav label routes to. The sidebar pins only the
 *  live surfaces — retired ones (see `retired` in SCREEN_META) were pulled from
 *  the rail and stay reachable through the screen switcher alone. */
export const NAV_SCREEN: Partial<Record<string, Screen>> = {
  Scroll: "scroll",
  Karya: "karya",
  People: "people",
};

export type ScreenMeta = {
  key: Screen;
  label: string;
  group: "Surface" | "Alur" | "Funnel";
  /** The product has moved past this screen (03d4cc1 pulled Cari Kolaborator and
   *  Minat Saya off the rail when the surfaces collapsed 4 → 3). Kept as a design
   *  record, so the switcher hides it behind its "Layar tidak dipakai" toggle. */
  retired?: true;
};

/** The screen switcher's menu, grouped. Sidebar surfaces sit under "Surface";
 *  the standalone flows under "Alur". Grows as flow mockups land. */
export const SCREEN_META: ScreenMeta[] = [
  { key: "scroll", label: "Scroll", group: "Surface" },
  { key: "karya", label: "Karya", group: "Surface" },
  { key: "people", label: "People", group: "Surface" },
  { key: "cari", label: "Cari Kolaborator", group: "Surface", retired: true },
  { key: "minat", label: "Minat Saya", group: "Surface", retired: true },
  { key: "auth", label: "Masuk / Daftar", group: "Alur" },
  { key: "mulai", label: "Mulai (profil minimal)", group: "Alur" },
  { key: "onboarding", label: "Onboarding AI", group: "Alur" },
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
