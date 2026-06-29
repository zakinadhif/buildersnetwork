/**
 * Al-Fath Berkarya — Cari Kolaborator (Direction A: Two-lane split)
 *
 * The page owns the people↔karya duality with a prominent lens toggle:
 *   "Aku nyari orang" ↔ "Aku nyari karya buat gabung"
 * Toggling flips the center board between a roster of seekers and a list
 * of karya that are buka lowongan. A secondary badge-type filter refines
 * the active lane. Right rail: user's own seeker-badge status, a light
 * hackathon gesture (FR-29), and a community-pulse strip.
 *
 * Design tokens, utilities, and shell copied verbatim from MockupB.tsx.
 * Self-contained: only imports are `react` (useState) and `./images`
 * (coverFor). All data hardcoded inline.
 *
 * To preview: mockups.html already loads all required Google Fonts.
 */

import { useState } from "react";
import { coverFor } from "./images";

// ─── Design Tokens ── (verbatim from MockupB) ─────────────────────────────────
const T = {
  bg:          "oklch(98% 0 0)",             // gallery white (neutral)
  ink:         "oklch(18% 0 0)",             // soft neutral near-black
  ink2:        "oklch(46% 0 0)",             // muted body — ~4.7:1 on white (AA)
  ink3:        "oklch(53% 0 0)",             // meta text — ~5:1 on bg (AA)
  accent:      "oklch(39% 0.085 62)",        // terracotta
  accentMid:   "oklch(55% 0.085 62)",        // terracotta mid — ~4.7:1 on bg (AA)
  accentFg:    "oklch(99% 0 0)",             // text on accent
  accentTint:  "oklch(95% 0.015 62)",        // light terracotta wash
  accentLine:  "oklch(88% 0.03 62)",         // terracotta-tinted hairline
  line:        "oklch(91% 0 0)",             // neutral hairline
  lineDark:    "oklch(85% 0 0)",
  surface:     "oklch(100% 0 0)",            // pure white lifted card
  fontDisplay: "'Lora', serif" as string,
  fontBody:    "'Plus Jakarta Sans', sans-serif" as string,

  // Type scale — fixed px. Distinct roles, not arbitrary steps.
  size: {
    micro:   10,   // eyebrow labels, tags, chips, dense inline meta
    caption: 11,   // subtitles, standalone secondary text, small counts
    ui:      12,   // nav, filters, controls, buttons, secondary body
    body:    13,   // primary body: descriptions, bios
    stat:    15,   // featured metric values
    title:   18,   // serif list-item titles + callout heading
    feature: 23,   // serif wordmark + featured title
    display: 30,   // serif page heading
  },
  weight: { light: 300, regular: 400, medium: 500, semibold: 600 },
  track:  { wide: "0.08em", tag: "0.02em", tight: "-0.01em" },
  lh:     { tight: 1.15, snug: 1.3, body: 1.55 },
  radius:   "8px",
  radiusLg: "16px",
};

// ─── Font switcher options ── (verbatim from MockupB) ─────────────────────────
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

// ─── Domain types ─────────────────────────────────────────────────────────────

/** Badge types map directly to the three FR-29 looking-for categories. */
type BadgeType = "hackathon" | "project" | "gig";

/** A person actively looking for a team or gig. */
interface Seeker {
  id: number;
  name: string;
  handle: string;
  tingkat: string;         // e.g. "Tkt 3"
  jurusan: string;         // e.g. "S1 Teknik Informatika"
  bio: string;
  skills: string[];
  badge: BadgeType;
  currentKarya: { title: string; role: string } | null;
  postedHoursAgo: number;
}

/** A karya that has open contributor slots. */
interface KaryaSlot {
  id: number;
  title: string;
  desc: string;
  interests: string[];
  stage: string;
  openRoles: string[];     // e.g. ["1 Backend Go", "1 UI Designer"]
  roster: { name: string }[];
  postedHoursAgo: number;
  badge: BadgeType;        // what kind of help they're asking for
}

// ─── Badge labels ─────────────────────────────────────────────────────────────
const BADGE_LABEL: Record<BadgeType, string> = {
  hackathon: "Tim Hackathon",
  project:   "Tim Project",
  gig:       "Gig / Talenta",
};

// ─── Sample data — Seekers ────────────────────────────────────────────────────
// Names reused from MockupB for continuity; Siti Rahmah & Budi Santoso also
// appear in MockupB rosters. Three new names added to fill the gig/hackathon
// slots naturally.

