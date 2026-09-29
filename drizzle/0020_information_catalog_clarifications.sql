-- User-supplied catalogue clarifications (2026-08-11).
-- The workbook contains information architecture instructions only; it contains no factual numeric rows.
-- Existing records and values are preserved. New fields are appended only when absent.
INSERT OR IGNORE INTO app_information_catalog_imports
(file_name,sheet_name,source_range,checksum,catalog_version,source_department_count,source_template_count,supplementary_template_count,anomalies_json,status)
VALUES
('Лист Microsoft Excel.xlsx','8 ta aniqlashtirish varag‘i','A3:E9; A5:D12; A7; A5; A7:A8; A3; A5:B5; B7:B11','9c81f59079ca7205c7063223a6a92ee3f7bef9da5ac2f5184f55d993bdac30a5','catalog-clarifications-2026-08-11',8,21,0,'["Faylda ko‘rsatkich qiymatlari yo‘q; uydirma sonli qator yaratilmaydi","Ko‘rsatmalar kirill va lotin yozuvlarida aralash berilgan"]','validated');
--> statement-breakpoint

-- Shared hierarchical fields.
UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"hudud","label":"Hudud yoki boshqaruv bo‘g‘ini","type":"region","required":false}'))
WHERE code IN (
  'SRC_FINANCE_ECONOMY_ASSETS',
  'SRC_MAINTENANCE_REPAIR_ROAD_CONDITION','SRC_MAINTENANCE_REPAIR_BRIDGE_CONDITION',
  'SRC_MAINTENANCE_REPAIR_WINTER_READINESS','SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS',
  'SRC_MAINTENANCE_REPAIR_ROAD_UNIT_BUILDINGS','SRC_MAINTENANCE_REPAIR_ROAD_ELEMENTS',
  'SRC_ROADSIDE_INFRASTRUCTURE_SERVICE_OBJECTS_IN_PROGRESS',
  'SRC_ROAD_MACHINERY_MACHINERY_UTILIZATION','SRC_INVESTMENTS_PPP_PPP_PROJECTS',
  'SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY','SRC_SPORTS_YOUTH_SPORTS_YOUTH_EVENTS'
)
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='hudud');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"tuman","label":"Tuman","type":"text","required":false}'))
WHERE code IN (
  'SRC_MAINTENANCE_REPAIR_ROAD_CONDITION','SRC_MAINTENANCE_REPAIR_BRIDGE_CONDITION',
  'SRC_MAINTENANCE_REPAIR_WINTER_READINESS','SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS',
  'SRC_MAINTENANCE_REPAIR_ROAD_UNIT_BUILDINGS','SRC_ROADSIDE_INFRASTRUCTURE_SERVICE_OBJECTS_IN_PROGRESS',
  'SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY'
)
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='tuman');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"tashkilot","label":"Tashkilot","type":"text","required":false}'))
WHERE code IN (
  'SRC_FINANCE_ECONOMY_ASSETS','SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS',
  'SRC_MAINTENANCE_REPAIR_ROAD_UNIT_BUILDINGS','SRC_ROAD_MACHINERY_MACHINERY_UTILIZATION',
  'SRC_SPORTS_YOUTH_SPORTS_YOUTH_EVENTS'
)
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='tashkilot');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"davr","label":"Davr","type":"date","required":false}'))
WHERE code IN (
  'SRC_FINANCE_ECONOMY_ASSETS','SRC_MAINTENANCE_REPAIR_ROAD_CONDITION','SRC_MAINTENANCE_REPAIR_BRIDGE_CONDITION',
  'SRC_MAINTENANCE_REPAIR_WINTER_READINESS','SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS',
  'SRC_MAINTENANCE_REPAIR_ROAD_UNIT_BUILDINGS','SRC_MAINTENANCE_REPAIR_ROAD_ELEMENTS',
  'SRC_ROADSIDE_INFRASTRUCTURE_SERVICE_OBJECTS_IN_PROGRESS','SRC_SPORTS_YOUTH_SPORTS_YOUTH_EVENTS'
)
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='davr');
--> statement-breakpoint

