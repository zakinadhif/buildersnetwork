/**
 * Al-Fath Berkarya — Karya
 * The project surface, repurposed in place from the old Launchpad once its feed
 * role moved to Scroll (#collapse 4→3). This is a transitional state: the screen
 * is renamed and the directory search now lives in the right pane, but the old
 * feed-only pieces are kept for now, each tagged `FEED-ONLY` so they are easy to
 * find and strip when the directory is finalised:
 *   - the seeker on-ramp (belongs to Scroll/home),
 *   - the per-card activity line (Scroll owns "what's new"),
 *   - the recency ordering (a feed trait; a directory would order neutrally).
 * (The "builders to meet" rail has already moved to People, its rightful home.)
 */

import { useState } from "react";
import { KaryaCard, Tag } from "@myapp/ui";
import { NavFilterList } from "../components/LeftNav";
import { Shell } from "../components/Shell";
import { KARYA, MEMBERS, type Karya } from "../data/karya";
import { relativeTime } from "../lib/format";
import { coverFor, screenshots } from "../lib/images";
import { T, eyebrow } from "@myapp/design-tokens";

const INTEREST_FILTERS = ["Semua", "Web", "Mobile", "AI/ML", "Desain", "UMKM", "Edukasi", "Komunitas"] as const;
type Interest = (typeof INTEREST_FILTERS)[number];

// ─── Quiet appreciation toggle — a warm signal, never a ranking input ───────────
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

// ─── Catalog card — a karya as a directory entry ────────────────────────────────
function CatalogCard({ karya, appreciated, onAppreciate }: { karya: Karya; appreciated: boolean; onAppreciate: (id: number) => void }) {
  return (
    <KaryaCard
      cover={coverFor(karya.interests)}
      title={karya.title}
      description={karya.description}
      // FEED-ONLY: the activity line is Scroll's job; a directory entry states what
      // a karya *is*, not what's newest about it. Drop when the directory finalises.
      activity={{ text: karya.lastActivity.text, time: relativeTime(karya.lastActivity.hoursAgo) }}
      stages={karya.stages.map((s) => ({ label: s, accent: s === "Cari Kolaborator" }))}
      interests={karya.interests}
      roster={karya.roster.map((r) => ({ key: r.handle, name: r.name }))}
      screenshots={karya.landscapeScreenshots?.map((src, i) => ({
        key: src,
        src,
        alt: `${karya.title} — layar ${i + 1}`,
      }))}
      appreciate={
        <AppreciateButton
          count={karya.appreciations + (appreciated ? 1 : 0)}
          active={appreciated}
          onClick={() => onAppreciate(karya.id)}
        />
      }
    />
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
        lineHeight: T.lh.heading,
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
      borderRadius: T.radiusPanel,
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
          <h2 style={{ margin: "0 0 3px", fontFamily: T.fontDisplay, fontSize: T.size.feature, fontWeight: T.weight.regular, lineHeight: T.lh.heading, color: T.ink }}>{karya.title}</h2>
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
          borderRadius: T.radiusCard,
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
              height: 364,
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

// ─── FEED-ONLY: Seeker on-ramp — calm entry to the onboarding agent ─────────────
// Belongs to Scroll/home, not the project directory. Kept here for now; lift out
// when the surfaces settle.
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
      borderRadius: T.radiusPanel,
    }}>
      <div aria-hidden="true" style={{ fontFamily: T.fontDisplay, fontSize: 28, color: T.accent, lineHeight: 1, flexShrink: 0 }}>✦</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: T.size.title, fontWeight: T.weight.regular, color: T.ink, lineHeight: T.lh.heading, marginBottom: 2 }}>
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
        borderRadius: T.radiusCard,
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

