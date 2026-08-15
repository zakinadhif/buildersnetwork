import type { ReactNode } from "react";
import type { Screen } from "../gallery";
import { Bell, LayoutGrid, Newspaper, Plus, Users } from "lucide-react";
import { Avatar, cn, ShellColumns } from "@myapp/ui";
import { GlobalStyles } from "./GlobalStyles";
import { LeftNav } from "./LeftNav";
import { useNavigate } from "../gallery";

const MOBILE_NAV = [
  { label: "Scroll", screen: "scroll", icon: Newspaper },
  { label: "Karya", screen: "karya", icon: LayoutGrid },
  { label: "People", screen: "people", icon: Users },
] as const satisfies ReadonlyArray<{
  label: string;
  screen: Screen;
  icon: typeof Newspaper;
}>;

/**
 * Mobile gets a native app frame instead of a compressed desktop sidebar: a
 * quiet identity bar on top, persistent destinations at thumb-height, and the
 * one global creation action floating just above them.
 */
function MobileChrome({ active }: { active: Screen }) {
  const navigate = useNavigate();

  return (
    <>
      <header className="bn-mobile-header sticky top-0 z-40 hidden h-16 items-center justify-between border-b border-line bg-surface px-4 max-[900px]:flex">
        <button
          type="button"
          aria-label="Buka profil"
          onClick={() => navigate("profil")}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-line bg-bg"
        >
          <Avatar name="Zaki Nadhif" size={34} />
        </button>

        <button
          type="button"
          aria-label="Ke Scroll"
          onClick={() => navigate("scroll")}
          className="absolute left-1/2 flex size-10 -translate-x-1/2 cursor-pointer items-center justify-center rounded-[12px] bg-accent font-display text-title font-semibold text-accent-fg shadow-[0_1px_2px_oklch(0%_0_0_/_12%)]"
        >
          B
        </button>

        <button
          type="button"
          aria-label="Notifikasi"
          className="flex size-10 cursor-pointer items-center justify-center rounded-[12px] border border-line bg-surface text-ink shadow-[0_1px_3px_oklch(0%_0_0_/_8%)]"
        >
          <Bell size={22} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </header>

      <button
        type="button"
        aria-label="Bikin karya"
        onClick={() => navigate("karya-new")}
        className="bn-mobile-create fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 hidden size-14 cursor-pointer items-center justify-center rounded-[18px] border border-accent bg-accent text-accent-fg shadow-[0_8px_24px_oklch(0%_0_0_/_18%)] max-[900px]:flex"
      >
        <Plus size={31} strokeWidth={1.7} aria-hidden="true" />
      </button>

      <nav
        aria-label="Navigasi utama"
        className="bn-mobile-nav fixed inset-x-0 bottom-0 z-40 hidden h-[calc(4.5rem+env(safe-area-inset-bottom))] items-start border-t border-line bg-surface px-2 pt-2 shadow-[0_-4px_18px_oklch(0%_0_0_/_4%)] max-[900px]:flex"
      >
        {MOBILE_NAV.map(({ label, screen, icon: Icon }) => {
          const selected = active === screen;
          return (
            <button
              key={screen}
              type="button"
              aria-current={selected ? "page" : undefined}
              onClick={() => navigate(screen)}
              className={cn(
                "relative flex min-h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-1 bg-transparent font-body text-caption transition-colors",
                selected ? "font-semibold text-ink" : "font-normal text-ink2",
              )}
            >
              {selected && (
                <span className="absolute -top-2 h-0.5 w-10 rounded-full bg-accent" aria-hidden="true" />
              )}
              <Icon size={23} strokeWidth={selected ? 2.2 : 1.7} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

/**
 * The page frame every mockup screen shares: tinted background, the one global
 * stylesheet, and the three-column shell led by the left nav. Children supply
 * the center column and right rail.
 *
 * The columns' frame now comes from @myapp/ui (#92) — the same one the app
 * renders, so the measure cannot drift apart again. What stays here is what is
 * genuinely the gallery's: it is a document that scrolls, where the app is a
 * fixed pane that scrolls inside itself.
 *
 * The composer is not here. It briefly was — a modal the left rail opened from
 * any surface — on the theory that reach is what a composer needs. But a kabar is
 * always *about* one karya, and only two surfaces ever have one in hand: Scroll
 * (yours) and a karya's own page (that one). Everywhere else the door had nothing
 * to open with, and on the karya page it stood next to a better one. So it lives
 * on those two surfaces instead; see Composer.tsx.
 */
export function Shell({ active, navFilters, children }: {
  active:      Screen;
  navFilters?: ReactNode;
  children:    ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg font-body text-ink">
      <GlobalStyles />
      <MobileChrome active={active} />
      {/* Three-column layout (collapses to one column below ~900px) */}
      <ShellColumns>
        <LeftNav active={active}>{navFilters}</LeftNav>
        {children}
      </ShellColumns>
    </div>
  );
}
