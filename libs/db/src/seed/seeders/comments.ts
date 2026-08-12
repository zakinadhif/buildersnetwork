import { comments } from "../../schema";
import { insertInChunks } from "../chunk";
import type { Seeder } from "../types";

const BASE = new Date("2026-06-01T09:00:00Z").getTime();
const DAY = 24 * 60 * 60 * 1000;

// Keep the seed useful for reviewing both the populated thread and the
// community/member asymmetry: seed_m2 and seed_m5 are not members of seed_k1.
const SEED_COMMENTS = [
  {
    id: "seed_c1",
    postId: "seed_p1",
    authorId: "seed_m2",
    body: "Menarik—kalau koneksi kampus putus, node yang tertinggal langsung ngejar saat online lagi?",
    dayOffset: 0,
    minutesAfterPost: 18,
  },
  {
    id: "seed_c2",
    postId: "seed_p1",
    authorId: "seed_m3",
    body: "Iya, queue lokalnya sudah jalan. Tinggal ngetes conflict resolution kalau dua node berubah bersamaan.",
    dayOffset: 0,
    minutesAfterPost: 42,
  },
  {
    id: "seed_c3",
    postId: "seed_p2",
    authorId: "seed_m1",
    body: "Bisa mulai dari dataset menu yang sudah punya harga dan lokasi, lalu tambah foto belakangan.",
    dayOffset: 2,
    minutesAfterPost: 27,
  },
] as const;

export const commentSeeder: Seeder = {
  name: "comments",
  description: "Seed example first-layer post comments",
  tables: [comments],
  async run({ db, log }) {
    log("inserting seed comments…");
    const rows = SEED_COMMENTS.map((comment) => ({
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      body: comment.body,
      createdAt: new Date(
        BASE + comment.dayOffset * DAY + comment.minutesAfterPost * 60 * 1000,
      ),
    }));
    await insertInChunks(comments, rows, (chunk) =>
      db.insert(comments).values(chunk).onConflictDoNothing(),
    );
    log(`seeded ${SEED_COMMENTS.length} comments`);
  },
};
