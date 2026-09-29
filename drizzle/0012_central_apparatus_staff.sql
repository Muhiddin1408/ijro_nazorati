-- Official Committee central apparatus staff schedule.
-- Source checksum: efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e
-- Committee order No. 25 dated 2026-04-30, effective 2026-05-01; 19 units, 57 position lines, 76 staff units.
-- The alternate Transport Ministry worksheet and document signatories are intentionally excluded.
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `app_staff_position_roles` (
  `staff_position_id` integer NOT NULL,
  `department_id` integer NOT NULL,
  `role_type` text DEFAULT 'secondary_manager' NOT NULL,
  `note` text DEFAULT '' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `app_staff_position_roles_unique` ON `app_staff_position_roles` (`staff_position_id`,`department_id`,`role_type`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `app_staff_position_roles_department_idx` ON `app_staff_position_roles` (`department_id`,`role_type`);
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_import_batches (file_name,checksum,status,imported_organizations,imported_positions,rejected_rows,note)
VALUES ('2-илова (штат жадвали) (2).xlsx','efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e','validated_current',1,57,0,'Official central apparatus schedule: 76 staff units. Source contains no employee identities; all positions are imported as vacant.');
--> statement-breakpoint
UPDATE app_organizations SET name='Avtomobil yo‘llari qo‘mitasi markaziy apparati',short_name='Qo‘mita markaziy apparati',type='central',data_status='Amaldagi shtat: 76 birlik (2026-05-01)',source_name='2-илова (штат жадвали) (2).xlsx',hierarchy_verified=1,active=1,updated_at=CURRENT_TIMESTAMP WHERE tax_id='200541754';
--> statement-breakpoint
UPDATE app_staff_positions SET active=0,data_status='superseded',note=trim(note || ' 2026-05-01 dan 25-son buyruqdagi amaldagi shtat bilan almashtirildi.'),updated_at=CURRENT_TIMESTAMP
WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND source_file='структура.xlsx' AND data_status='Лойиҳа/намуна'
AND NOT EXISTS (SELECT 1 FROM app_position_occupancies occupancy WHERE occupancy.staff_position_id=app_staff_positions.id AND occupancy.ends_at IS NULL);
--> statement-breakpoint
UPDATE app_staff_positions SET data_status='superseded_requires_reassignment',note=trim(note || ' Amaldagi bandlik mavjud; administrator yangi shtatga qayta biriktirishi kerak.'),updated_at=CURRENT_TIMESTAMP
WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND source_file='структура.xlsx' AND data_status='Лойиҳа/намуна' AND active=1
AND EXISTS (SELECT 1 FROM app_position_occupancies occupancy WHERE occupancy.staff_position_id=app_staff_positions.id AND occupancy.ends_at IS NULL);
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Rahbariyat',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Moliya-iqtisodiyot boshqarmasi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Yo‘l ishlarini moliyalashtirish bo‘limi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),(SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Moliya-iqtisodiyot boshqarmasi' ORDER BY id DESC LIMIT 1),1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Loyihaviy yechimlar va narxlar shakllanishini tahlil qilish bo‘limi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),(SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Moliya-iqtisodiyot boshqarmasi' ORDER BY id DESC LIMIT 1),1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),(SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi' ORDER BY id DESC LIMIT 1),1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Yo‘l texnikalaridan foydalanish bo‘limi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),(SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi' ORDER BY id DESC LIMIT 1),1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Ijro intizomi va tashkiliy nazorat bo‘limi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Sanoat infratuzilmasini rivojlantirish bo‘limi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),(SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi' ORDER BY id DESC LIMIT 1),1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Istiqbolni belgilash va axborot-tahlil boshqarmasi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Xorijiy investitsiyalar, grantlar va davlat-xususiy sheriklikni rivojlantirish bo‘limi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),(SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi' ORDER BY id DESC LIMIT 1),1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Inson resurslarini rivojlantirish va boshqarish bo‘limi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Korrupsiyaga qarshi ichki nazorat bo‘limi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Buxgalteriya hisobi va hisoboti bo‘limi',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Maxsus bo‘lim',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Ichki audit xizmati',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Yuridik xizmat',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
UPDATE app_departments SET active=0
WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
AND name IN ('Молия-иқтисодиёт бошқармаси','Йўл ишларини молиялаштириш бўлими','Лойиҳавий ечимлар ва нархлар шаклланишини таҳлил қилиш бўлими','Раҳбарият')
AND NOT EXISTS (SELECT 1 FROM app_employees employee WHERE employee.department_id=app_departments.id AND employee.active=1);
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 13,organization.id,department.id,batch.id,'Rahbariyat','','Qo‘mita raisi','Boshqaruv xodimi','Vakant',1,1,'19',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D13:G13','approved_current','Manbadagi lavozim tartib raqami: 1. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Rahbariyat'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 14,organization.id,department.id,batch.id,'Rahbariyat','','Rais o‘rinbosari - bosh muhandis','Boshqaruv xodimi','Vakant',1,1,'17',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D14:G14','approved_current','Manbadagi lavozim tartib raqami: 2. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Rahbariyat'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 15,organization.id,department.id,batch.id,'Rahbariyat','','Rais o‘rinbosari','Boshqaruv xodimi','Vakant',1,1,'17',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D15:G15','approved_current','Manbadagi lavozim tartib raqami: 3. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Rahbariyat'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 16,organization.id,department.id,batch.id,'Rahbariyat','','Matbuot kotibi','Boshqaruv xodimi','Vakant',1,1,'17',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D16:G16','approved_current','Manbadagi lavozim tartib raqami: 4. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Rahbariyat'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 17,organization.id,department.id,batch.id,'Rahbariyat','','Rais maslahatchisi','Boshqaruv xodimi','Vakant',2,1,'15',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D17:G17','approved_current','Manbadagi lavozim tartib raqami: 5. Yordamchi boshqaruv hisobi: 2.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Rahbariyat'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 18,organization.id,department.id,batch.id,'Rahbariyat','','Rais yordamchisi','Boshqaruv xodimi','Vakant',1,1,'13',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D18:G18','approved_current','Manbadagi lavozim tartib raqami: 6. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Rahbariyat'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 19,organization.id,department.id,batch.id,'Rahbariyat','','Murojaatlar bilan ishlash boʻyicha bosh mutaxassis','Boshqaruv xodimi','Vakant',1,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D19:G19','approved_current','Manbadagi lavozim tartib raqami: 7.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Rahbariyat'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 22,organization.id,department.id,batch.id,'Moliya-iqtisodiyot boshqarmasi','','Boshqarma boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'14',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D22:G22','approved_current','Manbadagi lavozim tartib raqami: 8. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Moliya-iqtisodiyot boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 23,organization.id,department.id,batch.id,'Moliya-iqtisodiyot boshqarmasi','','Boshqarma boshlig‘i o‘rinbosari -Yo‘l ishlarini moliyalashtirish bo‘limi boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'14-5%',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D23:G23','approved_current','Manbadagi lavozim tartib raqami: 9. Yordamchi boshqaruv hisobi: 1. Qo‘shma rol: Yo‘l ishlarini moliyalashtirish bo‘limi rahbari; shtat ikki marta hisoblanmaydi.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Moliya-iqtisodiyot boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 24,organization.id,department.id,batch.id,'Moliya-iqtisodiyot boshqarmasi','','Bosh mutaxassis','Boshqaruv xodimi','Vakant',3,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D24:G24','approved_current','Manbadagi lavozim tartib raqami: 10.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Moliya-iqtisodiyot boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 25,organization.id,department.id,batch.id,'Moliya-iqtisodiyot boshqarmasi','','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',2,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D25:G25','approved_current','Manbadagi lavozim tartib raqami: 11.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Moliya-iqtisodiyot boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 27,organization.id,department.id,batch.id,'Moliya-iqtisodiyot boshqarmasi','Yo‘l ishlarini moliyalashtirish bo‘limi','Bosh mutaxassis','Boshqaruv xodimi','Vakant',1,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D27:G27','approved_current','Manbadagi lavozim tartib raqami: 12.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Yo‘l ishlarini moliyalashtirish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 28,organization.id,department.id,batch.id,'Moliya-iqtisodiyot boshqarmasi','Yo‘l ishlarini moliyalashtirish bo‘limi','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',1,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D28:G28','approved_current','Manbadagi lavozim tartib raqami: 13.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Yo‘l ishlarini moliyalashtirish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 30,organization.id,department.id,batch.id,'Moliya-iqtisodiyot boshqarmasi','Loyihaviy yechimlar va narxlar shakllanishini tahlil qilish bo‘limi','Bo‘lim boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'13',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D30:G30','approved_current','Manbadagi lavozim tartib raqami: 14. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Loyihaviy yechimlar va narxlar shakllanishini tahlil qilish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 31,organization.id,department.id,batch.id,'Moliya-iqtisodiyot boshqarmasi','Loyihaviy yechimlar va narxlar shakllanishini tahlil qilish bo‘limi','Bosh mutaxassis','Boshqaruv xodimi','Vakant',1,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D31:G31','approved_current','Manbadagi lavozim tartib raqami: 15.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Loyihaviy yechimlar va narxlar shakllanishini tahlil qilish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 32,organization.id,department.id,batch.id,'Moliya-iqtisodiyot boshqarmasi','Loyihaviy yechimlar va narxlar shakllanishini tahlil qilish bo‘limi','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',1,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D32:G32','approved_current','Manbadagi lavozim tartib raqami: 16.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Loyihaviy yechimlar va narxlar shakllanishini tahlil qilish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 35,organization.id,department.id,batch.id,'Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi','','Boshqarma boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'14',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D35:G35','approved_current','Manbadagi lavozim tartib raqami: 17. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 36,organization.id,department.id,batch.id,'Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi','','Boshqarma boshlig‘i o‘rinbosari -Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'14-5%',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D36:G36','approved_current','Manbadagi lavozim tartib raqami: 18. Yordamchi boshqaruv hisobi: 1. Qo‘shma rol: Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi rahbari; shtat ikki marta hisoblanmaydi.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 37,organization.id,department.id,batch.id,'Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi','','Bosh mutaxassis','Boshqaruv xodimi','Vakant',3,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D37:G37','approved_current','Manbadagi lavozim tartib raqami: 19.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 38,organization.id,department.id,batch.id,'Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi','','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',2,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D38:G38','approved_current','Manbadagi lavozim tartib raqami: 20.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 40,organization.id,department.id,batch.id,'Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi','Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi','Bosh mutaxassis','Boshqaruv xodimi','Vakant',1,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D40:G40','approved_current','Manbadagi lavozim tartib raqami: 21.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 41,organization.id,department.id,batch.id,'Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi','Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',1,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D41:G41','approved_current','Manbadagi lavozim tartib raqami: 22.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 43,organization.id,department.id,batch.id,'Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi','Yo‘l texnikalaridan foydalanish bo‘limi','Bo‘lim boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'13',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D43:G43','approved_current','Manbadagi lavozim tartib raqami: 23. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Yo‘l texnikalaridan foydalanish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 44,organization.id,department.id,batch.id,'Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi','Yo‘l texnikalaridan foydalanish bo‘limi','Bosh mutaxassis','Boshqaruv xodimi','Vakant',1,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D44:G44','approved_current','Manbadagi lavozim tartib raqami: 24.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Yo‘l texnikalaridan foydalanish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 45,organization.id,department.id,batch.id,'Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi','Yo‘l texnikalaridan foydalanish bo‘limi','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',1,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D45:G45','approved_current','Manbadagi lavozim tartib raqami: 25.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Yo‘l texnikalaridan foydalanish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 48,organization.id,department.id,batch.id,'Ijro intizomi va tashkiliy nazorat bo‘limi','','Bo‘lim boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'13',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D48:G48','approved_current','Manbadagi lavozim tartib raqami: 26. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Ijro intizomi va tashkiliy nazorat bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 49,organization.id,department.id,batch.id,'Ijro intizomi va tashkiliy nazorat bo‘limi','','Ijro intizomi bo''yicha bosh mutaxassis','Boshqaruv xodimi','Vakant',1,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D49:G49','approved_current','Manbadagi lavozim tartib raqami: 27.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Ijro intizomi va tashkiliy nazorat bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 50,organization.id,department.id,batch.id,'Ijro intizomi va tashkiliy nazorat bo‘limi','','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',1,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D50:G50','approved_current','Manbadagi lavozim tartib raqami: 28.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Ijro intizomi va tashkiliy nazorat bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 53,organization.id,department.id,batch.id,'Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi','','Boshqarma boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'14',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D53:G53','approved_current','Manbadagi lavozim tartib raqami: 29. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 54,organization.id,department.id,batch.id,'Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi','','Boshqarma boshlig‘i o‘rinbosari','Boshqaruv xodimi','Vakant',1,1,'14-5%',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D54:G54','approved_current','Manbadagi lavozim tartib raqami: 30. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 55,organization.id,department.id,batch.id,'Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi','','Bosh mutaxassis','Boshqaruv xodimi','Vakant',3,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D55:G55','approved_current','Manbadagi lavozim tartib raqami: 31.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 56,organization.id,department.id,batch.id,'Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi','','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',2,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D56:G56','approved_current','Manbadagi lavozim tartib raqami: 32.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 58,organization.id,department.id,batch.id,'Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi','Sanoat infratuzilmasini rivojlantirish bo‘limi','Bo‘lim boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'13',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D58:G58','approved_current','Manbadagi lavozim tartib raqami: 33. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Sanoat infratuzilmasini rivojlantirish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 59,organization.id,department.id,batch.id,'Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi','Sanoat infratuzilmasini rivojlantirish bo‘limi','Bosh mutaxassis','Boshqaruv xodimi','Vakant',1,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D59:G59','approved_current','Manbadagi lavozim tartib raqami: 34.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Sanoat infratuzilmasini rivojlantirish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 60,organization.id,department.id,batch.id,'Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi','Sanoat infratuzilmasini rivojlantirish bo‘limi','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',1,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D60:G60','approved_current','Manbadagi lavozim tartib raqami: 35.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Sanoat infratuzilmasini rivojlantirish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 63,organization.id,department.id,batch.id,'Istiqbolni belgilash va axborot-tahlil boshqarmasi','','Boshqarma boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'14',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D63:G63','approved_current','Manbadagi lavozim tartib raqami: 36. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Istiqbolni belgilash va axborot-tahlil boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 64,organization.id,department.id,batch.id,'Istiqbolni belgilash va axborot-tahlil boshqarmasi','','Boshqarma boshlig‘i o‘rinbosari','Boshqaruv xodimi','Vakant',1,1,'14-5%',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D64:G64','approved_current','Manbadagi lavozim tartib raqami: 37. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Istiqbolni belgilash va axborot-tahlil boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 65,organization.id,department.id,batch.id,'Istiqbolni belgilash va axborot-tahlil boshqarmasi','','Bosh mutaxassis','Boshqaruv xodimi','Vakant',3,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D65:G65','approved_current','Manbadagi lavozim tartib raqami: 38.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Istiqbolni belgilash va axborot-tahlil boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 66,organization.id,department.id,batch.id,'Istiqbolni belgilash va axborot-tahlil boshqarmasi','','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',2,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D66:G66','approved_current','Manbadagi lavozim tartib raqami: 39.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Istiqbolni belgilash va axborot-tahlil boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 69,organization.id,department.id,batch.id,'Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi','','Boshqarma boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'14',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D69:G69','approved_current','Manbadagi lavozim tartib raqami: 40. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 70,organization.id,department.id,batch.id,'Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi','','Boshqarma boshlig‘ining raqamlashtirish bo‘yicha o‘rinbosari','Boshqaruv xodimi','Vakant',1,1,'14-5%',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D70:G70','approved_current','Manbadagi lavozim tartib raqami: 41. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 71,organization.id,department.id,batch.id,'Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi','','Bosh mutaxassis','Boshqaruv xodimi','Vakant',3,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D71:G71','approved_current','Manbadagi lavozim tartib raqami: 42.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 72,organization.id,department.id,batch.id,'Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi','','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',2,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D72:G72','approved_current','Manbadagi lavozim tartib raqami: 43.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 74,organization.id,department.id,batch.id,'Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi','Xorijiy investitsiyalar, grantlar va davlat-xususiy sheriklikni rivojlantirish bo‘limi','Bo‘lim boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'13',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D74:G74','approved_current','Manbadagi lavozim tartib raqami: 44. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Xorijiy investitsiyalar, grantlar va davlat-xususiy sheriklikni rivojlantirish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 75,organization.id,department.id,batch.id,'Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi','Xorijiy investitsiyalar, grantlar va davlat-xususiy sheriklikni rivojlantirish bo‘limi','Bosh mutaxassis','Boshqaruv xodimi','Vakant',1,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D75:G75','approved_current','Manbadagi lavozim tartib raqami: 45.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Xorijiy investitsiyalar, grantlar va davlat-xususiy sheriklikni rivojlantirish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 76,organization.id,department.id,batch.id,'Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi','Xorijiy investitsiyalar, grantlar va davlat-xususiy sheriklikni rivojlantirish bo‘limi','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',1,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D76:G76','approved_current','Manbadagi lavozim tartib raqami: 46.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Xorijiy investitsiyalar, grantlar va davlat-xususiy sheriklikni rivojlantirish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 79,organization.id,department.id,batch.id,'Inson resurslarini rivojlantirish va boshqarish bo‘limi','','Bo‘lim boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'13',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D79:G79','approved_current','Manbadagi lavozim tartib raqami: 47. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Inson resurslarini rivojlantirish va boshqarish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 80,organization.id,department.id,batch.id,'Inson resurslarini rivojlantirish va boshqarish bo‘limi','','Bosh mutaxassis','Boshqaruv xodimi','Vakant',2,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D80:G80','approved_current','Manbadagi lavozim tartib raqami: 48.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Inson resurslarini rivojlantirish va boshqarish bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 83,organization.id,department.id,batch.id,'Korrupsiyaga qarshi ichki nazorat bo‘limi','','Bosh mutaxassis','Boshqaruv xodimi','Vakant',1,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D83:G83','approved_current','Manbadagi lavozim tartib raqami: 49.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Korrupsiyaga qarshi ichki nazorat bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 84,organization.id,department.id,batch.id,'Korrupsiyaga qarshi ichki nazorat bo‘limi','','Yetakchi mutaxassis','Boshqaruv xodimi','Vakant',1,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D84:G84','approved_current','Manbadagi lavozim tartib raqami: 50.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Korrupsiyaga qarshi ichki nazorat bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 87,organization.id,department.id,batch.id,'Buxgalteriya hisobi va hisoboti bo‘limi','','Bo‘lim boshlig‘i - bosh buxgalter','Boshqaruv xodimi','Vakant',1,1,'13',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D87:G87','approved_current','Manbadagi lavozim tartib raqami: 51. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Buxgalteriya hisobi va hisoboti bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 88,organization.id,department.id,batch.id,'Buxgalteriya hisobi va hisoboti bo‘limi','','Bosh mutaxassis','Boshqaruv xodimi','Vakant',1,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D88:G88','approved_current','Manbadagi lavozim tartib raqami: 52.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Buxgalteriya hisobi va hisoboti bo‘limi'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 91,organization.id,department.id,batch.id,'Maxsus bo‘lim','','Bo‘lim boshlig‘i','Boshqaruv xodimi','Vakant',1,1,'13',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D91:G91','approved_current','Manbadagi lavozim tartib raqami: 53. Yordamchi boshqaruv hisobi: 1.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Maxsus bo‘lim'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 92,organization.id,department.id,batch.id,'Maxsus bo‘lim','','Bosh mutaxassis','Boshqaruv xodimi','Vakant',1,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D92:G92','approved_current','Manbadagi lavozim tartib raqami: 54.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Maxsus bo‘lim'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 95,organization.id,department.id,batch.id,'Ichki audit xizmati','','Bosh mutaxassis - bosh auditor','Boshqaruv xodimi','Vakant',2,1,'11',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D95:G95','approved_current','Manbadagi lavozim tartib raqami: 55.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Ichki audit xizmati'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 96,organization.id,department.id,batch.id,'Ichki audit xizmati','','Yetakchi mutaxassis - yetakchi auditor','Boshqaruv xodimi','Vakant',1,1,'10',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D96:G96','approved_current','Manbadagi lavozim tartib raqami: 56.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Ichki audit xizmati'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 99,organization.id,department.id,batch.id,'Yuridik xizmat','','Bosh yuriskonsult','Boshqaruv xodimi','Vakant',2,1,'12',NULL,NULL,'2026-05-01','Qo‘mita buyrug‘i asosidagi shtat jadvali','2-илова (штат жадвали) (2).xlsx','Лист1!D99:G99','approved_current','Manbadagi lavozim tartib raqami: 57.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Yuridik xizmat'
JOIN app_staff_import_batches batch ON batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_position_roles (staff_position_id,department_id,role_type,note)
SELECT position.id,department.id,'secondary_manager','Boshqarma boshlig‘i o‘rinbosari bir vaqtda ushbu bo‘lim boshlig‘i.'
FROM app_staff_positions position
JOIN app_staff_import_batches batch ON batch.id=position.import_batch_id AND batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_departments department ON department.organization_id=position.organization_id AND department.name='Yo‘l ishlarini moliyalashtirish bo‘limi'
WHERE position.source_row_id=23 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_position_roles (staff_position_id,department_id,role_type,note)
SELECT position.id,department.id,'secondary_manager','Boshqarma boshlig‘i o‘rinbosari bir vaqtda ushbu bo‘lim boshlig‘i.'
FROM app_staff_positions position
JOIN app_staff_import_batches batch ON batch.id=position.import_batch_id AND batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_departments department ON department.organization_id=position.organization_id AND department.name='Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi'
WHERE position.source_row_id=36 LIMIT 1;
--> statement-breakpoint
UPDATE app_staff_import_batches SET status=CASE WHEN (SELECT COUNT(*) FROM app_staff_positions WHERE import_batch_id=app_staff_import_batches.id)=57 AND (SELECT COALESCE(SUM(headcount_units),0) FROM app_staff_positions WHERE import_batch_id=app_staff_import_batches.id)=76 THEN 'imported_current' ELSE 'validation_failed' END,imported_organizations=1,imported_positions=(SELECT COUNT(*) FROM app_staff_positions WHERE import_batch_id=app_staff_import_batches.id),rejected_rows=57-(SELECT COUNT(*) FROM app_staff_positions WHERE import_batch_id=app_staff_import_batches.id) WHERE checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e';
--> statement-breakpoint
