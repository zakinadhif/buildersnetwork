/**
 * Al-Fath Berkarya — Discovery & Search Mockup
 * Self-contained. Only `react` imported. Hardcoded sample data.
 * Fonts loaded via inline <style> injection on mount.
 */

import { useState, useEffect, useCallback } from "react";

// ─── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg: "#f1efe9",
  ink: "#0f0e0b",
  ink2: "#8a8781",
  ink3: "#bbb8b2",
  accent: "oklch(39% 0.085 62)",      // terracotta
  accentLight: "oklch(93% 0.025 62)", // soft blush
  line: "#dedad2",
  fontBody: "'Plus Jakarta Sans', sans-serif",
  fontMono: "'IBM Plex Mono', monospace",
};

// ─── Sample data ─────────────────────────────────────────────────────────────
type RosterMember = { name: string; handle: string };

type Karya = {
  id: string;
  title: string;
  description: string;
  stages: string[];
  interests: string[];
  roster: RosterMember[];
  upvotes: number;
  featured?: boolean;
};

type Member = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  interests: string[];
  skills: string[];
  year: number;
  major: string;
};

const KARYA: Karya[] = [
  {
    id: "k1",
    title: "Benih Desa",
    description:
      "Platform pemetaan potensi desa berbasis data crowdsource dan AI ringan — menghubungkan relawan urban dengan komunitas pedesaan.",
    stages: ["Prototipe", "Mencari Tim"],
    interests: ["Sosial", "AI", "Pemetaan"],
    roster: [
      { name: "Farhan Ardiansyah", handle: "@farhan" },
      { name: "Nadia Kusuma", handle: "@nadia_k" },
    ],
    upvotes: 47,
    featured: true,
  },
  {
    id: "k2",
    title: "Kanal Riset",
    description:
      "Agregator paper dan jurnal berbahasa Indonesia — ringkasan otomatis, tagging topik, dan forum diskusi per jurusan.",
    stages: ["MVP", "Terbuka untuk Kolaborasi"],
    interests: ["Riset", "Pendidikan", "NLP"],
    roster: [
      { name: "Rizky Maulana", handle: "@rizky_m" },
    ],
    upvotes: 38,
    featured: true,
  },
  {
    id: "k3",
    title: "Warung Digital",
    description:
      "Bantu UMKM kuliner kampus go-digital: menu QR, pencatatan pesanan sederhana, laporan harian via WhatsApp.",
    stages: ["Piloting", "Aktif"],
    interests: ["UMKM", "Desain", "Mobile"],
    roster: [
      { name: "Siti Rahayu", handle: "@siti_r" },
      { name: "Bagas Wicaksono", handle: "@bagas" },
      { name: "Eka Putri", handle: "@eka_p" },
    ],
    upvotes: 61,
    featured: true,
  },
  {
    id: "k4",
    title: "SuaraKelas",
    description:
      "Aplikasi umpan balik anonim real-time untuk ruang kuliah — dosen tahu kalau mahasiswanya bingung, tanpa rasa sungkan.",
    stages: ["Ide", "Mencari Tim"],
    interests: ["Pendidikan", "UX", "Mobile"],
    roster: [
      { name: "Hafizh Nugroho", handle: "@hafizh" },
    ],
    upvotes: 29,
  },
  {
    id: "k5",
    title: "Jejak Karbon TEL-U",
    description:
      "Kalkulator jejak karbon kampus: konsumsi listrik, perjalanan, makan siang — visualisasi kolektif per fakultas.",
    stages: ["Riset", "Mencari Mentor"],
    interests: ["Lingkungan", "Data", "Visualisasi"],
    roster: [
      { name: "Amira Zahra", handle: "@amira_z" },
      { name: "Deni Saputra", handle: "@deni_s" },
    ],
    upvotes: 22,
  },
  {
    id: "k6",
    title: "Kitab Kode",
    description:
      "Perpustakaan snippet kode berbahasa Indonesia — annotasi kontekstual, komentar dalam Bahasa, dikurasi komunitas.",
    stages: ["Alpha", "Terbuka untuk Kontribusi"],
    interests: ["Open Source", "Pendidikan", "Developer Tools"],
    roster: [
      { name: "Ilham Prakoso", handle: "@ilham_p" },
      { name: "Riana Dewi", handle: "@riana_d" },
      { name: "Yoga Santoso", handle: "@yoga_s" },
    ],
    upvotes: 55,
  },
  {
    id: "k7",
    title: "Pena Nulis",
    description:
      "Ruang menulis kolaboratif untuk mahasiswa — co-author essay, sistem komentar paragraf, dan portofolio tulisan publik.",
    stages: ["Beta", "Aktif"],
    interests: ["Kreativitas", "Kolaborasi", "Desain"],
    roster: [
      { name: "Nadia Kusuma", handle: "@nadia_k" },
      { name: "Siti Rahayu", handle: "@siti_r" },
    ],
    upvotes: 33,
  },
  {
    id: "k8",
    title: "Tanda Tangan Digital Kampus",
    description:
      "Sistem e-sign dokumen akademik yang terintegrasi dengan portal TEL-U — cepat, aman, tanpa antri TU.",
    stages: ["Konsep", "Mencari Mitra"],
    interests: ["Keamanan", "Integrasi Sistem", "Kampus"],
    roster: [
      { name: "Farhan Ardiansyah", handle: "@farhan" },
      { name: "Rizky Maulana", handle: "@rizky_m" },
    ],
    upvotes: 18,
  },
];

const MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Farhan Ardiansyah",
    handle: "@farhan",
    bio: "Suka bangun produk dari nol. Backend dulu, tampilan kemudian.",
    interests: ["Sosial", "AI", "Keamanan"],
    skills: ["Go", "PostgreSQL", "Docker"],
    year: 3,
    major: "Informatika",
  },
  {
    id: "m2",
    name: "Nadia Kusuma",
    handle: "@nadia_k",
    bio: "Desainer yang tersesat di antara Figma dan kode. Senang kalau keduanya nyatu.",
    interests: ["Desain", "Kreativitas", "UX"],
    skills: ["Figma", "React", "Tailwind"],
    year: 2,
    major: "Sistem Informasi",
  },
  {
    id: "m3",
    name: "Rizky Maulana",
    handle: "@rizky_m",
    bio: "NLP dan text mining. Sedang obsesi sama bahasa Indonesia di dataset.",
    interests: ["NLP", "Riset", "Open Source"],
    skills: ["Python", "HuggingFace", "FastAPI"],
    year: 4,
    major: "Informatika",
  },
  {
    id: "m4",
    name: "Siti Rahayu",
    handle: "@siti_r",
    bio: "Product-minded developer. Suka ngobrol sama pengguna sebelum nulis satu baris kode.",
    interests: ["Mobile", "UMKM", "Kolaborasi"],
    skills: ["Flutter", "Firebase", "Figma"],
    year: 3,
    major: "Rekayasa Perangkat Lunak",
  },
  {
    id: "m5",
    name: "Amira Zahra",
    handle: "@amira_z",
    bio: "Data analyst yang peduli lingkungan. Visualisasi data = argumen terkuat.",
    interests: ["Lingkungan", "Data", "Visualisasi"],
    skills: ["Python", "D3.js", "Tableau"],
    year: 2,
    major: "Sistem Informasi",
  },
  {
    id: "m6",
    name: "Bagas Wicaksono",
    handle: "@bagas",
    bio: "Full-stack dengan spesialisasi integrasi payment dan WhatsApp API.",
    interests: ["UMKM", "Mobile", "API"],
    skills: ["Node.js", "React", "WhatsApp API"],
    year: 3,
    major: "Informatika",
  },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function avatarColor(handle: string) {
  const palette = [
    "#c9b99a", "#a89880", "#8b7355", "#d4c5a9",
    "#b5a48a", "#9e8d72", "#c4b298", "#a07850",
  ];
  let hash = 0;
  for (const c of handle) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return palette[Math.abs(hash) % palette.length];
}

