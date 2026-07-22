import {
  KaryaStage,
  PostKind,
  useListInterests,
} from "@myapp/api-client-react";
import { Input, Textarea, Toggle } from "@myapp/ui";
import type * as React from "react";
import { useState } from "react";

/**
 * The avatar, the cover tile and the tag are @myapp/ui's now (#92) — one
 * implementation, rendered by this app and the mockup gallery alike. The app used
 * to declare its own of each, which is how they drifted into different designs.
 * Re-exported here so call sites keep importing atoms from one place.
 */
export {
  Avatar,
  Eyebrow,
  Input,
  KaryaCard,
  KaryaCover,
  Tag,
  Textarea,
  Toggle,
} from "@myapp/ui";

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
    <span className="inline-flex gap-[2px] animate-[pulse_1.5s_ease-in-out_infinite] opacity-60 ml-0.5">
      <span>·</span>
      <span>·</span>
      <span>·</span>
    </span>
  );
}

export function Loading({ label = "loading" }: { label?: string }) {
  return (
    <div className="fixed inset-0 animate-up flex items-center justify-center">
      <span className="font-mono text-[13px] text-ink2">
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
    <div className="flex flex-wrap items-center gap-1.5">
      {skills.map((s, i) => (
        <span
          key={s}
          className="inline-flex items-center gap-1.5 px-2.5 py-[5px] bg-bg border border-line rounded-[100px] font-body text-body text-ink transition-colors"
        >
          {s}
          <button
            type="button"
            className="bg-transparent border-none p-0 flex items-center justify-center text-ink3 cursor-pointer hover:text-ink w-3 h-3 text-[14px] leading-none mb-0.5"
            onClick={() => onChange(skills.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="bg-transparent border-none p-0 m-0 w-[120px] outline-none font-body text-body text-ink placeholder:text-ink3"
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
      <div className="flex flex-wrap items-center gap-1.5">
        {interests.map((s, i) => (
          <span
            key={s}
            className="chip inline-flex items-center gap-1.5 px-2.5 py-[5px] bg-bg border border-line rounded-[100px] font-body text-body text-ink transition-colors"
          >
            {s}
            <button
              type="button"
              className="bg-transparent border-none p-0 flex items-center justify-center text-ink3 cursor-pointer hover:text-ink w-3 h-3 text-[14px] leading-none mb-0.5"
              onClick={() => onChange(interests.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="chip-add bg-transparent border-none p-0 m-0 w-[120px] outline-none font-body text-body text-ink placeholder:text-ink3"
          placeholder="+ tambah minat"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="bg-bg border border-dashed border-line text-ink2 text-micro px-2 py-0.5 rounded-[100px] cursor-pointer hover:border-ink2 transition-colors"
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
    <div className="flex flex-wrap items-center gap-1.5">
      {KARYA_STAGE_ORDER.map((s) => {
        const on = stages.includes(s);
        return (
          <Toggle
            key={s}
            pressed={on}
            onPressedChange={() => toggle(s)}
            className={`inline-flex h-auto items-center px-2 py-[3px] rounded-[100px] font-body text-body transition-all ${
              on
                ? "text-bg bg-ink border border-ink opacity-100 ring-2 ring-ink ring-offset-1 ring-offset-bg hover:bg-ink hover:text-bg"
                : "text-ink border border-line bg-bg opacity-70 hover:opacity-100 hover:bg-bg"
            }`}
          >
            {STAGE_LABELS[s]}
          </Toggle>
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
        className="field-val bg-transparent border-none text-left p-0 cursor-text font-body text-body text-ink min-h-6 break-words whitespace-pre-wrap outline-none w-full"
        onClick={() => setEditing(true)}
      >
        {value || <span className="text-ink3">ketuk buat edit</span>}
      </button>
    );
  return multiline ? (
    <Textarea
      className="field-ta w-full bg-bg border border-line rounded-[6px] px-2 py-1 outline-none font-body text-body text-ink resize-none focus:border-accent-line transition-colors"
      value={value}
      rows={3}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        onChange(e.target.value)
      }
      onBlur={() => setEditing(false)}
      autoFocus
    />
  ) : (
    <Input
      className="field-in w-full bg-bg border border-line rounded-[6px] px-2 py-1 outline-none font-body text-body text-ink min-h-6 focus:border-accent-line transition-colors"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.target.value)
      }
      onBlur={() => setEditing(false)}
      autoFocus
    />
  );
}