-- Road and bridge classification fields from the workbook instructions.
UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"yol_tasnifi","label":"Yo‘llar tasnifi","type":"select","required":false,"options":["Umumiy foydalanishdagi yo‘llar","Ichki yo‘llar"]}'))
WHERE code IN ('SRC_MAINTENANCE_REPAIR_ROAD_CONDITION','SRC_MAINTENANCE_REPAIR_BRIDGE_CONDITION')
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='yol_tasnifi');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"texnik_toifa","label":"Texnik toifa","type":"select","required":false,"options":["I","II","III","IV","V"]}'))
WHERE code='SRC_MAINTENANCE_REPAIR_BRIDGE_CONDITION'
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='texnik_toifa');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=(SELECT json_group_array(json(CASE
  WHEN json_extract(value,'$.code')='qoplama_turi' THEN json_patch(value,'{"type":"select","options":["Sementbeton","Asfaltbeton","Qora qoplama","Shag‘al","Tuproq"]}')
  WHEN json_extract(value,'$.code')='texnik_toifa' THEN json_patch(value,'{"type":"select","options":["I","II","III","IV","V"]}')
  WHEN json_extract(value,'$.code')='holat_bahosi' THEN json_patch(value,'{"type":"select","options":["Yaxshi","Ta’mirtalab"]}')
  ELSE value END)) FROM json_each(app_information_templates.fields_json))
WHERE code='SRC_MAINTENANCE_REPAIR_ROAD_CONDITION';
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=(SELECT json_group_array(json(CASE
  WHEN json_extract(value,'$.code')='texnik_holat' THEN json_patch(value,'{"type":"select","options":["Yaxshi","Ta’mirtalab","Yaroqsiz"]}')
  ELSE value END)) FROM json_each(app_information_templates.fields_json))
WHERE code='SRC_MAINTENANCE_REPAIR_BRIDGE_CONDITION';
--> statement-breakpoint

-- Consolidated road-operation funding and remaining clarified fields.
UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"ish_yonalishi","label":"Ish yo‘nalishi","type":"select","required":true,"options":["Saqlash","Ta’mirlash","Tabiiy ofatlarni bartaraf etish"]}'))
WHERE code='SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS'
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='ish_yonalishi');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"malumot_turi","label":"Ma’lumot turi","type":"select","required":true,"options":["Sport mashg‘ulotlari","Sport musobaqalari","Rahbar va yoshlar uchrashuvlari","Iqtidorli yoshlar"]}'))
WHERE code='SRC_SPORTS_YOUTH_SPORTS_YOUTH_EVENTS'
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='malumot_turi');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"ishtirokchilar_soni","label":"Ishtirokchilar soni","type":"number","unit":"nafar","required":false}'))
WHERE code='SRC_SPORTS_YOUTH_SPORTS_YOUTH_EVENTS'
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='ishtirokchilar_soni');
--> statement-breakpoint

-- Correct numeric semantics used by filters, totals and exports.
UPDATE app_information_templates
SET fields_json=(SELECT json_group_array(json(CASE
  WHEN json_extract(value,'$.code')='qarz_yoshi' THEN json_patch(value,'{"type":"number","unit":"kun"}')
  ELSE value END)) FROM json_each(app_information_templates.fields_json))
WHERE code IN ('SRC_FINANCE_ECONOMY_ACCOUNTS_PAYABLE','SRC_FINANCE_ECONOMY_ACCOUNTS_RECEIVABLE');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=(SELECT json_group_array(json(CASE
  WHEN json_extract(value,'$.code')='penya' THEN json_patch(value,'{"type":"currency"}')
  ELSE value END)) FROM json_each(app_information_templates.fields_json))
WHERE code='SRC_FINANCE_ECONOMY_TAX_DEBT';
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=(SELECT json_group_array(json(CASE
  WHEN json_extract(value,'$.code')='reja' THEN json_patch(value,'{"type":"currency"}')
  ELSE value END)) FROM json_each(app_information_templates.fields_json))
WHERE code='SRC_FINANCE_ECONOMY_NET_PROFIT';
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=(SELECT json_group_array(json(CASE
  WHEN json_extract(value,'$.code')='foydalanuvchilar' THEN json_patch(value,'{"type":"number","unit":"nafar"}')
  ELSE value END)) FROM json_each(app_information_templates.fields_json))
