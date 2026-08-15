import { T } from "@myapp/design-tokens";

/**
 * The one global stylesheet for every mockup screen — the subset that *must*
 * be runtime-injected because it references JS token values or CSS that
 * PostCSS/Tailwind cannot generate statically.
 *
 * All static rules (leading, focus rings, keyframes, reduced-motion, etc.) have
 * moved to `index.css` where they are parsed once, not re-injected on every
 * render. Only the two remaining dynamic concerns live here:
 *
 *   1. `.bn-post` bleed — `calc(-1 * var(--shell-gutter))` is expressible in
 *      plain CSS, but the hover tint (`T.bgHover`) needs the token value at
 *      runtime so the font-switcher's `:root` override can reach it.
 *      (Alternatively this could move to index.css too; keeping it here until
 *      the hover concern is resolved.)
 *
 *   2. The `@media (max-width: 900px)` responsive block — these rules target
 *      `bn-*` class names owned by @myapp/ui, not this file, so Tailwind
 *      arbitrary variants can't reach them. They use T.line for the divider
 *      border, which keeps them here until that is resolved.
 */
export function GlobalStyles() {
  return (
    <style>{`
      /* A Scroll post is a row into its karya, and the whole row is the target.
         The bleed pulls the box out to the column rules; padding pushes the type
         back. The hover tint is the one value that changes with the font
         switcher's :root override, which is why this stays runtime. */
      .bn-post {
        margin-inline: calc(-1 * ${T.shellGutter});
        padding-inline: ${T.shellGutter};
        cursor: pointer;
        transition: background 0.12s;
      }
      .bn-post:hover { background: ${T.bgHover}; }

      /* ── Responsive ──────────────────────────────────────────────────────────
         Below ~900px the three columns can't hold their measure. Stack to a
         single main column; Shell.tsx replaces both rails with purpose-built
         mobile chrome. The pane desktop frame is undone by @myapp/ui at 900px;
         what's left here is the gallery's own collapse. */
      @media (max-width: 900px) {
        .bn-shell-inner {
          flex-direction: column;
          gap: 0;
          padding: 0 16px calc(5.5rem + env(safe-area-inset-bottom));
        }
        /* @myapp/ui removes every main-column inset at this breakpoint. Keep
           the horizontal gutter on the shell, but restore breathing room below
           the sticky app bar so the first heading does not kiss its divider. */
        .bn-main { padding-top: 16px !important; }
        /* The desktop rail is replaced by the fixed mobile app chrome. */
        .bn-nav, .bn-rail { display: none !important; }
        /* The column gives up its gutter here, so a post has none to bleed into. */
        .bn-post { margin-inline: 0; padding-inline: 0; }
      }
    `}</style>
  );
}
