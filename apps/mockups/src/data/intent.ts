import type { LookingFor } from "./looking-for";

/** Cari variant B — the intent board: people and karya grouped by what they seek. */

export interface PersonSeeker {
  id: number;
  name: string;
  handle: string;
  year: number;
  major: string;
  bio: string;
  skills: string[];
  badge: LookingFor;
  currentKarya: string | null;
  note: string;
}

export interface KaryaSeeker {
  id: number;
  title: string;
  description: string;
  interests: string[];
  badge: LookingFor;
  openRoles: string[];
  roster: { name: string; handle: string }[];
  stage: string;
}

/** FR-29 event context. */
export const HACKATHON_EVENT = {
  name: "GEMASTIK 2026",
  theme: "Karya Inovasi Digital",
  deadline: "15 Agustus 2026",
  teamsForming: 4,
};

export const PEOPLE_SEEKERS: PersonSeeker[] = [
  // ── Hackathon ──
  {
    id: 1,
    name: "Nadia Kusuma",
    handle: "@nadiaku",
    year: 2,
    major: "S1 Desain Komunikasi Visual",
    bio: "Desainer produk, bisa koding CSS dan Tailwind.",
    skills: ["Figma", "Tailwind", "Vue"],
    badge: "hackathon",
    currentKarya: "BukuSaku Kampus",
    note: "Nyari tim GEMASTIK 2026 — idealnya ada yang handle backend Go atau Python.",
  },
  {
    id: 2,
    name: "Rizal Hakim",
    handle: "@rizalh",
    year: 4,
    major: "S1 Teknik Informatika",
    bio: "ML enthusiast, fokus riset NLP bahasa daerah.",
    skills: ["Python", "PyTorch", "HuggingFace"],
    badge: "hackathon",
    currentKarya: "Aksara AI",
    note: "Model sudah jalan — butuh partner frontend untuk pitching di GEMASTIK.",
  },
  {
    id: 3,
    name: "Budi Santoso",
    handle: "@budisnt",
    year: 2,
    major: "S1 Teknik Informatika",
    bio: "Pertama kali ikut hackathon — antusias dan mau belajar keras.",
    skills: ["React", "Tailwind", "Node.js"],
    badge: "hackathon",
    currentKarya: null,
    note: "Belum punya ide sendiri — open untuk bergabung tim yang butuh frontend.",
  },
  // ── Project ──
  {
    id: 4,
    name: "Arief Maulana",
    handle: "@arief_dev",
    year: 3,
    major: "S1 Teknik Informatika",
    bio: "Full-stack, suka bangun produk yang beneran dipakai orang.",
    skills: ["React", "Hono", "PostgreSQL"],
    badge: "project",
    currentKarya: "KampusKerja",
    note: "KampusKerja ngegas ke public beta — butuh 1 backend Go yang mau commit jangka panjang.",
  },
  {
    id: 5,
    name: "Dian Pertiwi",
    handle: "@dianp",
    year: 3,
    major: "S1 Sistem Informasi",
    bio: "Senang riset pengguna dan problem-solve bareng komunitas.",
    skills: ["UX Research", "Figma", "Notion"],
    badge: "project",
    currentKarya: "Warung Digital",
    note: "Warung Digital butuh tangan desain — 1 sprint sebulan sudah sangat membantu.",
  },
  {
    id: 6,
    name: "Farhan Ardiansyah",
    handle: "@farhan_a",
    year: 3,
    major: "S1 Teknik Informatika",
    bio: "Solo builder yang sudah siap jadi tim builder.",
    skills: ["React", "Maps API", "Node.js"],
    badge: "project",
    currentKarya: "Peta Kost",
    note: "Peta Kost sudah beta. Nyari 1–2 orang buat dorong ke v1.",
  },
  {
    id: 7,
    name: "Mega Wulandari",
    handle: "@megaw",
    year: 2,
    major: "S1 Sistem Informasi",
    bio: "Tertarik produk kolaborasi dan tooling produktivitas.",
    skills: ["Vue", "Figma", "Airtable"],
    badge: "project",
    currentKarya: "Jadwal Bersama",
    note: "Jadwal Bersama butuh 1 mobile dev buat bawa ke Android.",
  },
  // ── Gig ──
  {
    id: 8,
    name: "Eko Saputra",
    handle: "@eko_s",
    year: 3,
    major: "S1 Teknik Informatika",
    bio: "Backend developer, hobi otomasi hal-hal yang bikin frustrasi.",
    skills: ["Go", "Docker", "PostgreSQL"],
    badge: "gig",
    currentKarya: "Warung Digital",
    note: "Bisa bantu backend/DevOps 10–15 jam/minggu. DM dulu untuk brief.",
  },
  {
    id: 9,
    name: "Siti Rahmah",
    handle: "@siti_ux",
    year: 2,
    major: "S1 Desain Komunikasi Visual",
    bio: "UX designer, portofolio di Figma. Terima gig UI/UX per milestone.",
    skills: ["Figma", "Maze", "Illustrator"],
    badge: "gig",
    currentKarya: "KampusKerja",
    note: "Buka 2 slot gig bulan ini — UI audit atau desain komponen baru.",
  },
  {
    id: 10,
    name: "Aldi Pratama",
    handle: "@aldip_music",
    year: 3,
    major: "S1 Teknik Informatika",
    bio: "Dev yang juga produser musik — ngerti keduanya.",
    skills: ["Node.js", "Ableton", "FFmpeg"],
    badge: "gig",
    currentKarya: "Sound Nusantara",
    note: "Bisa bantu integrasi audio pipeline atau kurasi konten musik digital.",
  },
];

