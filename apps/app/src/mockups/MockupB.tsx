/**
 * Al-Fath Berkarya — Launchpad Mockup
 * Direction: Peerlist-style ranked weekly dashboard
 * Self-contained: no imports beyond React, all data hardcoded, tokens inline.
 *
 * To preview: drop into any React sandbox (e.g. StackBlitz, CodeSandbox)
 * with the Google Fonts link in the HTML head:
 *
 *   <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 */

import { useState } from "react";
import { coverFor, screenshots } from "./images";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  bg: "oklch(98% 0 0)",              // gallery white (neutral)
  ink: "oklch(18% 0 0)",             // soft neutral near-black
  ink2: "oklch(46% 0 0)",            // muted body — ~4.7:1 on white (AA)
  ink3: "oklch(64% 0 0)",            // light meta / decorative grey
  accent: "oklch(39% 0.085 62)",     // terracotta (kept)
  accentMid: "oklch(55% 0.085 62)",  // terracotta mid for hover
  accentFg: "oklch(99% 0 0)",        // text on accent
  line: "oklch(91% 0 0)",            // neutral hairline
  lineDark: "oklch(85% 0 0)",
  surface: "oklch(100% 0 0)",        // pure white lifted card
  surfaceHover: "oklch(96.5% 0 0)",
  fontDisplay: "'Instrument Serif', serif", // brand / display copy
  fontBody: "'Plus Jakarta Sans', sans-serif",
  fontMono: "'IBM Plex Mono', monospace",
  radius: "6px",
  radiusLg: "10px",
};

// ─── Sample Data ─────────────────────────────────────────────────────────────
interface Roster { name: string; handle: string }
interface Karya {
  id: number;
  rank: number;
  title: string;
  description: string;
  stages: string[];
  interests: string[];
  roster: Roster[];
  upvotes: number;
  weeklyDelta: number; // rank change vs last week
  featured?: boolean;
}
interface Member {
  id: number;
  name: string;
  handle: string;
  bio: string;
  interests: string[];
  skills: string[];
  year: number;
  major: string;
  karya: number; // count of published karya
}

const KARYA: Karya[] = [
  {
    id: 1, rank: 1, weeklyDelta: 3,
    title: "KampusKerja",
    description: "Platform lowongan magang khusus mahasiswa Telkom — terkoneksi langsung dengan alumni yang sudah bekerja.",
    stages: ["MVP", "Beta"],
    interests: ["Karir", "Networking", "Web"],
    roster: [{ name: "Arief Maulana", handle: "@arief_dev" }, { name: "Siti Rahmah", handle: "@siti_ux" }],
    upvotes: 214,
    featured: true,
  },
  {
    id: 2, rank: 2, weeklyDelta: 0,
    title: "Warung Digital",
    description: "Bantu UMKM sekitar kampus punya toko online sederhana — tanpa ribet, cukup WhatsApp.",
    stages: ["Ide", "Prototype"],
    interests: ["UMKM", "Mobile", "Sosial"],
    roster: [{ name: "Dian Pertiwi", handle: "@dianp" }, { name: "Eko Saputra", handle: "@eko_s" }, { name: "Lina Marlina", handle: "@linax" }],
    upvotes: 187,
  },
  {
    id: 3, rank: 3, weeklyDelta: -1,
    title: "Aksara AI",
    description: "Model bahasa kecil yang dilatih dengan corpus teks Sunda & Jawa — untuk eksperimen NLP lokal.",
    stages: ["Riset"],
    interests: ["AI/ML", "Bahasa", "Open Source"],
    roster: [{ name: "Rizal Hakim", handle: "@rizalh" }],
    upvotes: 156,
  },
  {
    id: 4, rank: 4, weeklyDelta: 2,
    title: "BukuSaku Kampus",
    description: "Ringkasan materi kuliah populer dalam format kartu — dikurasi mahasiswa, untuk mahasiswa.",
    stages: ["MVP"],
    interests: ["Edukasi", "Mobile", "Konten"],
    roster: [{ name: "Nadia Kusuma", handle: "@nadiaku" }, { name: "Budi Santoso", handle: "@budisnt" }],
    upvotes: 134,
  },
  {
    id: 5, rank: 5, weeklyDelta: 1,
    title: "Peta Kost",
    description: "Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif.",
    stages: ["Beta", "Cari Kolaborator"],
    interests: ["Web", "Maps", "Komunitas"],
    roster: [{ name: "Farhan Ardiansyah", handle: "@farhan_a" }],
    upvotes: 112,
  },
  {
    id: 6, rank: 6, weeklyDelta: -2,
    title: "Jadwal Bersama",
    description: "Koordinasi jadwal kelompok tanpa drama — sinkron kalender akademik Telkom secara otomatis.",
    stages: ["Prototype"],
    interests: ["Produktivitas", "Web", "Kolaborasi"],
    roster: [{ name: "Mega Wulandari", handle: "@megaw" }, { name: "Taufik Hidayat", handle: "@taufikhi" }],
    upvotes: 98,
  },
  {
    id: 7, rank: 7, weeklyDelta: 0,
    title: "Sound Nusantara",
    description: "Arsip dan label indie musik mahasiswa — upload gratis, lisensi terbuka, dikurasi komunitas.",
    stages: ["Ide", "Cari Kolaborator"],
    interests: ["Musik", "Komunitas", "Open Source"],
    roster: [{ name: "Aldi Pratama", handle: "@aldip_music" }],
    upvotes: 77,
  },
];

