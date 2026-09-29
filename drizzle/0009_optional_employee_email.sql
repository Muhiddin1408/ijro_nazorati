CREATE TABLE `__new_app_employees` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `full_name` text NOT NULL,
  `email` text,
  `position` text DEFAULT '' NOT NULL,
  `role_id` integer NOT NULL,
  `department_id` integer,
  `organization_id` integer,
  `manager_id` integer,
  `active` integer DEFAULT true NOT NULL,
  `created_by_employee_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_app_employees`
  (`id`,`full_name`,`email`,`position`,`role_id`,`department_id`,`organization_id`,`manager_id`,`active`,`created_by_employee_id`,`created_at`,`updated_at`)
SELECT
  `id`,`full_name`,NULLIF(trim(`email`),''),`position`,`role_id`,`department_id`,`organization_id`,`manager_id`,`active`,`created_by_employee_id`,`created_at`,`updated_at`
FROM `app_employees`;
--> statement-breakpoint
DROP TABLE `app_employees`;
--> statement-breakpoint
ALTER TABLE `__new_app_employees` RENAME TO `app_employees`;
--> statement-breakpoint
CREATE UNIQUE INDEX `app_employees_email_unique` ON `app_employees` (`email`);
--> statement-breakpoint
CREATE INDEX `app_employees_active_idx` ON `app_employees` (`active`,`id`);
--> statement-breakpoint
CREATE INDEX `app_employees_role_idx` ON `app_employees` (`role_id`,`active`);
--> statement-breakpoint
CREATE INDEX `app_employees_department_idx` ON `app_employees` (`department_id`);
--> statement-breakpoint
CREATE INDEX `app_employees_organization_idx` ON `app_employees` (`organization_id`,`active`);
--> statement-breakpoint
CREATE INDEX `app_employees_manager_idx` ON `app_employees` (`manager_id`);
