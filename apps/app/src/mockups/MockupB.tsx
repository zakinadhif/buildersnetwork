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

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  bg: "#f1efe9",
  ink: "#0f0e0b",
  ink2: "#8a8781",
  ink3: "#bbb8b2",
  accent: "oklch(39% 0.085 62)",     // terracotta
  accentMid: "oklch(55% 0.085 62)",  // terracotta mid for hover
  accentFg: "#f9f6f0",               // text on accent
  line: "#dedad2",
  lineDark: "#c8c4bc",
  surface: "#faf9f5",                // slightly lifted card
  surfaceHover: "#f5f2eb",
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
const NAV_ITEMS = [
  { label: "Launchpad", icon: "◈", active: true },
  { label: "Jelajahi Karya", icon: "◉", active: false },
  { label: "Cari Kolaborator", icon: "◎", active: false },
  { label: "Minat Saya", icon: "◇", active: false },
  { label: "Karya Saya", icon: "◆", active: false },
];

const INTEREST_FILTERS = ["Semua", "Web", "Mobile", "AI/ML", "Desain", "UMKM", "Edukasi", "Komunitas"];

function LeftNav({ activeFilter, onFilter }: { activeFilter: string; onFilter: (f: string) => void }) {
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
        <div style={{ fontFamily: T.fontBody, fontSize: 18, fontWeight: 300, color: T.ink, lineHeight: 1.1 }}>Berkarya</div>
      </div>

      {/* Nav items */}
      <nav style={{ marginBottom: 24 }}>
        {NAV_ITEMS.map((item) => (
          <div key={item.label} style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "7px 12px",
            borderRadius: T.radius,
            backgroundColor: item.active ? T.accentFg : "transparent",
            color: item.active ? T.accent : T.ink2,
            fontFamily: T.fontBody,
            fontSize: 13,
            fontWeight: item.active ? 500 : 400,
            cursor: "pointer",
            marginBottom: 1,
            borderLeft: item.active ? `2px solid ${T.accent}` : "2px solid transparent",
          }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 12 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      {/* Interest filters */}
      <div style={{ padding: "0 12px" }}>
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

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
          <h3 style={{
            margin: 0,
            fontFamily: T.fontBody,
            fontSize: 14,
            fontWeight: 600,
            color: T.ink,
            lineHeight: 1.3,
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

// ─── Center Feed ──────────────────────────────────────────────────────────────
const WEEKS = ["Minggu ini", "Minggu lalu", "2 minggu lalu"];

function CenterFeed({ filter, votes, onVote }: { filter: string; votes: Set<number>; onVote: (id: number) => void }) {
  const [activeWeek, setActiveWeek] = useState(0);

  const filtered = KARYA.filter((k) =>
    filter === "Semua" ? true : k.interests.some((i) => i === filter)
  );

  return (
    <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const, gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
          <h1 style={{ margin: 0, fontFamily: T.fontBody, fontSize: 22, fontWeight: 300, color: T.ink }}>Launchpad</h1>
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

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
            Belum ada karya untuk minat ini.
          </div>
        )}
        {filtered.map((k) => (
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

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function LaunchpadMockup() {
  const [filter, setFilter] = useState("Semua");
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
      {/* Top bar */}
      <header style={{
        borderBottom: `1px solid ${T.line}`,
        backgroundColor: T.bg,
        position: "sticky" as const,
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 44,
      }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.ink3, letterSpacing: "0.06em" }}>
          ◈ Al-Fath Berkarya · Launchpad
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.line}`,
            borderRadius: T.radius,
            padding: "4px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.ink3 }}>⌕</span>
            <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.ink3 }}>Cari karya, orang, skill…</span>
          </div>
          <button style={{
            backgroundColor: T.accent,
            color: T.accentFg,
            border: "none",
            borderRadius: T.radius,
            padding: "5px 12px",
            fontFamily: T.fontBody,
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
          }}>
            + Karya Baru
          </button>
        </div>
      </header>

      {/* Three-column layout */}
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "24px 24px 48px",
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
      }}>
        <LeftNav activeFilter={filter} onFilter={setFilter} />
        <CenterFeed filter={filter} votes={votes} onVote={handleVote} />
        <RightRail votes={votes} />
      </div>
    </div>
  );
}
