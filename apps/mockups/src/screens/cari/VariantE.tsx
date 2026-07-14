/**
 * Cari Kolaborator — Variant E · Wall
 *
 * A bulletin board of free-text asks. The first-person note is the visual hero;
 * a composer sits at the top, and the right rail filters by ask type.
 */

import { useState } from "react";
import { Avatar } from "../../components/Avatar";
import { Shell } from "../../components/Shell";
import { Tag } from "../../components/Tag";
import { ASKS, TOP_SKILLS, type Ask } from "../../data/asks";
import { LOOKING_FOR, type LookingFor } from "../../data/looking-for";
import { relativeTime } from "../../lib/format";
import { coverFor } from "../../lib/images";
import { T, eyebrow } from "@myapp/design-tokens";

/** This variant's wording for the three FR-29 categories. */
const BADGE_LABEL: Record<LookingFor, string> = {
  hackathon: "Tim Hackathon",
  project:   "Tim Project",
  gig:       "Talenta / Gig",
};

/** Shorter forms for the composer chips and filter rail. */
const SHORT_LABEL: Record<LookingFor, string> = {
  hackathon: "Hackathon",
  project:   "Project",
  gig:       "Talenta / Gig",
};

const BADGE_ICON: Record<LookingFor, string> = {
  hackathon: "⚡",
  project:   "◉",
  gig:       "◎",
};

type Filter = LookingFor | "Semua";

// ─── Type Chip — three badge types from the PRD ───────────────────────────────
function TypeChip({ type }: { type: LookingFor }) {
  // hackathon: solid terracotta (urgent, event-bound)
  // project:   near-black outline (substantive, longer-term)
  // gig:       tinted wash (casual, lighter commitment)
  const cfg = {
    hackathon: { bg: T.accent,      color: T.accentFg,  border: "none" },
    project:   { bg: "transparent", color: T.ink,       border: `1px solid ${T.lineDark}` },
    gig:       { bg: T.accentTint,  color: T.accentMid, border: `1px solid ${T.accentLine}` },
  }[type];

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      fontFamily: T.fontBody,
      fontSize: T.size.micro,
      fontWeight: T.weight.medium,
      letterSpacing: T.track.tag,
      padding: "2px 8px",
      borderRadius: "3px",
      backgroundColor: cfg.bg,
      color: cfg.color,
      border: cfg.border,
      whiteSpace: "nowrap" as const,
    }}>
      <span aria-hidden="true">{BADGE_ICON[type]}</span>
      {BADGE_LABEL[type]}
    </span>
  );
}

// ─── Karya Cover — small square thumbnail for karya-sourced asks ──────────────
function KaryaCover({ interests, size = 34 }: { interests: string[]; size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 9,
      overflow: "hidden",
      border: `1px solid ${T.line}`,
      flexShrink: 0,
    }}>
      <img
        src={coverFor(interests)}
        alt=""
        aria-hidden="true"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

// ─── Hackathon Banner — FR-29 event-scoped team-formation affordance ──────────
// Sits above the composer as an ambient awareness strip for the current hot event.
function HackathonBanner() {
  return (
    <section aria-label="Event hackathon aktif" style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "12px 16px",
      marginBottom: 16,
      background: T.accentTint,
      border: `1px solid ${T.accentLine}`,
      borderRadius: T.radiusPanel,
    }}>
      <span aria-hidden="true" style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>⚡</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink, marginBottom: 2 }}>
          Lagi rame:{" "}
          <span style={{ color: T.accent }}>GEMASTIK 2026</span>{" "}
          — pendaftaran tim terbuka sampai 12 Juli
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
          4 ajakan hackathon aktif · Kategori: Sistem Informasi, Kecerdasan Buatan, Keamanan Siber
        </div>
      </div>
      <button style={{
        flexShrink: 0,
        background: "transparent",
        color: T.accent,
        border: `1px solid ${T.accent}`,
        borderRadius: T.radiusCard,
        padding: "6px 14px",
        fontFamily: T.fontBody,
        fontSize: T.size.ui,
        fontWeight: T.weight.semibold,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
      }}>
        Cari Rekan →
      </button>
    </section>
  );
}

