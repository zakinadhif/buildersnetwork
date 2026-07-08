import { createContext, useContext } from "react";

// ─── Font options ─────────────────────────────────────────────────────────────
// Shared by every screen. Each mockup applies the chosen fonts to its own design
// tokens (see useFonts below); the switcher chrome and selection live here so a
// font change persists as you navigate between screens.
export const DISPLAY_FONTS = [
  { font: "'Lora', serif",             label: "Lora" },
  { font: "'Instrument Serif', serif", label: "Instrument Serif" },
] as const;

export const BODY_FONTS = [
  { font: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta" },
  { font: "'Figtree', sans-serif",           label: "Figtree" },
  { font: "'DM Sans', sans-serif",           label: "DM Sans" },
  { font: "'Manrope', sans-serif",           label: "Manrope" },
  { font: "'Outfit', sans-serif",            label: "Outfit" },
] as const;

// ─── Font selection context ───────────────────────────────────────────────────
export interface FontSelection {
  displayFont: string;
  bodyFont:    string;
}

const FontContext = createContext<FontSelection>({
  displayFont: DISPLAY_FONTS[0].font,
  bodyFont:    BODY_FONTS[0].font,
});
export const FontProvider = FontContext.Provider;

/** The currently selected display + body font. A screen mutates its own tokens
 *  from these before render, so one switcher hot-swaps fonts everywhere. */
export function useFonts(): FontSelection {
  return useContext(FontContext);
}

// ─── Switcher chrome ──────────────────────────────────────────────────────────
// Gallery chrome, independent of any mockup's tokens — brand values inlined.
const C = {
  surface:  "oklch(100% 0 0)",
  bg:       "oklch(98% 0 0)",
  ink:      "oklch(18% 0 0)",
  ink3:     "oklch(53% 0 0)",
  lineDark: "oklch(85% 0 0)",
  body:     "'Plus Jakarta Sans', sans-serif",
};

function FontSwitcher({ options, activeIdx, onChange }: {
  options:   readonly { font: string; label: string }[];
  activeIdx: number;
  onChange:  (i: number) => void;
}) {
  return (
    <div
      role="group"
      style={{
        background:   C.surface,
        border:       `1px solid ${C.lineDark}`,
        borderRadius: 99,
        boxShadow:    "0 4px 16px oklch(0% 0 0 / 10%)",
        display:      "flex",
        padding:      3,
        gap:          2,
      }}
    >
      {options.map((opt, i) => {
        const active = i === activeIdx;
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            aria-pressed={active}
            style={{
              display:       "inline-flex",
              alignItems:    "center",
              gap:           6,
              padding:       "5px 13px",
              borderRadius:  99,
              border:        "none",
              background:    active ? C.ink : "transparent",
              color:         active ? C.bg : C.ink3,
              fontFamily:    C.body,
              fontSize:      10,
              fontWeight:    active ? 500 : 400,
              cursor:        "pointer",
              letterSpacing: "0.02em",
              whiteSpace:    "nowrap" as const,
              transition:    "background 0.12s, color 0.12s",
            }}
          >
            <span style={{ fontFamily: opt.font, fontSize: 15, fontWeight: 400, lineHeight: 1 }}>Aa</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Fixed bottom-right pair of switchers (display + body). One instance for the
 *  whole gallery — rendered by main.tsx alongside the active screen. */
export function FontControls({ displayIdx, bodyIdx, onDisplay, onBody }: {
  displayIdx: number;
  bodyIdx:    number;
  onDisplay:  (i: number) => void;
  onBody:     (i: number) => void;
}) {
  return (
    <div style={{
      position:      "fixed",
      bottom:        20,
      right:         20,
      zIndex:        100,
      display:       "flex",
      flexDirection: "column",
      gap:           8,
      alignItems:    "flex-end",
    }}>
      <FontSwitcher options={DISPLAY_FONTS} activeIdx={displayIdx} onChange={onDisplay} />
      <FontSwitcher options={BODY_FONTS}    activeIdx={bodyIdx}    onChange={onBody}    />
    </div>
  );
}
