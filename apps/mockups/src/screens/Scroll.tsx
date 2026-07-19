/**
 * Al-Fath Berkarya — Scroll
 *
 * The community's update feed: karya updates (data/updates.ts) surfaced across
 * every project, newest first, tuned by the interests you follow. Scroll owns no
 * posts — each update's home is its karya's page; this is the aggregated view.
 *
 * Two principles shape it, both visible in the markup:
 *   1. Productive posting only. Every *post* is a unit of progress — shipped, hit a
 *      milestone, opened a slot — never chatter. The `kind` behind that is no longer
 *      badged (the headline carries the news; five labels only competed with it),
 *      but it still sorts an "ajakan" into the rail's open slots.
 *
 *      The principle governs what may be *posted*, not whether people may talk.
 *      Conversation hangs off the update it is about (content-model.md), so a post
 *      shows its thread's newest message and the rail points at the busy threads —
 *      but neither is a composer. There is nowhere in Scroll to type: every reply
 *      affordance is a doorway to the thread's home on the karya's page, and
 *      day-to-day coordination stays in each karya's WhatsApp group, out of band.
 *   2. The karya is the account. A post leads with the karya logo; the contributor
 *      who typed it is a small avatar dipping into the logo's corner.
 */

import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Avatar, KaryaCover, MainColumn, RailColumn } from "@myapp/ui";

import { Composer } from "../components/Composer";
import { Shell } from "../components/Shell";
import { MEMBERS, type Member } from "../data/karya";
import {
  ACTIVE_WINDOW_MIN,
  activeDiscussions,
  resolveUpdates,
  type ActiveDiscussion,
  type LatestMessage,
  type ResolvedUpdate,
} from "../data/updates";
import { coverFor, screenshots as fallbackShots } from "../lib/images";
import { relativeMinutes, relativeTime } from "../lib/format";

// ─── Post identity — the karya leads, the author dips into its corner ────────────
// This is the platform's signature: the post is authored by the *project*, not the
// person. The karya logo is the face; the contributor is a small avatar overlapping
// the bottom-right, ringed in surface so it reads as sitting on top.
function PostIdentity({ cover, karyaTitle, authorName }: { cover: string; karyaTitle: string; authorName: string }) {
  return (
    <div className="relative size-12 shrink-0">
      <KaryaCover src={cover} size={46} radius={13} alt={`Logo ${karyaTitle}`} />
      <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-surface leading-none shadow-[0_0_0_2px_var(--color-surface)]">
        <Avatar name={authorName} size={17} />
      </span>
    </div>
  );
}

// ─── Facepile — who is talking, in miniature ────────────────────────────────────
// Shared by the post and the rail. The faces make a thread read as a conversation
// rather than a counter. Latest speaker leads and they overlap in that order; the
// ring punches each one out of the page background (T.bg), not the card white.
function Facepile({ people, max = 3 }: { people: Member[]; max?: number }) {
  const shown = people.slice(0, max);
  return (
    <div className="flex shrink-0 items-center">
      {shown.map((p, i) => (
        <span
          key={p.id}
          className="rounded-full leading-none shadow-[0_0_0_1.5px_var(--color-bg)]"
          style={{ marginLeft: i === 0 ? 0 : -5, zIndex: shown.length - i }}
        >
          <Avatar name={p.name} size={16} />
        </span>
      ))}
    </div>
  );
}

