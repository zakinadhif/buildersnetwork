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
import { T, eyebrow } from "@myapp/design-tokens";
import { MEMBERS } from "../data/karya";

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
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.fontBody }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 40px", display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* ── Chat column ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const, minHeight: "calc(100vh - 64px)" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 18, marginBottom: 22, borderBottom: `1px solid ${T.line}` }}>
            <span aria-hidden="true" style={{ fontFamily: T.fontDisplay, fontSize: 22, color: T.accent, lineHeight: 1 }}>✦</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>Asisten Al-Fath</div>
              <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>Opsional — bisa kamu tutup kapan aja</div>
            </div>
            <button type="button" aria-label="Tutup" style={{ background: "none", border: "none", cursor: "pointer", color: T.ink3, fontSize: T.size.title, lineHeight: 1, padding: 4 }}>×</button>
          </div>

          {/* Transcript */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 20, flex: 1 }}>
            {CHAT.map((m, i) =>
              m.role === "ai" ? (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span aria-hidden="true" style={{ fontSize: 16, color: T.accent, lineHeight: 1.4, flexShrink: 0 }}>✦</span>
                  <p style={{ margin: 0, fontFamily: T.fontMono, fontSize: T.size.body, color: T.ink, lineHeight: T.lh.body, whiteSpace: "pre-wrap" as const }}>{m.text}</p>
                </div>
              ) : (
                <p key={i} style={{ alignSelf: "flex-end", maxWidth: "78%", margin: 0, fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink, textAlign: "right" as const, lineHeight: T.lh.body }}>{m.text}</p>
              ),
            )}
          </div>

          {/* Input bar */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", borderTop: `1px solid ${T.line}`, paddingTop: 16, marginTop: 22 }}>
            <input
              placeholder="Tulis balasan…"
              style={{ flex: 1, boxSizing: "border-box" as const, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 99, padding: "11px 16px", fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink, outline: "none" }}
            />
            <button type="button" aria-label="Kirim" style={{ background: T.ink, color: T.bg, border: "none", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", fontSize: 16, flexShrink: 0 }}>↑</button>
          </div>
          <button type="button" style={{ alignSelf: "center", marginTop: 12, background: "none", border: "none", cursor: "pointer", fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
            Lewati dulu — aku jelajah sendiri
          </button>
        </div>

        {/* ── Review + Matches panel ── */}
        <aside style={{ width: 288, flexShrink: 0, position: "sticky" as const, top: 24, display: "flex", flexDirection: "column" as const, gap: 18 }}>
          {/* Captured (Review) */}
          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.radiusPanel, padding: 16 }}>
            <div style={{ ...eyebrow, marginBottom: 12 }}>Yang kita tangkap</div>
            <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginBottom: 4 }}>Minat</div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginBottom: 14 }}>
              {CAPTURED.minat.map((i) => <Tag key={i} label={i} />)}
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginBottom: 4 }}>Arah</div>
            <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink, fontWeight: T.weight.medium }}>{CAPTURED.arah}</div>
          </div>

          {/* Matches */}
          <div>
            <div style={{ ...eyebrow, marginBottom: 12 }}>Kenalan yang cocok</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {matches.map((m) => (
                <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Avatar name={m.name} size={34} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>{m.name}</div>
                    <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginBottom: 5 }}>{m.handle} · Tkt {m.year}</div>
                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
                      {m.skills.slice(0, 2).map((s) => <Tag key={s} label={s} accent />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="button" style={{ background: T.ink, color: T.bg, border: "none", borderRadius: T.radiusCard, padding: "11px 18px", fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.semibold, letterSpacing: T.track.heading, cursor: "pointer" }}>
            Selesai &amp; masuk →
          </button>
        </aside>
      </div>
    </div>
  );
}
