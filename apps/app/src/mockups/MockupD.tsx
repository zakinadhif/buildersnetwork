/**
 * Al-Fath Berkarya — Editorial Showcase Mockup
 * Self-contained: hardcoded data, local tokens, only `react` imported.
 * Two surfaces: Discovery (magazine-style) + Search (editorial results).
 *
 * Fonts loaded via Google Fonts in the inline <style> block.
 * No router, no real APIs, no external component libraries.
 */

import { useState } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const tokens = `
  :root {
    --bg:      #f1efe9;
    --ink:     #0f0e0b;
    --ink2:    #8a8781;
    --ink3:    #bbb8b2;
    --accent:  oklch(39% 0.085 62);
    --accent-light: oklch(72% 0.07 62);
    --line:    #dedad2;
    --card-bg: #f8f6f1;
    --card-shadow: 0 1px 3px rgba(15,14,11,0.06), 0 4px 16px rgba(15,14,11,0.04);
    --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
  }
`;

// ─── Global Styles ────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--ink);
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Layout ── */
  .app { min-height: 100vh; }

  /* ── Masthead ── */
  .masthead {
    border-bottom: 1px solid var(--line);
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    position: sticky;
    top: 0;
    background: var(--bg);
    z-index: 100;
  }
  .masthead__wordmark {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .masthead__wordmark span {
    color: var(--accent);
  }
  .masthead__nav {
    display: flex;
    gap: 32px;
    align-items: center;
  }
  .masthead__nav button {
    background: none;
    border: none;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--ink2);
    cursor: pointer;
    letter-spacing: 0.02em;
    padding: 0;
    transition: color 0.15s;
  }
  .masthead__nav button:hover,
  .masthead__nav button.active {
    color: var(--ink);
  }
  .masthead__nav button.active {
    color: var(--accent);
  }
  .masthead__issue {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink3);
    letter-spacing: 0.06em;
  }

  /* ── Hero Band ── */
  .hero-band {
    border-bottom: 1px solid var(--line);
    padding: 64px 40px 56px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 80px;
  }
  .hero-band__kicker {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hero-band__kicker::before {
    content: '';
    display: block;
    width: 24px;
    height: 1px;
    background: var(--accent);
  }
  .hero-band__headline {
    font-size: 52px;
    font-weight: 300;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 24px;
  }
  .hero-band__sub {
    font-size: 15px;
    color: var(--ink2);
    line-height: 1.7;
    max-width: 460px;
  }
  .hero-band__right {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 16px;
  }
  .hero-band__stat {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--line);
  }
  .hero-band__stat:last-child { border-bottom: none; padding-bottom: 0; }
  .hero-band__stat-num {
    font-size: 36px;
    font-weight: 300;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .hero-band__stat-label {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink2);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* ── Featured Strip ── */
  .featured-strip {
    padding: 56px 40px;
    border-bottom: 1px solid var(--line);
  }
  .section-label {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink3);
    margin-bottom: 32px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--line);
  }
  .featured-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
  }
  .featured-card {
    background: var(--card-bg);
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 0;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
  }
  .featured-card:hover { background: #f4f2ec; }
  .featured-card--primary { padding: 40px; }
  .featured-card__num {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink3);
    letter-spacing: 0.1em;
    margin-bottom: 20px;
  }
  .featured-card__title {
    font-size: 26px;
    font-weight: 300;
    line-height: 1.15;
    letter-spacing: -0.015em;
    color: var(--ink);
    margin-bottom: 12px;
  }
  .featured-card--primary .featured-card__title {
    font-size: 34px;
  }
  .featured-card__desc {
    font-size: 13.5px;
    color: var(--ink2);
    line-height: 1.65;
    margin-bottom: 24px;
    flex: 1;
  }
  .featured-card__stages {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 20px;
  }
  .tag {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 8px;
    border: 1px solid var(--line);
    color: var(--ink2);
    background: transparent;
    border-radius: 2px;
  }
  .tag--accent {
    border-color: var(--accent);
    color: var(--accent);
  }
  .featured-card__roster {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
  }
  .avatar-stack {
    display: flex;
  }
  .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--line);
    border: 2px solid var(--card-bg);
    margin-left: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 8px;
    font-weight: 500;
    color: var(--ink2);
    overflow: hidden;
  }
  .avatar:first-child { margin-left: 0; }
  .avatar-colors { background: var(--accent-light); color: var(--accent); }
  .avatar-colors2 { background: #d4e8d4; color: #3a6b3a; }
  .avatar-colors3 { background: #d4d8e8; color: #3a3f6b; }
  .avatar-colors4 { background: #e8d4d4; color: #6b3a3a; }
  .avatar-colors5 { background: #e8e4d4; color: #6b5f3a; }
  .roster-names {
    font-size: 12px;
    color: var(--ink3);
    font-family: var(--font-mono);
  }

  /* ── Collection Sections ── */
  .collection {
    padding: 56px 40px;
    border-bottom: 1px solid var(--line);
  }
  .collection__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 32px;
  }
  .collection__title {
    font-size: 20px;
    font-weight: 300;
    letter-spacing: -0.01em;
  }
  .collection__interest {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent);
    letter-spacing: 0.08em;
  }
  .collection__see-all {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink3);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s;
    text-decoration: none;
  }
  .collection__see-all:hover { color: var(--ink2); }
  .collection-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
  }
  .collection-row--2col {
    grid-template-columns: repeat(2, 1fr);
  }
  .karya-card {
    background: var(--card-bg);
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .karya-card:hover { background: #f4f2ec; }
  .karya-card__num {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--ink3);
    letter-spacing: 0.12em;
  }
  .karya-card__title {
    font-size: 18px;
    font-weight: 300;
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: var(--ink);
  }
  .karya-card__desc {
    font-size: 13px;
    color: var(--ink2);
    line-height: 1.6;
    flex: 1;
  }
  .karya-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid var(--line);
  }

  /* ── Recent Band ── */
  .recent-band {
    padding: 56px 40px;
    border-bottom: 1px solid var(--line);
  }
  .recent-list {
    display: flex;
    flex-direction: column;
  }
  .recent-row {
    display: grid;
    grid-template-columns: 56px 1fr 200px 120px;
    gap: 24px;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--line);
    cursor: pointer;
    transition: background 0.15s;
    padding-left: 4px;
    padding-right: 4px;
  }
  .recent-row:first-child { border-top: 1px solid var(--line); }
  .recent-row:hover { background: #f4f2ec; margin: 0 -4px; padding-left: 8px; padding-right: 8px; }
  .recent-row__idx {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink3);
    letter-spacing: 0.1em;
  }
  .recent-row__title {
    font-size: 16px;
    font-weight: 400;
    color: var(--ink);
  }
  .recent-row__title small {
    display: block;
    font-size: 12px;
    color: var(--ink3);
    font-weight: 400;
    margin-top: 2px;
    font-family: var(--font-mono);
  }
  .recent-row__stages { display: flex; gap: 6px; flex-wrap: wrap; }
  .recent-row__roster {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink3);
    text-align: right;
  }

  /* ── Search Surface ── */
  .search-surface {
    padding: 0 40px;
  }
  .search-hero {
    padding: 64px 0 48px;
    border-bottom: 1px solid var(--line);
  }
  .search-hero__kicker {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .search-hero__kicker::before {
    content: '';
    display: block;
    width: 24px;
    height: 1px;
    background: var(--accent);
  }
  .search-bar {
    display: flex;
    align-items: stretch;
    border: 1.5px solid var(--ink);
    max-width: 680px;
    margin-bottom: 24px;
    background: var(--card-bg);
  }
  .search-bar input {
    flex: 1;
    padding: 14px 20px;
    font-family: var(--font-body);
    font-size: 16px;
    border: none;
    background: transparent;
    color: var(--ink);
    outline: none;
  }
  .search-bar input::placeholder { color: var(--ink3); }
  .search-bar button {
    padding: 0 20px;
    background: var(--ink);
    color: var(--bg);
    border: none;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s;
  }
  .search-bar button:hover { background: var(--accent); }
  .search-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .filter-chip {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    padding: 5px 12px;
    border: 1px solid var(--line);
    background: transparent;
    color: var(--ink2);
    cursor: pointer;
    transition: all 0.15s;
    border-radius: 2px;
  }
  .filter-chip:hover { border-color: var(--ink2); color: var(--ink); }
  .filter-chip.active { background: var(--ink); color: var(--bg); border-color: var(--ink); }

  .search-results {
    padding: 48px 0;
  }
  .results-section {
    margin-bottom: 56px;
  }
  .results-section__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--line);
  }
  .results-section__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
    letter-spacing: 0.02em;
  }
  .results-section__count {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink3);
    letter-spacing: 0.08em;
  }

  /* People Grid */
  .people-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
  }
  .person-card {
    background: var(--card-bg);
    padding: 24px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .person-card:hover { background: #f4f2ec; }
  .person-card__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  .person-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    flex-shrink: 0;
  }
  .person-card__name {
    font-size: 15px;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.2;
  }
  .person-card__handle {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink3);
    letter-spacing: 0.04em;
  }
  .person-card__meta {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--ink3);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .person-card__bio {
    font-size: 12.5px;
    color: var(--ink2);
    line-height: 1.6;
    margin-bottom: 14px;
  }
  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  /* ── Fade-in animation ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeUp 0.5s ease both; }
  .fade-in-1 { animation-delay: 0.05s; }
  .fade-in-2 { animation-delay: 0.12s; }
  .fade-in-3 { animation-delay: 0.20s; }
  .fade-in-4 { animation-delay: 0.28s; }

  /* ── Footer ── */
  .footer {
    border-top: 1px solid var(--line);
    padding: 32px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer__wordmark {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink3);
    letter-spacing: 0.08em;
  }
  .footer__copy {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink3);
    letter-spacing: 0.06em;
  }
