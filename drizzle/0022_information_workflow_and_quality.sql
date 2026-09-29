CREATE TABLE `app_information_template_workflows` (
  `template_id` integer PRIMARY KEY NOT NULL,
  `owner_department_id` integer,
  `entry_scope` text DEFAULT 'hierarchical' NOT NULL,
  `workflow_code` text DEFAULT 'organization_territorial_central' NOT NULL,
  `validation_rules_json` text DEFAULT '[]' NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_information_template_workflows_owner_idx` ON `app_information_template_workflows` (`owner_department_id`,`active`);
--> statement-breakpoint

CREATE TABLE `app_information_route_exceptions` (
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
CREATE INDEX `app_information_route_exceptions_active_idx` ON `app_information_route_exceptions` (`active`,`expires_at`);
--> statement-breakpoint

CREATE TABLE `app_information_record_approval_steps` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `record_id` integer NOT NULL,
  `workflow_round` integer DEFAULT 1 NOT NULL,
  `sequence_no` integer NOT NULL,
  `step_code` text NOT NULL,
  `step_name` text NOT NULL,
  `organization_id` integer,
  `department_id` integer,
  `status` text DEFAULT 'pending' NOT NULL,
  `acted_by_employee_id` integer,
  `decision_comment` text DEFAULT '' NOT NULL,
  `decided_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_information_record_approval_steps_unique` ON `app_information_record_approval_steps` (`record_id`,`workflow_round`,`sequence_no`);
--> statement-breakpoint
CREATE INDEX `app_information_record_approval_steps_queue_idx` ON `app_information_record_approval_steps` (`status`,`organization_id`,`department_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `app_information_record_approval_steps_record_idx` ON `app_information_record_approval_steps` (`record_id`,`workflow_round`,`sequence_no`);
--> statement-breakpoint

CREATE TABLE `app_information_validation_issues` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `record_id` integer NOT NULL,
  `rule_code` text NOT NULL,
  `severity` text DEFAULT 'error' NOT NULL,
  `field_codes_json` text DEFAULT '[]' NOT NULL,
  `message` text NOT NULL,
  `actual_json` text DEFAULT '{}' NOT NULL,
  `expected_json` text DEFAULT '{}' NOT NULL,
  `detected_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `resolved_at` text
);
--> statement-breakpoint
CREATE INDEX `app_information_validation_issues_record_idx` ON `app_information_validation_issues` (`record_id`,`resolved_at`,`severity`);
--> statement-breakpoint
CREATE INDEX `app_information_validation_issues_rule_idx` ON `app_information_validation_issues` (`rule_code`,`resolved_at`);
--> statement-breakpoint

INSERT OR IGNORE INTO app_information_template_workflows
  (template_id,owner_department_id,entry_scope,workflow_code,validation_rules_json)
SELECT t.id,d.owner_department_id,
  CASE WHEN t.code IN (
    'SRC_DIGITALIZATION_INNOVATION_INFORMATION_SYSTEMS',
    'SRC_DIGITALIZATION_INNOVATION_RESEARCH_INNOVATION',
    'SRC_DESIGN_COST_ANALYSIS_PROJECT_COST_OPTIMIZATION'
  ) THEN 'central_only' ELSE 'hierarchical' END,
  CASE WHEN t.code IN (
    'SRC_DIGITALIZATION_INNOVATION_INFORMATION_SYSTEMS',
    'SRC_DIGITALIZATION_INNOVATION_RESEARCH_INNOVATION',
    'SRC_DESIGN_COST_ANALYSIS_PROJECT_COST_OPTIMIZATION'
  ) THEN 'central_owner' ELSE 'organization_territorial_central' END,
  CASE
    WHEN t.code='SRC_FINANCE_ECONOMY_AVERAGE_SALARY' THEN json_array(
      json_object('code','period_required','type','period_required','severity','error'),
      json_object('code','average_salary_formula','type','ratio_equals','numerator','ish_haqi_fondi','denominator','xodimlar_soni','result','ortacha_ish_haqi','tolerancePercent',2,'severity','error'),
      json_object('code','payroll_employee_count','type','cross_template_distinct_count','sourceField','xodimlar_soni','targetTemplateCode','SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY','targetDistinctField','xodim_id','severity','error','missingSeverity','warning')
    )
    WHEN t.cadence NOT IN ('continuous','event') THEN json_array(
      json_object('code','period_required','type','period_required','severity','error')
    )
    ELSE '[]'
  END
FROM app_information_templates t
JOIN app_information_domains d ON d.id=t.domain_id
WHERE t.active=1;
--> statement-breakpoint

UPDATE app_information_template_workflows
SET owner_department_id=(SELECT d.owner_department_id FROM app_information_templates t JOIN app_information_domains d ON d.id=t.domain_id WHERE t.id=app_information_template_workflows.template_id),
    updated_at=CURRENT_TIMESTAMP
WHERE active=1;
--> statement-breakpoint

-- Existing records remain valid and visible. Their former single-stage decisions
-- are represented as a completed legacy workflow instead of being rewritten.
INSERT OR IGNORE INTO app_information_record_approval_steps
  (record_id,workflow_round,sequence_no,step_code,step_name,organization_id,department_id,status,acted_by_employee_id,decision_comment,decided_at)
SELECT r.id,1,1,'legacy_review','Avvalgi tasdiqlash bosqichi',r.organization_id,r.department_id,
  CASE WHEN r.status IN ('published','archived') THEN 'approved'
       WHEN r.status='returned' THEN 'returned'
       ELSE 'pending' END,
  r.reviewed_by_employee_id,r.comment,COALESCE(r.reviewed_at,r.published_at)
FROM app_information_records r
WHERE r.status IN ('submitted','returned','published','archived');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"davr","label":"Ҳисобот даври","type":"text","required":true,"placeholder":"ЙЙЙЙ-ОО"}')),
    presentation_json=json_set(presentation_json,'$.periodMode','month','$.periodLabel','Ҳисобот даври',
      '$.filters',json_insert(COALESCE(json_extract(presentation_json,'$.filters'),json('[]')),'$[#]','davr')),
    version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY'
  AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='davr');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_set(
      fields_json,
      '$[' || (SELECT key FROM json_each(fields_json) WHERE json_extract(value,'$.code')='xodim_id' LIMIT 1) || '].required',json('true')
    ),version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY'
  AND EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='xodim_id');
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
  AND (SELECT COUNT(*) FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code') IN ('davr','xodimlar_soni','ish_haqi_fondi','ortacha_ish_haqi'))=4;
--> statement-breakpoint

UPDATE app_information_template_workflows
SET validation_rules_json=json_array(
      json_object('code','period_required','type','period_required','severity','error'),
      json_object('code','employee_registry_unique','type','unique_business_key','keyFields',json_array('xodim_id'),'severity','error')
    ),updated_at=CURRENT_TIMESTAMP
WHERE template_id=(SELECT id FROM app_information_templates WHERE code='SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY');
--> statement-breakpoint

UPDATE app_information_template_workflows
SET validation_rules_json=json_insert(validation_rules_json,'$[#]',
      json_object('code','average_salary_unique','type','unique_business_key','keyFields',json('[]'),'severity','error')),
    updated_at=CURRENT_TIMESTAMP
WHERE template_id=(SELECT id FROM app_information_templates WHERE code='SRC_FINANCE_ECONOMY_AVERAGE_SALARY')
  AND NOT EXISTS (SELECT 1 FROM json_each(app_information_template_workflows.validation_rules_json) WHERE json_extract(value,'$.code')='average_salary_unique');
--> statement-breakpoint

UPDATE app_information_templates
SET presentation_json=json_set(presentation_json,'$.aggregation',json(
      '{"ortacha_ish_haqi":{"formula":"SUM(ish_haqi_fondi) / SUM(xodimlar_soni)","weightField":"xodimlar_soni","label":"Ходимлар сонига вазнланган ўртача"}}'
    )),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_FINANCE_ECONOMY_AVERAGE_SALARY';
--> statement-breakpoint

UPDATE app_information_template_workflows
SET validation_rules_json=json_insert(validation_rules_json,'$[#]',json_object(
      'code','call_center_components_total','type','components_sum','totalField','murojaatlar_soni',
      'componentFields',json_array('yol_tamirlash','qamchiq_dovonidagi_holat','tarozi','hududlardagi_ob_havo','yol_holati','boshqalar'),
      'tolerance',0.01,'severity','error'
    )),updated_at=CURRENT_TIMESTAMP
WHERE template_id=(SELECT id FROM app_information_templates WHERE code='SRC_APPEALS_CALL_CENTER_APPEALS')
  AND NOT EXISTS (SELECT 1 FROM json_each(app_information_template_workflows.validation_rules_json) WHERE json_extract(value,'$.code')='call_center_components_total');
