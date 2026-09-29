-- Secure, position-aware credential provisioning and explicit information-workflow scopes.
-- Temporary plaintext passwords are deliberately absent from this migration and every table.

ALTER TABLE `app_user_credentials` ADD `temporary_expires_at` text;
--> statement-breakpoint

CREATE TABLE `app_access_profiles` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `code` text NOT NULL,
  `name` text NOT NULL,
  `organization_type` text DEFAULT '*' NOT NULL,
  `view_scope` text DEFAULT 'own' NOT NULL,
  `information_scope` text DEFAULT 'assigned' NOT NULL,
  `can_enter_information` integer DEFAULT false NOT NULL,
  `can_submit_information` integer DEFAULT false NOT NULL,
  `can_verify_information` integer DEFAULT false NOT NULL,
  `can_approve_information` integer DEFAULT false NOT NULL,
  `can_view_all_information` integer DEFAULT false NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_access_profiles_code_unique` ON `app_access_profiles` (`code`);
--> statement-breakpoint
CREATE INDEX `app_access_profiles_org_type_idx` ON `app_access_profiles` (`organization_type`,`active`);
--> statement-breakpoint

CREATE TABLE `app_access_profile_assignments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `principal_type` text NOT NULL,
  `principal_id` integer NOT NULL,
  `access_profile_id` integer NOT NULL,
  `scope_type` text DEFAULT 'organization' NOT NULL,
  `scope_id` integer DEFAULT 0 NOT NULL,
  `include_descendants` integer DEFAULT false NOT NULL,
  `grant_source` text DEFAULT 'automatic' NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `created_by_employee_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_access_profile_assignments_unique` ON `app_access_profile_assignments` (`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`);
--> statement-breakpoint
CREATE INDEX `app_access_profile_assignments_principal_idx` ON `app_access_profile_assignments` (`principal_type`,`principal_id`,`active`);
--> statement-breakpoint
CREATE INDEX `app_access_profile_assignments_scope_idx` ON `app_access_profile_assignments` (`scope_type`,`scope_id`,`active`);
--> statement-breakpoint

