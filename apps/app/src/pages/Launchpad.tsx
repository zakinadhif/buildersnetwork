import {
  type KaryaListItem,
  useGetFeatured,
  useGetFeed,
} from "@myapp/api-client-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import Feed from "@/components/Feed";
import { Avatar, STAGE_LABELS } from "@/components/ui-atoms";
import { firstName, type Member } from "@/lib/members";

/**
 * The Launchpad home (issue #8) — the MockupB treatment of the feed-first
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

      <p className="sec-head">Pilihan inspiratif</p>
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

      <p className="bn-feed-eyebrow" style={{ marginTop: 40 }}>
        Kabar terbaru
      </p>
      {feedShown.length === 0 ? (
        <p className="empty-state">belum ada aktivitas.</p>
      ) : (
        <Feed items={feedShown} />
      )}
    </>
  );
}

/** A curated karya card — reuses the karya-card visual language (FR-22: no
 * scores). Identical shape to the feed's new-karya card for consistency. */
function FeaturedCard({
  karya,
  onOpen,
}: {
  karya: KaryaListItem;
  onOpen: () => void;
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: contains block children, can't use <button>
    <div
      className="karya-card"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      <span className="karya-card-title">{karya.title}</span>
      <p className="karya-card-desc">{karya.description}</p>
      <div className="karya-card-foot">
        <div className="skills-wrap">
          {karya.stages.map((s) => (
            <span key={s} className="stage-chip">
              {STAGE_LABELS[s]}
            </span>
          ))}
        </div>
        <div className="roster">
          {karya.roster.map((m) => (
            <Avatar
              key={m.id}
              name={m.name}
              handle={m.handle}
              image={m.image}
              size={26}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