const MEMBERS: Member[] = [
  { id: 1, name: "Arief Maulana", handle: "@arief_dev", bio: "Full-stack, suka bangun produk yang beneran dipakai orang.", interests: ["Karir", "Web"], skills: ["React", "Hono", "PostgreSQL"], year: 3, major: "S1 Teknik Informatika", karya: 3 },
  { id: 2, name: "Nadia Kusuma", handle: "@nadiaku", bio: "Desainer produk yang juga bisa koding CSS.", interests: ["Edukasi", "Konten"], skills: ["Figma", "Tailwind", "Vue"], year: 2, major: "S1 Desain Komunikasi Visual", karya: 2 },
  { id: 3, name: "Rizal Hakim", handle: "@rizalh", bio: "ML enthusiast, tertarik pada bahasa daerah dan NLP.", interests: ["AI/ML", "Bahasa"], skills: ["Python", "PyTorch", "HuggingFace"], year: 4, major: "S1 Teknik Informatika", karya: 4 },
  { id: 4, name: "Dian Pertiwi", handle: "@dianp", bio: "Senang riset pengguna dan problem-solve bareng komunitas.", interests: ["UMKM", "Sosial"], skills: ["UX Research", "Figma", "Notion"], year: 3, major: "S1 Sistem Informasi", karya: 1 },
  { id: 5, name: "Eko Saputra", handle: "@eko_s", bio: "Backend developer, hobi otomasi hal-hal yang bikin frustrasi.", interests: ["Mobile", "Web"], skills: ["Go", "Docker", "PostgreSQL"], year: 3, major: "S1 Teknik Informatika", karya: 2 },
];

const ALL_INTERESTS = Array.from(new Set(KARYA.flatMap((k) => k.interests)));
const ALL_SKILLS = Array.from(new Set(MEMBERS.flatMap((m) => m.skills)));

