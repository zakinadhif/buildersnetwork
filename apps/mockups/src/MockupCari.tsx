/**
 * Al-Fath Berkarya — Cari Kolaborator: variant explorations A/B/C/E in one file.
 *
 * The four directions (Two-lane · Intent · Match · Wall) share ONE design-token
 * set instead of each re-declaring them. Each variant body is a self-contained
 * component; the default export CariScreen owns the variant picker. Because the
 * picker lives inside this screen, it only appears while Cari Kolaborator is on
 * show. Fonts come from the gallery's shared switcher via useFonts (./fonts).
 */

import { useState } from "react";
import { coverFor } from "./images";
import { useNavigate, NAV_SCREEN } from "./gallery";
import { useFonts } from "./fonts";

// ─── Design Tokens (shared by every Cari variant) ─────────────────────────────
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
    micro:   10,
    caption: 11,
    ui:      12,
    body:    13,
    stat:    15,
    title:   18,
    feature: 23,
    display: 30,
  },
  weight: { light: 300, regular: 400, medium: 500, semibold: 600 },
  track:  { wide: "0.08em", tag: "0.02em", tight: "-0.01em" },
  lh:     { tight: 1.15, snug: 1.3, body: 1.55 },
  radius:   "8px",
  radiusLg: "16px",
};

// ─── Utilities (shared) ───────────────────────────────────────────────────────
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

// ─── Micro components (shared) ────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════
// Variant A
// ═══════════════════════════════════════════════════════════════════════════

// ─── Domain types ─────────────────────────────────────────────────────────────

/** Badge types map directly to the three FR-29 looking-for categories. */
type BadgeTypeA = "hackathon" | "project" | "gig";

/** A person actively looking for a team or gig. */
interface Seeker {
  id: number;
  name: string;
  handle: string;
  tingkat: string;         // e.g. "Tkt 3"
  jurusan: string;         // e.g. "S1 Teknik Informatika"
  bio: string;
  skills: string[];
  badge: BadgeTypeA;
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
  badge: BadgeTypeA;        // what kind of help they're asking for
}

