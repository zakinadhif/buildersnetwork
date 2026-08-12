import type { FeedItem } from "@myapp/api-client-react";
import { MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Avatar, KaryaCard } from "@/components/ui-atoms";
import { STAGE_LABELS, timeAgo } from "@/components/ui-metadata";

/**
 * The reverse-chron global feed (FR-22). Renders a `FeedItem[]` union as
 * delivered by the API (no client re-sort): a **post** item led by its parent
 * karya, with the author kept as quiet metadata;
 * a **new-karya** item as the shared `KaryaCard` (#92), where "karya baru" is the
 * activity line and the whole card links into the karya.
 */
export default function Feed({ items }: { items: FeedItem[] }) {
  const [, navigate] = useLocation();

  return (
    <div className="feed flex flex-col gap-5">
      {items.map((it) =>
        it.type === "post" ? (
          <article
            key={`post-${it.id}`}
            className="post-card border-b border-line py-[18px]"
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="post-karya-link group min-w-0 cursor-pointer border-none bg-transparent p-0 text-left"
                onClick={() => navigate(`/karya/${it.karya.id}`)}
              >
                <span className="block font-display text-title leading-heading text-ink group-hover:text-accent">
                  {it.karya.title}
                </span>
                <span className="mt-px block font-body text-micro text-ink3">
                  diposting {it.author.name} · {timeAgo(it.createdAt)}
                </span>
              </button>
            </div>
            <p className="mt-2.5 whitespace-pre-wrap text-body leading-body text-ink2">
              {it.body}
            </p>
            <div className="mt-3 flex items-center">
              <button
                type="button"
                className="group flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left"
                onClick={() => navigate(`/member/${it.author.id}`)}
              >
                <Avatar
                  name={it.author.name}
                  image={it.author.image}
                  size={24}
                />
                <span className="text-micro text-ink3 group-hover:text-ink">
                  Lihat profil {it.author.name}
                </span>
              </button>
            </div>
            <button
              type="button"
              className="mt-3 inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-left text-caption font-medium text-accent-mid"
              onClick={() => navigate(`/karya/${it.karya.id}/posts/${it.id}`)}
            >
              <MessageCircle size={13} strokeWidth={2} aria-hidden="true" />
              {it.commentCount > 0
                ? `${it.commentCount} komentar · Lihat percakapan →`
                : "Beri komentar →"}
            </button>
            {it.latestComment && (
              <button
                type="button"
                className="mt-3 flex w-full gap-2.5 border-t border-line bg-transparent pt-3 text-left"
                onClick={() => navigate(`/karya/${it.karya.id}/posts/${it.id}`)}
              >
                <Avatar
                  name={it.latestComment.author.name}
                  image={it.latestComment.author.image}
                  size={28}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-ui font-medium text-ink">
                    {it.latestComment.author.name}
                  </span>
                  <span className="mt-0.5 block line-clamp-2 text-ui leading-body text-ink2">
                    {it.latestComment.body}
                  </span>
                </span>
              </button>
            )}
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
