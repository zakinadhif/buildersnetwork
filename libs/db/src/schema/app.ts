import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type { KaryaStage } from "../karya";
import { users } from "./auth";

export type AssistantIntent = "general" | "profile" | "karya";

export type AssistantAction =
  | {
      type: "profile_draft";
      payload: {
        name: string;
        handle: string;
        bio: string;
        year: string;
        major: string;
        skills: string[];
        interests: string[];
      };
    }
  | {
      type: "karya_draft";
      payload: {
        title: string;
        description: string;
        stages: KaryaStage[];
        interests: string[];
      };
    };

export type AssistantMessagePart = {
  type: string;
  [key: string]: unknown;
};

// Timestamps are Unix epoch *milliseconds* (`integer` + `mode: "timestamp_ms"`),
// the SQLite counterpart of the old `timestamp ... default now()`. Milliseconds,
// not seconds, to match what `better-auth:generate` emits into `./auth.ts` — one
// precision for the whole database — and to keep the reverse-chron feed from
// tying rows written in the same second.
const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const profiles = sqliteTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // PRD profile model. `handle` is unique but nullable — backfilled by the 0a
  // migration; a NOT NULL tightening is deferred to a later sprint.
  handle: text("handle").unique(),
  bio: text("bio"),
  // Interests are normalized into `interests` + `user_interests` (Sprint 1).
  year: text("year").notNull(),
  major: text("major").notNull(),
  skills: text("skills", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(now)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(now)
    .$onUpdate(() => new Date())
    .notNull(),
});

// User-owned Asisten AI workspaces. The server owns their prompt and history;
// clients only send one new turn at a time. This keeps conversation context
// private to its member and prevents clients from injecting arbitrary history.
export const assistantConversations = sqliteTable(
  "assistant_conversations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Percakapan baru"),
    intent: text("intent")
      .$type<AssistantIntent>()
      .notNull()
      .default("general"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(now)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(now)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("assistant_conversations_userId_updatedAt_idx").on(
      table.userId,
      table.updatedAt,
    ),
  ],
);

export const assistantMessages = sqliteTable(
  "assistant_messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => assistantConversations.id, { onDelete: "cascade" }),
    role: text("role").$type<"user" | "assistant">().notNull(),
    content: text("content").notNull(),
    action: text("action", { mode: "json" }).$type<AssistantAction>(),
    parts: text("parts", { mode: "json" }).$type<AssistantMessagePart[]>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(now)
      .notNull(),
  },
  (table) => [
    index("assistant_messages_conversationId_createdAt_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  ],
);

// The shared interest vocabulary (FR-14/FR-15). One row per distinct interest,
// deduped by `slug`. `curated` marks rows from the starter list vs free-text
// additions reconciled in on save. Both members (this sprint) and karya
// (Sprint 2's `karya_interests`) tag against this same table.
export const interests = sqliteTable("interests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  curated: integer("curated", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(now)
    .notNull(),
});

// Join table linking members to interests (FR-14).
export const userInterests = sqliteTable(
  "user_interests",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    interestId: text("interest_id")
      .notNull()
      .references(() => interests.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.interestId] }),
    // Reverse lookup: who/what tags a given interest.
    index("user_interests_interestId_idx").on(table.interestId),
  ],
);

// A karya — the unit of work people build and collaborate around (FR-10).
// Creatable at any maturity; `stages` is an owner-set lifecycle signal, stored
// as a json string array like `profiles.skills` (DECISION-B), not a join.
export const karya = sqliteTable(
  "karya",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    stages: text("stages", { mode: "json" })
      .$type<KaryaStage[]>()
      .notNull()
      .default(["idea"]),
    // Object-storage key of an owner-uploaded cover image (nullable). The
    // content-type is encoded in the key's extension so the serve route
    // (`GET /karya/:id/cover`) needs no companion column. Absent → the client
    // falls back to an interest-derived illustration (issue #17).
    coverKey: text("cover_key"),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(now)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(now)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("karya_createdBy_idx").on(table.createdBy),
    // Reverse-chron listing (FR-22 forward-look).
    index("karya_createdAt_idx").on(table.createdAt),
  ],
);