WHERE code='SRC_DIGITALIZATION_INNOVATION_INFORMATION_SYSTEMS';
--> statement-breakpoint

-- Finance: Hudud/direct organization -> subordinate organization -> detail.
UPDATE app_information_templates SET
  description='',drill_profile='FINANCE_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"finance_hierarchy","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tashkilot"],"filters":["qarz_yoshi","tolov_muddati","kreditor","jami_summa"],"metricFields":["jami_summa","muddati_otgan_summa","ichki_kreditor_qarzdorlik"],"tableColumns":["kreditor","shartnoma","hisob_faktura","yuzaga_kelish_sanasi","tolov_muddati","jami_summa","muddati_otgan_summa","qarz_yoshi","sabab","qoplash_rejasi"],"periodMode":"month","periodLabel":"Hisobot oyi","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_FINANCE_ECONOMY_ACCOUNTS_PAYABLE';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='FINANCE_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"finance_hierarchy","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tashkilot"],"filters":["qarz_yoshi","undirish_muddati","debitor","davo_holati","jami_summa"],"metricFields":["jami_summa","muddati_otgan_summa","ichki_qarzdorlik"],"tableColumns":["debitor","shartnoma","hisob_faktura","yuzaga_kelish_sanasi","undirish_muddati","jami_summa","muddati_otgan_summa","qarz_yoshi","davo_holati","undirish_rejasi"],"periodMode":"month","periodLabel":"Hisobot oyi","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_FINANCE_ECONOMY_ACCOUNTS_RECEIVABLE';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='FINANCE_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,source_system_code='SOLIQ',
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"finance_hierarchy","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tashkilot"],"filters":["soliq_turi","nizo_holati","asosiy_qarz","penya"],"metricFields":["asosiy_qarz","penya","jarima"],"tableColumns":["soliq_turi","asosiy_qarz","penya","jarima","davr","soliq_organi","tolov_grafigi","nizo_holati"],"periodMode":"month","periodLabel":"Hisobot oyi","showTotal":true,"integration":{"system":"Soliq axborot tizimi","purpose":"Soliq qarzdorligini avtomatik olish","status":"planned"}}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_FINANCE_ECONOMY_TAX_DEBT';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='FINANCE_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"finance_hierarchy","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tashkilot"],"filters":["davr","daromad","sof_foyda","farq"],"metricFields":["daromad","reja","sof_foyda"],"tableColumns":["davr","daromad","tannarx","operasion_xarajat","soliqdan_oldingi_foyda","reja","sof_foyda","farq","otgan_yilga_nisbat"],"periodMode":"month","periodLabel":"Hisobot oyi","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_FINANCE_ECONOMY_NET_PROFIT';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='FINANCE_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,source_system_code='SOLIQ',
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"finance_hierarchy","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tashkilot"],"filters":["davr","ortacha_ish_haqi","xodimlar_soni"],"metricFields":["xodimlar_soni","ish_haqi_fondi","ortacha_ish_haqi"],"tableColumns":["davr","xodimlar_soni","ish_haqi_fondi","ortacha_ish_haqi","eng_past","eng_yuqori","otgan_davrga_nisbat"],"periodMode":"month","periodLabel":"Hisobot oyi","showTotal":true,"integration":{"system":"Soliq axborot tizimi","purpose":"O‘rtacha ish haqi va ish haqi fondini avtomatik olish","status":"planned"}}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_FINANCE_ECONOMY_AVERAGE_SALARY';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='FINANCE_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"finance_hierarchy","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tashkilot"],"filters":["aktiv_turi","holati","egalik_huquqi","qoldiq_qiymat"],"metricFields":["boshlangich_qiymat","qoldiq_qiymat"],"tableColumns":["aktiv_id","aktiv_turi","inventar_raqami","nomi","joylashuvi","egalik_huquqi","boshlangich_qiymat","qoldiq_qiymat","holati","kadastr_texpasport","masul"],"periodMode":"month","periodLabel":"Hisobot oyi","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_FINANCE_ECONOMY_ASSETS';
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,
  '$[#]',json('{"code":"yaxshi_uzunlik","label":"Yaxshi holatdagi yo‘llar","type":"number","unit":"km","required":false}'))
