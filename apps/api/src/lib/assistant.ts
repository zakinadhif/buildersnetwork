import type { AssistantAction, AssistantIntent } from "@myapp/db/schema";
import { tool, type UIMessage } from "ai";
import { z } from "zod";

const BASE = `Kamu adalah Asisten AI Al-Fath Berkarya, komunitas builder mahasiswa Telkom University. Jawab dalam bahasa Indonesia yang hangat, santai, dan langsung. Pakai kamu/aku. Jangan mengarang fakta tentang anggota atau komunitas. Satu pertanyaan per pesan. Semua perubahan produk harus menjadi draft untuk ditinjau pengguna; jangan pernah mengklaim sudah menyimpan atau menerbitkan sesuatu.`;

const PROMPTS: Record<AssistantIntent, string> = {
  general: `${BASE}

Bantu anggota berpikir, menulis, meriset, atau menentukan langkah berikutnya. Kalau mereka ingin mengubah profil atau membuat karya, sarankan membuka percakapan khusus agar hasilnya bisa menjadi draft terstruktur.`,
  profile: `${BASE}

Tujuan percakapan ini adalah merapikan atau melengkapi profil anggota. Gali hanya informasi yang ingin mereka ubah: nama, handle, bio, angkatan, jurusan, skills, dan interests. Pertahankan informasi lama yang masih benar. Setelah 5-8 pertukaran dan informasi yang dibutuhkan cukup, panggil tool draftProfile. Kosongkan field yang tidak dibahas dan jangan mengarang.`,
  karya: `${BASE}

Tujuan percakapan ini adalah menyusun draft karya baru. Gali judul, deskripsi singkat, tahap (idea, validating, building, shipped, paused), dan interest/tag. Setelah 4-6 pertukaran dan semua bagian cukup, panggil tool draftKarya. Jangan mengarang bagian yang belum dibahas.`,
};

const profileDraftSchema = z.object({
  name: z.string(),
  handle: z.string(),
  bio: z.string(),
  year: z.string(),
  major: z.string(),
  skills: z.array(z.string()),
  interests: z.array(z.string()),
});

const karyaDraftSchema = z.object({
  title: z.string(),
  description: z.string(),
  stages: z.array(
    z.enum(["idea", "validating", "building", "shipped", "paused"]),
  ),
  interests: z.array(z.string()),
});

export const assistantTools = {
  draftProfile: tool({
    description:
      "Siapkan draft perubahan profil ketika informasi dari pengguna sudah cukup. Tool ini hanya membuat draft untuk ditinjau dan tidak menyimpan perubahan.",
    inputSchema: profileDraftSchema,
    execute: async (draft) => draft,
  }),
  draftKarya: tool({
    description:
      "Siapkan draft karya baru ketika judul, deskripsi, tahap, dan tag sudah cukup. Tool ini hanya membuat draft untuk ditinjau dan tidak menerbitkan karya.",
    inputSchema: karyaDraftSchema,
    execute: async (draft) => draft,
  }),
};

export const activeAssistantTools = (
  intent: AssistantIntent,
): Array<keyof typeof assistantTools> => {
  if (intent === "profile") return ["draftProfile"];
  if (intent === "karya") return ["draftKarya"];
  return [];
};

export const assistantIntro = (intent: AssistantIntent, firstName: string) => {
  if (intent === "profile") {
    return `hei ${firstName} — bagian mana dari profilmu yang pengen dirapiin atau ditambahin?`;
  }
  if (intent === "karya") {
    return "ceritain karya yang mau kamu bikin — mulai dari namanya atau masalah yang pengen kamu pecahkan.";
  }
  return `hei ${firstName} — apa yang ingin kamu kerjakan bareng aku?`;
};

export const defaultAssistantTitle = (intent: AssistantIntent) => {
  if (intent === "profile") return "Perjelas profil saya";
  if (intent === "karya") return "Buat karya baru";
  return "Percakapan baru";
};

export const assistantPrompt = (intent: AssistantIntent): string =>
  PROMPTS[intent];

export function assistantTitleFrom(content: string): string {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= 58) return compact;
  return `${compact.slice(0, 57).trimEnd()}…`;
}

export function textFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function actionFromUIMessage(
  message: UIMessage,
): AssistantAction | null {
  for (const part of message.parts) {
    if (
      part.type === "tool-draftProfile" &&
      part.state === "output-available"
    ) {
      const parsed = profileDraftSchema.safeParse(part.output);
      if (parsed.success) {
        return { type: "profile_draft", payload: parsed.data };
      }
    }
    if (part.type === "tool-draftKarya" && part.state === "output-available") {
      const parsed = karyaDraftSchema.safeParse(part.output);
      if (parsed.success) {
        return { type: "karya_draft", payload: parsed.data };
      }
    }
  }
  return null;
}
