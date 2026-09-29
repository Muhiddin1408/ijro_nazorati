import { readSource } from './fixtures/source.mjs';
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const { isWithinQuietHours, nextQuietHoursEnd, normalizeClock, isValidClock } = await import("../lib/quiet-hours.ts");

function atTashkent(year, month, day, hour, minute) {
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute));
}

test("overnight quiet hours wrap midnight in Asia/Tashkent", () => {
  assert.equal(isWithinQuietHours(atTashkent(2026, 8, 16, 22, 0), "22:00", "07:00"), true);
  assert.equal(isWithinQuietHours(atTashkent(2026, 8, 16, 23, 30), "22:00", "07:00"), true);
  assert.equal(isWithinQuietHours(atTashkent(2026, 8, 16, 2, 15), "22:00", "07:00"), true);
  assert.equal(isWithinQuietHours(atTashkent(2026, 8, 16, 6, 59), "22:00", "07:00"), true);
  assert.equal(isWithinQuietHours(atTashkent(2026, 8, 16, 7, 0), "22:00", "07:00"), false);
  assert.equal(isWithinQuietHours(atTashkent(2026, 8, 16, 12, 0), "22:00", "07:00"), false);
  assert.equal(isWithinQuietHours(atTashkent(2026, 8, 16, 21, 59), "22:00", "07:00"), false);
});

test("same-day quiet window stays inside start/end", () => {
  assert.equal(isWithinQuietHours(atTashkent(2026, 8, 16, 13, 0), "13:00", "14:30"), true);
  assert.equal(isWithinQuietHours(atTashkent(2026, 8, 16, 14, 29), "13:00", "14:30"), true);
  assert.equal(isWithinQuietHours(atTashkent(2026, 8, 16, 14, 30), "13:00", "14:30"), false);
  assert.equal(isWithinQuietHours(atTashkent(2026, 8, 16, 12, 59), "13:00", "14:30"), false);
});

test("next quiet-hours end is the next Tashkent wall-clock end", () => {
  const late = nextQuietHoursEnd(atTashkent(2026, 8, 16, 23, 10), "07:00");
  assert.equal(late.toISOString(), atTashkent(2026, 8, 17, 7, 0).toISOString());

  const early = nextQuietHoursEnd(atTashkent(2026, 8, 16, 2, 10), "07:00");
  assert.equal(early.toISOString(), atTashkent(2026, 8, 16, 7, 0).toISOString());
});

test("clock helpers reject garbage and keep HH:MM", () => {
  assert.equal(isValidClock("22:00"), true);
  assert.equal(isValidClock("7:00"), false);
  assert.equal(isValidClock("25:00"), false);
  assert.equal(normalizeClock("07:15"), "07:15");
  assert.equal(normalizeClock("bad", "22:00"), "22:00");
});

test("preferences API and worker persist and honor quiet hours", async () => {
  const [route, telegram, migration, prefs] = await Promise.all([
    readSource(new URL("../app/api/telegram/preferences/route.ts", import.meta.url)),
    readSource(new URL("../lib/telegram.ts", import.meta.url)),
    readFile(new URL("../drizzle/0025_telegram_quiet_hours.sql", import.meta.url), "utf8"),
    readSource(new URL("../app/notification-prefs.tsx", import.meta.url)),
  ]);
  assert.match(migration, /quiet_hours_enabled/);
  assert.match(migration, /quiet_hours_start/);
  assert.match(migration, /quiet_hours_end/);
  // Plain SQL migrations are the only schema source (the unused Drizzle schema was removed).
  assert.match(route, /SET notifications_enabled = \?,\s*quiet_hours_enabled = \?/);
  assert.match(route, /quiet_hours_start/);
  assert.doesNotMatch(route, /not persisted yet|client-only|tez orada/);
  assert.match(telegram, /quiet_hours_enabled/);
  assert.match(telegram, /isWithinQuietHours/);
  assert.match(telegram, /nextQuietHoursEnd/);
  assert.match(prefs, /Toshkent vaqti/);
});
