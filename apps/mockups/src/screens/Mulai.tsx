/**
 * Al-Fath Berkarya — Mulai (profil minimal)  ·  issue #102
 *
 * The form the Launchpad exit criterion lands a new user on (`/mulai`,
 * MinimalStart): one field, a calm on-ramp to the AI assistant, and an explicit
 * "the rest can wait" promise — so it reads as a start, never a gate. On the
 * shared token scale; nada + ramp mirror Launchpad's SeekerRamp.
 */

import { useState } from "react";
import { T, eyebrow } from "@myapp/design-tokens";

export default function MulaiScreen() {
  const [name, setName] = useState("Zaki Nadhif");

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
      fontFamily: T.fontBody,
    }}>
      <div style={{ width: "100%", maxWidth: 412 }}>
        <div style={{ ...eyebrow, marginBottom: 14 }}>Selangkah lagi</div>

        <h1 style={{
          margin: "0 0 10px",
          fontFamily: T.fontDisplay,
          fontSize: T.size.feature,
          fontWeight: T.weight.light,
          letterSpacing: T.track.heading,
          lineHeight: T.lh.heading,
          color: T.ink,
        }}>
          Hai — kenalan dulu.
        </h1>

        <p style={{
          margin: "0 0 30px",
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          color: T.ink2,
          lineHeight: T.lh.body,
        }}>
          Cukup nama dulu. Skill, minat, dan portofolio bisa kamu lengkapi kapan
          aja — nggak ada yang wajib di depan.
        </p>

        {/* The one field */}
        <label style={{ display: "block", marginBottom: 20 }}>
          <span style={{ ...eyebrow, display: "block", marginBottom: 6 }}>Nama kamu</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama yang mau ditampilkan"
            style={{
              width: "100%",
              boxSizing: "border-box" as const,
              background: T.surface,
              border: `1px solid ${T.line}`,
              borderRadius: T.radiusCard,
              padding: "11px 13px",
              fontFamily: T.fontBody,
              fontSize: T.size.body,
              color: T.ink,
              outline: "none",
            }}
          />
        </label>

        <button
          type="button"
          style={{
            width: "100%",
            background: T.ink,
            color: T.bg,
            border: "none",
            borderRadius: T.radiusCard,
            padding: "12px 18px",
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            fontWeight: T.weight.semibold,
            letterSpacing: T.track.heading,
            cursor: "pointer",
          }}
        >
          Masuk ke komunitas →
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "26px 0" }}>
          <span style={{ flex: 1, height: 1, background: T.line }} />
          <span style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, letterSpacing: T.track.tag }}>ATAU</span>
          <span style={{ flex: 1, height: 1, background: T.line }} />
        </div>

        {/* Calm AI on-ramp — a tool, never a gate */}
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "100%",
            textAlign: "left" as const,
            padding: "14px 16px",
            background: T.accentTint,
            border: `1px solid ${T.accentLine}`,
            borderRadius: T.radiusPanel,
            cursor: "pointer",
          }}
        >
          <span aria-hidden="true" style={{
            fontFamily: T.fontDisplay,
            fontSize: 26,
            color: T.accent,
            lineHeight: 1,
            flexShrink: 0,
          }}>✦</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink, marginBottom: 2 }}>
              Belum tahu mau mulai dari mana?
            </span>
            <span style={{ display: "block", fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink2, lineHeight: T.lh.body }}>
              Ngobrol sebentar sama asisten — kita rapiin profil &amp; cari arahmu.
            </span>
          </span>
          <span aria-hidden="true" style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.accent, flexShrink: 0 }}>→</span>
        </button>
      </div>
    </div>
  );
}