// ─── Injected global styles ──────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=IBM+Plex+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${T.bg};
    color: ${T.ink};
    font-family: ${T.fontBody};
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  ::selection { background: oklch(85% 0.05 62); }

  .mockup-root {
    min-height: 100vh;
    background: ${T.bg};
  }

  /* ── Nav ── */
  .nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: ${T.bg};
    border-bottom: 1px solid ${T.line};
    padding: 0 2rem;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    backdrop-filter: blur(8px);
  }

  .nav-brand {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .nav-brand-name {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${T.ink};
  }

  .nav-brand-sub {
    font-family: ${T.fontMono};
    font-size: 11px;
    color: ${T.ink3};
    letter-spacing: 0.04em;
  }

  .nav-tabs {
    display: flex;
    gap: 0;
    background: ${T.line};
    border-radius: 6px;
    padding: 3px;
  }

  .nav-tab {
    padding: 5px 14px;
    font-size: 13px;
    font-weight: 500;
    color: ${T.ink2};
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: ${T.fontBody};
  }

  .nav-tab:hover { color: ${T.ink}; }

  .nav-tab.active {
    background: ${T.bg};
    color: ${T.ink};
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  .nav-action {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .btn-post {
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 600;
    font-family: ${T.fontBody};
    background: ${T.accent};
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: opacity 0.15s;
  }
  .btn-post:hover { opacity: 0.88; }

  /* ── Hero ── */
  .hero {
    padding: 3rem 2rem 2.5rem;
    max-width: 900px;
    margin: 0 auto;
  }

  .hero-label {
    font-family: ${T.fontMono};
    font-size: 11px;
    letter-spacing: 0.1em;
    color: ${T.accent};
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .hero-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${T.line};
  }

  .hero-cards {
    position: relative;
    height: 220px;
    margin-bottom: 1.25rem;
  }

  .hero-card {
    position: absolute;
    inset: 0;
    background: #fff;
    border: 1px solid ${T.line};
    border-radius: 12px;
    padding: 1.75rem 2rem;
    cursor: pointer;
    transition: opacity 0.4s ease, transform 0.4s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .hero-card.inactive {
    opacity: 0;
    pointer-events: none;
    transform: translateY(8px);
  }

  .hero-card.behind {
    opacity: 0.45;
    transform: translateY(12px) scale(0.985);
    pointer-events: none;
  }

  .hero-card-title {
    font-size: 26px;
    font-weight: 300;
    letter-spacing: -0.03em;
    line-height: 1.2;
    color: ${T.ink};
    margin-bottom: 0.5rem;
  }

  .hero-card-desc {
    font-size: 14px;
    color: ${T.ink2};
    line-height: 1.55;
    max-width: 580px;
  }

  .hero-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hero-chips {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .chip {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 99px;
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }

  .chip-interest {
    background: oklch(90% 0.03 62);
    color: oklch(35% 0.08 62);
    border: 1px solid oklch(83% 0.04 62);
  }

  .chip-stage {
    background: transparent;
    color: ${T.ink3};
    border: 1px solid ${T.line};
    font-family: ${T.fontMono};
    font-size: 10.5px;
  }

  .hero-upvote {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 6px 14px;
    background: ${T.accentLight};
    border: 1px solid oklch(85% 0.04 62);
    border-radius: 8px;
    cursor: pointer;
    font-family: ${T.fontBody};
    font-size: 13px;
    font-weight: 600;
    color: ${T.accent};
    transition: all 0.15s;
  }
  .hero-upvote:hover { background: oklch(88% 0.04 62); }
  .hero-upvote.voted {
    background: ${T.accent};
    color: #fff;
    border-color: ${T.accent};
  }

  .hero-dots {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 2.5rem;
  }

  .hero-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${T.line};
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all 0.2s;
  }

  .hero-dot.active {
    background: ${T.accent};
    width: 18px;
    border-radius: 3px;
  }

  /* ── Section heading ── */
  .section-head {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 12px;
    font-weight: 500;
    font-family: ${T.fontMono};
    letter-spacing: 0.08em;
    color: ${T.ink2};
    text-transform: uppercase;
  }

  .section-count {
    font-family: ${T.fontMono};
    font-size: 11px;
    color: ${T.ink3};
  }

  /* ── Karya list ── */
  .karya-list {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 2rem 4rem;
  }

  .karya-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid ${T.line};
    cursor: pointer;
    transition: background 0.12s;
  }

  .karya-row:first-child { border-top: 1px solid ${T.line}; }

  .karya-row:hover { background: rgba(255,255,255,0.55); margin: 0 -1rem; padding: 1rem; border-radius: 8px; border-color: transparent; }

  .karya-row-left { min-width: 0; }

  .karya-row-title {
    font-size: 15px;
    font-weight: 600;
    color: ${T.ink};
    margin-bottom: 0.2rem;
    letter-spacing: -0.01em;
  }

  .karya-row-desc {
    font-size: 13px;
    color: ${T.ink2};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.5rem;
  }

  .karya-row-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .karya-row-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  .upvote-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 12px;
    border: 1px solid ${T.line};
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    font-family: ${T.fontBody};
    transition: all 0.15s;
    min-width: 52px;
  }

  .upvote-btn:hover {
    border-color: oklch(75% 0.06 62);
    background: ${T.accentLight};
  }

  .upvote-btn.voted {
    border-color: ${T.accent};
    background: ${T.accentLight};
  }

  .upvote-arrow {
    font-size: 12px;
    color: ${T.ink3};
    transition: color 0.15s, transform 0.15s;
    line-height: 1;
  }
  .upvote-btn:hover .upvote-arrow,
  .upvote-btn.voted .upvote-arrow {
    color: ${T.accent};
    transform: translateY(-1px);
  }

  .upvote-count {
    font-size: 13px;
    font-weight: 600;
    color: ${T.ink2};
    line-height: 1;
    font-family: ${T.fontMono};
    transition: color 0.15s;
  }
  .upvote-btn.voted .upvote-count { color: ${T.accent}; }

  /* ── Roster avatars ── */
  .roster {
    display: flex;
  }

  .avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1.5px solid ${T.bg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8.5px;
    font-weight: 700;
    color: #fff;
    margin-left: -5px;
    flex-shrink: 0;
    letter-spacing: 0;
  }
  .roster .avatar:first-child { margin-left: 0; }

  /* ── Search surface ── */
  .search-surface {
    max-width: 900px;
    margin: 0 auto;
    padding: 2.5rem 2rem 4rem;
  }

  .search-bar-wrap {
    position: relative;
    margin-bottom: 2rem;
  }

  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${T.ink3};
    font-size: 16px;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 13px 16px 13px 42px;
    font-size: 15px;
    font-family: ${T.fontBody};
    background: #fff;
    border: 1px solid ${T.line};
    border-radius: 10px;
    color: ${T.ink};
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .search-input::placeholder { color: ${T.ink3}; }
  .search-input:focus {
    border-color: oklch(65% 0.07 62);
    box-shadow: 0 0 0 3px oklch(92% 0.03 62);
  }

  .search-filter-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .filter-label {
    font-size: 12px;
    font-family: ${T.fontMono};
    color: ${T.ink3};
    letter-spacing: 0.04em;
    margin-right: 0.25rem;
  }

  .filter-chip {
    padding: 5px 12px;
    border-radius: 99px;
    font-size: 12.5px;
    font-weight: 500;
    font-family: ${T.fontBody};
    border: 1px solid ${T.line};
    background: transparent;
    color: ${T.ink2};
    cursor: pointer;
    transition: all 0.15s;
  }
  .filter-chip:hover { border-color: oklch(70% 0.07 62); color: ${T.ink}; }
  .filter-chip.active {
    background: ${T.accent};
    border-color: ${T.accent};
    color: #fff;
  }

  .search-mode-toggle {
    display: flex;
    gap: 0;
    background: ${T.line};
    border-radius: 6px;
    padding: 3px;
    margin-bottom: 1.5rem;
    width: fit-content;
  }

  .mode-btn {
    padding: 5px 16px;
    font-size: 13px;
    font-weight: 500;
    color: ${T.ink2};
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
    font-family: ${T.fontBody};
  }
  .mode-btn:hover { color: ${T.ink}; }
  .mode-btn.active {
    background: ${T.bg};
    color: ${T.ink};
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  /* ── People cards ── */
  .people-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1rem;
  }

  .person-card {
    background: #fff;
    border: 1px solid ${T.line};
    border-radius: 10px;
    padding: 1.25rem;
    cursor: pointer;
    transition: box-shadow 0.15s, transform 0.15s;
  }
  .person-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    transform: translateY(-1px);
  }

  .person-head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .person-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }

  .person-name {
    font-size: 14px;
    font-weight: 600;
    color: ${T.ink};
    line-height: 1.2;
  }

  .person-meta {
    font-family: ${T.fontMono};
    font-size: 11px;
    color: ${T.ink3};
  }

  .person-bio {
    font-size: 12.5px;
    color: ${T.ink2};
    line-height: 1.5;
    margin-bottom: 0.85rem;
  }

  .person-skills {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .skill-tag {
    display: inline-block;
    padding: 2px 8px;
    background: ${T.bg};
    border: 1px solid ${T.line};
    border-radius: 4px;
    font-family: ${T.fontMono};
    font-size: 10.5px;
    color: ${T.ink2};
  }

  /* ── Empty state ── */
  .empty {
    text-align: center;
    padding: 3rem;
    color: ${T.ink3};
    font-size: 14px;
  }

  /* ── Interest pills for filter display ── */
  .interest-filter-active {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 12px;
    color: ${T.ink2};
    font-family: ${T.fontMono};
  }

  /* ── Divider ── */
  .divider {
    height: 1px;
    background: ${T.line};
    margin: 0 auto 2rem;
    max-width: 900px;
    padding: 0 2rem;
  }

  /* ── Interest group headings ── */
  .interest-group { margin-bottom: 2.5rem; }

  .interest-group-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: ${T.fontMono};
    font-size: 11px;
    letter-spacing: 0.08em;
    color: ${T.ink3};
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  .interest-group-title::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: ${T.accent};
    opacity: 0.5;
  }
