import { RING } from "./Avatar";

/**
 * A karya's cover tile — the app-icon square (#92). Renders nothing without a
 * source: never a broken box, never a placeholder.
 *
 * `size` is the art inside the ring; the box carries the ring, so a size={56}
 * cover renders 58px — which is exactly what it has always rendered (#91).
 */
export function KaryaCover({
  src,
  size = 56,
  radius = 14,
  alt = "",
  className,
}: {
  src: string | null | undefined;
  size?: number;
  radius?: number;
  alt?: string;
  /** For a caller that needs to place the tile — spacing, never appearance. */
  className?: string;
}) {
  if (!src) return null;
  const box = size + RING * 2;
  return (
    <div
      className={className ? `karya-cover ${className}` : "karya-cover"}
      style={{ width: box, height: box, borderRadius: radius }}
    >
      <img
        src={src}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        loading="lazy"
      />
    </div>
  );
}
