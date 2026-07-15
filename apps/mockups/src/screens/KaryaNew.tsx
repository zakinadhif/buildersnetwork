/**
 * Al-Fath Berkarya — Bikin Karya  ·  issue #104
 *
 * The hero's primary CTA target (`/karya/new`, `/karya/new/ai`). Now inside the
 * shared shell — same left rail as the surfaces it's launched from — so creating
 * a karya keeps the product frame. Two modes on the shared token scale: fill the
 * draft by hand, or let the assistant draft it from a chat — both landing in the
 * same publish path. The center column carries the form; the rail carries tips.
 */

import { useState } from "react";
import { T, eyebrow } from "@myapp/design-tokens";
import { Avatar } from "@myapp/ui";
import { Shell } from "../components/Shell";

const TIPS = [
  "Cover & tangkapan layar bikin karyamu lebih hidup di feed.",
  "Pilih tahap yang jujur — orang paham kamu lagi di mana.",
  "Tandai tahap “Cari Kolaborator” kalau lagi butuh tim.",
];

const STAGES = ["Ide", "Prototype", "MVP", "Beta", "Rilis", "Cari Kolaborator"];
const SUGGESTED = ["Web", "Mobile", "AI/ML", "Desain", "UMKM", "Edukasi", "Komunitas"];

// ─── Small field wrapper ─────────────────────────────────────────────────────
function Labelled({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
        <span style={eyebrow}>{label}</span>
        {hint && <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: T.surface,
  border: `1px solid ${T.line}`,
  borderRadius: T.radiusCard,
  padding: "11px 13px",
  fontFamily: T.fontBody,
  fontSize: T.size.body,
  color: T.ink,
  outline: "none",
};

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      style={{
        fontFamily: T.fontBody,
        fontSize: T.size.ui,
        padding: "6px 13px",
        borderRadius: 99,
        cursor: "pointer",
        border: `1px solid ${on ? T.accent : T.line}`,
        background: on ? T.accentTint : "transparent",
        color: on ? T.accent : T.ink2,
        fontWeight: on ? T.weight.medium : T.weight.regular,
      }}
    >
      {label}
    </button>
  );
}

// ─── Manual form ─────────────────────────────────────────────────────────────
function ManualForm({ onAi }: { onAi: () => void }) {
  const [stages, setStages] = useState<string[]>(["Prototype"]);
  const [tags, setTags] = useState<string[]>(["Web", "Komunitas"]);
  const toggle = (arr: string[], v: string, set: (x: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <>
      {/* AI shortcut */}
      <button
        type="button"
        onClick={onAi}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          textAlign: "left" as const,
          padding: "13px 16px",
          background: T.accentTint,
          border: `1px solid ${T.accentLine}`,
          borderRadius: T.radiusPanel,
          cursor: "pointer",
          marginBottom: 30,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 20, color: T.accent, lineHeight: 1 }}>✦</span>
        <span style={{ flex: 1, fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink }}>
          Males ngetik? <span style={{ color: T.accentMid, fontWeight: T.weight.medium }}>Biar AI yang nyusun dari obrolan.</span>
        </span>
        <span aria-hidden="true" style={{ color: T.accent }}>→</span>
      </button>

      <Labelled label="Cover" hint="opsional">
        <div style={{
          height: 120,
          border: `1.5px dashed ${T.lineDark}`,
          borderRadius: T.radiusPanel,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: T.ink3,
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          cursor: "pointer",
          background: T.surface,
        }}>
          <span aria-hidden="true" style={{ fontSize: 18 }}>⬆</span> Seret gambar atau pilih file
        </div>
      </Labelled>

      <Labelled label="Tangkapan layar" hint="landscape muncul di feed · potret di galeri detail">
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ width: 92, height: 68, border: `1px solid ${T.line}`, borderRadius: 10, background: T.surface }} />
          ))}
          <button type="button" style={{ width: 92, height: 68, border: `1.5px dashed ${T.lineDark}`, borderRadius: 10, background: "transparent", color: T.ink3, cursor: "pointer", fontFamily: T.fontBody, fontSize: T.size.micro }}>
            + tambah
          </button>
        </div>
      </Labelled>

      <Labelled label="Judul">
        <input style={inputStyle} defaultValue="Peta Kost" placeholder="Nama karya kamu" />
      </Labelled>

      <Labelled label="Deskripsi">
        <textarea
          rows={3}
          style={{ ...inputStyle, resize: "vertical" as const, lineHeight: T.lh.body }}
          defaultValue="Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif."
          placeholder="Ceritain karyanya dalam satu-dua kalimat."
        />
      </Labelled>

      <Labelled label="Tahap" hint="boleh lebih dari satu">
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
          {STAGES.map((s) => <Chip key={s} label={s} on={stages.includes(s)} onClick={() => toggle(stages, s, setStages)} />)}
        </div>
      </Labelled>

      <Labelled label="Minat / tag">
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
          {SUGGESTED.map((s) => <Chip key={s} label={s} on={tags.includes(s)} onClick={() => toggle(tags, s, setTags)} />)}
          <button type="button" style={{ fontFamily: T.fontBody, fontSize: T.size.ui, padding: "6px 13px", borderRadius: 99, border: `1px dashed ${T.lineDark}`, background: "transparent", color: T.ink3, cursor: "pointer" }}>
            + tag lain
          </button>
        </div>
      </Labelled>

      <div style={{ borderTop: `1px solid ${T.line}`, marginTop: 8, paddingTop: 22, display: "flex", justifyContent: "flex-end" }}>
        <button type="button" style={{ background: T.ink, color: T.bg, border: "none", borderRadius: T.radiusCard, padding: "12px 22px", fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.semibold, letterSpacing: T.track.heading, cursor: "pointer" }}>
          Terbitkan karya →
        </button>
      </div>
    </>
  );
}

