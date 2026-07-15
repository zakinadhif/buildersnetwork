import type { ReactNode } from "react";
import { Avatar } from "./Avatar";
import { KaryaCover } from "./KaryaCover";
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
          className="karya-card-shots"
          aria-label={`Tangkapan layar ${title}`}
        >
          {screenshots.map((s) => (
            <img
              key={s.key}
              className="karya-card-shot"
              src={s.src}
              alt={s.alt ?? ""}
              aria-hidden={s.alt ? undefined : true}
              loading="lazy"
            />
          ))}
        </section>
      )}

      <div className="karya-card-row">
        <KaryaCover src={cover} size={56} radius={14} />
        <div className="karya-card-body">
          {activity && (
            <div className="karya-card-activity">
              <span className="karya-card-activity-what">{activity.text}</span>
              <span className="karya-card-activity-when" aria-hidden="true">
                ·
              </span>
              <span className="karya-card-activity-when">{activity.time}</span>
            </div>
          )}

          <div className="karya-card-head">
            <h3 className="karya-card-title">{title}</h3>
            {stages.map((s) => (
              <Tag key={s.label} label={s.label} accent={s.accent} />
            ))}
          </div>

          <p className="karya-card-desc">{description}</p>

          <div className="karya-card-foot">
            <div className="karya-card-interests">
              {interests.map((i) => (
                <Tag key={i} label={i} />
              ))}
            </div>
            <div className="karya-card-side">
              <div className="karya-card-roster">
                {shown.map((m) => (
                  <Avatar key={m.key} name={m.name} image={m.image} size={22} />
                ))}
                {extra > 0 && <span className="karya-card-more">+{extra}</span>}
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
        className="karya-card"
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => e.key === "Enter" && onOpen()}
      >
        {body}
      </div>
    );
  }
  return <article className="karya-card">{body}</article>;
}
