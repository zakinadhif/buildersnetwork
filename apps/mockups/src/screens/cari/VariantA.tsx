/**
 * Cari Kolaborator — Variant A · Two-lane
 *
 * The primary choice is which side of the matchmaking you're on: looking for
 * people, or looking for a karya to join. A badge-type filter narrows each lane.
 */

import { useState } from "react";
import { Avatar } from "@myapp/ui";
import { Shell } from "../../components/Shell";
import { Tag } from "@myapp/ui";
import { KARYA_SLOTS, SEEKERS, type KaryaSlot, type Seeker } from "../../data/seekers";
import { LOOKING_FOR, type LookingFor } from "../../data/looking-for";
import { relativeTime } from "../../lib/format";
import { coverFor } from "../../lib/images";
import { T, eyebrow } from "@myapp/design-tokens";

/** This variant's wording for the three FR-29 categories. */
const BADGE_LABEL: Record<LookingFor, string> = {
  hackathon: "Tim Hackathon",
  project:   "Tim Project",
  gig:       "Gig / Talenta",
};

// ─── Badge chip ───────────────────────────────────────────────────────────────
// Three visual weights: hackathon = terracotta (urgent/event), project =
// neutral dark border, gig = hairline quiet.
function BadgeChip({ type }: { type: LookingFor }) {
  const isHackathon = type === "hackathon";
  const isProject   = type === "project";
  return (
    <span style={{
      display:         "inline-block",
      fontFamily:      T.fontBody,
      fontSize:        T.size.micro,
      letterSpacing:   T.track.eyebrow,
      textTransform:   "uppercase" as const,
      padding:         "2px 8px",
      borderRadius:    "3px",
      border:          `1px solid ${isHackathon ? T.accent : isProject ? T.ink2 : T.line}`,
      color:           isHackathon ? T.accent : isProject ? T.ink2 : T.ink3,
      backgroundColor: isHackathon ? T.accentTint : "transparent",
      whiteSpace:      "nowrap" as const,
    }}>
      {BADGE_LABEL[type]}
    </span>
  );
}

