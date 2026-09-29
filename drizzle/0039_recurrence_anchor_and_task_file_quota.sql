-- Monthly/quarterly recurring tasks return to the original day of month
-- (31 Jan → 28 Feb → 31 Mar) instead of drifting to the shortest month.
ALTER TABLE app_tasks ADD COLUMN recurrence_anchor_day integer;
--> statement-breakpoint
-- Backfill from the deadline's day in Asia/Tashkent (UTC+5, no DST).
UPDATE app_tasks
   SET recurrence_anchor_day = CAST(strftime('%d', datetime(deadline_iso, '+5 hours')) AS integer)
 WHERE recurring = 1 AND deadline_iso IS NOT NULL AND recurrence_anchor_day IS NULL;
--> statement-breakpoint
-- Task attachment quota bookkeeping: per-employee uploads are summed from here.
CREATE INDEX IF NOT EXISTS app_attachments_uploader_created_idx
  ON app_attachments (uploaded_by_employee_id, created_at);
