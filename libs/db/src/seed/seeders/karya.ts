import { inArray } from "drizzle-orm";
import { dedupeBySlug, slugifyInterest } from "../../interests";
import type { KaryaStage } from "../../karya";
import { interests, karya, karyaInterests, karyaMembers } from "../../schema";
import { insertInChunks, selectInChunks } from "../chunk";
import type { Seeder } from "../types";

// Example karya owned by existing seed members. Each carries a couple stages,
// a few interest tags (find-or-create into the SAME catalog as profiles —
// DECISION-C), an owner row, ≥1 approved contributor (so the roster renders
// faces), and ≥1 pending request (so the approve/decline UI has something to
// act on). Stable IDs keep the seeder idempotent. Some interest names overlap
// the curated list (reused by slug); the rest land as free-text rows.
const SEED_KARYA = [
  {
    id: "seed_k1",
    createdBy: "seed_m1",
    title: "Loom — sinkronisasi file peer-to-peer",
    description:
      "Tool sinkronisasi file offline-first tanpa cloud. Lagi nyusun protokol gossip-nya biar hemat bandwidth di koneksi kampus.",
    stages: ["building"] as KaryaStage[],
    interests: ["Distributed Systems", "Systems Programming", "Open Source"],
    members: ["seed_m3"],
    pending: ["seed_m4"],
  },
  {
    id: "seed_k2",
    createdBy: "seed_m2",
    title: "Rasa — rekomendasi kuliner lokal",
    description:
      "Rekomendasi kuliner berbasis ML yang privacy-first dan ngerti konteks Indonesia. Lagi validasi sama warung-warung sekitar.",
    stages: ["validating", "building"] as KaryaStage[],
    interests: ["Machine Learning", "Data Science", "Social Impact"],
    members: ["seed_m5"],
    pending: ["seed_m3"],
  },
  {
    id: "seed_k3",
    createdBy: "seed_m4",
    title: "Saku — keuangan pribadi buat mahasiswa",
    description:
      "App keuangan yang fokus ke kejelasan pengeluaran, bukan optimasi. Masih tahap ide, nyari yang mau bareng dari awal.",
    stages: ["idea"] as KaryaStage[],
    interests: ["Fintech", "Product Design", "UI/UX Design"],
    members: ["seed_m1"],
    pending: ["seed_m5"],
  },
];

export const karyaSeeder: Seeder = {
  name: "karya",
  description: "Seed example karya with rosters and pending requests",
  // Owns karya + the roster/interest joins. NOT `interests` — that catalog is
  // owned by the interests seeder; here we find-or-create into it by slug.
  tables: [karya, karyaMembers, karyaInterests],
  async run({ db, log }) {
    log("inserting seed karya…");
    const karyaRows = SEED_KARYA.map((k) => ({
      id: k.id,
      title: k.title,
      description: k.description,
      stages: k.stages,
      createdBy: k.createdBy,
    }));
    await insertInChunks(karya, karyaRows, (chunk) =>
      db.insert(karya).values(chunk).onConflictDoNothing(),
    );

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
