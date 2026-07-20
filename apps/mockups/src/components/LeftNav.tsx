import type { ReactNode } from "react";
import { LayoutGrid, Newspaper, Users } from "lucide-react";
import { NAV_SCREEN, useNavigate, type Screen } from "../gallery";
import { cn, LeftNav as UiLeftNav, type NavItem } from "@myapp/ui";

/** The three live product surfaces. Cari Kolaborator, Minat Saya, and Karya Saya
 *  were retired from the sidebar — the first two remain reachable via the screen
 *  switcher (SCREEN_META); Karya Saya has no surface of its own yet.
 *
 *  Icons are lucide-react (rounded caps/joins → a friendly line-icon vibe): a
 *  news feed for Scroll, a catalogue grid for Karya, a group for People. */
const NAV_ITEMS: { label: string; icon: ReactNode }[] = [
  { label: "Scroll", icon: <Newspaper size={18} strokeWidth={1.75} /> },
  { label: "Karya",  icon: <LayoutGrid size={18} strokeWidth={1.75} /> },
  { label: "People", icon: <Users size={18} strokeWidth={1.75} /> },
];

/**
 * The gallery's left rail. The rail itself lives in @myapp/ui (#92) — the app
 * renders the very same one. What stays here is the only part that is genuinely
 * the gallery's: *which* items exist and what clicking one does (switch screens,
 * where the app routes).
 *
 * `children` fills the optional filter slot between the nav items and the user
 * stub (Launchpad puts interest filters there, Cari variant B puts intent
 * filters there, everything else leaves it empty).
 *
 * There is deliberately no "Tulis kabar" here. It was tried: one door on every
 * surface put a second one three inches from the karya page's own, and two doors
 * to one room read as a mistake however you style them. The composer is embedded
 * in the two surfaces a kabar can come from instead — see Composer.tsx.
 */
export function LeftNav({ active, children }: { active: Screen; children?: ReactNode }) {
  const navigate = useNavigate();

  const items: NavItem[] = NAV_ITEMS.map((item) => {
    const target = NAV_SCREEN[item.label];
    return {
      label:    item.label,
      icon:     item.icon,
      active:   target !== undefined && target === active,
      disabled: target === undefined,
      onClick:  target ? () => navigate(target) : undefined,
    };
  });

  return (
    <UiLeftNav
      items={items}
      user={{ name: "Zaki Nadhif", handle: "zaki_n" }}
      filters={children}
    />
  );
}

/**
 * A labelled column of single-select filter buttons for the LeftNav slot.
 * Used by Launchpad ("Filter Minat") and Cari variant B ("Filter Tujuan").
 */
export function NavFilterList<Value extends string>({ label, options, active, onSelect }: {
  label:    string;
  options:  readonly { value: Value; label: string }[];
  active:   Value;
  onSelect: (v: Value) => void;
}) {
  return (
    <div>
      <div className="text-micro font-medium tracking-eyebrow uppercase text-ink3 mb-2.5">{label}</div>
      <div className="flex flex-col gap-0.5">
        {options.map((opt) => {
          const on = active === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              aria-pressed={on}
              className={cn(
                "w-full rounded-card px-2 py-1 text-left font-body text-ui cursor-pointer",
                on
                  ? "bg-accent-tint text-accent font-medium"
                  : "bg-transparent text-ink2 font-normal",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
