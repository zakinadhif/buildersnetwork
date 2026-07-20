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
    <div className="flex flex-col gap-5">
      {items.map((it) =>
        it.type === "post" ? (
          <article key={`post-${it.id}`} className="bg-bg border border-line rounded-panel p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="bg-transparent border-none p-0 flex items-center gap-2 cursor-pointer text-left group"
                onClick={() => navigate(`/member/${it.author.id}`)}
              >
                <Avatar
                  name={it.author.name}
                  image={it.author.image}
                  size={28}
                />
                <span className="text-ui font-medium text-ink group-hover:underline">{it.author.name}</span>
              </button>
              <span className={`inline-flex items-center px-2 py-0.5 text-micro tracking-tag font-semibold rounded-[4px] uppercase kind-${it.kind}`}>
                {POST_KIND_LABELS[it.kind]}
              </span>
            </div>
            <p className="text-body text-ink leading-body whitespace-pre-wrap m-0">{it.body}</p>
            <div className="flex justify-between items-center mt-1">
              <button
                type="button"
                className="bg-transparent border-none p-0 font-ui text-ui font-medium text-ink2 cursor-pointer hover:text-ink hover:underline"
                onClick={() => navigate(`/karya/${it.karya.id}`)}
              >
                {it.karya.title}
              </button>
              <span className="text-micro text-ink3">{timeAgo(it.createdAt)}</span>
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
