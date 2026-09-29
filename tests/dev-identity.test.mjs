import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// K3: development impersonation must be explicit and never header-driven.
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
    const sources = {
      'test:db': 'export async function getD1(){throw new Error("no db")} export async function getRuntimeEnv(){return {}}',
      'test:headers': 'export async function headers(){return new Headers({"oai-authenticated-user-email":"admin@ijro.local"})}',
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const auth = await import('../lib/auth.ts');

test('no implicit administrator outside an explicit development impersonation', () => {
  const original = { env: process.env.NODE_ENV, email: process.env.DEV_IMPERSONATE_EMAIL };
  try {
    delete process.env.DEV_IMPERSONATE_EMAIL;
    process.env.NODE_ENV = 'development';
    assert.equal(auth.currentIdentityEmail(), null, 'development without DEV_IMPERSONATE_EMAIL is anonymous');
    process.env.DEV_IMPERSONATE_EMAIL = 'Admin@Ijro.Local';
    assert.equal(auth.currentIdentityEmail(), 'admin@ijro.local');
    process.env.NODE_ENV = 'production';
    assert.equal(auth.currentIdentityEmail(), null, 'production ignores the impersonation variable');
  } finally {
    process.env.NODE_ENV = original.env;
    if (original.email === undefined) delete process.env.DEV_IMPERSONATE_EMAIL;
    else process.env.DEV_IMPERSONATE_EMAIL = original.email;
  }
});

test('forwarded identity headers never authenticate', async () => {
  process.env.NODE_ENV = 'development';
  delete process.env.DEV_IMPERSONATE_EMAIL;
  await assert.rejects(auth.requireActor(), error => error.status === 401);
});
