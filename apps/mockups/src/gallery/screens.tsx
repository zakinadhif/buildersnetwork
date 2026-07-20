import { useState } from "react";
import { cn } from "@myapp/ui";
import { SCREEN_META, type Screen } from "./nav";

const GROUP_ORDER = ["Surface", "Alur", "Funnel"] as const;

/** Small track-and-knob switch for the panel's footer. */
function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent p-1 px-1.25 rounded-card"
    >
      <span
        className={cn(
          "font-body text-caption transition-colors duration-[120ms]",
          on ? "font-medium text-ink" : "font-normal text-ink3",
        )}
      >
        {label}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-[15px] w-[26px] shrink-0 rounded-full transition-colors duration-[120ms]",
          on ? "bg-ink" : "bg-line-dark",
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] h-[11px] w-[11px] rounded-full bg-surface transition-all duration-[120ms]",
            on ? "left-[13px]" : "left-[2px]",
          )}
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
      className="fixed bottom-5 left-5 z-[100] flex max-w-[210px] flex-col gap-2 rounded-[14px] border border-line-dark bg-surface p-2 shadow-[0_4px_16px_oklch(0%_0_0_/_10%)]"
    >
      {GROUP_ORDER.map((group) => {
        const items = visible.filter((s) => s.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group} className="flex flex-col gap-1">
            <span className="text-micro font-medium tracking-eyebrow uppercase text-ink3 px-1 tracking-[0.12em] font-semibold text-ink3">
              {group}
            </span>
            <div className="flex flex-wrap gap-[3px]">
              {items.map((s) => {
                const on = s.key === active;
                return (
                  <button
                    key={s.key}
                    onClick={() => onChange(s.key)}
                    aria-pressed={on}
                    title={s.retired ? "Layar tidak dipakai — bukan bagian produk lagi" : undefined}
                    className={cn(
                      "cursor-pointer rounded-card px-2.25 py-1 font-body text-caption whitespace-nowrap transition-all duration-[120ms]",
                      s.retired && !on
                        ? "border border-dashed border-line-dark"
                        : "border border-transparent",
                      on ? "bg-ink font-medium text-bg" : "bg-transparent font-normal text-ink3",
                      s.retired ? "italic" : "normal",
                    )}
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
        <div className="mt-0.25 border-t border-line-dark pt-1.25">
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
