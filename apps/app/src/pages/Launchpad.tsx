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
      <div className="bn-head">
        <h1 className="bn-title">Launchpad</h1>
        <span className="bn-title-sub">Apa yang lagi dikerjakan komunitas</span>
      </div>

      {/* Calm on-ramp to the AI assistant (opt-in, never a gate) */}
      <button
        type="button"
        className="bn-ramp"
        onClick={() => navigate("/assistant")}
      >
        <span className="bn-ramp-mark" aria-hidden="true">
          ✦
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="bn-ramp-title">hei {firstName(user.name)} 👋</span>
          <span className="bn-ramp-sub">
            Belum tahu mau mulai dari mana? Ngobrol sebentar sama asisten — kita
            rapiin profil & cari arahmu.
          </span>
        </span>
        <span className="bn-ramp-cue" aria-hidden="true">
          Mulai →
        </span>
      </button>

      {/* Interest filter strip (client-side) */}
      {interests.length > 0 && (
        <div className="skills-wrap" style={{ marginBottom: 24 }}>
          {["Semua", ...interests].map((f) => (
            <button
              key={f}
              type="button"
              className={`stage-chip stage-pick${filter === f ? " on" : ""}`}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <p className="eyebrow sec-rule">Pilihan inspiratif</p>
      {featuredShown.length === 0 ? (
        <p className="empty-state">belum ada pilihan.</p>
      ) : (
        <div className="featured">
          {featuredShown.map((k) => (
            <FeaturedCard
              key={k.id}
              karya={k}
              onOpen={() => navigate(`/karya/${k.id}`)}
            />
          ))}
        </div>
      )}

      <p className="eyebrow mt40 mb4">Kabar terbaru</p>
      {feedShown.length === 0 ? (
        <p className="empty-state">belum ada aktivitas.</p>
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
      <section className="bn-pulse">
        <p className="eyebrow bn-pulse-head">Denyut komunitas</p>
        <div className="bn-pulse-rows">
          {pulse.map((s) => (
            <div key={s.label} className="bn-pulse-row">
              <span className="bn-pulse-label">{s.label}</span>
              <span className="bn-pulse-value">{s.value ?? "—"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bn-rail-sec">
        <div className="bn-rail-head">
          <p className="eyebrow">Kenalan dengan builder</p>
          <button
            type="button"
            className="bn-rail-link"
            onClick={() => navigate("/jelajahi")}
          >
            Lihat semua
          </button>
        </div>
        {toMeet.length === 0 ? (
          <p className="empty-state">belum ada builder lain.</p>
        ) : (
          <ul className="bn-builders">
            {toMeet.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="bn-builder"
                  onClick={() => navigate(`/member/${m.id}`)}
                >
                  <Avatar name={m.name} size={34} />
                  <span className="bn-builder-body">
                    <span className="bn-builder-name">{m.name}</span>
                    <span className="bn-builder-meta">
                      {[m.handle && `@${m.handle}`, m.year]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    {m.skills.length > 0 && (
                      <span className="bn-builder-skills">
                        {m.skills.slice(0, 3).map((s) => (
                          <span key={s} className="bn-builder-skill">
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

      <section className="bn-rail-cta">
        <p className="bn-rail-cta-copy">
          Punya ide atau progres baru? Bagikan sebagai karya — komunitas senang
          lihat apa yang lagi kamu garap.
        </p>
        <button
          type="button"
          className="bn-rail-cta-btn"
          onClick={() => navigate("/karya/new")}
        >
          Mulai karya baru
        </button>
      </section>
    </>
  );
}
