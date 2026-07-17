/**
 * Cari Kolaborator — Variant C · Match
 *
 * Recommendations, both directions: karya whose open roles fit Zaki's skills,
 * and people whose skills fill the open roles in Zaki's karya. The right rail
 * shows the inputs that drive both lists.
 */

import { useState } from "react";
import { Avatar } from "@myapp/ui";
import { Shell } from "../../components/Shell";
import { Tag } from "@myapp/ui";
import { LOOKING_FOR, type LookingFor } from "../../data/looking-for";
import {
  KARYA_MATCHES,
  PERSON_MATCHES,
  ZAKI,
  ZAKI_KARYA,
  type KaryaMatch,
  type PersonMatch,
} from "../../data/matches";
import { coverFor } from "../../lib/images";
import { T, eyebrow } from "@myapp/design-tokens";

/** This variant's wording for the three FR-29 categories. */
const BADGE_LABEL: Record<LookingFor, string> = {
  hackathon: "Tim Event/Hackathon",
  project:   "Tim Project",
  gig:       "Talenta/Gig",
};

// ─── Looking-for badge — three types, distinct visual weight ──────────────────
// hackathon: filled accent (urgent, time-bound)
// project:   tinted accent (steady, open-ended)
// gig:       neutral (task-scoped, no commitment implied)
const BADGE_ICON: Record<LookingFor, string> = {
  project:   "◆",
  hackathon: "◎",
  gig:       "◇",
};

function LookingForBadge({ type }: { type: LookingFor }) {
  const isEvent = type === "hackathon";
  const isGig   = type === "gig";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 99,
      border: `1px solid ${isEvent ? T.accent : isGig ? T.lineDark : T.accentLine}`,
      backgroundColor: isEvent ? T.accent : isGig ? T.line : T.accentTint,
      color: isEvent ? T.accentFg : isGig ? T.ink2 : T.accent,
      fontFamily: T.fontBody,
      fontSize: T.size.micro,
      fontWeight: T.weight.medium,
      letterSpacing: T.track.tag,
      whiteSpace: "nowrap" as const,
    }}>
      <span aria-hidden="true" style={{ fontSize: 9 }}>{BADGE_ICON[type]}</span>
      {BADGE_LABEL[type]}
    </span>
  );
}

