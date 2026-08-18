import type { FeedItem } from "@myapp/api-client-react";
import { MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { backNavigationState } from "@/lib/navigation";
import { Avatar, KaryaCard, KaryaCover } from "@/components/ui-atoms";
import { STAGE_LABELS, timeAgo } from "@/components/ui-metadata";

/**
 * The reverse-chron global feed (FR-22). A post leads with its karya: the
 * project cover is the face and its contributor dips into the corner.
 */
export default function Feed({
  items,
  edgeToEdge = false,
}: {
  items: FeedItem[];
  /** Let post separators reach the edges of the shell's main column. */
  edgeToEdge?: boolean;
}) {
  const [location, navigate] = useLocation();

  return (
    <div
      className={`feed flex flex-col ${
        edgeToEdge ? "-mx-[var(--shell-gutter)] max-[900px]:-mx-4" : ""
      }`}
    >
      {items.map((it) =>
        it.type === "post" ? (
          <article key={`post-${it.id}`}>
            <a
              href={`/karya/${it.karya.id}/posts/${it.id}`}
              onClick={(event) => {
                event.preventDefault();
                navigate(`/karya/${it.karya.id}/posts/${it.id}`, {
                  state: backNavigationState(location),
                });
              }}
              className={`post-card group flex cursor-pointer gap-3.5 border-b border-line py-[18px] transition-colors hover:bg-bg-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent ${
                edgeToEdge ? "px-[var(--shell-gutter)] max-[900px]:px-4" : ""
              }`}
            >
              <div className="relative size-15 shrink-0">
                {it.karya.coverUrl ? (
                  <KaryaCover
                    src={it.karya.coverUrl}
                    size={46}
                    radius={13}
                    alt={`Logo ${it.karya.title}`}
                  />
                ) : (
                  <span
                    className="flex size-12 items-center justify-center rounded-[13px] border border-line bg-accent-tint font-display text-title text-accent"
                    aria-hidden="true"
                  >
                    {it.karya.title.charAt(0)}
                  </span>
                )}
                <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-surface leading-none shadow-[0_0_0_2px_var(--color-surface)]">
                  <Avatar
                    name={it.author.name}
                    image={it.author.image}
                    size={17}
                  />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <span className="post-karya-link block min-w-0 text-left">
                  <span className="block font-display text-title leading-heading text-ink group-hover:text-accent">
                    {it.karya.title}
                  </span>
                  <span className="mt-px block font-body text-micro text-ink3">
                    diposting {it.author.name} · {timeAgo(it.createdAt)}
                  </span>
                </span>
                <p className="mt-2.5 whitespace-pre-wrap text-body leading-body">
                  {it.body}
                </p>
                <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-line bg-transparent px-[11px] py-[5px] text-caption font-medium text-ink2">
                  <MessageCircle size={13} strokeWidth={2} aria-hidden="true" />
                  <span className="tabular-nums">{it.commentCount}</span>
                </span>
                {it.latestComment && (
                  <>
                    <span className="mt-3 flex items-center gap-[7px] text-left">
                      <Avatar
                        name={it.latestComment.author.name}
                        image={it.latestComment.author.image}
                        size={16}
                      />
                      <span className="text-micro text-ink3">
                        {it.latestComment.author.name.split(" ")[0]} berkomentar
                      </span>
                    </span>
                    <div className="mt-[13px] flex gap-2.5 border-t border-line pt-[13px]">
                      <Avatar
                        name={it.latestComment.author.name}
                        image={it.latestComment.author.image}
                        size={28}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-[7px]">
                          <span className="text-ui font-medium text-ink">
                            {it.latestComment.author.name}
                          </span>
                          <span className="text-micro text-ink3">
                            {timeAgo(it.latestComment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-ui leading-body">
                          {it.latestComment.body}
                        </p>
                        <span className="mt-[7px] block text-micro font-medium text-accent-mid">
                          Lihat percakapan →
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </a>
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
            onOpen={() =>
              navigate(`/karya/${it.id}`, { state: backNavigationState(location) })
            }
          />
        ),
      )}
    </div>
  );
}
