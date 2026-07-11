/**
 * Design tokens — one set, shared by every mockup screen.
 *
 * Fonts resolve through CSS custom properties rather than JS values. The gallery
 * root (see gallery/fonts.tsx `FontVars`) writes `--font-display` / `--font-body`
 * onto `:root`, so switching a font repaints everything that reads T.fontBody —
 * including module-level derived styles like `eyebrow` below — without any
 * render-time mutation of this object.
 *
 * That indirection is load-bearing. An earlier version mutated `T.fontBody`
 * during render; `eyebrow` captured the value at module-eval time and therefore
 * never picked up a font change.
 */
export const T = {
  bg:          "oklch(98% 0 0)",             // gallery white (neutral)
  ink:         "oklch(18% 0 0)",             // soft neutral near-black
  ink2:        "oklch(46% 0 0)",             // muted body — ~4.7:1 on white (AA)
  ink3:        "oklch(53% 0 0)",             // meta text — ~5:1 on bg (AA)
  accent:      "oklch(39% 0.085 62)",        // terracotta
  accentMid:   "oklch(55% 0.085 62)",        // terracotta mid — ~4.7:1 on bg (AA)
  accentFg:    "oklch(99% 0 0)",             // text on accent
  accentTint:  "oklch(95% 0.015 62)",        // light terracotta wash
  accentLine:  "oklch(88% 0.03 62)",         // terracotta-tinted hairline
  line:        "oklch(91% 0 0)",             // neutral hairline
  lineDark:    "oklch(85% 0 0)",
  surface:     "oklch(100% 0 0)",            // pure white lifted card

  fontDisplay: "var(--font-display)",        // brand / display copy (weight 400 only)
  fontBody:    "var(--font-body)",           // everything else: body, labels, meta

  // Type scale — fixed px (desktop product UI; port to rem for the shipping app).
  // Distinct roles, not arbitrary steps. The bottom four are 1px apart by design:
  // dense meta separated further by case + weight + colour.
  size: {
    micro:   10,  // eyebrow labels, tags, chips, dense inline meta
    caption: 11,  // subtitles, standalone secondary text, small counts
    ui:      12,  // nav, filters, controls, buttons, secondary body
    body:    13,  // primary body: descriptions, bios
    stat:    15,  // featured metric values
    title:   18,  // serif list-item titles + callout heading
    feature: 23,  // serif wordmark + featured title
    display: 30,  // serif page heading
  },
  weight: { light: 300, regular: 400, medium: 500, semibold: 600 },
  track:  { wide: "0.08em", tag: "0.02em", tight: "-0.01em" }, // letter-spacing roles
  lh:     { tight: 1.15, snug: 1.3, body: 1.55 },              // line-height roles
  radius:   "8px",
  radiusLg: "16px",
};

/** Shared style for short uppercase eyebrow / section labels. */
export const eyebrow = {
  fontFamily:    T.fontBody,
  fontSize:      T.size.micro,
  fontWeight:    T.weight.medium,
  letterSpacing: T.track.wide,
  textTransform: "uppercase" as const,
  color:         T.ink3,
};