WHERE code='SRC_MAINTENANCE_REPAIR_ROAD_CONDITION'
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='yaxshi_uzunlik');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"tamirtalab_uzunlik","label":"Ta’mirtalab yo‘llar","type":"number","unit":"km","required":false}'))
WHERE code='SRC_MAINTENANCE_REPAIR_ROAD_CONDITION'
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='tamirtalab_uzunlik');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"yaxshi_kopriklar","label":"Yaxshi holatdagi ko‘priklar","type":"number","unit":"ta","required":false}'))
WHERE code='SRC_MAINTENANCE_REPAIR_BRIDGE_CONDITION'
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='yaxshi_kopriklar');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"tamirtalab_kopriklar","label":"Ta’mirtalab ko‘priklar","type":"number","unit":"ta","required":false}'))
WHERE code='SRC_MAINTENANCE_REPAIR_BRIDGE_CONDITION'
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='tamirtalab_kopriklar');
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=json_insert(fields_json,'$[#]',json('{"code":"yaroqsiz_kopriklar","label":"Yaroqsiz ko‘priklar","type":"number","unit":"ta","required":false}'))
WHERE code='SRC_MAINTENANCE_REPAIR_BRIDGE_CONDITION'
AND NOT EXISTS (SELECT 1 FROM json_each(app_information_templates.fields_json) WHERE json_extract(value,'$.code')='yaroqsiz_kopriklar');
--> statement-breakpoint

-- Maintenance and repair views mirror the exact workbook navigation.
UPDATE app_information_templates SET
  description='',drill_profile='ROAD_CONDITION_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"road_condition","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tuman","yol_tasnifi"],"filters":["yol_tasnifi","qoplama_turi","texnik_toifa","holat_bahosi"],"metricFields":["uzunlik","yaxshi_uzunlik","tamirtalab_uzunlik"],"tableColumns":["yol_id","yol_indeksi_va_nomi","km_boshi_oxiri","yol_tasnifi","qoplama_turi","texnik_toifa","uzunlik","holat_bahosi","yaxshi_uzunlik","tamirtalab_uzunlik","balans_saqlovchi","oxirgi_diagnostika","tamir_ehtiyoji","gis_koordinata"],"periodMode":"month","periodLabel":"Hisobot davri","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_MAINTENANCE_REPAIR_ROAD_CONDITION';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='BRIDGE_CONDITION_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"bridge_condition","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tuman","yol_tasnifi"],"filters":["yol_tasnifi","texnik_holat","texnik_toifa","inshoot_turi"],"metricFields":["kopriklar_soni","yaxshi_kopriklar","tamirtalab_kopriklar","yaroqsiz_kopriklar"],"tableColumns":["koprik_id","yol_km","yol_tasnifi","inshoot_turi","uzunligi","qurilgan_yili","texnik_toifa","texnik_holat","nuqson_toifasi","yuk_kotarish_qobiliyati","oxirgi_korik","tamir_ehtiyoji","cheklov","texnik_pasport"],"periodMode":"month","periodLabel":"Hisobot davri","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_MAINTENANCE_REPAIR_BRIDGE_CONDITION';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='WINTER_READINESS_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"winter_readiness","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tuman","tashkilot"],"filters":["taminlanganlik_foizi","tayyor_texnika","tashkilot"],"metricFields":["qum_tuz_zaxirasi","yoqilgi_zaxirasi","taminlanganlik_foizi"],"tableColumns":["tashkilot","meyoriy_ehtiyoj","amaldagi_zaxira","taminlanganlik_foizi","qum","tuz","qum_tuz_aralashmasi","dizel","benzin","tayyor_texnika","brigada","ombor_manzili","oxirgi_yangilanish"],"periodMode":"month","periodLabel":"Hisobot davri","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_MAINTENANCE_REPAIR_WINTER_READINESS';
--> statement-breakpoint

