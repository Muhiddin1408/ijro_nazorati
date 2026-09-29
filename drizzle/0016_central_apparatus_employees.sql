-- Central apparatus employee directory: schema only.
-- Employee rows (personal data) are loaded from an untracked private seed, see private-seed/README.md.
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `app_employee_import_batches` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `file_name` text NOT NULL,
  `sheet_name` text NOT NULL,
  `checksum` text NOT NULL,
  `status` text DEFAULT 'validated' NOT NULL,
  `imported_employees` integer DEFAULT 0 NOT NULL,
  `missing_mobile` integer DEFAULT 0 NOT NULL,
  `missing_extension` integer DEFAULT 0 NOT NULL,
  `note` text DEFAULT '' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_employee_import_batches_checksum_unique` ON `app_employee_import_batches` (`checksum`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `app_employee_profiles` (
  `employee_id` integer PRIMARY KEY NOT NULL,
  `import_batch_id` integer,
  `source_employee_number` integer,
  `full_name_cyrillic` text,
  `birth_date` text,
  `internal_extension` text,
  `mobile_phone` text,
  `source_row` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_employee_profiles_source_unique` ON `app_employee_profiles` (`import_batch_id`,`source_employee_number`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_employee_profiles_phone_idx` ON `app_employee_profiles` (`mobile_phone`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_employee_profiles_extension_idx` ON `app_employee_profiles` (`internal_extension`);
