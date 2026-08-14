import { commentSeeder } from "./seeders/comments";
import { featuredSeeder } from "./seeders/featured";
import { interestSeeder } from "./seeders/interests";
import { karyaSeeder } from "./seeders/karya";
import { memberSeeder } from "./seeders/members";
import { postSeeder } from "./seeders/posts";
import type { Seeder } from "./types";

// Order matters for FK dependencies: interests before members (members link to
// interest rows via user_interests), and karya after members (rosters +
// karya_interests reference seeded users/interests). Posts, comments, and
// featured come last — they reference seeded karya/users.
export const seeders: readonly Seeder[] = [
  interestSeeder,
  memberSeeder,
  karyaSeeder,
  postSeeder,
  commentSeeder,
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
