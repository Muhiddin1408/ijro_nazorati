ALTER TABLE app_report_assignments ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
--> statement-breakpoint
ALTER TABLE app_report_assignments ADD COLUMN mutation_key TEXT NOT NULL DEFAULT '';