// ─── Center — the catalog ───────────────────────────────────────────────────────
function Catalog({ filter, query, appreciated, onAppreciate }: {
  filter: Interest;
  query: string;
  appreciated: Set<number>;
  onAppreciate: (id: number) => void;
}) {
  const q = query.trim().toLowerCase();
  const matched = KARYA.filter((k) => {
    const matchInterest = filter === "Semua" ? true : k.interests.some((i) => i === filter);
    const matchQuery =
      !q ||
      k.title.toLowerCase().includes(q) ||
      k.description.toLowerCase().includes(q) ||
      k.interests.some((i) => i.toLowerCase().includes(q));
    return matchInterest && matchQuery;
  });

  const spotlight = matched.find((k) => k.featured);
  // FEED-ONLY: recency ordering is a feed trait; a finalised directory would order
  // neutrally (e.g. alphabetical). Reverted to newest-first for now.
  const rest = matched
    .filter((k) => k.id !== spotlight?.id)
    .sort((a, b) => a.lastActivity.hoursAgo - b.lastActivity.hoursAgo);

  return (
    <main className="bn-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const, gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: T.size.display, fontWeight: T.weight.regular, letterSpacing: T.track.heading, color: T.ink }}>Karya</h1>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3 }}>Katalog karya komunitas — temukan yang menarik buat kamu</span>
        </div>
      </div>

      {/* FEED-ONLY: seeker on-ramp */}
      <SeekerRamp />

      {/* Featured pick */}
      {spotlight && <Spotlight karya={spotlight} />}

      {/* Full catalog */}
      {matched.length === 0 ? (
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
          Tidak ada karya yang cocok — coba minat lain atau kata kunci berbeda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "4px 0 2px" }}>
            <span style={eyebrow}>Semua karya</span>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, fontVariantNumeric: "tabular-nums" }}>{matched.length} karya</span>
          </div>
          {rest.map((k) => (
            <CatalogCard key={k.id} karya={k} appreciated={appreciated.has(k.id)} onAppreciate={onAppreciate} />
          ))}
        </div>
      )}

      {/* Submit CTA — making a karya belongs on the karya surface */}
      <div style={{
        marginTop: 20,
        padding: "16px 20px",
        borderRadius: T.radiusPanel,
        border: `1.5px dashed ${T.lineDark}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink, marginBottom: 2 }}>Punya karya baru?</div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>Tambahkan ke katalog — komunitas senang lihat progresmu, sekecil apa pun.</div>
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
          Bikin Karya
        </button>
      </div>
    </main>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────
function RightRail({ query, onQuery, filter, onFilter }: {
  query: string;
  onQuery: (q: string) => void;
  filter: Interest;
  onFilter: (f: Interest) => void;
}) {
  const seekingCollab = KARYA.filter((k) => k.stages.includes("Cari Kolaborator")).length;

  return (
    <aside className="bn-rail" style={{
      width: 232,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column" as const,
      gap: 20,
      paddingTop: 0,
    }}>
      {/* Directory search — the catalog's own search, moved out of the reading column */}
      <div>
        <div style={{ ...eyebrow, marginBottom: 8 }}>Cari karya</div>
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Nama, deskripsi, minat…"
          aria-label="Cari karya"
          style={{
            width: "100%",
            boxSizing: "border-box" as const,
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            color: T.ink,
            backgroundColor: T.surface,
            border: `1px solid ${T.line}`,
            borderRadius: T.radiusCard,
            padding: "7px 11px",
          }}
        />
      </div>

      {/* Interest filter — moved here from the left nav */}
      <NavFilterList
        label="Filter Minat"
        options={INTEREST_FILTERS.map((f) => ({ value: f, label: f }))}
        active={filter}
        onSelect={onFilter}
      />

      {/* Community pulse */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusPanel,
        padding: "12px 14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Denyut komunitas</div>
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

      {/* Call to join */}
      <div style={{
        backgroundColor: T.accent,
        borderRadius: T.radiusPanel,
        padding: "14px 16px",
      }}>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.light, color: T.accentFg, lineHeight: T.lh.compact, marginBottom: 10 }}>
          Bergabung sebagai builder Telkom University.
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
          Daftar Sekarang
        </button>
      </div>
    </aside>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function KaryaScreen() {
  const [filter, setFilter] = useState<Interest>("Semua");
  const [query, setQuery] = useState("");
  const [appreciated, setAppreciated] = useState<Set<number>>(new Set());

  function toggleAppreciate(id: number) {
    setAppreciated((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <Shell active="karya">
      <Catalog filter={filter} query={query} appreciated={appreciated} onAppreciate={toggleAppreciate} />
      <RightRail query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} />
    </Shell>
  );
}