-- Merge legacy repair/disaster fields before moving their rows into the unified template.
UPDATE app_information_templates AS target
SET fields_json=(
  SELECT json_group_array(json(merged.value))
  FROM (
    SELECT CAST(base.key AS INTEGER) AS sort_order,base.value AS value
    FROM json_each(target.fields_json) AS base
    UNION ALL
    SELECT 1000 + legacy.id * 100 + CAST(extra.key AS INTEGER) AS sort_order,extra.value AS value
    FROM app_information_templates AS legacy
    JOIN json_each(legacy.fields_json) AS extra
    WHERE legacy.code IN ('SRC_MAINTENANCE_REPAIR_REPAIR_WORKS','SRC_MAINTENANCE_REPAIR_DISASTER_RECOVERY')
      AND NOT EXISTS (
        SELECT 1 FROM json_each(target.fields_json) AS existing
        WHERE json_extract(existing.value,'$.code')=json_extract(extra.value,'$.code')
      )
      AND legacy.id=(
        SELECT MIN(candidate.id)
        FROM app_information_templates AS candidate
        JOIN json_each(candidate.fields_json) AS candidate_field
        WHERE candidate.code IN ('SRC_MAINTENANCE_REPAIR_REPAIR_WORKS','SRC_MAINTENANCE_REPAIR_DISASTER_RECOVERY')
          AND json_extract(candidate_field.value,'$.code')=json_extract(extra.value,'$.code')
      )
    ORDER BY sort_order
  ) AS merged
)
WHERE target.code='SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS';
--> statement-breakpoint

UPDATE app_information_records
SET values_json=json_set(values_json,'$.ish_yonalishi',CASE
  WHEN template_id=(SELECT id FROM app_information_templates WHERE code='SRC_MAINTENANCE_REPAIR_REPAIR_WORKS') THEN 'Ta’mirlash'
  WHEN template_id=(SELECT id FROM app_information_templates WHERE code='SRC_MAINTENANCE_REPAIR_DISASTER_RECOVERY') THEN 'Tabiiy ofatlarni bartaraf etish'
  ELSE 'Saqlash' END)
WHERE json_valid(values_json)
  AND template_id IN (SELECT id FROM app_information_templates WHERE code IN (
    'SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS','SRC_MAINTENANCE_REPAIR_REPAIR_WORKS','SRC_MAINTENANCE_REPAIR_DISASTER_RECOVERY'))
  AND COALESCE(json_extract(values_json,'$.ish_yonalishi'),'')='';
--> statement-breakpoint

INSERT OR IGNORE INTO app_information_values
  (record_id,field_code,value_type,value_text)
SELECT r.id,'ish_yonalishi','select',CASE
  WHEN json_valid(r.values_json) AND COALESCE(json_extract(r.values_json,'$.ish_yonalishi'),'')<>'' THEN json_extract(r.values_json,'$.ish_yonalishi')
  WHEN t.code='SRC_MAINTENANCE_REPAIR_REPAIR_WORKS' THEN 'Ta’mirlash'
  WHEN t.code='SRC_MAINTENANCE_REPAIR_DISASTER_RECOVERY' THEN 'Tabiiy ofatlarni bartaraf etish'
  ELSE 'Saqlash' END
FROM app_information_records AS r
JOIN app_information_templates AS t ON t.id=r.template_id
WHERE t.code IN (
  'SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS','SRC_MAINTENANCE_REPAIR_REPAIR_WORKS','SRC_MAINTENANCE_REPAIR_DISASTER_RECOVERY');
--> statement-breakpoint

-- Prefix legacy source keys before reassignment so the target template's unique source index cannot collide.
UPDATE app_information_records
SET source_record_key='legacy-template-' || template_id || '-record-' || id || ':' || source_record_key
WHERE source_record_key IS NOT NULL
  AND template_id IN (SELECT id FROM app_information_templates WHERE code IN (
    'SRC_MAINTENANCE_REPAIR_REPAIR_WORKS','SRC_MAINTENANCE_REPAIR_DISASTER_RECOVERY'));
--> statement-breakpoint

