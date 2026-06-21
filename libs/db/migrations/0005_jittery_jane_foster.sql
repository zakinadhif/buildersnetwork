CREATE TABLE "karya" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"stages" jsonb DEFAULT '["idea"]'::jsonb NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "karya_interests" (
	"karya_id" text NOT NULL,
	"interest_id" text NOT NULL,
	CONSTRAINT "karya_interests_karya_id_interest_id_pk" PRIMARY KEY("karya_id","interest_id")
);
--> statement-breakpoint
CREATE TABLE "karya_members" (
	"karya_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "karya_members_karya_id_user_id_pk" PRIMARY KEY("karya_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "karya" ADD CONSTRAINT "karya_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "karya_interests" ADD CONSTRAINT "karya_interests_karya_id_karya_id_fk" FOREIGN KEY ("karya_id") REFERENCES "public"."karya"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "karya_interests" ADD CONSTRAINT "karya_interests_interest_id_interests_id_fk" FOREIGN KEY ("interest_id") REFERENCES "public"."interests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "karya_members" ADD CONSTRAINT "karya_members_karya_id_karya_id_fk" FOREIGN KEY ("karya_id") REFERENCES "public"."karya"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "karya_members" ADD CONSTRAINT "karya_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "karya_createdBy_idx" ON "karya" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "karya_createdAt_idx" ON "karya" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "karya_interests_interestId_idx" ON "karya_interests" USING btree ("interest_id");--> statement-breakpoint
CREATE INDEX "karya_members_userId_idx" ON "karya_members" USING btree ("user_id");