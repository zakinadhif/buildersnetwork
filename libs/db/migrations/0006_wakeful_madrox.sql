CREATE TABLE "featured" (
	"karya_id" text PRIMARY KEY NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"karya_id" text NOT NULL,
	"author_id" text NOT NULL,
	"kind" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "featured" ADD CONSTRAINT "featured_karya_id_karya_id_fk" FOREIGN KEY ("karya_id") REFERENCES "public"."karya"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_karya_id_karya_id_fk" FOREIGN KEY ("karya_id") REFERENCES "public"."karya"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "featured_rank_idx" ON "featured" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "posts_karyaId_idx" ON "posts" USING btree ("karya_id");--> statement-breakpoint
CREATE INDEX "posts_createdAt_idx" ON "posts" USING btree ("created_at");