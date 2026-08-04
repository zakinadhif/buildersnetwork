import { describe, expect, it } from "vitest";
import {
  failedUploadCount,
  hasKaryaDraftErrors,
  karyaPublishErrorMessage,
  validateKaryaDraft,
} from "./karya-publish";

describe("validateKaryaDraft", () => {
  it("returns actionable errors for every required publish field", () => {
    const errors = validateKaryaDraft({
      title: "  ",
      description: "",
      stages: [],
      interests: [],
    });

    expect(errors).toEqual({
      title: "Judul karya tidak boleh kosong.",
      description: "Deskripsi karya tidak boleh kosong.",
      stages: "Pilih minimal satu tahap.",
      interests: "Pilih atau tambahkan minimal satu minat.",
    });
    expect(hasKaryaDraftErrors(errors)).toBe(true);
  });

  it("accepts a trimmed, publishable manual draft", () => {
    const errors = validateKaryaDraft({
      title: "  Peta Kost  ",
      description: " Ulasan kost dari penghuni aktif. ",
      stages: ["building"],
      interests: ["Web"],
    });

    expect(errors).toEqual({});
    expect(hasKaryaDraftErrors(errors)).toBe(false);
  });
});

describe("publish state helpers", () => {
  it("distinguishes partial media failure from a successful publish", () => {
    expect(
      failedUploadCount([
        { status: "fulfilled", value: undefined },
        { status: "rejected", reason: new Error("upload failed") },
      ]),
    ).toBe(1);
    expect(failedUploadCount([{ status: "fulfilled", value: undefined }])).toBe(
      0,
    );
  });

  it("turns API and unknown failures into actionable submission copy", () => {
    expect(karyaPublishErrorMessage(new Error("layanan sibuk"))).toBe(
      "Karya belum bisa diterbitkan: layanan sibuk",
    );
    expect(karyaPublishErrorMessage(null)).toContain("Periksa koneksi");
  });
});
