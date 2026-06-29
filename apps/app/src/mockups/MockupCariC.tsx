/**
 * Al-Fath Berkarya — Cari Kolaborator Mockup C
 * Direction: Reciprocal match ("buat kamu") — personalized matchmaking.
 *
 * Logged-in user: Zaki Nadhif (@zaki_n) · React, TypeScript, UI Design.
 * Center: two clearly-labeled sections —
 *   1. "Karya yang cocok buat kamu"  — karya whose open roles match Zaki's skills.
 *   2. "Orang yang cocok buat karyamu" — people who fill Zaki's karya's open seats.
 * Each card carries a warm "✦ cocok:" reason line. No numeric scores.
 * Right rail: Zaki's own state — editable looking-for badge, skills, his karya's open roles.
 * Hackathon gesture (FR-29): dismissible GEMASTIK 2026 prompt in the center.
 *
 * Self-contained: only imports are React (useState) and ./images (coverFor).
 * Design tokens, helpers, and CSS copied verbatim from MockupB.tsx so all
 * mockups render identically under the same font/palette rules.
 */

import { useState } from "react";
import { coverFor } from "./images";

// ─── Design Tokens (verbatim from MockupB.tsx) ────────────────────────────────
const T = {
  bg: "oklch(98% 0 0)",              // gallery white (neutral)
  ink: "oklch(18% 0 0)",             // soft neutral near-black
  ink2: "oklch(46% 0 0)",            // muted body — ~4.7:1 on white (AA)
  ink3: "oklch(53% 0 0)",            // meta text — ~5:1 on bg (AA)
  accent: "oklch(39% 0.085 62)",     // terracotta (kept)
  accentMid: "oklch(55% 0.085 62)",  // terracotta mid — ~4.7:1 on bg (AA)
  accentFg: "oklch(99% 0 0)",        // text on accent
  accentTint: "oklch(95% 0.015 62)", // light terracotta wash — chips, active rows
  accentLine: "oklch(88% 0.03 62)",  // terracotta-tinted hairline
  line: "oklch(91% 0 0)",            // neutral hairline
  lineDark: "oklch(85% 0 0)",
  surface: "oklch(100% 0 0)",        // pure white lifted card
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

// ─── Data types ───────────────────────────────────────────────────────────────
type LookingForType = "Tim Project" | "Tim Event/Hackathon" | "Talenta/Gig";

interface Roster { name: string; handle: string }

interface KaryaMatch {
  id: number;
  title: string;
  description: string;
  interests: string[];
  stages: string[];
  openRoles: string[];       // roles this karya needs filled
  roster: Roster[];
  lookingFor: LookingForType;
  matchReason: string[];     // Zaki's skills that triggered the match
}

interface PersonMatch {
  id: number;
  name: string;
  handle: string;
  tingkat: number;
  jurusan: string;
  bio: string;
  skills: string[];
  lookingFor: LookingForType;
  currentKarya: string | null;
  fitsMyKarya: string;       // which of Zaki's karya they'd join
  fitsRole: string;          // specific open role they'd fill
  matchReason: string[];     // their skills that match the open role
}

interface ZakiKarya {
  id: string;
  title: string;
  interests: string[];
  openRoles: string[];
}

// ─── Zaki's profile (logged-in user) ─────────────────────────────────────────
const ZAKI = {
  name: "Zaki Nadhif",
  handle: "@zaki_n",
  tingkat: 3,
  jurusan: "S1 Teknik Informatika",
  skills: ["React", "TypeScript", "UI Design"],
  bio: "Suka desain sistem yang nyaman dipakai orang — dari pixel sampai API.",
};

// Karya Zaki is already a member of — each has open seats he can't fill himself.
const ZAKI_KARYA: ZakiKarya[] = [
  {
    id: "buku-saku",
    title: "BukuSaku Kampus",
    interests: ["Edukasi", "Mobile", "Konten"],
    openRoles: ["Backend Go", "ML Engineer"],
  },
  {
    id: "study-sync",
    title: "StudySync",
    interests: ["Produktivitas", "Web", "Kolaborasi"],
    openRoles: ["iOS Developer", "UX Researcher"],
  },
];

// ─── Karya whose open roles match Zaki's skills ───────────────────────────────
const KARYA_MATCHES: KaryaMatch[] = [
  {
    id: 1,
    title: "Peta Kost",
    description: "Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif.",
    interests: ["Web", "Maps", "Komunitas"],
    stages: ["Beta"],
    openRoles: ["1 Frontend React", "1 UI Designer"],
    roster: [{ name: "Farhan Ardiansyah", handle: "@farhan_a" }],
    lookingFor: "Tim Project",
    matchReason: ["React", "UI Design"],
  },
  {
    id: 2,
    title: "KampusKerja",
    description: "Platform lowongan magang khusus mahasiswa Telkom — terkoneksi langsung dengan alumni yang sudah bekerja.",
    interests: ["Karir", "Networking", "Web"],
    stages: ["Beta"],
    openRoles: ["1 Frontend Developer", "1 UI Designer"],
    roster: [
      { name: "Arief Maulana", handle: "@arief_dev" },
      { name: "Siti Rahmah",   handle: "@siti_ux" },
    ],
    lookingFor: "Tim Project",
    matchReason: ["React", "TypeScript"],
  },
  {
    id: 3,
    title: "Warung Digital",
    description: "Bantu UMKM sekitar kampus punya toko online sederhana — tanpa ribet, cukup WhatsApp.",
    interests: ["UMKM", "Mobile", "Sosial"],
    stages: ["Prototype"],
    openRoles: ["1 UI Designer", "1 Frontend Mobile"],
    roster: [
      { name: "Dian Pertiwi",  handle: "@dianp" },
      { name: "Eko Saputra",   handle: "@eko_s" },
      { name: "Lina Marlina",  handle: "@linax" },
    ],
    lookingFor: "Tim Project",
    matchReason: ["UI Design"],
  },
  {
    id: 4,
    title: "Sound Nusantara",
    description: "Arsip dan label indie musik mahasiswa — upload gratis, lisensi terbuka, dikurasi komunitas.",
    interests: ["Musik", "Komunitas", "Open Source"],
    stages: ["Ide"],
    openRoles: ["1 Web Developer"],
    roster: [{ name: "Aldi Pratama", handle: "@aldip_music" }],
    lookingFor: "Tim Event/Hackathon",
    matchReason: ["React", "TypeScript"],
  },
];

// ─── People whose skills fill Zaki's karya's open roles ──────────────────────
const PERSON_MATCHES: PersonMatch[] = [
  {
    id: 1,
    name: "Eko Saputra",
    handle: "@eko_s",
    tingkat: 3,
    jurusan: "S1 Teknik Informatika",
    bio: "Backend developer, hobi otomasi hal-hal yang bikin frustrasi.",
    skills: ["Go", "Docker", "PostgreSQL"],
    lookingFor: "Tim Project",
    currentKarya: "Warung Digital",
    fitsMyKarya: "BukuSaku Kampus",
    fitsRole: "Backend Go",
    matchReason: ["Go"],
  },
  {
    id: 2,
    name: "Rizal Hakim",
    handle: "@rizalh",
    tingkat: 4,
    jurusan: "S1 Teknik Informatika",
    bio: "ML enthusiast, tertarik pada bahasa daerah dan NLP.",
    skills: ["Python", "PyTorch", "HuggingFace"],
    lookingFor: "Tim Project",
    currentKarya: "Aksara AI",
    fitsMyKarya: "BukuSaku Kampus",
    fitsRole: "ML Engineer",
    matchReason: ["Python", "PyTorch"],
  },
  {
    id: 3,
    name: "Dian Pertiwi",
    handle: "@dianp",
    tingkat: 3,
    jurusan: "S1 Sistem Informasi",
    bio: "Senang riset pengguna dan problem-solve bareng komunitas.",
    skills: ["UX Research", "Figma", "Notion"],
    lookingFor: "Talenta/Gig",
    currentKarya: "Warung Digital",
    fitsMyKarya: "StudySync",
    fitsRole: "UX Researcher",
    matchReason: ["UX Research"],
  },
  {
    id: 4,
    name: "Hendra Wijaya",
    handle: "@hendraw",
    tingkat: 2,
    jurusan: "S1 Teknik Informatika",
    bio: "iOS developer yang obsesi sama smooth animations dan gesture.",
    skills: ["Swift", "SwiftUI", "Xcode"],
    lookingFor: "Tim Event/Hackathon",
    currentKarya: null,
    fitsMyKarya: "StudySync",
    fitsRole: "iOS Developer",
    matchReason: ["Swift", "SwiftUI"],
  },
  {
    id: 5,
    name: "Nadia Kusuma",
    handle: "@nadiaku",
    tingkat: 2,
    jurusan: "S1 Desain Komunikasi Visual",
    bio: "Desainer produk yang juga bisa koding CSS.",
    skills: ["Figma", "Tailwind", "Vue"],
    lookingFor: "Tim Project",
    currentKarya: "BukuSaku Kampus",
    fitsMyKarya: "StudySync",
    fitsRole: "UX Researcher",
    matchReason: ["Figma"],
  },
];

// ─── Utilities (verbatim from MockupB.tsx) ────────────────────────────────────
// Note: relativeTime is omitted here — this surface has no last-activity
// timestamps on cards, so it would trigger noUnusedLocals. See MockupB.tsx.

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

// ─── Micro Components (verbatim from MockupB.tsx) ─────────────────────────────
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

// ─── Looking-for badge — three types, distinct visual weight ──────────────────
// Tim Event/Hackathon: filled accent (urgent, time-bound)
// Tim Project:         tinted accent (steady, open-ended)
// Talenta/Gig:         neutral (task-scoped, no commitment implied)
const BADGE_ICON: Record<LookingForType, string> = {
  "Tim Project":         "◆",
  "Tim Event/Hackathon": "◎",
  "Talenta/Gig":         "◇",
};

function LookingForBadge({ type }: { type: LookingForType }) {
  const isEvent   = type === "Tim Event/Hackathon";
  const isGig     = type === "Talenta/Gig";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 99,
      border: `1px solid ${isEvent ? T.accent : isGig ? T.lineDark : T.accentLine}`,
      backgroundColor: isEvent ? T.accent : isGig ? T.line : T.accentTint,
      color: isEvent ? T.accentFg : isGig ? T.ink2 : T.accent,
      fontFamily: T.fontBody,
      fontSize: T.size.micro,
      fontWeight: T.weight.medium,
      letterSpacing: T.track.tag,
      whiteSpace: "nowrap" as const,
    }}>
      <span aria-hidden="true" style={{ fontSize: 9 }}>{BADGE_ICON[type]}</span>
      {type}
    </span>
  );
}

