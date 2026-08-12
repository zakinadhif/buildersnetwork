/**
 * Al-Fath Berkarya — Karya updates (the unit of the Scroll feed).
 *
 * An update is *karya-owned*: its canonical home is the karya's own page, where
 * these read as a progress log. Scroll owns nothing — it is an aggregated view
 * that surfaces updates across every karya, newest first, tuned by the interests
 * you follow.
 *
 * The platform holds one posting principle: **productive posting only.** An
 * update is a unit of progress — shipped, hit a milestone, posted research,
 * opened a collaborator slot — never chatter. That is why an update carries a
 * `kind`: you post a *kind of progress*, not a thought, and the feed has no
 * composer. The principle governs what may become a *post*, not whether people
 * may talk: conversation attaches to the update it is about (see `Discussion`),
 * and day-to-day coordination stays in each karya's WhatsApp group, out of band.
 *
 * `kind` is no longer badged on the post — the feed reads calmer without five
 * labels competing with the headline — but it still classifies: it is what makes
 * an "ajakan" surface as an open slot in Scroll's rail, carrying `role` with it.
 *
 * The post is authored by the *karya*, not the person: it leads with the karya
 * logo; the contributor who posted it is a small avatar dipping into the corner.
 */

import { KARYA, MEMBERS, type Karya, type Member, type Roster } from "./karya";

/** The kinds of progress a karya can post. Ordered loosely by weight. */
export type UpdateKind =
  | "rilis"    // shipped something people can use now
  | "tonggak"  // crossed a milestone / changed stage
  | "progres"  // incremental progress worth sharing
  | "riset"    // research note, finding, writeup
  | "ajakan";  // opened a collaborator slot

/**
 * The newest message in a thread — the one the post previews.
 *
 * It carries no author of its own on purpose: the latest message is by the
 * latest speaker, so its author *is* `Discussion.voices[0]` by construction.
 * Storing the handle twice would only invite the two to drift apart.
 */
export interface LatestMessage {
  body: string;
  minutesAgo: number; // doubles as the thread's recency — nothing is newer
}

/**
 * The discussion thread under an update.
 *
 * Conversation attaches to the *event* — the update — not to the karya page:
 * a thread lands where the news is (plans/reference/content-model.md, FR-21).
 * The mock keeps only what the surfaces show — a total, the burst size, who is
 * speaking, and the newest message — never the whole thread; that belongs to the
 * update's own page.
 */
export interface Discussion {
  total: number;         // messages all the way down — what the post's counter shows
  recent: number;        // messages inside the last ACTIVE_WINDOW_MIN minutes
  voices: string[];      // handles speaking inside the window, latest first
  latest: LatestMessage; // the newest of them, by voices[0]
}

/** How wide the activity window is, and how many messages must land inside it. */
export const ACTIVE_WINDOW_MIN = 30;
export const ACTIVE_MESSAGE_THRESHOLD = 5;

/**
 * "Active" is a burst happening *now*: more than ACTIVE_MESSAGE_THRESHOLD
 * messages inside the last ACTIVE_WINDOW_MIN minutes. Two consequences worth
 * knowing, because they are the point rather than side effects: a huge thread
 * that has gone quiet is *not* active, and a day-old post that just caught fire
 * *is*. Activity is measured, never accumulated.
 */
export function isDiscussionActive(d: Discussion | undefined): d is Discussion {
  return d !== undefined
    && d.recent > ACTIVE_MESSAGE_THRESHOLD
    && d.latest.minutesAgo <= ACTIVE_WINDOW_MIN;
}

export interface Update {
  id: number;
  karyaId: number;      // the karya this update belongs to (its canonical home)
  authorHandle: string; // who on the roster posted it — resolved against the roster
  kind: UpdateKind;
  title: string;        // the headline — what happened, in one line
  body: string;         // the substantive update (productive posting only)
  hoursAgo: number;     // recency; drives Scroll's reverse-chronological order
  shots?: string[];     // optional landscape screenshots (reuse the karya's)
  role?: string;        // kind "ajakan" only: the role being opened
  discussion?: Discussion; // the thread under it, where one has formed
}

/** Raw updates. A karya recurs as it posts more than once — that recurrence is
 *  the whole point of an update feed (vs. a directory that lists each karya once). */
