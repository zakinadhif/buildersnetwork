/**
 * Shared image assets for the Al-Fath Berkarya mockup gallery.
 *
 * Editorial cover illustrations + product imagery, generated to match the
 * brand (terracotta / maroon on warm cream, four-petal + hash motif).
 * Imported as modules so Vite resolves the correct hashed, base-prefixed URLs
 * in both dev ("/") and the production "/app/" build.
 */

import ai from "./images/ai.jpg";
import commerce from "./images/commerce.jpg";
import community from "./images/community.jpg";
import data from "./images/data.jpg";
import devtools from "./images/devtools.jpg";
import education from "./images/education.jpg";
import environment from "./images/environment.jpg";
import heroImg from "./images/hero.jpg";
import maps from "./images/maps.jpg";
import music from "./images/music.jpg";
import productivity from "./images/productivity.jpg";
import security from "./images/security.jpg";
import shot1 from "./images/shot-1.jpg";
import shot2 from "./images/shot-2.jpg";
import shot3 from "./images/shot-3.jpg";
import shot4 from "./images/shot-4.jpg";
import writing from "./images/writing.jpg";

export type CoverTheme =
  | "community"
  | "education"
  | "data"
  | "music"
  | "productivity"
  | "commerce"
  | "ai"
  | "environment"
  | "maps"
  | "writing"
  | "devtools"
  | "security";

export const covers: Record<CoverTheme, string> = {
  community,
  education,
  data,
  music,
  productivity,
  commerce,
  ai,
  environment,
  maps,
  writing,
  devtools,
  security,
};

/** Wide editorial hero illustration (4:3). */
export const hero = heroImg;

/** Play-Store-style app screenshots for the Launchpad featured project. */
export const screenshots = [shot1, shot2, shot3, shot4];

/**
 * Maps an interest/tag (the Indonesian vocabulary used across the mockups)
 * to a cover theme. Keys are lowercase; the first matching interest wins.
 * Intentionally leaves generic tags (web, mobile, ui/ux, produk, fullstack…)
 * unmapped so a more descriptive interest later in the list is chosen.
 */
const INTEREST_THEME: Record<string, CoverTheme> = {
  // community
  komunitas: "community",
  networking: "community",
  karir: "community",
  sosial: "community",
  kolaborasi: "community",
  // education
  edukasi: "education",
  pendidikan: "education",
  // data
  data: "data",
  visualisasi: "data",
  // music
  musik: "music",
  budaya: "music",
  // productivity
  produktivitas: "productivity",
  tools: "productivity",
  wellness: "productivity",
  // commerce
  umkm: "commerce",
  // ai
  ai: "ai",
  "ai/ml": "ai",
  "machine learning": "ai",
  nlp: "ai",
  bahasa: "ai",
  "edge ai": "ai",
  kesehatan: "ai",
  // environment
  lingkungan: "environment",
  iot: "environment",
  // maps
  maps: "maps",
  pemetaan: "maps",
  // writing
  konten: "writing",
  penulisan: "writing",
  kreativitas: "writing",
  riset: "writing",
  // devtools
  "open source": "devtools",
  "developer tools": "devtools",
  "dev tools": "devtools",
  backend: "devtools",
  "data engineering": "devtools",
  api: "devtools",
  "integrasi sistem": "devtools",
  // security
  keamanan: "security",
  kampus: "security",
};

/** Pick a cover image for a karya based on its interest tags. */
export function coverFor(
  interests: string[],
  fallback: CoverTheme = "community",
): string {
  for (const i of interests) {
    const theme = INTEREST_THEME[i.toLowerCase()];
    if (theme) return covers[theme];
  }
  return covers[fallback];
}
