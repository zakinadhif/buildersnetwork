import { SCREEN_META, type Screen } from "./nav";

// ─── Screen switcher chrome ─────────────────────────────────────────────────────
// Gallery chrome, independent of any mockup's tokens — brand values inlined, same
// as the font switcher. Fixed bottom-left (the font controls own bottom-right), it
// is the way to reach flow mockups that carry no product sidebar of their own.
const C = {
  surface: "oklch(100% 0 0)",
  bg: "oklch(98% 0 0)",
  ink: "oklch(18% 0 0)",
  ink3: "oklch(53% 0 0)",
  lineDark: "oklch(85% 0 0)",
  body: "'Plus Jakarta Sans', sans-serif",
};

const GROUP_ORDER = ["Surface", "Alur"] as const;

export function ScreenSwitcher({ active, onChange }: {
  active: Screen;
  onChange: (s: Screen) => void;
}) {
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
        const items = SCREEN_META.filter((s) => s.group === group);
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
                    style={{
                      border: "none",
                      borderRadius: 8,
                      padding: "5px 10px",
                      background: on ? C.ink : "transparent",
                      color: on ? C.bg : C.ink3,
                      fontFamily: C.body,
                      fontSize: 11,
                      fontWeight: on ? 500 : 400,
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
    </div>
  );
}
