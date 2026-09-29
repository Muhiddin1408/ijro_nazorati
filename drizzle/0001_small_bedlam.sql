CREATE TABLE `app_attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text,
	`size` integer DEFAULT 0 NOT NULL,
	`uploaded_by_employee_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_attachments_object_key_unique` ON `app_attachments` (`object_key`);--> statement-breakpoint
CREATE INDEX `app_attachments_task_idx` ON `app_attachments` (`task_id`);--> statement-breakpoint
CREATE TABLE `app_audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_employee_id` integer,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer,
	`detail_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_audit_logs_created_idx` ON `app_audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `app_departments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`parent_id` integer,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_departments_name_unique` ON `app_departments` (`name`);--> statement-breakpoint
CREATE TABLE `app_employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`position` text DEFAULT '' NOT NULL,
	`role_id` integer NOT NULL,
	`department_id` integer,
	`manager_id` integer,
	`active` integer DEFAULT true NOT NULL,
	`created_by_employee_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_employees_email_unique` ON `app_employees` (`email`);--> statement-breakpoint
CREATE INDEX `app_employees_department_idx` ON `app_employees` (`department_id`);--> statement-breakpoint
CREATE INDEX `app_employees_manager_idx` ON `app_employees` (`manager_id`);--> statement-breakpoint
CREATE TABLE `app_meeting_participants` (
	`meeting_id` integer NOT NULL,
	`employee_id` integer NOT NULL,
	`response_status` text DEFAULT 'Kutilmoqda' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_meeting_participant_unique` ON `app_meeting_participants` (`meeting_id`,`employee_id`);--> statement-breakpoint
CREATE TABLE `app_meetings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text,
	`timezone` text DEFAULT 'Asia/Tashkent' NOT NULL,
	`place` text NOT NULL,
	`format` text DEFAULT 'Oflayn' NOT NULL,
	`reminder_minutes` integer DEFAULT 30 NOT NULL,
	`notify_telegram` integer DEFAULT true NOT NULL,
	`created_by_employee_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_meetings_starts_idx` ON `app_meetings` (`starts_at`);--> statement-breakpoint
CREATE TABLE `app_notification_jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer NOT NULL,
	`recipient_employee_id` integer NOT NULL,
	`scheduled_at` text NOT NULL,
	`next_attempt_at` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`idempotency_key` text NOT NULL,
	`payload_json` text NOT NULL,
	`telegram_message_id` text,
	`last_error` text,
	`sent_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_notification_jobs_dedupe` ON `app_notification_jobs` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `app_notification_jobs_due_idx` ON `app_notification_jobs` (`status`,`next_attempt_at`);--> statement-breakpoint
CREATE TABLE `app_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`level` integer DEFAULT 100 NOT NULL,
	`permissions_json` text DEFAULT '{}' NOT NULL,
	`is_system` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_roles_code_unique` ON `app_roles` (`code`);--> statement-breakpoint
CREATE TABLE `app_task_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`employee_id` integer NOT NULL,
	`assigned_by_employee_id` integer NOT NULL,
	`parent_assignment_id` integer,
	`assignment_status` text DEFAULT 'Faol' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_task_assignment_unique` ON `app_task_assignments` (`task_id`,`employee_id`);--> statement-breakpoint