UPDATE app_information_records
SET template_id=(SELECT id FROM app_information_templates WHERE code='SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS')
WHERE template_id IN (SELECT id FROM app_information_templates WHERE code IN (
  'SRC_MAINTENANCE_REPAIR_REPAIR_WORKS','SRC_MAINTENANCE_REPAIR_DISASTER_RECOVERY'))
  AND EXISTS (SELECT 1 FROM app_information_templates WHERE code='SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS');
--> statement-breakpoint

UPDATE app_information_templates SET
  name='Umumiy foydalanishdagi avtomobil yo‘llarini ekspluatatsiya qilish uchun ajratilgan mablag‘lar',description='',drill_profile='ROAD_OPERATION_FUNDING',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"road_operations_funding","sourceBacked":true,"demoMode":"schema-only","tabField":"ish_yonalishi","tabs":[{"id":"all","label":"Barchasi"},{"id":"maintenance","label":"Saqlash","value":"Saqlash","filters":["yol","bajaruvchi","ajratilgan_mablag"],"columns":["ish_yonalishi","yol","ishlar","ajratilgan_mablag","sarflangan_mablag","reja_hajmi","amal_hajmi","ijro_foizi","bajaruvchi","sana","tasdiqlovchi_hujjat"]},{"id":"repair","label":"Ta’mirlash","value":"Ta’mirlash","filters":["yol","bajaruvchi","ajratilgan_mablag"],"columns":["ish_yonalishi","yol","ishlar","ajratilgan_mablag","sarflangan_mablag","reja_hajmi","amal_hajmi","ijro_foizi","bajaruvchi","sana","tasdiqlovchi_hujjat"]},{"id":"disaster","label":"Tabiiy ofatlarni bartaraf etish","value":"Tabiiy ofatlarni bartaraf etish","filters":["yol","bajaruvchi","ajratilgan_mablag"],"columns":["ish_yonalishi","yol","ishlar","ajratilgan_mablag","sarflangan_mablag","reja_hajmi","amal_hajmi","ijro_foizi","bajaruvchi","sana","tasdiqlovchi_hujjat"]}],"drilldown":["hudud","tuman","tashkilot"],"filters":["ish_yonalishi","yol","bajaruvchi","ajratilgan_mablag"],"metricFields":["ajratilgan_mablag","sarflangan_mablag","ijro_foizi"],"tableColumns":["ish_yonalishi","yol","ishlar","ajratilgan_mablag","sarflangan_mablag","reja_hajmi","amal_hajmi","ijro_foizi","bajaruvchi","sana","tasdiqlovchi_hujjat"],"periodMode":"month","periodLabel":"Reja va amaldagi oy","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS';
--> statement-breakpoint

-- Historical rows now retain their IDs/history/files under the unified template; hide emptied legacy cards.
UPDATE app_information_templates
SET presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
  '{"consolidatedInto":"SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS","hiddenFromCatalog":true}'),
  catalog_version='catalog-clarifications-2026-08-11',version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE code IN ('SRC_MAINTENANCE_REPAIR_REPAIR_WORKS','SRC_MAINTENANCE_REPAIR_DISASTER_RECOVERY')
