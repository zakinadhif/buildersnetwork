import { StrictMode, useState, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  BODY_FONTS,
  DISPLAY_FONTS,
  FontControls,
  FontVars,
  NavProvider,
  ScreenSwitcher,
  type Screen,
} from "./gallery";
import AuthScreen from "./screens/Auth";
import CariScreen from "./screens/cari";
import JelajahiScreen from "./screens/Jelajahi";
import LaunchpadScreen from "./screens/Launchpad";
import KaryaDetailScreen from "./screens/KaryaDetail";
import MulaiScreen from "./screens/Mulai";

// ─── Mockup gallery ────────────────────────────────────────────────────────────
// Two ways to move between screens: the sidebar surfaces (Launchpad / Jelajahi /
// Cari) route from each screen's own left nav, and the bottom-left screen switcher
// reaches everything — including the flow mockups (auth, entry, detail, creation)
// that carry no product sidebar. Font choice lives bottom-right (shared chrome),
// so a font persists across navigation.
const SCREENS: Record<Screen, ComponentType> = {
  launchpad: LaunchpadScreen,
  jelajahi:  JelajahiScreen,
  cari:      CariScreen,
  auth:      AuthScreen,
  mulai:     MulaiScreen,
  "karya-detail": KaryaDetailScreen,
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
      <ScreenSwitcher active={screen} onChange={setScreen} />
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
