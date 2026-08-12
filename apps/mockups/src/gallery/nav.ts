import { createContext, useContext } from "react";

/** Every screen the gallery can show. The first three are the product's sidebar
 *  surfaces, reachable from any mockup's own left nav. The funnel targets (Detail
 *  Karya, Bikin Karya, Profil Member) are drill-ins that also sit inside the shell
 *  — reached from a card or CTA, not the nav. The entry flows (auth and mulai)
 *  carry no product nav; the screen switcher (bottom-left gallery chrome)
 *  reaches all of them. */
export type Screen =
  | "scroll"
  | "karya"
  | "people"
  | "cari"
  | "masuk"
  | "daftar"
  | "mulai"
  | "karya-detail"
  | "post-detail"
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
  "Asisten AI": "onboarding",
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
    designStatus: "in-review",
    productStatus: "active",
    scopeNote: "Shell, karya-update feed, and newest-comment teaser that routes to each post detail",
    excludes: [
      "post headlines and kinds",
      "appreciation",
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
    key: "masuk",
    label: "Masuk",
    group: "Alur",
    designStatus: "approved-reference",
    productStatus: "active",
    groundedBy: 148,
    scopeNote: "Standalone email and password entry with recovery and validation states",
    excludes: ["social sign-in", "passwordless sign-in"],
  },
  {
    key: "daftar",
    label: "Daftar",
    group: "Alur",
    designStatus: "approved-reference",
    productStatus: "active",
    groundedBy: 148,
    scopeNote: "Standalone account creation and email verification flow",
    excludes: ["social sign-up", "profile fields before Mulai"],
  },
  {
    key: "mulai",
    label: "Mulai (lengkapi profil)",
    group: "Alur",
    designStatus: "approved-reference",
    productStatus: "active",
    groundedBy: 148,
    scopeNote: "Direct profile setup with identity, campus, skills, and interests",
    excludes: ["AI conversational onboarding", "automatic profile inference"],
  },
  {
    key: "onboarding",
    label: "Asisten AI",
    group: "Surface",
    designStatus: "exploration",
    productStatus: "retired",
    scopeNote: "Shelved P1 exploration: canonical action-capable AI chat and conversation history",
    excludes: ["P0 implementation", "actions without explicit confirmation"],
  },
  {
    key: "karya-detail",
    label: "Detail Karya",
    group: "Funnel",
    designStatus: "in-review",
    productStatus: "active",
    scopeNote: "Karya detail with compact comment previews that open each post permalink",
    excludes: [
      "post kinds",
      "appreciation",
      "collaboration requests",
      "nested replies, reactions, notifications, and page-level comments",
    ],
  },
  {
    key: "post-detail",
    label: "Detail Post",
    group: "Funnel",
    designStatus: "in-review",
    productStatus: "active",
    scopeNote: "X-like expanded post thread: original post, inline composer, then flat chronological comments",
    excludes: ["nested replies", "reactions", "notifications", "page-level comments", "moderation dashboard"],
  },
  {
    key: "karya-new",
    label: "Bikin Karya",
    group: "Funnel",
    designStatus: "approved-reference",
    productStatus: "active",
    groundedBy: 148,
    scopeNote: "Direct manual karya creation with validation, optional media, and publish states",
    excludes: ["AI-assisted authoring", "collaboration opening state"],
  },
  {
    key: "profil",
    label: "Profil Member",
    group: "Funnel",
    designStatus: "approved-reference",
    productStatus: "active",
    groundedBy: 148,
    scopeNote: "Interactive own profile and read-only visitor profile with karya and empty states",
    excludes: ["availability", "matchmaking", "messaging"],
  },
];

const NavContext = createContext<(screen: Screen) => void>(() => {});
export const NavProvider = NavContext.Provider;

/** Navigate between gallery screens. Provided by main.tsx's Gallery. */
export function useNavigate(): (screen: Screen) => void {
  return useContext(NavContext);
}
