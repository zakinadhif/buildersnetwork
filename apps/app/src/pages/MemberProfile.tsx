import { useGetMember } from "@myapp/api-client-react";
import { Loading } from "@/components/ui-atoms";

export default function MemberProfilePage({ id }: { id: string }) {
  const { data: member, isLoading } = useGetMember(id);

  if (isLoading) return <Loading />;
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
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--ink2)",
            fontSize: 13,
            padding: 0,
            marginBottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← balik
        </button>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 300,
            letterSpacing: "-0.025em",
            marginBottom: 4,
          }}
        >
          {member.name}
        </h1>
        <p className="sub" style={{ marginBottom: 40 }}>
          {member.year} · {member.major}
        </p>

        <hr className="hr" style={{ margin: "0 0 28px" }} />

        {member.bio && (
          <div className="pf">
            <p className="label">Bio</p>
            <p style={{ fontSize: 15, lineHeight: 1.65 }}>{member.bio}</p>
          </div>
        )}
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
          <p className="label">Minat</p>
          <div className="skills-wrap">
            {(member.interests ?? []).map((s) => (
              <span key={s} className="chip" style={{ cursor: "default" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
