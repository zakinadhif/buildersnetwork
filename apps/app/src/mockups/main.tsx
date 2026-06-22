import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import MockupA from "./MockupA";
import MockupB from "./MockupB";
import MockupD from "./MockupD";
import MockupF from "./MockupF";

const MOCKUPS = {
  A: { label: "A · Calm wide", Comp: MockupA },
  B: { label: "B · Launchpad", Comp: MockupB },
  D: { label: "D · Editorial", Comp: MockupD },
  F: { label: "F · Hero+upvote", Comp: MockupF },
} as const;
type Key = keyof typeof MOCKUPS;

function Gallery() {
  const fromHash = location.hash.replace("#", "") as Key;
  const [key, setKey] = useState<Key>(MOCKUPS[fromHash] ? fromHash : "A");
  const { Comp } = MOCKUPS[key];

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          background: "#fff",
          border: "1px solid #dedad2",
          borderRadius: 10,
          padding: 8,
          boxShadow: "0 2px 12px rgba(0,0,0,.1)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {(Object.keys(MOCKUPS) as Key[])
            .map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => {
                  setKey(k);
                  location.hash = k;
                }}
                style={{
                  cursor: "pointer",
                  fontSize: 12,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "none",
                  background: k === key ? "#0f0e0b" : "transparent",
                  color: k === key ? "#fff" : "#0f0e0b",
                }}
              >
                {MOCKUPS[k].label}
              </button>
            ))}
        </div>
      </div>
      <Comp />
    </>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