// ─── Hackathon Banner (FR-29) — GEMASTIK 2026 team-formation prompt ───────────
// Event-scoped: surfaced because Zaki's skills are sought by teams registering
// for GEMASTIK. Dismissible so it doesn't clutter the session.
function HackathonBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <section style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      padding: "14px 18px",
      marginBottom: 22,
      background: T.accentTint,
      border: `1px solid ${T.accentLine}`,
      borderRadius: T.radiusPanel,
    }}>
      <div aria-hidden="true" style={{
        fontFamily: T.fontDisplay,
        fontSize: 28,
        color: T.accent,
        lineHeight: 1,
        flexShrink: 0,
        marginTop: 2,
      }}>✦</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: T.fontDisplay,
          fontSize: T.size.title,
          fontWeight: T.weight.regular,
          color: T.ink,
          lineHeight: T.lh.heading,
          marginBottom: 4,
        }}>
          Kamu di GEMASTIK 2026? Lagi cari tim.
        </div>
        <div style={{
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          color: T.ink2,
          lineHeight: T.lh.body,
          marginBottom: 12,
        }}>
          Beberapa tim kompetisi butuh React dan TypeScript persis seperti skill-mu.
          Pendaftaran tutup 3 minggu lagi — masih ada waktu.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          <button style={{
            backgroundColor: T.accent,
            color: T.accentFg,
            border: "none",
            borderRadius: T.radiusCard,
            padding: "7px 14px",
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            fontWeight: T.weight.semibold,
            cursor: "pointer",
            whiteSpace: "nowrap" as const,
          }}>
            Lihat Tim GEMASTIK →
          </button>
          <button
            onClick={onDismiss}
            style={{
              background: "transparent",
              color: T.ink3,
              border: `1px solid ${T.lineDark}`,
              borderRadius: T.radiusCard,
              padding: "7px 14px",
              fontFamily: T.fontBody,
              fontSize: T.size.ui,
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
            }}
          >
            Lewati
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Karya Match Card — karya whose open roles fit Zaki's skills ─────────────
function KaryaMatchCard({ karya, requested, onRequest, dmed, onDm }: {
  karya: KaryaMatch;
  requested: boolean;
  onRequest: () => void;
  dmed: boolean;
  onDm: () => void;
}) {
  return (
    <article style={{
      padding: "16px 0",
      borderBottom: `1px solid ${T.line}`,
    }}>
      {/* Header: cover + title + badge */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
        {/* 52px of art + a 1px ring, now inside the box (#91). */}
        <div style={{
          width: 54,
          height: 54,
          flexShrink: 0,
          borderRadius: 13,
          overflow: "hidden",
          border: `1px solid ${T.line}`,
        }}>
          <img
            src={coverFor(karya.interests)}
            alt={karya.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
            <h3 style={{
              margin: 0,
              fontFamily: T.fontDisplay,
              fontSize: T.size.title,
              fontWeight: T.weight.regular,
              color: T.ink,
              lineHeight: T.lh.heading,
            }}>{karya.title}</h3>
            <LookingForBadge type={karya.lookingFor} />
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
            {karya.stages.map((s) => <Tag key={s} label={s} />)}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        margin: "0 0 10px",
        fontFamily: T.fontBody,
        fontSize: T.size.body,
        color: T.ink2,
        lineHeight: T.lh.body,
      }}>{karya.description}</p>

      {/* Open roles pill */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 11px",
        borderRadius: T.radiusCard,
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        marginBottom: 10,
      }}>
        <span style={{ ...eyebrow, marginRight: 2 }}>Butuh</span>
        <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>
          {karya.openRoles.join(" · ")}
        </span>
      </div>

      {/* Interest tags */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginBottom: 10 }}>
        {karya.interests.map((i) => <Tag key={i} label={i} />)}
      </div>

      {/* Match reason — warm, not a score */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
        <span aria-hidden="true" style={{ color: T.accentMid, fontSize: T.size.body, lineHeight: 1 }}>✦</span>
        <span style={{
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          color: T.accentMid,
          fontWeight: T.weight.medium,
        }}>
          cocok: {karya.matchReason.join(", ")}
        </span>
      </div>

      {/* Footer: roster avatars + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {karya.roster.slice(0, 5).map((r, idx) => (
            <span key={r.handle} style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: karya.roster.length - idx }}>
              <Avatar name={r.name} size={22} />
            </span>
          ))}
          <span style={{ marginLeft: 8, fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
            {karya.roster.length} builder
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onDm}
            style={{
              padding: "6px 12px",
              borderRadius: T.radiusCard,
              border: `1px solid ${T.lineDark}`,
              backgroundColor: "transparent",
              color: dmed ? T.ink3 : T.ink2,
              fontFamily: T.fontBody,
              fontSize: T.size.ui,
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
              transition: "color 0.15s",
            }}
          >
            {dmed ? "Pesan Terkirim ✓" : "Tanya dulu"}
          </button>
          <button
            onClick={onRequest}
            style={{
              padding: "6px 14px",
              borderRadius: T.radiusCard,
              border: `1px solid ${requested ? T.accentLine : "transparent"}`,
              backgroundColor: requested ? T.accentTint : T.accent,
              color: requested ? T.accent : T.accentFg,
              fontFamily: T.fontBody,
              fontSize: T.size.ui,
              fontWeight: T.weight.semibold,
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {requested ? "Permintaan Dikirim ✓" : "Minta Gabung"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Person Match Card — people who can fill Zaki's karya's open roles ────────
function PersonMatchCard({ person, invited, onInvite, dmed, onDm }: {
  person: PersonMatch;
  invited: boolean;
  onInvite: () => void;
  dmed: boolean;
  onDm: () => void;
}) {
  return (
    <article style={{
      padding: "16px 0",
      borderBottom: `1px solid ${T.line}`,
    }}>
      {/* Header: avatar + name + badge */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
        <Avatar name={person.name} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: T.size.title, fontWeight: T.weight.regular, color: T.ink }}>
                {person.name}
              </span>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginLeft: 8 }}>
                {person.handle}
              </span>
            </div>
            <LookingForBadge type={person.lookingFor} />
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
            Tkt {person.tingkat} · {person.jurusan}
          </div>
        </div>
      </div>

      {/* Bio */}
      <p style={{
        margin: "0 0 10px",
        fontFamily: T.fontBody,
        fontSize: T.size.body,
        color: T.ink2,
        lineHeight: T.lh.body,
      }}>{person.bio}</p>

      {/* Skills chips (accent = they're offering these) */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginBottom: 8 }}>
        {person.skills.map((s) => <Tag key={s} label={s} accent />)}
      </div>

      {/* Current karya */}
      {person.currentKarya && (
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink3, marginBottom: 10 }}>
          karya saat ini:{" "}
          <span style={{ color: T.ink2, fontWeight: T.weight.medium }}>{person.currentKarya}</span>
        </div>
      )}

      {/* Match reason */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
        <span aria-hidden="true" style={{ color: T.accentMid, fontSize: T.size.body, lineHeight: 1 }}>✦</span>
        <span style={{
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          color: T.accentMid,
          fontWeight: T.weight.medium,
        }}>
          cocok buat{" "}
          <span style={{ fontWeight: T.weight.semibold }}>{person.fitsMyKarya}</span>
          {" · "}butuh {person.fitsRole}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          onClick={onDm}
          style={{
            padding: "6px 12px",
            borderRadius: T.radiusCard,
            border: `1px solid ${T.lineDark}`,
            backgroundColor: "transparent",
            color: dmed ? T.ink3 : T.ink2,
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            cursor: "pointer",
            whiteSpace: "nowrap" as const,
            transition: "color 0.15s",
          }}
        >
          {dmed ? "Pesan Terkirim ✓" : "Kirim Pesan"}
        </button>
        <button
          onClick={onInvite}
          style={{
            padding: "6px 14px",
            borderRadius: T.radiusCard,
            border: `1px solid ${invited ? T.accentLine : "transparent"}`,
            backgroundColor: invited ? T.accentTint : T.accent,
            color: invited ? T.accent : T.accentFg,
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            fontWeight: T.weight.semibold,
            cursor: "pointer",
            whiteSpace: "nowrap" as const,
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {invited ? "Undangan Dikirim ✓" : "Ajak ke Karya"}
        </button>
      </div>
    </article>
  );
}

// ─── Center column ────────────────────────────────────────────────────────────
function CariCenter({
  showHackathon,
  onDismissHackathon,
  requestedKarya,
  onRequestKarya,
  dmedKarya,
  onDmKarya,
  invitedPersons,
  onInvitePerson,
  dmedPersons,
  onDmPerson,
}: {
  showHackathon: boolean;
  onDismissHackathon: () => void;
  requestedKarya: Set<number>;
  onRequestKarya: (id: number) => void;
  dmedKarya: Set<number>;
  onDmKarya: (id: number) => void;
  invitedPersons: Set<number>;
  onInvitePerson: (id: number) => void;
  dmedPersons: Set<number>;
  onDmPerson: (id: number) => void;
}) {
  return (
    <main className="bn-main" style={{ flex: 1, minWidth: 0 }}>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <h1 style={{
            margin: 0,
            fontFamily: T.fontDisplay,
            fontSize: T.size.display,
            fontWeight: T.weight.regular,
            letterSpacing: T.track.heading,
            color: T.ink,
          }}>Cari Kolaborator</h1>
        </div>
        <p style={{
          margin: 0,
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          color: T.ink2,
          lineHeight: T.lh.body,
        }}>
          Rekomendasi buat kamu, Zaki — berdasarkan skill dan karya yang kamu bawa.
        </p>
      </div>

      {/* Hackathon banner (FR-29) — dismissible */}
      {showHackathon && <HackathonBanner onDismiss={onDismissHackathon} />}

      {/* ── Section 1: Karya yang cocok buat kamu ── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <h2 style={{
              margin: "0 0 4px",
              fontFamily: T.fontDisplay,
              fontSize: T.size.feature,
              fontWeight: T.weight.regular,
              color: T.ink,
              lineHeight: T.lh.heading,
            }}>Karya yang cocok buat kamu</h2>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3, flexShrink: 0 }}>
              {KARYA_MATCHES.length} karya
            </span>
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink3 }}>
            Berdasarkan skill-mu: {ZAKI.skills.join(", ")}
          </div>
        </div>

        {KARYA_MATCHES.map((k) => (
          <KaryaMatchCard
            key={k.id}
            karya={k}
            requested={requestedKarya.has(k.id)}
            onRequest={() => onRequestKarya(k.id)}
            dmed={dmedKarya.has(k.id)}
            onDm={() => onDmKarya(k.id)}
          />
        ))}
      </section>

      {/* ── Section 2: Orang yang cocok buat karyamu ── */}
      <section>
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <h2 style={{
              margin: "0 0 4px",
              fontFamily: T.fontDisplay,
              fontSize: T.size.feature,
              fontWeight: T.weight.regular,
              color: T.ink,
              lineHeight: T.lh.heading,
            }}>Orang yang cocok buat karyamu</h2>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3, flexShrink: 0 }}>
              {PERSON_MATCHES.length} orang
            </span>
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink3 }}>
            Bisa mengisi posisi terbuka di {ZAKI_KARYA.map((k) => k.title).join(" dan ")}
          </div>
        </div>

        {PERSON_MATCHES.map((p) => (
          <PersonMatchCard
            key={p.id}
            person={p}
            invited={invitedPersons.has(p.id)}
            onInvite={() => onInvitePerson(p.id)}
            dmed={dmedPersons.has(p.id)}
            onDm={() => onDmPerson(p.id)}
          />
        ))}
      </section>
    </main>
  );
}

