import type { Member } from "@myapp/api-client-react";
import { aiComplete } from "@myapp/api-client-react";

export type { Member };

export const SEED_MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Hafiz Maulana",
    handle: "hafiz",
    bio: "Bikin tool sinkronisasi file peer-to-peer — ringan, offline-first, ga butuh cloud sama sekali. Kerja solo dulu, baru share.",
    interests: ["Distributed Systems", "WebAssembly", "Protocol Design"],
    year: "Tingkat 2",
    major: "Informatika",
    skills: ["Go", "Rust", "Systems Programming", "Networking"],
  },
  {
    id: "m2",
    name: "Fatimah Zahra",
    handle: "fatimah",
    bio: "Lagi bangun rekomendasi kuliner lokal berbasis ML — privacy-first, konteks Indonesia. Suka pair di masalah yang susah.",
    interests: ["Deep Learning", "MLOps", "Inference Pipelines"],
    year: "Tingkat 3",
    major: "Informatika",
    skills: ["Python", "Machine Learning", "FastAPI", "scikit-learn"],
  },
  {
    id: "m3",
    name: "Rizal Anwar",
    handle: "rizal",
    bio: "Bikin library autentikasi open source buat Next.js — pengen bikin auth jadi hal yang membosankan. Ship cepet, dokumentasi rapi.",
    interests: ["Systems Programming", "Rust", "Building in Public"],
    year: "Tingkat 4",
    major: "Rekayasa Perangkat Lunak",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
  },
  {
    id: "m4",
    name: "Dinda Pratiwi",
    handle: "dinda",
    bio: "Lagi bikin app keuangan pribadi buat mahasiswa — fokus ke kejelasan pengeluaran, bukan optimasi. Pemikir visual dengan opini UX kuat.",
    interests: ["Backend Development", "API Design", "Full-stack"],
    year: "Tingkat 2",
    major: "Informatika",
    skills: ["React", "Figma", "CSS", "TypeScript"],
  },
  {
    id: "m5",
    name: "Arya Kusuma",
    handle: "arya",
    bio: "Bikin app jadwal sholat dengan fitur komunitas spesifik masjid. Lebih suka tim kecil yang solid, ship dan iterasi cepet.",
    interests: ["Backend Architecture", "Cloud Infrastructure", "DevOps"],
    year: "Tingkat 3",
    major: "Informatika",
    skills: ["Flutter", "Firebase", "Dart", "Mobile"],
  },
];

export function firstName(name: string): string {
  return (name || "").split(" ")[0].toLowerCase();
}

export function cleanJSON(str: string): unknown {
  const s = str
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  try {
    return JSON.parse(s);
  } catch {
    const m = s.match(/[{[][\s\S]*[}\]]/);
    if (m) return JSON.parse(m[0]);
    throw new Error("JSON parse failed");
  }
}

export async function callClaude(
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const { text } = await aiComplete({ messages });
  return text;
}
