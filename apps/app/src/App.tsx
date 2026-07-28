import { getGetMeQueryKey, useGetMe } from "@myapp/api-client-react";
import type { ReactNode } from "react";
import { Redirect, Route, Router, Switch, useLocation } from "wouter";
import Shell from "@/components/Shell";
import { Loading } from "@/components/ui-atoms";
import { useSession } from "@/lib/auth-client";
import { KaryaDraftProvider } from "@/lib/karya-draft-ctx";
import type { Member } from "@/lib/members";
import { OnboardingProvider } from "@/lib/onboarding-ctx";
import Assistant from "@/pages/Assistant";
import ComingSoon from "@/pages/ComingSoon";
import Karya from "@/pages/Karya";
import KaryaAgent from "@/pages/KaryaAgent";
import KaryaNew from "@/pages/KaryaNew";
import Scroll, { ScrollRail } from "@/pages/Launchpad";
import Matches from "@/pages/Matches";
import MemberProfilePage from "@/pages/MemberProfile";
import MinatSaya from "@/pages/MinatSaya";
import MinimalStart from "@/pages/MinimalStart";
import Onboarding from "@/pages/Onboarding";
import Review from "@/pages/Review";
import VerifyEmail from "@/pages/VerifyEmail";
import Welcome from "@/pages/Welcome";

function AppRoutes() {
  const { data: session, isPending } = useSession();
  const [location] = useLocation();
  const { data: me, isLoading: meLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!session?.user && !!session?.user?.emailVerified,
    },
  });

  if (isPending || (!!session?.user?.emailVerified && meLoading)) {
    return <Loading />;
  }

  const loggedIn = !!session?.user;
  const emailVerified = !!session?.user?.emailVerified;
  const hasProfile = me != null;

  if (loggedIn && !emailVerified && location !== "/verify-email") {
    const email = encodeURIComponent(session?.user?.email ?? "");
    return <Redirect to={`/verify-email?email=${email}`} />;
  }

  // A logged-in route that lives *inside* the persistent shell. Gates on auth
  // (→ welcome) and profile (→ the minimal one-field start, not the AI chat).
  // `rail` optionally supplies the shell's right column (issue #20).
  const shell = (
    page: (m: Member) => ReactNode,
    rail?: (m: Member) => ReactNode,
  ) => {
    if (!loggedIn) return <Redirect to="/welcome" />;
    if (!me) return <Redirect to="/mulai" />;
    return (
      <Shell me={me} rail={rail?.(me)}>
        {page(me)}
      </Shell>
    );
  };

  return (
    <Switch>
      {/* ── Outside the shell: auth, entry, and the opt-in onboarding flow ── */}
      <Route path="/verify-email">
        <VerifyEmail />
      </Route>
      <Route path="/welcome">
        <Welcome />
      </Route>
      <Route path="/mulai">
        {!loggedIn ? (
          <Redirect to="/welcome" />
        ) : hasProfile ? (
          <Redirect to="/home" />
        ) : (
          <MinimalStart defaultName={session?.user?.name ?? ""} />
        )}
      </Route>
      <Route path="/onboarding">
        {!loggedIn ? <Redirect to="/welcome" /> : <Onboarding />}
      </Route>
      <Route path="/review">
        {!loggedIn ? <Redirect to="/welcome" /> : <Review />}
      </Route>
      <Route path="/matches">
        {!loggedIn ? <Redirect to="/welcome" /> : <Matches />}
      </Route>

      {/* ── Inside the shell: the Launchpad rail destinations ── */}
      <Route path="/home">
        {shell(
          (m) => (
            <Scroll user={m} />
          ),
          (m) => (
            <ScrollRail user={m} />
          ),
        )}
      </Route>
      <Route path="/karya">
        {shell(() => (
          <ComingSoon
            title="Karya"
            sub="Katalog karya sedang dipindahkan ke shell baru. Untuk sekarang, buka karya dari kabar di Scroll atau mulai karya baru."
          />
        ))}
      </Route>
      <Route path="/people">
        {shell(() => (
          <ComingSoon
            title="People"
            sub="Direktori builder sedang disiapkan. Profil builder yang muncul di Scroll tetap dapat dibuka."
          />
        ))}
      </Route>
      <Route path="/minat">
        {shell((m) => (
          <MinatSaya user={m} />
        ))}
      </Route>
      <Route path="/assistant">
        {shell((m) => (
          <Assistant user={m} />
        ))}
      </Route>
      <Route path="/jelajahi">
        {shell(() => (
          <ComingSoon
            title="Jelajahi Karya"
            sub="Pencarian & penjelajahan karya lengkap lagi disiapin — sementara, Launchpad nunjukin apa yang lagi jalan di komunitas."
          />
        ))}
      </Route>
      <Route path="/karya-saya">
        {shell(() => (
          <ComingSoon
            title="Karya Saya"
            sub="Ringkasan karya yang kamu garap lagi disiapin. Kamu tetap bisa bikin karya baru lewat tombol di halaman karya."
          />
        ))}
      </Route>

      {/* ── Detail / creation flows: focused full-screen, reachable from the
           shell (their fixed-layout pages aren't shell-hosted yet) ── */}
      <Route path="/member/:id">
        {(params) =>
          !loggedIn ? (
            <Redirect to="/welcome" />
          ) : (
            <MemberProfilePage id={params.id ?? ""} />
          )
        }
      </Route>
      <Route path="/karya/new/ai">
        {!loggedIn ? (
          <Redirect to="/welcome" />
        ) : !hasProfile ? (
          <Redirect to="/mulai" />
        ) : (
          <KaryaAgent />
        )}
      </Route>
      <Route path="/karya/new">
        {!loggedIn ? (
          <Redirect to="/welcome" />
        ) : !hasProfile ? (
          <Redirect to="/mulai" />
        ) : (
          <KaryaNew />
        )}
      </Route>
      <Route path="/karya/:id">
        {(params) =>
          !loggedIn ? (
            <Redirect to="/welcome" />
          ) : !hasProfile ? (
            <Redirect to="/mulai" />
          ) : (
            <Karya id={params.id ?? ""} />
          )
        }
      </Route>

      <Route path="/">
        {!loggedIn ? (
          <Redirect to="/welcome" />
        ) : !hasProfile ? (
          <Redirect to="/mulai" />
        ) : (
          <Redirect to="/home" />
        )}
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <OnboardingProvider>
      <KaryaDraftProvider>
        <Router base={import.meta.env.PROD ? "/app" : ""}>
          <AppRoutes />
        </Router>
      </KaryaDraftProvider>
    </OnboardingProvider>
  );
}
