/**
 * Al-Fath Berkarya — Profil Member / Profil Saya · issue #105
 *
 * Visitor and signed-in views are intentionally different product surfaces.
 * Visitor view reads like a public identity and portfolio. Profil Saya is a
 * working dashboard with direct profile, taxonomy, and karya management entry
 * points. The floating pane is review chrome only.
 */

import { useState } from "react";
import { Avatar, Tag, MainColumn, RailColumn, cn, Eyebrow } from "@myapp/ui";
import { Shell } from "../components/Shell";
import { PreviewStates } from "../components/PreviewStates";
import { KARYA, MEMBERS, ME, MY_KARYA } from "../data/karya";
import { coverFor } from "../lib/images";

const MEMBER = MEMBERS[0];
const THEIR_KARYA = KARYA.filter((k) => k.roster.some((r) => r.name === MEMBER.name));
type ProfileState = "complete" | "minimal" | "empty" | "loading" | "not-found";

function KaryaMini({
  title,
  description,
  stages,
  interests,
  manage = false,
}: {
  title: string;
  description: string;
  stages: string[];
  interests: string[];
  manage?: boolean;
}) {
  return (
    <div className="flex gap-3.5 border-t border-line py-3.5">
      <img src={coverFor(interests)} alt="" className="h-[60px] w-[60px] shrink-0 rounded-xl border border-line object-cover" />
      <div className="min-w-0 flex-1">
        <div className="mb-[3px] flex flex-wrap items-baseline gap-2">
          <span className="font-display text-title text-ink">{title}</span>
          <Eyebrow as="span">{stages[stages.length - 1]}</Eyebrow>
        </div>
        <p className="m-0 font-body text-caption leading-body text-ink2">{description}</p>
      </div>
      {manage && (
        <button type="button" className="self-center rounded-card border border-line bg-transparent px-3 py-1.5 font-body text-caption font-medium text-ink">
          Kelola
        </button>
      )}
    </div>
  );
}

