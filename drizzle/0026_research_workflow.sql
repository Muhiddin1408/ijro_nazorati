CREATE TABLE IF NOT EXISTS `app_research_projects` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `code` text NOT NULL,
  `title` text NOT NULL,
  `kind` text DEFAULT 'research' NOT NULL CHECK (`kind` IN ('research','innovation','pilot')),
  `area` text NOT NULL,
  `executor_organization_id` integer NOT NULL,
  `responsible_employee_id` integer NOT NULL,
  `coordinator_department_id` integer NOT NULL,
  `problem` text NOT NULL,
  `objective` text NOT NULL,
  `novelty` text DEFAULT '' NOT NULL,
  `expected_result` text NOT NULL,
  `start_date` text NOT NULL,
  `end_date` text NOT NULL CHECK (`end_date` > `start_date`),
  `budget` integer DEFAULT 0 NOT NULL CHECK (`budget` >= 0),
  `spent` integer DEFAULT 0 NOT NULL CHECK (`spent` >= 0 AND `spent` <= `budget`),
  `status` text DEFAULT 'draft' NOT NULL CHECK (`status` IN ('draft','active','institute_review','committee_review','returned','completed','implementation','archived')),
  `current_stage` integer DEFAULT 1 NOT NULL CHECK (`current_stage` BETWEEN 1 AND 6),
  `progress` integer DEFAULT 0 NOT NULL CHECK (`progress` BETWEEN 0 AND 100),
  `origin` text DEFAULT 'manual' NOT NULL CHECK (`origin` IN ('manual','problem','topic','foreign')),
  `source_intake_id` integer,
  `published_record_id` integer,
  `created_by_employee_id` integer NOT NULL,
  `updated_by_employee_id` integer NOT NULL,
  `version` integer DEFAULT 1 NOT NULL CHECK (`version` > 0),
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`executor_organization_id`) REFERENCES `app_organizations`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`responsible_employee_id`) REFERENCES `app_employees`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`coordinator_department_id`) REFERENCES `app_departments`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`created_by_employee_id`) REFERENCES `app_employees`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`updated_by_employee_id`) REFERENCES `app_employees`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`source_intake_id`) REFERENCES `app_research_intake_items`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`published_record_id`) REFERENCES `app_information_records`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_research_projects_code_unique` ON `app_research_projects` (`code`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_research_projects_origin_source_unique` ON `app_research_projects` (`origin`,`source_intake_id`) WHERE `source_intake_id` IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_research_projects_status_idx` ON `app_research_projects` (`status`,`current_stage`,`updated_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_research_projects_executor_idx` ON `app_research_projects` (`executor_organization_id`,`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_research_projects_coordinator_idx` ON `app_research_projects` (`coordinator_department_id`,`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_research_projects_responsible_idx` ON `app_research_projects` (`responsible_employee_id`,`status`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `app_research_milestones` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `project_id` integer NOT NULL,
  `stage` integer NOT NULL CHECK (`stage` BETWEEN 1 AND 6),
  `name` text NOT NULL,
  `planned_date` text NOT NULL,
  `actual_date` text,
  `status` text DEFAULT 'pending' NOT NULL CHECK (`status` IN ('pending','active','institute_review','committee_review','returned','approved')),
  `result_summary` text DEFAULT '' NOT NULL,
  `kpi_value` text DEFAULT '' NOT NULL,
  `expenditure` integer DEFAULT 0 NOT NULL CHECK (`expenditure` >= 0),
  `submitted_by_employee_id` integer,
  `submitted_at` text,
  `verified_by_employee_id` integer,
  `verified_at` text,
  `reviewed_by_employee_id` integer,
  `reviewed_at` text,
  `reviewer_comment` text DEFAULT '' NOT NULL,
  `version` integer DEFAULT 1 NOT NULL CHECK (`version` > 0),
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`project_id`) REFERENCES `app_research_projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`submitted_by_employee_id`) REFERENCES `app_employees`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`verified_by_employee_id`) REFERENCES `app_employees`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`reviewed_by_employee_id`) REFERENCES `app_employees`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_research_milestones_project_stage_unique` ON `app_research_milestones` (`project_id`,`stage`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_research_milestones_identity_unique` ON `app_research_milestones` (`id`,`project_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_research_milestones_project_idx` ON `app_research_milestones` (`project_id`,`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_research_milestones_queue_idx` ON `app_research_milestones` (`status`,`submitted_at`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `app_research_intake_items` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `kind` text NOT NULL CHECK (`kind` IN ('problem','proposal','topic','foreign')),
  `parent_id` integer,
  `code` text NOT NULL,
  `title` text NOT NULL,
  `area` text NOT NULL,
  `summary` text NOT NULL,
  `payload_json` text DEFAULT '{}' NOT NULL CHECK (json_valid(`payload_json`)),
  `status` text DEFAULT 'open' NOT NULL CHECK (`status` IN ('open','submitted','selected','rejected','converted','archived')),
  `source_organization_id` integer,
  `source_employee_id` integer,
  `converted_project_id` integer,
  `created_by_employee_id` integer NOT NULL,
  `updated_by_employee_id` integer NOT NULL,
  `version` integer DEFAULT 1 NOT NULL CHECK (`version` > 0),
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CHECK ((`kind` = 'proposal' AND `parent_id` IS NOT NULL) OR (`kind` <> 'proposal' AND `parent_id` IS NULL)),
  FOREIGN KEY (`parent_id`) REFERENCES `app_research_intake_items`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`source_organization_id`) REFERENCES `app_organizations`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`source_employee_id`) REFERENCES `app_employees`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`converted_project_id`) REFERENCES `app_research_projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by_employee_id`) REFERENCES `app_employees`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`updated_by_employee_id`) REFERENCES `app_employees`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_research_intake_code_unique` ON `app_research_intake_items` (`code`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_research_intake_kind_idx` ON `app_research_intake_items` (`kind`,`status`,`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_research_intake_parent_idx` ON `app_research_intake_items` (`parent_id`,`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_research_intake_source_idx` ON `app_research_intake_items` (`source_organization_id`,`source_employee_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_research_proposal_active_unique`
  ON `app_research_intake_items` (`parent_id`,`source_employee_id`)
  WHERE `kind`='proposal' AND `status` IN ('submitted','selected','converted');
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `app_research_files` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `project_id` integer NOT NULL,
  `milestone_id` integer,
  `purpose` text DEFAULT 'evidence' NOT NULL CHECK (`purpose` IN ('passport','technical_task','evidence','result','implementation')),
  `object_key` text NOT NULL,
  `file_name` text NOT NULL,
  `content_type` text NOT NULL,
  `size` integer NOT NULL CHECK (`size` BETWEEN 1 AND 15728640),
  `uploaded_by_employee_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`project_id`) REFERENCES `app_research_projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`milestone_id`,`project_id`) REFERENCES `app_research_milestones`(`id`,`project_id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaded_by_employee_id`) REFERENCES `app_employees`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_research_files_object_unique` ON `app_research_files` (`object_key`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_research_files_project_idx` ON `app_research_files` (`project_id`,`id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_research_files_milestone_idx` ON `app_research_files` (`milestone_id`,`id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_audit_logs_entity_idx` ON `app_audit_logs` (`entity_type`,`entity_id`,`created_at`);
