-- 1. Audit log is append-only. Only the daily retention job may delete rows,
--    and only rows older than one year, while it holds the maintenance lock.
CREATE TABLE IF NOT EXISTS `app_maintenance_lock` (
  `id` integer PRIMARY KEY NOT NULL CHECK (`id` = 1),
  `reason` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `app_audit_logs_no_update`
BEFORE UPDATE ON `app_audit_logs`
BEGIN
  SELECT RAISE(ABORT, 'Audit jurnali yozuvlarini o‘zgartirib bo‘lmaydi');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `app_audit_logs_retention_only_delete`
BEFORE DELETE ON `app_audit_logs`
WHEN NOT EXISTS (SELECT 1 FROM `app_maintenance_lock` WHERE `id` = 1 AND `reason` = 'audit_retention')
  OR julianday(OLD.`created_at`) > julianday('now', '-365 days')
BEGIN
  SELECT RAISE(ABORT, 'Audit jurnali yozuvlarini o‘chirib bo‘lmaydi');
END;
--> statement-breakpoint
-- 2. Value guards (SQLite cannot add CHECK constraints to existing tables).
--    Sets include legacy values written by earlier releases so existing rows stay editable.
CREATE TRIGGER IF NOT EXISTS `app_tasks_values_insert`
BEFORE INSERT ON `app_tasks`
WHEN NEW.`progress` NOT BETWEEN 0 AND 100
  OR NEW.`status` NOT IN ('Jarayonda', 'Davomiy', 'Ko‘rib chiqilmoqda', 'Bajarildi', 'Kechikkan')
  OR NEW.`priority` NOT IN ('Yuqori', 'O‘rta', 'Oddiy', 'Past')
BEGIN
  SELECT RAISE(ABORT, 'Topshiriq holati, ustuvorligi yoki bajarilish foizi noto‘g‘ri');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `app_tasks_values_update`
BEFORE UPDATE OF `progress`, `status`, `priority` ON `app_tasks`
WHEN NEW.`progress` NOT BETWEEN 0 AND 100
  OR NEW.`status` NOT IN ('Jarayonda', 'Davomiy', 'Ko‘rib chiqilmoqda', 'Bajarildi', 'Kechikkan')
  OR NEW.`priority` NOT IN ('Yuqori', 'O‘rta', 'Oddiy', 'Past')
BEGIN
  SELECT RAISE(ABORT, 'Topshiriq holati, ustuvorligi yoki bajarilish foizi noto‘g‘ri');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `app_task_assignments_values_insert`
BEFORE INSERT ON `app_task_assignments`
WHEN NEW.`progress` NOT BETWEEN 0 AND 100
  OR NEW.`assignment_status` NOT IN ('Faol', 'Jarayonda', 'Ko‘rib chiqilmoqda', 'Qabul qilindi', 'Qaytarildi', 'Yo‘naltirildi', 'Bajarildi', 'Kechikkan', 'Davomiy')
BEGIN
  SELECT RAISE(ABORT, 'Ijrochi holati yoki bajarilish foizi noto‘g‘ri');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `app_task_assignments_values_update`
BEFORE UPDATE OF `progress`, `assignment_status` ON `app_task_assignments`
WHEN NEW.`progress` NOT BETWEEN 0 AND 100
  OR NEW.`assignment_status` NOT IN ('Faol', 'Jarayonda', 'Ko‘rib chiqilmoqda', 'Qabul qilindi', 'Qaytarildi', 'Yo‘naltirildi', 'Bajarildi', 'Kechikkan', 'Davomiy')
BEGIN
  SELECT RAISE(ABORT, 'Ijrochi holati yoki bajarilish foizi noto‘g‘ri');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `app_report_assignments_status_insert`
BEFORE INSERT ON `app_report_assignments`
WHEN NEW.`status` NOT IN ('new', 'draft', 'collecting', 'submitted', 'returned', 'approved', 'cancelled')
BEGIN
  SELECT RAISE(ABORT, 'Hisobot holati noto‘g‘ri');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `app_report_assignments_status_update`
BEFORE UPDATE OF `status` ON `app_report_assignments`
WHEN NEW.`status` NOT IN ('new', 'draft', 'collecting', 'submitted', 'returned', 'approved', 'cancelled')
BEGIN
  SELECT RAISE(ABORT, 'Hisobot holati noto‘g‘ri');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `app_information_records_values_insert`
BEFORE INSERT ON `app_information_records`
WHEN NEW.`status` NOT IN ('draft', 'submitted', 'returned', 'rejected', 'approved', 'published', 'archived')
  OR NEW.`priority` NOT IN ('low', 'normal', 'high', 'critical')
BEGIN
  SELECT RAISE(ABORT, 'Ma’lumot yozuvi holati yoki ustuvorligi noto‘g‘ri');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `app_information_records_values_update`
BEFORE UPDATE OF `status`, `priority` ON `app_information_records`
WHEN NEW.`status` NOT IN ('draft', 'submitted', 'returned', 'rejected', 'approved', 'published', 'archived')
  OR NEW.`priority` NOT IN ('low', 'normal', 'high', 'critical')
BEGIN
  SELECT RAISE(ABORT, 'Ma’lumot yozuvi holati yoki ustuvorligi noto‘g‘ri');
END;
--> statement-breakpoint
-- 3. Chat upload expiries are compared as ISO text; normalize legacy SQLite-format values.
UPDATE `app_chat_upload_sessions`
SET `expires_at` = COALESCE(strftime('%Y-%m-%dT%H:%M:%fZ', `expires_at`), `expires_at`)
WHERE `expires_at` NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]Z'
  AND length(`expires_at`) > 10;
--> statement-breakpoint
-- 4. An employee is never their own manager (indirect cycles are rejected in services/employees.ts;
--    SQLite triggers cannot run recursive queries).
CREATE TRIGGER IF NOT EXISTS `app_employees_not_own_manager_insert`
BEFORE INSERT ON `app_employees`
WHEN NEW.`manager_id` IS NOT NULL AND NEW.`manager_id` = NEW.`id`
BEGIN
  SELECT RAISE(ABORT, 'Xodim o‘ziga rahbar bo‘la olmaydi');
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `app_employees_not_own_manager_update`
BEFORE UPDATE OF `manager_id` ON `app_employees`
WHEN NEW.`manager_id` IS NOT NULL AND NEW.`manager_id` = NEW.`id`
BEGIN
  SELECT RAISE(ABORT, 'Xodim o‘ziga rahbar bo‘la olmaydi');
END;