// ─── Utilities ────────────────────────────────────────────────────────────────
function rankBadge(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function deltaLabel(d: number): { text: string; color: string } {
  if (d > 0) return { text: `+${d}`, color: "oklch(38% 0.12 145)" };
  if (d < 0) return { text: `${d}`, color: "oklch(42% 0.15 25)" };
  return { text: "—", color: T.ink3 };
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// Stable pastel hues from name hash
function avatarColor(name: string): string {
  const hues = [22, 40, 62, 90, 155, 200, 255, 310];
  const idx = name.charCodeAt(0) % hues.length;
  return `oklch(78% 0.08 ${hues[idx]})`;
}

// ─── Micro Components ─────────────────────────────────────────────────────────
function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span style={{
      display: "inline-block",
      fontFamily: T.fontMono,
      fontSize: "10px",
      letterSpacing: "0.03em",
      padding: "1px 7px",
      borderRadius: "3px",
      border: `1px solid ${accent ? T.accent : T.line}`,
      color: accent ? T.accent : T.ink2,
      backgroundColor: accent ? "oklch(95% 0.015 62)" : "transparent",
      whiteSpace: "nowrap" as const,
    }}>{label}</span>
  );
}

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: avatarColor(name),
      color: T.ink,
      fontFamily: T.fontMono,
      fontSize: size * 0.36,
      fontWeight: 500,
      flexShrink: 0,
      border: `1.5px solid ${T.line}`,
      userSelect: "none" as const,
    }}>
      {initials(name)}
    </span>
  );
}

function UpvoteButton({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: "1px",
        padding: "6px 10px",
        border: `1.5px solid ${active ? T.accent : T.line}`,
        borderRadius: T.radius,
        backgroundColor: active ? "oklch(95% 0.015 62)" : T.surface,
        color: active ? T.accent : T.ink2,
        cursor: "pointer",
        fontFamily: T.fontMono,
        fontSize: "11px",
        fontWeight: 500,
        minWidth: 44,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: "13px", lineHeight: 1 }}>▲</span>
      <span>{count}</span>
    </button>
  );
}

// ─── Left Nav Rail ─────────────────────────────────────────────────────────────
type View = "launchpad" | "jelajahi";

const NAV_ITEMS: { label: string; icon: string; view?: View }[] = [
  { label: "Launchpad", icon: "◈", view: "launchpad" },
  { label: "Jelajahi Karya", icon: "◉", view: "jelajahi" },
  { label: "Cari Kolaborator", icon: "◎" },
  { label: "Minat Saya", icon: "◇" },
  { label: "Karya Saya", icon: "◆" },
];

const INTEREST_FILTERS = ["Semua", "Web", "Mobile", "AI/ML", "Desain", "UMKM", "Edukasi", "Komunitas"];

function LeftNav({ view, onNav, activeFilter, onFilter }: {
  view: View;
  onNav: (v: View) => void;
  activeFilter: string;
  onFilter: (f: string) => void;
}) {
  return (
    <aside style={{
      width: 200,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column" as const,
      gap: 0,
      paddingTop: 8,
    }}>
      {/* Logo */}
      <div style={{ padding: "0 12px 20px", borderBottom: `1px solid ${T.line}`, marginBottom: 16 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.ink3, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 4 }}>Al-Fath</div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 23, fontWeight: 400, color: T.ink, lineHeight: 1 }}>Berkarya</div>
      </div>

      {/* Nav items */}
      <nav style={{ marginBottom: 24 }}>
        {NAV_ITEMS.map((item) => {
          const itemActive = item.view !== undefined && item.view === view;
          return (
            <div
              key={item.label}
              onClick={item.view ? () => onNav(item.view as View) : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 12px",
                borderRadius: T.radius,
                backgroundColor: itemActive ? T.accentFg : "transparent",
                color: itemActive ? T.accent : T.ink2,
                fontFamily: T.fontBody,
                fontSize: 13,
                fontWeight: itemActive ? 500 : 400,
                cursor: "pointer",
                marginBottom: 1,
                borderLeft: itemActive ? `2px solid ${T.accent}` : "2px solid transparent",
              }}
            >
              <span style={{ fontFamily: T.fontMono, fontSize: 12 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* Interest filters (Launchpad feed only) */}
      <div style={{ padding: "0 12px", display: view === "launchpad" ? "block" : "none" }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 10 }}>Filter Minat</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
          {INTEREST_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => onFilter(f)}
              style={{
                textAlign: "left" as const,
                background: "none",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                fontFamily: T.fontBody,
                fontSize: 12,
                color: activeFilter === f ? T.accent : T.ink2,
                backgroundColor: activeFilter === f ? "oklch(95% 0.015 62)" : "transparent",
                cursor: "pointer",
                fontWeight: activeFilter === f ? 500 : 400,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* User stub at bottom */}
      <div style={{
        marginTop: "auto",
        paddingTop: 16,
        borderTop: `1px solid ${T.line}`,
        padding: "16px 12px 0",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <Avatar name="Zaki Nadhif" size={28} />
        <div>
          <div style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 500, color: T.ink }}>Zaki Nadhif</div>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3 }}>@zaki_n</div>
        </div>
      </div>
    </aside>
  );
}

