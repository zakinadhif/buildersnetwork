/**
 * Cari Kolaborator — four parallel design explorations, one screen.
 *
 * The picker is *designated* to this screen: it lives inside CariScreen, so it
 * only renders while Cari Kolaborator is on show (never on Launchpad).
 */

import { useState } from "react";
import { cn } from "@myapp/ui";
import VariantA from "./VariantA";
import VariantB from "./VariantB";
import VariantC from "./VariantC";
import VariantE from "./VariantE";

const CARI_VARIANTS = [
  { key: "a", label: "A · Two-lane", Body: VariantA },
  { key: "b", label: "B · Intent",   Body: VariantB },
  { key: "c", label: "C · Match",    Body: VariantC },
  { key: "e", label: "E · Wall",     Body: VariantE },
] as const;

function VariantPicker({ idx, onPick }: { idx: number; onPick: (i: number) => void }) {
  return (
    <div
      role="group"
      aria-label="Varian Cari Kolaborator"
      className="fixed left-1/2 top-[52px] z-[200] flex -translate-x-1/2 gap-0.5 bg-surface border border-line rounded-full p-[3px] shadow-[0_2px_10px_oklch(0%_0_0_/_8%)]"
    >
      <span className="eyebrow self-center pl-1.5 pr-2 whitespace-nowrap">Varian</span>
      {CARI_VARIANTS.map((v, i) => {
        const active = i === idx;
        return (
          <button
            key={v.key}
            onClick={() => onPick(i)}
            aria-pressed={active}
            className={cn(
              "cursor-pointer rounded-full border-none px-[11px] py-1 font-body text-caption tracking-tag whitespace-nowrap transition-[background,color] duration-[120ms]",
              active
                ? "bg-accent font-medium text-accent-fg"
                : "bg-transparent font-normal text-ink2",
            )}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CariScreen() {
  const [variantIdx, setVariantIdx] = useState(0);
  const Body = CARI_VARIANTS[variantIdx].Body;

  return (
    <>
      <VariantPicker idx={variantIdx} onPick={setVariantIdx} />
      <Body />
    </>
  );
}
