import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const { computeVirtualRange } = await import('../app/_components/ui/virtual-range.ts');
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('range covers the viewport plus overscan, with exact spacer heights', () => {
  const range = computeVirtualRange({ count: 1000, rowHeight: 50, viewportTop: 5000, viewportHeight: 500, overscan: 5 });
  assert.deepEqual(range, { start: 95, end: 115, padTop: 95 * 50, padBottom: (1000 - 115) * 50 });
  // Rendered + spacers always equal the full list height.
  assert.equal(range.padTop + (range.end - range.start) * 50 + range.padBottom, 1000 * 50);
});

test('range clamps at the edges and handles a list below the fold', () => {
  assert.deepEqual(computeVirtualRange({ count: 1000, rowHeight: 50, viewportTop: -800, viewportHeight: 900, overscan: 3 }),
    { start: 0, end: 5, padTop: 0, padBottom: 995 * 50 });
  const bottom = computeVirtualRange({ count: 100, rowHeight: 40, viewportTop: 10_000, viewportHeight: 400, overscan: 2 });
  assert.equal(bottom.end, 100);
  assert.equal(bottom.padBottom, 0);
  assert.deepEqual(computeVirtualRange({ count: 0, rowHeight: 40, viewportTop: 0, viewportHeight: 400, overscan: 2 }),
    { start: 0, end: 0, padTop: 0, padBottom: 0 });
});

test('grid ranges start on row boundaries and count rows, not items', () => {
  const range = computeVirtualRange({ count: 241, rowHeight: 80, viewportTop: 800, viewportHeight: 400, overscan: 1, columns: 2 });
  assert.equal(range.start % 2, 0);
  assert.deepEqual(range, { start: 18, end: 32, padTop: 9 * 80, padBottom: (121 - 16) * 80 });
});

test('the focused item stays rendered when scrolled away, within a cap', () => {
  const near = computeVirtualRange({ count: 1000, rowHeight: 50, viewportTop: 5000, viewportHeight: 500, overscan: 5, pinnedIndex: 60 });
  assert.equal(near.start, 60);
  assert.equal(near.padTop, 60 * 50);
  const far = computeVirtualRange({ count: 1000, rowHeight: 50, viewportTop: 45_000, viewportHeight: 500, overscan: 5, pinnedIndex: 3, maxRendered: 200 });
  assert.ok(far.start > 3, 'a far-away focus does not force hundreds of rows to render');
});

test('large lists use the virtual list; table spacers keep row semantics', () => {
  const employees = read('app/_components/admin/employees-page.tsx');
  const staff = read('app/_components/admin/staff-directory-page.tsx');
  const picker = read('app/_components/tasks/people-picker.tsx');
  for (const source of [employees, staff, picker]) assert.match(source, /useVirtualList\(/);
  assert.match(employees, /aria-rowcount=\{visibleEmployees\.length \+ 1\}/);
  assert.match(employees, /<tr aria-hidden="true" style=\{\{ height: tableRows\.padTop \}\}>/);
  assert.match(staff, /aria-rowindex=\{positionRows\.start \+ offset \+ 2\}/);
  assert.doesNotMatch(staff, /setLimit\(\(value\) => value \+ 60\)/, 'organizations are windowed instead of paged by 60');
  // "Select visible" still selects the whole filtered result, not just rendered rows.
  assert.match(picker, /\.\.\.options\.map\(\(employee\) => employee\.id\)/);
});
