/**
 * Cari Kolaborator — Variant B · Intent
 *
 * One board, sectioned by *intent* rather than by entity type. Each section
 * interleaves person cards and karya cards so both share every row of the grid.
 */

import { useState } from "react";
import { Avatar } from "@myapp/ui";
import { NavFilterList } from "../../components/LeftNav";
import { Shell } from "../../components/Shell";
import { Tag } from "@myapp/ui";
import {
  HACKATHON_EVENT,
  KARYA_SEEKERS,
  PEOPLE_SEEKERS,
  type KaryaSeeker,
  type PersonSeeker,
} from "../../data/intent";
import { LOOKING_FOR, type LookingFor } from "../../data/looking-for";
import { coverFor } from "../../lib/images";
import { T, eyebrow } from "@myapp/design-tokens";

/** This variant's wording for the three FR-29 categories. */
const BADGE_LABEL: Record<LookingFor, string> = {
  hackathon: "Tim Hackathon",
  project:   "Tim Project",
  gig:       "Talenta/Gig",
};

const BADGE_ICON: Record<LookingFor, string> = {
  hackathon: "◈",
  project:   "◉",
  gig:       "◇",
};

type Section = LookingFor | "Semua";

// ─── Badge Pill ───────────────────────────────────────────────────────────────
// Three visual weights: hackathon = solid accent (urgent), project = tinted,
// gig = ghost (lowest friction). All within the existing T token set.
function BadgePill({ badge }: { badge: LookingFor }) {
  const bg     = badge === "hackathon" ? T.accent
                : badge === "project"   ? T.accentTint
                : "transparent";
  const fg     = badge === "hackathon" ? T.accentFg
                : badge === "project"   ? T.accent
                : T.ink2;
  const border = badge === "hackathon" ? T.accent
                : badge === "project"   ? T.accentLine
                : T.lineDark;

  return (
    <span style={{
      display: "inline-block",
      fontFamily: T.fontBody,
      fontSize: T.size.micro,
      letterSpacing: T.track.tag,
      padding: "2px 8px",
      borderRadius: "99px",
      fontWeight: T.weight.medium,
      whiteSpace: "nowrap" as const,
      backgroundColor: bg,
      color: fg,
      border: `1px solid ${border}`,
    }}>
      {BADGE_LABEL[badge]}
    </span>
  );
}

// Inline action button — two variants: primary (filled) and ghost (outline).
function ActionBtn({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <button style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "5px 12px",
      border: `1px solid ${primary ? T.accent : T.line}`,
      borderRadius: 99,
      backgroundColor: primary ? T.accent : "transparent",
      color: primary ? T.accentFg : T.ink2,
      cursor: "pointer",
      fontFamily: T.fontBody,
      fontSize: T.size.caption,
      fontWeight: T.weight.medium,
      transition: "all 0.15s",
      whiteSpace: "nowrap" as const,
    }}>
      {label}
    </button>
  );
}

// ─── Hackathon Event Banner (FR-29) ───────────────────────────────────────────
// Event-scoped team-formation affordance. Heads the hackathon section.
function HackathonBanner() {
  return (
    <div style={{
      background: T.accentTint,
      border: `1px solid ${T.accentLine}`,
      borderRadius: T.radiusPanel,
      padding: "14px 18px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 16,
    }}>
      <div aria-hidden="true" style={{
        fontFamily: T.fontDisplay,
        fontSize: 28,
        color: T.accent,
        lineHeight: 1,
        flexShrink: 0,
      }}>◈</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 3 }}>
          <span style={{
            fontFamily: T.fontDisplay,
            fontSize: T.size.title,
            fontWeight: T.weight.regular,
            color: T.ink,
            lineHeight: T.lh.heading,
          }}>{HACKATHON_EVENT.name}</span>
          <span style={{ ...eyebrow, color: T.accentMid }}>lagi bentuk tim</span>
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink2, lineHeight: T.lh.compact }}>
          {HACKATHON_EVENT.theme} ·{" "}
          <span style={{ color: T.accentMid, fontWeight: T.weight.medium }}>
            {HACKATHON_EVENT.teamsForming} tim
          </span>{" "}
          sedang terbentuk · Deadline{" "}
          <span style={{ color: T.ink, fontWeight: T.weight.medium }}>
            {HACKATHON_EVENT.deadline}
          </span>
        </div>
      </div>
      <button style={{
        flexShrink: 0,
        background: T.accent,
        color: T.accentFg,
        border: "none",
        borderRadius: T.radiusCard,
        padding: "7px 14px",
        fontFamily: T.fontBody,
        fontSize: T.size.ui,
        fontWeight: T.weight.semibold,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
      }}>
        Cari Tim →
      </button>
    </div>
  );
}

