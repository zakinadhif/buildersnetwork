/**
 * @myapp/ui — the chrome that has stopped moving (#92).
 *
 * Both apps import from here. Nothing in this package is a fork: if `Avatar`
 * lives once, an `Avatar` that drifts is not forbidden, it is impossible. That
 * is the difference between this and @myapp/design-tokens, which shares the
 * values but cannot share the way they are composed.
 *
 * What belongs here: chrome that is RATIFIED and PORTED — the design has settled
 * and both apps render it. What does not: anything still being explored. The
 * gallery's variant screens (`cari/Variant*`) keep their inline styles and their
 * freedom to move fast; that is what the gallery is for. See the graduation rule
 * in plans/how-to/parallel-ui-exploration.md.
 *
 * Consumers compose the shell with `ShellColumns`, `LeftNav`, `MainColumn`, and
 * `RailColumn`; the styling lives with those source components now.
 */
export { Avatar, avatarColor, initials, RING } from "./Avatar";
export { Eyebrow } from "./Eyebrow";
export {
  KaryaCard,
  type KaryaCardActivity,
  type KaryaCardFace,
  type KaryaCardShot,
  type KaryaCardStage,
} from "./KaryaCard";
export { KaryaCover } from "./KaryaCover";
export { cn } from "./lib/cn";
export * from "./primitives";
export {
  LeftNav,
  MainColumn,
  type NavItem,
  RailColumn,
  ShellColumns,
} from "./Shell";
export { Tag } from "./Tag";
