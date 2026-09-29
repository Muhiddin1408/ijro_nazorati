-- Derived search index. Every read also checks the live source row and its current permissions.
CREATE VIRTUAL TABLE app_center_search USING fts5(kind UNINDEXED,source_id UNINDEXED,title,body,tokenize='unicode61 remove_diacritics 2',prefix='3 4');
--> statement-breakpoint

INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT r.id*4+1,'record',r.id,r.title,COALESCE(t.name,'') || ' ' || COALESCE(d.name,'') || ' ' || COALESCE(o.name,'') || ' ' || COALESCE(r.period_start,'') || ' ' || COALESCE(r.period_end,'') || ' ' || COALESCE((SELECT group_concat(CAST(v.value AS TEXT),' ') FROM json_each(r.values_json) v JOIN json_each(t.fields_json) f ON json_extract(f.value,'$.code')=v.key WHERE COALESCE(json_extract(f.value,'$.sensitive'),0)<>1 AND json_extract(f.value,'$.type') NOT IN ('file','employee','employees')), '') FROM app_information_records r JOIN app_information_templates t ON t.id=r.template_id JOIN app_information_domains d ON d.id=t.domain_id LEFT JOIN app_organizations o ON o.id=r.organization_id;
--> statement-breakpoint

CREATE TRIGGER app_information_records_search_insert AFTER INSERT ON app_information_records BEGIN
  INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT r.id*4+1,'record',r.id,r.title,COALESCE(t.name,'') || ' ' || COALESCE(d.name,'') || ' ' || COALESCE(o.name,'') || ' ' || COALESCE(r.period_start,'') || ' ' || COALESCE(r.period_end,'') || ' ' || COALESCE((SELECT group_concat(CAST(v.value AS TEXT),' ') FROM json_each(r.values_json) v JOIN json_each(t.fields_json) f ON json_extract(f.value,'$.code')=v.key WHERE COALESCE(json_extract(f.value,'$.sensitive'),0)<>1 AND json_extract(f.value,'$.type') NOT IN ('file','employee','employees')), '') FROM app_information_records r JOIN app_information_templates t ON t.id=r.template_id JOIN app_information_domains d ON d.id=t.domain_id LEFT JOIN app_organizations o ON o.id=r.organization_id WHERE r.id=NEW.id;
END;
--> statement-breakpoint

CREATE TRIGGER app_information_records_search_update AFTER UPDATE ON app_information_records BEGIN
  DELETE FROM app_center_search WHERE rowid=OLD.id*4+1;
  INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT r.id*4+1,'record',r.id,r.title,COALESCE(t.name,'') || ' ' || COALESCE(d.name,'') || ' ' || COALESCE(o.name,'') || ' ' || COALESCE(r.period_start,'') || ' ' || COALESCE(r.period_end,'') || ' ' || COALESCE((SELECT group_concat(CAST(v.value AS TEXT),' ') FROM json_each(r.values_json) v JOIN json_each(t.fields_json) f ON json_extract(f.value,'$.code')=v.key WHERE COALESCE(json_extract(f.value,'$.sensitive'),0)<>1 AND json_extract(f.value,'$.type') NOT IN ('file','employee','employees')), '') FROM app_information_records r JOIN app_information_templates t ON t.id=r.template_id JOIN app_information_domains d ON d.id=t.domain_id LEFT JOIN app_organizations o ON o.id=r.organization_id WHERE r.id=NEW.id;
END;
--> statement-breakpoint

CREATE TRIGGER app_information_records_search_delete AFTER DELETE ON app_information_records BEGIN
  DELETE FROM app_center_search WHERE rowid=OLD.id*4+1;
END;
--> statement-breakpoint

INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT t.id*4+2,'template',t.id,t.name,COALESCE(t.description,'') || ' ' || d.name || ' ' || COALESCE((SELECT group_concat(json_extract(f.value,'$.label'),' ') FROM json_each(t.fields_json) f WHERE COALESCE(json_extract(f.value,'$.sensitive'),0)<>1),'') FROM app_information_templates t JOIN app_information_domains d ON d.id=t.domain_id;
--> statement-breakpoint

