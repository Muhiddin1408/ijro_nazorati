CREATE TABLE `app_owner_identities` (
	`subject` text PRIMARY KEY NOT NULL,
	`employee_id` integer NOT NULL,
	`owner_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `app_employees`(`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
CREATE UNIQUE INDEX `app_owner_identities_employee_unique` ON `app_owner_identities` (`employee_id`);
