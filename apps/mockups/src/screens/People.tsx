/**
 * Al-Fath Berkarya — People
 * The builder directory, renamed and narrowed from the old "Jelajahi Karya":
 * karya search is gone (Karya owns the project catalog now), so this is
 * people-only — search a builder by name/skill/interest, or narrow with the
 * Minat/Keahlian facets in the rail. The "Kenalan dengan builder" browse strip
 * that once sat here now lives in Scroll's rail.
 */

import { useState } from "react";
import { Avatar, Tag, MainColumn, RailColumn, cn } from "@myapp/ui";
import { Shell } from "../components/Shell";
import { ALL_INTERESTS, ALL_SKILLS, MEMBERS, type Member } from "../data/karya";

// ─── Search list row (member) ──────────────────────────────────────────────────
function MemberRow({ member }: { member: Member }) {
  return (
    <div className="grid items-start gap-x-4 border-b border-line py-[18px]" style={{ gridTemplateColumns: "auto 1fr" }}>
      <Avatar name={member.name} size={40} />
      <div className="flex min-w-0 flex-col gap-[5px]">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-display text-title font-normal text-ink">{member.name}</span>
          <span className="font-body text-micro text-ink3">{member.handle}</span>
          <span className="ml-auto font-body text-micro text-ink3">
            Tkt {member.year} · {member.major}
          </span>
        </div>
        <p className="m-0 font-body text-body leading-body text-ink2">
          {member.bio}
        </p>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {member.skills.map((s) => <Tag key={s} label={s} accent />)}
          {member.interests.map((i) => <Tag key={i} label={i} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Filter column (right rail) ────────────────────────────────────────────────
function FilterColumn({ label, items, active, onToggle }: {
  label: string;
  items: string[];
  active: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-micro font-medium tracking-eyebrow uppercase text-ink3 mb-2.5">{label}</div>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const on = active.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              aria-pressed={on}
              className={cn(
                "cursor-pointer rounded-card border-none px-2 py-1 text-left font-body text-ui",
                on
                  ? "bg-accent-tint text-accent font-medium"
                  : "bg-transparent text-ink2 font-normal",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PeopleScreen() {
  const [query, setQuery] = useState("");
  const [activeInterests, setActiveInterests] = useState<string[]>([]);
  const [activeSkills, setActiveSkills] = useState<string[]>([]);

  function toggle(arr: string[], val: string, set: (v: string[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  const filteredMembers = MEMBERS.filter((m) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.bio.toLowerCase().includes(q) ||
      m.skills.some((s) => s.toLowerCase().includes(q)) ||
      m.interests.some((i) => i.toLowerCase().includes(q));
    const matchSkills =
      activeSkills.length === 0 || m.skills.some((s) => activeSkills.includes(s));
    const matchInterests =
      activeInterests.length === 0 || m.interests.some((i) => activeInterests.includes(i));
    return matchQ && matchSkills && matchInterests;
  });

  const hasFilters = activeInterests.length > 0 || activeSkills.length > 0;

  return (
    <Shell active="people">
      {/* Results column */}
      <MainColumn className="flex flex-col gap-5">
        {/* Heading */}
        <div>
          <div className="mb-3 flex items-baseline gap-2.5">
            <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">People</h1>
            <span className="font-body text-caption text-ink3">Direktori builder — cari lewat skill &amp; minat</span>
          </div>
          {/* Big search input — deliberately off-scale: a display-weight search field
              at 22px literal, sized by eye against its context, same pattern as other
              one-off glyph sizes in the codebase (see index.css GLYPH SIZES note). */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari builder, skill, minat…"
            aria-label="Cari builder berdasarkan nama, skill, atau minat"
            className="w-full border-0 border-b-2 border-ink bg-transparent py-1.5 font-body font-light tracking-[-0.02em] text-ink outline-none placeholder:text-ink3"
            style={{ fontSize: 22 }}
          />
        </div>

        {/* Result count */}
        <div className="flex items-baseline justify-between border-b border-line pb-2">
          <span className="text-micro font-medium tracking-eyebrow uppercase text-ink3">Builder</span>
          <span className="font-body text-micro tabular-nums text-ink3">{filteredMembers.length} orang</span>
        </div>

        {/* Results */}
        <div>
          {filteredMembers.length === 0 ? (
            <p className="py-8 text-center font-body text-body text-ink3">
              Tidak ada builder yang cocok.
            </p>
          ) : (
            filteredMembers.map((m) => <MemberRow key={m.id} member={m} />)
          )}
        </div>
      </MainColumn>

      {/* Filter rail */}
      <RailColumn className="flex flex-col gap-6">
        <FilterColumn
          label="Minat"
          items={ALL_INTERESTS}
          active={activeInterests}
          onToggle={(v) => toggle(activeInterests, v, setActiveInterests)}
        />
        <FilterColumn
          label="Keahlian"
          items={ALL_SKILLS}
          active={activeSkills}
          onToggle={(v) => toggle(activeSkills, v, setActiveSkills)}
        />
        {hasFilters && (
          <button
            onClick={() => { setActiveInterests([]); setActiveSkills([]); }}
            className="self-start cursor-pointer rounded-card border border-line bg-none px-2.5 py-1.5 font-body text-micro tracking-tag text-ink2"
          >
            Hapus filter
          </button>
        )}
      </RailColumn>
    </Shell>
  );
}
