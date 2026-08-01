/**
 * Cari Kolaborator — Variant E · Wall
 *
 * A bulletin board of free-text asks. The first-person note is the visual hero;
 * a composer sits at the top, and the right rail filters by ask type.
 */

import { useState } from "react";
import { Avatar, MainColumn, RailColumn, Tag } from "@myapp/ui";
import { cn } from "@myapp/ui";
import { Shell } from "../../components/Shell";
import { ASKS, TOP_SKILLS, type Ask } from "../../data/asks";
import { LOOKING_FOR, type LookingFor } from "../../data/looking-for";
import { relativeTime } from "../../lib/format";
import { coverFor } from "../../lib/images";
import { Eyebrow } from "@myapp/ui";

/** This variant's wording for the three FR-29 categories. */
const BADGE_LABEL: Record<LookingFor, string> = {
  hackathon: "Tim Hackathon",
  project:   "Tim Project",
  gig:       "Talenta / Gig",
};

/** Shorter forms for the composer chips and filter rail. */
const SHORT_LABEL: Record<LookingFor, string> = {
  hackathon: "Hackathon",
  project:   "Project",
  gig:       "Talenta / Gig",
};

const BADGE_ICON: Record<LookingFor, string> = {
  hackathon: "⚡",
  project:   "◉",
  gig:       "◎",
};

type Filter = LookingFor | "Semua";

// ─── Type Chip — three badge types from the PRD ───────────────────────────────
function TypeChip({ type }: { type: LookingFor }) {
  // hackathon: solid terracotta (urgent, event-bound)
  // project:   near-black outline (substantive, longer-term)
  // gig:       tinted wash (casual, lighter commitment)
  return (
    <span className={cn(
      "inline-flex items-center gap-[3px] rounded-[3px] px-2 py-[2px] font-body text-micro font-medium tracking-tag whitespace-nowrap",
      type === "hackathon" && "bg-accent text-accent-fg border-none",
      type === "project"   && "bg-transparent text-ink border border-line-dark",
      type === "gig"       && "bg-accent-tint text-accent-mid border border-accent-line",
    )}>
      <span aria-hidden="true">{BADGE_ICON[type]}</span>
      {BADGE_LABEL[type]}
    </span>
  );
}

// ─── Karya Cover — small square thumbnail for karya-sourced asks ──────────────
function KaryaCover({ interests, size = 34 }: { interests: string[]; size?: number }) {
  return (
    // `size` is the art; the box carries the 1px ring
    <div
      className="shrink-0 overflow-hidden rounded-[9px] border border-line"
      style={{ width: size + 2, height: size + 2 }}
    >
      <img
        src={coverFor(interests)}
        alt=""
        aria-hidden="true"
        className="block h-full w-full object-cover"
      />
    </div>
  );
}

// ─── Hackathon Banner — FR-29 event-scoped team-formation affordance ──────────
// Sits above the composer as an ambient awareness strip for the current hot event.
function HackathonBanner() {
  return (
    <section aria-label="Event hackathon aktif" className="mb-4 flex items-center gap-3.5 rounded-panel border border-accent-line bg-accent-tint p-3.5">
      <span aria-hidden="true" className="shrink-0 text-[20px] leading-none">⚡</span>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 font-body text-ui font-medium text-ink">
          Lagi rame:{" "}
          <span className="text-accent">GEMASTIK 2026</span>{" "}
          — pendaftaran tim terbuka sampai 12 Juli
        </div>
        <div className="font-body text-micro text-ink3">
          4 ajakan hackathon aktif · Kategori: Sistem Informasi, Kecerdasan Buatan, Keamanan Siber
        </div>
      </div>
      <button className="shrink-0 cursor-pointer whitespace-nowrap rounded-card border border-accent bg-transparent px-3.5 py-1.5 font-body text-ui font-semibold text-accent">
        Cari Rekan
      </button>
    </section>
  );
}

