/**
 * Al-Fath Berkarya — Launchpad Mockup
 * Direction: calm, curated + reverse-chronological discovery feed
 *   (no ranking, no leaderboard — the karya leads, nothing is "winning")
 * Self-contained: no imports beyond React, all data hardcoded, tokens inline.
 *
 * To preview: drop into any React sandbox (e.g. StackBlitz, CodeSandbox)
 * with the Google Fonts link in the HTML head:
 *
 *   <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
  fontBody: "'Plus Jakarta Sans', sans-serif", // everything else: body, labels, meta
  radius: "6px",
  radiusLg: "10px",
};

// ─── Sample Data ─────────────────────────────────────────────────────────────
interface Roster { name: string; handle: string }
interface Karya {
  id: number;
  title: string;
  description: string;
  stages: string[];
  interests: string[];
  roster: Roster[];
  appreciations: number;
  lastActivity: { text: string; hoursAgo: number }; // drives the chronological feed
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
    id: 1,
    title: "KampusKerja",
    description: "Platform lowongan magang khusus mahasiswa Telkom — terkoneksi langsung dengan alumni yang sudah bekerja.",
    stages: ["MVP", "Beta"],
    interests: ["Karir", "Networking", "Web"],
    roster: [{ name: "Arief Maulana", handle: "@arief_dev" }, { name: "Siti Rahmah", handle: "@siti_ux" }],
    appreciations: 214,
    lastActivity: { text: "Rilis beta terbuka", hoursAgo: 5 },
    featured: true,
  },
  {
    id: 2,
    title: "Warung Digital",
    description: "Bantu UMKM sekitar kampus punya toko online sederhana — tanpa ribet, cukup WhatsApp.",
    stages: ["Ide", "Prototype"],
    interests: ["UMKM", "Mobile", "Sosial"],
    roster: [{ name: "Dian Pertiwi", handle: "@dianp" }, { name: "Eko Saputra", handle: "@eko_s" }, { name: "Lina Marlina", handle: "@linax" }],
    appreciations: 187,
    lastActivity: { text: "Pasang update progres", hoursAgo: 2 },
  },
  {
    id: 3,
    title: "Aksara AI",
    description: "Model bahasa kecil yang dilatih dengan corpus teks Sunda & Jawa — untuk eksperimen NLP lokal.",
    stages: ["Riset"],
    interests: ["AI/ML", "Bahasa", "Open Source"],
    roster: [{ name: "Rizal Hakim", handle: "@rizalh" }],
    appreciations: 156,
    lastActivity: { text: "Bagikan catatan riset", hoursAgo: 9 },
  },
  {
    id: 4,
    title: "BukuSaku Kampus",
    description: "Ringkasan materi kuliah populer dalam format kartu — dikurasi mahasiswa, untuk mahasiswa.",
    stages: ["MVP"],
    interests: ["Edukasi", "Mobile", "Konten"],
    roster: [{ name: "Nadia Kusuma", handle: "@nadiaku" }, { name: "Budi Santoso", handle: "@budisnt" }],
    appreciations: 134,
    lastActivity: { text: "Tambah 12 kartu materi", hoursAgo: 20 },
  },
  {
    id: 5,
    title: "Peta Kost",
    description: "Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif.",
    stages: ["Beta", "Cari Kolaborator"],
    interests: ["Web", "Maps", "Komunitas"],
    roster: [{ name: "Farhan Ardiansyah", handle: "@farhan_a" }],
    appreciations: 112,
    lastActivity: { text: "Buka lowongan kolaborator", hoursAgo: 26 },
  },
  {
    id: 6,
    title: "Jadwal Bersama",
    description: "Koordinasi jadwal kelompok tanpa drama — sinkron kalender akademik Telkom secara otomatis.",
    stages: ["Prototype"],
    interests: ["Produktivitas", "Web", "Kolaborasi"],
    roster: [{ name: "Mega Wulandari", handle: "@megaw" }, { name: "Taufik Hidayat", handle: "@taufikhi" }],
    appreciations: 98,
    lastActivity: { text: "Pasang update progres", hoursAgo: 38 },
  },
  {
    id: 7,
    title: "Sound Nusantara",
    description: "Arsip dan label indie musik mahasiswa — upload gratis, lisensi terbuka, dikurasi komunitas.",
    stages: ["Ide", "Cari Kolaborator"],
    interests: ["Musik", "Komunitas", "Open Source"],
    roster: [{ name: "Aldi Pratama", handle: "@aldip_music" }],
    appreciations: 77,
    lastActivity: { text: "Buka lowongan kolaborator", hoursAgo: 52 },
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
function relativeTime(hoursAgo: number): string {
  if (hoursAgo < 1) return "baru saja";
  if (hoursAgo < 24) return `${hoursAgo} jam lalu`;
  const days = Math.round(hoursAgo / 24);
  return days === 1 ? "kemarin" : `${days} hari lalu`;
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// Stable pastel hues from a full-string hash (avoids first-letter collisions)
function avatarColor(name: string): string {
  const hues = [22, 40, 62, 90, 155, 200, 255, 310];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `oklch(78% 0.08 ${hues[h % hues.length]})`;
}

// ─── Micro Components ─────────────────────────────────────────────────────────
function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span style={{
      display: "inline-block",
      fontFamily: T.fontBody,
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
      fontFamily: T.fontBody,
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
        backgroundColor: active ? "oklch(95% 0.015 62)" : "transparent",
        color: active ? T.accent : T.ink2,
        cursor: "pointer",
        fontFamily: T.fontBody,
        fontSize: "11px",
        fontWeight: 500,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: "12px", lineHeight: 1 }}>{active ? "♥" : "♡"}</span>
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
        <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.ink3, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 4 }}>Al-Fath</div>
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
              <span style={{ fontFamily: T.fontBody, fontSize: 12 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* Interest filters (Launchpad feed only) */}
      <div style={{ padding: "0 12px", display: view === "launchpad" ? "block" : "none" }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 10 }}>Filter Minat</div>
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
          <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3 }}>@zaki_n</div>
        </div>
      </div>
    </aside>
  );
}

