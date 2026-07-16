import type { ReactNode } from "react";
import { NAV_SCREEN, useNavigate, type Screen } from "../gallery";
import { T, eyebrow } from "@myapp/design-tokens";
import { LeftNav as UiLeftNav, type NavItem } from "@myapp/ui";

/** The three live product surfaces. Cari Kolaborator, Minat Saya, and Karya Saya
 *  were retired from the sidebar — the first two remain reachable via the screen
 *  switcher (SCREEN_META); Karya Saya has no surface of its own yet. */
const NAV_ITEMS: { label: string; icon: string }[] = [
  { label: "Scroll", icon: "◈" },
  { label: "Karya",  icon: "▦" },
  { label: "People", icon: "◉" },
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
    <>
      <div style={{ ...eyebrow, marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
        {options.map((opt) => {
          const on = active === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              aria-pressed={on}
              style={{
                textAlign:       "left" as const,
                background:      "none",
                border:          "none",
                padding:         "4px 8px",
                borderRadius:    "4px",
                fontFamily:      T.fontBody,
                fontSize:        T.size.ui,
                color:           on ? T.accent : T.ink2,
                backgroundColor: on ? T.accentTint : "transparent",
                cursor:          "pointer",
                fontWeight:      on ? T.weight.medium : T.weight.regular,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