// ─── Composer — fake "Tulis ajakan…" posting box at the top of the board ──────
// Gives the wall a postable feel. Type chips are interactive; the input is not.
function Composer() {
  const [selectedType, setSelectedType] = useState<LookingFor | null>(null);

  return (
    <div style={{
      backgroundColor: T.surface,
      border: `1.5px solid ${T.lineDark}`,
      borderRadius: T.radiusPanel,
      padding: "14px 16px",
      marginBottom: 20,
    }}>
      {/* Input row */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <Avatar name="Zaki Nadhif" size={32} />
        <div style={{
          flex: 1,
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          color: T.ink3,
          backgroundColor: T.bg,
          border: `1px solid ${T.line}`,
          borderRadius: T.radiusCard,
          padding: "9px 12px",
          cursor: "text",
          lineHeight: T.lh.heading,
        }}>
          Tulis ajakan kamu — siapa atau apa yang lagi kamu cari?
        </div>
      </div>

      {/* Type selector + post button */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 42 }}>
        <span style={{ ...eyebrow, marginRight: 4 }}>Cari:</span>
        {LOOKING_FOR.map((type) => {
          const active = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(active ? null : type)}
              aria-pressed={active}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 99,
                border: `1px solid ${active ? T.accent : T.line}`,
                backgroundColor: active ? T.accentTint : "transparent",
                color: active ? T.accent : T.ink2,
                fontFamily: T.fontBody,
                fontSize: T.size.micro,
                fontWeight: active ? T.weight.medium : T.weight.regular,
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              <span aria-hidden="true">{BADGE_ICON[type]}</span>
              {SHORT_LABEL[type]}
            </button>
          );
        })}
        <button style={{
          marginLeft: "auto",
          backgroundColor: T.accent,
          color: T.accentFg,
          border: "none",
          borderRadius: T.radiusCard,
          padding: "6px 18px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.semibold,
          cursor: "pointer",
          whiteSpace: "nowrap" as const,
        }}>
          Posting
        </button>
      </div>
    </div>
  );
}

// ─── Ask Card — one bulletin post on the wall ──────────────────────────────────
// Layout: identity (avatar or karya cover) + type chip + timestamp in the header;
// the first-person note at stat-size as the visual hero; skill chips below; two
// action buttons at the bottom.
const PRIMARY_ACTION: Record<LookingFor, string> = {
  hackathon: "Gabung Tim",
  project:   "Bantu",
  gig:       "Saya Tertarik",
};

function AskCard({ ask }: { ask: Ask }) {
  return (
    <article style={{
      padding: "20px 0",
      borderBottom: `1px solid ${T.line}`,
    }}>
      {/* Header: identity left, type+time right */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 12,
      }}>
        {/* Identity block */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          {ask.from === "person"
            ? <Avatar name={ask.name!} size={34} />
            : <KaryaCover interests={ask.karyaInterests!} size={34} />
          }
          <div style={{ minWidth: 0 }}>
            {ask.from === "person" ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" as const }}>
                <span style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink }}>
                  {ask.name}
                </span>
                <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
                  {ask.handle}
                </span>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: T.fontDisplay, fontSize: T.size.body, fontWeight: T.weight.regular, color: T.ink, lineHeight: T.lh.heading }}>
                  {ask.karyaTitle}
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
                  {ask.karyaRoster}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Type chip + timestamp */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, paddingTop: 2 }}>
          <TypeChip type={ask.type} />
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
            {relativeTime(ask.hoursAgo)}
          </span>
        </div>
      </div>

      {/* Hero note — the free-text ask written in the community's voice */}
      <p style={{
        margin: "0 0 12px",
        fontFamily: T.fontBody,
        fontSize: T.size.stat,
        fontWeight: T.weight.regular,
        color: T.ink,
        lineHeight: T.lh.body,
      }}>
        {ask.note}
      </p>

      {/* Skills / open roles sought */}
      {ask.seeking.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          flexWrap: "wrap" as const,
          marginBottom: 14,
        }}>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, letterSpacing: T.track.tag, textTransform: "uppercase" as const }}>
            butuh:
          </span>
          {ask.seeking.map((s) => <Tag key={s} label={s} accent />)}
        </div>
      )}

      {/* Two inline connect actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{
          backgroundColor: T.accent,
          color: T.accentFg,
          border: "none",
          borderRadius: T.radiusCard,
          padding: "7px 18px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.semibold,
          cursor: "pointer",
          whiteSpace: "nowrap" as const,
        }}>
          {PRIMARY_ACTION[ask.type]}
        </button>
        <button style={{
          backgroundColor: "transparent",
          color: T.ink2,
          border: `1px solid ${T.line}`,
          borderRadius: T.radiusCard,
          padding: "7px 16px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.regular,
          cursor: "pointer",
          whiteSpace: "nowrap" as const,
        }}>
          Kirim Pesan
        </button>
      </div>
    </article>
  );
}

// ─── Bulletin Board — center column ───────────────────────────────────────────
function BulletinBoard({ filterType }: { filterType: Filter }) {
  const filtered = filterType === "Semua"
    ? ASKS
    : ASKS.filter((a) => a.type === filterType);

  return (
    <main className="bn-main" style={{
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column" as const,
    }}>
      {/* Page heading */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{
            margin: 0,
            fontFamily: T.fontDisplay,
            fontSize: T.size.display,
            fontWeight: T.weight.regular,
            letterSpacing: T.track.heading,
            color: T.ink,
          }}>
            Cari Kolaborator
          </h1>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3 }}>
            Siapa butuh siapa, tertulis di sini
          </span>
        </div>
      </div>

      {/* FR-29: hackathon event gesture */}
      <HackathonBanner />

      {/* Composer — invites posting an ask */}
      <Composer />

      {/* Wall of asks — reverse-chronological (ASKS array is already ordered) */}
      <div>
        <div style={{ ...eyebrow, marginBottom: 2 }}>
          {filtered.length} ajakan · terbaru dulu
        </div>
        {filtered.length === 0 ? (
          <div style={{
            fontFamily: T.fontBody,
            fontSize: T.size.body,
            color: T.ink3,
            padding: "40px 0",
            textAlign: "center" as const,
          }}>
            Belum ada ajakan untuk jenis ini — atau jadilah yang pertama 🙂
          </div>
        ) : (
          filtered.map((ask) => <AskCard key={ask.id} ask={ask} />)
        )}
      </div>
    </main>
  );
}