// ─── Appreciation — the only reaction; a warm signal, never a ranking input ──────
function AppreciateButton({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Apresiasi (${count})`}
      className={[
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-[11px] py-[5px] font-body text-caption font-medium transition-all duration-150",
        active
          ? "border-accent bg-accent-tint text-accent"
          : "border-line bg-transparent text-ink2",
      ].join(" ")}
    >
      <span className="text-ui leading-none">{active ? "♥" : "♡"}</span>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}

// ─── Comment count — the thread's size, beside the only reaction ────────────────
// Appreciation stays the sole *reaction*; this is a doorway, not a second verdict.
function CommentCount({ count }: { count: number }) {
  return (
    <button
      type="button"
      aria-label={`${count} komentar`}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-transparent px-[11px] py-[5px] font-body text-caption font-medium text-ink2 transition-all duration-150"
    >
      <MessageCircle size={13} strokeWidth={2} aria-hidden="true" />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}

/** "Dian", "Dian & Nadia", "Dian & 3 lainnya" — first names; the faces carry the rest. */
function voiceSummary(voices: Member[]): string {
  const [first, ...rest] = voices;
  const name = first.name.split(" ")[0];
  if (rest.length === 0) return name;
  if (rest.length === 1) return `${name} & ${rest[0].name.split(" ")[0]}`;
  return `${name} & ${rest.length} lainnya`;
}

// ─── The thread's newest message, shown under the post ──────────────────────────
// A glimpse, not a composer: the feed still has nowhere to type. "Balas" is a
// doorway into the thread on the karya's page, where the conversation lives.
function CommentPreview({ author, latest }: { author: Member; latest: LatestMessage }) {
  return (
    <div className="mt-[13px] flex gap-2.5 border-t border-line pt-[13px]">
      <Avatar name={author.name} size={28} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-[7px]">
          <span className="font-body text-ui font-medium text-ink">{author.name}</span>
          <span className="font-body text-micro text-ink3">{relativeMinutes(latest.minutesAgo, true)}</span>
        </div>
        <p className="mt-0.5 font-body text-ui leading-body text-ink2">
          {latest.body}
        </p>
        <div className="mt-[7px] flex items-center gap-3.5">
          <button type="button" className="border-none bg-none p-0 font-body text-micro font-medium text-ink3 cursor-pointer">Suka · {latest.likes}</button>
          <button type="button" className="border-none bg-none p-0 font-body text-micro font-medium text-ink3 cursor-pointer">Balas</button>
        </div>
      </div>
    </div>
  );
}

// ─── A single surfaced update ───────────────────────────────────────────────────
function ScrollPost({ resolved, appreciated, onAppreciate }: {
  resolved: ResolvedUpdate;
  appreciated: boolean;
  onAppreciate: (id: number) => void;
}) {
  const { update, karya, author, voices } = resolved;
  const cover = coverFor(karya.interests);
  const shots = update.shots ? (karya.landscapeScreenshots ?? fallbackShots).slice(0, 2) : [];
  const discussion = update.discussion;

  return (
    <article
      className="bn-post flex gap-3.5 border-b border-line py-[18px]"
    >
      <PostIdentity cover={cover} karyaTitle={karya.title} authorName={author.name} />

      <div className="min-w-0 flex-1">
        {/* Byline: the karya. Who typed it and when sit quietly underneath. */}
        <div className="font-display text-title font-normal leading-heading text-ink">
          {karya.title}
        </div>
        <div className="mt-px font-body text-micro text-ink3">
          diposting {author.name} · {relativeTime(update.hoursAgo)}
        </div>

        {/* The headline carries the news; the body carries the detail */}
        <h3 className="mt-2.5 font-body text-body font-medium text-ink">
          {update.title}
        </h3>
        <p className="mt-1 font-body text-body leading-body text-ink2">
          {update.body}
        </p>

        {/* Ajakan — the open role, made concrete */}
        {update.role && (
          <div className="mt-2.5 inline-flex items-center gap-2 rounded-card border border-accent-line bg-accent-tint px-3 py-1.5">
            <span className="eyebrow !text-accent-mid">Butuh</span>
            <span className="font-body text-ui font-medium text-accent">{update.role}</span>
          </div>
        )}

        {/* Screenshots */}
        {shots.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {shots.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${karya.title} — layar ${i + 1}`}
                className="h-32 w-auto shrink-0 rounded-[10px] border border-line-dark bg-bg"
              />
            ))}
          </div>
        )}

        {/* Footer — appreciate, and the thread. */}
        <div className="mt-3.5 flex items-center gap-2.5">
          <AppreciateButton
            count={karya.appreciations + (appreciated ? 1 : 0)}
            active={appreciated}
            onClick={() => onAppreciate(update.id)}
          />
          <CommentCount count={discussion?.total ?? 0} />
        </div>

        {/* Who's in there, then the newest thing said — the thread, seen through a window */}
        {discussion && voices.length > 0 && (
          <>
            <div className="mt-3 flex items-center gap-[7px]">
              <Facepile people={voices} />
              <span className="font-body text-micro text-ink3">
                {voiceSummary(voices)} berkomentar
              </span>
            </div>
            <CommentPreview author={voices[0]} latest={discussion.latest} />
          </>
        )}
      </div>
    </article>
  );
}

// ─── Diskusi aktif — the threads burning right now ──────────────────────────────
// A pointer to where the talking is, never a place to talk: a thread's home is the
// update it hangs off, and this block just says which ones are hot.

