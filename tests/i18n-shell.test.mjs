import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Shell area: dashboard, tasks, meetings, login and shared helpers render through t()/tx().
const FILES = [
  'app/dashboard.tsx',
  'app/_components/dashboard/dashboard-pages.tsx',
  'app/_components/dashboard/locale-switch.tsx',
  'app/dashboard-home.tsx',
  'app/tasks-page.tsx',
  'app/meetings-page.tsx',
  'app/_components/tasks/meeting-modal.tsx',
  'app/_components/tasks/people-picker.tsx',
  'app/_components/tasks/task-detail.tsx',
  'app/_components/tasks/task-helpers.tsx',
  'app/_components/tasks/task-modals.tsx',
  'app/login-screen.tsx',
  'app/notification-prefs.tsx',
  'app/theme-mode-toggle.tsx',
  'app/ui-helpers.tsx',
  'app/road-loader.tsx',
  'app/local-insights.tsx',
  'app/task-meeting-export.ts',
];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function dictionaryKeys(path) {
  // Prettier leaves identifier-like keys unquoted.
  return new Set(
    [...read(path).matchAll(/^\s+(?:("(?:[^"\\]|\\.)*")|([A-Za-z_$][\w$]*)):/gm)].map((match) =>
      match[1] ? JSON.parse(match[1]) : match[2],
    ),
  );
}

test('every shell UI key has a Russian translation', () => {
  const known = new Set([...dictionaryKeys('lib/i18n/ru/common.ts'), ...dictionaryKeys('lib/i18n/ru/shell.ts')]);
  const missing = [];
  for (const file of FILES) {
    for (const match of read(file).matchAll(/\b(?:t|tNow|tr)\(\s*("(?:[^"\\]|\\.)*")/g)) {
      const key = JSON.parse(match[1]);
      if (!known.has(key)) missing.push(`${file}: ${key}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('shell no longer relies on DOM-mutation opt-outs and switches three locales', () => {
  for (const file of FILES) {
    // ui-helpers still exports the deprecated helper for areas not yet migrated; nobody here calls it.
    const source = read(file).replace(/export function alphabetText\(/, "");
    assert.doesNotMatch(source, /alphabetText\(/, `${file} should use t()/tx()`);
  }
  const dashboard = read('app/dashboard.tsx');
  assert.match(dashboard, /<I18nProvider locale=\{locale\}>/);
  assert.match(dashboard, /<LocaleSwitch locale=\{locale\} onChange=\{chooseAlphabet\} \/>/);
  assert.match(read('app/login-screen.tsx'), /<LocaleSwitch className="topbar-alphabet login-alphabet"/);
  assert.match(read('app/_components/dashboard/locale-switch.tsx'), /LOCALES\.map/);
  // Form values stay canonical Uzbek Latin even when the label is translated.
  assert.match(read('app/_components/tasks/task-modals.tsx'), /<option value="O‘rta">\{t\("O‘rta"\)\}<\/option>/);
});
