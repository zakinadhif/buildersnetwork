import type { KaryaDraft } from "@/lib/karya-draft-context";

export interface KaryaDraftErrors {
  title?: string;
  description?: string;
  stages?: string;
  interests?: string;
}

export function validateKaryaDraft(draft: KaryaDraft): KaryaDraftErrors {
  const errors: KaryaDraftErrors = {};
  if (!draft.title.trim()) errors.title = "Judul karya tidak boleh kosong.";
  if (!draft.description.trim()) {
    errors.description = "Deskripsi karya tidak boleh kosong.";
  }
  if (draft.stages.length === 0) errors.stages = "Pilih minimal satu tahap.";
  if (draft.interests.length === 0) {
    errors.interests = "Pilih atau tambahkan minimal satu minat.";
  }
  return errors;
}

export function hasKaryaDraftErrors(errors: KaryaDraftErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function failedUploadCount(
  results: PromiseSettledResult<unknown>[],
): number {
  return results.filter((result) => result.status === "rejected").length;
}

export function karyaPublishErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? `Karya belum bisa diterbitkan: ${error.message}`
    : "Karya belum bisa diterbitkan. Periksa koneksi lalu coba lagi.";
}
