/**
 * Al-Fath Berkarya — Mulai (profil minimal)  ·  issue #102
 *
 * The form the Launchpad exit criterion lands a new user on (`/mulai`,
 * MinimalStart): one field, a calm on-ramp to the AI assistant, and an explicit
 * "the rest can wait" promise — so it reads as a start, never a gate. On the
 * shared token scale; nada + ramp mirror Launchpad's SeekerRamp.
 */

import { useState } from "react";

export default function MulaiScreen() {
  const [name, setName] = useState("Zaki Nadhif");

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-12 font-body">
      <div className="w-full max-w-[412px]">
        <div className="text-micro font-medium tracking-eyebrow uppercase text-ink3 mb-3.5">Selangkah lagi</div>

        <h1 className="mb-2.5 mt-0 font-display text-feature font-light tracking-heading leading-heading text-ink">
          Hai — kenalan dulu.
        </h1>

        <p className="mb-[30px] mt-0 font-body text-body leading-body text-ink2">
          Cukup nama dulu. Skill, minat, dan portofolio bisa kamu lengkapi kapan
          aja — nggak ada yang wajib di depan.
        </p>

        {/* The one field */}
        <label className="mb-5 block">
          <span className="text-micro font-medium tracking-eyebrow uppercase text-ink3 mb-1.5 block">Nama kamu</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama yang mau ditampilkan"
            className="w-full rounded-card border border-line bg-surface px-[13px] py-[11px] font-body text-body text-ink outline-none placeholder:text-ink3"
          />
        </label>

        <button
          type="button"
          className="w-full cursor-pointer rounded-card border-none bg-ink px-[18px] py-3 font-body text-ui font-semibold tracking-heading text-bg"
        >
          Masuk ke komunitas →
        </button>

        {/* Divider */}
        <div className="my-[26px] flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="font-body text-micro tracking-tag text-ink3">ATAU</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        {/* Calm AI on-ramp — a tool, never a gate */}
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-3.5 rounded-panel border border-accent-line bg-accent-tint px-4 py-3.5 text-left"
        >
          <span aria-hidden="true" className="shrink-0 font-display text-[26px] leading-none text-accent">✦</span>
          <span className="min-w-0 flex-1">
            <span className="mb-0.5 block font-body text-ui font-medium text-ink">
              Belum tahu mau mulai dari mana?
            </span>
            <span className="block font-body text-caption leading-body text-ink2">
              Ngobrol sebentar sama asisten — kita rapiin profil &amp; cari arahmu.
            </span>
          </span>
          <span aria-hidden="true" className="shrink-0 font-body text-ui text-accent">→</span>
        </button>
      </div>
    </div>
  );
}