// ─── Badge labels ─────────────────────────────────────────────────────────────
const BADGE_LABEL: Record<BadgeTypeA, string> = {
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

// ─── Badge chip ───────────────────────────────────────────────────────────────
// Three visual weights: hackathon = terracotta (urgent/event), project =
// neutral dark border, gig = hairline quiet.
function BadgeChip({ type }: { type: BadgeTypeA }) {
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
const NAV_ITEMS_A = [
  { label: "Launchpad",        icon: "◈" },
  { label: "Jelajahi Karya",   icon: "◉" },
  { label: "Cari Kolaborator", icon: "◎" }, // ← this page
  { label: "Minat Saya",       icon: "◇" },
  { label: "Karya Saya",       icon: "◆" },
];

function LeftNavA() {
  const navigate = useNavigate();
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
        {NAV_ITEMS_A.map((item) => {
          const active = item.label === "Cari Kolaborator";
          const target = NAV_SCREEN[item.label];
          return (
            <button
              key={item.label}
              type="button"
              onClick={target ? () => navigate(target) : undefined}
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
type FilterKey    = "Semua" | BadgeTypeA;

const BADGE_FILTERS: { id: FilterKey; label: string }[] = [
  { id: "Semua",     label: "Semua" },
  { id: "hackathon", label: "Hackathon" },
  { id: "project",   label: "Project" },
  { id: "gig",       label: "Gig" },
];

function CenterBoardA() {
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
function RightRailA() {
  // Mock interactive state: user's own seeker badge.
  const [myBadge, setMyBadge] = useState<BadgeTypeA | null>(null);

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
              {(["hackathon", "project", "gig"] as BadgeTypeA[]).map((b) => (
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

// ─── Variant A body ───────────────────────────────────────────────────────────
function CariABody() {
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
        <LeftNavA />
        <CenterBoardA />
        <RightRailA />
      </div>

    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// Variant B
// ═══════════════════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────────────────────
type BadgeTypeB = "Tim Hackathon" | "Tim Project" | "Talenta/Gig";

interface PersonSeeker {
  id: number;
  name: string;
  handle: string;
  year: number;
  major: string;
  bio: string;
  skills: string[];
  badge: BadgeTypeB;
  currentKarya: string | null;
  note: string;
}

interface KaryaSeeker {
  id: number;
  title: string;
  description: string;
  interests: string[];
  badge: BadgeTypeB;
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

// ─── Badge Pill ───────────────────────────────────────────────────────────────
// Three visual weights: hackathon = solid accent (urgent), project = tinted,
// gig = ghost (lowest friction). All within the existing T token set.
function BadgePill({ badge }: { badge: BadgeTypeB }) {
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
const NAV_ITEMS_B = [
  { label: "Launchpad",        icon: "◈" },
  { label: "Jelajahi Karya",   icon: "◉" },
  { label: "Cari Kolaborator", icon: "◎" },
  { label: "Minat Saya",       icon: "◇" },
  { label: "Karya Saya",       icon: "◆" },
];

const INTENT_FILTERS = ["Semua", "Tim Hackathon", "Tim Project", "Talenta/Gig"];

function LeftNavB({ activeSection, onSection }: {
  activeSection: string;
  onSection: (s: string) => void;
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
        {NAV_ITEMS_B.map((item) => {
          const active = item.label === "Cari Kolaborator";
          const target = NAV_SCREEN[item.label];
          return (
            <button
              key={item.label}
              type="button"
              onClick={target ? () => navigate(target) : undefined}
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
function HackathonBannerB() {
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
  badge: BadgeTypeB;
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
      {showBanner && <HackathonBannerB />}

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
function CenterBoardB({ activeSection, onSection }: {
  activeSection: string;
  onSection: (s: string) => void;
}) {
  // Build interleaved item lists per badge type.
  // Interleaving (person, karya, person…) means both card types share every
  // row of the grid, reinforcing that the section is about *intent*, not type.
  function buildItems(badge: BadgeTypeB): CardItem[] {
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

  const SECTIONS: { badge: BadgeTypeB; icon: string; showBanner?: boolean }[] = [
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
function RightRailB() {
  const [seeking, setSeeking] = useState<BadgeTypeB | null>(null);

  // Count entries per badge type (people + karya combined)
  const pulse = (["Tim Hackathon", "Tim Project", "Talenta/Gig"] as BadgeTypeB[]).map((b) => ({
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
              {(["Tim Hackathon", "Tim Project", "Talenta/Gig"] as BadgeTypeB[]).map((b) => (
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

// ─── Variant B body ───────────────────────────────────────────────────────────
function CariBBody() {
  const [activeSection, setActiveSection] = useState("Semua");

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
        <LeftNavB activeSection={activeSection} onSection={setActiveSection} />
        <CenterBoardB activeSection={activeSection} onSection={setActiveSection} />
        <RightRailB />
      </div>

    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// Variant C
// ═══════════════════════════════════════════════════════════════════════════

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
const NAV_ITEMS_C = [
  { label: "Launchpad",         icon: "◈" },
  { label: "Jelajahi Karya",    icon: "◉" },
  { label: "Cari Kolaborator",  icon: "◎" },
  { label: "Minat Saya",        icon: "◇" },
  { label: "Karya Saya",        icon: "◆" },
];

function LeftNavC() {
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
        {NAV_ITEMS_C.map((item) => {
          const active = item.label === "Cari Kolaborator";
          const target = NAV_SCREEN[item.label];
          return (
            <button
              key={item.label}
              type="button"
              onClick={target ? () => navigate(target) : undefined}
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
function HackathonBannerC({ onDismiss }: { onDismiss: () => void }) {
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
      {showHackathon && <HackathonBannerC onDismiss={onDismissHackathon} />}

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

// ─── Variant C body ───────────────────────────────────────────────────────────
function CariCBody() {
  const [lookingFor,   setLookingFor]   = useState<LookingForType>("Tim Project");
  const [showHackathon, setShowHackathon] = useState(true);

  // Karya interaction state
  const [requestedKarya, setRequestedKarya] = useState<Set<number>>(new Set());
  const [dmedKarya,      setDmedKarya]      = useState<Set<number>>(new Set());

  // Person interaction state
  const [invitedPersons, setInvitedPersons] = useState<Set<number>>(new Set());
  const [dmedPersons,    setDmedPersons]    = useState<Set<number>>(new Set());

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
        <LeftNavC />
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

    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// Variant E
// ═══════════════════════════════════════════════════════════════════════════

// ─── Ask Data ─────────────────────────────────────────────────────────────────
// Three badge types from the PRD. Each ask is either "person" (a human seeking
// a team or project) or "karya" (a project seeking contributors).
type AskType = "Hackathon" | "Project" | "Gig";

interface Ask {
  id: number;
  type: AskType;
  from: "person" | "karya";
  // person identity
  name?: string;
  handle?: string;
  // karya identity
  karyaTitle?: string;
  karyaInterests?: string[];  // drives coverFor()
  karyaRoster?: string;       // short "oleh @handle" credit line
  // content — the free-text first-person note is the visual hero
  note: string;
  seeking: string[];          // skills / open roles as chips below the note
  hoursAgo: number;
}

const ASKS: Ask[] = [
  // ── Hackathon asks ─────────────────────────────────────────────────────────
  {
    id: 1,
    type: "Hackathon",
    from: "person",
    name: "Arief Maulana",
    handle: "@arief_dev",
    note: "Nyari temen frontend (React) buat hackathon GEMASTIK 2026! Tim kami udah ada 2 orang — saya handle backend, ada yang UX. Tinggal butuh 1 dev frontend yang mau gerak cepat. Ide: platform monitoring kesehatan berbasis komunitas. DM kalau tertarik 🙌",
    seeking: ["React", "TypeScript", "UI/UX"],
    hoursAgo: 1,
  },
  {
    id: 2,
    type: "Hackathon",
    from: "person",
    name: "Nadia Kusuma",
    handle: "@nadiaku",
    note: "Mau ikut INAICTA kategori fintech, tim cuma 2 orang sejauh ini (saya + 1 teman). Masih butuh 1 developer fullstack yang suka problem keuangan mahasiswa. Nggak perlu expert — yang penting mau belajar bareng dan committed sampai akhir.",
    seeking: ["React", "Node.js", "PostgreSQL"],
    hoursAgo: 3,
  },
  {
    id: 10,
    type: "Hackathon",
    from: "person",
    name: "Siti Rahmah",
    handle: "@siti_ux",
    note: "Mau ikut Hackatech Bandung bulan depan, cari 1–2 orang yang mau tim kecil tapi solid. Saya fokus di riset pengguna dan storytelling. Butuh dev yang bisa deliver MVP dalam 36 jam — React atau Vue sama-sama oke. Kalau bisa pitch juga, bonus poin 😁",
    seeking: ["React", "Vue.js", "Public Speaking"],
    hoursAgo: 45,
  },
  {
    id: 12,
    type: "Hackathon",
    from: "person",
    name: "Mega Wulandari",
    handle: "@megaw",
    note: "Cari 1–2 developer buat tim GEMASTIK kategori Kecerdasan Buatan. Ide dan dataset udah ada (saya yang urus), tinggal butuh yang bisa implement dan tuning model. Serius tapi tetap fun — kita bagi tugas adil. Deadline daftar tim 30 Juni, gas! 🔥",
    seeking: ["Python", "PyTorch", "Machine Learning"],
    hoursAgo: 60,
  },
  // ── Project asks ────────────────────────────────────────────────────────────
  {
    id: 3,
    type: "Project",
    from: "karya",
    karyaTitle: "Peta Kost",
    karyaInterests: ["Web", "Maps", "Komunitas"],
    karyaRoster: "oleh @farhan_a",
    note: "Peta Kost lagi butuh 1 orang backend (Go atau Node) yang santai diajak iterasi mingguan. Nggak harus full-time — 3–4 jam seminggu sudah cukup. Kita pakai PostgreSQL + tRPC. Kalau kamu suka maps dan mau kontribusi nyata buat sesama penghuni kost, yuk ngobrol dulu.",
    seeking: ["Go", "Node.js", "PostgreSQL"],
    hoursAgo: 5,
  },
  {
    id: 4,
    type: "Project",
    from: "person",
    name: "Rizal Hakim",
    handle: "@rizalh",
    note: "Lagi riset NLP bahasa daerah — nyari co-researcher atau kontributor dataset yang punya akses ke teks Sunda/Jawa (puisi, cerpen, artikel lokal). Bisa async banget, nggak ada target ketat. Hasilnya rencananya open-source. Yang tertarik, DM ya — senang diskusi santai dulu.",
    seeking: ["NLP", "Python", "Dataset"],
    hoursAgo: 8,
  },
  {
    id: 7,
    type: "Project",
    from: "person",
    name: "Eko Saputra",
    handle: "@eko_s",
    note: "Nyari teman buat bikin tools CLI sederhana (Go/Rust) — otomasi reminder pengumpulan tugas kuliah, sync ke Google Calendar, kirim notif WA. Nggak serius-serius banget, lebih ke fun project + belajar bareng. Kamu yang mau improve Go sambil bikin sesuatu yang beneran kita pakai, mangga 🙂",
    seeking: ["Go", "Rust", "CLI Tools"],
    hoursAgo: 22,
  },
  {
    id: 9,
    type: "Project",
    from: "person",
    name: "Farhan Ardiansyah",
    handle: "@farhan_a",
    note: "Mau bikin unofficial API wrapper buat data kampus (jadwal kuliah, kalender akademik) — informasinya publik tapi belum ada yang bungkus jadi API yang nyaman dipakai. Saya udah mulai, tinggal butuh 1–2 teman buat parsing, maintenance, dan dokumentasi. Open source dari hari pertama.",
    seeking: ["Python", "REST API", "Web Scraping"],
    hoursAgo: 38,
  },
  // ── Gig asks ────────────────────────────────────────────────────────────────
  {
    id: 5,
    type: "Gig",
    from: "karya",
    karyaTitle: "Sound Nusantara",
    karyaInterests: ["Musik", "Komunitas", "Open Source"],
    karyaRoster: "oleh @aldip_music",
    note: "Sound Nusantara butuh desainer grafis atau visual artist untuk bikin artwork cover album indie. Nggak ada budget cash, tapi nama kamu masuk kredit di semua rilis dan boleh dipakai di portofolio. Ini karya komunitas yang beneran didengar orang 🎶",
    seeking: ["Desain Grafis", "Ilustrasi", "Branding"],
    hoursAgo: 12,
  },
  {
    id: 6,
    type: "Gig",
    from: "person",
    name: "Dian Pertiwi",
    handle: "@dianp",
    note: "Ada yang bisa bantu desain logo + color palette buat project edukasi anak sekolah? Serius dipakai, bukan cuma tugas kuliah. Bisa barter — kamu design, saya bantu user testing atau UX review gratis. Atau kalau mau pengalaman nyata aja juga oke 😄",
    seeking: ["Logo Design", "Branding", "Ilustrasi"],
    hoursAgo: 18,
  },
  {
    id: 8,
    type: "Gig",
    from: "karya",
    karyaTitle: "Warung Digital",
    karyaInterests: ["UMKM", "Mobile", "Sosial"],
    karyaRoster: "oleh @dianp · @eko_s",
    note: "Warung Digital butuh orang yang ngerti konten marketing atau SEO lokal — buat bantu pedagang kecil sekitar kampus lebih mudah ditemukan online. Bukan kerja berat, tapi harus empati sama UMKM. Kamu punya experience atau sekadar tertarik? Yuk ngobrol santai dulu.",
    seeking: ["Content Marketing", "SEO", "Social Media"],
    hoursAgo: 30,
  },
  {
    id: 11,
    type: "Gig",
    from: "karya",
    karyaTitle: "BukuSaku Kampus",
    karyaInterests: ["Edukasi", "Mobile", "Konten"],
    karyaRoster: "oleh @nadiaku · @budisnt",
    note: "BukuSaku Kampus mau tambah konten statistika dan fisika dasar — ada yang mau bantu nulis atau review materi? Async banget, bisa kapan saja. Minimal 2–3 kartu per minggu, format sudah ada templatenya. Cocok buat yang suka berbagi ilmu 📚",
    seeking: ["Konten Edukatif", "Statistika", "Fisika Dasar"],
    hoursAgo: 52,
  },
];

// Aggregate skill counts for the "Paling Dicari" right-rail widget
const _skillMap = ASKS.reduce<Record<string, number>>((acc, ask) => {
  ask.seeking.forEach((s) => { acc[s] = (acc[s] ?? 0) + 1; });
  return acc;
}, {});
const TOP_SKILLS: [string, number][] = Object.entries(_skillMap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6);

// ─── Type Chip — three badge types from the PRD ───────────────────────────────
function TypeChip({ type }: { type: AskType }) {
  // Hackathon: solid terracotta (urgent, event-bound)
  // Project: near-black outline (substantive, longer-term)
  // Gig: tinted wash (casual, lighter commitment)
  const cfg = {
    Hackathon: { bg: T.accent,      color: T.accentFg,  border: "none",                        icon: "⚡", label: "Tim Hackathon" },
    Project:   { bg: "transparent", color: T.ink,       border: `1px solid ${T.lineDark}`,      icon: "◉", label: "Tim Project"   },
    Gig:       { bg: T.accentTint,  color: T.accentMid, border: `1px solid ${T.accentLine}`,    icon: "◎", label: "Talenta / Gig" },
  }[type];

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      fontFamily: T.fontBody,
      fontSize: T.size.micro,
      fontWeight: T.weight.medium,
      letterSpacing: T.track.tag,
      padding: "2px 8px",
      borderRadius: "3px",
      backgroundColor: cfg.bg,
      color: cfg.color,
      border: cfg.border,
      whiteSpace: "nowrap" as const,
    }}>
      <span aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// ─── Karya Cover — small square thumbnail for karya-sourced asks ──────────────
function KaryaCover({ interests, size = 34 }: { interests: string[]; size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 9,
      overflow: "hidden",
      border: `1px solid ${T.line}`,
      flexShrink: 0,
    }}>
      <img
        src={coverFor(interests)}
        alt=""
        aria-hidden="true"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

// ─── Left Nav (adapted: "Cari Kolaborator" always active; no interest filters) ─
const NAV_ITEMS_E = [
  { label: "Launchpad",        icon: "◈", active: false },
  { label: "Jelajahi Karya",   icon: "◉", active: false },
  { label: "Cari Kolaborator", icon: "◎", active: true  },
  { label: "Minat Saya",       icon: "◇", active: false },
  { label: "Karya Saya",       icon: "◆", active: false },
];

function LeftNavE() {
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
        {NAV_ITEMS_E.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={NAV_SCREEN[item.label] ? () => navigate(NAV_SCREEN[item.label]!) : undefined}
            aria-current={item.active ? "page" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              textAlign: "left" as const,
              border: "none",
              padding: "7px 12px",
              borderRadius: T.radius,
              backgroundColor: item.active ? T.accentTint : "transparent",
              color: item.active ? T.accent : T.ink2,
              fontFamily: T.fontBody,
              fontSize: T.size.body,
              fontWeight: item.active ? T.weight.medium : T.weight.regular,
              cursor: item.active ? "default" : "pointer",
              marginBottom: 1,
            }}
          >
            <span aria-hidden="true" style={{ fontSize: T.size.ui }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User stub at bottom (verbatim from MockupB) */}
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

// ─── Hackathon Banner — FR-29 event-scoped team-formation affordance ──────────
// Sits above the composer as an ambient awareness strip for the current hot event.
function HackathonBannerE() {
  return (
    <section aria-label="Event hackathon aktif" style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "12px 16px",
      marginBottom: 16,
      background: T.accentTint,
      border: `1px solid ${T.accentLine}`,
      borderRadius: T.radiusLg,
    }}>
      <span aria-hidden="true" style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>⚡</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink, marginBottom: 2 }}>
          Lagi rame:{" "}
          <span style={{ color: T.accent }}>GEMASTIK 2026</span>{" "}
          — pendaftaran tim terbuka sampai 12 Juli
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
          4 ajakan hackathon aktif · Kategori: Sistem Informasi, Kecerdasan Buatan, Keamanan Siber
        </div>
      </div>
      <button style={{
        flexShrink: 0,
        background: "transparent",
        color: T.accent,
        border: `1px solid ${T.accent}`,
        borderRadius: T.radius,
        padding: "6px 14px",
        fontFamily: T.fontBody,
        fontSize: T.size.ui,
        fontWeight: T.weight.semibold,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
      }}>
        Cari Rekan →
      </button>
    </section>
  );
}

// ─── Composer — fake "Tulis ajakan…" posting box at the top of the board ──────
// Gives the wall a postable feel. Type chips are interactive; the input is not.
function Composer() {
  const [selectedType, setSelectedType] = useState<AskType | null>(null);

  const types: { type: AskType; icon: string }[] = [
    { type: "Hackathon", icon: "⚡" },
    { type: "Project",   icon: "◉" },
    { type: "Gig",       icon: "◎" },
  ];

  return (
    <div style={{
      backgroundColor: T.surface,
      border: `1.5px solid ${T.lineDark}`,
      borderRadius: T.radiusLg,
      padding: "14px 16px",
      marginBottom: 20,
    }}>
      {/* Input row */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <Avatar name="Zaki Nadhif" size={32} />
        <div style={{
          flex: 1,
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          color: T.ink3,
          backgroundColor: T.bg,
          border: `1px solid ${T.line}`,
          borderRadius: T.radius,
          padding: "9px 12px",
          cursor: "text",
          lineHeight: T.lh.tight,
        }}>
          Tulis ajakan kamu — siapa atau apa yang lagi kamu cari?
        </div>
      </div>

      {/* Type selector + post button */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 42 }}>
        <span style={{ ...eyebrow, marginRight: 4 }}>Cari:</span>
        {types.map(({ type, icon }) => {
          const active = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(active ? null : type)}
              aria-pressed={active}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 99,
                border: `1px solid ${active ? T.accent : T.line}`,
                backgroundColor: active ? T.accentTint : "transparent",
                color: active ? T.accent : T.ink2,
                fontFamily: T.fontBody,
                fontSize: T.size.micro,
                fontWeight: active ? T.weight.medium : T.weight.regular,
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              <span aria-hidden="true">{icon}</span>
              {type}
            </button>
          );
        })}
        <button style={{
          marginLeft: "auto",
          backgroundColor: T.accent,
          color: T.accentFg,
          border: "none",
          borderRadius: T.radius,
          padding: "6px 18px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.semibold,
          cursor: "pointer",
          whiteSpace: "nowrap" as const,
        }}>
          Posting
        </button>
      </div>
    </div>
  );
}

// ─── Ask Card — one bulletin post on the wall ──────────────────────────────────
// Layout: identity (avatar or karya cover) + type chip + timestamp in the header;
// the first-person note at stat-size as the visual hero; skill chips below; two
// action buttons at the bottom.
function AskCard({ ask }: { ask: Ask }) {
  const primaryLabel: Record<AskType, string> = {
    Hackathon: "Gabung Tim",
    Project:   "Bantu",
    Gig:       "Saya Tertarik",
  };

  return (
    <article style={{
      padding: "20px 0",
      borderBottom: `1px solid ${T.line}`,
    }}>
      {/* Header: identity left, type+time right */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 12,
      }}>
        {/* Identity block */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          {ask.from === "person"
            ? <Avatar name={ask.name!} size={34} />
            : <KaryaCover interests={ask.karyaInterests!} size={34} />
          }
          <div style={{ minWidth: 0 }}>
            {ask.from === "person" ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" as const }}>
                <span style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink }}>
                  {ask.name}
                </span>
                <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
                  {ask.handle}
                </span>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: T.fontDisplay, fontSize: T.size.body, fontWeight: T.weight.regular, color: T.ink, lineHeight: T.lh.tight }}>
                  {ask.karyaTitle}
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
                  {ask.karyaRoster}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Type chip + timestamp */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, paddingTop: 2 }}>
          <TypeChip type={ask.type} />
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
            {relativeTime(ask.hoursAgo)}
          </span>
        </div>
      </div>

      {/* Hero note — the free-text ask written in the community's voice */}
      <p style={{
        margin: "0 0 12px",
        fontFamily: T.fontBody,
        fontSize: T.size.stat,
        fontWeight: T.weight.regular,
        color: T.ink,
        lineHeight: T.lh.body,
      }}>
        {ask.note}
      </p>

      {/* Skills / open roles sought */}
      {ask.seeking.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          flexWrap: "wrap" as const,
          marginBottom: 14,
        }}>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, letterSpacing: T.track.tag, textTransform: "uppercase" as const }}>
            butuh:
          </span>
          {ask.seeking.map((s) => <Tag key={s} label={s} accent />)}
        </div>
      )}

      {/* Two inline connect actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{
          backgroundColor: T.accent,
          color: T.accentFg,
          border: "none",
          borderRadius: T.radius,
          padding: "7px 18px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.semibold,
          cursor: "pointer",
          whiteSpace: "nowrap" as const,
        }}>
          {primaryLabel[ask.type]}
        </button>
        <button style={{
          backgroundColor: "transparent",
          color: T.ink2,
          border: `1px solid ${T.line}`,
          borderRadius: T.radius,
          padding: "7px 16px",
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.regular,
          cursor: "pointer",
          whiteSpace: "nowrap" as const,
        }}>
          Kirim Pesan
        </button>
      </div>
    </article>
  );
}

// ─── Bulletin Board — center column ───────────────────────────────────────────
function BulletinBoard({ filterType }: { filterType: AskType | "Semua" }) {
  const filtered = filterType === "Semua"
    ? ASKS
    : ASKS.filter((a) => a.type === filterType);

  return (
    <main className="bn-main" style={{
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column" as const,
    }}>
      {/* Page heading */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{
            margin: 0,
            fontFamily: T.fontDisplay,
            fontSize: T.size.display,
            fontWeight: T.weight.regular,
            letterSpacing: T.track.tight,
            color: T.ink,
          }}>
            Cari Kolaborator
          </h1>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3 }}>
            Siapa butuh siapa, tertulis di sini
          </span>
        </div>
      </div>

      {/* FR-29: hackathon event gesture */}
      <HackathonBannerE />

      {/* Composer — invites posting an ask */}
      <Composer />

      {/* Wall of asks — reverse-chronological (ASKS array is already ordered) */}
      <div>
        <div style={{ ...eyebrow, marginBottom: 2 }}>
          {filtered.length} ajakan · terbaru dulu
        </div>
        {filtered.length === 0 ? (
          <div style={{
            fontFamily: T.fontBody,
            fontSize: T.size.body,
            color: T.ink3,
            padding: "40px 0",
            textAlign: "center" as const,
          }}>
            Belum ada ajakan untuk jenis ini — atau jadilah yang pertama 🙂
          </div>
        ) : (
          filtered.map((ask) => <AskCard key={ask.id} ask={ask} />)
        )}
      </div>
    </main>
  );
}

// ─── Filter Rail — right column ────────────────────────────────────────────────
// Filter by ask type + community pulse + top skills being sought.
function FilterRail({
  filterType,
  onFilter,
}: {
  filterType: AskType | "Semua";
  onFilter: (t: AskType | "Semua") => void;
}) {
  const counts: Record<string, number> = {
    Semua:    ASKS.length,
    Hackathon: ASKS.filter((a) => a.type === "Hackathon").length,
    Project:   ASKS.filter((a) => a.type === "Project").length,
    Gig:       ASKS.filter((a) => a.type === "Gig").length,
  };

  const filterOpts: { key: AskType | "Semua"; icon: string; label: string }[] = [
    { key: "Semua",    icon: "◐", label: "Semua"         },
    { key: "Hackathon",icon: "⚡", label: "Hackathon"     },
    { key: "Project",  icon: "◉", label: "Project"        },
    { key: "Gig",      icon: "◎", label: "Talenta / Gig" },
  ];

  return (
    <aside className="bn-rail" style={{
      width: 232,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column" as const,
      gap: 20,
    }}>
      {/* Filter by type */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusLg,
        padding: "12px 14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Filter Ajakan</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
          {filterOpts.map(({ key, icon, label }) => {
            const active = filterType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onFilter(key)}
                aria-pressed={active}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "left" as const,
                  background: active ? T.accentTint : "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: T.fontBody,
                  fontSize: T.size.ui,
                  color: active ? T.accent : T.ink2,
                  fontWeight: active ? T.weight.medium : T.weight.regular,
                  padding: "5px 8px",
                  borderRadius: "4px",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span aria-hidden="true" style={{ fontSize: T.size.caption }}>{icon}</span>
                  {label}
                </span>
                <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: active ? T.accentMid : T.ink3 }}>
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Community pulse */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusLg,
        padding: "12px 14px",
      }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Denyut Papan</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {[
            { label: "Ajakan aktif",    value: ASKS.length },
            { label: "Dari orang",      value: ASKS.filter((a) => a.from === "person").length },
            { label: "Dari karya",      value: ASKS.filter((a) => a.from === "karya").length },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>{stat.label}</span>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top skills currently sought — aggregated from ASKS data */}
      <div>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Paling Dicari</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 7 }}>
          {TOP_SKILLS.map(([skill, count]) => (
            <div key={skill} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2, flex: 1, minWidth: 0 }}>
                {skill}
              </span>
              {/* Proportional bar */}
              <div style={{
                height: 4,
                width: `${Math.max(8, Math.round((count / ASKS.length) * 64))}px`,
                backgroundColor: T.accentTint,
                border: `1px solid ${T.accentLine}`,
                borderRadius: 2,
                flexShrink: 0,
              }} />
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, minWidth: 10, textAlign: "right" as const }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA — mirrors MockupB's right rail accent block */}
      <div style={{
        backgroundColor: T.accent,
        borderRadius: T.radiusLg,
        padding: "14px 16px",
      }}>
        <div style={{
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          fontWeight: T.weight.light,
          color: T.accentFg,
          lineHeight: T.lh.snug,
          marginBottom: 10,
        }}>
          Punya ajakan? Tulis di papan — komunitas siap merespons.
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
          Tulis Ajakan
        </button>
      </div>
    </aside>
  );
}

// ─── Variant E body ───────────────────────────────────────────────────────────
function CariEBody() {
  const [filterType, setFilterType] = useState<AskType | "Semua">("Semua");

  return (
    <div style={{ backgroundColor: T.bg, minHeight: "100vh", fontFamily: T.fontBody, color: T.ink }}>
      {/* Verbatim <style> block from MockupB — focus, reduced-motion, responsive stacking */}
      <style>{`
        h1, h2, h3 { text-wrap: balance; overflow-wrap: break-word; }
        p { text-wrap: pretty; overflow-wrap: break-word; }
        button:focus-visible, a:focus-visible, input:focus-visible, [tabindex]:focus-visible {
          outline: 2px solid ${T.accent};
          outline-offset: 2px;
          border-radius: ${T.radius};
        }
        input::placeholder { color: ${T.ink3}; opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
        /* ── Responsive ────────────────────────────────────────────────────────
           Below ~900px stack columns to a single feed; fold nav into a compact
           top bar. Identical breakpoint and rules to MockupB. */
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
        @media (pointer: coarse) {
          .bn-nav-items button { min-height: 44px; }
        }
      `}</style>

      {/* Three-column shell (collapses to single column below ~900px) */}
      <div className="bn-shell" style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "24px 24px 48px",
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
      }}>
        <LeftNavE />
        <BulletinBoard filterType={filterType} />
        <FilterRail filterType={filterType} onFilter={setFilterType} />
      </div>

    </div>
  );
}


// ─── Variant registry + Cari screen ───────────────────────────────────────────
// The picker below is *designated* to this screen: it lives inside CariScreen, so
// it only renders while the Cari Kolaborator screen is active (never on Launchpad).
const CARI_VARIANTS = [
  { key: "a", label: "A · Two-lane", Body: CariABody },
  { key: "b", label: "B · Intent",   Body: CariBBody },
  { key: "c", label: "C · Match",    Body: CariCBody },
  { key: "e", label: "E · Wall",     Body: CariEBody },
] as const;

function VariantPicker({ idx, onPick }: { idx: number; onPick: (i: number) => void }) {
  return (
    <div
      role="group"
      aria-label="Varian Cari Kolaborator"
      style={{
        position: "fixed",
        top: 52,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        display: "flex",
        gap: 2,
        padding: 3,
        borderRadius: 99,
        background: "oklch(100% 0 0)",
        border: "1px solid oklch(88% 0 0)",
        boxShadow: "0 2px 10px oklch(0% 0 0 / 8%)",
      }}
    >
      <span style={{
        alignSelf: "center",
        padding: "0 8px 0 6px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "oklch(53% 0 0)",
        whiteSpace: "nowrap",
      }}>Varian</span>
      {CARI_VARIANTS.map((v, i) => {
        const active = i === idx;
        return (
          <button
            key={v.key}
            onClick={() => onPick(i)}
            aria-pressed={active}
            style={{
              padding: "4px 11px",
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              background: active ? "oklch(39% 0.085 62)" : "transparent",
              color: active ? "oklch(99% 0 0)" : "oklch(46% 0 0)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11,
              fontWeight: active ? 500 : 400,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              transition: "background 0.12s, color 0.12s",
            }}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CariScreen() {
  const [variantIdx, setVariantIdx] = useState(0);

  // Mutate the shared T before render — every variant reads T.fontDisplay /
  // T.fontBody, so the gallery's switcher hot-swaps fonts across whichever
  // variant is shown.
  const { displayFont, bodyFont } = useFonts();
  T.fontDisplay = displayFont;
  T.fontBody    = bodyFont;

  const Body = CARI_VARIANTS[variantIdx].Body;

  return (
    <>
      <VariantPicker idx={variantIdx} onPick={setVariantIdx} />
      <Body />
    </>
  );
}
