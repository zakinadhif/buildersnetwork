import type { ReactNode } from "react";
import type { Screen } from "../gallery";
import { T } from "@myapp/design-tokens";
import { GlobalStyles } from "./GlobalStyles";
import { LeftNav } from "./LeftNav";

/**
 * The page frame every mockup screen shares: tinted background, the one global
 * stylesheet, and the three-column shell led by the left nav. Children supply
 * the center column and right rail.
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
      {/* `shellOuter`, not `shellMax`: under the border-box base the padding
          lives inside `max-width`, so the columns need the gutters added back
          or they come out 48px short — which is exactly what the app did (#91). */}
      <div className="bn-shell" style={{
        maxWidth:   T.shellOuter,
        margin:     "0 auto",
        padding:    `24px ${T.shellPadX} 48px`,
        display:    "flex",
        gap:        24,
        alignItems: "flex-start",
      }}>
        <LeftNav active={active}>{navFilters}</LeftNav>
        {children}
      </div>
    </div>
  );
}