export const UPDATES: Update[] = [
  { id: 1, karyaId: 2, authorHandle: "@dianp",       kind: "progres", hoursAgo: 2,
    title: "Toko online pertama sudah jalan",
    body: "Tiga UMKM depan kampus sekarang terima order lewat WhatsApp, langsung dari katalog. Yang paling makan waktu ternyata foto produk, bukan setup tokonya.",
    // Fresh, but only a trickle — under the threshold, so the rail leaves it out.
    discussion: { total: 9, recent: 3, voices: ["@rizalh"],
      latest: { body: "Ini nolong banget buat warung yang belum punya katalog. Alurnya boleh dicontek?", minutesAgo: 4 } } },
  { id: 2, karyaId: 1, authorHandle: "@arief_dev",   kind: "rilis",   hoursAgo: 5,
    title: "Beta terbuka untuk semua",
    body: "40 lowongan magang dari alumni sudah tayang. Coba dan kirim masukan ya — terutama soal filter dan alur lamarannya.", shots: ["shot"],
    discussion: { total: 34, recent: 12, voices: ["@dianp", "@nadiaku", "@eko_s"],
      latest: { body: "Baru coba — filter lokasinya ngebantu. Ada rencana tambah filter remote?", minutesAgo: 2 } } },
  { id: 3, karyaId: 3, authorHandle: "@rizalh",      kind: "riset",   hoursAgo: 9,
    title: "Tokenizer Sunda–Jawa tembus 92%",
    body: "Naik dari 87% bulan lalu. Notebook dan catatan lengkapnya sudah di repo, termasuk split datanya.",
    discussion: { total: 19, recent: 8, voices: ["@eko_s", "@rizalh"],
      latest: { body: "92% itu lewat baseline yang mana? Penasaran sama split datanya.", minutesAgo: 6 } } },
  { id: 4, karyaId: 1, authorHandle: "@arief_dev",   kind: "tonggak", hoursAgo: 14,
    title: "Naik kelas dari MVP ke Beta",
    body: "Terima kasih 30+ builder yang ikut uji coba versi tertutup — masukan kalian yang bikin naik kelas." },
  { id: 5, karyaId: 4, authorHandle: "@nadiaku",     kind: "progres", hoursAgo: 20,
    title: "12 kartu materi baru",
    body: "Kalkulus & Struktur Data dapat tambahan 12 kartu — total 68 sekarang.", shots: ["shot"],
    // Was busy, has gone quiet — the newest message sits outside the window, so it
    // drops out of the rail. Activity is measured, not accumulated.
    discussion: { total: 22, recent: 9, voices: ["@arief_dev", "@eko_s"],
      latest: { body: "Kartu Struktur Data-nya rapi. Ada rencana ekspor ke Anki?", minutesAgo: 140 } } },
  { id: 6, karyaId: 5, authorHandle: "@farhan_a",    kind: "ajakan",  hoursAgo: 26, role: "Desainer UI",
    title: "Butuh desainer UI untuk halaman detail kost",
    body: "Buka slot buat rombak halaman detail kost. Sistem desain & komponennya sudah ada, tinggal dipakai.",
    // A day old, and only now catching fire — recency of the *post* is irrelevant.
    discussion: { total: 15, recent: 7, voices: ["@nadiaku", "@dianp", "@arief_dev"],
      latest: { body: "Tertarik! Aku pernah rombak halaman detail yang mirip. Boleh lihat sistem desainnya?", minutesAgo: 11 } } },
  { id: 7, karyaId: 6, authorHandle: "@megaw",       kind: "progres", hoursAgo: 38,
    title: "Kalender akademik sinkron otomatis",
    body: "Jadwal ketarik sendiri dari kalender akademik Telkom — nggak ada input manual lagi." },
  { id: 8, karyaId: 3, authorHandle: "@rizalh",      kind: "tonggak", hoursAgo: 44,
    title: "Korpus v0.1 rilis ke Hugging Face",
    body: "12k kalimat berlisensi terbuka, siap dipakai eksperimen NLP lokal." },
  { id: 9, karyaId: 7, authorHandle: "@aldip_music", kind: "ajakan",  hoursAgo: 52, role: "Backend / Audio",
    title: "Cari partner backend untuk streaming audio",
    body: "Proyek arsip musik indie, lisensi terbuka, santai tapi konsisten. Yang penting paham streaming audio." },
];

export interface ResolvedUpdate {
  update: Update;
  karya: Karya;
  author: Roster;
  voices: Member[]; // the discussion's speakers, latest first; empty without a thread
}

/** Join an update to its karya, the roster member who posted it, and the people
 *  talking under it. Drops any update whose karya or author cannot be resolved,
 *  and any voice that cannot be put to a name (keeps the feed honest). */
export function resolveUpdates(updates: Update[] = UPDATES): ResolvedUpdate[] {
  return updates
    .map((update) => {
      const karya = KARYA.find((k) => k.id === update.karyaId);
      const author = karya?.roster.find((r) => r.handle === update.authorHandle);
      if (!karya || !author) return null;
      const voices = (update.discussion?.voices ?? []).flatMap((h) => MEMBERS.filter((m) => m.handle === h));
      return { update, karya, author, voices };
    })
    .filter((x): x is ResolvedUpdate => x !== null)
    .sort((a, b) => a.update.hoursAgo - b.update.hoursAgo); // newest first
}

export interface ActiveDiscussion {
  resolved: ResolvedUpdate; // its `voices` are the speakers, already resolved
  discussion: Discussion;
}

/** The threads burning right now, busiest first — the rail's "Diskusi aktif".
 *  Ordered by volume rather than recency: the rail answers "where is everyone",
 *  and the feed beside it already answers "what is newest". */
export function activeDiscussions(resolved: ResolvedUpdate[] = resolveUpdates()): ActiveDiscussion[] {
  return resolved
    .flatMap((r) => isDiscussionActive(r.update.discussion) ? [{ resolved: r, discussion: r.update.discussion }] : [])
    .sort((a, b) => b.discussion.recent - a.discussion.recent);
}
