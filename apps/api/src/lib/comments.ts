import type { createDb } from "@myapp/db";
import { comments, profiles, users } from "@myapp/db/schema";
import { asc, eq, inArray } from "drizzle-orm";

type Db = ReturnType<typeof createDb>;

/** A comment joined to the author's display data for the wire response. */
export interface CommentRow {
  id: string;
  postId: string;
  body: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorHandle: string | null;
  authorImage: string | null;
}

const commentSelect = {
  id: comments.id,
  postId: comments.postId,
  body: comments.body,
  createdAt: comments.createdAt,
  authorId: comments.authorId,
  authorName: profiles.name,
  authorHandle: profiles.handle,
  authorImage: users.image,
};

function baseQuery(db: Db) {
  return db
    .select(commentSelect)
    .from(comments)
    .innerJoin(profiles, eq(comments.authorId, profiles.userId))
    .innerJoin(users, eq(comments.authorId, users.id));
}

export function toComment(r: CommentRow) {
  return {
    id: r.id,
    postId: r.postId,
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

/** Fetch comments for several posts in one query, preserving thread order. */
export async function commentsByPostIds(
  db: Db,
  postIds: string[],
): Promise<Map<string, CommentRow[]>> {
  const grouped = new Map<string, CommentRow[]>();
  if (postIds.length === 0) return grouped;

  const rows = await baseQuery(db)
    .where(inArray(comments.postId, postIds))
    .orderBy(asc(comments.createdAt));

  for (const row of rows) {
    const list = grouped.get(row.postId);
    if (list) list.push(row);
    else grouped.set(row.postId, [row]);
  }
  return grouped;
}

export async function commentsForPost(
  db: Db,
  postId: string,
): Promise<CommentRow[]> {
  return (await commentsByPostIds(db, [postId])).get(postId) ?? [];
}

export async function getCommentById(
  db: Db,
  id: string,
): Promise<CommentRow | null> {
  const [row] = await baseQuery(db).where(eq(comments.id, id)).limit(1);
  return row ?? null;
}