// A karya's screenshot gallery (issue #19) — Play Store-style proof shots,
// separate from the single `coverKey` icon. `orientation` picks the display
// slot: `landscape` feeds the feed-row carousel, `portrait` the detail/Spotlight
// gallery. `position` is owner-set ordering within one orientation (DECISION
// mirrors `featured.rank` — lower sorts first).
export const karyaScreenshots = sqliteTable(
  "karya_screenshots",
  {
    id: text("id").primaryKey(),
    karyaId: text("karya_id")
      .notNull()
      .references(() => karya.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    orientation: text("orientation").notNull(), // "landscape" | "portrait"
    position: integer("position").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(now)
      .notNull(),
  },
  (table) => [
    // Ordered gallery read, batched by karya (mirrors rostersByKaryaIds).
    index("karya_screenshots_karyaId_idx").on(table.karyaId),
  ],
);

// Contributor roster + join requests (FR-12). The creator is one row with
// `role: "owner", status: "member"` (DECISION-G); join requests are
// `role: "member", status: "pending"` until the owner approves.
export const karyaMembers = sqliteTable(
  "karya_members",
  {
    karyaId: text("karya_id")
      .notNull()
      .references(() => karya.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // "owner" | "member"
    status: text("status").notNull().default("pending"), // "member" | "pending"
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(now)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.karyaId, table.userId] }),
    // "My karya" reverse lookup.
    index("karya_members_userId_idx").on(table.userId),
  ],
);

// Karya interest tags — a join into the *same* shared `interests` catalog used
// by `user_interests` (DECISION-C). One vocabulary, deduped by slug.
export const karyaInterests = sqliteTable(
  "karya_interests",
  {
    karyaId: text("karya_id")
      .notNull()
      .references(() => karya.id, { onDelete: "cascade" }),
    interestId: text("interest_id")
      .notNull()
      .references(() => interests.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.karyaId, table.interestId] }),
    // Reverse lookup: karya tagged with a given interest.
    index("karya_interests_interestId_idx").on(table.interestId),
  ],
);

// Karya updates — short body-only posts a member writes on a karya (FR-18).
// Read two ways (DECISION-D): the karya stream (by karya_id) and the global
// feed (reverse-chron by created_at).
export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    karyaId: text("karya_id")
      .notNull()
      .references(() => karya.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(now)
      .notNull(),
  },
  (table) => [
    // Karya stream (DECISION-D).
    index("posts_karyaId_idx").on(table.karyaId),
    // Reverse-chron global feed (FR-22).
    index("posts_createdAt_idx").on(table.createdAt),
  ],
);

// Hand-curated "Top picked" karya for the homepage (FR-24). One row per featured
// karya; `rank` gives the team explicit ordering (lower sorts first). Edited
// in-app via the `ADMIN_EMAILS` allowlist toggle (DECISION-A) — not RBAC.
export const featured = sqliteTable(
  "featured",
  {
    karyaId: text("karya_id")
      .primaryKey()
      .references(() => karya.id, { onDelete: "cascade" }),
    rank: integer("rank").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(now)
      .notNull(),
  },
  (table) => [
    // Ordered "Top picked" read.
    index("featured_rank_idx").on(table.rank),
  ],
);

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const assistantConversationsRelations = relations(
  assistantConversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [assistantConversations.userId],
      references: [users.id],
    }),
    messages: many(assistantMessages),
  }),
);

export const assistantMessagesRelations = relations(
  assistantMessages,
  ({ one }) => ({
    conversation: one(assistantConversations, {
      fields: [assistantMessages.conversationId],
      references: [assistantConversations.id],
    }),
  }),
);

export const interestsRelations = relations(interests, ({ many }) => ({
  userInterests: many(userInterests),
  karyaInterests: many(karyaInterests),
}));

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user: one(users, {
    fields: [userInterests.userId],
    references: [users.id],
  }),
  interest: one(interests, {
    fields: [userInterests.interestId],
    references: [interests.id],
  }),
}));

export const karyaRelations = relations(karya, ({ one, many }) => ({
  creator: one(users, {
    fields: [karya.createdBy],
    references: [users.id],
  }),
  members: many(karyaMembers),
  interests: many(karyaInterests),
  posts: many(posts),
  featured: one(featured),
  screenshots: many(karyaScreenshots),
}));

export const karyaScreenshotsRelations = relations(
  karyaScreenshots,
  ({ one }) => ({
    karya: one(karya, {
      fields: [karyaScreenshots.karyaId],
      references: [karya.id],
    }),
  }),
);

export const postsRelations = relations(posts, ({ one }) => ({
  karya: one(karya, {
    fields: [posts.karyaId],
    references: [karya.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const featuredRelations = relations(featured, ({ one }) => ({
  karya: one(karya, {
    fields: [featured.karyaId],
    references: [karya.id],
  }),
}));

export const karyaMembersRelations = relations(karyaMembers, ({ one }) => ({
  karya: one(karya, {
    fields: [karyaMembers.karyaId],
    references: [karya.id],
  }),
  user: one(users, {
    fields: [karyaMembers.userId],
    references: [users.id],
  }),
}));

export const karyaInterestsRelations = relations(karyaInterests, ({ one }) => ({
  karya: one(karya, {
    fields: [karyaInterests.karyaId],
    references: [karya.id],
  }),
  interest: one(interests, {
    fields: [karyaInterests.interestId],
    references: [interests.id],
  }),
}));