// ─── Karya Card ───────────────────────────────────────────────────────────────
function KaryaCard({ karya, voted, onVote }: { karya: Karya; voted: boolean; onVote: (id: number) => void }) {
  const delta = deltaLabel(karya.weeklyDelta);
  const isTop3 = karya.rank <= 3;

  return (
    <article style={{
      display: "flex",
      gap: 12,
      padding: "14px 16px",
      borderRadius: T.radiusLg,
      backgroundColor: T.surface,
      border: `1px solid ${karya.featured ? T.accent : T.line}`,
      boxShadow: karya.featured ? `0 0 0 1px ${T.accent}22, 0 2px 8px #0f0e0b0a` : "0 1px 4px #0f0e0b08",
      position: "relative" as const,
      overflow: "hidden",
    }}>
      {/* Featured ribbon */}
      {karya.featured && (
        <div style={{
          position: "absolute" as const, top: 0, right: 0,
          backgroundColor: T.accent,
          color: T.accentFg,
          fontFamily: T.fontMono,
          fontSize: "9px",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          padding: "3px 9px 3px 12px",
          clipPath: "polygon(8px 0, 100% 0, 100% 100%, 0 100%)",
        }}>
          Pilihan Minggu Ini
        </div>
      )}

      {/* Rank column */}
      <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, paddingTop: 2, minWidth: 32 }}>
        <span style={{
          fontFamily: T.fontMono,
          fontSize: isTop3 ? 18 : 13,
          lineHeight: 1,
          color: isTop3 ? T.ink : T.ink3,
          fontWeight: isTop3 ? 500 : 400,
        }}>
          {isTop3 ? rankBadge(karya.rank) : rankBadge(karya.rank)}
        </span>
        <span style={{ fontFamily: T.fontMono, fontSize: 10, color: delta.color }}>{delta.text}</span>
      </div>

      {/* Upvote */}
      <div style={{ paddingTop: 2 }}>
        <UpvoteButton count={karya.upvotes + (voted ? 1 : 0)} active={voted} onClick={() => onVote(karya.id)} />
      </div>

      {/* Cover thumbnail */}
      <div style={{
        width: 88,
        alignSelf: "stretch",
        minHeight: 76,
        flexShrink: 0,
        borderRadius: T.radius,
        overflow: "hidden",
        border: `1px solid ${T.line}`,
        background: T.bg,
      }}>
        <img
          src={coverFor(karya.interests)}
          alt={karya.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
          <h3 style={{
            margin: 0,
            fontFamily: T.fontDisplay,
            fontSize: 18,
            fontWeight: 400,
            color: T.ink,
            lineHeight: 1.2,
          }}>{karya.title}</h3>
          {karya.stages.map((s) => <Tag key={s} label={s} accent={s === "Cari Kolaborator"} />)}
        </div>

        <p style={{
          margin: "0 0 10px",
          fontFamily: T.fontBody,
          fontSize: 12,
          color: T.ink2,
          lineHeight: 1.55,
        }}>{karya.description}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 8 }}>
          {/* Interests */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
            {karya.interests.map((i) => <Tag key={i} label={i} />)}
          </div>

          {/* Roster avatars */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {karya.roster.slice(0, 4).map((r, idx) => (
              <span key={r.handle} style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: karya.roster.length - idx }}>
                <Avatar name={r.name} size={22} />
              </span>
            ))}
            {karya.roster.length > 4 && (
              <span style={{ marginLeft: -8, zIndex: 0, width: 22, height: 22, borderRadius: "50%", backgroundColor: T.line, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.fontMono, fontSize: 9, color: T.ink2 }}>
                +{karya.roster.length - 4}
              </span>
            )}
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
        fontFamily: T.fontMono,
        fontSize: 15,
        fontWeight: 500,
        color: accent ? T.accent : T.ink,
        lineHeight: 1.1,
        marginBottom: 3,
      }}>{value}</div>
      <div style={{
        fontFamily: T.fontMono,
        fontSize: 9,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
        color: T.ink3,
      }}>{label}</div>
    </div>
  );
}

