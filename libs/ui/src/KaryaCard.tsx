import type { ReactNode } from "react";
import { Avatar } from "./Avatar";
import { KaryaCover } from "./KaryaCover";
import { cn } from "./lib/cn";
import { Tag } from "./Tag";

/** A lifecycle stage or seeking-signal, pre-labelled by the caller. `accent`
 *  lifts the one that is a call to act (the mockup's "Cari Kolaborator"). */
export interface KaryaCardStage {
  label: string;
  accent?: boolean;
}

/** A roster face. `key` is React's; `name` hashes the avatar and labels it. */
export interface KaryaCardFace {
  key: string;
  name: string;
  image?: string | null;
}

/** A landscape proof-shot for the Play-Store-style carousel. */
export interface KaryaCardShot {
  key: string;
  src: string;
  alt?: string;
}

/** The activity line — what is newest about this karya, and when. */
export interface KaryaCardActivity {
  /** Already localised ("Rilis beta terbuka", "karya baru"). */
  text: string;
  /** Already formatted by the caller's own clock ("5 jam lalu", "2j lalu"). */
  time: string;
}

/** How many faces the roster shows before collapsing the rest into "+N". */
const ROSTER_VISIBLE = 4;

const card = "karya-card flex flex-col gap-3 border-b border-line px-0.5 py-4";
const linkCard =
  "cursor-pointer transition-opacity duration-150 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * A karya as a feed row (#92): an optional proof-shot carousel, then the
 * app-icon cover beside a column of activity line, title + stages, description,
 * and a footer setting the interests against the roster.
 *
 * This is the mockup's `KaryaFeedRow`, now the one implementation — the app used
 * to render a plainer second design of the same card, and two designs of one
 * thing always drift. Both apps render this; only the per-instance data differs.
 *
 * Two seams keep the same card serving both sides without either forking it:
 *   - `onOpen` makes the whole card a link into its karya (the app's feed and
 *     featured cards). Without it the card is a plain `<article>`, which is what
 *     the gallery's rows are. The two are never combined with `appreciate`, so
 *     an interactive control never nests inside the button.
 *   - `appreciate` is a slot for the gallery's like toggle — real interactive
 *     state the app has no backend for yet, so it stays out of the shared card
 *     and rides in as a node.
 */
export function KaryaCard({
  cover,
  title,
  description,
  activity,
  stages,
  interests,
  roster,
  memberCount,
  screenshots,
  appreciate,
  onOpen,
}: {
  cover: string | null | undefined;
  title: string;
  description: string;
  activity?: KaryaCardActivity;
  stages: KaryaCardStage[];
  interests: string[];
  roster: KaryaCardFace[];
  /** Total members, when the roster is a truncated slice of them. */
  memberCount?: number;
  screenshots?: KaryaCardShot[];
  appreciate?: ReactNode;
  onOpen?: () => void;
}) {
  const shown = roster.slice(0, ROSTER_VISIBLE);
  const extra = (memberCount ?? roster.length) - shown.length;

  const body = (
    <>
      {screenshots && screenshots.length > 0 && (
        <section
          className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto rounded-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`Tangkapan layar ${title}`}
        >
          {screenshots.map((s) => (
            <img
              key={s.key}
              className="block h-[137px] w-[242px] shrink-0 snap-start rounded-card border border-line object-cover"
              src={s.src}
              alt={s.alt ?? ""}
              aria-hidden={s.alt ? undefined : true}
              loading="lazy"
            />
          ))}
        </section>
      )}

      <div className="flex gap-3.5">
        <KaryaCover src={cover} size={56} radius={14} />
        <div className="min-w-0 flex-1">
          {activity && (
            <div className="mb-1 flex items-center gap-1.5 font-body text-micro tracking-tag">
              <span className="font-medium text-accent-mid">
                {activity.text}
              </span>
              <span className="text-ink3" aria-hidden="true">
                ·
              </span>
              <span className="text-ink3">{activity.time}</span>
            </div>
          )}

          <div className="mb-1 flex flex-wrap items-baseline gap-2">
            <h3 className="m-0 font-display text-title font-regular leading-heading text-ink">
              {title}
            </h3>
            {stages.map((s) => (
              <Tag key={s.label} label={s.label} accent={s.accent} />
            ))}
          </div>

          <p className="m-0 mb-2.5 font-body text-body leading-body text-ink2">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap gap-1">
              {interests.map((i) => (
                <Tag key={i} label={i} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center [&>*+*]:-ml-2">
                {shown.map((m) => (
                  <Avatar key={m.key} name={m.name} image={m.image} size={22} />
                ))}
                {extra > 0 && (
                  <span className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-line font-body text-micro text-ink2">
                    +{extra}
                  </span>
                )}
              </div>
              {appreciate}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (onOpen) {
    return (
      // biome-ignore lint/a11y/useSemanticElements: contains block children, can't use <button>
      <div
        className={cn(card, linkCard)}
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => e.key === "Enter" && onOpen()}
      >
        {body}
      </div>
    );
  }
  return <article className={card}>{body}</article>;
}
