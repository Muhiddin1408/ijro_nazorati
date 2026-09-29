-- Telegram queue hygiene and AI budget (audit Y12, Y14).
-- 1. Jobs for employees without a linked Telegram account no longer wait forever.
UPDATE app_notification_jobs SET status='cancelled', last_error='Telegram ulanmagan: muddati tugadi'
 WHERE status IN ('waiting_link','pending','failed')
   AND NOT EXISTS (
     SELECT 1 FROM app_telegram_accounts ta
      WHERE ta.employee_id=app_notification_jobs.recipient_employee_id
        AND ta.blocked_at IS NULL AND ta.notifications_enabled=1
   )
   AND datetime(created_at) <= datetime('now','-24 hours');
--> statement-breakpoint
-- 2. Queued chat notifications may still carry message bodies; drop them.
UPDATE app_notification_jobs SET status='cancelled', last_error='Maxfiylik: eski formatdagi chat xabari'
 WHERE kind='chat_message' AND status IN ('waiting_link','pending','failed','processing');
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_notification_jobs_entity_idx` ON `app_notification_jobs` (`entity_type`,`entity_id`,`recipient_employee_id`);
--> statement-breakpoint
-- 3. Global daily budget for outbound AI requests, reserved atomically.
CREATE TABLE IF NOT EXISTS `app_ai_daily_usage` (
  `day` text PRIMARY KEY NOT NULL,
  `requests` integer DEFAULT 0 NOT NULL
);
