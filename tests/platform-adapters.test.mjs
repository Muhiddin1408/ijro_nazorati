import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const { SqliteD1Database } = await import('../db/sqlite-d1.ts');
const { LocalBucket } = await import('../db/local-bucket.ts');

async function text(stream) {
  return new Response(stream).text();
}

test('sqlite adapter mirrors D1 first/all/run/batch semantics', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ijro-db-'));
  const db = new SqliteD1Database(join(dir, 'test.sqlite'));
  try {
    await db.prepare('CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, flag INTEGER)').run();
    const inserted = await db.prepare('INSERT INTO t (name,flag) VALUES (?,?)').bind('a', true).run();
    assert.equal(inserted.meta.changes, 1);
    assert.equal(inserted.meta.last_row_id, 1);
    const returning = await db.prepare('INSERT INTO t (name,flag) VALUES (?,?) RETURNING id').bind('b', undefined).run();
    assert.deepEqual(returning.results, [{ id: 2 }]);
    assert.equal(returning.meta.changes, 1);
    assert.deepEqual(await db.prepare('SELECT flag FROM t WHERE name=?').bind('a').first(), { flag: 1 });
    assert.equal(await db.prepare('SELECT name FROM t WHERE id=?').bind(2).first('name'), 'b');
    assert.equal(await db.prepare('SELECT * FROM t WHERE id=?').bind(99).first(), null);
    assert.equal((await db.prepare('SELECT * FROM t').all()).results.length, 2);
    const updated = await db.prepare('UPDATE t SET flag=0 WHERE id=?').bind(42).run();
    assert.equal(updated.meta.changes, 0, 'optimistic locks rely on an exact changes count');

    await assert.rejects(db.batch([
      db.prepare('INSERT INTO t (name) VALUES (?)').bind('c'),
      db.prepare('INSERT INTO t (name) VALUES (?)').bind('a'),
    ]));
    assert.equal(await db.prepare("SELECT COUNT(*) AS n FROM t WHERE name='c'").first('n'), 0, 'failed batch rolls back');
    const results = await db.batch([db.prepare('INSERT INTO t (name) VALUES (?)').bind('d'), db.prepare('SELECT COUNT(*) AS n FROM t')]);
    assert.deepEqual(results[1].results, [{ n: 3 }]);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test('local bucket stores, ranges, multipart-assembles and confines keys', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ijro-bucket-'));
  const bucket = new LocalBucket(dir);
  try {
    const stored = await bucket.put('chat/1/a.txt', new Blob(['hello world']).stream(), { httpMetadata: { contentType: 'text/plain' } });
    assert.equal(stored.size, 11);
    const full = await bucket.get('chat/1/a.txt');
    assert.equal(await text(full.body), 'hello world');
    const headers = new Headers();
    full.writeHttpMetadata(headers);
    assert.equal(headers.get('content-type'), 'text/plain');
    const part = await bucket.get('chat/1/a.txt', { range: { offset: 6, length: 5 } });
    assert.equal(await text(part.body), 'world');
    assert.deepEqual(part.range, { offset: 6, length: 5 });

    const upload = await bucket.createMultipartUpload('video/b.bin', { httpMetadata: { contentType: 'video/mp4' } });
    const resumed = bucket.resumeMultipartUpload('video/b.bin', upload.uploadId);
    const p2 = await resumed.uploadPart(2, new TextEncoder().encode('-two').buffer);
    const p1 = await resumed.uploadPart(1, new Blob(['one']));
    await resumed.complete([p2, p1]);
    assert.equal(await text((await bucket.get('video/b.bin')).body), 'one-two');
    assert.deepEqual(readdirSync(join(dir, '.multipart')), []);

    await bucket.delete('chat/1/a.txt');
    assert.equal(await bucket.get('chat/1/a.txt'), null);
    await assert.rejects(bucket.put('../escape.txt', 'x'));
    await assert.rejects(bucket.get('/etc/passwd'));
    assert.throws(() => bucket.resumeMultipartUpload('x', '../../etc'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('database CLI applies migrations once and sets an administrator login', async () => {
  const { execFileSync } = await import('node:child_process');
  const dir = mkdtempSync(join(tmpdir(), 'ijro-cli-'));
  const env = { ...process.env, DATABASE_PATH: join(dir, 'cli.sqlite') };
  const script = new URL('../scripts/db.mjs', import.meta.url).pathname;
  try {
    assert.match(execFileSync('node', [script, 'migrate'], { env, encoding: 'utf8' }), /migration\(s\) applied/);
    assert.match(execFileSync('node', [script, 'migrate'], { env, encoding: 'utf8' }), /up to date/);
    const output = execFileSync('node', [script, 'admin', 'tizim.admin'], { env, encoding: 'utf8' });
    assert.match(output, /temporary password: \S{15}/);
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(env.DATABASE_PATH);
    const row = db.prepare(`SELECT c.username_normalized,c.must_change_password,r.code FROM app_user_credentials c
      JOIN app_employees e ON e.id=c.employee_id JOIN app_roles r ON r.id=e.role_id`).get();
    db.close();
    assert.deepEqual({ ...row }, { username_normalized: 'tizim.admin', must_change_password: 1, code: 'admin' });
    assert.doesNotMatch(readFileSync(script, 'utf8'), /_private_.*readdir/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
