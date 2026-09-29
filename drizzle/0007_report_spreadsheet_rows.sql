ALTER TABLE `app_report_assignments` ADD COLUMN `row_count` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE TABLE `app_report_data_rows` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `assignment_id` integer NOT NULL,
  `row_order` integer NOT NULL,
  `values_json` text DEFAULT '{}' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_report_data_rows_assignment_order_unique` ON `app_report_data_rows` (`assignment_id`,`row_order`);
--> statement-breakpoint
CREATE INDEX `app_report_data_rows_assignment_idx` ON `app_report_data_rows` (`assignment_id`,`row_order`);
