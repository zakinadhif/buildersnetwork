/**
 * Al-Fath Berkarya — Karya
 * The project surface, repurposed in place from the old Launchpad once its feed
 * role moved to Scroll (#collapse 4→3). This is a transitional state: the screen
 * is renamed and the directory search now lives in the right pane, but the old
 * feed-only pieces are kept for now, each tagged `FEED-ONLY` so they are easy to
 * find and strip when the directory is finalised:
 *   - the seeker on-ramp (belongs to Scroll/home),
 *   - the per-card activity line (Scroll owns "what's new"),
 *   - the recency ordering (a feed trait; a directory would order neutrally).
 * (The "builders to meet" rail has already moved to People, its rightful home.)
 */

import { useState } from "react";
import { KaryaCard, Tag, MainColumn, RailColumn } from "@myapp/ui";
import { NavFilterList } from "../components/LeftNav";
import { Shell } from "../components/Shell";
import { KARYA, type Karya } from "../data/karya";
import { relativeTime } from "../lib/format";
import { coverFor, screenshots } from "../lib/images";
import { T } from "@myapp/design-tokens";
import { Eyebrow } from "@myapp/ui";

const INTEREST_FILTERS = ["Semua", "Web", "Mobile", "AI/ML", "Desain", "UMKM", "Edukasi", "Komunitas"] as const;
type Interest = (typeof INTEREST_FILTERS)[number];

// ─── Quiet appreciation toggle — a warm signal, never a ranking input ───────────
function AppreciateButton({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Apresiasi (${count})`}
      className={[
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-[11px] py-[5px] font-body text-caption font-medium transition-all duration-150",
        active
          ? "border-accent bg-accent-tint text-accent"
          : "border-line bg-transparent text-ink2",
      ].join(" ")}
    >
      <span className="text-ui leading-none">{active ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}

// ─── Catalog card — a karya as a directory entry ────────────────────────────────
function CatalogCard({ karya, appreciated, onAppreciate }: { karya: Karya; appreciated: boolean; onAppreciate: (id: number) => void }) {
  return (
    <KaryaCard
      cover={coverFor(karya.interests)}
      title={karya.title}
      description={karya.description}
      // FEED-ONLY: the activity line is Scroll's job; a directory entry states what
      // a karya *is*, not what's newest about it. Drop when the directory finalises.
      activity={{ text: karya.lastActivity.text, time: relativeTime(karya.lastActivity.hoursAgo) }}
      stages={karya.stages.map((s) => ({ label: s, accent: s === "Cari Kolaborator" }))}
      interests={karya.interests}
      roster={karya.roster.map((r) => ({ key: r.handle, name: r.name }))}
      screenshots={karya.landscapeScreenshots?.map((src, i) => ({
        key: src,
        src,
        alt: `${karya.title} — layar ${i + 1}`,
      }))}
      appreciate={
        <AppreciateButton
          count={karya.appreciations + (appreciated ? 1 : 0)}
          active={appreciated}
          onClick={() => onAppreciate(karya.id)}
        />
      }
    />
  );
}

// ─── Spotlight (Play-Store-style featured listing) ─────────────────────────────
function SpotlightMetric({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="flex-1 px-1 text-center">
      <div className={["font-body text-stat font-medium leading-heading mb-[3px]", accent ? "text-accent" : "text-ink"].join(" ")}>
        {value}
      </div>
      <Eyebrow as="div">{label}</Eyebrow>
    </div>
  );
}

function Spotlight({ karya }: { karya: Karya }) {
  const builders = karya.roster.map((r) => r.name).join(" · ");
  const latestStage = karya.stages[karya.stages.length - 1];

  return (
    <section className="mb-[18px] overflow-hidden rounded-panel border border-accent bg-surface shadow-[0_0_0_1px_oklch(39%_0.085_62_/_0.133),0_4px_16px_#0f0e0b10]">
      {/* Accent header band */}
      <Eyebrow as="div" className="bg-accent px-[18px] py-1 !text-accent-fg">
        <span aria-hidden="true">◈</span> Pilihan Minggu Ini
      </Eyebrow>

      {/* App header */}
      <div className="flex items-center gap-3.5 px-[18px] pb-3.5 pt-4">
        {/* App icon */}
        <div
          aria-hidden="true"
          className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[15px] font-body text-[26px] font-medium text-accent-fg shadow-[0_2px_8px_var(--color-accent)_/_0.2]"
          style={{ background: `linear-gradient(145deg, ${T.accentMid}, ${T.accent})` }}
        >
          {karya.title.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="mb-[3px] font-display text-feature font-normal leading-heading text-ink">{karya.title}</h2>
          <div className="mb-[5px] font-body text-ui font-medium text-accent-mid">
            oleh {builders}
          </div>
          <div className="flex flex-wrap gap-1">
            {karya.interests.map((i) => <Tag key={i} label={i} />)}
          </div>
        </div>
        <button className="self-start cursor-pointer rounded-card border-none bg-accent px-5 py-[9px] font-body text-ui font-semibold whitespace-nowrap text-accent-fg">
          Lihat Karya
        </button>
      </div>

      {/* Play-Store-style metrics strip */}
      <div className="mx-[18px] flex items-stretch border-y border-line px-3 py-[11px]">
        <SpotlightMetric value={`♥ ${karya.appreciations}`} label="Apresiasi" accent />
        <div className="w-px bg-line" />
        <SpotlightMetric value={`${karya.roster.length}`} label="Builder" />
        <div className="w-px bg-line" />
        <SpotlightMetric value={latestStage} label="Tahap" />
      </div>

      {/* Tagline */}
      <p className="m-0 px-[18px] pb-3 pt-3.5 font-body text-body leading-body text-ink2">
        {karya.description}
      </p>

      {/* Screenshot gallery */}
      <div className="flex items-baseline justify-between px-[18px] pb-2">
        <Eyebrow as="span">Tangkapan Layar</Eyebrow>
        <span className="font-body text-micro text-ink3">← geser →</span>
      </div>
      <div
        className="spotlight-carousel flex gap-3 overflow-x-auto px-[18px] pb-[18px]"
        style={{ scrollSnapType: "x mandatory", scrollPaddingLeft: 18 }}
      >
        {screenshots.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${karya.title} — tangkapan layar ${i + 1}`}
            className="h-[364px] w-auto shrink-0 rounded-[18px] border-2 border-line-dark bg-bg shadow-[0_2px_10px_#0f0e0b14]"
            style={{ scrollSnapAlign: "start" }}
          />
        ))}
      </div>
    </section>
  );
}

