/** Image names shared by the mockup UI and the database seed command. */
export type MockupCoverTheme =
  | "community"
  | "education"
  | "data"
  | "music"
  | "productivity"
  | "commerce"
  | "ai"
  | "environment"
  | "maps"
  | "writing"
  | "devtools"
  | "security";

export const MOCKUP_IMAGE_FILENAMES: Record<MockupCoverTheme, string> = {
  community: "community.jpg",
  education: "education.jpg",
  data: "data.jpg",
  music: "music.jpg",
  productivity: "productivity.jpg",
  commerce: "commerce.jpg",
  ai: "ai.jpg",
  environment: "environment.jpg",
  maps: "maps.jpg",
  writing: "writing.jpg",
  devtools: "devtools.jpg",
  security: "security.jpg",
};

export interface MockupKarya {
  id: number;
  title: string;
  description: string;
  /** Display labels used by the mockup. The seed maps them to the app's enum. */
  stages: string[];
  interests: string[];
  cover: MockupCoverTheme;
  landscapeScreenshots?: MockupCoverTheme[];
}

/**
 * The one source of truth for the gallery's project cards and the seeded app
 * catalog. Keep the mockup-facing copy and image selection here.
 */
export const MOCKUP_KARYA: readonly MockupKarya[] = [
  {
    id: 1,
    title: "KampusKerja",
    description:
      "Platform lowongan magang khusus mahasiswa Telkom — terkoneksi langsung dengan alumni yang sudah bekerja.",
    stages: ["MVP", "Beta"],
    interests: ["Karir", "Networking", "Web"],
    cover: "community",
  },
  {
    id: 2,
    title: "Warung Digital",
    description:
      "Bantu UMKM sekitar kampus punya toko online sederhana — tanpa ribet, cukup WhatsApp.",
    stages: ["Ide", "Prototype"],
    interests: ["UMKM", "Mobile", "Sosial"],
    cover: "commerce",
  },
  {
    id: 3,
    title: "Aksara AI",
    description:
      "Model bahasa kecil yang dilatih dengan corpus teks Sunda & Jawa — untuk eksperimen NLP lokal.",
    stages: ["Riset"],
    interests: ["AI/ML", "Bahasa", "Open Source"],
    cover: "ai",
  },
  {
    id: 4,
    title: "BukuSaku Kampus",
    description:
      "Ringkasan materi kuliah populer dalam format kartu — dikurasi mahasiswa, untuk mahasiswa.",
    stages: ["MVP"],
    interests: ["Edukasi", "Mobile", "Konten"],
    cover: "education",
    landscapeScreenshots: ["education", "writing", "productivity", "community"],
  },
  {
    id: 5,
    title: "Peta Kost",
    description:
      "Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif.",
    stages: ["Beta", "Cari Kolaborator"],
    interests: ["Web", "Maps", "Komunitas"],
    cover: "maps",
    landscapeScreenshots: ["maps", "community", "environment", "devtools"],
  },
  {
    id: 6,
    title: "Jadwal Bersama",
    description:
      "Koordinasi jadwal kelompok tanpa drama — sinkron kalender akademik Telkom secara otomatis.",
    stages: ["Prototype"],
    interests: ["Produktivitas", "Web", "Kolaborasi"],
    cover: "productivity",
    landscapeScreenshots: ["productivity", "ai", "data"],
  },
  {
    id: 7,
    title: "Sound Nusantara",
    description:
      "Arsip dan label indie musik mahasiswa — upload gratis, lisensi terbuka, dikurasi komunitas.",
    stages: ["Ide", "Cari Kolaborator"],
    interests: ["Musik", "Komunitas", "Open Source"],
    cover: "music",
  },
];
