/**
 * Al-Fath Berkarya — Detail Karya  ·  issue #103
 *
 * The page every feed & featured card funnels into (`/karya/:id`). Now it lives
 * *inside* the shared shell — same left rail as the surfaces it's reached from —
 * rather than as a standalone page, so drilling into a karya keeps the product
 * frame. The center column is the reading surface (cover, roster, stages,
 * screenshot gallery, update stream); the sticky right rail carries the actions.
 *
 * A role toggle previews the owner affordances (tulis kabar, feature, kelola tim)
 * vs. the visitor's (gabung, apresiasi) — grounding #35's owner controls.
 *
 * The composer at the stream's head is the shared one now (components/Composer),
 * handed this karya. It replaces a local box that led with a person's avatar and
 * a textarea — "bagikan progres, milestone, atau minta bantuan…" — and which had
 * quietly drifted: it carried its own `Kind` vocabulary, offering "Milestone" and
 * "Butuh bantuan" where updates.ts said "tonggak" and "ajakan", with no "riset" at
 * all. Two composers, two vocabularies, and nothing forcing them to agree. The
 * `KIND` map below still displays the old names on the seeded stream, so it has
 * the same drift left in it.
 */

import { useState } from "react";
import { Avatar, Tag } from "@myapp/ui";
import { T, eyebrow } from "@myapp/design-tokens";
import { Composer } from "../components/Composer";
import { Shell } from "../components/Shell";
import { KARYA } from "../data/karya";
import { coverFor, screenshots } from "../lib/images";
import { relativeTime } from "../lib/format";

const KARYA_ITEM = KARYA[0]; // KampusKerja — featured, two-person roster

type Kind = "launch" | "milestone" | "progress" | "ask";
const KIND: Record<Kind, { label: string; tint: boolean }> = {
  launch: { label: "Rilis", tint: true },
  milestone: { label: "Milestone", tint: true },
  progress: { label: "Progres", tint: false },
  ask: { label: "Butuh bantuan", tint: false },
};

const POSTS: { id: number; author: string; kind: Kind; body: string; hoursAgo: number }[] = [
  { id: 1, author: "Arief Maulana", kind: "launch", body: "Beta terbuka udah live! Mahasiswa Telkom bisa daftar & lihat lowongan magang dari alumni. Makasih yang udah nyoba versi awal 🙏", hoursAgo: 5 },
  { id: 2, author: "Siti Rahmah", kind: "progress", body: "Rombak alur onboarding — sekarang cuma 2 langkah sebelum lihat lowongan pertama. Data awal: drop-off turun jauh.", hoursAgo: 22 },
  { id: 3, author: "Arief Maulana", kind: "ask", body: "Lagi cari 1 orang yang kuat di data scraping buat sinkronisasi lowongan otomatis. Kalau tertarik, colek ya.", hoursAgo: 50 },
];

// ─── Kind chip ───────────────────────────────────────────────────────────────
function KindChip({ kind }: { kind: Kind }) {
  const k = KIND[kind];
  return (
    <span style={{
      fontFamily: T.fontBody,
      fontSize: T.size.micro,
      fontWeight: T.weight.medium,
      letterSpacing: T.track.tag,
      textTransform: "uppercase" as const,
      color: k.tint ? T.accent : T.ink3,
      background: k.tint ? T.accentTint : "transparent",
      border: k.tint ? `1px solid ${T.accentLine}` : `1px solid ${T.line}`,
      borderRadius: 99,
      padding: "2px 9px",
    }}>
      {k.label}
    </span>
  );
}

// ─── Rail actions ────────────────────────────────────────────────────────────
// Full-width, stacked to fit the 232px rail — the same affordances the old
// standalone action bar carried, now sticky beside the reading column.
function RailActions({ owner, featured, onToggleFeatured }: {
  owner: boolean;
  featured: boolean;
  onToggleFeatured: () => void;
}) {
  const btn = (primary: boolean): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box" as const,
    textAlign: "center" as const,
    fontFamily: T.fontBody,
    fontSize: T.size.ui,
    fontWeight: T.weight.medium,
    padding: "9px 16px",
    borderRadius: T.radiusCard,
    cursor: "pointer",
    border: primary ? "none" : `1px solid ${T.line}`,
    background: primary ? T.ink : "transparent",
    color: primary ? T.bg : T.ink,
  });
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
      {owner ? (
        <>
          <button
            type="button"
            onClick={onToggleFeatured}
            aria-pressed={featured}
            style={{
              ...btn(false),
              borderColor: featured ? T.accent : T.line,
              color: featured ? T.accent : T.ink,
              background: featured ? T.accentTint : "transparent",
            }}
          >
            {featured ? "✦ Jadi unggulan" : "✦ Tandai unggulan"}
          </button>
          <button type="button" style={btn(false)}>Kelola tim</button>
          <button type="button" style={btn(false)}>Sunting</button>
        </>
      ) : (
        <>
          <button type="button" style={btn(true)}>Gabung karya →</button>
          <button type="button" style={btn(false)}>♡ Apresiasi · {KARYA_ITEM.appreciations}</button>
        </>
      )}
    </div>
  );
}

