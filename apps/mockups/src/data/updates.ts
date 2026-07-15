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
 * opened a collaborator slot — never chatter. Low-bandwidth exchange (chat,
 * questions, banter) lives in each karya's WhatsApp group, out of band. That is
 * why an update carries a `kind`: you post a *kind of progress*, not a thought,
 * and the feed has no reply box.
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

export interface Update {
  id: number;
  karyaId: number;      // the karya this update belongs to (its canonical home)
  authorHandle: string; // who on the roster posted it — resolved against the roster
  kind: UpdateKind;
  body: string;         // the substantive update (productive posting only)
  hoursAgo: number;     // recency; drives Scroll's reverse-chronological order
  shots?: string[];     // optional landscape screenshots (reuse the karya's)
  role?: string;        // kind "ajakan" only: the role being opened
}

/** Raw updates. A karya recurs as it posts more than once — that recurrence is
 *  the whole point of an update feed (vs. a directory that lists each karya once). */
export const UPDATES: Update[] = [
  { id: 1, karyaId: 2, authorHandle: "@dianp",       kind: "progres", hoursAgo: 2,
    body: "Toko online pertama live — 3 UMKM depan kampus sekarang terima order lewat WhatsApp langsung dari katalog." },
  { id: 2, karyaId: 1, authorHandle: "@arief_dev",   kind: "rilis",   hoursAgo: 5,
    body: "Beta terbuka! 40 lowongan magang dari alumni sudah tayang. Coba dan kirim masukan ya.", shots: ["shot"] },
  { id: 3, karyaId: 3, authorHandle: "@rizalh",      kind: "riset",   hoursAgo: 9,
    body: "Catatan riset minggu ini: tokenizer Sunda–Jawa naik ke 92% akurasi segmentasi. Notebook + detailnya sudah di repo." },
  { id: 4, karyaId: 1, authorHandle: "@arief_dev",   kind: "tonggak", hoursAgo: 14,
    body: "Naik dari MVP ke Beta. Terima kasih 30+ builder yang ikut uji coba versi tertutup." },
  { id: 5, karyaId: 4, authorHandle: "@nadiaku",     kind: "progres", hoursAgo: 20,
    body: "Nambah 12 kartu materi baru untuk Kalkulus & Struktur Data — total 68 kartu sekarang.", shots: ["shot"] },
  { id: 6, karyaId: 5, authorHandle: "@farhan_a",    kind: "ajakan",  hoursAgo: 26, role: "Desainer UI",
    body: "Buka slot: butuh desainer UI untuk rombak halaman detail kost. Sistem desain & komponennya sudah ada." },
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
