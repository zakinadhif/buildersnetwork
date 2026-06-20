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
    handle: "hafiz",
    bio: "Bikin tool sinkronisasi file peer-to-peer — ringan, offline-first, ga butuh cloud sama sekali. Kerja solo dulu, baru share.",
    interests: ["Distributed Systems", "WebAssembly", "Protocol Design"],
    year: "Tingkat 2",
    major: "Informatika",
    skills: ["Go", "Rust", "Systems Programming", "Networking"] as string[],
  },
  {
    userId: "seed_m2",
    name: "Fatimah Zahra",
    handle: "fatimah",
    bio: "Lagi bangun rekomendasi kuliner lokal berbasis ML — privacy-first, konteks Indonesia. Suka pair di masalah yang susah.",
    interests: ["Deep Learning", "MLOps", "Inference Pipelines"],
    year: "Tingkat 3",
    major: "Informatika",
    skills: [
      "Python",
      "Machine Learning",
      "FastAPI",
      "scikit-learn",
    ] as string[],
  },
  {
    userId: "seed_m3",
    name: "Rizal Anwar",
    handle: "rizal",
    bio: "Bikin library autentikasi open source buat Next.js — pengen bikin auth jadi hal yang membosankan. Ship cepet, dokumentasi rapi.",
    interests: ["Systems Programming", "Rust", "Building in Public"],
    year: "Tingkat 4",
    major: "Rekayasa Perangkat Lunak",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"] as string[],
  },
  {
    userId: "seed_m4",
    name: "Dinda Pratiwi",
    handle: "dinda",
    bio: "Lagi bikin app keuangan pribadi buat mahasiswa — fokus ke kejelasan pengeluaran, bukan optimasi. Pemikir visual dengan opini UX kuat.",
    interests: ["Backend Development", "API Design", "Full-stack"],
    year: "Tingkat 2",
    major: "Informatika",
    skills: ["React", "Figma", "CSS", "TypeScript"] as string[],
  },
  {
    userId: "seed_m5",
    name: "Arya Kusuma",
    handle: "arya",
    bio: "Bikin app jadwal sholat dengan fitur komunitas spesifik masjid. Lebih suka tim kecil yang solid, ship dan iterasi cepet.",
    interests: ["Backend Architecture", "Cloud Infrastructure", "DevOps"],
    year: "Tingkat 3",
    major: "Informatika",
    skills: ["Flutter", "Firebase", "Dart", "Mobile"] as string[],
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
