ALTER TABLE `app_organizations` ADD `tax_id` text;
--> statement-breakpoint
ALTER TABLE `app_organizations` ADD `registry_id` integer;
--> statement-breakpoint
ALTER TABLE `app_organizations` ADD `category_code` text;
--> statement-breakpoint
ALTER TABLE `app_organizations` ADD `legal_address` text;
--> statement-breakpoint
ALTER TABLE `app_organizations` ADD `activity` text;
--> statement-breakpoint
ALTER TABLE `app_organizations` ADD `data_status` text DEFAULT 'manual' NOT NULL;
--> statement-breakpoint
ALTER TABLE `app_organizations` ADD `source_name` text;
--> statement-breakpoint
ALTER TABLE `app_organizations` ADD `hierarchy_verified` integer DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_organizations_tax_id_unique` ON `app_organizations` (`tax_id`);
--> statement-breakpoint

CREATE TABLE `app_staff_import_batches` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `file_name` text NOT NULL,
  `checksum` text NOT NULL,
  `status` text DEFAULT 'validated' NOT NULL,
  `imported_organizations` integer DEFAULT 0 NOT NULL,
  `imported_positions` integer DEFAULT 0 NOT NULL,
  `rejected_rows` integer DEFAULT 0 NOT NULL,
  `note` text DEFAULT '' NOT NULL,
  `created_by_employee_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_staff_import_batches_checksum_unique` ON `app_staff_import_batches` (`checksum`);
--> statement-breakpoint

CREATE TABLE `app_staff_positions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `source_row_id` integer,
  `organization_id` integer NOT NULL,
  `department_id` integer,
  `import_batch_id` integer,
  `department_name` text DEFAULT '' NOT NULL,
  `subunit_name` text DEFAULT '' NOT NULL,
  `title` text NOT NULL,
  `employee_category` text,
  `position_status` text,
  `headcount_units` real DEFAULT 1 NOT NULL,
  `fte_rate` real DEFAULT 1 NOT NULL,
  `grade` text,
  `coefficient` real,
  `monthly_fund` real,
  `effective_from` text,
  `document_type` text,
  `source_file` text,
  `source_page` text,
  `data_status` text DEFAULT 'needs_review' NOT NULL,
  `note` text DEFAULT '' NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_staff_positions_source_unique` ON `app_staff_positions` (`import_batch_id`,`source_row_id`);
--> statement-breakpoint
CREATE INDEX `app_staff_positions_org_idx` ON `app_staff_positions` (`organization_id`,`active`);
--> statement-breakpoint
CREATE INDEX `app_staff_positions_department_idx` ON `app_staff_positions` (`department_id`,`active`);
--> statement-breakpoint

CREATE TABLE `app_position_occupancies` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `staff_position_id` integer NOT NULL,
  `employee_id` integer NOT NULL,
  `fte_rate` real DEFAULT 1 NOT NULL,
  `starts_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `ends_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_position_occupancies_active_unique` ON `app_position_occupancies` (`staff_position_id`,`employee_id`,`ends_at`);
--> statement-breakpoint
CREATE INDEX `app_position_occupancies_employee_idx` ON `app_position_occupancies` (`employee_id`,`ends_at`);
--> statement-breakpoint

CREATE TABLE `app_account_activation_tokens` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `token_hash` text NOT NULL,
  `employee_id` integer NOT NULL,
  `expires_at` text NOT NULL,
  `used_at` text,
  `revoked_at` text,
  `created_by_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_account_activation_tokens_hash_unique` ON `app_account_activation_tokens` (`token_hash`);
--> statement-breakpoint
CREATE INDEX `app_account_activation_tokens_employee_idx` ON `app_account_activation_tokens` (`employee_id`,`expires_at`);
--> statement-breakpoint

CREATE TABLE `app_task_audiences` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `task_id` integer NOT NULL,
  `target_type` text NOT NULL,
  `target_id` integer NOT NULL,
  `include_descendants` integer DEFAULT false NOT NULL,
  `created_by_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_task_audiences_unique` ON `app_task_audiences` (`task_id`,`target_type`,`target_id`);
--> statement-breakpoint
CREATE INDEX `app_task_audiences_target_idx` ON `app_task_audiences` (`target_type`,`target_id`);
--> statement-breakpoint

CREATE TABLE `app_meeting_audiences` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `meeting_id` integer NOT NULL,
  `target_type` text NOT NULL,
  `target_id` integer NOT NULL,
  `include_descendants` integer DEFAULT false NOT NULL,
  `created_by_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_meeting_audiences_unique` ON `app_meeting_audiences` (`meeting_id`,`target_type`,`target_id`);
--> statement-breakpoint
CREATE INDEX `app_meeting_audiences_target_idx` ON `app_meeting_audiences` (`target_type`,`target_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_meeting_participants_employee_idx` ON `app_meeting_participants` (`employee_id`,`meeting_id`);
