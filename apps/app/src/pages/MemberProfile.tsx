import { useGetMember } from "@myapp/api-client-react";
import { Loading } from "@/components/ui-atoms";

export default function MemberProfilePage({ id }: { id: string }) {
  const { data: member, isLoading } = useGetMember(id);

  if (isLoading) return <Loading label="lagi membuka profil" />;
  if (!member) {
    return (
      <div className="screen" style={{ display: "flex", alignItems: "center" }}>
        <div className="wrap">
          <p className="sub">anggota tidak ditemukan.</p>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: 24 }}
            onClick={() => window.history.back()}
          >
            ← balik
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ overflowY: "auto" }}>
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="back-link"
        >
          ← balik
        </button>

        <h1 className="profile-title">{member.name}</h1>
        <p className="sub" style={{ marginBottom: 40 }}>
          {member.year} · {member.major}
        </p>

        <hr className="hr" style={{ margin: "0 0 28px" }} />

        <div className="pf">
          <p className="label">Skills</p>
          <div className="skills-wrap">
            {(member.skills ?? []).map((s) => (
              <span key={s} className="chip" style={{ cursor: "default" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="pf">
          <p className="label">Lagi bikin</p>
          <p style={{ fontSize: 15, lineHeight: 1.65 }}>{member.building}</p>
        </div>
        <div className="pf">
          <p className="label">Pengen</p>
          <p style={{ fontSize: 15, lineHeight: 1.65 }}>{member.wants}</p>
        </div>
        <div className="pf">
          <p className="label">Vibe</p>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: 13,
              lineHeight: 1.75,
              color: "var(--ink2)",
            }}
          >
            {member.vibe}
          </p>
        </div>
      </div>
    </div>
  );
}
