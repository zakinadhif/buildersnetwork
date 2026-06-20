import {
  getGetMeQueryKey,
  saveMatches,
  saveProfile,
  useListMembers,
} from "@myapp/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import { EditField, Loading, SkillsEditor } from "@/components/ui-atoms";
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
    <div className="screen" style={{ overflowY: "auto" }}>
      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <p className="eyebrow mb8">Al-Fath Berkarya</p>
        <h1 className="h1">Ini yang aku tangkap.</h1>
        <p className="sub mt8 mb32">Kalau ada yang meleset, ketuk langsung.</p>
        <hr className="hr" style={{ margin: "0 0 32px" }} />

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
          <SkillsEditor skills={p.skills} onChange={(v) => set("skills", v)} />
        </div>
        <div className="pf">
          <p className="label">Minat</p>
          <SkillsEditor
            skills={p.interests}
            onChange={(v) => set("interests", v)}
          />
        </div>

        <hr className="hr" />
        <div className="row-end">
          <button type="button" className="btn btn-dark" onClick={publish}>
            Publish profil →
          </button>
        </div>
      </div>
    </div>
  );
}
