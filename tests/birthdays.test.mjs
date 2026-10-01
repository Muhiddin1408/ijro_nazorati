import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Birthday greeting data (lib/birthdays.ts) against the real migrations on in-memory SQLite.
registerHooks({
  resolve(specifier, context, next) {
    if (/(?:^|\/)db$/.test(specifier)) return { url: 'test:db', shortCircuit: true };
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url === 'test:db') return { format: 'module', source: 'export async function getD1(){return globalThis.birthdayDb}', shortCircuit: true };
    return next(url, context);
  },
});

const { birthdayKeysFor, todaysBirthdays } = await import('../lib/birthdays.ts');

function fixture() {
  const database = new DatabaseSync(':memory:');
  const dir = new URL('../drizzle/', import.meta.url);
  for (const name of withSyntheticSeed(readdirSync(dir).filter((name) => /^\d{4}.*\.sql$/.test(name)).sort())) database.exec(readFileSync(new URL(name, dir), 'utf8'));
  globalThis.birthdayDb = {
    prepare(sql) {
      let bindings = [];
      return {
        bind(...values) { bindings = values; return this; },
        async all() { return { results: database.prepare(sql).all(...bindings) }; },
      };
    },
  };
  const employees = database.prepare('SELECT id, organization_id FROM app_employees WHERE active=1 AND organization_id IS NOT NULL ORDER BY id LIMIT 4').all();
  assert.equal(employees.length, 4, 'synthetic seed has employees');
  const setBirthDate = (id, date) => database.prepare(`INSERT INTO app_employee_profiles (employee_id, birth_date) VALUES (?, ?)
    ON CONFLICT(employee_id) DO UPDATE SET birth_date=excluded.birth_date`).run(id, date);
  return { database, employees, setBirthDate };
}

test('today is the Tashkent date; 29 February is celebrated on 28 February in common years', () => {
  // 20:00 UTC on 1 October is already 2 October in Tashkent (UTC+5).
  assert.deepEqual(birthdayKeysFor(new Date('2026-10-01T20:00:00Z')), { date: '2026-10-02', keys: ['10-02'] });
  assert.deepEqual(birthdayKeysFor(new Date('2026-10-01T18:59:59Z')), { date: '2026-10-01', keys: ['10-01'] });
  assert.deepEqual(birthdayKeysFor(new Date('2027-02-28T06:00:00Z')).keys, ['02-28', '02-29']);
  assert.deepEqual(birthdayKeysFor(new Date('2028-02-28T06:00:00Z')).keys, ['02-28']);
  assert.deepEqual(birthdayKeysFor(new Date('2028-02-29T06:00:00Z')).keys, ['02-29']);
});

test('the viewer gets the greeting flag, colleagues of the same organization are listed without birth dates', async () => {
  const { database, employees, setBirthDate } = fixture();
  const [me, colleague, other, inactive] = employees;
  const now = new Date('2026-10-02T07:00:00Z');
  setBirthDate(me.id, '1990-10-02');
  setBirthDate(colleague.id, '1985-10-02');
  setBirthDate(other.id, '1985-10-03');
  setBirthDate(inactive.id, '1979-10-02');
  database.prepare('UPDATE app_employees SET active=0 WHERE id=?').run(inactive.id);
  database.prepare('UPDATE app_employees SET organization_id=? WHERE id=?').run(me.organization_id, colleague.id);

  const mine = await todaysBirthdays({ id: me.id, organizationId: me.organization_id }, now);
  assert.equal(mine.date, '2026-10-02');
  assert.equal(mine.mine, true);
  assert.deepEqual(mine.people.map((person) => person.id), [colleague.id]);
  assert.deepEqual(Object.keys(mine.people[0]).sort(), ['department', 'id', 'name', 'position']);

  const theirs = await todaysBirthdays({ id: colleague.id, organizationId: me.organization_id }, now);
  assert.equal(theirs.mine, true);
  assert.deepEqual(theirs.people.map((person) => person.id), [me.id]);

  const outsider = await todaysBirthdays({ id: other.id, organizationId: -1 }, now);
  assert.equal(outsider.mine, false);
  assert.deepEqual(outsider.people, [], 'other organizations do not see the list');
});
