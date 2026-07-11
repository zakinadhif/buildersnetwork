/**
 * Al-Fath Berkarya — Launchpad
 * Direction: calm, curated + reverse-chronological discovery feed
 *   (no ranking, no leaderboard — the karya leads, nothing is "winning")
 */

import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { NavFilterList } from "../components/LeftNav";
import { Shell } from "../components/Shell";
import { Tag } from "../components/Tag";
import { KARYA, MEMBERS, type Karya } from "../data/karya";
import { relativeTime } from "../lib/format";
import { coverFor, screenshots } from "../lib/images";
import { T, eyebrow } from "../lib/tokens";

const INTEREST_FILTERS = ["Semua", "Web", "Mobile", "AI/ML", "Desain", "UMKM", "Edukasi", "Komunitas"] as const;
type Interest = (typeof INTEREST_FILTERS)[number];

// ─── Micro components ─────────────────────────────────────────────────────────
// Quiet appreciation toggle — a warm signal, never a ranking input.
function AppreciateButton({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Apresiasi (${count})`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        border: `1px solid ${active ? T.accent : T.line}`,
        borderRadius: 99,
        backgroundColor: active ? T.accentTint : "transparent",
        color: active ? T.accent : T.ink2,
        cursor: "pointer",
        fontFamily: T.fontBody,
        fontSize: T.size.caption,
        fontWeight: T.weight.medium,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: T.size.ui, lineHeight: 1 }}>{active ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}

// ─── Landscape Screenshot Carousel (Play Store-style) ────────────────────────
function LandscapeCarousel({ images, title }: { images: string[]; title: string }) {
  return (
    <div
      className="landscape-carousel"
      role="region"
      aria-label={`Tangkapan layar ${title}`}
      style={{
        display: "flex",
        gap: 10,
        overflowX: "auto" as const,
        scrollSnapType: "x mandatory",
        scrollPaddingLeft: 0,
        borderRadius: T.radius,
      }}
    >
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${title} — layar ${i + 1}`}
          loading="lazy"
          style={{
            width: 240,
            height: 135,
            flexShrink: 0,
            objectFit: "cover",
            borderRadius: T.radius,
            border: `1.5px solid ${T.line}`,
            scrollSnapAlign: "start",
            display: "block",
          }}
        />
      ))}
    </div>
  );
}