// ─── Composer — fake "Tulis ajakan…" posting box at the top of the board ──────
// Gives the wall a postable feel. Type chips are interactive; the input is not.
function Composer() {
  const [selectedType, setSelectedType] = useState<LookingFor | null>(null);

  return (
    <div className="mb-5 rounded-panel border-[1.5px] border-line-dark bg-surface p-3.5">
      {/* Input row */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <Avatar name="Zaki Nadhif" size={32} />
        <div className="flex-1 cursor-text rounded-card border border-line bg-bg px-3 py-[9px] font-body text-body leading-heading text-ink3">
          Tulis ajakan kamu — siapa atau apa yang lagi kamu cari?
        </div>
      </div>

      {/* Type selector + post button */}
      <div className="flex items-center gap-1.5 pl-[42px]">
        <Eyebrow as="span" className="mr-1">Cari:</Eyebrow>
        {LOOKING_FOR.map((type) => {
          const active = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(active ? null : type)}
              aria-pressed={active}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 font-body text-micro transition-all duration-[120ms]",
                active
                  ? "border-accent bg-accent-tint font-medium text-accent"
                  : "border-line bg-transparent font-normal text-ink2",
              )}
            >
              <span aria-hidden="true">{BADGE_ICON[type]}</span>
              {SHORT_LABEL[type]}
            </button>
          );
        })}
        <button className="ml-auto shrink-0 cursor-pointer whitespace-nowrap rounded-card border-none bg-accent px-4.5 py-1.5 font-body text-ui font-semibold text-accent-fg">
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
const PRIMARY_ACTION: Record<LookingFor, string> = {
  hackathon: "Gabung Tim",
  project:   "Bantu",
  gig:       "Saya Tertarik",
};

