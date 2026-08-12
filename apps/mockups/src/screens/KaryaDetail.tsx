/**
 * Al-Fath Berkarya — Detail Karya  ·  issue #103
 *
 * The page every feed & featured card funnels into (`/karya/:id`). Now it lives
 * *inside* the shared shell — same left rail as the surfaces it's reached from —
 * rather than as a standalone page, so drilling into a karya keeps the product
 * frame. The center column is the reading surface (cover, roster, stages,
 * screenshot gallery, update stream); the sticky right rail carries the actions.
 *
 * A floating review pane previews the owner affordances (tulis kabar, feature,
 * kelola tim) vs. the visitor's read-only P0 view, plus loading, no-media, and
 * not-found states. Review controls never occupy the product columns.
 *
 * The composer at the stream's head is the shared one now (components/Composer),
 * handed this karya. It replaces a local box that led with a person's avatar and
 * a textarea — "bagikan progres, milestone, atau minta bantuan…" — and which had
 * quietly drifted: it carried its own `Kind` vocabulary, offering "Milestone" and
 * "Butuh bantuan" where updates.ts said "tonggak" and "ajakan", with no "riset" at
 * all. Two composers, two vocabularies, and nothing forcing them to agree. The
 * P0 updates are body-only, so the seeded stream deliberately carries no
 * headline or kind chip.
 */

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Avatar, KaryaCover, Tag, MainColumn, RailColumn, cn } from "@myapp/ui";
import { Composer } from "../components/Composer";
import { PreviewStates } from "../components/PreviewStates";
import { Shell } from "../components/Shell";
import { KARYA } from "../data/karya";
import { COMMENTS, COMMENT_AUTHORS, POSTS } from "../data/comments";
import { useNavigate } from "../gallery";
import { coverFor, screenshots } from "../lib/images";
import { relativeTime } from "../lib/format";
import { Eyebrow } from "@myapp/ui";

const KARYA_ITEM = KARYA[0]; // KampusKerja — featured, two-person roster
type ViewerRole = "owner" | "community" | "signed-out";

function KaryaUpdatePost({
  id,
  author,
  body,
  hoursAgo,
  onOpen,
}: {
  id: number;
  author: string;
  body: string;
  hoursAgo: number;
  onOpen: () => void;
}) {
  const cover = coverFor(KARYA_ITEM.interests);
  const comments = COMMENTS.filter((comment) => comment.postId === id);
  const latest = comments[comments.length - 1];

  return (
    <article className="bn-post flex gap-3.5 border-b border-line py-[18px]">
      <div className="relative size-12 shrink-0">
        <KaryaCover src={cover} size={46} radius={13} alt={`Logo ${KARYA_ITEM.title}`} />
        <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-surface leading-none shadow-[0_0_0_2px_var(--color-surface)]">
          <Avatar name={author} size={17} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-title font-normal leading-heading text-ink">
          {KARYA_ITEM.title}
        </div>
        <div className="mt-px font-body text-micro text-ink3">
          diposting {author} · {relativeTime(hoursAgo)}
        </div>
        <p className="mt-2.5 font-body text-body leading-body text-ink2">{body}</p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-3 flex w-full cursor-pointer items-start gap-2.5 border-none border-t border-line bg-transparent pt-3 text-left"
        >
          <MessageCircle size={13} className="mt-0.5 shrink-0 text-ink3" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block font-body text-caption font-medium text-ink2">
              {comments.length > 0 ? `${comments.length} komentar` : "Belum ada komentar"}
            </span>
            {latest && (
              <span className="mt-1 block font-body text-ui leading-body text-ink3">
                <strong className="font-medium text-ink2">{COMMENT_AUTHORS[latest.authorId]}</strong> · {latest.body}
              </span>
            )}
            <span className="mt-1.5 block font-body text-micro font-medium text-accent-mid">
              {comments.length > 0 ? "Lihat percakapan →" : "Beri komentar →"}
            </span>
          </span>
        </button>
      </div>
    </article>
  );
}