CREATE TABLE `app_position_credentials` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `staff_position_id` integer NOT NULL,
  `slot_number` integer DEFAULT 1 NOT NULL,
  `username` text NOT NULL,
  `username_normalized` text NOT NULL,
  `password_hash` text NOT NULL,
  `password_salt` text NOT NULL,
  `password_iterations` integer DEFAULT 100000 NOT NULL,
  `status` text DEFAULT 'reserved' NOT NULL,
  `assigned_employee_id` integer,
  `must_change_password` integer DEFAULT true NOT NULL,
  `generated_by_employee_id` integer NOT NULL,
  `generated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `activated_at` text,
  `revoked_at` text,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_position_credentials_position_slot_unique` ON `app_position_credentials` (`staff_position_id`,`slot_number`);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_position_credentials_username_unique` ON `app_position_credentials` (`username_normalized`);
--> statement-breakpoint
CREATE INDEX `app_position_credentials_status_idx` ON `app_position_credentials` (`status`,`staff_position_id`);
--> statement-breakpoint
CREATE INDEX `app_position_credentials_employee_idx` ON `app_position_credentials` (`assigned_employee_id`,`status`);
--> statement-breakpoint

INSERT INTO `app_access_profiles`
  (`code`,`name`,`organization_type`,`view_scope`,`information_scope`,`can_enter_information`,`can_submit_information`,`can_verify_information`,`can_approve_information`,`can_view_all_information`,`description`)
VALUES
  ('system_administrator','Tizim administratori','*','all','all',1,1,1,1,1,'Tizim sozlamalari, rollar va barcha ma’lumotlar.'),
  ('committee_leadership','Qo‘mita rahbariyati','central','all','all',0,0,1,1,1,'Barcha darajadagi ma’lumotlarni ko‘radi va yakuniy qaror qabul qiladi.'),
  ('central_unit_approver','Markaziy apparat tasdiqlovchisi','central','department','assigned',1,1,1,1,0,'Tegishli yo‘nalish ma’lumotini tekshiradi, tasdiqlaydi va rahbariyatga chiqaradi.'),
  ('central_unit_editor','Markaziy apparat ma’lumot kirituvchisi','central','department','assigned',1,1,0,0,0,'Markaziy apparatning bevosita ko‘rsatkichlarini kiritadi va tasdiqlashga yuboradi.'),
  ('territorial_leadership','Hududiy boshqarma rahbariyati','territorial','subtree','organization',1,1,1,1,0,'Hudud va unga bo‘ysunuvchi korxonalar ma’lumotini ko‘radi hamda Qo‘mitaga yuborishni tasdiqlaydi.'),
  ('territorial_unit_reviewer','Hududiy bo‘lim yoki sho‘ba tasdiqlovchisi','territorial','department','assigned',1,1,1,0,0,'Tumanlardan kelgan tegishli yo‘nalish ma’lumotini tekshiradi va hududiy rahbariyatga yuboradi.'),
  ('territorial_unit_editor','Hududiy ma’lumot kirituvchisi','territorial','department','assigned',1,1,0,0,0,'Hududiy boshqarma ko‘rsatkichlarini kiritadi va tekshiruvga yuboradi.'),
  ('district_leadership','Tuman korxonasi rahbariyati','district','subtree','organization',1,1,1,1,0,'Tuman ma’lumotini tasdiqlaydi va hududiy boshqarmaga yuboradi.'),
  ('district_editor','Tuman ma’lumot kirituvchisi','district','department','assigned',1,1,0,0,0,'Birlamchi ma’lumotni tuman darajasida kiritadi va tasdiqlashga yuboradi.'),
  ('direct_org_leadership','Bevosita bo‘ysunuvchi tashkilot rahbariyati','direct_subordinate','subtree','organization',1,1,1,1,0,'Tashkilot ma’lumotini tasdiqlaydi va Qo‘mitaga yuboradi.'),
  ('direct_org_editor','Bevosita bo‘ysunuvchi tashkilot ma’lumot kirituvchisi','direct_subordinate','department','assigned',1,1,0,0,0,'Tashkilot ma’lumotini kiritadi va tasdiqlashga yuboradi.'),
  ('organization_leadership','Tizim tashkiloti rahbariyati','*','subtree','organization',1,1,1,1,0,'Tashkilot doirasidagi ma’lumotni tasdiqlaydi va yuqori bo‘g‘inga yuboradi.'),
  ('organization_editor','Tizim tashkiloti ma’lumot kirituvchisi','*','department','assigned',1,1,0,0,0,'Tegishli birlamchi ma’lumotni kiritadi.'),
  ('employee_personal','Xodimning shaxsiy ish maydoni','*','own','assigned',0,0,0,0,0,'Faqat shaxsiy topshiriqlar, uchrashuvlar, chat va alohida biriktirilgan ma’lumotlar.');
--> statement-breakpoint

UPDATE `app_roles`
SET `permissions_json`=json_set(
  `permissions_json`,
  '$.canManageInformation',CASE WHEN `code`='admin' THEN json('true') ELSE json('false') END,
  '$.canViewRestrictedInformation',CASE WHEN `code`='admin' THEN json('true') ELSE json('false') END,
  '$.informationScope',CASE
    WHEN `code` IN ('admin','rahbar','orinbosar') THEN 'all'
    WHEN `code`='boshqarma' THEN 'department'
    ELSE 'assigned' END,
  '$.canEnterInformation',CASE WHEN `code`='admin' THEN json('true') ELSE json('false') END,
  '$.canSubmitInformation',CASE WHEN `code`='admin' THEN json('true') ELSE json('false') END,
  '$.canVerifyInformation',CASE WHEN `code`='admin' THEN json('true') ELSE json('false') END,
  '$.canApproveInformation',CASE WHEN `code`='admin' THEN json('true') ELSE json('false') END
);
--> statement-breakpoint

INSERT INTO `app_roles` (`code`,`name`,`level`,`permissions_json`,`is_system`)
VALUES
  ('hudud_rahbari','Hududiy boshqarma rahbari',25,'{"viewScope":"subtree","assignScope":"subtree","canCreateTask":true,"canCreateMeeting":true,"canExport":true,"canManageOrganization":false,"canManageRoles":false,"canConfigure":false,"canViewAudit":true,"canUpdateAnyTask":false,"canManageReports":true,"canManageInformation":false,"canViewRestrictedInformation":false,"informationScope":"organization","canEnterInformation":true,"canSubmitInformation":true,"canVerifyInformation":true,"canApproveInformation":true}',1),
  ('hudud_tasdiqlovchi','Hududiy bo‘lim yoki sho‘ba tasdiqlovchisi',35,'{"viewScope":"department","assignScope":"department","canCreateTask":true,"canCreateMeeting":false,"canExport":true,"canManageOrganization":false,"canManageRoles":false,"canConfigure":false,"canViewAudit":false,"canUpdateAnyTask":false,"canManageReports":true,"canManageInformation":false,"canViewRestrictedInformation":false,"informationScope":"assigned","canEnterInformation":true,"canSubmitInformation":true,"canVerifyInformation":true,"canApproveInformation":false}',1),
  ('tuman_rahbari','Tuman korxonasi rahbari',35,'{"viewScope":"subtree","assignScope":"subtree","canCreateTask":true,"canCreateMeeting":true,"canExport":true,"canManageOrganization":false,"canManageRoles":false,"canConfigure":false,"canViewAudit":true,"canUpdateAnyTask":false,"canManageReports":true,"canManageInformation":false,"canViewRestrictedInformation":false,"informationScope":"organization","canEnterInformation":true,"canSubmitInformation":true,"canVerifyInformation":true,"canApproveInformation":true}',1),
  ('tashkilot_rahbari','Tizim tashkiloti rahbari',35,'{"viewScope":"subtree","assignScope":"subtree","canCreateTask":true,"canCreateMeeting":true,"canExport":true,"canManageOrganization":false,"canManageRoles":false,"canConfigure":false,"canViewAudit":true,"canUpdateAnyTask":false,"canManageReports":true,"canManageInformation":false,"canViewRestrictedInformation":false,"informationScope":"organization","canEnterInformation":true,"canSubmitInformation":true,"canVerifyInformation":true,"canApproveInformation":true}',1),
  ('malumot_kirituvchi','Ma’lumot kirituvchi',45,'{"viewScope":"own","assignScope":"none","canCreateTask":false,"canCreateMeeting":false,"canExport":true,"canManageOrganization":false,"canManageRoles":false,"canConfigure":false,"canViewAudit":false,"canUpdateAnyTask":false,"canManageReports":false,"canManageInformation":false,"canViewRestrictedInformation":false,"informationScope":"assigned","canEnterInformation":true,"canSubmitInformation":true,"canVerifyInformation":false,"canApproveInformation":false}',1)
ON CONFLICT(`code`) DO UPDATE SET `name`=excluded.`name`,`level`=excluded.`level`,`permissions_json`=excluded.`permissions_json`,`active`=1,`updated_at`=CURRENT_TIMESTAMP;
--> statement-breakpoint

-- Existing named employees receive an explicit access profile without changing their current application role.
INSERT OR IGNORE INTO `app_access_profile_assignments`
  (`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`,`include_descendants`,`grant_source`)
SELECT 'employee',e.id,p.id,
  CASE WHEN r.code IN ('admin','rahbar','orinbosar') THEN 'global' WHEN e.department_id IS NOT NULL THEN 'department' ELSE 'organization' END,
  CASE WHEN r.code IN ('admin','rahbar','orinbosar') THEN 0 WHEN e.department_id IS NOT NULL THEN e.department_id ELSE COALESCE(e.organization_id,0) END,
  CASE WHEN r.code IN ('admin','rahbar','orinbosar') THEN 1 ELSE 0 END,
  'migration_role_mapping'
FROM `app_employees` e
JOIN `app_roles` r ON r.id=e.role_id
JOIN `app_organizations` o ON o.id=e.organization_id
JOIN `app_access_profiles` p ON p.code=CASE
  WHEN r.code='admin' THEN 'system_administrator'
  WHEN r.code IN ('rahbar','orinbosar') THEN 'committee_leadership'
  WHEN o.type='central' AND r.code='boshqarma' THEN 'central_unit_approver'
  WHEN o.type='central' AND (
    e.position LIKE '%mutaxassis%' OR e.position LIKE '%Mutaxassis%'
    OR e.position LIKE '%muhandis%' OR e.position LIKE '%Muhandis%'
    OR e.position LIKE '%hisobchi%' OR e.position LIKE '%Hisobchi%'
    OR e.position LIKE '%iqtisodchi%' OR e.position LIKE '%Iqtisodchi%'
    OR e.position LIKE '%auditor%' OR e.position LIKE '%Auditor%'
    OR e.position LIKE '%yuriskonsult%' OR e.position LIKE '%Yuriskonsult%'
    OR e.position LIKE '%operator%' OR e.position LIKE '%Operator%'
    OR e.position LIKE '%inspektor%' OR e.position LIKE '%Inspektor%'
  ) THEN 'central_unit_editor'
  ELSE 'employee_personal' END
WHERE e.active=1;
--> statement-breakpoint

-- Organizations without an imported staff schedule receive the minimum operational placeholders.
-- Territorial organizations need a separate unit review and leadership approval stage.
-- These rows are not represented as official posts and must be replaced by an HR-approved import.
INSERT INTO `app_staff_positions`
  (`organization_id`,`department_name`,`subunit_name`,`title`,`employee_category`,`position_status`,`headcount_units`,`fte_rate`,`effective_from`,`document_type`,`source_file`,`data_status`,`note`,`active`)
SELECT o.id,'','',CASE WHEN o.type='territorial' THEN 'Hududiy rahbariyat tasdiqlovchisi' ELSE 'Tashkilot tasdiqlovchisi' END,'Operatsion rol','Rezerv — xodim biriktirilmaguncha login faol emas',1,1,NULL,'Vaqtinchalik operatsion rol','Tizim tomonidan yaratilgan','provisional_requires_staff_import','Rasmiy shtat emas. Tashkilot shtat jadvali import qilingach almashtiriladi.',1
FROM `app_organizations` o
WHERE o.active=1
  AND NOT EXISTS (SELECT 1 FROM `app_staff_positions` s WHERE s.organization_id=o.id AND s.active=1)
  AND NOT EXISTS (SELECT 1 FROM `app_staff_positions` s WHERE s.organization_id=o.id AND s.source_file='Tizim tomonidan yaratilgan' AND s.title IN ('Tashkilot tasdiqlovchisi','Hududiy rahbariyat tasdiqlovchisi'));
--> statement-breakpoint
INSERT INTO `app_staff_positions`
  (`organization_id`,`department_name`,`subunit_name`,`title`,`employee_category`,`position_status`,`headcount_units`,`fte_rate`,`effective_from`,`document_type`,`source_file`,`data_status`,`note`,`active`)
SELECT o.id,'','','Ma’lumot kirituvchi','Operatsion rol','Rezerv — xodim biriktirilmaguncha login faol emas',1,1,NULL,'Vaqtinchalik operatsion rol','Tizim tomonidan yaratilgan','provisional_requires_staff_import','Rasmiy shtat emas. Tashkilot shtat jadvali import qilingach almashtiriladi.',1
FROM `app_organizations` o
WHERE o.active=1
  AND EXISTS (SELECT 1 FROM `app_staff_positions` s WHERE s.organization_id=o.id AND s.source_file='Tizim tomonidan yaratilgan' AND s.title IN ('Tashkilot tasdiqlovchisi','Hududiy rahbariyat tasdiqlovchisi'))
  AND NOT EXISTS (SELECT 1 FROM `app_staff_positions` s WHERE s.organization_id=o.id AND s.source_file='Tizim tomonidan yaratilgan' AND s.title='Ma’lumot kirituvchi');
--> statement-breakpoint
INSERT INTO `app_staff_positions`
  (`organization_id`,`department_name`,`subunit_name`,`title`,`employee_category`,`position_status`,`headcount_units`,`fte_rate`,`effective_from`,`document_type`,`source_file`,`data_status`,`note`,`active`)
SELECT o.id,'','','Hududiy bo‘lim tasdiqlovchisi','Operatsion rol','Rezerv — xodim biriktirilmaguncha login faol emas',1,1,NULL,'Vaqtinchalik operatsion rol','Tizim tomonidan yaratilgan','provisional_requires_staff_import','Rasmiy shtat emas. Tashkilot shtat jadvali import qilingach almashtiriladi.',1
FROM `app_organizations` o
WHERE o.active=1 AND o.type='territorial'
  AND EXISTS (SELECT 1 FROM `app_staff_positions` s WHERE s.organization_id=o.id AND s.source_file='Tizim tomonidan yaratilgan' AND s.title='Hududiy rahbariyat tasdiqlovchisi')
  AND NOT EXISTS (SELECT 1 FROM `app_staff_positions` s WHERE s.organization_id=o.id AND s.source_file='Tizim tomonidan yaratilgan' AND s.title='Hududiy bo‘lim tasdiqlovchisi');
--> statement-breakpoint

-- Every active staff position receives a deterministic role/scope profile, including vacant positions.
INSERT OR IGNORE INTO `app_access_profile_assignments`
  (`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`,`include_descendants`,`grant_source`)
SELECT 'staff_position',s.id,p.id,
  CASE WHEN o.type='central' AND s.department_id IS NOT NULL THEN 'department' ELSE 'organization' END,
  CASE WHEN o.type='central' AND s.department_id IS NOT NULL THEN s.department_id ELSE s.organization_id END,
  CASE WHEN p.code IN ('committee_leadership','territorial_leadership','district_leadership','direct_org_leadership','organization_leadership') THEN 1 ELSE 0 END,
  'staff_schedule_mapping'
FROM `app_staff_positions` s
JOIN `app_organizations` o ON o.id=s.organization_id
-- Keep the first checkpoint deliberately conservative and D1-safe. The full
-- least-privilege classifier is applied by the smaller reconciliation steps
-- in 0023; wrapping the historical monolithic CASE prevents workerd's
-- expression compiler from rejecting the migration before it reaches them.
JOIN `app_access_profiles` p ON p.code='employee_personal' /* historical classifier:
  WHEN o.type='central'
    AND (s.title LIKE '%Qo‘mita raisi%' OR s.title LIKE '%Rais o‘rinbosari%' OR s.title LIKE '%Rais o‘rinbosari - bosh muhandis%')
    AND s.title NOT LIKE '%yordamchi%' AND s.title NOT LIKE '%Yordamchi%'
    AND s.title NOT LIKE '%maslahatchi%' AND s.title NOT LIKE '%Maslahatchi%'
    AND s.title NOT LIKE '%haydovchi%' AND s.title NOT LIKE '%Haydovchi%' AND s.title NOT LIKE '%kotib%' AND s.title NOT LIKE '%Kotib%'
    AND s.title NOT LIKE '%ҳайдовчи%' AND s.title NOT LIKE '%котиб%' AND s.title NOT LIKE '%ёрдамчи%' AND s.title NOT LIKE '%маслаҳатчи%'
    THEN 'committee_leadership'
  WHEN o.type='central' AND (s.title LIKE '%Boshqarma boshlig%' OR s.title LIKE '%Bo‘lim boshlig%') THEN 'central_unit_approver'
  WHEN o.type='central' AND (
    s.title LIKE '%mutaxassis%' OR s.title LIKE '%Mutaxassis%'
    OR s.title LIKE '%muhandis%' OR s.title LIKE '%Muhandis%'
    OR s.title LIKE '%hisobchi%' OR s.title LIKE '%Hisobchi%'
    OR s.title LIKE '%iqtisodchi%' OR s.title LIKE '%Iqtisodchi%'
    OR s.title LIKE '%auditor%' OR s.title LIKE '%Auditor%'
    OR s.title LIKE '%yuriskonsult%' OR s.title LIKE '%Yuriskonsult%'
    OR s.title LIKE '%operator%' OR s.title LIKE '%Operator%'
    OR s.title LIKE '%inspektor%' OR s.title LIKE '%Inspektor%'
    OR s.title='Ma’lumot kirituvchi'
  ) THEN 'central_unit_editor'
  WHEN s.title='Hududiy rahbariyat tasdiqlovchisi' AND o.type='territorial' THEN 'territorial_leadership'
  WHEN s.title='Hududiy bo‘lim tasdiqlovchisi' AND o.type='territorial' THEN 'territorial_unit_reviewer'
  WHEN s.title='Tashkilot tasdiqlovchisi' AND o.type='district' THEN 'district_leadership'
  WHEN s.title='Tashkilot tasdiqlovchisi' AND o.type='direct_subordinate' THEN 'direct_org_leadership'
  WHEN s.title='Tashkilot tasdiqlovchisi' THEN 'organization_leadership'
  WHEN s.title='Ma’lumot kirituvchi' AND o.type='territorial' THEN 'territorial_unit_editor'
  WHEN s.title='Ma’lumot kirituvchi' AND o.type='district' THEN 'district_editor'
  WHEN s.title='Ma’lumot kirituvchi' AND o.type='direct_subordinate' THEN 'direct_org_editor'
  WHEN s.title='Ma’lumot kirituvchi' THEN 'organization_editor'
  WHEN o.type='territorial'
    AND (s.title LIKE '%Бош бошқарма бошли%' OR s.title LIKE '%бош бошқарма бошли%' OR s.title IN ('Раҳбар','раҳбар'))
    AND s.title NOT LIKE '%ҳайдовчи%' AND s.title NOT LIKE '%котиб%' AND s.title NOT LIKE '%ёрдамчи%' AND s.title NOT LIKE '%маслаҳатчи%'
    THEN 'territorial_leadership'
  WHEN o.type='territorial' AND (s.title LIKE '%Бўлим бошли%' OR s.title LIKE '%бўлим бошли%' OR s.title LIKE '%Шуъба бошли%' OR s.title LIKE '%шуъба бошли%' OR s.title LIKE '%Бош муҳандис%' OR s.title LIKE '%бош муҳандис%' OR s.title LIKE '%ўринбосари%') THEN 'territorial_unit_reviewer'
  WHEN o.type='territorial' AND (s.title LIKE '%мутахассис%' OR s.title LIKE '%Мутахассис%' OR s.title LIKE '%муҳандис%' OR s.title LIKE '%Муҳандис%' OR s.title LIKE '%ҳисобчи%' OR s.title LIKE '%Ҳисобчи%' OR s.title LIKE '%иқтисодчи%' OR s.title LIKE '%Иқтисодчи%' OR s.title LIKE '%аудитор%' OR s.title LIKE '%Аудитор%' OR s.title LIKE '%юрисконсульт%' OR s.title LIKE '%Юрисконсульт%' OR s.title LIKE '%оператор%' OR s.title LIKE '%Оператор%' OR s.title LIKE '%диспетчер%' OR s.title LIKE '%Диспетчер%' OR s.title LIKE '%инспектор%' OR s.title LIKE '%Инспектор%') THEN 'territorial_unit_editor'
  WHEN o.type='district'
    AND (s.title LIKE '%Корхона бошли%' OR s.title LIKE '%корхона бошли%'
      OR s.title IN ('Директор','директор','Раҳбар','раҳбар')
      OR s.title LIKE 'Директор ўринбосари%' OR s.title LIKE 'директор ўринбосари%'
      OR s.title LIKE 'Директорнинг %ўринбосари%' OR s.title LIKE 'директорнинг %ўринбосари%'
      OR s.title LIKE '% бўйича директор ўринбосари%')
    AND s.title NOT LIKE '%ҳайдовчи%' AND s.title NOT LIKE '%котиб%' AND s.title NOT LIKE '%ёрдамчи%' AND s.title NOT LIKE '%маслаҳатчи%'
    THEN 'district_leadership'
  WHEN o.type='district' AND (s.title LIKE '%мутахассис%' OR s.title LIKE '%Мутахассис%' OR s.title LIKE '%муҳандис%' OR s.title LIKE '%Муҳандис%' OR s.title LIKE '%ҳисобчи%' OR s.title LIKE '%Ҳисобчи%' OR s.title LIKE '%иқтисодчи%' OR s.title LIKE '%Иқтисодчи%' OR s.title LIKE '%аудитор%' OR s.title LIKE '%Аудитор%' OR s.title LIKE '%юрисконсульт%' OR s.title LIKE '%Юрисконсульт%' OR s.title LIKE '%оператор%' OR s.title LIKE '%Оператор%' OR s.title LIKE '%диспетчер%' OR s.title LIKE '%Диспетчер%' OR s.title LIKE '%инспектор%' OR s.title LIKE '%Инспектор%') THEN 'district_editor'
  WHEN o.type='direct_subordinate'
    AND (s.title IN ('Директор','директор','Раҳбар','раҳбар')
      OR s.title LIKE 'Директор ўринбосари%' OR s.title LIKE 'директор ўринбосари%'
      OR s.title LIKE 'Директорнинг %ўринбосари%' OR s.title LIKE 'директорнинг %ўринбосари%'
      OR s.title LIKE '% бўйича директор ўринбосари%')
    AND s.title NOT LIKE '%ҳайдовчи%' AND s.title NOT LIKE '%котиб%' AND s.title NOT LIKE '%ёрдамчи%' AND s.title NOT LIKE '%маслаҳатчи%'
    THEN 'direct_org_leadership'
  WHEN o.type='direct_subordinate' AND (s.title LIKE '%Бўлим бошли%' OR s.title LIKE '%бўлим бошли%' OR s.title LIKE '%Шуъба бошли%' OR s.title LIKE '%шуъба бошли%' OR s.title LIKE '%Бош муҳандис%' OR s.title LIKE '%бош муҳандис%' OR s.title LIKE '%ўринбосари%' OR s.title LIKE '%мутахассис%' OR s.title LIKE '%Мутахассис%' OR s.title LIKE '%муҳандис%' OR s.title LIKE '%Муҳандис%' OR s.title LIKE '%ҳисобчи%' OR s.title LIKE '%Ҳисобчи%' OR s.title LIKE '%иқтисодчи%' OR s.title LIKE '%Иқтисодчи%' OR s.title LIKE '%аудитор%' OR s.title LIKE '%Аудитор%' OR s.title LIKE '%юрисконсульт%' OR s.title LIKE '%Юрисконсульт%' OR s.title LIKE '%оператор%' OR s.title LIKE '%Оператор%' OR s.title LIKE '%диспетчер%' OR s.title LIKE '%Диспетчер%' OR s.title LIKE '%инспектор%' OR s.title LIKE '%Инспектор%') THEN 'direct_org_editor'
  WHEN (s.title LIKE '%Бош бошқарма бошли%' OR s.title LIKE '%бош бошқарма бошли%'
      OR s.title LIKE '%Корхона бошли%' OR s.title LIKE '%корхона бошли%'
      OR s.title IN ('Директор','директор','Раҳбар','раҳбар'))
    AND s.title NOT LIKE '%ҳайдовчи%' AND s.title NOT LIKE '%котиб%' AND s.title NOT LIKE '%ёрдамчи%' AND s.title NOT LIKE '%маслаҳатчи%'
    THEN 'organization_leadership'
  WHEN s.title LIKE '%мутахассис%' OR s.title LIKE '%Мутахассис%' OR s.title LIKE '%муҳандис%' OR s.title LIKE '%Муҳандис%' OR s.title LIKE '%ҳисобчи%' OR s.title LIKE '%Ҳисобчи%' OR s.title LIKE '%иқтисодчи%' OR s.title LIKE '%оператор%' OR s.title LIKE '%диспетчер%' THEN 'organization_editor'
  ELSE 'employee_personal' END */
WHERE s.active=1;
--> statement-breakpoint

-- A position that formally manages a second department receives an additional,
-- exact department-scoped approval grant. This preserves the source schedule's
-- combined roles without granting organization-wide approval.
INSERT OR IGNORE INTO `app_access_profile_assignments`
  (`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`,`include_descendants`,`grant_source`)
SELECT 'staff_position',role.staff_position_id,profile.id,'department',role.department_id,0,'secondary_department_management'
FROM `app_staff_position_roles` role
JOIN `app_staff_positions` position ON position.id=role.staff_position_id AND position.active=1
JOIN `app_organizations` organization ON organization.id=position.organization_id AND organization.type='central'
JOIN `app_access_profile_assignments` primary_assignment
  ON primary_assignment.principal_type='staff_position' AND primary_assignment.principal_id=position.id AND primary_assignment.active=1
JOIN `app_access_profiles` profile ON profile.id=primary_assignment.access_profile_id AND profile.code='central_unit_approver'
JOIN `app_departments` department ON department.id=role.department_id AND department.active=1 AND department.organization_id=position.organization_id
WHERE role.role_type='secondary_manager';
--> statement-breakpoint

-- A few independent professional services have no separate head row in the
-- approved source schedule. Their data-capable occupied positions share an
-- explicit department-only approval duty so the creator can never self-approve.
-- Technical/support departments are intentionally excluded.
INSERT OR IGNORE INTO `app_access_profile_assignments`
  (`principal_type`,`principal_id`,`access_profile_id`,`scope_type`,`scope_id`,`include_descendants`,`grant_source`)
SELECT 'staff_position',position.id,profile.id,'department',department.id,0,'workflow_owner_approver'
FROM `app_departments` department
JOIN `app_organizations` organization ON organization.id=department.organization_id AND organization.type='central'
JOIN `app_staff_positions` position ON position.department_id=department.id AND position.active=1
JOIN `app_access_profiles` profile ON profile.code='central_unit_approver'
WHERE department.active=1
  AND department.name NOT IN ('Rahbariyat','Texnik xodimlar')
  AND (position.title LIKE '%Bosh mutaxassis%' OR position.title LIKE '%Yetakchi mutaxassis%'
    OR position.title LIKE '%bosh auditor%' OR position.title LIKE '%Bosh auditor%'
    OR position.title LIKE '%yuriskonsult%' OR position.title LIKE '%Yuriskonsult%')
  AND NOT EXISTS (
    SELECT 1 FROM `app_access_profile_assignments` existing
    JOIN `app_access_profiles` existing_profile ON existing_profile.id=existing.access_profile_id
    JOIN `app_position_occupancies` existing_occupancy
      ON existing.principal_type='staff_position' AND existing_occupancy.staff_position_id=existing.principal_id AND existing_occupancy.ends_at IS NULL
    JOIN `app_employees` existing_employee ON existing_employee.id=existing_occupancy.employee_id AND existing_employee.active=1
    WHERE existing.principal_type='staff_position' AND existing.active=1
      AND existing.scope_type='department' AND existing.scope_id=department.id
      AND existing_profile.code='central_unit_approver'
  );
