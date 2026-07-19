/**
 * Al-Fath Berkarya — Profil Member  ·  issue #105
 *
 * Reached from every feed author and the Launchpad rail's "Kenalan dengan builder"
 * list. Now inside the shared shell — same left rail as the surfaces it's reached
 * from — so opening a profile keeps the product frame. The center column is the
 * identity surface (who they are, skills & interests, the karya they build); the
 * sticky right rail carries the self/other toggle, connect actions, and stats.
 *
 * The self/other toggle previews the owner's "Sunting profil" vs. a visitor's
 * connect actions (grounds #32's own profile view + edit).
 */

import { useState } from "react";
import { Avatar, Tag, MainColumn, RailColumn, cn } from "@myapp/ui";
import { Shell } from "../components/Shell";
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
    <div className="flex gap-3.5 border-t border-line py-3.5">
      <img
        src={coverFor(interests)}
        alt={title}
        className="h-[60px] w-[60px] shrink-0 rounded-xl border border-line object-cover"
      />
      <div className="min-w-0">
        <div className="mb-[3px] flex flex-wrap items-baseline gap-2">
          <span className="font-display text-title text-ink">{title}</span>
          <span className="eyebrow">{stages[stages.length - 1]}</span>
        </div>
        <p className="m-0 font-body text-caption leading-body text-ink2">{description}</p>
      </div>
    </div>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ProfilScreen() {
  const [self, setSelf] = useState(false);
  const m = MEMBER;

  const metaRow = (label: string, value: number | string) => (
    <div className="flex items-baseline justify-between">
      <span className="eyebrow">{label}</span>
      <span className="font-body text-ui text-ink2">{value}</span>
    </div>
  );

  return (
    <Shell active="profil">
      {/* Identity column */}
      <MainColumn>
        {/* Back to the surface the profile was opened from */}
        <button type="button" className="mb-6 cursor-pointer border-none bg-none p-0 font-body text-ui text-ink2">← Balik</button>

        {/* Identity */}
        <div className="flex items-start gap-[18px]">
          <Avatar name={m.name} size={76} />
          <div className="min-w-0 flex-1">
            <h1 className="mb-[3px] mt-0 font-display text-feature font-normal tracking-heading leading-heading text-ink">{m.name}</h1>
            <div className="mb-2.5 font-body text-ui text-ink3">
              {m.handle} · Tkt {m.year} · {m.major}
            </div>
            <p className="m-0 font-body text-body leading-body text-ink2">{m.bio}</p>
          </div>
        </div>

        {/* Skills & interests */}
        <p className="eyebrow mb-2.5 mt-[30px]">Keahlian</p>
        <div className="mb-[22px] flex flex-wrap gap-1.5">
          {m.skills.map((s) => <Tag key={s} label={s} accent />)}
        </div>
        <p className="eyebrow mb-2.5">Minat</p>
        <div className="mb-[30px] flex flex-wrap gap-1.5">
          {m.interests.map((i) => <Tag key={i} label={i} />)}
        </div>

        {/* Their karya */}
        <p className="eyebrow mb-1">Karya yang digarap</p>
        {THEIR_KARYA.length === 0 ? (
          <p className="py-[18px] font-body text-body text-ink3">Belum ada karya yang dibagikan.</p>
        ) : (
          <div>
            {THEIR_KARYA.map((k) => (
              <KaryaMini key={k.id} title={k.title} description={k.description} stages={k.stages} interests={k.interests} />
            ))}
          </div>
        )}
      </MainColumn>

      {/* Actions rail */}
      <RailColumn className="flex flex-col gap-5">
        {/* Self/other toggle — gallery affordance to preview both viewer states */}
        <div className="flex gap-0.5 rounded-full border border-line bg-surface p-[3px]">
          {([["visitor", "Orang lain"], ["self", "Profil sendiri"]] as const).map(([val, label]) => {
            const on = (val === "self") === self;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setSelf(val === "self")}
                aria-pressed={on}
                className={cn(
                  "flex-1 cursor-pointer rounded-full border-none px-3 py-[5px] font-body text-micro",
                  on ? "bg-ink text-bg font-medium" : "bg-transparent text-ink2 font-normal",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {self ? (
            <button type="button" className="w-full cursor-pointer rounded-card border border-line bg-transparent px-[18px] py-[9px] text-center font-body text-ui font-medium text-ink">
              Sunting profil
            </button>
          ) : (
            <>
              <button type="button" className="w-full cursor-pointer rounded-card border-none bg-ink px-4 py-[9px] text-center font-body text-ui font-semibold text-bg">
                Ajak kolaborasi
              </button>
              <button type="button" className="w-full cursor-pointer rounded-card border border-line bg-transparent px-4 py-[9px] text-center font-body text-ui font-medium text-ink">
                Kirim pesan
              </button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          {metaRow("Karya", m.karya)}
          {metaRow("Skill", m.skills.length)}
          {metaRow("Angkatan", `'${String(20 + m.year)}`)}
        </div>
      </RailColumn>
    </Shell>
  );
}