// ─── Karya Feed Row (reverse-chronological activity) ───────────────────────────
function KaryaFeedRow({ karya, appreciated, onAppreciate }: { karya: Karya; appreciated: boolean; onAppreciate: (id: number) => void }) {
  return (
    <article style={{
      display: "flex",
      gap: 14,
      padding: "16px 2px",
      borderBottom: `1px solid ${T.line}`,
    }}>
      {/* Cover thumbnail */}
      <div style={{
        width: 96,
        aspectRatio: "16 / 11",
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
        {/* Activity line — what's new, and when */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontFamily: T.fontBody, fontSize: 10, letterSpacing: "0.02em" }}>
          <span style={{ color: T.accentMid }}>{karya.lastActivity.text}</span>
          <span style={{ color: T.ink3 }}>·</span>
          <span style={{ color: T.ink3 }}>{relativeTime(karya.lastActivity.hoursAgo)}</span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
          <h3 style={{
            margin: 0,
            fontFamily: T.fontDisplay,
            fontSize: 19,
            fontWeight: 400,
            color: T.ink,
            lineHeight: 1.15,
          }}>{karya.title}</h3>
          {karya.stages.map((s) => <Tag key={s} label={s} accent={s === "Cari Kolaborator"} />)}
        </div>

        <p style={{
          margin: "0 0 10px",
          fontFamily: T.fontBody,
          fontSize: 12.5,
          color: T.ink2,
          lineHeight: 1.55,
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
                <span style={{ marginLeft: -8, zIndex: 0, width: 22, height: 22, borderRadius: "50%", backgroundColor: T.line, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.fontBody, fontSize: 9, color: T.ink2 }}>
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
    </article>
  );
}

// ─── Spotlight (Play-Store-style featured listing) ─────────────────────────────
function SpotlightMetric({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div style={{ flex: 1, textAlign: "center" as const, padding: "0 4px" }}>
      <div style={{
        fontFamily: T.fontBody,
        fontSize: 15,
        fontWeight: 500,
        color: accent ? T.accent : T.ink,
        lineHeight: 1.1,
        marginBottom: 3,
      }}>{value}</div>
      <div style={{
        fontFamily: T.fontBody,
        fontSize: 9,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
        color: T.ink3,
      }}>{label}</div>
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
        fontFamily: T.fontBody,
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
          fontFamily: T.fontBody,
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
        <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
          Tangkapan Layar
        </span>
        <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3 }}>← geser →</span>
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
      background: "oklch(96.5% 0.012 62)",
      border: "1px solid oklch(88% 0.03 62)",
      borderRadius: T.radiusLg,
    }}>
      <div style={{ fontFamily: T.fontDisplay, fontSize: 28, color: T.accent, lineHeight: 1, flexShrink: 0 }}>✦</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 400, color: T.ink, lineHeight: 1.15, marginBottom: 2 }}>
          Belum tahu mau bikin apa?
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.ink2, lineHeight: 1.5 }}>
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
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
      }}>
        Mulai cari arah →
      </button>
    </section>
  );
}

