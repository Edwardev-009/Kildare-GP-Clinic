import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { CONSENT_KEY, CONSENT_LIFETIME_MS, createPreferences } from "../src/lib/cookie-consent.js";

// Supply KILDARE_PLAYWRIGHT_MODULE for a bundled runtime; do not add a production dependency.
const modulePath = process.env.KILDARE_PLAYWRIGHT_MODULE;
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : "playwright");
const origin = new URL(process.argv[2] || "http://127.0.0.1:4174").origin;
const screenshotDir = await mkdtemp(join(tmpdir(), "kildare-cookie-check-"));
const browser = await chromium.launch({ headless: true });
const allErrors = [];
const tests = [];
const screenshots = [];
const emailJsChunks = [];

async function check(name, fn) {
  await fn();
  tests.push(name);
  console.log(`PASS ${name}`);
}

async function harness({ preference, blockStorage = false, blockStorageGetter = false, mobile = false } = {}) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
    ...(mobile ? { isMobile: true, hasTouch: true } : {}),
    serviceWorkers: "block",
  });
  const requests = { analytics: [], maps: [], other: [], email: [] };
  // Every external request is intercepted, including fonts and EmailJS. No test sends mail.
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === origin) {
      if (/\/assets\/esm-[^/]+\.js$/.test(url.pathname)) emailJsChunks.push(url.href);
      return route.continue();
    }
    if (!["http:", "https:"].includes(url.protocol)) return route.continue();
    if (url.hostname === "www.googletagmanager.com") {
      requests.analytics.push(url.href);
      return route.fulfill({ contentType: "application/javascript", body: `
        window.__mockGaLoads = (window.__mockGaLoads || 0) + 1;
        document.cookie = "_ga=mock.123; path=/";
        document.cookie = "_ga_YVVFSVJP08=mock.456; path=/";
        fetch("https://www.google-analytics.com/g/collect?mock=1", {mode:"no-cors"});
      ` });
    }
    if (url.hostname.endsWith("google-analytics.com")) {
      requests.analytics.push(url.href);
      return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" }, body: "" });
    }
    if (["www.google.com", "maps.google.com"].includes(url.hostname) && url.pathname.startsWith("/maps")) {
      requests.maps.push(url.href);
      return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Mock Google Map</title><p>Mock map</p>" });
    }
    if (url.hostname.includes("emailjs")) requests.email.push(url.href);
    else requests.other.push(url.href);
    if (url.hostname === "fonts.googleapis.com") return route.fulfill({ contentType: "text/css", body: "" });
    return route.abort();
  });
  if (preference !== undefined) {
    await context.addInitScript(({ key, value, siteOrigin }) => {
      if (window.location.origin !== siteOrigin) return;
      // Only seed the initial navigation. A withdrawal reload must retain the newly saved choice.
      if (!sessionStorage.getItem("cookie-check-seeded")) {
        localStorage.setItem(key, value);
        sessionStorage.setItem("cookie-check-seeded", "yes");
      }
    }, { key: CONSENT_KEY, value: preference, siteOrigin: origin });
  }
  if (blockStorage) await context.addInitScript((siteOrigin) => {
    if (window.location.origin !== siteOrigin) return;
    // Denied storage operations exercise consent's session fallback without changing
    // the existing EmailJS library's top-level browser-storage reference.
    Storage.prototype.getItem = function () { throw new DOMException("Storage blocked", "SecurityError"); };
    Storage.prototype.setItem = function () { throw new DOMException("Storage blocked", "SecurityError"); };
  }, origin);
  if (blockStorageGetter) await context.addInitScript((siteOrigin) => {
    if (window.location.origin !== siteOrigin) return;
    Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new DOMException("Storage blocked", "SecurityError"); } });
  }, origin);
  function watch(page) {
    page.on("pageerror", (error) => allErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /hydration|hydrating|react error|Minified React error/i.test(message.text())) allErrors.push(message.text());
    });
  }
  context.on("page", watch);
  const page = await context.newPage();
  await page.goto(origin, { waitUntil: "networkidle" });
  return { context, page, requests };
}