// ─── Filter Rail — right column ────────────────────────────────────────────────
// Filter by ask type + community pulse + top skills being sought.
function FilterRail({ filterType, onFilter }: {
  filterType: Filter;
  onFilter: (t: Filter) => void;
}) {
  const counts: Record<Filter, number> = {
    Semua:     ASKS.length,
    hackathon: ASKS.filter((a) => a.type === "hackathon").length,
    project:   ASKS.filter((a) => a.type === "project").length,
    gig:       ASKS.filter((a) => a.type === "gig").length,
  };

  const filterOpts: { key: Filter; icon: string; label: string }[] = [
    { key: "Semua", icon: "◐", label: "Semua" },
    ...LOOKING_FOR.map((b) => ({ key: b as Filter, icon: BADGE_ICON[b], label: SHORT_LABEL[b] })),
  ];

  return (
    <aside className="bn-rail" style={{
      width: 232,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column" as const,
      gap: 20,
    }}>
      {/* Filter by type */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusPanel,
        padding: "12px 14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Filter Ajakan</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
          {filterOpts.map(({ key, icon, label }) => {
            const active = filterType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onFilter(key)}
                aria-pressed={active}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "left" as const,
                  background: active ? T.accentTint : "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: T.fontBody,
                  fontSize: T.size.ui,
                  color: active ? T.accent : T.ink2,
                  fontWeight: active ? T.weight.medium : T.weight.regular,
                  padding: "5px 8px",
                  borderRadius: "4px",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span aria-hidden="true" style={{ fontSize: T.size.caption }}>{icon}</span>
                  {label}
                </span>
                <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: active ? T.accentMid : T.ink3 }}>
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Community pulse */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusPanel,
        padding: "12px 14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Denyut Papan</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {[
            { label: "Ajakan aktif", value: ASKS.length },
            { label: "Dari orang",   value: ASKS.filter((a) => a.from === "person").length },
            { label: "Dari karya",   value: ASKS.filter((a) => a.from === "karya").length },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>{stat.label}</span>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top skills currently sought — aggregated from ASKS data */}
      <div>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Paling Dicari</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 7 }}>
          {TOP_SKILLS.map(([skill, count]) => (
            <div key={skill} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2, flex: 1, minWidth: 0 }}>
                {skill}
              </span>
              {/* Proportional bar */}
              <div style={{
                height: 4,
                width: `${Math.max(8, Math.round((count / ASKS.length) * 64))}px`,
                backgroundColor: T.accentTint,
                border: `1px solid ${T.accentLine}`,
                borderRadius: 2,
                flexShrink: 0,
              }} />
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, minWidth: 10, textAlign: "right" as const }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA — mirrors Launchpad's right rail accent block */}
      <div style={{
        backgroundColor: T.accent,
        borderRadius: T.radiusPanel,
        padding: "14px 16px",
      }}>
        <div style={{
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          fontWeight: T.weight.light,
          color: T.accentFg,
          lineHeight: T.lh.compact,
          marginBottom: 10,
        }}>
          Punya ajakan? Tulis di papan — komunitas siap merespons.
        </div>
        <button style={{
          backgroundColor: T.accentFg,
          color: T.accent,
          border: "none",
          borderRadius: T.radiusCard,
          padding: "6px 14px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.semibold,
          cursor: "pointer",
          width: "100%",
        }}>
          Tulis Ajakan
        </button>
      </div>
    </aside>
  );
}

export default function VariantE() {
  const [filterType, setFilterType] = useState<Filter>("Semua");

  return (
    <Shell active="cari">
      <BulletinBoard filterType={filterType} />
      <FilterRail filterType={filterType} onFilter={setFilterType} />
    </Shell>
  );
}
