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
 *      who wrote it is a small avatar dipping into the logo's corner.
 */

import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Avatar, KaryaCover } from "@myapp/ui";
import { T, eyebrow } from "@myapp/design-tokens";
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
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
      <KaryaCover src={cover} size={46} radius={13} alt={`Logo ${karyaTitle}`} />
      <span style={{
        position: "absolute",
        right: -5,
        bottom: -5,
        borderRadius: 99,
        boxShadow: `0 0 0 2px ${T.surface}`,
        background: T.surface,
        lineHeight: 0,
      }}>
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
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      {shown.map((p, i) => (
        <span
          key={p.id}
          style={{
            marginLeft: i === 0 ? 0 : -5,
            borderRadius: 99,
            boxShadow: `0 0 0 1.5px ${T.bg}`,
            lineHeight: 0,
            zIndex: shown.length - i,
          }}
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        border: `1px solid ${active ? T.accent : T.line}`,
        borderRadius: 99,
        backgroundColor: active ? T.accentTint : "transparent",
        color: active ? T.accent : T.ink2,
        cursor: "pointer",
        fontFamily: T.fontBody,
        fontSize: T.size.caption,
        fontWeight: T.weight.medium,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: T.size.ui, lineHeight: 1 }}>{active ? "♥" : "♡"}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{count}</span>
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        border: `1px solid ${T.line}`,
        borderRadius: 99,
        backgroundColor: "transparent",
        color: T.ink2,
        cursor: "pointer",
        fontFamily: T.fontBody,
        fontSize: T.size.caption,
        fontWeight: T.weight.medium,
        transition: "all 0.15s",
      }}
    >
      <MessageCircle size={13} strokeWidth={2} aria-hidden="true" />
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{count}</span>
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
  const action = {
    background: "none",
    border: "none",
    padding: 0,
    fontFamily: T.fontBody,
    fontSize: T.size.micro,
    fontWeight: T.weight.medium,
    color: T.ink3,
    cursor: "pointer",
  } as const;

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 13, paddingTop: 13, borderTop: `1px solid ${T.line}` }}>
      <Avatar name={author.name} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>{author.name}</span>
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>{relativeMinutes(latest.minutesAgo, true)}</span>
        </div>
        <p style={{ margin: "2px 0 0", fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2, lineHeight: T.lh.body }}>
          {latest.body}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 7 }}>
          <button type="button" style={action}>Suka · {latest.likes}</button>
          <button type="button" style={action}>Balas</button>
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
    <article style={{
      padding: "18px 0",
      borderBottom: `1px solid ${T.line}`,
      display: "flex",
      gap: 14,
    }}>
      <PostIdentity cover={cover} karyaTitle={karya.title} authorName={author.name} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Byline: the karya. Who typed it and when sit quietly underneath. */}
        <div style={{ fontFamily: T.fontDisplay, fontSize: T.size.title, fontWeight: T.weight.regular, color: T.ink, lineHeight: T.lh.heading }}>
          {karya.title}
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginTop: 1 }}>
          diposting {author.name} · {relativeTime(update.hoursAgo)}
        </div>

        {/* The headline carries the news; the body carries the detail */}
        <h3 style={{ margin: "10px 0 0", fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink }}>
          {update.title}
        </h3>
        <p style={{ margin: "4px 0 0", fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink2, lineHeight: T.lh.body }}>
          {update.body}
        </p>

        {/* Ajakan — the open role, made concrete */}
        {update.role && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
            padding: "6px 12px",
            borderRadius: T.radiusCard,
            border: `1px solid ${T.accentLine}`,
            background: T.accentTint,
          }}>
            <span style={{ ...eyebrow, color: T.accentMid }}>Butuh</span>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.accent }}>{update.role}</span>
          </div>
        )}

        {/* Screenshots */}
        {shots.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto" as const }}>
            {shots.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${karya.title} — layar ${i + 1}`}
                style={{ height: 128, width: "auto", flexShrink: 0, borderRadius: 10, border: `1px solid ${T.lineDark}`, background: T.bg }}
              />
            ))}
          </div>
        )}

        {/* Footer — appreciate, open the thread, jump to the karya. No interest tags:
            they describe the karya's standing state, which is the karya page's job;
            a feed carries what just happened. */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" as const }}>
          <AppreciateButton
            count={karya.appreciations + (appreciated ? 1 : 0)}
            active={appreciated}
            onClick={() => onAppreciate(update.id)}
          />
          <CommentCount count={discussion?.total ?? 0} />
          <button type="button" style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            fontWeight: T.weight.medium,
            color: T.accentMid,
            cursor: "pointer",
            whiteSpace: "nowrap" as const,
          }}>
            Lihat karya →
          </button>
        </div>

        {/* Who's in there, then the newest thing said — the thread, seen through a window */}
        {discussion && voices.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12 }}>
              <Facepile people={voices} />
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
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
// update it hangs off, and this block just says which ones are hot. Membership is
// earned, not curated — a burst inside the window (data/updates.ts) puts a thread
// here and cooling takes it out, so the block turns over on its own.

function ActiveDiscussions({ discussions }: { discussions: ActiveDiscussion[] }) {
  if (discussions.length === 0) return null;

  return (
    <div>
      {/* The dot carries the "live" claim for the whole block; the arrow is the way in */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <span className="bn-live-dot" aria-hidden="true" />
        <div style={eyebrow}>Diskusi aktif</div>
        <button
          type="button"
          aria-label={`Lihat semua diskusi aktif (${ACTIVE_WINDOW_MIN} menit terakhir)`}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            color: T.accentMid,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          →
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {discussions.map(({ resolved: { update, karya, voices }, discussion }, idx) => (
          <div
            key={update.id}
            style={{
              display: "flex",
              gap: 10,
              padding: "11px 0",
              borderBottom: idx < discussions.length - 1 ? `1px solid ${T.line}` : "none",
              alignItems: "flex-start",
            }}
          >
            <KaryaCover src={coverFor(karya.interests)} size={32} radius={9} alt={karya.title} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* The byline is the karya — the people are in the facepile below */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{
                  fontFamily: T.fontBody,
                  fontSize: T.size.ui,
                  fontWeight: T.weight.medium,
                  color: T.ink,
                  whiteSpace: "nowrap" as const,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {karya.title}
                </span>
                <span style={{
                  marginLeft: "auto",
                  whiteSpace: "nowrap" as const,
                  fontFamily: T.fontBody,
                  fontSize: T.size.micro,
                  color: T.ink3,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {relativeMinutes(discussion.latest.minutesAgo, true)}
                </span>
              </div>

              {/* The post they're talking under — clamped; the thread is the point, not the post */}
              <p style={{
                margin: "3px 0 0",
                fontFamily: T.fontBody,
                fontSize: T.size.micro,
                color: T.ink2,
                lineHeight: T.lh.body,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical" as const,
                WebkitLineClamp: 2,
                overflow: "hidden",
              }}>
                {update.body}
              </p>

              {voices.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
                  <Facepile people={voices} />
                  <span style={{
                    fontFamily: T.fontBody,
                    fontSize: T.size.micro,
                    color: T.ink3,
                    whiteSpace: "nowrap" as const,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {voices[0].name.split(" ")[0]} berkomentar
                  </span>
                  <span aria-hidden="true" style={{ marginLeft: "auto", color: T.accentMid, fontSize: T.size.micro }}>→</span>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={eyebrow}>Kenalan dengan builder</div>
        <button type="button" style={{ background: "none", border: "none", padding: 0, fontFamily: T.fontBody, fontSize: T.size.micro, color: T.accentMid, cursor: "pointer" }}>Lihat semua</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {MEMBERS.map((m, idx) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              gap: 10,
              padding: "10px 0",
              borderBottom: idx < MEMBERS.length - 1 ? `1px solid ${T.line}` : "none",
              alignItems: "flex-start",
            }}
          >
            <Avatar name={m.name} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>{m.name}</span>
                <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>{m.karya} karya</span>
              </div>
              <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginBottom: 4 }}>{m.handle} · Tkt {m.year}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                {m.skills.slice(0, 3).map((s) => (
                  <span key={s} style={{
                    fontFamily: T.fontBody,
                    fontSize: T.size.micro,
                    color: T.ink2,
                    backgroundColor: T.bg,
                    border: `1px solid ${T.line}`,
                    padding: "1px 5px",
                    borderRadius: "3px",
                  }}>{s}</span>
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
    <aside className="bn-rail" style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
      {/* Open collaborator slots — surfaced from ajakan updates */}
      {openAsks.length > 0 && (
        <div>
          <div style={{ ...eyebrow, marginBottom: 10 }}>Slot kolaborasi terbuka</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {openAsks.map(({ update, karya }, idx) => (
              <div key={update.id} style={{
                display: "flex",
                gap: 10,
                padding: "10px 0",
                borderBottom: idx < openAsks.length - 1 ? `1px solid ${T.line}` : "none",
                alignItems: "center",
              }}>
                <KaryaCover src={coverFor(karya.interests)} size={30} radius={9} alt={karya.title} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>{update.role}</div>
                  <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>{karya.title}</div>
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
    </aside>
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
      <main className="bn-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const }}>
        {/* Header */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: T.size.display, fontWeight: T.weight.regular, letterSpacing: T.track.heading, color: T.ink }}>Scroll</h1>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3 }}>Kabar progres dari karya yang kamu ikuti</span>
          </div>
        </div>

        {/* Feed */}
        <div style={{ display: "flex", flexDirection: "column" as const }}>
          <div style={{ ...eyebrow, margin: "14px 0 2px" }}>Terbaru</div>
          {feed.length === 0 ? (
            <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink3, padding: "32px 0", textAlign: "center" as const }}>
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
      </main>

      <RightRail feed={feed} />
    </Shell>
  );
}
