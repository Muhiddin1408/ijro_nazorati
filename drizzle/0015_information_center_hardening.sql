-- Additive hardening kept separate so an environment that previewed 0013 can upgrade safely.
ALTER TABLE `app_information_files` ADD COLUMN `field_code` text;
--> statement-breakpoint
CREATE INDEX `app_information_files_field_idx` ON `app_information_files` (`record_id`,`field_code`);
--> statement-breakpoint
UPDATE `app_roles`
SET `permissions_json`=json_set(`permissions_json`,'$.canManageInformation',1,'$.canViewRestrictedInformation',1)
WHERE `code` IN ('admin','rahbar');
