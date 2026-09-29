-- Chat read markers are stored apart from membership (audit Y7): a read marker
-- in a department or broadcast channel must never grant access after the
-- employee moves to another department.
CREATE TABLE IF NOT EXISTS `app_chat_read_state` (
  `channel_id` integer NOT NULL,
  `employee_id` integer NOT NULL,
  `last_read_message_id` integer DEFAULT 0 NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`channel_id`, `employee_id`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_chat_read_state_employee_idx` ON `app_chat_read_state` (`employee_id`);
--> statement-breakpoint
INSERT OR IGNORE INTO app_chat_read_state (channel_id,employee_id,last_read_message_id)
SELECT channel_id,employee_id,last_read_message_id FROM app_chat_members
 WHERE last_read_message_id IS NOT NULL;
--> statement-breakpoint
-- Department and broadcast channels have no explicit members; the old rows were
-- only read markers and are removed so they stop granting access.
DELETE FROM app_chat_members
 WHERE channel_id IN (SELECT id FROM app_chat_channels WHERE type IN ('department','broadcast'));
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `app_chat_members_explicit_only`
BEFORE INSERT ON `app_chat_members`
WHEN (SELECT type FROM app_chat_channels WHERE id=NEW.channel_id) IN ('department','broadcast')
BEGIN
  SELECT RAISE(IGNORE);
END;
--> statement-breakpoint
-- Per-sender rate limit lookups (audit Y6).
CREATE INDEX IF NOT EXISTS `app_chat_messages_sender_created_idx` ON `app_chat_messages` (`sender_employee_id`,`created_at`);