// ─── AI mode ─────────────────────────────────────────────────────────────────
const CHAT: { role: "ai" | "user"; text: string }[] = [
  { role: "ai", text: "Ceritain aja karyanya — lagi bikin apa, buat siapa, udah sampai mana?" },
  { role: "user", text: "Aggregator kost area Telkom, ada ulasan dari penghuni. Udah jalan versi beta, lagi cari kolaborator." },
  { role: "ai", text: "Mantap. Aku susun jadi draft ya — kamu tinggal cek & terbitkan." },
];

function AiMode({ onManual }: { onManual: () => void }) {
  return (
    <>
      <button type="button" onClick={onManual} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2, marginBottom: 22 }}>
        ← Isi sendiri aja
      </button>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 18, marginBottom: 20 }}>
        {CHAT.map((m, i) =>
          m.role === "ai" ? (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span aria-hidden="true" style={{ fontSize: 18, color: T.accent, lineHeight: 1.2 }}>✦</span>
              <p style={{ margin: 0, fontFamily: T.fontMono, fontSize: T.size.body, color: T.ink, lineHeight: T.lh.body, whiteSpace: "pre-wrap" as const }}>{m.text}</p>
            </div>
          ) : (
            <p key={i} style={{ alignSelf: "flex-end", maxWidth: "76%", margin: 0, fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink, textAlign: "right" as const }}>{m.text}</p>
          ),
        )}
      </div>

      {/* Draft preview being filled */}
      <div style={{ background: T.surface, border: `1px solid ${T.accentLine}`, borderRadius: T.radiusPanel, padding: 16, marginBottom: 18 }}>
        <div style={{ ...eyebrow, color: T.accent, marginBottom: 10 }}>Draft otomatis</div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: T.size.title, color: T.ink, marginBottom: 4 }}>Peta Kost</div>
        <p style={{ margin: "0 0 10px", fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink2, lineHeight: T.lh.body }}>
          Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
          {["Beta", "Cari Kolaborator", "Web", "Komunitas"].map((t) => (
            <span key={t} style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink2, background: T.bg, border: `1px solid ${T.line}`, padding: "2px 8px", borderRadius: 99 }}>{t}</span>
          ))}
        </div>
        <button type="button" style={{ marginTop: 14, background: T.ink, color: T.bg, border: "none", borderRadius: T.radiusCard, padding: "9px 18px", fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.semibold, cursor: "pointer" }}>
          Cek &amp; terbitkan →
        </button>
      </div>

      {/* Input bar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
        <Avatar name="Zaki Nadhif" size={30} />
        <input placeholder="Balas asisten…" style={{ ...inputStyle, borderRadius: 99 }} />
      </div>
    </>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function KaryaNewScreen() {
  const [mode, setMode] = useState<"manual" | "ai">("manual");

  return (
    <Shell active="karya-new">
      {/* Form column */}
      <main className="bn-main" style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: "0 0 26px", fontFamily: T.fontDisplay, fontSize: T.size.display, fontWeight: T.weight.regular, letterSpacing: T.track.heading, lineHeight: T.lh.heading, color: T.ink }}>
          Bikin karya baru.
        </h1>

        {mode === "manual" ? <ManualForm onAi={() => setMode("ai")} /> : <AiMode onManual={() => setMode("manual")} />}
      </main>

      {/* Tips rail */}
      <aside className="bn-rail" style={{ width: 232, flexShrink: 0, position: "sticky" as const, top: 68 }}>
        <p style={{ ...eyebrow, marginBottom: 12 }}>Biar makin dilirik</p>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
          {TIPS.map((tip) => (
            <div key={tip} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
              <span aria-hidden="true" style={{ color: T.accent, lineHeight: T.lh.body }}>◆</span>
              <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2, lineHeight: T.lh.body }}>{tip}</p>
            </div>
          ))}
        </div>
      </aside>
    </Shell>
  );
}
