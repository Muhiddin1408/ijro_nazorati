-- Atomic task creation: related rows reference the new task by a one-time key
-- inside the same transaction instead of a follow-up batch with manual rollback.
ALTER TABLE `app_tasks` ADD `creation_key` text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_tasks_creation_key_unique` ON `app_tasks` (`creation_key`) WHERE `creation_key` IS NOT NULL;
--> statement-breakpoint
-- Server-side pagination: active tasks first, then by deadline.
CREATE INDEX IF NOT EXISTS `app_tasks_archived_status_deadline_idx` ON `app_tasks` (`archived`,`status`,`deadline_iso`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_meetings_starts_at_idx` ON `app_meetings` (`starts_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_audit_logs_created_at_idx` ON `app_audit_logs` (`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_audit_logs_actor_idx` ON `app_audit_logs` (`actor_employee_id`);
--> statement-breakpoint
ALTER TABLE `app_meetings` ADD `creation_key` text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_meetings_creation_key_unique` ON `app_meetings` (`creation_key`) WHERE `creation_key` IS NOT NULL;
