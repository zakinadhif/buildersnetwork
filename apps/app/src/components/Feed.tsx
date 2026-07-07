import type { FeedItem, KaryaScreenshot } from "@myapp/api-client-react";
import { useLocation } from "wouter";
import {
  Avatar,
  KaryaCover,
  POST_KIND_LABELS,
  STAGE_LABELS,
  timeAgo,
} from "@/components/ui-atoms";

/**
 * Play Store-style landscape screenshot carousel (issue #19), shown above a
 * feed karya card's metadata row. Renders nothing when there are no landscape
 * screenshots — never an empty slot.
 */
function LandscapeCarousel({
  screenshots,
  title,
}: {
  screenshots: KaryaScreenshot[];
  title: string;
}) {
  if (screenshots.length === 0) return null;
  return (
    <section
      className="landscape-carousel"
      aria-label={`Tangkapan layar ${title}`}
    >
      {screenshots.map((s, i) => (
        <img
          key={s.id}
          src={s.url}
          alt={`${title} — layar ${i + 1}`}
          loading="lazy"
          className="landscape-carousel-img"
        />
      ))}
    </section>
  );
}

/**
 * The reverse-chron global feed (FR-22). Renders a `FeedItem[]` union as
 * delivered by the API (no client re-sort): a **post** item as a card (author
 * face → member, kind chip, body, parent-karya title → karya, relative time);
 * a **new-karya** item reusing the existing `karya-card` visual. Faces/titles
 * link out so people-browsing survives the Sprint-3 home regression (DECISION-F).
 */
export default function Feed({ items }: { items: FeedItem[] }) {
  const [, navigate] = useLocation();

  return (
    <div className="feed">
      {items.map((it) =>
        it.type === "post" ? (
          <article key={`post-${it.id}`} className="post-card">
            <div className="post-card-head">
              <button
                type="button"
                className="post-author"
                onClick={() => navigate(`/member/${it.author.id}`)}
              >
                <Avatar
                  name={it.author.name}
                  handle={it.author.handle}
                  image={it.author.image}
                  size={28}
                />
                <span className="post-author-name">{it.author.name}</span>
              </button>
              <span className={`kind-chip kind-${it.kind}`}>
                {POST_KIND_LABELS[it.kind]}
              </span>
            </div>
            <p className="post-body">{it.body}</p>
            <div className="post-card-foot">
              <button
                type="button"
                className="post-karya-link"
                onClick={() => navigate(`/karya/${it.karya.id}`)}
              >
                {it.karya.title}
              </button>
              <span className="post-time">{timeAgo(it.createdAt)}</span>
            </div>
          </article>
        ) : (
          // biome-ignore lint/a11y/useSemanticElements: contains block children, can't use <button>
          <div
            key={`karya-${it.id}`}
            className="karya-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/karya/${it.id}`)}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/karya/${it.id}`)}
          >
            <LandscapeCarousel
              screenshots={(it.screenshots ?? []).filter(
                (s) => s.orientation === "landscape",
              )}
              title={it.title}
            />
            <div className="karya-card-row">
              <KaryaCover url={it.coverUrl} size={48} />
              <div className="karya-card-body">
                <span className="feed-new-tag">karya baru</span>
                <span className="karya-card-title">{it.title}</span>
                <p className="karya-card-desc">{it.description}</p>
                <div className="karya-card-foot">
                  <div className="skills-wrap">
                    {it.stages.map((s) => (
                      <span key={s} className="stage-chip">
                        {STAGE_LABELS[s]}
                      </span>
                    ))}
                  </div>
                  <div className="roster">
                    {it.roster.map((m) => (
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
            </div>
          </div>
        ),
      )}
    </div>
  );
}
