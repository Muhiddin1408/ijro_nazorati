-- Persist per-account Telegram quiet hours on the linked Telegram row.
ALTER TABLE `app_telegram_accounts` ADD `quiet_hours_enabled` integer DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE `app_telegram_accounts` ADD `quiet_hours_start` text DEFAULT '22:00' NOT NULL;
--> statement-breakpoint
ALTER TABLE `app_telegram_accounts` ADD `quiet_hours_end` text DEFAULT '07:00' NOT NULL;
