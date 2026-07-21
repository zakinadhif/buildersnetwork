import {
  getGetMeQueryKey,
  saveMatches,
  saveProfile,
  useListMembers,
} from "@myapp/api-client-react";
import { Button } from "@myapp/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import {
  EditField,
  InterestsEditor,
  Loading,
  SkillsEditor,
} from "@/components/ui-atoms";
import { groundMatches } from "@/lib/matching";
import { callClaude, cleanJSON, type Member } from "@/lib/members";
import { useOnboarding } from "@/lib/onboarding-ctx";

export default function Review() {
  const { draft: initialDraft, setMatches } = useOnboarding();
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

  const { data: members = [] } = useListMembers();

  async function publish() {
    setBusy(true);
    const membersCtx = members
      .map(
        (m) =>
          `[${m.id}] ${m.name} (${m.year}, ${m.major}). Skills: ${m.skills.join(", ")}. Minat: ${m.interests.join(", ")}. Bio: ${m.bio ?? "-"}`,
      )
      .join("\n");
    const prompt = `Anggota baru:
Nama: ${p.name} | ${p.year} ${p.major}
Skills: ${p.skills.join(", ")}
Minat: ${p.interests.join(", ")}
Bio: ${p.bio ?? "-"}

Anggota komunitas:
${membersCtx}

Pilih 3 anggota yang paling mungkin connect atau kolaborasi dengan anggota baru ini.
Return JSON array: [{"memberId":"seed_m1","reason":"2-3 kalimat kenapa mereka cocok — spesifik, dalam bahasa Indonesia kasual"}]`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }]);
      const parsed = cleanJSON(raw) as { memberId: string; reason: string }[];
      const matched = groundMatches(parsed, members);

      await saveProfile({
        name: p.name,
        handle: p.handle ?? undefined,
        bio: p.bio ?? undefined,
        interests: p.interests,
        year: p.year,
        major: p.major,
        skills: p.skills,
      });
      await saveMatches({
        // Persist only grounded matches — hallucinated IDs are dropped so the
        // insert can't trip the matched_user_id foreign key.
        matches: matched.map((m) => ({ memberId: m.id, reason: m.reason })),
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });

      setMatches(matched);
      setBusy(false);
      navigate("/matches");
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }

  if (!initialDraft) return <Redirect to="/onboarding" />;

  if (busy) return <Loading label="lagi nyariin orang-orangnya" />;

  return (
    <div className="fixed inset-0 animate-up overflow-y-auto">
      <div className="max-w-[var(--container-page)] mx-auto px-7 pt-[52px] pb-[80px]">
        <p className="eyebrow mb-2">Al-Fath Berkarya</p>
        <h1 className="text-feature font-light tracking-heading leading-heading">
          Ini yang aku tangkap.
        </h1>
        <p className="text-body text-ink2 leading-body mt-2 mb-8">
          Kalau ada yang meleset, ketuk langsung.
        </p>
        <hr className="border-none border-b border-line m-0 mb-8" />

        <div className="pf mb-7">
          <p className="eyebrow mb-1.5">Nama</p>
          <EditField value={p.name} onChange={(v) => set("name", v)} />
        </div>
        <div className="pf mb-7">
          <p className="eyebrow mb-1.5">Handle</p>
          <EditField
            value={p.handle ?? ""}
            onChange={(v) => set("handle", v)}
          />
        </div>
        <div className="pf mb-7">
          <p className="eyebrow mb-1.5">Angkatan</p>
          <EditField value={p.year} onChange={(v) => set("year", v)} />
        </div>
        <div className="pf mb-7">
          <p className="eyebrow mb-1.5">Jurusan</p>
          <EditField value={p.major} onChange={(v) => set("major", v)} />
        </div>
        <div className="pf mb-7">
          <p className="eyebrow mb-1.5">Bio</p>
          <EditField
            value={p.bio ?? ""}
            onChange={(v) => set("bio", v)}
            multiline
          />
        </div>
        <div className="pf mb-7">
          <p className="eyebrow mb-1.5">Skills</p>
          <SkillsEditor skills={p.skills} onChange={(v) => set("skills", v)} />
        </div>
        <div className="pf mb-7">
          <p className="eyebrow mb-1.5">Minat</p>
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
