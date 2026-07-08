import { StrictMode, useState, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import {
  BODY_FONTS,
  DISPLAY_FONTS,
  FontControls,
  FontVars,
  NavProvider,
  type Screen,
} from "./gallery";
import CariScreen from "./screens/cari";
import JelajahiScreen from "./screens/Jelajahi";
import LaunchpadScreen from "./screens/Launchpad";

// ─── Mockup gallery ────────────────────────────────────────────────────────────
// No chrome of its own — navigation lives in each screen's left sidebar. Clicking
// a routed label ("Launchpad" / "Jelajahi Karya" / "Cari Kolaborator") there calls
// the navigate fn provided below. Font choice and switcher live here (shared
// chrome), so a font persists across navigation; each screen owns only its own
// controls (Cari's A/B/C/E variant picker).
const SCREENS: Record<Screen, ComponentType> = {
  launchpad: LaunchpadScreen,
  jelajahi:  JelajahiScreen,
  cari:      CariScreen,
};

function Gallery() {
  const [screen,     setScreen]     = useState<Screen>("launchpad");
  const [displayIdx, setDisplayIdx] = useState(0);
  const [bodyIdx,    setBodyIdx]    = useState(0);

  const ActiveScreen = SCREENS[screen];

  return (
    <NavProvider value={setScreen}>
      <FontVars
        displayFont={DISPLAY_FONTS[displayIdx].font}
        bodyFont={BODY_FONTS[bodyIdx].font}
      />
      <ActiveScreen />
      <FontControls
        displayIdx={displayIdx} onDisplay={setDisplayIdx}
        bodyIdx={bodyIdx}       onBody={setBodyIdx}
      />
    </NavProvider>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
