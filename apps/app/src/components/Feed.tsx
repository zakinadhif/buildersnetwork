import type { FeedItem } from "@myapp/api-client-react";
import { useLocation } from "wouter";
import {
  Avatar,
  KaryaCard,
  POST_KIND_LABELS,
  STAGE_LABELS,
  timeAgo,
} from "@/components/ui-atoms";

/**
 * The reverse-chron global feed (FR-22). Renders a `FeedItem[]` union as
 * delivered by the API (no client re-sort): a **post** item as a card (author
 * face → member, kind chip, body, parent-karya title → karya, relative time);
 * a **new-karya** item as the shared `KaryaCard` (#92), where "karya baru" is the
 * activity line and the whole card links into the karya.
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
          <KaryaCard
            key={`karya-${it.id}`}
            cover={it.coverUrl}
            title={it.title}
            description={it.description}
            activity={{ text: "karya baru", time: timeAgo(it.createdAt) }}
            stages={it.stages.map((s) => ({ label: STAGE_LABELS[s] }))}
            interests={it.interests}
            roster={it.roster.map((m) => ({
              key: m.id,
              name: m.name,
              image: m.image,
            }))}
            memberCount={it.memberCount}
            screenshots={(it.screenshots ?? [])
              .filter((s) => s.orientation === "landscape")
              .map((s, i) => ({
                key: s.id,
                src: s.url,
                alt: `${it.title} — layar ${i + 1}`,
              }))}
            onOpen={() => navigate(`/karya/${it.id}`)}
          />
        ),
      )}
    </div>
  );
}
