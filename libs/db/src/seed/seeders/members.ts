import { profiles, users } from "../../schema";
import type { Seeder } from "../types";

const SEED_USERS = [
  { id: "seed_m1", name: "Hafiz Maulana", email: "hafiz@seed.local" },
  { id: "seed_m2", name: "Fatimah Zahra", email: "fatimah@seed.local" },
  { id: "seed_m3", name: "Rizal Anwar", email: "rizal@seed.local" },
  { id: "seed_m4", name: "Dinda Pratiwi", email: "dinda@seed.local" },
  { id: "seed_m5", name: "Arya Kusuma", email: "arya@seed.local" },
];

const SEED_PROFILES = [
  {
    userId: "seed_m1",
    name: "Hafiz Maulana",
    year: "Tingkat 2",
    major: "Informatika",
    skills: ["Go", "Rust", "Systems Programming", "Networking"] as string[],
    building:
      "Tool sinkronisasi file peer-to-peer — ringan, offline-first, ga butuh cloud sama sekali.",
    wants: "Distributed systems, WebAssembly, desain protokol.",
    vibe: "Kerja solo dulu, baru share. Full async. Mau pair kalau masalahnya beneran susah.",
  },
  {
    userId: "seed_m2",
    name: "Fatimah Zahra",
    year: "Tingkat 3",
    major: "Informatika",
    skills: ["Python", "Machine Learning", "FastAPI", "scikit-learn"] as string[],
    building:
      "Rekomendasi kuliner lokal berbasis ML — privacy-first, konteks Indonesia.",
    wants: "Deep learning, MLOps, inference pipeline yang scalable.",
    vibe: "Suka pair di masalah yang susah. Butuh kolaborator yang bisa adu argumen teknis.",
  },
  {
    userId: "seed_m3",
    name: "Rizal Anwar",
    year: "Tingkat 4",
    major: "Rekayasa Perangkat Lunak",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"] as string[],
    building:
      "Library autentikasi open source buat Next.js — pengen bikin auth jadi hal yang membosankan.",
    wants: "Systems programming, Rust, building in public.",
    vibe: "Ship cepet, dokumentasi rapi. Full async dan transparan.",
  },
  {
    userId: "seed_m4",
    name: "Dinda Pratiwi",
    year: "Tingkat 2",
    major: "Informatika",
    skills: ["React", "Figma", "CSS", "TypeScript"] as string[],
    building:
      "App keuangan pribadi buat mahasiswa — fokus ke kejelasan pengeluaran, bukan optimasi.",
    wants: "Backend development, API, eventually full-stack.",
    vibe: "Pemikir visual dengan opini UX yang kuat. Suka build bareng orang yang peduli sama craft.",
  },
  {
    userId: "seed_m5",
    name: "Arya Kusuma",
    year: "Tingkat 3",
    major: "Informatika",
    skills: ["Flutter", "Firebase", "Dart", "Mobile"] as string[],
    building: "Jadwal sholat dengan fitur komunitas spesifik masjid.",
    wants: "Arsitektur backend, cloud infrastructure, DevOps.",
    vibe: "Lebih suka tim kecil yang solid. Ship dan iterasi cepet. Ga suka meeting yang ga perlu.",
  },
];

export const memberSeeder: Seeder = {
  name: "members",
  description: "Seed 5 initial community members",
  tables: [profiles],
  async run({ db, log }) {
    log("inserting seed users…");
    await db
      .insert(users)
      .values(SEED_USERS.map((u) => ({ ...u, emailVerified: true })))
      .onConflictDoNothing();

    log("inserting seed profiles…");
    await db.insert(profiles).values(SEED_PROFILES).onConflictDoNothing();

    log(`seeded ${SEED_USERS.length} members`);
  },
};
