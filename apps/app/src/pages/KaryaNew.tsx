import { createKarya } from "@myapp/api-client-react";
import { Button, Eyebrow, Input, KaryaCover, Textarea } from "@myapp/ui";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { InterestsEditor, StageMultiSelect } from "@/components/ui-atoms";
import { useFeatureFlags } from "@/lib/feature-flags-context";
import type { KaryaDraft } from "@/lib/karya-draft-context";
import {
  failedUploadCount,
  hasKaryaDraftErrors,
  type KaryaDraftErrors,
  karyaPublishErrorMessage,
  validateKaryaDraft,
} from "@/lib/karya-publish";
import {
  uploadKaryaCover,
  uploadKaryaScreenshot,
  validateCoverFile,
  validateScreenshotFile,
} from "@/lib/upload";
import { useKaryaDraft } from "@/lib/use-karya-draft";

type Orientation = "landscape" | "portrait";
type SubmitState = "idle" | "publishing" | "uploading";

interface ScreenshotDraft {
  file: File;
  preview: string;
}

const TIPS = [
  "Cover dan tangkapan layar bikin karyamu lebih hidup di Scroll.",
  "Pilih tahap yang jujur — orang jadi paham kamu sedang di mana.",
  "Media itu opsional; karya tetap bisa terbit saat unggahan gagal.",
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-micro text-danger" role="alert">
      {message}
    </p>
  );
}

function ScreenshotGroup({
  label,
  hint,
  items,
  error,
  onAdd,
  onRemove,
  onMove,
}: {
  label: string;
  hint: string;
  items: ScreenshotDraft[];
  error: string | null;
  onAdd: (files: FileList | null) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mb-3">
      <div className="mb-2 flex items-baseline gap-2.5">
        <span className="font-body text-ui font-medium text-ink">{label}</span>
        <span className="font-body text-micro text-ink3">{hint}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        aria-label={`Tambah tangkapan layar ${label.toLowerCase()}`}
        className="hidden"
        onChange={(event) => {
          onAdd(event.target.files);
          event.target.value = "";
        }}
      />
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <div key={item.preview} className="flex flex-col gap-1">
            <img
              src={item.preview}
              alt={`Pratinjau ${label.toLowerCase()} ${index + 1}`}
              className="h-[68px] w-[92px] rounded-card border border-line object-cover"
            />
            <div className="flex justify-center gap-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-6 px-1.5 text-micro"
                disabled={index === 0}
                aria-label={`Geser ${label.toLowerCase()} ${index + 1} ke awal`}
                onClick={() => onMove(index, -1)}
              >
                ←
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-6 px-1.5 text-micro"
                disabled={index === items.length - 1}
                aria-label={`Geser ${label.toLowerCase()} ${index + 1} ke akhir`}
                onClick={() => onMove(index, 1)}
              >
                →
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-6 px-1.5 text-micro"
                aria-label={`Hapus ${label.toLowerCase()} ${index + 1}`}
                onClick={() => onRemove(index)}
              >
                ×
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="h-[68px] w-[92px] shrink-0 border-dashed text-micro"
          onClick={() => inputRef.current?.click()}
        >
          + tambah
        </Button>
      </div>
      <FieldError message={error ?? undefined} />
    </div>
  );
}

