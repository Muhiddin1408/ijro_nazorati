// Test fixtures replace the untracked private employee seed with synthetic rows
// of the same shape, applied right after the schema migration it belongs to.
export const SYNTHETIC_EMPLOYEE_SEED = '../tests/fixtures/0016_synthetic_employees.sql';

/** Takes sorted drizzle/ file names; names are resolved relative to drizzle/. */
export function withSyntheticSeed(names) {
  const index = names.findIndex((name) => name.startsWith('0016_'));
  if (index < 0) return names;
  return [...names.slice(0, index + 1), SYNTHETIC_EMPLOYEE_SEED, ...names.slice(index + 1)];
}
