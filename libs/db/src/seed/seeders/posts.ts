import { posts } from "../../schema";
import { insertInChunks } from "../chunk";
import type { Seeder } from "../types";

// Example karya updates so the feed + karya streams are non-empty on a fresh
// seed (Phase-0 content density). Each post is authored by an owner or approved
// member of its karya (DECISION-C) — see karya.ts SEED_KARYA rosters:
//   seed_k1 (owner seed_m1, member seed_m3)
//   seed_k2 (owner seed_m2, member seed_m5)
//   seed_k3 (owner seed_m4, member seed_m1)
// `createdAt` is staggered so the global feed interleaves believably. Stable
// IDs keep the seeder idempotent + `--reset`-safe.
const DAY = 24 * 60 * 60 * 1000;
const BASE = new Date("2026-06-01T09:00:00Z").getTime();

const SEED_POSTS: {
  id: string;
  karyaId: string;
  authorId: string;
  body: string;
  dayOffset: number;
}[] = [
  {
    id: "seed_p1",
    karyaId: "seed_k1",
    authorId: "seed_m1",
    body: "Protokol gossip-nya udah jalan di LAN — dua node sinkron tanpa server tengah. Selanjutnya hemat bandwidth pas koneksi kampus jelek.",
    dayOffset: 0,
  },
  {
    id: "seed_p2",
    karyaId: "seed_k2",
    authorId: "seed_m2",
    body: "Bingung nyari data kuliner lokal yang bersih buat training. Warung kebanyakan ga punya menu digital. Ada yang pernah ngumpulin dataset kayak gini?",
    dayOffset: 2,
  },
  {
    id: "seed_p3",
    karyaId: "seed_k1",
    authorId: "seed_m3",
    body: "Konflik file pas dua orang ngedit offline bareng masih bikin pusing. Lagi baca-baca soal CRDT, kayaknya ke sana arahnya.",
    dayOffset: 4,
  },
  {
    id: "seed_p4",
    karyaId: "seed_k3",
    authorId: "seed_m4",
    body: "Mockup awal pencatatan pengeluaran kelar. Fokusnya kejelasan, bukan grafik ribet. Lagi nyari yang mau bareng dari awal.",
    dayOffset: 5,
  },
  {
    id: "seed_p5",
    karyaId: "seed_k2",
    authorId: "seed_m5",
    body: "Rekomendasi pertama tembus! Model nyaranin warung sate deket kampus dan ternyata emang enak. Validasi kecil tapi nyemangatin.",
    dayOffset: 7,
  },
  {
    id: "seed_p6",
    karyaId: "seed_k1",
    authorId: "seed_m1",
    body: "Sinkron tiga node sekaligus stabil semalaman tanpa drop. Pertama kali kerasa kayak tool beneran, bukan eksperimen.",
    dayOffset: 9,
  },
];

export const postSeeder: Seeder = {
  name: "posts",
  description: "Seed example karya updates across the seed karya streams",
  tables: [posts],
  async run({ db, log }) {
    log("inserting seed posts…");
    const rows = SEED_POSTS.map((p) => ({
      id: p.id,
      karyaId: p.karyaId,
      authorId: p.authorId,
      body: p.body,
      createdAt: new Date(BASE + p.dayOffset * DAY),
    }));
    await insertInChunks(posts, rows, (chunk) =>
      db.insert(posts).values(chunk).onConflictDoNothing(),
    );

    log(`seeded ${SEED_POSTS.length} posts`);
  },
};