const SEEKERS: Seeker[] = [
  {
    id: 1,
    name: "Arief Maulana",
    handle: "@arief_dev",
    tingkat: "Tkt 3",
    jurusan: "S1 Teknik Informatika",
    bio: "Full-stack yang suka bangun produk yang beneran dipakai. Lagi cari tim project jangka panjang — nyaman di backend tapi bisa handle integrasi API.",
    skills: ["React", "Hono", "PostgreSQL", "Go"],
    badge: "project",
    currentKarya: { title: "KampusKerja", role: "Lead Dev" },
    postedHoursAgo: 3,
  },
  {
    id: 2,
    name: "Dian Pertiwi",
    handle: "@dianp",
    tingkat: "Tkt 3",
    jurusan: "S1 Sistem Informasi",
    bio: "UX researcher dan product thinker. Antusias hackathon — suka problem sosial, komunitas lokal, dan UMKM. Udah ikut PKM dua kali.",
    skills: ["UX Research", "Figma", "Miro", "Notion"],
    badge: "hackathon",
    currentKarya: { title: "Warung Digital", role: "Product" },
    postedHoursAgo: 7,
  },
  {
    id: 3,
    name: "Rizal Hakim",
    handle: "@rizalh",
    tingkat: "Tkt 4",
    jurusan: "S1 Teknik Informatika",
    bio: "ML researcher fokus NLP bahasa daerah. Cari tim yang serius di bidang data atau AI — bukan sekadar demo, tapi riset yang bisa dipublikasikan.",
    skills: ["Python", "PyTorch", "HuggingFace", "FastAPI"],
    badge: "project",
    currentKarya: { title: "Aksara AI", role: "Research Lead" },
    postedHoursAgo: 11,
  },
  {
    id: 4,
    name: "Nadia Kusuma",
    handle: "@nadiaku",
    tingkat: "Tkt 2",
    jurusan: "S1 Desain Komunikasi Visual",
    bio: "UI/UX designer yang juga bisa koding CSS. Open untuk freelance ringan — bantu desain tampilan, bikin komponen, atau UI audit cepat.",
    skills: ["Figma", "Tailwind", "Vue", "Ilustrasi"],
    badge: "gig",
    currentKarya: { title: "BukuSaku Kampus", role: "UI Designer" },
    postedHoursAgo: 15,
  },
  {
    id: 5,
    name: "Farhan Ardiansyah",
    handle: "@farhan_a",
    tingkat: "Tkt 2",
    jurusan: "S1 Teknik Informatika",
    bio: "Mahasiswa tahun dua yang antusias dan cepat belajar. Lagi aktif cari tim untuk GEMASTIK 2026 — siap ambil bagian di mana pun dibutuhkan.",
    skills: ["JavaScript", "Python", "Git", "SQL"],
    badge: "hackathon",
    currentKarya: { title: "Peta Kost", role: "Dev" },
    postedHoursAgo: 22,
  },
  {
    id: 6,
    name: "Eko Saputra",
    handle: "@eko_s",
    tingkat: "Tkt 3",
    jurusan: "S1 Teknik Informatika",
    bio: "Backend engineer spesialis Go dan Docker. Tersedia untuk kontribusi gig jangka pendek — migrasi database, setup infrastruktur, atau review kode.",
    skills: ["Go", "Docker", "PostgreSQL", "Redis"],
    badge: "gig",
    currentKarya: { title: "Warung Digital", role: "Backend" },
    postedHoursAgo: 28,
  },
  {
    id: 7,
    name: "Aldi Pratama",
    handle: "@aldip_music",
    tingkat: "Tkt 3",
    jurusan: "S1 Teknik Informatika",
    bio: "Developer yang juga musisi. Bangun Sound Nusantara, tapi open untuk project sampingan yang ada irisan kreatif atau komunitas.",
    skills: ["React", "TypeScript", "Web Audio API", "Node.js"],
    badge: "project",
    currentKarya: { title: "Sound Nusantara", role: "Founder" },
    postedHoursAgo: 36,
  },
  {
    id: 8,
    name: "Siti Rahmah",
    handle: "@siti_ux",
    tingkat: "Tkt 2",
    jurusan: "S1 Desain Komunikasi Visual",
    bio: "Desainer grafis dan motion. Open untuk hackathon atau bantuan visual branding — kalau karyamu belum punya tampilan, aku bisa bantu.",
    skills: ["Figma", "After Effects", "Illustrator", "Canva"],
    badge: "hackathon",
    currentKarya: { title: "KampusKerja", role: "UI Designer" },
    postedHoursAgo: 44,
  },
  {
    id: 9,
    name: "Budi Santoso",
    handle: "@budisnt",
    tingkat: "Tkt 3",
    jurusan: "S1 Teknik Informatika",
    bio: "Mobile developer React Native. Tersedia untuk gig pendek — tambah halaman, bikin fitur kecil, atau bantu optimasi performa aplikasi.",
    skills: ["React Native", "Expo", "TypeScript", "Firebase"],
    badge: "gig",
    currentKarya: { title: "BukuSaku Kampus", role: "Mobile Dev" },
    postedHoursAgo: 58,
  },
];

