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

export type DesignStatus =
  | "exploration"
  | "in-review"
  | "approved-reference";

export type ProductStatus = "active" | "retired";

export type ScreenMeta = {
  key: Screen;
  label: string;
  group: "Surface" | "Alur" | "Funnel";
  /** Design maturity is deliberately separate from product lifecycle. Only an
   *  Approved Reference can ground a feature through Gate B. */
  designStatus: DesignStatus;
  /** Retired screens remain useful design records, but are no longer live
   *  product surfaces. */
  productStatus: ProductStatus;
  /** Issue that approved the current reference. Required by convention when
   *  designStatus is "approved-reference". */
  groundedBy?: number;
  /** Approved slice of a screen whose visible mock data may reach beyond P0. */
  scopeNote?: string;
  /** Capabilities visible in the mockup that are not part of its approved scope. */
  excludes?: readonly string[];
};

/** The screen switcher's menu, grouped. Sidebar surfaces sit under "Surface";
 *  the standalone flows under "Alur". Grows as flow mockups land. */
export const SCREEN_META: ScreenMeta[] = [
  {
    key: "scroll",
    label: "Scroll",
    group: "Surface",
    designStatus: "approved-reference",
    productStatus: "active",
    groundedBy: 98,
    scopeNote: "Shell, hierarchy, and the karya-update feed",
    excludes: [
      "post headlines and kinds",
      "appreciation",
      "comment summaries",
      "collaboration openings",
    ],
  },
  {
    key: "karya",
    label: "Karya",
    group: "Surface",
    designStatus: "approved-reference",
    productStatus: "active",
    groundedBy: 98,
    scopeNote: "Karya directory layout and discovery interactions",
    excludes: ["appreciation", "collaboration state"],
  },
  {
    key: "people",
    label: "People",
    group: "Surface",
    designStatus: "approved-reference",
    productStatus: "active",
    groundedBy: 98,
    scopeNote: "Builder directory, search, and profile navigation",
    excludes: ["availability badges", "matchmaking", "messaging"],
  },
  {
    key: "cari",
    label: "Cari Kolaborator",
    group: "Surface",
    designStatus: "exploration",
    productStatus: "retired",
    scopeNote: "Parallel A/B/C/E directions; no direction was selected",
  },
  {
    key: "minat",
    label: "Minat Saya",
    group: "Surface",
    designStatus: "exploration",
    productStatus: "retired",
    scopeNote:
      "Historical direction only; the auxiliary screen still needs polishing",
  },
  {
    key: "auth",
    label: "Masuk / Daftar",
    group: "Alur",
    designStatus: "exploration",
    productStatus: "active",
    scopeNote: "Auxiliary entry flow still needs polishing",
  },
  {
    key: "mulai",
    label: "Mulai (profil minimal)",
    group: "Alur",
    designStatus: "exploration",
    productStatus: "active",
    scopeNote: "Auxiliary profile setup flow still needs polishing",
  },
  {
    key: "onboarding",
    label: "Onboarding AI",
    group: "Alur",
    designStatus: "exploration",
    productStatus: "active",
    scopeNote:
      "The optional assistant remains relevant, but the current review-and-matches result is outside P0",
    excludes: ["generated matches", "match persistence"],
  },
  {
    key: "karya-detail",
    label: "Detail Karya",
    group: "Funnel",
    designStatus: "exploration",
    productStatus: "active",
    scopeNote:
      "Peripheral funnel screen still needs polishing before it can ground implementation",
    excludes: [
      "post kinds",
      "appreciation",
      "collaboration requests",
      "comments until #144 lands",
    ],
  },
  {
    key: "karya-new",
    label: "Bikin Karya",
    group: "Funnel",
    designStatus: "exploration",
    productStatus: "active",
    scopeNote:
      "Peripheral creation flow still needs polishing before it can ground implementation",
    excludes: ["collaboration opening state"],
  },
  {
    key: "profil",
    label: "Profil Member",
    group: "Funnel",
    designStatus: "exploration",
    productStatus: "active",
    scopeNote:
      "Peripheral member profile still needs polishing before it can ground implementation",
    excludes: ["availability", "matchmaking", "messaging"],
  },
];

const NavContext = createContext<(screen: Screen) => void>(() => {});
export const NavProvider = NavContext.Provider;

/** Navigate between gallery screens. Provided by main.tsx's Gallery. */
export function useNavigate(): (screen: Screen) => void {
  return useContext(NavContext);
}