CREATE TRIGGER app_information_templates_search_insert AFTER INSERT ON app_information_templates BEGIN
  INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT t.id*4+2,'template',t.id,t.name,COALESCE(t.description,'') || ' ' || d.name || ' ' || COALESCE((SELECT group_concat(json_extract(f.value,'$.label'),' ') FROM json_each(t.fields_json) f WHERE COALESCE(json_extract(f.value,'$.sensitive'),0)<>1),'') FROM app_information_templates t JOIN app_information_domains d ON d.id=t.domain_id WHERE t.id=NEW.id;
END;
--> statement-breakpoint

CREATE TRIGGER app_information_templates_search_update AFTER UPDATE ON app_information_templates BEGIN
  DELETE FROM app_center_search WHERE rowid=OLD.id*4+2;
  INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT t.id*4+2,'template',t.id,t.name,COALESCE(t.description,'') || ' ' || d.name || ' ' || COALESCE((SELECT group_concat(json_extract(f.value,'$.label'),' ') FROM json_each(t.fields_json) f WHERE COALESCE(json_extract(f.value,'$.sensitive'),0)<>1),'') FROM app_information_templates t JOIN app_information_domains d ON d.id=t.domain_id WHERE t.id=NEW.id;
  DELETE FROM app_center_search WHERE rowid IN (SELECT id*4+1 FROM app_information_records WHERE template_id=NEW.id);
  INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT r.id*4+1,'record',r.id,r.title,COALESCE(t.name,'') || ' ' || COALESCE(d.name,'') || ' ' || COALESCE(o.name,'') || ' ' || COALESCE(r.period_start,'') || ' ' || COALESCE(r.period_end,'') || ' ' || COALESCE((SELECT group_concat(CAST(v.value AS TEXT),' ') FROM json_each(r.values_json) v JOIN json_each(t.fields_json) f ON json_extract(f.value,'$.code')=v.key WHERE COALESCE(json_extract(f.value,'$.sensitive'),0)<>1 AND json_extract(f.value,'$.type') NOT IN ('file','employee','employees')), '') FROM app_information_records r JOIN app_information_templates t ON t.id=r.template_id JOIN app_information_domains d ON d.id=t.domain_id LEFT JOIN app_organizations o ON o.id=r.organization_id WHERE r.template_id=NEW.id;
END;
--> statement-breakpoint

CREATE TRIGGER app_information_templates_search_delete AFTER DELETE ON app_information_templates BEGIN
  DELETE FROM app_center_search WHERE rowid=OLD.id*4+2;
END;
--> statement-breakpoint

INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT p.id*4+3,'research',p.id,p.title,p.code || ' ilmiy tadqiqot innovatsiya loyiha ' || p.area || ' ' || p.problem || ' ' || p.objective || ' ' || p.expected_result || ' ' || COALESCE(p.novelty,'') || ' ' || p.start_date || ' ' || p.end_date || ' ' || COALESCE(o.name,'') FROM app_research_projects p LEFT JOIN app_organizations o ON o.id=p.executor_organization_id;
--> statement-breakpoint

CREATE TRIGGER app_research_projects_search_insert AFTER INSERT ON app_research_projects BEGIN
  INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT p.id*4+3,'research',p.id,p.title,p.code || ' ilmiy tadqiqot innovatsiya loyiha ' || p.area || ' ' || p.problem || ' ' || p.objective || ' ' || p.expected_result || ' ' || COALESCE(p.novelty,'') || ' ' || p.start_date || ' ' || p.end_date || ' ' || COALESCE(o.name,'') FROM app_research_projects p LEFT JOIN app_organizations o ON o.id=p.executor_organization_id WHERE p.id=NEW.id;
END;
--> statement-breakpoint

CREATE TRIGGER app_research_projects_search_update AFTER UPDATE ON app_research_projects BEGIN
  DELETE FROM app_center_search WHERE rowid=OLD.id*4+3;
  INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT p.id*4+3,'research',p.id,p.title,p.code || ' ilmiy tadqiqot innovatsiya loyiha ' || p.area || ' ' || p.problem || ' ' || p.objective || ' ' || p.expected_result || ' ' || COALESCE(p.novelty,'') || ' ' || p.start_date || ' ' || p.end_date || ' ' || COALESCE(o.name,'') FROM app_research_projects p LEFT JOIN app_organizations o ON o.id=p.executor_organization_id WHERE p.id=NEW.id;
