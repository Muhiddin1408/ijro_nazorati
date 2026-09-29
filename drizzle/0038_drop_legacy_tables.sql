-- The first prototype's tables (0000) were superseded by the app_* tables in
-- 0001 and are never read or written by the application. Drop them so they
-- no longer mislead readers or consume space. Children are dropped first.
DROP TABLE IF EXISTS `reminder_logs`;
--> statement-breakpoint
DROP TABLE IF EXISTS `attachments`;
--> statement-breakpoint
DROP TABLE IF EXISTS `meetings`;
--> statement-breakpoint
DROP TABLE IF EXISTS `tasks`;
--> statement-breakpoint
DROP TABLE IF EXISTS `employees`;
--> statement-breakpoint
DROP TABLE IF EXISTS `departments`;
