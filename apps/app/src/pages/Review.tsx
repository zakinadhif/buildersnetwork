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
import { type Member, type MemberMatch, callClaude, cleanJSON } from "@/lib/members";
import { useOnboarding } from "@/lib/onboarding-ctx";

export default function Review() {
  const { draft: initialDraft, setMatches } = useOnboarding();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [p, setP] = useState<Member>(() => ({
    ...(initialDraft ?? {
      id: "user",
      name: "",
      year: "",
      major: "",
      skills: [],
      building: "",
      wants: "",
      vibe: "",
    }),
    skills: initialDraft?.skills ?? [],
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
          `[${m.id}] ${m.name} (${m.year}, ${m.major}): ${m.skills.join(", ")}. Lagi bikin: ${m.building} Pengen: ${m.wants} Vibe: ${m.vibe}`,
      )
      .join("\n");
    const prompt = `Anggota baru:
Nama: ${p.name} | ${p.year} ${p.major}
Skills: ${p.skills.join(", ")}
Lagi bikin: ${p.building}
Pengen: ${p.wants}
Vibe: ${p.vibe}

Anggota komunitas:
${membersCtx}

Pilih 3 anggota yang paling mungkin connect atau kolaborasi dengan anggota baru ini.
Return JSON array: [{"memberId":"seed_m1","reason":"2-3 kalimat kenapa mereka cocok — spesifik, dalam bahasa Indonesia kasual"}]`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }]);
      const parsed = cleanJSON(raw) as { memberId: string; reason: string }[];
      const memberMap = new Map(members.map((m) => [m.id, m]));
      const matched = parsed
        .map((x) => ({ ...memberMap.get(x.memberId), reason: x.reason }))
        .filter((x) => x.id != null) as MemberMatch[];

      await saveProfile({ name: p.name, year: p.year, major: p.major, skills: p.skills, building: p.building, wants: p.wants, vibe: p.vibe });
      await saveMatches({ matches: parsed.map((x) => ({ memberId: x.memberId, reason: x.reason })) });
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
          <p className="label">Angkatan · Jurusan</p>
          <EditField
            value={`${p.year} · ${p.major}`}
            onChange={(v) => set("year", v)}
          />
        </div>
        <div className="pf">
          <p className="label">Skills</p>
          <SkillsEditor skills={p.skills} onChange={(v) => set("skills", v)} />
        </div>
        <div className="pf">
          <p className="label">Lagi bikin</p>
          <EditField
            value={p.building}
            onChange={(v) => set("building", v)}
            multiline
          />
        </div>
        <div className="pf">
          <p className="label">Pengen belajar / bikin</p>
          <EditField
            value={p.wants}
            onChange={(v) => set("wants", v)}
            multiline
          />
        </div>
        <div className="pf">
          <p className="label">Gaya kerja</p>
          <EditField
            value={p.vibe}
            onChange={(v) => set("vibe", v)}
            multiline
          />
        </div>

        <hr className="hr" />
        <div className="row-end">
          <button className="btn btn-dark" onClick={publish}>
            Publish profil →
          </button>
        </div>
      </div>
    </div>
  );
}