function Spotlight({ karya }: { karya: Karya }) {
  const delta = deltaLabel(karya.weeklyDelta);
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
        fontFamily: T.fontMono,
        fontSize: 9,
        letterSpacing: "0.12em",
        textTransform: "uppercase" as const,
        color: T.accentFg,
        backgroundColor: T.accent,
        padding: "4px 18px",
      }}>
        ◈ Pilihan Minggu Ini
      </div>

      {/* App header */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "16px 18px 14px" }}>
        {/* App icon */}
        <div style={{
          width: 60,
          height: 60,
          borderRadius: 15,
          flexShrink: 0,
          background: `linear-gradient(145deg, ${T.accentMid}, ${T.accent})`,
          color: T.accentFg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: T.fontMono,
          fontSize: 26,
          fontWeight: 500,
          boxShadow: `0 2px 8px ${T.accent}33`,
        }}>
          {karya.title.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: "0 0 3px", fontFamily: T.fontDisplay, fontSize: 23, fontWeight: 400, lineHeight: 1.1, color: T.ink }}>{karya.title}</h2>
          <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.accentMid, fontWeight: 500, marginBottom: 5 }}>
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
          fontSize: 12,
          fontWeight: 600,
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
        <SpotlightMetric value={`▲ ${karya.upvotes}`} label="Upvote" accent />
        <div style={{ width: 1, backgroundColor: T.line }} />
        <SpotlightMetric value={`#${karya.rank} ${delta.text}`} label="Peringkat" />
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
        fontSize: 13,
        color: T.ink2,
        lineHeight: 1.55,
      }}>{karya.description}</p>

      {/* Screenshot gallery */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "0 18px 8px",
      }}>
        <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
          Tangkapan Layar
        </span>
        <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3 }}>← geser →</span>
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

// ─── Center Feed ──────────────────────────────────────────────────────────────
const WEEKS = ["Minggu ini", "Minggu lalu", "2 minggu lalu"];