// ─── Seeker card ──────────────────────────────────────────────────────────────
// Shows a person who is actively looking for a team or gig.
function SeekerCard({ seeker }: { seeker: Seeker }) {
  return (
    <article style={{
      padding:      "18px 0",
      borderBottom: `1px solid ${T.line}`,
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Avatar */}
        <Avatar name={seeker.name} size={44} />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + handle + badge */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          8,
            flexWrap:     "wrap" as const,
            marginBottom: 2,
          }}>
            <span style={{
              fontFamily: T.fontDisplay,
              fontSize:   T.size.title,
              fontWeight: T.weight.regular,
              color:      T.ink,
              lineHeight: T.lh.heading,
            }}>{seeker.name}</span>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>{seeker.handle}</span>
            <BadgeChip type={seeker.badge} />
          </div>

          {/* Tingkat · Jurusan · posted */}
          <div style={{
            fontFamily:   T.fontBody,
            fontSize:     T.size.micro,
            color:        T.ink3,
            marginBottom: 8,
            lineHeight:   T.lh.compact,
          }}>
            {seeker.tingkat} · {seeker.jurusan} · diposting {relativeTime(seeker.postedHoursAgo)}
          </div>

          {/* Bio */}
          <p style={{
            margin:     "0 0 10px",
            fontFamily: T.fontBody,
            fontSize:   T.size.body,
            color:      T.ink2,
            lineHeight: T.lh.body,
          }}>{seeker.bio}</p>

          {/* Skill chips */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginBottom: 10 }}>
            {seeker.skills.map((s) => <Tag key={s} label={s} accent />)}
          </div>

          {/* Current karya */}
          {seeker.currentKarya && (
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          6,
              marginBottom: 14,
              flexWrap:     "wrap" as const,
            }}>
              <span style={eyebrow}>sedang bangun</span>
              <span style={{
                fontFamily:      T.fontBody,
                fontSize:        T.size.micro,
                color:           T.ink,
                backgroundColor: T.surface,
                border:          `1px solid ${T.lineDark}`,
                padding:         "2px 8px",
                borderRadius:    "3px",
              }}>
                {seeker.currentKarya.title}
                <span style={{ color: T.ink3 }}> — {seeker.currentKarya.role}</span>
              </span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            <button style={{
              backgroundColor: T.accent,
              color:           T.accentFg,
              border:          "none",
              borderRadius:    T.radiusCard,
              padding:         "7px 15px",
              fontFamily:      T.fontBody,
              fontSize:        T.size.ui,
              fontWeight:      T.weight.semibold,
              cursor:          "pointer",
              whiteSpace:      "nowrap" as const,
            }}>
              Ajak ke Karya
            </button>
            <button style={{
              background:   "transparent",
              color:        T.ink2,
              border:       `1px solid ${T.line}`,
              borderRadius: T.radiusCard,
              padding:      "7px 15px",
              fontFamily:   T.fontBody,
              fontSize:     T.size.ui,
              fontWeight:   T.weight.medium,
              cursor:       "pointer",
              whiteSpace:   "nowrap" as const,
            }}>
              Kirim Pesan
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Karya slot card ──────────────────────────────────────────────────────────
// Shows a karya that has open contributor slots.
function KaryaSlotCard({ slot }: { slot: KaryaSlot }) {
  return (
    <article style={{
      padding:      "18px 0",
      borderBottom: `1px solid ${T.line}`,
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Cover thumbnail */}
        <div style={{
          width:        56,
          height:       56,
          flexShrink:   0,
          borderRadius: 14,
          overflow:     "hidden",
          border:       `1px solid ${T.line}`,
          background:   T.bg,
        }}>
          <img
            src={coverFor(slot.interests)}
            alt={slot.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + stage + badge */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          8,
            flexWrap:     "wrap" as const,
            marginBottom: 2,
          }}>
            <h3 style={{
              margin:     0,
              fontFamily: T.fontDisplay,
              fontSize:   T.size.title,
              fontWeight: T.weight.regular,
              color:      T.ink,
              lineHeight: T.lh.heading,
            }}>{slot.title}</h3>
            <Tag label={slot.stage} accent={slot.stage === "GEMASTIK 2026" || slot.stage === "Hackathon"} />
            <BadgeChip type={slot.badge} />
          </div>

          {/* Posted time */}
          <div style={{
            fontFamily:   T.fontBody,
            fontSize:     T.size.micro,
            color:        T.ink3,
            marginBottom: 8,
          }}>
            dibuka {relativeTime(slot.postedHoursAgo)}
          </div>

          {/* One-line description */}
          <p style={{
            margin:     "0 0 10px",
            fontFamily: T.fontBody,
            fontSize:   T.size.body,
            color:      T.ink2,
            lineHeight: T.lh.body,
          }}>{slot.desc}</p>

          {/* Open roles — the core matchmaking signal */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          6,
            flexWrap:     "wrap" as const,
            marginBottom: 10,
          }}>
            <span style={eyebrow}>butuh</span>
            {slot.openRoles.map((r) => (
              <span key={r} style={{
                fontFamily:      T.fontBody,
                fontSize:        T.size.micro,
                color:           T.ink,
                backgroundColor: T.accentTint,
                border:          `1px solid ${T.accentLine}`,
                padding:         "2px 8px",
                borderRadius:    "3px",
              }}>{r}</span>
            ))}
          </div>

          {/* Interest chips + roster avatars + actions */}
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            flexWrap:       "wrap" as const,
            gap:            10,
          }}>
            {/* Interest chips */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
              {slot.interests.map((i) => <Tag key={i} label={i} />)}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Roster avatars */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {slot.roster.slice(0, 4).map((r, idx) => (
                  <span
                    key={r.name}
                    style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: slot.roster.length - idx }}
                  >
                    <Avatar name={r.name} size={22} />
                  </span>
                ))}
              </div>

              {/* Actions */}
              <button style={{
                backgroundColor: T.accent,
                color:           T.accentFg,
                border:          "none",
                borderRadius:    T.radiusCard,
                padding:         "6px 13px",
                fontFamily:      T.fontBody,
                fontSize:        T.size.ui,
                fontWeight:      T.weight.semibold,
                cursor:          "pointer",
                whiteSpace:      "nowrap" as const,
              }}>
                Minta Gabung
              </button>
              <button style={{
                background:   "transparent",
                color:        T.ink2,
                border:       `1px solid ${T.line}`,
                borderRadius: T.radiusCard,
                padding:      "6px 13px",
                fontFamily:   T.fontBody,
                fontSize:     T.size.ui,
                fontWeight:   T.weight.medium,
                cursor:       "pointer",
                whiteSpace:   "nowrap" as const,
              }}>
                Tanya Dulu
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Center Board ─────────────────────────────────────────────────────────────
type Lane      = "orang" | "karya";
type FilterKey = "Semua" | LookingFor;

