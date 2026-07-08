import { covers } from "../lib/images";

export interface Roster { name: string; handle: string }

export interface Karya {
  id: number;
  title: string;
  description: string;
  stages: string[];
  interests: string[];
  roster: Roster[];
  appreciations: number;
  lastActivity: { text: string; hoursAgo: number }; // drives the chronological feed
  featured?: boolean;
  landscapeScreenshots?: string[];
}

export interface Member {
  id: number;
  name: string;
  handle: string;
  bio: string;
  interests: string[];
  skills: string[];
  year: number;
  major: string;
  karya: number; // count of published karya
}

export const KARYA: Karya[] = [
  {
    id: 1,
    title: "KampusKerja",
    description: "Platform lowongan magang khusus mahasiswa Telkom — terkoneksi langsung dengan alumni yang sudah bekerja.",
    stages: ["MVP", "Beta"],
    interests: ["Karir", "Networking", "Web"],
    roster: [{ name: "Arief Maulana", handle: "@arief_dev" }, { name: "Siti Rahmah", handle: "@siti_ux" }],
    appreciations: 214,
    lastActivity: { text: "Rilis beta terbuka", hoursAgo: 5 },
    featured: true,
  },
  {
    id: 2,
    title: "Warung Digital",
    description: "Bantu UMKM sekitar kampus punya toko online sederhana — tanpa ribet, cukup WhatsApp.",
    stages: ["Ide", "Prototype"],
    interests: ["UMKM", "Mobile", "Sosial"],
    roster: [{ name: "Dian Pertiwi", handle: "@dianp" }, { name: "Eko Saputra", handle: "@eko_s" }, { name: "Lina Marlina", handle: "@linax" }],
    appreciations: 187,
    lastActivity: { text: "Pasang update progres", hoursAgo: 2 },
  },
  {
    id: 3,
    title: "Aksara AI",
    description: "Model bahasa kecil yang dilatih dengan corpus teks Sunda & Jawa — untuk eksperimen NLP lokal.",
    stages: ["Riset"],
    interests: ["AI/ML", "Bahasa", "Open Source"],
    roster: [{ name: "Rizal Hakim", handle: "@rizalh" }],
    appreciations: 156,
    lastActivity: { text: "Bagikan catatan riset", hoursAgo: 9 },
  },
  {
    id: 4,
    title: "BukuSaku Kampus",
    description: "Ringkasan materi kuliah populer dalam format kartu — dikurasi mahasiswa, untuk mahasiswa.",
    stages: ["MVP"],
    interests: ["Edukasi", "Mobile", "Konten"],
    roster: [{ name: "Nadia Kusuma", handle: "@nadiaku" }, { name: "Budi Santoso", handle: "@budisnt" }],
    appreciations: 134,
    lastActivity: { text: "Tambah 12 kartu materi", hoursAgo: 20 },
    landscapeScreenshots: [covers.education, covers.writing, covers.productivity, covers.community],
  },
  {
    id: 5,
    title: "Peta Kost",
    description: "Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif.",
    stages: ["Beta", "Cari Kolaborator"],
    interests: ["Web", "Maps", "Komunitas"],
    roster: [{ name: "Farhan Ardiansyah", handle: "@farhan_a" }],
    appreciations: 112,
    lastActivity: { text: "Buka lowongan kolaborator", hoursAgo: 26 },
    landscapeScreenshots: [covers.maps, covers.community, covers.environment, covers.devtools],
  },
  {
    id: 6,
    title: "Jadwal Bersama",
    description: "Koordinasi jadwal kelompok tanpa drama — sinkron kalender akademik Telkom secara otomatis.",
    stages: ["Prototype"],
    interests: ["Produktivitas", "Web", "Kolaborasi"],
    roster: [{ name: "Mega Wulandari", handle: "@megaw" }, { name: "Taufik Hidayat", handle: "@taufikhi" }],
    appreciations: 98,
    lastActivity: { text: "Pasang update progres", hoursAgo: 38 },
    landscapeScreenshots: [covers.productivity, covers.ai, covers.data],
  },
  {
    id: 7,
    title: "Sound Nusantara",
    description: "Arsip dan label indie musik mahasiswa — upload gratis, lisensi terbuka, dikurasi komunitas.",
    stages: ["Ide", "Cari Kolaborator"],
    interests: ["Musik", "Komunitas", "Open Source"],
    roster: [{ name: "Aldi Pratama", handle: "@aldip_music" }],
    appreciations: 77,
    lastActivity: { text: "Buka lowongan kolaborator", hoursAgo: 52 },
  },
];

export const MEMBERS: Member[] = [
  { id: 1, name: "Arief Maulana", handle: "@arief_dev", bio: "Full-stack, suka bangun produk yang beneran dipakai orang.", interests: ["Karir", "Web"], skills: ["React", "Hono", "PostgreSQL"], year: 3, major: "S1 Teknik Informatika", karya: 3 },
  { id: 2, name: "Nadia Kusuma", handle: "@nadiaku", bio: "Desainer produk yang juga bisa koding CSS.", interests: ["Edukasi", "Konten"], skills: ["Figma", "Tailwind", "Vue"], year: 2, major: "S1 Desain Komunikasi Visual", karya: 2 },
  { id: 3, name: "Rizal Hakim", handle: "@rizalh", bio: "ML enthusiast, tertarik pada bahasa daerah dan NLP.", interests: ["AI/ML", "Bahasa"], skills: ["Python", "PyTorch", "HuggingFace"], year: 4, major: "S1 Teknik Informatika", karya: 4 },
  { id: 4, name: "Dian Pertiwi", handle: "@dianp", bio: "Senang riset pengguna dan problem-solve bareng komunitas.", interests: ["UMKM", "Sosial"], skills: ["UX Research", "Figma", "Notion"], year: 3, major: "S1 Sistem Informasi", karya: 1 },
  { id: 5, name: "Eko Saputra", handle: "@eko_s", bio: "Backend developer, hobi otomasi hal-hal yang bikin frustrasi.", interests: ["Mobile", "Web"], skills: ["Go", "Docker", "PostgreSQL"], year: 3, major: "S1 Teknik Informatika", karya: 2 },
];

export const ALL_INTERESTS = Array.from(new Set(KARYA.flatMap((k) => k.interests)));
export const ALL_SKILLS = Array.from(new Set(MEMBERS.flatMap((m) => m.skills)));
