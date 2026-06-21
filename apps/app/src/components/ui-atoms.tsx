import {
  KaryaStage,
  PostKind,
  useListInterests,
} from "@myapp/api-client-react";
import { useState } from "react";

// Lifecycle stages in canonical order, with Indonesian labels for the UI.
export const KARYA_STAGE_ORDER = Object.values(KaryaStage) as KaryaStage[];
export const STAGE_LABELS: Record<KaryaStage, string> = {
  idea: "ide",
  validating: "validasi",
  building: "bikin",
  shipped: "rilis",
  paused: "jeda",
};

// Post kinds in canonical order, with Indonesian labels for the UI (FR-18).
export const POST_KIND_ORDER = Object.values(PostKind) as PostKind[];
export const POST_KIND_LABELS: Record<PostKind, string> = {
  progress: "progres",
  challenge: "tantangan",
  achievement: "capaian",
};

/**
 * Compact Indonesian relative-time label (e.g. "baru saja", "3j lalu"). Accepts
 * an ISO string (wire shape) or a Date. Coarse on purpose — the feed shows when,
 * not exactly when.
 */
export function timeAgo(input: string | Date): string {
  const then = typeof input === "string" ? new Date(input) : input;
  const secs = Math.floor((Date.now() - then.getTime()) / 1000);
  if (Number.isNaN(secs)) return "";
  if (secs < 60) return "baru saja";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}h lalu`;
  if (days < 30) return `${Math.floor(days / 7)}mg lalu`;
  if (days < 365) return `${Math.floor(days / 30)}bln lalu`;
  return `${Math.floor(days / 365)}th lalu`;
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

export function Loading({ label = "loading" }: { label?: string }) {
  return (
    <div
      className="screen"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          color: "var(--ink2)",
        }}
      >
        {label}
        <Dots />
      </span>
    </div>
  );
}

// Muted, dark palette (white-text-legible) in the warm design-system family.
// A name/handle hashes deterministically to one of these so a member's face is
// stable across sessions.
const AVATAR_COLORS = [
  "oklch(45% 0.09 30)",
  "oklch(45% 0.07 62)",
  "oklch(44% 0.06 145)",
  "oklch(45% 0.07 230)",
  "oklch(42% 0.08 300)",
  "oklch(45% 0.08 10)",
];

function avatarInitials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarColor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

/**
 * A contributor face (FR-11, DECISION-E). Renders `image` when present, else a
 * deterministic monogram — initials over a name/handle-hashed color. No real
 * profile pictures exist yet (`image` is always null this sprint); the prop is
 * here so a future upload feature lights up the same component unchanged.
 */
export function Avatar({
  name,
  handle,
  image,
  size = 32,
}: {
  name: string;
  handle?: string | null;
  image?: string | null;
  size?: number;
}) {
  if (image) {
    return (
      <img
        className="avatar"
        src={image}
        alt={name}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="avatar avatar-mono"
      role="img"
      title={name}
      aria-label={name}
      style={{
        width: size,
        height: size,
        background: avatarColor(handle || name || "?"),
        fontSize: Math.round(size * 0.4),
      }}
    >
      {avatarInitials(name)}
    </span>
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

/**
 * Interests editor drawing from the shared catalog (FR-14/FR-15). Selected
 * interests render as removable chips; typing filters the curated vocabulary as
 * tappable suggestions, and Enter still accepts free-text (reconciled to the
 * catalog server-side on save). The wire shape stays `string[]` (DECISION-C).
 */
export function InterestsEditor({
  interests,
  onChange,
}: {
  interests: string[];
  onChange: (interests: string[]) => void;
}) {
  const [val, setVal] = useState("");
  const { data: catalog = [] } = useListInterests();

  const add = (name: string) => {
    const next = name.trim();
    if (!next) return;
    // Case-insensitive guard against obvious dupes; server slug-dedupes too.
    if (interests.some((i) => i.toLowerCase() === next.toLowerCase())) {
      setVal("");
      return;
    }
    onChange([...interests, next]);
    setVal("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && val.trim()) {
      e.preventDefault();
      add(val);
    }
  };

  const selected = new Set(interests.map((i) => i.toLowerCase()));
  const q = val.trim().toLowerCase();
  const suggestions = catalog
    .filter((i) => !selected.has(i.name.toLowerCase()))
    .filter((i) => (q ? i.name.toLowerCase().includes(q) : true))
    .slice(0, 8);

  return (
    <div>
      <div className="skills-wrap">
        {interests.map((s, i) => (
          <span key={s} className="chip">
            {s}
            <button
              type="button"
              className="chip-rm"
              onClick={() => onChange(interests.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="chip-add"
          placeholder="+ tambah minat"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="chip-suggests">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="chip-suggest"
              onClick={() => add(s.name)}
            >
              + {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Owner-set lifecycle stage multi-select (FR-10a). A fixed 5-value enum, not a
 * growing vocabulary — toggle chips, at least one stays implied via the server
 * default (`["idea"]`) if all are cleared. A signal, not a gate.
 */
export function StageMultiSelect({
  stages,
  onChange,
}: {
  stages: KaryaStage[];
  onChange: (stages: KaryaStage[]) => void;
}) {
  const toggle = (s: KaryaStage) =>
    onChange(
      stages.includes(s) ? stages.filter((x) => x !== s) : [...stages, s],
    );
  return (
    <div className="skills-wrap">
      {KARYA_STAGE_ORDER.map((s) => {
        const on = stages.includes(s);
        return (
          <button
            key={s}
            type="button"
            className={`stage-chip stage-pick${on ? " on" : ""}`}
            aria-pressed={on}
            onClick={() => toggle(s)}
          >
            {STAGE_LABELS[s]}
          </button>
        );
      })}
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
