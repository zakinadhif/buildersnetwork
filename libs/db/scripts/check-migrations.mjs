// Migration integrity check (no database required).
//
// The migration *runner* applies files by reading meta/_journal.json, NOT by
// listing the directory. So a stray .sql file that isn't in the journal is
// silently ignored — it looks applied but never runs. (That's exactly how
// 0001_add_profiles_and_matches.sql sat unused beside 0001_panoramic_cable.)
//
// This asserts the journal and the .sql files on disk describe the same set of
// migrations, in the same order. Run it in CI so the drift can't recur.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const migrationsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);
const journalPath = join(migrationsDir, "meta", "_journal.json");

const journal = JSON.parse(readFileSync(journalPath, "utf8"));
const journalTags = journal.entries.map((e) => e.tag);

const fileTags = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => f.slice(0, -".sql".length))
  .sort();

const journalSet = new Set(journalTags);
const fileSet = new Set(fileTags);

const orphans = fileTags.filter((t) => !journalSet.has(t)); // on disk, not journaled
const missing = journalTags.filter((t) => !fileSet.has(t)); // journaled, no file

// idx must be 0,1,2,... contiguous and in order.
const outOfOrder = journal.entries.some((e, i) => e.idx !== i);

const problems = [];
if (orphans.length)
  problems.push(
    `Orphan .sql file(s) not in _journal.json (the runner ignores these): ${orphans.join(", ")}`,
  );
if (missing.length)
  problems.push(`Journal entries with no .sql file: ${missing.join(", ")}`);
if (outOfOrder)
  problems.push(
    `Journal idx values are not contiguous/ordered: ${journal.entries.map((e) => e.idx).join(", ")}`,
  );

if (problems.length) {
  console.error("Migration integrity check FAILED:");
  for (const p of problems) console.error(`  - ${p}`);
  console.error(
    "\nFix: re-generate with `pnpm db:generate`, or delete the stray file.",
  );
  process.exit(1);
}

console.log(
  `Migration integrity OK — ${journalTags.length} migrations, journal and files match.`,
);
