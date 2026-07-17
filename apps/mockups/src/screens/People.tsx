/**
 * Al-Fath Berkarya — People
 * The builder directory, renamed and narrowed from the old "Jelajahi Karya":
 * karya search is gone (Karya owns the project catalog now), so this is
 * people-only — search a builder by name/skill/interest, or narrow with the
 * Minat/Keahlian facets in the rail. The "Kenalan dengan builder" browse strip
 * that once sat here now lives in Scroll's rail.
 */

import { useState } from "react";
import { Avatar, Tag } from "@myapp/ui";
import { Shell } from "../components/Shell";
import { ALL_INTERESTS, ALL_SKILLS, MEMBERS, type Member } from "../data/karya";
import { T, eyebrow } from "@myapp/design-tokens";

// ─── Search list row (member) ──────────────────────────────────────────────────
function MemberRow({ member }: { member: Member }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: "0 16px",
      padding: "18px 0",
      borderBottom: `1px solid ${T.line}`,
      alignItems: "start",
    }}>
      <Avatar name={member.name} size={40} />
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 5, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" as const }}>
          <span style={{ fontFamily: T.fontDisplay, fontSize: T.size.title, fontWeight: T.weight.regular, color: T.ink }}>{member.name}</span>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>{member.handle}</span>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginLeft: "auto" }}>
            Tkt {member.year} · {member.major}
          </span>
        </div>
        <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink2, lineHeight: T.lh.body }}>
          {member.bio}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 2 }}>
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
      <div style={{ ...eyebrow, marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
        {items.map((item) => {
          const on = active.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              aria-pressed={on}
              style={{
                textAlign: "left" as const,
                background: on ? T.accentTint : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: T.fontBody,
                fontSize: T.size.ui,
                color: on ? T.accent : T.ink2,
                fontWeight: on ? T.weight.medium : T.weight.regular,
                padding: "4px 8px",
                borderRadius: "4px",
              }}
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
      <main className="bn-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const, gap: 20 }}>
        {/* Heading */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: T.size.display, fontWeight: T.weight.regular, letterSpacing: T.track.heading, color: T.ink }}>People</h1>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3 }}>Direktori builder — cari lewat skill & minat</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari builder, skill, minat…"
            aria-label="Cari builder berdasarkan nama, skill, atau minat"
            style={{
              width: "100%",
              boxSizing: "border-box" as const,
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${T.ink}`,
              fontFamily: T.fontBody,
              fontWeight: T.weight.light,
              fontSize: 22,
              color: T.ink,
              padding: "6px 0",
              letterSpacing: "-0.02em",
            }}
          />
        </div>

        {/* Result count */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: `1px solid ${T.line}`, paddingBottom: 8 }}>
          <span style={eyebrow}>Builder</span>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, fontVariantNumeric: "tabular-nums" }}>{filteredMembers.length} orang</span>
        </div>

        {/* Results */}
        <div>
          {filteredMembers.length === 0 ? (
            <p style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
              Tidak ada builder yang cocok.
            </p>
          ) : (
            filteredMembers.map((m) => <MemberRow key={m.id} member={m} />)
          )}
        </div>
      </main>

      {/* Filter rail */}
      <aside className="bn-rail" style={{
        display: "flex",
        flexDirection: "column" as const,
        gap: 24,
      }}>
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
            style={{
              background: "none",
              border: `1px solid ${T.line}`,
              cursor: "pointer",
              fontFamily: T.fontBody,
              fontSize: T.size.micro,
              color: T.ink2,
              padding: "6px 10px",
              borderRadius: T.radiusCard,
              letterSpacing: T.track.tag,
              alignSelf: "flex-start",
            }}
          >
            Hapus filter
          </button>
        )}
      </aside>
    </Shell>
  );
}
