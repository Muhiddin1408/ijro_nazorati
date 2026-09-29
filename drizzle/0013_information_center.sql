CREATE TABLE `app_information_domains` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `code` text NOT NULL,
  `name` text NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `owner_department_id` integer,
  `color` text DEFAULT '#1957D2' NOT NULL,
  `icon` text DEFAULT 'database' NOT NULL,
  `sort_order` integer DEFAULT 100 NOT NULL,
  `visibility` text DEFAULT 'internal' NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_information_domains_code_unique` ON `app_information_domains` (`code`);
--> statement-breakpoint
CREATE INDEX `app_information_domains_owner_idx` ON `app_information_domains` (`owner_department_id`,`active`);
--> statement-breakpoint
CREATE INDEX `app_information_domains_sort_idx` ON `app_information_domains` (`active`,`sort_order`);
--> statement-breakpoint

CREATE TABLE `app_information_templates` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `domain_id` integer NOT NULL,
  `code` text NOT NULL,
  `name` text NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `record_type` text DEFAULT 'record' NOT NULL,
  `cadence` text DEFAULT 'event' NOT NULL,
  `status_set` text DEFAULT 'ACTION' NOT NULL,
  `drill_profile` text DEFAULT 'D_PROJECT' NOT NULL,
  `source_mode` text DEFAULT 'manual' NOT NULL,
  `source_system_code` text,
  `freshness_sla_hours` integer DEFAULT 720 NOT NULL,
  `visibility` text DEFAULT 'internal' NOT NULL,
  `fields_json` text DEFAULT '[]' NOT NULL,
  `indicators_json` text DEFAULT '[]' NOT NULL,
  `dimensions_json` text DEFAULT '[]' NOT NULL,
  `version` integer DEFAULT 1 NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_information_templates_code_unique` ON `app_information_templates` (`code`);
--> statement-breakpoint
CREATE INDEX `app_information_templates_domain_idx` ON `app_information_templates` (`domain_id`,`active`);
--> statement-breakpoint
CREATE INDEX `app_information_templates_source_idx` ON `app_information_templates` (`source_mode`,`active`);
--> statement-breakpoint

CREATE TABLE `app_information_records` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `template_id` integer NOT NULL,
  `organization_id` integer,
  `department_id` integer,
  `title` text NOT NULL,
  `period_start` text,
  `period_end` text,
  `status` text DEFAULT 'draft' NOT NULL,
  `priority` text DEFAULT 'normal' NOT NULL,
  `source_mode` text DEFAULT 'manual' NOT NULL,
  `source_record_key` text,
  `values_json` text DEFAULT '{}' NOT NULL,
  `completeness_score` integer DEFAULT 0 NOT NULL,
  `is_demo` integer DEFAULT false NOT NULL,
  `created_by_employee_id` integer NOT NULL,
  `updated_by_employee_id` integer NOT NULL,
  `submitted_at` text,
  `reviewed_by_employee_id` integer,
  `reviewed_at` text,
  `published_at` text,
  `comment` text DEFAULT '' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_information_records_source_unique` ON `app_information_records` (`template_id`,`source_mode`,`source_record_key`);
--> statement-breakpoint
CREATE INDEX `app_information_records_template_idx` ON `app_information_records` (`template_id`,`status`,`id`);
--> statement-breakpoint
CREATE INDEX `app_information_records_department_idx` ON `app_information_records` (`department_id`,`status`,`id`);
--> statement-breakpoint
CREATE INDEX `app_information_records_period_idx` ON `app_information_records` (`period_start`,`period_end`);
--> statement-breakpoint
CREATE INDEX `app_information_records_creator_idx` ON `app_information_records` (`created_by_employee_id`,`id`);
--> statement-breakpoint

CREATE TABLE `app_information_record_history` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `record_id` integer NOT NULL,
  `version` integer NOT NULL,
  `action` text NOT NULL,
  `status` text NOT NULL,
  `snapshot_json` text DEFAULT '{}' NOT NULL,
  `actor_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_information_record_history_version_unique` ON `app_information_record_history` (`record_id`,`version`);
--> statement-breakpoint
CREATE INDEX `app_information_record_history_record_idx` ON `app_information_record_history` (`record_id`,`created_at`);
--> statement-breakpoint

CREATE TABLE `app_information_values` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `record_id` integer NOT NULL,
  `field_code` text NOT NULL,
  `value_type` text NOT NULL,
  `value_text` text,
  `value_number` real,
  `value_date` text,
  `value_boolean` integer,
  `unit` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_information_values_record_field_unique` ON `app_information_values` (`record_id`,`field_code`);
--> statement-breakpoint
CREATE INDEX `app_information_values_number_idx` ON `app_information_values` (`field_code`,`value_number`);
--> statement-breakpoint
CREATE INDEX `app_information_values_date_idx` ON `app_information_values` (`field_code`,`value_date`);
--> statement-breakpoint

CREATE TABLE `app_information_members` (
  `domain_id` integer NOT NULL,
  `employee_id` integer NOT NULL,
  `member_role` text DEFAULT 'editor' NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `created_by_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_information_members_unique` ON `app_information_members` (`domain_id`,`employee_id`);
--> statement-breakpoint
CREATE INDEX `app_information_members_employee_idx` ON `app_information_members` (`employee_id`,`active`);
--> statement-breakpoint

CREATE TABLE `app_information_participants` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `record_id` integer NOT NULL,
  `participant_type` text DEFAULT 'external' NOT NULL,
  `employee_id` integer,
  `full_name` text NOT NULL,
  `organization` text DEFAULT '' NOT NULL,
  `position` text DEFAULT '' NOT NULL,
  `country_code` text,
  `contact` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_information_participants_record_idx` ON `app_information_participants` (`record_id`,`id`);
--> statement-breakpoint

CREATE TABLE `app_information_actions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `record_id` integer NOT NULL,
  `title` text NOT NULL,
  `owner_employee_id` integer,
  `owner_name` text DEFAULT '' NOT NULL,
  `deadline_at` text,
  `status` text DEFAULT 'open' NOT NULL,
  `linked_task_id` integer,
  `completed_at` text,
  `created_by_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_information_actions_record_idx` ON `app_information_actions` (`record_id`,`status`);
--> statement-breakpoint
CREATE INDEX `app_information_actions_deadline_idx` ON `app_information_actions` (`status`,`deadline_at`);
--> statement-breakpoint

CREATE TABLE `app_information_files` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `record_id` integer NOT NULL,
  `object_key` text NOT NULL,
  `file_name` text NOT NULL,
  `content_type` text,
  `size` integer DEFAULT 0 NOT NULL,
  `uploaded_by_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_information_files_object_unique` ON `app_information_files` (`object_key`);
--> statement-breakpoint
CREATE INDEX `app_information_files_record_idx` ON `app_information_files` (`record_id`,`id`);
--> statement-breakpoint

UPDATE `app_roles`
SET `permissions_json`=json_set(`permissions_json`,'$.canManageInformation',1,'$.canViewRestrictedInformation',1)
WHERE `code` IN ('admin','rahbar');
