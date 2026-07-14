import { eyebrow } from "@myapp/design-tokens";
import type { ReactNode } from "react";
import { Avatar } from "./Avatar";

/**
 * The frame the three columns sit in (#92) — the measure, the gutters and the
 * gap. This is the thing that actually drifted: the same `max-width` meant 1100px
 * of content in the gallery and 1052px in the app, and the centre column silently
 * came out 48px short (#91). Now there is one of it.
 *
 * Children are the columns themselves (`.bn-nav`, `.bn-main`, `.bn-rail`), which
 * each app composes: the gallery's screens carry their own rail content, the app
 * passes one in per route. And the OUTER wrapper stays with each app too — the
 * gallery is a document that scrolls, the app is a fixed pane that scrolls inside
 * itself and animates in. Those differences are real; a prop that exists only to
 * paper over one is how a shared component starts to rot.
 */
export function ShellColumns({ children }: { children: ReactNode }) {
  return <div className="bn-shell-inner">{children}</div>;
}

export interface NavItem {
  label: string;
  icon: string;
  /** Marked with `aria-current="page"`. */
  active?: boolean;
  /** No destination yet — rendered, but not clickable. */
  disabled?: boolean;
  /** An honest signpost on a surface that isn't built: "segera", "nanti". */
  badge?: string;
  onClick?: () => void;
}

/**
 * The left rail, identical on every surface of both apps (#92). It takes its
 * items rather than owning them, because *what* the items are is genuinely each
 * app's business — the gallery switches screens, the app routes — while how they
 * look is not.
 *
 * `filters` fills the optional slot between the items and the user stub (the
 * gallery's Launchpad puts interest filters there; the app leaves it empty).
 */
export function LeftNav({
  items,
  user,
  filters,
}: {
  items: NavItem[];
  user: { name: string; handle?: string | null };
  filters?: ReactNode;
}) {
  return (
    <aside className="bn-nav">
      <div className="bn-nav-logo">
        <div className="eyebrow" style={eyebrow}>
          Al-Fath
        </div>
        <div className="bn-nav-wordmark">Berkarya</div>
      </div>

      <nav className="bn-nav-items" aria-label="Navigasi utama">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className="bn-nav-item"
            disabled={item.disabled}
            aria-current={item.active ? "page" : undefined}
            onClick={item.disabled ? undefined : item.onClick}
          >
            <span className="bn-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
            {item.badge && <span className="bn-nav-soon">{item.badge}</span>}
          </button>
        ))}
      </nav>

      {filters && <div className="bn-nav-filters">{filters}</div>}

      <div className="bn-nav-user">
        <Avatar name={user.name} size={28} />
        <div style={{ minWidth: 0 }}>
          <div className="bn-nav-user-name">{user.name}</div>
          {user.handle && (
            <div className="bn-nav-user-handle">@{user.handle}</div>
          )}
        </div>
      </div>
    </aside>
  );
}
