ALTER TABLE `app_tasks` ADD `recurrence_parent_task_id` integer;
--> statement-breakpoint
CREATE UNIQUE INDEX `app_tasks_recurrence_parent_unique`
  ON `app_tasks` (`recurrence_parent_task_id`)
  WHERE `recurrence_parent_task_id` IS NOT NULL;
