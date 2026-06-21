import { featured } from "../../schema";
import type { Seeder } from "../types";

// Pre-mark a couple seed karya as featured so the homepage "Top picked" section
// isn't empty on a fresh seed (DECISION-A). This *is* the "team marks featured"
// mechanism for P0 — ongoing curation is the in-app toggle gated by
// ADMIN_EMAILS, not SQL. Lower `rank` sorts first. Idempotent + `--reset`-safe.
const SEED_FEATURED = [
  { karyaId: "seed_k1", rank: 0 },
  { karyaId: "seed_k2", rank: 1 },
];

export const featuredSeeder: Seeder = {
  name: "featured",
  description: "Mark a couple seed karya as featured for the homepage",
  tables: [featured],
  async run({ db, log }) {
    log("marking featured karya…");
    await db.insert(featured).values(SEED_FEATURED).onConflictDoNothing();

    log(`featured ${SEED_FEATURED.length} karya`);
  },
};
