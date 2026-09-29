CREATE TABLE `app_user_credentials` (
  `employee_id` integer PRIMARY KEY NOT NULL,
  `username` text NOT NULL,
  `username_normalized` text NOT NULL,
  `password_hash` text NOT NULL,
  `password_salt` text NOT NULL,
  `password_iterations` integer DEFAULT 100000 NOT NULL,
  `must_change_password` integer DEFAULT true NOT NULL,
  `failed_attempts` integer DEFAULT 0 NOT NULL,
  `locked_until` text,
  `password_updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_user_credentials_username_unique` ON `app_user_credentials` (`username_normalized`);
--> statement-breakpoint
CREATE TABLE `app_sessions` (
  `token_hash` text PRIMARY KEY NOT NULL,
  `employee_id` integer NOT NULL,
  `expires_at` text NOT NULL,
  `last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_sessions_employee_idx` ON `app_sessions` (`employee_id`);
--> statement-breakpoint
CREATE INDEX `app_sessions_expiry_idx` ON `app_sessions` (`expires_at`);
--> statement-breakpoint
CREATE TABLE `app_task_topics` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `color` text DEFAULT '#1957D2' NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `created_by_employee_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_task_topics_name_unique` ON `app_task_topics` (`name`);
--> statement-breakpoint
ALTER TABLE `app_tasks` ADD `topic_id` integer;
--> statement-breakpoint
CREATE INDEX `app_tasks_topic_idx` ON `app_tasks` (`topic_id`);
--> statement-breakpoint
INSERT OR IGNORE INTO `app_task_topics` (`name`,`description`,`color`) VALUES
  ('Kabinetda berilgan topshiriqlar','Rahbar kabinetida bevosita berilgan topshiriqlar','#1957D2'),
  ('Apparat yig‘ilishida berilgan topshiriqlar','Apparat yig‘ilishlari bayonnomasidan kelib chiqqan topshiriqlar','#6D5BD0');
--> statement-breakpoint
CREATE TABLE `app_chat_channels` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `type` text DEFAULT 'group' NOT NULL,
  `department_id` integer,
  `direct_key` text,
  `created_by_employee_id` integer,
  `active` integer DEFAULT true NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_chat_channels_direct_unique` ON `app_chat_channels` (`direct_key`);
--> statement-breakpoint
CREATE INDEX `app_chat_channels_department_idx` ON `app_chat_channels` (`department_id`);
--> statement-breakpoint
CREATE TABLE `app_chat_members` (
  `channel_id` integer NOT NULL,
  `employee_id` integer NOT NULL,
  `last_read_message_id` integer,
  `joined_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_chat_members_unique` ON `app_chat_members` (`channel_id`,`employee_id`);
--> statement-breakpoint
CREATE INDEX `app_chat_members_employee_idx` ON `app_chat_members` (`employee_id`);
--> statement-breakpoint
CREATE TABLE `app_chat_messages` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `channel_id` integer NOT NULL,
  `sender_employee_id` integer NOT NULL,
  `message_type` text DEFAULT 'text' NOT NULL,
  `body` text DEFAULT '' NOT NULL,
  `reply_to_message_id` integer,
  `edited_at` text,
  `deleted_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_chat_messages_channel_idx` ON `app_chat_messages` (`channel_id`,`id`);
--> statement-breakpoint
CREATE TABLE `app_chat_attachments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `message_id` integer NOT NULL,
  `object_key` text NOT NULL,
  `file_name` text NOT NULL,
  `content_type` text,
  `size` integer DEFAULT 0 NOT NULL,
  `uploaded_by_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_chat_attachments_object_unique` ON `app_chat_attachments` (`object_key`);
--> statement-breakpoint
CREATE INDEX `app_chat_attachments_message_idx` ON `app_chat_attachments` (`message_id`);
--> statement-breakpoint
INSERT INTO `app_chat_channels` (`name`,`type`) VALUES ('Umumiy e’lonlar','broadcast');