// ─── Karya Feed Row (reverse-chronological activity) ───────────────────────────
function KaryaFeedRow({ karya, appreciated, onAppreciate }: { karya: Karya; appreciated: boolean; onAppreciate: (id: number) => void }) {
  return (
    <article style={{
      display: "flex",
      flexDirection: "column" as const,
      padding: "16px 2px",
      borderBottom: `1px solid ${T.line}`,
      gap: 12,
    }}>
      {/* Landscape screenshot carousel — Play Store style, full-width above metadata */}
      {karya.landscapeScreenshots && (
        <LandscapeCarousel images={karya.landscapeScreenshots} title={karya.title} />
      )}

      {/* Thumbnail + content row */}
      <div style={{ display: "flex", gap: 14 }}>
        {/* App icon */}
        <div style={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${T.line}`,
          background: T.bg,
        }}>
          <img
            src={coverFor(karya.interests)}
            alt={karya.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Activity line — what's new, and when */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontFamily: T.fontBody, fontSize: T.size.micro, letterSpacing: T.track.tag }}>
            <span style={{ color: T.accentMid, fontWeight: T.weight.medium }}>{karya.lastActivity.text}</span>
            <span style={{ color: T.ink3 }}>·</span>
            <span style={{ color: T.ink3 }}>{relativeTime(karya.lastActivity.hoursAgo)}</span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
            <h3 style={{
              margin: 0,
              fontFamily: T.fontDisplay,
              fontSize: T.size.title,
              fontWeight: T.weight.regular,
              color: T.ink,
              lineHeight: T.lh.tight,
            }}>{karya.title}</h3>
            {karya.stages.map((s) => <Tag key={s} label={s} accent={s === "Cari Kolaborator"} />)}
          </div>

          <p style={{
            margin: "0 0 10px",
            fontFamily: T.fontBody,
            fontSize: T.size.body,
            color: T.ink2,
            lineHeight: T.lh.body,
          }}>{karya.description}</p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 10 }}>
            {/* Interests */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
              {karya.interests.map((i) => <Tag key={i} label={i} />)}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Roster avatars */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {karya.roster.slice(0, 4).map((r, idx) => (
                  <span key={r.handle} style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: karya.roster.length - idx }}>
                    <Avatar name={r.name} size={22} />
                  </span>
                ))}
                {karya.roster.length > 4 && (
                  <span style={{ marginLeft: -8, zIndex: 0, width: 22, height: 22, borderRadius: "50%", backgroundColor: T.line, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink2 }}>
                    +{karya.roster.length - 4}
                  </span>
                )}
              </div>

              {/* Quiet appreciation */}
              <AppreciateButton
                count={karya.appreciations + (appreciated ? 1 : 0)}
                active={appreciated}
                onClick={() => onAppreciate(karya.id)}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Spotlight (Play-Store-style featured listing) ─────────────────────────────
function SpotlightMetric({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div style={{ flex: 1, textAlign: "center" as const, padding: "0 4px" }}>
      <div style={{
        fontFamily: T.fontBody,
        fontSize: T.size.stat,
        fontWeight: T.weight.medium,
        color: accent ? T.accent : T.ink,
        lineHeight: T.lh.tight,
        marginBottom: 3,
      }}>{value}</div>
      <div style={eyebrow}>{label}</div>
    </div>
  );
}

function Spotlight({ karya }: { karya: Karya }) {
  const builders = karya.roster.map((r) => r.name).join(" · ");
  const latestStage = karya.stages[karya.stages.length - 1];

  return (
    <section style={{
      marginBottom: 18,
      background: T.surface,
      border: `1px solid ${T.accent}`,
      borderRadius: T.radiusLg,
      overflow: "hidden",
      boxShadow: `0 0 0 1px ${T.accent}22, 0 4px 16px #0f0e0b10`,
    }}>
      {/* Accent header band */}
      <div style={{
        ...eyebrow,
        color: T.accentFg,
        backgroundColor: T.accent,
        padding: "4px 18px",
      }}>
        <span aria-hidden="true">◈</span> Pilihan Minggu Ini
      </div>

      {/* App header */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "16px 18px 14px" }}>
        {/* App icon */}
        <div aria-hidden="true" style={{
          width: 60,
          height: 60,
          borderRadius: 15,
          flexShrink: 0,
          background: `linear-gradient(145deg, ${T.accentMid}, ${T.accent})`,
          color: T.accentFg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: T.fontBody,
          fontSize: 26,
          fontWeight: T.weight.medium,
          boxShadow: `0 2px 8px ${T.accent}33`,
        }}>
          {karya.title.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: "0 0 3px", fontFamily: T.fontDisplay, fontSize: T.size.feature, fontWeight: T.weight.regular, lineHeight: T.lh.tight, color: T.ink }}>{karya.title}</h2>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.accentMid, fontWeight: T.weight.medium, marginBottom: 5 }}>
            oleh {builders}
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
            {karya.interests.map((i) => <Tag key={i} label={i} />)}
          </div>
        </div>
        <button style={{
          backgroundColor: T.accent,
          color: T.accentFg,
          border: "none",
          borderRadius: T.radius,
          padding: "9px 20px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.semibold,
          cursor: "pointer",
          whiteSpace: "nowrap" as const,
          alignSelf: "flex-start",
        }}>
          Lihat Karya
        </button>
      </div>

      {/* Play-Store-style metrics strip */}
      <div style={{
        display: "flex",
        alignItems: "stretch",
        borderTop: `1px solid ${T.line}`,
        borderBottom: `1px solid ${T.line}`,
        padding: "11px 12px",
        margin: "0 18px",
      }}>
        <SpotlightMetric value={`♥ ${karya.appreciations}`} label="Apresiasi" accent />
        <div style={{ width: 1, backgroundColor: T.line }} />
        <SpotlightMetric value={`${karya.roster.length}`} label="Builder" />
        <div style={{ width: 1, backgroundColor: T.line }} />
        <SpotlightMetric value={latestStage} label="Tahap" />
      </div>

      {/* Tagline */}
      <p style={{
        margin: 0,
        padding: "14px 18px 12px",
        fontFamily: T.fontBody,
        fontSize: T.size.body,
        color: T.ink2,
        lineHeight: T.lh.body,
      }}>{karya.description}</p>

      {/* Screenshot gallery */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "0 18px 8px",
      }}>
        <span style={eyebrow}>Tangkapan Layar</span>
        <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>← geser →</span>
      </div>
      <div className="spotlight-carousel" style={{
        display: "flex",
        gap: 12,
        overflowX: "auto" as const,
        padding: "0 18px 18px",
        scrollSnapType: "x mandatory",
        scrollPaddingLeft: 18,
      }}>
        {screenshots.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${karya.title} — tangkapan layar ${i + 1}`}
            style={{
              height: 360,
              width: "auto",
              flexShrink: 0,
              borderRadius: 18,
              border: `2px solid ${T.lineDark}`,
              scrollSnapAlign: "start",
              background: T.bg,
              boxShadow: "0 2px 10px #0f0e0b14",
            }}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Seeker on-ramp — calm entry to the onboarding agent ───────────────────────
function SeekerRamp() {
  return (
    <section style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 18px",
      marginBottom: 18,
      background: T.accentTint,
      border: `1px solid ${T.accentLine}`,
      borderRadius: T.radiusLg,
    }}>
      <div aria-hidden="true" style={{ fontFamily: T.fontDisplay, fontSize: 28, color: T.accent, lineHeight: 1, flexShrink: 0 }}>✦</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: T.size.title, fontWeight: T.weight.regular, color: T.ink, lineHeight: T.lh.tight, marginBottom: 2 }}>
          Belum tahu mau bikin apa?
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink2, lineHeight: T.lh.body }}>
          Ngobrol sebentar sama asisten — kita cari arah yang pas buat kamu.
        </div>
      </div>
      <button style={{
        flexShrink: 0,
        background: "transparent",
        color: T.accent,
        border: `1px solid ${T.accent}`,
        borderRadius: T.radius,
        padding: "8px 16px",
        fontFamily: T.fontBody,
        fontSize: T.size.ui,
        fontWeight: T.weight.semibold,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
      }}>
        Mulai cari arah →
      </button>
    </section>
  );
}

// ─── Center Feed ──────────────────────────────────────────────────────────────
function CenterFeed({ filter, appreciated, onAppreciate }: { filter: Interest; appreciated: Set<number>; onAppreciate: (id: number) => void }) {
  const filtered = KARYA.filter((k) =>
    filter === "Semua" ? true : k.interests.some((i) => i === filter)
  );
  const spotlight = filtered.find((k) => k.featured);
  const feed = filtered
    .filter((k) => k.id !== spotlight?.id)
    .sort((a, b) => a.lastActivity.hoursAgo - b.lastActivity.hoursAgo); // newest first

  return (
    <main className="bn-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const, gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: T.size.display, fontWeight: T.weight.regular, letterSpacing: T.track.tight, color: T.ink }}>Launchpad</h1>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3 }}>Apa yang lagi dikerjakan komunitas</span>
        </div>
      </div>

      {/* Seeker on-ramp */}
      <SeekerRamp />

      {/* Curated feature — Pilihan Minggu Ini */}
      {spotlight && <Spotlight karya={spotlight} />}

      {/* Reverse-chronological feed */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
            Belum ada karya untuk minat ini — coba minat lain, atau jadilah yang pertama.
          </div>
        ) : (
          <>
            <div style={{ ...eyebrow, margin: "4px 0 2px" }}>Kabar terbaru</div>
            {feed.map((k) => (
              <KaryaFeedRow key={k.id} karya={k} appreciated={appreciated.has(k.id)} onAppreciate={onAppreciate} />
            ))}
          </>
        )}
      </div>

      {/* Submit CTA */}
      <div style={{
        marginTop: 20,
        padding: "16px 20px",
        borderRadius: T.radiusLg,
        border: `1.5px dashed ${T.lineDark}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink, marginBottom: 2 }}>Punya karya baru?</div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>Bagikan kapan saja — komunitas senang lihat progresmu, sekecil apa pun.</div>
        </div>
        <button style={{
          backgroundColor: T.accent,
          color: T.accentFg,
          border: "none",
          borderRadius: T.radius,
          padding: "8px 16px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.semibold,
          cursor: "pointer",
          whiteSpace: "nowrap" as const,
        }}>
          Submit Karya
        </button>
      </div>
    </main>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────
