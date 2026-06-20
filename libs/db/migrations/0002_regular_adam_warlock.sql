-- Sprint 0a — profile model EXPAND (additive, non-breaking).
-- Adds handle/bio/interests and relaxes the old fields to nullable. Backfills
-- handle + bio so existing rows aren't blank, then adds the unique constraint
-- (after backfill, so de-duped handles can't trip it).

ALTER TABLE "profiles" ALTER COLUMN "building" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "wants" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "vibe" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "handle" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "interests" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
-- Backfill handle from the email local-part, de-duplicating collisions with a
-- numeric suffix (rn=1 keeps the bare local-part).
WITH ranked AS (
  SELECT
    pr."user_id" AS uid,
    lower(split_part(u."email", '@', 1)) AS base,
    row_number() OVER (
      PARTITION BY lower(split_part(u."email", '@', 1))
      ORDER BY pr."created_at", pr."user_id"
    ) AS rn
  FROM "profiles" pr
  JOIN "users" u ON u."id" = pr."user_id"
)
UPDATE "profiles" p
SET "handle" = ranked.base || CASE WHEN ranked.rn > 1 THEN ranked.rn::text ELSE '' END
FROM ranked
WHERE p."user_id" = ranked.uid AND p."handle" IS NULL;--> statement-breakpoint
-- Seed bio from the old "building" field so existing rows render non-blank.
UPDATE "profiles"
SET "bio" = NULLIF(btrim(coalesce("building", '')), '')
WHERE "bio" IS NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_handle_unique" UNIQUE("handle");
