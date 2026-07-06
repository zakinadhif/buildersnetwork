// Hand-written multipart upload for karya covers (issue #18). The generated
// api-client is JSON-only (OpenAPI-first); binary uploads sit outside it. Uses
// the same relative "/api" base the generated client uses — same-origin in
// prod, Vite-proxied in dev.

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
