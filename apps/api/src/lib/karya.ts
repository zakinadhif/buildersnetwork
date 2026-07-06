import type { createDb, KaryaStage } from "@myapp/db";
import { karyaMembers, profiles, users } from "@myapp/db/schema";
import { eq, inArray } from "drizzle-orm";
import { coverUrlFor } from "./cover";
import { interestsByKaryaIds } from "./interests";

type Db = ReturnType<typeof createDb>;

// One roster row per karya membership, joined to the member's profile + user
// (for the face). Carries `role`/`status` so callers can filter approved
// members vs pending requests and sort the owner first.
export interface RosterRow {
  karyaId: string;
  userId: string;
  role: string;
  status: string;
  createdAt: Date;
  name: string;
  handle: string | null;
  image: string | null;
}

/**
 * Fetch every roster row for the given karya in one grouped query — don't N+1
 * the listing (mirrors `interestsByKaryaIds`). Members without a profile are
 * dropped (no name to render a face from).
 */
export async function rostersByKaryaIds(
  db: Db,
  karyaIds: string[],
): Promise<Map<string, RosterRow[]>> {
  const grouped = new Map<string, RosterRow[]>();
  if (karyaIds.length === 0) return grouped;

  const rows = await db
    .select({
      karyaId: karyaMembers.karyaId,
      userId: karyaMembers.userId,
      role: karyaMembers.role,
      status: karyaMembers.status,
      createdAt: karyaMembers.createdAt,
      name: profiles.name,
      handle: profiles.handle,
      image: users.image,
    })
    .from(karyaMembers)
    .innerJoin(profiles, eq(karyaMembers.userId, profiles.userId))
    .innerJoin(users, eq(karyaMembers.userId, users.id))
    .where(inArray(karyaMembers.karyaId, karyaIds));

  for (const r of rows) {
    const list = grouped.get(r.karyaId);
    if (list) list.push(r);
    else grouped.set(r.karyaId, [r]);
  }
  return grouped;
}

/** Owner first, then by join time — stable roster order for the faces. */
export function sortRoster(rows: RosterRow[]): RosterRow[] {
  return [...rows].sort((a, b) => {
    if (a.role !== b.role) return a.role === "owner" ? -1 : 1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export function toRosterMember(r: RosterRow) {
  return { id: r.userId, name: r.name, handle: r.handle, image: r.image };
}

// The minimal karya row a list item is built from (the columns `GET /karya`,
// the feed, and the featured read all select).
export interface KaryaListRow {
  id: string;
  title: string;
  description: string;
  stages: KaryaStage[];
  coverKey: string | null;
}

/**
 * Assemble a single `KaryaListItem` from a karya row + its already-batched
 * interests and roster (approved members only, owner first). Pure — the
 * batching is done once by {@link karyaListItems} so neither the list, the
 * feed, nor the featured read N+1s.
 */
export function toKaryaListItem(
  k: KaryaListRow,
  interests: string[],
  roster: RosterRow[],
) {
  const members = sortRoster(roster.filter((r) => r.status === "member"));
  return {
    id: k.id,
    title: k.title,
    description: k.description,
    stages: k.stages,
    interests,
    coverUrl: coverUrlFor(k.id, k.coverKey),
    roster: members.map(toRosterMember),
    memberCount: members.length,
  };
}

/**
 * Build `KaryaListItem`s for a set of karya rows, batching interests + rosters
 * in two queries total (no N+1). Shared by `GET /karya` (S3.6), the feed
 * (S3.9), and the featured read (S3.10).
 */
export async function karyaListItems(db: Db, rows: KaryaListRow[]) {
  if (rows.length === 0) return [];
  const ids = rows.map((k) => k.id);
  const interestsByKarya = await interestsByKaryaIds(db, ids);
  const rosters = await rostersByKaryaIds(db, ids);
  return rows.map((k) =>
    toKaryaListItem(
      k,
      interestsByKarya.get(k.id) ?? [],
      rosters.get(k.id) ?? [],
    ),
  );
}
