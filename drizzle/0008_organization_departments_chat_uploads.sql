ALTER TABLE `app_departments` ADD `organization_id` integer;

UPDATE `app_departments`
   SET `organization_id` = (
     SELECT `id`
       FROM `app_organizations`
      WHERE `type` = 'central'
      ORDER BY `id`
      LIMIT 1
   )
 WHERE `organization_id` IS NULL;

DROP INDEX IF EXISTS `app_departments_name_unique`;

CREATE UNIQUE INDEX `app_departments_org_name_unique`
  ON `app_departments` (`organization_id`, `name`);

CREATE INDEX `app_departments_org_idx`
  ON `app_departments` (`organization_id`, `active`);

CREATE TABLE `app_chat_upload_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `channel_id` integer NOT NULL,
  `employee_id` integer NOT NULL,
  `object_key` text NOT NULL,
  `multipart_upload_id` text NOT NULL,
  `file_name` text NOT NULL,
  `content_type` text DEFAULT 'application/octet-stream' NOT NULL,
  `size` integer NOT NULL,
  `message_body` text DEFAULT '' NOT NULL,
  `status` text DEFAULT 'uploading' NOT NULL,
  `expires_at` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `completed_at` text
);

CREATE UNIQUE INDEX `app_chat_upload_sessions_object_unique`
  ON `app_chat_upload_sessions` (`object_key`);

CREATE INDEX `app_chat_upload_sessions_owner_idx`
  ON `app_chat_upload_sessions` (`employee_id`, `status`);

CREATE INDEX `app_chat_upload_sessions_expiry_idx`
  ON `app_chat_upload_sessions` (`status`, `expires_at`);
