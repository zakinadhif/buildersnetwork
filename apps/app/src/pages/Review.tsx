import { getGetMeQueryKey, saveProfile } from "@myapp/api-client-react";
import { Button } from "@myapp/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import {
  EditField,
  Eyebrow,
  InterestsEditor,
  Loading,
  SkillsEditor,
} from "@/components/ui-atoms";
import type { Member } from "@/lib/members";
import { useOnboarding } from "@/lib/use-onboarding";

export default function Review() {
  const { draft: initialDraft, clear } = useOnboarding();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [p, setP] = useState<Member>(() => ({
    ...(initialDraft ?? {
      id: "user",
      name: "",
      handle: null,
      bio: null,
      interests: [],
      year: "",
      major: "",
      skills: [],
    }),
    skills: initialDraft?.skills ?? [],
    interests: initialDraft?.interests ?? [],
  }));
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Member>(k: K, v: Member[K]) =>
    setP((x) => ({ ...x, [k]: v }));

  async function publish() {
    setBusy(true);
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

      clear();
      setBusy(false);
      navigate("/home");
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }

  if (!initialDraft) return <Redirect to="/onboarding" />;

  if (busy) return <Loading label="lagi menyimpan profil kamu" />;

  return (
    <div className="fixed inset-0 animate-up overflow-y-auto">
      <div className="max-w-[var(--container-page)] mx-auto px-7 pt-[52px] pb-[80px]">
        <Eyebrow className="mb-2">Al-Fath Berkarya</Eyebrow>
        <h1 className="text-feature font-light tracking-heading leading-heading">
          Ini yang aku tangkap.
        </h1>
        <p className="text-body text-ink2 leading-body mt-2 mb-8">
          Kalau ada yang meleset, ketuk langsung.
        </p>
        <hr className="border-none border-b border-line m-0 mb-8" />

        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Nama</Eyebrow>
          <EditField value={p.name} onChange={(v) => set("name", v)} />
        </div>
        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Handle</Eyebrow>
          <EditField
            value={p.handle ?? ""}
            onChange={(v) => set("handle", v)}
          />
        </div>
        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Angkatan</Eyebrow>
          <EditField value={p.year} onChange={(v) => set("year", v)} />
        </div>
        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Jurusan</Eyebrow>
          <EditField value={p.major} onChange={(v) => set("major", v)} />
        </div>
        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Bio</Eyebrow>
          <EditField
            value={p.bio ?? ""}
            onChange={(v) => set("bio", v)}
            multiline
          />
        </div>
        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Skills</Eyebrow>
          <SkillsEditor skills={p.skills} onChange={(v) => set("skills", v)} />
        </div>
        <div className="pf mb-7">
          <Eyebrow className="mb-1.5">Minat</Eyebrow>
          <InterestsEditor
            interests={p.interests}
            onChange={(v) => set("interests", v)}
          />
        </div>

        <hr className="border-none border-b border-line my-8" />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="primary" onClick={publish}>
            Publish profil →
          </Button>
        </div>
      </div>
    </div>
  );
}
