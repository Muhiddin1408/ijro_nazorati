import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
});

const root = fileURLToPath(new URL('..', import.meta.url));
function files(dir) {
  return readdirSync(root + dir).flatMap((name) => {
    const path = `${dir}/${name}`;
    if (statSync(root + path).isDirectory()) return name === 'api' ? [] : files(path);
    return /\.(tsx?)$/.test(name) ? [path] : [];
  });
}

test('every literal t()/tNow() key in the UI has a Russian translation', async () => {
  const { ru } = await import('../lib/i18n/ru/index.ts');
  const missing = new Set();
  for (const path of [...files('app'), ...files('components')]) {
    const source = readFileSync(root + path, 'utf8');
    for (const match of source.matchAll(/\b(?:t|tNow)\(\s*"((?:[^"\\]|\\.)+)"/g)) {
      const key = JSON.parse(`"${match[1]}"`);
      if (!(key in ru)) missing.add(`${path}: ${key}`);
    }
  }
  assert.deepEqual([...missing].slice(0, 30), [], `${missing.size} keys without Russian translation`);
});

test('no DOM-mutating alphabet renderer remains', () => {
  for (const path of [...files('app'), ...files('components')]) {
    const source = readFileSync(root + path, 'utf8');
    assert.doesNotMatch(source, /MutationObserver|useAlphabetRenderer/, path);
  }
});
