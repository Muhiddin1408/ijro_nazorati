import { readSource, readAllCss } from './fixtures/source.mjs';
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
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

const { captureActivationLocation } = await import("../lib/activation-url.ts");

const dashboardUrl = new URL("../app/dashboard.tsx", import.meta.url);
const adminPagesUrl = new URL("../app/admin-pages.tsx", import.meta.url);
const adminModalsUrl = new URL("../app/admin-modals.tsx", import.meta.url);
const loaderUrl = new URL("../app/road-loader.tsx", import.meta.url);
const cssUrl = new URL("../app/globals.css", import.meta.url);

test("administrator provisions credentials through a one-time no-store export", async () => {
  const [dashboard, adminPages] = await Promise.all([
    readSource(dashboardUrl),
    readSource(adminPagesUrl),
  ]);
  const ui = dashboard + adminPages;
  assert.match(dashboard, /\/api\/admin\/accounts\/provision/);
  assert.match(dashboard, /cache:\s*"no-store"/);
  assert.match(dashboard, /Parollar faqat shu yuklashda ko‘rsatiladi/);
  assert.match(dashboard, /Login va parollar/);
  assert.match(dashboard, /Rollar va vakolatlar/);
  assert.match(dashboard, /Tasdiqlash yo‘li/);
  assert.match(ui, /reissue:\s*systemReissueMode/);
  assert.match(ui, /PAROLNI YANGILASH/);
  assert.match(ui, /Mavjud login va parollar o‘zgarmaydi/);
  const provisioningFunction = dashboard.slice(dashboard.indexOf("async function requestProvisioning"), dashboard.indexOf("async function downloadProvisioningWorkbook"));
  assert.ok(provisioningFunction.indexOf("/api/admin/access-profiles") < provisioningFunction.indexOf("/api/admin/accounts/provision"));
  assert.doesNotMatch(provisioningFunction, /access-profiles[\s\S]*\.catch\(\(\) => \(\{ profiles: \[\]/);
  assert.doesNotMatch(ui, /set(?:Temporary)?Password(?:s|Rows|Accounts)?\(result\.accounts/);
});

test("activation bearer is scrubbed from the URL before UI state or network use", async () => {
  const loginScreen = await readSource(new URL("../app/login-screen.tsx", import.meta.url));
  const activationStart = loginScreen.indexOf('const [activationToken');
  const activationEnd = loginScreen.indexOf("async function submit", activationStart);
  const activationEffect = loginScreen.slice(activationStart, activationEnd);
  const capturedAt = activationEffect.indexOf("captureActivationLocation");
  const scrubbedAt = activationEffect.indexOf("window.history.replaceState");
  const storedAt = activationEffect.indexOf("setActivationToken(capture.token)");
  assert.ok(capturedAt >= 0 && scrubbedAt > capturedAt && storedAt > scrubbedAt);

  const activationFlow = loginScreen.slice(activationStart, loginScreen.indexOf("if (activationToken)", activationStart));
  assert.ok(activationFlow.indexOf("window.history.replaceState") < activationFlow.indexOf('fetch("/api/auth/activate"'));
  assert.equal((activationFlow.match(/window\.history\.replaceState/g) ?? []).length, 1);
});

test("StrictMode effect replay retains the first activation bearer after cleanup", () => {
  const firstSetup = captureActivationLocation(
    "https://erp.example.uz/login?lang=uz&activate=secret-token#activate-form",
    null,
  );
  assert.equal(firstSetup.token, "secret-token");
  assert.equal(firstSetup.sanitizedUrl, "/login?lang=uz#activate-form");
  assert.doesNotMatch(firstSetup.sanitizedUrl, /secret-token|activate=/);

  // React StrictMode cleans up the first effect, then replays setup against the
  // already-scrubbed address. The ref value must keep the original bearer.
  const replayedSetup = captureActivationLocation(
    `https://erp.example.uz${firstSetup.sanitizedUrl}`,
    firstSetup.token,
  );
  assert.equal(replayedSetup.token, "secret-token");
  assert.equal(replayedSetup.sanitizedUrl, null);
});

test("vacant staff credentials stay reserved until an employee is assigned", async () => {
  const [dashboard, adminPages] = await Promise.all([
    readSource(dashboardUrl),
    readSource(adminPagesUrl),
  ]);
  const ui = dashboard + adminPages;
  assert.match(ui, /kind:\s*"vacancies"/);
  assert.match(ui, /Rezerv login hozir faol bo‘lmaydi/);
  assert.match(ui, /Xodim ushbu shtatga biriktirilgach/);
  assert.match(ui, /summary\.coverage\.missingOfficialSchedules/);
  assert.match(ui, /Bular rasmiy shtat lavozimi emas/);
  assert.match(ui, /operationalReadyOrganizations/);
});

test("role UI exposes the full information approval chain", async () => {
  const [dashboard, adminPages, adminModals] = await Promise.all([
    readSource(dashboardUrl),
    readSource(adminPagesUrl),
    readSource(adminModalsUrl),
  ]);
  const ui = dashboard + adminPages + adminModals;
  assert.match(ui, /\/api\/admin\/access-profiles/);
  assert.match(ui, /canEnterInformation/);
  assert.match(ui, /canSubmitInformation/);
  assert.match(ui, /canVerifyInformation/);
  assert.match(ui, /canApproveInformation/);
  assert.match(ui, /Tuman korxonasi/);
  assert.match(ui, /Qo‘mita rahbariyati/);
});

test("administrator assigns explicit thematic access without a blanket organization grant", async () => {
  const [dashboard, adminPages, css] = await Promise.all([
    readSource(dashboardUrl),
    readSource(adminPagesUrl),
    readAllCss(),
  ]);
  const ui = dashboard + adminPages;
  assert.match(ui, /\/api\/admin\/information-access/);
  assert.match(ui, /principalType:\s*"staff_position"\s*\|\s*"employee"/);
  assert.match(ui, /memberRole:\s*"editor"\s*\|\s*"reviewer"/);
  assert.match(ui, /Umumiy vakolat berilmaydi/);
  assert.match(ui, /method:\s*"POST"/);
  assert.match(ui, /method:\s*"DELETE"/);
  assert.match(ui, /grantId:\s*grant\.id/);
  assert.doesNotMatch(ui, /principalType:\s*"organization"/);
  assert.match(css, /\.thematic-access-controls/);
  assert.match(css, /\.thematic-grant-row/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.thematic-access-panel/);
});

test("loader uses a restrained road-engineering alignment without a cartoon vehicle", async () => {
  const [loader, css] = await Promise.all([readSource(loaderUrl), readAllCss()]);
  assert.match(loader, /road-loader-engineering/);
  assert.match(loader, /road-loader-centerline/);
  assert.match(css, /road-engineering-scan/);
  assert.doesNotMatch(loader, /road-loader-vehicle/);
  assert.doesNotMatch(css, /road-vehicle-bob/);
  assert.match(css, /prefers-reduced-motion/);
});
