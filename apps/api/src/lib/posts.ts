import type { createDb, PostKind } from "@myapp/db";
import { karya, posts, profiles, users } from "@myapp/db/schema";
import { desc, eq } from "drizzle-orm";

type Db = ReturnType<typeof createDb>;

// A post joined to its author's face and parent karya title. The karya title is
// only needed by the feed (the parent-karya reference); the stream ignores it.
export interface PostRow {
  id: string;
  karyaId: string;
  kind: PostKind;
  body: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorHandle: string | null;
  authorImage: string | null;
  karyaTitle: string;
}

// Shared select shape: posts → author profile (name/handle) + user (image) +
// parent karya (title). Author profile is an inner join, so a post by a
// profile-less user is dropped (can't render a face) — seeded authors all have
// profiles.
const postSelect = {
  id: posts.id,
  karyaId: posts.karyaId,
  kind: posts.kind,
  body: posts.body,
  createdAt: posts.createdAt,
  authorId: posts.authorId,
  authorName: profiles.name,
  authorHandle: profiles.handle,
  authorImage: users.image,
  karyaTitle: karya.title,
};

function baseQuery(db: Db) {
  return db
    .select(postSelect)
    .from(posts)
    .innerJoin(profiles, eq(posts.authorId, profiles.userId))
    .innerJoin(users, eq(posts.authorId, users.id))
    .innerJoin(karya, eq(posts.karyaId, karya.id));
}

/** Shape a {@link PostRow} into the wire `Post` (author face + ISO timestamp). */
export function toPost(r: PostRow) {
  return {
    id: r.id,
    karyaId: r.karyaId,
    kind: r.kind,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    author: {
      id: r.authorId,
      name: r.authorName,
      handle: r.authorHandle,
      image: r.authorImage,
    },
  };
}

/** The N most-recent posts across all karya, reverse-chron — drives the feed. */
export async function recentPosts(db: Db, limit: number): Promise<PostRow[]> {
  return baseQuery(db).orderBy(desc(posts.createdAt)).limit(limit);
}

/** A single karya's posts, reverse-chron — drives the karya stream. */
export async function postsForKarya(
  db: Db,
  karyaId: string,
): Promise<PostRow[]> {
  return baseQuery(db)
    .where(eq(posts.karyaId, karyaId))
    .orderBy(desc(posts.createdAt));
}

/** Fetch one post by id (with its author face) — used after create to return it. */
export async function getPostById(db: Db, id: string): Promise<PostRow | null> {
  const [row] = await baseQuery(db).where(eq(posts.id, id)).limit(1);
  return row ?? null;
}
