-- Idempotent RBAC reconciliation for databases that already applied an
-- earlier 0021 checkpoint. Existing business data and manual grants are kept.

-- The source registry omitted the Toshkent-region territorial parent while
-- its district organizations were attached directly to the Committee. Keep
-- this bridge explicitly provisional until an administrator verifies it.
INSERT INTO `app_organizations`
  (`name`,`short_name`,`type`,`parent_id`,`region_code`,`data_status`,`source_name`,`hierarchy_verified`,`active`)
SELECT 'Тошкент вилояти автомобиль йўллари бош бошқармаси','Тошкент вилояти АЙББ','territorial',central.id,
  'tashkent_region','provisional_requires_admin_confirmation',
  'Tizim marshrutini vaqtincha to‘ldirish — administrator tasdig‘i talab qilinadi',0,1
FROM `app_organizations` central
WHERE central.active=1 AND central.type='central'
  AND NOT EXISTS (
    SELECT 1 FROM `app_organizations` territorial
    WHERE territorial.active=1 AND territorial.type='territorial' AND territorial.region_code='tashkent_region'
  )
ORDER BY central.id LIMIT 1;
--> statement-breakpoint

UPDATE `app_organizations`
SET `parent_id`=(
      SELECT territorial.id FROM `app_organizations` territorial
      WHERE territorial.active=1 AND territorial.type='territorial' AND territorial.region_code='tashkent_region'
      ORDER BY territorial.hierarchy_verified DESC,territorial.id LIMIT 1
    ),
    `hierarchy_verified`=0,
    `updated_at`=CURRENT_TIMESTAMP
WHERE active=1 AND type='district' AND region_code='tashkent_region'
  AND parent_id IN (SELECT id FROM `app_organizations` WHERE active=1 AND type='central')
  AND EXISTS (
    SELECT 1 FROM `app_organizations` territorial
    WHERE territorial.active=1 AND territorial.type='territorial' AND territorial.region_code='tashkent_region'
  );
--> statement-breakpoint