export const KARYA_SEEKERS: KaryaSeeker[] = [
  // ── Hackathon ──
  {
    id: 101,
    title: "Aksara AI",
    description: "Model NLP bahasa lokal (Sunda & Jawa) — dibawa ke GEMASTIK 2026.",
    interests: ["AI/ML", "Bahasa", "Open Source"],
    badge: "hackathon",
    openRoles: ["1 Frontend React", "1 Data Engineer"],
    roster: [{ name: "Rizal Hakim", handle: "@rizalh" }],
    stage: "Riset",
  },
  // ── Project ──
  {
    id: 102,
    title: "KampusKerja",
    description: "Platform magang mahasiswa Telkom, terkoneksi langsung alumni.",
    interests: ["Karir", "Networking", "Web"],
    badge: "project",
    openRoles: ["1 Backend Go", "1 UI Designer"],
    roster: [
      { name: "Arief Maulana", handle: "@arief_dev" },
      { name: "Siti Rahmah", handle: "@siti_ux" },
    ],
    stage: "Beta",
  },
  {
    id: 103,
    title: "Warung Digital",
    description: "Toko online sederhana untuk UMKM sekitar kampus — cukup WhatsApp.",
    interests: ["UMKM", "Mobile", "Sosial"],
    badge: "project",
    openRoles: ["1 Frontend React"],
    roster: [
      { name: "Dian Pertiwi", handle: "@dianp" },
      { name: "Eko Saputra", handle: "@eko_s" },
    ],
    stage: "Prototype",
  },
  {
    id: 104,
    title: "Peta Kost",
    description: "Aggregator kost area Telkom University dengan ulasan jujur.",
    interests: ["Web", "Maps", "Komunitas"],
    badge: "project",
    openRoles: ["1 Backend Go", "1 UI Designer"],
    roster: [{ name: "Farhan Ardiansyah", handle: "@farhan_a" }],
    stage: "Beta",
  },
  // ── Gig ──
  {
    id: 105,
    title: "Sound Nusantara",
    description: "Arsip dan label indie musik mahasiswa — upload gratis, lisensi terbuka.",
    interests: ["Musik", "Komunitas", "Open Source"],
    badge: "gig",
    openRoles: ["1 Backend Node.js", "1 Audio Engineer (freelance)"],
    roster: [{ name: "Aldi Pratama", handle: "@aldip_music" }],
    stage: "Ide",
  },
  {
    id: 106,
    title: "BukuSaku Kampus",
    description: "Ringkasan materi kuliah dalam format kartu — dikurasi mahasiswa.",
    interests: ["Edukasi", "Mobile", "Konten"],
    badge: "gig",
    openRoles: ["1 Mobile Dev React Native"],
    roster: [
      { name: "Nadia Kusuma", handle: "@nadiaku" },
      { name: "Budi Santoso", handle: "@budisnt" },
    ],
    stage: "MVP",
  },
];
