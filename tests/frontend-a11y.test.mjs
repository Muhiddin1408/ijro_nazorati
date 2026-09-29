import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFileSync(join(root, path), 'utf8');

function sourceFiles(directory) {
  return readdirSync(join(root, directory)).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(join(root, path)).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|mts)$/.test(name) ? [path] : [];
  });
}

// Files still owned by other refactors; everything else must use the accessible dialog.
const PENDING = new Set();

test('native confirm/prompt dialogs are replaced by the accessible ConfirmDialog', () => {
  const offenders = [...sourceFiles('app'), ...sourceFiles('components')]
    .filter((path) => !PENDING.has(path))
    .filter((path) => /window\.(confirm|prompt)\s*\(/.test(read(path)));
  assert.deepEqual(offenders, []);
  const dialog = read('app/_components/ui/confirm-dialog.tsx');
  assert.match(dialog, /role="alertdialog"/);
  assert.match(dialog, /aria-describedby=\{messageId\}/);
  assert.match(dialog, /export function promptDialog/);
  assert.match(dialog, /requireTextAlternatives/);
  assert.match(read('app/dashboard.tsx'), /<ConfirmHost \/>/);
  // Password reissue still needs the typed phrase, now in an accessible dialog.
  const staffDirectory = read('app/_components/admin/staff-directory-page.tsx');
  // The phrase is localized; every spelling (Latin, Cyrillic, Russian) is accepted.
  assert.match(staffDirectory, /requireText: t\("PAROLNI YANGILASH"\)/);
  assert.match(staffDirectory, /requireTextAlternatives: \["PAROLNI YANGILASH", "ПАРОЛНИ ЯНГИЛАШ", "ОБНОВИТЬ ПАРОЛИ"\]/);
});

test('ModalFrame is a labelled modal dialog with a focus trap', () => {
  const kit = read('app/dashboard-kit.tsx');
  assert.match(kit, /aria-modal="true"/);
  assert.match(kit, /aria-labelledby=\{label \? undefined : titleId\}/);
  assert.match(kit, /<h2 id=\{titleId\}>/);
  assert.doesNotMatch(kit, /aria-label="Boshqaruv oynasi"/);
  assert.match(kit, /useFocusTrap\(true, sheetRef, onClose\)/);
  const trap = read('app/_components/ui/use-focus-trap.ts');
  for (const behaviour of [/event\.key === "Escape"/, /event\.key !== "Tab"/, /previousFocus\?\.isConnected/, /data-dialog-initial-focus/, /document\.body\.style\.overflow = "hidden"/, /openLayers\.at\(-1\) !== layer/]) {
    assert.match(trap, behaviour);
  }
  // Information drawers and the preview drawer share the same trap.
  assert.match(read('app/_components/information/information-helpers.tsx'), /useFocusTrap\(active, layerRef, onClose, \{ inertSiblings: true/);
  assert.match(read('app/_components/information/workspace-ui.tsx'), /useFocusTrap\(true, layerRef, onClose/);
});

test('clickable task rows and cards are reachable and operable by keyboard', () => {
  for (const path of ['app/dashboard-home.tsx', 'app/tasks-page.tsx']) {
    const source = read(path);
    assert.match(source, /tabIndex=\{0\}/, path);
    assert.match(source, /event\.key === "Enter" \|\| event\.key === " "/, path);
  }
});
