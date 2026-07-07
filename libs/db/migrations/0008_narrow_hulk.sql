CREATE TABLE "karya_screenshots" (
	"id" text PRIMARY KEY NOT NULL,
	"karya_id" text NOT NULL,
	"key" text NOT NULL,
	"orientation" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "karya_screenshots" ADD CONSTRAINT "karya_screenshots_karya_id_karya_id_fk" FOREIGN KEY ("karya_id") REFERENCES "public"."karya"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "karya_screenshots_karyaId_idx" ON "karya_screenshots" USING btree ("karya_id");