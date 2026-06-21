import { type createDb, dedupeBySlug } from "@myapp/db";
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
async function resolveInterestIds(
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
 * Reconcile a member's free-text interest names against the shared catalog
 * (DECISION-B). Find-or-create each by slug, then full-replace the member's
 * `user_interests` links. Call inside a transaction so a partial failure rolls
 * back. Free-text names that miss the catalog become `curated: false` rows.
 */
export async function reconcileUserInterests(
  db: DbOrTx,
  userId: string,
  names: string[],
): Promise<void> {
  await db.delete(userInterests).where(eq(userInterests.userId, userId));

  const { deduped, idBySlug } = await resolveInterestIds(db, names);
  if (deduped.length === 0) return;

  const seen = new Set<string>();
  const links = deduped.flatMap((d) => {
    const id = idBySlug.get(d.slug);
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [{ userId, interestId: id }];
  });
  if (links.length > 0) {
    await db.insert(userInterests).values(links).onConflictDoNothing();
  }
}

/**
 * Reconcile a karya's free-text interest tags against the *same* shared catalog
 * as members (DECISION-C). Full-replace of `karya_interests`, mirroring the user
 * path. Call inside a transaction.
 */
export async function reconcileKaryaInterests(
  db: DbOrTx,
  karyaId: string,
  names: string[],
): Promise<void> {
  await db.delete(karyaInterests).where(eq(karyaInterests.karyaId, karyaId));

  const { deduped, idBySlug } = await resolveInterestIds(db, names);
  if (deduped.length === 0) return;

  const seen = new Set<string>();
  const links = deduped.flatMap((d) => {
    const id = idBySlug.get(d.slug);
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [{ karyaId, interestId: id }];
  });
  if (links.length > 0) {
    await db.insert(karyaInterests).values(links).onConflictDoNothing();
  }
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
