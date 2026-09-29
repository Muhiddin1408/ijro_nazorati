import type { SheetRow } from "./report-sheet";

export const REPORT_EDITABLE_SQL = "status IN ('new','collecting','returned','draft')";

export function replaceReportRows(db: D1Database, assignmentId: number, mutationKey: string, rows: SheetRow[]) {
  const guard = "EXISTS (SELECT 1 FROM app_report_assignments WHERE id=? AND mutation_key=?)";
  const statements = [db.prepare(`DELETE FROM app_report_data_rows WHERE assignment_id=? AND ${guard}`).bind(assignmentId, assignmentId, mutationKey)];
  for (let offset = 0; offset < rows.length; offset += 25) {
    const chunk = rows.slice(offset, offset + 25);
    statements.push(db.prepare(`INSERT INTO app_report_data_rows (assignment_id,row_order,values_json)
      SELECT ?,CAST(key AS INTEGER)+?,value FROM json_each(?) WHERE ${guard}`)
      .bind(assignmentId, offset, JSON.stringify(chunk), assignmentId, mutationKey));
  }
  return statements;
}

export function reportMutationAudit(db: D1Database, actorId: number, assignmentId: number, mutationKey: string, action: string, detail: unknown = {}) {
  return db.prepare(`INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json)
    SELECT ?,?,'report_assignment',?,? WHERE EXISTS (SELECT 1 FROM app_report_assignments WHERE id=? AND mutation_key=?)`)
    .bind(actorId, action, assignmentId, JSON.stringify(detail), assignmentId, mutationKey);
}