function ReviewRoleToggle({ self, onChange }: { self: boolean; onChange: (self: boolean) => void }) {
  return (
    <div className="flex gap-0.5 rounded-full border border-line bg-bg p-[3px]">
      {([["visitor", "Visitor"], ["self", "Login user"]] as const).map(([value, label]) => {
        const active = (value === "self") === self;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value === "self")}
            aria-pressed={active}
            className={cn(
              "flex-1 rounded-full border-none px-3 py-[5px] font-body text-micro",
              active ? "bg-ink font-medium text-bg" : "bg-transparent font-normal text-ink2",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function LoadingOrMissing({ state, self }: { state: "loading" | "not-found"; self: boolean }) {
  return (
    <Shell active="profil">
      <MainColumn>
        {state === "loading" ? (
          <div role="status" className="space-y-4">
            <div className="h-20 w-20 animate-pulse rounded-full bg-surface" />
            <div className="h-8 w-1/2 animate-pulse rounded-card bg-surface" />
            <div className="h-20 animate-pulse rounded-card bg-surface" />
          </div>
        ) : (
          <div className="rounded-panel border border-line bg-surface px-6 py-10 text-center">
            <Eyebrow as="div" className="mb-3">404 · Profil tidak ditemukan</Eyebrow>
            <h1 className="mb-2 mt-0 font-display text-feature font-normal text-ink">
              {self ? "Profilmu belum bisa dimuat." : "Builder ini belum bisa ditemukan."}
            </h1>
            <p className="m-0 font-body text-body leading-body text-ink2">
              {self ? "Coba muat ulang atau kembali ke Scroll." : "Kembali ke People untuk melihat builder lain."}
            </p>
          </div>
        )}
      </MainColumn>
      <RailColumn />
    </Shell>
  );
}

function VisitorProfile({ state }: { state: Exclude<ProfileState, "loading" | "not-found"> }) {
  const shownKarya = state === "empty" || state === "minimal" ? [] : THEIR_KARYA;
  const m = MEMBER;

  return (
    <Shell active="profil">
      <MainColumn>
        <button type="button" className="mb-6 border-none bg-transparent p-0 font-body text-ui text-ink2">← Balik</button>
        <div className="flex items-start gap-[18px]">
          <Avatar name={m.name} size={76} />
          <div className="min-w-0 flex-1">
            <h1 className="mb-[3px] mt-0 font-display text-feature font-normal tracking-heading leading-heading text-ink">{m.name}</h1>
            <div className="mb-2.5 font-body text-ui text-ink3">{m.handle} · Tkt {m.year} · {m.major}</div>
            <p className="m-0 font-body text-body leading-body text-ink2">
              {state === "minimal" ? "Builder baru yang belum melengkapi bio." : m.bio}
            </p>
          </div>
        </div>

        <Eyebrow className="mb-2.5 mt-[30px]">Keahlian</Eyebrow>
        <div className="mb-[22px] flex flex-wrap gap-1.5">
          {state === "minimal" ? <span className="font-body text-body text-ink3">Belum ditambahkan.</span> : m.skills.map((skill) => <Tag key={skill} label={skill} accent />)}
        </div>
        <Eyebrow className="mb-2.5">Minat</Eyebrow>
        <div className="mb-[30px] flex flex-wrap gap-1.5">
          {state === "minimal" ? <span className="font-body text-body text-ink3">Belum ditambahkan.</span> : m.interests.map((interest) => <Tag key={interest} label={interest} />)}
        </div>

        <Eyebrow className="mb-1">Karya yang digarap</Eyebrow>
        {shownKarya.length === 0 ? (
          <p className="py-[18px] font-body text-body text-ink3">Belum ada karya yang dibagikan.</p>
        ) : shownKarya.map((karya) => (
          <KaryaMini key={karya.id} title={karya.title} description={karya.description} stages={karya.stages} interests={karya.interests} />
        ))}
      </MainColumn>
      <RailColumn className="flex flex-col gap-5">
        <div className="rounded-panel border border-line bg-surface p-4">
          <Eyebrow as="div" className="mb-2">Profil publik</Eyebrow>
          <p className="m-0 font-body text-caption leading-body text-ink2">
            Lihat identitas, keahlian, minat, dan karya publik builder ini. Pesan dan ajakan kolaborasi hadir di P1.
          </p>
        </div>
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex justify-between"><Eyebrow as="span">Karya</Eyebrow><span className="font-body text-ui text-ink2">{m.karya}</span></div>
          <div className="flex justify-between"><Eyebrow as="span">Keahlian</Eyebrow><span className="font-body text-ui text-ink2">{m.skills.length}</span></div>
          <div className="flex justify-between"><Eyebrow as="span">Angkatan</Eyebrow><span className="font-body text-ui text-ink2">'{20 + m.year}</span></div>
        </div>
      </RailColumn>
    </Shell>
  );
}

function EditRow({ label, value, action = "Sunting" }: { label: string; value: string; action?: string }) {
  return (
    <div className="flex items-start justify-between gap-5 border-t border-line py-4 first:border-t-0">
      <div className="min-w-0">
        <Eyebrow as="div" className="mb-1">{label}</Eyebrow>
        <p className="m-0 font-body text-body leading-body text-ink2">{value}</p>
      </div>
      <button type="button" className="shrink-0 rounded-card border border-line bg-transparent px-3 py-1.5 font-body text-caption font-medium text-ink">{action}</button>
    </div>
  );
}

function OwnProfile({ state }: { state: Exclude<ProfileState, "loading" | "not-found"> }) {
  const shownKarya = state === "empty" || state === "minimal" ? [] : MY_KARYA;
  const sparse = state === "minimal";
  const skills = sparse ? [] : ["React", "Product", "TypeScript"];
  const interests = sparse ? [] : ["AI/ML", "Web", "Produktivitas"];

  return (
    <Shell active="profil">
      <MainColumn>
        <div className="mb-7 flex items-start justify-between gap-5">
          <div>
            <Eyebrow as="div" className="mb-2">Profil Saya</Eyebrow>
            <h1 className="m-0 font-display text-feature font-normal tracking-heading leading-heading text-ink">
              Kelola identitas dan karyamu.
            </h1>
          </div>
          <button type="button" className="rounded-card border-none bg-ink px-4 py-2.5 font-body text-ui font-semibold text-bg">+ Tambah karya</button>
        </div>

        <section className="rounded-panel border border-line bg-surface p-5">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative">
              <Avatar name={ME.name} size={72} />
              <button type="button" aria-label="Ganti foto profil" className="absolute -bottom-1 -right-1 size-7 rounded-full border border-line bg-bg font-body text-caption text-ink">✎</button>
            </div>
            <div>
              <h2 className="mb-1 mt-0 font-display text-title font-normal text-ink">{ME.name}</h2>
              <span className="font-body text-ui text-ink3">{ME.handle}</span>
            </div>
          </div>
          <EditRow label="Nama & username" value={`${ME.name} · ${ME.handle}`} />
          <EditRow label="Tentang kamu" value={sparse ? "Tambahkan bio singkat agar builder lain mengenalmu." : "Membangun produk digital untuk komunitas dan pendidikan."} />
          <EditRow label="Kampus" value="S1 Teknik Informatika · Angkatan 2023" />
        </section>

        <section className="mt-5 rounded-panel border border-line bg-surface p-5">
          <div className="mb-2 flex items-center justify-between">
            <Eyebrow as="h2">Keahlian & minat</Eyebrow>
            <button type="button" className="border-none bg-transparent p-0 font-body text-caption font-medium text-accent">Sunting pilihan</button>
          </div>
          <div className="border-t border-line py-4">
            <span className="mb-2 block font-body text-caption text-ink3">Keahlian</span>
            <div className="flex flex-wrap gap-1.5">
              {skills.length ? skills.map((skill) => <Tag key={skill} label={skill} accent />) : <span className="font-body text-body text-ink3">Belum ada keahlian. Tambahkan sekarang.</span>}
            </div>
          </div>
          <div className="border-t border-line pt-4">
            <span className="mb-2 block font-body text-caption text-ink3">Minat</span>
            <div className="flex flex-wrap gap-1.5">
              {interests.length ? interests.map((interest) => <Tag key={interest} label={interest} />) : <span className="font-body text-body text-ink3">Belum ada minat. Tambahkan sekarang.</span>}
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-2 flex items-center justify-between">
            <Eyebrow as="h2">Karya Saya</Eyebrow>
            <button type="button" className="border-none bg-transparent p-0 font-body text-caption font-medium text-accent">+ Karya baru</button>
          </div>
          {shownKarya.length ? shownKarya.map((karya) => (
            <KaryaMini key={karya.id} title={karya.title} description={karya.description} stages={karya.stages} interests={karya.interests} manage />
          )) : (
            <div className="rounded-panel border border-dashed border-line px-5 py-8 text-center">
              <p className="mb-3 mt-0 font-body text-body text-ink2">Kamu belum punya karya yang dibagikan.</p>
              <button type="button" className="rounded-card border border-line bg-surface px-4 py-2 font-body text-ui font-medium text-ink">Bikin karya pertama</button>
            </div>
          )}
        </section>
      </MainColumn>
      <RailColumn className="flex flex-col gap-4">
        <div className="rounded-panel border border-line bg-surface p-4">
          <Eyebrow as="div" className="mb-3">Kelengkapan profil</Eyebrow>
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-line">
            <div className={cn("h-full rounded-full bg-accent", sparse ? "w-2/5" : "w-full")} />
          </div>
          <p className="m-0 font-body text-caption leading-body text-ink2">{sparse ? "40% · Lengkapi bio, keahlian, dan minat." : "100% · Profil siap ditemukan."}</p>
        </div>
        <button type="button" className="w-full rounded-card border border-line bg-transparent px-4 py-2.5 font-body text-ui font-medium text-ink">Lihat profil publik ↗</button>
        <button type="button" className="w-full border-none bg-transparent px-4 py-1 font-body text-caption text-ink3">Pengaturan akun</button>
      </RailColumn>
    </Shell>
  );
}

export default function ProfilScreen() {
  const [self, setSelf] = useState(false);
  const [profileState, setProfileState] = useState<ProfileState>("complete");

  return (
    <>
      <PreviewStates
        label="Review profil"
        value={profileState}
        onChange={setProfileState}
        options={[
          { value: "complete", label: "Lengkap" },
          { value: "minimal", label: "Minimal" },
          { value: "empty", label: "Tanpa karya" },
          { value: "loading", label: "Loading" },
          { value: "not-found", label: "404" },
        ]}
      >
        <Eyebrow as="div" className="mb-2">Sudut pandang</Eyebrow>
        <ReviewRoleToggle self={self} onChange={setSelf} />
      </PreviewStates>
      {profileState === "loading" || profileState === "not-found" ? (
        <LoadingOrMissing state={profileState} self={self} />
      ) : self ? (
        <OwnProfile state={profileState} />
      ) : (
        <VisitorProfile state={profileState} />
      )}
    </>
  );
}
