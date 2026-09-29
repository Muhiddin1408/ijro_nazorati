CREATE TABLE `attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text,
	`size` integer DEFAULT 0 NOT NULL,
	`uploaded_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`parent_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`role` text NOT NULL,
	`department_id` integer,
	`manager_id` integer,
	`telegram_chat_id` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`meeting_date` text NOT NULL,
	`meeting_time` text NOT NULL,
	`place` text NOT NULL,
	`format` text DEFAULT 'Oflayn' NOT NULL,
	`participants_json` text DEFAULT '[]' NOT NULL,
	`reminder` text DEFAULT '30 daqiqa oldin' NOT NULL,
	`notify_telegram` integer DEFAULT true NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminder_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reminder_key` text NOT NULL,
	`channel` text DEFAULT 'telegram' NOT NULL,
	`status` text NOT NULL,
	`detail` text,
	`sent_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`assignees_json` text DEFAULT '[]' NOT NULL,
	`deadline` text NOT NULL,
	`deadline_iso` text,
	`priority` text DEFAULT 'O‘rta' NOT NULL,
	`status` text DEFAULT 'Jarayonda' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`recurring` integer DEFAULT false NOT NULL,
	`recurrence` text,
	`pinned` integer DEFAULT false NOT NULL,
	`created_by` text,
	`notify_telegram` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
