import { createKarya } from "@myapp/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  EditField,
  InterestsEditor,
  Loading,
  StageMultiSelect,
} from "@/components/ui-atoms";
import { type KaryaDraft, useKaryaDraft } from "@/lib/karya-draft-ctx";

// The direct (non-AI) draft surface and the shared publish path (DECISION-D).
// Whether the draft was typed here or pre-filled by the agent, this screen is
// the single source of the `POST /api/karya` request. A member can create a
// karya here without ever touching the agent.
export default function KaryaNew() {
  const { draft, setDraft, clear } = useKaryaDraft();
  const [, navigate] = useLocation();
  const [busy, setBusy] = useState(false);

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
