import type { ReactNode } from "react";
import { NAV_SCREEN, useNavigate, type Screen } from "../gallery";
import { T, eyebrow } from "@myapp/design-tokens";
import { Avatar } from "./Avatar";

/** The five product surfaces. Only the first three route anywhere. */
const NAV_ITEMS: { label: string; icon: string }[] = [
  { label: "Launchpad",        icon: "◈" },
  { label: "Jelajahi Karya",   icon: "◉" },
  { label: "Cari Kolaborator", icon: "◎" },
  { label: "Minat Saya",       icon: "◇" },
  { label: "Karya Saya",       icon: "◆" },
];

/**
 * The left rail, identical on every screen. `active` marks the current surface;
 * `children` fills the optional filter slot between the nav items and the user
 * stub (Launchpad puts interest filters there, Cari variant B puts intent
 * filters there, everything else leaves it empty).
 */
export function LeftNav({ active, children }: { active: Screen; children?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <aside className="bn-nav" style={{
      width:         200,
      flexShrink:    0,
      display:       "flex",
      flexDirection: "column" as const,
      gap:           0,
      paddingTop:    8,
    }}>
      {/* Logo */}
      <div className="bn-nav-logo" style={{
        padding:      "0 12px 20px",
        borderBottom: `1px solid ${T.line}`,
        marginBottom: 16,
      }}>
        <div style={{ ...eyebrow, marginBottom: 4 }}>Al-Fath</div>
        <div style={{
          fontFamily: T.fontDisplay,
          fontSize:   T.size.feature,
          fontWeight: T.weight.regular,
          color:      T.ink,
          lineHeight: 1,
        }}>Berkarya</div>
      </div>

      {/* Nav items */}
      <nav className="bn-nav-items" style={{ marginBottom: 24 }}>
        {NAV_ITEMS.map((item) => {
          const target = NAV_SCREEN[item.label];
          const itemActive = target !== undefined && target === active;
          return (
            <button
              key={item.label}
              type="button"
              onClick={target ? () => navigate(target) : undefined}
              aria-current={itemActive ? "page" : undefined}
              style={{
                display:         "flex",
                alignItems:      "center",
                gap:             10,
                width:           "100%",
                textAlign:       "left" as const,
                border:          "none",
                padding:         "7px 12px",
                borderRadius:    T.radiusCard,
                backgroundColor: itemActive ? T.accentTint : "transparent",
                color:           itemActive ? T.accent : T.ink2,
                fontFamily:      T.fontBody,
                fontSize:        T.size.body,
                fontWeight:      itemActive ? T.weight.medium : T.weight.regular,
                cursor:          target ? "pointer" : "default",
                marginBottom:    1,
              }}
            >
              <span aria-hidden="true" style={{ fontFamily: T.fontBody, fontSize: T.size.ui }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Per-screen filter slot */}
      {children && (
        <div className="bn-nav-filters" style={{ padding: "0 12px" }}>
          {children}
        </div>
      )}

      {/* User stub at bottom */}
      <div className="bn-nav-user" style={{
        marginTop:  "auto",
        borderTop:  `1px solid ${T.line}`,
        padding:    "16px 12px 0",
        display:    "flex",
        alignItems: "center",
        gap:        8,
      }}>
        <Avatar name="Zaki Nadhif" size={28} />
        <div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.ui, fontWeight: T.weight.medium, color: T.ink }}>Zaki Nadhif</div>
          <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>@zaki_n</div>
        </div>
      </div>
    </aside>
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
