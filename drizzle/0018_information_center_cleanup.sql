-- Keep only the 49 information types sourced from the approved workbook.
-- Supplementary ideas remain recoverable for historical records, but are no
-- longer part of the active catalogue.
UPDATE app_information_templates
SET active=0,
    catalog_state='removed',
    updated_at=CURRENT_TIMESTAMP
WHERE code IN (
  'SRC_DIGITALIZATION_INNOVATION_EXTRA_XORIJIY_TAJRIBANI_ORGANISH_VA_JORIY_ETISH',
  'SRC_PRESS_SERVICE_EXTRA_JAMOATCHILIK_MUNOSABATI_VA_INQIROZLI_KOMMUNIKASIYA',
  'SRC_FINANCE_ECONOMY_EXTRA_BYUDJET_VA_PUL_OQIMI',
  'SRC_MAINTENANCE_REPAIR_EXTRA_YOLLARNING_XIZMAT_KORSATISH_DARAJASI',
  'SRC_HUMAN_RESOURCES_EXTRA_SHTAT_VA_VAKANSIYALAR'
);
--> statement-breakpoint

-- OAV monitoring is intentionally a single regional view. It does not drill
-- into districts or organizations, and its controls use exact field codes.
UPDATE app_information_templates
SET presentation_json=json_set(
      presentation_json,
      '$.drilldown',json('["hudud"]'),
      '$.filters',json('["hudud","oav_turi","tonallik"]'),
      '$.tableColumns',json('["elon_sanasi","hudud","oav_nomi","oav_turi","mavzu","yol_sohasiga_oid_material","material_havolasi","qamrov","tonallik","javob_talab_etiladimi","masul"]')
    ),
    updated_at=CURRENT_TIMESTAMP
WHERE code='SRC_PRESS_SERVICE_MEDIA_COVERAGE';
