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
 * Consumers must import `@myapp/ui/ui.css` once, alongside the design tokens.
 */
export { Avatar, avatarColor, initials, RING } from "./Avatar";
export {
  KaryaCard,
  type KaryaCardActivity,
  type KaryaCardFace,
  type KaryaCardShot,
  type KaryaCardStage,
} from "./KaryaCard";
export { KaryaCover } from "./KaryaCover";
export { LeftNav, type NavItem, ShellColumns } from "./Shell";
export { Tag } from "./Tag";
