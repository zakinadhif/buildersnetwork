/**
 * Al-Fath Berkarya — Jelajahi Karya
 * Search-led discovery across karya and people (ported from the Calm Wide "Cari"
 * surface). The right rail holds multi-select interest/skill facets.
 */

import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { Shell } from "../components/Shell";
import { Tag } from "../components/Tag";
import { ALL_INTERESTS, ALL_SKILLS, KARYA, MEMBERS, type Karya, type Member } from "../data/karya";
import { coverFor } from "../lib/images";
import { T, eyebrow } from "@myapp/design-tokens";

// ─── Search list row (karya) ───────────────────────────────────────────────────
function KaryaRow({ karya }: { karya: Karya }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "56px 1fr auto",
      gap: "12px 20px",
      padding: "18px 0",
      borderBottom: `1px solid ${T.line}`,
      alignItems: "start",
    }}>
      {/* 56px of art + a 1px ring, now inside the box (#91). */}
      <div style={{
        width: 58,
        height: 58,
        flexShrink: 0,
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${T.line}`,
        background: T.bg,
      }}>
        <img
          src={coverFor(karya.interests)}
          alt={karya.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: T.size.title, fontWeight: T.weight.regular, lineHeight: T.lh.heading, color: T.ink }}>
          {karya.title}
        </h3>
        <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink2, lineHeight: T.lh.body }}>
          {karya.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 2 }}>
          {karya.interests.map((t) => <Tag key={t} label={t} />)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 8, paddingTop: 2 }}>
        <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.accentMid }}>♥ {karya.appreciations}</span>
        <span style={eyebrow}>{karya.stages[karya.stages.length - 1]}</span>
        <div style={{ display: "flex" }}>
          {karya.roster.slice(0, 3).map((r, i) => (
            <span key={r.handle} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: karya.roster.length - i }}>
              <Avatar name={r.name} size={22} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

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

// ─── Filter sidebar (right rail) ───────────────────────────────────────────────
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
export default function JelajahiScreen() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"karya" | "orang">("karya");
  const [activeInterests, setActiveInterests] = useState<string[]>([]);
  const [activeSkills, setActiveSkills] = useState<string[]>([]);

  function toggle(arr: string[], val: string, set: (v: string[]) => void) {
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
      activeInterests.length === 0 || k.interests.some((i) => activeInterests.includes(i));
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
      activeSkills.length === 0 || m.skills.some((s) => activeSkills.includes(s));
    const matchInterests =
      activeInterests.length === 0 || m.interests.some((i) => activeInterests.includes(i));
    return matchQ && matchSkills && matchInterests;
  });

  const hasFilters = activeInterests.length > 0 || activeSkills.length > 0;

  return (
    <Shell active="jelajahi">
      {/* Results column */}
      <main className="bn-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const, gap: 20 }}>
        {/* Heading */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: T.size.display, fontWeight: T.weight.regular, letterSpacing: T.track.heading, color: T.ink }}>Jelajahi Karya</h1>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3 }}>Cari karya & kolaborator</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari karya, orang, skill…"
            aria-label="Cari karya, orang, atau skill"
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

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.line}` }}>
          {([
            { id: "karya", label: "Karya", count: filteredKarya.length },
            { id: "orang", label: "Orang", count: filteredMembers.length },
          ] as const).map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: T.fontBody,
                fontSize: T.size.body,
                fontWeight: tab === id ? T.weight.medium : T.weight.regular,
                padding: "8px 16px 8px 0",
                color: tab === id ? T.accent : T.ink2,
                borderBottom: tab === id ? `2px solid ${T.accent}` : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {label}{" "}
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        {tab === "karya" ? (
          <div>
            {filteredKarya.length === 0 ? (
              <p style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
                Tidak ada karya yang cocok.
              </p>
            ) : (
              filteredKarya.map((k) => <KaryaRow key={k.id} karya={k} />)
            )}
          </div>
        ) : (
          <div>
            {filteredMembers.length === 0 ? (
              <p style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
                Tidak ada builder yang cocok.
              </p>
            ) : (
              filteredMembers.map((m) => <MemberRow key={m.id} member={m} />)
            )}
          </div>
        )}
      </main>

      {/* Filter rail */}
      <aside className="bn-rail" style={{
        width: 232,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column" as const,
        gap: 24,
        position: "sticky" as const,
        top: 68,
      }}>
        <FilterColumn
          label="Minat"
          items={ALL_INTERESTS}
          active={activeInterests}
          onToggle={(v) => toggle(activeInterests, v, setActiveInterests)}
        />
        {tab === "orang" && (
          <FilterColumn
            label="Keahlian"
            items={ALL_SKILLS}
            active={activeSkills}
            onToggle={(v) => toggle(activeSkills, v, setActiveSkills)}
          />
        )}
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
