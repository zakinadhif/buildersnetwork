import { useState } from "react";
import { SCREEN_META, type Screen } from "./nav";

// ─── Screen switcher chrome ─────────────────────────────────────────────────────
// Gallery chrome, independent of any mockup's tokens — brand values inlined, same
// as the font switcher. Fixed bottom-left (the font controls own bottom-right), it
// is the way to reach flow mockups that carry no product sidebar of their own.
// Screens the product has retired are kept but folded away behind the footer
// toggle, so the default menu is the live surface set.
const C = {
  surface: "oklch(100% 0 0)",
  bg: "oklch(98% 0 0)",
  ink: "oklch(18% 0 0)",
  ink3: "oklch(53% 0 0)",
  lineDark: "oklch(85% 0 0)",
  body: "'Plus Jakarta Sans', sans-serif",
};

const GROUP_ORDER = ["Surface", "Alur", "Funnel"] as const;

/** Small track-and-knob switch for the panel's footer. */
function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        width: "100%",
        border: "none",
        borderRadius: 8,
        padding: "4px 5px",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontFamily: C.body,
          fontSize: 11,
          fontWeight: on ? 500 : 400,
          color: on ? C.ink : C.ink3,
          transition: "color 0.12s",
        }}
      >
        {label}
      </span>
      <span
        aria-hidden
        style={{
          position: "relative",
          flexShrink: 0,
          width: 26,
          height: 15,
          borderRadius: 99,
          background: on ? C.ink : C.lineDark,
          transition: "background 0.12s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: on ? 13 : 2,
            width: 11,
            height: 11,
            borderRadius: 99,
            background: C.surface,
            transition: "left 0.12s",
          }}
        />
      </span>
    </button>
  );
}

export function ScreenSwitcher({ active, onChange }: {
  active: Screen;
  onChange: (s: Screen) => void;
}) {
  const [showRetired, setShowRetired] = useState(false);
  const retiredCount = SCREEN_META.filter((s) => s.retired).length;

  // The screen you are on always stays listed, retired or not — hiding the active
  // button would leave the switcher with nothing marked and no way back.
  const visible = SCREEN_META.filter((s) => showRetired || !s.retired || s.key === active);

  return (
    <div
      role="group"
      aria-label="Pilih layar"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        zIndex: 100,
        background: C.surface,
        border: `1px solid ${C.lineDark}`,
        borderRadius: 14,
        boxShadow: "0 4px 16px oklch(0% 0 0 / 10%)",
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 210,
      }}
    >
      {GROUP_ORDER.map((group) => {
        const items = visible.filter((s) => s.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span
              style={{
                fontFamily: C.body,
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.ink3,
                padding: "0 4px",
              }}
            >
              {group}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {items.map((s) => {
                const on = s.key === active;
                return (
                  <button
                    key={s.key}
                    onClick={() => onChange(s.key)}
                    aria-pressed={on}
                    title={s.retired ? "Layar tidak dipakai — bukan bagian produk lagi" : undefined}
                    style={{
                      // Dashed outline is what reads "retired" at a glance; every
                      // button carries the border so the two sit the same size.
                      border: s.retired && !on
                        ? `1px dashed ${C.lineDark}`
                        : "1px solid transparent",
                      borderRadius: 8,
                      padding: "4px 9px",
                      background: on ? C.ink : "transparent",
                      color: on ? C.bg : C.ink3,
                      fontFamily: C.body,
                      fontSize: 11,
                      fontWeight: on ? 500 : 400,
                      fontStyle: s.retired ? "italic" : "normal",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "background 0.12s, color 0.12s",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {retiredCount > 0 && (
        <div style={{ borderTop: `1px solid ${C.lineDark}`, paddingTop: 5, marginTop: 1 }}>
          <Toggle
            label={`Layar tidak dipakai (${retiredCount})`}
            on={showRetired}
            onToggle={() => setShowRetired((v) => !v)}
          />
        </div>
      )}
    </div>
  );
}
