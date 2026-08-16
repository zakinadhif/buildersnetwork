import {
  getGetMeQueryKey,
  useGetMe,
  useListKarya,
} from "@myapp/api-client-react";
import { type ReactNode, useMemo, useState } from "react";
import { Redirect, Route, Router, Switch, useLocation } from "wouter";
import Shell from "@/components/Shell";
import { Loading } from "@/components/ui-atoms";
import { useSession } from "@/lib/auth-client";
import { useFeatureFlags } from "@/lib/feature-flags-context";
import { KaryaDraftProvider } from "@/lib/karya-draft-provider";
import type { Member } from "@/lib/members";
import { OnboardingProvider } from "@/lib/onboarding-provider";
import Assistant from "@/pages/Assistant";
import ComingSoon from "@/pages/ComingSoon";
import Karya from "@/pages/Karya";
import KaryaAgent from "@/pages/KaryaAgent";
import KaryaCatalog, { KaryaCatalogRail } from "@/pages/KaryaCatalog";
import KaryaNew, { KaryaNewRail } from "@/pages/KaryaNew";
import KaryaPost from "@/pages/KaryaPost";
import Scroll, { ScrollRail } from "@/pages/Launchpad";
import Login from "@/pages/Login";
import MemberProfilePage from "@/pages/MemberProfile";
import MinatSaya from "@/pages/MinatSaya";
import MinimalStart from "@/pages/MinimalStart";
import Onboarding from "@/pages/Onboarding";
import OwnProfile from "@/pages/OwnProfile";
import People from "@/pages/People";
import Review from "@/pages/Review";
import Signup from "@/pages/Signup";
import VerifyEmail from "@/pages/VerifyEmail";

function KaryaCatalogRoute({ me }: { me: Member }) {
  const [query, setQuery] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("Semua");
  const { data: karya = [] } = useListKarya();
  const interests = useMemo(
    () =>
      Array.from(new Set(karya.flatMap((item) => item.interests))).sort(
        (a, b) => a.localeCompare(b, "id"),
      ),
    [karya],
  );

  return (
    <Shell
      me={me}
      rail={
        <KaryaCatalogRail
          query={query}
          onQueryChange={setQuery}
          interests={interests}
          selectedInterest={selectedInterest}
          onInterestChange={setSelectedInterest}
        />
      }
    >
      <KaryaCatalog query={query} selectedInterest={selectedInterest} />
    </Shell>
  );
}

function AppRoutes() {
  const { data: session, isPending } = useSession();
  const { enabled, isLoading: featuresLoading } = useFeatureFlags();
  const [location] = useLocation();
  const { data: me, isLoading: meLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!session?.user && !!session?.user?.emailVerified,
    },
  });
  const isPublicAuthRoute = location === "/login" || location === "/signup";

  if (
    (isPending && !isPublicAuthRoute) ||
    featuresLoading ||
    (!!session?.user?.emailVerified && meLoading)
  ) {
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
  // (→ login) and profile (→ the minimal one-field start, not the AI chat).
  // `rail` optionally supplies the shell's right column (issue #20).
  const withProfile = (page: (m: Member) => ReactNode) => {
    if (!loggedIn) return <Redirect to="/login" />;
    if (!me) return <Redirect to="/mulai" />;
    return page(me);
  };

  const shell = (
    page: (m: Member) => ReactNode,
    rail?: (m: Member) => ReactNode,
  ) =>
    withProfile((member) => (
      <Shell me={member} rail={rail?.(member)}>
        {page(member)}
      </Shell>
    ));

  return (
    <Switch>
      {/* ── Outside the shell: auth, entry, and the opt-in onboarding flow ── */}
      <Route path="/verify-email">
        <VerifyEmail />
      </Route>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/signup">
        <Signup />
      </Route>
      <Route path="/welcome">
        <Redirect to="/signup" />
      </Route>
      <Route path="/mulai">
        {!loggedIn ? (
          <Redirect to="/login" />
        ) : hasProfile ? (
          <Redirect to="/home" />
        ) : (
          <MinimalStart defaultName={session?.user?.name ?? ""} />
        )}
      </Route>
      <Route path="/onboarding">
        {!loggedIn ? <Redirect to="/login" /> : <Onboarding />}
      </Route>
      <Route path="/review">
        {!loggedIn ? <Redirect to="/login" /> : <Review />}
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
        {!loggedIn ? (
          <Redirect to="/login" />
        ) : !me ? (
          <Redirect to="/mulai" />
        ) : (
          <KaryaCatalogRoute me={me} />
        )}
      </Route>
      <Route path="/people">
        {withProfile((member) => (
          <People user={member} />
        ))}
      </Route>
      <Route path="/profil">
        {shell((member) => (
          <OwnProfile me={member} />
        ))}
      </Route>
      <Route path="/minat">
        {shell((m) => (
          <MinatSaya user={m} />
        ))}
      </Route>
      <Route path="/assistant">
        {enabled("aiAssistant") ? (
          withProfile((m) => <Assistant user={m} />)
        ) : (
          <Redirect to="/home" />
        )}
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

      {/* ── Detail and AI flows remain focused full-screen. The approved manual
           creation surface below stays inside the persistent shell. ── */}
      <Route path="/member/:id">
        {(params) =>
          !loggedIn ? (
            <Redirect to="/login" />
          ) : !me ? (
            <Redirect to="/mulai" />
          ) : (
            <MemberProfilePage id={params.id ?? ""} me={me} />
          )
        }
      </Route>
      <Route path="/karya/new/ai">
        {!loggedIn ? (
          <Redirect to="/login" />
        ) : !hasProfile ? (
          <Redirect to="/mulai" />
        ) : (
          <KaryaAgent />
        )}
      </Route>
      <Route path="/karya/new">
        {shell(
          () => (
            <KaryaNew />
          ),
          () => (
            <KaryaNewRail />
          ),
        )}
      </Route>
      <Route path="/karya/:karyaId/posts/:postId">
        {(params) =>
          !loggedIn ? (
            <Redirect to="/login" />
          ) : !hasProfile ? (
            <Redirect to="/mulai" />
          ) : (
            <KaryaPost
              karyaId={params.karyaId ?? ""}
              postId={params.postId ?? ""}
              me={me}
            />
          )
        }
      </Route>
      <Route path="/karya/:id">
        {(params) =>
          !loggedIn ? (
            <Redirect to="/login" />
          ) : !hasProfile ? (
            <Redirect to="/mulai" />
          ) : (
            <Karya id={params.id ?? ""} me={me} />
          )
        }
      </Route>

      <Route path="/">
        {!loggedIn ? (
          <Redirect to="/login" />
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
