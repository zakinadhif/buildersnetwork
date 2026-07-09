import { featuredSeeder } from "./seeders/featured";
import { interestSeeder } from "./seeders/interests";
import { karyaSeeder } from "./seeders/karya";
import { memberSeeder } from "./seeders/members";
import { postSeeder } from "./seeders/posts";
import type { Seeder } from "./types";

// Order matters for FK dependencies: interests before members (members link to
// interest rows via user_interests), and karya after members (rosters +
// karya_interests reference seeded users/interests). Posts + featured come last
// — both reference seeded karya (posts also reference roster members).
export const seeders: readonly Seeder[] = [
  interestSeeder,
  memberSeeder,
  karyaSeeder,
  postSeeder,
  featuredSeeder,
];

export { runSeedCli } from "./runner";
// Exported so tests can exercise the real seeded credentials rather than a
// hand-copied fixture that could drift from what the seeder actually writes.
export {
  buildSeedCredentialAccounts,
  SEED_PASSWORD,
  SEED_USERS,
} from "./seeders/members";
export type { SeedContext, SeedDb, Seeder } from "./types";
