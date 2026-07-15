/**
 * Al-Fath Berkarya — Scroll
 *
 * The community's update feed: karya updates (data/updates.ts) surfaced across
 * every project, newest first, tuned by the interests you follow. Scroll owns no
 * posts — each update's home is its karya's page; this is the aggregated view.
 *
 * Two principles shape it, both visible in the markup:
 *   1. Productive posting only. Every row is a *kind of progress* (rilis, tonggak,
 *      progres, riset, ajakan), never chatter — so there is no reply box. Chat
 *      lives in each karya's WhatsApp group, out of band; the rail says so.
 *   2. The karya is the account. A post leads with the karya logo; the contributor
 *      who wrote it is a small avatar dipping into the logo's corner.
 */

import { useMemo, useState } from "react";
import { Avatar, KaryaCover, Tag } from "@myapp/ui";
import { T, eyebrow } from "@myapp/design-tokens";
import { NavFilterList } from "../components/LeftNav";
import { Shell } from "../components/Shell";
import { KIND_META, resolveUpdates, type ResolvedUpdate } from "../data/updates";
import { coverFor, screenshots as fallbackShots } from "../lib/images";
import { relativeTime } from "../lib/format";

const INTEREST_FILTERS = ["Semua", "Web", "Mobile", "AI/ML", "UMKM", "Edukasi", "Komunitas", "Open Source"] as const;
type Interest = (typeof INTEREST_FILTERS)[number];

// ─── Kind badge — you post a *kind of progress*, and the feed says which ─────────
function KindBadge({ kind }: { kind: ResolvedUpdate["update"]["kind"] }) {
  const meta = KIND_META[kind];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "2px 9px",
      borderRadius: 99,
      fontFamily: T.fontBody,
      fontSize: T.size.micro,
      fontWeight: T.weight.medium,
      letterSpacing: T.track.tag,
      color: meta.accent ? T.accent : T.ink2,
      backgroundColor: meta.accent ? T.accentTint : T.bg,
      border: `1px solid ${meta.accent ? T.accentLine : T.line}`,
      whiteSpace: "nowrap" as const,
    }}>
      <span aria-hidden="true" style={{ fontSize: 9, lineHeight: 1 }}>{meta.glyph}</span>
      {meta.label}
    </span>
  );
}

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

// ─── A single surfaced update ───────────────────────────────────────────────────
function ScrollPost({ resolved, appreciated, onAppreciate }: {
  resolved: ResolvedUpdate;
  appreciated: boolean;
  onAppreciate: (id: number) => void;
}) {
  const { update, karya, author } = resolved;
  const cover = coverFor(karya.interests);
  const shots = update.shots ? (karya.landscapeScreenshots ?? fallbackShots).slice(0, 2) : [];

  return (
    <article style={{
      padding: "18px 0",
      borderBottom: `1px solid ${T.line}`,
      display: "flex",
      gap: 14,
    }}>
      <PostIdentity cover={cover} karyaTitle={karya.title} authorName={author.name} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header: karya name is the byline; the person is the dip below it */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" as const }}>
          <span style={{ fontFamily: T.fontDisplay, fontSize: T.size.title, fontWeight: T.weight.regular, color: T.ink, lineHeight: T.lh.heading }}>
            {karya.title}
          </span>
          <KindBadge kind={update.kind} />
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginLeft: "auto", whiteSpace: "nowrap" as const }}>
            {relativeTime(update.hoursAgo)}
          </span>
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginTop: 1 }}>
          diposting {author.name}
        </div>

        {/* Body — the substantive update */}
        <p style={{ margin: "9px 0 0", fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink, lineHeight: T.lh.body }}>
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

        {/* Footer — appreciation + tags + jump to the karya. No reply: chat is on WhatsApp. */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" as const }}>
          <AppreciateButton
            count={karya.appreciations + (appreciated ? 1 : 0)}
            active={appreciated}
            onClick={() => onAppreciate(update.id)}
          />
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
            {karya.interests.slice(0, 3).map((i) => <Tag key={i} label={i} />)}
          </div>
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
      </div>
    </article>
  );
}

// ─── Right rail ─────────────────────────────────────────────────────────────────
function RightRail({ feed }: { feed: ResolvedUpdate[] }) {
  const openAsks = feed.filter((r) => r.update.kind === "ajakan");
  const postingThisWeek = new Set(feed.map((r) => r.karya.id)).size;

  return (
    <aside className="bn-rail" style={{ width: 232, flexShrink: 0, display: "flex", flexDirection: "column" as const, gap: 20 }}>
      {/* Where the chatter goes — the principle, made explicit */}
      <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.radiusPanel, padding: "13px 15px" }}>
        <div style={{ ...eyebrow, marginBottom: 7 }}>Cuma progres di sini</div>
        <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2, lineHeight: T.lh.body }}>
          Scroll khusus kabar progres karya. Obrolan, tanya-jawab, dan koordinasi harian ada di grup WhatsApp masing-masing karya.
        </p>
      </div>

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

      {/* Pulse */}
      <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.radiusPanel, padding: "12px 14px" }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Denyut minggu ini</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {[
            { label: "Kabar progres", value: feed.length },
            { label: "Karya yang posting", value: postingThisWeek },
            { label: "Slot kolaborasi", value: openAsks.length },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>{stat.label}</span>
              <span style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, fontVariantNumeric: "tabular-nums", color: T.ink }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────────
export default function ScrollScreen() {
  const [filter, setFilter] = useState<Interest>("Semua");
  const [appreciated, setAppreciated] = useState<Set<number>>(new Set());

  const feed = useMemo(() => {
    const all = resolveUpdates();
    return filter === "Semua" ? all : all.filter((r) => r.karya.interests.includes(filter));
  }, [filter]);

  function toggleAppreciate(id: number) {
    setAppreciated((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <Shell
      active="scroll"
      navFilters={
        <NavFilterList
          label="Minat kamu"
          options={INTEREST_FILTERS.map((f) => ({ value: f, label: f }))}
          active={filter}
          onSelect={setFilter}
        />
      }
    >
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
              Belum ada kabar untuk minat ini — coba minat lain.
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