const panel = (page) => page.getByRole("region", { name: "Cookie preferences" });
const maps = (page) => page.locator('iframe[src*="google.com/maps"]');
async function openSettings(page) {
  await page.getByRole("button", { name: "Cookie settings", exact: true }).click();
  await panel(page).getByRole("heading", { name: "Cookie settings" }).waitFor();
}
async function choose(page, { analytics, maps: allowMaps }) {
  if (!(await panel(page).getByRole("button", { name: "Save choices" }).count())) {
    await panel(page).getByRole("button", { name: "Choose cookies" }).click();
  }
  await panel(page).getByRole("checkbox", { name: /Website analytics/ }).setChecked(analytics);
  await panel(page).getByRole("checkbox", { name: /Embedded maps/ }).setChecked(allowMaps);
  await panel(page).getByRole("button", { name: "Save choices" }).click();
}
async function stored(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), CONSENT_KEY);
}
async function noOptional(page, requests) {
  assert.equal(await maps(page).count(), 0, "No embedded maps before map consent");
  assert.equal(requests.analytics.length, 0, "No analytics traffic before analytics consent");
  assert.equal(requests.maps.length, 0, "No Google Maps traffic before map consent");
  assert.equal(requests.email.length, 0, "Browser checks never contact EmailJS");
}
async function verifyPanelLayout(page) {
  const result = await panel(page).evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      left: box.left, right: box.right,
      panelWidth: element.clientWidth, panelScrollWidth: element.scrollWidth,
      buttons: Array.from(element.querySelectorAll("button")).map((button) => {
        const bounds = button.getBoundingClientRect();
        return { text: button.textContent, left: bounds.left, right: bounds.right, width: bounds.width, height: bounds.height };
      }),
    };
  });
  assert.ok(result.left >= 0 && result.right <= result.viewportWidth + 1, "Consent panel fits viewport");
  assert.ok(result.panelScrollWidth <= result.panelWidth + 1, "Consent panel has no horizontal overflow");
  assert.ok(result.documentWidth <= result.viewportWidth + 1, "Page has no horizontal overflow");
  for (const button of result.buttons) {
    assert.ok(button.left >= result.left && button.right <= result.right + 1, `${button.text}: button fits panel`);
    assert.ok(button.width > 0 && button.height > 0, `${button.text}: button rendered`);
  }
}
async function gaLoaded(page) {
  await page.waitForFunction(() => window.__mockGaLoads === 1);
  assert.equal(await page.locator("#kildare-google-analytics").count(), 1, "Exactly one GA script");
}
async function acceptAll(page) {
  await panel(page).getByRole("button", { name: "Accept optional" }).click();
  await gaLoaded(page);
  assert.ok(await maps(page).count());
}
async function rejectedAfterReload(page) {
  await page.waitForFunction(() => !document.getElementById("kildare-google-analytics") && window["ga-disable-G-YVVFSVJP08"] === true);
  assert.equal(await maps(page).count(), 0);
  const cookies = await page.context().cookies();
  assert.equal(cookies.filter((cookie) => /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(cookie.name)).length, 0, "Readable GA cookies removed on withdrawal");
}