// ─── Sample data — Karya open slots ───────────────────────────────────────────
const KARYA_SLOTS: KaryaSlot[] = [
  {
    id: 1,
    title: "MahasiswaLaga",
    desc: "Platform gamifikasi lomba kampus — skor, badge, dan papan kompetisi antar jurusan. Ini tim GEMASTIK 2026 kami.",
    interests: ["Komunitas", "Web", "Produktivitas"],
    stage: "GEMASTIK 2026",
    openRoles: ["1 Frontend React", "1 Backend Go", "1 UI/UX Designer"],
    roster: [{ name: "Hana Puspita" }, { name: "Taufik Hidayat" }],
    postedHoursAgo: 12,
    badge: "hackathon",
  },
  {
    id: 2,
    title: "WargaSehat",
    desc: "Asisten gizi berbasis AI untuk mahasiswa kos — input makanan harian, dapat analisis nutrisi sederhana.",
    interests: ["Kesehatan", "AI/ML", "Mobile"],
    stage: "Hackathon",
    openRoles: ["1 ML Engineer", "1 UI Designer"],
    roster: [{ name: "Laila Novitasari" }, { name: "Reza Permana" }],
    postedHoursAgo: 18,
    badge: "hackathon",
  },
  {
    id: 3,
    title: "Peta Kost",
    desc: "Aggregator kost area Telkom University dengan ulasan jujur dari penghuni aktif.",
    interests: ["Web", "Maps", "Komunitas"],
    stage: "Beta",
    openRoles: ["1 Backend Go", "1 UI Designer"],
    roster: [{ name: "Farhan Ardiansyah" }],
    postedHoursAgo: 26,
    badge: "project",
  },
  {
    id: 4,
    title: "Aksara AI",
    desc: "Model bahasa kecil dilatih corpus Sunda & Jawa — untuk eksperimen NLP lokal yang bisa dipublikasikan.",
    interests: ["AI/ML", "Bahasa", "Open Source"],
    stage: "Riset",
    openRoles: ["1 NLP Researcher", "1 Data Annotator"],
    roster: [{ name: "Rizal Hakim" }],
    postedHoursAgo: 34,
    badge: "project",
  },
  {
    id: 5,
    title: "Sound Nusantara",
    desc: "Arsip dan label indie musik mahasiswa — upload gratis, lisensi terbuka, dikurasi komunitas.",
    interests: ["Musik", "Komunitas", "Open Source"],
    stage: "Ide",
    openRoles: ["1 Backend Dev", "1 Sound Engineer"],
    roster: [{ name: "Aldi Pratama" }],
    postedHoursAgo: 52,
    badge: "project",
  },
  {
    id: 6,
    title: "Jadwal Bersama",
    desc: "Koordinasi jadwal kelompok tanpa drama — sinkron kalender akademik Telkom secara otomatis.",
    interests: ["Produktivitas", "Kolaborasi", "Web"],
    stage: "Prototype",
    openRoles: ["1 Backend Dev", "1 QA Tester"],
    roster: [{ name: "Mega Wulandari" }, { name: "Taufik Hidayat" }],
    postedHoursAgo: 68,
    badge: "project",
  },
  {
    id: 7,
    title: "KampusDesain",
    desc: "Marketplace brief desain mahasiswa — ambil brief, selesaikan, bangun portofolio nyata.",
    interests: ["Desain", "Komunitas", "Konten"],
    stage: "Ide",
    openRoles: ["1 Full-stack Dev"],
    roster: [{ name: "Nadia Kusuma" }],
    postedHoursAgo: 5,
    badge: "gig",
  },
];

