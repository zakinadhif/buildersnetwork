import type { LookingFor } from "./looking-for";

/** Cari variant A — people looking for a team or gig, and karya with open slots. */

/** A person actively looking for a team or gig. */
export interface Seeker {
  id: number;
  name: string;
  handle: string;
  tingkat: string;         // e.g. "Tkt 3"
  jurusan: string;         // e.g. "S1 Teknik Informatika"
  bio: string;
  skills: string[];
  badge: LookingFor;
  currentKarya: { title: string; role: string } | null;
  postedHoursAgo: number;
}

/** A karya that has open contributor slots. */
export interface KaryaSlot {
  id: number;
  title: string;
  desc: string;
  interests: string[];
  stage: string;
  openRoles: string[];     // e.g. ["1 Backend Go", "1 UI Designer"]
  roster: { name: string }[];
  postedHoursAgo: number;
  badge: LookingFor;        // what kind of help they're asking for
}

// Names reused from data/karya.ts for continuity; Siti Rahmah & Budi Santoso also
// appear in those rosters. Three new names added to fill the gig/hackathon slots
// naturally.
export const SEEKERS: Seeker[] = [
  {
    id: 1,
    name: "Arief Maulana",
    handle: "@arief_dev",
    tingkat: "Tkt 3",
    jurusan: "S1 Teknik Informatika",
    bio: "Full-stack yang suka bangun produk yang beneran dipakai. Lagi cari tim project jangka panjang — nyaman di backend tapi bisa handle integrasi API.",
    skills: ["React", "Hono", "PostgreSQL", "Go"],
    badge: "project",
    currentKarya: { title: "KampusKerja", role: "Lead Dev" },
    postedHoursAgo: 3,
  },
  {
    id: 2,
    name: "Dian Pertiwi",
    handle: "@dianp",
    tingkat: "Tkt 3",
    jurusan: "S1 Sistem Informasi",
    bio: "UX researcher dan product thinker. Antusias hackathon — suka problem sosial, komunitas lokal, dan UMKM. Udah ikut PKM dua kali.",
    skills: ["UX Research", "Figma", "Miro", "Notion"],
    badge: "hackathon",
    currentKarya: { title: "Warung Digital", role: "Product" },
    postedHoursAgo: 7,
  },
  {
    id: 3,
    name: "Rizal Hakim",
    handle: "@rizalh",
    tingkat: "Tkt 4",
    jurusan: "S1 Teknik Informatika",
    bio: "ML researcher fokus NLP bahasa daerah. Cari tim yang serius di bidang data atau AI — bukan sekadar demo, tapi riset yang bisa dipublikasikan.",
    skills: ["Python", "PyTorch", "HuggingFace", "FastAPI"],
    badge: "project",
    currentKarya: { title: "Aksara AI", role: "Research Lead" },
    postedHoursAgo: 11,
  },
  {
    id: 4,
    name: "Nadia Kusuma",
    handle: "@nadiaku",
    tingkat: "Tkt 2",
    jurusan: "S1 Desain Komunikasi Visual",
    bio: "UI/UX designer yang juga bisa koding CSS. Open untuk freelance ringan — bantu desain tampilan, bikin komponen, atau UI audit cepat.",
    skills: ["Figma", "Tailwind", "Vue", "Ilustrasi"],
    badge: "gig",
    currentKarya: { title: "BukuSaku Kampus", role: "UI Designer" },
    postedHoursAgo: 15,
  },
  {
    id: 5,
    name: "Farhan Ardiansyah",
    handle: "@farhan_a",
    tingkat: "Tkt 2",
    jurusan: "S1 Teknik Informatika",
    bio: "Mahasiswa tahun dua yang antusias dan cepat belajar. Lagi aktif cari tim untuk GEMASTIK 2026 — siap ambil bagian di mana pun dibutuhkan.",
    skills: ["JavaScript", "Python", "Git", "SQL"],
    badge: "hackathon",
    currentKarya: { title: "Peta Kost", role: "Dev" },
    postedHoursAgo: 22,
  },
  {
    id: 6,
    name: "Eko Saputra",
    handle: "@eko_s",
    tingkat: "Tkt 3",
    jurusan: "S1 Teknik Informatika",
    bio: "Backend engineer spesialis Go dan Docker. Tersedia untuk kontribusi gig jangka pendek — migrasi database, setup infrastruktur, atau review kode.",
    skills: ["Go", "Docker", "PostgreSQL", "Redis"],
    badge: "gig",
    currentKarya: { title: "Warung Digital", role: "Backend" },
    postedHoursAgo: 28,
  },
  {
    id: 7,
    name: "Aldi Pratama",
    handle: "@aldip_music",
    tingkat: "Tkt 3",
    jurusan: "S1 Teknik Informatika",
    bio: "Developer yang juga musisi. Bangun Sound Nusantara, tapi open untuk project sampingan yang ada irisan kreatif atau komunitas.",
    skills: ["React", "TypeScript", "Web Audio API", "Node.js"],
    badge: "project",
    currentKarya: { title: "Sound Nusantara", role: "Founder" },
    postedHoursAgo: 36,
  },
  {
    id: 8,
    name: "Siti Rahmah",
    handle: "@siti_ux",
    tingkat: "Tkt 2",
    jurusan: "S1 Desain Komunikasi Visual",
    bio: "Desainer grafis dan motion. Open untuk hackathon atau bantuan visual branding — kalau karyamu belum punya tampilan, aku bisa bantu.",
    skills: ["Figma", "After Effects", "Illustrator", "Canva"],
    badge: "hackathon",
    currentKarya: { title: "KampusKerja", role: "UI Designer" },
    postedHoursAgo: 44,
  },
  {
    id: 9,
    name: "Budi Santoso",
    handle: "@budisnt",
    tingkat: "Tkt 3",
    jurusan: "S1 Teknik Informatika",
    bio: "Mobile developer React Native. Tersedia untuk gig pendek — tambah halaman, bikin fitur kecil, atau bantu optimasi performa aplikasi.",
    skills: ["React Native", "Expo", "TypeScript", "Firebase"],
    badge: "gig",
    currentKarya: { title: "BukuSaku Kampus", role: "Mobile Dev" },
    postedHoursAgo: 58,
  },
];

