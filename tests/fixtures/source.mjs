import { existsSync, readFileSync } from 'node:fs';

// Source-level tests read a module together with the private modules it was
// split into (app/_components for UI, services/ and lib/policy/ for routes),
// so assertions keep covering code that now lives in extracted files.
function resolveLocal(specifier, from) {
  for (const suffix of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) {
    const url = new URL(specifier + suffix, from);
    if (existsSync(url) && !url.pathname.endsWith('/')) {
      try { readFileSync(url); return url; } catch { /* directory */ }
    }
  }
  return null;
}

export function readSourceSync(url) {
  const seen = new Set();
  const parts = [];
  const visit = (current) => {
    if (seen.has(current.href)) return;
    seen.add(current.href);
    const text = readFileSync(current, 'utf8');
    parts.push(text);
    for (const match of text.matchAll(/(?:from|import)\s*\(?\s*"(\.{1,2}\/[^"]+)"/g)) {
      const target = resolveLocal(match[1], current);
      if (target && /\/(?:app\/_components|services|lib\/policy|lib\/telegram-bot)\//.test(target.pathname)) visit(target);
    }
  };
  visit(url instanceof URL ? url : new URL(url));
  return parts.join('\n');
}

export async function readSource(url) {
  return readSourceSync(url);
}

/**
 * Formatting-insensitive view of source for single-line regex assertions:
 * Prettier may wrap calls, objects and JSX text and add trailing commas, so
 * whitespace runs collapse to one space, padding inside ()/[] is dropped and
 * trailing commas before a closing bracket are removed.
 */
export function flat(source) {
  return source
    .replace(/\s+/g, ' ')
    .replace(/,\s*([)\]}])/g, ' $1')
    .replace(/([([])\s+/g, '$1')
    .replace(/\s+([)\]])/g, '$1');
}

/**
 * The app's full stylesheet in cascade order: globals.css, then the area files in
 * app/styles/ (imported by their entry components). Tests that assert CSS content
 * read this instead of globals.css alone, since area rules live in app/styles/.
 */
export async function readAllCss() {
  const { readFile, readdir } = await import("node:fs/promises");
  const dir = new URL("../../app/styles/", import.meta.url);
  const areas = (await readdir(dir)).filter((name) => name.endsWith(".css")).sort();
  const parts = [await readFile(new URL("../../app/globals.css", import.meta.url), "utf8")];
  for (const name of areas) parts.push(await readFile(new URL(name, dir), "utf8"));
  return parts.join("\n");
}
