import type { LookingFor } from "./looking-for";

/** Cari variant C — two-way match recommendations for the logged-in user (Zaki). */

export interface Roster { name: string; handle: string }

export interface KaryaMatch {
  id: number;
  title: string;
  description: string;
  interests: string[];
  stages: string[];
  openRoles: string[];       // roles this karya needs filled
  roster: Roster[];
  lookingFor: LookingFor;
  matchReason: string[];     // Zaki's skills that triggered the match
}

export interface PersonMatch {
  id: number;
  name: string;
  handle: string;
  tingkat: number;
  jurusan: string;
  bio: string;
  skills: string[];
  lookingFor: LookingFor;
  currentKarya: string | null;
  fitsMyKarya: string;       // which of Zaki's karya they'd join
  fitsRole: string;          // specific open role they'd fill
  matchReason: string[];     // their skills that match the open role
}

export interface ZakiKarya {
  id: string;
  title: string;
  interests: string[];
  openRoles: string[];
}

/** The logged-in user. */
export const ZAKI = {
  name: "Zaki Nadhif",
  handle: "@zaki_n",
  tingkat: 3,
  jurusan: "S1 Teknik Informatika",
  skills: ["React", "TypeScript", "UI Design"],
  bio: "Suka desain sistem yang nyaman dipakai orang — dari pixel sampai API.",
};

/** Karya Zaki is already a member of — each has open seats he can't fill himself. */
export const ZAKI_KARYA: ZakiKarya[] = [
  {
    id: "buku-saku",
    title: "BukuSaku Kampus",
    interests: ["Edukasi", "Mobile", "Konten"],
    openRoles: ["Backend Go", "ML Engineer"],
  },
  {
    id: "study-sync",
    title: "StudySync",
    interests: ["Produktivitas", "Web", "Kolaborasi"],
    openRoles: ["iOS Developer", "UX Researcher"],
  },
];

/** Karya whose open roles match Zaki's skills. */
export const KARYA_MATCHES: KaryaMatch[] = [
  {
    id: 1,
    title: "Peta Kost",
    description: "Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif.",
    interests: ["Web", "Maps", "Komunitas"],
    stages: ["Beta"],
    openRoles: ["1 Frontend React", "1 UI Designer"],
    roster: [{ name: "Farhan Ardiansyah", handle: "@farhan_a" }],
    lookingFor: "project",
    matchReason: ["React", "UI Design"],
  },
  {
    id: 2,
    title: "KampusKerja",
    description: "Platform lowongan magang khusus mahasiswa Telkom — terkoneksi langsung dengan alumni yang sudah bekerja.",
    interests: ["Karir", "Networking", "Web"],
    stages: ["Beta"],
    openRoles: ["1 Frontend Developer", "1 UI Designer"],
    roster: [
      { name: "Arief Maulana", handle: "@arief_dev" },
      { name: "Siti Rahmah",   handle: "@siti_ux" },
    ],
    lookingFor: "project",
    matchReason: ["React", "TypeScript"],
  },
  {
    id: 3,
    title: "Warung Digital",
    description: "Bantu UMKM sekitar kampus punya toko online sederhana — tanpa ribet, cukup WhatsApp.",
    interests: ["UMKM", "Mobile", "Sosial"],
    stages: ["Prototype"],
    openRoles: ["1 UI Designer", "1 Frontend Mobile"],
    roster: [
      { name: "Dian Pertiwi",  handle: "@dianp" },
      { name: "Eko Saputra",   handle: "@eko_s" },
      { name: "Lina Marlina",  handle: "@linax" },
    ],
    lookingFor: "project",
    matchReason: ["UI Design"],
  },
  {
    id: 4,
    title: "Sound Nusantara",
    description: "Arsip dan label indie musik mahasiswa — upload gratis, lisensi terbuka, dikurasi komunitas.",
    interests: ["Musik", "Komunitas", "Open Source"],
    stages: ["Ide"],
    openRoles: ["1 Web Developer"],
    roster: [{ name: "Aldi Pratama", handle: "@aldip_music" }],
    lookingFor: "hackathon",
    matchReason: ["React", "TypeScript"],
  },
];

/** People whose skills fill Zaki's karya's open roles. */
export const PERSON_MATCHES: PersonMatch[] = [
  {
    id: 1,
    name: "Eko Saputra",
    handle: "@eko_s",
    tingkat: 3,
    jurusan: "S1 Teknik Informatika",
    bio: "Backend developer, hobi otomasi hal-hal yang bikin frustrasi.",
    skills: ["Go", "Docker", "PostgreSQL"],
    lookingFor: "project",
    currentKarya: "Warung Digital",
    fitsMyKarya: "BukuSaku Kampus",
    fitsRole: "Backend Go",
    matchReason: ["Go"],
  },
  {
    id: 2,
    name: "Rizal Hakim",
    handle: "@rizalh",
    tingkat: 4,
    jurusan: "S1 Teknik Informatika",
    bio: "ML enthusiast, tertarik pada bahasa daerah dan NLP.",
    skills: ["Python", "PyTorch", "HuggingFace"],
    lookingFor: "project",
    currentKarya: "Aksara AI",
    fitsMyKarya: "BukuSaku Kampus",
    fitsRole: "ML Engineer",
    matchReason: ["Python", "PyTorch"],
  },
  {
    id: 3,
    name: "Dian Pertiwi",
    handle: "@dianp",
    tingkat: 3,
    jurusan: "S1 Sistem Informasi",
    bio: "Senang riset pengguna dan problem-solve bareng komunitas.",
    skills: ["UX Research", "Figma", "Notion"],
    lookingFor: "gig",
    currentKarya: "Warung Digital",
    fitsMyKarya: "StudySync",
    fitsRole: "UX Researcher",
    matchReason: ["UX Research"],
  },
  {
    id: 4,
    name: "Hendra Wijaya",
    handle: "@hendraw",
    tingkat: 2,
    jurusan: "S1 Teknik Informatika",
    bio: "iOS developer yang obsesi sama smooth animations dan gesture.",
    skills: ["Swift", "SwiftUI", "Xcode"],
    lookingFor: "hackathon",
    currentKarya: null,
    fitsMyKarya: "StudySync",
    fitsRole: "iOS Developer",
    matchReason: ["Swift", "SwiftUI"],
  },
  {
    id: 5,
    name: "Nadia Kusuma",
    handle: "@nadiaku",
    tingkat: 2,
    jurusan: "S1 Desain Komunikasi Visual",
    bio: "Desainer produk yang juga bisa koding CSS.",
    skills: ["Figma", "Tailwind", "Vue"],
    lookingFor: "project",
    currentKarya: "BukuSaku Kampus",
    fitsMyKarya: "StudySync",
    fitsRole: "UX Researcher",
    matchReason: ["Figma"],
  },
];
