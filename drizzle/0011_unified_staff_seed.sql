-- Source: avtoyol_yagona_shtatlar.xlsx, validated 2026-08-01.
--> statement-breakpoint
-- Organizations are imported from the registry. Inferred parent links remain hierarchy_verified=0 until an administrator confirms them.
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Марказий аппарат','Марказий аппарат','central',NULL,'tashkent_city','200541754',1,'CENTRAL-WEB','Toshkent shahri, Mirzo Ulug''bek tumani Asaka MFY, Mustakillik shoh ko`chasi, 68-uy','Автомобил йўллари давлат бошқарув органи','Штат маълумоти бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Андижон вилояти автомобиль йўллари бош бошқармаси','Андижон вилояти автомобиль йўллари бош бошқармаси','territorial',NULL,'andijan','200230895',2,'HBB-MINMAX / HBB-LIMIT','Андижон вилояти, Андижон шаҳри, А.Йўлдошев кўчаси 30-уй','Бошқарув','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Андижон кўприклардан фойдаланиш корхонаси','Андижон кўприклардан фойдаланиш корхонаси','bridge',NULL,'andijan','202953912',3,NULL,'Андижон вилояти, Андижон тумани, Терактаги МФЙ, Асакайўли кўчаси','Йўл ва кўприк қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Андижон минтақавий йўлларга буюртмачи хизмати','Андижон минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'andijan','304917491',4,'MYBX-MINMAX / MYBX-LIMIT','Андижон ввилояти, Андижон шаҳри, Айланма халқа йўли 5-уй','Буюртмачи хизмати','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Андижон йўллардан мунтазам фойдаланиш корхонаси','Андижон йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'andijan','305280091',5,'MYFK-16','Андижон вилояти, Андижон тумани, Терактаги МФЙ, Асакайўли кўчаси','Йўл қурилиш (таъмирлаш)','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Андижон туман йўллардан фойдаланиш корхонаси','Андижон туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','201330683',6,NULL,'Андижон вилояти, Андижон тумани, Найманобод МФЙ, Найман кўчаси 10-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Асака туман йўллардан фойдаланиш корхонаси','Асака туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200283728',7,NULL,'Андижон вилояти, Асака тумани, Янгисор МФЙ, Янгисор кўчаси 309-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Балиқчи туман йўллардан фойдаланиш корхонаси','Балиқчи туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200260470',8,NULL,'Андижон вилояти, Балиқчи тумани, Оққўрғон МФЙ, Андижон кўчаси 11-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бўстон туман йўллардан фойдаланиш корхонаси','Бўстон туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200263672',9,NULL,'Андижон вилояти, Булоқбоши тумани, Қумгузар МФЙ, Намуна кўчаси 1-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Булоқбоши туман йўллардан фойдаланиш корхонаси','Булоқбоши туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200265725',10,NULL,'Андижон вилояти, Бўстон тумани, Пиллакор МФЙ, Ипак йўли кўчаси 58-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Жалақудуқ туман йўллардан фойдаланиш корхонаси','Жалақудуқ туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200269054',11,NULL,'Андижон вилояти, Жалақудуқ тумани, Бойчеки МФЙ, Нафосат кўчаси 33-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Избоскан туман йўллардан фойдаланиш корхонаси','Избоскан туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200271616',12,NULL,'Андижон вилояти, Избоскан туман, Урганжи МФЙ, Маданиятйўли кўчаси 47-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Улуғнор туман йўллардан фойдаланиш корхонаси','Улуғнор туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200273834',13,NULL,'Андижон вилояти, Қўрғонтепа туман, Наврўз МФЙ, Заробод кўчаси 5-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қўрғонтепа туман йўллардан фойдаланиш корхонаси','Қўрғонтепа туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200279485',14,NULL,'Андижон вилояти, Марҳамат тумани, Наврўз МФЙ, Мустақиллик кўчаси 14-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Мархамат туман йўллардан фойдаланиш корхонаси','Мархамат туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200286747',15,NULL,'Андижон вилояти, Олтинкўл тумани, Иттифоқ МФЙ, Олтинкўл шохкўчаси, 27-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Олтинкўл туман йўллардан фойдаланиш корхонаси','Олтинкўл туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200254880',16,NULL,'Андижон вилояти, Пахтаобод тумани, Қашқар МФЙ, Меҳр нури кўчаси 3-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Пахтаобод туман йўллардан фойдаланиш корхонаси','Пахтаобод туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200295300',17,NULL,'Андижон вилояти, Улуғнор тумани, Бобур МФЙ, Газчилар кўчаси, 1-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Хўжаобод туман йўллардан фойдаланиш корхонаси','Хўжаобод туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','201503300',18,NULL,'Андижон вилояти, Хўжаобод тумани, Ипакчи МФЙ, Каналбўйи кўчаси, 1-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Шахрихон туман йўллардан фойдаланиш корхонаси','Шахрихон туман йўллардан фойдаланиш корхонаси','district',NULL,'andijan','200292828',19,NULL,'Андижон вилояти, Шаҳрихон туман, Тараққиёт МФЙ, Р.Ёдгоров кўчаси 112-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бухоро вилояти автомобиль йўллари бош бошқармаси','Бухоро вилояти автомобиль йўллари бош бошқармаси','territorial',NULL,'bukhara','201188890',21,'HBB-MINMAX / HBB-LIMIT','Бухоро вилоят Бухоро шахар Ғиждувон кучаси 272 уй','Бошқарув аппарати','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бухоро кўприклардан фойдаланиш корхонаси','Бухоро кўприклардан фойдаланиш корхонаси','bridge',NULL,'bukhara','200856052',22,NULL,'Бухоро вилоят Бухоро шахар Саноатчилар кучаси 5 уй','Кўприк қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бухоро минтақавий йўлларга буюртмачи хизмати','Бухоро минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'bukhara','304901663',23,'MYBX-MINMAX / MYBX-LIMIT','Бухоро вилоят Бухоро шахар ок масжид кучаси 8а уй','Ягона бюртмачи хизмати','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бухоро йўллардан мунтазам фойдаланиш корхонаси','Бухоро йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'bukhara','206840820',24,'MYFK-16','Бухоро вилоят Бухоро шахар ок масжид кучаси 8 уй','Йўл қурилиш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ромитан йўллардан мунтазам фойдаланиш корхонаси','Ромитан йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'bukhara','305362693',25,'MYFK-16','Бухоро вилоят Бухоро шахар Низомий кўчаси 20а уй','Йўл қурилиш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Вобкент туман йўллардан фойдаланиш корхонаси','Вобкент туман йўллардан фойдаланиш корхонаси','district',NULL,'bukhara','201407973',26,NULL,'Бухоро вилояти Вобкент туман Беруний кўчаси 10 уй','Йўл қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Жондор туман йўллардан фойдаланиш корхонаси','Жондор туман йўллардан фойдаланиш корхонаси','district',NULL,'bukhara','201808324',27,NULL,'Бухоро вилояти Жондор туман Пўлоти ҚФЙ Арабхона қ. 5-уй','Йўл қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Олот туман йўллардан фойдаланиш корхонаси','Олот туман йўллардан фойдаланиш корхонаси','district',NULL,'bukhara','201474884',28,NULL,'Бухоро вилояти Олот туман  Чорбоғ ҚФЙ','Йўл қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Пешку туман йўллардан фойдаланиш корхонаси','Пешку туман йўллардан фойдаланиш корхонаси','district',NULL,'bukhara','200882228',29,NULL,'Бухоро вилояти Пешку туман Зандани кўчаси 1 уй','Йўл қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ромитан туман йўллардан фойдаланиш корхонаси','Ромитан туман йўллардан фойдаланиш корхонаси','district',NULL,'bukhara','201043716',30,NULL,'Бухоро вилояти Ромитан тумани Шурча МФЙ 1 уй','Йўл қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қоракўл туман йўллардан фойдаланиш корхонаси','Қоракўл туман йўллардан фойдаланиш корхонаси','district',NULL,'bukhara','200881141',31,NULL,'Бух.обл.Каракулский рай.улица С. Айний 2','Йўл қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ғиждувон туман йўллардан фойдаланиш корхонаси','Ғиждувон туман йўллардан фойдаланиш корхонаси','district',NULL,'bukhara','201148093',32,NULL,'Бух.обл.Гиждуванский рай.улица Б.Накшбандий 96','Йўл қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Шофиркон туман йўллардан фойдаланиш корхонаси','Шофиркон туман йўллардан фойдаланиш корхонаси','district',NULL,'bukhara','201114262',33,NULL,'Бух.обл.Шафирканский рай.улица Наваий 48','Йўл қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Когон туман йўллардан фойдаланиш корхонаси','Когон туман йўллардан фойдаланиш корхонаси','district',NULL,'bukhara','201172699',34,NULL,'Бухоро вилояти Когон туман Туткунда МФЙ Туткунда 33/1-уй','Йўл қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бухоро туман йўллардан фойдаланиш корхонаси','Бухоро туман йўллардан фойдаланиш корхонаси','district',NULL,'bukhara','200996679',35,NULL,'Бухоро вилояти Бухоро туман Зарафшон кўчаси 9 уй','Йўл қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қоровулбозор туман йўллардан фойдаланиш корхонаси','Қоровулбозор туман йўллардан фойдаланиш корхонаси','district',NULL,'bukhara','207112689',36,NULL,'Бухоро вилояти Қоровулбозор туман Чўлқувар массиви','Йўл қурилиш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Жиззах вилояти автомобиль йўллари бош бошқармаси','Жиззах вилояти автомобиль йўллари бош бошқармаси','territorial',NULL,'jizzakh','201988537',40,'HBB-MINMAX / HBB-LIMIT','Жиззах шаҳар, Маданият махалласи, Пахтакор кўчаси 10-уй','84112-Даавлат хокимияти ва бошқарувининг ҳудудий идоралари фаолият','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Жиззах кўприклардан фойдаланиш корхонаси','Жиззах кўприклардан фойдаланиш корхонаси','bridge',NULL,'jizzakh','205920911',41,NULL,'Жиззах вилояти, Жиззах шахар, Сайҳан махалласи','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Жиззах минтақавий йўлларга буюртмачи хизмати','Жиззах минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'jizzakh','304897494',42,'MYBX-MINMAX / MYBX-LIMIT','Жиззах шаҳар, Маданият махалласи, Пахтакор кўчаси 10-уй','41100-Қурилиш лойиҳаларини ишлаб чиқиш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Арнасой туман йўллардан фойдаланиш корхонаси','Арнасой туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','200331944',43,NULL,'Жиззах вилояти, Арнасой тумани, Голиблар шаҳарчаси, А.Яссавий кучаси','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бахмал туман йўллардан фойдаланиш корхонаси','Бахмал туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','201030154',44,NULL,'Жиззах вилояти, Бахмал тумани, Ўсмат шаҳарчаси, Самарқанд кўчаси','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ғаллаорол туман йўллардан фойдаланиш корхонаси','Ғаллаорол туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','201089168',45,NULL,'Жиззах вилояти, Ғаллаорол тумани, Сарбозор қўрғони','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Дўстлик туман йўллардан фойдаланиш корхонаси','Дўстлик туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','200998969',46,NULL,'Жиззах вилояти, Дўстлик тумани, Саноатчилар МФЙ, Саноатчилар кучаси 10а','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Зомин туман йўллардан фойдаланиш корхонаси','Зомин туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','200336160',47,NULL,'Жиззах вилояти, Зомин тумани, Мустақиллик кўчаси 104 уй','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Зарбдор туман йўллардан фойдаланиш корхонаси','Зарбдор туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','201356627',48,NULL,'Жиззах вилояти, Зарбдор тумани, Мустақиллик шох кўчаси','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Зафаробод туман йўллардан фойдаланиш корхонаси','Зафаробод туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','201598760',49,NULL,'Жиззах вилояти, Зафаробод тумани, Зафаробод шаҳарчаси, Нодирабегим кўчаси 4 уй.','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Мирзачўл туман йўллардан фойдаланиш корхонаси','Мирзачўл туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','200339172',50,NULL,'Мирзачўл тумани, Гагарин шаҳри, Пахтакор кўчаси 9 уй','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Пахтакор туман йўллардан фойдаланиш корхонаси','Пахтакор туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','200339932',51,NULL,'Жиззах вилояти, Пахтакор тумани, Ғалаба маҳалласи, Мустақиллик кўчаси 12 уй','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Фориш туман йўллардан фойдаланиш корхонаси','Фориш туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','200340600',52,NULL,'Жиззах вилояти, Фориш тумани, Богдон шахарчаси, Амир Темур кўчаси 7 уй','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Янгиобод туман йўллардан фойдаланиш корхонаси','Янгиобод туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','202937923',53,NULL,'Жиззах вилояти, Янгиобод тумани, Тараққиёт кўчаси','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Шароф Рашидов туман йўллардан фойдаланиш корхонаси','Шароф Рашидов туман йўллардан фойдаланиш корхонаси','district',NULL,'jizzakh','206976628',54,NULL,'Жиззах вилояти, Жиззах шаҳри, А.Авлоний кўчаси','42110-Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қашқадарё вилояти автомобиль йўллари бош бошқармаси','Қашқадарё вилояти автомобиль йўллари бош бошқармаси','territorial',NULL,'kashkadarya','201998818',56,'HBB-MINMAX / HBB-LIMIT','Қашқадарё вилояти, Қарши шахар, Хонобод-23','Бошқарув','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қашқадарё кўприклардан фойдаланиш корхонаси','Қашқадарё кўприклардан фойдаланиш корхонаси','bridge',NULL,'kashkadarya','200694294',57,NULL,'Қашқадарё вилояти, Китоб туман, Бюук ипак йўли кўчаси 1-уй','Йўл ва кўприк қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қашқадарё минтақавий йўлларга буюртмачи хизмати','Қашқадарё минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'kashkadarya','304934733',58,'MYBX-MINMAX / MYBX-LIMIT','Қашқадарё вилояти, Қарши шахар, Хонобод-23','Буюртмачи хизмати','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қашқадарё йўллардан мунтазам фойдаланиш корхонаси','Қашқадарё йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'kashkadarya','206820624',59,'MYFK-16','Қашқадарё вилояти, Қарши шахар тўрткўл кўчаси 2-уй','Йўл қурилиш (таъмирлаш)','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қарши йўллардан мунтазам фойдаланиш корхонаси','Қарши йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'kashkadarya','309081241',60,'MYFK-16','Қашқадарё вилояти, Қарши шахар,  Хонобод А.Навойи кўчалари чоррохасида жойлашган 66-уй','Йўл қурилиш (таъмирлаш)','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ғузор туман йўллардан фойдаланиш корхонаси','Ғузор туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','200676712',61,NULL,'Қашқадарё вилояти, Ғузор туман, Мустақиллик кўчаси 21 уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Деҳқонобод туман йўллардан фойдаланиш корхонаси','Деҳқонобод туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','201047314',62,NULL,'Қашқадарё вилояти, Дехқонобод туман, Қарашина ш, М.Улуғбек кўчаси 2 уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қамаши туман йўллардан фойдаланиш корхонаси','Қамаши туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','201575663',63,NULL,'Қашқадарё вилояти, Қамаши туман, Ифтихор кўчаси 2 уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қарши туман йўллардан фойдаланиш корхонаси','Қарши туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','200686423',64,NULL,'Қашқадарё вилояти, Қарши туман, Бешкент айланма йўли','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Касби туман йўллардан фойдаланиш корхонаси','Касби туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','200699501',65,NULL,'Қашқадарё вилояти, Касби туман, Муғлон қишлоғи','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Косон туман йўллардан фойдаланиш корхонаси','Косон туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','206833077',66,NULL,'Қашқадарё вилояти, Косон туман, С.Айний кўчаси','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Муборак туман йўллардан фойдаланиш корхонаси','Муборак туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','201571352',67,NULL,'Қашқадарё вилояти, Муборак туман, ишлаб чиқариш худуди','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Миришкор туман йўллардан фойдаланиш корхонаси','Миришкор туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','200701395',68,NULL,'Қашқадарё вилояти, Миришкор туман, У.Ғаниев кўчаси','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Нишон туман йўллардан фойдаланиш корхонаси','Нишон туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','201284764',69,NULL,'Қашқадарё вилояти, Нишон туман, эски Нишон махалласи','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Чироқчи туман йўллардан фойдаланиш корхонаси','Чироқчи туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','200703804',70,NULL,'Қашқадарё вилояти, Чироқчи туман, Янги қурилиш кўчаси  77-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Шахрисабз туман йўллардан фойдаланиш корхонаси','Шахрисабз туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','200704107',71,NULL,'Қашқадарё вилояти, Шахрисабз шахар, Фусункор кўчаси 70-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Яккабоғ туман йўллардан фойдаланиш корхонаси','Яккабоғ туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','200708679',72,NULL,'Қашқадарё вилояти, Яккабоғ туман, Саховат кўчаси 5-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Китоб туман йўллардан фойдаланиш корхонаси','Китоб туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','206994614',73,NULL,'Қашқадарё вилояти, Китоб туман, М.Турсунзода кўчаси 100-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Кўкдала туман йўллардан фойдаланиш корхонаси','Кўкдала туман йўллардан фойдаланиш корхонаси','district',NULL,'kashkadarya','309659407',74,NULL,'Қашқадарё вилояти, Кщкдала туман, Умархаём кўчаси 77-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Навоий вилояти автомобиль йўллари бош бошқармаси','Навоий вилояти автомобиль йўллари бош бошқармаси','territorial',NULL,'navoi','200850780',76,'HBB-MINMAX / HBB-LIMIT','Навоий вилоят, Навоий шахри,  Гулистон  қўрғони Навўз кўчаси 29-уй','Йўл қурилиш (таъмирлаш)','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Навоий кўприклардан фойдаланиш корхонаси','Навоий кўприклардан фойдаланиш корхонаси','bridge',NULL,'navoi','203229093',77,NULL,'Навоий вилоят, Қизилтепа тумани, Маликобод  қўрғони','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Навоий минтақавий йўлларга буюртмачи хизмати','Навоий минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'navoi','207254171',78,'MYBX-MINMAX / MYBX-LIMIT','Навоий вилоят, Навоий шахри,  Гулистон  қўрғони Навўз кўчаси, 29-уй','Йўл қурилиш (таъмирлаш)','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Навоий йўллардан мунтазам фойдаланиш корхонаси','Навоий йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'navoi','305316725',79,'MYFK-16','Навоий вилоят, Навоий шахри,   С.Айний кўчаси, 70-уй','Йўл қурилиш (таъмирлаш)','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Конимех туман йўллардан фойдаланиш корхонаси','Конимех туман йўллардан фойдаланиш корхонаси','district',NULL,'navoi','200013904',80,NULL,'Навоий вилоят, Конимех тумани,   Нурафшон кўчаси, 46-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Навбахор туман йўллардан фойдаланиш корхонаси','Навбахор туман йўллардан фойдаланиш корхонаси','district',NULL,'navoi','200021221',81,NULL,'Навоий вилоят, Навбахор тумани,   Келачи МФЙ','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Учқудуқ туман йўллардан фойдаланиш корхонаси','Учқудуқ туман йўллардан фойдаланиш корхонаси','district',NULL,'navoi','200011280',82,NULL,'Навоий вилоят, Учқўдуқ тумани,   Юксалиш кўчаси, 341-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Томди туман йўллардан фойдаланиш корхонаси','Томди туман йўллардан фойдаланиш корхонаси','district',NULL,'navoi','204771315',83,NULL,'Навоий вилоят, Томди тумани, Ажириқти кўчаси','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Хатирчи туман йўллардан фойдаланиш корхонаси','Хатирчи туман йўллардан фойдаланиш корхонаси','district',NULL,'navoi','200023432',84,NULL,'Навоий вилоят, Хатирчи тумани, Дамариқ МФЙ,  А.Яссавий кўчаси, 76-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қизилтепа туман йўллардан фойдаланиш корхонаси','Қизилтепа туман йўллардан фойдаланиш корхонаси','district',NULL,'navoi','200016338',85,NULL,'Навоий вилоят, Қизилтепа тумани, Маликобод  қўрғони','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Нурота туман йўллардан фойдаланиш корхонаси','Нурота туман йўллардан фойдаланиш корхонаси','district',NULL,'navoi','200030923',86,NULL,'Навоий вилоят, Нурота тумани, С.Сиддиқов кўчаси, 100-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Кармана туман йўллардан фойдаланиш корхонаси','Кармана туман йўллардан фойдаланиш корхонаси','district',NULL,'navoi','200034102',87,NULL,'Навоий вилоят, Кармана тумани, Уйрот кўчаси, 121-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Наманган вилояти автомобиль йўллари бош бошқармаси','Наманган вилояти автомобиль йўллари бош бошқармаси','territorial',NULL,'namangan','200047323',90,'HBB-MINMAX / HBB-LIMIT','Наманган вилоят, Наманган шаҳри, Саноат кўчаси 19-уй','Бошқарув','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Наманган кўприклардан фойдаланиш корхонаси','Наманган кўприклардан фойдаланиш корхонаси','bridge',NULL,'namangan','200048661',91,NULL,'Наманган вилоят, Наманган шаҳри, Полековский кўчаси 12-уй','Йўл ва кўприк қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Наманган минтақавий йўлларга буюртмачи хизмати','Наманган минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'namangan','304893929',92,'MYBX-MINMAX / MYBX-LIMIT','Наманган вилоят, Наманган шаҳри, Саноат кўчаси 19-уй','Буюртмачи хизмати','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Мингбулоқ туман йўллардан фойдаланиш корхонаси','Мингбулоқ туман йўллардан фойдаланиш корхонаси','district',NULL,'namangan','200069826',93,NULL,'Наманган вилоят, Мингбулоқ туман, Жомашуй шаҳарчаси, Андижон йўли ўчаси 32-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Чуст туман йўллардан фойдаланиш корхонаси','Чуст туман йўллардан фойдаланиш корхонаси','district',NULL,'namangan','200110214',94,NULL,'Наманган вилоят, Чуст тумин, Чуст шаҳар, Янгийўл 10 уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Наманган туман йўллардан фойдаланиш корхонаси','Наманган туман йўллардан фойдаланиш корхонаси','district',NULL,'namangan','200082313',95,NULL,'Наманган вилоят, Наманган тумани, Тошбулоқ шаҳарчаси, Мустақилликнинг 5 йиллиги кўчаси','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Косонсой туман йўллардан фойдаланиш корхонаси','Косонсой туман йўллардан фойдаланиш корхонаси','district',NULL,'namangan','200074385',96,NULL,'Наманган вилоят, Косонсой туман, Гўрмирон МФЙ,','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Янгиқўрғон туман йўллардан фойдаланиш корхонаси','Янгиқўрғон туман йўллардан фойдаланиш корхонаси','district',NULL,'namangan','200118130',97,NULL,'Наманган вилоят, Янгиқўрғон тумани, Янгиқўрғон шаҳри, А.Қўчқаров кўчаси 19-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Учқўрғон туман йўллардан фойдаланиш корхонаси','Учқўрғон туман йўллардан фойдаланиш корхонаси','district',NULL,'namangan','200102777',98,NULL,'Наманган вилояти,Учқўрғон тумани,Учқўрғон шахар, Мустақиллик кўчаси, 95-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Норин туман йўллардан фойдаланиш корхонаси','Норин туман йўллардан фойдаланиш корхонаси','district',NULL,'namangan','200086774',99,NULL,'Наманган вилоят, Норин туман, Хаққулобод шаҳри, Беруний кўчаси 78-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Уйчи туман йўллардан фойдаланиш корхонаси','Уйчи туман йўллардан фойдаланиш корхонаси','district',NULL,'namangan','200098427',100,NULL,'Наманган вилоят, Уйчи тумани, Ёрқўрғон, Янгичек МФЙ, А.Темур кўчаси','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Чортоқ туман йўллардан фойдаланиш корхонаси','Чортоқ туман йўллардан фойдаланиш корхонаси','district',NULL,'namangan','200106898',101,NULL,'Наманган вилояти, Чортоқ тумани, Мустақиллик шох кўчаси, 10-уй.','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Поп туман йўллардан фойдаланиш корхонаси','Поп туман йўллардан фойдаланиш корхонаси','district',NULL,'namangan','200087338',102,NULL,'Наманган вилоят, Поп тумани, Поп шаҳарчаси, Парда Турсин кўчаси 2 - уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тўракўрғон туман йўллардан фойдаланиш корхонаси','Тўракўрғон туман йўллардан фойдаланиш корхонаси','district',NULL,'namangan','207058240',103,NULL,'Наманган вилоят, Тўрақўрғон туман, Тошкент МФЙ, Чуст кўча 27 - уч','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('“Қамчиқавтойўл” ихтисослаштирилган йўллардан фойдаланиш корхонаси','“Қамчиқавтойўл” ихтисослаштирилган йўллардан фойдаланиш корхонаси','direct_subordinate',NULL,'namangan','301341872',105,NULL,'Наманган вилояти, Поп тумани, Резак қишлоғи','Йўл қурилиш (таъмирлаш)','Штат маълумоти бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Самарқанд вилояти автомобиль йўллари бош бошқармаси','Самарқанд вилояти автомобиль йўллари бош бошқармаси','territorial',NULL,'samarkand','200711637',107,'HBB-MINMAX / HBB-LIMIT','Самарканд шахар А.Набиев ккўчаси 3-уй','Иқтисодий фаолиятни самарали олиб боришга кўмаклашиш ва бошқариш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Самарқанд кўприклардан фойдаланиш корхонаси','Самарқанд кўприклардан фойдаланиш корхонаси','bridge',NULL,'samarkand','200714363',108,NULL,'Самарканд вилояти Самарқанд шаҳар Чўпон ота массиви','Кўприклар ва тунеллар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Самарқанд минтақавий йўлларга буюртмачи хизмати','Самарқанд минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'samarkand','207254149',109,'MYBX-MINMAX / MYBX-LIMIT','Самарканд вилояти Самарқанд шаҳар А.Набиева кўчаси 3-уй','Муҳандислик изланишлари соҳасидаги фаолият ва бу соҳаларда техник маслаҳатлар бериш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Самарқанд йўллардан мунтазам фойдаланиш корхонаси','Самарқанд йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'samarkand','200791744',110,'MYFK-16','Самарканд вилояти Самарқанд шаҳар Фарход қўрғони','Йўллар ва шосселар қуриш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Боғишамол йўллардан мунтазам фойдаланиш корхонаси','Боғишамол йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'samarkand','207273609',111,'MYFK-16','Самарканд вилояти Самарқанд шаҳар М.Бедил кўчаси 34-уй','Йўллар ва шосселар қуриш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Оқдарё туман йўллардан фойдаланиш корхонаси','Оқдарё туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200724969',112,NULL,'Самарканд вилояти Оқдарё тумани Лойиш шаҳарчаси А.Темур кўчаси 75-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Булунғур туман йўллардан фойдаланиш корхонаси','Булунғур туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200730147',113,NULL,'Самарканд вилояти Булунгур тумани Мингчинор махалласи','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Жомбой туман йўллардан фойдаланиш корхонаси','Жомбой туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200736669',114,NULL,'Самарканд вилояти Жомбой тумани Шукур Бурхонов кўчаси 1-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Пастдарғом туман йўллардан фойдаланиш корхонаси','Пастдарғом туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200764738',115,NULL,'Самарканд вилояти Пастдарғом тумани Олмазор маҳалласи','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Иштихон туман йўллардан фойдаланиш корхонаси','Иштихон туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200741853',116,NULL,'Самарканд вилояти Иштихон тумани Кўтарма МФЙ Кўтарма қишлоғи','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Каттақўрғон туман йўллардан фойдаланиш корхонаси','Каттақўрғон туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200747393',117,NULL,'Самарканд вилояти Каттақўрғон тумани Муллакўрпа қишлоғи','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қўшробод туман йўллардан фойдаланиш корхонаси','Қўшробод туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200749937',118,NULL,'Самарканд вилояти Қўшработ тумани Эргашжуманбулбул кўчаси 27-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Нарпай туман йўллардан фойдаланиш корхонаси','Нарпай туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200752436',119,NULL,'Самарканд вилояти Нарпай тумани Мирбозор қўрғони Ал-Хоразмий кўчаси 2-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Нуробод туман йўллардан фойдаланиш корхонаси','Нуробод туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','201151154',120,NULL,'Самарканд вилояти Нуробод тумани Ғалаба кўчаси 24-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Пайариқ туман йўллардан фойдаланиш корхонаси','Пайариқ туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200760521',121,NULL,'Самарканд вилояти Пайарик тумани И.Жунайдуллаев кўчаси 2-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Пахтачи туман йўллардан фойдаланиш корхонаси','Пахтачи туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200769270',122,NULL,'Самарканд вилояти Пахтачи тумани Боғолоний МФЙ','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Самарқанд туман йўллардан фойдаланиш корхонаси','Самарқанд туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200775906',123,NULL,'Самарканд вилояти Самарқанд тумани Даштиобод МФЙ','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тайлоқ туман йўллардан фойдаланиш корхонаси','Тайлоқ туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200957195',124,NULL,'Самарканд вилояти Тойлоқ тумани Боғизағон МФЙ','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ургут туман йўллардан фойдаланиш корхонаси','Ургут туман йўллардан фойдаланиш корхонаси','district',NULL,'samarkand','200784547',125,NULL,'Самарканд вилояти Ургут тумани Почвон кўчаси 6-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сурхондарё вилояти автомобиль йўллари бош бошқармаси','Сурхондарё вилояти автомобиль йўллари бош бошқармаси','territorial',NULL,'surkhandarya','200473561',127,'HBB-MINMAX / HBB-LIMIT','Термиз ш. Олмазор кучаси 42-уй','Иқтисодий фаолиятни самарали олиб боришга кўмаклашиш ва бошқариш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сурхондарё кўприклардан фойдаланиш корхонаси','Сурхондарё кўприклардан фойдаланиш корхонаси','bridge',NULL,'surkhandarya','303377288',128,NULL,'Термиз тумани "Учкизил кургони "Янги хаёт" МФЙ','Кўприклар ва тунеллар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сурхондарё минтақавий йўлларга буюртмачи хизмати','Сурхондарё минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'surkhandarya','304985647',129,'MYBX-MINMAX / MYBX-LIMIT','Термиз ш. Олмазор кучаси 42-уй','Муҳандислик изланишлари соҳасидаги фаолият ва бу соҳаларда техник маслаҳатлар бериш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Термиз туман йўллардан фойдаланиш корхонаси','Термиз туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','204598846',130,NULL,'Термез шахар "А. Бобохужаев" кучаси 6А уй','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ангор туман йўллардан фойдаланиш корхонаси','Ангор туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','201359836',131,NULL,'Ангор тумани "Гулзор" м/си Корасув кучаси','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Музробод туман йўллардан фойдаланиш корхонаси','Музробод туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','200484137',132,NULL,'Музработ тумани "Шаффоф" м/си Олимпияда кучаси 113-уй','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Шеробод туман йўллардан фойдаланиш корхонаси','Шеробод туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','200497603',133,NULL,'Шерабод тумани "Хужги" м/си Тошкент кучаси 28-уй','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қизириқ туман йўллардан фойдаланиш корхонаси','Қизириқ туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','200492451',134,NULL,'Кизирик тумани "Работак" м/си Мустакиллик кучаси 20-уй','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бойсун туман йўллардан фойдаланиш корхонаси','Бойсун туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','201325110',135,NULL,'Бойсун тумани "Мустакаллик" МФЙ','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қумқўрғон туман йўллардан фойдаланиш корхонаси','Қумқўрғон туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','200489675',136,NULL,'Кумкургон тумани "Оксой" м/си ойдин кучаси','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Шўрчи туман йўллардан фойдаланиш корхонаси','Шўрчи туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','201437027',137,NULL,'Шурчи тумани "Куклам" м/си "А.Шамкаев" кучаси 16-уй','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Жарқўрғон туман йўллардан фойдаланиш корхонаси','Жарқўрғон туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','200488162',138,NULL,'Жаркургон тумани "Нурли Диёр" м/си Норали Боймуродов кучаси 91-уй','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Олтинсой туман йўллардан фойдаланиш корхонаси','Олтинсой туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','200483652',139,NULL,'Олтинсой тумани "Навруз" махалласи 119 уй','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Денов туман йўллардан фойдаланиш корхонаси','Денов туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','200486498',140,NULL,'Денов ш.А.Аттор кучаси 94-уй','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Узун туман йўллардан фойдаланиш корхонаси','Узун туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','200505045',141,NULL,'Узун тумани "Узбекистон" махалласи "Узбекитон кучаси 15 уй','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сариосиё туман йўллардан фойдаланиш корхонаси','Сариосиё туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','200494274',142,NULL,'Сариосиё тумани "Гулообод" МФЙ Чарагон кучаси','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бандихон туман йўллардан фойдаланиш корхонаси','Бандихон туман йўллардан фойдаланиш корхонаси','district',NULL,'surkhandarya','307209491',143,NULL,'Бандихон тумани "Сарой " м/си Сарой кучаси 70-уй','Йул курилиш таьмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сирдарё вилояти автомобиль йўллари бош бошқармаси','Сирдарё вилояти автомобиль йўллари бош бошқармаси','territorial',NULL,'syrdarya','200317761',146,'HBB-MINMAX / HBB-LIMIT','Сирдарё вилояти Гулистон шахри Тошкент кўчаси 3уй','42110 - Yo''llаr vа shosselаr qurish','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сирдарё кўприклардан фойдаланиш корхонаси','Сирдарё кўприклардан фойдаланиш корхонаси','bridge',NULL,'syrdarya','302217691',147,NULL,'Мирзаобод тумани Богистон кўча','42110 - Yo''llаr vа shosselаr qurish','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сирдарё йўллардан мунтазам фойдаланиш корхонаси','Сирдарё йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'syrdarya','206836864',148,'MYFK-16','Сирдарё тумани Чибонтой даха','42110 - Yo''llаr vа shosselаr qurish','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сирдарё минтақавий йўлларга буюртмачи хизмати','Сирдарё минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'syrdarya','207252998',149,'MYBX-MINMAX / MYBX-LIMIT','Гулистон шахар Саховат кўча 1уй','42110 - Yo''llаr vа shosselаr qurish','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Гулистон туман йўллардан фойдаланиш корхонаси','Гулистон туман йўллардан фойдаланиш корхонаси','district',NULL,'syrdarya','200306934',150,NULL,'Гулистон тумани Янги хайот кўчаси 1уй','42110 - Yo''llаr vа shosselаr qurish','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сардоба туман йўллардан фойдаланиш корхонаси','Сардоба туман йўллардан фойдаланиш корхонаси','district',NULL,'syrdarya','200316430',151,NULL,'Сардоба Шарқ кўчаси','42110 - Yo''llаr vа shosselаr qurish','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Боёвут туман йўллардан фойдаланиш корхонаси','Боёвут туман йўллардан фойдаланиш корхонаси','district',NULL,'syrdarya','200302797',152,NULL,'Боёвут тумани Навроз СИУ','42110 - Yo''llаr vа shosselаr qurish','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сайхунобод туман йўллардан фойдаланиш корхонаси','Сайхунобод туман йўллардан фойдаланиш корхонаси','district',NULL,'syrdarya','200310978',153,NULL,'Сайхунобод Равонлик кўчаси 2уй','42110 - Yo''llаr vа shosselаr qurish','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сирдарё туман йўллардан фойдаланиш корхонаси','Сирдарё туман йўллардан фойдаланиш корхонаси','district',NULL,'syrdarya','200325959',154,NULL,'Сирларё тумани Узбекистан кўчаси 210 уй','42110 - Yo''llаr vа shosselаr qurish','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Оқолтин туман йўллардан фойдаланиш корхонаси','Оқолтин туман йўллардан фойдаланиш корхонаси','district',NULL,'syrdarya','200299968',155,NULL,'Оқолтин тумани Фаргана ш','42110 - Yo''llаr vа shosselаr qurish','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Мирзаобод туман йўллардан фойдаланиш корхонаси','Мирзаобод туман йўллардан фойдаланиш корхонаси','district',NULL,'syrdarya','206856429',156,NULL,'Сирдарё вилояти Гулистон шахри Тошкент кўчаси 3уй','42110 - Yo''llаr vа shosselаr qurish','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ховос туман йўллардан фойдаланиш корхонаси','Ховос туман йўллардан фойдаланиш корхонаси','district',NULL,'syrdarya','201168536',157,NULL,'Sirdaryo viloyati, Xavast tumani, Zafarobod QFY Ishlab chiqarish zonasi','42110 - Yo''llаr vа shosselаr qurish','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тошкент кўприклардан фойдаланиш корхонаси','Тошкент кўприклардан фойдаланиш корхонаси','bridge',NULL,'tashkent_region','200662191',160,NULL,'Тошкент ш. Бектемир тумани Порлоқ кучаси 14 уй','Йўл ва кўприк қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тошкент вилояти йўллардан мунтазам фойдаланиш корхонаси','Тошкент вилояти йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'tashkent_region','305496732',161,'MYFK-16','Тошкент вилояти Юқори-Чирчик туман пос.Барданкуль','Йўл қурилиш (таъмирлаш)','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қибрай йўллардан мунтазам фойдаланиш корхонаси','Қибрай йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'tashkent_region','308937758',162,'MYFK-16','Тошкент вилояти, Бука тумани, Чиғатой  Қ.Ф.Й.Й.Ходжиметов М.Ф.Й.','Йўл қурилиш (таъмирлаш)','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бўка туман йўллардан фойдаланиш корхонаси','Бўка туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200433950',163,NULL,'Тошкент вилояти, Бекобод тумани, Зафар шахарчаси Тошкент йўли кўчаси','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бекобод туман йўллардан фойдаланиш корхонаси','Бекобод туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200556419',164,NULL,'Тошкент вилояти Бустонлик тумани Хужакент к','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бўстонлиқ туман йўллардан фойдаланиш корхонаси','Бўстонлиқ туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200439340',165,NULL,'Тошкент вилояти, Зангиота тумани Назарбек шох кучаси 55-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Зангиота туман йўллардан фойдаланиш корхонаси','Зангиота туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200561254',166,NULL,'Тошкент вилояти, Охангарон ш. кургон-1','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Оҳангарон туман йўллардан фойдаланиш корхонаси','Оҳангарон туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200608573',167,NULL,'Тошкент вилояти, Паркент ш., Кеканжар массиви','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Паркент туман йўллардан фойдаланиш корхонаси','Паркент туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200571037',168,NULL,'Тошкент вилояти, Пискент тумани Саид К.Ф.Й','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Пискент туман йўллардан фойдаланиш корхонаси','Пискент туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200449559',169,NULL,'Тошкент вилояти, Чиноз тумани Қиргузар махалласи','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Чиноз туман йўллардан фойдаланиш корхонаси','Чиноз туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200453508',170,NULL,'Тошкент вилояти, Нурафшон ш, Бобур кучаси 119 уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ўртачирчиқ туман йўллардан фойдаланиш корхонаси','Ўртачирчиқ туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200583117',171,NULL,'Тошкент вилояти, Куйи-Чирчик туман. Косимов кучаси 1 уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қуйичирчиқ туман йўллардан фойдаланиш корхонаси','Қуйичирчиқ туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200456186',172,NULL,'Тошкент вилояти,Кибрай тум ани Ункургон К.Ф .Й','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қибрай туман йўллардан фойдаланиш корхонаси','Қибрай туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','201577827',173,NULL,'Тошкент вилояти, Юқоричирчиқ тумани
Жумабозор кургони','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Юқоричирчиқ туман йўллардан фойдаланиш корхонаси','Юқоричирчиқ туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200932575',174,NULL,'Тошкент вилояти, Янгиюль тумани Ортиков А.куч.Бахор МФЙ','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Янгийўл туман йўллардан фойдаланиш корхонаси','Янгийўл туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','200588576',175,NULL,'Тошкент вилояти, Оққурғон тумани Оққурғон ш','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Оққўрғон туман йўллардан фойдаланиш корхонаси','Оққўрғон туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','302300416',176,NULL,'Тошкент вилояти, Тошкент тумани, Келес шахарчаси, Келес йўли кўчаси 14-уй.','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тошкент туман йўллардан фойдаланиш корхонаси','Тошкент туман йўллардан фойдаланиш корхонаси','district',NULL,'tashkent_region','305261978',177,NULL,'Тошкент вилояти, Қибрай тумани Геофизика қ','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('"Дўрмонавтойўл" ихтисослаштирилган йўллардан фойдаланиш корхонаси','"Дўрмонавтойўл" ихтисослаштирилган йўллардан фойдаланиш корхонаси','direct_subordinate',NULL,'tashkent_region','202167078',178,NULL,'Тошкент вилояти Юқоричирчиқ тумани Бордонкул к','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бардонкўл йўллардан фойдаланиш корхонаси','Бардонкўл йўллардан фойдаланиш корхонаси','direct_subordinate',NULL,'tashkent_region','302637810',179,NULL,'Тошкент шаҳри, Яшнобод тумани Катта Олмос ко''часи, 79-уй','Йўл қурилиш (таъмирлаш)','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('"Тошкент ҳалқа автомобиль йўли" йўллардан фойдаланиш корхонаси','"Тошкент ҳалқа автомобиль йўли" йўллардан фойдаланиш корхонаси','direct_subordinate',NULL,'tashkent_region','302633413',180,'TYFK-12','Тошкент вилояти, Нурафшон шаҳри, Тошкентйўли кўчаси 47-уй','Буюртмачи хизмати','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тошкент вилояти минтақавий йўлларга буюртмачи хизмати','Тошкент вилояти минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'tashkent_region','304943564',181,'MYBX-MINMAX / MYBX-LIMIT','Тошкент шахри Учтепа тумани халқа йўли кўчаси, 7-уй','Ландшафт дизайни','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Фарғона вилояти автомобиль йўллари бош бошқармаси','Фарғона вилояти автомобиль йўллари бош бошқармаси','territorial',NULL,'fergana','200153714',186,'HBB-MINMAX / HBB-LIMIT','Фарғона шаҳар, Аэропорт кўчаси 1-уй','Бошқарув','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Фарғона кўприклардан фойдаланиш корхонаси','Фарғона кўприклардан фойдаланиш корхонаси','bridge',NULL,'fergana','200145067',187,NULL,'Фарғона вилояти Қўқон шаҳар, Туркистон кўчаси, 4г','Автомобил йулларни саклаш ва жорий таъмирлаш хамда кайта куришдан иборат','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Фарғона йўллардан мунтазам фойдаланиш корхонаси','Фарғона йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'fergana','300116534',188,'MYFK-16','Фарғона шаҳар,Мустақиллик 310 А','Минтақавий автомобиль йўлларини лойихалаштириш,қуриш,қайта қуриш ва таъмирлаш ишларига буюртмачи вазифасини бажаради','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Фарғона минтақавий йўлларга буюртмачи хизмати','Фарғона минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'fergana','304899935',189,'MYBX-MINMAX / MYBX-LIMIT','Фаргона вилояти Қўштепа тумани Шодлик МФЙ Шафтолибоғ 2-кўчаси 2-уй','Умумий фойдаланишдаги автомобил йулларини сақлаш ва таъмирлаш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қўштепа туман йўллардан фойдаланиш корхонаси','Қўштепа туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200178294',190,NULL,'Фаргона вилояти Багдод тумани тонготар кишлоги мустакиллик  кучаси 13 уй','Автомобиль йулларини саклаш ва жорий таъмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Боғдод туман йўллардан фойдаланиш корхонаси','Боғдод туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200158422',191,NULL,'Фарғона вилояти Бувайда тумани Қўнғирот қишлоғи','Автомобиль йулларини саклаш, жорий таъмирлаш,қуриш ва  таъмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бувайда туман йўллардан фойдаланиш корхонаси','Бувайда туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200163758',192,NULL,'Фаргона вилояти Бешариқ тумани Ёқуб Абдуллаев  кучаси 2 уй','Автомобиль йўлларни сақлаш ва жорий таъмирлаш хамда қайта қуришдан иборат','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бешариқ туман йўллардан фойдаланиш корхонаси','Бешариқ туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200154776',193,NULL,'Фаргона вилояти Кува тумани Гулобод МФЙ Зиёкор 1 кучаси 5 а уй','Автомобиль йулларни саклаш ва жорий таъмирлаш хамда кайта куришдан иборат','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қува туман йўллардан фойдаланиш корхонаси','Қува туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200171874',194,NULL,'Учкуприк тумани Т,Шодиева кучаси № 2-уй','Автомобиль йулларини саклаш ва жорий таъмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Учкўприк туман йўллардан фойдаланиш корхонаси','Учкўприк туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200192224',195,NULL,'Фаргона вилояти Риштон тумани Шокир ота кучаси 217 уй','Автомобиль йулларни саклаш ва жорий таъмирлаш хамда кайта куришдан иборат','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Риштон туман йўллардан фойдаланиш корхонаси','Риштон туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200181127',196,NULL,'Фарғона вилояти Тошлоқ тумани Қанжирға МФЙ Бешолиш дахаси','Автомобил йулларни саклаш ва жорий таъмирлаш хамда кайта куришдан иборат','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тошлоқ туман йўллардан фойдаланиш корхонаси','Тошлоқ туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','206833250',197,NULL,'Фарғона вилояти Фарғона шахар Мустақиллик кўчаси  350 Г уй','Автомобил йулларни саклаш ва жорий таъмирлаш хамда кайта куришдан иборат','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Фарғона туман йўллардан фойдаланиш корхонаси','Фарғона туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200197217',198,NULL,'Фаргона вилояти Дангара тумани Саноат кучаси 14 а уй','Автомобиль йулларни саклаш ва жорий таъмирлаш хамда кайта куришдан иборат','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Данғара туман йўллардан фойдаланиш корхонаси','Данғара туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200166175',199,NULL,'Фуркат тумани Навбахор шахарчаси 6-уй','Автомобиль йулларни саклаш ва жорий таъмирлаш хамда кайта куриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Фурқат туман йўллардан фойдаланиш корхонаси','Фурқат туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200201274',200,NULL,'Фаргона вилояти Ёзёвон тумани Кургонча МФЙ Андижон кучаси 2-уй','Умумий фойдаланишдаги автомобил йулларини саклаш ва таъмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ёзёвон туман йўллардан фойдаланиш корхонаси','Ёзёвон туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200170124',201,NULL,'Фарғона вилояти Олтиариқ туман Полосонобод кўчаси  1-уй','Автомобил йўлларни сақлаш ва жорий таъмирлаш хамда қайта қуришдан иборат','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Олтиариқ туман йўллардан фойдаланиш корхонаси','Олтиариқ туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200174830',202,NULL,'Фарғона вилояти Сух тумани Истиқлол МФЙ А. Темур кучаси 190 уй','Умумий фойдаланишдаги автомобил йулларини сақлаш ва таъмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Сўх туман йўллардан фойдаланиш корхонаси','Сўх туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200185310',203,NULL,'Фаргона вилояти, Узбекистон тумани, Кумбосит МФЙ Жар кучаси 41 уй','Автомобиль йулларни саклаш ва жорий таъмирлаш хамда кайта куришдан иборат','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ўзбекистон туман йўллардан фойдаланиш корхонаси','Ўзбекистон туман йўллардан фойдаланиш корхонаси','district',NULL,'fergana','200188282',204,NULL,'Кувасой шахар, Исфайрамсой МФЙ Миришкор кучаси №96 уй','Автомобиль йулларини саклаш ва жорий таъмирлаш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қувасой йўллардан фойдаланиш корхонаси','Қувасой йўллардан фойдаланиш корхонаси','direct_subordinate',NULL,'fergana','306657926',205,NULL,'Фаргона шахар Ўрмончилар МФЙ Аэропорт кучаси 1 уй','Кўчатларни ва уруғларни етиштириш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қўқон автомобиль ва йўллар техникуми','Қўқон автомобиль ва йўллар техникуми','education',NULL,'fergana','200131188',207,NULL,'Farg''ona viloyati, Qo''qon sh. Turkiston ko''chasi, 145-uy','Профессионал таълим','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Хоразм вилояти автомобиль йўллари бош бошқармаси','Хоразм вилояти автомобиль йўллари бош бошқармаси','territorial',NULL,'khorezm','201715124',208,'HBB-MINMAX / HBB-LIMIT','Urganch shaxar Xiva shox ko`chasi 1-km','Давлат ҳокимияти ва бошқарувининг ҳудудий идоралари фаолияти','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Хоразм кўприклардан фойдаланиш корхонаси','Хоразм кўприклардан фойдаланиш корхонаси','bridge',NULL,'khorezm','200408560',209,NULL,'Урганч ш Хонка кучаси 101а уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Хоразм минтақавий йўлларга буюртмачи хизмати','Хоразм минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'khorezm','207254393',210,'MYBX-MINMAX / MYBX-LIMIT','Urganch  shaxar Xiva shox ko`cha 106-uy','Йўллар ва шосселар қуриш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Хоразм йўллардан мунтазам фойдаланиш корхонаси','Хоразм йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'khorezm','305273259',211,'MYFK-16','Urganch sh. I.Dosov ko`cha, 2-pr, 1-uy','Йўллар ва шосселар қуриш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Урганч йўллардан мунтазам фойдаланиш корхонаси','Урганч йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'khorezm','307299549',212,'MYFK-16','Xorazm viloyati Urganch tumani Chotko‘pir qishlog‘I Orzu MFT Istiqlol ko‘chasi 7-uy','Йўллар ва шосселар қуриш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Урганч туман йўллардан фойдаланиш корхонаси','Урганч туман йўллардан фойдаланиш корхонаси','district',NULL,'khorezm','200414641',213,NULL,'Хива ш  Ипакчилар кучаси 46 уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Жайхун йўллардан мунтазам фойдаланиш корхонаси','Жайхун йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'khorezm','309503989',214,'MYFK-16','Xorazm viloyati Shovot tumani Istiqbol MFY','Йўллар ва шосселар қуриш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Хива туман йўллардан фойдаланиш корхонаси','Хива туман йўллардан фойдаланиш корхонаси','district',NULL,'khorezm','201076477',215,NULL,'Xorazm viloyati Qo''shko''pir tumani Arablar mahallasi Az-Zamaxshariy ko''chasi 237 uy','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Шовот туман йўллардан фойдаланиш корхонаси','Шовот туман йўллардан фойдаланиш корхонаси','district',NULL,'khorezm','200422141',216,NULL,'Xorazm viloyati Yangibozor tumani Fidokor ko''cha 30 uy','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қўшкўпир туман йўллардан фойдаланиш корхонаси','Қўшкўпир туман йўллардан фойдаланиш корхонаси','district',NULL,'khorezm','200218054',217,NULL,'Xorazm viloyati Gurlan tumani  Mustaqillik ko‘chasi 18-uy','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Янгибозор туман йўллардан фойдаланиш корхонаси','Янгибозор туман йўллардан фойдаланиш корхонаси','district',NULL,'khorezm','201018760',218,NULL,'Xorazm viloyati, Xonqa tumani, Al Xorazmiy ko`chasi 32 uy','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Гурлан туман йўллардан фойдаланиш корхонаси','Гурлан туман йўллардан фойдаланиш корхонаси','district',NULL,'khorezm','200420818',219,NULL,'Xorazm viloyati Yangiariq tumani Mustaqillik ko`chasi','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Хонқа туман йўллардан фойдаланиш корхонаси','Хонқа туман йўллардан фойдаланиш корхонаси','district',NULL,'khorezm','200429488',220,NULL,'Xorazm viloyati Bog‘ot Sanoatchilar ko‘chasi 3-uy','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Янгиариқ туман йўллардан фойдаланиш корхонаси','Янгиариқ туман йўллардан фойдаланиш корхонаси','district',NULL,'khorezm','200215439',221,NULL,'Hazorasp tumani Pichoqchi qishlog''I Tinchlik ko`cha 2-uy','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Боғот туман йўллардан фойдаланиш корхонаси','Боғот туман йўллардан фойдаланиш корхонаси','district',NULL,'khorezm','200426698',222,NULL,'Тупроққалъа тумани Саримой қишлоғи Нукус маҳалласи','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Хазорасп туман йўллардан фойдаланиш корхонаси','Хазорасп туман йўллардан фойдаланиш корхонаси','district',NULL,'khorezm','200409615',223,NULL,'Xorazm viloyati Xiva shahar Namuna ko‘chasi 20 A uy','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тупроққалъа туман йўллардан фойдаланиш корхонаси','Тупроққалъа туман йўллардан фойдаланиш корхонаси','district',NULL,'khorezm','307319134',224,NULL,'Xorazm viloyati Xiva ko‘chasi 87-uy','Кўприклар ва тунеллар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('“Хива шаҳар минтақавий йўллардан фойдаланиш” унитар корхонаси','“Хива шаҳар минтақавий йўллардан фойдаланиш” унитар корхонаси','direct_subordinate',NULL,'khorezm','309459988',225,NULL,'Urganch  shaxar Xiva shox ko`cha 1 км','Йуллар буйларини кукаламзорлаштириш  ва ободонлаштириш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қорақалпоғистон Республикаси автомобиль йўллари бош бошқармаси','Қорақалпоғистон Республикаси автомобиль йўллари бош бошқармаси','territorial',NULL,'karakalpakstan','200349889',228,'HBB-MINMAX / HBB-LIMIT','Нукус шаҳри,
Хўжайли ғўзори, 16/1','Иқтисодий фаолиятни самарали олиб боришга кўмаклашиш ва бошқариш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қорақалпоғистон кўприклардан фойдаланиш корхонаси','Қорақалпоғистон кўприклардан фойдаланиш корхонаси','bridge',NULL,'karakalpakstan','201778125',229,NULL,'Тхиатош шаҳри,  Ш.Рашидов кўчаси','Кўприклар ва тунеллар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қорақалпоғистон Республикаси минтақавий йўлларга буюртмачи хизмати','Қорақалпоғистон Республикаси минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'karakalpakstan','207255036',230,'MYBX-MINMAX / MYBX-LIMIT','Нукус шаҳри,
Хўжайли ғўзори, 16/1','Муҳандислик изланишлари соҳасидаги фаолият ва бу соҳаларда техник маслаҳатлар бериш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қорақалпоғистон Республикаси йўллардан мунтазам фойдаланиш корхонаси','Қорақалпоғистон Республикаси йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'karakalpakstan','300117192',231,'MYFK-16','Нукус шаҳри,
Қизкеткен ғўзори, р/з-уй','Йўллар ва шосселар қуриш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қўнғирот йўллардан мунтазам фойдаланиш корхонаси','Қўнғирот йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'karakalpakstan','200365094',232,'MYFK-16','Қўнғирот тумани,
Нурмухаммедов кўчаси, р/з-уй','Йўллар ва шосселар қуриш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қоратов йўллардан мунтазам фойдаланиш корхонаси','Қоратов йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'karakalpakstan','206942908',233,'MYFK-16','Нукус шаҳри,
Хўжайли ғўзори, 16/1','Йўллар ва шосселар қуриш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қипчоқ йўллардан мунтазам фойдаланиш корхонаси','Қипчоқ йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'karakalpakstan','309101531',234,'MYFK-16','Нукус шаҳри,
Хўжайли ғўзори, 16/1','Йўллар ва шосселар қуриш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Элликқалъа йўллардан мунтазам фойдаланиш корхонаси','Элликқалъа йўллардан мунтазам фойдаланиш корхонаси','permanent_use',NULL,'karakalpakstan','306690934',235,'MYFK-16','Элликқалъа тумани,
Сарабий ОФЙ','Йўллар ва шосселар қуриш','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Нукус туман йўллардан фойдаланиш корхонаси','Нукус туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200388255',236,NULL,'Нукус тумани, 
Оқмангит ғўзори, 2-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тўрткўл туман йўллардан фойдаланиш корхонаси','Тўрткўл туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200393384',237,NULL,'Тўрткўл тумани,
Тошкент кўчаси, 43-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Элликқалъа туман йўллардан фойдаланиш корхонаси','Элликқалъа туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200400501',238,NULL,'Элликқалъа тумани,
Бустон шаҳри,
Беруний шох кўчаси, 2-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Беруний туман йўллардан фойдаланиш корхонаси','Беруний туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200937838',239,NULL,'Беруний тумани, 
Беруний кўчаси, р/з-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Амударё туман йўллардан фойдаланиш корхонаси','Амударё туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200374384',240,NULL,'Амударё тумани, Мангит шаҳри, 
А.Утар кўчаси, 1-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Мўйноқ туман йўллардан фойдаланиш корхонаси','Мўйноқ туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200387218',241,NULL,'Мўйноқ тумани, Бозатов ОФЙ,
Шағирли посёлкаси','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қонликўл туман йўллардан фойдаланиш корхонаси','Қонликўл туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200385877',242,NULL,'Қонликўл тумани, Индустриальная кўчаси, р/з-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Шуманай туман йўллардан фойдаланиш корхонаси','Шуманай туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200954833',243,NULL,'Шуманай тумани,
Ажинияз кўчаси, 55-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тахтакўпир туман йўллардан фойдаланиш корхонаси','Тахтакўпир туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200954549',244,NULL,'Тахтакўпир тумани,
Туримбетов кўчаси, р/з-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Хўжайли туман йўллардан фойдаланиш корхонаси','Хўжайли туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200371641',245,NULL,'Хўжайли тумани,
Кирпич завод посёлкаси, р/з-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Чимбой туман йўллардан фойдаланиш корхонаси','Чимбой туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200397671',246,NULL,'Чимбой тумани,
Конши МФЙ','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қораўзак туман йўллардан фойдаланиш корхонаси','Қораўзак туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200402048',247,NULL,'Қораўзяк тумани,
Қорақалпоғистон кўчаси, р/з-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Кегейли туман йўллардан фойдаланиш корхонаси','Кегейли туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','200381764',248,NULL,'Кегейли тумани,
Халқобод поселкаси,
Халқобод ғўзори, 1-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Қўнғирот туман йўллардан фойдаланиш корхонаси','Қўнғирот туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','206991705',249,NULL,'Қўнғирот тумани,
Қўнғирот Промзона-2','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тахиатош туман йўллардан фойдаланиш корхонаси','Тахиатош туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','305986763',250,NULL,'Тахиатош тумани,
Ш.Рашидов кўчаси, 38б-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Бўзатов туман йўллардан фойдаланиш корхонаси','Бўзатов туман йўллардан фойдаланиш корхонаси','district',NULL,'karakalpakstan','207305978',251,NULL,'Бозатов тумани,
Бозатов посёлкаси,
Бердақ ғўзори кўчаси, 1-уй','Йўллар ва шосселар қуриш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Тошкент шаҳар минтақавий йўлларга буюртмачи хизмати','Тошкент шаҳар минтақавий йўлларга буюртмачи хизмати','regional_customer',NULL,'tashkent_city','304893532',253,'MYBX-MINMAX / MYBX-LIMIT','Мирзо-Улуғбек тумани Мустақиллик шох кўчаси 68а уй','Буюртмачи хизмати','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Автомобиль йўллари қўмитасининг Марказий синов лабораторияси','Автомобиль йўллари қўмитасининг Марказий синов лабораторияси','direct_subordinate',NULL,'tashkent_city','311030653',255,NULL,'Тошкент шаҳар Миробод тумани, Локомотив кўчаси, 10-уй','йўлларни замонавий лабаратория текширувини ташкил килиш','Штат маълумоти бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('"Ўзйўлбутлаш" РТБ','"Ўзйўлбутлаш" РТБ','direct_subordinate',NULL,'tashkent_city','201058958',257,NULL,'Тошкент шаҳар, Мирзо Улуғбек тумани, Мустақиллик шох кўчаси, 68-уй','Тизим корхоналарини сифатли узоқ муддатли хизмат курсатувчи материаллар билан таминлаш','Штат маълумоти бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('“Ўзавтойўлбелги” корхонаси','“Ўзавтойўлбелги” корхонаси','direct_subordinate',NULL,'tashkent_city','305101036',258,NULL,'Тошкент ш. Мустакиллик шох кўчаси,68','Умумий фойдаланишдаги автомобиль йўллари, шаҳарлар ва бошқа аҳоли пунклари кўчаларидаги йўл белгилари,ахборот кўрсаткичлари, йўл ҳаракатини тартибга солишнинг бошқа воситаларини стандартларга мувофик ишлаб чиқариш ва ўрнатиш.','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Маъмурий бинодан фойдаланиш дирекцияси','Маъмурий бинодан фойдаланиш дирекцияси','direct_subordinate',NULL,'tashkent_city','202756999',262,NULL,'Тошкент ш. Мустақиллик шох кўчвси, 68  уй','Қўмитанинг мамурий биносини сақлаш','Штат маълумоти бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Умумий фойдаланишдаги автомобиль йўлларини қуриш ва реконструкция қилиш дирекцияси','Умумий фойдаланишдаги автомобиль йўлларини қуриш ва реконструкция қилиш дирекцияси','direct_subordinate',NULL,'tashkent_city','304803666',263,'UFD-94','Тошкент ш. Мустақиллик шох кўчвси, 68  уй','Буюртмачи ҳизмати','Намунавий лимит бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('"Автойўлинвест" агентлиги','"Автойўлинвест" агентлиги','direct_subordinate',NULL,'tashkent_city','204679222',264,NULL,'Тошкент шаҳар М.Улуғбек тумани Мустақиллик шох кўчаси 68А-уй','64910 - Молиявий лизинг','Штат маълумоти бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Автомобиль йўллари илмий тадқиқот институти','Автомобиль йўллари илмий тадқиқот институти','direct_subordinate',NULL,'tashkent_city','205340218',265,NULL,'Тошкент шаҳар, Мирзо Улуғбек тумани, Мустақиллик шох кўчаси, 68-уй','Илм фан  инновацияларни жорий қилиш','Штат маълумоти бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('"Автойўлнуртаъмир" корхонаси','"Автойўлнуртаъмир" корхонаси','direct_subordinate',NULL,'tashkent_city','308520082',266,NULL,'Тошкент шахар Сергили тумани Чоштепа кучаси 173 уй','Электротехник ва монтаж ишлари','Штат маълумоти бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ахборот-коммуникаци технологияларини ривожлантириш маркази','Ахборот-коммуникаци технологияларини ривожлантириш маркази','direct_subordinate',NULL,'tashkent_city','310679960',268,NULL,'Тошкент шаҳар, Мирзо Улуғбек тумани, Мустақиллик шох кўчаси, 68-уй','Рақамли ахборот технологияларни ривожлантириш сохани ахборотлаштириш','Фақат реестр','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Ўзйўлкўприк кластери','Ўзйўлкўприк кластери','direct_subordinate',NULL,'tashkent_city','200836188',269,NULL,'Тошкент шаҳар Яшнабод тумани, Оҳонграбо кўчаси, 12-уй','Кўприклар ва тунеллар қуриш','Штат маълумоти бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
INSERT INTO app_organizations (name,short_name,type,parent_id,region_code,tax_id,registry_id,category_code,legal_address,activity,data_status,source_name,hierarchy_verified,active)
VALUES ('Автомобиль йўллари техник ҳолатини таҳлили ва ҳаракат хавфсизлиги маркази','Автомобиль йўллари техник ҳолатини таҳлили ва ҳаракат хавфсизлиги маркази','direct_subordinate',NULL,'tashkent_city','310899964',270,NULL,'Тошкент шахри Миробод тумани, Локомотив кўчаси, 10-уй','Йўлларни техник холатини диагностика қилиш','Штат маълумоти бор','тизим ташкилотлари.xlsx',0,1)
ON CONFLICT(name) DO UPDATE SET region_code=excluded.region_code,tax_id=COALESCE(app_organizations.tax_id,excluded.tax_id),registry_id=excluded.registry_id,category_code=excluded.category_code,legal_address=excluded.legal_address,activity=excluded.activity,data_status=excluded.data_status,source_name=excluded.source_name;
--> statement-breakpoint
UPDATE app_organizations SET type='committee',parent_id=NULL
WHERE name='Avtomobil yo‘llari qo‘mitasi' AND tax_id IS NULL;
--> statement-breakpoint
UPDATE app_organizations
SET parent_id=(SELECT id FROM app_organizations WHERE type='committee' AND active=1 ORDER BY id LIMIT 1)
WHERE type='central' AND parent_id IS NULL;
--> statement-breakpoint
UPDATE app_organizations
SET parent_id=(SELECT id FROM app_organizations WHERE type='central' AND active=1 ORDER BY id LIMIT 1)
WHERE type IN ('territorial','direct_subordinate','education') AND parent_id IS NULL;
--> statement-breakpoint
UPDATE app_organizations AS child
SET parent_id=COALESCE((SELECT parent.id FROM app_organizations AS parent
  WHERE parent.type='territorial' AND parent.region_code=child.region_code AND parent.active=1 ORDER BY parent.id LIMIT 1),
  (SELECT id FROM app_organizations WHERE type='central' AND active=1 ORDER BY id LIMIT 1))
WHERE child.type IN ('district','permanent_use','regional_customer','bridge') AND child.parent_id IS NULL;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_import_batches
(file_name,checksum,status,imported_organizations,imported_positions,rejected_rows,note)
VALUES ('avtoyol_yagona_shtatlar.xlsx','44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3','validated',241,536,0,'Imported from the user-provided unified staff workbook; legal/current status still requires source approval.');
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Молия-иқтисодиёт бошқармаси',id,NULL,1 FROM app_organizations WHERE tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Йўл ишларини молиялаштириш бўлими',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт бошқармаси' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Лойиҳавий ечимлар ва нархлар шаклланишини таҳлил қилиш бўлими',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт бошқармаси' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Раҳбарият',id,NULL,1 FROM app_organizations WHERE tax_id='200541754' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '1-қурилиш участкаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '2-қурилиш участкаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ёрдамчи диагностика бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ёқилғи-мойлаш маҳсулотлари таъминоти бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Автотранспорт бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Арматура цехи',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Асфальтбетон ишлаб чиқариш ва тақсимлаш цехи',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Бетон ишлаб чиқариш ва тақсимлаш цехи',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Бухгалтерия ҳисоби ва ҳисоботи шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Геодезия ва топография бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Диагностика шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ижро интизоми ва мурожаатлар билан ишлаш шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Инсон ресурсларини ривожлантириш ва бошқариш',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Инсон ресурсларини ривожлантириш ва бошқариш шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ишлаб чиқариш-техник бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ишлаб чиқаришни буғ билан таъминлаш цехи',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ишлаб чиқаришни технологик мувофиқлаштириш ва назорат қилиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Компрессор цехи',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Конструкторлар бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Кўприк ва сунъий иншоотларни лойиҳалаштириш шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Лойиҳалаштириш ва дизайн бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Марказий лаборатория',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Материаллар, иш ҳақи ҳисоби ва ҳисоботи бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Махсус кийимларни комплекс ишлаб чиқариш цехи',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Механизация ва энергетика шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Меҳнат муҳофазаси ва техника хавфсизлиги бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Моддий-техник таъминот бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Молия-иқтисодиёт ва шартномалар шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Мониторинг ва йиғма таҳлил шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Омборхона хўжалиги',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Раҳбарият',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Саноат ва маркетинг шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Сифат назорати шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Тайёр маҳсулотларни реализация қилиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Тиббиёт бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Тош майдалаш ва саралаш цехи',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Харидлар ва шартномалар шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Хўжалик бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Электр ва кўтариш ускуналари цехи',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Қолиплар ва дастгоҳларни таъмирлаш цехи',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Қолиплаш цехи',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Қўриқлаш хизмати',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ҳажм усули ва ишлаб чиқариш-техник шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='200836188' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ёрдамчи ва техник ходимлар',id,NULL,1 FROM app_organizations WHERE tax_id='201058958' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Бухгалтерия ҳисоби ва ҳисоботи шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='201058958' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Раҳбарият',id,NULL,1 FROM app_organizations WHERE tax_id='201058958' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Таъминот ва логистикани бошқариш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='201058958' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Харидларни ташкил этиш, маркетинг ва шартномалар бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='201058958' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Бинолардан фойдаланиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='202756999' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Бухгалтерия ҳисоби ва ҳисоботи бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='202756999' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Диспетчерлик хизмати бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='202756999' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Раҳбарият',id,NULL,1 FROM app_organizations WHERE tax_id='202756999' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Техника ва энергетика бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='202756999' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Шартномалар ва хўжалик ишлари бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='202756999' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Рахбарият',id,NULL,1 FROM app_organizations WHERE tax_id='204679222' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Хизмат курсатувчи ходимлар',id,NULL,1 FROM app_organizations WHERE tax_id='204679222' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '«Янги Ўзбекистонда йиллар ва йўллар» журнали нашриёти матбаа бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='205340218' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Автомобиль йўлларини лойиҳалаш, қурилиш, таъмирлаш ва сақлаш ишларига илмий ёндашувни ривожлантириш шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='205340218' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Илмий тадқиқот ишларини ривожлантириш лабораторияси бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='205340218' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Илмий тадқиқот, инновациялар ва халқаро алоқалар бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='205340218' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Илмий тадқиқотларни тижоратлаштириш ва ишлаб чиқаришни ривожлантириш шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='205340218' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Молия-иқтисодиёт, шартномалар ва бухгалтерия ҳисоби шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='205340218' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Норматив-меъёрий ҳужжатларни ишлаб чиқиш ва рақамлаштириш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='205340218' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Раҳбарият',id,NULL,1 FROM app_organizations WHERE tax_id='205340218' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Таълим муассасалари билан ишлаш ва малака ошириш шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='205340218' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Халқаро тоифадаги муҳандис-консультантлар шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='205340218' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Электрон базани юритиш шуъбаси',id,NULL,1 FROM app_organizations WHERE tax_id='205340218' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '252-йўлдан фойдаланиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '257-йўлдан фойдаланиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '257-йўлдан фойдаланиш бўлими — «Жанубий» гуруҳи',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '258-йўлдан фойдаланиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '35-йўлдан фойдаланиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '385-йўлдан фойдаланиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '524-йўлдан фойдаланиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '537-йўлдан фойдаланиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '549-йўлдан фойдаланиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '550-йўлдан фойдаланиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '550-йўлдан фойдаланиш бўлими — «Шимолий» гуруҳи',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'А-373 йўлининг 193 ва 273-км вазн назорати пунктлари',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '193-км пункти',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='А-373 йўлининг 193 ва 273-км вазн назорати пунктлари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT '273-км пункти',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='А-373 йўлининг 193 ва 273-км вазн назорати пунктлари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Асфальт-бетон заводи',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Бухгалтерия',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Механизация бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Пудрат ишлари бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Пунгон йўлдан фойдаланиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Раҳбарият',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Режа, иқтисод ва ишлаб чиқариш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Таъминот бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Умумфойдаланишдаги автомобиль йўлларидан фойдаланиш ва бажарилган ишларни қабул қилиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Хизмат кўрсатувчи ходимлар',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ходимлар билан ишлаш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Хўжалик бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Қурилиш-таъмирлаш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Қўшимча техник ходимлар',id,NULL,1 FROM app_organizations WHERE tax_id='301341872' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Автохўжалик хизмати',id,NULL,1 FROM app_organizations WHERE tax_id='308520082' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Бошқарув ходимлари',id,NULL,1 FROM app_organizations WHERE tax_id='308520082' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Бухгалтерия',id,NULL,1 FROM app_organizations WHERE tax_id='308520082' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ишлаб чиқариш ва техник бўлим',id,NULL,1 FROM app_organizations WHERE tax_id='308520082' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Тошкент вилояти филиали',id,NULL,1 FROM app_organizations WHERE tax_id='308520082' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Хўжалик бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='308520082' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Электр тармоқларини тасарруф этиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='308520082' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Андижон вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Бухоро вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Жиззах вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Навоий вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Наманган вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Самарқанд вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Сирдарё вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Сурхондарё вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Тошкент вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Тошкент шаҳри филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Фарғона вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Хоразм вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Қамчиқ довони филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Қашқадарё вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Қорақалпоғистон Республикаси филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ёрдамчи ходимлар',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Автомобиль йўллари давлат кадастрини ва йўл активларини юритиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Автомобиль йўллари техник ҳолатини таҳлил қилиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Автомобиль йўлларидан фойдаланишни ташкил этиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Бухгалтерия ҳисоби ва ҳисоботи бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Вазн ва ҳажм параметрларини назорат қилиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ижро интизоми ва мурожаатлар билан ишлаш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Катта ҳажмли ва оғир вазнли транспорт воситалари ҳаракати учун рухсатномалар бериш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Молия-иқтисодиёт ва шартномалар бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Пудрат ишларини ташкил этиш ва назорат қилиш бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Раҳбарият',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Хизмат кўрсатувчи ва техник ходимлар',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Қорақалпоғистон Республикаси, вилоятлар ва Тошкент шаҳридаги филиаллар',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ҳаракат хавфсизлиги ва техник шартлар бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='310899964' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Бухгалтерия ҳисоби ва ҳисоботи бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Йўл-қурилиш материаллари сифатини назорат қилиш бошқармаси',id,NULL,1 FROM app_organizations WHERE tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Молия-иқтисодиёт ва шартномалар бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Раҳбарият',id,NULL,1 FROM app_organizations WHERE tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Техник ва ёрдамчи ходимлар',id,NULL,1 FROM app_organizations WHERE tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Фитосанитария ва тупроқ таҳлили бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Халқаро тоифадаги муҳандис-консультантлар',id,NULL,1 FROM app_organizations WHERE tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Хўжалик бўлими',id,NULL,1 FROM app_organizations WHERE tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Ҳудудий филиаллар',id,NULL,1 FROM app_organizations WHERE tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Андижон филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳудудий филиаллар' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Самарқанд филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳудудий филиаллар' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Сурхондарё филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳудудий филиаллар' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Тошкент вилояти филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳудудий филиаллар' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Фарғона филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳудудий филиаллар' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Хоразм филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳудудий филиаллар' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_departments (name,organization_id,parent_id,active)
SELECT 'Қашқадарё филиали',o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳудудий филиаллар' LIMIT 1),1
FROM app_organizations o WHERE o.tax_id='311030653' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 1,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Рахбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Рахбарият','','Бош мутахассис','Бошқарув','Мутахассис',7,1,'10',1.883,NULL,NULL,'Штат жадвали','Автойўлинвест.xlsx',NULL,'Сана кўрсатилмаган','Манба файлда кучга кириш санаси кўрсатилмаган.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='204679222' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 2,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Рахбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Рахбарият','','Бош ҳисобчи','Бошқарув','Мутахассис',1,1,'13',2.284,NULL,NULL,'Штат жадвали','Автойўлинвест.xlsx',NULL,'Сана кўрсатилмаган','Манба файлда кучга кириш санаси кўрсатилмаган.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='204679222' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 3,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Рахбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Рахбарият','','Бош юрисконсульт','Бошқарув','Мутахассис',1,1,'14',2.421,NULL,NULL,'Штат жадвали','Автойўлинвест.xlsx',NULL,'Сана кўрсатилмаган','Манба файлда кучга кириш санаси кўрсатилмаган.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='204679222' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 4,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Рахбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Рахбарият','','Директор','Бошқарув','Раҳбар',1,1,'15',2.561,NULL,NULL,'Штат жадвали','Автойўлинвест.xlsx',NULL,'Сана кўрсатилмаган','Манба файлда кучга кириш санаси кўрсатилмаган.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='204679222' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 5,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Рахбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Рахбарият','','Директор ўринбосари-бош муҳандис','Бошқарув','Раҳбар',1,1,'14',2.421,NULL,NULL,'Штат жадвали','Автойўлинвест.xlsx',NULL,'Сана кўрсатилмаган','Манба файлда кучга кириш санаси кўрсатилмаган.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='204679222' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 6,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Рахбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Рахбарият','','Директор ўринбосари-инветиция лойиҳаларини мувоқишлаштириш, тендерларни ташкилаштириш ва шартномалар бўлими бошлиғи','Бошқарув','Раҳбар',1,1,'14',2.421,NULL,NULL,'Штат жадвали','Автойўлинвест.xlsx',NULL,'Сана кўрсатилмаган','Манба файлда кучга кириш санаси кўрсатилмаган.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='204679222' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 7,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Рахбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Рахбарият','','Ходимлар билан ишлаш, ташкилий, назорат ва таҳилий ишлар бўйича бош мутахассис','Бошқарув','Мутахассис',1,1,'10',1.883,NULL,NULL,'Штат жадвали','Автойўлинвест.xlsx',NULL,'Сана кўрсатилмаган','Манба файлда кучга кириш санаси кўрсатилмаган.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='204679222' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 8,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат курсатувчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат курсатувчи ходимлар','','Енгил автомобиль ҳайдовчиси','Техник ва хизмат кўрсатувчи ходимлар','Мутахассис',1,1,'2',1.053,NULL,NULL,'Штат жадвали','Автойўлинвест.xlsx',NULL,'Сана кўрсатилмаган','Манба файлда кучга кириш санаси кўрсатилмаган.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='204679222' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 9,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат курсатувчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат курсатувчи ходимлар','','Референт-котиб','Техник ва хизмат кўрсатувчи ходимлар','Мутахассис',0.75,0.75,'5',1.269,NULL,NULL,'Штат жадвали','Автойўлинвест.xlsx',NULL,'Сана кўрсатилмаган','Манба файлда кучга кириш санаси кўрсатилмаган.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='204679222' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 10,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат курсатувчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат курсатувчи ходимлар','','Хўжалик мудири','Техник ва хизмат кўрсатувчи ходимлар','Мутахассис',1,1,'7',1.505,NULL,NULL,'Штат жадвали','Автойўлинвест.xlsx',NULL,'Сана кўрсатилмаган','Манба файлда кучга кириш санаси кўрсатилмаган.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='204679222' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 11,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Автовишка ҳайдовчиси','И','Доимий',5,1,'8,8 тн',1.558,10297133.6,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 12,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Автовишка ҳайдовчиси','И','Доимий',7,1,'5 тн',1.558,14257569.6,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 13,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Бурғилаш қурилмали кран манипулятор ҳайдовчиси','И','Доимий',2,1,'6,5 тн',1.558,4356479.6,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 14,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Диспетчер','МТХ','Доимий',1,1,'6',1.384,1759064,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 15,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Енгил автомобиль ҳайдовчиси','ХКХ','Доимий',3,1,'3,2 л',1.293,4930209,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 16,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Енгил автомобиль ҳайдовчиси','ХКХ','Доимий',3,1,'1,5 л',1.228,4682364,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 17,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Енгил автомобиль ҳайдовчиси','ХКХ','Доимий',4,1,'0,8 л',1.228,6243152,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 18,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Кран манипулятор ҳайдовчиси','И','Доимий',2,1,'5,5 тн',1.558,4356479.6,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 19,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Ҳамшира','ХКХ','Доимий',1,1,'3',1.847,2347537,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 20,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Экскаватор-юклагич ҳайдовчиси','И','Доимий',2,1,'7,8 тн',1.558,4356479.6,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 21,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Юк ташувчи автомобиль ҳайдовчиси','И','Доимий',2,1,'3,5 тн',1.358,3797239.6,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 22,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автохўжалик хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Автохўжалик хизмати','','Ярим тиркамали юк ташувчи автомобиль ҳайдовчиси','И','Доимий',1,1,'16,7 тн',1.699,2591314.8,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 23,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бошқарув ходимлари' ORDER BY d.id DESC LIMIT 1),b.id,'Бошқарув ходимлари','','Ахборот технологиялари бўйича бош мутахассис','БХ','Доимий',1,1,'10',1.883,2393293,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 24,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бошқарув ходимлари' ORDER BY d.id DESC LIMIT 1),b.id,'Бошқарув ходимлари','','Бош иқтисодчи','БХ','Доимий',1,1,'10',1.883,2393293,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 25,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бошқарув ходимлари' ORDER BY d.id DESC LIMIT 1),b.id,'Бошқарув ходимлари','','Бош механик','БХ','Доимий',1,1,'10',1.883,2393293,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 26,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бошқарув ходимлари' ORDER BY d.id DESC LIMIT 1),b.id,'Бошқарув ходимлари','','Бош муҳандис','БХ','Доимий',1,1,'14',2.421,3077091,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 27,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бошқарув ходимлари' ORDER BY d.id DESC LIMIT 1),b.id,'Бошқарув ходимлари','','Бош энергетик','БХ','Доимий',1,1,'10',1.883,2393293,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 28,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бошқарув ходимлари' ORDER BY d.id DESC LIMIT 1),b.id,'Бошқарув ходимлари','','Директор','БХ','Доимий',1,1,'15',2.561,3255031,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 29,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бошқарув ходимлари' ORDER BY d.id DESC LIMIT 1),b.id,'Бошқарув ходимлари','','Директор ўринбосари','БХ','Доимий',1,1,'14',2.421,3077091,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 30,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бошқарув ходимлари' ORDER BY d.id DESC LIMIT 1),b.id,'Бошқарув ходимлари','','Ижро интизоми ва мурожаатлар билан ишлаш бўйича бош мутахассис','БХ','Доимий',1,1,'10',1.883,2393293,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 31,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бошқарув ходимлари' ORDER BY d.id DESC LIMIT 1),b.id,'Бошқарув ходимлари','','Кадрлар ва махсус ишлар бўйича инспектор','БХ','Доимий',1,1,'9',1.755,2230605,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 32,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бошқарув ходимлари' ORDER BY d.id DESC LIMIT 1),b.id,'Бошқарув ходимлари','','Меҳнатни муҳофаза қилиш ва техника хавфсизлиги бўйича бош мутахассис','БХ','Доимий',1,1,'10',1.883,2393293,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 33,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бошқарув ходимлари' ORDER BY d.id DESC LIMIT 1),b.id,'Бошқарув ходимлари','','Таъминот масалалари бўйича бош мутахассис','БХ','Доимий',1,1,'10',1.883,2393293,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 34,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия','','Бош мутахассис','БХ','Доимий',1,1,'10',1.883,2393293,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 35,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия','','Бош ҳисобчи','БХ','Доимий',1,1,'13',2.284,2902964,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 36,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ишлаб чиқариш ва техник бўлим' ORDER BY d.id DESC LIMIT 1),b.id,'Ишлаб чиқариш ва техник бўлим','','Бош мутахассис','БХ','Доимий',1,1,'10',1.883,2393293,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 37,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ишлаб чиқариш ва техник бўлим' ORDER BY d.id DESC LIMIT 1),b.id,'Ишлаб чиқариш ва техник бўлим','','Бўлим бошлиғи','БХ','Доимий',1,1,'13',2.284,2902964,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 38,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ишлаб чиқариш ва техник бўлим' ORDER BY d.id DESC LIMIT 1),b.id,'Ишлаб чиқариш ва техник бўлим','','Етакчи мутахассис','БХ','Доимий',1,1,'9',1.755,2230605,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 39,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Тошкент вилояти филиали','','Бош муҳандис','МТХ','Доимий',1,1,'12',2.148,2730108,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 40,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Тошкент вилояти филиали','','Раҳбар','МТХ','Доимий',1,1,'13',2.284,2902964,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 41,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Тошкент вилояти филиали','','Техник','МТХ','Доимий',1,1,'5',1.269,1612899,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 42,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Тошкент вилояти филиали','','Уста бригадир','МТХ','Доимий',12,1,'8',1.63,24860760,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 43,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Тошкент вилояти филиали','','Уста бригадир','МТХ','Доимий',2,1,'6',1.384,3518128,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 44,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Тошкент вилояти филиали','','Электромонтёр','И','Доимий',11,1,'5',1.269,17741889,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 45,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Тошкент вилояти филиали','','Электромонтёр','И','Доимий',23,1,'4',1.158,33851814,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 46,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Тошкент вилояти филиали','','Электромонтёр','И','Доимий',12,1,'3',1.106,16868712,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 47,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Тошкент вилояти филиали','','Электромонтёр','И','Доимий',13,1,'2',1.053,17398719,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 48,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Тошкент вилояти филиали','','Электромонтёр','И','Доимий',6,1,'1',1,7626000,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 49,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Боғбон','ХКХ','Доимий',1,1,'2',1.053,1338363,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 50,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Бўлим мудири','МТХ','Доимий',1,1,'7',1.505,1912855,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 51,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Котиба','МТХ','Доимий',1,1,'3',1.106,1405726,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 52,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Қоровул','ХКХ','Доимий',3,1,'1',1,3813000,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 53,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Омбор мудири','МТХ','Доимий',1,1,'5',1.269,1612899,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 54,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Фаррош','ХКХ','Доимий',1,1,'1',1,1271000,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 55,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Электр тармоқларини тасарруф этиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Электр тармоқларини тасарруф этиш бўлими','','Бош мутахассис','БХ','Доимий',1,1,'10',1.883,2393293,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 56,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Электр тармоқларини тасарруф этиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Электр тармоқларини тасарруф этиш бўлими','','Бўлим бошлиғи','БХ','Доимий',1,1,'13',2.284,2902964,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 57,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Электр тармоқларини тасарруф этиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Электр тармоқларини тасарруф этиш бўлими','','Етакчи мутахассис','БХ','Доимий',1,1,'9',1.755,2230605,'2026-01-01','Штат жадвали','Автойўлнуртаъмир.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='308520082' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 58,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия','','Бош мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 59,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия','','Бош ҳисобчи',NULL,'Доимий',1,1,'11',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 60,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация бўлими','','Бош мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 61,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'11',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 62,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Ахборот-коммуникация технологияларини жорий қилиш ва ривожлантириш бўйича бош мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 63,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Бош муҳандис',NULL,'Доимий',1,1,'12',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 64,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Бош энергетик',NULL,'Доимий',1,1,'9',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 65,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Бош юрисконсульт',NULL,'Доимий',1,1,'10',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 66,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор',NULL,'Доимий',1,1,'13',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 67,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор ўринбосари',NULL,'Доимий',1,1,'12',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 68,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Махсус ишлар бўйича бош мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 69,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Меҳнат хавфсизлиги бўйича бош мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 70,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Ҳаракат хавфсизлиги бўйича бош мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 71,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Режа, иқтисод ва ишлаб чиқариш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Режа, иқтисод ва ишлаб чиқариш бўлими','','Бош мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 72,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Режа, иқтисод ва ишлаб чиқариш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Режа, иқтисод ва ишлаб чиқариш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'11',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 73,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Умумфойдаланишдаги автомобиль йўлларидан фойдаланиш ва бажарилган ишларни қабул қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Умумфойдаланишдаги автомобиль йўлларидан фойдаланиш ва бажарилган ишларни қабул қилиш бўлими','','Бош мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 74,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Умумфойдаланишдаги автомобиль йўлларидан фойдаланиш ва бажарилган ишларни қабул қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Умумфойдаланишдаги автомобиль йўлларидан фойдаланиш ва бажарилган ишларни қабул қилиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'11',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 75,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Умумфойдаланишдаги автомобиль йўлларидан фойдаланиш ва бажарилган ишларни қабул қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Умумфойдаланишдаги автомобиль йўлларидан фойдаланиш ва бажарилган ишларни қабул қилиш бўлими','','Етакчи мутахассис',NULL,'Доимий',1,1,'8',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 76,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ходимлар билан ишлаш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ходимлар билан ишлаш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'11',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 77,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ходимлар билан ишлаш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ходимлар билан ишлаш бўлими','','Етакчи мутахассис',NULL,'Доимий',1,1,'8',NULL,NULL,'2021-01-01','Штат жадвали','Қамчиқавтойўл.PDF','1','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 78,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қўшимча техник ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Қўшимча техник ходимлар','','Автомобиль ҳайдовчиси',NULL,'Доимий',1,1,'1',NULL,NULL,'2025-01-03','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','3','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 79,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қўшимча техник ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Қўшимча техник ходимлар','','Боғбон',NULL,'Доимий',1,1,'2',NULL,NULL,'2025-01-03','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','3','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 80,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қўшимча техник ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Қўшимча техник ходимлар','','Компьютер оператори',NULL,'Доимий',1,1,'7',NULL,NULL,'2025-01-03','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','3','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 81,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат кўрсатувчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат кўрсатувчи ходимлар','','Бош муҳандис ҳайдовчиси',NULL,'Доимий',1,1,'1',NULL,NULL,'2024-01-01','Штат жадвали','Қамчиқавтойўл.PDF','2','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 82,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат кўрсатувчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат кўрсатувчи ходимлар','','Директор ҳайдовчиси (Captiva)',NULL,'Доимий',1,1,'3',NULL,NULL,'2024-01-01','Штат жадвали','Қамчиқавтойўл.PDF','2','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 83,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат кўрсатувчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат кўрсатувчи ходимлар','','Раҳбар котиби',NULL,'Доимий',1,1,'5',NULL,NULL,'2024-01-01','Штат жадвали','Қамчиқавтойўл.PDF','2','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 84,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат кўрсатувчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат кўрсатувчи ходимлар','','Фаррош',NULL,'Доимий',1,1,'1',NULL,NULL,'2024-01-01','Штат жадвали','Қамчиқавтойўл.PDF','2','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 85,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат кўрсатувчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат кўрсатувчи ходимлар','','Хўжалик ишлари мудири',NULL,'Доимий',1,1,'7',NULL,NULL,'2024-01-01','Штат жадвали','Қамчиқавтойўл.PDF','2','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 86,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='537-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'537-йўлдан фойдаланиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2021-04-01','Штат жадвали','Қамчиқавтойўл.PDF','20','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 87,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='537-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'537-йўлдан фойдаланиш бўлими','','Йўл устаси',NULL,'Доимий',2,1,'7',NULL,NULL,'2021-04-01','Штат жадвали','Қамчиқавтойўл.PDF','20','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 88,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='537-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'537-йўлдан фойдаланиш бўлими','','Механик',NULL,'Доимий',1,1,'7',NULL,NULL,'2021-04-01','Штат жадвали','Қамчиқавтойўл.PDF','20','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 89,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='537-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'537-йўлдан фойдаланиш бўлими','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2021-04-01','Штат жадвали','Қамчиқавтойўл.PDF','20','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 90,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='252-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'252-йўлдан фойдаланиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','10','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 91,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='252-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'252-йўлдан фойдаланиш бўлими','','Йўл устаси',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','10','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 92,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='257-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'257-йўлдан фойдаланиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','14','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 93,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='257-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'257-йўлдан фойдаланиш бўлими','','Йўл устаси',NULL,'Доимий',2,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','14','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 94,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='257-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'257-йўлдан фойдаланиш бўлими','','Механик',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','14','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 95,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='257-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'257-йўлдан фойдаланиш бўлими','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','14','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 96,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='257-йўлдан фойдаланиш бўлими — «Жанубий» гуруҳи' ORDER BY d.id DESC LIMIT 1),b.id,'257-йўлдан фойдаланиш бўлими — «Жанубий» гуруҳи','','Йўл ишчиси',NULL,'Доимий',12,1,'2',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','16','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 97,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='257-йўлдан фойдаланиш бўлими — «Жанубий» гуруҳи' ORDER BY d.id DESC LIMIT 1),b.id,'257-йўлдан фойдаланиш бўлими — «Жанубий» гуруҳи','','Йўл устаси',NULL,'Доимий',2,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','16','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 98,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='258-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'258-йўлдан фойдаланиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','11','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 99,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='258-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'258-йўлдан фойдаланиш бўлими','','Йўл устаси',NULL,'Доимий',3,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','11','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 100,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='258-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'258-йўлдан фойдаланиш бўлими','','Механик',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','11','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 101,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='258-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'258-йўлдан фойдаланиш бўлими','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','11','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 102,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='35-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'35-йўлдан фойдаланиш бўлими','','Бош диспетчер',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','13','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 103,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='35-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'35-йўлдан фойдаланиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','13','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 104,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='35-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'35-йўлдан фойдаланиш бўлими','','Вентиляция муҳандиси',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','13','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 105,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='35-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'35-йўлдан фойдаланиш бўлими','','Ёнғин хавфсизлиги муҳандиси',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','13','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 106,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='35-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'35-йўлдан фойдаланиш бўлими','','Йўл бўлими муҳандиси',NULL,'Доимий',1,1,'8',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','13','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 107,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='35-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'35-йўлдан фойдаланиш бўлими','','Йўл устаси',NULL,'Доимий',4,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','13','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 108,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='35-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'35-йўлдан фойдаланиш бўлими','','Қозонхона назорати муҳандиси',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','13','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 109,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='35-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'35-йўлдан фойдаланиш бўлими','','Механик',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','13','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 110,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='35-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'35-йўлдан фойдаланиш бўлими','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','13','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 111,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='35-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'35-йўлдан фойдаланиш бўлими','','Энергетик',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','13','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 112,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='385-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'385-йўлдан фойдаланиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','19','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 113,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='385-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'385-йўлдан фойдаланиш бўлими','','Йўл устаси',NULL,'Доимий',2,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','19','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 114,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='385-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'385-йўлдан фойдаланиш бўлими','','Механик',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','19','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 115,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='385-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'385-йўлдан фойдаланиш бўлими','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','19','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 116,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='524-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'524-йўлдан фойдаланиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','17','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 117,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='524-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'524-йўлдан фойдаланиш бўлими','','Йўл устаси',NULL,'Доимий',2,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','17','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 118,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='524-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'524-йўлдан фойдаланиш бўлими','','Механик',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','17','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 119,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='524-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'524-йўлдан фойдаланиш бўлими','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','17','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 120,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='549-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'549-йўлдан фойдаланиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','18','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 121,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='549-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'549-йўлдан фойдаланиш бўлими','','Йўл устаси',NULL,'Доимий',2,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','18','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 122,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='549-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'549-йўлдан фойдаланиш бўлими','','Механик',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','18','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 123,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='549-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'549-йўлдан фойдаланиш бўлими','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','18','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 124,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='550-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'550-йўлдан фойдаланиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','12','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 125,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='550-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'550-йўлдан фойдаланиш бўлими','','Йўл устаси',NULL,'Доимий',2,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','12','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 126,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='550-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'550-йўлдан фойдаланиш бўлими','','Механик',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','12','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 127,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='550-йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'550-йўлдан фойдаланиш бўлими','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','12','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 128,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='550-йўлдан фойдаланиш бўлими — «Шимолий» гуруҳи' ORDER BY d.id DESC LIMIT 1),b.id,'550-йўлдан фойдаланиш бўлими — «Шимолий» гуруҳи','','Диспетчер',NULL,'Доимий',2,1,'2',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','15','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 129,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='550-йўлдан фойдаланиш бўлими — «Шимолий» гуруҳи' ORDER BY d.id DESC LIMIT 1),b.id,'550-йўлдан фойдаланиш бўлими — «Шимолий» гуруҳи','','Йўл ишчиси',NULL,'Доимий',10,1,'2',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','15','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 130,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='550-йўлдан фойдаланиш бўлими — «Шимолий» гуруҳи' ORDER BY d.id DESC LIMIT 1),b.id,'550-йўлдан фойдаланиш бўлими — «Шимолий» гуруҳи','','Йўл устаси',NULL,'Доимий',2,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','15','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 131,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='А-373 йўлининг 193 ва 273-км вазн назорати пунктлари' ORDER BY d.id DESC LIMIT 1),b.id,'А-373 йўлининг 193 ва 273-км вазн назорати пунктлари','','Бош мутахассис',NULL,'Доимий',1,1,'8',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','21','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 132,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='193-км пункти' ORDER BY d.id DESC LIMIT 1),b.id,'А-373 йўлининг 193 ва 273-км вазн назорати пунктлари','193-км пункти','Мутахассис',NULL,'Доимий',8,1,'6',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','21','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 133,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='273-км пункти' ORDER BY d.id DESC LIMIT 1),b.id,'А-373 йўлининг 193 ва 273-км вазн назорати пунктлари','273-км пункти','Мутахассис',NULL,'Доимий',8,1,'6',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','21','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 134,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальт-бетон заводи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальт-бетон заводи','','Завод бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','8','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 135,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальт-бетон заводи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальт-бетон заводи','','Ишлаб чиқариш лаборатория ходими',NULL,'Доимий',2,1,'6',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','8','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 136,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальт-бетон заводи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальт-бетон заводи','','Ишлаб чиқариш механиги',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','8','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 137,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальт-бетон заводи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальт-бетон заводи','','Ишлаб чиқариш устаси',NULL,'Доимий',2,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','8','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 138,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальт-бетон заводи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальт-бетон заводи','','Тарозибон',NULL,'Доимий',2,1,'2',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','8','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 139,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальт-бетон заводи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальт-бетон заводи','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','8','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 140,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальт-бетон заводи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальт-бетон заводи','','Цех устаси (тош майдалаш)',NULL,'Доимий',2,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','8','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 141,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қурилиш-таъмирлаш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Қурилиш-таъмирлаш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','6','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 142,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қурилиш-таъмирлаш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Қурилиш-таъмирлаш бўлими','','Қурилиш-монтаж ишлари устаси',NULL,'Доимий',4,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','6','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 143,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қурилиш-таъмирлаш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Қурилиш-таъмирлаш бўлими','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','6','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 144,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация бўлими','','Диспетчер',NULL,'Доимий',1,1,'6',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','5','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 145,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация бўлими','','Ёқилғи қуйиш оператори',NULL,'Доимий',3,1,'2',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','5','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 146,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация бўлими','','Ёқилғи ҳисобини юритувчи техник',NULL,'Доимий',2,1,'4',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','5','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 147,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация бўлими','','Ёқилғи-мойлаш материаллари хизмати бошлиғи',NULL,'Доимий',1,1,'5',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','5','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 148,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация бўлими','','Кўтариш ва йўл-қурилиш техникаларини таъмирлаш, ишлатиш ва хизмат кўрсатиш механиги',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','5','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 149,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация бўлими','','Техника хавфсизлиги муҳандиси',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','5','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 150,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация бўлими','','Техникалардан фойдаланиш муҳандиси',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','5','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 151,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация бўлими','','Фельдшер',NULL,'Доимий',2,1,'5',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','5','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 152,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Пудрат ишлари бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Пудрат ишлари бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','7','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 153,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Пудрат ишлари бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Пудрат ишлари бўлими','','Геодезист',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','7','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 154,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Пудрат ишлари бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Пудрат ишлари бўлими','','Йўл устаси',NULL,'Доимий',3,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','7','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 155,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Пудрат ишлари бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Пудрат ишлари бўлими','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','7','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 156,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Пунгон йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Пунгон йўлдан фойдаланиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'9',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','9','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 157,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Пунгон йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Пунгон йўлдан фойдаланиш бўлими','','Йўл устаси',NULL,'Доимий',4,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','9','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 158,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Пунгон йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Пунгон йўлдан фойдаланиш бўлими','','Механик',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','9','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 159,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Пунгон йўлдан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Пунгон йўлдан фойдаланиш бўлими','','Техник-ҳисобчи',NULL,'Доимий',1,1,'7',NULL,NULL,'2023-01-04','Штат жадвали','Қамчиқавтойўл.PDF','9','Текшириш талаб этилади','Файлда турли йил ва турли бўлинмаларга оид алоҳида штат жадваллари жамланган; жорий йиғма штат сифатида қўшиб ҳисоблашдан олдин мувофиқлаштириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 160,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия','','Аудитор',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 161,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия','','Бош мутахассис (иқтисодчи)',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 162,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия','','Бош мутахассис (ҳисобчи)',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 163,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия','','Етакчи мутахассис (ҳисобчи)',NULL,'Доимий',3,1,'8',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 164,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия','','Иш ҳақи бўйича ҳисобчи',NULL,'Доимий',1,1,'6',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 165,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор ўринбосари',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 166,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Коррупцияга қарши курашиш бўйича бош мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 167,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Режа, иқтисод ва ишлаб чиқариш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Режа, иқтисод ва ишлаб чиқариш бўлими','','Етакчи мутахассис',NULL,'Доимий',1,1,'8',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 168,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Режа, иқтисод ва ишлаб чиқариш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Режа, иқтисод ва ишлаб чиқариш бўлими','','Компьютер оператори',NULL,'Доимий',1,1,'7',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 169,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Таъминот бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Таъминот бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'7',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 170,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Таъминот бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Таъминот бўлими','','Қишлоқ хўжалиги маҳсулотларини қабул қилувчи ишчи',NULL,'Доимий',2,1,'2',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 171,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Таъминот бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Таъминот бўлими','','Моддий захиралар хизмати бошлиғи (МОП)',NULL,'Доимий',1,0.5,'7',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 172,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Таъминот бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Таъминот бўлими','','Омбор мудири',NULL,'Доимий',1,0.5,'7',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 173,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Асаларичи',NULL,'Доимий',1,1,'3',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 174,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Боғбон',NULL,'Доимий',1,1,'2',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 175,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Қоровул (Булоқ)',NULL,'Доимий',4,1,'1',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 176,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Ҳайдовчи',NULL,'Доимий',1,1,'2',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 177,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Ҳудуд тозаловчиси (Булоқ)',NULL,'Доимий',1,1,'1',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 178,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Ҳудуд тозаловчиси (Ёнғоқзор)',NULL,'Доимий',1,1,'1',NULL,NULL,'2025-01-15','Қўшимча штат жадвали','Қамчиқавтойўл.PDF','4','Қўшимча штат','Қўшимча штат ҳужжати; асосий амалдаги йиғма штат билан бирлаштиришдан олдин текшириш керак.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='301341872' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 179,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия ҳисоби ва ҳисоботи шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия ҳисоби ва ҳисоботи шуъбаси','','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 180,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия ҳисоби ва ҳисоботи шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия ҳисоби ва ҳисоботи шуъбаси','','Шуъба бошлиғи — бош ҳисобчи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 181,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ёрдамчи ва техник ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Ёрдамчи ва техник ходимлар','','Котиб',NULL,'Доимий',1,1,'5',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 182,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ёрдамчи ва техник ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Ёрдамчи ва техник ходимлар','','Хўжалик ишлари бўйича хизматчи (фаррош)',NULL,'Доимий',1,1,'1',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 183,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ёрдамчи ва техник ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Ёрдамчи ва техник ходимлар','','Ҳайдовчи (енгил автомашина учун)',NULL,'Доимий',1,1,'1–3',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 184,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Бош юрисконсульт',NULL,'Доимий',1,1,'14',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 185,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор',NULL,'Доимий',1,1,'15',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 186,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор ўринбосари',NULL,'Доимий',1,1,'14',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 187,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Ижро интизоми ва мурожаатлар бўйича бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 188,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Инсон ресурсларини ривожлантириш ва бошқариш бўйича бош мутахассис',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 189,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Консультант',NULL,'Доимий',1,1,'13',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 190,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Таъминот ва логистикани бошқариш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Таъминот ва логистикани бошқариш бўлими','','Бош мутахассис',NULL,'Доимий',3,1,'10',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 191,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Таъминот ва логистикани бошқариш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Таъминот ва логистикани бошқариш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 192,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Таъминот ва логистикани бошқариш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Таъминот ва логистикани бошқариш бўлими','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 193,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Харидларни ташкил этиш, маркетинг ва шартномалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Харидларни ташкил этиш, маркетинг ва шартномалар бўлими','','Бош мутахассис',NULL,'Доимий',3,1,'10',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 194,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Харидларни ташкил этиш, маркетинг ва шартномалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Харидларни ташкил этиш, маркетинг ва шартномалар бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 195,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Харидларни ташкил этиш, маркетинг ва шартномалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Харидларни ташкил этиш, маркетинг ва шартномалар бўлими','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2026-03-16','Штат жадвали','Ўзйўлбутлаш.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='201058958' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 196,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='«Янги Ўзбекистонда йиллар ва йўллар» журнали нашриёти матбаа бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'«Янги Ўзбекистонда йиллар ва йўллар» журнали нашриёти матбаа бўлими','','Бош мутахассис',NULL,'Доимий',2,1,'10',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 197,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='«Янги Ўзбекистонда йиллар ва йўллар» журнали нашриёти матбаа бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'«Янги Ўзбекистонда йиллар ва йўллар» журнали нашриёти матбаа бўлими','','Бўлим бошлиғи — бош муҳаррир',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 198,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='«Янги Ўзбекистонда йиллар ва йўллар» журнали нашриёти матбаа бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'«Янги Ўзбекистонда йиллар ва йўллар» журнали нашриёти матбаа бўлими','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 199,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='«Янги Ўзбекистонда йиллар ва йўллар» журнали нашриёти матбаа бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'«Янги Ўзбекистонда йиллар ва йўллар» журнали нашриёти матбаа бўлими','','Мутахассис',NULL,'Доимий',1,1,'7',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 200,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўлларини лойиҳалаш, қурилиш, таъмирлаш ва сақлаш ишларига илмий ёндашувни ривожлантириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўлларини лойиҳалаш, қурилиш, таъмирлаш ва сақлаш ишларига илмий ёндашувни ривожлантириш шуъбаси','','Бош мутахассис',NULL,'Доимий',2,1,'10',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 201,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўлларини лойиҳалаш, қурилиш, таъмирлаш ва сақлаш ишларига илмий ёндашувни ривожлантириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўлларини лойиҳалаш, қурилиш, таъмирлаш ва сақлаш ишларига илмий ёндашувни ривожлантириш шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 202,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўлларини лойиҳалаш, қурилиш, таъмирлаш ва сақлаш ишларига илмий ёндашувни ривожлантириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўлларини лойиҳалаш, қурилиш, таъмирлаш ва сақлаш ишларига илмий ёндашувни ривожлантириш шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12–5%',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 203,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Илмий тадқиқот ишларини ривожлантириш лабораторияси бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Илмий тадқиқот ишларини ривожлантириш лабораторияси бўлими','','Бош мутахассис',NULL,'Доимий',3,1,'10',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 204,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Илмий тадқиқот ишларини ривожлантириш лабораторияси бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Илмий тадқиқот ишларини ривожлантириш лабораторияси бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 205,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Илмий тадқиқот ишларини ривожлантириш лабораторияси бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Илмий тадқиқот ишларини ривожлантириш лабораторияси бўлими','','Бўлим бошлиғи ўринбосари',NULL,'Доимий',1,1,'11',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 206,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Илмий тадқиқот ишларини ривожлантириш лабораторияси бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Илмий тадқиқот ишларини ривожлантириш лабораторияси бўлими','','Етакчи мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 207,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Илмий тадқиқот ишларини ривожлантириш лабораторияси бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Илмий тадқиқот ишларини ривожлантириш лабораторияси бўлими','','Мутахассис',NULL,'Доимий',1,1,'7',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 208,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Илмий тадқиқот, инновациялар ва халқаро алоқалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Илмий тадқиқот, инновациялар ва халқаро алоқалар бўлими','','Бош мутахассис',NULL,'Доимий',2,1,'10',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 209,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Илмий тадқиқот, инновациялар ва халқаро алоқалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Илмий тадқиқот, инновациялар ва халқаро алоқалар бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 210,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Илмий тадқиқот, инновациялар ва халқаро алоқалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Илмий тадқиқот, инновациялар ва халқаро алоқалар бўлими','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 211,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Илмий тадқиқотларни тижоратлаштириш ва ишлаб чиқаришни ривожлантириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Илмий тадқиқотларни тижоратлаштириш ва ишлаб чиқаришни ривожлантириш шуъбаси','','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 212,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Илмий тадқиқотларни тижоратлаштириш ва ишлаб чиқаришни ривожлантириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Илмий тадқиқотларни тижоратлаштириш ва ишлаб чиқаришни ривожлантириш шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 213,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Илмий тадқиқотларни тижоратлаштириш ва ишлаб чиқаришни ривожлантириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Илмий тадқиқотларни тижоратлаштириш ва ишлаб чиқаришни ривожлантириш шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12–5%',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 214,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт, шартномалар ва бухгалтерия ҳисоби шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт, шартномалар ва бухгалтерия ҳисоби шуъбаси','','Бош мутахассис',NULL,'Доимий',2,1,'10',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 215,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт, шартномалар ва бухгалтерия ҳисоби шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт, шартномалар ва бухгалтерия ҳисоби шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 216,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт, шартномалар ва бухгалтерия ҳисоби шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт, шартномалар ва бухгалтерия ҳисоби шуъбаси','','Шуъба бошлиғи — бош ҳисобчи',NULL,'Доимий',1,1,'12–5%',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 217,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Норматив-меъёрий ҳужжатларни ишлаб чиқиш ва рақамлаштириш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Норматив-меъёрий ҳужжатларни ишлаб чиқиш ва рақамлаштириш бўлими','','Бош мутахассис',NULL,'Доимий',2,1,'10',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 218,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Норматив-меъёрий ҳужжатларни ишлаб чиқиш ва рақамлаштириш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Норматив-меъёрий ҳужжатларни ишлаб чиқиш ва рақамлаштириш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 219,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Норматив-меъёрий ҳужжатларни ишлаб чиқиш ва рақамлаштириш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Норматив-меъёрий ҳужжатларни ишлаб чиқиш ва рақамлаштириш бўлими','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 220,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Бош юрисконсульт',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 221,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор',NULL,'Доимий',1,1,'15',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 222,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директорнинг биринчи ўринбосари',NULL,'Доимий',1,1,'14',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 223,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директорнинг инновациялар бўйича ўринбосари',NULL,'Доимий',1,1,'14',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 224,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Ижро интизоми ва мурожаатлар билан ишлаш бўйича бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 225,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Инсон ресурсларини ривожлантириш бўйича бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 226,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Таълим муассасалари билан ишлаш ва малака ошириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Таълим муассасалари билан ишлаш ва малака ошириш шуъбаси','','Бош мутахассис',NULL,'Доимий',2,1,'10',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 227,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Таълим муассасалари билан ишлаш ва малака ошириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Таълим муассасалари билан ишлаш ва малака ошириш шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 228,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Таълим муассасалари билан ишлаш ва малака ошириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Таълим муассасалари билан ишлаш ва малака ошириш шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12–5%',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 229,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Халқаро тоифадаги муҳандис-консультантлар шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Халқаро тоифадаги муҳандис-консультантлар шуъбаси','','Консультант',NULL,'Доимий',2,1,'11',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 230,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Электрон базани юритиш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Электрон базани юритиш шуъбаси','','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 231,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Электрон базани юритиш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Электрон базани юритиш шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 232,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Электрон базани юритиш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Электрон базани юритиш шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12–5%',NULL,NULL,'2025-07-01','Штат жадвали','АЙИТИ.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='205340218' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 233,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия ҳисоби ва ҳисоботи бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия ҳисоби ва ҳисоботи бўлими','','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 234,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия ҳисоби ва ҳисоботи бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия ҳисоби ва ҳисоботи бўлими','','Бўлим бошлиғи — бош ҳисобчи',NULL,'Доимий',1,1,'13',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 235,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Йўл-қурилиш материаллари сифатини назорат қилиш бошқармаси' ORDER BY d.id DESC LIMIT 1),b.id,'Йўл-қурилиш материаллари сифатини назорат қилиш бошқармаси','','Бош мутахассис',NULL,'Доимий',5,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 236,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Йўл-қурилиш материаллари сифатини назорат қилиш бошқармаси' ORDER BY d.id DESC LIMIT 1),b.id,'Йўл-қурилиш материаллари сифатини назорат қилиш бошқармаси','','Етакчи мутахассис',NULL,'Доимий',5,1,'9',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 237,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Йўл-қурилиш материаллари сифатини назорат қилиш бошқармаси' ORDER BY d.id DESC LIMIT 1),b.id,'Йўл-қурилиш материаллари сифатини назорат қилиш бошқармаси','','Мутахассис',NULL,'Доимий',4,1,'7',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 238,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт ва шартномалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт ва шартномалар бўлими','','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 239,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт ва шартномалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт ва шартномалар бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 240,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт ва шартномалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт ва шартномалар бўлими','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 241,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Ахборот-коммуникация технологиялари бўйича бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 242,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Бош муҳандис — бошқарма бошлиғи',NULL,'Доимий',1,1,'14',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 243,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Бош юрисконсульт',NULL,'Доимий',1,1,'14',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 244,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор',NULL,'Доимий',1,1,'15',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 245,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор ўринбосари',NULL,'Доимий',1,1,'14',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 246,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Ижро интизоми ва ташкилий назорат бўйича бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 247,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Инсон ресурсларини ривожлантириш бўйича бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 248,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Техник ва ёрдамчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Техник ва ёрдамчи ходимлар','','Архивчи',NULL,'Доимий',1,1,'5',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 249,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Техник ва ёрдамчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Техник ва ёрдамчи ходимлар','','Котиб',NULL,'Доимий',1,1,'5',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 250,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Техник ва ёрдамчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Техник ва ёрдамчи ходимлар','','Лаборатория асбоблари техник устаси',NULL,'Доимий',1,1,'5',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 251,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Техник ва ёрдамчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Техник ва ёрдамчи ходимлар','','Меҳнат муҳофазаси ва техника хавфсизлиги инспектори',NULL,'Доимий',1,1,'8',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 252,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Фитосанитария ва тупроқ таҳлили бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Фитосанитария ва тупроқ таҳлили бўлими','','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 253,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Фитосанитария ва тупроқ таҳлили бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Фитосанитария ва тупроқ таҳлили бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 254,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Халқаро тоифадаги муҳандис-консультантлар' ORDER BY d.id DESC LIMIT 1),b.id,'Халқаро тоифадаги муҳандис-консультантлар','','Бош консультант',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 255,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Халқаро тоифадаги муҳандис-консультантлар' ORDER BY d.id DESC LIMIT 1),b.id,'Халқаро тоифадаги муҳандис-консультантлар','','Етакчи консультант',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 256,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Автомобиллар ҳолатини назорат қилувчи механик',NULL,'Доимий',1,1,'6',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 257,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Хўжалик мудири',NULL,'Доимий',1,1,'7',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 258,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Ҳайдовчи',NULL,'Доимий',5,1,'1',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 259,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Андижон филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Андижон филиали','Бош мутахассис — филиал раҳбари',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 260,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Андижон филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Андижон филиали','Етакчи мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 261,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Андижон филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Андижон филиали','Мутахассис',NULL,'Доимий',2,1,'7',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 262,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Андижон филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Андижон филиали','Ҳайдовчи',NULL,'Доимий',1,1,'1',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 263,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қашқадарё филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Қашқадарё филиали','Бош мутахассис — филиал раҳбари',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 264,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қашқадарё филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Қашқадарё филиали','Етакчи мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 265,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қашқадарё филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Қашқадарё филиали','Мутахассис',NULL,'Доимий',2,1,'7',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 266,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қашқадарё филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Қашқадарё филиали','Ҳайдовчи',NULL,'Доимий',1,1,'1',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 267,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Самарқанд филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Самарқанд филиали','Бош мутахассис — филиал раҳбари',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 268,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Самарқанд филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Самарқанд филиали','Етакчи мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 269,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Самарқанд филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Самарқанд филиали','Мутахассис',NULL,'Доимий',2,1,'7',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 270,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Самарқанд филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Самарқанд филиали','Ҳайдовчи',NULL,'Доимий',1,1,'1',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 271,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сурхондарё филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Сурхондарё филиали','Бош мутахассис — филиал раҳбари',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 272,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сурхондарё филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Сурхондарё филиали','Етакчи мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 273,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сурхондарё филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Сурхондарё филиали','Мутахассис',NULL,'Доимий',2,1,'7',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 274,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сурхондарё филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Сурхондарё филиали','Ҳайдовчи',NULL,'Доимий',1,1,'1',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 275,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Тошкент вилояти филиали','Бош мутахассис — филиал раҳбари',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 276,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Тошкент вилояти филиали','Етакчи мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 277,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Тошкент вилояти филиали','Мутахассис',NULL,'Доимий',2,1,'7',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 278,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Тошкент вилояти филиали','Ҳайдовчи',NULL,'Доимий',1,1,'1',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 279,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Фарғона филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Фарғона филиали','Бош мутахассис — филиал раҳбари',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 280,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Фарғона филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Фарғона филиали','Етакчи мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 281,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Фарғона филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Фарғона филиали','Мутахассис',NULL,'Доимий',2,1,'7',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 282,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Фарғона филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Фарғона филиали','Ҳайдовчи',NULL,'Доимий',1,1,'1',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 283,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хоразм филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Хоразм филиали','Бош мутахассис — филиал раҳбари',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 284,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хоразм филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Хоразм филиали','Етакчи мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 285,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хоразм филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Хоразм филиали','Мутахассис',NULL,'Доимий',2,1,'7',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 286,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хоразм филиали' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳудудий филиаллар','Хоразм филиали','Ҳайдовчи',NULL,'Доимий',1,1,'1',NULL,NULL,'2025-04-01','Штат жадвали','Марказий Лаборатория.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='311030653' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 287,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўллари давлат кадастрини ва йўл активларини юритиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўллари давлат кадастрини ва йўл активларини юритиш бўлими','','Бош мутахассис',NULL,'Доимий',2,1,'10',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 288,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўллари давлат кадастрини ва йўл активларини юритиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўллари давлат кадастрини ва йўл активларини юритиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 289,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўллари давлат кадастрини ва йўл активларини юритиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўллари давлат кадастрини ва йўл активларини юритиш бўлими','','Бўлим бошлиғи ўринбосари',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 290,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўллари давлат кадастрини ва йўл активларини юритиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўллари давлат кадастрини ва йўл активларини юритиш бўлими','','Етакчи мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 291,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўллари техник ҳолатини таҳлил қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўллари техник ҳолатини таҳлил қилиш бўлими','','Бош мутахассис',NULL,'Доимий',4,1,'10',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 292,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўллари техник ҳолатини таҳлил қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўллари техник ҳолатини таҳлил қилиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 293,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўллари техник ҳолатини таҳлил қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўллари техник ҳолатини таҳлил қилиш бўлими','','Бўлим бошлиғи ўринбосари',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 294,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўллари техник ҳолатини таҳлил қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўллари техник ҳолатини таҳлил қилиш бўлими','','Етакчи мутахассис',NULL,'Доимий',4,1,'9',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 295,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўлларидан фойдаланишни ташкил этиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўлларидан фойдаланишни ташкил этиш бўлими','','Бош мутахассис',NULL,'Доимий',2,1,'10',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 296,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўлларидан фойдаланишни ташкил этиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўлларидан фойдаланишни ташкил этиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 297,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автомобиль йўлларидан фойдаланишни ташкил этиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автомобиль йўлларидан фойдаланишни ташкил этиш бўлими','','Етакчи мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 298,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия ҳисоби ва ҳисоботи бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия ҳисоби ва ҳисоботи бўлими','','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 299,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия ҳисоби ва ҳисоботи бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия ҳисоби ва ҳисоботи бўлими','','Бўлим бошлиғи — бош ҳисобчи',NULL,'Доимий',1,1,'13',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 300,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Вазн ва ҳажм параметрларини назорат қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Вазн ва ҳажм параметрларини назорат қилиш бўлими','','Бош мутахассис',NULL,'Доимий',3,1,'10',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 301,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Вазн ва ҳажм параметрларини назорат қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Вазн ва ҳажм параметрларини назорат қилиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 302,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Вазн ва ҳажм параметрларини назорат қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Вазн ва ҳажм параметрларини назорат қилиш бўлими','','Бўлим бошлиғи ўринбосари',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 303,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Вазн ва ҳажм параметрларини назорат қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Вазн ва ҳажм параметрларини назорат қилиш бўлими','','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 304,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ижро интизоми ва мурожаатлар билан ишлаш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ижро интизоми ва мурожаатлар билан ишлаш бўлими','','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 305,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ижро интизоми ва мурожаатлар билан ишлаш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ижро интизоми ва мурожаатлар билан ишлаш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 306,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Катта ҳажмли ва оғир вазнли транспорт воситалари ҳаракати учун рухсатномалар бериш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Катта ҳажмли ва оғир вазнли транспорт воситалари ҳаракати учун рухсатномалар бериш бўлими','','Бош мутахассис',NULL,'Доимий',3,1,'10',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 307,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Катта ҳажмли ва оғир вазнли транспорт воситалари ҳаракати учун рухсатномалар бериш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Катта ҳажмли ва оғир вазнли транспорт воситалари ҳаракати учун рухсатномалар бериш бўлими','','Бўлим бошлиғи ўринбосари',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 308,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Катта ҳажмли ва оғир вазнли транспорт воситалари ҳаракати учун рухсатномалар бериш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Катта ҳажмли ва оғир вазнли транспорт воситалари ҳаракати учун рухсатномалар бериш бўлими','','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 309,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт ва шартномалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт ва шартномалар бўлими','','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 310,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт ва шартномалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт ва шартномалар бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 311,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт ва шартномалар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт ва шартномалар бўлими','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 312,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Бош муҳандис',NULL,'Доимий',1,1,'14',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 313,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Бош юрисконсульт',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 314,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор',NULL,'Доимий',1,1,'15',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 315,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор ўринбосари — Катта ҳажмли ва оғир вазнли транспорт воситаларининг ҳаракатланиши учун рухсатномалар бериш бўлими бошлиғи',NULL,'Доимий',1,1,'14',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 316,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директорнинг биринчи ўринбосари',NULL,'Доимий',1,1,'14',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 317,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Инсон ресурсларини ривожлантириш ва бошқариш бўйича бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 318,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Консультант',NULL,'Доимий',1,1,'12',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 319,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Махсус ишлар бўйича бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 320,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳаракат хавфсизлиги ва техник шартлар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳаракат хавфсизлиги ва техник шартлар бўлими','','Бош мутахассис',NULL,'Доимий',2,1,'10',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 321,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳаракат хавфсизлиги ва техник шартлар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳаракат хавфсизлиги ва техник шартлар бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 322,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳаракат хавфсизлиги ва техник шартлар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳаракат хавфсизлиги ва техник шартлар бўлими','','Етакчи мутахассис',NULL,'Доимий',1,1,'9',NULL,NULL,'2025-02-01','Штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 323,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Андижон вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Андижон вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 324,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Андижон вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Андижон вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 325,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Андижон вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Андижон вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 326,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухоро вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Бухоро вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 327,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухоро вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Бухоро вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 328,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухоро вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Бухоро вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 329,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Жиззах вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Жиззах вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 330,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Жиззах вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Жиззах вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 331,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Жиззах вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Жиззах вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 332,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қамчиқ довони филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Қамчиқ довони филиали','Етакчи мутахассис',NULL,'Доимий',8,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 333,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қашқадарё вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Қашқадарё вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 334,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қашқадарё вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Қашқадарё вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 335,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қашқадарё вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Қашқадарё вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 336,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қорақалпоғистон Республикаси филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Қорақалпоғистон Республикаси филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 337,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қорақалпоғистон Республикаси филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Қорақалпоғистон Республикаси филиали','Етакчи мутахассис',NULL,'Доимий',9,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 338,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қорақалпоғистон Республикаси филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Қорақалпоғистон Республикаси филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 339,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Навоий вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Навоий вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 340,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Навоий вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Навоий вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 341,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Навоий вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Навоий вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 342,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Наманган вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Наманган вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 343,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Наманган вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Наманган вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 344,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Наманган вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Наманган вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 345,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Самарқанд вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Самарқанд вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 346,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Самарқанд вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Самарқанд вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 347,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Самарқанд вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Самарқанд вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 348,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сирдарё вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Сирдарё вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 349,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сирдарё вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Сирдарё вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 350,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сирдарё вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Сирдарё вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 351,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сурхондарё вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Сурхондарё вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 352,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сурхондарё вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Сурхондарё вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 353,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сурхондарё вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Сурхондарё вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 354,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Тошкент вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 355,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Тошкент вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 356,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Тошкент вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 357,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент шаҳри филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Тошкент шаҳри филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 358,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент шаҳри филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Тошкент шаҳри филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 359,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тошкент шаҳри филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Тошкент шаҳри филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 360,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Фарғона вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Фарғона вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 361,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Фарғона вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Фарғона вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 362,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Фарғона вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Фарғона вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 363,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хоразм вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Хоразм вилояти филиали','Бош мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 364,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хоразм вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Хоразм вилояти филиали','Етакчи мутахассис',NULL,'Доимий',3,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 365,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хоразм вилояти филиали' ORDER BY d.id DESC LIMIT 1),b.id,'WIM — автоматлаштирилган вазн ва ҳажм назорати филиаллари','Хоразм вилояти филиали','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',1,1,'2',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 366,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ёрдамчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Ёрдамчи ходимлар','','Автомобиллар ҳолатини назорат қилувчи механик',NULL,'Доимий',1,1,'8',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 367,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ёрдамчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Ёрдамчи ходимлар','','Махсус автотранспорт ҳайдовчиси',NULL,'Доимий',9,1,'1',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 368,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ёрдамчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Ёрдамчи ходимлар','','Меҳнат муҳофазаси бўйича мутахассис',NULL,'Доимий',1,1,'8',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 369,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ёрдамчи ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Ёрдамчи ходимлар','','Ҳамшира',NULL,'Доимий',1,1,'4',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 370,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қорақалпоғистон Республикаси, вилоятлар ва Тошкент шаҳридаги филиаллар' ORDER BY d.id DESC LIMIT 1),b.id,'Қорақалпоғистон Республикаси, вилоятлар ва Тошкент шаҳридаги филиаллар','','Филиал раҳбари',NULL,'Доимий',14,1,'13',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 371,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Пудрат ишларини ташкил этиш ва назорат қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Пудрат ишларини ташкил этиш ва назорат қилиш бўлими','','Бош мутахассис',NULL,'Доимий',2,1,'10',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 372,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Пудрат ишларини ташкил этиш ва назорат қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Пудрат ишларини ташкил этиш ва назорат қилиш бўлими','','Бўлим бошлиғи',NULL,'Доимий',1,1,'13',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 373,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Пудрат ишларини ташкил этиш ва назорат қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Пудрат ишларини ташкил этиш ва назорат қилиш бўлими','','Етакчи мутахассис',NULL,'Доимий',2,1,'9',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 374,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат кўрсатувчи ва техник ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат кўрсатувчи ва техник ходимлар','','Компьютер техниги',NULL,'Доимий',1,1,'4',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 375,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат кўрсатувчи ва техник ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат кўрсатувчи ва техник ходимлар','','Котиб-референт',NULL,'Доимий',1,1,'4',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 376,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат кўрсатувчи ва техник ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат кўрсатувчи ва техник ходимлар','','Техник',NULL,'Доимий',2,1,'4',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 377,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат кўрсатувчи ва техник ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат кўрсатувчи ва техник ходимлар','','Хизмат автотранспорти ҳайдовчиси',NULL,'Доимий',3,1,'1',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 378,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хизмат кўрсатувчи ва техник ходимлар' ORDER BY d.id DESC LIMIT 1),b.id,'Хизмат кўрсатувчи ва техник ходимлар','','Хўжалик мудири',NULL,'Доимий',1,1,'6',NULL,NULL,'2026-01-01','Қўшимча штат жадвали','Автомобиль йўллари техник ҳолати таҳлили ва ҳаракат хавфсизлиги маркази.PDF',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='310899964' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 379,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт бошқармаси' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт бошқармаси','','Бош мутахассис',NULL,'Доимий',3,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 380,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт бошқармаси' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт бошқармаси','','Бошқарма бошлиғи',NULL,'Доимий',1,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 381,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт бошқармаси' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт бошқармаси','','Етакчи мутахассис',NULL,'Доимий',1,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 382,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Йўл ишларини молиялаштириш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт бошқармаси','Йўл ишларини молиялаштириш бўлими','Бош мутахассис',NULL,'Доимий',1,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 383,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Йўл ишларини молиялаштириш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт бошқармаси','Йўл ишларини молиялаштириш бўлими','Бошқарма бошлиғи ўринбосари — бўлим бошлиғи',NULL,'Доимий',1,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 384,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Йўл ишларини молиялаштириш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт бошқармаси','Йўл ишларини молиялаштириш бўлими','Етакчи мутахассис',NULL,'Доимий',1,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 385,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Лойиҳавий ечимлар ва нархлар шаклланишини таҳлил қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт бошқармаси','Лойиҳавий ечимлар ва нархлар шаклланишини таҳлил қилиш бўлими','Бош мутахассис',NULL,'Доимий',1,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 386,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Лойиҳавий ечимлар ва нархлар шаклланишини таҳлил қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт бошқармаси','Лойиҳавий ечимлар ва нархлар шаклланишини таҳлил қилиш бўлими','Бўлим бошлиғи',NULL,'Доимий',1,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 387,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Лойиҳавий ечимлар ва нархлар шаклланишини таҳлил қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт бошқармаси','Лойиҳавий ечимлар ва нархлар шаклланишини таҳлил қилиш бўлими','Етакчи мутахассис',NULL,'Доимий',1,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 388,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Раис',NULL,'Доимий',1,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 389,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Раис маслаҳатчиси',NULL,'Доимий',2,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 390,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Раис ўринбосари',NULL,'Доимий',1,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 391,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Раис ўринбосари — бош муҳандис',NULL,'Доимий',1,1,NULL,NULL,NULL,NULL,'Фойдаланувчи тайёрлаган лойиҳа','структура.xlsx',NULL,'Лойиҳа/намуна','Юкланган лойиҳадаги маълумот; тасдиқланган штат жадвали билан солиштириш талаб этилади.',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200541754' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 392,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бинолардан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бинолардан фойдаланиш бўлими','','Бинога комплекс хизмат кўрсатиш ва таъмирлаш бўйича ишчи','Ишлаб чиқариш','Доимий',4,1,'4',1.737,8830908,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 393,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бинолардан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бинолардан фойдаланиш бўлими','','Етакчи мутахассис','Бошқарув','Доимий',3,1,'8',2.445,9322785,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 394,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бинолардан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бинолардан фойдаланиш бўлими','','Қоровул','Хизмат кўрсатувчи','Доимий',13,1,'1',1.5,24784500,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 395,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бинолардан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бинолардан фойдаланиш бўлими','','Лифтёр','Хизмат кўрсатувчи','Доимий',2,1,'1',1.5,3813000,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 396,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бинолардан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бинолардан фойдаланиш бўлими','','Хизмат хоналар фарроши','Хизмат кўрсатувчи','Доимий',19,1,'1',1.5,36223500,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 397,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бинолардан фойдаланиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бинолардан фойдаланиш бўлими','','Ҳовли тозаловчи (супурувчи)','Хизмат кўрсатувчи','Доимий',2,1,'1',1.5,3813000,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 398,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия ҳисоби ва ҳисоботи бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия ҳисоби ва ҳисоботи бўлими','','Бош ҳисобчи','Бошқарув','Доимий',1,1,'13',3.426,4354446,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 399,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия ҳисоби ва ҳисоботи бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия ҳисоби ва ҳисоботи бўлими','','Меҳнатга ҳақ тўлаш бўйича бош мутахассис','Бошқарув','Доимий',1,1,'10',2.8245,3589940,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 400,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Диспетчерлик хизмати бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Диспетчерлик хизмати бўлими','','Диспетчер','Техник','Доимий',4,1,'6',2.076,10554384,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 401,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Диспетчерлик хизмати бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Диспетчерлик хизмати бўлими','','Катта диспетчер','Техник','Доимий',1,1,'7',2.2575,2869283,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 402,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор','Бошқарув','Доимий',1,1,'15',3.8415,4882547,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 403,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор ўринбосари — бинолардан фойдаланиш бўлими бошлиғи','Бошқарув','Доимий',1,1,'14',3.6315,4615637,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 404,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Инсон ресурсларини ривожлантириш ва бошқариш бўйича бош мутахассис','Бошқарув','Доимий',1,1,'10',2.8245,3589940,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 405,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Котиба','Техник ва хизмат кўрсатувчи','Доимий',1,1,'6',2.076,2638596,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 406,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Техника ва энергетика бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Техника ва энергетика бўлими','','Бинонинг техник ҳолати ва техника хавфсизлиги бўйича мутахассис','Техник','Доимий',1,1,'7',2.2575,2869283,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 407,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Техника ва энергетика бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Техника ва энергетика бўлими','','Бўлим бошлиғи','Бошқарув','Доимий',1,1,'13',3.426,4354446,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 408,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Техника ва энергетика бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Техника ва энергетика бўлими','','Сантехник чилангар','Ишлаб чиқариш','Доимий',2,1,'6',2.076,5277192,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 409,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Техника ва энергетика бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Техника ва энергетика бўлими','','Техник','Техник','Доимий',1,1,'6',2.076,2638596,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 410,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Техника ва энергетика бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Техника ва энергетика бўлими','','Электр ускуналарни таъмирловчи ва хизмат кўрсатувчи электромонтёр','Ишлаб чиқариш','Доимий',5,1,'6',2.076,13192980,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 411,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Шартномалар ва хўжалик ишлари бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Шартномалар ва хўжалик ишлари бўлими','','Бўлим бошлиғи','Бошқарув','Доимий',1,1,'13',3.426,4354446,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 412,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Шартномалар ва хўжалик ишлари бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Шартномалар ва хўжалик ишлари бўлими','','Давлат харидлари бўйича бош мутахассис','Бошқарув','Доимий',1,1,'10',2.8245,3589940,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 413,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Шартномалар ва хўжалик ишлари бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Шартномалар ва хўжалик ишлари бўлими','','Етакчи мутахассис','Бошқарув','Доимий',2,1,'9',2.6325,6691816,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 414,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Шартномалар ва хўжалик ишлари бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Шартномалар ва хўжалик ишлари бўлими','','Техник','Техник','Доимий',1,1,'6',2.076,2638596,'2026-05-01','Штат жадвали','Бино дирекция.pdf',NULL,'Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='202756999' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 415,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='1-қурилиш участкаси' ORDER BY d.id DESC LIMIT 1),b.id,'1-қурилиш участкаси','','Иш бошқарувчи','Саноат/ишлаб чиқариш','Доимий',3,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 416,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='1-қурилиш участкаси' ORDER BY d.id DESC LIMIT 1),b.id,'1-қурилиш участкаси','','Уста','Саноат/ишлаб чиқариш','Доимий',4,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 417,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='1-қурилиш участкаси' ORDER BY d.id DESC LIMIT 1),b.id,'1-қурилиш участкаси','','Участка бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 418,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='2-қурилиш участкаси' ORDER BY d.id DESC LIMIT 1),b.id,'2-қурилиш участкаси','','Иш бошқарувчи','Саноат/ишлаб чиқариш','Доимий',3,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 419,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='2-қурилиш участкаси' ORDER BY d.id DESC LIMIT 1),b.id,'2-қурилиш участкаси','','Уста','Саноат/ишлаб чиқариш','Доимий',4,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 420,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='2-қурилиш участкаси' ORDER BY d.id DESC LIMIT 1),b.id,'2-қурилиш участкаси','','Участка бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 421,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автотранспорт бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автотранспорт бўлими','','Бўлим бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 422,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автотранспорт бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автотранспорт бўлими','','Диспетчер','Саноат/ишлаб чиқариш','Доимий',1,1,'4',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 423,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автотранспорт бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автотранспорт бўлими','','Йўл ҳаракати хавфсизлиги муҳандиси','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 424,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Автотранспорт бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Автотранспорт бўлими','','Механик','Саноат/ишлаб чиқариш','Доимий',2,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 425,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Арматура цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Арматура цехи','','Уста','Саноат/ишлаб чиқариш','Доимий',1,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 426,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Арматура цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Арматура цехи','','Ҳисобчи','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 427,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Арматура цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Арматура цехи','','Цех бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 428,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Арматура цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Арматура цехи','','Цех бошлиғи ўринбосари','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 429,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальтбетон ишлаб чиқариш ва тақсимлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальтбетон ишлаб чиқариш ва тақсимлаш цехи','','Битум бўйича мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 430,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальтбетон ишлаб чиқариш ва тақсимлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальтбетон ишлаб чиқариш ва тақсимлаш цехи','','Бош мутахассис-оператор','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 431,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальтбетон ишлаб чиқариш ва тақсимлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальтбетон ишлаб чиқариш ва тақсимлаш цехи','','Ускуналар бўйича мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 432,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальтбетон ишлаб чиқариш ва тақсимлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальтбетон ишлаб чиқариш ва тақсимлаш цехи','','Ҳисобчи','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 433,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Асфальтбетон ишлаб чиқариш ва тақсимлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Асфальтбетон ишлаб чиқариш ва тақсимлаш цехи','','Цех бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 434,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бетон ишлаб чиқариш ва тақсимлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Бетон ишлаб чиқариш ва тақсимлаш цехи','','Уста','Саноат/ишлаб чиқариш','Доимий',1,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 435,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бетон ишлаб чиқариш ва тақсимлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Бетон ишлаб чиқариш ва тақсимлаш цехи','','Ҳисобчи','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 436,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бетон ишлаб чиқариш ва тақсимлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Бетон ишлаб чиқариш ва тақсимлаш цехи','','Цех бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 437,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия ҳисоби ва ҳисоботи шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия ҳисоби ва ҳисоботи шуъбаси','','Бош мутахассис',NULL,'Доимий',2,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 438,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия ҳисоби ва ҳисоботи шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия ҳисоби ва ҳисоботи шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 439,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Бухгалтерия ҳисоби ва ҳисоботи шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Бухгалтерия ҳисоби ва ҳисоботи шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 440,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Геодезия ва топография бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Геодезия ва топография бўлими','','Бош мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 441,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Геодезия ва топография бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Геодезия ва топография бўлими','','Бўлим бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 442,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Геодезия ва топография бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Геодезия ва топография бўлими','','Етакчи мутахассис','Саноат/ишлаб чиқариш','Доимий',2,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 443,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Диагностика шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Диагностика шуъбаси','','Бош мутахассис',NULL,'Доимий',2,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 444,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Диагностика шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Диагностика шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 445,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Диагностика шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Диагностика шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 446,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ёқилғи-мойлаш маҳсулотлари таъминоти бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ёқилғи-мойлаш маҳсулотлари таъминоти бўлими','','Бўлим бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 447,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ёқилғи-мойлаш маҳсулотлари таъминоти бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ёқилғи-мойлаш маҳсулотлари таъминоти бўлими','','Оператор','Саноат/ишлаб чиқариш','Доимий',1,1,'5',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 448,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ёрдамчи диагностика бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ёрдамчи диагностика бўлими','','Бош мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 449,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ёрдамчи диагностика бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ёрдамчи диагностика бўлими','','Етакчи мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 450,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ижро интизоми ва мурожаатлар билан ишлаш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Ижро интизоми ва мурожаатлар билан ишлаш шуъбаси','','Бош мутахассис',NULL,'Доимий',1,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 451,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ижро интизоми ва мурожаатлар билан ишлаш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Ижро интизоми ва мурожаатлар билан ишлаш шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 452,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Инсон ресурсларини ривожлантириш ва бошқариш' ORDER BY d.id DESC LIMIT 1),b.id,'Инсон ресурсларини ривожлантириш ва бошқариш','','Бош мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 453,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Инсон ресурсларини ривожлантириш ва бошқариш' ORDER BY d.id DESC LIMIT 1),b.id,'Инсон ресурсларини ривожлантириш ва бошқариш','','Етакчи мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 454,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Инсон ресурсларини ривожлантириш ва бошқариш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Инсон ресурсларини ривожлантириш ва бошқариш шуъбаси','','Бош мутахассис',NULL,'Доимий',1,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 455,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Инсон ресурсларини ривожлантириш ва бошқариш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Инсон ресурсларини ривожлантириш ва бошқариш шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 456,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ишлаб чиқариш-техник бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ишлаб чиқариш-техник бўлими','','Бош мутахассис','Саноат/ишлаб чиқариш','Доимий',2,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 457,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ишлаб чиқариш-техник бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ишлаб чиқариш-техник бўлими','','Етакчи мутахассис','Саноат/ишлаб чиқариш','Доимий',2,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 458,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ишлаб чиқаришни буғ билан таъминлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Ишлаб чиқаришни буғ билан таъминлаш цехи','','Уста','Саноат/ишлаб чиқариш','Доимий',2,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 459,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ишлаб чиқаришни буғ билан таъминлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Ишлаб чиқаришни буғ билан таъминлаш цехи','','Цех бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 460,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ишлаб чиқаришни технологик мувофиқлаштириш ва назорат қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ишлаб чиқаришни технологик мувофиқлаштириш ва назорат қилиш бўлими','','1-тоифали муҳандис-технолог','Саноат/ишлаб чиқариш','Доимий',1,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 461,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ишлаб чиқаришни технологик мувофиқлаштириш ва назорат қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ишлаб чиқаришни технологик мувофиқлаштириш ва назорат қилиш бўлими','','Бош технолог','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 462,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ишлаб чиқаришни технологик мувофиқлаштириш ва назорат қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ишлаб чиқаришни технологик мувофиқлаштириш ва назорат қилиш бўлими','','Етакчи муҳандис-технолог','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 463,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ишлаб чиқаришни технологик мувофиқлаштириш ва назорат қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Ишлаб чиқаришни технологик мувофиқлаштириш ва назорат қилиш бўлими','','Метрология бўйича 2-тоифали муҳандис','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 464,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Компрессор цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Компрессор цехи','','Компрессор станцияси бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 465,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Конструкторлар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Конструкторлар бўлими','','Бош конструктор','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 466,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Конструкторлар бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Конструкторлар бўлими','','Бош мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 467,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Кўприк ва сунъий иншоотларни лойиҳалаштириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Кўприк ва сунъий иншоотларни лойиҳалаштириш шуъбаси','','Бош мутахассис',NULL,'Доимий',2,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 468,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Кўприк ва сунъий иншоотларни лойиҳалаштириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Кўприк ва сунъий иншоотларни лойиҳалаштириш шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 469,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Кўприк ва сунъий иншоотларни лойиҳалаштириш шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Кўприк ва сунъий иншоотларни лойиҳалаштириш шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 470,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қолиплар ва дастгоҳларни таъмирлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Қолиплар ва дастгоҳларни таъмирлаш цехи','','Уста','Саноат/ишлаб чиқариш','Доимий',1,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 471,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қолиплар ва дастгоҳларни таъмирлаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Қолиплар ва дастгоҳларни таъмирлаш цехи','','Цех бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 472,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қолиплаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Қолиплаш цехи','','Механик','Саноат/ишлаб чиқариш','Доимий',2,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 473,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қолиплаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Қолиплаш цехи','','Уста','Саноат/ишлаб чиқариш','Доимий',3,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 474,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қолиплаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Қолиплаш цехи','','Ҳисобчи','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 475,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қолиплаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Қолиплаш цехи','','Цех бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 476,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қолиплаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Қолиплаш цехи','','Цех бошлиғи ўринбосари','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 477,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Қўриқлаш хизмати' ORDER BY d.id DESC LIMIT 1),b.id,'Қўриқлаш хизмати','','Қўриқлаш хизмати бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 478,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Лойиҳалаштириш ва дизайн бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Лойиҳалаштириш ва дизайн бўлими','','Бош мутахассис','Саноат/ишлаб чиқариш','Доимий',2,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 479,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Лойиҳалаштириш ва дизайн бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Лойиҳалаштириш ва дизайн бўлими','','Бўлим бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 480,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Лойиҳалаштириш ва дизайн бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Лойиҳалаштириш ва дизайн бўлими','','Етакчи мутахассис','Саноат/ишлаб чиқариш','Доимий',2,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 481,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Марказий лаборатория' ORDER BY d.id DESC LIMIT 1),b.id,'Марказий лаборатория','','Бош мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 482,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Марказий лаборатория' ORDER BY d.id DESC LIMIT 1),b.id,'Марказий лаборатория','','Етакчи мутахассис','Саноат/ишлаб чиқариш','Доимий',3,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 483,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Марказий лаборатория' ORDER BY d.id DESC LIMIT 1),b.id,'Марказий лаборатория','','Марказий лаборатория бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 484,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Материаллар, иш ҳақи ҳисоби ва ҳисоботи бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Материаллар, иш ҳақи ҳисоби ва ҳисоботи бўлими','','Бош мутахассис','Саноат/ишлаб чиқариш','Доимий',3,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 485,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Материаллар, иш ҳақи ҳисоби ва ҳисоботи бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Материаллар, иш ҳақи ҳисоби ва ҳисоботи бўлими','','Етакчи мутахассис','Саноат/ишлаб чиқариш','Доимий',3,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 486,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Махсус кийимларни комплекс ишлаб чиқариш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Махсус кийимларни комплекс ишлаб чиқариш цехи','','Бичувчи','Саноат/ишлаб чиқариш','Доимий',1,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 487,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Махсус кийимларни комплекс ишлаб чиқариш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Махсус кийимларни комплекс ишлаб чиқариш цехи','','Цех бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 488,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация ва энергетика шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация ва энергетика шуъбаси','','Бош энергетик',NULL,'Доимий',1,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 489,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация ва энергетика шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация ва энергетика шуъбаси','','Фуқаро муҳофазаси бўйича бош мутахассис',NULL,'Доимий',1,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 490,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Механизация ва энергетика шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Механизация ва энергетика шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 491,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Меҳнат муҳофазаси ва техника хавфсизлиги бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Меҳнат муҳофазаси ва техника хавфсизлиги бўлими','','Бош мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 492,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Меҳнат муҳофазаси ва техника хавфсизлиги бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Меҳнат муҳофазаси ва техника хавфсизлиги бўлими','','Бўлим бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 493,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Моддий-техник таъминот бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Моддий-техник таъминот бўлими','','Бош мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 494,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Моддий-техник таъминот бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Моддий-техник таъминот бўлими','','Бўлим бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 495,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Моддий-техник таъминот бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Моддий-техник таъминот бўлими','','Етакчи мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 496,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт ва шартномалар шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт ва шартномалар шуъбаси','','Бош мутахассис',NULL,'Доимий',2,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 497,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт ва шартномалар шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт ва шартномалар шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 498,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Молия-иқтисодиёт ва шартномалар шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Молия-иқтисодиёт ва шартномалар шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 499,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Мониторинг ва йиғма таҳлил шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Мониторинг ва йиғма таҳлил шуъбаси','','Бош мутахассис',NULL,'Доимий',1,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 500,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Мониторинг ва йиғма таҳлил шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Мониторинг ва йиғма таҳлил шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 501,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Мониторинг ва йиғма таҳлил шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Мониторинг ва йиғма таҳлил шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 502,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Омборхона хўжалиги' ORDER BY d.id DESC LIMIT 1),b.id,'Омборхона хўжалиги','','Марказий омборхона мудири','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 503,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Бош юрисконсульт',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 504,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор',NULL,'Доимий',1,1,'15',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 505,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор ўринбосари',NULL,'Доимий',1,1,'14',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 506,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директор ўринбосари — бош муҳандис',NULL,'Доимий',1,1,'14',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 507,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Директорнинг саноат-ишлаб чиқариш бўйича ўринбосари',NULL,'Доимий',1,1,'14',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 508,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Ички аудит бўйича бош мутахассис',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 509,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Қурилиш ишлари бўйича директор ўринбосари','Саноат/ишлаб чиқариш','Доимий',1,1,'13',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 510,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Махсус ишлар бўйича бош мутахассис',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 511,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Раҳбарият' ORDER BY d.id DESC LIMIT 1),b.id,'Раҳбарият','','Экология ва атроф-муҳитни муҳофаза қилиш бўйича бош мутахассис','Саноат/ишлаб чиқариш','Доимий',1,1,'9',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 512,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Саноат ва маркетинг шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Саноат ва маркетинг шуъбаси','','Бош мутахассис',NULL,'Доимий',1,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 513,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Саноат ва маркетинг шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Саноат ва маркетинг шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 514,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Саноат ва маркетинг шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Саноат ва маркетинг шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 515,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сифат назорати шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Сифат назорати шуъбаси','','Бош мутахассис',NULL,'Доимий',1,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 516,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сифат назорати шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Сифат назорати шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 517,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Сифат назорати шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Сифат назорати шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 518,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тайёр маҳсулотларни реализация қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Тайёр маҳсулотларни реализация қилиш бўлими','','Уста','Саноат/ишлаб чиқариш','Доимий',2,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 519,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тайёр маҳсулотларни реализация қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Тайёр маҳсулотларни реализация қилиш бўлими','','Уста (бетонга ишлов бериш бўйича)','Саноат/ишлаб чиқариш','Доимий',1,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 520,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тайёр маҳсулотларни реализация қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Тайёр маҳсулотларни реализация қилиш бўлими','','Уста (реализатор)','Саноат/ишлаб чиқариш','Доимий',1,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 521,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тайёр маҳсулотларни реализация қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Тайёр маҳсулотларни реализация қилиш бўлими','','Ҳисобчи','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 522,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тайёр маҳсулотларни реализация қилиш бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Тайёр маҳсулотларни реализация қилиш бўлими','','Цех бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 523,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тиббиёт бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Тиббиёт бўлими','','Ҳамшира','Саноат/ишлаб чиқариш','Доимий',2,1,'3',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 524,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тош майдалаш ва саралаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Тош майдалаш ва саралаш цехи','','Механик','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 525,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тош майдалаш ва саралаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Тош майдалаш ва саралаш цехи','','Уста','Саноат/ишлаб чиқариш','Доимий',2,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 526,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Тош майдалаш ва саралаш цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Тош майдалаш ва саралаш цехи','','Цех бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 527,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Харидлар ва шартномалар шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Харидлар ва шартномалар шуъбаси','','Бош мутахассис',NULL,'Доимий',1,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 528,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Харидлар ва шартномалар шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Харидлар ва шартномалар шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 529,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Харидлар ва шартномалар шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Харидлар ва шартномалар шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 530,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Бригадир','Саноат/ишлаб чиқариш','Доимий',1,1,'5',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 531,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Хўжалик бўлими' ORDER BY d.id DESC LIMIT 1),b.id,'Хўжалик бўлими','','Бўлим бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'7',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 532,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳажм усули ва ишлаб чиқариш-техник шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳажм усули ва ишлаб чиқариш-техник шуъбаси','','Бош мутахассис',NULL,'Доимий',2,1,'11',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 533,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳажм усули ва ишлаб чиқариш-техник шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳажм усули ва ишлаб чиқариш-техник шуъбаси','','Етакчи мутахассис',NULL,'Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 534,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Ҳажм усули ва ишлаб чиқариш-техник шуъбаси' ORDER BY d.id DESC LIMIT 1),b.id,'Ҳажм усули ва ишлаб чиқариш-техник шуъбаси','','Шуъба бошлиғи',NULL,'Доимий',1,1,'12',NULL,NULL,'2026-02-01','Штат жадвали','Кластер.pdf','1–2','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 535,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Электр ва кўтариш ускуналари цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Электр ва кўтариш ускуналари цехи','','Уста','Саноат/ишлаб чиқариш','Доимий',1,1,'8',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO app_staff_positions
(source_row_id,organization_id,department_id,import_batch_id,department_name,subunit_name,title,employee_category,position_status,headcount_units,fte_rate,grade,coefficient,monthly_fund,effective_from,document_type,source_file,source_page,data_status,note,active)
SELECT 536,o.id,(SELECT d.id FROM app_departments d WHERE d.organization_id=o.id AND d.name='Электр ва кўтариш ускуналари цехи' ORDER BY d.id DESC LIMIT 1),b.id,'Электр ва кўтариш ускуналари цехи','','Цех бошлиғи','Саноат/ишлаб чиқариш','Доимий',1,1,'10',NULL,NULL,'2026-02-01','Штат жадвали','кластер 2.pdf','1–3','Амалдаги ҳужжатдан','',1
FROM app_organizations o CROSS JOIN app_staff_import_batches b
WHERE o.tax_id='200836188' AND b.checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3' LIMIT 1;
--> statement-breakpoint
UPDATE app_staff_import_batches
SET imported_organizations=(SELECT COUNT(*) FROM app_organizations WHERE tax_id IS NOT NULL),
    imported_positions=(SELECT COUNT(*) FROM app_staff_positions WHERE import_batch_id=app_staff_import_batches.id),
    rejected_rows=536-(SELECT COUNT(*) FROM app_staff_positions WHERE import_batch_id=app_staff_import_batches.id)
WHERE checksum='44272e90f48a67df0bb3a8bfa238c04f5fbc741344c4ec3c71815564c91473f3';
