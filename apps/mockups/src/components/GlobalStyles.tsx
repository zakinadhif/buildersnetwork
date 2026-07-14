import { T } from "@myapp/design-tokens";

/**
 * The one global stylesheet for every mockup screen: typographic niceties,
 * focus rings, reduced-motion, and the ~900px collapse of the three-column
 * shell. Rendered once by <Shell>.
 *
 * The carousel and card-grid rules are inert on screens that don't use those
 * class names, which is why they can live here rather than per-screen.
 */
export function GlobalStyles() {
  return (
    <style>{`
      /* Even line breaks on display type; fewer orphans in prose.
         overflow-wrap guards against long unbroken strings (URLs, IDs). */
      h1, h2, h3 { text-wrap: balance; overflow-wrap: break-word; }
      p { text-wrap: pretty; overflow-wrap: break-word; }

      /* ── Leading, by role (#93) ──────────────────────────────────────────
         The document defaults to the BODY role in the shared base. These two
         rules say where that is the wrong role, once, instead of leaving it to
         every author to remember at every element — which is how 1106 elements
         ended up with no leading at all, inheriting \`normal\` from the browser
         and letting font metrics decide the reference's height.

         A heading leads tight. A control's label — button, tab, chip, nav item
         — is interface text, not prose, and body leading sits it loose in its
         box. Screens may still override either inline where they mean to; this
         is the floor, not a ceiling. */
      h1, h2, h3, h4 { line-height: ${T.lh.heading}; }
      button, input, select, textarea { line-height: ${T.lh.compact}; }

      /* Visible keyboard focus on every interactive control. */
      button:focus-visible, a:focus-visible, input:focus-visible, [tabindex]:focus-visible {
        outline: 2px solid ${T.accent};
        outline-offset: 2px;
        border-radius: ${T.radiusCard};
      }

      /* Placeholder held to the body-text contrast bar, not the UA grey. */
      input::placeholder { color: ${T.ink3}; opacity: 1; }

      /* Launchpad spotlight + landscape screenshot carousels. */
      .spotlight-carousel::-webkit-scrollbar { height: 8px; }
      .spotlight-carousel::-webkit-scrollbar-thumb {
        background: ${T.lineDark};
        border-radius: 99px;
      }
      .spotlight-carousel::-webkit-scrollbar-track { background: transparent; }
      .landscape-carousel { scrollbar-width: none; }
      .landscape-carousel::-webkit-scrollbar { display: none; }

      /* Honour reduced-motion: collapse the 0.15s state transitions. */
      @media (prefers-reduced-motion: reduce) {
        * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
      }

      /* ── Responsive ──────────────────────────────────────────────────────
         Below ~900px the three columns can't hold their measure. Stack to a
         single column led by the main column (mobile = the consumption view),
         and fold the left rail into a compact top nav bar. */
      @media (max-width: 900px) {
        .bn-shell-inner { flex-direction: column; padding: 16px 16px 40px; gap: 20px; }
        .bn-nav, .bn-main, .bn-rail { width: 100% !important; }
        .bn-rail { position: static !important; top: auto !important; }
        .bn-nav {
          flex-direction: row !important;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px 16px;
          padding-top: 0 !important;
          padding-bottom: 14px;
          border-bottom: 1px solid ${T.line};
        }
        .bn-nav-logo { margin: 0 auto 0 0 !important; padding: 0 !important; border-bottom: none !important; }
        .bn-nav-items { display: flex !important; flex-flow: row wrap; gap: 2px 4px; margin: 0 !important; }
        .bn-nav-items button { width: auto !important; }
        /* Nav filters + profile stub are desktop-only chrome; the main column
           carries discovery on mobile. */
        .bn-nav-filters, .bn-nav-user { display: none !important; }
      }

      /* Cari variant B's 2-col card grid collapses on a narrow center column. */
      @media (max-width: 700px) {
        .cari-grid { grid-template-columns: 1fr !important; }
      }

      /* Comfortable touch targets where the pointer is coarse. */
      @media (pointer: coarse) {
        .bn-nav-items button { min-height: 44px; }
      }
    `}</style>
  );
}
