/**
 * Cari Kolaborator — four parallel design explorations, one screen.
 *
 * The picker is *designated* to this screen: it lives inside CariScreen, so it
 * only renders while Cari Kolaborator is on show (never on Launchpad).
 */

import { useState } from "react";
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
      style={{
        position: "fixed",
        top: 52,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        display: "flex",
        gap: 2,
        padding: 3,
        borderRadius: 99,
        background: "oklch(100% 0 0)",
        border: "1px solid oklch(88% 0 0)",
        boxShadow: "0 2px 10px oklch(0% 0 0 / 8%)",
      }}
    >
      <span style={{
        alignSelf: "center",
        padding: "0 8px 0 6px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "oklch(53% 0 0)",
        whiteSpace: "nowrap",
      }}>Varian</span>
      {CARI_VARIANTS.map((v, i) => {
        const active = i === idx;
        return (
          <button
            key={v.key}
            onClick={() => onPick(i)}
            aria-pressed={active}
            style={{
              padding: "4px 11px",
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              background: active ? "oklch(39% 0.085 62)" : "transparent",
              color: active ? "oklch(99% 0 0)" : "oklch(46% 0 0)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11,
              fontWeight: active ? 500 : 400,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              transition: "background 0.12s, color 0.12s",
            }}
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
