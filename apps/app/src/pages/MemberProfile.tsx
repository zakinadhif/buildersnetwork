import { type Member } from "@/lib/members";

export default function MemberProfile({
  member,
  onBack,
}: {
  member: Member;
  onBack: () => void;
}) {
  return (
    <div className="screen" style={{ overflowY: "auto" }}>
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <button
          onClick={onBack}
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

        <div className="pf">
          <p className="label">Skills</p>
          <div className="skills-wrap">
            {(member.skills ?? []).map((s, i) => (
              <span key={i} className="chip" style={{ cursor: "default" }}>
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
