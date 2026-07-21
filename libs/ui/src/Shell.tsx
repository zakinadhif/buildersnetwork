import { eyebrow } from "@myapp/design-tokens";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Avatar } from "./Avatar";
import { cn } from "./lib/cn";

/**
 * The frame the three columns sit in (#92) — the measure, the gutters, and the
 * rules that divide them. This is the thing that actually drifted: the same
 * `max-width` meant the CONTENT the columns divide up in the gallery but the
 * shell's OUTER box in the app, so the app's gutters ate into the columns and
 * the centre column silently came out 48px short (#91). Now there is one of it.
 *
 * Children are the columns themselves (`.bn-nav`, `.bn-main`, `.bn-rail`), which
 * each app composes: the gallery's screens carry their own rail content, the app
 * passes one in per route. And the OUTER wrapper stays with each app too — the
 * gallery is a document that scrolls, the app is a fixed pane that scrolls inside
 * itself and animates in. Those differences are real; a prop that exists only to
 * paper over one is how a shared component starts to rot.
 */
export function ShellColumns({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-shell-outer items-start">{children}</div>
  );
}

export function MainColumn({
  className,
  ...props
}: ComponentPropsWithoutRef<"main">) {
  return (
    <main
      className={cn(
        "min-w-0 flex-1 px-[var(--shell-gutter)] pb-12 pt-6 max-[900px]:w-full max-[900px]:p-0",
        className,
      )}
      {...props}
    />
  );
}

export function RailColumn({
  className,
  ...props
}: ComponentPropsWithoutRef<"aside">) {
  return (
    <aside
      className={cn(
        "sticky top-0 h-screen w-[calc(var(--shell-rail)+2*var(--shell-gutter)+1px)] shrink-0 overflow-y-auto border-l border-line px-[var(--shell-gutter)] py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[900px]:static max-[900px]:h-auto max-[900px]:w-full max-[900px]:overflow-visible max-[900px]:border-l-0 max-[900px]:border-r-0 max-[900px]:p-0",
        className,
      )}
      {...props}
    />
  );
}

export interface NavItem {
  label: string;
  /** A glyph string or an icon element (e.g. a lucide-react component). */
  icon: ReactNode;
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
    <aside className="sticky top-0 flex h-screen w-[calc(var(--shell-nav)+2*var(--shell-gutter)+1px)] shrink-0 flex-col border-r border-line px-[var(--shell-gutter)] pb-6 pt-8 max-[900px]:static max-[900px]:h-auto max-[900px]:w-full max-[900px]:overflow-visible max-[900px]:border-r-0 max-[900px]:p-0">
      <div className="mb-4 border-b border-line px-3 pb-5">
        <div className="eyebrow mb-1" style={eyebrow}>
          Al-Fath
        </div>
        <div className="font-display text-feature font-regular leading-none text-ink">
          Berkarya
        </div>
      </div>

      <nav className="mb-6 flex flex-col" aria-label="Navigasi utama">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className="mb-px flex w-full cursor-pointer items-center gap-2.5 rounded-card bg-transparent px-3 py-[7px] text-left font-body text-body leading-compact text-ink2 transition-colors duration-[120ms] hover:text-ink disabled:cursor-default disabled:text-ink3 disabled:hover:text-ink3 aria-[current=page]:bg-accent-tint aria-[current=page]:font-medium aria-[current=page]:text-accent aria-[current=page]:hover:text-accent"
            disabled={item.disabled}
            aria-current={item.active ? "page" : undefined}
            onClick={item.disabled ? undefined : item.onClick}
          >
            <span
              className="inline-flex shrink-0 items-center justify-center font-body text-ui"
              aria-hidden="true"
            >
              {item.icon}
            </span>
            {item.label}
            {item.badge && (
              <span className="ml-auto text-micro tracking-tag text-ink3">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {filters && (
        <div className="min-h-0 overflow-y-auto px-3 max-[900px]:overflow-visible">
          {filters}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-line px-3 pt-4">
        <Avatar name={user.name} size={28} />
        <div className="min-w-0">
          <div className="font-body text-ui font-medium text-ink">
            {user.name}
          </div>
          {user.handle && (
            <div className="font-body text-micro text-ink3">@{user.handle}</div>
          )}
        </div>
      </div>
    </aside>
  );
}
