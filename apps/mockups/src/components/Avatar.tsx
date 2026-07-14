import { avatarColor, initials } from "../lib/format";
import { T } from "@myapp/design-tokens";

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span aria-hidden="true" style={{
      display:         "inline-flex",
      alignItems:      "center",
      justifyContent:  "center",
      width:           size,
      height:          size,
      borderRadius:    "50%",
      backgroundColor: avatarColor(name),
      color:           T.ink,
      fontFamily:      T.fontBody,
      fontSize:        size * 0.36,
      fontWeight:      T.weight.medium,
      flexShrink:      0,
      border:          `1.5px solid ${T.line}`,
      userSelect:      "none" as const,
    }}>
      {initials(name)}
    </span>
  );
}
