import { hashPassword } from "better-auth/crypto";
import { inArray } from "drizzle-orm";
import { dedupeBySlug, slugifyInterest } from "../../interests";
import {
  accounts,
  interests,
  profiles,
  userInterests,
  users,
} from "../../schema";
import { insertInChunks } from "../chunk";
import type { Seeder } from "../types";

export const SEED_USERS = [
  { id: "seed_m1", name: "Hafiz Maulana", email: "hafiz@seed.local" },
  { id: "seed_m2", name: "Fatimah Zahra", email: "fatimah@seed.local" },
  { id: "seed_m3", name: "Rizal Anwar", email: "rizal@seed.local" },
  { id: "seed_m4", name: "Dinda Pratiwi", email: "dinda@seed.local" },
  { id: "seed_m5", name: "Arya Kusuma", email: "arya@seed.local" },
];

/**
 * Password for every seeded account. Deliberately not a secret: seed data is
 * for local dev and per-PR preview environments, where reviewers need a known
 * way in. `runner.ts` refuses to run under NODE_ENV=production without
 * `--force`, so these known-password accounts can't reach prod by accident.
 */
export const SEED_PASSWORD = "seedpassword123";

/**
 * Better Auth credential rows for the seed users — without these, a seeded
 * user has no password to verify against and `emailAndPassword` sign-in fails.
 *
 * Shape mirrors what Better Auth's own sign-up writes: `providerId:
 * "credential"` (what sign-in looks up by) and `accountId` set to the user id.
 * Hashing goes through `better-auth/crypto`'s `hashPassword` because that is
 * the default `verify` counterpart Better Auth uses at sign-in — a hand-rolled
 * scheme would store a hash that silently never verifies.
 *
 * Ids are deterministic (not `randomUUID`) so re-running the seeder conflicts
 * on the primary key and no-ops, rather than piling up duplicate credentials.
 */
export async function buildSeedCredentialAccounts() {
  // One hash reused across all five: the password is identical and public, so
  // per-row salts would buy nothing but seed time.
  const password = await hashPassword(SEED_PASSWORD);
  return SEED_USERS.map((u) => ({
    id: `seed_acct_${u.id}`,
    accountId: u.id,
    providerId: "credential",
    userId: u.id,
    password,
    // `accounts.updated_at` is NOT NULL with no DB default (unlike
    // `users.updated_at`), and `$onUpdate` only fires on UPDATE — so an insert
    // has to supply it explicitly.
    updatedAt: new Date(),
  }));
}

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
  // Owns the seed users and everything hanging off them. The runner only empties
  // tables a seeder *declares*, so every table this seeder inserts into must be
  // listed: omit one and a re-seed leaves the first run's rows in place, where
  // the `onConflictDoNothing` calls below silently preserve them.
  //
  // `accounts` is listed rather than left to `users`' ON DELETE cascade, because
  // it holds the credential hash — the one row whose staleness would break
  // preview login, and the one we least want depending on whether a given SQLite
  // has foreign keys enforced.
  //
  // NOT `interests` — that catalog is owned/truncated by the interests seeder;
  // here we find-or-create into it.
  tables: [users, accounts, profiles, userInterests],
  async run({ db, log }) {
    log("inserting seed users…");
    const userRows = SEED_USERS.map((u) => ({ ...u, emailVerified: true }));
    await insertInChunks(users, userRows, (chunk) =>
      db.insert(users).values(chunk).onConflictDoNothing(),
    );

    log("inserting seed credential accounts…");
    const accountRows = await buildSeedCredentialAccounts();
    await insertInChunks(accounts, accountRows, (chunk) =>
      db.insert(accounts).values(chunk).onConflictDoNothing(),
    );

    log("inserting seed profiles…");
    const profileRows = SEED_PROFILES.map(
      ({ interests: _interests, ...profile }) => profile,
    );
    await insertInChunks(profiles, profileRows, (chunk) =>
      db.insert(profiles).values(chunk).onConflictDoNothing(),
    );

    log("linking member interests…");
    // Find-or-create every referenced interest by slug. Curated rows already
    // exist (slug conflict → skipped); the rest become free-text rows.
    const deduped = dedupeBySlug(SEED_PROFILES.flatMap((p) => p.interests));
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
      await insertInChunks(userInterests, links, (chunk) =>
        db.insert(userInterests).values(chunk).onConflictDoNothing(),
      );
      log(`linked ${links.length} member-interest rows`);
    }

    log(`seeded ${SEED_USERS.length} members`);
  },
};
