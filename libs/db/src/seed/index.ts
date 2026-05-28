import { memberSeeder } from "./seeders/members";
import type { Seeder } from "./types";

export const seeders: readonly Seeder[] = [memberSeeder];

export { runSeedCli } from "./runner";
export type { SeedContext, SeedDb, Seeder } from "./types";
