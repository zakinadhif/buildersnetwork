/**
 * Cari Kolaborator — Variant A · Two-lane
 *
 * The primary choice is which side of the matchmaking you're on: looking for
 * people, or looking for a karya to join. A badge-type filter narrows each lane.
 */

import { useState } from "react";
import { Avatar, MainColumn, RailColumn, Tag } from "@myapp/ui";
import { cn } from "@myapp/ui";
import { Shell } from "../../components/Shell";
import { KARYA_SLOTS, SEEKERS, type KaryaSlot, type Seeker } from "../../data/seekers";
import { LOOKING_FOR, type LookingFor } from "../../data/looking-for";
import { relativeTime } from "../../lib/format";
import { coverFor } from "../../lib/images";
import { Eyebrow } from "@myapp/ui";

/** This variant's wording for the three FR-29 categories. */
const BADGE_LABEL: Record<LookingFor, string> = {
  hackathon: "Tim Hackathon",
  project:   "Tim Project",
  gig:       "Gig / Talenta",
};

// ─── Badge chip ───────────────────────────────────────────────────────────────
// Three visual weights: hackathon = terracotta (urgent/event), project =
// neutral dark border, gig = hairline quiet.
function BadgeChip({ type }: { type: LookingFor }) {
  return (
    <span className={cn(
      "inline-block whitespace-nowrap rounded-[3px] border px-2 py-[2px] font-body text-micro tracking-eyebrow uppercase",
      type === "hackathon" && "border-accent bg-accent-tint text-accent",
      type === "project"   && "border-ink2 bg-transparent text-ink2",
      type === "gig"       && "border-line bg-transparent text-ink3",
    )}>
      {BADGE_LABEL[type]}
    </span>
  );
}

