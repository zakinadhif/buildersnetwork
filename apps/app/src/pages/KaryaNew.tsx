import { createKarya } from "@myapp/api-client-react";
import { Button } from "@myapp/ui";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  EditField,
  InterestsEditor,
  KaryaCover,
  Loading,
  StageMultiSelect,
} from "@/components/ui-atoms";
import { type KaryaDraft, useKaryaDraft } from "@/lib/karya-draft-ctx";
import { Eyebrow } from "@/components/ui-atoms";
import {
  uploadKaryaCover,
  uploadKaryaScreenshot,
  validateCoverFile,
  validateScreenshotFile,
} from "@/lib/upload";

type Orientation = "landscape" | "portrait";
interface ScreenshotDraft {
  file: File;
  preview: string;
}

/**
 * One orientation's screenshot picker (issue #19) — landscape feeds the feed
 * carousel, portrait the detail gallery. Order here becomes upload order,
 * which becomes `position` (the server appends each upload to the end).
 */
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
  onMove: (index: number, dir: -1 | 1) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mb-[18px]">
      <div className="flex items-baseline gap-2.5 mb-2">
        <span className="text-[13px] font-semibold text-ink">{label}</span>
        <span className="text-[12px] text-ink3">{hint}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={(e) => {
          onAdd(e.target.files);
          e.target.value = "";
        }}
        style={{ display: "none" }}
      />
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <div key={it.preview} className="flex flex-col gap-1">
            <img
              src={it.preview}
              alt=""
              className="w-24 h-[72px] object-cover rounded-card border border-line block"
            />
            <div className="flex justify-center gap-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="px-1.5 py-0.5 text-[11px]"
                disabled={i === 0}
                onClick={() => onMove(i, -1)}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="px-1.5 py-0.5 text-[11px]"
                disabled={i === items.length - 1}
                onClick={() => onMove(i, 1)}
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="px-1.5 py-0.5 text-[11px]"
                onClick={() => onRemove(i)}
              >
                ×
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="w-24 h-[72px] shrink-0"
          onClick={() => inputRef.current?.click()}
        >
          + tambah
        </Button>
      </div>
      {error && <p className="m-0 mt-1.5 text-[12px] text-danger">{error}</p>}
    </div>
  );
}

