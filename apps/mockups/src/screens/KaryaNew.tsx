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
import { Avatar, MainColumn, RailColumn, cn } from "@myapp/ui";
import { Shell } from "../components/Shell";

const TIPS = [
  "Cover & tangkapan layar bikin karyamu lebih hidup di feed.",
  "Pilih tahap yang jujur — orang paham kamu lagi di mana.",
  "Tandai tahap \"Cari Kolaborator\" kalau lagi butuh tim.",
];

const STAGES = ["Ide", "Prototype", "MVP", "Beta", "Rilis", "Cari Kolaborator"];
const SUGGESTED = ["Web", "Mobile", "AI/ML", "Desain", "UMKM", "Edukasi", "Komunitas"];

// ─── Small field wrapper ─────────────────────────────────────────────────────
function Labelled({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-[22px]">
      <div className="mb-2 flex items-baseline gap-2.5">
        <span className="text-micro font-medium tracking-eyebrow uppercase text-ink3">{label}</span>
        {hint && <span className="font-body text-micro text-ink3">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-card border border-line bg-surface px-[13px] py-[11px] font-body text-body text-ink outline-none placeholder:text-ink3";

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "cursor-pointer rounded-full border px-[13px] py-1.5 font-body text-ui",
        on
          ? "border-accent bg-accent-tint text-accent font-medium"
          : "border-line bg-transparent text-ink2 font-normal",
      )}
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
        className="mb-[30px] flex w-full cursor-pointer items-center gap-3 rounded-panel border border-accent-line bg-accent-tint px-4 py-[13px] text-left"
      >
        <span aria-hidden="true" className="text-[20px] leading-none text-accent">✦</span>
        <span className="flex-1 font-body text-ui text-ink">
          Males ngetik? <span className="font-medium text-accent-mid">Biar AI yang nyusun dari obrolan.</span>
        </span>
        <span aria-hidden="true" className="text-accent">→</span>
      </button>

      <Labelled label="Cover" hint="opsional">
        <div className="flex h-[120px] cursor-pointer items-center justify-center gap-2 rounded-panel border-[1.5px] border-dashed border-line-dark bg-surface font-body text-ui text-ink3">
          <span aria-hidden="true" className="text-[18px]">⬆</span> Seret gambar atau pilih file
        </div>
      </Labelled>

      <Labelled label="Tangkapan layar" hint="landscape muncul di feed · potret di galeri detail">
        <div className="flex gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-[68px] w-[92px] rounded-[10px] border border-line bg-surface" />
          ))}
          <button type="button" className="h-[68px] w-[92px] cursor-pointer rounded-[10px] border-[1.5px] border-dashed border-line-dark bg-transparent font-body text-micro text-ink3">
            + tambah
          </button>
        </div>
      </Labelled>

      <Labelled label="Judul">
        <input className={inputCls} defaultValue="Peta Kost" placeholder="Nama karya kamu" />
      </Labelled>

      <Labelled label="Deskripsi">
        <textarea
          rows={3}
          className={`${inputCls} resize-y leading-body`}
          defaultValue="Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif."
          placeholder="Ceritain karyanya dalam satu-dua kalimat."
        />
      </Labelled>

      <Labelled label="Tahap" hint="boleh lebih dari satu">
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => <Chip key={s} label={s} on={stages.includes(s)} onClick={() => toggle(stages, s, setStages)} />)}
        </div>
      </Labelled>

      <Labelled label="Minat / tag">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((s) => <Chip key={s} label={s} on={tags.includes(s)} onClick={() => toggle(tags, s, setTags)} />)}
          <button type="button" className="cursor-pointer rounded-full border border-dashed border-line-dark bg-transparent px-[13px] py-1.5 font-body text-ui text-ink3">
            + tag lain
          </button>
        </div>
      </Labelled>

      <div className="mt-2 flex justify-end border-t border-line pt-[22px]">
        <button type="button" className="cursor-pointer rounded-card border-none bg-ink px-[22px] py-3 font-body text-ui font-semibold tracking-heading text-bg">
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
      <button type="button" onClick={onManual} className="mb-[22px] cursor-pointer border-none bg-none p-0 font-body text-ui text-ink2">
        ← Isi sendiri aja
      </button>

      <div className="mb-5 flex flex-col gap-[18px]">
        {CHAT.map((m, i) =>
          m.role === "ai" ? (
            <div key={i} className="flex items-start gap-2.5">
              <span aria-hidden="true" className="text-[18px] leading-[1.2] text-accent">✦</span>
              <p className="m-0 whitespace-pre-wrap font-mono text-body leading-body text-ink">{m.text}</p>
            </div>
          ) : (
            <p key={i} className="m-0 ml-auto max-w-[76%] text-right font-body text-body font-medium text-ink">{m.text}</p>
          ),
        )}
      </div>

      {/* Draft preview being filled */}
      <div className="mb-[18px] rounded-panel border border-accent-line bg-surface p-4">
        <div className="text-micro font-medium tracking-eyebrow uppercase text-ink3 mb-2.5 !text-accent">Draft otomatis</div>
        <div className="mb-1 font-display text-title text-ink">Peta Kost</div>
        <p className="mb-2.5 mt-0 font-body text-caption leading-body text-ink2">
          Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {["Beta", "Cari Kolaborator", "Web", "Komunitas"].map((t) => (
            <span key={t} className="rounded-full border border-line bg-bg px-2 py-[2px] font-body text-micro text-ink2">{t}</span>
          ))}
        </div>
        <button type="button" className="mt-3.5 cursor-pointer rounded-card border-none bg-ink px-[18px] py-[9px] font-body text-ui font-semibold text-bg">
          Cek &amp; terbitkan →
        </button>
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2.5 border-t border-line pt-4">
        <Avatar name="Zaki Nadhif" size={30} />
        <input placeholder="Balas asisten…" className={`${inputCls} rounded-full`} />
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
      <MainColumn>
        <h1 className="mb-[26px] mt-0 font-display text-display font-normal tracking-heading leading-heading text-ink">
          Bikin karya baru.
        </h1>

        {mode === "manual" ? <ManualForm onAi={() => setMode("ai")} /> : <AiMode onManual={() => setMode("manual")} />}
      </MainColumn>

      {/* Tips rail */}
      <RailColumn>
        <p className="text-micro font-medium tracking-eyebrow uppercase text-ink3 mb-3">Biar makin dilirik</p>
        <div className="flex flex-col gap-3.5">
          {TIPS.map((tip) => (
            <div key={tip} className="flex items-start gap-[9px]">
              <span aria-hidden="true" className="leading-body text-accent">◆</span>
              <p className="m-0 font-body text-ui leading-body text-ink2">{tip}</p>
            </div>
          ))}
        </div>
      </RailColumn>
    </Shell>
  );
}
