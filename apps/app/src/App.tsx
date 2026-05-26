import { useState } from "react";
import { type Member, SEED_MEMBERS } from "@/lib/members";
import CommunityHome from "@/pages/CommunityHome";
import Matches from "@/pages/Matches";
import MemberProfile from "@/pages/MemberProfile";
import Onboarding from "@/pages/Onboarding";
import Review from "@/pages/Review";
import Welcome from "@/pages/Welcome";

type Screen = "welcome" | "onboarding" | "review" | "matches" | "home" | "profile";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [user, setUser] = useState<Member | null>(null);
  const [matches, setMatches] = useState<Member[]>([]);
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [viewing, setViewing] = useState<Member | null>(null);
  const [prevScreen, setPrev] = useState<Screen>("home");

  const viewMember = (m: Member) => {
    setPrev(screen);
    setViewing(m);
    setScreen("profile");
  };

  const back = () => {
    setScreen(prevScreen);
    setViewing(null);
  };

  const onOnboardDone = (profile: Member) => {
    setUser(profile);
    setScreen("review");
  };

  const onPublish = (profile: Member, matched: Member[]) => {
    setUser(profile);
    setMatches(matched);
    setMembers([...SEED_MEMBERS, { ...profile, id: "user" }]);
    setScreen("matches");
  };

  return (
    <>
      {screen === "welcome" && <Welcome onStart={() => setScreen("onboarding")} />}
      {screen === "onboarding" && <Onboarding onDone={onOnboardDone} />}
      {screen === "review" && user && (
        <Review draft={user} onPublish={onPublish} />
      )}
      {screen === "matches" && user && (
        <Matches
          matches={matches}
          user={user}
          onContinue={() => setScreen("home")}
          onView={viewMember}
        />
      )}
      {screen === "home" && user && (
        <CommunityHome user={user} members={members} onView={viewMember} />
      )}
      {screen === "profile" && viewing && (
        <MemberProfile member={viewing} onBack={back} />
      )}
    </>
  );
}
