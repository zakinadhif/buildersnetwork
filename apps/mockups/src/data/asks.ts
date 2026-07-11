import type { LookingFor } from "./looking-for";

/**
 * Cari variant E — the bulletin wall. Each ask is either "person" (a human
 * seeking a team or project) or "karya" (a project seeking contributors).
 */
export interface Ask {
  id: number;
  type: LookingFor;
  from: "person" | "karya";
  // person identity
  name?: string;
  handle?: string;
  // karya identity
  karyaTitle?: string;
  karyaInterests?: string[];  // drives coverFor()
  karyaRoster?: string;       // short "oleh @handle" credit line
  // content — the free-text first-person note is the visual hero
  note: string;
  seeking: string[];          // skills / open roles as chips below the note
  hoursAgo: number;
}

export const ASKS: Ask[] = [
  // ── Hackathon asks ─────────────────────────────────────────────────────────
  {
    id: 1,
    type: "hackathon",
    from: "person",
    name: "Arief Maulana",
    handle: "@arief_dev",
    note: "Nyari temen frontend (React) buat hackathon GEMASTIK 2026! Tim kami udah ada 2 orang — saya handle backend, ada yang UX. Tinggal butuh 1 dev frontend yang mau gerak cepat. Ide: platform monitoring kesehatan berbasis komunitas. DM kalau tertarik 🙌",
    seeking: ["React", "TypeScript", "UI/UX"],
    hoursAgo: 1,
  },
  {
    id: 2,
    type: "hackathon",
    from: "person",
    name: "Nadia Kusuma",
    handle: "@nadiaku",
    note: "Mau ikut INAICTA kategori fintech, tim cuma 2 orang sejauh ini (saya + 1 teman). Masih butuh 1 developer fullstack yang suka problem keuangan mahasiswa. Nggak perlu expert — yang penting mau belajar bareng dan committed sampai akhir.",
    seeking: ["React", "Node.js", "PostgreSQL"],
    hoursAgo: 3,
  },
  {
    id: 10,
    type: "hackathon",
    from: "person",
    name: "Siti Rahmah",
    handle: "@siti_ux",
    note: "Mau ikut Hackatech Bandung bulan depan, cari 1–2 orang yang mau tim kecil tapi solid. Saya fokus di riset pengguna dan storytelling. Butuh dev yang bisa deliver MVP dalam 36 jam — React atau Vue sama-sama oke. Kalau bisa pitch juga, bonus poin 😁",
    seeking: ["React", "Vue.js", "Public Speaking"],
    hoursAgo: 45,
  },
  {
    id: 12,
    type: "hackathon",
    from: "person",
    name: "Mega Wulandari",
    handle: "@megaw",
    note: "Cari 1–2 developer buat tim GEMASTIK kategori Kecerdasan Buatan. Ide dan dataset udah ada (saya yang urus), tinggal butuh yang bisa implement dan tuning model. Serius tapi tetap fun — kita bagi tugas adil. Deadline daftar tim 30 Juni, gas! 🔥",
    seeking: ["Python", "PyTorch", "Machine Learning"],
    hoursAgo: 60,
  },
  // ── Project asks ────────────────────────────────────────────────────────────
  {
    id: 3,
    type: "project",
    from: "karya",
    karyaTitle: "Peta Kost",
    karyaInterests: ["Web", "Maps", "Komunitas"],
    karyaRoster: "oleh @farhan_a",
    note: "Peta Kost lagi butuh 1 orang backend (Go atau Node) yang santai diajak iterasi mingguan. Nggak harus full-time — 3–4 jam seminggu sudah cukup. Kita pakai PostgreSQL + tRPC. Kalau kamu suka maps dan mau kontribusi nyata buat sesama penghuni kost, yuk ngobrol dulu.",
    seeking: ["Go", "Node.js", "PostgreSQL"],
    hoursAgo: 5,
  },
  {
    id: 4,
    type: "project",
    from: "person",
    name: "Rizal Hakim",
    handle: "@rizalh",
    note: "Lagi riset NLP bahasa daerah — nyari co-researcher atau kontributor dataset yang punya akses ke teks Sunda/Jawa (puisi, cerpen, artikel lokal). Bisa async banget, nggak ada target ketat. Hasilnya rencananya open-source. Yang tertarik, DM ya — senang diskusi santai dulu.",
    seeking: ["NLP", "Python", "Dataset"],
    hoursAgo: 8,
  },
  {
    id: 7,
    type: "project",
    from: "person",
    name: "Eko Saputra",
    handle: "@eko_s",
    note: "Nyari teman buat bikin tools CLI sederhana (Go/Rust) — otomasi reminder pengumpulan tugas kuliah, sync ke Google Calendar, kirim notif WA. Nggak serius-serius banget, lebih ke fun project + belajar bareng. Kamu yang mau improve Go sambil bikin sesuatu yang beneran kita pakai, mangga 🙂",
    seeking: ["Go", "Rust", "CLI Tools"],
    hoursAgo: 22,
  },
  {
    id: 9,
    type: "project",
    from: "person",
    name: "Farhan Ardiansyah",
    handle: "@farhan_a",
    note: "Mau bikin unofficial API wrapper buat data kampus (jadwal kuliah, kalender akademik) — informasinya publik tapi belum ada yang bungkus jadi API yang nyaman dipakai. Saya udah mulai, tinggal butuh 1–2 teman buat parsing, maintenance, dan dokumentasi. Open source dari hari pertama.",
    seeking: ["Python", "REST API", "Web Scraping"],
    hoursAgo: 38,
  },
  // ── Gig asks ────────────────────────────────────────────────────────────────
  {
    id: 5,
    type: "gig",
    from: "karya",
    karyaTitle: "Sound Nusantara",
    karyaInterests: ["Musik", "Komunitas", "Open Source"],
    karyaRoster: "oleh @aldip_music",
    note: "Sound Nusantara butuh desainer grafis atau visual artist untuk bikin artwork cover album indie. Nggak ada budget cash, tapi nama kamu masuk kredit di semua rilis dan boleh dipakai di portofolio. Ini karya komunitas yang beneran didengar orang 🎶",
    seeking: ["Desain Grafis", "Ilustrasi", "Branding"],
    hoursAgo: 12,
  },
  {
    id: 6,
    type: "gig",
    from: "person",
    name: "Dian Pertiwi",
    handle: "@dianp",
    note: "Ada yang bisa bantu desain logo + color palette buat project edukasi anak sekolah? Serius dipakai, bukan cuma tugas kuliah. Bisa barter — kamu design, saya bantu user testing atau UX review gratis. Atau kalau mau pengalaman nyata aja juga oke 😄",
    seeking: ["Logo Design", "Branding", "Ilustrasi"],
    hoursAgo: 18,
  },
  {
    id: 8,
    type: "gig",
    from: "karya",
    karyaTitle: "Warung Digital",
    karyaInterests: ["UMKM", "Mobile", "Sosial"],
    karyaRoster: "oleh @dianp · @eko_s",
    note: "Warung Digital butuh orang yang ngerti konten marketing atau SEO lokal — buat bantu pedagang kecil sekitar kampus lebih mudah ditemukan online. Bukan kerja berat, tapi harus empati sama UMKM. Kamu punya experience atau sekadar tertarik? Yuk ngobrol santai dulu.",
    seeking: ["Content Marketing", "SEO", "Social Media"],
    hoursAgo: 30,
  },
  {
    id: 11,
    type: "gig",
    from: "karya",
    karyaTitle: "BukuSaku Kampus",
    karyaInterests: ["Edukasi", "Mobile", "Konten"],
    karyaRoster: "oleh @nadiaku · @budisnt",
    note: "BukuSaku Kampus mau tambah konten statistika dan fisika dasar — ada yang mau bantu nulis atau review materi? Async banget, bisa kapan saja. Minimal 2–3 kartu per minggu, format sudah ada templatenya. Cocok buat yang suka berbagi ilmu 📚",
    seeking: ["Konten Edukatif", "Statistika", "Fisika Dasar"],
    hoursAgo: 52,
  },
];

/** Aggregate skill counts for the "Paling Dicari" right-rail widget. */
const skillCounts = ASKS.reduce<Record<string, number>>((acc, ask) => {
  ask.seeking.forEach((s) => { acc[s] = (acc[s] ?? 0) + 1; });
  return acc;
}, {});

export const TOP_SKILLS: [string, number][] = Object.entries(skillCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6);
