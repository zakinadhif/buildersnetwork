/**
 * Al-Fath Berkarya — Launchpad Mockup
 * Direction: calm, curated + reverse-chronological discovery feed
 *   (no ranking, no leaderboard — the karya leads, nothing is "winning")
 * Self-contained: no imports beyond React, all data hardcoded, tokens inline.
 *
 * Type: display switcher (Lora / Instrument Serif) + body switcher (Plus Jakarta / Figtree / DM Sans / Manrope / Outfit).
 * Hierarchy rides a committed scale (T.size/weight/track/lh), not ad-hoc px.
 *
 * To preview: drop into any React sandbox (e.g. StackBlitz, CodeSandbox)
 * with the Google Fonts link in the HTML head:
 *
 *   <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;1,400&family=Figtree:wght@300;400;500;600&display=swap" rel="stylesheet">
 */

import { useState } from "react";
import { coverFor, covers, screenshots } from "./images";
import { useNavigate, NAV_SCREEN } from "./gallery";
import { useFonts } from "./fonts";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  bg: "oklch(98% 0 0)",              // gallery white (neutral)
  ink: "oklch(18% 0 0)",             // soft neutral near-black
  ink2: "oklch(46% 0 0)",            // muted body — ~4.7:1 on white (AA)
  ink3: "oklch(53% 0 0)",            // meta text — ~5:1 on bg (AA)
  accent: "oklch(39% 0.085 62)",     // terracotta (kept)
  accentMid: "oklch(55% 0.085 62)",  // terracotta mid — ~4.7:1 on bg (AA)
  accentFg: "oklch(99% 0 0)",        // text on accent
  accentTint: "oklch(95% 0.015 62)", // light terracotta wash — chips, active rows, seeker
  accentLine: "oklch(88% 0.03 62)",  // terracotta-tinted hairline (seeker block)
  line: "oklch(91% 0 0)",            // neutral hairline
  lineDark: "oklch(85% 0 0)",
  surface: "oklch(100% 0 0)",        // pure white lifted card
  fontDisplay: "'Lora', serif" as string,                 // brand / display copy (weight 400 only)
  fontBody: "'Plus Jakarta Sans', sans-serif" as string,  // everything else: body, labels, meta

  // Type scale — fixed px (desktop product UI; port to rem for the shipping app).
  // Distinct roles, not arbitrary steps. The bottom four are 1px apart by design:
  // dense meta separated further by case + weight + colour.
  size: {
    micro: 10,    // eyebrow labels, tags, chips, dense inline meta
    caption: 11,  // subtitles, standalone secondary text, small counts
    ui: 12,       // nav, filters, controls, buttons, secondary body
    body: 13,     // primary body: descriptions, bios
    stat: 15,     // featured metric values
    title: 18,    // serif list-item titles + callout heading
    feature: 23,  // serif wordmark + featured title
    display: 30,  // serif page heading
  },
  weight: { light: 300, regular: 400, medium: 500, semibold: 600 },
  track: { wide: "0.08em", tag: "0.02em", tight: "-0.01em" }, // letter-spacing roles
  lh: { tight: 1.15, snug: 1.3, body: 1.55 },                 // line-height roles
  radius: "8px",
  radiusLg: "16px",
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
  landscapeScreenshots?: string[];
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
    landscapeScreenshots: [covers.education, covers.writing, covers.productivity, covers.community],
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
    landscapeScreenshots: [covers.maps, covers.community, covers.environment, covers.devtools],
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
    landscapeScreenshots: [covers.productivity, covers.ai, covers.data],
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

// Shared style for short uppercase eyebrow/section labels.
const eyebrow = {
  fontFamily: T.fontBody,
  fontSize: T.size.micro,
  fontWeight: T.weight.medium,
  letterSpacing: T.track.wide,
  textTransform: "uppercase" as const,
  color: T.ink3,
};

