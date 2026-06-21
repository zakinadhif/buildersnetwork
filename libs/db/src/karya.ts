/**
 * Karya stage helpers (Sprint 2, DECISION-B).
 *
 * `stages[]` is a *fixed* 5-value enum, multi-select, owner-set — a signal, not
 * a gate. Stored the way `profiles.skills` is (a `jsonb` string array), not a
 * normalized join: unlike interests it's a closed vocabulary, not a shared,
 * growing, browsable one. A pure validator guards writes so the column can't
 * drift to garbage. Pure and import-light so it's unit-testable without a DB
 * and shared by the API save path and the seeder (mirrors `interests.ts`).
 */

/** The fixed lifecycle stages, in canonical display order. */
export const KARYA_STAGES = [
  "idea",
  "validating",
  "building",
  "shipped",
  "paused",
] as const;

export type KaryaStage = (typeof KARYA_STAGES)[number];

const STAGE_SET = new Set<string>(KARYA_STAGES);

/**
 * Normalize arbitrary input into a valid `stages[]`: keep only known stage
 * strings, dedupe, and order by {@link KARYA_STAGES}. Defaults to `["idea"]`
 * when nothing valid remains (DECISION-B) — a karya is creatable at any
 * maturity, but always carries at least the idea stage.
 */
export function normalizeStages(input: unknown): KaryaStage[] {
  const seen = new Set<KaryaStage>();
  if (Array.isArray(input)) {
    for (const raw of input) {
      if (typeof raw === "string" && STAGE_SET.has(raw)) {
        seen.add(raw as KaryaStage);
      }
    }
  }
  if (seen.size === 0) return ["idea"];
  // Preserve canonical order regardless of input order.
  return KARYA_STAGES.filter((s) => seen.has(s));
}