END;
--> statement-breakpoint

CREATE TRIGGER app_research_projects_search_delete AFTER DELETE ON app_research_projects BEGIN
  DELETE FROM app_center_search WHERE rowid=OLD.id*4+3;
END;
--> statement-breakpoint

CREATE TRIGGER app_information_domains_search_update AFTER UPDATE OF name ON app_information_domains BEGIN
  DELETE FROM app_center_search WHERE rowid IN (SELECT id*4+2 FROM app_information_templates WHERE domain_id=NEW.id);
  INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT t.id*4+2,'template',t.id,t.name,COALESCE(t.description,'') || ' ' || d.name || ' ' || COALESCE((SELECT group_concat(json_extract(f.value,'$.label'),' ') FROM json_each(t.fields_json) f WHERE COALESCE(json_extract(f.value,'$.sensitive'),0)<>1),'') FROM app_information_templates t JOIN app_information_domains d ON d.id=t.domain_id WHERE t.domain_id=NEW.id;
  DELETE FROM app_center_search WHERE rowid IN (SELECT r.id*4+1 FROM app_information_records r JOIN app_information_templates t ON t.id=r.template_id WHERE t.domain_id=NEW.id);
  INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT r.id*4+1,'record',r.id,r.title,COALESCE(t.name,'') || ' ' || COALESCE(d.name,'') || ' ' || COALESCE(o.name,'') || ' ' || COALESCE(r.period_start,'') || ' ' || COALESCE(r.period_end,'') || ' ' || COALESCE((SELECT group_concat(CAST(v.value AS TEXT),' ') FROM json_each(r.values_json) v JOIN json_each(t.fields_json) f ON json_extract(f.value,'$.code')=v.key WHERE COALESCE(json_extract(f.value,'$.sensitive'),0)<>1 AND json_extract(f.value,'$.type') NOT IN ('file','employee','employees')), '') FROM app_information_records r JOIN app_information_templates t ON t.id=r.template_id JOIN app_information_domains d ON d.id=t.domain_id LEFT JOIN app_organizations o ON o.id=r.organization_id WHERE t.domain_id=NEW.id;
END;
--> statement-breakpoint

CREATE TRIGGER app_organizations_center_search_update AFTER UPDATE OF name ON app_organizations BEGIN
  DELETE FROM app_center_search WHERE rowid IN (SELECT id*4+1 FROM app_information_records WHERE organization_id=NEW.id);
  INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT r.id*4+1,'record',r.id,r.title,COALESCE(t.name,'') || ' ' || COALESCE(d.name,'') || ' ' || COALESCE(o.name,'') || ' ' || COALESCE(r.period_start,'') || ' ' || COALESCE(r.period_end,'') || ' ' || COALESCE((SELECT group_concat(CAST(v.value AS TEXT),' ') FROM json_each(r.values_json) v JOIN json_each(t.fields_json) f ON json_extract(f.value,'$.code')=v.key WHERE COALESCE(json_extract(f.value,'$.sensitive'),0)<>1 AND json_extract(f.value,'$.type') NOT IN ('file','employee','employees')), '') FROM app_information_records r JOIN app_information_templates t ON t.id=r.template_id JOIN app_information_domains d ON d.id=t.domain_id LEFT JOIN app_organizations o ON o.id=r.organization_id WHERE r.organization_id=NEW.id;
  DELETE FROM app_center_search WHERE rowid IN (SELECT id*4+3 FROM app_research_projects WHERE executor_organization_id=NEW.id);
  INSERT INTO app_center_search(rowid,kind,source_id,title,body) SELECT p.id*4+3,'research',p.id,p.title,p.code || ' ilmiy tadqiqot innovatsiya loyiha ' || p.area || ' ' || p.problem || ' ' || p.objective || ' ' || p.expected_result || ' ' || COALESCE(p.novelty,'') || ' ' || p.start_date || ' ' || p.end_date || ' ' || COALESCE(o.name,'') FROM app_research_projects p LEFT JOIN app_organizations o ON o.id=p.executor_organization_id WHERE p.executor_organization_id=NEW.id;
END;
