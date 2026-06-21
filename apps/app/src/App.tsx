import { getGetMeQueryKey, useGetMe } from "@myapp/api-client-react";
import { Redirect, Route, Router, Switch, useLocation } from "wouter";
import { Loading } from "@/components/ui-atoms";
import { useSession } from "@/lib/auth-client";
import { KaryaDraftProvider } from "@/lib/karya-draft-ctx";
import { OnboardingProvider } from "@/lib/onboarding-ctx";
import CommunityHome from "@/pages/CommunityHome";
import Karya from "@/pages/Karya";
import KaryaAgent from "@/pages/KaryaAgent";
import KaryaNew from "@/pages/KaryaNew";
import Login from "@/pages/Login";
import Matches from "@/pages/Matches";
import MemberProfilePage from "@/pages/MemberProfile";
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

  return (
    <Switch>
      <Route path="/verify-email">
        <VerifyEmail />
      </Route>
      <Route path="/welcome">
        <Welcome />
      </Route>
      <Route path="/login">
        <Login />
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
      <Route path="/home">
        {!loggedIn ? (
          <Redirect to="/welcome" />
        ) : !me ? (
          <Redirect to="/onboarding" />
        ) : (
          <CommunityHome user={me} />
        )}
      </Route>
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
          <Redirect to="/onboarding" />
        ) : (
          <KaryaAgent />
        )}
      </Route>
      <Route path="/karya/new">
        {!loggedIn ? (
          <Redirect to="/welcome" />
        ) : !hasProfile ? (
          <Redirect to="/onboarding" />
        ) : (
          <KaryaNew />
        )}
      </Route>
      <Route path="/karya/:id">
        {(params) =>
          !loggedIn ? (
            <Redirect to="/welcome" />
          ) : !hasProfile ? (
            <Redirect to="/onboarding" />
          ) : (
            <Karya id={params.id ?? ""} />
          )
        }
      </Route>
      <Route path="/">
        {!loggedIn ? (
          <Redirect to="/welcome" />
        ) : !hasProfile ? (
          <Redirect to="/onboarding" />
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