// ─── Right Rail — Zaki's own matching context ─────────────────────────────────
// Shows what drives the recommendations: his looking-for status, skills, and
// the open roles in his karya. Status badge is editable (cycles on click).
function ZakiRail({ lookingFor, onChangeLookingFor }: {
  lookingFor: LookingFor;
  onChangeLookingFor: (t: LookingFor) => void;
}) {
  function cycleStatus() {
    const idx = LOOKING_FOR.indexOf(lookingFor);
    onChangeLookingFor(LOOKING_FOR[(idx + 1) % LOOKING_FOR.length]);
  }

  return (
    <aside className="bn-rail" style={{
      display: "flex",
      flexDirection: "column" as const,
      gap: 16,
    }}>
      {/* Profile card */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusPanel,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 14,
      }}>
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={ZAKI.name} size={40} />
          <div>
            <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink }}>
              {ZAKI.name}
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
              {ZAKI.handle} · Tkt {ZAKI.tingkat}
            </div>
          </div>
        </div>

        <div style={{ width: "100%", height: 1, backgroundColor: T.line }} />

        {/* Status / looking-for badge — editable */}
        <div>
          <div style={{ ...eyebrow, marginBottom: 6 }}>Status kamu</div>
          <button
            onClick={cycleStatus}
            title="Klik untuk ganti status"
            aria-label={`Status: ${BADGE_LABEL[lookingFor]}. Klik untuk ganti.`}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <LookingForBadge type={lookingFor} />
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>▾</span>
          </button>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginTop: 4 }}>
            Klik badge untuk ganti
          </div>
        </div>

        {/* Skills */}
        <div>
          <div style={{ ...eyebrow, marginBottom: 6 }}>Keahlian kamu</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
            {ZAKI.skills.map((s) => <Tag key={s} label={s} accent />)}
          </div>
        </div>
      </div>

      {/* Karya Saya — with open roles that drive Section 2 matches */}
      <div>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Karya kamu</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {ZAKI_KARYA.map((k) => (
            <div key={k.id} style={{
              backgroundColor: T.surface,
              border: `1px solid ${T.line}`,
              borderRadius: T.radiusCard,
              padding: "10px 12px",
            }}>
              {/* Cover + title */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {/* 28px of art + a 1px ring, now inside the box (#91). */}
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  overflow: "hidden",
                  flexShrink: 0,
                  border: `1px solid ${T.line}`,
                }}>
                  <img
                    src={coverFor(k.interests)}
                    alt={k.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
                <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>
                  {k.title}
                </span>
              </div>
              {/* Open roles */}
              <div style={{ ...eyebrow, marginBottom: 5 }}>Butuh</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
                {k.openRoles.map((r) => (
                  <div key={r} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span aria-hidden="true" style={{ color: T.accentMid, fontSize: 8 }}>◉</span>
                    <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit CTA */}
      <button style={{
        background: "none",
        border: `1px solid ${T.line}`,
        borderRadius: T.radiusCard,
        padding: "8px 14px",
        fontFamily: T.fontBody,
        fontSize: T.size.ui,
        color: T.ink2,
        cursor: "pointer",
        textAlign: "center" as const,
      }}>
        Edit profil &amp; keahlian →
      </button>
    </aside>
  );
}

export default function VariantC() {
  const [lookingFor,    setLookingFor]    = useState<LookingFor>("project");
  const [showHackathon, setShowHackathon] = useState(true);

  // Karya interaction state
  const [requestedKarya, setRequestedKarya] = useState<Set<number>>(new Set());
  const [dmedKarya,      setDmedKarya]      = useState<Set<number>>(new Set());

  // Person interaction state
  const [invitedPersons, setInvitedPersons] = useState<Set<number>>(new Set());
  const [dmedPersons,    setDmedPersons]    = useState<Set<number>>(new Set());

  function toggle(set: (fn: (prev: Set<number>) => Set<number>) => void, id: number) {
    set((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <Shell active="cari">
      <CariCenter
        showHackathon={showHackathon}
        onDismissHackathon={() => setShowHackathon(false)}
        requestedKarya={requestedKarya}
        onRequestKarya={(id) => toggle(setRequestedKarya, id)}
        dmedKarya={dmedKarya}
        onDmKarya={(id) => toggle(setDmedKarya, id)}
        invitedPersons={invitedPersons}
        onInvitePerson={(id) => toggle(setInvitedPersons, id)}
        dmedPersons={dmedPersons}
        onDmPerson={(id) => toggle(setDmedPersons, id)}
      />
      <ZakiRail lookingFor={lookingFor} onChangeLookingFor={setLookingFor} />
    </Shell>
  );
}
