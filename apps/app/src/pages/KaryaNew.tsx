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
import { uploadKaryaCover, validateCoverFile } from "@/lib/upload";

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
      // Cover is optional: if it fails, the karya still exists and the owner
      // can add one later — don't block the redirect on it.
      if (coverFile) {
        try {
          await uploadKaryaCover(id, coverFile);
        } catch (e) {
          console.error("cover upload failed", e);
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
            color: "var(--ink2)",
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
          <p className="label">Cover (opsional)</p>
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
                  border: "1px dashed var(--line)",
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
                    color: "var(--danger, #c0392b)",
                  }}
                >
                  {coverError}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="pf">
          <p className="label">Judul</p>
          <EditField value={draft.title} onChange={(v) => set("title", v)} />
        </div>
        <div className="pf">
          <p className="label">Deskripsi</p>
          <EditField
            value={draft.description}
            onChange={(v) => set("description", v)}
            multiline
          />
        </div>
        <div className="pf">
          <p className="label">Tahap</p>
          <StageMultiSelect
            stages={draft.stages}
            onChange={(v) => set("stages", v)}
          />
        </div>
        <div className="pf">
          <p className="label">Minat / tag</p>
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