function RightRail() {
  const [searchQuery, setSearchQuery] = useState("");
  const seekingCollab = KARYA.filter((k) => k.stages.includes("Cari Kolaborator")).length;

  const filteredMembers = MEMBERS.filter((m) =>
    searchQuery === "" ? true :
      m.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.interests.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="bn-rail" style={{
      width: 232,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column" as const,
      gap: 20,
      paddingTop: 0,
    }}>
      {/* Community pulse strip */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusLg,
        padding: "12px 14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Denyut minggu ini</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {[
            { label: "Karya aktif", value: KARYA.length },
            { label: "Builder aktif", value: MEMBERS.length },
            { label: "Cari kolaborator", value: seekingCollab },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>{stat.label}</span>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, fontVariantNumeric: "tabular-nums", color: T.ink }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Builders to meet */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={eyebrow}>Kenalan dengan builder</div>
          <button type="button" style={{ background: "none", border: "none", padding: 0, fontFamily: T.fontBody, fontSize: T.size.micro, color: T.accentMid, cursor: "pointer" }}>Lihat semua</button>
        </div>

        {/* Search by skill */}
        <input
          type="text"
          placeholder="Cari skill / minat…"
          aria-label="Cari builder berdasarkan skill atau minat"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box" as const,
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            color: T.ink,
            backgroundColor: T.surface,
            border: `1px solid ${T.line}`,
            borderRadius: T.radius,
            padding: "6px 10px",
            marginBottom: 10,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          {filteredMembers.map((m, idx) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 0",
                borderBottom: idx < filteredMembers.length - 1 ? `1px solid ${T.line}` : "none",
                alignItems: "flex-start",
              }}
            >
              <Avatar name={m.name} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>{m.name}</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>{m.karya} karya</span>
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginBottom: 4 }}>{m.handle} · Tkt {m.year}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                  {m.skills.slice(0, 3).map((s) => (
                    <span key={s} style={{
                      fontFamily: T.fontBody,
                      fontSize: T.size.micro,
                      color: T.ink2,
                      backgroundColor: T.bg,
                      border: `1px solid ${T.line}`,
                      padding: "1px 5px",
                      borderRadius: "3px",
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && (
            <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink3, padding: "16px 0", textAlign: "center" as const }}>
              Tidak ada builder yang cocok.
            </div>
          )}
        </div>
      </div>

      {/* Call to join */}
      <div style={{
        backgroundColor: T.accent,
        borderRadius: T.radiusLg,
        padding: "14px 16px",
      }}>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.light, color: T.accentFg, lineHeight: T.lh.snug, marginBottom: 10 }}>
          Bergabung sebagai builder Telkom University.
        </div>
        <button style={{
          backgroundColor: T.accentFg,
          color: T.accent,
          border: "none",
          borderRadius: T.radius,
          padding: "6px 14px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.semibold,
          cursor: "pointer",
          width: "100%",
        }}>
          Daftar Sekarang
        </button>
      </div>
    </aside>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function LaunchpadScreen() {
  const [filter, setFilter] = useState<Interest>("Semua");
  const [appreciated, setAppreciated] = useState<Set<number>>(new Set());

  function toggleAppreciate(id: number) {
    setAppreciated((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <Shell
      active="launchpad"
      navFilters={
        <NavFilterList
          label="Filter Minat"
          options={INTEREST_FILTERS.map((f) => ({ value: f, label: f }))}
          active={filter}
          onSelect={setFilter}
        />
      }
    >
      <CenterFeed filter={filter} appreciated={appreciated} onAppreciate={toggleAppreciate} />
      <RightRail />
    </Shell>
  );
}
