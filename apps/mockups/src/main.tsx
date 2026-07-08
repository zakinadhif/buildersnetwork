import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import MockupB from "./MockupB";
import CariScreen from "./MockupCari";
import { NavProvider, type Screen } from "./gallery";
import { FontProvider, FontControls, DISPLAY_FONTS, BODY_FONTS } from "./fonts";

// ─── Mockup gallery ────────────────────────────────────────────────────────────
// No chrome of its own — navigation lives in each mockup's left sidebar. Clicking
// a routed label ("Launchpad" / "Jelajahi Karya" / "Cari Kolaborator") there calls
// the navigate fn provided below. Launchpad and Jelajahi are two surfaces of the
// one MockupB component (driven by the `screen` prop); Cari is its own screen.
// Font choice and switcher live here (shared chrome), so a font persists across
// navigation; each screen owns only its own controls (Cari's A/B/C/E picker).
function Gallery() {
  const [screen,     setScreen]     = useState<Screen>("launchpad");
  const [displayIdx, setDisplayIdx] = useState(0);
  const [bodyIdx,    setBodyIdx]    = useState(0);

  return (
    <NavProvider value={setScreen}>
      <FontProvider value={{ displayFont: DISPLAY_FONTS[displayIdx].font, bodyFont: BODY_FONTS[bodyIdx].font }}>
        {screen === "cari" ? <CariScreen /> : <MockupB screen={screen} />}
        <FontControls
          displayIdx={displayIdx} onDisplay={setDisplayIdx}
          bodyIdx={bodyIdx}       onBody={setBodyIdx}
        />
      </FontProvider>
    </NavProvider>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
