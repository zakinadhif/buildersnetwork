import { T } from "@myapp/design-tokens";

export function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span style={{
      display:         "inline-block",
      fontFamily:      T.fontBody,
      fontSize:        T.size.micro,
      letterSpacing:   T.track.tag,
      padding:         "1px 7px",
      borderRadius:    "3px",
      border:          `1px solid ${accent ? T.accent : T.line}`,
      color:           accent ? T.accent : T.ink2,
      backgroundColor: accent ? T.accentTint : "transparent",
      whiteSpace:      "nowrap" as const,
      // A tag is a single-line UI label: compact, not body (#93).
      lineHeight:      T.lh.compact,
    }}>{label}</span>
  );
}
