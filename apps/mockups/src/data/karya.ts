import { covers } from "../lib/images";
import { MOCKUP_KARYA } from "@myapp/mockup-data";

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

const KARYA_DETAILS: Omit<Karya, "title" | "description" | "stages" | "interests" | "landscapeScreenshots">[] = [
  {
    id: 1,
    roster: [{ name: "Arief Maulana", handle: "@arief_dev" }, { name: "Siti Rahmah", handle: "@siti_ux" }],
    appreciations: 214,
    lastActivity: { text: "Rilis beta terbuka", hoursAgo: 5 },
    featured: true,
  },
  {
    id: 2,
    roster: [{ name: "Dian Pertiwi", handle: "@dianp" }, { name: "Eko Saputra", handle: "@eko_s" }, { name: "Lina Marlina", handle: "@linax" }],
    appreciations: 187,
    lastActivity: { text: "Pasang update progres", hoursAgo: 2 },
  },
  {
    id: 3,
    roster: [{ name: "Rizal Hakim", handle: "@rizalh" }, { name: "Zaki Nadhif", handle: "@zaki_n" }],
    appreciations: 156,
    lastActivity: { text: "Bagikan catatan riset", hoursAgo: 9 },
  },
  {
    id: 4,
    roster: [{ name: "Nadia Kusuma", handle: "@nadiaku" }, { name: "Budi Santoso", handle: "@budisnt" }],
    appreciations: 134,
    lastActivity: { text: "Tambah 12 kartu materi", hoursAgo: 20 },
  },
  {
    id: 5,
    roster: [{ name: "Farhan Ardiansyah", handle: "@farhan_a" }],
    appreciations: 112,
    lastActivity: { text: "Buka lowongan kolaborator", hoursAgo: 26 },
  },
  {
    id: 6,
    roster: [{ name: "Mega Wulandari", handle: "@megaw" }, { name: "Taufik Hidayat", handle: "@taufikhi" }, { name: "Zaki Nadhif", handle: "@zaki_n" }],
    appreciations: 98,
    lastActivity: { text: "Pasang update progres", hoursAgo: 38 },
  },
  {
    id: 7,
    roster: [{ name: "Aldi Pratama", handle: "@aldip_music" }],
    appreciations: 77,
    lastActivity: { text: "Buka lowongan kolaborator", hoursAgo: 52 },
  },
];

export const KARYA: Karya[] = MOCKUP_KARYA.map((karya, index) => ({
  ...KARYA_DETAILS[index],
  ...karya,
  roster: KARYA_DETAILS[index].roster,
  appreciations: KARYA_DETAILS[index].appreciations,
  lastActivity: KARYA_DETAILS[index].lastActivity,
  featured: KARYA_DETAILS[index].featured,
  landscapeScreenshots: karya.landscapeScreenshots?.map((theme) => covers[theme]),
}));

/**
 * Whoever is signed in — the left rail's user stub, and the person the composer
 * posts *as*. The gallery has always named him in the rail; what is new is that
 * something now asks which karya he may speak for, and the roster is the only
 * honest answer.
 */
export const ME: Roster = { name: "Zaki Nadhif", handle: "@zaki_n" };

/**
 * The karya I may post as. Derived from the rosters rather than listed here,
 * because roster membership *is* the permission: a post is authored by the karya
 * (see updates.ts), so being able to speak for one is the same fact as being on
 * it. A second list would be a second answer to one question.
 *
 * Empty is a real state, not an edge case — most people arrive with no karya at
 * all — and it is what the composer's nudge is for. To see that state, take
 * @zaki_n off the two rosters above.
 */
export const MY_KARYA: Karya[] = KARYA.filter((k) =>
  k.roster.some((r) => r.handle === ME.handle),
);

export const MEMBERS: Member[] = [
  { id: 1, name: "Arief Maulana", handle: "@arief_dev", bio: "Full-stack, suka bangun produk yang beneran dipakai orang.", interests: ["Karir", "Web"], skills: ["React", "Hono", "PostgreSQL"], year: 3, major: "S1 Teknik Informatika", karya: 3 },
  { id: 2, name: "Nadia Kusuma", handle: "@nadiaku", bio: "Desainer produk yang juga bisa koding CSS.", interests: ["Edukasi", "Konten"], skills: ["Figma", "Tailwind", "Vue"], year: 2, major: "S1 Desain Komunikasi Visual", karya: 2 },
  { id: 3, name: "Rizal Hakim", handle: "@rizalh", bio: "ML enthusiast, tertarik pada bahasa daerah dan NLP.", interests: ["AI/ML", "Bahasa"], skills: ["Python", "PyTorch", "HuggingFace"], year: 4, major: "S1 Teknik Informatika", karya: 4 },
  { id: 4, name: "Dian Pertiwi", handle: "@dianp", bio: "Senang riset pengguna dan problem-solve bareng komunitas.", interests: ["UMKM", "Sosial"], skills: ["UX Research", "Figma", "Notion"], year: 3, major: "S1 Sistem Informasi", karya: 1 },
  { id: 5, name: "Eko Saputra", handle: "@eko_s", bio: "Backend developer, hobi otomasi hal-hal yang bikin frustrasi.", interests: ["Mobile", "Web"], skills: ["Go", "Docker", "PostgreSQL"], year: 3, major: "S1 Teknik Informatika", karya: 2 },
];

export const ALL_INTERESTS = Array.from(new Set(KARYA.flatMap((k) => k.interests)));
export const ALL_SKILLS = Array.from(new Set(MEMBERS.flatMap((m) => m.skills)));