// ─── Center Feed ──────────────────────────────────────────────────────────────
function CenterFeed({ filter, appreciated, onAppreciate }: { filter: string; appreciated: Set<number>; onAppreciate: (id: number) => void }) {
  const filtered = KARYA.filter((k) =>
    filter === "Semua" ? true : k.interests.some((i) => i === filter)
  );
  const spotlight = filtered.find((k) => k.featured);
  const feed = filtered
    .filter((k) => k.id !== spotlight?.id)
    .sort((a, b) => a.lastActivity.hoursAgo - b.lastActivity.hoursAgo); // newest first

  return (
    <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const, gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: 30, fontWeight: 400, letterSpacing: "-0.01em", color: T.ink }}>Launchpad</h1>
          <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.ink3 }}>Apa yang lagi dikerjakan komunitas</span>
        </div>
      </div>

      {/* Seeker on-ramp */}
      <SeekerRamp />

      {/* Curated feature — Pilihan Minggu Ini */}
      {spotlight && <Spotlight karya={spotlight} />}

      {/* Reverse-chronological feed */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
            Belum ada karya untuk minat ini — coba minat lain, atau jadilah yang pertama.
          </div>
        ) : (
          <>
            <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3, letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "4px 0 2px" }}>
              Kabar terbaru
            </div>
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
          <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 2 }}>Punya karya baru?</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.ink2 }}>Bagikan kapan saja — komunitas senang lihat progresmu, sekecil apa pun.</div>
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
        <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 10 }}>Denyut minggu ini</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {[
            { label: "Karya aktif", value: KARYA.length },
            { label: "Builder aktif", value: MEMBERS.length },
            { label: "Cari kolaborator", value: seekingCollab },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.ink2 }}>{stat.label}</span>
              <span style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 500, color: T.ink }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Builders */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Kenalan dengan builder</div>
          <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.accentMid, cursor: "pointer" }}>Lihat semua</span>
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
                  <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3 }}>{m.karya} karya</span>
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3, marginBottom: 4 }}>{m.handle} · Tkt {m.year}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                  {m.skills.slice(0, 3).map((s) => (
                    <span key={s} style={{
                      fontFamily: T.fontBody,
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
        <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.accentMid }}>♥ {karya.appreciations}</span>
        <span style={{
          fontFamily: T.fontBody,
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
          <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3 }}>{member.handle}</span>
          <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3, marginLeft: "auto" }}>
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
      <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 10 }}>
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
                fontFamily: mono ? T.fontBody : T.fontBody,
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
            <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.ink3 }}>Cari karya & kolaborator</span>
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
              <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.ink3 }}>{count}</span>
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
              fontFamily: T.fontBody,
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
  const [appreciated, setAppreciated] = useState<Set<number>>(new Set());

  function toggleAppreciate(id: number) {
    setAppreciated((prev) => {
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
            <CenterFeed filter={filter} appreciated={appreciated} onAppreciate={toggleAppreciate} />
            <RightRail />
          </>
        ) : (
          <Jelajahi />
        )}
      </div>
    </div>
  );
}
