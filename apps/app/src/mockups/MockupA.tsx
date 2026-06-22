/**
 * Al-Fath Berkarya — Discovery & Search Mockup
 * Self-contained visual mockup. Only `react` imported.
 * Design direction: Calm, Wide Editorial
 */

import React, { useState } from "react";

// ─── Design tokens (inline style objects) ────────────────────────────────────
const T = {
  bg: "#f1efe9",
  ink: "#0f0e0b",
  ink2: "#8a8781",
  ink3: "#bbb8b2",
  accent: "oklch(39% 0.085 62)",
  accentMid: "oklch(55% 0.07 62)",
  accentSoft: "oklch(90% 0.03 62)",
  line: "#dedad2",
  white: "#faf9f6",
} as const;

// ─── Sample data ─────────────────────────────────────────────────────────────
interface Member {
  id: string;
  name: string;
  handle: string;
  bio: string;
  interests: string[];
  skills: string[];
  year: number;
  major: string;
}

interface Karya {
  id: string;
  title: string;
  description: string;
  stages: string[];
  interests: string[];
  roster: { name: string; handle: string }[];
}

const MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Nadia Ramadhani",
    handle: "nadiarama",
    bio: "Suka bikin antarmuka yang terasa manusiawi. Sedang eksplorasi motion design dan aksesibilitas.",
    interests: ["UI/UX", "Aksesibilitas", "Motion"],
    skills: ["Figma", "React", "CSS"],
    year: 3,
    major: "Sistem Informasi",
  },
  {
    id: "m2",
    name: "Rizky Fauzan",
    handle: "rfauzan",
    bio: "Backend engineer yang gemar data pipeline. Tertarik pada sistem distribusi dan monitoring.",
    interests: ["Backend", "Data Engineering", "DevOps"],
    skills: ["Go", "PostgreSQL", "Kubernetes"],
    year: 4,
    major: "Teknik Informatika",
  },
  {
    id: "m3",
    name: "Salma Aulia",
    handle: "salmaaulia",
    bio: "Menulis dan mengkode. Tertarik pada konten digital, copywriting berbasis data, dan SEO teknis.",
    interests: ["Konten", "SEO", "Penulisan"],
    skills: ["Next.js", "Markdown", "Figma"],
    year: 2,
    major: "Ilmu Komunikasi",
  },
  {
    id: "m4",
    name: "Farhan Maulana",
    handle: "farhanml",
    bio: "ML practitioner yang suka deploy model ke edge. Hobi ngoprek embedded systems.",
    interests: ["Machine Learning", "IoT", "Edge AI"],
    skills: ["Python", "TensorFlow Lite", "Rust"],
    year: 4,
    major: "Teknik Elektro",
  },
  {
    id: "m5",
    name: "Dian Pratiwi",
    handle: "dianprt",
    bio: "Product thinker yang membangun dari riset. Suka validation sprint dan prototyping cepat.",
    interests: ["Produk", "Riset Pengguna", "UI/UX"],
    skills: ["Notion", "Figma", "Miro"],
    year: 3,
    major: "Manajemen Bisnis",
  },
  {
    id: "m6",
    name: "Alif Hakim",
    handle: "alifhkm",
    bio: "Fullstack dev dengan obsesi pada DX yang baik. Contributor open source kecil-kecilan.",
    interests: ["Fullstack", "Open Source", "Developer Tools"],
    skills: ["TypeScript", "Hono", "Drizzle ORM"],
    year: 3,
    major: "Teknik Informatika",
  },
];