// ─── Micro Components ─────────────────────────────────────────────────────────
function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span style={{
      display: "inline-block",
      fontFamily: T.fontBody,
      fontSize: T.size.micro,
      letterSpacing: T.track.tag,
      padding: "1px 7px",
      borderRadius: "3px",
      border: `1px solid ${accent ? T.accent : T.line}`,
      color: accent ? T.accent : T.ink2,
      backgroundColor: accent ? T.accentTint : "transparent",
      whiteSpace: "nowrap" as const,
    }}>{label}</span>
  );
}

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span aria-hidden="true" style={{
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
      fontWeight: T.weight.medium,
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

// ─── Left Nav Rail ─────────────────────────────────────────────────────────────
type View = "launchpad" | "jelajahi";

const NAV_ITEMS: { label: string; icon: string }[] = [
  { label: "Launchpad", icon: "◈" },
  { label: "Jelajahi Karya", icon: "◉" },
  { label: "Cari Kolaborator", icon: "◎" },
  { label: "Minat Saya", icon: "◇" },
  { label: "Karya Saya", icon: "◆" },
];

const INTEREST_FILTERS = ["Semua", "Web", "Mobile", "AI/ML", "Desain", "UMKM", "Edukasi", "Komunitas"];

function LeftNav({ view, activeFilter, onFilter }: {
  view: View;
  activeFilter: string;
  onFilter: (f: string) => void;
}) {
  const navigate = useNavigate();
  return (
    <aside className="bn-nav" style={{
      width: 200,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column" as const,
      gap: 0,
      paddingTop: 8,
    }}>
      {/* Logo */}
      <div className="bn-nav-logo" style={{ padding: "0 12px 20px", borderBottom: `1px solid ${T.line}`, marginBottom: 16 }}>
        <div style={{ ...eyebrow, marginBottom: 4 }}>Al-Fath</div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: T.size.feature, fontWeight: T.weight.regular, color: T.ink, lineHeight: 1 }}>Berkarya</div>
      </div>

      {/* Nav items */}
      <nav className="bn-nav-items" style={{ marginBottom: 24 }}>
        {NAV_ITEMS.map((item) => {
          const target = NAV_SCREEN[item.label];
          const itemActive = target !== undefined && target === view;
          return (
            <button
              key={item.label}
              type="button"
              onClick={target ? () => navigate(target) : undefined}
              aria-current={itemActive ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                textAlign: "left" as const,
                border: "none",
                padding: "7px 12px",
                borderRadius: T.radius,
                backgroundColor: itemActive ? T.accentTint : "transparent",
                color: itemActive ? T.accent : T.ink2,
                fontFamily: T.fontBody,
                fontSize: T.size.body,
                fontWeight: itemActive ? T.weight.medium : T.weight.regular,
                cursor: "pointer",
                marginBottom: 1,
              }}
            >
              <span aria-hidden="true" style={{ fontFamily: T.fontBody, fontSize: T.size.ui }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Interest filters (Launchpad feed only) */}
      <div className="bn-nav-filters" style={{ padding: "0 12px", display: view === "launchpad" ? "block" : "none" }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Filter Minat</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
          {INTEREST_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilter(f)}
              aria-pressed={activeFilter === f}
              style={{
                textAlign: "left" as const,
                background: "none",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                fontFamily: T.fontBody,
                fontSize: T.size.ui,
                color: activeFilter === f ? T.accent : T.ink2,
                backgroundColor: activeFilter === f ? T.accentTint : "transparent",
                cursor: "pointer",
                fontWeight: activeFilter === f ? T.weight.medium : T.weight.regular,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* User stub at bottom */}
      <div className="bn-nav-user" style={{
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
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>Zaki Nadhif</div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>@zaki_n</div>
        </div>
      </div>
    </aside>
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
function CenterFeed({ filter, appreciated, onAppreciate }: { filter: string; appreciated: Set<number>; onAppreciate: (id: number) => void }) {
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

// ─── Jelajahi Karya — search list row (karya) ──────────────────────────────────
function KaryaRow({ karya }: { karya: Karya }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "56px 1fr auto",
      gap: "12px 20px",
      padding: "18px 0",
      borderBottom: `1px solid ${T.line}`,
      alignItems: "start",
    }}>
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
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: T.size.title, fontWeight: T.weight.regular, lineHeight: T.lh.tight, color: T.ink }}>
          {karya.title}
        </h3>
        <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink2, lineHeight: T.lh.body }}>
          {karya.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 2 }}>
          {karya.interests.map((t) => <Tag key={t} label={t} />)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 8, paddingTop: 2 }}>
        <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.accentMid }}>♥ {karya.appreciations}</span>
        <span style={eyebrow}>{karya.stages[karya.stages.length - 1]}</span>
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
          <span style={{ fontFamily: T.fontDisplay, fontSize: T.size.title, fontWeight: T.weight.regular, color: T.ink }}>{member.name}</span>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>{member.handle}</span>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginLeft: "auto" }}>
            Tkt {member.year} · {member.major}
          </span>
        </div>
        <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink2, lineHeight: T.lh.body }}>
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
function FilterColumn({ label, items, active, onToggle }: {
  label: string;
  items: string[];
  active: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <div style={{ ...eyebrow, marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
        {items.map((item) => {
          const on = active.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              aria-pressed={on}
              style={{
                textAlign: "left" as const,
                background: on ? T.accentTint : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: T.fontBody,
                fontSize: T.size.ui,
                color: on ? T.accent : T.ink2,
                fontWeight: on ? T.weight.medium : T.weight.regular,
                padding: "4px 8px",
                borderRadius: "4px",
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
      <main className="bn-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const, gap: 20 }}>
        {/* Heading */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: T.size.display, fontWeight: T.weight.regular, letterSpacing: T.track.tight, color: T.ink }}>Jelajahi Karya</h1>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3 }}>Cari karya & kolaborator</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari karya, orang, skill…"
            aria-label="Cari karya, orang, atau skill"
            style={{
              width: "100%",
              boxSizing: "border-box" as const,
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${T.ink}`,
              fontFamily: T.fontBody,
              fontWeight: T.weight.light,
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
                fontSize: T.size.body,
                fontWeight: tab === id ? T.weight.medium : T.weight.regular,
                padding: "8px 16px 8px 0",
                color: tab === id ? T.accent : T.ink2,
                borderBottom: tab === id ? `2px solid ${T.accent}` : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {label}{" "}
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        {tab === "karya" ? (
          <div>
            {filteredKarya.length === 0 ? (
              <p style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
                Tidak ada karya yang cocok.
              </p>
            ) : (
              filteredKarya.map((k) => <KaryaRow key={k.id} karya={k} />)
            )}
          </div>
        ) : (
          <div>
            {filteredMembers.length === 0 ? (
              <p style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
                Tidak ada builder yang cocok.
              </p>
            ) : (
              filteredMembers.map((m) => <MemberRow key={m.id} member={m} />)
            )}
          </div>
        )}
      </main>

      {/* Filter rail */}
      <aside className="bn-rail" style={{
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
              fontSize: T.size.micro,
              color: T.ink2,
              padding: "6px 10px",
              borderRadius: T.radius,
              letterSpacing: T.track.tag,
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
export default function LaunchpadMockup({ screen }: { screen: "launchpad" | "jelajahi" }) {
  const view = screen;
  const [filter, setFilter] = useState("Semua");
  const [appreciated, setAppreciated] = useState<Set<number>>(new Set());

  // Apply chosen fonts before render — all child refs to T.fontDisplay / T.fontBody pick this up.
  const { displayFont, bodyFont } = useFonts();
  T.fontDisplay = displayFont;
  T.fontBody = bodyFont;

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
        /* Even line breaks on display type; fewer orphans in prose.
           overflow-wrap guards against long unbroken strings (URLs, IDs). */
        h1, h2, h3 { text-wrap: balance; overflow-wrap: break-word; }
        p { text-wrap: pretty; overflow-wrap: break-word; }
        /* Visible keyboard focus on every interactive control. */
        button:focus-visible, a:focus-visible, input:focus-visible, [tabindex]:focus-visible {
          outline: 2px solid ${T.accent};
          outline-offset: 2px;
          border-radius: ${T.radius};
        }
        /* Placeholder held to the body-text contrast bar, not the UA grey. */
        input::placeholder { color: ${T.ink3}; opacity: 1; }
        .spotlight-carousel::-webkit-scrollbar { height: 8px; }
        .spotlight-carousel::-webkit-scrollbar-thumb {
          background: ${T.lineDark};
          border-radius: 99px;
        }
        .spotlight-carousel::-webkit-scrollbar-track { background: transparent; }
        .landscape-carousel { scrollbar-width: none; }
        .landscape-carousel::-webkit-scrollbar { display: none; }
        /* Honour reduced-motion: collapse the 0.15s state transitions. */
        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
        /* ── Responsive ──────────────────────────────────────────────────────
           Below ~900px the three columns can't hold their measure. Stack to a
           single column led by the feed (mobile = the consumption view), and
           fold the left rail into a compact top nav bar. */
        @media (max-width: 900px) {
          .bn-shell { flex-direction: column; padding: 16px 16px 40px; gap: 20px; }
          .bn-nav, .bn-main, .bn-rail { width: 100% !important; }
          .bn-rail { position: static !important; top: auto !important; }
          .bn-nav {
            flex-direction: row !important;
            flex-wrap: wrap;
            align-items: center;
            gap: 6px 16px;
            padding-top: 0 !important;
            padding-bottom: 14px;
            border-bottom: 1px solid ${T.line};
          }
          .bn-nav-logo { margin: 0 auto 0 0 !important; padding: 0 !important; border-bottom: none !important; }
          .bn-nav-items { display: flex !important; flex-flow: row wrap; gap: 2px 4px; margin: 0 !important; }
          .bn-nav-items button { width: auto !important; }
          /* Interest filters + profile stub are desktop-only chrome; the feed
             and Jelajahi search carry discovery on mobile. */
          .bn-nav-filters, .bn-nav-user { display: none !important; }
        }
        /* Comfortable touch targets where the pointer is coarse. */
        @media (pointer: coarse) {
          .bn-nav-items button { min-height: 44px; }
        }
      `}</style>
      {/* Three-column layout (collapses to one column below ~900px) */}
      <div className="bn-shell" style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "24px 24px 48px",
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
      }}>
        <LeftNav view={view} activeFilter={filter} onFilter={setFilter} />
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