export const KARYA_SLOTS: KaryaSlot[] = [
  {
    id: 1,
    title: "MahasiswaLaga",
    desc: "Platform gamifikasi lomba kampus — skor, badge, dan papan kompetisi antar jurusan. Ini tim GEMASTIK 2026 kami.",
    interests: ["Komunitas", "Web", "Produktivitas"],
    stage: "GEMASTIK 2026",
    openRoles: ["1 Frontend React", "1 Backend Go", "1 UI/UX Designer"],
    roster: [{ name: "Hana Puspita" }, { name: "Taufik Hidayat" }],
    postedHoursAgo: 12,
    badge: "hackathon",
  },
  {
    id: 2,
    title: "WargaSehat",
    desc: "Asisten gizi berbasis AI untuk mahasiswa kos — input makanan harian, dapat analisis nutrisi sederhana.",
    interests: ["Kesehatan", "AI/ML", "Mobile"],
    stage: "Hackathon",
    openRoles: ["1 ML Engineer", "1 UI Designer"],
    roster: [{ name: "Laila Novitasari" }, { name: "Reza Permana" }],
    postedHoursAgo: 18,
    badge: "hackathon",
  },
  {
    id: 3,
    title: "Peta Kost",
    desc: "Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif.",
    interests: ["Web", "Maps", "Komunitas"],
    stage: "Beta",
    openRoles: ["1 Backend Go", "1 UI Designer"],
    roster: [{ name: "Farhan Ardiansyah" }],
    postedHoursAgo: 26,
    badge: "project",
  },
  {
    id: 4,
    title: "Aksara AI",
    desc: "Model bahasa kecil dilatih corpus Sunda & Jawa — untuk eksperimen NLP lokal yang bisa dipublikasikan.",
    interests: ["AI/ML", "Bahasa", "Open Source"],
    stage: "Riset",
    openRoles: ["1 NLP Researcher", "1 Data Annotator"],
    roster: [{ name: "Rizal Hakim" }],
    postedHoursAgo: 34,
    badge: "project",
  },
  {
    id: 5,
    title: "Sound Nusantara",
    desc: "Arsip dan label indie musik mahasiswa — upload gratis, lisensi terbuka, dikurasi komunitas.",
    interests: ["Musik", "Komunitas", "Open Source"],
    stage: "Ide",
    openRoles: ["1 Backend Dev", "1 Sound Engineer"],
    roster: [{ name: "Aldi Pratama" }],
    postedHoursAgo: 52,
    badge: "project",
  },
  {
    id: 6,
    title: "Jadwal Bersama",
    desc: "Koordinasi jadwal kelompok tanpa drama — sinkron kalender akademik Telkom secara otomatis.",
    interests: ["Produktivitas", "Kolaborasi", "Web"],
    stage: "Prototype",
    openRoles: ["1 Backend Dev", "1 QA Tester"],
    roster: [{ name: "Mega Wulandari" }, { name: "Taufik Hidayat" }],
    postedHoursAgo: 68,
    badge: "project",
  },
  {
    id: 7,
    title: "KampusDesain",
    desc: "Marketplace brief desain mahasiswa — ambil brief, selesaikan, bangun portofolio nyata.",
    interests: ["Desain", "Komunitas", "Konten"],
    stage: "Ide",
    openRoles: ["1 Full-stack Dev"],
    roster: [{ name: "Nadia Kusuma" }],
    postedHoursAgo: 5,
    badge: "gig",
  },
];
