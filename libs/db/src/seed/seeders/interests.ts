import { slugifyInterest } from "../../interests";
import { interests } from "../../schema";
import type { Seeder } from "../types";

// Curated starter vocabulary (FR-15). Campus-wide / all-faculties per Sprint 0
// DECISION-B — spans building disciplines, not just CS. Provisional copy; the
// schema + slug dedupe are what's load-bearing. Refine in a later content pass.
const CURATED_INTERESTS = [
  // Tech & engineering
  "Web Development",
  "Mobile Development",
  "Backend Development",
  "Systems Programming",
  "Distributed Systems",
  "DevOps & Cloud",
  "Machine Learning",
  "Data Science",
  "Cybersecurity",
  "Game Development",
  "Embedded & IoT",
  // Design & product
  "UI/UX Design",
  "Product Design",
  "Graphic Design",
  "Product Management",
  // Words & knowledge
  "Technical Writing",
  "Content Writing",
  "Research",
  // Build & ship
  "Open Source",
  "Building in Public",
  "Entrepreneurship",
  "Startups",
  // People & domains
  "Community Building",
  "Education",
  "Social Impact",
  "Fintech",
  "Health Tech",
  "Creative Tech",
];

export const interestSeeder: Seeder = {
  name: "interests",
  description: "Seed the curated starter interest vocabulary",
  tables: [interests],
  async run({ db, log }) {
    log("inserting curated interests…");
    await db
      .insert(interests)
      .values(
        CURATED_INTERESTS.map((name) => ({
          id: crypto.randomUUID(),
          name,
          slug: slugifyInterest(name),
          curated: true,
        })),
      )
      .onConflictDoNothing({ target: interests.slug });

    log(`seeded ${CURATED_INTERESTS.length} curated interests`);
  },
};
