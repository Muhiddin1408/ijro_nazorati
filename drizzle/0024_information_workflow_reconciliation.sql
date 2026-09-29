-- Reconcile installations where 0022 was already recorded before the final
-- information-workflow hardening was completed.
CREATE TABLE IF NOT EXISTS `app_information_route_exceptions` (
  `organization_id` integer PRIMARY KEY NOT NULL,
  `route_mode` text DEFAULT 'direct_central' NOT NULL,
  `reason` text NOT NULL,
  `approved_by_employee_id` integer NOT NULL,
  `approved_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `expires_at` text,
  `active` integer DEFAULT true NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_information_route_exceptions_active_idx` ON `app_information_route_exceptions` (`active`,`expires_at`);
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_set(
      fields_json,
      '$[' || (SELECT key FROM json_each(fields_json) WHERE json_extract(value,'$.code')='xodim_id' LIMIT 1) || '].required',json('true')
    ),version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY'
  AND EXISTS (
    SELECT 1 FROM json_each(app_information_templates.fields_json)
    WHERE json_extract(value,'$.code')='xodim_id' AND COALESCE(json_extract(value,'$.required'),0)<>1
  );
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_set(
      fields_json,
      '$[' || (SELECT key FROM json_each(fields_json) WHERE json_extract(value,'$.code')='davr' LIMIT 1) || '].required',json('true'),
      '$[' || (SELECT key FROM json_each(fields_json) WHERE json_extract(value,'$.code')='xodimlar_soni' LIMIT 1) || '].required',json('true'),
      '$[' || (SELECT key FROM json_each(fields_json) WHERE json_extract(value,'$.code')='ish_haqi_fondi' LIMIT 1) || '].required',json('true'),
      '$[' || (SELECT key FROM json_each(fields_json) WHERE json_extract(value,'$.code')='ortacha_ish_haqi' LIMIT 1) || '].required',json('true')
    ),version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_FINANCE_ECONOMY_AVERAGE_SALARY'
  AND (SELECT COUNT(*) FROM json_each(app_information_templates.fields_json)
       WHERE json_extract(value,'$.code') IN ('davr','xodimlar_soni','ish_haqi_fondi','ortacha_ish_haqi'))=4
  AND EXISTS (
    SELECT 1 FROM json_each(app_information_templates.fields_json)
    WHERE json_extract(value,'$.code') IN ('davr','xodimlar_soni','ish_haqi_fondi','ortacha_ish_haqi')
      AND COALESCE(json_extract(value,'$.required'),0)<>1
  );