// The direct (non-AI) draft surface and the shared publish path (DECISION-D).
// Whether the draft was typed here or pre-filled by the agent, this screen is
// the single source of the `POST /api/karya` request. A member can create a
// karya here without ever touching the agent.
export default function KaryaNew() {
  const { draft, setDraft, clear } = useKaryaDraft();
  const [, navigate] = useLocation();
  const [busy, setBusy] = useState(false);

  // Cover lives in local state, not the sessionStorage draft — a File can't
  // serialize. It's uploaded after the karya is created (which mints the id).
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke the previous object URL when the preview changes or on unmount.
  useEffect(() => {
    if (!coverPreview) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  function pickCover(file: File | undefined) {
    if (!file) return;
    const err = validateCoverFile(file);
    if (err) {
      setCoverError(err);
      return;
    }
    setCoverError(null);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function clearCover() {
    setCoverFile(null);
    setCoverError(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Screenshot gallery (issue #19), same "local state, uploaded after create"
  // pattern as the cover. Kept per-orientation since landscape (feed carousel)
  // and portrait (detail gallery) are independently ordered.
  const [screenshots, setScreenshots] = useState<
    Record<Orientation, ScreenshotDraft[]>
  >({ landscape: [], portrait: [] });
  const [screenshotError, setScreenshotError] = useState<
    Record<Orientation, string | null>
  >({ landscape: null, portrait: null });
  const screenshotsRef = useRef(screenshots);
  screenshotsRef.current = screenshots;

  // Revoke every preview URL on unmount (mirrors the cover preview cleanup).
  useEffect(() => {
    return () => {
      for (const list of Object.values(screenshotsRef.current)) {
        for (const d of list) URL.revokeObjectURL(d.preview);
      }
    };
  }, []);

  function addScreenshots(orientation: Orientation, files: FileList | null) {
    if (!files || files.length === 0) return;
    const accepted: ScreenshotDraft[] = [];
    let err: string | null = null;
    for (const file of Array.from(files)) {
      const msg = validateScreenshotFile(file);
      if (msg) {
        err = msg;
        continue;
      }
      accepted.push({ file, preview: URL.createObjectURL(file) });
    }
    setScreenshotError((p) => ({ ...p, [orientation]: err }));
    if (accepted.length > 0) {
      setScreenshots((p) => ({
        ...p,
        [orientation]: [...p[orientation], ...accepted],
      }));
    }
  }

  function removeScreenshot(orientation: Orientation, index: number) {
    setScreenshots((p) => {
      const list = p[orientation];
      URL.revokeObjectURL(list[index].preview);
      return { ...p, [orientation]: list.filter((_, i) => i !== index) };
    });
  }

  function moveScreenshot(
    orientation: Orientation,
    index: number,
    dir: -1 | 1,
  ) {
    setScreenshots((p) => {
      const list = [...p[orientation]];
      const j = index + dir;
      if (j < 0 || j >= list.length) return p;
      [list[index], list[j]] = [list[j], list[index]];
      return { ...p, [orientation]: list };
    });
  }

  const set = <K extends keyof KaryaDraft>(k: K, v: KaryaDraft[K]) =>
    setDraft({ ...draft, [k]: v });

  const canPublish =
    draft.title.trim() !== "" && draft.description.trim() !== "";

  async function publish() {
    if (!canPublish) return;
    setBusy(true);
    try {
      const { id } = await createKarya({
        title: draft.title.trim(),
        description: draft.description.trim(),
        stages: draft.stages,
        interests: draft.interests,
      });
      // Cover and screenshots are optional: if an upload fails, the karya
      // still exists and the owner can add images later — don't block the
      // redirect on them. Sequential per orientation so `position` (server-
      // assigned as upload order) matches what the owner arranged.
      if (coverFile) {
        try {
          await uploadKaryaCover(id, coverFile);
        } catch (e) {
          console.error("cover upload failed", e);
        }
      }
      for (const orientation of ["landscape", "portrait"] as const) {
        for (const draft of screenshots[orientation]) {
          try {
            await uploadKaryaScreenshot(id, draft.file, orientation);
          } catch (e) {
            console.error("screenshot upload failed", e);
          }
        }
      }
      clear();
      navigate(`/karya/${id}`);
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }

  if (busy) return <Loading label="lagi nerbitin karya kamu" />;

  return (
    <div className="fixed inset-0 animate-up overflow-y-auto">
      <div className="max-w-[var(--container-page)] mx-auto px-7 pt-[52px] pb-[80px]">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-transparent border-none cursor-pointer text-ink2 text-[13px] p-0 mb-8"
        >
          ← balik
        </button>

        <Eyebrow className="mb-2">Al-Fath Berkarya</Eyebrow>
        <h1 className="text-feature font-light tracking-heading leading-heading">
          Bikin karya baru.
        </h1>
        <p className="text-body text-ink2 leading-body mt-2 mb-4">
          Isi sendiri, atau biar AI yang bantu nyusun dari obrolan.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/karya/new/ai")}
        >
          isi pakai AI ✨
        </Button>
        <hr className="border-none border-b border-line my-7 mb-8" />

        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Cover (opsional)</Eyebrow>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => pickCover(e.target.files?.[0])}
            style={{ display: "none" }}
          />
          <div className="flex items-center gap-3.5">
            {coverPreview ? (
              <KaryaCover src={coverPreview} size={72} />
            ) : (
              <div
                aria-hidden="true"
                className="w-[72px] h-[72px] rounded-[16px] border border-dashed border-line shrink-0"
              />
            )}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {coverFile ? "Ganti gambar" : "Pilih gambar"}
                </Button>
                {coverFile && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={clearCover}
                  >
                    Hapus
                  </Button>
                )}
              </div>
              <p className="text-body text-ink2 leading-body m-0 text-[12px]">
                PNG, JPG, atau WebP — maks 2 MB.
              </p>
              {coverError && (
                <p className="m-0 text-[12px] text-danger">{coverError}</p>
              )}
            </div>
          </div>
        </div>
        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Tangkapan layar (opsional)</Eyebrow>
          <ScreenshotGroup
            label="Landscape"
            hint="muncul di baris feed"
            items={screenshots.landscape}
            error={screenshotError.landscape}
            onAdd={(files) => addScreenshots("landscape", files)}
            onRemove={(i) => removeScreenshot("landscape", i)}
            onMove={(i, dir) => moveScreenshot("landscape", i, dir)}
          />
          <ScreenshotGroup
            label="Potret"
            hint="muncul di galeri detail"
            items={screenshots.portrait}
            error={screenshotError.portrait}
            onAdd={(files) => addScreenshots("portrait", files)}
            onRemove={(i) => removeScreenshot("portrait", i)}
            onMove={(i, dir) => moveScreenshot("portrait", i, dir)}
          />
        </div>
        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Judul</Eyebrow>
          <EditField value={draft.title} onChange={(v) => set("title", v)} />
        </div>
        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Deskripsi</Eyebrow>
          <EditField
            value={draft.description}
            onChange={(v) => set("description", v)}
            multiline
          />
        </div>
        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Tahap</Eyebrow>
          <StageMultiSelect
            stages={draft.stages}
            onChange={(v) => set("stages", v)}
          />
        </div>
        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Minat / tag</Eyebrow>
          <InterestsEditor
            interests={draft.interests}
            onChange={(v) => set("interests", v)}
          />
        </div>

        <hr className="border-none border-b border-line my-8" />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={publish}
            disabled={!canPublish}
            style={
              canPublish ? undefined : { opacity: 0.35, cursor: "default" }
            }
          >
            Publish karya →
          </Button>
        </div>
      </div>
    </div>
  );
}
