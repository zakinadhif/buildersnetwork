CREATE TABLE `karya_screenshots` (
	`id` text PRIMARY KEY NOT NULL,
	`karya_id` text NOT NULL,
	`key` text NOT NULL,
	`orientation` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`karya_id`) REFERENCES `karya`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `karya_screenshots_karyaId_idx` ON `karya_screenshots` (`karya_id`);