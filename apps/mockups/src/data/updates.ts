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
 * `kind`: you post a *kind of progress*, not a thought, and the feed has no reply
 * box. The principle governs what may become a *post*, not whether people may
 * talk: conversation attaches to the update it is about (see `Discussion`), and
 * day-to-day coordination stays in each karya's WhatsApp group, out of band.
 *
 * The post is authored by the *karya*, not the person: it leads with the karya
 * logo; the contributor who posted it is a small avatar dipping into the corner.
 */

import { KARYA, type Karya, type Roster } from "./karya";

/** The kinds of progress a karya can post. Ordered loosely by weight. */
export type UpdateKind =
  | "rilis"    // shipped something people can use now
  | "tonggak"  // crossed a milestone / changed stage
  | "progres"  // incremental progress worth sharing
  | "riset"    // research note, finding, writeup
  | "ajakan";  // opened a collaborator slot

export const KIND_META: Record<UpdateKind, { label: string; glyph: string; accent: boolean }> = {
  rilis:   { label: "Rilis",           glyph: "◆", accent: true  },
  tonggak: { label: "Tonggak",         glyph: "◈", accent: false },
  progres: { label: "Progres",         glyph: "◉", accent: false },
  riset:   { label: "Riset",           glyph: "◇", accent: false },
  ajakan:  { label: "Ajak kolaborasi", glyph: "◎", accent: true  },
};

/**
 * The discussion thread under an update.
 *
 * Conversation attaches to the *event* — the update — not to the karya page:
 * a thread lands where the news is (plans/reference/content-model.md, FR-21).
 * Only the counts the rail needs to spot a burst live here; the messages
 * themselves belong to the update's own page.
 */
export interface Discussion {
  recent: number;         // messages inside the last ACTIVE_WINDOW_MIN minutes
  lastMinutesAgo: number; // when the newest message landed
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
    && d.lastMinutesAgo <= ACTIVE_WINDOW_MIN;
}

export interface Update {
  id: number;
  karyaId: number;      // the karya this update belongs to (its canonical home)
  authorHandle: string; // who on the roster posted it — resolved against the roster
  kind: UpdateKind;
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
    body: "Toko online pertama live — 3 UMKM depan kampus sekarang terima order lewat WhatsApp langsung dari katalog.",
    // Fresh, but only a trickle — under the threshold, so the rail leaves it out.
    discussion: { recent: 3, lastMinutesAgo: 4 } },
  { id: 2, karyaId: 1, authorHandle: "@arief_dev",   kind: "rilis",   hoursAgo: 5,
    body: "Beta terbuka! 40 lowongan magang dari alumni sudah tayang. Coba dan kirim masukan ya.", shots: ["shot"],
    discussion: { recent: 12, lastMinutesAgo: 2 } },
  { id: 3, karyaId: 3, authorHandle: "@rizalh",      kind: "riset",   hoursAgo: 9,
    body: "Catatan riset minggu ini: tokenizer Sunda–Jawa naik ke 92% akurasi segmentasi. Notebook + detailnya sudah di repo.",
    discussion: { recent: 8, lastMinutesAgo: 6 } },
  { id: 4, karyaId: 1, authorHandle: "@arief_dev",   kind: "tonggak", hoursAgo: 14,
    body: "Naik dari MVP ke Beta. Terima kasih 30+ builder yang ikut uji coba versi tertutup." },
  { id: 5, karyaId: 4, authorHandle: "@nadiaku",     kind: "progres", hoursAgo: 20,
    body: "Nambah 12 kartu materi baru untuk Kalkulus & Struktur Data — total 68 kartu sekarang.", shots: ["shot"],
    // Was busy, has gone quiet — outside the window, so it drops out. Activity is
    // measured, not accumulated.
    discussion: { recent: 9, lastMinutesAgo: 140 } },
  { id: 6, karyaId: 5, authorHandle: "@farhan_a",    kind: "ajakan",  hoursAgo: 26, role: "Desainer UI",
    body: "Buka slot: butuh desainer UI untuk rombak halaman detail kost. Sistem desain & komponennya sudah ada.",
    // A day old, and only now catching fire — recency of the *post* is irrelevant.
    discussion: { recent: 7, lastMinutesAgo: 11 } },
  { id: 7, karyaId: 6, authorHandle: "@megaw",       kind: "progres", hoursAgo: 38,
    body: "Sinkron kalender akademik Telkom jalan otomatis — jadwal ketarik sendiri tanpa input manual lagi." },
  { id: 8, karyaId: 3, authorHandle: "@rizalh",      kind: "tonggak", hoursAgo: 44,
    body: "Rilis korpus v0.1 ke Hugging Face — 12k kalimat berlisensi terbuka, siap dipakai eksperimen NLP lokal." },
  { id: 9, karyaId: 7, authorHandle: "@aldip_music", kind: "ajakan",  hoursAgo: 52, role: "Backend / Audio",
    body: "Cari partner backend yang paham streaming audio. Proyek arsip musik indie, lisensi terbuka, santai tapi konsisten." },
];

export interface ResolvedUpdate {
  update: Update;
  karya: Karya;
  author: Roster;
}

/** Join an update to its karya and the roster member who posted it. Drops any
 *  update whose karya or author cannot be resolved (keeps the feed honest). */
export function resolveUpdates(updates: Update[] = UPDATES): ResolvedUpdate[] {
  return updates
    .map((update) => {
      const karya = KARYA.find((k) => k.id === update.karyaId);
      const author = karya?.roster.find((r) => r.handle === update.authorHandle);
      return karya && author ? { update, karya, author } : null;
    })
    .filter((x): x is ResolvedUpdate => x !== null)
    .sort((a, b) => a.update.hoursAgo - b.update.hoursAgo); // newest first
}

export interface ActiveDiscussion {
  resolved: ResolvedUpdate;
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
