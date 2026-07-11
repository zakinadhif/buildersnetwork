/**
 * The three FR-29 "looking for" categories — the one canonical encoding.
 *
 * Every Cari variant used to declare its own union with its own spelling
 * ("hackathon" / "Tim Hackathon" / "Tim Event/Hackathon" / "Hackathon"), so the
 * same domain concept existed four incompatible ways. The *visual* treatment of
 * the badge is per-variant on purpose — that divergence is the exploration — but
 * the value underneath is this type, and each variant owns a label map.
 */
export type LookingFor = "hackathon" | "project" | "gig";

/** Stable iteration order: most urgent → least committed. */
export const LOOKING_FOR: readonly LookingFor[] = ["hackathon", "project", "gig"];
