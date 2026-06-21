/**
 * Interest-name normalization helpers (Sprint 1, DECISION-D).
 *
 * Pure and import-light so they're unit-testable without a DB and can be shared
 * by both the API save path (reconcile-on-save) and the seeders. The slug is the
 * dedupe key for the shared `interests` catalog — it's what collapses
 * "Machine Learning", "machine learning", and "  machine  learning " into one
 * row, mitigating tag fragmentation (FR-15).
 */

/**
 * Normalize an interest name to its dedupe key:
 * lowercase → trim → collapse internal whitespace → replace non-alphanumeric
 * runs with `-` → strip leading/trailing `-`.
 */
export function slugifyInterest(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normalize a list of free-text interest names into unique `{ name, slug }`
 * pairs. Empty / slug-less entries are dropped; on a slug collision the first
 * occurrence's display name wins (stable, input order preserved).
 */
export function dedupeBySlug(
  names: string[],
): { name: string; slug: string }[] {
  const seen = new Set<string>();
  const out: { name: string; slug: string }[] = [];
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const slug = slugifyInterest(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ name, slug });
  }
  return out;
}
