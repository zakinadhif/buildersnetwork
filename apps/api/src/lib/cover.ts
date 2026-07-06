// Shared helpers for karya cover images (issue #18). Covers are stored in
// object storage under a key whose extension encodes the content-type, so the
// serve route can set the right `Content-Type` without a companion DB column.

/** Allowed cover image content-types → the extension we store the key under. */
const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const EXT_TO_CONTENT_TYPE: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/** Max accepted cover size — 2 MiB. Community scale, not a media host (NFR-6). */
export const MAX_COVER_BYTES = 2 * 1024 * 1024;

/** Extension for an accepted content-type, or null when the type isn't allowed. */
export function extForContentType(
  contentType: string | undefined,
): string | null {
  if (!contentType) return null;
  return (
    CONTENT_TYPE_TO_EXT[contentType.split(";", 1)[0].trim().toLowerCase()] ??
    null
  );
}

/** Content-type to serve a stored cover with, derived from its key's extension. */
export function contentTypeForKey(key: string): string {
  const ext = key.slice(key.lastIndexOf(".") + 1).toLowerCase();
  return EXT_TO_CONTENT_TYPE[ext] ?? "application/octet-stream";
}

/** Storage key for a karya's cover — extension carries the content-type. */
export function coverKeyFor(karyaId: string, ext: string): string {
  return `karya/${karyaId}/cover.${ext}`;
}

/** Relative URL the client renders in `<img>` — same-origin in prod, Vite-proxied in dev. */
export function coverUrlFor(
  karyaId: string,
  coverKey: string | null,
): string | null {
  return coverKey ? `/api/karya/${karyaId}/cover` : null;
}
