import { useState } from "react";
import { EditField, Loading, SkillsEditor } from "@/components/ui-atoms";
import { type Member, SEED_MEMBERS, callClaude, cleanJSON } from "@/lib/members";

export default function Review({
  draft,
  onPublish,
}: {
  draft: Member;
  onPublish: (profile: Member, matches: Member[]) => void;
}) {
  const [p, setP] = useState<Member>({ ...draft, skills: draft.skills ?? [] });
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Member>(k: K, v: Member[K]) =>
    setP((x) => ({ ...x, [k]: v }));

  async function publish() {
    setBusy(true);
    const membersCtx = SEED_MEMBERS.map(
      (m) =>
        `[${m.id}] ${m.name} (${m.year}, ${m.major}): ${m.skills.join(", ")}. Lagi bikin: ${m.building} Pengen: ${m.wants} Vibe: ${m.vibe}`,
    ).join("\n");
    const prompt = `Anggota baru:
Nama: ${p.name} | ${p.year} ${p.major}
Skills: ${p.skills.join(", ")}
Lagi bikin: ${p.building}
Pengen: ${p.wants}
Vibe: ${p.vibe}

Anggota komunitas:
${membersCtx}

Pilih 3 anggota yang paling mungkin connect atau kolaborasi dengan anggota baru ini.
Return JSON array: [{"memberId":"m1","reason":"2-3 kalimat kenapa mereka cocok — spesifik, dalam bahasa Indonesia kasual"}]`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }]);
      const parsed = cleanJSON(raw) as { memberId: string; reason: string }[];
      const matched = parsed
        .map((x) => ({
          ...SEED_MEMBERS.find((s) => s.id === x.memberId),
          reason: x.reason,
        }))
        .filter(Boolean) as Member[];
      setBusy(false);
      onPublish(p, matched);
    } catch (e) {
      console.error(e);
      setBusy(false);
      onPublish(p, []);
    }
  }

  if (busy) return <Loading label="lagi nyariin orang-orangnya" />;

  return (
    <div className="screen" style={{ overflowY: "auto" }}>
      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <p className="eyebrow mb8">Al-Fath Berkarya</p>
        <h1 className="h1">Ini yang aku tangkap.</h1>
        <p className="sub mt8 mb32">
          Kalau ada yang meleset, ketuk langsung.
        </p>
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
