import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('large screens are thin entry points over private modules', () => {
  for (const [entry, maxLines] of [['app/admin-modals.tsx', 40], ['app/chat-page.tsx', 30]]) {
    assert.ok(read(entry).split('\n').length <= maxLines, `${entry} should stay a thin entry point`);
  }
  for (const path of [
    'app/_components/admin/modals/employee-modal.tsx', 'app/_components/admin/modals/role-modal.tsx',
    'app/_components/chat/use-chat-feed.ts', 'app/_components/chat/chat-sidebar.tsx', 'app/_components/chat/group-chat-modal.tsx',
    'app/_components/reports/use-report-sheet.ts', 'app/_components/reports/report-sheet-grid.tsx', 'app/_components/reports/use-report-draft.ts',
  ]) assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
  assert.ok(read('app/_components/reports/report-fill-modal.tsx').split('\n').length < 300);
});

test('shell values come from the dashboard context instead of prop drilling', () => {
  assert.match(read('app/dashboard.tsx'), /<DashboardProvider value=\{\{ actor, alphabet, notify, refresh, run \}\}>/);
  const detail = read('app/_components/tasks/task-detail.tsx');
  assert.match(detail, /useDashboard\(\)/);
  assert.doesNotMatch(detail, /onFailed:|alphabet: Alphabet/);
  assert.match(read('app/_components/tasks/task-modals.tsx'), /useDashboard\(\)\.actor\.id/);
  assert.match(read('app/_components/chat/group-chat-modal.tsx'), /useDashboard\(\)/);
});

test('report confirmation and validation logic lives in hooks', () => {
  const sheet = read('app/_components/reports/use-report-sheet.ts');
  assert.match(sheet, /confirmDialog\(/);
  assert.match(sheet, /cleanReportRows\(/);
  assert.doesNotMatch(read('app/_components/reports/report-fill-modal.tsx'), /confirmDialog|cleanReportRows/);
  const draft = read('app/_components/reports/use-report-draft.ts');
  assert.match(draft, /confirmDialog\(/);
  assert.match(draft, /MAX_TEMPLATE_FILE_BYTES/);
  assert.doesNotMatch(read('app/_components/reports/new-report-modal.tsx'), /confirmDialog/);
});

test('a single toast system: sonner is gone', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.dependencies.sonner, undefined);
  assert.equal(existsSync(new URL('../components/ui/sonner.tsx', import.meta.url)), false);
  for (const path of ['app/research-reports.tsx', 'app/_components/research/project-detail.tsx', 'app/_components/research/research-forms.tsx']) {
    assert.doesNotMatch(read(path), /from "sonner"|toast\./, path);
  }
});
