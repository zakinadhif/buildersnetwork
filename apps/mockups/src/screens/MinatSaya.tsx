/**
 * Al-Fath Berkarya — Minat Saya  ·  issue #106
 *
 * A Launchpad rail destination (exit criterion: reachable from the nav), so it
 * lives *inside* the shell — same left rail as Launchpad, now with "Minat Saya"
 * lit. Manage the interests you follow, see the karya they surface, and pick up
 * more. Shared token scale + KaryaCard, so it reads like the home, not a
 * rapid-dev afterthought.
 */

import { useState } from "react";
import { KaryaCard } from "@myapp/ui";
import { T, eyebrow } from "@myapp/design-tokens";
import { Shell } from "../components/Shell";
import { ALL_INTERESTS, KARYA } from "../data/karya";
import { coverFor } from "../lib/images";
import { relativeTime } from "../lib/format";

export default function MinatSayaScreen() {
  const [following, setFollowing] = useState<string[]>(["Web", "AI/ML", "Komunitas", "Edukasi"]);

  const suggestions = ALL_INTERESTS.filter((i) => !following.includes(i));
  const matched = KARYA.filter((k) => k.interests.some((i) => following.includes(i)));

  const remove = (v: string) => setFollowing((f) => f.filter((x) => x !== v));
  const add = (v: string) => setFollowing((f) => (f.includes(v) ? f : [...f, v]));

  return (
    <Shell active="minat">
      {/* Center column */}
      <main className="bn-main" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: T.size.display, fontWeight: T.weight.regular, letterSpacing: T.track.heading, color: T.ink }}>Minat Saya</h1>
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3 }}>Yang kamu ikuti menyetel apa yang muncul di Launchpad</span>
          </div>
        </div>

        {/* Followed interests */}
        <p style={{ ...eyebrow, marginBottom: 10 }}>Minat yang kamu ikuti</p>
        {following.length === 0 ? (
          <p style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink3, padding: "10px 0 20px" }}>
            Belum ada minat. Pilih beberapa di kanan — Launchpad langsung menyesuaikan.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 30 }}>
            {following.map((f) => (
              <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: T.fontBody, fontSize: T.size.ui, color: T.accent, background: T.accentTint, border: `1px solid ${T.accentLine}`, borderRadius: 99, padding: "5px 8px 5px 13px" }}>
                {f}
                <button type="button" onClick={() => remove(f)} aria-label={`Berhenti ikuti ${f}`} style={{ background: "none", border: "none", cursor: "pointer", color: T.accentMid, fontSize: T.size.body, lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
        )}

        {/* Karya for these interests */}
        <p style={{ ...eyebrow, marginBottom: 4 }}>Karya untuk minatmu</p>
        {matched.length === 0 ? (
          <p style={{ fontFamily: T.fontBody, fontSize: T.size.body, color: T.ink3, padding: "16px 0" }}>Belum ada karya untuk minat ini.</p>
        ) : (
          matched.slice(0, 4).map((k) => (
            <KaryaCard
              key={k.id}
              cover={coverFor(k.interests)}
              title={k.title}
              description={k.description}
              activity={{ text: k.lastActivity.text, time: relativeTime(k.lastActivity.hoursAgo) }}
              stages={k.stages.map((s) => ({ label: s, accent: s === "Cari Kolaborator" }))}
              interests={k.interests}
              roster={k.roster.map((r) => ({ key: r.handle, name: r.name }))}
            />
          ))
        )}
      </main>

      {/* Right rail — pick up more */}
      <aside className="bn-rail" style={{ width: 232, flexShrink: 0, position: "sticky" as const, top: 68 }}>
        <p style={{ ...eyebrow, marginBottom: 12 }}>Tambah minat</p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
          {suggestions.length === 0 ? (
            <span style={{ fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink3 }}>Kamu sudah ikuti semuanya 🎉</span>
          ) : (
            suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2, background: "transparent", border: `1px solid ${T.line}`, borderRadius: 99, padding: "4px 11px", cursor: "pointer" }}
              >
                <span aria-hidden="true" style={{ color: T.accent }}>+</span> {s}
              </button>
            ))
          )}
        </div>
      </aside>
    </Shell>
  );
}
