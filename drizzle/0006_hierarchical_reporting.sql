CREATE TABLE `app_organizations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `short_name` text DEFAULT '' NOT NULL,
  `type` text NOT NULL,
  `parent_id` integer,
  `region_code` text,
  `active` integer DEFAULT true NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_organizations_name_unique` ON `app_organizations` (`name`);
--> statement-breakpoint
CREATE INDEX `app_organizations_parent_idx` ON `app_organizations` (`parent_id`,`active`);
--> statement-breakpoint
CREATE INDEX `app_organizations_type_idx` ON `app_organizations` (`type`,`active`);
--> statement-breakpoint
ALTER TABLE `app_employees` ADD `organization_id` integer;
--> statement-breakpoint
CREATE INDEX `app_employees_organization_idx` ON `app_employees` (`organization_id`,`active`);
--> statement-breakpoint
INSERT INTO `app_organizations` (`name`,`short_name`,`type`) VALUES
  ('Avtomobil yo‘llari qo‘mitasi','Qo‘mita','central');
--> statement-breakpoint
UPDATE `app_employees`
   SET `organization_id`=(SELECT `id` FROM `app_organizations` WHERE `type`='central' LIMIT 1)
 WHERE `organization_id` IS NULL;
--> statement-breakpoint
CREATE TABLE `app_report_templates` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `code` text NOT NULL,
  `title` text NOT NULL,
  `instructions` text DEFAULT '' NOT NULL,
  `columns_json` text DEFAULT '[]' NOT NULL,
  `frequency` text DEFAULT 'monthly' NOT NULL,
  `first_deadline_at` text NOT NULL,
  `owner_department_id` integer,
  `allow_delegation` integer DEFAULT true NOT NULL,
  `require_attachment` integer DEFAULT false NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `created_by_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_report_templates_code_unique` ON `app_report_templates` (`code`);
--> statement-breakpoint
CREATE INDEX `app_report_templates_owner_idx` ON `app_report_templates` (`owner_department_id`,`active`);
--> statement-breakpoint
CREATE INDEX `app_report_templates_creator_idx` ON `app_report_templates` (`created_by_employee_id`,`active`);
--> statement-breakpoint
CREATE TABLE `app_report_template_recipients` (
  `template_id` integer NOT NULL,
  `organization_id` integer NOT NULL,
  `responsible_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_report_template_recipient_unique` ON `app_report_template_recipients` (`template_id`,`organization_id`);
--> statement-breakpoint
CREATE INDEX `app_report_template_recipient_employee_idx` ON `app_report_template_recipients` (`responsible_employee_id`);
--> statement-breakpoint
CREATE TABLE `app_report_cycles` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `template_id` integer NOT NULL,
  `period_key` text NOT NULL,
  `period_label` text NOT NULL,
  `period_start` text NOT NULL,
  `period_end` text NOT NULL,
  `deadline_at` text NOT NULL,
  `status` text DEFAULT 'open' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_report_cycle_unique` ON `app_report_cycles` (`template_id`,`period_key`);
--> statement-breakpoint
CREATE INDEX `app_report_cycles_deadline_idx` ON `app_report_cycles` (`status`,`deadline_at`);
--> statement-breakpoint
CREATE TABLE `app_report_assignments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `cycle_id` integer NOT NULL,
  `organization_id` integer NOT NULL,
  `responsible_employee_id` integer NOT NULL,
  `assigned_by_employee_id` integer NOT NULL,
  `parent_assignment_id` integer,
  `status` text DEFAULT 'new' NOT NULL,
  `values_json` text DEFAULT '{}' NOT NULL,
  `comment` text DEFAULT '' NOT NULL,
  `submitted_by_employee_id` integer,
  `submitted_at` text,
  `reviewed_by_employee_id` integer,
  `reviewed_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_report_assignment_cycle_org_unique` ON `app_report_assignments` (`cycle_id`,`organization_id`);
--> statement-breakpoint
CREATE INDEX `app_report_assignment_responsible_idx` ON `app_report_assignments` (`responsible_employee_id`,`status`);
--> statement-breakpoint
CREATE INDEX `app_report_assignment_parent_idx` ON `app_report_assignments` (`parent_assignment_id`);
--> statement-breakpoint
CREATE INDEX `app_report_assignment_org_idx` ON `app_report_assignments` (`organization_id`,`cycle_id`);
--> statement-breakpoint
CREATE TABLE `app_report_files` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `template_id` integer,
  `assignment_id` integer,
  `purpose` text DEFAULT 'evidence' NOT NULL,
  `object_key` text NOT NULL,
  `file_name` text NOT NULL,
  `content_type` text,
  `size` integer DEFAULT 0 NOT NULL,
  `uploaded_by_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_report_files_object_unique` ON `app_report_files` (`object_key`);
--> statement-breakpoint
CREATE INDEX `app_report_files_template_idx` ON `app_report_files` (`template_id`);
--> statement-breakpoint
CREATE INDEX `app_report_files_assignment_idx` ON `app_report_files` (`assignment_id`);
--> statement-breakpoint
UPDATE `app_roles`
SET `permissions_json`=json_set(`permissions_json`,'$.canManageReports',
  CASE WHEN `code` IN ('admin','rahbar','orinbosar','boshqarma') THEN json('true') ELSE json('false') END);