// ─── Seeker card ──────────────────────────────────────────────────────────────
// Shows a person who is actively looking for a team or gig.
function SeekerCard({ seeker }: { seeker: Seeker }) {
  return (
    <article className="border-b border-line py-[18px]">
      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <Avatar name={seeker.name} size={44} />

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Name + handle + badge */}
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <span className="font-display text-title font-normal leading-heading text-ink">{seeker.name}</span>
            <span className="font-body text-micro text-ink3">{seeker.handle}</span>
            <BadgeChip type={seeker.badge} />
          </div>

          {/* Tingkat · Jurusan · posted */}
          <div className="mb-2 font-body text-micro leading-compact text-ink3">
            {seeker.tingkat} · {seeker.jurusan} · diposting {relativeTime(seeker.postedHoursAgo)}
          </div>

          {/* Bio */}
          <p className="mb-2.5 mt-0 font-body text-body leading-body text-ink2">{seeker.bio}</p>

          {/* Skill chips */}
          <div className="mb-2.5 flex flex-wrap gap-1">
            {seeker.skills.map((s) => <Tag key={s} label={s} accent />)}
          </div>

          {/* Current karya */}
          {seeker.currentKarya && (
            <div className="mb-3.5 flex flex-wrap items-center gap-1.5">
              <Eyebrow as="span">sedang bangun</Eyebrow>
              <span className="rounded-[3px] border border-line-dark bg-surface px-2 py-[2px] font-body text-micro text-ink">
                {seeker.currentKarya.title}
                <span className="text-ink3"> — {seeker.currentKarya.role}</span>
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button className="cursor-pointer whitespace-nowrap rounded-card border-none bg-accent px-[15px] py-[7px] font-body text-ui font-semibold text-accent-fg">
              Ajak ke Karya
            </button>
            <button className="cursor-pointer whitespace-nowrap rounded-card border border-line bg-transparent px-[15px] py-[7px] font-body text-ui font-medium text-ink2">
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
    <article className="border-b border-line py-[18px]">
      <div className="flex items-start gap-3.5">
        {/* Cover thumbnail */}
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-line bg-bg">
          <img
            src={coverFor(slot.interests)}
            alt={slot.title}
            loading="lazy"
            className="block h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title + stage + badge */}
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <h3 className="m-0 font-display text-title font-normal leading-heading text-ink">{slot.title}</h3>
            <Tag label={slot.stage} accent={slot.stage === "GEMASTIK 2026" || slot.stage === "Hackathon"} />
            <BadgeChip type={slot.badge} />
          </div>

          {/* Posted time */}
          <div className="mb-2 font-body text-micro text-ink3">
            dibuka {relativeTime(slot.postedHoursAgo)}
          </div>

          {/* One-line description */}
          <p className="mb-2.5 mt-0 font-body text-body leading-body text-ink2">{slot.desc}</p>

          {/* Open roles — the core matchmaking signal */}
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <Eyebrow as="span">butuh</Eyebrow>
            {slot.openRoles.map((r) => (
              <span key={r} className="rounded-[3px] border border-accent-line bg-accent-tint px-2 py-[2px] font-body text-micro text-ink">{r}</span>
            ))}
          </div>

          {/* Interest chips + roster avatars + actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Interest chips */}
            <div className="flex flex-wrap gap-1">
              {slot.interests.map((i) => <Tag key={i} label={i} />)}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Roster avatars */}
              <div className="flex items-center">
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
              <button className="cursor-pointer whitespace-nowrap rounded-card border-none bg-accent px-[13px] py-1.5 font-body text-ui font-semibold text-accent-fg">
                Minta Gabung
              </button>
              <button className="cursor-pointer whitespace-nowrap rounded-card border border-line bg-transparent px-[13px] py-1.5 font-body text-ui font-medium text-ink2">
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
type Lane      = "orang" | "karya";
type FilterKey = "Semua" | LookingFor;

const BADGE_FILTERS: { id: FilterKey; label: string }[] = [
  { id: "Semua",     label: "Semua" },
  { id: "hackathon", label: "Hackathon" },
  { id: "project",   label: "Project" },
  { id: "gig",       label: "Gig" },
];

function CenterBoard() {
  const [lane, setLane]               = useState<Lane>("orang");
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
    <MainColumn className="flex flex-col gap-0">
      {/* Page heading */}
      <div className="mb-5">
        <h1 className="mb-1 mt-0 font-display text-display font-normal tracking-heading leading-heading text-ink">
          Cari Kolaborator
        </h1>
        <p className="m-0 font-body text-body leading-body text-ink2">
          Temukan orang yang cocok untuk proyekmu, atau temukan proyek yang cocok untukmu.
        </p>
      </div>

      {/* ── Lens Toggle ──────────────────────────────────────────────────────── */}
      {/* The primary choice — which side of the matchmaking are you on? */}
      <div className="mb-4 flex gap-0 rounded-panel border border-line-dark bg-bg p-1">
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
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border-none px-4 py-2.5 font-body text-body transition-[background,color] duration-150",
                active
                  ? "bg-ink font-medium text-bg"
                  : "bg-transparent font-normal text-ink2",
              )}
            >
              <span aria-hidden="true" className="text-ui">{icon}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Badge-type filter ────────────────────────────────────────────────── */}
      <div className="mb-[18px] flex flex-wrap items-center gap-1.5 border-b border-line pb-4">
        {BADGE_FILTERS.map(({ id, label }) => {
          const active = badgeFilter === id;
          return (
            <button
              key={id}
              onClick={() => setBadgeFilter(id)}
              aria-pressed={active}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1 font-body text-ui tracking-tag transition-[background,color,border-color] duration-[120ms]",
                active
                  ? "border-accent bg-accent-tint font-medium text-accent"
                  : "border-line bg-transparent font-normal text-ink2",
              )}
            >
              {label}
            </button>
          );
        })}

        {/* Result count */}
        <span className="ml-auto font-body text-micro text-ink3">
          {resultCount} {lane === "orang" ? "orang ditemukan" : "karya buka slot"}
        </span>
      </div>

      {/* ── Card list ────────────────────────────────────────────────────────── */}
      {lane === "orang" ? (
        <div>
          {filteredSeekers.length === 0 ? (
            <p className="py-8 text-center font-body text-body text-ink3">
              Belum ada orang yang pasang badge untuk kategori ini.
            </p>
          ) : (
            filteredSeekers.map((s) => <SeekerCard key={s.id} seeker={s} />)
          )}
        </div>
      ) : (
        <div>
          {filteredSlots.length === 0 ? (
            <p className="py-8 text-center font-body text-body text-ink3">
              Belum ada karya yang buka slot untuk kategori ini.
            </p>
          ) : (
            filteredSlots.map((k) => <KaryaSlotCard key={k.id} slot={k} />)
          )}
        </div>
      )}

      {/* ── Post a slot CTA ──────────────────────────────────────────────────── */}
      <div className="mt-6 flex items-center justify-between gap-3 rounded-panel border-[1.5px] border-dashed border-line-dark px-5 py-4">
        <div>
          <div className="mb-0.5 font-body text-body font-medium text-ink">
            {lane === "orang"
              ? "Kamu lagi nyari tim atau gig?"
              : "Karyamu butuh kontributor?"}
          </div>
          <div className="font-body text-ui text-ink2">
            {lane === "orang"
              ? "Pasang badge supaya komunitas bisa menemukanmu."
              : "Buka lowongan — biar orang yang tepat tahu kamu butuh bantuan."}
          </div>
        </div>
        <button className="cursor-pointer whitespace-nowrap rounded-card border-none bg-accent px-4 py-2 font-body text-ui font-semibold text-accent-fg">
          {lane === "orang" ? "Pasang Badge" : "Buka Lowongan"}
        </button>
      </div>
    </MainColumn>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────