// ─── Person Seeker Card ───────────────────────────────────────────────────────
function PersonSeekerCard({ person }: { person: PersonSeeker }) {
  return (
    <article style={{
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: T.radiusPanel,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column" as const,
      gap: 10,
    }}>
      {/* Header: avatar + name + badge */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar name={person.name} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const, marginBottom: 2 }}>
            <span style={{
              fontFamily: T.fontBody,
              fontSize: T.size.body,
              fontWeight: T.weight.medium,
              color: T.ink,
            }}>{person.name}</span>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
              {person.handle}
            </span>
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginBottom: 5 }}>
            Tkt {person.year} · {person.major}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
            <BadgePill badge={person.badge} />
            <span style={{ ...eyebrow, color: T.ink3 }}>orang</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p style={{
        margin: 0,
        fontFamily: T.fontBody,
        fontSize: T.size.body,
        color: T.ink2,
        lineHeight: T.lh.body,
      }}>{person.bio}</p>

      {/* Note / seeking context — quoted, tinted */}
      <div style={{
        background: T.accentTint,
        border: `1px solid ${T.accentLine}`,
        borderRadius: T.radiusCard,
        padding: "8px 12px",
        fontFamily: T.fontBody,
        fontSize: T.size.ui,
        color: T.ink,
        lineHeight: T.lh.body,
        fontStyle: "italic",
      }}>
        "{person.note}"
      </div>

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
        {person.skills.map((s) => <Tag key={s} label={s} accent />)}
      </div>

      {/* Current karya + connect actions */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap" as const,
        gap: 8,
        paddingTop: 2,
        borderTop: `1px solid ${T.line}`,
      }}>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
          {person.currentKarya ? (
            <>
              di{" "}
              <span style={{ color: T.accentMid, fontWeight: T.weight.medium }}>
                {person.currentKarya}
              </span>
            </>
          ) : (
            <em>belum punya karya aktif</em>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <ActionBtn label="Ajak ke Karya" primary />
          <ActionBtn label="Kirim Pesan" />
        </div>
      </div>
    </article>
  );
}

