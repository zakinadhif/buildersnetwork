/**
 * Cari Kolaborator — Variant B · Intent
 *
 * One board, sectioned by *intent* rather than by entity type. Each section
 * interleaves person cards and karya cards so both share every row of the grid.
 */

import { useState } from "react";
import { Avatar, MainColumn, RailColumn, Tag } from "@myapp/ui";
import { cn } from "@myapp/ui";
import { NavFilterList } from "../../components/LeftNav";
import { Shell } from "../../components/Shell";
import {
  HACKATHON_EVENT,
  KARYA_SEEKERS,
  PEOPLE_SEEKERS,
  type KaryaSeeker,
  type PersonSeeker,
} from "../../data/intent";
import { LOOKING_FOR, type LookingFor } from "../../data/looking-for";
import { coverFor } from "../../lib/images";
import { Eyebrow } from "@myapp/ui";

/** This variant's wording for the three FR-29 categories. */
const BADGE_LABEL: Record<LookingFor, string> = {
  hackathon: "Tim Hackathon",
  project:   "Tim Project",
  gig:       "Talenta/Gig",
};

const BADGE_ICON: Record<LookingFor, string> = {
  hackathon: "◈",
  project:   "◉",
  gig:       "◇",
};

type Section = LookingFor | "Semua";

// ─── Badge Pill ───────────────────────────────────────────────────────────────
// Three visual weights: hackathon = solid accent (urgent), project = tinted,
// gig = ghost (lowest friction). All within the existing token set.
function BadgePill({ badge }: { badge: LookingFor }) {
  return (
    <span className={cn(
      "inline-block whitespace-nowrap rounded-full border px-2 py-[2px] font-body text-micro font-medium tracking-tag",
      badge === "hackathon" && "border-accent bg-accent text-accent-fg",
      badge === "project"   && "border-accent-line bg-accent-tint text-accent",
      badge === "gig"       && "border-line-dark bg-transparent text-ink2",
    )}>
      {BADGE_LABEL[badge]}
    </span>
  );
}

// Inline action button — two variants: primary (filled) and ghost (outline).
function ActionBtn({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <button className={cn(
      "inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border px-3 py-[5px] font-body text-caption font-medium transition-all duration-150",
      primary
        ? "border-accent bg-accent text-accent-fg"
        : "border-line bg-transparent text-ink2",
    )}>
      {label}
    </button>
  );
}

// ─── Hackathon Event Banner (FR-29) ───────────────────────────────────────────
// Event-scoped team-formation affordance. Heads the hackathon section.
function HackathonBanner() {
  return (
    <div className="mb-4 flex items-center gap-4 rounded-panel border border-accent-line bg-accent-tint px-[18px] py-3.5">
      <div aria-hidden="true" className="shrink-0 font-display text-[28px] leading-none text-accent">◈</div>
      <div className="min-w-0 flex-1">
        <div className="mb-[3px] flex flex-wrap items-center gap-2">
          <span className="font-display text-title font-normal leading-heading text-ink">{HACKATHON_EVENT.name}</span>
          <Eyebrow as="span" className="!text-accent-mid">lagi bentuk tim</Eyebrow>
        </div>
        <div className="font-body text-body leading-compact text-ink2">
          {HACKATHON_EVENT.theme} ·{" "}
          <span className="font-medium text-accent-mid">{HACKATHON_EVENT.teamsForming} tim</span>{" "}
          sedang terbentuk · Deadline{" "}
          <span className="font-medium text-ink">{HACKATHON_EVENT.deadline}</span>
        </div>
      </div>
      <button className="shrink-0 cursor-pointer whitespace-nowrap rounded-card border-none bg-accent px-3.5 py-[7px] font-body text-ui font-semibold text-accent-fg">
        Cari Tim →
      </button>
    </div>
  );
}