function RightRail() {
  // Mock interactive state: user's own seeker badge.
  const [myBadge, setMyBadge] = useState<LookingFor | null>(null);

  return (
    <RailColumn className="flex flex-col gap-4">
      {/* ── Status kamu — seeker badge picker ─────────────────────────────── */}
      {/* Prompts the viewer to set or update their own "looking for" badge. */}
      <div className="rounded-panel border border-accent-line bg-accent-tint p-3.5">
        <Eyebrow as="div" className="mb-2.5">Status kamu</Eyebrow>

        {myBadge ? (
          /* Badge set — show current status with option to change. */
          <div>
            <div className="mb-2.5 font-body text-body leading-compact text-ink">
              Kamu lagi cari:{" "}
              <strong className="text-accent">{BADGE_LABEL[myBadge]}</strong>
            </div>
            <div className="mb-2.5 font-body text-micro text-ink3">
              Badge ini terlihat oleh semua anggota komunitas.
            </div>
            <button
              onClick={() => setMyBadge(null)}
              className="cursor-pointer rounded-card border border-accent bg-transparent px-3 py-[5px] font-body text-ui text-accent"
            >
              Ubah badge
            </button>
          </div>
        ) : (
          /* No badge — invite the user to pick one. */
          <>
            <div className="mb-3 font-body text-body leading-compact text-ink">
              Kasih tahu komunitas kamu lagi nyari apa.
            </div>
            <div className="flex flex-col gap-1.5">
              {LOOKING_FOR.map((b) => (
                <button
                  key={b}
                  onClick={() => setMyBadge(b)}
                  className="flex cursor-pointer items-center gap-2 rounded-card border border-line bg-surface px-2.5 py-[7px] text-left font-body text-ui text-ink2 transition-[border-color,color] duration-[120ms]"
                >
                  <span aria-hidden="true" className="text-ui text-accent">◎</span>
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
      <div className="rounded-panel border border-line bg-surface p-3.5">
        <div className="mb-2 flex items-center gap-2">
          <span aria-hidden="true" className="text-[14px] text-accent">✦</span>
          <Eyebrow as="div">GEMASTIK 2026</Eyebrow>
        </div>
        <p className="mb-2.5 mt-0 font-body text-body leading-compact text-ink">
          6 orang lagi bentuk tim untuk kompetisi ini.
        </p>
        {/* A few seekers already tagged to this event */}
        <div className="mb-3 flex items-center gap-1">
          {["Farhan Ardiansyah", "Dian Pertiwi", "Siti Rahmah"].map((name, i) => (
            <span key={name} style={{ marginLeft: i === 0 ? 0 : -6 }}>
              <Avatar name={name} size={22} />
            </span>
          ))}
          <span className="ml-1 font-body text-micro text-ink3">+3 lagi</span>
        </div>
        <button className="w-full cursor-pointer rounded-card border border-accent bg-transparent px-3 py-1.5 font-body text-ui font-medium text-accent">
          Lihat tim GEMASTIK →
        </button>
      </div>

      {/* ── Community pulse ────────────────────────────────────────────────── */}
      <div className="rounded-panel border border-line bg-surface p-3.5">
        <Eyebrow as="div" className="mb-2.5">Denyut sekarang</Eyebrow>
        <div className="flex flex-col gap-2">
          {[
            { label: "Orang aktif cari tim", value: SEEKERS.length },
            { label: "Karya buka slot",      value: KARYA_SLOTS.length },
            { label: "Match minggu ini",     value: 11 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-baseline justify-between"
            >
              <span className="font-body text-ui text-ink2">{stat.label}</span>
              <span className="font-body text-body font-medium tabular-nums text-ink">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </RailColumn>
  );
}

export default function VariantA() {
  return (
    <Shell active="cari">
      <CenterBoard />
      <RightRail />
    </Shell>
  );
}
