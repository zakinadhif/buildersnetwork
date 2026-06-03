import type { AIProvider, CompleteOptions, Message } from "./index";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function realUserMessages(messages: Message[]) {
  return messages
    .filter((message) => message.role === "user")
    .filter(
      (message) =>
        !message.content.includes("Kamu adalah AI onboarding") &&
        !message.content.includes("Dari percakapan onboarding ini"),
    );
}

function latestUserText(messages: Message[]) {
  return realUserMessages(messages).at(-1)?.content.trim() ?? "";
}

function inferName(transcript: string) {
  const explicit = transcript.match(
    /(?:nama(?:ku| saya| aku)?|aku|saya)\s+([A-Za-z][A-Za-z .'/-]{1,40})/i,
  )?.[1];
  if (explicit) return explicit.trim().split(/\s+/).slice(0, 3).join(" ");

  const firstMemberLine = transcript.match(/^member:\s*(.+)$/im)?.[1]?.trim();
  if (!firstMemberLine) return "Member Al-Fath";
  const cleaned = firstMemberLine
    .replace(/^(halo|hai|hello|assalamualaikum|salam)\b[,\s]*/i, "")
    .trim();
  return cleaned.length > 1 && cleaned.length < 40 ? cleaned : "Member Al-Fath";
}

function inferSkills(transcript: string) {
  const known = [
    "react",
    "typescript",
    "javascript",
    "node",
    "next",
    "python",
    "fastapi",
    "go",
    "rust",
    "flutter",
    "firebase",
    "figma",
    "ui",
    "ux",
    "backend",
    "frontend",
    "fullstack",
    "machine learning",
    "ai",
    "data",
  ];
  const lower = transcript.toLowerCase();
  const found = known.filter((skill) => lower.includes(skill));
  return found.length > 0
    ? Array.from(new Set(found)).slice(0, 6)
    : ["belajar produk digital", "komunikasi", "eksplorasi teknologi"];
}

function profileFromPrompt(prompt: string) {
  const transcript = prompt.split("Percakapan:").at(-1) ?? prompt;
  const name = inferName(transcript);
  const skills = inferSkills(transcript);

  return JSON.stringify(
    {
      name,
      year: /tingkat\s*\d/i.exec(transcript)?.[0] ?? "Tingkat belum diisi",
      major:
        /(informatika|rekayasa perangkat lunak|sistem informasi|data science)/i.exec(
          transcript,
        )?.[0] ?? "Informatika",
      skills,
      building:
        "lagi mulai merapikan ide dan pengalaman build dari proses onboarding lokal.",
      wants:
        "pengen ketemu teman build yang bisa saling dorong, sharing, dan ship bareng.",
      vibe: "hangat, eksploratif, dan nyaman diskusi teknis secara bertahap.",
    },
    null,
    2,
  );
}

function matchesFromPrompt(prompt: string) {
  const userSkills = (prompt.match(/^Skills:\s*(.+)$/m)?.[1] ?? "")
    .split(",")
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
  const members = Array.from(
    prompt.matchAll(/^\[([^\]]+)\]\s+(.+?):\s+(.+)$/gm),
  ).map((match) => ({
    id: match[1],
    name: match[2].replace(/\s+\([^)]+\)$/, "").trim(),
    text: match[3].toLowerCase(),
  }));

  const selected = members
    .map((member) => ({
      ...member,
      score: userSkills.filter((skill) => member.text.includes(skill)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const fallback = [
    {
      id: "seed_m3",
      name: "Rizal Anwar",
      text: "react typescript node backend",
    },
    {
      id: "seed_m4",
      name: "Dinda Pratiwi",
      text: "react figma ux frontend",
    },
    {
      id: "seed_m1",
      name: "Hafiz Maulana",
      text: "systems go rust networking",
    },
  ];
  const picks = selected.length > 0 ? selected : fallback;

  return JSON.stringify(
    picks.map((member) => ({
      memberId: member.id,
      reason: `${member.name} cocok buat diajak ngobrol karena ada irisan arah build dan skill yang bisa saling ngisi. Mulai dari sharing progress kecil dulu bakal cukup natural sebelum lanjut kolaborasi.`,
    })),
    null,
    2,
  );
}

function discoveryFromPrompt(prompt: string) {
  const question = prompt.match(/^Pertanyaan:\s*"(.+)"$/m)?.[1] ?? "";
  const members = Array.from(
    prompt.matchAll(
      /^(.+?)\s+\(([^,]+),\s*([^)]+)\)\nSkills:\s*(.+)\nLagi bikin:\s*(.+)\nPengen:\s*(.+)\nVibe:\s*(.+)$/gm,
    ),
  ).map((match) => ({
    name: match[1],
    year: match[2],
    major: match[3],
    skills: match[4],
    building: match[5],
    wants: match[6],
    vibe: match[7],
    text: match.slice(1).join(" ").toLowerCase(),
  }));
  const terms = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);
  const selected = members
    .map((member) => ({
      ...member,
      score: terms.filter((term) => member.text.includes(term)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const picks = selected.length > 0 ? selected : members.slice(0, 3);

  if (picks.length === 0) {
    return "belum ada anggota yang kebaca di direktori lokal sekarang.";
  }

  return picks
    .map(
      (member) =>
        `${member.name} bisa kamu cek. Skill-nya ${member.skills.toLowerCase()}, dan sekarang ${member.building.toLowerCase()}`,
    )
    .join("\n\n");
}

function onboardingReply(messages: Message[]) {
  const userMessages = realUserMessages(messages);
  const latest = latestUserText(messages).toLowerCase();
  const step = userMessages.length;

  if (step <= 1 && /^(halo|hai|hello|assalamualaikum|salam)\b/.test(latest)) {
    return "halo juga. boleh kasih nama kamu dulu?";
  }

  const replies = [
    "sip, aku catat. kamu sekarang tingkat berapa dan jurusannya apa?",
    "keren. skill teknis yang paling sering kamu pakai akhir-akhir ini apa?",
    "pernah bikin apa pakai skill itu? ceritain satu project yang paling kamu inget.",
    "bagian mana dari project itu yang paling kamu kerjain sendiri?",
    "sekarang lagi pengen bangun atau pelajari apa?",
    "kalau kolaborasi, kamu lebih nyaman gaya kerja yang kayak gimana?",
    "ada tipe teman build yang lagi kamu cari banget?",
    "oke, biar aku susun profil kamu sekarang.",
  ];

  return replies[Math.min(Math.max(step - 1, 0), replies.length - 1)];
}

export function createDevAI(): AIProvider {
  return {
    async complete(messages: Message[], _opts: CompleteOptions = {}) {
      const prompt = messages.at(-1)?.content ?? "";
      if (prompt.includes("Dari percakapan onboarding ini")) {
        return { text: profileFromPrompt(prompt) };
      }
      if (prompt.includes("Pilih 3 anggota") || prompt.includes("memberId")) {
        return { text: matchesFromPrompt(prompt) };
      }
      if (
        prompt.includes("AI discovery") ||
        prompt.includes("Direktori anggota")
      ) {
        return { text: discoveryFromPrompt(prompt) };
      }
      return { text: onboardingReply(messages) };
    },

    async *stream(messages: Message[], _opts: CompleteOptions = {}) {
      const reply = onboardingReply(messages);
      const words = reply.split(/(\s+)/);
      for (const word of words) {
        await wait(12);
        yield word;
      }
    },
  };
}