// ─── Utilities ── (verbatim from MockupB) ─────────────────────────────────────
function relativeTime(hoursAgo: number): string {
  if (hoursAgo < 1) return "baru saja";
  if (hoursAgo < 24) return `${hoursAgo} jam lalu`;
  const days = Math.round(hoursAgo / 24);
  return days === 1 ? "kemarin" : `${days} hari lalu`;
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// Stable pastel hues from a full-string hash (avoids first-letter collisions).
function avatarColor(name: string): string {
  const hues = [22, 40, 62, 90, 155, 200, 255, 310];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `oklch(78% 0.08 ${hues[h % hues.length]})`;
}

// Shared style for short uppercase eyebrow / section labels.
const eyebrow = {
  fontFamily:    T.fontBody,
  fontSize:      T.size.micro,
  fontWeight:    T.weight.medium,
  letterSpacing: T.track.wide,
  textTransform: "uppercase" as const,
  color:         T.ink3,
};

// ─── Micro components ── (verbatim from MockupB) ──────────────────────────────
function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span style={{
      display:         "inline-block",
      fontFamily:      T.fontBody,
      fontSize:        T.size.micro,
      letterSpacing:   T.track.tag,
      padding:         "1px 7px",
      borderRadius:    "3px",
      border:          `1px solid ${accent ? T.accent : T.line}`,
      color:           accent ? T.accent : T.ink2,
      backgroundColor: accent ? T.accentTint : "transparent",
      whiteSpace:      "nowrap" as const,
    }}>{label}</span>
  );
}

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span aria-hidden="true" style={{
      display:         "inline-flex",
      alignItems:      "center",
      justifyContent:  "center",
      width:           size,
      height:          size,
      borderRadius:    "50%",
      backgroundColor: avatarColor(name),
      color:           T.ink,
      fontFamily:      T.fontBody,
      fontSize:        size * 0.36,
      fontWeight:      T.weight.medium,
      flexShrink:      0,
      border:          `1.5px solid ${T.line}`,
      userSelect:      "none" as const,
    }}>
      {initials(name)}
    </span>
  );
}