CREATE INDEX `app_task_assignment_employee_idx` ON `app_task_assignments` (`employee_id`);--> statement-breakpoint
CREATE TABLE `app_task_pins` (
	`task_id` integer NOT NULL,
	`employee_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_task_pins_unique` ON `app_task_pins` (`task_id`,`employee_id`);--> statement-breakpoint
CREATE TABLE `app_task_routes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`from_employee_id` integer,
	`to_employee_id` integer NOT NULL,
	`parent_route_id` integer,
	`action` text DEFAULT 'Topshiriq berildi' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_task_routes_task_idx` ON `app_task_routes` (`task_id`);--> statement-breakpoint
CREATE TABLE `app_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`deadline_iso` text,
	`priority` text DEFAULT 'O‘rta' NOT NULL,
	`status` text DEFAULT 'Jarayonda' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`recurring` integer DEFAULT false NOT NULL,
	`recurrence` text,
	`notify_telegram` integer DEFAULT true NOT NULL,
	`created_by_employee_id` integer NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_tasks_creator_idx` ON `app_tasks` (`created_by_employee_id`);--> statement-breakpoint
CREATE INDEX `app_tasks_deadline_idx` ON `app_tasks` (`deadline_iso`);--> statement-breakpoint
CREATE TABLE `app_telegram_accounts` (
	`employee_id` integer PRIMARY KEY NOT NULL,
	`telegram_user_id` text NOT NULL,
	`chat_id` text NOT NULL,
	`username` text,
	`notifications_enabled` integer DEFAULT true NOT NULL,
	`linked_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`blocked_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_telegram_user_unique` ON `app_telegram_accounts` (`telegram_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `app_telegram_chat_unique` ON `app_telegram_accounts` (`chat_id`);--> statement-breakpoint
CREATE TABLE `app_telegram_link_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token_hash` text NOT NULL,
	`employee_id` integer NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`created_by_employee_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_telegram_link_token_unique` ON `app_telegram_link_tokens` (`token_hash`);--> statement-breakpoint
CREATE TABLE `app_telegram_updates` (
	`update_id` integer PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`detail` text,
	`received_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`processed_at` text
);
--> statement-breakpoint
INSERT INTO `app_roles` (`code`,`name`,`level`,`permissions_json`,`is_system`) VALUES
('admin','Administrator',0,'{"viewScope":"all","assignScope":"all","canCreateTask":true,"canCreateMeeting":true,"canExport":true,"canManageOrganization":true,"canManageRoles":true,"canConfigure":true,"canViewAudit":true,"canUpdateAnyTask":true}',1),
('rahbar','Rahbar',10,'{"viewScope":"all","assignScope":"all","canCreateTask":true,"canCreateMeeting":true,"canExport":true,"canManageOrganization":false,"canManageRoles":false,"canConfigure":false,"canViewAudit":true,"canUpdateAnyTask":true}',1),
('orinbosar','Rais o‘rinbosari',20,'{"viewScope":"subtree","assignScope":"subtree","canCreateTask":true,"canCreateMeeting":false,"canExport":true,"canManageOrganization":false,"canManageRoles":false,"canConfigure":false,"canViewAudit":false,"canUpdateAnyTask":false}',1),
('boshqarma','Boshqarma boshlig‘i',30,'{"viewScope":"department","assignScope":"department","canCreateTask":true,"canCreateMeeting":false,"canExport":true,"canManageOrganization":false,"canManageRoles":false,"canConfigure":false,"canViewAudit":false,"canUpdateAnyTask":false}',1),
('yordamchi','Rahbar yordamchisi',40,'{"viewScope":"own","assignScope":"none","canCreateTask":false,"canCreateMeeting":true,"canExport":false,"canManageOrganization":false,"canManageRoles":false,"canConfigure":false,"canViewAudit":false,"canUpdateAnyTask":false}',1),
('xodim','Xodim',50,'{"viewScope":"own","assignScope":"none","canCreateTask":false,"canCreateMeeting":false,"canExport":false,"canManageOrganization":false,"canManageRoles":false,"canConfigure":false,"canViewAudit":false,"canUpdateAnyTask":false}',1);
--> statement-breakpoint
INSERT INTO `app_departments` (`name`) VALUES
('Rahbariyat'),('Rais apparati'),('Raqamlashtirish boshqarmasi'),('Investitsiyalar boshqarmasi'),('Yo‘llarni qurish boshqarmasi'),('Ekspluatatsiya boshqarmasi');
--> statement-breakpoint
INSERT INTO `app_employees` (`full_name`,`email`,`position`,`role_id`,`department_id`) VALUES
('Tizim administratori','admin@ijro.local','Tizim administratori',(SELECT id FROM app_roles WHERE code='admin'),(SELECT id FROM app_departments WHERE name='Rahbariyat'));
