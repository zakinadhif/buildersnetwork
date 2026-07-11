// Hand-written multipart upload for karya covers (issue #18) and screenshots
// (issue #19). The generated api-client is JSON-only (OpenAPI-first); binary
// uploads sit outside it. Uses the same relative "/api" base the generated
// client uses — same-origin in prod, Vite-proxied in dev.
import type { ScreenshotOrientation } from "@myapp/api-client-react";

/** Content-types the cover endpoint accepts, mirrored client-side for a fast reject. */
export const COVER_ACCEPT = ["image/png", "image/jpeg", "image/webp"];
/** Max cover size — mirrors MAX_COVER_BYTES on the server (2 MiB). */
export const COVER_MAX_BYTES = 2 * 1024 * 1024;

/** Human-readable client-side validation, or null when the file is acceptable. */
export function validateCoverFile(file: File): string | null {
  if (!COVER_ACCEPT.includes(file.type)) {
    return "Format harus PNG, JPG, atau WebP.";
  }
  if (file.size > COVER_MAX_BYTES) {
    return "Ukuran maksimal 2 MB.";
  }
  return null;
}

/** Content-types the screenshot endpoint accepts — mirrors the cover picker. */
export const SCREENSHOT_ACCEPT = COVER_ACCEPT;
/** Max screenshot size — mirrors MAX_SCREENSHOT_BYTES on the server (2 MiB). */
export const SCREENSHOT_MAX_BYTES = COVER_MAX_BYTES;

/** Human-readable client-side validation, or null when the file is acceptable. */
export function validateScreenshotFile(file: File): string | null {
  if (!SCREENSHOT_ACCEPT.includes(file.type)) {
    return "Format harus PNG, JPG, atau WebP.";
  }
  if (file.size > SCREENSHOT_MAX_BYTES) {
    return "Ukuran maksimal 2 MB.";
  }
  return null;
}

/** Upload (or replace) a karya's cover. Returns the served cover URL. */
export async function uploadKaryaCover(
  karyaId: string,
  file: File,
): Promise<{ coverUrl: string | null }> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`/api/karya/${encodeURIComponent(karyaId)}/cover`, {
    method: "POST",
    body: form,
    credentials: "include",
  });

  if (!res.ok) {
    let message = `Gagal mengunggah cover (${res.status}).`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // non-JSON error body — keep the status-based message
    }
    throw new Error(message);
  }
  return res.json() as Promise<{ coverUrl: string | null }>;
}

/** A karya's screenshot, as returned by the upload/list endpoints. */
export interface KaryaScreenshot {
  id: string;
  url: string;
  orientation: ScreenshotOrientation;
  position: number;
}

async function errorFrom(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data?.error ?? fallback;
  } catch {
    return fallback;
  }
}

/** Upload one screenshot for a karya. Appended to the end of its orientation's order. */
export async function uploadKaryaScreenshot(
  karyaId: string,
  file: File,
  orientation: ScreenshotOrientation,
): Promise<KaryaScreenshot> {
  const form = new FormData();
  form.append("file", file);
  form.append("orientation", orientation);

  const res = await fetch(
    `/api/karya/${encodeURIComponent(karyaId)}/screenshots`,
    { method: "POST", body: form, credentials: "include" },
  );
  if (!res.ok) {
    throw new Error(
      await errorFrom(res, `Gagal mengunggah tangkapan layar (${res.status}).`),
    );
  }
  return res.json() as Promise<KaryaScreenshot>;
}

/** Remove one of a karya's screenshots. */
export async function deleteKaryaScreenshot(
  karyaId: string,
  screenshotId: string,
): Promise<void> {
  const res = await fetch(
    `/api/karya/${encodeURIComponent(karyaId)}/screenshots/${encodeURIComponent(screenshotId)}`,
    { method: "DELETE", credentials: "include" },
  );
  if (!res.ok) {
    throw new Error(
      await errorFrom(res, `Gagal menghapus gambar (${res.status}).`),
    );
  }
}

/** Reorder a karya's screenshots within one orientation. `ids` is the full, ordered list. */
export async function reorderKaryaScreenshots(
  karyaId: string,
  orientation: ScreenshotOrientation,
  ids: string[],
): Promise<void> {
  const res = await fetch(
    `/api/karya/${encodeURIComponent(karyaId)}/screenshots/reorder`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orientation, ids }),
      credentials: "include",
    },
  );
  if (!res.ok) {
    throw new Error(
      await errorFrom(res, `Gagal menyusun ulang (${res.status}).`),
    );
  }
}
