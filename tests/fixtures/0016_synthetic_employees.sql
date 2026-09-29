-- TEST FIXTURE: synthetic employee directory with the same shape as the private seed.
-- All names, birth dates and phone numbers are fabricated. Never apply in production.
INSERT OR IGNORE INTO app_employee_import_batches
(file_name,sheet_name,checksum,status,imported_employees,missing_mobile,missing_extension,note)
VALUES ('Тел рақамлар 3.xlsx','Марказий аппарат база (01.05)','12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487','validated',77,5,12,'77 unique employees; no duplicate names or mobile numbers. Birth dates are restricted profile data. Extensions 100, 111 and 149 are intentionally shared.');
--> statement-breakpoint
INSERT INTO app_departments (name,organization_id,parent_id,active)
VALUES ('Texnik xodimlar',(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),(SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Rahbariyat' ORDER BY id DESC LIMIT 1),1)
ON CONFLICT(organization_id,name) DO UPDATE SET parent_id=excluded.parent_id,active=1;
--> statement-breakpoint
UPDATE app_employees SET
  full_name='Sintetik Xodim77 Testovich',
  position='Boshqarma boshlig‘ining raqamlashtirish bo‘yicha o‘rinbosari',
  department_id=(SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi' ORDER BY id DESC LIMIT 1),
  organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),
  active=1,updated_at=CURRENT_TIMESTAMP
WHERE lower(email)='admin@ijro.local';
--> statement-breakpoint
UPDATE app_departments SET active=0
WHERE organization_id IS NULL AND name='Rahbariyat'
  AND NOT EXISTS (SELECT 1 FROM app_employees employee WHERE employee.department_id=app_departments.id AND employee.active=1);
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim01 Testovich',NULL,'Qo‘mita raisi',(SELECT id FROM app_roles WHERE code='rahbar' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Rahbariyat' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=1
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim01 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,1,'Синтетик Ходим01 Тестович','1990-01-01','100',NULL,6
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim01 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim02 Testovich',NULL,'Rais o‘rinbosari-bosh muhandis',(SELECT id FROM app_roles WHERE code='orinbosar' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Rahbariyat' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=2
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim02 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,2,'Синтетик Ходим02 Тестович','1990-01-01','111',NULL,7
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim02 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim03 Testovich',NULL,'Rais o‘rinbosari',(SELECT id FROM app_roles WHERE code='orinbosar' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Rahbariyat' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=3
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim03 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,3,'Синтетик Ходим03 Тестович','1990-01-01','104','+998900000001',8
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim03 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim04 Testovich',NULL,'Matbuot kotibi',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Rahbariyat' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=4
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim04 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,4,'Синтетик Ходим04 Тестович','1990-01-01','134','+998900000002',9
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim04 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim05 Testovich',NULL,'Rais maslahatchisi',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Rahbariyat' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=5
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim05 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,5,'Синтетик Ходим05 Тестович','1990-01-01','111',NULL,10
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim05 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim06 Testovich',NULL,'Rais maslahatchisi',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Rahbariyat' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=6
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim06 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,6,'Синтетик Ходим06 Тестович','1990-01-01','107',NULL,11
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim06 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim07 Testovich',NULL,'Rais yordamchisi',(SELECT id FROM app_roles WHERE code='yordamchi' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Rahbariyat' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=7
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim07 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,7,'Синтетик Ходим07 Тестович','1990-01-01','100','+998900000003',12
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim07 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim08 Testovich',NULL,'Murojaatlar bilan ishlash bo‘yicha bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Rahbariyat' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=8
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim08 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,8,'Синтетик Ходим08 Тестович','1990-01-01','149','+998900000004',13
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim08 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim09 Testovich',NULL,'Boshqarma boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Moliya-iqtisodiyot boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=9
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim09 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,9,'Синтетик Ходим09 Тестович','1990-01-01','105','+998900000005',15
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim09 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim10 Testovich',NULL,'Boshqarma boshlig‘i o‘rinbosari-Yo‘l ishlarini moliyalashtirish bo‘limi boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Moliya-iqtisodiyot boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=10
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim10 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,10,'Синтетик Ходим10 Тестович','1990-01-01','140','+998900000006',16
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim10 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim11 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Moliya-iqtisodiyot boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=11
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim11 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,11,'Синтетик Ходим11 Тестович','1990-01-01','142','+998900000007',17
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim11 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim12 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Moliya-iqtisodiyot boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=12
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim12 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,12,'Синтетик Ходим12 Тестович','1990-01-01','147','+998900000008',18
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim12 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim13 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Moliya-iqtisodiyot boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=13
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim13 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,13,'Синтетик Ходим13 Тестович','1990-01-01',NULL,'+998900000009',19
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim13 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim14 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Moliya-iqtisodiyot boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=14
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim14 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,14,'Синтетик Ходим14 Тестович','1990-01-01','174','+998900000010',20
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim14 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim15 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Yo‘l ishlarini moliyalashtirish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=15
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim15 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,15,'Синтетик Ходим15 Тестович','1990-01-01','173','+998900000011',22
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim15 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim16 Testovich',NULL,'Bo‘lim boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Loyihaviy yechimlar va narxlar shakllanishini tahlil qilish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=16
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim16 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,16,'Синтетик Ходим16 Тестович','1990-01-01','117','+998900000012',24
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim16 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim17 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Loyihaviy yechimlar va narxlar shakllanishini tahlil qilish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=17
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim17 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,17,'Синтетик Ходим17 Тестович','1990-01-01','189','+998900000013',25
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim17 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim18 Testovich',NULL,'Boshqarma boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=18
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim18 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,18,'Синтетик Ходим18 Тестович','1990-01-01','161','+998900000014',27
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim18 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim19 Testovich',NULL,'Boshqarma boshlig‘i o‘rinbosari - Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=19
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim19 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,19,'Синтетик Ходим19 Тестович','1990-01-01','112','+998900000015',28
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim19 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim20 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=20
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim20 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,20,'Синтетик Ходим20 Тестович','1990-01-01','128','+998900000016',29
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim20 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim21 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=21
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim21 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,21,'Синтетик Ходим21 Тестович','1990-01-01','158','+998900000017',30
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim21 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim22 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=22
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim22 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,22,'Синтетик Ходим22 Тестович','1990-01-01',NULL,'+998900000018',31
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim22 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim23 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=23
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim23 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,23,'Синтетик Ходим23 Тестович','1990-01-01','178','+998900000019',32
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim23 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim24 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=24
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim24 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,24,'Синтетик Ходим24 Тестович','1990-01-01','123','+998900000020',33
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim24 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim25 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=25
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim25 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,25,'Синтетик Ходим25 Тестович','1990-01-01','160','+998900000021',35
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim25 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim26 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=26
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim26 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,26,'Синтетик Ходим26 Тестович','1990-01-01','143','+998900000022',36
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim26 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim27 Testovich',NULL,'Bo‘lim boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Yo‘l texnikalaridan foydalanish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=27
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim27 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,27,'Синтетик Ходим27 Тестович','1990-01-01','110','+998900000023',38
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim27 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim28 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Yo‘l texnikalaridan foydalanish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=28
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim28 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,28,'Синтетик Ходим28 Тестович','1990-01-01','125','+998900000024',39
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim28 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim29 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Yo‘l texnikalaridan foydalanish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=29
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim29 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,29,'Синтетик Ходим29 Тестович','1990-01-01','145','+998900000025',40
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim29 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim30 Testovich',NULL,'Bo‘lim boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Ijro intizomi va tashkiliy nazorat bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=30
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim30 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,30,'Синтетик Ходим30 Тестович','1990-01-01','149','+998900000026',42
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim30 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim31 Testovich',NULL,'Ijro intizomi bo‘yicha bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Ijro intizomi va tashkiliy nazorat bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=31
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim31 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,31,'Синтетик Ходим31 Тестович','1990-01-01','121','+998900000027',43
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim31 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim32 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Ijro intizomi va tashkiliy nazorat bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=32
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim32 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,32,'Синтетик Ходим32 Тестович','1990-01-01','148','+998900000028',44
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim32 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim33 Testovich',NULL,'Boshqarma boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=33
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim33 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,33,'Синтетик Ходим33 Тестович','1990-01-01','137','+998900000029',46
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim33 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim34 Testovich',NULL,'Boshqarma boshlig‘i o‘rinbosari',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=34
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim34 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,34,'Синтетик Ходим34 Тестович','1990-01-01','155','+998900000030',47
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim34 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim35 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=35
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim35 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,35,'Синтетик Ходим35 Тестович','1990-01-01','138','+998900000031',48
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim35 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim36 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=36
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim36 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,36,'Синтетик Ходим36 Тестович','1990-01-01','179','+998900000032',49
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim36 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim37 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=37
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim37 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,37,'Синтетик Ходим37 Тестович','1990-01-01','154','+998900000033',50
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim37 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim38 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=38
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim38 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,38,'Синтетик Ходим38 Тестович','1990-01-01','183','+998900000034',51
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim38 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim39 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=39
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim39 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,39,'Синтетик Ходим39 Тестович','1990-01-01','172','+998900000035',52
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim39 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim40 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Sanoat infratuzilmasini rivojlantirish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=40
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim40 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,40,'Синтетик Ходим40 Тестович','1990-01-01','144','+998900000036',54
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim40 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim41 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Sanoat infratuzilmasini rivojlantirish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=41
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim41 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,41,'Синтетик Ходим41 Тестович','1990-01-01','191','+998900000037',55
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim41 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim42 Testovich',NULL,'Boshqarma boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Istiqbolni belgilash va axborot-tahlil boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=42
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim42 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,42,'Синтетик Ходим42 Тестович','1990-01-01','135','+998900000038',57
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim42 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim43 Testovich',NULL,'Boshqarma boshlig‘i o‘rinbosari',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Istiqbolni belgilash va axborot-tahlil boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=43
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim43 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,43,'Синтетик Ходим43 Тестович','1990-01-01','153','+998900000039',58
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim43 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim44 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Istiqbolni belgilash va axborot-tahlil boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=44
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim44 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,44,'Синтетик Ходим44 Тестович','1990-01-01','136','+998900000040',59
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim44 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim45 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Istiqbolni belgilash va axborot-tahlil boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=45
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim45 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,45,'Синтетик Ходим45 Тестович','1990-01-01','100','+998900000041',60
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim45 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim46 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Istiqbolni belgilash va axborot-tahlil boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=46
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim46 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,46,'Синтетик Ходим46 Тестович','1990-01-01','176','+998900000042',61
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim46 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim47 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Istiqbolni belgilash va axborot-tahlil boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=47
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim47 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,47,'Синтетик Ходим47 Тестович','1990-01-01','167','+998900000043',62
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim47 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim48 Testovich',NULL,'Boshqarma boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=48
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim48 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,48,'Синтетик Ходим48 Тестович','1990-01-01','118','+998900000044',64
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim48 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,49,'Синтетик Ходим49 Тестович','1990-01-01','159','+998900000045',65
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.email)='admin@ijro.local'
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim49 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=50
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim49 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,50,'Синтетик Ходим50 Тестович','1990-01-01','198','+998900000046',66
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim49 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim50 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=51
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim50 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,51,'Синтетик Ходим51 Тестович','1990-01-01','129','+998900000047',67
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim50 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim51 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=52
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim51 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,52,'Синтетик Ходим52 Тестович','1990-01-01','156','+998900000048',68
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim51 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim52 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=53
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim52 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,53,'Синтетик Ходим53 Тестович','1990-01-01','124','+998900000049',69
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim52 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim53 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=54
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim53 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,54,'Синтетик Ходим54 Тестович','1990-01-01','157','+998900000050',70
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim53 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim54 Testovich',NULL,'Bo‘lim boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Xorijiy investitsiyalar, grantlar va davlat-xususiy sheriklikni rivojlantirish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=55
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim54 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,55,'Синтетик Ходим55 Тестович','1990-01-01','126','+998900000051',72
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim54 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim55 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Xorijiy investitsiyalar, grantlar va davlat-xususiy sheriklikni rivojlantirish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=56
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim55 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,56,'Синтетик Ходим56 Тестович','1990-01-01','168','+998900000052',73
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim55 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim56 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Xorijiy investitsiyalar, grantlar va davlat-xususiy sheriklikni rivojlantirish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=57
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim56 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,57,'Синтетик Ходим57 Тестович','1990-01-01','152','+998900000053',74
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim56 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim57 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Inson resurslarini rivojlantirish va boshqarish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=58
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim57 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,58,'Синтетик Ходим58 Тестович','1990-01-01','131','+998900000054',76
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim57 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim58 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Inson resurslarini rivojlantirish va boshqarish bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=59
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim58 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,59,'Синтетик Ходим59 Тестович','1990-01-01','122','+998900000055',77
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim58 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim59 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Korrupsiyaga qarshi ichki nazorat bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=60
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim59 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,60,'Синтетик Ходим60 Тестович','1990-01-01','162','+998900000056',79
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim59 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim60 Testovich',NULL,'Yetakchi mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Korrupsiyaga qarshi ichki nazorat bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=61
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim60 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,61,'Синтетик Ходим61 Тестович','1990-01-01','180','+998900000057',80
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim60 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim61 Testovich',NULL,'Bo‘lim boshlig‘i - bosh buxgalter',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Buxgalteriya hisobi va hisoboti bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=62
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim61 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,62,'Синтетик Ходим62 Тестович','1990-01-01','115','+998900000058',82
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim61 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim62 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Buxgalteriya hisobi va hisoboti bo‘limi' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=63
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim62 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,63,'Синтетик Ходим63 Тестович','1990-01-01','164','+998900000059',83
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim62 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim63 Testovich',NULL,'Bo‘lim boshlig‘i',(SELECT id FROM app_roles WHERE code='boshqarma' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Maxsus bo‘lim' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=64
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim63 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,64,'Синтетик Ходим64 Тестович','1990-01-01',NULL,'+998900000060',85
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim63 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim64 Testovich',NULL,'Bosh mutaxassis',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Maxsus bo‘lim' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=65
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim64 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,65,'Синтетик Ходим65 Тестович','1990-01-01',NULL,'+998900000061',86
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim64 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim65 Testovich',NULL,'Bosh mutaxassis-Bosh auditor',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Ichki audit xizmati' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=66
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim65 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,66,'Синтетик Ходим66 Тестович','1990-01-01','146','+998900000062',88
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim65 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim66 Testovich',NULL,'Bosh mutaxassis-Bosh auditor',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Ichki audit xizmati' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=67
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim66 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,67,'Синтетик Ходим67 Тестович','1990-01-01','141','+998900000063',89
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim66 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim67 Testovich',NULL,'Bosh yuristkonsult',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Yuridik xizmat' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=68
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim67 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,68,'Синтетик Ходим68 Тестович','1990-01-01','109','+998900000064',91
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim67 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim68 Testovich',NULL,'Bosh yuristkonsult',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Yuridik xizmat' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=69
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim68 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,69,'Синтетик Ходим69 Тестович','1990-01-01','151','+998900000065',92
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim68 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim69 Testovich',NULL,'Xo‘jalik mudiri',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Texnik xodimlar' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=70
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim69 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,70,'Синтетик Ходим70 Тестович','1990-01-01',NULL,'+998900000066',94
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim69 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim70 Testovich',NULL,'Rahbar-kotibi',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Texnik xodimlar' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=71
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim70 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,71,'Синтетик Ходим71 Тестович','1990-01-01',NULL,'+998900000067',95
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim70 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim71 Testovich',NULL,'Rahbar-kotibi',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Texnik xodimlar' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=72
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim71 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,72,'Синтетик Ходим72 Тестович','1990-01-01',NULL,'+998900000068',96
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim71 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim72 Testovich',NULL,'Kompyuterlarga xizmat ko‘rsatish bo‘yicha texnik',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Texnik xodimlar' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=73
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim72 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,73,'Синтетик Ходим73 Тестович','1990-01-01',NULL,NULL,97
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim72 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim73 Testovich',NULL,'Arxivarius',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Texnik xodimlar' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=74
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim73 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,74,'Синтетик Ходим74 Тестович','1990-01-01',NULL,'+998900000069',98
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim73 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim74 Testovich',NULL,'Kompyuter texnikalariga xizmat ko‘rsatish texnigi',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Texnik xodimlar' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=75
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim74 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,75,'Синтетик Ходим75 Тестович','1990-01-01',NULL,'+998900000070',99
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim74 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim75 Testovich',NULL,'Ish yurituvchi',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Texnik xodimlar' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=76
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim75 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,76,'Синтетик Ходим76 Тестович','1990-01-01',NULL,'+998900000071',100
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim75 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
INSERT INTO app_employees
(full_name,email,position,role_id,department_id,organization_id,manager_id,active,created_by_employee_id)
SELECT 'Sintetik Xodim76 Testovich',NULL,'Rahbar kotibi',(SELECT id FROM app_roles WHERE code='xodim' LIMIT 1),
       (SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name='Texnik xodimlar' ORDER BY id DESC LIMIT 1),
       (SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1),NULL,1,
       (SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id
  WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=77
) AND NOT EXISTS (
  SELECT 1 FROM app_employees existing
  WHERE lower(existing.full_name)=lower('Sintetik Xodim76 Testovich')
    AND existing.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
);
--> statement-breakpoint
INSERT OR IGNORE INTO app_employee_profiles
(employee_id,import_batch_id,source_employee_number,full_name_cyrillic,birth_date,internal_extension,mobile_phone,source_row)
SELECT employee.id,batch.id,77,'Синтетик Ходим77 Тестович','1990-01-01',NULL,'+998900000072',101
FROM app_employees employee JOIN app_employee_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE lower(employee.full_name)=lower('Sintetik Xodim76 Testovich') AND employee.organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1)
ORDER BY employee.id LIMIT 1;
--> statement-breakpoint
UPDATE app_employees SET manager_id=NULL,updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=1 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=2 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=3 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=4 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=5 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=6 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=7 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=8 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=9 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=9 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=10 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=9 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=11 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=9 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=12 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=9 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=13 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=9 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=14 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=10 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=15 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=9 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=16 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=16 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=17 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=18 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=18 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=19 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=18 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=20 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=18 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=21 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=18 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=22 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=18 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=23 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=18 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=24 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=19 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=25 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=19 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=26 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=18 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=27 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=27 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=28 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=27 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=29 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=30 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=30 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=31 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=30 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=32 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=33 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=33 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=34 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=33 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=35 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=33 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=36 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=33 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=37 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=33 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=38 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=33 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=39 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=33 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=40 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=33 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=41 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=42 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=42 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=43 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=42 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=44 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=42 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=45 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=42 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=46 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=42 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=47 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=48 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=48 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=49 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=48 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=50 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=48 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=51 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=48 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=52 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=48 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=53 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=48 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=54 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=48 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=55 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=55 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=56 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=55 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=57 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=58 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=59 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=60 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=61 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=62 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=62 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=63 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=64 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=64 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=65 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=66 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=67 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=68 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=69 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=70 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=71 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=72 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=73 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=74 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=75 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=76 LIMIT 1);
--> statement-breakpoint
UPDATE app_employees SET manager_id=(SELECT manager_profile.employee_id FROM app_employee_profiles manager_profile JOIN app_employee_import_batches manager_batch ON manager_batch.id=manager_profile.import_batch_id WHERE manager_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND manager_profile.source_employee_number=1 LIMIT 1),updated_at=CURRENT_TIMESTAMP
WHERE id=(SELECT profile.employee_id FROM app_employee_profiles profile JOIN app_employee_import_batches batch ON batch.id=profile.import_batch_id WHERE batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487' AND profile.source_employee_number=77 LIMIT 1);
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_import_batches (file_name,checksum,status,imported_organizations,imported_positions,rejected_rows,note)
VALUES ('Тел рақамлар 3.xlsx','12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487','directory_supplement',1,8,0,'8 technical employees are present in the contact directory but outside the 76-unit approved management schedule; HR confirmation is required.');
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 94,organization.id,department.id,batch.id,'Texnik xodimlar','','Xo‘jalik mudiri','Texnik xodim','Band',1,1,'2026-05-01','Xodimlar telefon ma’lumotnomasi','Тел рақамлар 3.xlsx','Марказий аппарат база (01.05)!A94:F94','directory_supplement_needs_hr_confirmation','Amaldagi 76 birlik boshqaruv shtatiga kiritilmagan; kadrlar bo‘limi tasdig‘i talab etiladi.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Texnik xodimlar'
JOIN app_staff_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 95,organization.id,department.id,batch.id,'Texnik xodimlar','','Rahbar-kotibi','Texnik xodim','Band',1,1,'2026-05-01','Xodimlar telefon ma’lumotnomasi','Тел рақамлар 3.xlsx','Марказий аппарат база (01.05)!A95:F95','directory_supplement_needs_hr_confirmation','Amaldagi 76 birlik boshqaruv shtatiga kiritilmagan; kadrlar bo‘limi tasdig‘i talab etiladi.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Texnik xodimlar'
JOIN app_staff_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 96,organization.id,department.id,batch.id,'Texnik xodimlar','','Rahbar-kotibi','Texnik xodim','Band',1,1,'2026-05-01','Xodimlar telefon ma’lumotnomasi','Тел рақамлар 3.xlsx','Марказий аппарат база (01.05)!A96:F96','directory_supplement_needs_hr_confirmation','Amaldagi 76 birlik boshqaruv shtatiga kiritilmagan; kadrlar bo‘limi tasdig‘i talab etiladi.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Texnik xodimlar'
JOIN app_staff_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 97,organization.id,department.id,batch.id,'Texnik xodimlar','','Kompyuterlarga xizmat ko‘rsatish bo‘yicha texnik','Texnik xodim','Band',1,1,'2026-05-01','Xodimlar telefon ma’lumotnomasi','Тел рақамлар 3.xlsx','Марказий аппарат база (01.05)!A97:F97','directory_supplement_needs_hr_confirmation','Amaldagi 76 birlik boshqaruv shtatiga kiritilmagan; kadrlar bo‘limi tasdig‘i talab etiladi.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Texnik xodimlar'
JOIN app_staff_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 98,organization.id,department.id,batch.id,'Texnik xodimlar','','Arxivarius','Texnik xodim','Band',1,1,'2026-05-01','Xodimlar telefon ma’lumotnomasi','Тел рақамлар 3.xlsx','Марказий аппарат база (01.05)!A98:F98','directory_supplement_needs_hr_confirmation','Amaldagi 76 birlik boshqaruv shtatiga kiritilmagan; kadrlar bo‘limi tasdig‘i talab etiladi.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Texnik xodimlar'
JOIN app_staff_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 99,organization.id,department.id,batch.id,'Texnik xodimlar','','Kompyuter texnikalariga xizmat ko‘rsatish texnigi','Texnik xodim','Band',1,1,'2026-05-01','Xodimlar telefon ma’lumotnomasi','Тел рақамлар 3.xlsx','Марказий аппарат база (01.05)!A99:F99','directory_supplement_needs_hr_confirmation','Amaldagi 76 birlik boshqaruv shtatiga kiritilmagan; kadrlar bo‘limi tasdig‘i talab etiladi.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Texnik xodimlar'
JOIN app_staff_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 100,organization.id,department.id,batch.id,'Texnik xodimlar','','Ish yurituvchi','Texnik xodim','Band',1,1,'2026-05-01','Xodimlar telefon ma’lumotnomasi','Тел рақамлар 3.xlsx','Марказий аппарат база (01.05)!A100:F100','directory_supplement_needs_hr_confirmation','Amaldagi 76 birlik boshqaruv shtatiga kiritilmagan; kadrlar bo‘limi tasdig‘i talab etiladi.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Texnik xodimlar'
JOIN app_staff_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 101,organization.id,department.id,batch.id,'Texnik xodimlar','','Rahbar kotibi','Texnik xodim','Band',1,1,'2026-05-01','Xodimlar telefon ma’lumotnomasi','Тел рақамлар 3.xlsx','Марказий аппарат база (01.05)!A101:F101','directory_supplement_needs_hr_confirmation','Amaldagi 76 birlik boshqaruv shtatiga kiritilmagan; kadrlar bo‘limi tasdig‘i talab etiladi.',1
FROM app_organizations organization
JOIN app_departments department ON department.organization_id=organization.id AND department.name='Texnik xodimlar'
JOIN app_staff_import_batches batch ON batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE organization.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=1
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=13 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=2
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=14 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=3
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=15 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=4
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=16 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=5
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=17 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=6
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=17 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=7
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=18 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=8
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=19 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=9
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=22 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=10
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=23 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=11
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=24 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=12
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=24 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=13
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=25 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=14
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=25 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=15
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=28 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=16
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=30 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=17
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=32 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=18
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=35 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=19
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=36 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=20
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=37 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=21
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=37 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=22
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=37 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=23
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=38 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=24
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=38 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=25
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=40 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=26
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=41 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=27
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=43 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=28
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=44 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=29
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=45 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=30
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=48 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=31
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=49 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=32
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=50 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=33
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=53 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=34
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=54 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=35
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=55 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=36
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=55 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=37
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=55 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=38
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=56 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=39
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=56 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=40
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=59 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=41
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=60 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=42
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=63 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=43
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=64 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=44
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=65 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=45
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=65 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=46
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=66 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=47
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=66 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=48
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=69 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=49
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=70 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=50
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=71 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=51
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=71 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=52
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=71 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=53
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=72 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=54
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=72 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=55
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=74 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=56
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=75 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=57
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=76 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=58
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=80 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=59
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=80 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=60
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=83 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=61
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=84 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=62
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=87 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=63
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=88 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=64
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=91 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=65
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=92 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=66
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=95 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=67
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=95 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=68
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=99 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e'
JOIN app_employee_profiles profile ON profile.source_employee_number=69
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=99 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
JOIN app_employee_profiles profile ON profile.source_employee_number=70
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=94 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
JOIN app_employee_profiles profile ON profile.source_employee_number=71
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=95 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
JOIN app_employee_profiles profile ON profile.source_employee_number=72
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=96 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
JOIN app_employee_profiles profile ON profile.source_employee_number=73
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=97 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
JOIN app_employee_profiles profile ON profile.source_employee_number=74
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=98 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
JOIN app_employee_profiles profile ON profile.source_employee_number=75
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=99 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
JOIN app_employee_profiles profile ON profile.source_employee_number=76
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=100 LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_position_occupancies
(staff_position_id,employee_id,fte_rate,starts_at,ends_at)
SELECT position.id,profile.employee_id,1,'2026-05-01',NULL
FROM app_staff_positions position
JOIN app_staff_import_batches staff_batch ON staff_batch.id=position.import_batch_id AND staff_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
JOIN app_employee_profiles profile ON profile.source_employee_number=77
JOIN app_employee_import_batches employee_batch ON employee_batch.id=profile.import_batch_id AND employee_batch.checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'
WHERE position.source_row_id=101 LIMIT 1;
--> statement-breakpoint
UPDATE app_staff_positions
SET position_status=CASE
  WHEN COALESCE((SELECT SUM(occupancy.fte_rate) FROM app_position_occupancies occupancy WHERE occupancy.staff_position_id=app_staff_positions.id AND occupancy.ends_at IS NULL),0)=0 THEN 'Vakant'
  WHEN COALESCE((SELECT SUM(occupancy.fte_rate) FROM app_position_occupancies occupancy WHERE occupancy.staff_position_id=app_staff_positions.id AND occupancy.ends_at IS NULL),0)<headcount_units THEN 'Qisman band'
  ELSE 'Band' END,
  updated_at=CURRENT_TIMESTAMP
WHERE import_batch_id IN (SELECT id FROM app_staff_import_batches WHERE checksum IN ('efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e','12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487'));
--> statement-breakpoint
UPDATE app_employee_import_batches
SET status=CASE
  WHEN (SELECT COUNT(*) FROM app_employee_profiles profile WHERE profile.import_batch_id=app_employee_import_batches.id)=77
   AND (SELECT COUNT(*) FROM app_position_occupancies occupancy JOIN app_employee_profiles profile ON profile.employee_id=occupancy.employee_id WHERE profile.import_batch_id=app_employee_import_batches.id AND occupancy.ends_at IS NULL)=77
  THEN 'imported' ELSE 'validation_failed' END,
  imported_employees=(SELECT COUNT(*) FROM app_employee_profiles profile WHERE profile.import_batch_id=app_employee_import_batches.id)
WHERE checksum='12ab3f72aa431bb18e6af49a93ee33c3420d82b3f152a53a4e8482a6a49ec487';
