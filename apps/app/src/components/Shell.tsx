import { useLocation } from "wouter";
import { Avatar } from "@/components/ui-atoms";
import type { Member } from "@/lib/members";

/**
 * The persistent Launchpad app shell (issue #8): a left-sidebar rail + a content
 * slot, and an optional right rail (issue #20) a page can fill. Every logged-in
 * route renders *inside* this shell; auth/welcome/login stay outside it (see
 * App.tsx). Ported from the mockup gallery's `bn-nav` rail
 * (`apps/mockups/src/components/LeftNav.tsx`).
 *
 * The rail is route-aware — the active item follows `wouter`'s location and is
 * marked with `aria-current="page"`. "Cari Kolaborator" ships disabled until the
 * Matchmaking milestone; "Jelajahi Karya" / "Karya Saya" route to honestly
 * signposted "segera hadir" placeholders (no backing endpoint yet).
 */

interface NavItem {
  label: string;
  icon: string;
  to?: string; // undefined → disabled placeholder in the rail
  match?: (loc: string) => boolean;
  soon?: boolean; // "segera hadir" — reachable, but a placeholder surface
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Launchpad",
    icon: "◈",
    to: "/home",
    match: (l) => l === "/home" || l === "/",
  },
  { label: "Jelajahi Karya", icon: "◉", to: "/jelajahi", soon: true },
  { label: "Cari Kolaborator", icon: "◎" }, // Matchmaking milestone
  { label: "Minat Saya", icon: "◇", to: "/minat" },
  { label: "Karya Saya", icon: "◆", to: "/karya-saya", soon: true },
  { label: "Asisten AI", icon: "✦", to: "/assistant" },
];

function LeftNav({ me }: { me: Member }) {
  const [location, navigate] = useLocation();

  return (
    <aside className="bn-nav">
      <div className="bn-nav-logo">
        <div className="eyebrow">Al-Fath</div>
        <div className="bn-nav-wordmark">Berkarya</div>
      </div>

      <nav className="bn-nav-items" aria-label="Navigasi utama">
        {NAV_ITEMS.map((item) => {
          const active = item.to
            ? item.match
              ? item.match(location)
              : location === item.to
            : false;
          return (
            <button
              key={item.label}
              type="button"
              className="bn-nav-item"
              disabled={!item.to}
              aria-current={active ? "page" : undefined}
              onClick={item.to ? () => navigate(item.to as string) : undefined}
            >
              <span className="bn-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
              {(item.soon || !item.to) && (
                <span className="bn-nav-soon">
                  {item.to ? "segera" : "nanti"}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="bn-nav-user">
        <Avatar name={me.name} handle={me.handle} size={28} />
        <div style={{ minWidth: 0 }}>
          <div className="bn-nav-user-name">{me.name}</div>
          {me.handle && <div className="bn-nav-user-handle">@{me.handle}</div>}
        </div>
      </div>
    </aside>
  );
}

/**
 * Persistent shell wrapping the in-app (logged-in) routes. `rail` is an optional
 * third column a page supplies (the Launchpad fills it, issue #20); when absent
 * the main column simply widens — no empty rail on other pages.
 */
export default function Shell({
  me,
  rail,
  children,
}: {
  me: Member;
  rail?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bn-shell">
      <div className="bn-shell-inner">
        <LeftNav me={me} />
        <main className="bn-main">{children}</main>
        {rail && <aside className="bn-rail">{rail}</aside>}
      </div>
    </div>
  );
}
