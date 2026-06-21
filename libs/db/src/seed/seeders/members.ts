import { inArray } from "drizzle-orm";
import { dedupeBySlug, slugifyInterest } from "../../interests";
import { interests, profiles, userInterests, users } from "../../schema";
import type { Seeder } from "../types";

const SEED_USERS = [
  { id: "seed_m1", name: "Hafiz Maulana", email: "hafiz@seed.local" },
  { id: "seed_m2", name: "Fatimah Zahra", email: "fatimah@seed.local" },
  { id: "seed_m3", name: "Rizal Anwar", email: "rizal@seed.local" },
  { id: "seed_m4", name: "Dinda Pratiwi", email: "dinda@seed.local" },
  { id: "seed_m5", name: "Arya Kusuma", email: "arya@seed.local" },
];

// Interests are kept here for linking but stored normalized (see `run`), not as
// a column on `profiles`. Some names overlap the curated starter list (reused
// by slug); the rest land as free-text `curated: false` rows.
const SEED_PROFILES = [
  {
    userId: "seed_m1",
    name: "Hafiz Maulana",
    handle: "hafiz",
    bio: "Bikin tool sinkronisasi file peer-to-peer — ringan, offline-first, ga butuh cloud sama sekali. Kerja solo dulu, baru share.",
    year: "Tingkat 2",
    major: "Informatika",
    skills: ["Go", "Rust", "Systems Programming", "Networking"] as string[],
    interests: ["Distributed Systems", "Systems Programming", "Open Source"],
  },
  {
    userId: "seed_m2",
    name: "Fatimah Zahra",
    handle: "fatimah",
    bio: "Lagi bangun rekomendasi kuliner lokal berbasis ML — privacy-first, konteks Indonesia. Suka pair di masalah yang susah.",
    year: "Tingkat 3",
    major: "Informatika",
    skills: [
      "Python",
      "Machine Learning",
      "FastAPI",
      "scikit-learn",
    ] as string[],
    interests: ["Machine Learning", "Data Science", "Research"],
  },
  {
    userId: "seed_m3",
    name: "Rizal Anwar",
    handle: "rizal",
    bio: "Bikin library autentikasi open source buat Next.js — pengen bikin auth jadi hal yang membosankan. Ship cepet, dokumentasi rapi.",
    year: "Tingkat 4",
    major: "Rekayasa Perangkat Lunak",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"] as string[],
    interests: ["Backend Development", "Open Source", "Building in Public"],
  },
  {
    userId: "seed_m4",
    name: "Dinda Pratiwi",
    handle: "dinda",
    bio: "Lagi bikin app keuangan pribadi buat mahasiswa — fokus ke kejelasan pengeluaran, bukan optimasi. Pemikir visual dengan opini UX kuat.",
    year: "Tingkat 2",
    major: "Informatika",
    skills: ["React", "Figma", "CSS", "TypeScript"] as string[],
    interests: ["UI/UX Design", "Fintech", "Product Design"],
  },
  {
    userId: "seed_m5",
    name: "Arya Kusuma",
    handle: "arya",
    bio: "Bikin app jadwal sholat dengan fitur komunitas spesifik masjid. Lebih suka tim kecil yang solid, ship dan iterasi cepet.",
    year: "Tingkat 3",
    major: "Informatika",
    skills: ["Flutter", "Firebase", "Dart", "Mobile"] as string[],
    interests: ["Mobile Development", "DevOps & Cloud", "Community Building"],
  },
];

export const memberSeeder: Seeder = {
  name: "members",
  description: "Seed 5 initial community members",
  // Owns profiles + the user_interests links. NOT `interests` — that catalog is
  // owned/truncated by the interests seeder; here we find-or-create into it.
  tables: [profiles, userInterests],
  async run({ db, log }) {
    log("inserting seed users…");
    await db
      .insert(users)
      .values(SEED_USERS.map((u) => ({ ...u, emailVerified: true })))
      .onConflictDoNothing();

    log("inserting seed profiles…");
    await db
      .insert(profiles)
      .values(
        SEED_PROFILES.map(({ interests: _interests, ...profile }) => profile),
      )
      .onConflictDoNothing();

    log("linking member interests…");
    // Find-or-create every referenced interest by slug. Curated rows already
    // exist (slug conflict → skipped); the rest become free-text rows.
    const deduped = dedupeBySlug(SEED_PROFILES.flatMap((p) => p.interests));
    if (deduped.length > 0) {
      await db
        .insert(interests)
        .values(
          deduped.map((d) => ({
            id: crypto.randomUUID(),
            name: d.name,
            slug: d.slug,
            curated: false,
          })),
        )
        .onConflictDoNothing({ target: interests.slug });

      const rows = await db
        .select({ id: interests.id, slug: interests.slug })
        .from(interests)
        .where(
          inArray(
            interests.slug,
            deduped.map((d) => d.slug),
          ),
        );
      const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));

      const links = SEED_PROFILES.flatMap((p) => {
        const seen = new Set<string>();
        return p.interests.flatMap((name) => {
          const id = idBySlug.get(slugifyInterest(name));
          if (!id || seen.has(id)) return [];
          seen.add(id);
          return [{ userId: p.userId, interestId: id }];
        });
      });
      if (links.length > 0) {
        await db.insert(userInterests).values(links).onConflictDoNothing();
      }
      log(`linked ${links.length} member-interest rows`);
    }

    log(`seeded ${SEED_USERS.length} members`);
  },
};
