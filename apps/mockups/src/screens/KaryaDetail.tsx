/**
 * Al-Fath Berkarya — Detail Karya  ·  issue #103
 *
 * The page every feed & featured card funnels into (`/karya/:id`). Now it lives
 * *inside* the shared shell — same left rail as the surfaces it's reached from —
 * rather than as a standalone page, so drilling into a karya keeps the product
 * frame. The center column is the reading surface (cover, roster, stages,
 * screenshot gallery, update stream); the sticky right rail carries the actions.
 *
 * A role toggle previews the owner affordances (tulis kabar, feature, kelola tim)
 * vs. the visitor's (gabung, apresiasi) — grounding #35's owner controls.
 *
 * The composer at the stream's head is the shared one now (components/Composer),
 * handed this karya. It replaces a local box that led with a person's avatar and
 * a textarea — "bagikan progres, milestone, atau minta bantuan…" — and which had
 * quietly drifted: it carried its own `Kind` vocabulary, offering "Milestone" and
 * "Butuh bantuan" where updates.ts said "tonggak" and "ajakan", with no "riset" at
 * all. Two composers, two vocabularies, and nothing forcing them to agree. The
 * `KIND` map below still displays the old names on the seeded stream, so it has
 * the same drift left in it.
 */

import { useState } from "react";
import { Avatar, Tag, MainColumn, RailColumn, cn } from "@myapp/ui";
import { Composer } from "../components/Composer";
import { Shell } from "../components/Shell";
import { KARYA } from "../data/karya";
import { coverFor, screenshots } from "../lib/images";
import { relativeTime } from "../lib/format";
import { Eyebrow } from "@myapp/ui";

const KARYA_ITEM = KARYA[0]; // KampusKerja — featured, two-person roster

type Kind = "launch" | "milestone" | "progress" | "ask";
const KIND: Record<Kind, { label: string; tint: boolean }> = {
  launch: { label: "Rilis", tint: true },
  milestone: { label: "Milestone", tint: true },
  progress: { label: "Progres", tint: false },
  ask: { label: "Butuh bantuan", tint: false },
};

const POSTS: { id: number; author: string; kind: Kind; body: string; hoursAgo: number }[] = [
  { id: 1, author: "Arief Maulana", kind: "launch", body: "Beta terbuka udah live! Mahasiswa Telkom bisa daftar & lihat lowongan magang dari alumni. Makasih yang udah nyoba versi awal 🙏", hoursAgo: 5 },
  { id: 2, author: "Siti Rahmah", kind: "progress", body: "Rombak alur onboarding — sekarang cuma 2 langkah sebelum lihat lowongan pertama. Data awal: drop-off turun jauh.", hoursAgo: 22 },
  { id: 3, author: "Arief Maulana", kind: "ask", body: "Lagi cari 1 orang yang kuat di data scraping buat sinkronisasi lowongan otomatis. Kalau tertarik, colek ya.", hoursAgo: 50 },
];

// ─── Kind chip ───────────────────────────────────────────────────────────────
function KindChip({ kind }: { kind: Kind }) {
  const k = KIND[kind];
  return (
    <span className={cn(
      "rounded-full border px-[9px] py-[2px] font-body text-micro font-medium tracking-tag uppercase",
      k.tint
        ? "border-accent-line bg-accent-tint text-accent"
        : "border-line bg-transparent text-ink3",
    )}>
      {k.label}
    </span>
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
        <>
          <button type="button" className="w-full cursor-pointer rounded-card border-none bg-ink px-4 py-[9px] text-center font-body text-ui font-medium text-bg">Gabung karya →</button>
          <button type="button" className="w-full cursor-pointer rounded-card border border-line bg-transparent px-4 py-[9px] text-center font-body text-ui font-medium text-ink">♡ Apresiasi · {KARYA_ITEM.appreciations}</button>
        </>
      )}
    </div>
  );
}

// ─── Role toggle (gallery affordance) ────────────────────────────────────────
function RoleToggle({ owner, onChange }: { owner: boolean; onChange: (owner: boolean) => void }) {
  return (
    <div className="flex gap-0.5 rounded-full border border-line bg-surface p-[3px]">
      {([["owner", "Owner"], ["visitor", "Pengunjung"]] as const).map(([val, label]) => {
        const on = (val === "owner") === owner;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val === "owner")}
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
  const [owner, setOwner] = useState(true);
  const [featured, setFeatured] = useState(!!KARYA_ITEM.featured);
  const k = KARYA_ITEM;

  return (
    <Shell active="karya-detail">
      {/* Reading column */}
      <MainColumn>
        {/* Back to the feed the card funnelled from */}
        <button type="button" className="mb-5 cursor-pointer border-none bg-none p-0 font-body text-ui text-ink2">
          ← Balik
        </button>

        {/* Cover */}
        <img
          src={coverFor(k.interests)}
          alt={k.title}
          className="block h-[220px] w-full rounded-panel border border-line object-cover"
        />

        {/* Title block */}
        <div className="my-[22px] mb-2.5 flex flex-wrap items-center gap-2">
          {featured && <KindChip kind="launch" />}
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
            <article key={p.id} className="border-t border-line py-4">
              <div className="mb-2 flex items-center gap-2.5">
                <Avatar name={p.author} size={28} />
                <span className="font-body text-ui font-medium text-ink">{p.author}</span>
                <KindChip kind={p.kind} />
                <span className="ml-auto font-body text-micro text-ink3">{relativeTime(p.hoursAgo)}</span>
              </div>
              <p className="m-0 font-body text-body leading-body text-ink2">{p.body}</p>
            </article>
          ))}
        </div>
      </MainColumn>

      {/* Action rail */}
      <RailColumn className="flex flex-col gap-5">
        {/* Role toggle — gallery affordance to preview both viewer states */}
        <RoleToggle owner={owner} onChange={setOwner} />

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
          <div className="flex items-baseline justify-between">
            <Eyebrow as="span">Apresiasi</Eyebrow>
            <span className="font-body text-ui text-accent-mid">♥ {k.appreciations}</span>
          </div>
        </div>
      </RailColumn>
    </Shell>
  );
}
