import { type Member, firstName } from "@/lib/members";

export default function Matches({
  matches,
  user,
  onContinue,
  onView,
}: {
  matches: Member[];
  user: Member;
  onContinue: () => void;
  onView: (m: Member) => void;
}) {
  return (
    <div className="screen" style={{ overflowY: "auto" }}>
      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <p className="eyebrow mb8">Al-Fath Berkarya</p>
        <p className="sub">Dipublish. Selamat datang, {firstName(user.name)}.</p>
        <h1 className="h1 mt8" style={{ marginBottom: 40 }}>
          Tiga orang yang kayaknya perlu kamu kenal.
        </h1>

        <div>
          {matches.length === 0 && (
            <p className="sub">
              Belum ada yang cocok sekarang — explore komunitas di bawah.
            </p>
          )}
          {matches.map((m, i) => (
            <div key={m.id ?? i} className="match">
              <p className="match-name">{m.name}</p>
              <p className="match-meta">
                {m.year} · {m.major}
              </p>
              <p className="match-reason">"{m.reason}"</p>
              <button
                className="btn btn-outline"
                style={{ fontSize: 13, padding: "7px 14px" }}
                onClick={() => onView(m)}
              >
                Lihat profil →
              </button>
            </div>
          ))}
        </div>

        <div className="row-end mt40">
          <button className="btn btn-dark" onClick={onContinue}>
            Ke komunitas →
          </button>
        </div>
      </div>
    </div>
  );
}
