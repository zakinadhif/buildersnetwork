import { getGetMeQueryKey, saveProfile } from "@myapp/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import AssistantChat from "@/components/AssistantChat";
import {
  EditField,
  InterestsEditor,
  Loading,
  SkillsEditor,
} from "@/components/ui-atoms";
import { introForMember } from "@/lib/assistant-copy";
import type { Member } from "@/lib/members";

/**
 * The AI assistant tab (issue #8) — the onboarding chat, now an always-available
 * in-shell tool instead of a gate. Reuses `AssistantChat`; its output stays an
 * **editable draft** (AI-2) that the member reviews and applies to their profile
 * on confirm. Reachable any time after login to enrich/adjust an existing
 * profile — the draft is merged onto the current one, not a blank overwrite.
 */

type Phase = "chat" | "review" | "saving" | "done";

const pick = (a: string | null | undefined, b: string | null | undefined) =>
  a?.trim() ? a : (b ?? "");

// Case-insensitive union — enrich the member's skills/interests, never drop them.
function union(a: string[], b: string[]): string[] {
  const out = [...a];
  const seen = new Set(a.map((x) => x.toLowerCase()));
  for (const x of b) {
    if (x.trim() && !seen.has(x.toLowerCase())) {
      out.push(x);
      seen.add(x.toLowerCase());
    }
  }
  return out;
}

function merge(existing: Member, draft: Member): Member {
  return {
    id: "user",
    name: pick(draft.name, existing.name),
    handle: pick(draft.handle, existing.handle) || null,
    bio: pick(draft.bio, existing.bio) || null,
    year: pick(draft.year, existing.year),
    major: pick(draft.major, existing.major),
    skills: union(existing.skills, draft.skills ?? []),
    interests: union(existing.interests, draft.interests ?? []),
  };
}

export default function Assistant({ user }: { user: Member }) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>("chat");
  const [p, setP] = useState<Member>(user);

  const set = <K extends keyof Member>(k: K, v: Member[K]) =>
    setP((x) => ({ ...x, [k]: v }));

  async function apply() {
    setPhase("saving");
    try {
      await saveProfile({
        name: p.name,
        handle: p.handle ?? undefined,
        bio: p.bio ?? undefined,
        interests: p.interests,
        year: p.year,
        major: p.major,
        skills: p.skills,
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setPhase("done");
    } catch (e) {
      console.error(e);
      setPhase("review");
    }
  }

  if (phase === "saving") return <Loading label="lagi nyimpen profil kamu" />;

  return (
    <>
      <div className="bn-head">
        <h1 className="bn-title">Asisten</h1>
        <span className="bn-title-sub">
          Ngobrol buat ngerapiin atau nambahin ke profilmu
        </span>
      </div>

      {phase === "chat" && (
        <AssistantChat
          intro={introForMember(user.name)}
          genLabel="lagi nyusun draft profilmu"
          onProfile={(draft) => {
            setP(merge(user, draft));
            setPhase("review");
          }}
        />
      )}

      {phase === "review" && (
        <div>
          <p className="sub mb32" style={{ marginTop: 4 }}>
            Ini yang aku tangkap — cek dulu, kalau ada yang meleset ketuk
            langsung. Belum kesimpen sampai kamu terapin.
          </p>

          <div className="pf">
            <p className="label">Nama</p>
            <EditField value={p.name} onChange={(v) => set("name", v)} />
          </div>
          <div className="pf">
            <p className="label">Handle</p>
            <EditField
              value={p.handle ?? ""}
              onChange={(v) => set("handle", v)}
            />
          </div>
          <div className="pf">
            <p className="label">Angkatan</p>
            <EditField value={p.year} onChange={(v) => set("year", v)} />
          </div>
          <div className="pf">
            <p className="label">Jurusan</p>
            <EditField value={p.major} onChange={(v) => set("major", v)} />
          </div>
          <div className="pf">
            <p className="label">Bio</p>
            <EditField
              value={p.bio ?? ""}
              onChange={(v) => set("bio", v)}
              multiline
            />
          </div>
          <div className="pf">
            <p className="label">Skills</p>
            <SkillsEditor
              skills={p.skills}
              onChange={(v) => set("skills", v)}
            />
          </div>
          <div className="pf">
            <p className="label">Minat</p>
            <InterestsEditor
              interests={p.interests}
              onChange={(v) => set("interests", v)}
            />
          </div>

          <hr className="hr" />
          <div className="row-end">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setPhase("chat")}
            >
              Ngobrol lagi
            </button>
            <button type="button" className="btn btn-dark" onClick={apply}>
              Terapkan ke profil →
            </button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div style={{ paddingTop: 8 }}>
          <p className="sub mb32">Profil kamu ke-update ✓</p>
          <div className="row">
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => navigate("/home")}
            >
              Ke Launchpad →
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setP((x) => x);
                setPhase("chat");
              }}
            >
              Ngobrol lagi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