function ActiveDiscussions({ discussions }: { discussions: ActiveDiscussion[] }) {
  if (discussions.length === 0) return null;

  return (
    <div>
      {/* The dot carries the "live" claim for the whole block; the arrow is the way in */}
      <div className="mb-2.5 flex items-center gap-[7px]">
        <span className="bn-live-dot" aria-hidden="true" />
        <div className="eyebrow">Diskusi aktif</div>
        <button
          type="button"
          aria-label={`Lihat semua diskusi aktif (${ACTIVE_WINDOW_MIN} menit terakhir)`}
          className="ml-auto cursor-pointer border-none bg-none p-0 font-body text-ui leading-none text-accent-mid"
        >
          →
        </button>
      </div>

      <div className="flex flex-col gap-0">
        {discussions.map(({ resolved: { update, karya, voices }, discussion }, idx) => (
          <div
            key={update.id}
            className="flex items-start gap-2.5 py-[11px]"
            style={{ borderBottom: idx < discussions.length - 1 ? "1px solid var(--color-line)" : "none" }}
          >
            <KaryaCover src={coverFor(karya.interests)} size={32} radius={9} alt={karya.title} />
            <div className="min-w-0 flex-1">
              {/* The byline is the karya — the people are in the facepile below */}
              <div className="flex items-baseline gap-1.5">
                <span className="overflow-hidden text-ellipsis whitespace-nowrap font-body text-ui font-medium text-ink">
                  {karya.title}
                </span>
                <span className="ml-auto shrink-0 whitespace-nowrap font-body text-micro tabular-nums text-ink3">
                  {relativeMinutes(discussion.latest.minutesAgo, true)}
                </span>
              </div>

              {/* The post they're talking under — clamped */}
              <p className="mt-[3px] line-clamp-2 font-body text-micro leading-body text-ink2">
                {update.body}
              </p>

              {voices.length > 0 && (
                <div className="mt-[7px] flex items-center gap-1.5">
                  <Facepile people={voices} />
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap font-body text-micro text-ink3">
                    {voices[0].name.split(" ")[0]} berkomentar
                  </span>
                  <span aria-hidden="true" className="ml-auto text-micro text-accent-mid">→</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Kenalan dengan builder — a "who to meet" browse strip ──────────────────────
// Relocated from People's rail: while Scroll is about karya progress, meeting the
// builders behind them belongs alongside the feed.
function BuildersToMeet() {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="eyebrow">Kenalan dengan builder</div>
        <button type="button" className="cursor-pointer border-none bg-none p-0 font-body text-micro text-accent-mid">Lihat semua</button>
      </div>

      <div className="flex flex-col gap-0">
        {MEMBERS.map((m, idx) => (
          <div
            key={m.id}
            className="flex items-start gap-2.5 py-2.5"
            style={{ borderBottom: idx < MEMBERS.length - 1 ? "1px solid var(--color-line)" : "none" }}
          >
            <Avatar name={m.name} size={32} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="font-body text-ui font-medium text-ink">{m.name}</span>
                <span className="font-body text-micro text-ink3">{m.karya} karya</span>
              </div>
              <div className="mb-1 font-body text-micro text-ink3">{m.handle} · Tkt {m.year}</div>
              <div className="flex flex-wrap gap-1">
                {m.skills.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-[3px] border border-line bg-bg px-[5px] py-px font-body text-micro text-ink2">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Right rail ─────────────────────────────────────────────────────────────────
// Reads top to bottom as: join a karya → join a conversation → meet a person.
function RightRail({ feed }: { feed: ResolvedUpdate[] }) {
  const openAsks = feed.filter((r) => r.update.kind === "ajakan");
  const discussions = useMemo(() => activeDiscussions(feed), [feed]);

  return (
    <RailColumn className="flex flex-col gap-5">
      {/* Open collaborator slots — surfaced from ajakan updates */}
      {openAsks.length > 0 && (
        <div>
          <div className="eyebrow mb-2.5">Slot kolaborasi terbuka</div>
          <div className="flex flex-col gap-0">
            {openAsks.map(({ update, karya }, idx) => (
              <div key={update.id} className="flex items-center gap-2.5 py-2.5" style={{ borderBottom: idx < openAsks.length - 1 ? "1px solid var(--color-line)" : "none" }}>
                <KaryaCover src={coverFor(karya.interests)} size={30} radius={9} alt={karya.title} />
                <div className="min-w-0 flex-1">
                  <div className="font-body text-ui font-medium text-ink">{update.role}</div>
                  <div className="font-body text-micro text-ink3">{karya.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Where the talking is right now */}
      <ActiveDiscussions discussions={discussions} />

      {/* Meet the builders behind the karya — relocated from People's rail */}
      <BuildersToMeet />
    </RailColumn>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────────
export default function ScrollScreen() {
  const [appreciated, setAppreciated] = useState<Set<number>>(new Set());

  const feed = useMemo(() => resolveUpdates(), []);

  function toggleAppreciate(id: number) {
    setAppreciated((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <Shell active="scroll">
      <MainColumn className="flex flex-col">
        {/* Header */}
        <div className="mb-1.5">
          <div className="flex items-baseline gap-2.5">
            <h1 className="m-0 font-display text-display font-normal tracking-heading text-ink">Scroll</h1>
            <span className="font-body text-caption text-ink3">Kabar progres dari karya yang kamu ikuti</span>
          </div>
        </div>

        {/* The one place in Scroll you can type. */}
        <div className="mt-4">
          <Composer />
        </div>

        {/* Feed */}
        <div className="flex flex-col">
          {feed.length === 0 ? (
            <div className="py-8 text-center font-body text-body text-ink3">
              Belum ada kabar progres.
            </div>
          ) : (
            feed.map((r) => (
              <ScrollPost
                key={r.update.id}
                resolved={r}
                appreciated={appreciated.has(r.update.id)}
                onAppreciate={toggleAppreciate}
              />
            ))
          )}
        </div>
      </MainColumn>

      <RightRail feed={feed} />
    </Shell>
  );
}
