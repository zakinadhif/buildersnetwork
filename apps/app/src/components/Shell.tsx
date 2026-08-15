import type { FeatureKey } from "@myapp/feature-flags";
import {
  Avatar,
  cn,
  MainColumn,
  type NavItem,
  RailColumn,
  ShellColumns,
  LeftNav as UiLeftNav,
} from "@myapp/ui";
import {
  Bell,
  LayoutGrid,
  type LucideIcon,
  Newspaper,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
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
  icon: LucideIcon;
  to: string;
  match?: (loc: string) => boolean;
  feature?: FeatureKey;
}

const SURFACES: Surface[] = [
  {
    label: "Scroll",
    icon: Newspaper,
    to: "/home",
    match: (l) => l === "/home" || l === "/",
  },
  {
    label: "Karya",
    icon: LayoutGrid,
    to: "/karya",
  },
  {
    label: "People",
    icon: Users,
    to: "/people",
  },
  {
    label: "Asisten AI",
    icon: Sparkles,
    to: "/assistant",
    match: (l) => l === "/assistant",
    feature: "aiAssistant",
  },
];

const MOBILE_SURFACES = SURFACES.filter((surface) => !surface.feature);

/**
 * At mobile widths the desktop rail becomes a native app frame: identity and
 * utility actions stay at the top, while the three live product destinations
 * stay within thumb reach at the bottom.
 */
function MobileChrome({
  me,
  location,
  navigate,
}: {
  me: Member;
  location: string;
  navigate: (to: string) => void;
}) {
  return (
    <>
      <header className="bn-mobile-header sticky top-0 z-40 hidden h-[64px] min-h-[64px] items-center justify-between border-b border-line bg-surface px-4 max-[900px]:flex">
        <button
          type="button"
          aria-label="Buka Profil Saya"
          onClick={() => navigate("/profil")}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-line bg-bg"
        >
          <Avatar name={me.name} size={34} />
        </button>

        <button
          type="button"
          aria-label="Ke Scroll"
          onClick={() => navigate("/home")}
          className="absolute left-1/2 flex size-10 -translate-x-1/2 cursor-pointer items-center justify-center rounded-[12px] bg-accent font-display text-title font-semibold text-accent-fg shadow-[0_1px_2px_oklch(0%_0_0_/_12%)]"
        >
          B
        </button>

        <button
          type="button"
          aria-label="Notifikasi belum tersedia"
          disabled
          className="flex size-10 cursor-default items-center justify-center rounded-[12px] border border-line bg-surface text-ink shadow-[0_1px_3px_oklch(0%_0_0_/_8%)]"
        >
          <Bell size={22} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </header>

      <button
        type="button"
        aria-label="Bikin karya"
        onClick={() => navigate("/karya/new")}
        className="bn-mobile-create fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 hidden size-14 cursor-pointer items-center justify-center rounded-[18px] border border-accent bg-accent text-accent-fg shadow-[0_8px_24px_oklch(0%_0_0_/_18%)] max-[900px]:flex"
      >
        <Plus size={31} strokeWidth={1.7} aria-hidden="true" />
      </button>

      <nav
        aria-label="Navigasi utama"
        className="bn-mobile-nav fixed inset-x-0 bottom-0 z-40 hidden h-[calc(4.5rem+env(safe-area-inset-bottom))] items-start border-t border-line bg-surface px-2 pt-2 shadow-[0_-4px_18px_oklch(0%_0_0_/_4%)] max-[900px]:flex"
      >
        {MOBILE_SURFACES.map((surface) => {
          const selected = surface.match
            ? surface.match(location)
            : location === surface.to;
          const Icon = surface.icon;

          return (
            <button
              key={surface.to}
              type="button"
              aria-current={selected ? "page" : undefined}
              onClick={() => navigate(surface.to)}
              className={cn(
                "relative flex min-h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-1 bg-transparent font-body text-caption transition-colors",
                selected ? "font-semibold text-ink" : "font-normal text-ink2",
              )}
            >
              {selected && (
                <span
                  className="absolute -top-2 h-0.5 w-10 rounded-full bg-accent"
                  aria-hidden="true"
                />
              )}
              <Icon
                size={23}
                strokeWidth={selected ? 2.2 : 1.7}
                aria-hidden="true"
              />
              <span>{surface.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

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
  ).map((surface) => {
    const Icon = surface.icon;
    return {
      label: surface.label,
      icon: <Icon size={18} strokeWidth={1.75} />,
      active: surface.match ? surface.match(location) : location === surface.to,
      onClick: () => navigate(surface.to),
    };
  });

  return (
    <div className="min-h-screen bg-bg-layer text-ink font-body selection:bg-accent-tint selection:text-accent">
      <MobileChrome me={me} location={location} navigate={navigate} />
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