// ─── Badge chip ───────────────────────────────────────────────────────────────
// Three visual weights: hackathon = terracotta (urgent/event), project =
// neutral dark border, gig = hairline quiet.
function BadgeChip({ type }: { type: BadgeType }) {
  const isHackathon = type === "hackathon";
  const isProject   = type === "project";
  return (
    <span style={{
      display:         "inline-block",
      fontFamily:      T.fontBody,
      fontSize:        T.size.micro,
      letterSpacing:   T.track.wide,
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

// ─── Left Nav ── (adapted from MockupB — "Cari Kolaborator" always active) ────
const NAV_ITEMS = [
  { label: "Launchpad",        icon: "◈" },
  { label: "Jelajahi Karya",   icon: "◉" },
  { label: "Cari Kolaborator", icon: "◎" }, // ← this page
  { label: "Minat Saya",       icon: "◇" },
  { label: "Karya Saya",       icon: "◆" },
];

function LeftNav() {
  return (
    <aside className="bn-nav" style={{
      width:          200,
      flexShrink:     0,
      display:        "flex",
      flexDirection:  "column" as const,
      gap:            0,
      paddingTop:     8,
    }}>
      {/* Logo */}
      <div className="bn-nav-logo" style={{
        padding:      "0 12px 20px",
        borderBottom: `1px solid ${T.line}`,
        marginBottom: 16,
      }}>
        <div style={{ ...eyebrow, marginBottom: 4 }}>Al-Fath</div>
        <div style={{
          fontFamily:  T.fontDisplay,
          fontSize:    T.size.feature,
          fontWeight:  T.weight.regular,
          color:       T.ink,
          lineHeight:  1,
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
                display:         "flex",
                alignItems:      "center",
                gap:             10,
                width:           "100%",
                textAlign:       "left" as const,
                border:          "none",
                padding:         "7px 12px",
                borderRadius:    T.radius,
                backgroundColor: active ? T.accentTint : "transparent",
                color:           active ? T.accent : T.ink2,
                fontFamily:      T.fontBody,
                fontSize:        T.size.body,
                fontWeight:      active ? T.weight.medium : T.weight.regular,
                cursor:          active ? "default" : "pointer",
                marginBottom:    1,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: T.size.ui }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User stub */}
      <div className="bn-nav-user" style={{
        marginTop:    "auto",
        borderTop:    `1px solid ${T.line}`,
        padding:      "16px 12px 0",
        display:      "flex",
        alignItems:   "center",
        gap:          8,
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
            display:     "flex",
            alignItems:  "center",
            gap:         8,
            flexWrap:    "wrap" as const,
            marginBottom: 2,
          }}>
            <span style={{
              fontFamily: T.fontDisplay,
              fontSize:   T.size.title,
              fontWeight: T.weight.regular,
              color:      T.ink,
              lineHeight: T.lh.tight,
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
            lineHeight:   T.lh.snug,
          }}>
            {seeker.tingkat} · {seeker.jurusan} · diposting {relativeTime(seeker.postedHoursAgo)}
          </div>

          {/* Bio */}
          <p style={{
            margin:      "0 0 10px",
            fontFamily:  T.fontBody,
            fontSize:    T.size.body,
            color:       T.ink2,
            lineHeight:  T.lh.body,
          }}>{seeker.bio}</p>

          {/* Skill chips */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginBottom: 10 }}>
            {seeker.skills.map((s) => <Tag key={s} label={s} accent />)}
          </div>

          {/* Current karya */}
          {seeker.currentKarya && (
            <div style={{
              display:     "flex",
              alignItems:  "center",
              gap:         6,
              marginBottom: 14,
              flexWrap:    "wrap" as const,
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
              borderRadius:    T.radius,
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
              borderRadius: T.radius,
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
          width:      56,
          height:     56,
          flexShrink: 0,
          borderRadius: 14,
          overflow:   "hidden",
          border:     `1px solid ${T.line}`,
          background: T.bg,
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
            display:     "flex",
            alignItems:  "center",
            gap:         8,
            flexWrap:    "wrap" as const,
            marginBottom: 2,
          }}>
            <h3 style={{
              margin:     0,
              fontFamily: T.fontDisplay,
              fontSize:   T.size.title,
              fontWeight: T.weight.regular,
              color:      T.ink,
              lineHeight: T.lh.tight,
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
            display:     "flex",
            alignItems:  "center",
            gap:         6,
            flexWrap:    "wrap" as const,
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
            display:    "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap:   "wrap" as const,
            gap:        10,
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
                borderRadius:    T.radius,
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
                borderRadius: T.radius,
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
type Lane         = "orang" | "karya";
type FilterKey    = "Semua" | BadgeType;

const BADGE_FILTERS: { id: FilterKey; label: string }[] = [
  { id: "Semua",     label: "Semua" },
  { id: "hackathon", label: "Hackathon" },
  { id: "project",   label: "Project" },
  { id: "gig",       label: "Gig" },
];

function CenterBoard() {
  const [lane, setLane]             = useState<Lane>("orang");
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
      flex:           1,
      minWidth:       0,
      display:        "flex",
      flexDirection:  "column" as const,
      gap:            0,
    }}>
      {/* Page heading */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          margin:        "0 0 4px",
          fontFamily:    T.fontDisplay,
          fontSize:      T.size.display,
          fontWeight:    T.weight.regular,
          letterSpacing: T.track.tight,
          color:         T.ink,
          lineHeight:    T.lh.tight,
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
        borderRadius:    T.radiusLg,
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
                background:   active ? T.accentTint : "transparent",
                border:       `1px solid ${active ? T.accent : T.line}`,
                color:        active ? T.accent : T.ink2,
                borderRadius: 99,
                padding:      "4px 14px",
                fontFamily:   T.fontBody,
                fontSize:     T.size.ui,
                fontWeight:   active ? T.weight.medium : T.weight.regular,
                cursor:       "pointer",
                letterSpacing: T.track.tag,
                transition:   "background 0.12s, color 0.12s, border-color 0.12s",
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
        marginTop:    24,
        padding:      "16px 20px",
        borderRadius: T.radiusLg,
        border:       `1.5px dashed ${T.lineDark}`,
        display:      "flex",
        alignItems:   "center",
        justifyContent: "space-between",
        gap:          12,
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
          borderRadius:    T.radius,
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
  const [myBadge, setMyBadge] = useState<BadgeType | null>(null);

  return (
    <aside className="bn-rail" style={{
      width:          232,
      flexShrink:     0,
      display:        "flex",
      flexDirection:  "column" as const,
      gap:            16,
      paddingTop:     0,
      position:       "sticky" as const,
      top:            24,
    }}>

      {/* ── Status kamu — seeker badge picker ─────────────────────────────── */}
      {/* Prompts the viewer to set or update their own "looking for" badge. */}
      <div style={{
        backgroundColor: T.accentTint,
        border:          `1px solid ${T.accentLine}`,
        borderRadius:    T.radiusLg,
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
              lineHeight:   T.lh.snug,
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
                borderRadius: T.radius,
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
              lineHeight:   T.lh.snug,
              marginBottom: 12,
            }}>
              Kasih tahu komunitas kamu lagi nyari apa.
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
              {(["hackathon", "project", "gig"] as BadgeType[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setMyBadge(b)}
                  style={{
                    textAlign:    "left" as const,
                    background:   T.surface,
                    border:       `1px solid ${T.line}`,
                    borderRadius: T.radius,
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
        borderRadius:    T.radiusLg,
        padding:         "12px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span aria-hidden="true" style={{ color: T.accent, fontSize: 14 }}>✦</span>
          <div style={eyebrow}>GEMASTIK 2026</div>
        </div>
        <p style={{
          margin:       "0 0 10px",
          fontFamily:   T.fontBody,
          fontSize:     T.size.body,
          color:        T.ink,
          lineHeight:   T.lh.snug,
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
          borderRadius: T.radius,
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
        borderRadius:    T.radiusLg,
        padding:         "12px 14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Denyut sekarang</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {[
            { label: "Orang aktif cari tim",  value: SEEKERS.length },
            { label: "Karya buka slot",        value: KARYA_SLOTS.length },
            { label: "Match minggu ini",       value: 11 },
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

// ─── Font Switcher ── (verbatim from MockupB) ─────────────────────────────────
function FontSwitcher({ options, activeIdx, onChange }: {
  options: readonly { font: string; label: string }[];
  activeIdx: number;
  onChange: (i: number) => void;
}) {
  return (
    <div
      role="group"
      style={{
        background:   T.surface,
        border:       `1px solid ${T.lineDark}`,
        borderRadius: 99,
        boxShadow:    "0 4px 16px oklch(0% 0 0 / 10%)",
        display:      "flex",
        padding:      3,
        gap:          2,
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
              display:     "inline-flex",
              alignItems:  "center",
              gap:         6,
              padding:     "5px 13px",
              borderRadius: 99,
              border:      "none",
              background:  active ? T.ink : "transparent",
              color:       active ? T.bg : T.ink3,
              fontFamily:  T.fontBody,
              fontSize:    T.size.micro,
              fontWeight:  active ? T.weight.medium : T.weight.regular,
              cursor:      "pointer",
              letterSpacing: T.track.tag,
              whiteSpace:  "nowrap" as const,
              transition:  "background 0.12s, color 0.12s",
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

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function CariKolaboratorMockup() {
  const [displayIdx, setDisplayIdx] = useState(0);
  const [bodyIdx,    setBodyIdx]    = useState(0);

  // Mutate T before render — all child references to T.fontDisplay /
  // T.fontBody pick up the user's choice immediately.
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

        /* Placeholder held to body-text contrast bar, not UA grey. */
        input::placeholder { color: ${T.ink3}; opacity: 1; }

        /* Honour reduced-motion: collapse 0.15s state transitions. */
        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }

        /* ── Responsive ────────────────────────────────────────────────────
           Below ~900px the three columns can't hold their measure. Stack to a
           single column led by the board (mobile = the consumption view). */
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

      {/* Three-column layout (collapses below ~900px) */}
      <div className="bn-shell" style={{
        maxWidth: 1100,
        margin:   "0 auto",
        padding:  "24px 24px 48px",
        display:  "flex",
        gap:      24,
        alignItems: "flex-start",
      }}>
        <LeftNav />
        <CenterBoard />
        <RightRail />
      </div>

      {/* Font switcher — fixed bottom-right, same position as MockupB */}
      <div style={{
        position:       "fixed",
        bottom:         20,
        right:          20,
        zIndex:         100,
        display:        "flex",
        flexDirection:  "column",
        gap:            8,
        alignItems:     "flex-end",
      }}>
        <FontSwitcher options={DISPLAY_FONTS} activeIdx={displayIdx} onChange={setDisplayIdx} />
        <FontSwitcher options={BODY_FONTS}    activeIdx={bodyIdx}    onChange={setBodyIdx}    />
      </div>
    </div>
  );
}
