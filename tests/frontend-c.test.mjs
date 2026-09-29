import { readSourceSync, readAllCss } from './fixtures/source.mjs';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('task review helper recognises task- and assignment-level review status', async () => {
  const { isTaskAwaitingReview, TASK_REVIEW_STATUS } = await import('../lib/shared/statuses.ts');
  assert.equal(isTaskAwaitingReview({ status: TASK_REVIEW_STATUS, assignments: [] }), true);
  assert.equal(isTaskAwaitingReview({ status: 'Jarayonda', assignments: [{ status: TASK_REVIEW_STATUS }] }), true);
  assert.equal(isTaskAwaitingReview({ status: 'Jarayonda', assignments: [{ status: 'Faol' }] }), false);
  assert.equal(isTaskAwaitingReview({ status: 'Bajarildi' }), false);
});

test('chat surfaces background failures and connection state instead of swallowing them', async () => {
  const chat = readSourceSync(new URL('../app/chat-page.tsx', import.meta.url));
  assert.doesNotMatch(chat, /\.catch\(\(\) => undefined\)/, 'background refresh errors must not be swallowed');
  assert.match(chat, /error instanceof SessionExpiredError\)\s*\{\s*window\.location\.reload\(\)/);
  assert.match(chat, /className="chat-connection" role="status" aria-live="polite"/);
  assert.match(chat, /Qayta ulanmoqda…/);
  assert.match(chat, /className="chat-background-error" role="status" aria-live="polite"/);
});

test('tasks page filters tasks in review and highlights those awaiting the issuer', async () => {
  const page = await read('app/tasks-page.tsx');
  assert.match(page, /(?:\{t\("Tekshiruvda"\)\}|Tekshiruvda) <em>\{reviewTasks\.length\}<\/em>/);
  assert.match(page, /Qabulingizni kutmoqda/);
  assert.match(page, /task\.creator\?\.id === actorId && isTaskAwaitingReview\(task\)/);
  assert.match(page, /\{loadingMore \? <TaskSkeletonCards \/> : null\}/);
});

test('audit list shows skeleton rows while loading and editable report rows use stable keys', async () => {
  const audit = await read('app/audit-page.tsx');
  assert.match(audit, /audit-row skeleton-row/);
  assert.match(audit, /items\.length === 0 && !loading/);
  const modal = readSourceSync(new URL('../app/_components/reports/new-report-modal.tsx', import.meta.url));
  assert.doesNotMatch(modal, /key=\{index\}/);
  assert.match(modal, /key=\{column\.rowKey\}/);
  assert.match(modal, /key=\{recipient\.rowKey\}/);
  assert.match(modal, /columns: columns\.map\(\(\{ rowKey, \.\.\.column \}\)/, 'client-only keys are stripped before submit');
});

test('theme storage is guarded and unused docx dependency is gone', async () => {
  const toggle = await read('app/theme-mode-toggle.tsx');
  assert.equal((toggle.match(/try \{/g) ?? []).length, 2);
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.dependencies.docx, undefined);
  const css = await readAllCss();
  assert.match(css, /@keyframes skeleton-pulse/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{ \.skeleton-line/);
});
