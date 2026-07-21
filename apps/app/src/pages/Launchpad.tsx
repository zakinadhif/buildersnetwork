import {
  type KaryaListItem,
  useGetFeatured,
  useGetFeed,
  useGetStats,
  useListMembers,
} from "@myapp/api-client-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import Feed from "@/components/Feed";
import { Avatar, KaryaCard, STAGE_LABELS } from "@/components/ui-atoms";
import { firstName, type Member } from "@/lib/members";

/**
 * The Launchpad home (issue #8) — the Launchpad-mockup treatment of the feed-first
 * community home: a calm curated "Pilihan inspiratif" strip over a reverse-chron
 * feed of recent posts + new karya. **No ranking, no leaderboard** (FR-22) — the
 * karya leads, nothing is "winning". Reuses `useGetFeatured()` / `useGetFeed()`
 * (no new endpoints) and the existing `Feed` / karya-card visual language.
 *
 * A minat-filter strip filters the curated + new-karya items client-side by
 * interest (posts carry no interest in the feed payload, so a specific filter
 * narrows to karya). `interests` seeds the strip; an empty union hides it.
 */
export default function Launchpad({ user }: { user: Member }) {
  const [, navigate] = useLocation();
  const { data: featured = [] } = useGetFeatured();
  const { data: feed = [] } = useGetFeed();
  const [filter, setFilter] = useState("Semua");

  // Interest chips are derived from what's actually on screen (curated + new
  // karya), not a hardcoded list — so the strip never offers an empty filter.
  const interests = useMemo(() => {
    const seen = new Set<string>();
    for (const k of featured) for (const i of k.interests) seen.add(i);
    for (const it of feed)
      if (it.type === "karya") for (const i of it.interests) seen.add(i);
    return Array.from(seen);
  }, [featured, feed]);

  const active = filter !== "Semua";
  const featuredShown = active
    ? featured.filter((k) => k.interests.includes(filter))
    : featured;
  const feedShown = active
    ? feed.filter((it) => it.type === "karya" && it.interests.includes(filter))
    : feed;

  return (
    <>
      <div className="flex items-baseline gap-2.5 mb-6">
        <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">
          Launchpad
        </h1>
        <span className="font-body text-caption text-ink3">
          Apa yang lagi dikerjakan komunitas
        </span>
      </div>

      {/* Calm on-ramp to the AI assistant (opt-in, never a gate) */}
      <button
        type="button"
        className="w-full flex items-center gap-3.5 px-[18px] py-3.5 mb-6 bg-accent-tint border border-accent-line rounded-panel text-left cursor-pointer transition-opacity hover:opacity-85"
        onClick={() => navigate("/assistant")}
      >
        <span
          className="font-display text-[28px] text-accent leading-none shrink-0"
          aria-hidden="true"
        >
          ✦
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-display text-title text-ink leading-heading mb-0.5">
            hei {firstName(user.name)} 👋
          </span>
          <span className="block font-body text-body text-ink2 leading-body">
            Belum tahu mau mulai dari mana? Ngobrol sebentar sama asisten — kita
            rapiin profil & cari arahmu.
          </span>
        </span>
        <span
          className="shrink-0 text-accent text-ui font-semibold"
          aria-hidden="true"
        >
          Mulai →
        </span>
      </button>

      {/* Interest filter strip (client-side) */}
      {interests.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          {["Semua", ...interests].map((f) => {
            const isOn = filter === f;
            return (
              <button
                key={f}
                type="button"
                className={`inline-flex items-center px-2.5 py-[3px] text-ui tracking-tag border cursor-pointer pointer:min-h-[44px] ${isOn ? "bg-ink border-ink text-bg" : "border-line text-ink2"}`}
                aria-pressed={isOn}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            );
          })}
        </div>
      )}

      <p className="eyebrow pb-2.5 border-b border-line">Pilihan inspiratif</p>
      {featuredShown.length === 0 ? (
        <p className="font-mono text-ui text-ink3 py-5">belum ada pilihan.</p>
      ) : (
        <div className="featured flex flex-col">
          {featuredShown.map((k) => (
            <FeaturedCard
              key={k.id}
              karya={k}
              onOpen={() => navigate(`/karya/${k.id}`)}
            />
          ))}
        </div>
      )}

      <p className="eyebrow mt-10 mb-1">Kabar terbaru</p>
      {feedShown.length === 0 ? (
        <p className="font-mono text-ui text-ink3 py-5">belum ada aktivitas.</p>
      ) : (
        <Feed items={feedShown} />
      )}
    </>
  );
}

