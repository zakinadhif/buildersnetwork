/**
 * Al-Fath Berkarya — Cari Kolaborator Mockup (Direction B: Intent-typed)
 *
 * The board is organized by *intent* — what everyone is looking for — not by
 * person-vs-project. Inside each section (Tim Hackathon · Tim Project ·
 * Talenta/Gig), both people-seeking and karya-seeking cards appear together.
 * The Tim Hackathon section carries the FR-29 event-scoped gesture: a banner
 * for GEMASTIK 2026 with deadline and team-forming count heads it.
 *
 * Design tokens, helpers, and micro-components are copied verbatim from MockupB.
 * Self-contained: imports only React (useState) and ./images (coverFor).
 */

import { useState } from "react";
import { coverFor } from "./images";

// ─── Design Tokens (verbatim from MockupB) ────────────────────────────────────
const T = {
  bg: "oklch(98% 0 0)",
  ink: "oklch(18% 0 0)",
  ink2: "oklch(46% 0 0)",
  ink3: "oklch(53% 0 0)",
  accent: "oklch(39% 0.085 62)",
  accentMid: "oklch(55% 0.085 62)",
  accentFg: "oklch(99% 0 0)",
  accentTint: "oklch(95% 0.015 62)",
  accentLine: "oklch(88% 0.03 62)",
  line: "oklch(91% 0 0)",
  lineDark: "oklch(85% 0 0)",
  surface: "oklch(100% 0 0)",
  fontDisplay: "'Lora', serif" as string,
  fontBody: "'Plus Jakarta Sans', sans-serif" as string,
  size: {
    micro: 10,
    caption: 11,
    ui: 12,
    body: 13,
    stat: 15,
    title: 18,
    feature: 23,
    display: 30,
  },
  weight: { light: 300, regular: 400, medium: 500, semibold: 600 },
  track: { wide: "0.08em", tag: "0.02em", tight: "-0.01em" },
  lh: { tight: 1.15, snug: 1.3, body: 1.55 },
  radius: "8px",
  radiusLg: "16px",
};

const DISPLAY_FONTS = [
  { font: "'Lora', serif",             label: "Lora" },
  { font: "'Instrument Serif', serif", label: "Instrument Serif" },
] as const;