`;

// ─── Sample Data ──────────────────────────────────────────────────────────────

const karya = [
  {
    id: "k1",
    title: "Ruang Bahas",
    description:
      "Platform diskusi terstruktur untuk mahasiswa Telkom University — setiap topik punya room, moderator, dan rangkuman otomatis supaya tidak ada insight yang hilang di scroll.",
    stages: ["Prototipe", "Terbuka untuk Kolaborasi"],
    interests: ["Komunitas", "Edukasi", "Web"],
    roster: [
      { name: "Hana Putri", handle: "@hanaptr" },
      { name: "Dzikri A.", handle: "@dzikri" },
      { name: "Salma R.", handle: "@salmar" },
    ],
  },
  {
    id: "k2",
    title: "Teman Tumbuh",
    description:
      "Aplikasi journaling produktivitas sederhana dengan sistem check-in harian dan laporan mingguan. Fokus pada konsistensi kecil, bukan target besar.",
    stages: ["MVP Live", "Beta Tester Dicari"],
    interests: ["Produktivitas", "Mobile", "Wellness"],
    roster: [
      { name: "Fariz M.", handle: "@farizm" },
      { name: "Nadia K.", handle: "@nadiak" },
    ],
  },
  {
    id: "k3",
    title: "Peta Karya",
    description:
      "Peta interaktif proyek mahasiswa Telkom, dikelompokkan per program studi dan angkatan. Temukan siapa yang sedang bikin apa di sekitarmu.",
    stages: ["Ide Awal", "Mencari Co-founder"],
    interests: ["Komunitas", "Data", "Web"],
    roster: [{ name: "Rizal F.", handle: "@rizalf" }],
  },
  {
    id: "k4",
    title: "Bunyi Lokal",
    description:
      "Arsip musik indie mahasiswa — upload, dengarkan, dan beri feedback konstruktif. Lebih dari Soundcloud; ada review kultur kampus di dalamnya.",
    stages: ["Alpha", "Butuh Desainer"],
    interests: ["Musik", "Budaya", "Web"],
    roster: [
      { name: "Yasmin T.", handle: "@yasmint" },
      { name: "Bagas W.", handle: "@bagasw" },
    ],
  },
  {
    id: "k5",
    title: "Kolom Ilmiah",
    description:
      "Newsletter mingguan yang menyederhanakan paper akademik ke bahasa sehari-hari. Terbit tiap Jumat, ditulis bersama oleh volunteer editor.",
    stages: ["Aktif", "Open Kontributor"],
    interests: ["Edukasi", "Riset", "Konten"],
    roster: [
      { name: "Aulia P.", handle: "@auliap" },
      { name: "Taufik H.", handle: "@taufikhl" },
      { name: "Rania S.", handle: "@ranias" },
    ],
  },
  {
    id: "k6",
    title: "Warung Data",
    description:
      "Dataset dan analisis sederhana untuk riset mahasiswa — curated dari sumber publik, diberi konteks lokal, gratis untuk dipakai skripsi.",
    stages: ["Pengembangan Aktif", "Terbuka"],
    interests: ["Data", "Riset", "Open Source"],
    roster: [
      { name: "Firdaus A.", handle: "@firdausa" },
      { name: "Kirana L.", handle: "@kiranal" },
    ],
  },
  {
    id: "k7",
    title: "Jadwal Bareng",
    description:
      "Tool penjadwalan kelompok yang paham jadwal kuliah Telkom — integrasikan SKS, UTS, dan deadline bersama teman satu tim.",
    stages: ["Konsep", "Butuh Developer"],
    interests: ["Produktivitas", "Tools", "Mobile"],
    roster: [{ name: "Ilham N.", handle: "@ilhamn" }],
  },
  {
    id: "k8",
    title: "Buku Saku UKM",
    description:
      "Panduan UKM kampus dalam format digital interaktif — profil, jadwal latihan, cara daftar, dan testimoni dari anggota aktif.",
    stages: ["Selesai v1", "Mencari Maintainer"],
    interests: ["Komunitas", "Konten", "Web"],
    roster: [
      { name: "Nisa A.", handle: "@nisaa" },
      { name: "Ghani R.", handle: "@ghanir" },
    ],
  },
];

const members = [
  {
    id: "m1",
    name: "Hana Putri",
    handle: "@hanaptr",
    bio: "Suka bangun fitur yang bikin orang bilang 'oh, enak juga ya'. Final year IF.",
    interests: ["Komunitas", "UX", "Web"],
    skills: ["React", "Figma", "TypeScript"],
    year: "2021",
    major: "Informatika",
  },
  {
    id: "m2",
    name: "Fariz M.",
    handle: "@farizm",
    bio: "Bangun produk kecil yang berguna. Prefer mobile-first. Terbuka kolaborasi.",
    interests: ["Produktivitas", "Mobile", "Wellness"],
    skills: ["Flutter", "Firebase", "UI Design"],
    year: "2022",
    major: "Sistem Informasi",
  },
  {
    id: "m3",
    name: "Aulia P.",
    handle: "@auliap",
    bio: "Editor dan penulis teknis. Kalau bisa dijelaskan sederhana, kenapa harus rumit?",
    interests: ["Edukasi", "Konten", "Riset"],
    skills: ["Technical Writing", "Research", "Editing"],
    year: "2020",
    major: "Ilmu Komunikasi",
  },
  {
    id: "m4",
    name: "Firdaus A.",
    handle: "@firdausa",
    bio: "Data analyst yang hobi curate dataset publik buat diolah bareng.",
    interests: ["Data", "Riset", "Open Source"],
    skills: ["Python", "SQL", "Tableau"],
    year: "2021",
    major: "Informatika",
  },
];

// ─── Avatar color palette helper ─────────────────────────────────────────────
const avatarColors = [
  { bg: "oklch(72% 0.07 62)", fg: "oklch(39% 0.085 62)" },
  { bg: "#d4e8d4", fg: "#3a6b3a" },
  { bg: "#d4d8e8", fg: "#3a3f6b" },
  { bg: "#e8d4d4", fg: "#6b3a3a" },
  { bg: "#e8e4d4", fg: "#6b5f3a" },
  { bg: "#d4e4e8", fg: "#3a5f6b" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AvatarStack({ roster }: { roster: { name: string; handle: string }[] }) {
  return (
    <div className="featured-card__roster">
      <div className="avatar-stack">
        {roster.slice(0, 4).map((r, i) => (
          <div
            key={r.handle}
            className="avatar"
            title={r.name}
            style={{
              background: avatarColors[i % avatarColors.length].bg,
              color: avatarColors[i % avatarColors.length].fg,
            }}
          >
            {initials(r.name)}
          </div>
        ))}
      </div>
      <span className="roster-names">
        {roster[0].name}
        {roster.length > 1 ? ` +${roster.length - 1}` : ""}
      </span>
    </div>
  );
}

function PersonAvatar({ name, idx }: { name: string; idx: number }) {
  const c = avatarColors[idx % avatarColors.length];
  return (
    <div
      className="person-avatar"
      style={{ background: c.bg, color: c.fg }}
    >
      {initials(name)}
    </div>
  );
}

// ─── Discovery Surface ────────────────────────────────────────────────────────
function DiscoverySurface() {
  const featured = karya.slice(0, 3);
  const byKomunitas = karya.filter((k) => k.interests.includes("Komunitas"));
  const byEdukasi = karya.filter((k) => k.interests.includes("Edukasi"));
  const recent = karya.slice(3);

  return (
    <div>
      {/* Hero Band */}
      <section className="hero-band fade-in fade-in-1">
        <div>
          <p className="hero-band__kicker">Al-Fath Berkarya</p>
          <h1 className="hero-band__headline">
            Karya mahasiswa,<br />
            ditemukan bersama.
          </h1>
          <p className="hero-band__sub">
            Wadah proyek mahasiswa Telkom University — dari ide awal hingga
            produk yang hidup. Temukan kolaborator, ikuti perkembangan, dan
            bawa karyamu ke hadapan yang tepat.
          </p>
        </div>
        <div className="hero-band__right">
          <div className="hero-band__stat">
            <span className="hero-band__stat-num">47</span>
            <span className="hero-band__stat-label">Karya Aktif</span>
          </div>
          <div className="hero-band__stat">
            <span className="hero-band__stat-num">128</span>
            <span className="hero-band__stat-label">Anggota Terdaftar</span>
          </div>
          <div className="hero-band__stat">
            <span className="hero-band__stat-num">12</span>
            <span className="hero-band__stat-label">Minat Tersedia</span>
          </div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="featured-strip fade-in fade-in-2">
        <p className="section-label">Karya Pilihan Minggu Ini</p>
        <div className="featured-grid">
          {/* Primary */}
          <div className="featured-card featured-card--primary">
            <p className="featured-card__num">001</p>
            <h2 className="featured-card__title">{featured[0].title}</h2>
            <p className="featured-card__desc">{featured[0].description}</p>
            <div className="featured-card__stages">
              {featured[0].stages.map((s) => (
                <span key={s} className="tag tag--accent">{s}</span>
              ))}
              {featured[0].interests.map((i) => (
                <span key={i} className="tag">{i}</span>
              ))}
            </div>
            <AvatarStack roster={featured[0].roster} />
          </div>
          {/* Secondary */}
          {featured.slice(1).map((k, i) => (
            <div key={k.id} className="featured-card">
              <p className="featured-card__num">{String(i + 2).padStart(3, "0")}</p>
              <h2 className="featured-card__title">{k.title}</h2>
              <p className="featured-card__desc">{k.description}</p>
              <div className="featured-card__stages">
                {k.stages.map((s) => (
                  <span key={s} className="tag tag--accent">{s}</span>
                ))}
              </div>
              <AvatarStack roster={k.roster} />
            </div>
          ))}
        </div>
      </section>

      {/* Collection: Komunitas */}
      <section className="collection fade-in fade-in-3">
        <div className="collection__header">
          <div>
            <p className="collection__interest">Koleksi per Minat</p>
            <h2 className="collection__title">Komunitas & Koneksi</h2>
          </div>
          <button className="collection__see-all">Lihat Semua &rarr;</button>
        </div>
        <div className="collection-row">
          {byKomunitas.map((k, i) => (
            <div key={k.id} className="karya-card">
              <p className="karya-card__num">{String(i + 1).padStart(3, "0")}</p>
              <h3 className="karya-card__title">{k.title}</h3>
              <p className="karya-card__desc">{k.description}</p>
              <div className="karya-card__footer">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {k.stages.slice(0, 1).map((s) => (
                    <span key={s} className="tag tag--accent">{s}</span>
                  ))}
                </div>
                <span className="roster-names" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink3)" }}>
                  {k.roster.length} anggota
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collection: Edukasi */}
      <section className="collection fade-in fade-in-4">
        <div className="collection__header">
          <div>
            <p className="collection__interest">Koleksi per Minat</p>
            <h2 className="collection__title">Edukasi & Ilmu</h2>
          </div>
          <button className="collection__see-all">Lihat Semua &rarr;</button>
        </div>
        <div className="collection-row collection-row--2col">
          {byEdukasi.map((k, i) => (
            <div key={k.id} className="karya-card">
              <p className="karya-card__num">{String(i + 1).padStart(3, "0")}</p>
              <h3 className="karya-card__title">{k.title}</h3>
              <p className="karya-card__desc">{k.description}</p>
              <div className="karya-card__footer">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {k.stages.slice(0, 1).map((s) => (
                    <span key={s} className="tag tag--accent">{s}</span>
                  ))}
                </div>
                <AvatarStack roster={k.roster} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent — table-style */}
      <section className="recent-band fade-in fade-in-4">
        <p className="section-label">Baru Ditambahkan</p>
        <div className="recent-list">
          {recent.map((k, i) => (
            <div key={k.id} className="recent-row">
              <span className="recent-row__idx">{String(i + 1).padStart(2, "0")}</span>
              <div className="recent-row__title">
                {k.title}
                <small>{k.description.slice(0, 60)}…</small>
              </div>
              <div className="recent-row__stages">
                {k.interests.slice(0, 2).map((it) => (
                  <span key={it} className="tag">{it}</span>
                ))}
              </div>
              <div className="recent-row__roster">
                {k.roster.map((r) => r.handle).join(", ")}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Search Surface ───────────────────────────────────────────────────────────
function SearchSurface() {
  const [query, setQuery] = useState("produktivitas");
  const [activeFilter, setActiveFilter] = useState<"karya" | "orang" | "semua">("semua");

  const filters: { label: string; value: "karya" | "orang" | "semua" }[] = [
    { label: "Semua", value: "semua" },
    { label: "Karya", value: "karya" },
    { label: "Orang", value: "orang" },
  ];

  const interests = ["Produktivitas", "Web", "Komunitas", "Data", "Edukasi", "Mobile", "Musik", "Riset"];

  const matchedKarya = karya.filter(
    (k) =>
      k.interests.some((i) => i.toLowerCase().includes(query.toLowerCase())) ||
      k.title.toLowerCase().includes(query.toLowerCase()) ||
      k.description.toLowerCase().includes(query.toLowerCase())
  );

  const matchedMembers = members.filter(
    (m) =>
      m.interests.some((i) => i.toLowerCase().includes(query.toLowerCase())) ||
      m.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())) ||
      m.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="search-surface">
      {/* Search Hero */}
      <div className="search-hero fade-in fade-in-1">
        <p className="search-hero__kicker">Cari Karya & Orang</p>
        <div className="search-bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berdasarkan minat, skill, atau nama karya…"
          />
          <button>Cari</button>
        </div>
        <div className="search-filters">
          {filters.map((f) => (
            <button
              key={f.value}
              className={`filter-chip ${activeFilter === f.value ? "active" : ""}`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
          <span style={{ width: 1, background: "var(--line)", display: "inline-block", margin: "0 4px" }} />
          {interests.map((i) => (
            <button
              key={i}
              className="filter-chip"
              onClick={() => setQuery(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="search-results">
        {/* Karya Results */}
        {(activeFilter === "semua" || activeFilter === "karya") && (
          <div className="results-section fade-in fade-in-2">
            <div className="results-section__header">
              <span className="results-section__title">
                Karya — hasil untuk &ldquo;{query}&rdquo;
              </span>
              <span className="results-section__count">
                {matchedKarya.length} ditemukan
              </span>
            </div>
            {matchedKarya.length === 0 ? (
              <p style={{ color: "var(--ink3)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                Tidak ada karya yang cocok.
              </p>
            ) : (
              <div
                className="collection-row"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(matchedKarya.length, 3)}, 1fr)`,
                }}
              >
                {matchedKarya.slice(0, 3).map((k, i) => (
                  <div key={k.id} className="karya-card">
                    <p className="karya-card__num">{String(i + 1).padStart(3, "0")}</p>
                    <h3 className="karya-card__title">{k.title}</h3>
                    <p className="karya-card__desc">{k.description}</p>
                    <div className="karya-card__footer">
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {k.stages.slice(0, 1).map((s) => (
                          <span key={s} className="tag tag--accent">{s}</span>
                        ))}
                      </div>
                      <AvatarStack roster={k.roster} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* People Results */}
        {(activeFilter === "semua" || activeFilter === "orang") && (
          <div className="results-section fade-in fade-in-3">
            <div className="results-section__header">
              <span className="results-section__title">
                Orang — skill &amp; minat terkait &ldquo;{query}&rdquo;
              </span>
              <span className="results-section__count">
                {matchedMembers.length} ditemukan
              </span>
            </div>
            {matchedMembers.length === 0 ? (
              <p style={{ color: "var(--ink3)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                Tidak ada anggota yang cocok.
              </p>
            ) : (
              <div
                className="people-grid"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(matchedMembers.length, 4)}, 1fr)`,
                }}
              >
                {matchedMembers.map((m, i) => (
                  <div key={m.id} className="person-card">
                    <div className="person-card__header">
                      <PersonAvatar name={m.name} idx={i} />
                      <div>
                        <p className="person-card__name">{m.name}</p>
                        <p className="person-card__handle">{m.handle}</p>
                      </div>
                    </div>
                    <p className="person-card__meta">
                      {m.major} &middot; Angkatan {m.year}
                    </p>
                    <p className="person-card__bio">{m.bio}</p>
                    <div className="skills-list">
                      {m.skills.map((s) => (
                        <span key={s} className="tag">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collection suggestion block */}
        {(activeFilter === "semua") && (
          <div className="results-section fade-in fade-in-4">
            <div className="results-section__header">
              <span className="results-section__title">Koleksi terkait</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Produktivitas & Tools", "Komunitas & Koneksi", "Edukasi & Ilmu", "Data & Riset"].map(
                (c) => (
                  <button
                    key={c}
                    style={{
                      padding: "10px 18px",
                      background: "var(--card-bg)",
                      border: "1px solid var(--line)",
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      color: "var(--ink)",
                      cursor: "pointer",
                      transition: "border-color 0.15s",
                    }}
                    onMouseOver={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ink2)")
                    }
                    onMouseOut={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)")
                    }
                  >
                    {c}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [surface, setSurface] = useState<"discovery" | "search">("discovery");

  return (
    <>
      <style>{tokens}</style>
      <style>{globalStyles}</style>

      <div className="app">
        {/* Masthead */}
        <header className="masthead">
          <span className="masthead__wordmark">
            Al-Fath <span>Berkarya</span>
          </span>
          <nav className="masthead__nav">
            <button
              className={surface === "discovery" ? "active" : ""}
              onClick={() => setSurface("discovery")}
            >
              Temukan
            </button>
            <button
              className={surface === "search" ? "active" : ""}
              onClick={() => setSurface("search")}
            >
              Cari
            </button>
            <button>Karya Saya</button>
            <button>Tambah Karya</button>
          </nav>
          <span className="masthead__issue">Ed. Jun 2026</span>
        </header>

        {/* Surface */}
        {surface === "discovery" ? <DiscoverySurface /> : <SearchSurface />}

        {/* Footer */}
        <footer className="footer">
          <span className="footer__wordmark">AL-FATH BERKARYA</span>
          <span className="footer__copy">
            Dibuat dengan sederhana, untuk mahasiswa yang berkarya.
          </span>
        </footer>
      </div>
    </>
  );
}