AND NOT EXISTS (SELECT 1 FROM app_information_records r WHERE r.template_id=app_information_templates.id);
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='ROAD_UNIT_BUILDINGS_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"road_unit_buildings","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tashkilot"],"filters":["bino_turi","texnik_holat","egalik_huquqi","tamir_ehtiyoji"],"metricFields":["soni","er_maydoni","bino_maydoni"],"tableColumns":["bino_id","yol_bolimi","bino_turi","manzil","koordinata","er_maydoni","bino_maydoni","kadastr_raqami","egalik_huquqi","qurilgan_yili","texnik_holat","tamir_ehtiyoji","hujjatlar","foto"],"periodMode":"year","periodLabel":"Hisobot yili","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_MAINTENANCE_REPAIR_ROAD_UNIT_BUILDINGS';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='ROAD_ELEMENTS_MATRIX',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"road_elements_matrix","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud"],"filters":["element_turi","holat","yol_km"],"metricFields":["mavjud_soni"],"tableColumns":["element_id","element_turi","yol_km","meyor_boyicha_talab","mavjud_soni","soz_soni","tamirtalab_soni","etishmaydigan_soni","ornatilgan_sana","holat","foto","koordinata"],"periodMode":"month","periodLabel":"Hisobot davri","showTotal":true,"hideCountColumn":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_MAINTENANCE_REPAIR_ROAD_ELEMENTS';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='SERVICE_OBJECTS_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"service_objects_in_progress","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tuman","yol_km"],"filters":["obekt_turi","joriy_bosqich","moliyalashtirish_manbasi","tashabbuskor"],"metricFields":["ajratilgan_mablag","ajratilgan_ozlashtirilgan_mablag","umumiy_qiymat"],"tableColumns":["loyiha_nomi","obekt_turi","tashabbuskor","yol_km","er_uchastkasi","joriy_bosqich","umumiy_qiymat","moliyalashtirish_manbasi","ajratilgan_mablag","ajratilgan_ozlashtirilgan_mablag","fizik_ijro","boshlanish_ochilish_sanasi","muammo","keyingi_qadam","hujjatlar","foto"],"periodMode":"month","periodLabel":"Hisobot davri","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_ROADSIDE_INFRASTRUCTURE_SERVICE_OBJECTS_IN_PROGRESS';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='MACHINERY_UTILIZATION_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"machinery_utilization_hierarchy","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tashkilot","texnika_id"],"filters":["texnika_id","operator","foydalanish_foizi","tamir_kunlari"],"metricFields":["ishlagan_soat","bekor_turgan_soat","foydalanish_foizi"],"tableColumns":["texnika_id","davr","mavjud_ish_vaqti","ishlagan_soat","bekor_turgan_soat","foydalanish_foizi","bajargan_ish","sarflangan_yoqilgi","gps_masofa","bekor_turish_sababi","tamir_kunlari","operator"],"periodMode":"month","periodLabel":"Hisobot davri","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_ROAD_MACHINERY_MACHINERY_UTILIZATION';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='INFORMATION_SYSTEM_REGISTRY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"information_system_registry","sourceBacked":true,"demoMode":"schema-only","drilldown":["nomi"],"filters":["joriy_bosqich","ishlab_chiquvchi","buyurtmachi","integrasiyalar"],"metricFields":["foydalanuvchilar","qiymat","sla_uptime"],"tableColumns":["tizim_id","nomi","buyurtmachi","ishlab_chiquvchi","maqsad","joriy_bosqich","foydalanuvchilar","modullar","integrasiyalar","qiymat","ishga_tushirish_sanasi","reestr_raqami","kiberxavfsizlik_xulosasi","sla_uptime","masul"],"periodMode":"none","showTotal":false}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_DIGITALIZATION_INNOVATION_INFORMATION_SYSTEMS';
--> statement-breakpoint

UPDATE app_information_templates
SET fields_json=(SELECT json_group_array(json(CASE
  WHEN json_extract(value,'$.code')='hujjat_turi' THEN json_patch(value,'{"type":"select","options":["SHNQ","IQN","GOST","MSt"]}')
  WHEN json_extract(value,'$.code')='turi' THEN json_patch(value,'{"type":"select","options":["SHNQ","IQN","GOST","MSt"]}')
  ELSE value END)) FROM json_each(app_information_templates.fields_json))
WHERE code='SRC_DIGITALIZATION_INNOVATION_NORMATIVE_TECHNICAL_DOCUMENTS';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='NORMATIVE_DOCUMENT_REGISTRY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"normative_documents","sourceBacked":true,"demoMode":"schema-only","drilldown":["turi"],"filters":["turi","joriy_bosqich","ishlab_chiquvchi","tasdiqlovchi_organ"],"metricFields":["soni"],"tableColumns":["hujjat_id","turi","raqami","nomi","amaldagi_tahrir","tasdiqlovchi_organ","tasdiq_sanasi","ishlab_chiquvchi","joriy_bosqich","reja_sanasi","almashtiradigan_hujjat","fayl"],"periodMode":"none","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_DIGITALIZATION_INNOVATION_NORMATIVE_TECHNICAL_DOCUMENTS';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='PPP_REGIONAL_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"ppp_regional_hierarchy","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","nomi"],"filters":["joriy_bosqich","tender_holati","xususiy_sherik","umumiy_qiymat"],"metricFields":["umumiy_qiymat"],"tableColumns":["loyiha_id","nomi","tarmoq_obekt","xususiy_sherik","joriy_bosqich","tender_holati","umumiy_qiymat","davlat_majburiyati","xususiy_investisiya","muddat","asosiy_xavf","keyingi_qadam","hujjatlar"],"periodMode":"month","periodLabel":"Hisobot davri","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_INVESTMENTS_PPP_PPP_PROJECTS';
--> statement-breakpoint