const KARYA: Karya[] = [
  {
    id: "k1",
    title: "Warung Digital",
    description:
      "Platform kasir sederhana untuk UMKM lokal dengan laporan harian otomatis dan integrasi QRIS.",
    stages: ["Konsep", "Prototipe", "Uji Coba"],
    interests: ["Produk", "Fullstack", "UMKM"],
    roster: [
      { name: "Alif Hakim", handle: "alifhkm" },
      { name: "Dian Pratiwi", handle: "dianprt" },
    ],
  },
  {
    id: "k2",
    title: "Kata·kita",
    description:
      "Jurnal kolaboratif anonim untuk mahasiswa berbagi cerita akademik tanpa tekanan identitas.",
    stages: ["Desain", "Development"],
    interests: ["Konten", "UI/UX", "Penulisan"],
    roster: [
      { name: "Salma Aulia", handle: "salmaaulia" },
      { name: "Nadia Ramadhani", handle: "nadiarama" },
    ],
  },
  {
    id: "k3",
    title: "Pantau Cuaca Kebun",
    description:
      "Sensor IoT murah untuk memantau kelembapan tanah dan cuaca mikro di lahan pertanian kecil.",
    stages: ["Prototipe Hardware", "Firmware"],
    interests: ["IoT", "Machine Learning", "Edge AI"],
    roster: [
      { name: "Farhan Maulana", handle: "farhanml" },
      { name: "Rizky Fauzan", handle: "rfauzan" },
    ],
  },
  {
    id: "k4",
    title: "Buku Karya",
    description:
      "Direktori karya mahasiswa Telkom University — temukan proyek, kolaborator, dan mentor.",
    stages: ["MVP", "Beta"],
    interests: ["Produk", "Fullstack", "Komunitas"],
    roster: [
      { name: "Alif Hakim", handle: "alifhkm" },
      { name: "Nadia Ramadhani", handle: "nadiarama" },
      { name: "Dian Pratiwi", handle: "dianprt" },
    ],
  },
  {
    id: "k5",
    title: "Suara Kelas",
    description:
      "Aplikasi survei cepat untuk dosen mengumpulkan umpan balik anonim di tengah sesi kuliah.",
    stages: ["Konsep", "Wireframe"],
    interests: ["UI/UX", "Produk", "Edukasi"],
    roster: [
      { name: "Dian Pratiwi", handle: "dianprt" },
      { name: "Salma Aulia", handle: "salmaaulia" },
    ],
  },
  {
    id: "k6",
    title: "PipelineKu",
    description:
      "Alat visualisasi pipeline data sederhana untuk tim kecil yang belum sanggup bayar Airflow.",
    stages: ["Alpha"],
    interests: ["Backend", "Data Engineering", "Developer Tools"],
    roster: [{ name: "Rizky Fauzan", handle: "rfauzan" }],
  },
  {
    id: "k7",
    title: "Cetak Ulang",
    description:
      "Bot Telegram yang mengarsipkan utas Twitter/X penting sebelum hilang, dengan format PDF yang rapi.",
    stages: ["Konsep", "Prototipe"],
    interests: ["Konten", "Backend", "Open Source"],
    roster: [
      { name: "Alif Hakim", handle: "alifhkm" },
      { name: "Salma Aulia", handle: "salmaaulia" },
    ],
  },
  {
    id: "k8",
    title: "Gizi·Track",
    description:
      "Pencatat nutrisi harian berbasis foto makanan dengan estimasi kalori dari model ML ringan.",
    stages: ["Riset", "Desain", "Development"],
    interests: ["Machine Learning", "Kesehatan", "Mobile"],
    roster: [
      { name: "Farhan Maulana", handle: "farhanml" },
      { name: "Nadia Ramadhani", handle: "nadiarama" },
    ],
  },
];

const ALL_INTERESTS = Array.from(new Set(KARYA.flatMap((k) => k.interests)));
const ALL_SKILLS = Array.from(new Set(MEMBERS.flatMap((m) => m.skills)));

// ─── Utility ─────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── Atom: Tag chip ──────────────────────────────────────────────────────────
function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "0.65rem",
        fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: "0.04em",
        padding: "2px 7px",
        border: `1px solid ${accent ? T.accent : T.line}`,
        borderRadius: 2,
        color: accent ? T.accent : T.ink2,
        background: accent ? T.accentSoft : "transparent",
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
    </span>
  );
}

