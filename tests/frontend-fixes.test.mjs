import { readSourceSync } from './fixtures/source.mjs';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('dashboard: alphabet survives background errors, safe storage, announced toasts, checked logout, refresh banner', async () => {
  const dashboard = await read('app/dashboard.tsx');
  // Readiness depends on loading/data only, never on a background loadError.
  // Localization is render-time (lib/i18n); the DOM-mutating renderer is gone, so
  // background errors can no longer switch the alphabet off.
  assert.doesNotMatch(dashboard, /useAlphabetRenderer/);
  assert.match(dashboard, /<I18nProvider locale=\{locale\}>/);
  assert.doesNotMatch(dashboard, /window\.localStorage/);
  assert.match(dashboard, /window\.clearTimeout\(toastTimer\.current\)/);
  assert.equal((dashboard.match(/role=\{toast\.tone === "error" \? "alert" : "status"\}/g) ?? []).length, 2);
  assert.doesNotMatch(dashboard, /await fetch\("\/api\/auth\/logout", \{ method: "POST" \}\);\s*window\.location\.reload\(\)/);
  assert.match(dashboard, /refresh-error-banner/);
});

test('identifiers are never transliterated and closed tasks hide delete/forward', async () => {
  const [modals, employees, pages, detail] = await Promise.all([
    Promise.resolve(readSourceSync(new URL('../app/admin-modals.tsx', import.meta.url))), read('app/_components/admin/employees-page.tsx'), read('app/admin-pages.tsx'), read('app/_components/tasks/task-detail.tsx'),
  ]);
  assert.match(modals, /<code data-alphabet-static="true">\/start \{state\.link\.token\}<\/code>/);
  assert.equal((employees.match(/<span data-alphabet-static="true">@\{employee\.username\}<\/span>/g) ?? []).length, 2);
  assert.match(pages, /<span data-alphabet-static="true">@\{actor\.username\}<\/span>/);
  assert.match(detail, /const locked = closed \|\|/);
  assert.match(detail, /!locked && \(actor\.permissions\.canUpdateAnyTask/);
  assert.match(detail, /actor\.permissions\.canCreateTask && !locked/);
});

test('meetings page pages through a busy week and offers load-more', async () => {
  const meetings = await read('app/meetings-page.tsx');
  assert.match(meetings, /AUTO_PAGES/);
  assert.match(meetings, /nextOffset != null \?/);
  assert.match(meetings, /Yana yuklash/);
});
