import { avatarColor, initials } from "../lib/format";
import { T } from "@myapp/design-tokens";

/** The hairline ring every avatar wears. Under the border-box base it sits
 *  inside the box, so the box has to carry it — see `size` below. */
const RING = 1;

/**
 * `size` is the disc *inside* the ring, which is what every call site means by
 * it: `size={28}` is a 28px face. The rendered element is `size + 2` — it always
 * has been, since the ring used to hang outside a content-box square — so the
 * box adds the ring back rather than eating into the face. Keeping that
 * arithmetic here is what let the base land without resizing a single avatar.
 */
export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span aria-hidden="true" style={{
      display:         "inline-flex",
      alignItems:      "center",
      justifyContent:  "center",
      width:           size + RING * 2,
      height:          size + RING * 2,
      borderRadius:    "50%",
      backgroundColor: avatarColor(name),
      color:           T.ink,
      fontFamily:      T.fontBody,
      fontSize:        size * 0.36,
      fontWeight:      T.weight.medium,
      flexShrink:      0,
      border:          `${RING}px solid ${T.line}`,
      userSelect:      "none" as const,
    }}>
      {initials(name)}
    </span>
  );
}