export function KaryaNewRail() {
  const [, navigate] = useLocation();
  const { enabled } = useFeatureFlags();
  return (
    <>
      <section>
        <Eyebrow className="mb-3">Pilih jalur</Eyebrow>
        <div className="rounded-panel border border-line bg-surface p-3.5">
          <p className="font-body text-ui font-medium text-ink">Isi manual</p>
          <p className="mt-1 font-body text-micro leading-body text-ink2">
            Kamu memegang kendali penuh dan bisa langsung menerbitkan.
          </p>
        </div>
        {enabled("aiAssistant") && (
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full"
            onClick={() => navigate("/assistant")}
          >
            Buka asisten AI ✨
          </Button>
        )}
      </section>
      <section>
        <Eyebrow className="mb-3">Biar makin dilirik</Eyebrow>
        <div className="flex flex-col gap-3.5">
          {TIPS.map((tip) => (
            <div key={tip} className="flex items-start gap-2.5">
              <span aria-hidden="true" className="leading-body text-accent">
                ◆
              </span>
              <p className="font-body text-ui leading-body text-ink2">{tip}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default function KaryaNew() {
  const { draft, setDraft, clear } = useKaryaDraft();
  const [, navigate] = useLocation();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errors, setErrors] = useState<KaryaDraftErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishedWithMediaError, setPublishedWithMediaError] = useState<{
    id: string;
    failedUploads: number;
  } | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [screenshots, setScreenshots] = useState<
    Record<Orientation, ScreenshotDraft[]>
  >({ landscape: [], portrait: [] });
  const [screenshotError, setScreenshotError] = useState<
    Record<Orientation, string | null>
  >({ landscape: null, portrait: null });
  const screenshotsRef = useRef(screenshots);

  useEffect(() => {
    screenshotsRef.current = screenshots;
  }, [screenshots]);

  useEffect(
    () => () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      for (const list of Object.values(screenshotsRef.current)) {
        for (const item of list) URL.revokeObjectURL(item.preview);
      }
    },
    [coverPreview],
  );

  const set = <K extends keyof KaryaDraft>(key: K, value: KaryaDraft[K]) => {
    setDraft({ ...draft, [key]: value });
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  };

  function pickCover(file: File | undefined) {
    if (!file) return;
    const error = validateCoverFile(file);
    if (error) {
      setCoverError(error);
      return;
    }
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverError(null);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function clearCover() {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview(null);
    setCoverError(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  function addScreenshots(orientation: Orientation, files: FileList | null) {
    if (!files?.length) return;
    const accepted: ScreenshotDraft[] = [];
    let error: string | null = null;
    for (const file of Array.from(files)) {
      const message = validateScreenshotFile(file);
      if (message) error = message;
      else accepted.push({ file, preview: URL.createObjectURL(file) });
    }
    setScreenshotError((current) => ({ ...current, [orientation]: error }));
    if (accepted.length) {
      setScreenshots((current) => ({
        ...current,
        [orientation]: [...current[orientation], ...accepted],
      }));
    }
  }

  function removeScreenshot(orientation: Orientation, index: number) {
    setScreenshots((current) => {
      URL.revokeObjectURL(current[orientation][index].preview);
      return {
        ...current,
        [orientation]: current[orientation].filter((_, item) => item !== index),
      };
    });
  }

  function moveScreenshot(
    orientation: Orientation,
    index: number,
    direction: -1 | 1,
  ) {
    setScreenshots((current) => {
      const next = [...current[orientation]];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, [orientation]: next };
    });
  }

  async function publish(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validateKaryaDraft(draft);
    setErrors(nextErrors);
    if (hasKaryaDraftErrors(nextErrors)) return;

    setSubmitError(null);
    setSubmitState("publishing");
    try {
      const { id } = await createKarya({
        title: draft.title.trim(),
        description: draft.description.trim(),
        stages: draft.stages,
        interests: draft.interests,
      });

      const mediaCount =
        (coverFile ? 1 : 0) +
        screenshots.landscape.length +
        screenshots.portrait.length;
      if (mediaCount) setSubmitState("uploading");
      const uploads: Promise<unknown>[] = [];
      if (coverFile) uploads.push(uploadKaryaCover(id, coverFile));
      for (const orientation of ["landscape", "portrait"] as const) {
        for (const item of screenshots[orientation]) {
          uploads.push(uploadKaryaScreenshot(id, item.file, orientation));
        }
      }
      const results = await Promise.allSettled(uploads);
      const failedUploads = failedUploadCount(results);

      clear();
      if (failedUploads) {
        setSubmitState("idle");
        setPublishedWithMediaError({
          id,
          failedUploads,
        });
        return;
      }
      navigate(`/karya/${id}`);
    } catch (error) {
      setSubmitState("idle");
      setSubmitError(karyaPublishErrorMessage(error));
    }
  }

  const busy = submitState !== "idle";

  if (publishedWithMediaError) {
    return (
      <section
        className="rounded-panel border border-accent-line bg-accent-tint px-6 py-8"
        role="status"
      >
        <Eyebrow className="mb-2 text-accent">Karya sudah terbit</Eyebrow>
        <h1 className="font-display text-title font-normal text-ink">
          Ada media yang belum terunggah.
        </h1>
        <p className="mt-2 max-w-prose font-body text-body leading-body text-ink2">
          {publishedWithMediaError.failedUploads} media gagal diunggah, tetapi
          halaman karyamu sudah aman. Buka halaman karya untuk melanjutkan tanpa
          media dan mengaturnya lagi nanti.
        </p>
        <Button
          type="button"
          className="mt-5"
          onClick={() => navigate(`/karya/${publishedWithMediaError.id}`)}
        >
          Buka karya tanpa media
        </Button>
      </section>
    );
  }

  return (
    <>
      <header className="mb-[26px] hidden min-[901px]:block">
        <h1 className="m-0 font-display text-display font-normal tracking-heading leading-heading text-ink">
          Bikin karya baru.
        </h1>
        <p className="mt-2 font-body text-body leading-body text-ink2">
          Isi detail karyamu di sini. Semuanya bisa kamu edit sebelum terbit.
        </p>
      </header>

      <form onSubmit={publish} noValidate>
        {submitError && (
          <div
            className="mb-5 rounded-card border border-danger/30 bg-danger/5 px-3.5 py-3 text-ui leading-body text-danger"
            role="alert"
          >
            {submitError}
          </div>
        )}
        {busy && (
          <div
            className="mb-5 rounded-card border border-line bg-surface px-3.5 py-3 text-ui leading-body text-ink2"
            role="status"
          >
            {submitState === "publishing"
              ? "Menerbitkan halaman karyamu…"
              : "Karya sudah dibuat. Mengunggah media…"}
          </div>
        )}

        <section className="pf mb-[22px]">
          <div className="mb-2 flex items-baseline gap-2.5">
            <Eyebrow as="label" htmlFor="karya-cover">
              Cover
            </Eyebrow>
            <span className="text-micro text-ink3">opsional</span>
          </div>
          <input
            ref={coverInputRef}
            id="karya-cover"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => pickCover(event.target.files?.[0])}
          />
          <div className="flex min-h-[120px] items-center justify-center gap-3 rounded-panel border-[1.5px] border-dashed border-line-dark bg-surface px-4">
            {coverPreview && <KaryaCover src={coverPreview} size={76} />}
            <div className="flex flex-col items-start gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverFile ? "Ganti gambar" : "Pilih cover"}
              </Button>
              {coverFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearCover}
                >
                  Hapus cover
                </Button>
              )}
              <span className="text-micro text-ink3">
                PNG, JPG, atau WebP · maks 2 MB
              </span>
            </div>
          </div>
          <FieldError message={coverError ?? undefined} />
        </section>

        <section className="pf mb-[22px]">
          <div className="mb-2 flex items-baseline gap-2.5">
            <Eyebrow>Tangkapan layar</Eyebrow>
            <span className="text-micro text-ink3">opsional</span>
          </div>
          <ScreenshotGroup
            label="Landscape"
            hint="muncul di Scroll"
            items={screenshots.landscape}
            error={screenshotError.landscape}
            onAdd={(files) => addScreenshots("landscape", files)}
            onRemove={(index) => removeScreenshot("landscape", index)}
            onMove={(index, direction) =>
              moveScreenshot("landscape", index, direction)
            }
          />
          <ScreenshotGroup
            label="Potret"
            hint="muncul di galeri detail"
            items={screenshots.portrait}
            error={screenshotError.portrait}
            onAdd={(files) => addScreenshots("portrait", files)}
            onRemove={(index) => removeScreenshot("portrait", index)}
            onMove={(index, direction) =>
              moveScreenshot("portrait", index, direction)
            }
          />
        </section>

        <section className="pf mb-[22px]">
          <Eyebrow as="label" htmlFor="karya-title" className="mb-2">
            Judul
          </Eyebrow>
          <Input
            id="karya-title"
            value={draft.title}
            aria-invalid={!!errors.title}
            placeholder="Nama karya kamu"
            onChange={(event) => set("title", event.target.value)}
          />
          <FieldError message={errors.title} />
        </section>

        <section className="pf mb-[22px]">
          <Eyebrow as="label" htmlFor="karya-description" className="mb-2">
            Deskripsi
          </Eyebrow>
          <Textarea
            id="karya-description"
            rows={3}
            value={draft.description}
            aria-invalid={!!errors.description}
            placeholder="Ceritakan karyanya dalam satu-dua kalimat."
            className="resize-y leading-body"
            onChange={(event) => set("description", event.target.value)}
          />
          <FieldError message={errors.description} />
        </section>

        <section className="pf mb-[22px]">
          <Eyebrow className="mb-2">Tahap</Eyebrow>
          <StageMultiSelect
            stages={draft.stages}
            onChange={(value) => set("stages", value)}
          />
          <FieldError message={errors.stages} />
        </section>

        <section className="pf mb-[22px]">
          <Eyebrow className="mb-2">Minat / tag</Eyebrow>
          <InterestsEditor
            interests={draft.interests}
            onChange={(value) => set("interests", value)}
          />
          <FieldError message={errors.interests} />
        </section>

        <div className="mt-2 flex justify-end border-t border-line pt-[22px]">
          <Button
            type="submit"
            size="lg"
            disabled={busy}
            className="px-[22px] font-semibold tracking-heading"
          >
            {busy ? "Menerbitkan…" : "Terbitkan karya"}
          </Button>
        </div>
      </form>
    </>
  );
}
