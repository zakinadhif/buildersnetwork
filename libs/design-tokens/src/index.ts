/**
 * The TypeScript view of the design tokens, for consumers that style through
 * React inline styles rather than classes (the mockup gallery, and a handful of
 * one-off styles in the app).
 *
 * Every value here is a `var(--...)` *reference* into ./theme.css — never a
 * copy of the value. That indirection is the entire point of this package: a
 * literal in this file would be a second declaration of a token, which is the
 * exact condition that let the app and the mockups drift apart. If you need a
 * token, add it to theme.css and point at it from here.
 *
 * It also means the values are strings, including the ones that read like
 * numbers (`T.size.body` is `"var(--text-body)"`, not `13`). CSS resolves them;
 * JavaScript cannot do arithmetic on them. If you ever need to *compute* from a
 * size, read the custom property at runtime rather than reintroducing a literal.
 *
 * Consuming this object requires theme.css to be loaded — importing the CSS is
 * what defines the variables these strings point at.
 */
export const T = {
  bg: "var(--color-bg)",
  ink: "var(--color-ink)",
  ink2: "var(--color-ink2)",
  ink3: "var(--color-ink3)",
  accent: "var(--color-accent)",
  accentMid: "var(--color-accent-mid)",
  accentFg: "var(--color-accent-fg)",
  accentTint: "var(--color-accent-tint)",
  accentLine: "var(--color-accent-line)",
  line: "var(--color-line)",
  lineDark: "var(--color-line-dark)",
  surface: "var(--color-surface)",
  danger: "var(--color-danger)",

  fontDisplay: "var(--font-display)",
  fontBody: "var(--font-body)",
  fontMono: "var(--font-mono)",

  /** The eight-step type scale. Roles, not arbitrary sizes — see theme.css. */
  size: {
    micro: "var(--text-micro)",
    caption: "var(--text-caption)",
    ui: "var(--text-ui)",
    body: "var(--text-body)",
    stat: "var(--text-stat)",
    title: "var(--text-title)",
    feature: "var(--text-feature)",
    display: "var(--text-display)",
  },
  weight: {
    light: "var(--font-weight-light)",
    regular: "var(--font-weight-regular)",
    medium: "var(--font-weight-medium)",
    semibold: "var(--font-weight-semibold)",
  },
  track: {
    eyebrow: "var(--tracking-eyebrow)",
    tag: "var(--tracking-tag)",
    heading: "var(--tracking-heading)",
  },
  lh: {
    heading: "var(--leading-heading)",
    compact: "var(--leading-compact)",
    body: "var(--leading-body)",
  },
  radiusCard: "var(--radius-card)",
  radiusPanel: "var(--radius-panel)",

  /** The content the shell's three columns divide up (1052px) — derived from the
   *  three measures below, never written down. */
  shellMax: "var(--container-shell)",
  /** The measures themselves. `shellMain` is what the centre column comes out at
   *  rather than what sets it (it is `flex: 1`); see theme.css. */
  shellNav: "var(--shell-nav)",
  shellMain: "var(--shell-main)",
  shellRail: "var(--shell-rail)",
  /** What the shell's `max-width` should actually be: the columns plus their
   *  gutters and rules. Under the border-box base, `max-width` is the outer box
   *  — reach for this, not `shellMax`, or the columns come out short (#91). */
  shellOuter: "var(--container-shell-outer)",
  /** The gutter on ONE column edge. Every column carries one on both sides, so
   *  its content clears the hairline between them. */
  shellGutter: "var(--shell-gutter)",
  pageMax: "var(--container-page)",
} as const;

/** Shared style for short uppercase eyebrow / section labels. */
export const eyebrow = {
  fontFamily: T.fontBody,
  fontSize: T.size.micro,
  fontWeight: T.weight.medium,
  letterSpacing: T.track.eyebrow,
  textTransform: "uppercase" as const,
  color: T.ink3,
  // A section label is UI text, not prose — body leading would sit it loose in
  // its box. It used to inherit `normal`, i.e. whatever the font decided (#93).
  lineHeight: T.lh.compact,
};