/** A curated karya card — the shared `KaryaCard` (#92), no activity line (a
 * featured pick is not a chronological event) and no scores (FR-22). */
function FeaturedCard({
  karya,
  onOpen,
}: {
  karya: KaryaListItem;
  onOpen: () => void;
}) {
  return (
    <KaryaCard
      cover={karya.coverUrl}
      title={karya.title}
      description={karya.description}
      stages={karya.stages.map((s) => ({ label: STAGE_LABELS[s] }))}
      interests={karya.interests}
      roster={karya.roster.map((m) => ({
        key: m.id,
        name: m.name,
        image: m.image,
      }))}
      memberCount={karya.memberCount}
      onOpen={onOpen}
    />
  );
}

/**
 * The Launchpad right rail (issue #20) — the third shell column that makes the
 * home feel alive: a community pulse strip, a few builders to meet, and a CTA.
 * Rendered only on `/home` (App.tsx passes it to the shell), so other pages
 * carry no empty rail.
 *
 * All three pulse figures are real: `GET /api/stats` returns live counts. The
 * mockup's "cari kolaborator" stat has no data model (stages are a fixed
 * lifecycle vocabulary, none "seeking"), so it's honestly replaced by
 * "Update minggu ini" — karya updates in the last 7 days. Builder search by
 * skill/interest is deferred to Matchmaking; this is a plain "kenalan" list.
 */
export function LaunchpadRail({ user }: { user: Member }) {
  const [, navigate] = useLocation();
  const { data: stats } = useGetStats();
  const { data: members = [] } = useListMembers();

  // A handful of *other* builders to meet — never surface the viewer to
  // themselves. Full browsing/search lives in Jelajahi + Matchmaking.
  const toMeet = members.filter((m) => m.id !== user.id).slice(0, 5);

  const pulse = [
    { label: "Karya aktif", value: stats?.karya },
    { label: "Builder aktif", value: stats?.builders },
    { label: "Update minggu ini", value: stats?.updatesThisWeek },
  ];

  return (
    <>
      <section className="bg-surface border border-line rounded-panel px-4 py-3.5">
        <p className="eyebrow mb-2.5">Denyut komunitas</p>
        <div className="flex flex-col gap-2">
          {pulse.map((s) => (
            <div
              key={s.label}
              className="bn-pulse-row flex justify-between items-baseline gap-3"
            >
              <span className="text-ui text-ink2">{s.label}</span>
              <span className="bn-pulse-value text-body font-medium text-ink tabular-nums">
                {s.value ?? "—"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <p className="eyebrow">Kenalan dengan builder</p>
          <button
            type="button"
            className="bg-transparent border-none p-0 cursor-pointer font-body text-micro text-accent-mid transition-colors hover:text-accent"
            onClick={() => navigate("/jelajahi")}
          >
            Lihat semua
          </button>
        </div>
        {toMeet.length === 0 ? (
          <p className="font-mono text-ui text-ink3 py-5">
            belum ada builder lain.
          </p>
        ) : (
          <ul className="list-none flex flex-col">
            {toMeet.map((m) => (
              <li key={m.id} className="border-b border-line last:border-none">
                <button
                  type="button"
                  className="group w-full flex gap-2.5 items-start text-left bg-transparent border-none py-2.5 cursor-pointer"
                  onClick={() => navigate(`/member/${m.id}`)}
                >
                  <Avatar name={m.name} size={34} />
                  <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
                    <span className="bn-builder-name text-ui font-medium text-ink transition-colors group-hover:text-accent">
                      {m.name}
                    </span>
                    <span className="text-micro text-ink3">
                      {[m.handle && `@${m.handle}`, m.year]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    {m.skills.length > 0 && (
                      <span className="flex flex-wrap gap-1 mt-0.5">
                        {m.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-micro text-ink2 bg-bg border border-line px-1.5 py-[1px] rounded-[3px]"
                          >
                            {s}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-accent rounded-panel p-4">
        <p className="text-body text-accent-fg leading-compact mb-3">
          Punya ide atau progres baru? Bagikan sebagai karya — komunitas senang
          lihat apa yang lagi kamu garap.
        </p>
        <button
          type="button"
          className="w-full bg-accent-fg text-accent border-none rounded-card px-3.5 py-[7px] font-body text-ui font-semibold cursor-pointer transition-opacity hover:opacity-85"
          onClick={() => navigate("/karya/new")}
        >
          Mulai karya baru
        </button>
      </section>
    </>
  );
}
