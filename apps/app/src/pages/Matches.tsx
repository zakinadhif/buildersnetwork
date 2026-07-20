import {
  getGetMatchesQueryKey,
  useGetMatches,
  useGetMe,
} from "@myapp/api-client-react";
import { useLocation } from "wouter";
import { Loading } from "@/components/ui-atoms";
import { firstName, type MemberMatch } from "@/lib/members";
import { useOnboarding } from "@/lib/onboarding-ctx";
import { Button } from "@myapp/ui";

export default function Matches() {
  const { matches: contextMatches } = useOnboarding();
  const [, navigate] = useLocation();

  const { data: me } = useGetMe();

  const { data: savedMatches = [], isLoading } = useGetMatches({
    query: {
      queryKey: getGetMatchesQueryKey(),
      enabled: contextMatches.length === 0,
    },
  });

  const matches: MemberMatch[] =
    contextMatches.length > 0 ? contextMatches : savedMatches;

  if (isLoading && contextMatches.length === 0) return <Loading />;

  const user = me;

  return (
    <div className="fixed inset-0 animate-up overflow-y-auto">
      <div className="max-w-[var(--container-page)] mx-auto px-7 pt-[52px] pb-[80px]">
        <p className="eyebrow mb-2">Al-Fath Berkarya</p>
        {user && (
          <p className="text-body text-ink2 leading-body">
            Dipublish. Selamat datang, {firstName(user.name)}.
          </p>
        )}
        <h1 className="text-feature font-light tracking-heading leading-heading mt-2 mb-10">
          Tiga orang yang kayaknya perlu kamu kenal.
        </h1>

        <div>
          {matches.length === 0 && (
            <p className="text-body text-ink2 leading-body">
              Belum ada yang cocok sekarang — explore komunitas di bawah.
            </p>
          )}
          {matches.map((m, i) => (
            <div key={m.id ?? i} className="py-6 border-b border-line first:border-t">
              <p className="text-title font-medium mb-0.5">{m.name}</p>
              <p className="text-body text-ink2 mb-3">
                {m.year} · {m.major}
              </p>
              <p className="font-mono text-ui text-ink2 leading-body mb-3.5">"{m.reason}"</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-[13px] px-3.5 py-[7px]"
                onClick={() => navigate(`/member/${m.id}`)}
              >
                Lihat profil →
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate("/home")}
          >
            Ke komunitas →
          </Button>
        </div>
      </div>
    </div>
  );
}
