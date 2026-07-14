import { createKarya } from "@myapp/api-client-react";
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
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <span
          style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}
        >
          {label}
        </span>
        <span style={{ fontSize: 12, color: "var(--color-ink3)" }}>{hint}</span>
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
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {items.map((it, i) => (
          <div
            key={it.preview}
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <img
              src={it.preview}
              alt=""
              style={{
                width: 96,
                height: 72,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid var(--color-line)",
                display: "block",
              }}
            />
            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "2px 6px", fontSize: 11 }}
                disabled={i === 0}
                onClick={() => onMove(i, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "2px 6px", fontSize: 11 }}
                disabled={i === items.length - 1}
                onClick={() => onMove(i, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "2px 6px", fontSize: 11 }}
                onClick={() => onRemove(i)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline"
          style={{ width: 96, height: 72, flexShrink: 0 }}
          onClick={() => inputRef.current?.click()}
        >
          + tambah
        </button>
      </div>
      {error && (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 12,
            color: "var(--color-danger)",
          }}
        >
          {error}
        </p>
      )}
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
    <div className="screen" style={{ overflowY: "auto" }}>
      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <button
          type="button"
          onClick={() => window.history.back()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-ink2)",
            fontSize: 13,
            padding: 0,
            marginBottom: 32,
          }}
        >
          ← balik
        </button>

        <p className="eyebrow mb8">Al-Fath Berkarya</p>
        <h1 className="h1">Bikin karya baru.</h1>
        <p className="sub mt8 mb16">
          Isi sendiri, atau biar AI yang bantu nyusun dari obrolan.
        </p>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigate("/karya/new/ai")}
        >
          isi pakai AI ✨
        </button>
        <hr className="hr" style={{ margin: "28px 0 32px" }} />

        <div className="pf">
          <p className="eyebrow mb6">Cover (opsional)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => pickCover(e.target.files?.[0])}
            style={{ display: "none" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {coverPreview ? (
              <KaryaCover url={coverPreview} size={72} />
            ) : (
              <div
                aria-hidden="true"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  border: "1px dashed var(--color-line)",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {coverFile ? "Ganti gambar" : "Pilih gambar"}
                </button>
                {coverFile && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={clearCover}
                  >
                    Hapus
                  </button>
                )}
              </div>
              <p className="sub" style={{ margin: 0, fontSize: 12 }}>
                PNG, JPG, atau WebP — maks 2 MB.
              </p>
              {coverError && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "var(--color-danger)",
                  }}
                >
                  {coverError}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="pf">
          <p className="eyebrow mb6">Tangkapan layar (opsional)</p>
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
        <div className="pf">
          <p className="eyebrow mb6">Judul</p>
          <EditField value={draft.title} onChange={(v) => set("title", v)} />
        </div>
        <div className="pf">
          <p className="eyebrow mb6">Deskripsi</p>
          <EditField
            value={draft.description}
            onChange={(v) => set("description", v)}
            multiline
          />
        </div>
        <div className="pf">
          <p className="eyebrow mb6">Tahap</p>
          <StageMultiSelect
            stages={draft.stages}
            onChange={(v) => set("stages", v)}
          />
        </div>
        <div className="pf">
          <p className="eyebrow mb6">Minat / tag</p>
          <InterestsEditor
            interests={draft.interests}
            onChange={(v) => set("interests", v)}
          />
        </div>

        <hr className="hr" />
        <div className="row-end">
          <button
            type="button"
            className="btn btn-dark"
            onClick={publish}
            disabled={!canPublish}
            style={
              canPublish ? undefined : { opacity: 0.35, cursor: "default" }
            }
          >
            Publish karya →
          </button>
        </div>
      </div>
    </div>
  );
}
