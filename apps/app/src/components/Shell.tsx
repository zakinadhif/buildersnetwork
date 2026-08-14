import type { FeatureKey } from "@myapp/feature-flags";
import {
  MainColumn,
  type NavItem,
  RailColumn,
  ShellColumns,
  LeftNav as UiLeftNav,
} from "@myapp/ui";
import { LayoutGrid, Newspaper, Sparkles, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useFeatureFlags } from "@/lib/feature-flags";
import type { Member } from "@/lib/members";

/**
 * The persistent Launchpad app shell (issue #8): a left-sidebar rail + a content
 * slot, and an optional right rail (issue #20) a page can fill. Every logged-in
 * route renders *inside* this shell; auth/welcome stay outside it (see
 * App.tsx).
 *
 * The rail and the column frame come from @myapp/ui (#92) — the very same ones
 * the mockup gallery renders, so there is no longer an app copy of them to drift.
 * What stays here is the only part that is genuinely the app's: *which* surfaces
 * exist and what clicking one does.
 *
 * The route-aware rail keeps the primary product surfaces together. Older
 * routes remain reachable where existing flows still use them, but no longer
 * compete for primary navigation.
 */
interface Surface {
  label: string;
  icon: React.ReactNode;
  to: string;
  match?: (loc: string) => boolean;
  feature?: FeatureKey;
}

const SURFACES: Surface[] = [
  {
    label: "Scroll",
    icon: <Newspaper size={18} strokeWidth={1.75} />,
    to: "/home",
    match: (l) => l === "/home" || l === "/",
  },
  {
    label: "Karya",
    icon: <LayoutGrid size={18} strokeWidth={1.75} />,
    to: "/karya",
  },
  {
    label: "People",
    icon: <Users size={18} strokeWidth={1.75} />,
    to: "/people",
  },
  {
    label: "Asisten AI",
    icon: <Sparkles size={18} strokeWidth={1.75} />,
    to: "/assistant",
    match: (l) => l === "/assistant",
    feature: "aiAssistant",
  },
];

export default function Shell({
  me,
  rail,
  mainClassName,
  children,
}: {
  me: Member;
  rail?: React.ReactNode;
  mainClassName?: string;
  children: React.ReactNode;
}) {
  const [location, navigate] = useLocation();
  const { enabled } = useFeatureFlags();

  const items: NavItem[] = SURFACES.filter(
    (surface) => !surface.feature || enabled(surface.feature),
  ).map((surface) => ({
    label: surface.label,
    icon: surface.icon,
    active: surface.match ? surface.match(location) : location === surface.to,
    onClick: () => navigate(surface.to),
  }));

  return (
    <div className="min-h-screen bg-bg-layer flex justify-center text-ink font-body selection:bg-accent-tint selection:text-accent">
      <ShellColumns>
        <UiLeftNav
          items={items}
          user={{ name: me.name, handle: me.handle }}
          onUserClick={() => navigate("/profil")}
        />
        <MainColumn className={`flex flex-col ${mainClassName ?? ""}`}>
          {children}
        </MainColumn>
        {rail && (
          <RailColumn className="flex flex-col gap-6">{rail}</RailColumn>
        )}
      </ShellColumns>
    </div>
  );
}