const BODY_FONTS = [
  { font: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta" },
  { font: "'Figtree', sans-serif",           label: "Figtree" },
  { font: "'DM Sans', sans-serif",           label: "DM Sans" },
  { font: "'Manrope', sans-serif",           label: "Manrope" },
  { font: "'Outfit', sans-serif",            label: "Outfit" },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type BadgeType = "Tim Hackathon" | "Tim Project" | "Talenta/Gig";

interface PersonSeeker {
  id: number;
  name: string;
  handle: string;
  year: number;
  major: string;
  bio: string;
  skills: string[];
  badge: BadgeType;
  currentKarya: string | null;
  note: string;
}

interface KaryaSeeker {
  id: number;
  title: string;
  description: string;
  interests: string[];
  badge: BadgeType;
  openRoles: string[];
  roster: { name: string; handle: string }[];
  stage: string;
}

// ─── Hackathon Event (FR-29) ──────────────────────────────────────────────────
const HACKATHON_EVENT = {
  name: "GEMASTIK 2026",
  theme: "Karya Inovasi Digital",
  deadline: "15 Agustus 2026",
  teamsForming: 4,
};

// ─── Sample Data ──────────────────────────────────────────────────────────────
const PEOPLE_SEEKERS: PersonSeeker[] = [
  // ── Tim Hackathon ──
  {
    id: 1,
    name: "Nadia Kusuma",
    handle: "@nadiaku",
    year: 2,
    major: "S1 Desain Komunikasi Visual",
    bio: "Desainer produk, bisa koding CSS dan Tailwind.",
    skills: ["Figma", "Tailwind", "Vue"],
    badge: "Tim Hackathon",
    currentKarya: "BukuSaku Kampus",
    note: "Nyari tim GEMASTIK 2026 — idealnya ada yang handle backend Go atau Python.",
  },
  {
    id: 2,
    name: "Rizal Hakim",
    handle: "@rizalh",
    year: 4,
    major: "S1 Teknik Informatika",
    bio: "ML enthusiast, fokus riset NLP bahasa daerah.",
    skills: ["Python", "PyTorch", "HuggingFace"],
    badge: "Tim Hackathon",
    currentKarya: "Aksara AI",
    note: "Model sudah jalan — butuh partner frontend untuk pitching di GEMASTIK.",
  },
  {
    id: 3,
    name: "Budi Santoso",
    handle: "@budisnt",
    year: 2,
    major: "S1 Teknik Informatika",
    bio: "Pertama kali ikut hackathon — antusias dan mau belajar keras.",
    skills: ["React", "Tailwind", "Node.js"],
    badge: "Tim Hackathon",
    currentKarya: null,
    note: "Belum punya ide sendiri — open untuk bergabung tim yang butuh frontend.",
  },
  // ── Tim Project ──
  {
    id: 4,
    name: "Arief Maulana",
    handle: "@arief_dev",
    year: 3,
    major: "S1 Teknik Informatika",
    bio: "Full-stack, suka bangun produk yang beneran dipakai orang.",
    skills: ["React", "Hono", "PostgreSQL"],
    badge: "Tim Project",
    currentKarya: "KampusKerja",
    note: "KampusKerja ngegas ke public beta — butuh 1 backend Go yang mau commit jangka panjang.",
  },
  {
    id: 5,
    name: "Dian Pertiwi",
    handle: "@dianp",
    year: 3,
    major: "S1 Sistem Informasi",
    bio: "Senang riset pengguna dan problem-solve bareng komunitas.",
    skills: ["UX Research", "Figma", "Notion"],
    badge: "Tim Project",
    currentKarya: "Warung Digital",
    note: "Warung Digital butuh tangan desain — 1 sprint sebulan sudah sangat membantu.",
  },
  {
    id: 6,
    name: "Farhan Ardiansyah",
    handle: "@farhan_a",
    year: 3,
    major: "S1 Teknik Informatika",
    bio: "Solo builder yang sudah siap jadi tim builder.",
    skills: ["React", "Maps API", "Node.js"],
    badge: "Tim Project",
    currentKarya: "Peta Kost",
    note: "Peta Kost sudah beta. Nyari 1–2 orang buat dorong ke v1.",
  },
  {
    id: 7,
    name: "Mega Wulandari",
    handle: "@megaw",
    year: 2,
    major: "S1 Sistem Informasi",
    bio: "Tertarik produk kolaborasi dan tooling produktivitas.",
    skills: ["Vue", "Figma", "Airtable"],
    badge: "Tim Project",
    currentKarya: "Jadwal Bersama",
    note: "Jadwal Bersama butuh 1 mobile dev buat bawa ke Android.",
  },
  // ── Talenta/Gig ──
  {
    id: 8,
    name: "Eko Saputra",
    handle: "@eko_s",
    year: 3,
    major: "S1 Teknik Informatika",
    bio: "Backend developer, hobi otomasi hal-hal yang bikin frustrasi.",
    skills: ["Go", "Docker", "PostgreSQL"],
    badge: "Talenta/Gig",
    currentKarya: "Warung Digital",
    note: "Bisa bantu backend/DevOps 10–15 jam/minggu. DM dulu untuk brief.",
  },
  {
    id: 9,
    name: "Siti Rahmah",
    handle: "@siti_ux",
    year: 2,
    major: "S1 Desain Komunikasi Visual",
    bio: "UX designer, portofolio di Figma. Terima gig UI/UX per milestone.",
    skills: ["Figma", "Maze", "Illustrator"],
    badge: "Talenta/Gig",
    currentKarya: "KampusKerja",
    note: "Buka 2 slot gig bulan ini — UI audit atau desain komponen baru.",
  },
  {
    id: 10,
    name: "Aldi Pratama",
    handle: "@aldip_music",
    year: 3,
    major: "S1 Teknik Informatika",
    bio: "Dev yang juga produser musik — ngerti keduanya.",
    skills: ["Node.js", "Ableton", "FFmpeg"],
    badge: "Talenta/Gig",
    currentKarya: "Sound Nusantara",
    note: "Bisa bantu integrasi audio pipeline atau kurasi konten musik digital.",
  },
];

const KARYA_SEEKERS: KaryaSeeker[] = [
  // ── Tim Hackathon ──
  {
    id: 101,
    title: "Aksara AI",
    description: "Model NLP bahasa lokal (Sunda & Jawa) — dibawa ke GEMASTIK 2026.",
    interests: ["AI/ML", "Bahasa", "Open Source"],
    badge: "Tim Hackathon",
    openRoles: ["1 Frontend React", "1 Data Engineer"],
    roster: [{ name: "Rizal Hakim", handle: "@rizalh" }],
    stage: "Riset",
  },
  // ── Tim Project ──
  {
    id: 102,
    title: "KampusKerja",
    description: "Platform magang mahasiswa Telkom, terkoneksi langsung alumni.",
    interests: ["Karir", "Networking", "Web"],
    badge: "Tim Project",
    openRoles: ["1 Backend Go", "1 UI Designer"],
    roster: [
      { name: "Arief Maulana", handle: "@arief_dev" },
      { name: "Siti Rahmah", handle: "@siti_ux" },
    ],
    stage: "Beta",
  },
  {
    id: 103,
    title: "Warung Digital",
    description: "Toko online sederhana untuk UMKM sekitar kampus — cukup WhatsApp.",
    interests: ["UMKM", "Mobile", "Sosial"],
    badge: "Tim Project",
    openRoles: ["1 Frontend React"],
    roster: [
      { name: "Dian Pertiwi", handle: "@dianp" },
      { name: "Eko Saputra", handle: "@eko_s" },
    ],
    stage: "Prototype",
  },
  {
    id: 104,
    title: "Peta Kost",
    description: "Aggregator kost area Telkom University dengan ulasan jujur.",
    interests: ["Web", "Maps", "Komunitas"],
    badge: "Tim Project",
    openRoles: ["1 Backend Go", "1 UI Designer"],
    roster: [{ name: "Farhan Ardiansyah", handle: "@farhan_a" }],
    stage: "Beta",
  },
  // ── Talenta/Gig ──
  {
    id: 105,
    title: "Sound Nusantara",
    description: "Arsip dan label indie musik mahasiswa — upload gratis, lisensi terbuka.",
    interests: ["Musik", "Komunitas", "Open Source"],
    badge: "Talenta/Gig",
    openRoles: ["1 Backend Node.js", "1 Audio Engineer (freelance)"],
    roster: [{ name: "Aldi Pratama", handle: "@aldip_music" }],
    stage: "Ide",
  },
  {
    id: 106,
    title: "BukuSaku Kampus",
    description: "Ringkasan materi kuliah dalam format kartu — dikurasi mahasiswa.",
    interests: ["Edukasi", "Mobile", "Konten"],
    badge: "Talenta/Gig",
    openRoles: ["1 Mobile Dev React Native"],
    roster: [
      { name: "Nadia Kusuma", handle: "@nadiaku" },
      { name: "Budi Santoso", handle: "@budisnt" },
    ],
    stage: "MVP",
  },
];

// ─── Utilities (verbatim from MockupB) ────────────────────────────────────────
function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(name: string): string {
  const hues = [22, 40, 62, 90, 155, 200, 255, 310];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `oklch(78% 0.08 ${hues[h % hues.length]})`;
}

const eyebrow = {
  fontFamily: T.fontBody,
  fontSize: T.size.micro,
  fontWeight: T.weight.medium,
  letterSpacing: T.track.wide,
  textTransform: "uppercase" as const,
  color: T.ink3,
};

// ─── Micro Components (verbatim from MockupB) ─────────────────────────────────
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

// ─── Badge Pill ───────────────────────────────────────────────────────────────
// Three visual weights: hackathon = solid accent (urgent), project = tinted,
// gig = ghost (lowest friction). All within the existing T token set.
function BadgePill({ badge }: { badge: BadgeType }) {
  // Derive fill/text/border from badge type without a typed Record,
  // avoiding any React namespace reference (only useState is imported).
  const bg     = badge === "Tim Hackathon" ? T.accent
                : badge === "Tim Project"   ? T.accentTint
                : "transparent";
  const fg     = badge === "Tim Hackathon" ? T.accentFg
                : badge === "Tim Project"   ? T.accent
                : T.ink2;
  const border = badge === "Tim Hackathon" ? T.accent
                : badge === "Tim Project"   ? T.accentLine
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
      {badge}
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

// ─── Left Nav ─────────────────────────────────────────────────────────────────
// Same shell as MockupB. "Cari Kolaborator" is always the active item.
// The filter section is replaced with intent-type quick filters that sync
// with the jump-nav in the center column.
const NAV_ITEMS = [
  { label: "Launchpad",        icon: "◈" },
  { label: "Jelajahi Karya",   icon: "◉" },
  { label: "Cari Kolaborator", icon: "◎" },
  { label: "Minat Saya",       icon: "◇" },
  { label: "Karya Saya",       icon: "◆" },
];

const INTENT_FILTERS = ["Semua", "Tim Hackathon", "Tim Project", "Talenta/Gig"];

function LeftNav({ activeSection, onSection }: {
  activeSection: string;
  onSection: (s: string) => void;
}) {
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
      <div className="bn-nav-logo" style={{
        padding: "0 12px 20px",
        borderBottom: `1px solid ${T.line}`,
        marginBottom: 16,
      }}>
        <div style={{ ...eyebrow, marginBottom: 4 }}>Al-Fath</div>
        <div style={{
          fontFamily: T.fontDisplay,
          fontSize: T.size.feature,
          fontWeight: T.weight.regular,
          color: T.ink,
          lineHeight: 1,
        }}>Berkarya</div>
      </div>

      {/* Nav items */}
      <nav className="bn-nav-items" style={{ marginBottom: 24 }}>
        {NAV_ITEMS.map((item) => {
          const active = item.label === "Cari Kolaborator";
          return (
            <button
              key={item.label}
              type="button"
              aria-current={active ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                textAlign: "left" as const,
                border: "none",
                padding: "7px 12px",
                borderRadius: T.radius,
                backgroundColor: active ? T.accentTint : "transparent",
                color: active ? T.accent : T.ink2,
                fontFamily: T.fontBody,
                fontSize: T.size.body,
                fontWeight: active ? T.weight.medium : T.weight.regular,
                cursor: "pointer",
                marginBottom: 1,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: T.size.ui }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Intent filter — mirrors the center jump-nav */}
      <div className="bn-nav-filters" style={{ padding: "0 12px" }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Filter Tujuan</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
          {INTENT_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onSection(f)}
              aria-pressed={activeSection === f}
              style={{
                textAlign: "left" as const,
                background: "none",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                fontFamily: T.fontBody,
                fontSize: T.size.ui,
                color: activeSection === f ? T.accent : T.ink2,
                backgroundColor: activeSection === f ? T.accentTint : "transparent",
                cursor: "pointer",
                fontWeight: activeSection === f ? T.weight.medium : T.weight.regular,
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

// ─── Hackathon Event Banner (FR-29) ───────────────────────────────────────────
// Event-scoped team-formation affordance. Heads the Tim Hackathon section.
function HackathonBanner() {
  return (
    <div style={{
      background: T.accentTint,
      border: `1px solid ${T.accentLine}`,
      borderRadius: T.radiusLg,
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
            lineHeight: T.lh.tight,
          }}>{HACKATHON_EVENT.name}</span>
          <span style={{ ...eyebrow, color: T.accentMid }}>lagi bentuk tim</span>
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink2, lineHeight: T.lh.snug }}>
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
        borderRadius: T.radius,
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
// Shows a person who is looking for collaborators or a team.
function PersonSeekerCard({ person }: { person: PersonSeeker }) {
  return (
    <article style={{
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: T.radiusLg,
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
        borderRadius: T.radius,
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
// Shows a karya (project) that is looking for contributors.
function KaryaSeekerCard({ karya }: { karya: KaryaSeeker }) {
  return (
    <article style={{
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: T.radiusLg,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column" as const,
      gap: 10,
    }}>
      {/* Header: cover + title + badge */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 48,
          height: 48,
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
            lineHeight: T.lh.tight,
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
        borderRadius: T.radius,
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

function IntentSection({
  badge,
  icon,
  items,
  showBanner,
}: {
  badge: BadgeType;
  icon: string;
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
        <span aria-hidden="true" style={{ fontSize: T.size.body, color: T.accent }}>{icon}</span>
        <h2 style={{
          margin: 0,
          fontFamily: T.fontDisplay,
          fontSize: T.size.title,
          fontWeight: T.weight.regular,
          color: T.ink,
        }}>{badge}</h2>
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
      <div style={{
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
  activeSection: string;
  onSection: (s: string) => void;
}) {
  // Build interleaved item lists per badge type.
  // Interleaving (person, karya, person…) means both card types share every
  // row of the grid, reinforcing that the section is about *intent*, not type.
  function buildItems(badge: BadgeType): CardItem[] {
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

  const SECTIONS: { badge: BadgeType; icon: string; showBanner?: boolean }[] = [
    { badge: "Tim Hackathon", icon: "◈", showBanner: true },
    { badge: "Tim Project",   icon: "◉" },
    { badge: "Talenta/Gig",   icon: "◇" },
  ];

  const TABS = [
    { label: "Semua",         icon: "◎" },
    { label: "Tim Hackathon", icon: "◈" },
    { label: "Tim Project",   icon: "◉" },
    { label: "Talenta/Gig",   icon: "◇" },
  ] as const;

  const visible = activeSection === "Semua"
    ? SECTIONS
    : SECTIONS.filter((s) => s.badge === activeSection);

  return (
    <main className="bn-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const }}>
      {/* Heading */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          margin: "0 0 4px",
          fontFamily: T.fontDisplay,
          fontSize: T.size.display,
          fontWeight: T.weight.regular,
          letterSpacing: T.track.tight,
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
        {TABS.map((tab) => {
          const active = activeSection === tab.label;
          return (
            <button
              key={tab.label}
              onClick={() => onSection(tab.label)}
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
      {visible.map((s) => (
        <IntentSection
          key={s.badge}
          badge={s.badge}
          icon={s.icon}
          items={buildItems(s.badge)}
          showBanner={s.showBanner}
        />
      ))}

      {/* CTA: post your own seeking status */}
      <div style={{
        marginTop: 4,
        padding: "16px 20px",
        borderRadius: T.radiusLg,
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
          borderRadius: T.radius,
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
  const [seeking, setSeeking] = useState<BadgeType | null>(null);

  // Count entries per badge type (people + karya combined)
  const pulse = (["Tim Hackathon", "Tim Project", "Talenta/Gig"] as BadgeType[]).map((b) => ({
    label: b,
    count:
      PEOPLE_SEEKERS.filter((p) => p.badge === b).length +
      KARYA_SEEKERS.filter( (k) => k.badge === b).length,
  }));

  const totalSeeking = PEOPLE_SEEKERS.length + KARYA_SEEKERS.length;

  return (
    <aside className="bn-rail" style={{
      width: 232,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column" as const,
      gap: 20,
      paddingTop: 0,
    }}>
      {/* ── User's own seeking status ─────────────────────────────────── */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusLg,
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
              <span style={{ color: T.ink, fontWeight: T.weight.medium }}>{seeking}</span>.
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
                borderRadius: T.radius,
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
              {(["Tim Hackathon", "Tim Project", "Talenta/Gig"] as BadgeType[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setSeeking(b)}
                  style={{
                    textAlign: "left" as const,
                    background: T.bg,
                    border: `1px solid ${T.line}`,
                    borderRadius: T.radius,
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
                  <span>{b}</span>
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
        borderRadius: T.radiusLg,
        padding: "12px 14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Papan sekarang</div>
        <div style={{
          fontFamily: T.fontBody,
          fontSize: T.size.stat,
          fontWeight: T.weight.medium,
          color: T.ink,
          lineHeight: T.lh.tight,
          marginBottom: 2,
        }}>
          {totalSeeking}
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2, marginBottom: 12 }}>
          orang & karya sedang mencari
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 7 }}>
          {pulse.map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>{row.label}</span>
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
        borderRadius: T.radiusLg,
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
          borderRadius: T.radius,
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
        borderRadius: T.radiusLg,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <span aria-hidden="true" style={{ color: T.accent, fontSize: T.size.body }}>◈</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>
            GEMASTIK 2026
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

// ─── Font Switcher (verbatim from MockupB) ────────────────────────────────────
function FontSwitcher({ options, activeIdx, onChange }: {
  options: readonly { font: string; label: string }[];
  activeIdx: number;
  onChange: (i: number) => void;
}) {
  return (
    <div
      role="group"
      style={{
        background: T.surface,
        border: `1px solid ${T.lineDark}`,
        borderRadius: 99,
        boxShadow: "0 4px 16px oklch(0% 0 0 / 10%)",
        display: "flex",
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((opt, i) => {
        const active = i === activeIdx;
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            aria-pressed={active}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 13px",
              borderRadius: 99,
              border: "none",
              background: active ? T.ink : "transparent",
              color: active ? T.bg : T.ink3,
              fontFamily: T.fontBody,
              fontSize: T.size.micro,
              fontWeight: active ? T.weight.medium : T.weight.regular,
              cursor: "pointer",
              letterSpacing: T.track.tag,
              whiteSpace: "nowrap" as const,
              transition: "background 0.12s, color 0.12s",
            }}
          >
            <span style={{ fontFamily: opt.font, fontSize: 15, fontWeight: 400, lineHeight: 1 }}>Aa</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
export default function CariKolaboratorMockup() {
  const [activeSection, setActiveSection] = useState("Semua");
  const [displayIdx, setDisplayIdx] = useState(0);
  const [bodyIdx, setBodyIdx] = useState(0);

  // Mutate T before render so all child style references pick up the choice.
  T.fontDisplay = DISPLAY_FONTS[displayIdx].font;
  T.fontBody    = BODY_FONTS[bodyIdx].font;

  return (
    <div style={{ backgroundColor: T.bg, minHeight: "100vh", fontFamily: T.fontBody, color: T.ink }}>
      <style>{`
        /* Even line breaks on display type; fewer orphans in prose. */
        h1, h2, h3 { text-wrap: balance; overflow-wrap: break-word; }
        p { text-wrap: pretty; overflow-wrap: break-word; }
        /* Visible keyboard focus on every interactive control. */
        button:focus-visible, a:focus-visible, input:focus-visible, [tabindex]:focus-visible {
          outline: 2px solid ${T.accent};
          outline-offset: 2px;
          border-radius: ${T.radius};
        }
        /* Placeholder contrast. */
        input::placeholder { color: ${T.ink3}; opacity: 1; }
        /* Honour reduced-motion. */
        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
        /* Below ~900px: collapse to single column, fold nav to top bar. */
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
          .bn-nav-filters, .bn-nav-user { display: none !important; }
        }
        /* Comfortable touch targets. */
        @media (pointer: coarse) {
          .bn-nav-items button { min-height: 44px; }
        }
        /* 2-col card grid collapses to 1 col on narrow center column. */
        @media (max-width: 700px) {
          .cari-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Three-column layout (collapses below ~900px) */}
      <div className="bn-shell" style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "24px 24px 48px",
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
      }}>
        <LeftNav activeSection={activeSection} onSection={setActiveSection} />
        <CenterBoard activeSection={activeSection} onSection={setActiveSection} />
        <RightRail />
      </div>

      {/* Fixed font switcher — same position and behaviour as MockupB */}
      <div style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 100,
        display: "flex",
        flexDirection: "column" as const,
        gap: 8,
        alignItems: "flex-end",
      }}>
        <FontSwitcher options={DISPLAY_FONTS} activeIdx={displayIdx} onChange={setDisplayIdx} />
        <FontSwitcher options={BODY_FONTS}    activeIdx={bodyIdx}    onChange={setBodyIdx}    />
      </div>
    </div>
  );
}
