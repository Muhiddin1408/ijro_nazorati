import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

// Resolve the app's extensionless TypeScript imports.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
});

test('daily maintenance snapshots once per day and keeps the newest backups', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ijro-maint-'));
  process.env.DATABASE_PATH = join(dir, 'ijro.sqlite');
  delete process.env.BACKUP_DIR;
  const { getD1 } = await import('../db/index.ts');
  const { runDailyMaintenance } = await import('../lib/maintenance.ts');
  try {
    const db = await getD1();
    await db.prepare('CREATE TABLE t (v TEXT)').run();
    await db.prepare("INSERT INTO t VALUES ('x')").run();
    const backups = join(dir, 'backups');
    for (let day = 1; day <= 5; day += 1) {
      await runDailyMaintenance(new Date(`2026-01-0${day}T03:00:00Z`), 3);
    }
    assert.deepEqual(readdirSync(backups).sort(), ['ijro-2026-01-03.sqlite', 'ijro-2026-01-04.sqlite', 'ijro-2026-01-05.sqlite']);
    const again = await runDailyMaintenance(new Date('2026-01-05T09:00:00Z'), 3);
    assert.equal(again.created, false);
    writeFileSync(join(backups, 'unrelated.txt'), 'keep');
    await runDailyMaintenance(new Date('2026-01-06T03:00:00Z'), 3);
    assert.ok(readdirSync(backups).includes('unrelated.txt'));
    const { DatabaseSync } = await import('node:sqlite');
    const snapshot = new DatabaseSync(join(backups, 'ijro-2026-01-06.sqlite'));
    assert.deepEqual({ ...snapshot.prepare('SELECT v FROM t').get() }, { v: 'x' });
    snapshot.close();
  } finally {
    globalThis.__ijroRuntime?.DB.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