-- Explicit thematic grants are separate from broad organization/department
-- scopes. A vacant position grant has no effect until that position has an
-- active occupant. Manual revocation remains durable because automatic seeds
-- below use INSERT OR IGNORE.
CREATE TABLE IF NOT EXISTS `app_information_domain_assignments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `domain_id` integer NOT NULL,
  `principal_type` text NOT NULL,
  `principal_id` integer NOT NULL,
  `member_role` text DEFAULT 'editor' NOT NULL,
  `grant_source` text DEFAULT 'manual_admin' NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `created_by_employee_id` integer,
  `updated_by_employee_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CHECK (`principal_type` IN ('employee','staff_position')),
  CHECK (`member_role` IN ('editor','reviewer'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_information_domain_assignments_unique`
  ON `app_information_domain_assignments` (`domain_id`,`principal_type`,`principal_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_information_domain_assignments_principal_idx`
  ON `app_information_domain_assignments` (`principal_type`,`principal_id`,`active`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_information_domain_assignments_domain_idx`
  ON `app_information_domain_assignments` (`domain_id`,`member_role`,`active`);
--> statement-breakpoint

-- Reconcile deployments where older information migrations made committee
-- leadership a global editor. Leadership remains global read-only through its
-- access profile; only the system administrator owns configuration mutation.
UPDATE `app_roles`
SET `permissions_json`=json_set(
  `permissions_json`,
  '$.canManageInformation',CASE WHEN `code`='admin' THEN json('true') ELSE json('false') END,
  '$.canViewRestrictedInformation',CASE WHEN `code`='admin' THEN json('true') ELSE json('false') END,
  '$.canEnterInformation',CASE WHEN `code`='admin' THEN json('true')
    WHEN `code` IN ('rahbar','orinbosar','boshqarma','xodim') THEN json('false')
    ELSE json_extract(`permissions_json`,'$.canEnterInformation') END,
  '$.canSubmitInformation',CASE WHEN `code`='admin' THEN json('true')
    WHEN `code` IN ('rahbar','orinbosar','boshqarma','xodim') THEN json('false')
    ELSE json_extract(`permissions_json`,'$.canSubmitInformation') END,
  '$.canVerifyInformation',CASE WHEN `code`='admin' THEN json('true')
    WHEN `code` IN ('rahbar','orinbosar','boshqarma','xodim') THEN json('false')
    ELSE json_extract(`permissions_json`,'$.canVerifyInformation') END,
  '$.canApproveInformation',CASE WHEN `code`='admin' THEN json('true')
    WHEN `code` IN ('rahbar','orinbosar','boshqarma','xodim') THEN json('false')
    ELSE json_extract(`permissions_json`,'$.canApproveInformation') END
),`updated_at`=CURRENT_TIMESTAMP;
--> statement-breakpoint

UPDATE `app_access_profile_assignments`
SET `active`=0,`updated_at`=CURRENT_TIMESTAMP
WHERE `grant_source` IN (
  'migration_role_mapping','staff_schedule_mapping','credential_provisioning','position_occupancy',
  'secondary_department_management','workflow_owner_approver'
);
--> statement-breakpoint

-- Give organizations without an imported schedule only clearly labelled,
-- inactive operational positions. These are not official HR posts.
INSERT INTO `app_staff_positions`
  (`organization_id`,`department_name`,`subunit_name`,`title`,`employee_category`,`position_status`,`headcount_units`,`fte_rate`,`effective_from`,`document_type`,`source_file`,`data_status`,`note`,`active`)
SELECT organization.id,'','',CASE WHEN organization.type='territorial' THEN 'Hududiy rahbariyat tasdiqlovchisi' ELSE 'Tashkilot tasdiqlovchisi' END,
  'Operatsion rol','Rezerv — xodim biriktirilmaguncha login faol emas',1,1,NULL,'Vaqtinchalik operatsion rol',
  'Tizim tomonidan yaratilgan','provisional_requires_staff_import','Rasmiy shtat emas. Tashkilot shtat jadvali import qilingach almashtiriladi.',1
FROM `app_organizations` organization
WHERE organization.active=1
  AND NOT EXISTS (SELECT 1 FROM `app_staff_positions` position WHERE position.organization_id=organization.id AND position.active=1)
  AND NOT EXISTS (SELECT 1 FROM `app_staff_positions` position WHERE position.organization_id=organization.id
    AND position.source_file='Tizim tomonidan yaratilgan'
    AND position.title IN ('Tashkilot tasdiqlovchisi','Hududiy rahbariyat tasdiqlovchisi'));
--> statement-breakpoint
INSERT INTO `app_staff_positions`
  (`organization_id`,`department_name`,`subunit_name`,`title`,`employee_category`,`position_status`,`headcount_units`,`fte_rate`,`effective_from`,`document_type`,`source_file`,`data_status`,`note`,`active`)
SELECT organization.id,'','','Ma’lumot kirituvchi','Operatsion rol','Rezerv — xodim biriktirilmaguncha login faol emas',1,1,NULL,
  'Vaqtinchalik operatsion rol','Tizim tomonidan yaratilgan','provisional_requires_staff_import',
  'Rasmiy shtat emas. Tashkilot shtat jadvali import qilingach almashtiriladi.',1
FROM `app_organizations` organization
WHERE organization.active=1
  AND EXISTS (SELECT 1 FROM `app_staff_positions` position WHERE position.organization_id=organization.id
    AND position.source_file='Tizim tomonidan yaratilgan'
    AND position.title IN ('Tashkilot tasdiqlovchisi','Hududiy rahbariyat tasdiqlovchisi'))
  AND NOT EXISTS (SELECT 1 FROM `app_staff_positions` position WHERE position.organization_id=organization.id
    AND position.source_file='Tizim tomonidan yaratilgan' AND position.title='Ma’lumot kirituvchi');
--> statement-breakpoint
INSERT INTO `app_staff_positions`
  (`organization_id`,`department_name`,`subunit_name`,`title`,`employee_category`,`position_status`,`headcount_units`,`fte_rate`,`effective_from`,`document_type`,`source_file`,`data_status`,`note`,`active`)
SELECT organization.id,'','','Hududiy bo‘lim tasdiqlovchisi','Operatsion rol','Rezerv — xodim biriktirilmaguncha login faol emas',1,1,NULL,
  'Vaqtinchalik operatsion rol','Tizim tomonidan yaratilgan','provisional_requires_staff_import',
  'Rasmiy shtat emas. Tashkilot shtat jadvali import qilingach almashtiriladi.',1
FROM `app_organizations` organization
WHERE organization.active=1 AND organization.type='territorial'
  AND EXISTS (SELECT 1 FROM `app_staff_positions` position WHERE position.organization_id=organization.id
    AND position.source_file='Tizim tomonidan yaratilgan' AND position.title='Hududiy rahbariyat tasdiqlovchisi')
  AND NOT EXISTS (SELECT 1 FROM `app_staff_positions` position WHERE position.organization_id=organization.id
    AND position.source_file='Tizim tomonidan yaratilgan' AND position.title='Hududiy bo‘lim tasdiqlovchisi');
--> statement-breakpoint

-- Recompute imported employee grants with least privilege. Explicit application
-- roles win; otherwise only data-capable professional titles receive editing.
INSERT INTO `app_access_profile_assignments`
  (`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`,`include_descendants`,`grant_source`)
SELECT 'employee',employee.id,profile.id,
  CASE WHEN profile.code IN ('system_administrator','committee_leadership') THEN 'global'
    WHEN employee.department_id IS NOT NULL AND profile.code IN
      ('central_unit_approver','central_unit_editor','territorial_unit_reviewer','territorial_unit_editor','district_editor','direct_org_editor','organization_editor')
      THEN 'department' ELSE 'organization' END,
  CASE WHEN profile.code IN ('system_administrator','committee_leadership') THEN 0
    WHEN employee.department_id IS NOT NULL AND profile.code IN
      ('central_unit_approver','central_unit_editor','territorial_unit_reviewer','territorial_unit_editor','district_editor','direct_org_editor','organization_editor')
      THEN employee.department_id ELSE employee.organization_id END,
  CASE WHEN profile.code IN ('system_administrator','committee_leadership','territorial_leadership','district_leadership','direct_org_leadership','organization_leadership') THEN 1 ELSE 0 END,
  'migration_role_mapping'
FROM `app_employees` employee
JOIN `app_roles` role ON role.id=employee.role_id
JOIN `app_organizations` organization ON organization.id=employee.organization_id
JOIN `app_access_profiles` profile ON profile.code=CASE
  WHEN role.code='admin' THEN 'system_administrator'
  WHEN role.code IN ('rahbar','orinbosar') THEN 'committee_leadership'
  WHEN role.code='hudud_rahbari' AND organization.type='territorial' THEN 'territorial_leadership'
  WHEN role.code='hudud_tasdiqlovchi' AND organization.type='territorial' THEN 'territorial_unit_reviewer'
  WHEN role.code='tuman_rahbari' AND organization.type='district' THEN 'district_leadership'
  WHEN role.code='tashkilot_rahbari' AND organization.type='direct_subordinate' THEN 'direct_org_leadership'
  WHEN role.code='tashkilot_rahbari' THEN 'organization_leadership'
  WHEN role.code='malumot_kirituvchi' AND organization.type='central' THEN 'central_unit_editor'
  WHEN role.code='malumot_kirituvchi' AND organization.type='territorial' THEN 'territorial_unit_editor'
  WHEN role.code='malumot_kirituvchi' AND organization.type='district' THEN 'district_editor'
  WHEN role.code='malumot_kirituvchi' AND organization.type='direct_subordinate' THEN 'direct_org_editor'
  WHEN role.code='malumot_kirituvchi' THEN 'organization_editor'
  WHEN organization.type='central' AND role.code='boshqarma' THEN 'central_unit_approver'
  WHEN organization.type='central' AND (
    employee.position LIKE '%mutaxassis%' OR employee.position LIKE '%Mutaxassis%'
    OR employee.position LIKE '%muhandis%' OR employee.position LIKE '%Muhandis%'
    OR employee.position LIKE '%hisobchi%' OR employee.position LIKE '%Hisobchi%'
    OR employee.position LIKE '%iqtisodchi%' OR employee.position LIKE '%Iqtisodchi%'
    OR employee.position LIKE '%auditor%' OR employee.position LIKE '%Auditor%'
    OR employee.position LIKE '%yuriskonsult%' OR employee.position LIKE '%Yuriskonsult%'
    OR employee.position LIKE '%operator%' OR employee.position LIKE '%Operator%'
    OR employee.position LIKE '%dispetcher%' OR employee.position LIKE '%Dispetcher%'
    OR employee.position LIKE '%inspektor%' OR employee.position LIKE '%Inspektor%'
    OR employee.position LIKE '%kadr%' OR employee.position LIKE '%Kadr%'
    OR employee.position LIKE '%мутахассис%' OR employee.position LIKE '%Мутахассис%'
    OR employee.position LIKE '%муҳандис%' OR employee.position LIKE '%Муҳандис%'
    OR employee.position LIKE '%ҳисобчи%' OR employee.position LIKE '%Ҳисобчи%'
    OR employee.position LIKE '%иқтисодчи%' OR employee.position LIKE '%Иқтисодчи%'
    OR employee.position LIKE '%аудитор%' OR employee.position LIKE '%Аудитор%'
    OR employee.position LIKE '%юрисконсульт%' OR employee.position LIKE '%Юрисконсульт%'
    OR employee.position LIKE '%оператор%' OR employee.position LIKE '%Оператор%'
    OR employee.position LIKE '%диспетчер%' OR employee.position LIKE '%Диспетчер%'
    OR employee.position LIKE '%инспектор%' OR employee.position LIKE '%Инспектор%'
    OR employee.position LIKE '%кадр%' OR employee.position LIKE '%Кадр%'
  ) THEN 'central_unit_editor'
  ELSE 'employee_personal' END
WHERE employee.active=1
ON CONFLICT(`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`) DO UPDATE SET
  `active`=1,`grant_source`='migration_role_mapping',`updated_at`=CURRENT_TIMESTAMP;
--> statement-breakpoint

-- Recompute every active position profile. Executive support and generic
-- service heads deliberately fall through to employee_personal.
INSERT INTO `app_access_profile_assignments`
  (`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`,`include_descendants`,`grant_source`)
SELECT 'staff_position',position.id,profile.id,
  CASE WHEN profile.code IN ('system_administrator','committee_leadership') THEN 'global'
    WHEN position.department_id IS NOT NULL AND profile.code IN
      ('central_unit_approver','central_unit_editor','territorial_unit_reviewer','territorial_unit_editor','district_editor','direct_org_editor','organization_editor')
      THEN 'department' ELSE 'organization' END,
  CASE WHEN profile.code IN ('system_administrator','committee_leadership') THEN 0
    WHEN position.department_id IS NOT NULL AND profile.code IN
      ('central_unit_approver','central_unit_editor','territorial_unit_reviewer','territorial_unit_editor','district_editor','direct_org_editor','organization_editor')
      THEN position.department_id ELSE position.organization_id END,
  CASE WHEN profile.code IN ('system_administrator','committee_leadership','territorial_leadership','district_leadership','direct_org_leadership','organization_leadership') THEN 1 ELSE 0 END,
  'staff_schedule_mapping'
FROM `app_staff_positions` position
JOIN `app_organizations` organization ON organization.id=position.organization_id
JOIN `app_access_profiles` profile ON profile.code='employee_personal' /* historical monolithic classifier:
  WHEN position.title='Hududiy rahbariyat tasdiqlovchisi' AND organization.type='territorial' THEN 'territorial_leadership'
  WHEN position.title='Hududiy bo‘lim tasdiqlovchisi' AND organization.type='territorial' THEN 'territorial_unit_reviewer'
  WHEN position.title='Tashkilot tasdiqlovchisi' AND organization.type='district' THEN 'district_leadership'
  WHEN position.title='Tashkilot tasdiqlovchisi' AND organization.type='direct_subordinate' THEN 'direct_org_leadership'
  WHEN position.title='Tashkilot tasdiqlovchisi' THEN 'organization_leadership'
  WHEN position.title='Ma’lumot kirituvchi' AND organization.type='central' THEN 'central_unit_editor'
  WHEN position.title='Ma’lumot kirituvchi' AND organization.type='territorial' THEN 'territorial_unit_editor'
  WHEN position.title='Ma’lumot kirituvchi' AND organization.type='district' THEN 'district_editor'
  WHEN position.title='Ma’lumot kirituvchi' AND organization.type='direct_subordinate' THEN 'direct_org_editor'
  WHEN position.title='Ma’lumot kirituvchi' THEN 'organization_editor'
  WHEN organization.type='central'
    AND (position.title LIKE '%Qo‘mita raisi%' OR position.title LIKE '%Rais o‘rinbosari%')
    AND position.title NOT LIKE '%yordamchi%' AND position.title NOT LIKE '%Yordamchi%'
    AND position.title NOT LIKE '%maslahatchi%' AND position.title NOT LIKE '%Maslahatchi%'
    AND position.title NOT LIKE '%haydovchi%' AND position.title NOT LIKE '%Haydovchi%'
    AND position.title NOT LIKE '%kotib%' AND position.title NOT LIKE '%Kotib%'
    THEN 'committee_leadership'
  WHEN organization.type='central' AND (position.title LIKE '%Boshqarma boshlig%' OR position.title LIKE '%Bo‘lim boshlig%') THEN 'central_unit_approver'
  WHEN organization.type='central' AND (
    position.title LIKE '%mutaxassis%' OR position.title LIKE '%Mutaxassis%'
    OR position.title LIKE '%muhandis%' OR position.title LIKE '%Muhandis%'
    OR position.title LIKE '%hisobchi%' OR position.title LIKE '%Hisobchi%'
    OR position.title LIKE '%iqtisodchi%' OR position.title LIKE '%Iqtisodchi%'
    OR position.title LIKE '%auditor%' OR position.title LIKE '%Auditor%'
    OR position.title LIKE '%yuriskonsult%' OR position.title LIKE '%Yuriskonsult%'
    OR position.title LIKE '%operator%' OR position.title LIKE '%Operator%'
    OR position.title LIKE '%inspektor%' OR position.title LIKE '%Inspektor%'
  ) THEN 'central_unit_editor'
  WHEN organization.type='territorial' AND (position.title LIKE '%Бош бошқарма бошли%' OR position.title IN ('Раҳбар','раҳбар'))
    AND position.title NOT LIKE '%ҳайдовчи%' AND position.title NOT LIKE '%котиб%' AND position.title NOT LIKE '%ёрдамчи%' THEN 'territorial_leadership'
  WHEN organization.type='territorial' AND (position.title LIKE '%Бўлим бошли%' OR position.title LIKE '%бўлим бошли%'
    OR position.title LIKE '%Шуъба бошли%' OR position.title LIKE '%шуъба бошли%'
    OR position.title LIKE '%Бош муҳандис%' OR position.title LIKE '%бош муҳандис%' OR position.title LIKE '%ўринбосари%') THEN 'territorial_unit_reviewer'
  WHEN organization.type='territorial' AND (position.title LIKE '%мутахассис%' OR position.title LIKE '%Мутахассис%'
    OR position.title LIKE '%муҳандис%' OR position.title LIKE '%Муҳандис%' OR position.title LIKE '%ҳисобчи%' OR position.title LIKE '%Ҳисобчи%'
    OR position.title LIKE '%иқтисодчи%' OR position.title LIKE '%Иқтисодчи%' OR position.title LIKE '%аудитор%' OR position.title LIKE '%Аудитор%'
    OR position.title LIKE '%юрисконсульт%' OR position.title LIKE '%Юрисконсульт%' OR position.title LIKE '%оператор%' OR position.title LIKE '%Оператор%'
    OR position.title LIKE '%диспетчер%' OR position.title LIKE '%Диспетчер%' OR position.title LIKE '%инспектор%' OR position.title LIKE '%Инспектор%') THEN 'territorial_unit_editor'
  WHEN organization.type='district' AND (position.title LIKE '%Корхона бошли%'
    OR position.title IN ('Директор','директор','Раҳбар','раҳбар') OR position.title LIKE 'Директор ўринбосари%'
    OR position.title LIKE 'Директорнинг %ўринбосари%' OR position.title LIKE '% бўйича директор ўринбосари%')
    AND position.title NOT LIKE '%ҳайдовчи%' AND position.title NOT LIKE '%котиб%' AND position.title NOT LIKE '%ёрдамчи%' THEN 'district_leadership'
  WHEN organization.type='district' AND (position.title LIKE '%мутахассис%' OR position.title LIKE '%Мутахассис%'
    OR position.title LIKE '%муҳандис%' OR position.title LIKE '%Муҳандис%' OR position.title LIKE '%ҳисобчи%' OR position.title LIKE '%Ҳисобчи%'
    OR position.title LIKE '%иқтисодчи%' OR position.title LIKE '%Иқтисодчи%' OR position.title LIKE '%аудитор%' OR position.title LIKE '%Аудитор%'
    OR position.title LIKE '%юрисконсульт%' OR position.title LIKE '%Юрисконсульт%' OR position.title LIKE '%оператор%' OR position.title LIKE '%Оператор%'
    OR position.title LIKE '%диспетчер%' OR position.title LIKE '%Диспетчер%' OR position.title LIKE '%инспектор%' OR position.title LIKE '%Инспектор%') THEN 'district_editor'
  WHEN organization.type='direct_subordinate' AND (position.title IN ('Директор','директор','Раҳбар','раҳбар')
    OR position.title LIKE 'Директор ўринбосари%' OR position.title LIKE 'Директорнинг %ўринбосари%'
    OR position.title LIKE '% бўйича директор ўринбосари%')
    AND position.title NOT LIKE '%ҳайдовчи%' AND position.title NOT LIKE '%котиб%' AND position.title NOT LIKE '%ёрдамчи%' THEN 'direct_org_leadership'
  WHEN organization.type='direct_subordinate' AND (position.title LIKE '%Бўлим бошли%' OR position.title LIKE '%бўлим бошли%'
    OR position.title LIKE '%Шуъба бошли%' OR position.title LIKE '%шуъба бошли%' OR position.title LIKE '%Бош муҳандис%'
    OR position.title LIKE '%бош муҳандис%' OR position.title LIKE '%ўринбосари%' OR position.title LIKE '%мутахассис%'
    OR position.title LIKE '%Мутахассис%' OR position.title LIKE '%муҳандис%' OR position.title LIKE '%Муҳандис%'
    OR position.title LIKE '%ҳисобчи%' OR position.title LIKE '%Ҳисобчи%' OR position.title LIKE '%иқтисодчи%'
    OR position.title LIKE '%Иқтисодчи%' OR position.title LIKE '%аудитор%' OR position.title LIKE '%Аудитор%'
    OR position.title LIKE '%юрисконсульт%' OR position.title LIKE '%Юрисконсульт%' OR position.title LIKE '%оператор%'
    OR position.title LIKE '%Оператор%' OR position.title LIKE '%диспетчер%' OR position.title LIKE '%Диспетчер%'
    OR position.title LIKE '%инспектор%' OR position.title LIKE '%Инспектор%') THEN 'direct_org_editor'
  WHEN (position.title LIKE '%Бош бошқарма бошли%' OR position.title LIKE '%Корхона бошли%'
    OR position.title IN ('Директор','директор','Раҳбар','раҳбар'))
    AND position.title NOT LIKE '%ҳайдовчи%' AND position.title NOT LIKE '%котиб%' AND position.title NOT LIKE '%ёрдамчи%' THEN 'organization_leadership'
  WHEN position.title LIKE '%мутахассис%' OR position.title LIKE '%Мутахассис%' OR position.title LIKE '%муҳандис%'
    OR position.title LIKE '%Муҳандис%' OR position.title LIKE '%ҳисобчи%' OR position.title LIKE '%Ҳисобчи%'
    OR position.title LIKE '%иқтисодчи%' OR position.title LIKE '%оператор%' OR position.title LIKE '%диспетчер%' THEN 'organization_editor'
  ELSE 'employee_personal' END */
WHERE position.active=1
ON CONFLICT(`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`) DO UPDATE SET
  `active`=1,`grant_source`='staff_schedule_mapping',`updated_at`=CURRENT_TIMESTAMP;
--> statement-breakpoint

-- Workerd rejects the former single giant CASE/LIKE expression. Classify in
-- small, auditable stages and then publish exactly one primary profile per
-- active position. Unknown/service posts safely retain employee_personal.
CREATE TABLE IF NOT EXISTS `_app_staff_position_profile_stage` (
  `position_id` integer PRIMARY KEY NOT NULL,
  `profile_code` text NOT NULL
);
--> statement-breakpoint
DELETE FROM `_app_staff_position_profile_stage`;
--> statement-breakpoint
INSERT INTO `_app_staff_position_profile_stage` (`position_id`,`profile_code`)
SELECT id,'employee_personal' FROM `app_staff_positions` WHERE active=1;
--> statement-breakpoint

-- Central Committee executives, unit heads and data-capable professionals.
UPDATE `_app_staff_position_profile_stage` SET `profile_code`='central_unit_editor'
WHERE position_id IN (
  SELECT position.id FROM `app_staff_positions` position
  JOIN `app_organizations` organization ON organization.id=position.organization_id AND organization.type='central'
  WHERE position.active=1 AND (
    instr(lower(position.title),'mutaxassis')>0 OR instr(lower(position.title),'muhandis')>0
    OR instr(lower(position.title),'hisobchi')>0 OR instr(lower(position.title),'iqtisodchi')>0
    OR instr(lower(position.title),'auditor')>0 OR instr(lower(position.title),'yuriskonsult')>0
    OR instr(lower(position.title),'operator')>0 OR instr(lower(position.title),'dispetcher')>0
    OR instr(lower(position.title),'inspektor')>0 OR instr(lower(position.title),'kadr')>0
    OR instr(lower(position.title),'texnik-hisobchi')>0
  )
);
--> statement-breakpoint
UPDATE `_app_staff_position_profile_stage` SET `profile_code`='central_unit_approver'
WHERE position_id IN (
  SELECT position.id FROM `app_staff_positions` position
  JOIN `app_organizations` organization ON organization.id=position.organization_id AND organization.type='central'
  WHERE position.active=1 AND (
    instr(lower(position.title),'boshqarma boshlig')>0
    OR instr(lower(position.title),'bo‘lim boshlig')>0
    OR instr(lower(position.title),'bo''lim boshlig')>0
    OR instr(lower(position.title),'sho‘ba boshlig')>0
    OR instr(lower(position.title),'sho''ba boshlig')>0
    OR instr(lower(position.title),'bosh muhandis')>0
    OR instr(lower(position.title),'o''rinbosari')>0
    OR instr(lower(position.title),'o‘rinbosari')>0
  )
);
--> statement-breakpoint
UPDATE `_app_staff_position_profile_stage` SET `profile_code`='committee_leadership'
WHERE position_id IN (
  SELECT position.id FROM `app_staff_positions` position
  JOIN `app_organizations` organization ON organization.id=position.organization_id AND organization.type='central'
  WHERE position.active=1
    AND (instr(lower(position.title),'qo‘mita raisi')>0 OR instr(lower(position.title),'qo''mita raisi')>0
      OR instr(lower(position.title),'rais o‘rinbosari')>0 OR instr(lower(position.title),'rais o''rinbosari')>0)
    AND instr(lower(position.title),'yordamchi')=0 AND instr(lower(position.title),'maslahatchi')=0
    AND instr(lower(position.title),'haydovchi')=0 AND instr(lower(position.title),'kotib')=0
);
--> statement-breakpoint

-- Direct-subordinate organization leaders and their thematic professionals.
UPDATE `_app_staff_position_profile_stage` SET `profile_code`='direct_org_editor'
WHERE position_id IN (
  SELECT position.id FROM `app_staff_positions` position
  JOIN `app_organizations` organization ON organization.id=position.organization_id AND organization.type='direct_subordinate'
  WHERE position.active=1 AND (
    instr(position.title,'мутахассис')>0 OR instr(position.title,'Мутахассис')>0
    OR instr(position.title,'муҳандис')>0 OR instr(position.title,'Муҳандис')>0
    OR instr(position.title,'ҳисобчи')>0 OR instr(position.title,'Ҳисобчи')>0
    OR instr(position.title,'иқтисодчи')>0 OR instr(position.title,'Иқтисодчи')>0
    OR instr(position.title,'аудитор')>0 OR instr(position.title,'Аудитор')>0
    OR instr(position.title,'юрисконсульт')>0 OR instr(position.title,'Юрисконсульт')>0
    OR instr(position.title,'оператор')>0 OR instr(position.title,'Оператор')>0
    OR instr(position.title,'диспетчер')>0 OR instr(position.title,'Диспетчер')>0
    OR instr(position.title,'инспектор')>0 OR instr(position.title,'Инспектор')>0
    OR instr(position.title,'кадр')>0 OR instr(position.title,'Кадр')>0
  )
);
--> statement-breakpoint
UPDATE `_app_staff_position_profile_stage` SET `profile_code`='direct_org_editor'
WHERE position_id IN (
  SELECT position.id FROM `app_staff_positions` position
  JOIN `app_organizations` organization ON organization.id=position.organization_id AND organization.type='direct_subordinate'
  WHERE position.active=1 AND (
    instr(position.title,'Бошқарма бошли')>0 OR instr(position.title,'бошқарма бошли')>0
    OR instr(position.title,'Бўлим бошли')>0 OR instr(position.title,'бўлим бошли')>0
    OR instr(position.title,'Шуъба бошли')>0 OR instr(position.title,'шуъба бошли')>0
    OR instr(position.title,'Бош муҳандис')>0 OR instr(position.title,'бош муҳандис')>0
    OR instr(position.title,'Бош ҳисобчи')>0 OR instr(position.title,'бош ҳисобчи')>0
    OR instr(position.title,'ўринбосари')>0
  )
);
--> statement-breakpoint
UPDATE `_app_staff_position_profile_stage` SET `profile_code`='direct_org_leadership'
WHERE position_id IN (
  SELECT position.id FROM `app_staff_positions` position
  JOIN `app_organizations` organization ON organization.id=position.organization_id AND organization.type='direct_subordinate'
  WHERE position.active=1
    AND (position.title IN ('Директор','директор','Раҳбар','раҳбар')
      OR instr(position.title,'Корхона бошли')>0 OR instr(position.title,'корхона бошли')>0
      OR instr(position.title,'Бош бошқарма бошли')>0 OR instr(position.title,'бош бошқарма бошли')>0
      OR ((instr(position.title,'Директор')>0 OR instr(position.title,'директор')>0) AND instr(position.title,'ўринбосари')>0))
    AND instr(position.title,'ҳайдовчи')=0 AND instr(position.title,'Ҳайдовчи')=0
    AND instr(position.title,'котиб')=0 AND instr(position.title,'Котиб')=0
    AND instr(position.title,'ёрдамчи')=0 AND instr(position.title,'Ёрдамчи')=0
    AND instr(position.title,'маслаҳатчи')=0 AND instr(position.title,'Маслаҳатчи')=0
);
--> statement-breakpoint

-- Explicit provisional workflow slots. These names are operational duties,
-- not inferred official posts.
UPDATE `_app_staff_position_profile_stage` SET `profile_code`='territorial_leadership'
WHERE position_id IN (
  SELECT position.id FROM `app_staff_positions` position JOIN `app_organizations` organization ON organization.id=position.organization_id
  WHERE position.active=1 AND organization.type='territorial' AND position.title='Hududiy rahbariyat tasdiqlovchisi'
);
--> statement-breakpoint
UPDATE `_app_staff_position_profile_stage` SET `profile_code`='territorial_unit_reviewer'
WHERE position_id IN (
  SELECT position.id FROM `app_staff_positions` position JOIN `app_organizations` organization ON organization.id=position.organization_id
  WHERE position.active=1 AND organization.type='territorial' AND position.title='Hududiy bo‘lim tasdiqlovchisi'
);
--> statement-breakpoint
UPDATE `_app_staff_position_profile_stage` SET `profile_code`=CASE organization.type
  WHEN 'central' THEN 'central_unit_editor'
  WHEN 'territorial' THEN 'territorial_unit_editor'
  WHEN 'district' THEN 'district_editor'
  WHEN 'direct_subordinate' THEN 'direct_org_editor'
  ELSE 'organization_editor' END
FROM `app_staff_positions` position JOIN `app_organizations` organization ON organization.id=position.organization_id
WHERE `_app_staff_position_profile_stage`.position_id=position.id AND position.active=1 AND position.title='Ma’lumot kirituvchi';
--> statement-breakpoint
UPDATE `_app_staff_position_profile_stage` SET `profile_code`=CASE organization.type
  WHEN 'district' THEN 'district_leadership'
  WHEN 'direct_subordinate' THEN 'direct_org_leadership'
  ELSE 'organization_leadership' END
FROM `app_staff_positions` position JOIN `app_organizations` organization ON organization.id=position.organization_id
WHERE `_app_staff_position_profile_stage`.position_id=position.id AND position.active=1 AND position.title='Tashkilot tasdiqlovchisi';
--> statement-breakpoint

UPDATE `app_access_profile_assignments`
SET `active`=0,`updated_at`=CURRENT_TIMESTAMP
WHERE `principal_type`='staff_position' AND `grant_source`='staff_schedule_mapping';
--> statement-breakpoint
INSERT INTO `app_access_profile_assignments`
  (`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`,`include_descendants`,`grant_source`)
SELECT 'staff_position',position.id,profile.id,
  CASE WHEN stage.profile_code='committee_leadership' THEN 'global'
    WHEN position.department_id IS NOT NULL AND stage.profile_code IN
      ('central_unit_approver','central_unit_editor','territorial_unit_reviewer','territorial_unit_editor','district_editor','direct_org_editor','organization_editor')
      THEN 'department' ELSE 'organization' END,
  CASE WHEN stage.profile_code='committee_leadership' THEN 0
    WHEN position.department_id IS NOT NULL AND stage.profile_code IN
      ('central_unit_approver','central_unit_editor','territorial_unit_reviewer','territorial_unit_editor','district_editor','direct_org_editor','organization_editor')
      THEN position.department_id ELSE position.organization_id END,
  CASE WHEN stage.profile_code IN ('committee_leadership','territorial_leadership','district_leadership','direct_org_leadership','organization_leadership') THEN 1 ELSE 0 END,
  'staff_schedule_mapping'
FROM `_app_staff_position_profile_stage` stage
JOIN `app_staff_positions` position ON position.id=stage.position_id AND position.active=1
JOIN `app_access_profiles` profile ON profile.code=stage.profile_code
ON CONFLICT(`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`) DO UPDATE SET
  `active`=1,`grant_source`='staff_schedule_mapping',`updated_at`=CURRENT_TIMESTAMP;
--> statement-breakpoint
DROP TABLE `_app_staff_position_profile_stage`;
--> statement-breakpoint

INSERT INTO `app_access_profile_assignments`
  (`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`,`include_descendants`,`grant_source`)
SELECT 'staff_position',role.staff_position_id,profile.id,'department',role.department_id,0,'secondary_department_management'
FROM `app_staff_position_roles` role
JOIN `app_staff_positions` position ON position.id=role.staff_position_id AND position.active=1
JOIN `app_organizations` organization ON organization.id=position.organization_id AND organization.type='central'
JOIN `app_access_profiles` profile ON profile.code='central_unit_approver'
JOIN `app_departments` department ON department.id=role.department_id AND department.active=1 AND department.organization_id=position.organization_id
WHERE role.role_type='secondary_manager'
ON CONFLICT(`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`) DO UPDATE SET
  `active`=1,`grant_source`='secondary_department_management',`updated_at`=CURRENT_TIMESTAMP;
--> statement-breakpoint

-- Rahbariyat-owned forms are entered by its professional staff and approved by
-- the actual committee leadership. Keep that approval exact to the Rahbariyat
-- department while the leadership profile itself remains global for viewing.
INSERT INTO `app_access_profile_assignments`
  (`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`,`include_descendants`,`grant_source`)
SELECT 'staff_position',position.id,approver.id,'department',position.department_id,0,'workflow_owner_approver'
FROM `app_staff_positions` position
JOIN `app_organizations` organization ON organization.id=position.organization_id AND organization.type='central'
JOIN `app_departments` department ON department.id=position.department_id AND department.name='Rahbariyat'
JOIN `app_access_profile_assignments` leadership_assignment
  ON leadership_assignment.principal_type='staff_position' AND leadership_assignment.principal_id=position.id AND leadership_assignment.active=1
JOIN `app_access_profiles` leadership ON leadership.id=leadership_assignment.access_profile_id AND leadership.code='committee_leadership'
JOIN `app_access_profiles` approver ON approver.code='central_unit_approver'
WHERE position.active=1
ON CONFLICT(`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`) DO UPDATE SET
  `active`=1,`grant_source`='workflow_owner_approver',`updated_at`=CURRENT_TIMESTAMP;
--> statement-breakpoint

-- Keep the administrator invariant inside the same serialized D1 write that
-- changes an employee.  An API-side count alone has a time-of-check/time-of-use
-- race when two administrators are demoted concurrently.
CREATE TRIGGER IF NOT EXISTS `app_employees_keep_active_admin_on_update`
BEFORE UPDATE OF `role_id`,`active` ON `app_employees`
WHEN OLD.active=1
  AND OLD.role_id=(SELECT id FROM app_roles WHERE code='admin')
  AND (NEW.active<>1 OR NEW.role_id<>(SELECT id FROM app_roles WHERE code='admin'))
  AND NOT EXISTS (
    SELECT 1 FROM app_employees other
    JOIN app_roles role ON role.id=other.role_id
    WHERE other.id<>OLD.id AND other.active=1 AND role.code='admin'
  )
BEGIN
  SELECT RAISE(ABORT,'last_active_admin');
END;
--> statement-breakpoint

CREATE TRIGGER IF NOT EXISTS `app_employees_keep_active_admin_on_delete`
BEFORE DELETE ON `app_employees`
WHEN OLD.active=1
  AND OLD.role_id=(SELECT id FROM app_roles WHERE code='admin')
  AND NOT EXISTS (
    SELECT 1 FROM app_employees other
    JOIN app_roles role ON role.id=other.role_id
    WHERE other.id<>OLD.id AND other.active=1 AND role.code='admin'
  )
BEGIN
  SELECT RAISE(ABORT,'last_active_admin');
END;
--> statement-breakpoint

-- Provisional operational roles are intentionally organization-wide bootstrap
-- roles. They receive every non-restricted hierarchical theme, but remain
-- inert while vacant and must be replaced when the official schedule arrives.
INSERT OR IGNORE INTO `app_information_domain_assignments`
  (`domain_id`,`principal_type`,`principal_id`,`member_role`,`grant_source`)
SELECT DISTINCT domain.id,'staff_position',position.id,
  CASE WHEN profile.code LIKE '%_editor' THEN 'editor' ELSE 'reviewer' END,
  'provisional_organization_bootstrap'
FROM `app_staff_positions` position
JOIN `app_access_profile_assignments` assignment
  ON assignment.principal_type='staff_position' AND assignment.principal_id=position.id AND assignment.active=1
JOIN `app_access_profiles` profile ON profile.id=assignment.access_profile_id AND profile.active=1
JOIN `app_information_domains` domain ON domain.active=1 AND domain.visibility<>'restricted'
WHERE position.active=1 AND position.source_file='Tizim tomonidan yaratilgan'
  AND position.data_status='provisional_requires_staff_import'
  AND profile.code IN (
    'territorial_leadership','territorial_unit_reviewer','territorial_unit_editor',
    'district_leadership','district_editor','direct_org_leadership','direct_org_editor',
    'organization_leadership','organization_editor'
  )
  AND EXISTS (
    SELECT 1 FROM `app_information_templates` template
    JOIN `app_information_template_workflows` workflow
      ON workflow.template_id=template.id AND workflow.active=1 AND workflow.entry_scope='hierarchical'
    WHERE template.domain_id=domain.id AND template.active=1 AND template.visibility<>'restricted'
  );
--> statement-breakpoint

-- Real organization-wide leaders may review every non-restricted hierarchical
-- theme in their own organization/subtree. Restricted themes always require an
-- explicit administrator grant.
INSERT OR IGNORE INTO `app_information_domain_assignments`
  (`domain_id`,`principal_type`,`principal_id`,`member_role`,`grant_source`)
SELECT DISTINCT domain.id,'staff_position',position.id,'reviewer','organization_leadership_default'
FROM `app_staff_positions` position
JOIN `app_access_profile_assignments` assignment
  ON assignment.principal_type='staff_position' AND assignment.principal_id=position.id AND assignment.active=1
JOIN `app_access_profiles` profile ON profile.id=assignment.access_profile_id AND profile.active=1
JOIN `app_information_domains` domain ON domain.active=1 AND domain.visibility<>'restricted'
WHERE position.active=1 AND position.source_file<>'Tizim tomonidan yaratilgan'
  AND profile.code IN ('territorial_leadership','district_leadership','direct_org_leadership','organization_leadership')
  AND EXISTS (
    SELECT 1 FROM `app_information_templates` template
    JOIN `app_information_template_workflows` workflow
      ON workflow.template_id=template.id AND workflow.active=1 AND workflow.entry_scope='hierarchical'
    WHERE template.domain_id=domain.id AND template.active=1 AND template.visibility<>'restricted'
  );
--> statement-breakpoint

-- Direct-subordinate specialists receive only deterministic themes inferred
-- from their imported department/subunit/title, never the entire catalogue.
-- Administrators can narrow, revoke or add an explicit grant through the API.
INSERT OR IGNORE INTO `app_information_domain_assignments`
  (`domain_id`,`principal_type`,`principal_id`,`member_role`,`grant_source`)
SELECT DISTINCT domain.id,'staff_position',position.id,'editor','staff_department_mapping'
FROM `app_staff_positions` position
JOIN `app_organizations` organization ON organization.id=position.organization_id AND organization.active=1 AND organization.type='direct_subordinate'
JOIN `app_access_profile_assignments` assignment
  ON assignment.principal_type='staff_position' AND assignment.principal_id=position.id AND assignment.active=1
JOIN `app_access_profiles` profile ON profile.id=assignment.access_profile_id AND profile.active=1 AND profile.code='direct_org_editor'
JOIN `app_information_domains` domain ON domain.active=1 AND domain.visibility<>'restricted'
WHERE position.active=1 AND position.source_file<>'Tizim tomonidan yaratilgan'
  AND EXISTS (
    SELECT 1 FROM `app_information_templates` template
    JOIN `app_information_template_workflows` workflow
      ON workflow.template_id=template.id AND workflow.active=1 AND workflow.entry_scope='hierarchical'
    WHERE template.domain_id=domain.id AND template.active=1 AND template.visibility<>'restricted'
  )
  AND CASE
    WHEN (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Бухгалтер%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%бухгалтер%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Молия%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%молия%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%иқтисод%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Иқтисод%'
      THEN domain.code IN ('FINANCE','ACCOUNTING','SRC_FINANCE_ECONOMY')
    WHEN (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Кадр%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%кадр%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%инсон ресурс%'
      THEN domain.code IN ('HUMAN_RESOURCES','SRC_HUMAN_RESOURCES')
    WHEN (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Юрид%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%юрид%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Юрис%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%юрис%'
      THEN domain.code IN ('LEGAL','SRC_LEGAL_SERVICE')
    WHEN (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Аудит%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%аудит%'
      THEN domain.code='INTERNAL_AUDIT'
    WHEN (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Корруп%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%корруп%'
      THEN domain.code IN ('ANTICORRUPTION','SRC_ANTI_CORRUPTION')
    WHEN (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Ахборот%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%ахборот%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Рақам%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%рақам%'
      THEN domain.code IN ('DIGITALIZATION','SRC_DIGITALIZATION_INNOVATION')
    WHEN (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Халқаро%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%халқаро%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Инвести%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%инвести%'
      THEN domain.code IN ('INTERNATIONAL_INVESTMENT','SRC_INVESTMENTS_PPP')
    WHEN (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Ижро%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%ижро%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%ташкилий назорат%'
      THEN domain.code IN ('EXECUTION_CONTROL','SRC_EXECUTION_DISCIPLINE')
    WHEN (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Матбуот%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%матбуот%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%мурожаат%'
      THEN domain.code IN ('LEADERSHIP','SRC_PRESS_SERVICE','SRC_APPEALS')
    WHEN (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%йўлдан фойдаланиш%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Йўлдан фойдаланиш%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%сақлаш%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%таъмир%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Механиза%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%механиза%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Техника%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%техника%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Вазн%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%вазн%'
      THEN domain.code IN ('MAINTENANCE','SRC_MAINTENANCE_REPAIR','SRC_ROADSIDE_INFRASTRUCTURE','SRC_ROAD_MACHINERY')
    WHEN (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Қурилиш%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%қурилиш%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Лойиҳа%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%лойиҳа%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Кадастр%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%кадастр%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Диагност%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%диагност%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%Геодез%'
      OR (position.department_name||' '||position.subunit_name||' '||position.title) LIKE '%геодез%'
      THEN domain.code IN ('NETWORK_DEVELOPMENT','PLANNING_ANALYTICS','SRC_ROAD_NETWORK_DEVELOPMENT','SRC_INDUSTRIAL_INFRASTRUCTURE')
    ELSE 0 END;
--> statement-breakpoint

INSERT INTO `app_access_profile_assignments`
  (`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`,`include_descendants`,`grant_source`)
SELECT 'staff_position',position.id,profile.id,'department',department.id,0,'workflow_owner_approver'
FROM `app_departments` department
JOIN `app_organizations` organization ON organization.id=department.organization_id AND organization.type='central'
JOIN `app_staff_positions` position ON position.department_id=department.id AND position.active=1
JOIN `app_access_profiles` profile ON profile.code='central_unit_approver'
WHERE department.active=1 AND department.name NOT IN ('Rahbariyat','Texnik xodimlar')
  AND (position.title LIKE '%Bosh mutaxassis%' OR position.title LIKE '%Yetakchi mutaxassis%'
    OR position.title LIKE '%bosh auditor%' OR position.title LIKE '%Bosh auditor%'
    OR position.title LIKE '%yuriskonsult%' OR position.title LIKE '%Yuriskonsult%')
  AND NOT EXISTS (
    SELECT 1 FROM `app_access_profile_assignments` existing
    JOIN `app_access_profiles` existing_profile ON existing_profile.id=existing.access_profile_id
    JOIN `app_position_occupancies` occupancy ON existing.principal_type='staff_position'
      AND occupancy.staff_position_id=existing.principal_id AND occupancy.ends_at IS NULL
    JOIN `app_employees` employee ON employee.id=occupancy.employee_id AND employee.active=1
    WHERE existing.active=1 AND existing.scope_type='department' AND existing.scope_id=department.id
      AND existing_profile.code='central_unit_approver'
  )
ON CONFLICT(`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`) DO UPDATE SET
  `active`=1,`grant_source`='workflow_owner_approver',`updated_at`=CURRENT_TIMESTAMP;
