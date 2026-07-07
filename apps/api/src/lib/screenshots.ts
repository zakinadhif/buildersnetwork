// Shared helpers for karya screenshot images (issue #19). Same storage-key
// convention as covers (extension carries the content-type) but keyed per
// screenshot id, since a karya can have many.

/** Allowed screenshot content-types → the extension we store the key under. */
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

/** Max accepted screenshot size — 2 MiB (mirrors MAX_COVER_BYTES, NFR-6). */
export const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;

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

/** Content-type to serve a stored screenshot with, derived from its key's extension. */
export function contentTypeForKey(key: string): string {
  const ext = key.slice(key.lastIndexOf(".") + 1).toLowerCase();
  return EXT_TO_CONTENT_TYPE[ext] ?? "application/octet-stream";
}

/** Storage key for one screenshot — extension carries the content-type. */
export function screenshotKeyFor(
  karyaId: string,
  screenshotId: string,
  ext: string,
): string {
  return `karya/${karyaId}/screenshots/${screenshotId}.${ext}`;
}

/** Relative URL the client renders in `<img>` — same-origin in prod, Vite-proxied in dev. */
export function screenshotUrlFor(
  karyaId: string,
  screenshotId: string,
): string {
  return `/api/karya/${karyaId}/screenshots/${screenshotId}`;
}
