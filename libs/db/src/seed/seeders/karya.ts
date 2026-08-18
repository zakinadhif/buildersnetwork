import { MOCKUP_KARYA } from "@myapp/mockup-data";
import { inArray } from "drizzle-orm";
import { dedupeBySlug, slugifyInterest } from "../../interests";
import { normalizeStages } from "../../karya";
import {
  interests,
  karya,
  karyaInterests,
  karyaMembers,
  karyaScreenshots,
} from "../../schema";
import { insertInChunks, selectInChunks } from "../chunk";
import type { Seeder } from "../types";

// Example karya owned by existing seed members. Each carries a couple stages,
// a few interest tags (find-or-create into the SAME catalog as profiles —
// DECISION-C), an owner row, ≥1 approved contributor (so the roster renders
// faces), and ≥1 pending request (so the approve/decline UI has something to
// act on). Stable IDs keep the seeder idempotent. Some interest names overlap
// the curated list (reused by slug); the rest land as free-text rows.
// The app's stored lifecycle enum is deliberately narrower than the labels in
// the visual mockup. This retains every mockup title, description, interest,
// and image while translating its display-stage vocabulary at the boundary.
const STAGES_BY_MOCKUP_LABEL: Record<string, string> = {
  Ide: "idea",
  Prototype: "building",
  MVP: "building",
  Beta: "validating",
  Riset: "validating",
  "Cari Kolaborator": "idea",
};

const SEED_KARYA = MOCKUP_KARYA.map((item, index) => ({
  ...item,
  id: `seed_k${item.id}`,
  createdBy: `seed_m${(index % 5) + 1}`,
  members: [`seed_m${((index + 2) % 5) + 1}`],
  pending: [`seed_m${((index + 3) % 5) + 1}`],
  stages: normalizeStages(
    item.stages.map((stage) => STAGES_BY_MOCKUP_LABEL[stage]),
  ),
}));

export const karyaSeeder: Seeder = {
  name: "karya",
  description: "Seed example karya with rosters and pending requests",
  // Owns karya + the roster/interest joins. NOT `interests` — that catalog is
  // owned by the interests seeder; here we find-or-create into it by slug.
  tables: [karya, karyaMembers, karyaInterests, karyaScreenshots],
  async run({ db, log, uploadMockupImage }) {
    log("inserting seed karya…");
    const karyaRows = SEED_KARYA.map((k) => ({
      id: k.id,
      title: k.title,
      description: k.description,
      stages: k.stages,
      createdBy: k.createdBy,
      coverKey: uploadMockupImage ? `karya/${k.id}/cover.jpg` : null,
    }));
    await insertInChunks(karya, karyaRows, (chunk) =>
      db.insert(karya).values(chunk).onConflictDoNothing(),
    );

    if (uploadMockupImage) {
      log("uploading mockup cover and screenshot images…");
      const screenshotRows = SEED_KARYA.flatMap((k) =>
        (k.landscapeScreenshots ?? []).map((theme, position) => {
          const id = `seed_shot_${k.id}_${position + 1}`;
          return {
            id,
            karyaId: k.id,
            key: `karya/${k.id}/screenshots/${id}.jpg`,
            orientation: "landscape",
            position,
            theme,
          };
        }),
      );
      await Promise.all([
        ...SEED_KARYA.map((k) =>
          uploadMockupImage(k.cover, `karya/${k.id}/cover.jpg`),
        ),
        ...screenshotRows.map((shot) =>
          uploadMockupImage(shot.theme, shot.key),
        ),
      ]);
      await insertInChunks(
        karyaScreenshots,
        screenshotRows.map(({ theme: _theme, ...row }) => row),
        (chunk) =>
          db.insert(karyaScreenshots).values(chunk).onConflictDoNothing(),
      );
      log(
        `uploaded ${SEED_KARYA.length + screenshotRows.length} mockup images`,
      );
    }

    log("inserting karya rosters…");
    const memberRows = SEED_KARYA.flatMap((k) => [
      // Creator: owner + member in one row (DECISION-G).
      { karyaId: k.id, userId: k.createdBy, role: "owner", status: "member" },
      ...k.members.map((u) => ({
        karyaId: k.id,
        userId: u,
        role: "member",
        status: "member",
      })),
      ...k.pending.map((u) => ({
        karyaId: k.id,
        userId: u,
        role: "member",
        status: "pending",
      })),
    ]);
    await insertInChunks(karyaMembers, memberRows, (chunk) =>
      db.insert(karyaMembers).values(chunk).onConflictDoNothing(),
    );

    log("linking karya interests…");
    // Find-or-create every referenced interest by slug. Curated rows already
    // exist (slug conflict → skipped); the rest become free-text rows.
    const deduped = dedupeBySlug(SEED_KARYA.flatMap((k) => k.interests));
    if (deduped.length > 0) {
      const interestRows = deduped.map((d) => ({
        id: crypto.randomUUID(),
        name: d.name,
        slug: d.slug,
        curated: false,
      }));
      await insertInChunks(interests, interestRows, (chunk) =>
        db.insert(interests).values(chunk).onConflictDoNothing({
          target: interests.slug,
        }),
      );

      const rows = await selectInChunks(
        deduped.map((d) => d.slug),
        (chunk) =>
          db
            .select({ id: interests.id, slug: interests.slug })
            .from(interests)
            .where(inArray(interests.slug, chunk)),
      );
      const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));

      const links = SEED_KARYA.flatMap((k) => {
        const seen = new Set<string>();
        return k.interests.flatMap((name) => {
          const id = idBySlug.get(slugifyInterest(name));
          if (!id || seen.has(id)) return [];
          seen.add(id);
          return [{ karyaId: k.id, interestId: id }];
        });
      });
      await insertInChunks(karyaInterests, links, (chunk) =>
        db.insert(karyaInterests).values(chunk).onConflictDoNothing(),
      );
      log(`linked ${links.length} karya-interest rows`);
    }

    log(`seeded ${SEED_KARYA.length} karya`);
  },
};
