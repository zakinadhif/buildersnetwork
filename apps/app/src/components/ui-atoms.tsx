import { useState } from "react";

export function Dots() {
  return (
    <span className="dots">
      <span>·</span>
      <span>·</span>
      <span>·</span>
    </span>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <div
      className="screen"
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink2)" }}>
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
        <span key={i} className="chip">
          {s}
          <button
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
      <span className="field-val" onClick={() => setEditing(true)}>
        {value || <span style={{ color: "var(--ink3)" }}>ketuk buat edit</span>}
      </span>
    );
  return multiline ? (
    <textarea
      className="field-ta"
      value={value}
      rows={3}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      autoFocus
    />
  ) : (
    <input
      className="field-in"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      autoFocus
    />
  );
}
