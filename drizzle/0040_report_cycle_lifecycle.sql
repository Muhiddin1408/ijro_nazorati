-- Report cycle lifecycle (open → overdue → closed) and a reviewer comment that
-- survives the submitter's draft saves.
ALTER TABLE `app_report_assignments` ADD `review_comment` text DEFAULT '' NOT NULL;
--> statement-breakpoint
-- Until now the reviewer's return reason overwrote the shared comment field.
UPDATE app_report_assignments SET review_comment=comment WHERE status='returned' AND comment!='';
--> statement-breakpoint
ALTER TABLE `app_report_cycles` ADD `closed_at` text;
--> statement-breakpoint
UPDATE app_report_cycles SET
  status=CASE
    WHEN EXISTS (SELECT 1 FROM app_report_assignments a WHERE a.cycle_id=app_report_cycles.id)
     AND NOT EXISTS (SELECT 1 FROM app_report_assignments a WHERE a.cycle_id=app_report_cycles.id AND a.status!='approved') THEN 'closed'
    WHEN deadline_at < strftime('%Y-%m-%dT%H:%M:%fZ','now')
     AND EXISTS (SELECT 1 FROM app_report_assignments a WHERE a.cycle_id=app_report_cycles.id AND a.status NOT IN ('submitted','approved')) THEN 'overdue'
    ELSE 'open' END;
--> statement-breakpoint
UPDATE app_report_cycles SET closed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE status='closed' AND closed_at IS NULL;
