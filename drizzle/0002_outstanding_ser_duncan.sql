ALTER TABLE `app_task_assignments` ADD `progress` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE app_task_assignments
   SET progress=(SELECT progress FROM app_tasks WHERE app_tasks.id=app_task_assignments.task_id);