// ─── Left Nav (adapted: "Cari Kolaborator" always active) ────────────────────
const NAV_ITEMS = [
  { label: "Launchpad",         icon: "◈" },
  { label: "Jelajahi Karya",    icon: "◉" },
  { label: "Cari Kolaborator",  icon: "◎" },
  { label: "Minat Saya",        icon: "◇" },
  { label: "Karya Saya",        icon: "◆" },
];

function LeftNav() {
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
              <span aria-hidden="true" style={{ fontFamily: T.fontBody, fontSize: T.size.ui }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

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

// ─── Hackathon Banner (FR-29) — GEMASTIK 2026 team-formation prompt ───────────
// Event-scoped: surfaced because Zaki's skills are sought by teams registering
// for GEMASTIK. Dismissible so it doesn't clutter the session.
function HackathonBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <section style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      padding: "14px 18px",
      marginBottom: 22,
      background: T.accentTint,
      border: `1px solid ${T.accentLine}`,
      borderRadius: T.radiusLg,
    }}>
      <div aria-hidden="true" style={{
        fontFamily: T.fontDisplay,
        fontSize: 28,
        color: T.accent,
        lineHeight: 1,
        flexShrink: 0,
        marginTop: 2,
      }}>✦</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: T.fontDisplay,
          fontSize: T.size.title,
          fontWeight: T.weight.regular,
          color: T.ink,
          lineHeight: T.lh.tight,
          marginBottom: 4,
        }}>
          Kamu di GEMASTIK 2026? Lagi cari tim.
        </div>
        <div style={{
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          color: T.ink2,
          lineHeight: T.lh.body,
          marginBottom: 12,
        }}>
          Beberapa tim kompetisi butuh React dan TypeScript persis seperti skill-mu.
          Pendaftaran tutup 3 minggu lagi — masih ada waktu.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          <button style={{
            backgroundColor: T.accent,
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
            Lihat Tim GEMASTIK →
          </button>
          <button
            onClick={onDismiss}
            style={{
              background: "transparent",
              color: T.ink3,
              border: `1px solid ${T.lineDark}`,
              borderRadius: T.radius,
              padding: "7px 14px",
              fontFamily: T.fontBody,
              fontSize: T.size.ui,
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
            }}
          >
            Lewati
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Karya Match Card — karya whose open roles fit Zaki's skills ─────────────
function KaryaMatchCard({
  karya,
  requested,
  onRequest,
  dmed,
  onDm,
}: {
  karya: KaryaMatch;
  requested: boolean;
  onRequest: () => void;
  dmed: boolean;
  onDm: () => void;
}) {
  return (
    <article style={{
      padding: "16px 0",
      borderBottom: `1px solid ${T.line}`,
    }}>
      {/* Header: cover + title + badge */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{
          width: 52,
          height: 52,
          flexShrink: 0,
          borderRadius: 13,
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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
            <h3 style={{
              margin: 0,
              fontFamily: T.fontDisplay,
              fontSize: T.size.title,
              fontWeight: T.weight.regular,
              color: T.ink,
              lineHeight: T.lh.tight,
            }}>{karya.title}</h3>
            <LookingForBadge type={karya.lookingFor} />
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
            {karya.stages.map((s) => <Tag key={s} label={s} />)}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        margin: "0 0 10px",
        fontFamily: T.fontBody,
        fontSize: T.size.body,
        color: T.ink2,
        lineHeight: T.lh.body,
      }}>{karya.description}</p>

      {/* Open roles pill */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 11px",
        borderRadius: T.radius,
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        marginBottom: 10,
      }}>
        <span style={{ ...eyebrow, marginRight: 2 }}>Butuh</span>
        <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>
          {karya.openRoles.join(" · ")}
        </span>
      </div>

      {/* Interest tags */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginBottom: 10 }}>
        {karya.interests.map((i) => <Tag key={i} label={i} />)}
      </div>

      {/* Match reason — warm, not a score */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
        <span aria-hidden="true" style={{ color: T.accentMid, fontSize: T.size.body, lineHeight: 1 }}>✦</span>
        <span style={{
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          color: T.accentMid,
          fontWeight: T.weight.medium,
        }}>
          cocok: {karya.matchReason.join(", ")}
        </span>
      </div>

      {/* Footer: roster avatars + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {karya.roster.slice(0, 5).map((r, idx) => (
            <span key={r.handle} style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: karya.roster.length - idx }}>
              <Avatar name={r.name} size={22} />
            </span>
          ))}
          <span style={{ marginLeft: 8, fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
            {karya.roster.length} builder
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onDm}
            style={{
              padding: "6px 12px",
              borderRadius: T.radius,
              border: `1px solid ${T.lineDark}`,
              backgroundColor: "transparent",
              color: dmed ? T.ink3 : T.ink2,
              fontFamily: T.fontBody,
              fontSize: T.size.ui,
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
              transition: "color 0.15s",
            }}
          >
            {dmed ? "Pesan Terkirim ✓" : "Tanya dulu"}
          </button>
          <button
            onClick={onRequest}
            style={{
              padding: "6px 14px",
              borderRadius: T.radius,
              border: `1px solid ${requested ? T.accentLine : "transparent"}`,
              backgroundColor: requested ? T.accentTint : T.accent,
              color: requested ? T.accent : T.accentFg,
              fontFamily: T.fontBody,
              fontSize: T.size.ui,
              fontWeight: T.weight.semibold,
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {requested ? "Permintaan Dikirim ✓" : "Minta Gabung"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Person Match Card — people who can fill Zaki's karya's open roles ────────
function PersonMatchCard({
  person,
  invited,
  onInvite,
  dmed,
  onDm,
}: {
  person: PersonMatch;
  invited: boolean;
  onInvite: () => void;
  dmed: boolean;
  onDm: () => void;
}) {
  return (
    <article style={{
      padding: "16px 0",
      borderBottom: `1px solid ${T.line}`,
    }}>
      {/* Header: avatar + name + badge */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
        <Avatar name={person.name} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: T.size.title, fontWeight: T.weight.regular, color: T.ink }}>
                {person.name}
              </span>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginLeft: 8 }}>
                {person.handle}
              </span>
            </div>
            <LookingForBadge type={person.lookingFor} />
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
            Tkt {person.tingkat} · {person.jurusan}
          </div>
        </div>
      </div>

      {/* Bio */}
      <p style={{
        margin: "0 0 10px",
        fontFamily: T.fontBody,
        fontSize: T.size.body,
        color: T.ink2,
        lineHeight: T.lh.body,
      }}>{person.bio}</p>

      {/* Skills chips (accent = they're offering these) */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginBottom: 8 }}>
        {person.skills.map((s) => <Tag key={s} label={s} accent />)}
      </div>

      {/* Current karya */}
      {person.currentKarya && (
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink3, marginBottom: 10 }}>
          karya saat ini:{" "}
          <span style={{ color: T.ink2, fontWeight: T.weight.medium }}>{person.currentKarya}</span>
        </div>
      )}

      {/* Match reason */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
        <span aria-hidden="true" style={{ color: T.accentMid, fontSize: T.size.body, lineHeight: 1 }}>✦</span>
        <span style={{
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          color: T.accentMid,
          fontWeight: T.weight.medium,
        }}>
          cocok buat{" "}
          <span style={{ fontWeight: T.weight.semibold }}>{person.fitsMyKarya}</span>
          {" · "}butuh {person.fitsRole}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          onClick={onDm}
          style={{
            padding: "6px 12px",
            borderRadius: T.radius,
            border: `1px solid ${T.lineDark}`,
            backgroundColor: "transparent",
            color: dmed ? T.ink3 : T.ink2,
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            cursor: "pointer",
            whiteSpace: "nowrap" as const,
            transition: "color 0.15s",
          }}
        >
          {dmed ? "Pesan Terkirim ✓" : "Kirim Pesan"}
        </button>
        <button
          onClick={onInvite}
          style={{
            padding: "6px 14px",
            borderRadius: T.radius,
            border: `1px solid ${invited ? T.accentLine : "transparent"}`,
            backgroundColor: invited ? T.accentTint : T.accent,
            color: invited ? T.accent : T.accentFg,
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            fontWeight: T.weight.semibold,
            cursor: "pointer",
            whiteSpace: "nowrap" as const,
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {invited ? "Undangan Dikirim ✓" : "Ajak ke Karya"}
        </button>
      </div>
    </article>
  );
}

// ─── Center column ────────────────────────────────────────────────────────────
function CariCenter({
  showHackathon,
  onDismissHackathon,
  requestedKarya,
  onRequestKarya,
  dmedKarya,
  onDmKarya,
  invitedPersons,
  onInvitePerson,
  dmedPersons,
  onDmPerson,
}: {
  showHackathon: boolean;
  onDismissHackathon: () => void;
  requestedKarya: Set<number>;
  onRequestKarya: (id: number) => void;
  dmedKarya: Set<number>;
  onDmKarya: (id: number) => void;
  invitedPersons: Set<number>;
  onInvitePerson: (id: number) => void;
  dmedPersons: Set<number>;
  onDmPerson: (id: number) => void;
}) {
  return (
    <main className="bn-main" style={{ flex: 1, minWidth: 0 }}>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <h1 style={{
            margin: 0,
            fontFamily: T.fontDisplay,
            fontSize: T.size.display,
            fontWeight: T.weight.regular,
            letterSpacing: T.track.tight,
            color: T.ink,
          }}>Cari Kolaborator</h1>
        </div>
        <p style={{
          margin: 0,
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          color: T.ink2,
          lineHeight: T.lh.body,
        }}>
          Rekomendasi buat kamu, Zaki — berdasarkan skill dan karya yang kamu bawa.
        </p>
      </div>

      {/* Hackathon banner (FR-29) — dismissible */}
      {showHackathon && <HackathonBanner onDismiss={onDismissHackathon} />}

      {/* ── Section 1: Karya yang cocok buat kamu ── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <h2 style={{
              margin: "0 0 4px",
              fontFamily: T.fontDisplay,
              fontSize: T.size.feature,
              fontWeight: T.weight.regular,
              color: T.ink,
              lineHeight: T.lh.tight,
            }}>Karya yang cocok buat kamu</h2>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3, flexShrink: 0 }}>
              {KARYA_MATCHES.length} karya
            </span>
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink3 }}>
            Berdasarkan skill-mu: {ZAKI.skills.join(", ")}
          </div>
        </div>

        {KARYA_MATCHES.map((k) => (
          <KaryaMatchCard
            key={k.id}
            karya={k}
            requested={requestedKarya.has(k.id)}
            onRequest={() => onRequestKarya(k.id)}
            dmed={dmedKarya.has(k.id)}
            onDm={() => onDmKarya(k.id)}
          />
        ))}
      </section>

      {/* ── Section 2: Orang yang cocok buat karyamu ── */}
      <section>
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <h2 style={{
              margin: "0 0 4px",
              fontFamily: T.fontDisplay,
              fontSize: T.size.feature,
              fontWeight: T.weight.regular,
              color: T.ink,
              lineHeight: T.lh.tight,
            }}>Orang yang cocok buat karyamu</h2>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3, flexShrink: 0 }}>
              {PERSON_MATCHES.length} orang
            </span>
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink3 }}>
            Bisa mengisi posisi terbuka di {ZAKI_KARYA.map((k) => k.title).join(" dan ")}
          </div>
        </div>

        {PERSON_MATCHES.map((p) => (
          <PersonMatchCard
            key={p.id}
            person={p}
            invited={invitedPersons.has(p.id)}
            onInvite={() => onInvitePerson(p.id)}
            dmed={dmedPersons.has(p.id)}
            onDm={() => onDmPerson(p.id)}
          />
        ))}
      </section>
    </main>
  );
}