// ─── FEED-ONLY: Seeker on-ramp — calm entry to the onboarding agent ─────────────
// Belongs to Scroll/home, not the project directory. Kept here for now; lift out
// when the surfaces settle.
function SeekerRamp() {
  return (
    <section className="mb-[18px] flex items-center gap-3.5 rounded-panel border border-accent-line bg-accent-tint px-[18px] py-3.5">
      <div aria-hidden="true" className="shrink-0 font-display text-[28px] leading-none text-accent">✦</div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-title font-normal leading-heading text-ink mb-0.5">
          Belum tahu mau bikin apa?
        </div>
        <div className="font-body text-body leading-body text-ink2">
          Ngobrol sebentar sama asisten — kita cari arah yang pas buat kamu.
        </div>
      </div>
      <button className="shrink-0 cursor-pointer rounded-card border border-accent bg-transparent px-4 py-2 font-body text-ui font-semibold whitespace-nowrap text-accent">
        Mulai cari arah →
      </button>
    </section>
  );
}

// ─── Center — the catalog ───────────────────────────────────────────────────────
function Catalog({ filter, query, appreciated, onAppreciate }: {
  filter: Interest;
  query: string;
  appreciated: Set<number>;
  onAppreciate: (id: number) => void;
}) {
  const q = query.trim().toLowerCase();
  const matched = KARYA.filter((k) => {
    const matchInterest = filter === "Semua" ? true : k.interests.some((i) => i === filter);
    const matchQuery =
      !q ||
      k.title.toLowerCase().includes(q) ||
      k.description.toLowerCase().includes(q) ||
      k.interests.some((i) => i.toLowerCase().includes(q));
    return matchInterest && matchQuery;
  });

  const spotlight = matched.find((k) => k.featured);
  // FEED-ONLY: recency ordering is a feed trait; a finalised directory would order
  // neutrally (e.g. alphabetical). Reverted to newest-first for now.
  const rest = matched
    .filter((k) => k.id !== spotlight?.id)
    .sort((a, b) => a.lastActivity.hoursAgo - b.lastActivity.hoursAgo);

  return (
    <MainColumn className="flex flex-col gap-0">
      {/* Header */}
      <div className="mb-[18px]">
        <div className="flex items-baseline gap-2.5">
          <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">Karya</h1>
          <span className="font-body text-caption text-ink3">Katalog karya komunitas — temukan yang menarik buat kamu</span>
        </div>
      </div>

      {/* FEED-ONLY: seeker on-ramp */}
      <SeekerRamp />

      {/* Featured pick */}
      {spotlight && <Spotlight karya={spotlight} />}

      {/* Full catalog */}
      {matched.length === 0 ? (
        <div className="py-8 text-center font-body text-body text-ink3">
          Tidak ada karya yang cocok — coba minat lain atau kata kunci berbeda.
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          <div className="mb-0.5 mt-1 flex items-baseline justify-between">
            <Eyebrow as="span">Semua karya</Eyebrow>
            <span className="font-body text-micro tabular-nums text-ink3">{matched.length} karya</span>
          </div>
          {rest.map((k) => (
            <CatalogCard key={k.id} karya={k} appreciated={appreciated.has(k.id)} onAppreciate={onAppreciate} />
          ))}
        </div>
      )}

      {/* Submit CTA — making a karya belongs on the karya surface */}
      <div className="mt-5 flex items-center justify-between gap-3 rounded-panel border-[1.5px] border-dashed border-line-dark px-5 py-4">
        <div>
          <div className="mb-0.5 font-body text-body font-medium text-ink">Punya karya baru?</div>
          <div className="font-body text-ui text-ink2">Tambahkan ke katalog — komunitas senang lihat progresmu, sekecil apa pun.</div>
        </div>
        <button className="cursor-pointer whitespace-nowrap rounded-card border-none bg-accent px-4 py-2 font-body text-ui font-semibold text-accent-fg">
          Bikin Karya
        </button>
      </div>
    </MainColumn>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────
function RightRail({ query, onQuery, filter, onFilter }: {
  query: string;
  onQuery: (q: string) => void;
  filter: Interest;
  onFilter: (f: Interest) => void;
}) {
  return (
    <RailColumn className="flex flex-col gap-5">
      {/* Directory search — the catalog's own search, moved out of the reading column */}
      <div>
        <Eyebrow as="div" className="mb-2">Cari karya</Eyebrow>
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Nama, deskripsi, minat…"
          aria-label="Cari karya"
          className="w-full rounded-card border border-line bg-surface px-[11px] py-[7px] font-body text-ui text-ink outline-none placeholder:text-ink3"
        />
      </div>

      {/* Interest filter — moved here from the left nav */}
      <NavFilterList
        label="Filter Minat"
        options={INTEREST_FILTERS.map((f) => ({ value: f, label: f }))}
        active={filter}
        onSelect={onFilter}
      />

      {/* A "Denyut komunitas" community-stats panel used to sit here; removed
          while we rethink what the rail should carry. */}

      {/* Call to join */}
      <div className="rounded-panel bg-accent px-4 py-3.5">
        <div className="mb-2.5 font-body text-body font-light leading-compact text-accent-fg">
          Bergabung sebagai builder Telkom University.
        </div>
        <button className="w-full cursor-pointer rounded-card border-none bg-accent-fg px-3.5 py-1.5 font-body text-ui font-semibold text-accent">
          Daftar Sekarang
        </button>
      </div>
    </RailColumn>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function KaryaScreen() {
  const [filter, setFilter] = useState<Interest>("Semua");
  const [query, setQuery] = useState("");
  const [appreciated, setAppreciated] = useState<Set<number>>(new Set());

  function toggleAppreciate(id: number) {
    setAppreciated((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <Shell active="karya">
      <Catalog filter={filter} query={query} appreciated={appreciated} onAppreciate={toggleAppreciate} />
      <RightRail query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} />
    </Shell>
  );
}
