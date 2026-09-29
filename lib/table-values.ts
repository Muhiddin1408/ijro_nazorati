/** XLSX treats arrays as special cell tuples, so only pass scalar values. */
export function spreadsheetCell(value: unknown): string | number | boolean {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((item) => String(item ?? "")).join(", ");
  if (typeof value === "number") return Number.isFinite(value) ? value : "";
  if (typeof value === "boolean" || typeof value === "string") return value;
  return JSON.stringify(value);
}

export function embeddedRecordTitle(record: { title: string; values: Record<string, unknown> }, field: string | null) {
  const name = field ? record.values[field] : null;
  return name != null && String(name).trim() ? String(name) : record.title;
}

export function ratioOfSums(rows: Array<{ values: Record<string, unknown> }>, formula: string): number | null {
  const match = /^SUM\(([a-zA-Z0-9_]+)\)\s*\/\s*SUM\(([a-zA-Z0-9_]+)\)$/.exec(formula);
  if (!match || !rows.length) return null;
  let numerator = 0;
  let denominator = 0;
  for (const row of rows) {
    const top = row.values[match[1]], bottom = row.values[match[2]];
    // An incomplete pair invalidates this total instead of mixing coverage.
    if (top == null || bottom == null || top === "" || bottom === "" || !Number.isFinite(Number(top)) || !Number.isFinite(Number(bottom))) return null;
    numerator += Number(top);
    denominator += Number(bottom);
  }
  return denominator > 0 ? numerator / denominator : null;
}
