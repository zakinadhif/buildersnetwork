/**
 * Al-Fath Berkarya — Detail Karya  ·  issue #103
 *
 * The page every feed & featured card funnels into (`/karya/:id`). A calm reading
 * surface on the shared token scale: cover, roster, stages, screenshot gallery,
 * and the update stream (events that point back at this karya, per the content
 * model). A role toggle previews the owner affordances (feature, kelola tim,
 * composer) vs. the visitor's (gabung, apresiasi) — grounding #35's owner controls.
 */

import { useState } from "react";
import { Avatar, Tag } from "@myapp/ui";
import { T, eyebrow } from "@myapp/design-tokens";
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

// ─── Action bar ──────────────────────────────────────────────────────────────
function ActionBar({ owner, featured, onToggleFeatured }: {
  owner: boolean;
  featured: boolean;
  onToggleFeatured: () => void;
}) {
  const btn = (primary: boolean): React.CSSProperties => ({
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
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const, marginTop: 22 }}>
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
          <button type="button" style={btn(false)}>♡ {KARYA_ITEM.appreciations}</button>
        </>
      )}
    </div>
  );
}

// ─── Composer (owner / member) ───────────────────────────────────────────────
function Composer() {
  const [kind, setKind] = useState<Kind>("progress");
  return (
    <div style={{
      display: "flex",
      gap: 12,
      padding: "14px 16px",
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: T.radiusPanel,
      marginBottom: 20,
    }}>
      <Avatar name="Arief Maulana" size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <textarea
          placeholder="Bagikan progres, milestone, atau minta bantuan…"
          rows={2}
          style={{
            width: "100%",
            boxSizing: "border-box" as const,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none" as const,
            fontFamily: T.fontBody,
            fontSize: T.size.body,
            color: T.ink,
            lineHeight: T.lh.body,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" as const }}>
          {(Object.keys(KIND) as Kind[]).map((k) => {
            const on = k === kind;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={on}
                style={{
                  fontFamily: T.fontBody,
                  fontSize: T.size.micro,
                  padding: "3px 10px",
                  borderRadius: 99,
                  cursor: "pointer",
                  border: `1px solid ${on ? T.accent : T.line}`,
                  background: on ? T.accentTint : "transparent",
                  color: on ? T.accent : T.ink2,
                }}
              >
                {KIND[k].label}
              </button>
            );
          })}
          <button
            type="button"
            style={{
              marginLeft: "auto",
              fontFamily: T.fontBody,
              fontSize: T.size.ui,
              fontWeight: T.weight.semibold,
              padding: "7px 16px",
              borderRadius: T.radiusCard,
              border: "none",
              background: T.ink,
              color: T.bg,
              cursor: "pointer",
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function KaryaDetailScreen() {
  const [owner, setOwner] = useState(true);
  const [featured, setFeatured] = useState(!!KARYA_ITEM.featured);
  const k = KARYA_ITEM;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.fontBody }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 24px 80px" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button type="button" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>
            ← Balik
          </button>
          {/* Role toggle — gallery affordance to preview both viewer states */}
          <div style={{ display: "flex", gap: 2, padding: 3, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 99 }}>
            {([["owner", "Owner"], ["visitor", "Pengunjung"]] as const).map(([val, label]) => {
              const on = (val === "owner") === owner;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setOwner(val === "owner")}
                  aria-pressed={on}
                  style={{
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
        </div>

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

        <ActionBar owner={owner} featured={featured} onToggleFeatured={() => setFeatured((f) => !f)} />

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

        {/* Update stream */}
        <p style={{ ...eyebrow, margin: "34px 0 12px" }}>Update terbaru</p>
        {owner && <Composer />}
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
      </div>
    </div>
  );
}
