/**
 * Cari Kolaborator — Variant C · Match
 *
 * Recommendations, both directions: karya whose open roles fit Zaki's skills,
 * and people whose skills fill the open roles in Zaki's karya. The right rail
 * shows the inputs that drive both lists.
 */

import { useState } from "react";
import { Avatar, MainColumn, RailColumn, Tag } from "@myapp/ui";
import { cn } from "@myapp/ui";
import { Shell } from "../../components/Shell";
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
import { Eyebrow } from "@myapp/ui";

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
  return (
    <span className={cn(
      "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-[2px] font-body text-micro font-medium tracking-tag",
      type === "hackathon" && "border-accent bg-accent text-accent-fg",
      type === "project"   && "border-accent-line bg-accent-tint text-accent",
      type === "gig"       && "border-line-dark bg-line text-ink2",
    )}>
      <span aria-hidden="true" className="text-[9px]">{BADGE_ICON[type]}</span>
      {BADGE_LABEL[type]}
    </span>
  );
}

// ─── Hackathon Banner (FR-29) — GEMASTIK 2026 team-formation prompt ───────────
// Event-scoped: surfaced because Zaki's skills are sought by teams registering
// for GEMASTIK. Dismissible so it doesn't clutter the session.
function HackathonBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <section className="mb-[22px] flex items-start gap-3.5 rounded-panel border border-accent-line bg-accent-tint px-[18px] py-3.5">
      <div aria-hidden="true" className="mt-0.5 shrink-0 font-display text-[28px] leading-none text-accent">✦</div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 font-display text-title font-normal leading-heading text-ink">
          Kamu di GEMASTIK 2026? Lagi cari tim.
        </div>
        <div className="mb-3 font-body text-body leading-body text-ink2">
          Beberapa tim kompetisi butuh React dan TypeScript persis seperti skill-mu.
          Pendaftaran tutup 3 minggu lagi — masih ada waktu.
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="cursor-pointer whitespace-nowrap rounded-card border-none bg-accent px-3.5 py-[7px] font-body text-ui font-semibold text-accent-fg">
            Lihat Tim GEMASTIK →
          </button>
          <button
            onClick={onDismiss}
            className="cursor-pointer whitespace-nowrap rounded-card border border-line-dark bg-transparent px-3.5 py-[7px] font-body text-ui text-ink3"
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
    <article className="border-b border-line py-4">
      {/* Header: cover + title + badge */}
      <div className="mb-2.5 flex items-start gap-3">
        {/* 52px of art + a 1px ring */}
        <div className="h-[54px] w-[54px] shrink-0 overflow-hidden rounded-[13px] border border-line">
          <img
            src={coverFor(karya.interests)}
            alt={karya.title}
            loading="lazy"
            className="block h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-[5px] flex items-start justify-between gap-2">
            <h3 className="m-0 font-display text-title font-normal leading-heading text-ink">{karya.title}</h3>
            <LookingForBadge type={karya.lookingFor} />
          </div>
          <div className="flex flex-wrap gap-1">
            {karya.stages.map((s) => <Tag key={s} label={s} />)}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mb-2.5 mt-0 font-body text-body leading-body text-ink2">{karya.description}</p>

      {/* Open roles pill */}
      <div className="mb-2.5 flex items-center gap-1.5 rounded-card border border-line bg-surface px-[11px] py-[7px]">
        <Eyebrow as="span" className="mr-0.5">Butuh</Eyebrow>
        <span className="font-body text-ui text-ink2">{karya.openRoles.join(" · ")}</span>
      </div>

      {/* Interest tags */}
      <div className="mb-2.5 flex flex-wrap gap-1">
        {karya.interests.map((i) => <Tag key={i} label={i} />)}
      </div>

      {/* Match reason — warm, not a score */}
      <div className="mb-3.5 flex items-center gap-[5px]">
        <span aria-hidden="true" className="leading-none text-body text-accent-mid">✦</span>
        <span className="font-body text-ui font-medium text-accent-mid">
          cocok: {karya.matchReason.join(", ")}
        </span>
      </div>

      {/* Footer: roster avatars + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center">
          {karya.roster.slice(0, 5).map((r, idx) => (
            <span key={r.handle} style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: karya.roster.length - idx }}>
              <Avatar name={r.name} size={22} />
            </span>
          ))}
          <span className="ml-2 font-body text-micro text-ink3">{karya.roster.length} builder</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDm}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-card border border-line-dark bg-transparent px-3 py-1.5 font-body text-ui transition-colors duration-150",
              dmed ? "text-ink3" : "text-ink2",
            )}
          >
            {dmed ? "Pesan Terkirim ✓" : "Tanya dulu"}
          </button>
          <button
            onClick={onRequest}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-card border px-3.5 py-1.5 font-body text-ui font-semibold transition-[background,color] duration-150",
              requested
                ? "border-accent-line bg-accent-tint text-accent"
                : "border-transparent bg-accent text-accent-fg",
            )}
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
    <article className="border-b border-line py-4">
      {/* Header: avatar + name + badge */}
      <div className="mb-2.5 flex items-start gap-3">
        <Avatar name={person.name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="font-display text-title font-normal text-ink">{person.name}</span>
              <span className="ml-2 font-body text-micro text-ink3">{person.handle}</span>
            </div>
            <LookingForBadge type={person.lookingFor} />
          </div>
          <div className="font-body text-micro text-ink3">
            Tkt {person.tingkat} · {person.jurusan}
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="mb-2.5 mt-0 font-body text-body leading-body text-ink2">{person.bio}</p>

      {/* Skills chips (accent = they're offering these) */}
      <div className="mb-2 flex flex-wrap gap-1">
        {person.skills.map((s) => <Tag key={s} label={s} accent />)}
      </div>

      {/* Current karya */}
      {person.currentKarya && (
        <div className="mb-2.5 font-body text-ui text-ink3">
          karya saat ini:{" "}
          <span className="font-medium text-ink2">{person.currentKarya}</span>
        </div>
      )}

      {/* Match reason */}
      <div className="mb-3.5 flex items-center gap-[5px]">
        <span aria-hidden="true" className="leading-none text-body text-accent-mid">✦</span>
        <span className="font-body text-ui font-medium text-accent-mid">
          cocok buat{" "}
          <span className="font-semibold">{person.fitsMyKarya}</span>
          {" · "}butuh {person.fitsRole}
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onDm}
          className={cn(
            "cursor-pointer whitespace-nowrap rounded-card border border-line-dark bg-transparent px-3 py-1.5 font-body text-ui transition-colors duration-150",
            dmed ? "text-ink3" : "text-ink2",
          )}
        >
          {dmed ? "Pesan Terkirim ✓" : "Kirim Pesan"}
        </button>
        <button
          onClick={onInvite}
          className={cn(
            "cursor-pointer whitespace-nowrap rounded-card border px-3.5 py-1.5 font-body text-ui font-semibold transition-[background,color] duration-150",
            invited
              ? "border-accent-line bg-accent-tint text-accent"
              : "border-transparent bg-accent text-accent-fg",
          )}
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
    <MainColumn>
      {/* Page header */}
      <div className="mb-5">
        <div className="mb-1 flex items-baseline gap-2.5">
          <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">Cari Kolaborator</h1>
        </div>
        <p className="m-0 font-body text-body leading-body text-ink2">
          Rekomendasi buat kamu, Zaki — berdasarkan skill dan karya yang kamu bawa.
        </p>
      </div>

      {/* Hackathon banner (FR-29) — dismissible */}
      {showHackathon && <HackathonBanner onDismiss={onDismissHackathon} />}

      {/* ── Section 1: Karya yang cocok buat kamu ── */}
      <section className="mb-9">
        <div className="mb-4 border-b border-line pb-3">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <h2 className="m-0 font-display text-feature font-normal leading-heading text-ink">Karya yang cocok buat kamu</h2>
            <span className="shrink-0 font-body text-caption text-ink3">{KARYA_MATCHES.length} karya</span>
          </div>
          <div className="font-body text-ui text-ink3">
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
        <div className="mb-4 border-b border-line pb-3">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <h2 className="m-0 font-display text-feature font-normal leading-heading text-ink">Orang yang cocok buat karyamu</h2>
            <span className="shrink-0 font-body text-caption text-ink3">{PERSON_MATCHES.length} orang</span>
          </div>
          <div className="font-body text-ui text-ink3">
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
    </MainColumn>
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
    <RailColumn className="flex flex-col gap-4">
      {/* Profile card */}
      <div className="flex flex-col gap-3.5 rounded-panel border border-line bg-surface px-4 py-3.5">
        {/* Avatar + name */}
        <div className="flex items-center gap-2.5">
          <Avatar name={ZAKI.name} size={40} />
          <div>
            <div className="font-body text-body font-medium text-ink">{ZAKI.name}</div>
            <div className="font-body text-micro text-ink3">{ZAKI.handle} · Tkt {ZAKI.tingkat}</div>
          </div>
        </div>

        <div className="h-px w-full bg-line" />

        {/* Status / looking-for badge — editable */}
        <div>
          <Eyebrow as="div" className="mb-1.5">Status kamu</Eyebrow>
          <button
            onClick={cycleStatus}
            title="Klik untuk ganti status"
            aria-label={`Status: ${BADGE_LABEL[lookingFor]}. Klik untuk ganti.`}
            className="inline-flex cursor-pointer items-center gap-1.5 border-none bg-none p-0"
          >
            <LookingForBadge type={lookingFor} />
            <span className="font-body text-micro text-ink3">▾</span>
          </button>
          <div className="mt-1 font-body text-micro text-ink3">Klik badge untuk ganti</div>
        </div>

        {/* Skills */}
        <div>
          <Eyebrow as="div" className="mb-1.5">Keahlian kamu</Eyebrow>
          <div className="flex flex-wrap gap-1">
            {ZAKI.skills.map((s) => <Tag key={s} label={s} accent />)}
          </div>
        </div>
      </div>

      {/* Karya Saya — with open roles that drive Section 2 matches */}
      <div>
        <Eyebrow as="div" className="mb-2.5">Karya kamu</Eyebrow>
        <div className="flex flex-col gap-2">
          {ZAKI_KARYA.map((k) => (
            <div key={k.id} className="rounded-card border border-line bg-surface px-3 py-2.5">
              {/* Cover + title */}
              <div className="mb-2 flex items-center gap-2">
                {/* 28px of art + a 1px ring */}
                <div className="h-[30px] w-[30px] shrink-0 overflow-hidden rounded-[7px] border border-line">
                  <img
                    src={coverFor(k.interests)}
                    alt={k.title}
                    className="block h-full w-full object-cover"
                  />
                </div>
                <span className="font-body text-ui font-medium text-ink">{k.title}</span>
              </div>
              {/* Open roles */}
              <Eyebrow as="div" className="mb-[5px]">Butuh</Eyebrow>
              <div className="flex flex-col gap-[3px]">
                {k.openRoles.map((r) => (
                  <div key={r} className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="text-[8px] text-accent-mid">◉</span>
                    <span className="font-body text-ui text-ink2">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit CTA */}
      <button className="cursor-pointer rounded-card border border-line bg-none px-3.5 py-2 text-center font-body text-ui text-ink2">
        Edit profil &amp; keahlian →
      </button>
    </RailColumn>
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
