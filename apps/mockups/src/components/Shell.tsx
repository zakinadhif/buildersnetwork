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
