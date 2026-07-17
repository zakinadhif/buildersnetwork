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

      /* Launchpad spotlight carousel. The karya card's own proof-shot carousel
         hides its scrollbar in @myapp/ui now (.karya-card-shots, #92). */
      .spotlight-carousel::-webkit-scrollbar { height: 8px; }
      .spotlight-carousel::-webkit-scrollbar-thumb {
        background: ${T.lineDark};
        border-radius: 99px;
      }
      .spotlight-carousel::-webkit-scrollbar-track { background: transparent; }

      /* Scroll's "Diskusi aktif" dot. The breathing is the signal — it says the
         thread is live *now*, which a static dot can only assert. Reduced-motion
         is caught by the blanket rule below, leaving a plain accent dot. */
      @keyframes bn-live-pulse {
        0%, 100% { opacity: 1;    transform: scale(1);    }
        50%      { opacity: 0.35; transform: scale(0.78); }
      }
      .bn-live-dot {
        width: 6px;
        height: 6px;
        border-radius: 99px;
        background: ${T.accent};
        flex-shrink: 0;
        animation: bn-live-pulse 2.4s ease-in-out infinite;
      }

      /* A Scroll post is a row into its karya, and the whole row is the target:
         the explicit "Lihat karya →" link came out of the footer, because the
         karya was already the post's cover and its byline, so the way in was said
         three times over. The hover and the pointer are what carry that claim now.

         The row's box is the column's full width rather than the measure's: it
         pulls out a gutter each way and pads the same amount straight back, so the
         type still sets to the 620 measure while the box reaches the rules on both
         sides. The tint and the divider both ride that box, so both span the
         column — a band of the column, not a box drawn around the text.

         Which is why the bleed lives on the box and not on a pseudo-element behind
         it: a border only ever spans the box it is set on, so a bleeding ::before
         could carry the tint out to the rules but left the divider stranded at the
         measure. */
      .bn-post {
        margin-inline: calc(-1 * ${T.shellGutter});
        padding-inline: ${T.shellGutter};
        cursor: pointer;
        transition: background 0.12s;
      }
      .bn-post:hover { background: ${T.bgHover}; }

      /* Honour reduced-motion: collapse the 0.15s state transitions. */
      @media (prefers-reduced-motion: reduce) {
        * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
      }

      /* ── Responsive ──────────────────────────────────────────────────────
         Below ~900px the three columns can't hold their measure. Stack to a
         single column led by the main column (mobile = the consumption view),
         and fold the left rail into a compact top nav bar.

         The panes' desktop frame — 100vh, sticky, the hairlines, the gutters —
         is undone in @myapp/ui's own 900px block, next to the rules that set
         it. What's left here is the gallery's own collapse. */
      @media (max-width: 900px) {
        .bn-shell-inner { flex-direction: column; padding: 16px 16px 40px; gap: 20px; }
        .bn-nav {
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid ${T.line};
        }
        .bn-nav-logo { margin: 0 auto 0 0 !important; padding: 0 !important; border-bottom: none !important; }
        .bn-nav-items { display: flex !important; flex-flow: row wrap; gap: 2px 4px; margin: 0 !important; }
        .bn-nav-items button { width: auto !important; }
        /* Nav filters + profile stub are desktop-only chrome; the main column
           carries discovery on mobile. */
        .bn-nav-filters, .bn-nav-user { display: none !important; }
        /* The column gives up its gutter here (@myapp/ui zeroes .bn-main's
           padding), so a post has none to bleed into — and bleeding anyway would
           push the row out past the page's own 16px edge and scroll the body
           sideways. Sit it flush. */
        .bn-post { margin-inline: 0; padding-inline: 0; }
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
