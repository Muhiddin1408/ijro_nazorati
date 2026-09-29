import { readSourceSync, flat } from './fixtures/source.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const { readJson } = await import('../lib/shared/http.ts');
const { etagMatches, jsonWithEtag } = await import('../lib/shared/etag.ts');
const { random48BitId } = await import('../lib/shared/ids.ts');
const { isEditableRecordStatus } = await import('../lib/shared/statuses.ts');

test('readJson turns non-JSON responses into readable Uzbek errors', async () => {
  const html = () => new Response('<!doctype html><title>502</title>', { status: 502, headers: { 'content-type': 'text/html' } });
  await assert.rejects(readJson(html()), (error) => /Serverda xatolik/.test(error.message) && !/Unexpected token/.test(error.message));
  await assert.rejects(readJson(new Response('<html>', { status: 200 })), /kutilmagan javob/);
  await assert.rejects(readJson(Response.json({ error: 'Topshiriq topilmadi' }, { status: 404 })), /Topshiriq topilmadi/);
  await assert.rejects(
    readJson(Response.json({ validation: { errors: [{ message: 'A' }, { message: 'B' }] } }, { status: 400 })),
    (error) => error.message === 'A\nB',
  );
  assert.deepEqual(await readJson(Response.json({ ok: true })), { ok: true });
  assert.deepEqual(await readJson(new Response(null, { status: 204 })), {});
});

test('jsonWithEtag answers a matching If-None-Match with 304 and no body', async () => {
  const body = { tasks: [1, 2, 3] };
  const first = await jsonWithEtag(new Request('http://x/api/bootstrap'), body);
  assert.equal(first.status, 200);
  const etag = first.headers.get('etag');
  assert.match(etag, /^"[0-9a-f]{32}"$/);
  assert.deepEqual(await first.json(), body);
  const again = await jsonWithEtag(new Request('http://x/api/bootstrap', { headers: { 'if-none-match': etag } }), body);
  assert.equal(again.status, 304);
  assert.equal(await again.text(), '');
  const changed = await jsonWithEtag(new Request('http://x/api/bootstrap', { headers: { 'if-none-match': etag } }), { tasks: [1] });
  assert.equal(changed.status, 200);
});

test('shared id and status helpers', () => {
  for (let index = 0; index < 200; index += 1) {
    const id = random48BitId();
    assert.ok(Number.isSafeInteger(id) && id >= 1 && id < 2 ** 48);
  }
  assert.equal(isEditableRecordStatus('draft'), true);
  assert.equal(isEditableRecordStatus('returned'), true);
  assert.equal(isEditableRecordStatus('submitted'), false);
});

test('bootstrap stays first-screen only; directory and audit load on demand', () => {
  const bootstrap = readSourceSync(new URL('../app/api/bootstrap/route.ts', import.meta.url));
  assert.doesNotMatch(bootstrap, /activeEmployees\(/);
  assert.doesNotMatch(bootstrap, /audit: auditPage/);
  assert.match(bootstrap, /jsonWithEtag\(request/);
  const directory = readSourceSync(new URL('../app/api/bootstrap/employees/route.ts', import.meta.url));
  assert.match(directory, /activeEmployees\(/);
  assert.match(flat(directory), /systemWideDirectory \|\| actor\.permissions\.canManageOrganization \? employee/);
  const dashboard = readSourceSync(new URL('../app/dashboard.tsx', import.meta.url));
  assert.match(dashboard, /EMPLOYEE_PAGES/);
  assert.match(dashboard, /If-None-Match/);
  assert.doesNotMatch(dashboard, /data\.employees/);
});

test('ETag matching tolerates proxy compression suffixes, weak tags and lists', () => {
  const tag = '"0123456789abcdef0123456789abcdef"';
  assert.equal(etagMatches(tag, tag), true);
  assert.equal(etagMatches('"0123456789abcdef0123456789abcdef-gzip"', tag), true);
  assert.equal(etagMatches('W/"0123456789abcdef0123456789abcdef-zstd"', tag), true);
  assert.equal(etagMatches('"other", W/"0123456789abcdef0123456789abcdef"', tag), true);
  assert.equal(etagMatches('*', tag), true);
  assert.equal(etagMatches('"ffff"', tag), false);
  assert.equal(etagMatches(null, tag), false);
});
