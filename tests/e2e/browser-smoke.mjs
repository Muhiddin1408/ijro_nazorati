// Browser smoke test (Playwright + axe-core). Not part of `npm test`.
// Usage: see docs/E2E.md. Exits non-zero when any check fails.
import { chromium } from "playwright";
const base = process.env.E2E_BASE_URL ?? "https://localhost";
const login = process.env.E2E_LOGIN ?? "tizim.admin";
const password = process.env.E2E_PASSWORD ?? "Sinov12345parol";
const outDir = process.env.E2E_OUT ?? "/out";
const results = [];
const ok = (name, pass, info = "") => results.push(`${pass ? "PASS" : "FAIL"} ${name}${info ? " — " + info : ""}`);
const browser = await chromium.launch();
async function run(viewport, label) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200));
  });
  let bootstrapCalls = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/bootstrap")) bootstrapCalls++;
  });
  await page.goto(base + "/");
  await page.getByPlaceholder("Loginni kiriting").fill(login);
  await page.getByPlaceholder("Parolni kiriting").fill(password);
  await page.getByRole("button", { name: "Kirish", exact: true }).click();
  await page.getByText("Yangi topshiriq").first().waitFor({ timeout: 20000 });
  ok(`${label}: login → dashboard`, true);
  const before = bootstrapCalls;
  await page.waitForTimeout(8000);
  ok(`${label}: no bootstrap loop`, bootstrapCalls - before <= 1, `${bootstrapCalls - before} extra calls in 8s`);
  const openNav = async (name) => {
    if (viewport.width < 941) {
      await page.getByRole("button", { name: "Menyuni ochish" }).first().click({ timeout: 5000 });
      await page.waitForTimeout(400);
    }
    const link = page
      .locator(".sidebar")
      .getByRole("button", { name: new RegExp("^" + name) })
      .first();
    await link.click({ timeout: 5000 });
    await page.waitForTimeout(1200);
  };
  for (const name of [
    "Topshiriqlar",
    "Yig‘ilishlar",
    "Muloqot",
    "Hisobotlar",
    "Xodimlar",
    "Tashkilotlar",
    "Audit jurnali",
    "Bosh sahifa",
  ]) {
    try {
      await openNav(name);
      ok(`${label}: page ${name}`, true);
    } catch (e) {
      ok(`${label}: page ${name}`, false, e.message.split("\n")[0]);
    }
  }
  // Task modal: focus trap + Escape
  try {
    await page
      .getByRole("button", { name: /Yangi topshiriq/ })
      .first()
      .click();
    const dialog = page.getByRole("dialog").first();
    await dialog.waitFor({ timeout: 5000 });
    const labelled = await dialog.getAttribute("aria-labelledby");
    const inside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
    for (let i = 0; i < 40; i++) await page.keyboard.press("Tab");
    const stillInside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    const closed = (await page.getByRole("dialog").count()) === 0;
    ok(
      `${label}: task modal a11y`,
      Boolean(labelled) && inside && stillInside && closed,
      `labelledby=${!!labelled} focusIn=${inside} trap=${stillInside} escClosed=${closed}`,
    );
  } catch (e) {
    ok(`${label}: task modal a11y`, false, e.message.split("\n")[0]);
  }
  // Create a task end-to-end
  try {
    await page
      .getByRole("button", { name: /Yangi topshiriq/ })
      .first()
      .click();
    const dialog = page.getByRole("dialog").first();
    await dialog.locator("input").first().fill("E2E sinov topshirig‘i");
    await page.screenshot({ path: `${outDir}/${label}-task-modal.png` });
    await page.keyboard.press("Escape");
    ok(`${label}: task form renders`, true);
  } catch (e) {
    ok(`${label}: task form renders`, false, e.message.split("\n")[0]);
  }
  // Cyrillic toggle
  try {
    await page.getByRole("button", { name: "Кирилл" }).first().click();
    await page.waitForTimeout(800);
    const cyr = await page
      .getByText("Топшириқлар")
      .first()
      .isVisible()
      .catch(() => false);
    ok(`${label}: Cyrillic mode`, cyr);
    await page.getByRole("button", { name: "Lotin" }).first().click();
  } catch (e) {
    ok(`${label}: Cyrillic mode`, false, e.message.split("\n")[0]);
  }
  // Russian locale
  try {
    await page.getByRole("button", { name: "Рус" }).first().click();
    await page.waitForTimeout(800);
    const rus = await page
      .getByText("Поручения")
      .first()
      .isVisible()
      .catch(() => false);
    ok(`${label}: Russian mode`, rus);
    await page.screenshot({ path: `${outDir}/${label}-rus.png` });
    await page.getByRole("button", { name: "Lotin" }).first().click();
  } catch (e) {
    ok(`${label}: Russian mode`, false, e.message.split("\n")[0]);
  }
  // Accessibility + contrast (axe-core)
  try {
    await page.addScriptTag({ path: process.env.AXE_PATH ?? "/work/node_modules/axe-core/axe.min.js" });
    const axe = await page.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } });
      return r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        targets: v.nodes
          .slice(0, 25)
          .map(
            (n) =>
              `${n.target.join(" ")} ${n.any[0]?.data?.fgColor ?? ""}/${n.any[0]?.data?.bgColor ?? ""} ${n.any[0]?.data?.contrastRatio ?? ""}`,
          ),
      }));
    });
    const serious = axe.filter((v) => v.impact === "serious" || v.impact === "critical");
    ok(`${label}: axe serious/critical`, serious.length === 0, JSON.stringify(axe, null, 1).slice(0, 4000));
  } catch (e) {
    ok(`${label}: axe`, false, e.message.split("\n")[0]);
  }
  // Horizontal overflow on phones
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(`${label}: no horizontal overflow`, overflow <= 1, `${overflow}px`);
  await page.screenshot({ path: `${outDir}/${label}-home.png`, fullPage: false });
  ok(`${label}: no JS errors`, errors.length === 0, errors.slice(0, 5).join(" | "));
  await context.close();
}
await run({ width: 1440, height: 900 }, "desktop");
await run({ width: 390, height: 844 }, "mobile");
await browser.close();
console.log(results.join("\n"));
process.exitCode = results.some((line) => line.startsWith("FAIL")) ? 1 : 0;
