import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { KaryaStage } from "../karya";
import { users } from "./auth";

export const profiles = pgTable("profiles", {
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
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// The shared interest vocabulary (FR-14/FR-15). One row per distinct interest,
// deduped by `slug`. `curated` marks rows from the starter list vs free-text
// additions reconciled in on save. Both members (this sprint) and karya
// (Sprint 2's `karya_interests`) tag against this same table.
export const interests = pgTable("interests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  curated: boolean("curated").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Join table linking members to interests (FR-14).
export const userInterests = pgTable(
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
// as a jsonb string array like `profiles.skills` (DECISION-B), not a join.
export const karya = pgTable(
  "karya",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    stages: jsonb("stages").$type<KaryaStage[]>().notNull().default(["idea"]),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("karya_createdBy_idx").on(table.createdBy),
    // Reverse-chron listing (FR-22 forward-look).
    index("karya_createdAt_idx").on(table.createdAt),
  ],
);

// Contributor roster + join requests (FR-12). The creator is one row with
// `role: "owner", status: "member"` (DECISION-G); join requests are
// `role: "member", status: "pending"` until the owner approves.
export const karyaMembers = pgTable(
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.karyaId, table.userId] }),
    // "My karya" reverse lookup.
    index("karya_members_userId_idx").on(table.userId),
  ],
);

// Karya interest tags — a join into the *same* shared `interests` catalog used
// by `user_interests` (DECISION-C). One vocabulary, deduped by slug.
export const karyaInterests = pgTable(
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

export const matches = pgTable(
  "matches",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    matchedUserId: text("matched_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("matches_userId_idx").on(table.userId)],
);

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

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

export const matchesRelations = relations(matches, ({ one }) => ({
  user: one(users, {
    fields: [matches.userId],
    references: [users.id],
    relationName: "userMatches",
  }),
  matchedUser: one(users, {
    fields: [matches.matchedUserId],
    references: [users.id],
    relationName: "receivedMatches",
  }),
}));