UPDATE app_information_templates SET
  description='',drill_profile='EMPLOYEE_HIERARCHY',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"employee_hierarchy","sourceBacked":true,"demoMode":"schema-only","drilldown":["hudud","tashkilot","f_i_sh"],"filters":["bolim","shtat_lavozim","jins","malumoti","bandlik_turi","maqom"],"tableColumns":["xodim_id","f_i_sh","tugilgan_sana","tashkilot","bolim","shtat_lavozim","bandlik_turi","ishga_qabul_sanasi","umumiy_sohaviy_staj","malumoti","mutaxassisligi","toifa_daraja","telefon","ichki_raqam","foto","maqom"],"periodMode":"none","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY';
--> statement-breakpoint

-- One catalogue card, four fully usable thematic tabs exactly as specified in the workbook.
UPDATE app_information_templates SET
  name='Sport va yoshlar ma’lumotlari',description='',drill_profile='SPORTS_YOUTH_FOUR_TYPES',catalog_version='catalog-clarifications-2026-08-11',version=version+1,
  presentation_json=json_patch(CASE WHEN json_valid(presentation_json) THEN presentation_json ELSE '{}' END,
    '{"profile":"sports_youth_tabs","sourceBacked":true,"demoMode":"schema-only","tabField":"malumot_turi","tabs":[{"id":"training","label":"Sport mashg‘ulotlari","value":"Sport mashg‘ulotlari","filters":["tashkilot","tashkilotchi"],"columns":["nomi","sana_joy","tashkilot","tashkilotchi","qatnashchilar","ishtirokchilar_soni","natija_orin","foto_hujjat"]},{"id":"competition","label":"Sport musobaqalari","value":"Sport musobaqalari","filters":["tashkilot","tashkilotchi"],"columns":["sport_musobaqasi","nomi","sana_joy","tashkilot","tashkilotchi","qatnashchilar","ishtirokchilar_soni","natija_orin","foto_hujjat"]},{"id":"leadership","label":"Rahbar va yoshlar uchrashuvlari","value":"Rahbar va yoshlar uchrashuvlari","filters":["tashkilot","tashkilotchi"],"columns":["yoshlar_uchrashuvi","nomi","sana_joy","tashkilot","tashkilotchi","qatnashchilar","ishtirokchilar_soni","natija_orin","foto_hujjat"]},{"id":"talent","label":"Iqtidorli yoshlar","value":"Iqtidorli yoshlar","filters":["tashkilot","iqtidor_yonalishi","til"],"columns":["iqtidorli_yosh","tashkilot","iqtidor_yonalishi","yutuq","til","sertifikat_nomi_darajasi","amal_qilish_muddati","foto_hujjat"]}],"drilldown":["hudud","tashkilot"],"filters":["malumot_turi","tashkilot","tashkilotchi","iqtidor_yonalishi","til"],"metricFields":["ishtirokchilar_soni"],"tableColumns":["malumot_turi","nomi","sana_joy","tashkilot","tashkilotchi","qatnashchilar","ishtirokchilar_soni","sport_musobaqasi","yoshlar_uchrashuvi","iqtidorli_yosh","iqtidor_yonalishi","yutuq","til","sertifikat_nomi_darajasi","amal_qilish_muddati","foto_hujjat"],"periodMode":"date-range","periodLabel":"Sana oralig‘i","showTotal":true}'),updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_SPORTS_YOUTH_SPORTS_YOUTH_EVENTS';
--> statement-breakpoint
