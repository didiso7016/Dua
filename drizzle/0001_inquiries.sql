CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`message` text NOT NULL,
	`source_page` text DEFAULT '' NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` text NOT NULL,
	`sheet_status` text DEFAULT 'pending' NOT NULL,
	`sheet_attempts` integer DEFAULT 0 NOT NULL,
	`sheet_lease` integer DEFAULT 0 NOT NULL,
	`sheet_attempt_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_inquiries_created` ON `inquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_inquiries_type` ON `inquiries` (`type`);--> statement-breakpoint
CREATE INDEX `idx_inquiries_sheet` ON `inquiries` (`sheet_status`);