// ─── Karya Seeker Card ────────────────────────────────────────────────────────
function KaryaSeekerCard({ karya }: { karya: KaryaSeeker }) {
  return (
    <article style={{
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: T.radiusPanel,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column" as const,
      gap: 10,
    }}>
      {/* Header: cover + title + badge */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* 48px of art + a 1px ring, now inside the box (#91). */}
        <div style={{
          width: 50,
          height: 50,
          flexShrink: 0,
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${T.line}`,
        }}>
          <img
            src={coverFor(karya.interests)}
            alt={karya.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: "0 0 4px",
            fontFamily: T.fontDisplay,
            fontSize: T.size.title,
            fontWeight: T.weight.regular,
            color: T.ink,
            lineHeight: T.lh.heading,
          }}>{karya.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
            <BadgePill badge={karya.badge} />
            <span style={{ ...eyebrow, color: T.ink3 }}>karya</span>
            <Tag label={karya.stage} />
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        margin: 0,
        fontFamily: T.fontBody,
        fontSize: T.size.body,
        color: T.ink2,
        lineHeight: T.lh.body,
      }}>{karya.description}</p>

      {/* Open roles — the key field */}
      <div style={{
        background: T.accentTint,
        border: `1px solid ${T.accentLine}`,
        borderRadius: T.radiusCard,
        padding: "8px 12px",
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        flexWrap: "wrap" as const,
      }}>
        <span style={{ ...eyebrow, color: T.accentMid }}>butuh</span>
        <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>
          {karya.openRoles.join(" · ")}
        </span>
      </div>

      {/* Interests */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
        {karya.interests.map((t) => <Tag key={t} label={t} />)}
      </div>

      {/* Roster + actions */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap" as const,
        gap: 8,
        paddingTop: 2,
        borderTop: `1px solid ${T.line}`,
      }}>
        {/* Roster avatars */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex" }}>
            {karya.roster.slice(0, 4).map((r, idx) => (
              <span key={r.handle} style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: karya.roster.length - idx }}>
                <Avatar name={r.name} size={22} />
              </span>
            ))}
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
            {karya.roster.length} builder
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <ActionBtn label="Minta Gabung" primary />
          <ActionBtn label="Tanya Tim" />
        </div>
      </div>
    </article>
  );
}

// ─── Intent Section ───────────────────────────────────────────────────────────
// One section of the board: a titled intent group with a 2-col card grid
// mixing person cards and karya cards (interleaved: person, karya, person…).
type CardItem =
  | { type: "person"; data: PersonSeeker }
  | { type: "karya";  data: KaryaSeeker  };

/**
 * Interleaving (person, karya, person…) means both card types share every row
 * of the grid, reinforcing that the section is about *intent*, not type.
 */
function buildItems(badge: LookingFor): CardItem[] {
  const people = PEOPLE_SEEKERS
    .filter((p) => p.badge === badge)
    .map((p): CardItem => ({ type: "person", data: p }));
  const karya = KARYA_SEEKERS
    .filter((k) => k.badge === badge)
    .map((k): CardItem => ({ type: "karya", data: k }));
  const merged: CardItem[] = [];
  const max = Math.max(people.length, karya.length);
  for (let i = 0; i < max; i++) {
    if (i < people.length) merged.push(people[i]);
    if (i < karya.length)  merged.push(karya[i]);
  }
  return merged;
}

function IntentSection({ badge, items, showBanner }: {
  badge: LookingFor;
  items: CardItem[];
  showBanner?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section style={{ marginBottom: 32 }}>
      {/* Section heading */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
        paddingBottom: 10,
        borderBottom: `1px solid ${T.line}`,
      }}>
        <span aria-hidden="true" style={{ fontSize: T.size.body, color: T.accent }}>{BADGE_ICON[badge]}</span>
        <h2 style={{
          margin: 0,
          fontFamily: T.fontDisplay,
          fontSize: T.size.title,
          fontWeight: T.weight.regular,
          color: T.ink,
        }}>{BADGE_LABEL[badge]}</h2>
        <span style={{
          fontFamily: T.fontBody,
          fontSize: T.size.micro,
          color: T.ink3,
          marginLeft: "auto",
        }}>
          {items.length} entri
        </span>
      </div>

      {/* FR-29: event banner for hackathon section */}
      {showBanner && <HackathonBanner />}

      {/* 2-column card grid */}
      <div className="cari-grid" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        alignItems: "start",
      }}>
        {items.map((item) =>
          item.type === "person"
            ? <PersonSeekerCard key={`p${item.data.id}`} person={item.data} />
            : <KaryaSeekerCard  key={`k${item.data.id}`} karya={item.data}  />
        )}
      </div>
    </section>
  );
}

// ─── Center Board ─────────────────────────────────────────────────────────────
function CenterBoard({ activeSection, onSection }: {
  activeSection: Section;
  onSection: (s: Section) => void;
}) {
  const visible = activeSection === "Semua"
    ? LOOKING_FOR
    : LOOKING_FOR.filter((b) => b === activeSection);

  const tabs: { value: Section; icon: string; label: string }[] = [
    { value: "Semua", icon: "◎", label: "Semua" },
    ...LOOKING_FOR.map((b) => ({ value: b as Section, icon: BADGE_ICON[b], label: BADGE_LABEL[b] })),
  ];

  return (
    <main className="bn-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const }}>
      {/* Heading */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          margin: "0 0 4px",
          fontFamily: T.fontDisplay,
          fontSize: T.size.display,
          fontWeight: T.weight.regular,
          letterSpacing: T.track.heading,
          color: T.ink,
        }}>
          Cari Kolaborator
        </h1>
        <p style={{
          margin: 0,
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          color: T.ink2,
          lineHeight: T.lh.body,
        }}>
          Semua yang lagi nyari — tim hackathon, partner project, atau talenta gig — ada di sini.
        </p>
      </div>

      {/* Jump / section filter nav */}
      <div style={{
        display: "flex",
        gap: 4,
        marginBottom: 24,
        padding: "3px",
        background: T.line,
        borderRadius: 99,
        alignSelf: "flex-start",
      }}>
        {tabs.map((tab) => {
          const active = activeSection === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onSection(tab.value)}
              aria-pressed={active}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 14px",
                borderRadius: 99,
                border: "none",
                background: active ? T.surface : "transparent",
                color: active ? T.ink : T.ink2,
                fontFamily: T.fontBody,
                fontSize: T.size.ui,
                fontWeight: active ? T.weight.medium : T.weight.regular,
                cursor: "pointer",
                transition: "background 0.12s, color 0.12s",
                whiteSpace: "nowrap" as const,
                boxShadow: active ? "0 1px 3px oklch(0% 0 0 / 8%)" : "none",
              }}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Intent sections */}
      {visible.map((badge) => (
        <IntentSection
          key={badge}
          badge={badge}
          items={buildItems(badge)}
          showBanner={badge === "hackathon"}
        />
      ))}

      {/* CTA: post your own seeking status */}
      <div style={{
        marginTop: 4,
        padding: "16px 20px",
        borderRadius: T.radiusPanel,
        border: `1.5px dashed ${T.lineDark}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink, marginBottom: 2 }}>
            Kamu juga lagi nyari sesuatu?
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>
            Pasang dirimu di papan — ceritakan apa yang kamu cari.
          </div>
        </div>
        <button style={{
          backgroundColor: T.accent,
          color: T.accentFg,
          border: "none",
          borderRadius: T.radiusCard,
          padding: "8px 16px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.semibold,
          cursor: "pointer",
          whiteSpace: "nowrap" as const,
        }}>
          Pasang Status
        </button>
      </div>
    </main>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────
// The user's own seeking status (interactive toggle) + board pulse stats.
function RightRail() {
  const [seeking, setSeeking] = useState<LookingFor | null>(null);

  // Count entries per badge type (people + karya combined)
  const pulse = LOOKING_FOR.map((b) => ({
    badge: b,
    count:
      PEOPLE_SEEKERS.filter((p) => p.badge === b).length +
      KARYA_SEEKERS.filter( (k) => k.badge === b).length,
  }));

  const totalSeeking = PEOPLE_SEEKERS.length + KARYA_SEEKERS.length;

  return (
    <aside className="bn-rail" style={{
      display: "flex",
      flexDirection: "column" as const,
      gap: 20,
    }}>
      {/* ── User's own seeking status ─────────────────────────────────── */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusPanel,
        padding: "14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Status kamu</div>
        {seeking ? (
          <>
            <div style={{ marginBottom: 8 }}>
              <BadgePill badge={seeking} />
            </div>
            <div style={{
              fontFamily: T.fontBody,
              fontSize: T.size.ui,
              color: T.ink2,
              lineHeight: T.lh.body,
              marginBottom: 10,
            }}>
              Profilmu muncul di papan sebagai{" "}
              <span style={{ color: T.ink, fontWeight: T.weight.medium }}>{BADGE_LABEL[seeking]}</span>.
            </div>
            <button
              onClick={() => setSeeking(null)}
              style={{
                background: "none",
                border: `1px solid ${T.line}`,
                cursor: "pointer",
                fontFamily: T.fontBody,
                fontSize: T.size.micro,
                color: T.ink2,
                padding: "5px 10px",
                borderRadius: T.radiusCard,
                width: "100%",
                letterSpacing: T.track.tag,
              }}
            >
              Ubah status
            </button>
          </>
        ) : (
          <>
            <div style={{
              fontFamily: T.fontBody,
              fontSize: T.size.ui,
              color: T.ink2,
              lineHeight: T.lh.body,
              marginBottom: 10,
            }}>
              Kamu lagi nyari apa?
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
              {LOOKING_FOR.map((b) => (
                <button
                  key={b}
                  onClick={() => setSeeking(b)}
                  style={{
                    textAlign: "left" as const,
                    background: T.bg,
                    border: `1px solid ${T.line}`,
                    borderRadius: T.radiusCard,
                    padding: "7px 10px",
                    fontFamily: T.fontBody,
                    fontSize: T.size.ui,
                    color: T.ink2,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "border-color 0.12s",
                  }}
                >
                  <span>{BADGE_LABEL[b]}</span>
                  <span style={{ color: T.ink3 }}>→</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Board pulse ───────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusPanel,
        padding: "12px 14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Papan sekarang</div>
        <div style={{
          fontFamily: T.fontBody,
          fontSize: T.size.stat,
          fontWeight: T.weight.medium,
          color: T.ink,
          lineHeight: T.lh.heading,
          marginBottom: 2,
        }}>
          {totalSeeking}
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2, marginBottom: 12 }}>
          orang & karya sedang mencari
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 7 }}>
          {pulse.map((row) => (
            <div key={row.badge} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>{BADGE_LABEL[row.badge]}</span>
              <span style={{
                fontFamily: T.fontBody,
                fontSize: T.size.body,
                fontWeight: T.weight.medium,
                fontVariantNumeric: "tabular-nums",
                color: T.ink,
              }}>{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Open-a-role CTA ───────────────────────────────────────────── */}
      <div style={{
        borderRadius: T.radiusPanel,
        border: `1.5px dashed ${T.lineDark}`,
        padding: "14px",
      }}>
        <div style={{
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          fontWeight: T.weight.medium,
          color: T.ink,
          marginBottom: 4,
        }}>
          Karya butuh orang?
        </div>
        <div style={{
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          color: T.ink2,
          lineHeight: T.lh.body,
          marginBottom: 10,
        }}>
          Pasang karya kamu di sini — kasih tahu komunitas role apa yang lagi terbuka.
        </div>
        <button style={{
          background: T.accent,
          color: T.accentFg,
          border: "none",
          borderRadius: T.radiusCard,
          padding: "6px 14px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.semibold,
          cursor: "pointer",
          width: "100%",
        }}>
          Buka Lowongan
        </button>
      </div>

      {/* ── GEMASTIK quick link ───────────────────────────────────────── */}
      <div style={{
        background: T.accentTint,
        border: `1px solid ${T.accentLine}`,
        borderRadius: T.radiusPanel,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <span aria-hidden="true" style={{ color: T.accent, fontSize: T.size.body }}>◈</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>
            {HACKATHON_EVENT.name}
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.accentMid }}>
            {HACKATHON_EVENT.teamsForming} tim sedang terbentuk
          </div>
        </div>
        <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.accentMid }}>→</span>
      </div>
    </aside>
  );
}

export default function VariantB() {
  const [activeSection, setActiveSection] = useState<Section>("Semua");

  const filterOptions: { value: Section; label: string }[] = [
    { value: "Semua", label: "Semua" },
    ...LOOKING_FOR.map((b) => ({ value: b as Section, label: BADGE_LABEL[b] })),
  ];

  return (
    <Shell
      active="cari"
      navFilters={
        <NavFilterList
          label="Filter Tujuan"
          options={filterOptions}
          active={activeSection}
          onSelect={setActiveSection}
        />
      }
    >
      <CenterBoard activeSection={activeSection} onSection={setActiveSection} />
      <RightRail />
    </Shell>
  );
}
