/**
 * Al-Fath Berkarya — Cari Kolaborator Mockup (Direction E: Wall of Asks / Bulletin)
 *
 * The board is a reverse-chronological wall of short, first-person asks written in
 * the community's real Indonesian voice — mixing people-seeking-collaborators and
 * karya-seeking-contributors as equal-weight posts. The free-text note is the hero;
 * type chip, skills sought, and timestamp are supporting detail underneath.
 *
 * Design tokens, nav shell, type scale, and micro-components are verbatim from MockupB.tsx.
 * Self-contained: imports are React (useState) and ./images (coverFor) only.
 * All data hardcoded inline.
 *
 * FR-29 hackathon gesture: "Lagi Rame" event strip above the composer + the first
 * wall card is a pinned hackathon ask.
 *
 * FontSwitcher and <style> block are verbatim from MockupB so font hot-swap works.
 */

import { useState } from "react";
import { coverFor } from "./images";

// ─── Design Tokens (verbatim from MockupB) ────────────────────────────────────
const T = {
  bg: "oklch(98% 0 0)",              // gallery white (neutral)
  ink: "oklch(18% 0 0)",             // soft neutral near-black
  ink2: "oklch(46% 0 0)",            // muted body — ~4.7:1 on white (AA)
  ink3: "oklch(53% 0 0)",            // meta text — ~5:1 on bg (AA)
  accent: "oklch(39% 0.085 62)",     // terracotta (kept)
  accentMid: "oklch(55% 0.085 62)",  // terracotta mid — ~4.7:1 on bg (AA)
  accentFg: "oklch(99% 0 0)",        // text on accent
  accentTint: "oklch(95% 0.015 62)", // light terracotta wash
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

// ─── Font Switchers (verbatim from MockupB) ───────────────────────────────────
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

// ─── Utilities (verbatim from MockupB) ────────────────────────────────────────
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

// Shared style for short uppercase eyebrow / section labels.
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
const NAV_ITEMS = [
  { label: "Launchpad",        icon: "◈", active: false },
  { label: "Jelajahi Karya",   icon: "◉", active: false },
  { label: "Cari Kolaborator", icon: "◎", active: true  },
  { label: "Minat Saya",       icon: "◇", active: false },
  { label: "Karya Saya",       icon: "◆", active: false },
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
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
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

// ─── Font Switcher (verbatim from MockupB) ────────────────────────────────────
function FontSwitcher({ options, activeIdx, onChange }: {
  options: readonly { font: string; label: string }[];
  activeIdx: number;
  onChange: (i: number) => void;
}) {
  return (
    <div role="group" style={{
      background: T.surface,
      border: `1px solid ${T.lineDark}`,
      borderRadius: 99,
      boxShadow: "0 4px 16px oklch(0% 0 0 / 10%)",
      display: "flex",
      padding: 3,
      gap: 2,
    }}>
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

// ─── Hackathon Banner — FR-29 event-scoped team-formation affordance ──────────
// Sits above the composer as an ambient awareness strip for the current hot event.
function HackathonBanner() {
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
      <HackathonBanner />

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

// ─── Root Export ───────────────────────────────────────────────────────────────
export default function CariKolaboratorMockup() {
  const [filterType, setFilterType] = useState<AskType | "Semua">("Semua");
  const [displayIdx, setDisplayIdx] = useState(0);
  const [bodyIdx, setBodyIdx] = useState(0);

  // Apply chosen fonts before render — all child refs to T.fontDisplay / T.fontBody pick this up.
  T.fontDisplay = DISPLAY_FONTS[displayIdx].font;
  T.fontBody    = BODY_FONTS[bodyIdx].font;

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
        <LeftNav />
        <BulletinBoard filterType={filterType} />
        <FilterRail filterType={filterType} onFilter={setFilterType} />
      </div>

      {/* Bottom-right font switcher (verbatim from MockupB) */}
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
