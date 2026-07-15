/** The hairline ring an avatar or cover wears. Under the shared border-box base
 *  it sits inside the box, so the box has to carry it (#91). */
export const RING = 1;

/** Two letters from a name: "Zaki Nadhif" → "ZN". */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Stable pastel hues from a full-string hash (avoids first-letter collisions). */
export function avatarColor(name: string): string {
  const hues = [22, 40, 62, 90, 155, 200, 255, 310];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `oklch(78% 0.08 ${hues[h % hues.length]})`;
}

/**
 * A member's face — the mockup's design, now the only one (#92). The app used to
 * carry its own: a dark disc with light initials, hashed off the handle. This is
 * the pastel disc with dark initials, hashed off the name, because the mockup is
 * the north star and it wins every disagreement.
 *
 * `size` is the face INSIDE the ring, which is what every call site means by it —
 * `size={28}` is a 28px face rendering as a 30px element. `image` is honoured
 * when a member actually has one (no uploads exist yet; the prop is here so that
 * feature lights this component up unchanged).
 */
export function Avatar({
  name,
  size = 28,
  image,
}: {
  name: string;
  size?: number;
  image?: string | null;
}) {
  const box = size + RING * 2;
  if (image) {
    return (
      <img
        className="avatar"
        src={image}
        alt={name}
        style={{ width: box, height: box }}
      />
    );
  }
  return (
    <span
      className="avatar"
      role="img"
      aria-label={name}
      title={name}
      style={{
        width: box,
        height: box,
        backgroundColor: avatarColor(name),
        fontSize: size * 0.36,
      }}
    >
      {initials(name)}
    </span>
  );
}
