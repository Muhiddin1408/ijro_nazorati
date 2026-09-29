import { readSource, flat, readAllCss } from './fixtures/source.mjs';
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("information navigation aborts stale template and pagination requests", async () => {
  const center = await readSource(new URL("../app/information-center.tsx", import.meta.url));

  assert.match(center, /const catalogRequestSequence = useRef\(0\)/);
  assert.match(center, /catalogRequestController\.current\?\.abort\(\)/);
  assert.match(center, /requestSequence !== catalogRequestSequence\.current/);
  assert.match(center, /view === "template" && selectedTemplateIdRef\.current !== targetId/);
  assert.match(flat(center), /setPayload\(\(current\) => \(?current \? \{ \.\.\.current, records: \[\], totalCount: 0, nextCursor: null \}/);
  assert.match(center, /selectedTemplateIdRef\.current !== templateId/);
  assert.match(center, /loadMoreRequestController\.current\?\.abort\(\)/);
});

test("phone content preserves clearance above the fixed bottom navigation", async () => {
  // Layout shell rules live in globals.css; its last phone block must keep the clearance.
  const css = await readSource(new URL("../app/globals.css", import.meta.url));
  const finalMobileRules = css.slice(css.lastIndexOf("@media (max-width: 720px)"));

  assert.match(finalMobileRules, /\.page-content \{ padding:12px; padding-bottom:calc\(88px \+ env\(safe-area-inset-bottom\)\); \}/);
  assert.doesNotMatch(finalMobileRules, /padding-bottom:max\(18px,env\(safe-area-inset-bottom\)\)/);
});
