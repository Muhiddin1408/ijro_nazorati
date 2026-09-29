import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
});

const { translate, transliterateData } = await import('../lib/i18n/core.ts');

test('t() translates UI text per locale and fills placeholders after conversion', () => {
  assert.equal(translate('lotin', 'Topshiriqlar'), 'Topshiriqlar');
  assert.equal(translate('kiril', 'Topshiriqlar'), 'Топшириқлар');
  assert.equal(translate('rus', 'Topshiriqlar'), 'Поручения');
  assert.equal(translate('rus', 'Lug‘atda yo‘q matn'), 'Lug‘atda yo‘q matn');
  // Parameter values (logins, codes) are never transliterated.
  assert.equal(translate('kiril', 'Login: {login}', { login: 'a.karimov' }), 'Логин: a.karimov');
});

test('tx() transliterates data only for Cyrillic', () => {
  assert.equal(transliterateData('kiril', 'Karimov Aziz'), 'Каримов Азиз');
  assert.equal(transliterateData('rus', 'Karimov Aziz'), 'Karimov Aziz');
  assert.equal(transliterateData('lotin', null), '');
});