// ─── Role toggle (gallery affordance) ────────────────────────────────────────
function RoleToggle({ owner, onChange }: { owner: boolean; onChange: (owner: boolean) => void }) {
  return (
    <div style={{ display: "flex", gap: 2, padding: 3, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 99 }}>
      {([["owner", "Owner"], ["visitor", "Pengunjung"]] as const).map(([val, label]) => {
        const on = (val === "owner") === owner;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val === "owner")}
            aria-pressed={on}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 99,
              padding: "5px 12px",
              background: on ? T.ink : "transparent",
              color: on ? T.bg : T.ink2,
              fontFamily: T.fontBody,
              fontSize: T.size.micro,
              fontWeight: on ? T.weight.medium : T.weight.regular,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function KaryaDetailScreen() {
  const [owner, setOwner] = useState(true);
  const [featured, setFeatured] = useState(!!KARYA_ITEM.featured);
  const k = KARYA_ITEM;

  return (
    <Shell active="karya-detail">
      {/* Reading column */}
      <main className="bn-main" style={{ flex: 1, minWidth: 0 }}>
        {/* Back to the feed the card funnelled from */}
        <button type="button" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2, marginBottom: 20 }}>
          ← Balik
        </button>

        {/* Cover */}
        <img
          src={coverFor(k.interests)}
          alt={k.title}
          style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: T.radiusPanel, display: "block", border: `1px solid ${T.line}` }}
        />

        {/* Title block */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center", margin: "22px 0 10px" }}>
          {featured && <KindChip kind="launch" />}
          {k.stages.map((s) => <span key={s} style={eyebrow}>{s}</span>)}
        </div>
        <h1 style={{ margin: "0 0 12px", fontFamily: T.fontDisplay, fontSize: T.size.display, fontWeight: T.weight.regular, letterSpacing: T.track.heading, lineHeight: T.lh.heading, color: T.ink }}>
          {k.title}
        </h1>

        {/* Roster */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ display: "flex" }}>
            {k.roster.map((r, i) => (
              <span key={r.handle} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: k.roster.length - i }}>
                <Avatar name={r.name} size={30} />
              </span>
            ))}
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>
            {k.roster.map((r) => r.name).join(" · ")}
          </span>
        </div>

        <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink2, lineHeight: T.lh.body }}>
          {k.description}
        </p>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginTop: 14 }}>
          {k.interests.map((i) => <Tag key={i} label={i} />)}
        </div>

        {/* Screenshots */}
        <p style={{ ...eyebrow, margin: "34px 0 12px" }}>Tangkapan layar</p>
        <div style={{ display: "flex", gap: 12, overflowX: "auto" as const, paddingBottom: 6, scrollSnapType: "x mandatory" }}>
          {screenshots.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${k.title} — layar ${i + 1}`}
              style={{ height: 300, width: "auto", flexShrink: 0, borderRadius: 14, border: `1px solid ${T.line}`, scrollSnapAlign: "start", background: T.bg }}
            />
          ))}
        </div>

        {/* Update stream. The composer sits at its head, where the old one did:
            this stream is the karya's progress log, and writing a kabar is adding
            to it — the one place on this page where that reads as the same act.
            Handed this karya, so there is nothing to pick. */}
        <p style={{ ...eyebrow, margin: "34px 0 12px" }}>Update terbaru</p>
        {owner && (
          <div style={{ marginBottom: 20 }}>
            <Composer karya={KARYA_ITEM} />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" as const }}>
          {POSTS.map((p) => (
            <article key={p.id} style={{ padding: "16px 0", borderTop: `1px solid ${T.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Avatar name={p.author} size={28} />
                <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>{p.author}</span>
                <KindChip kind={p.kind} />
                <span style={{ marginLeft: "auto", fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>{relativeTime(p.hoursAgo)}</span>
              </div>
              <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink2, lineHeight: T.lh.body }}>{p.body}</p>
            </article>
          ))}
        </div>
      </main>

      {/* Action rail */}
      <aside className="bn-rail" style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
        {/* Role toggle — gallery affordance to preview both viewer states */}
        <RoleToggle owner={owner} onChange={setOwner} />

        <RailActions owner={owner} featured={featured} onToggleFeatured={() => setFeatured((f) => !f)} />

        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, paddingTop: 4, borderTop: `1px solid ${T.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12 }}>
            <span style={{ ...eyebrow }}>Tahap</span>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>{k.stages[k.stages.length - 1]}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ ...eyebrow }}>Tim</span>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>{k.roster.length} orang</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ ...eyebrow }}>Apresiasi</span>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.accentMid }}>♥ {k.appreciations}</span>
          </div>
        </div>
      </aside>
    </Shell>
  );
}