try {
  await check("desktop fresh visit blocks optional services; rejection persists; protected content remains", async () => {
    const { context, page, requests } = await harness();
    await panel(page).getByRole("heading", { name: "Your cookie choices" }).waitFor();
    await noOptional(page, requests);
    await verifyPanelLayout(page);
    const screenshot = join(screenshotDir, "desktop-cookie-choices.png");
    await page.screenshot({ path: screenshot }); screenshots.push(screenshot);
    assert.equal(await page.locator(".team-card").count(), 3);
    assert.equal(await page.locator(".team-card").filter({ hasText: "Muqadas" }).getByRole("heading").innerText(), "Muqadas");
    assert.equal(await page.locator(".greviews__card").count(), 5);
    await panel(page).getByRole("button", { name: "Reject optional" }).click();
    assert.deepEqual({ analytics: (await stored(page)).analytics, maps: (await stored(page)).maps }, { analytics: false, maps: false });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await panel(page).count(), 0);
    await noOptional(page, requests);
    await page.goto(`${origin}/blog`, { waitUntil: "networkidle" });
    assert.equal(await page.locator(".blog-featured, .blog-card").count(), 6);
    await page.goto(`${origin}/medical-certificate`, { waitUntil: "networkidle" });
    assert.equal(await page.locator(".cert-card").count(), 4);
    await page.locator(".cert-card__btn").first().click();
    assert.equal(await page.getByRole("dialog").locator("form").count(), 1);
    await page.getByRole("dialog").getByRole("button", { name: /close/i }).click();
    assert.equal(requests.email.length, 0);
    await context.close();
  });

  await check("independent maps consent loads maps without analytics", async () => {
    const { context, page, requests } = await harness();
    await choose(page, { analytics: false, maps: true });
    await maps(page).first().scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('iframe[src*="google.com/maps"]'));
    assert.equal(requests.analytics.length, 0);
    assert.deepEqual({ analytics: (await stored(page)).analytics, maps: (await stored(page)).maps }, { analytics: false, maps: true });
    await page.reload({ waitUntil: "networkidle" });
    assert.ok(await maps(page).count());
    assert.equal(requests.analytics.length, 0);
    await page.goto(`${origin}/contact`, { waitUntil: "networkidle" });
    assert.equal(await maps(page).count(), 2, "Both preserved Contact and footer maps load with map consent");
    await page.locator('iframe[src*="maps.google.com/maps"]').scrollIntoViewIfNeeded();
    await page.locator('iframe[src*="maps.google.com/maps"]').contentFrame().getByText("Mock map").waitFor();
    assert.ok(requests.maps.some((url) => url.includes("maps.google.com")), "Contact Google Maps request intercepted");
    assert.equal(requests.analytics.length, 0);
    await context.close();
  });

  await check("independent analytics consent loads one GA script and no maps", async () => {
    const { context, page, requests } = await harness();
    await choose(page, { analytics: true, maps: false });
    await gaLoaded(page);
    assert.equal(await maps(page).count(), 0);
    assert.equal(requests.maps.length, 0);
    await openSettings(page);
    await panel(page).getByRole("button", { name: "Save choices" }).click();
    assert.equal(await page.evaluate(() => window.__mockGaLoads), 1, "Repeated consent does not duplicate GA");
    assert.equal(requests.analytics.filter((url) => url.includes("googletagmanager.com")).length, 1);
    const settings = await page.evaluate(() => window.dataLayer.map((entry) => Array.from(entry)).filter((entry) => entry[0] === "config")[0][2]);
    assert.equal(settings.allow_google_signals, false);
    assert.equal(settings.allow_ad_personalization_signals, false);
    assert.equal(settings.cookie_update, false);
    assert.equal(settings.cookie_expires, CONSENT_LIFETIME_MS / 1000);
    await context.close();
  });

  await check("accept all then withdraw removes cookies, unloads GA by reload, and blocks maps", async () => {
    const { context, page, requests } = await harness();
    await acceptAll(page);
    assert.equal((await context.cookies()).filter((cookie) => cookie.name.startsWith("_ga")).length, 2);
    const analyticsCount = requests.analytics.length;
    await openSettings(page);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      panel(page).getByRole("button", { name: "Reject optional" }).click(),
    ]);
    await rejectedAfterReload(page);
    assert.equal(requests.analytics.length, analyticsCount, "No new GA request after withdrawal");
    assert.equal(await panel(page).count(), 0, "Rejection saved before reload");
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(requests.analytics.length, analyticsCount);
    await page.goto(`${origin}/cookies`, { waitUntil: "networkidle" });
    assert.ok(await page.getByRole("heading", { level: 1 }).count());
    assert.ok(await page.getByRole("button", { name: "Cookie settings", exact: true }).count());
    await context.close();
  });

  await check("mobile choices and settings fit the viewport and rejection persists", async () => {
    const { context, page, requests } = await harness({ mobile: true });
    await panel(page).waitFor();
    await noOptional(page, requests);
    await verifyPanelLayout(page);
    const choicesScreenshot = join(screenshotDir, "mobile-cookie-choices.png");
    await page.screenshot({ path: choicesScreenshot }); screenshots.push(choicesScreenshot);
    await panel(page).getByRole("button", { name: "Choose cookies" }).click();
    await verifyPanelLayout(page);
    const settingsScreenshot = join(screenshotDir, "mobile-cookie-settings.png");
    await page.screenshot({ path: settingsScreenshot }); screenshots.push(settingsScreenshot);
    await panel(page).getByRole("button", { name: "Reject optional" }).click();
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await panel(page).count(), 0);
    await noOptional(page, requests);
    await context.close();
  });

  await check("malformed, future, expired and outdated preferences fail closed", async () => {
    const variants = [
      "{broken",
      JSON.stringify(createPreferences({ analytics: true, maps: true }, Date.now() + 60_000)),
      JSON.stringify(createPreferences({ analytics: true, maps: true }, Date.now() - CONSENT_LIFETIME_MS - 60_000)),
      JSON.stringify({ ...createPreferences({ analytics: true, maps: true }), version: 0 }),
    ];
    for (const preference of variants) {
      const { context, page, requests } = await harness({ preference });
      await panel(page).waitFor();
      await noOptional(page, requests);
      await context.close();
    }
  });

  await check("preferences expire while the page is open and optional services stop", async () => {
    const preference = JSON.stringify(createPreferences({ analytics: true, maps: true }, Date.now() - CONSENT_LIFETIME_MS + 4_000));
    const { context, page, requests } = await harness({ preference });
    await gaLoaded(page);
    assert.ok(await maps(page).count());
    const analyticsCount = requests.analytics.length;
    await panel(page).getByRole("heading", { name: "Your cookie choices" }).waitFor({ timeout: 10_000 });
    await rejectedAfterReload(page);
    assert.equal(requests.analytics.length, analyticsCount);
    await context.close();
  });

  await check("cross-tab rejection stops previously accepted analytics and maps", async () => {
    const { context, page, requests } = await harness();
    await acceptAll(page);
    const other = await context.newPage();
    await other.goto(origin, { waitUntil: "networkidle" });
    await gaLoaded(other);
    const analyticsCount = requests.analytics.length;
    await openSettings(other);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      other.waitForNavigation({ waitUntil: "networkidle" }),
      panel(other).getByRole("button", { name: "Reject optional" }).click(),
    ]);
    await rejectedAfterReload(page);
    await rejectedAfterReload(other);
    assert.equal(requests.analytics.length, analyticsCount);
    await context.close();
  });

  await check("cross-tab storage clearing fails closed for a previously accepted tab", async () => {
    const { context, page, requests } = await harness();
    await acceptAll(page);
    const other = await context.newPage();
    await other.goto(origin, { waitUntil: "networkidle" });
    await gaLoaded(other);
    const analyticsCount = requests.analytics.length;
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      other.evaluate(() => localStorage.clear()),
    ]);
    await panel(page).waitFor();
    await rejectedAfterReload(page);
    assert.equal(requests.analytics.length, analyticsCount);
    await context.close();
  });

  await check("blocked storage stays usable for this page session with explicit notice", async () => {
    const { context, page, requests } = await harness({ blockStorage: true });
    await noOptional(page, requests);
    await choose(page, { analytics: false, maps: true });
    await page.getByRole("status").filter({ hasText: "Your browser blocked preference storage" }).waitFor();
    assert.ok(await maps(page).count());
    assert.equal(requests.analytics.length, 0);
    await openSettings(page);
    await panel(page).getByRole("button", { name: "Reject optional" }).click();
    assert.equal(await maps(page).count(), 0);
    await page.reload({ waitUntil: "networkidle" });
    await panel(page).waitFor();
    assert.equal(await maps(page).count(), 0);
    assert.equal(requests.analytics.length, 0);
    await context.close();
  });

  await check("denied localStorage getter still hydrates and allows consent withdrawal", async () => {
    const { context, page, requests } = await harness({ blockStorageGetter: true });
    await noOptional(page, requests);
    await panel(page).getByRole("button", { name: "Choose cookies" }).click();
    await panel(page).getByRole("checkbox", { name: /Website analytics/ }).waitFor();
    await choose(page, { analytics: true, maps: true });
    await gaLoaded(page);
    assert.ok(await maps(page).count());
    await page.getByRole("status").filter({ hasText: "Your browser blocked preference storage" }).waitFor();
    const analyticsCount = requests.analytics.length;
    await openSettings(page);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      panel(page).getByRole("button", { name: "Reject optional" }).click(),
    ]);
    await rejectedAfterReload(page);
    await panel(page).waitFor();
    assert.equal(requests.analytics.length, analyticsCount);
    assert.equal(requests.email.length, 0);
    await context.close();
  });

  await check("deferred opening-hours source remains unchanged", async () => {
    const content = await readFile(new URL("../src/data/content.js", import.meta.url), "utf8");
    assert.match(content, /sessions: index < 4/);
    assert.match(content, /Monday–Saturday:/);
  });
  assert.deepEqual(allErrors, [], "No page errors or hydration failures");
  assert.deepEqual(emailJsChunks, [], "EmailJS remains lazy-loaded until form submission; tests never submit forms");
  console.log(`PASS ${tests.length} browser/static scenarios; no real external requests or emails sent`);
  for (const screenshot of screenshots) console.log(`SCREENSHOT ${screenshot}`);
} finally {
  await browser.close();
}