function AskCard({ ask }: { ask: Ask }) {
  return (
    <article className="border-b border-line py-5">
      {/* Header: identity left, type+time right */}
      <div className="mb-3 flex items-start justify-between gap-2.5">
        {/* Identity block */}
        <div className="flex min-w-0 items-center gap-[9px]">
          {ask.from === "person"
            ? <Avatar name={ask.name!} size={34} />
            : <KaryaCover interests={ask.karyaInterests!} size={34} />
          }
          <div className="min-w-0">
            {ask.from === "person" ? (
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-body text-body font-medium text-ink">
                  {ask.name}
                </span>
                <span className="font-body text-micro text-ink3">
                  {ask.handle}
                </span>
              </div>
            ) : (
              <>
                <div className="font-display text-body font-normal leading-heading text-ink">
                  {ask.karyaTitle}
                </div>
                <div className="font-body text-micro text-ink3">
                  {ask.karyaRoster}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Type chip + timestamp */}
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          <TypeChip type={ask.type} />
          <span className="font-body text-micro text-ink3">
            {relativeTime(ask.hoursAgo)}
          </span>
        </div>
      </div>

      {/* Hero note — the free-text ask written in the community's voice */}
      <p className="mb-3 mt-0 font-body text-stat font-normal leading-body text-ink">
        {ask.note}
      </p>

      {/* Skills / open roles sought */}
      {ask.seeking.length > 0 && (
        <div className="mb-3.5 flex flex-wrap items-center gap-1.5">
          <span className="font-body text-micro tracking-tag uppercase text-ink3">
            butuh:
          </span>
          {ask.seeking.map((s) => <Tag key={s} label={s} accent />)}
        </div>
      )}

      {/* Two inline connect actions */}
      <div className="flex gap-2">
        <button className="cursor-pointer whitespace-nowrap rounded-card border-none bg-accent px-4.5 py-[7px] font-body text-ui font-semibold text-accent-fg">
          {PRIMARY_ACTION[ask.type]}
        </button>
        <button className="cursor-pointer whitespace-nowrap rounded-card border border-line bg-transparent px-4 py-[7px] font-body text-ui font-normal text-ink2">
          Kirim Pesan
        </button>
      </div>
    </article>
  );
}

// ─── Bulletin Board — center column ───────────────────────────────────────────
function BulletinBoard({ filterType }: { filterType: Filter }) {
  const filtered = filterType === "Semua"
    ? ASKS
    : ASKS.filter((a) => a.type === filterType);

  return (
    <MainColumn className="flex flex-col">
      {/* Page heading */}
      <div className="mb-[18px]">
        <div className="flex items-baseline gap-2.5">
          <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">
            Cari Kolaborator
          </h1>
          <span className="font-body text-caption text-ink3">
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
        <Eyebrow as="div" className="mb-0.5">
          {filtered.length} ajakan · terbaru dulu
        </Eyebrow>
        {filtered.length === 0 ? (
          <div className="py-10 text-center font-body text-body text-ink3">
            Belum ada ajakan untuk jenis ini — atau jadilah yang pertama 🙂
          </div>
        ) : (
          filtered.map((ask) => <AskCard key={ask.id} ask={ask} />)
        )}
      </div>
    </MainColumn>
  );
}

// ─── Filter Rail — right column ────────────────────────────────────────────────
// Filter by ask type + community pulse + top skills being sought.
function FilterRail({ filterType, onFilter }: {
  filterType: Filter;
  onFilter: (t: Filter) => void;
}) {
  const counts: Record<Filter, number> = {
    Semua:     ASKS.length,
    hackathon: ASKS.filter((a) => a.type === "hackathon").length,
    project:   ASKS.filter((a) => a.type === "project").length,
    gig:       ASKS.filter((a) => a.type === "gig").length,
  };

  const filterOpts: { key: Filter; icon: string; label: string }[] = [
    { key: "Semua", icon: "◐", label: "Semua" },
    ...LOOKING_FOR.map((b) => ({ key: b as Filter, icon: BADGE_ICON[b], label: SHORT_LABEL[b] })),
  ];

  return (
    <RailColumn className="flex flex-col gap-5">
      {/* Filter by type */}
      <div className="rounded-panel border border-line bg-surface p-3 py-3.5">
        <Eyebrow as="div" className="mb-2.5">Filter Ajakan</Eyebrow>
        <div className="flex flex-col gap-0.5">
          {filterOpts.map(({ key, icon, label }) => {
            const active = filterType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onFilter(key)}
                aria-pressed={active}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-[4px] border-none p-1.5 px-2 text-left font-body text-ui transition-[background,color] duration-[120ms]",
                  active
                    ? "bg-accent-tint font-medium text-accent"
                    : "bg-transparent font-normal text-ink2",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="text-caption">{icon}</span>
                  {label}
                </span>
                <span className={cn(
                  "font-body text-caption",
                  active ? "text-accent-mid" : "text-ink3",
                )}>
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Community pulse */}
      <div className="rounded-panel border border-line bg-surface p-3 py-3.5">
        <Eyebrow as="div" className="mb-2.5">Denyut Papan</Eyebrow>
        <div className="flex flex-col gap-2">
          {[
            { label: "Ajakan aktif", value: ASKS.length },
            { label: "Dari orang",   value: ASKS.filter((a) => a.from === "person").length },
            { label: "Dari karya",   value: ASKS.filter((a) => a.from === "karya").length },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline justify-between">
              <span className="font-body text-ui text-ink2">{stat.label}</span>
              <span className="font-body text-body font-medium text-ink">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top skills currently sought — aggregated from ASKS data */}
      <div>
        <Eyebrow as="div" className="mb-2.5">Paling Dicari</Eyebrow>
        <div className="flex flex-col gap-1.5">
          {TOP_SKILLS.map(([skill, count]) => (
            <div key={skill} className="flex items-center gap-2">
              <span className="flex-1 min-w-0 font-body text-ui text-ink2">
                {skill}
              </span>
              {/* Proportional bar. The 1px outline is part of the bar's drawn
                  size, so the box carries it */}
              <div
                className="h-1.5 rounded-[2px] border border-accent-line bg-accent-tint shrink-0"
                style={{
                  width: `${Math.max(8, Math.round((count / ASKS.length) * 64)) + 2}px`,
                }}
              />
              <span className="min-w-[10px] text-right font-body text-micro text-ink3">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA — mirrors Launchpad's right rail accent block */}
      <div className="bg-accent rounded-panel p-3.5 py-4">
        <div className="font-body text-body font-light leading-compact text-accent-fg mb-2.5">
          Punya ajakan? Tulis di papan — komunitas siap merespons.
        </div>
        <button className="w-full cursor-pointer rounded-card border-none bg-accent-fg px-3.5 py-1.5 font-body text-ui font-semibold text-accent">
          Tulis Ajakan
        </button>
      </div>

      {/* ── GEMASTIK quick link ───────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 rounded-panel border border-accent-line bg-accent-tint p-3.5">
        <span aria-hidden="true" className="text-body text-accent">◈</span>
        <div className="min-w-0 flex-1">
          <div className="font-body text-ui font-medium text-ink">
            GEMASTIK 2026
          </div>
          <div className="font-body text-micro text-accent-mid">
            12 tim sedang terbentuk
          </div>
        </div>
      </div>
    </RailColumn>
  );
}

export default function VariantE() {
  const [filterType, setFilterType] = useState<Filter>("Semua");

  return (
    <Shell active="cari">
      <BulletinBoard filterType={filterType} />
      <FilterRail filterType={filterType} onFilter={setFilterType} />
    </Shell>
  );
}
