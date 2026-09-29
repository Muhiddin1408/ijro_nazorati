-- Queries now compare timestamp columns directly (no datetime(col) wrapper) so
-- SQLite can use indexes. That requires each column to hold a single format.
-- JS-written instants are normalized to ISO-8601 `YYYY-MM-DDTHH:MM:SS.sssZ`;
-- unparseable values are left untouched.
UPDATE app_notification_jobs SET
  scheduled_at=COALESCE(strftime('%Y-%m-%dT%H:%M:%fZ',scheduled_at),scheduled_at),
  next_attempt_at=COALESCE(strftime('%Y-%m-%dT%H:%M:%fZ',next_attempt_at),next_attempt_at)
WHERE scheduled_at NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]Z'
   OR next_attempt_at NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]Z';
--> statement-breakpoint
UPDATE app_sessions SET expires_at=COALESCE(strftime('%Y-%m-%dT%H:%M:%fZ',expires_at),expires_at)
WHERE expires_at NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]Z';
--> statement-breakpoint
UPDATE app_account_activation_tokens SET expires_at=COALESCE(strftime('%Y-%m-%dT%H:%M:%fZ',expires_at),expires_at)
WHERE expires_at NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]Z';
--> statement-breakpoint
UPDATE app_telegram_link_tokens SET expires_at=COALESCE(strftime('%Y-%m-%dT%H:%M:%fZ',expires_at),expires_at)
WHERE expires_at NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]Z';
--> statement-breakpoint
UPDATE app_user_credentials SET temporary_expires_at=COALESCE(strftime('%Y-%m-%dT%H:%M:%fZ',temporary_expires_at),temporary_expires_at)
WHERE temporary_expires_at IS NOT NULL
  AND temporary_expires_at NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]Z';
--> statement-breakpoint
UPDATE app_tasks SET deadline_iso=COALESCE(strftime('%Y-%m-%dT%H:%M:%fZ',deadline_iso),deadline_iso)
WHERE deadline_iso IS NOT NULL
  AND deadline_iso NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]Z';
--> statement-breakpoint
UPDATE app_meetings SET starts_at=COALESCE(strftime('%Y-%m-%dT%H:%M:%fZ',starts_at),starts_at)
WHERE starts_at NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]Z';
--> statement-breakpoint
UPDATE app_report_cycles SET deadline_at=COALESCE(strftime('%Y-%m-%dT%H:%M:%fZ',deadline_at),deadline_at)
WHERE deadline_at NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]Z';
--> statement-breakpoint

-- Hot-path indexes.
CREATE INDEX IF NOT EXISTS `app_audit_logs_actor_created_idx` ON `app_audit_logs` (`actor_employee_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_task_assignments_parent_idx` ON `app_task_assignments` (`parent_assignment_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_information_records_organization_idx` ON `app_information_records` (`organization_id`,`created_at`);
--> statement-breakpoint
-- Record ids are random 48-bit values: recency must come from created_at.
CREATE INDEX IF NOT EXISTS `app_information_records_created_idx` ON `app_information_records` (`created_at`,`id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_employees_email_lower_idx` ON `app_employees` (lower(`email`));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_report_cycles_template_deadline_idx` ON `app_report_cycles` (`template_id`,`deadline_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_notification_jobs_waiting_created_idx` ON `app_notification_jobs` (`status`,`created_at`);
--> statement-breakpoint

-- One active occupancy per employee and position. A position may be shared by
-- several employees (headcount_units / fte_rate), so the rule is per pair. The
-- old (staff_position_id, employee_id, ends_at) index never applied to active
-- rows because NULLs are distinct in SQLite. Close duplicates before enforcing.
UPDATE app_position_occupancies SET ends_at=CURRENT_TIMESTAMP
WHERE ends_at IS NULL AND EXISTS (
  SELECT 1 FROM app_position_occupancies earlier
   WHERE earlier.staff_position_id=app_position_occupancies.staff_position_id
     AND earlier.employee_id=app_position_occupancies.employee_id
     AND earlier.ends_at IS NULL AND earlier.id<app_position_occupancies.id
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_position_occupancies_one_active_idx`
  ON `app_position_occupancies` (`staff_position_id`,`employee_id`) WHERE `ends_at` IS NULL;
