import { cn } from "@myapp/ui";

// ─── Font options ─────────────────────────────────────────────────────────────
// Shared by every screen. The selection is published as CSS custom properties on
// :root (see FontVars); screens read them through T.fontDisplay / T.fontBody, so
// one switcher hot-swaps fonts everywhere without touching the token object.
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

/** Publishes the chosen fonts as the CSS vars that @myapp/design-tokens points
 *  at. Unlayered, so it overrides the defaults the `@theme` block emits. */
export function FontVars({
  displayFont,
  bodyFont,
  pureWhite,
}: {
  displayFont: string;
  bodyFont: string;
  pureWhite: boolean;
}) {
  return (
    <style>{`:root {
      --font-display: ${displayFont};
      --font-body: ${bodyFont};
      ${pureWhite ? "--color-bg: #fff;" : ""}
    }`}</style>
  );
}

function FontSwitcher({ options, activeIdx, onChange }: {
  options:   readonly { font: string; label: string }[];
  activeIdx: number;
  onChange:  (i: number) => void;
}) {
  return (
    <div
      role="group"
      className="flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-line-dark bg-surface p-[3px] shadow-[0_4px_16px_oklch(0%_0_0_/_10%)]"
    >
      {options.map((opt, i) => {
        const active = i === activeIdx;
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            aria-pressed={active}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border-none px-3.25 py-1.25 font-body text-micro tracking-tag whitespace-nowrap transition-colors duration-[120ms]",
              active ? "bg-ink font-medium text-bg" : "bg-transparent font-normal text-ink3",
            )}
          >
            <span style={{ fontFamily: opt.font }} className="text-[15px] font-normal leading-none">Aa</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Fixed bottom-right pair of switchers (display + body). One instance for the
 *  whole gallery — rendered by main.tsx alongside the active screen. */
function BackgroundSwitcher({
  pureWhite,
  onChange,
}: {
  pureWhite: boolean;
  onChange: (pureWhite: boolean) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Warna latar"
      className="flex items-center gap-0.5 rounded-full border border-line-dark bg-surface p-[3px] shadow-[0_4px_16px_oklch(0%_0_0_/_10%)]"
    >
      <span className="px-2 font-body text-micro font-medium uppercase tracking-eyebrow text-ink3">
        Latar
      </span>
      {[
        { value: false, label: "Gallery white" },
        { value: true, label: "Pure white" },
      ].map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={pureWhite === option.value}
          className={cn(
            "rounded-full border-none px-3 py-1.25 font-body text-micro whitespace-nowrap transition-colors duration-[120ms]",
            pureWhite === option.value
              ? "bg-ink font-medium text-bg"
              : "bg-transparent font-normal text-ink3",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function FontControls({
  displayIdx,
  bodyIdx,
  pureWhite,
  onDisplay,
  onBody,
  onBackground,
}: {
  displayIdx: number;
  bodyIdx:    number;
  pureWhite: boolean;
  onDisplay:  (i: number) => void;
  onBody:     (i: number) => void;
  onBackground: (pureWhite: boolean) => void;
}) {
  return (
    <div className="fixed right-4 bottom-4 left-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2 sm:right-5 sm:bottom-5 sm:left-auto">
      <BackgroundSwitcher pureWhite={pureWhite} onChange={onBackground} />
      <FontSwitcher options={DISPLAY_FONTS} activeIdx={displayIdx} onChange={onDisplay} />
      <FontSwitcher options={BODY_FONTS}    activeIdx={bodyIdx}    onChange={onBody}    />
    </div>
  );
}
