import { type NavItem, ShellColumns, LeftNav as UiLeftNav } from "@myapp/ui";
import { useLocation } from "wouter";
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
 * The rail is route-aware — the active item follows `wouter`'s location and is
 * marked with `aria-current="page"`. "Cari Kolaborator" ships disabled until the
 * Matchmaking milestone; "Jelajahi Karya" / "Karya Saya" route to honestly
 * signposted "segera hadir" placeholders (no backing endpoint yet).
 */
interface Surface {
  label: string;
  icon: string;
  to?: string; // undefined → disabled placeholder in the rail
  match?: (loc: string) => boolean;
  soon?: boolean; // "segera hadir" — reachable, but a placeholder surface
}

const SURFACES: Surface[] = [
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

export default function Shell({
  me,
  rail,
  children,
}: {
  me: Member;
  rail?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [location, navigate] = useLocation();

  const items: NavItem[] = SURFACES.map((s) => ({
    label: s.label,
    icon: s.icon,
    active: s.to ? (s.match ? s.match(location) : location === s.to) : false,
    disabled: !s.to,
    badge: s.soon ? "segera" : !s.to ? "nanti" : undefined,
    onClick: s.to ? () => navigate(s.to as string) : undefined,
  }));

  return (
    <div className="bn-shell">
      <ShellColumns>
        <UiLeftNav items={items} user={{ name: me.name, handle: me.handle }} />
        <main className="bn-main">{children}</main>
        {rail && <aside className="bn-rail">{rail}</aside>}
      </ShellColumns>
    </div>
  );
}
