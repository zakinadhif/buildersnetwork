/**
 * Post-kind helpers (Sprint 3, DECISION-B).
 *
 * `kind` is a *closed* 3-value vocabulary — a post must declare which of the
 * three update types it is. Unlike interests it's not a growing, browsable set,
 * so it's stored as plain `text` (repo style: `role`/`status`/`stages` — not a
 * pg enum) and guarded on write by a pure validator. Pure and import-light so
 * it's unit-testable without a DB and shared by the API save path and the
 * seeder (mirrors `karya.ts`/`interests.ts`).
 */

/** The fixed post kinds, in canonical display order. */
export const POST_KINDS = ["progress", "challenge", "achievement"] as const;

export type PostKind = (typeof POST_KINDS)[number];

const KIND_SET = new Set<string>(POST_KINDS);

/**
 * Normalize arbitrary input into a valid {@link PostKind}: return the value if
 * it's a known kind, else `null`. Unlike {@link normalizeStages} there is *no*
 * default — a post must declare its kind, so the API maps `null` → 400.
 */
export function normalizePostKind(input: unknown): PostKind | null {
  if (typeof input === "string" && KIND_SET.has(input)) {
    return input as PostKind;
  }
  return null;
}
