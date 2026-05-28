import type { Member, MemberMatch } from "@myapp/api-client-react";
import { aiComplete } from "@myapp/api-client-react";

export type { Member, MemberMatch };

export const SEED_MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Hafiz Maulana",
    year: "Tingkat 2",
    major: "Informatika",
    skills: ["Go", "Rust", "Systems Programming", "Networking"],
    building:
      "Tool sinkronisasi file peer-to-peer — ringan, offline-first, ga butuh cloud sama sekali.",
    wants: "Distributed systems, WebAssembly, desain protokol.",
    vibe: "Kerja solo dulu, baru share. Full async. Mau pair kalau masalahnya beneran susah.",
  },
  {
    id: "m2",
    name: "Fatimah Zahra",
    year: "Tingkat 3",
    major: "Informatika",
    skills: ["Python", "Machine Learning", "FastAPI", "scikit-learn"],
    building:
      "Rekomendasi kuliner lokal berbasis ML — privacy-first, konteks Indonesia.",
    wants: "Deep learning, MLOps, inference pipeline yang scalable.",
    vibe: "Suka pair di masalah yang susah. Butuh kolaborator yang bisa adu argumen teknis.",
  },
  {
    id: "m3",
    name: "Rizal Anwar",
    year: "Tingkat 4",
    major: "Rekayasa Perangkat Lunak",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    building:
      "Library autentikasi open source buat Next.js — pengen bikin auth jadi hal yang membosankan.",
    wants: "Systems programming, Rust, building in public.",
    vibe: "Ship cepet, dokumentasi rapi. Full async dan transparan.",
  },
  {
    id: "m4",
    name: "Dinda Pratiwi",
    year: "Tingkat 2",
    major: "Informatika",
    skills: ["React", "Figma", "CSS", "TypeScript"],
    building:
      "App keuangan pribadi buat mahasiswa — fokus ke kejelasan pengeluaran, bukan optimasi.",
    wants: "Backend development, API, eventually full-stack.",
    vibe: "Pemikir visual dengan opini UX yang kuat. Suka build bareng orang yang peduli sama craft.",
  },
  {
    id: "m5",
    name: "Arya Kusuma",
    year: "Tingkat 3",
    major: "Informatika",
    skills: ["Flutter", "Firebase", "Dart", "Mobile"],
    building: "Jadwal sholat dengan fitur komunitas spesifik masjid.",
    wants: "Arsitektur backend, cloud infrastructure, DevOps.",
    vibe: "Lebih suka tim kecil yang solid. Ship dan iterasi cepet. Ga suka meeting yang ga perlu.",
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
