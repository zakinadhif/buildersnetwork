import { type AtomicExec, type createDb, dedupeBySlug } from "@myapp/db";
import { interests, karyaInterests, userInterests } from "@myapp/db/schema";
import { eq, inArray } from "drizzle-orm";

type Db = ReturnType<typeof createDb>;
// A transaction handle has the same query surface we use here.
type DbOrTx = Pick<Db, "select" | "insert" | "delete">;

/**
 * Find-or-create the given free-text interest names against the shared catalog
 * and return a `slug → id` map (DECISION-B/C). Names missing from the catalog
 * become `curated: false` rows. This is the karya-agnostic core shared by both
 * the user and karya reconcile paths (and a future tagger, FR-16) — keep it so.
 */
export async function resolveInterestIds(
  db: DbOrTx,
  names: string[],
): Promise<{
  deduped: { name: string; slug: string }[];
  idBySlug: Map<string, string>;
}> {
  const deduped = dedupeBySlug(names);
  if (deduped.length === 0) return { deduped, idBySlug: new Map() };

  await db
    .insert(interests)
    .values(
      deduped.map((d) => ({
        id: crypto.randomUUID(),
        name: d.name,
        slug: d.slug,
        curated: false,
      })),
    )
    .onConflictDoNothing({ target: interests.slug });

  const rows = await db
    .select({ id: interests.id, slug: interests.slug })
    .from(interests)
    .where(
      inArray(
        interests.slug,
        deduped.map((d) => d.slug),
      ),
    );
  return { deduped, idBySlug: new Map(rows.map((r) => [r.slug, r.id])) };
}

/**
 * Map resolved interest ids to link rows, de-duping by interest id so a slug
 * collision can't produce a duplicate link.
 */
function linkRows<T>(
  deduped: { slug: string }[],
  idBySlug: Map<string, string>,
  make: (interestId: string) => T,
): T[] {
  const seen = new Set<string>();
  return deduped.flatMap((d) => {
    const id = idBySlug.get(d.slug);
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [make(id)];
  });
}

/**
 * Build the write statements that full-replace a member's `user_interests` links
 * (DECISION-B): delete the old links, then insert the resolved ones. Returned as
 * statements (not executed) so the caller can commit them atomically alongside
 * the profile upsert — see {@link atomicWrite}. Resolve `idBySlug` first with
 * {@link resolveInterestIds}.
 */
export function userInterestWrites(
  e: AtomicExec,
  userId: string,
  deduped: { name: string; slug: string }[],
  idBySlug: Map<string, string>,
): unknown[] {
  const stmts: unknown[] = [
    e.delete(userInterests).where(eq(userInterests.userId, userId)),
  ];
  const links = linkRows(deduped, idBySlug, (interestId) => ({
    userId,
    interestId,
  }));
  if (links.length > 0) {
    stmts.push(e.insert(userInterests).values(links).onConflictDoNothing());
  }
  return stmts;
}

/**
 * Build the write statements that full-replace a karya's `karya_interests` tags
 * (DECISION-C), mirroring {@link userInterestWrites}. Returned as statements so
 * the caller can commit them atomically with the karya create.
 */
export function karyaInterestWrites(
  e: AtomicExec,
  karyaId: string,
  deduped: { name: string; slug: string }[],
  idBySlug: Map<string, string>,
): unknown[] {
  const stmts: unknown[] = [
    e.delete(karyaInterests).where(eq(karyaInterests.karyaId, karyaId)),
  ];
  const links = linkRows(deduped, idBySlug, (interestId) => ({
    karyaId,
    interestId,
  }));
  if (links.length > 0) {
    stmts.push(e.insert(karyaInterests).values(links).onConflictDoNothing());
  }
  return stmts;
}

/**
 * Resolve interest display names for a set of users in one query, grouped by
 * userId and sorted for stable output (DECISION-C — reads still emit
 * `interests: string[]`). Batched to avoid N+1 on the directory list.
 */
export async function interestsByUserIds(
  db: DbOrTx,
  userIds: string[],
): Promise<Map<string, string[]>> {
  const grouped = new Map<string, string[]>();
  if (userIds.length === 0) return grouped;

  const rows = await db
    .select({ userId: userInterests.userId, name: interests.name })
    .from(userInterests)
    .innerJoin(interests, eq(userInterests.interestId, interests.id))
    .where(inArray(userInterests.userId, userIds));

  for (const r of rows) {
    const list = grouped.get(r.userId);
    if (list) list.push(r.name);
    else grouped.set(r.userId, [r.name]);
  }
  for (const list of grouped.values()) list.sort();
  return grouped;
}

/** Single-user convenience over {@link interestsByUserIds}. */
export async function interestsForUser(
  db: DbOrTx,
  userId: string,
): Promise<string[]> {
  return (await interestsByUserIds(db, [userId])).get(userId) ?? [];
}

/**
 * Resolve interest display names for a set of karya in one query, grouped by
 * karyaId and sorted for stable output. Mirrors {@link interestsByUserIds};
 * batched to avoid N+1 on the karya listing.
 */
export async function interestsByKaryaIds(
  db: DbOrTx,
  karyaIds: string[],
): Promise<Map<string, string[]>> {
  const grouped = new Map<string, string[]>();
  if (karyaIds.length === 0) return grouped;

  const rows = await db
    .select({ karyaId: karyaInterests.karyaId, name: interests.name })
    .from(karyaInterests)
    .innerJoin(interests, eq(karyaInterests.interestId, interests.id))
    .where(inArray(karyaInterests.karyaId, karyaIds));

  for (const r of rows) {
    const list = grouped.get(r.karyaId);
    if (list) list.push(r.name);
    else grouped.set(r.karyaId, [r.name]);
  }
  for (const list of grouped.values()) list.sort();
  return grouped;
}

/** Single-karya convenience over {@link interestsByKaryaIds}. */
export async function interestsForKarya(
  db: DbOrTx,
  karyaId: string,
): Promise<string[]> {
  return (await interestsByKaryaIds(db, [karyaId])).get(karyaId) ?? [];
}
