/**
 * Al-Fath Berkarya — Profil Member  ·  issue #105
 *
 * Reached from every feed author and the Launchpad rail's "Kenalan dengan builder"
 * list. A calm identity surface on the shared token scale: who they are, skills &
 * interests, and the karya they're building. A self/other toggle previews the
 * owner's "Sunting profil" vs. a visitor's connect actions (grounds #32's own
 * profile view + edit).
 */

import { useState } from "react";
import { Avatar, Tag } from "@myapp/ui";
import { T, eyebrow } from "@myapp/design-tokens";
import { KARYA, MEMBERS } from "../data/karya";
import { coverFor } from "../lib/images";

const MEMBER = MEMBERS[0]; // Arief Maulana
const THEIR_KARYA = KARYA.filter((k) => k.roster.some((r) => r.name === MEMBER.name));

// ─── Compact karya card ──────────────────────────────────────────────────────
function KaryaMini({ title, description, stages, interests }: {
  title: string;
  description: string;
  stages: string[];
  interests: string[];
}) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 0", borderTop: `1px solid ${T.line}` }}>
      <img
        src={coverFor(interests)}
        alt={title}
        style={{ width: 60, height: 60, flexShrink: 0, objectFit: "cover", borderRadius: 12, border: `1px solid ${T.line}` }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" as const, marginBottom: 3 }}>
          <span style={{ fontFamily: T.fontDisplay, fontSize: T.size.title, color: T.ink }}>{title}</span>
          <span style={eyebrow}>{stages[stages.length - 1]}</span>
        </div>
        <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink2, lineHeight: T.lh.body }}>{description}</p>
      </div>
    </div>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ProfilScreen() {
  const [self, setSelf] = useState(false);
  const m = MEMBER;

  const stat = (label: string, value: number | string) => (
    <div style={{ textAlign: "center" as const }}>
      <div style={{ fontFamily: T.fontBody, fontSize: T.size.stat, fontWeight: T.weight.medium, color: T.ink, lineHeight: T.lh.heading }}>{value}</div>
      <div style={eyebrow}>{label}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.fontBody }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "28px 24px 80px" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <button type="button" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>← Balik</button>
          <div style={{ display: "flex", gap: 2, padding: 3, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 99 }}>
            {([["visitor", "Orang lain"], ["self", "Profil sendiri"]] as const).map(([val, label]) => {
              const on = (val === "self") === self;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSelf(val === "self")}
                  aria-pressed={on}
                  style={{ border: "none", borderRadius: 99, padding: "5px 12px", background: on ? T.ink : "transparent", color: on ? T.bg : T.ink2, fontFamily: T.fontBody, fontSize: T.size.micro, fontWeight: on ? T.weight.medium : T.weight.regular, cursor: "pointer" }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Identity */}
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <Avatar name={m.name} size={76} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: "0 0 3px", fontFamily: T.fontDisplay, fontSize: T.size.feature, fontWeight: T.weight.regular, letterSpacing: T.track.heading, lineHeight: T.lh.heading, color: T.ink }}>{m.name}</h1>
            <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink3, marginBottom: 10 }}>
              {m.handle} · Tkt {m.year} · {m.major}
            </div>
            <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink2, lineHeight: T.lh.body }}>{m.bio}</p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {self ? (
            <button type="button" style={{ background: "transparent", color: T.ink, border: `1px solid ${T.line}`, borderRadius: T.radiusCard, padding: "9px 18px", fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, cursor: "pointer" }}>
              Sunting profil
            </button>
          ) : (
            <>
              <button type="button" style={{ background: T.ink, color: T.bg, border: "none", borderRadius: T.radiusCard, padding: "9px 18px", fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.semibold, cursor: "pointer" }}>
                Ajak kolaborasi
              </button>
              <button type="button" style={{ background: "transparent", color: T.ink, border: `1px solid ${T.line}`, borderRadius: T.radiusCard, padding: "9px 18px", fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, cursor: "pointer" }}>
                Kirim pesan
              </button>
            </>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 32, padding: "20px 0", margin: "22px 0", borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          {stat("Karya", m.karya)}
          {stat("Skill", m.skills.length)}
          {stat("Angkatan", `'${String(20 + m.year)}`)}
        </div>

        {/* Skills & interests */}
        <p style={{ ...eyebrow, marginBottom: 10 }}>Keahlian</p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 22 }}>
          {m.skills.map((s) => <Tag key={s} label={s} accent />)}
        </div>
        <p style={{ ...eyebrow, marginBottom: 10 }}>Minat</p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 30 }}>
          {m.interests.map((i) => <Tag key={i} label={i} />)}
        </div>

        {/* Their karya */}
        <p style={{ ...eyebrow, marginBottom: 4 }}>Karya yang digarap</p>
        {THEIR_KARYA.length === 0 ? (
          <p style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink3, padding: "18px 0" }}>Belum ada karya yang dibagikan.</p>
        ) : (
          <div>
            {THEIR_KARYA.map((k) => (
              <KaryaMini key={k.id} title={k.title} description={k.description} stages={k.stages} interests={k.interests} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