// ─── Person Seeker Card ───────────────────────────────────────────────────────
function PersonSeekerCard({ person }: { person: PersonSeeker }) {
  return (
    <article className="flex flex-col gap-2.5 rounded-panel border border-line bg-surface p-4">
      {/* Header: avatar + name + badge */}
      <div className="flex items-start gap-3">
        <Avatar name={person.name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
            <span className="font-body text-body font-medium text-ink">{person.name}</span>
            <span className="font-body text-micro text-ink3">{person.handle}</span>
          </div>
          <div className="mb-[5px] font-body text-micro text-ink3">
            Tkt {person.year} · {person.major}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <BadgePill badge={person.badge} />
            <Eyebrow as="span">orang</Eyebrow>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="m-0 font-body text-body leading-body text-ink2">{person.bio}</p>

      {/* Note / seeking context — quoted, tinted */}
      <div className="rounded-card border border-accent-line bg-accent-tint px-3 py-2 font-body text-ui italic leading-body text-ink">
        "{person.note}"
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1">
        {person.skills.map((s) => <Tag key={s} label={s} accent />)}
      </div>

      {/* Current karya + connect actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-0.5">
        <div className="font-body text-micro text-ink3">
          {person.currentKarya ? (
            <>
              di{" "}
              <span className="font-medium text-accent-mid">{person.currentKarya}</span>
            </>
          ) : (
            <em>belum punya karya aktif</em>
          )}
        </div>
        <div className="flex gap-1.5">
          <ActionBtn label="Ajak ke Karya" primary />
          <ActionBtn label="Kirim Pesan" />
        </div>
      </div>
    </article>
  );
}

// ─── Karya Seeker Card ────────────────────────────────────────────────────────
function KaryaSeekerCard({ karya }: { karya: KaryaSeeker }) {
  return (
    <article className="flex flex-col gap-2.5 rounded-panel border border-line bg-surface p-4">
      {/* Header: cover + title + badge */}
      <div className="flex items-start gap-3">
        {/* 48px of art + a 1px ring */}
        <div className="h-[50px] w-[50px] shrink-0 overflow-hidden rounded-[12px] border border-line">
          <img
            src={coverFor(karya.interests)}
            alt={karya.title}
            loading="lazy"
            className="block h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 mt-0 font-display text-title font-normal leading-heading text-ink">{karya.title}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <BadgePill badge={karya.badge} />
            <Eyebrow as="span">karya</Eyebrow>
            <Tag label={karya.stage} />
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="m-0 font-body text-body leading-body text-ink2">{karya.description}</p>

      {/* Open roles — the key field */}
      <div className="flex flex-wrap items-baseline gap-2 rounded-card border border-accent-line bg-accent-tint px-3 py-2">
        <Eyebrow as="span" className="!text-accent-mid">butuh</Eyebrow>
        <span className="font-body text-ui font-medium text-ink">
          {karya.openRoles.join(" · ")}
        </span>
      </div>

      {/* Interests */}
      <div className="flex flex-wrap gap-1">
        {karya.interests.map((t) => <Tag key={t} label={t} />)}
      </div>

      {/* Roster + actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-0.5">
        {/* Roster avatars */}
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {karya.roster.slice(0, 4).map((r, idx) => (
              <span key={r.handle} style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: karya.roster.length - idx }}>
                <Avatar name={r.name} size={22} />
              </span>
            ))}
          </div>
          <span className="font-body text-micro text-ink3">{karya.roster.length} builder</span>
        </div>
        <div className="flex gap-1.5">
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

/**
 * Interleaving (person, karya, person…) means both card types share every row
 * of the grid, reinforcing that the section is about *intent*, not type.
 */
function buildItems(badge: LookingFor): CardItem[] {
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

function IntentSection({ badge, items, showBanner }: {
  badge: LookingFor;
  items: CardItem[];
  showBanner?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mb-8">
      {/* Section heading */}
      <div className="mb-3.5 flex items-center gap-2.5 border-b border-line pb-2.5">
        <span aria-hidden="true" className="text-body text-accent">{BADGE_ICON[badge]}</span>
        <h2 className="m-0 font-display text-title font-normal text-ink">{BADGE_LABEL[badge]}</h2>
        <span className="ml-auto font-body text-micro text-ink3">{items.length} entri</span>
      </div>

      {/* FR-29: event banner for hackathon section */}
      {showBanner && <HackathonBanner />}

      {/* 2-column card grid */}
      <div className="cari-grid grid grid-cols-2 items-start gap-3">
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
  activeSection: Section;
  onSection: (s: Section) => void;
}) {
  const visible = activeSection === "Semua"
    ? LOOKING_FOR
    : LOOKING_FOR.filter((b) => b === activeSection);

  const tabs: { value: Section; icon: string; label: string }[] = [
    { value: "Semua", icon: "◎", label: "Semua" },
    ...LOOKING_FOR.map((b) => ({ value: b as Section, icon: BADGE_ICON[b], label: BADGE_LABEL[b] })),
  ];

  return (
    <MainColumn className="flex flex-col">
      {/* Heading */}
      <div className="mb-5">
        <h1 className="mb-1 mt-0 font-display text-display font-normal tracking-heading text-ink">
          Cari Kolaborator
        </h1>
        <p className="m-0 font-body text-body leading-body text-ink2">
          Semua yang lagi nyari — tim hackathon, partner project, atau talenta gig — ada di sini.
        </p>
      </div>

      {/* Jump / section filter nav */}
      <div className="mb-6 flex self-start gap-1 rounded-full bg-line p-[3px]">
        {tabs.map((tab) => {
          const active = activeSection === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onSection(tab.value)}
              aria-pressed={active}
              className={cn(
                "flex cursor-pointer items-center gap-[5px] whitespace-nowrap rounded-full border-none px-3.5 py-[5px] font-body text-ui transition-[background,color] duration-[120ms]",
                active
                  ? "bg-surface font-medium text-ink shadow-[0_1px_3px_oklch(0%_0_0_/_8%)]"
                  : "bg-transparent font-normal text-ink2",
              )}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Intent sections */}
      {visible.map((badge) => (
        <IntentSection
          key={badge}
          badge={badge}
          items={buildItems(badge)}
          showBanner={badge === "hackathon"}
        />
      ))}

      {/* CTA: post your own seeking status */}
      <div className="mt-1 flex items-center justify-between gap-3 rounded-panel border-[1.5px] border-dashed border-line-dark px-5 py-4">
        <div>
          <div className="mb-0.5 font-body text-body font-medium text-ink">
            Kamu juga lagi nyari sesuatu?
          </div>
          <div className="font-body text-ui text-ink2">
            Pasang dirimu di papan — ceritakan apa yang kamu cari.
          </div>
        </div>
        <button className="cursor-pointer whitespace-nowrap rounded-card border-none bg-accent px-4 py-2 font-body text-ui font-semibold text-accent-fg">
          Pasang Status
        </button>
      </div>
    </MainColumn>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────
// The user's own seeking status (interactive toggle) + board pulse stats.
function RightRail() {
  const [seeking, setSeeking] = useState<LookingFor | null>(null);

  // Count entries per badge type (people + karya combined)
  const pulse = LOOKING_FOR.map((b) => ({
    badge: b,
    count:
      PEOPLE_SEEKERS.filter((p) => p.badge === b).length +
      KARYA_SEEKERS.filter( (k) => k.badge === b).length,
  }));

  const totalSeeking = PEOPLE_SEEKERS.length + KARYA_SEEKERS.length;

  return (
    <RailColumn className="flex flex-col gap-5">
      {/* ── User's own seeking status ─────────────────────────────────── */}
      <div className="rounded-panel border border-line bg-surface p-3.5">
        <Eyebrow as="div" className="mb-2.5">Status kamu</Eyebrow>
        {seeking ? (
          <>
            <div className="mb-2">
              <BadgePill badge={seeking} />
            </div>
            <div className="mb-2.5 font-body text-ui leading-body text-ink2">
              Profilmu muncul di papan sebagai{" "}
              <span className="font-medium text-ink">{BADGE_LABEL[seeking]}</span>.
            </div>
            <button
              onClick={() => setSeeking(null)}
              className="w-full cursor-pointer rounded-card border border-line bg-none px-2.5 py-[5px] font-body text-micro tracking-tag text-ink2"
            >
              Ubah status
            </button>
          </>
        ) : (
          <>
            <div className="mb-2.5 font-body text-ui leading-body text-ink2">
              Kamu lagi nyari apa?
            </div>
            <div className="flex flex-col gap-1.5">
              {LOOKING_FOR.map((b) => (
                <button
                  key={b}
                  onClick={() => setSeeking(b)}
                  className="flex cursor-pointer items-center justify-between rounded-card border border-line bg-bg px-2.5 py-[7px] text-left font-body text-ui text-ink2 transition-[border-color] duration-[120ms]"
                >
                  <span>{BADGE_LABEL[b]}</span>
                  <span className="text-ink3">→</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Board pulse ───────────────────────────────────────────────── */}
      <div className="rounded-panel border border-line bg-surface p-3.5">
        <Eyebrow as="div" className="mb-2.5">Papan sekarang</Eyebrow>
        <div className="mb-0.5 font-body text-stat font-medium leading-heading text-ink">
          {totalSeeking}
        </div>
        <div className="mb-3 font-body text-ui text-ink2">orang &amp; karya sedang mencari</div>
        <div className="flex flex-col gap-[7px]">
          {pulse.map((row) => (
            <div key={row.badge} className="flex items-baseline justify-between">
              <span className="font-body text-ui text-ink2">{BADGE_LABEL[row.badge]}</span>
              <span className="font-body text-body font-medium tabular-nums text-ink">{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Open-a-role CTA ───────────────────────────────────────────── */}
      <div className="rounded-panel border-[1.5px] border-dashed border-line-dark p-3.5">
        <div className="mb-1 font-body text-body font-medium text-ink">
          Karya butuh orang?
        </div>
        <div className="mb-2.5 font-body text-ui leading-body text-ink2">
          Pasang karya kamu di sini — kasih tahu komunitas role apa yang lagi terbuka.
        </div>
        <button className="w-full cursor-pointer rounded-card border-none bg-accent px-3.5 py-1.5 font-body text-ui font-semibold text-accent-fg">
          Buka Lowongan
        </button>
      </div>

      {/* ── GEMASTIK quick link ───────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 rounded-panel border border-accent-line bg-accent-tint p-3.5">
        <span aria-hidden="true" className="text-body text-accent">◈</span>
        <div className="min-w-0 flex-1">
          <div className="font-body text-ui font-medium text-ink">{HACKATHON_EVENT.name}</div>
          <div className="font-body text-micro text-accent-mid">{HACKATHON_EVENT.teamsForming} tim sedang terbentuk</div>
        </div>
        <span className="font-body text-micro text-accent-mid">→</span>
      </div>
    </RailColumn>
  );
}

export default function VariantB() {
  const [activeSection, setActiveSection] = useState<Section>("Semua");

  const filterOptions: { value: Section; label: string }[] = [
    { value: "Semua", label: "Semua" },
    ...LOOKING_FOR.map((b) => ({ value: b as Section, label: BADGE_LABEL[b] })),
  ];

  return (
    <Shell
      active="cari"
      navFilters={
        <NavFilterList
          label="Filter Tujuan"
          options={filterOptions}
          active={activeSection}
          onSelect={setActiveSection}
        />
      }
    >
      <CenterBoard activeSection={activeSection} onSection={setActiveSection} />
      <RightRail />
    </Shell>
  );
}
