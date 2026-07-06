import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import MockupB from "./MockupB";
import MockupCariA from "./MockupCariA";
import MockupCariB from "./MockupCariB";
import MockupCariC from "./MockupCariC";
import MockupCariE from "./MockupCariE";

// ─── Mockup gallery picker ─────────────────────────────────────────────────────
// A thin top bar to flip between the Launchpad and the four "Cari Kolaborator"
// direction explorations. Each mockup is self-contained and keeps its own
// bottom-right font switcher.
const MOCKUPS = [
  { key: "launchpad", label: "Launchpad", Component: MockupB },
  { key: "cari-a", label: "Cari · A — Two-lane", Component: MockupCariA },
  { key: "cari-b", label: "Cari · B — Intent", Component: MockupCariB },
  { key: "cari-c", label: "Cari · C — Match", Component: MockupCariC },
  { key: "cari-e", label: "Cari · E — Wall", Component: MockupCariE },
] as const;

function Gallery() {
  const [idx, setIdx] = useState(0);
  const Active = MOCKUPS[idx].Component;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 200,
          display: "flex",
          gap: 2,
          padding: 3,
          borderRadius: 99,
          background: "oklch(100% 0 0)",
          border: "1px solid oklch(85% 0 0)",
          boxShadow: "0 4px 16px oklch(0% 0 0 / 12%)",
        }}
      >
        {MOCKUPS.map((m, i) => {
          const active = i === idx;
          return (
            <button
              key={m.key}
              onClick={() => setIdx(i)}
              aria-pressed={active}
              style={{
                padding: "5px 12px",
                borderRadius: 99,
                border: "none",
                cursor: "pointer",
                background: active ? "oklch(18% 0 0)" : "transparent",
                color: active ? "oklch(98% 0 0)" : "oklch(46% 0 0)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12,
                fontWeight: active ? 500 : 400,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
                transition: "background 0.12s, color 0.12s",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      <Active />
    </>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
