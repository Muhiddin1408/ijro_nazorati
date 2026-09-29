CREATE INDEX `app_employees_active_idx` ON `app_employees` (`active`,`id`);
--> statement-breakpoint
CREATE INDEX `app_employees_role_idx` ON `app_employees` (`role_id`,`active`);
--> statement-breakpoint
CREATE INDEX `app_tasks_active_deadline_idx` ON `app_tasks` (`archived`,`deadline_iso`);
--> statement-breakpoint
CREATE INDEX `app_task_assignment_employee_task_idx` ON `app_task_assignments` (`employee_id`,`task_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_chat_channels_department_unique` ON `app_chat_channels` (`department_id`);
--> statement-breakpoint
CREATE TABLE `app_integration_connectors` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `code` text NOT NULL,
  `name` text NOT NULL,
  `category` text DEFAULT 'external' NOT NULL,
  `status` text DEFAULT 'planned' NOT NULL,
  `base_url` text,
  `auth_type` text,
  `settings_json` text DEFAULT '{}' NOT NULL,
  `enabled` integer DEFAULT false NOT NULL,
  `last_sync_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_integration_connectors_code_unique` ON `app_integration_connectors` (`code`);
--> statement-breakpoint
CREATE INDEX `app_integration_connectors_status_idx` ON `app_integration_connectors` (`status`,`enabled`);
--> statement-breakpoint
CREATE TABLE `app_integration_events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `connector_id` integer NOT NULL,
  `direction` text NOT NULL,
  `event_type` text NOT NULL,
  `external_id` text,
  `payload_json` text DEFAULT '{}' NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `attempts` integer DEFAULT 0 NOT NULL,
  `next_attempt_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `processed_at` text,
  `last_error` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_integration_events_external_unique`
  ON `app_integration_events` (`connector_id`,`external_id`,`event_type`);
--> statement-breakpoint
CREATE INDEX `app_integration_events_queue_idx` ON `app_integration_events` (`status`,`next_attempt_at`);
--> statement-breakpoint
CREATE INDEX `app_integration_events_connector_idx` ON `app_integration_events` (`connector_id`,`created_at`);
--> statement-breakpoint
INSERT OR IGNORE INTO `app_integration_connectors` (`code`,`name`,`category`,`status`) VALUES
  ('skud','СКУД','internal','planned'),
  ('road-management','Йўллар бошқаруви','internal','planned'),
  ('fleet','Транспорт воситаларини бошқариш','internal','planned'),
  ('gps','GPS мониторинг','internal','planned'),
  ('road-assets','Йўл активлари','internal','planned'),
  ('tax','Солиқ ахборот тизими','government','planned'),
  ('ijro-gov','ijro.gov.uz','government','planned');
