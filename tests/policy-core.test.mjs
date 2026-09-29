import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

registerHooks({
  resolve(specifier, context, next) {
    if (/(?:^|\/)db$/.test(specifier)) return { url: 'test:db', shortCircuit: true };
    if (specifier === 'next/headers') return { url: 'test:headers', shortCircuit: true };
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url === 'test:db') return { format: 'module', source: 'export async function getD1(){} export async function getRuntimeEnv(){return {}}', shortCircuit: true };
    if (url === 'test:headers') return { format: 'module', source: 'export async function headers(){return new Headers()}', shortCircuit: true };
    return next(url, context);
  },
});

const { ALLOW, all, any, authorize, deny, when } = await import('../lib/policy/index.ts');

test('policy combinators report the first denial and authorize throws it', async () => {
  assert.deepEqual(all(ALLOW, when(true, 'x')), ALLOW);
  assert.deepEqual(all(ALLOW, deny('birinchi', 404), deny('ikkinchi')), { allowed: false, status: 404, message: 'birinchi' });
  assert.deepEqual(any(deny('a'), ALLOW), ALLOW);
  assert.equal(any(deny('a'), deny('b')).message, 'a');
  await authorize(Promise.resolve(ALLOW));
  await assert.rejects(authorize(deny('Yopiq', 409)), (error) => error.status === 409 && error.message === 'Yopiq');
});