function CenterFeed({ filter, votes, onVote }: { filter: string; votes: Set<number>; onVote: (id: number) => void }) {
  const [activeWeek, setActiveWeek] = useState(0);

  const filtered = KARYA.filter((k) =>
    filter === "Semua" ? true : k.interests.some((i) => i === filter)
  );
  const spotlight = filtered.find((k) => k.featured);
  const cards = filtered.filter((k) => k.id !== spotlight?.id);

  return (
    <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const, gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
          <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: 30, fontWeight: 400, letterSpacing: "-0.01em", color: T.ink }}>Launchpad</h1>
          <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.ink3 }}>Karya terbaik minggu ini</span>
        </div>

        {/* Week tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.line}` }}>
          {WEEKS.map((w, i) => (
            <button
              key={w}
              onClick={() => setActiveWeek(i)}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeWeek === i ? `2px solid ${T.accent}` : "2px solid transparent",
                padding: "6px 14px",
                fontFamily: T.fontBody,
                fontSize: 12,
                fontWeight: activeWeek === i ? 500 : 400,
                color: activeWeek === i ? T.accent : T.ink3,
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Spotlight featured app */}
      {spotlight && <Spotlight karya={spotlight} />}

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
            Belum ada karya untuk minat ini.
          </div>
        )}
        {cards.map((k) => (
          <KaryaCard key={k.id} karya={k} voted={votes.has(k.id)} onVote={onVote} />
        ))}
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
          <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 2 }}>Punya karya baru?</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.ink2 }}>Submit sebelum Minggu, 29 Juni 2026 pukul 23:59.</div>
        </div>
        <button style={{
          backgroundColor: T.accent,
          color: T.accentFg,
          border: "none",
          borderRadius: T.radius,
          padding: "8px 16px",
          fontFamily: T.fontBody,
          fontSize: 12,
          fontWeight: 500,
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
function RightRail({ votes }: { votes: Set<number> }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = MEMBERS.filter((m) =>
    searchQuery === "" ? true :
      m.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.interests.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside style={{
      width: 232,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column" as const,
      gap: 20,
      paddingTop: 0,
    }}>
      {/* Social proof strip */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusLg,
        padding: "12px 14px",
      }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 10 }}>Minggu ini</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {[
            { label: "Karya didaftarkan", value: KARYA.length },
            { label: "Total upvote", value: KARYA.reduce((a, k) => a + k.upvotes, 0) + votes.size },
            { label: "Builder aktif", value: MEMBERS.length },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.ink2 }}>{stat.label}</span>
              <span style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 500, color: T.ink }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Builders */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Top Builders</div>
          <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.accentMid, cursor: "pointer" }}>Lihat semua</span>
        </div>

        {/* Search by skill */}
        <input
          type="text"
          placeholder="Cari skill / minat…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box" as const,
            fontFamily: T.fontBody,
            fontSize: 12,
            color: T.ink,
            backgroundColor: T.surface,
            border: `1px solid ${T.line}`,
            borderRadius: T.radius,
            padding: "6px 10px",
            outline: "none",
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
                  <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 500, color: T.ink }}>{m.name}</span>
                  <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3 }}>{m.karya} karya</span>
                </div>
                <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3, marginBottom: 4 }}>{m.handle} · Tkt {m.year}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                  {m.skills.slice(0, 3).map((s) => (
                    <span key={s} style={{
                      fontFamily: T.fontMono,
                      fontSize: 9,
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
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.ink3, padding: "16px 0", textAlign: "center" as const }}>
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
        <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 300, color: T.accentFg, lineHeight: 1.4, marginBottom: 10 }}>
          Bergabung sebagai builder Telkom University.
        </div>
        <button style={{
          backgroundColor: T.accentFg,
          color: T.accent,
          border: "none",
          borderRadius: T.radius,
          padding: "6px 14px",
          fontFamily: T.fontBody,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          width: "100%",
        }}>
          Daftar Sekarang
        </button>
      </div>
    </aside>
  );
}

