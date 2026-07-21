/**
 * Al-Fath Berkarya — Onboarding AI (opt-in)  ·  issue #107
 *
 * The opt-in assistant flow — Onboarding chat → Review → Matches, all in one
 * surface: a calm chat on the left, and a panel on the right that fills as the
 * conversation goes (what it captured, then who it'd introduce). Framed as opt-in,
 * never a gate: a "tutup" affordance and a "lewati" link. Shared token scale;
 * mirrors Launchpad's assistant on-ramp.
 */

import { Avatar, Tag } from "@myapp/ui";
import { MEMBERS } from "../data/karya";
import { Eyebrow } from "@myapp/ui";

const CHAT: { role: "ai" | "user"; text: string }[] = [
  { role: "ai", text: "Hai! Aku bantu kamu nemu arah di komunitas ini. Santai aja — nggak ada jawaban yang salah.\n\nLagi paling tertarik ke hal apa akhir-akhir ini?" },
  { role: "user", text: "Web development, dan aku suka hal-hal yang dampaknya ke komunitas." },
  { role: "ai", text: "Pas banget — di sini banyak karya sosial yang butuh orang web. Kamu ke sini lebih pengen belajar, bangun sesuatu sendiri, atau gabung tim yang udah jalan?" },
  { role: "user", text: "Pengen gabung tim dulu, sambil belajar dari yang lebih senior." },
  { role: "ai", text: "Sip, aku catat. Aku udah punya beberapa kenalan yang cocok buat kamu — lihat di sebelah kanan ya. Kalau udah pas, tinggal masuk." },
];

const CAPTURED = {
  minat: ["Web", "Komunitas", "Sosial"],
  arah: "Gabung tim sambil belajar",
};

export default function OnboardingScreen() {
  const matches = MEMBERS.filter((m) => m.interests.some((i) => CAPTURED.minat.includes(i)) || m.skills.includes("React")).slice(0, 2);

  return (
    <div className="min-h-screen bg-bg font-body">
      <div className="mx-auto flex max-w-[900px] items-start gap-8 px-6 pb-10 pt-6">
        {/* ── Chat column ── */}
        <div className="flex min-h-[calc(100vh-64px)] min-w-0 flex-1 flex-col">
          {/* Header */}
          <div className="mb-[22px] flex items-center gap-2.5 border-b border-line pb-[18px]">
            <span aria-hidden="true" className="font-display text-[22px] leading-none text-accent">✦</span>
            <div className="flex-1">
              <div className="font-body text-ui font-medium text-ink">Asisten Al-Fath</div>
              <div className="font-body text-micro text-ink3">Opsional — bisa kamu tutup kapan aja</div>
            </div>
            <button type="button" aria-label="Tutup" className="cursor-pointer border-none bg-none p-1 font-body text-title leading-none text-ink3">×</button>
          </div>

          {/* Transcript */}
          <div className="flex flex-1 flex-col gap-5">
            {CHAT.map((m, i) =>
              m.role === "ai" ? (
                <div key={i} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="shrink-0 text-[16px] leading-[1.4] text-accent">✦</span>
                  <p className="m-0 whitespace-pre-wrap font-mono text-body leading-body text-ink">{m.text}</p>
                </div>
              ) : (
                <p key={i} className="m-0 ml-auto max-w-[78%] text-right font-body text-body font-medium leading-body text-ink">{m.text}</p>
              ),
            )}
          </div>

          {/* Input bar */}
          <div className="mt-[22px] flex items-center gap-2.5 border-t border-line pt-4">
            <input
              placeholder="Tulis balasan…"
              className="flex-1 rounded-full border border-line bg-surface px-4 py-[11px] font-body text-body text-ink outline-none placeholder:text-ink3"
            />
            <button type="button" aria-label="Kirim" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-ink text-[16px] text-bg">↑</button>
          </div>
          <button type="button" className="mt-3 self-center border-none bg-none p-0 font-body text-micro text-ink3 cursor-pointer">
            Lewati dulu — aku jelajah sendiri
          </button>
        </div>

        {/* ── Review + Matches panel ── */}
        <aside className="flex w-[288px] shrink-0 flex-col gap-[18px] sticky top-6">
          {/* Captured (Review) */}
          <div className="rounded-panel border border-line bg-surface p-4">
            <Eyebrow as="div" className="mb-3">Yang kita tangkap</Eyebrow>
            <div className="mb-1 font-body text-micro text-ink3">Minat</div>
            <div className="mb-3.5 flex flex-wrap gap-[5px]">
              {CAPTURED.minat.map((i) => <Tag key={i} label={i} />)}
            </div>
            <div className="mb-1 font-body text-micro text-ink3">Arah</div>
            <div className="font-body text-body font-medium text-ink">{CAPTURED.arah}</div>
          </div>

          {/* Matches */}
          <div>
            <Eyebrow as="div" className="mb-3">Kenalan yang cocok</Eyebrow>
            <div className="flex flex-col gap-3">
              {matches.map((m) => (
                <div key={m.id} className="flex items-start gap-2.5">
                  <Avatar name={m.name} size={34} />
                  <div className="min-w-0">
                    <div className="font-body text-ui font-medium text-ink">{m.name}</div>
                    <div className="mb-[5px] font-body text-micro text-ink3">{m.handle} · Tkt {m.year}</div>
                    <div className="flex flex-wrap gap-1">
                      {m.skills.slice(0, 2).map((s) => <Tag key={s} label={s} accent />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="button" className="cursor-pointer rounded-card border-none bg-ink px-[18px] py-[11px] font-body text-ui font-semibold tracking-heading text-bg">
            Selesai &amp; masuk →
          </button>
        </aside>
      </div>
    </div>
  );
}
