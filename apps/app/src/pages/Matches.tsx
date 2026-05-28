import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loading } from "@/components/ui-atoms";
import { fetchMatches, fetchMe } from "@/lib/api";
import { type Member, firstName } from "@/lib/members";
import { useOnboarding } from "@/lib/onboarding-ctx";

export default function Matches() {
  const { matches: contextMatches } = useOnboarding();
  const [, navigate] = useLocation();

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const { data: savedMatches = [], isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    enabled: contextMatches.length === 0,
  });

  const matches: Member[] =
    contextMatches.length > 0 ? contextMatches : savedMatches;

  if (isLoading && contextMatches.length === 0) return <Loading />;

  const user = me;

  return (
    <div className="screen" style={{ overflowY: "auto" }}>
      <div className="wrap" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <p className="eyebrow mb8">Al-Fath Berkarya</p>
        {user && (
          <p className="sub">Dipublish. Selamat datang, {firstName(user.name)}.</p>
        )}
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
                onClick={() => navigate(`/member/${m.id}`)}
              >
                Lihat profil →
              </button>
            </div>
          ))}
        </div>

        <div className="row-end mt40">
          <button className="btn btn-dark" onClick={() => navigate("/home")}>
            Ke komunitas →
          </button>
        </div>
      </div>
    </div>
  );
}