// ─── Rail actions ────────────────────────────────────────────────────────────
// Full-width, stacked to fit the 232px rail — the same affordances the old
// standalone action bar carried, now sticky beside the reading column.
function RailActions({ owner, featured, onToggleFeatured }: {
  owner: boolean;
  featured: boolean;
  onToggleFeatured: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {owner ? (
        <>
          <button
            type="button"
            onClick={onToggleFeatured}
            aria-pressed={featured}
            className={cn(
              "w-full cursor-pointer rounded-card border px-4 py-[9px] text-center font-body text-ui font-medium",
              featured
                ? "border-accent bg-accent-tint text-accent"
                : "border-line bg-transparent text-ink",
            )}
          >
            {featured ? "✦ Jadi unggulan" : "✦ Tandai unggulan"}
          </button>
          <button type="button" className="w-full cursor-pointer rounded-card border border-line bg-transparent px-4 py-[9px] text-center font-body text-ui font-medium text-ink">Kelola tim</button>
          <button type="button" className="w-full cursor-pointer rounded-card border border-line bg-transparent px-4 py-[9px] text-center font-body text-ui font-medium text-ink">Sunting</button>
        </>
      ) : (
        <p className="m-0 rounded-card border border-line bg-surface px-3.5 py-3 font-body text-caption leading-body text-ink2">
          Karya ini dibagikan untuk dilihat komunitas. Aksi kolaborasi hadir pada milestone P1.
        </p>
      )}
    </div>
  );
}

