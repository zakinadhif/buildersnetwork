import {
  KaryaStage,
  type KaryaStage as KaryaStageValue,
} from "@myapp/api-client-react";

export const KARYA_STAGE_ORDER = Object.values(KaryaStage) as KaryaStageValue[];
export const STAGE_LABELS: Record<KaryaStageValue, string> = {
  idea: "ide",
  validating: "validasi",
  building: "bikin",
  shipped: "rilis",
  paused: "jeda",
};

/** Compact Indonesian relative-time label (e.g. "baru saja", "3j lalu"). */
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