// ─── Right Rail — Zaki's own matching context ─────────────────────────────────
// Shows what drives the recommendations: his looking-for status, skills, and
// the open roles in his karya. Status badge is editable (cycles on click).
const LOOKING_FOR_OPTIONS: LookingForType[] = [
  "Tim Project",
  "Tim Event/Hackathon",
  "Talenta/Gig",
];

function ZakiRail({
  lookingFor,
  onChangeLookingFor,
}: {
  lookingFor: LookingForType;
  onChangeLookingFor: (t: LookingForType) => void;
}) {
  function cycleStatus() {
    const idx = LOOKING_FOR_OPTIONS.indexOf(lookingFor);
    onChangeLookingFor(LOOKING_FOR_OPTIONS[(idx + 1) % LOOKING_FOR_OPTIONS.length]);
  }

  return (
    <aside className="bn-rail" style={{
      width: 232,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column" as const,
      gap: 16,
      position: "sticky" as const,
      top: 24,
    }}>
      {/* Profile card */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusLg,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 14,
      }}>
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name="Zaki Nadhif" size={40} />
          <div>
            <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink }}>
              Zaki Nadhif
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
              @zaki_n · Tkt {ZAKI.tingkat}
            </div>
          </div>
        </div>

        <div style={{ width: "100%", height: 1, backgroundColor: T.line }} />

        {/* Status / looking-for badge — editable */}
        <div>
          <div style={{ ...eyebrow, marginBottom: 6 }}>Status kamu</div>
          <button
            onClick={cycleStatus}
            title="Klik untuk ganti status"
            aria-label={`Status: ${lookingFor}. Klik untuk ganti.`}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <LookingForBadge type={lookingFor} />
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>▾</span>
          </button>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginTop: 4 }}>
            Klik badge untuk ganti
          </div>
        </div>

        {/* Skills */}
        <div>
          <div style={{ ...eyebrow, marginBottom: 6 }}>Keahlian kamu</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
            {ZAKI.skills.map((s) => <Tag key={s} label={s} accent />)}
          </div>
        </div>
      </div>

      {/* Karya Saya — with open roles that drive Section 2 matches */}
      <div>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Karya kamu</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {ZAKI_KARYA.map((k) => (
            <div key={k.id} style={{
              backgroundColor: T.surface,
              border: `1px solid ${T.line}`,
              borderRadius: T.radius,
              padding: "10px 12px",
            }}>
              {/* Cover + title */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  overflow: "hidden",
                  flexShrink: 0,
                  border: `1px solid ${T.line}`,
                }}>
                  <img
                    src={coverFor(k.interests)}
                    alt={k.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
                <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>
                  {k.title}
                </span>
              </div>
              {/* Open roles */}
              <div style={{ ...eyebrow, marginBottom: 5 }}>Butuh</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
                {k.openRoles.map((r) => (
                  <div key={r} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span aria-hidden="true" style={{ color: T.accentMid, fontSize: 8 }}>◉</span>
                    <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit CTA */}
      <button style={{
        background: "none",
        border: `1px solid ${T.line}`,
        borderRadius: T.radius,
        padding: "8px 14px",
        fontFamily: T.fontBody,
        fontSize: T.size.ui,
        color: T.ink2,
        cursor: "pointer",
        textAlign: "center" as const,
      }}>
        Edit profil &amp; keahlian →
      </button>
    </aside>
  );
}

// ─── Font Switcher (verbatim from MockupB.tsx) ────────────────────────────────
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

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function CariKolaboratorMockup() {
  const [displayIdx,   setDisplayIdx]   = useState(0);
  const [bodyIdx,      setBodyIdx]      = useState(0);
  const [lookingFor,   setLookingFor]   = useState<LookingForType>("Tim Project");
  const [showHackathon, setShowHackathon] = useState(true);

  // Karya interaction state
  const [requestedKarya, setRequestedKarya] = useState<Set<number>>(new Set());
  const [dmedKarya,      setDmedKarya]      = useState<Set<number>>(new Set());

  // Person interaction state
  const [invitedPersons, setInvitedPersons] = useState<Set<number>>(new Set());
  const [dmedPersons,    setDmedPersons]    = useState<Set<number>>(new Set());

  // Apply chosen fonts before render — all child refs to T.fontDisplay / T.fontBody pick this up.
  T.fontDisplay = DISPLAY_FONTS[displayIdx].font;
  T.fontBody    = BODY_FONTS[bodyIdx].font;

  function toggleRequestKarya(id: number) {
    setRequestedKarya((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleDmKarya(id: number) {
    setDmedKarya((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleInvitePerson(id: number) {
    setInvitedPersons((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleDmPerson(id: number) {
    setDmedPersons((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

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
        /* Placeholder held to the body-text contrast bar, not the UA grey. */
        input::placeholder { color: ${T.ink3}; opacity: 1; }
        /* Honour reduced-motion: collapse state transitions. */
        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
        /* ── Responsive ──────────────────────────────────────────────────────
           Below ~900px the three columns can't hold their measure. Stack to a
           single column led by the feed (mobile = consumption view), and
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
          .bn-nav-filters, .bn-nav-user { display: none !important; }
        }
        /* Comfortable touch targets where the pointer is coarse. */
        @media (pointer: coarse) {
          .bn-nav-items button { min-height: 44px; }
        }
      `}</style>

      {/* Three-column layout — left nav · center board · right rail */}
      <div className="bn-shell" style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "24px 24px 48px",
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
      }}>
        <LeftNav />
        <CariCenter
          showHackathon={showHackathon}
          onDismissHackathon={() => setShowHackathon(false)}
          requestedKarya={requestedKarya}
          onRequestKarya={toggleRequestKarya}
          dmedKarya={dmedKarya}
          onDmKarya={toggleDmKarya}
          invitedPersons={invitedPersons}
          onInvitePerson={toggleInvitePerson}
          dmedPersons={dmedPersons}
          onDmPerson={toggleDmPerson}
        />
        <ZakiRail lookingFor={lookingFor} onChangeLookingFor={setLookingFor} />
      </div>

      {/* Font switchers — fixed bottom-right (verbatim from MockupB) */}
      <div style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-end",
      }}>
        <FontSwitcher options={DISPLAY_FONTS} activeIdx={displayIdx} onChange={setDisplayIdx} />
        <FontSwitcher options={BODY_FONTS}    activeIdx={bodyIdx}    onChange={setBodyIdx}    />
      </div>
    </div>
  );
}