// ─── Role toggle (gallery affordance) ────────────────────────────────────────
function RoleToggle({ role, onChange }: { role: ViewerRole; onChange: (role: ViewerRole) => void }) {
  return (
    <div className="flex gap-0.5 rounded-full border border-line bg-surface p-[3px]">
      {([["owner", "Owner"], ["community", "Komunitas"], ["signed-out", "Tamu"]] as const).map(([val, label]) => {
        const on = val === role;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            aria-pressed={on}
            className={cn(
              "flex-1 cursor-pointer rounded-full border-none px-3 py-[5px] font-body text-micro",
              on ? "bg-ink text-bg font-medium" : "bg-transparent text-ink2 font-normal",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function KaryaDetailScreen() {
  const navigate = useNavigate();
  const [role, setRole] = useState<ViewerRole>("community");
  const [featured, setFeatured] = useState(!!KARYA_ITEM.featured);
  const [detailState, setDetailState] = useState<"ready" | "no-media" | "loading" | "not-found">("ready");
  const owner = role === "owner";
  const k = KARYA_ITEM;

  if (detailState === "loading" || detailState === "not-found") {
    return (
      <Shell active="karya-detail">
        <MainColumn>
          <button type="button" className="mb-6 cursor-pointer border-none bg-none p-0 font-body text-ui text-ink2">
            ← Balik
          </button>
          {detailState === "loading" ? (
            <div role="status" className="space-y-4">
              <div className="h-[220px] animate-pulse rounded-panel bg-surface" />
              <div className="h-9 w-2/3 animate-pulse rounded-card bg-surface" />
              <div className="h-20 animate-pulse rounded-card bg-surface" />
            </div>
          ) : (
            <div className="rounded-panel border border-line bg-surface px-6 py-10 text-center">
              <Eyebrow as="div" className="mb-3">404 · Karya tidak ditemukan</Eyebrow>
              <h1 className="mb-2 mt-0 font-display text-feature font-normal text-ink">
                Halamannya belum bisa dibuka.
              </h1>
              <p className="m-0 font-body text-body leading-body text-ink2">
                Karya mungkin sudah dihapus atau tautannya tidak lengkap. Kembali ke katalog untuk mencari yang lain.
              </p>
            </div>
          )}
        </MainColumn>
        <RailColumn>
          <PreviewStates
            label="State halaman"
            value={detailState}
            onChange={setDetailState}
            options={[
              { value: "ready", label: "Lengkap" },
              { value: "no-media", label: "Tanpa media" },
              { value: "loading", label: "Loading" },
              { value: "not-found", label: "404" },
            ]}
          >
            <Eyebrow as="div" className="mb-2">Peran</Eyebrow>
            <RoleToggle role={role} onChange={setRole} />
          </PreviewStates>
        </RailColumn>
      </Shell>
    );
  }

  return (
    <Shell active="karya-detail">
      {/* Reading column */}
      <MainColumn>
        {/* Back to the feed the card funnelled from */}
        <button type="button" className="mb-5 cursor-pointer border-none bg-none p-0 font-body text-ui text-ink2">
          ← Balik
        </button>

        {/* Cover */}
        {detailState === "no-media" ? (
          <div className="flex h-[160px] items-center justify-center rounded-panel border border-line bg-surface">
            <span className="font-display text-feature text-ink3">{k.title.slice(0, 1)}</span>
          </div>
        ) : (
          <img
            src={coverFor(k.interests)}
            alt={k.title}
            className="block h-[220px] w-full rounded-panel border border-line object-cover"
          />
        )}

        {/* Title block */}
        <div className="my-[22px] mb-2.5 flex flex-wrap items-center gap-2">
          {featured && <Eyebrow as="span" className="!text-accent">Unggulan</Eyebrow>}
          {k.stages.map((s) => <Eyebrow as="span" key={s}>{s}</Eyebrow>)}
        </div>
        <h1 className="mb-3 mt-0 font-display text-display font-normal tracking-heading leading-heading text-ink">
          {k.title}
        </h1>

        {/* Roster */}
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex">
            {k.roster.map((r, i) => (
              <span key={r.handle} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: k.roster.length - i }}>
                <Avatar name={r.name} size={30} />
              </span>
            ))}
          </div>
          <span className="font-body text-ui text-ink2">
            {k.roster.map((r) => r.name).join(" · ")}
          </span>
        </div>

        <p className="m-0 font-body text-body leading-body text-ink2">
          {k.description}
        </p>

        <div className="mt-3.5 flex flex-wrap gap-1">
          {k.interests.map((i) => <Tag key={i} label={i} />)}
        </div>

        {/* Screenshots */}
        <Eyebrow className="mb-3 mt-[34px]">Tangkapan layar</Eyebrow>
        {detailState === "no-media" ? (
          <p className="m-0 rounded-card border border-dashed border-line-dark px-4 py-5 font-body text-body text-ink3">
            Belum ada tangkapan layar. Update karya tetap bisa dibaca di bawah.
          </p>
        ) : (
          <div
            className="flex gap-3 overflow-x-auto pb-1.5"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {screenshots.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${k.title} — layar ${i + 1}`}
                className="h-[300px] w-auto shrink-0 rounded-[14px] border border-line bg-bg"
                style={{ scrollSnapAlign: "start" }}
              />
            ))}
          </div>
        )}

        {/* Update stream. The composer sits at its head, where the old one did:
            this stream is the karya's progress log, and writing a kabar is adding
            to it — the one place on this page where that reads as the same act.
            Handed this karya, so there is nothing to pick. */}
        <Eyebrow className="mb-3 mt-[34px]">Update terbaru</Eyebrow>
        {owner && (
          <div className="mb-5">
            <Composer karya={KARYA_ITEM} />
          </div>
        )}
        <div className="flex flex-col">
          {POSTS.map((p) => (
            <KaryaUpdatePost key={p.id} id={p.id} author={p.author} body={p.body} hoursAgo={p.hoursAgo} onOpen={() => navigate("post-detail")} />
          ))}
        </div>
      </MainColumn>

      {/* Action rail */}
      <RailColumn className="flex flex-col gap-5">
        <PreviewStates
          label="State halaman"
          value={detailState}
          onChange={setDetailState}
          options={[
            { value: "ready", label: "Lengkap" },
            { value: "no-media", label: "Tanpa media" },
            { value: "loading", label: "Loading" },
            { value: "not-found", label: "404" },
          ]}
        >
          <Eyebrow as="div" className="mb-2">Peran</Eyebrow>
          <RoleToggle role={role} onChange={setRole} />
        </PreviewStates>

        <RailActions owner={owner} featured={featured} onToggleFeatured={() => setFeatured((f) => !f)} />

        {/* Meta */}
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex items-baseline justify-between">
            <Eyebrow as="span">Tahap</Eyebrow>
            <span className="font-body text-ui text-ink2">{k.stages[k.stages.length - 1]}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <Eyebrow as="span">Tim</Eyebrow>
            <span className="font-body text-ui text-ink2">{k.roster.length} orang</span>
          </div>
        </div>
      </RailColumn>
    </Shell>
  );
}