const BADGE_FILTERS: { id: FilterKey; label: string }[] = [
  { id: "Semua",     label: "Semua" },
  { id: "hackathon", label: "Hackathon" },
  { id: "project",   label: "Project" },
  { id: "gig",       label: "Gig" },
];

function CenterBoard() {
  const [lane, setLane]               = useState<Lane>("orang");
  const [badgeFilter, setBadgeFilter] = useState<FilterKey>("Semua");

  // Reset badge filter when switching lane for a clean slate.
  function switchLane(next: Lane) {
    setLane(next);
    setBadgeFilter("Semua");
  }

  const filteredSeekers = SEEKERS.filter((s) =>
    badgeFilter === "Semua" || s.badge === badgeFilter
  );
  const filteredSlots = KARYA_SLOTS.filter((k) =>
    badgeFilter === "Semua" || k.badge === badgeFilter
  );

  const resultCount = lane === "orang" ? filteredSeekers.length : filteredSlots.length;

  return (
    <main className="bn-main" style={{
      flex:          1,
      minWidth:      0,
      display:       "flex",
      flexDirection: "column" as const,
      gap:           0,
    }}>
      {/* Page heading */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          margin:        "0 0 4px",
          fontFamily:    T.fontDisplay,
          fontSize:      T.size.display,
          fontWeight:    T.weight.regular,
          letterSpacing: T.track.heading,
          color:         T.ink,
          lineHeight:    T.lh.heading,
        }}>
          Cari Kolaborator
        </h1>
        <p style={{
          margin:     0,
          fontFamily: T.fontBody,
          fontSize:   T.size.body,
          color:      T.ink2,
          lineHeight: T.lh.body,
        }}>
          Temukan orang yang cocok untuk proyekmu, atau temukan proyek yang cocok untukmu.
        </p>
      </div>

      {/* ── Lens Toggle ──────────────────────────────────────────────────────── */}
      {/* The primary choice — which side of the matchmaking are you on? */}
      <div style={{
        display:         "flex",
        gap:             0,
        marginBottom:    16,
        backgroundColor: T.bg,
        border:          `1px solid ${T.lineDark}`,
        borderRadius:    T.radiusPanel,
        padding:         4,
      }}>
        {([
          { id: "orang" as Lane, icon: "◎", label: "Aku nyari orang" },
          { id: "karya" as Lane, icon: "◉", label: "Aku nyari karya buat gabung" },
        ]).map(({ id, icon, label }) => {
          const active = lane === id;
          return (
            <button
              key={id}
              onClick={() => switchLane(id)}
              aria-pressed={active}
              style={{
                flex:            1,
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                gap:             8,
                padding:         "10px 16px",
                border:          "none",
                borderRadius:    "12px",
                backgroundColor: active ? T.ink : "transparent",
                color:           active ? T.bg : T.ink2,
                fontFamily:      T.fontBody,
                fontSize:        T.size.body,
                fontWeight:      active ? T.weight.medium : T.weight.regular,
                cursor:          "pointer",
                transition:      "background 0.15s, color 0.15s",
                whiteSpace:      "nowrap" as const,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: T.size.ui }}>{icon}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Badge-type filter ────────────────────────────────────────────────── */}
      <div style={{
        display:       "flex",
        gap:           6,
        marginBottom:  18,
        paddingBottom: 16,
        borderBottom:  `1px solid ${T.line}`,
        flexWrap:      "wrap" as const,
        alignItems:    "center",
      }}>
        {BADGE_FILTERS.map(({ id, label }) => {
          const active = badgeFilter === id;
          return (
            <button
              key={id}
              onClick={() => setBadgeFilter(id)}
              aria-pressed={active}
              style={{
                background:    active ? T.accentTint : "transparent",
                border:        `1px solid ${active ? T.accent : T.line}`,
                color:         active ? T.accent : T.ink2,
                borderRadius:  99,
                padding:       "4px 14px",
                fontFamily:    T.fontBody,
                fontSize:      T.size.ui,
                fontWeight:    active ? T.weight.medium : T.weight.regular,
                cursor:        "pointer",
                letterSpacing: T.track.tag,
                transition:    "background 0.12s, color 0.12s, border-color 0.12s",
              }}
            >
              {label}
            </button>
          );
        })}

        {/* Result count */}
        <span style={{
          marginLeft: "auto",
          fontFamily: T.fontBody,
          fontSize:   T.size.micro,
          color:      T.ink3,
        }}>
          {resultCount} {lane === "orang" ? "orang ditemukan" : "karya buka slot"}
        </span>
      </div>

      {/* ── Card list ────────────────────────────────────────────────────────── */}
      {lane === "orang" ? (
        <div>
          {filteredSeekers.length === 0 ? (
            <p style={{
              fontFamily: T.fontBody,
              fontSize:   T.size.body,
              color:      T.ink3,
              padding:    "32px 0",
              textAlign:  "center" as const,
            }}>
              Belum ada orang yang pasang badge untuk kategori ini.
            </p>
          ) : (
            filteredSeekers.map((s) => <SeekerCard key={s.id} seeker={s} />)
          )}
        </div>
      ) : (
        <div>
          {filteredSlots.length === 0 ? (
            <p style={{
              fontFamily: T.fontBody,
              fontSize:   T.size.body,
              color:      T.ink3,
              padding:    "32px 0",
              textAlign:  "center" as const,
            }}>
              Belum ada karya yang buka slot untuk kategori ini.
            </p>
          ) : (
            filteredSlots.map((k) => <KaryaSlotCard key={k.id} slot={k} />)
          )}
        </div>
      )}

      {/* ── Post a slot CTA ──────────────────────────────────────────────────── */}
      <div style={{
        marginTop:      24,
        padding:        "16px 20px",
        borderRadius:   T.radiusPanel,
        border:         `1.5px dashed ${T.lineDark}`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            12,
      }}>
        <div>
          <div style={{
            fontFamily:   T.fontBody,
            fontSize:     T.size.body,
            fontWeight:   T.weight.medium,
            color:        T.ink,
            marginBottom: 2,
          }}>
            {lane === "orang"
              ? "Kamu lagi nyari tim atau gig?"
              : "Karyamu butuh kontributor?"}
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>
            {lane === "orang"
              ? "Pasang badge supaya komunitas bisa menemukanmu."
              : "Buka lowongan — biar orang yang tepat tahu kamu butuh bantuan."}
          </div>
        </div>
        <button style={{
          backgroundColor: T.accent,
          color:           T.accentFg,
          border:          "none",
          borderRadius:    T.radiusCard,
          padding:         "8px 16px",
          fontFamily:      T.fontBody,
          fontSize:        T.size.ui,
          fontWeight:      T.weight.semibold,
          cursor:          "pointer",
          whiteSpace:      "nowrap" as const,
        }}>
          {lane === "orang" ? "Pasang Badge" : "Buka Lowongan"}
        </button>
      </div>
    </main>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────
function RightRail() {
  // Mock interactive state: user's own seeker badge.
  const [myBadge, setMyBadge] = useState<LookingFor | null>(null);

  return (
    <aside className="bn-rail" style={{
      display:       "flex",
      flexDirection: "column" as const,
      gap:           16,
    }}>
      {/* ── Status kamu — seeker badge picker ─────────────────────────────── */}
      {/* Prompts the viewer to set or update their own "looking for" badge. */}
      <div style={{
        backgroundColor: T.accentTint,
        border:          `1px solid ${T.accentLine}`,
        borderRadius:    T.radiusPanel,
        padding:         "14px 14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Status kamu</div>

        {myBadge ? (
          /* Badge set — show current status with option to change. */
          <div>
            <div style={{
              fontFamily:   T.fontBody,
              fontSize:     T.size.body,
              color:        T.ink,
              lineHeight:   T.lh.compact,
              marginBottom: 10,
            }}>
              Kamu lagi cari:{" "}
              <strong style={{ color: T.accent }}>{BADGE_LABEL[myBadge]}</strong>
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginBottom: 10 }}>
              Badge ini terlihat oleh semua anggota komunitas.
            </div>
            <button
              onClick={() => setMyBadge(null)}
              style={{
                background:   "transparent",
                border:       `1px solid ${T.accent}`,
                borderRadius: T.radiusCard,
                padding:      "5px 12px",
                fontFamily:   T.fontBody,
                fontSize:     T.size.ui,
                color:        T.accent,
                cursor:       "pointer",
              }}
            >
              Ubah badge
            </button>
          </div>
        ) : (
          /* No badge — invite the user to pick one. */
          <>
            <div style={{
              fontFamily:   T.fontBody,
              fontSize:     T.size.body,
              color:        T.ink,
              lineHeight:   T.lh.compact,
              marginBottom: 12,
            }}>
              Kasih tahu komunitas kamu lagi nyari apa.
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
              {LOOKING_FOR.map((b) => (
                <button
                  key={b}
                  onClick={() => setMyBadge(b)}
                  style={{
                    textAlign:    "left" as const,
                    background:   T.surface,
                    border:       `1px solid ${T.line}`,
                    borderRadius: T.radiusCard,
                    padding:      "7px 10px",
                    fontFamily:   T.fontBody,
                    fontSize:     T.size.ui,
                    color:        T.ink2,
                    cursor:       "pointer",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          8,
                    transition:   "border-color 0.12s, color 0.12s",
                  }}
                >
                  <span aria-hidden="true" style={{ color: T.accent, fontSize: T.size.ui }}>◎</span>
                  {BADGE_LABEL[b]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Hackathon gesture (FR-29) ──────────────────────────────────────── */}
      {/* Light event-scoped team-formation affordance — hints at the feature
          without implementing a full surface. */}
      <div style={{
        backgroundColor: T.surface,
        border:          `1px solid ${T.line}`,
        borderRadius:    T.radiusPanel,
        padding:         "12px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span aria-hidden="true" style={{ color: T.accent, fontSize: 14 }}>✦</span>
          <div style={eyebrow}>GEMASTIK 2026</div>
        </div>
        <p style={{
          margin:     "0 0 10px",
          fontFamily: T.fontBody,
          fontSize:   T.size.body,
          color:      T.ink,
          lineHeight: T.lh.compact,
        }}>
          6 orang lagi bentuk tim untuk kompetisi ini.
        </p>
        {/* A few seekers already tagged to this event */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          4,
          marginBottom: 12,
        }}>
          {["Farhan Ardiansyah", "Dian Pertiwi", "Siti Rahmah"].map((name, i) => (
            <span key={name} style={{ marginLeft: i === 0 ? 0 : -6 }}>
              <Avatar name={name} size={22} />
            </span>
          ))}
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginLeft: 4 }}>
            +3 lagi
          </span>
        </div>
        <button style={{
          background:   "transparent",
          border:       `1px solid ${T.accent}`,
          color:        T.accent,
          borderRadius: T.radiusCard,
          padding:      "6px 12px",
          fontFamily:   T.fontBody,
          fontSize:     T.size.ui,
          fontWeight:   T.weight.medium,
          cursor:       "pointer",
          width:        "100%",
        }}>
          Lihat tim GEMASTIK →
        </button>
      </div>

      {/* ── Community pulse ────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: T.surface,
        border:          `1px solid ${T.line}`,
        borderRadius:    T.radiusPanel,
        padding:         "12px 14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Denyut sekarang</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {[
            { label: "Orang aktif cari tim", value: SEEKERS.length },
            { label: "Karya buka slot",      value: KARYA_SLOTS.length },
            { label: "Match minggu ini",     value: 11 },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
            >
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>
                {stat.label}
              </span>
              <span style={{
                fontFamily:         T.fontBody,
                fontSize:           T.size.body,
                fontWeight:         T.weight.medium,
                fontVariantNumeric: "tabular-nums",
                color:              T.ink,
              }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function VariantA() {
  return (
    <Shell active="cari">
      <CenterBoard />
      <RightRail />
    </Shell>
  );
}
