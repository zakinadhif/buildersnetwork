import type { ReactNode } from "react";
import type { Screen } from "../gallery";
import { T } from "@myapp/design-tokens";
import { ShellColumns } from "@myapp/ui";
import { GlobalStyles } from "./GlobalStyles";
import { LeftNav } from "./LeftNav";

/**
 * The page frame every mockup screen shares: tinted background, the one global
 * stylesheet, and the three-column shell led by the left nav. Children supply
 * the center column and right rail.
 *
 * The columns' frame now comes from @myapp/ui (#92) — the same one the app
 * renders, so the measure cannot drift apart again. What stays here is what is
 * genuinely the gallery's: it is a document that scrolls, where the app is a
 * fixed pane that scrolls inside itself.
 *
 * The composer is not here. It briefly was — a modal the left rail opened from
 * any surface — on the theory that reach is what a composer needs. But a kabar is
 * always *about* one karya, and only two surfaces ever have one in hand: Scroll
 * (yours) and a karya's own page (that one). Everywhere else the door had nothing
 * to open with, and on the karya page it stood next to a better one. So it lives
 * on those two surfaces instead; see Composer.tsx.
 */
export function Shell({ active, navFilters, children }: {
  active:      Screen;
  navFilters?: ReactNode;
  children:    ReactNode;
}) {
  return (
    <div style={{
      backgroundColor: T.bg,
      minHeight:       "100vh",
      fontFamily:      T.fontBody,
      color:           T.ink,
    }}>
      <GlobalStyles />
      {/* Three-column layout (collapses to one column below ~900px) */}
      <ShellColumns>
        <LeftNav active={active}>{navFilters}</LeftNav>
        {children}
      </ShellColumns>
    </div>
  );
}
