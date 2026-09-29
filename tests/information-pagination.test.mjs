import { readSource, flat } from './fixtures/source.mjs';
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("information pagination keeps the full result count outside the cursor scope", async () => {
  const route = await readSource(new URL("../app/api/information/route.ts", import.meta.url));

  assert.match(route, /const recordConditions =/);
  assert.match(route, /const pageConditions = \[\.\.\.recordConditions\]/);
  assert.match(route, /if \(cursor\) \{\s*pageConditions\.push\(`\(r\.created_at<\(SELECT created_at FROM app_information_records WHERE id=\?\)/);
  assert.match(route, /ORDER BY r\.created_at DESC, r\.id DESC LIMIT \?/);
  assert.match(route, /SELECT COUNT\(\*\) AS total_count[\s\S]*WHERE \$\{recordConditions\.join\(" AND "\)\}/);
  assert.match(flat(route), /records: page\.map\(\(row\) => mapRecord\(row, canViewSensitive\)\), totalCount, nextCursor:/);

  const fullScopeSection = route.slice(route.indexOf("const recordConditions"), route.indexOf("const pageConditions"));
  assert.doesNotMatch(fullScopeSection, /r\.id<\?|r\.created_at</);
});

test("information workspace discloses loaded scope for filters, totals and Excel", async () => {
  const [center, workspace] = await Promise.all([
    readSource(new URL("../app/information-center.tsx", import.meta.url)),
    readSource(new URL("../app/information-dashboard.tsx", import.meta.url)),
  ]);

  assert.match(center, /totalCount\?: number/);
  assert.match(center, /totalCount=\{payload\?\.totalCount \?\? records\.length\}/);
  assert.match(workspace, /isPartiallyLoaded/);
  assert.match(flat(workspace), /Filtrlar, jamlanmalar va Excel hozir yuklangan qatorlar bo‘yicha ishlaydi/);
  assert.match(workspace, /Yuklanganlarini Excel/);
  assert.match(workspace, /Qamrov:.*eksport faqat yuklangan qatorlardan tuzildi/);
});
