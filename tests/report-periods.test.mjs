import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\.[a-z]+$/i.test(specifier)) {
      const url = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(fileURLToPath(url))) return nextResolve(url.href, context);
    }
    return nextResolve(specifier, context);
  },
});

const { reportCycleParts, nextReportDeadline } = await import("../lib/report-periods.ts");

test("report periods use the Tashkent calendar while retaining UTC instants", () => {
  const monthly = reportCycleParts(new Date("2026-03-31T20:30:00.000Z"), "monthly");
  assert.equal(monthly.periodKey, "monthly:2026-04-01");
  assert.equal(monthly.periodStart, "2026-03-31T19:00:00.000Z");
  assert.equal(monthly.periodEnd, "2026-04-30T18:59:59.000Z");

  const quarterly = reportCycleParts(new Date("2026-03-31T20:30:00.000Z"), "quarterly");
  assert.equal(quarterly.periodLabel, "2026-yil 2-chorak");
  assert.equal(quarterly.periodStart, "2026-03-31T19:00:00.000Z");
  assert.equal(quarterly.periodEnd, "2026-06-30T18:59:59.000Z");

  const yearly = reportCycleParts(new Date("2026-12-31T20:30:00.000Z"), "yearly");
  assert.equal(yearly.periodKey, "yearly:2027-01-01");
  assert.equal(yearly.periodStart, "2026-12-31T19:00:00.000Z");
  assert.equal(yearly.periodEnd, "2027-12-31T18:59:59.000Z");
});

test("weekly and one-time report periods keep exact local boundaries", () => {
  const weekly = reportCycleParts(new Date("2026-08-11T02:00:00.000Z"), "weekly");
  assert.equal(weekly.periodStart, "2026-08-09T19:00:00.000Z");
  assert.equal(weekly.periodEnd, "2026-08-16T18:59:59.000Z");

  const deadline = new Date("2026-08-11T04:45:00.000Z");
  const oneTime = reportCycleParts(deadline, "one_time");
  assert.equal(oneTime.periodStart, deadline.toISOString());
  assert.equal(oneTime.periodEnd, deadline.toISOString());
});

test("recurring months preserve the first Tashkent day, including pre-05:00 deadlines", () => {
  const first = new Date("2026-08-31T21:00:00Z");
  const october = nextReportDeadline(first, first, "monthly");
  assert.equal(october.toISOString(), "2026-09-30T21:00:00.000Z");
  assert.equal(nextReportDeadline(first, october, "monthly").toISOString(), "2026-10-31T21:00:00.000Z");
  assert.equal(nextReportDeadline(first, new Date("2026-10-30T21:00:00Z"), "monthly").toISOString(), "2026-10-31T21:00:00.000Z");
});

test("month-end and leap-year recurrences restore the original anchor after a short month", () => {
  const first = new Date("2026-01-31T07:00:00Z");
  const february = nextReportDeadline(first, first, "monthly");
  assert.equal(february.toISOString(), "2026-02-28T07:00:00.000Z");
  assert.equal(nextReportDeadline(first, february, "monthly").toISOString(), "2026-03-31T07:00:00.000Z");
  const april = nextReportDeadline(first, first, "quarterly");
  assert.equal(april.toISOString(), "2026-04-30T07:00:00.000Z");
  assert.equal(nextReportDeadline(first, april, "quarterly").toISOString(), "2026-07-31T07:00:00.000Z");
  const leap = new Date("2024-02-29T07:00:00Z");
  assert.equal(nextReportDeadline(leap, leap, "yearly").toISOString(), "2025-02-28T07:00:00.000Z");
  assert.equal(nextReportDeadline(leap, new Date("2027-02-28T07:00:00Z"), "yearly").toISOString(), "2028-02-29T07:00:00.000Z");
  assert.equal(nextReportDeadline(first, first, "weekly").toISOString(), "2026-02-07T07:00:00.000Z");
  assert.equal(nextReportDeadline(first, first, "one_time"), null);
});
