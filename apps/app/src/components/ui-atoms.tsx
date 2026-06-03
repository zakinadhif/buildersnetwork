import { useState } from "react";

const ALFATH_LOGO = `${import.meta.env.BASE_URL}brand/logo-alfath.svg`;

export function BrandMark({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "brand-mark-sm" : size === "lg" ? "brand-mark-lg" : "";
  return (
    <span className={`brand-mark ${sizeClass} ${className}`.trim()}>
      <img src={ALFATH_LOGO} alt="" aria-hidden="true" />
    </span>
  );
}

export function BrandLockup({
  meta = "builder community",
  compact = false,
}: {
  meta?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`brand-lockup ${compact ? "brand-lockup-compact" : ""}`.trim()}
    >
      <BrandMark size={compact ? "sm" : "md"} />
      <div>
        <span className="brand-title">Al-Fath Berkarya</span>
        {meta && <span className="brand-meta">{meta}</span>}
      </div>
    </div>
  );
}

export function Dots() {
  return (
    <span className="dots">
      <span>·</span>
      <span>·</span>
      <span>·</span>
    </span>
  );
}

export function Loading({ label = "sebentar ya" }: { label?: string }) {
  return (
    <div
      className="screen"
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <BrandMark size="sm" />
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          color: "var(--ink2)",
          marginTop: 14,
        }}
      >
        {label}
        <Dots />
      </span>
    </div>
  );
}

export function SkillsEditor({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [val, setVal] = useState("");
  const add = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && val.trim()) {
      onChange([...skills, val.trim()]);
      setVal("");
    }
  };
  return (
    <div className="skills-wrap">
      {skills.map((s, i) => (
        <span key={s} className="chip">
          {s}
          <button
            type="button"
            className="chip-rm"
            onClick={() => onChange(skills.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="chip-add"
        placeholder="+ tambah skill"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={add}
      />
    </div>
  );
}

export function EditField({
  value,
  onChange,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  if (!editing)
    return (
      <button
        type="button"
        className="field-val"
        onClick={() => setEditing(true)}
      >
        {value || <span style={{ color: "var(--ink3)" }}>ketuk buat edit</span>}
      </button>
    );
  return multiline ? (
    <textarea
      className="field-ta"
      value={value}
      rows={3}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      // biome-ignore lint/a11y/noAutofocus: intentional focus when edit mode activates
      autoFocus
    />
  ) : (
    <input
      className="field-in"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      // biome-ignore lint/a11y/noAutofocus: intentional focus when edit mode activates
      autoFocus
    />
  );
}