// ─── Jelajahi Karya — search list row (karya) ──────────────────────────────────
function KaryaRow({ karya }: { karya: Karya }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "104px 1fr auto",
      gap: "12px 20px",
      padding: "18px 0",
      borderBottom: `1px solid ${T.line}`,
      alignItems: "start",
    }}>
      <div style={{
        width: 104,
        aspectRatio: "16 / 10",
        borderRadius: T.radius,
        overflow: "hidden",
        border: `1px solid ${T.line}`,
        background: T.bg,
      }}>
        <img
          src={coverFor(karya.interests)}
          alt={karya.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 400, lineHeight: 1.2, color: T.ink }}>
          {karya.title}
        </h3>
        <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: 12, color: T.ink2, lineHeight: 1.55 }}>
          {karya.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 2 }}>
          {karya.interests.map((t) => <Tag key={t} label={t} />)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 8, paddingTop: 2 }}>
        <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.accentMid }}>▲ {karya.upvotes}</span>
        <span style={{
          fontFamily: T.fontMono,
          fontSize: 9,
          color: T.ink3,
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
        }}>
          {karya.stages[karya.stages.length - 1]}
        </span>
        <div style={{ display: "flex" }}>
          {karya.roster.slice(0, 3).map((r, i) => (
            <span key={r.handle} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: karya.roster.length - i }}>
              <Avatar name={r.name} size={22} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Jelajahi Karya — search list row (member) ─────────────────────────────────
function MemberRow({ member }: { member: Member }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: "0 16px",
      padding: "18px 0",
      borderBottom: `1px solid ${T.line}`,
      alignItems: "start",
    }}>
      <Avatar name={member.name} size={40} />
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 5, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" as const }}>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 400, color: T.ink }}>{member.name}</span>
          <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3 }}>{member.handle}</span>
          <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3, marginLeft: "auto" }}>
            Tkt {member.year} · {member.major}
          </span>
        </div>
        <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: 12, color: T.ink2, lineHeight: 1.55 }}>
          {member.bio}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 2 }}>
          {member.skills.map((s) => <Tag key={s} label={s} accent />)}
          {member.interests.map((i) => <Tag key={i} label={i} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Filter sidebar (right rail in Jelajahi view) ──────────────────────────────
function FilterColumn({ label, items, active, onToggle, mono }: {
  label: string;
  items: string[];
  active: string[];
  onToggle: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <div>
      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
        {items.map((item) => {
          const on = active.includes(item);
          return (
            <button
              key={item}
              onClick={() => onToggle(item)}
              style={{
                textAlign: "left" as const,
                background: on ? "oklch(95% 0.015 62)" : "transparent",
                border: "none",
                borderLeft: on ? `2px solid ${T.accent}` : "2px solid transparent",
                cursor: "pointer",
                fontFamily: mono ? T.fontMono : T.fontBody,
                fontSize: mono ? 11 : 12,
                color: on ? T.accent : T.ink2,
                fontWeight: on ? 500 : 400,
                padding: "4px 8px",
                borderRadius: "0 4px 4px 0",
              }}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Jelajahi Karya (ported from Calm Wide "Cari" surface) ─────────────────────
function Jelajahi() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"karya" | "orang">("karya");
  const [activeInterests, setActiveInterests] = useState<string[]>([]);
  const [activeSkills, setActiveSkills] = useState<string[]>([]);

  function toggle(arr: string[], val: string, set: (v: string[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  const filteredKarya = KARYA.filter((k) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      k.title.toLowerCase().includes(q) ||
      k.description.toLowerCase().includes(q) ||
      k.interests.some((i) => i.toLowerCase().includes(q));
    const matchInterests =
      activeInterests.length === 0 || k.interests.some((i) => activeInterests.includes(i));
    return matchQ && matchInterests;
  });

  const filteredMembers = MEMBERS.filter((m) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.bio.toLowerCase().includes(q) ||
      m.skills.some((s) => s.toLowerCase().includes(q)) ||
      m.interests.some((i) => i.toLowerCase().includes(q));
    const matchSkills =
      activeSkills.length === 0 || m.skills.some((s) => activeSkills.includes(s));
    const matchInterests =
      activeInterests.length === 0 || m.interests.some((i) => activeInterests.includes(i));
    return matchQ && matchSkills && matchInterests;
  });

  const hasFilters = activeInterests.length > 0 || activeSkills.length > 0;

  return (
    <>
      {/* Results column */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const, gap: 20 }}>
        {/* Heading */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: 30, fontWeight: 400, letterSpacing: "-0.01em", color: T.ink }}>Jelajahi Karya</h1>
            <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.ink3 }}>Cari karya & kolaborator</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari karya, orang, skill…"
            style={{
              width: "100%",
              boxSizing: "border-box" as const,
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${T.ink}`,
              outline: "none",
              fontFamily: T.fontBody,
              fontWeight: 300,
              fontSize: 22,
              color: T.ink,
              padding: "6px 0",
              letterSpacing: "-0.02em",
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.line}` }}>
          {([
            { id: "karya", label: "Karya", count: filteredKarya.length },
            { id: "orang", label: "Orang", count: filteredMembers.length },
          ] as const).map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: T.fontBody,
                fontSize: 13,
                fontWeight: tab === id ? 500 : 400,
                padding: "8px 16px 8px 0",
                color: tab === id ? T.accent : T.ink2,
                borderBottom: tab === id ? `2px solid ${T.accent}` : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {label}{" "}
              <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3 }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        {tab === "karya" ? (
          <div>
            {filteredKarya.length === 0 ? (
              <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
                Tidak ada karya yang cocok.
              </p>
            ) : (
              filteredKarya.map((k) => <KaryaRow key={k.id} karya={k} />)
            )}
          </div>
        ) : (
          <div>
            {filteredMembers.length === 0 ? (
              <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
                Tidak ada builder yang cocok.
              </p>
            ) : (
              filteredMembers.map((m) => <MemberRow key={m.id} member={m} />)
            )}
          </div>
        )}
      </main>

      {/* Filter rail */}
      <aside style={{
        width: 232,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column" as const,
        gap: 24,
        position: "sticky" as const,
        top: 68,
      }}>
        <FilterColumn
          label="Minat"
          items={ALL_INTERESTS}
          active={activeInterests}
          onToggle={(v) => toggle(activeInterests, v, setActiveInterests)}
        />
        {tab === "orang" && (
          <FilterColumn
            label="Keahlian"
            items={ALL_SKILLS}
            active={activeSkills}
            onToggle={(v) => toggle(activeSkills, v, setActiveSkills)}
            mono
          />
        )}
        {hasFilters && (
          <button
            onClick={() => { setActiveInterests([]); setActiveSkills([]); }}
            style={{
              background: "none",
              border: `1px solid ${T.line}`,
              cursor: "pointer",
              fontFamily: T.fontMono,
              fontSize: 10,
              color: T.ink2,
              padding: "6px 10px",
              borderRadius: T.radius,
              letterSpacing: "0.04em",
              alignSelf: "flex-start",
            }}
          >
            Hapus filter
          </button>
        )}
      </aside>
    </>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function LaunchpadMockup() {
  const [filter, setFilter] = useState("Semua");
  const [view, setView] = useState<"launchpad" | "jelajahi">("launchpad");
  const [votes, setVotes] = useState<Set<number>>(new Set());

  function handleVote(id: number) {
    setVotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div style={{
      backgroundColor: T.bg,
      minHeight: "100vh",
      fontFamily: T.fontBody,
      color: T.ink,
    }}>
      <style>{`
        .spotlight-carousel::-webkit-scrollbar { height: 8px; }
        .spotlight-carousel::-webkit-scrollbar-thumb {
          background: ${T.lineDark};
          border-radius: 99px;
        }
        .spotlight-carousel::-webkit-scrollbar-track { background: transparent; }
      `}</style>
      {/* Three-column layout */}
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "24px 24px 48px",
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
      }}>
        <LeftNav view={view} onNav={setView} activeFilter={filter} onFilter={setFilter} />
        {view === "launchpad" ? (
          <>
            <CenterFeed filter={filter} votes={votes} onVote={handleVote} />
            <RightRail votes={votes} />
          </>
        ) : (
          <Jelajahi />
        )}
      </div>
    </div>
  );
}
