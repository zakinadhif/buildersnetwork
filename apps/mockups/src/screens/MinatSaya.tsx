/**
 * Al-Fath Berkarya — Minat Saya  ·  issue #106
 *
 * A Launchpad rail destination (exit criterion: reachable from the nav), so it
 * lives *inside* the shell — same left rail as Launchpad, now with "Minat Saya"
 * lit. Manage the interests you follow, see the karya they surface, and pick up
 * more. Shared token scale + KaryaCard, so it reads like the home, not a
 * rapid-dev afterthought.
 */

import { useState } from "react";
import { KaryaCard, MainColumn, RailColumn } from "@myapp/ui";
import { Shell } from "../components/Shell";
import { ALL_INTERESTS, KARYA } from "../data/karya";
import { coverFor } from "../lib/images";
import { relativeTime } from "../lib/format";

export default function MinatSayaScreen() {
  const [following, setFollowing] = useState<string[]>(["Web", "AI/ML", "Komunitas", "Edukasi"]);

  const suggestions = ALL_INTERESTS.filter((i) => !following.includes(i));
  const matched = KARYA.filter((k) => k.interests.some((i) => following.includes(i)));

  const remove = (v: string) => setFollowing((f) => f.filter((x) => x !== v));
  const add = (v: string) => setFollowing((f) => (f.includes(v) ? f : [...f, v]));

  return (
    <Shell active="minat">
      {/* Center column */}
      <MainColumn>
        <div className="mb-[22px]">
          <div className="flex items-baseline gap-2.5">
            <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">Minat Saya</h1>
            <span className="font-body text-caption text-ink3">Yang kamu ikuti menyetel apa yang muncul di Launchpad</span>
          </div>
        </div>

        {/* Followed interests */}
        <p className="eyebrow mb-2.5">Minat yang kamu ikuti</p>
        {following.length === 0 ? (
          <p className="pb-5 pt-2.5 font-body text-body text-ink3">
            Belum ada minat. Pilih beberapa di kanan — Launchpad langsung menyesuaikan.
          </p>
        ) : (
          <div className="mb-[30px] flex flex-wrap gap-2">
            {following.map((f) => (
              <span key={f} className="inline-flex items-center gap-[7px] rounded-full border border-accent-line bg-accent-tint py-[5px] pl-[13px] pr-2 font-body text-ui text-accent">
                {f}
                <button
                  type="button"
                  onClick={() => remove(f)}
                  aria-label={`Berhenti ikuti ${f}`}
                  className="cursor-pointer border-none bg-none p-0 font-body text-body leading-none text-accent-mid"
                >×</button>
              </span>
            ))}
          </div>
        )}

        {/* Karya for these interests */}
        <p className="eyebrow mb-1">Karya untuk minatmu</p>
        {matched.length === 0 ? (
          <p className="py-4 font-body text-body text-ink3">Belum ada karya untuk minat ini.</p>
        ) : (
          matched.slice(0, 4).map((k) => (
            <KaryaCard
              key={k.id}
              cover={coverFor(k.interests)}
              title={k.title}
              description={k.description}
              activity={{ text: k.lastActivity.text, time: relativeTime(k.lastActivity.hoursAgo) }}
              stages={k.stages.map((s) => ({ label: s, accent: s === "Cari Kolaborator" }))}
              interests={k.interests}
              roster={k.roster.map((r) => ({ key: r.handle, name: r.name }))}
            />
          ))
        )}
      </MainColumn>

      {/* Right rail — pick up more */}
      <RailColumn>
        <p className="eyebrow mb-3">Tambah minat</p>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.length === 0 ? (
            <span className="font-body text-ui text-ink3">Kamu sudah ikuti semuanya 🎉</span>
          ) : (
            suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="inline-flex cursor-pointer items-center gap-[5px] rounded-full border border-line bg-transparent px-[11px] py-1 font-body text-ui text-ink2"
              >
                <span aria-hidden="true" className="text-accent">+</span> {s}
              </button>
            ))
          )}
        </div>
      </RailColumn>
    </Shell>
  );
}
