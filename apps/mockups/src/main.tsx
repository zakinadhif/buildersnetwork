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
import DaftarScreen, { MasukScreen } from "./screens/Auth";
import CariScreen from "./screens/cari";
import ScrollScreen from "./screens/Scroll";
import KaryaScreen from "./screens/Karya";
import PeopleScreen from "./screens/People";
import KaryaDetailScreen from "./screens/KaryaDetail";
import KaryaNewScreen from "./screens/KaryaNew";
import MinatSayaScreen from "./screens/MinatSaya";
import MulaiScreen from "./screens/Mulai";
import OnboardingScreen from "./screens/Onboarding";
import ProfilScreen from "./screens/Profil";

// ─── Mockup gallery ────────────────────────────────────────────────────────────
// Two ways to move between screens: the live sidebar surfaces (Scroll / Karya /
// People) route from each screen's own left nav, and the bottom-left screen switcher
// reaches everything — including the flow mockups (auth, entry, detail, creation)
// that carry no product sidebar, and the retired surfaces it keeps behind a toggle.
// Font choice lives bottom-right (shared chrome), so a font persists across
// navigation.
const SCREENS: Record<Screen, ComponentType> = {
  scroll:    ScrollScreen,
  karya:     KaryaScreen,
  people:    PeopleScreen,
  cari:      CariScreen,
  masuk:     MasukScreen,
  daftar:    DaftarScreen,
  mulai:     MulaiScreen,
  "karya-detail": KaryaDetailScreen,
  "karya-new": KaryaNewScreen,
  profil:    ProfilScreen,
  minat:     MinatSayaScreen,
  onboarding: OnboardingScreen,
};

function Gallery() {
  const [screen,     setScreen]     = useState<Screen>("scroll");
  const [displayIdx, setDisplayIdx] = useState(0);
  const [bodyIdx,    setBodyIdx]    = useState(0);
  const [pureWhite,  setPureWhite]  = useState(false);

  const ActiveScreen = SCREENS[screen];

  return (
    <NavProvider value={setScreen}>
      <FontVars
        displayFont={DISPLAY_FONTS[displayIdx].font}
        bodyFont={BODY_FONTS[bodyIdx].font}
        pureWhite={pureWhite}
      />
      <ActiveScreen />
      <ScreenSwitcher active={screen} onChange={setScreen} />
      <FontControls
        displayIdx={displayIdx} onDisplay={setDisplayIdx}
        bodyIdx={bodyIdx}       onBody={setBodyIdx}
        pureWhite={pureWhite}   onBackground={setPureWhite}
      />
    </NavProvider>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