// ─── Atom: Avatar circle ─────────────────────────────────────────────────────
function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <div
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: T.accentSoft,
        border: `1px solid ${T.line}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.32,
        fontFamily: "'IBM Plex Mono', monospace",
        color: T.accent,
        flexShrink: 0,
        letterSpacing: "-0.02em",
      }}
    >
      {initials(name)}
    </div>
  );
}

// ─── Karya card (horizontal rail variant) ────────────────────────────────────
function KaryaCard({ karya }: { karya: Karya }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 280,
        flexShrink: 0,
        background: hovered ? T.white : "transparent",
        border: `1px solid ${hovered ? T.line : T.line}`,
        borderRadius: 4,
        padding: "20px 22px 18px",
        transition: "background 0.18s ease, box-shadow 0.18s ease",
        boxShadow: hovered ? "0 2px 16px rgba(15,14,11,0.07)" : "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column" as const,
        gap: 12,
      }}
    >
      {/* Title */}
      <div>
        <h3
          style={{
            margin: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 300,
            fontSize: "1.05rem",
            color: T.ink,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          {karya.title}
        </h3>
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.78rem",
          color: T.ink2,
          lineHeight: 1.6,
          flexGrow: 1,
        }}
      >
        {karya.description}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
        {karya.interests.map((t) => (
          <Tag key={t} label={t} />
        ))}
      </div>

      {/* Stage + Roster */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${T.line}`,
          paddingTop: 12,
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.6rem",
            color: T.ink3,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}
        >
          {karya.stages[karya.stages.length - 1]}
        </span>
        <div style={{ display: "flex", gap: -4 }}>
          {karya.roster.slice(0, 3).map((r, i) => (
            <div key={r.handle} style={{ marginLeft: i > 0 ? -8 : 0, position: "relative" as const, zIndex: karya.roster.length - i }}>
              <Avatar name={r.name} size={24} />
            </div>
          ))}
          {karya.roster.length > 3 && (
            <div
              style={{
                marginLeft: -8,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: T.line,
                border: `1px solid ${T.bg}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.55rem",
                color: T.ink2,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              +{karya.roster.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Karya card (search list variant — wider) ────────────────────────────────
function KaryaRow({ karya }: { karya: Karya }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "12px 24px",
        padding: "20px 0",
        borderBottom: `1px solid ${T.line}`,
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 300,
            fontSize: "1rem",
            color: T.ink,
            letterSpacing: "-0.01em",
          }}
        >
          {karya.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.78rem",
            color: T.ink2,
            lineHeight: 1.6,
          }}
        >
          {karya.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 2 }}>
          {karya.interests.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 8, paddingTop: 2 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.6rem",
            color: T.ink3,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}
        >
          {karya.stages[karya.stages.length - 1]}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {karya.roster.map((r) => (
            <Avatar key={r.handle} name={r.name} size={22} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Member card (search result) ─────────────────────────────────────────────
function MemberRow({ member }: { member: Member }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "0 18px",
        padding: "20px 0",
        borderBottom: `1px solid ${T.line}`,
        alignItems: "start",
      }}
    >
      <Avatar name={member.name} size={40} />
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 5 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              fontSize: "0.9rem",
              color: T.ink,
            }}
          >
            {member.name}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.65rem",
              color: T.ink3,
            }}
          >
            @{member.handle}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.6rem",
              color: T.ink3,
              marginLeft: "auto",
            }}
          >
            Thn {member.year} · {member.major}
          </span>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.77rem",
            color: T.ink2,
            lineHeight: 1.6,
          }}
        >
          {member.bio}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 2 }}>
          {member.skills.map((s) => (
            <Tag key={s} label={s} accent />
          ))}
          {member.interests.map((i) => (
            <Tag key={i} label={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Horizontal rail ─────────────────────────────────────────────────────────
function Rail({
  label,
  sublabel,
  items,
}: {
  label: string;
  sublabel?: string;
  items: Karya[];
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
      {/* Rail header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          borderBottom: `1px solid ${T.line}`,
          paddingBottom: 10,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 300,
            fontSize: "0.85rem",
            color: T.ink,
            letterSpacing: "0.01em",
          }}
        >
          {label}
        </h2>
        {sublabel && (
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.6rem",
              color: T.ink3,
              letterSpacing: "0.05em",
            }}
          >
            {sublabel}
          </span>
        )}
      </div>

      {/* Scrollable cards */}
      <div
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto" as const,
          paddingBottom: 4,
          scrollbarWidth: "none" as const,
        }}
      >
        {items.map((k) => (
          <KaryaCard key={k.id} karya={k} />
        ))}
      </div>
    </section>
  );
}

// ─── Top nav ─────────────────────────────────────────────────────────────────
function Nav({
  surface,
  setSurface,
}: {
  surface: "discovery" | "search";
  setSurface: (s: "discovery" | "search") => void;
}) {
  return (
    <header
      style={{
        position: "sticky" as const,
        top: 0,
        zIndex: 100,
        background: T.bg,
        borderBottom: `1px solid ${T.line}`,
        display: "flex",
        alignItems: "center",
        padding: "0 40px",
        height: 52,
        gap: 32,
      }}
    >
      {/* Wordmark */}
      <div
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 300,
          fontSize: "0.9rem",
          color: T.ink,
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ color: T.accent, fontWeight: 600, fontSize: "1rem" }}>
          ●
        </span>
        Al-Fath Berkarya
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: 0, marginLeft: 8 }}>
        {(
          [
            { id: "discovery", label: "Temukan" },
            { id: "search", label: "Cari" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSurface(id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.8rem",
              padding: "0 14px",
              height: 52,
              color: surface === id ? T.ink : T.ink2,
              borderBottom:
                surface === id
                  ? `2px solid ${T.accent}`
                  : "2px solid transparent",
              transition: "color 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Spacer + Identity */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.62rem",
            color: T.ink3,
          }}
        >
          Telkom University
        </span>
        <Avatar name="Alif Hakim" size={28} />
      </div>
    </header>
  );
}

// ─── Discovery surface ────────────────────────────────────────────────────────
function Discovery() {
  const featured = KARYA.filter((k) => ["k1", "k4", "k8"].includes(k.id));
  const recent = [...KARYA].reverse().slice(0, 5);

  // Group by first interest
  const byInterest: Record<string, Karya[]> = {};
  KARYA.forEach((k) => {
    const key = k.interests[0];
    if (!byInterest[key]) byInterest[key] = [];
    byInterest[key].push(k);
  });

  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "44px 40px 80px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 48,
      }}
    >
      {/* Page heading */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 300,
            fontSize: "2.2rem",
            color: T.ink,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          Jelajahi karya
          <br />
          <span style={{ color: T.accentMid }}>mahasiswa Telkom.</span>
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.85rem",
            color: T.ink2,
            marginTop: 8,
            lineHeight: 1.7,
            maxWidth: 480,
          }}
        >
          Proyek nyata dari teman-teman sekampus. Temukan kolaborator, atau
          bagikan karyamu sendiri.
        </p>
      </div>

      {/* Rail: Pilihan inspiratif */}
      <Rail
        label="Pilihan inspiratif"
        sublabel="dikurasi tangan"
        items={featured}
      />

      {/* Rail: Terbaru */}
      <Rail label="Terbaru" sublabel={`${KARYA.length} karya`} items={recent} />

      {/* Rails per minat */}
      {Object.entries(byInterest)
        .filter(([, items]) => items.length >= 1)
        .slice(0, 4)
        .map(([interest, items]) => (
          <Rail
            key={interest}
            label={interest}
            sublabel="per minat"
            items={items}
          />
        ))}
    </main>
  );
}

// ─── Search surface ───────────────────────────────────────────────────────────
function Search() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"karya" | "orang">("karya");
  const [activeInterests, setActiveInterests] = useState<string[]>([]);
  const [activeSkills, setActiveSkills] = useState<string[]>([]);

  function toggleFilter(arr: string[], val: string, set: (v: string[]) => void) {
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
      activeInterests.length === 0 ||
      k.interests.some((i) => activeInterests.includes(i));
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
      activeSkills.length === 0 ||
      m.skills.some((s) => activeSkills.includes(s));
    const matchInterests =
      activeInterests.length === 0 ||
      m.interests.some((i) => activeInterests.includes(i));
    return matchQ && matchSkills && matchInterests;
  });

  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "44px 40px 80px",
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        gap: "0 48px",
        alignItems: "start",
      }}
    >
      {/* ── Sidebar filter ── */}
      <aside
        style={{
          position: "sticky" as const,
          top: 72,
          display: "flex",
          flexDirection: "column" as const,
          gap: 28,
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.07em",
              color: T.ink3,
              textTransform: "uppercase" as const,
            }}
          >
            Minat
          </p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
            {ALL_INTERESTS.map((interest) => {
              const active = activeInterests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() =>
                    toggleFilter(activeInterests, interest, setActiveInterests)
                  }
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left" as const,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.78rem",
                    color: active ? T.accent : T.ink2,
                    padding: "4px 0",
                    fontWeight: active ? 500 : 400,
                    borderLeft: active
                      ? `2px solid ${T.accent}`
                      : "2px solid transparent",
                    paddingLeft: 8,
                    transition: "all 0.12s",
                  }}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {tab === "orang" && (
          <div>
            <p
              style={{
                margin: "0 0 10px",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.07em",
                color: T.ink3,
                textTransform: "uppercase" as const,
              }}
            >
              Keahlian
            </p>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
              {ALL_SKILLS.map((skill) => {
                const active = activeSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() =>
                      toggleFilter(activeSkills, skill, setActiveSkills)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left" as const,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.68rem",
                      color: active ? T.accent : T.ink2,
                      padding: "4px 0",
                      fontWeight: active ? 500 : 400,
                      borderLeft: active
                        ? `2px solid ${T.accent}`
                        : "2px solid transparent",
                      paddingLeft: 8,
                      transition: "all 0.12s",
                    }}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Clear filters */}
        {(activeInterests.length > 0 || activeSkills.length > 0) && (
          <button
            onClick={() => {
              setActiveInterests([]);
              setActiveSkills([]);
            }}
            style={{
              background: "none",
              border: `1px solid ${T.line}`,
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.6rem",
              color: T.ink2,
              padding: "6px 10px",
              borderRadius: 2,
              letterSpacing: "0.04em",
              textAlign: "left" as const,
            }}
          >
            Hapus filter
          </button>
        )}
      </aside>

      {/* ── Results column ── */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>
        {/* Search input */}
        <div style={{ position: "relative" as const }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari karya atau orang…"
            style={{
              width: "100%",
              boxSizing: "border-box" as const,
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${T.ink}`,
              outline: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 300,
              fontSize: "1.6rem",
              color: T.ink,
              padding: "8px 0",
              letterSpacing: "-0.02em",
            }}
          />
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${T.line}`,
            gap: 0,
          }}
        >
          {(
            [
              { id: "karya", label: "Karya" },
              { id: "orang", label: "Orang" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.8rem",
                padding: "10px 18px 10px 0",
                color: tab === id ? T.ink : T.ink2,
                borderBottom:
                  tab === id
                    ? `2px solid ${T.accent}`
                    : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {label}{" "}
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.6rem",
                  color: T.ink3,
                }}
              >
                {id === "karya" ? filteredKarya.length : filteredMembers.length}
              </span>
            </button>
          ))}
        </div>

        {/* Results */}
        {tab === "karya" && (
          <div>
            {filteredKarya.length === 0 ? (
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.85rem",
                  color: T.ink3,
                  padding: "40px 0",
                }}
              >
                Tidak ada karya yang cocok.
              </p>
            ) : (
              filteredKarya.map((k) => <KaryaRow key={k.id} karya={k} />)
            )}
          </div>
        )}

        {tab === "orang" && (
          <div>
            {filteredMembers.length === 0 ? (
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.85rem",
                  color: T.ink3,
                  padding: "40px 0",
                }}
              >
                Tidak ada anggota yang cocok.
              </p>
            ) : (
              filteredMembers.map((m) => <MemberRow key={m.id} member={m} />)
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [surface, setSurface] = useState<"discovery" | "search">("discovery");

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          min-height: 100vh;
          background: ${T.bg};
          color: ${T.ink};
        }

        /* Hide scrollbars on rails */
        ::-webkit-scrollbar { display: none; }

        /* Search input placeholder */
        input::placeholder {
          color: ${T.ink3};
        }

        /* Subtle fade-in on mount */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        main {
          animation: fadeUp 0.35s ease both;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg }}>
        <Nav surface={surface} setSurface={setSurface} />
        {surface === "discovery" ? <Discovery /> : <Search />}
      </div>
    </>
  );
}