`;

// ─── Sub-components ──────────────────────────────────────────────────────────

function Chip({ label, variant = "interest" }: { label: string; variant?: "interest" | "stage" }) {
  return <span className={`chip chip-${variant}`}>{label}</span>;
}

function RosterAvatars({ roster }: { roster: RosterMember[] }) {
  const shown = roster.slice(0, 4);
  return (
    <div className="roster">
      {shown.map((r) => (
        <div
          key={r.handle}
          className="avatar"
          style={{ background: avatarColor(r.handle) }}
          title={r.name}
        >
          {initials(r.name)}
        </div>
      ))}
    </div>
  );
}

function UpvoteButton({
  count,
  voted,
  onVote,
  compact = false,
}: {
  count: number;
  voted: boolean;
  onVote: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <button className={`upvote-btn${voted ? " voted" : ""}`} onClick={(e) => { e.stopPropagation(); onVote(); }}>
        <span className="upvote-arrow">▲</span>
        <span className="upvote-count">{count}</span>
      </button>
    );
  }
  return (
    <button
      className={`hero-upvote${voted ? " voted" : ""}`}
      onClick={(e) => { e.stopPropagation(); onVote(); }}
    >
      <span style={{ fontSize: 13 }}>▲</span>
      <span>{count}</span>
    </button>
  );
}

// ─── Hero carousel ───────────────────────────────────────────────────────────
function Hero({
  items,
  votes,
  onVote,
}: {
  items: Karya[];
  votes: Record<string, number>;
  onVote: (id: string) => void;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <div className="hero">
      <div className="hero-label">Karya Unggulan</div>
      <div className="hero-cards">
        {items.map((k, i) => {
          const offset = (i - active + items.length) % items.length;
          const cls =
            offset === 0
              ? "hero-card"
              : offset === 1
              ? "hero-card behind"
              : "hero-card inactive";
          return (
            <div key={k.id} className={cls} onClick={() => setActive(i)}>
              <div>
                <div className="hero-card-title">{k.title}</div>
                <div className="hero-card-desc">{k.description}</div>
              </div>
              <div className="hero-card-footer">
                <div className="hero-chips">
                  {k.stages.map((s) => <Chip key={s} label={s} variant="stage" />)}
                  {k.interests.slice(0, 3).map((t) => <Chip key={t} label={t} />)}
                  <RosterAvatars roster={k.roster} />
                </div>
                <UpvoteButton
                  count={votes[k.id] ?? k.upvotes}
                  voted={false}
                  onVote={() => onVote(k.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="hero-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === active ? " active" : ""}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Karya row ───────────────────────────────────────────────────────────────
function KaryaRow({
  k,
  votes,
  voted,
  onVote,
}: {
  k: Karya;
  votes: number;
  voted: boolean;
  onVote: () => void;
}) {
  return (
    <div className="karya-row">
      <div className="karya-row-left">
        <div className="karya-row-title">{k.title}</div>
        <div className="karya-row-desc">{k.description}</div>
        <div className="karya-row-meta">
          {k.stages.map((s) => <Chip key={s} label={s} variant="stage" />)}
          {k.interests.map((t) => <Chip key={t} label={t} />)}
          <RosterAvatars roster={k.roster} />
        </div>
      </div>
      <div className="karya-row-right">
        <UpvoteButton count={votes} voted={voted} onVote={onVote} compact />
      </div>
    </div>
  );
}

// ─── Discovery surface ───────────────────────────────────────────────────────
const ALL_INTERESTS = Array.from(new Set(KARYA.flatMap((k) => k.interests))).sort();

function DiscoverySurface({
  votes,
  voted,
  onVote,
}: {
  votes: Record<string, number>;
  voted: Record<string, boolean>;
  onVote: (id: string) => void;
}) {
  const [activeInterest, setActiveInterest] = useState<string | null>(null);

  const featured = KARYA.filter((k) => k.featured);
  const rest = KARYA.filter((k) => !k.featured);

  const filtered = activeInterest
    ? rest.filter((k) => k.interests.includes(activeInterest))
    : rest;

  const sorted = [...filtered].sort((a, b) => (votes[b.id] ?? b.upvotes) - (votes[a.id] ?? a.upvotes));

  return (
    <>
      <Hero items={featured} votes={votes} onVote={onVote} />

      {/* Interest filter strip */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem 1.5rem" }}>
        <div className="search-filter-row">
          <span className="filter-label">minat:</span>
          <button
            className={`filter-chip${activeInterest === null ? " active" : ""}`}
            onClick={() => setActiveInterest(null)}
          >
            Semua
          </button>
          {ALL_INTERESTS.map((t) => (
            <button
              key={t}
              className={`filter-chip${activeInterest === t ? " active" : ""}`}
              onClick={() => setActiveInterest(activeInterest === t ? null : t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="section-head">
        <span className="section-title">
          {activeInterest ? `Karya — ${activeInterest}` : "Semua Karya"}
        </span>
        <span className="section-count">{sorted.length} karya</span>
      </div>

      <div className="karya-list">
        {sorted.length === 0 ? (
          <div className="empty">Belum ada karya di minat ini. Jadilah yang pertama!</div>
        ) : (
          sorted.map((k) => (
            <KaryaRow
              key={k.id}
              k={k}
              votes={votes[k.id] ?? k.upvotes}
              voted={voted[k.id] ?? false}
              onVote={() => onVote(k.id)}
            />
          ))
        )}
      </div>
    </>
  );
}

// ─── Search surface ──────────────────────────────────────────────────────────
const SKILL_TAGS = Array.from(new Set(MEMBERS.flatMap((m) => m.skills))).sort();
const MEMBER_INTERESTS = Array.from(new Set(MEMBERS.flatMap((m) => m.interests))).sort();

function SearchSurface({
  votes,
  voted,
  onVote,
}: {
  votes: Record<string, number>;
  voted: Record<string, boolean>;
  onVote: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"karya" | "orang">("karya");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredKarya = KARYA.filter((k) => {
    const q = query.toLowerCase();
    const matchQ = !q || k.title.toLowerCase().includes(q) || k.description.toLowerCase().includes(q) || k.interests.some((i) => i.toLowerCase().includes(q));
    const matchTag = !activeTag || k.interests.includes(activeTag);
    return matchQ && matchTag;
  }).sort((a, b) => (votes[b.id] ?? b.upvotes) - (votes[a.id] ?? a.upvotes));

  const filteredMembers = MEMBERS.filter((m) => {
    const q = query.toLowerCase();
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.handle.toLowerCase().includes(q) || m.skills.some((s) => s.toLowerCase().includes(q)) || m.interests.some((i) => i.toLowerCase().includes(q));
    const matchTag = !activeTag || m.skills.includes(activeTag) || m.interests.includes(activeTag);
    return matchQ && matchTag;
  });

  const tagOptions = mode === "karya" ? ALL_INTERESTS : [...SKILL_TAGS, ...MEMBER_INTERESTS.filter((i) => !SKILL_TAGS.includes(i))];

  return (
    <div className="search-surface">
      <div className="search-bar-wrap">
        <span className="search-icon">⌕</span>
        <input
          className="search-input"
          placeholder={mode === "karya" ? "Cari karya, minat, atau topik…" : "Cari orang, skill, atau jurusan…"}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveTag(null); }}
          autoFocus
        />
      </div>

      <div className="search-mode-toggle">
        <button className={`mode-btn${mode === "karya" ? " active" : ""}`} onClick={() => { setMode("karya"); setActiveTag(null); }}>
          Karya
        </button>
        <button className={`mode-btn${mode === "orang" ? " active" : ""}`} onClick={() => { setMode("orang"); setActiveTag(null); }}>
          Orang
        </button>
      </div>

      <div className="search-filter-row">
        <span className="filter-label">{mode === "karya" ? "minat:" : "skill:"}</span>
        <button className={`filter-chip${activeTag === null ? " active" : ""}`} onClick={() => setActiveTag(null)}>
          Semua
        </button>
        {tagOptions.map((t) => (
          <button key={t} className={`filter-chip${activeTag === t ? " active" : ""}`} onClick={() => setActiveTag(activeTag === t ? null : t)}>
            {t}
          </button>
        ))}
      </div>

      {mode === "karya" ? (
        <>
          <div className="section-head" style={{ padding: 0 }}>
            <span className="section-title">Hasil</span>
            <span className="section-count">{filteredKarya.length} karya</span>
          </div>
          <div className="karya-list" style={{ padding: 0, paddingBottom: "2rem" }}>
            {filteredKarya.length === 0 ? (
              <div className="empty">Tidak ada karya yang cocok. Coba kata kunci lain.</div>
            ) : (
              filteredKarya.map((k) => (
                <KaryaRow key={k.id} k={k} votes={votes[k.id] ?? k.upvotes} voted={voted[k.id] ?? false} onVote={() => onVote(k.id)} />
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="section-head" style={{ padding: 0, marginBottom: "1rem" }}>
            <span className="section-title">Anggota</span>
            <span className="section-count">{filteredMembers.length} orang</span>
          </div>
          <div className="people-grid">
            {filteredMembers.length === 0 ? (
              <div className="empty" style={{ gridColumn: "1/-1" }}>Tidak ada anggota yang cocok.</div>
            ) : (
              filteredMembers.map((m) => (
                <div key={m.id} className="person-card">
                  <div className="person-head">
                    <div className="person-avatar" style={{ background: avatarColor(m.handle) }}>
                      {initials(m.name)}
                    </div>
                    <div>
                      <div className="person-name">{m.name}</div>
                      <div className="person-meta">{m.handle} · Tk.{m.year} {m.major}</div>
                    </div>
                  </div>
                  <div className="person-bio">{m.bio}</div>
                  <div className="person-skills">
                    {m.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Root app ────────────────────────────────────────────────────────────────
export default function AlFathBerkarya() {
  const [tab, setTab] = useState<"discover" | "search">("discover");
  const [votes, setVotes] = useState<Record<string, number>>(() =>
    Object.fromEntries(KARYA.map((k) => [k.id, k.upvotes]))
  );
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleVote = useCallback((id: string) => {
    setVoted((prev) => {
      const wasVoted = prev[id];
      setVotes((v) => ({ ...v, [id]: v[id] + (wasVoted ? -1 : 1) }));
      return { ...prev, [id]: !wasVoted };
    });
  }, []);

  return (
    <div className="mockup-root">
      <nav className="nav">
        <div className="nav-brand">
          <span className="nav-brand-name">Al-Fath Berkarya</span>
          <span className="nav-brand-sub">TEL-U</span>
        </div>
        <div className="nav-tabs">
          <button className={`nav-tab${tab === "discover" ? " active" : ""}`} onClick={() => setTab("discover")}>
            Temukan
          </button>
          <button className={`nav-tab${tab === "search" ? " active" : ""}`} onClick={() => setTab("search")}>
            Cari
          </button>
        </div>
        <div className="nav-action">
          <button className="btn-post">+ Bagikan Karya</button>
        </div>
      </nav>

      {tab === "discover" ? (
        <DiscoverySurface votes={votes} voted={voted} onVote={handleVote} />
      ) : (
        <SearchSurface votes={votes} voted={voted} onVote={handleVote} />
      )}
    </div>
  );
}
