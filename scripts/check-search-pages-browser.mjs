import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { pages, SITE_URL } from "../src/data/seo.js";
import { physioArticle, physioPath } from "../src/data/physio.js";

const modulePath = process.env.KILDARE_PLAYWRIGHT_MODULE;
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : "playwright");
const origin = new URL(process.argv[2] || "http://127.0.0.1:4173").origin;
const screenshotDir = resolve(".seo-preview.local");
await mkdir(screenshotDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  // Verify local UI without sending analytics, loading maps or submitting forms.
  await context.route("**/*", (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${origin}/`);
  await page.getByRole("button", { name: "Reject optional", exact: true }).click();
  for (const width of [1440, 1180, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/", "/blog", physioPath, physioArticle.path]) {
      await page.goto(`${origin}${path}`);
      await page.waitForFunction(() => !document.querySelector(".cookie-panel"));
      assert.equal(await page.locator("main h1").count(), 1);
      const expected = pages.find((item) => item.path === path);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `${SITE_URL}${path}`);
      assert.ok((await page.title()).startsWith(expected.title));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} fits ${width}px viewport`);
      if (width === 1440 || width === 390) await page.screenshot({ path: resolve(screenshotDir, `${path === "/" ? "home" : path.replaceAll("/", "-").slice(1)}-${width}.png`), fullPage: true });
    }
    console.log(`PASS pages, metadata and no overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/`);
  await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Physio", exact: true }).click();
  await page.waitForURL(`${origin}${physioPath}`);
  await page.waitForFunction(() => document.title.includes("Kildare Physio"));
  await page.getByRole("link", { name: "Read our guide to your first physio appointment" }).click();
  await page.waitForURL(`${origin}${physioArticle.path}`);
  await page.waitForFunction(() => document.querySelector('meta[property="og:type"]')?.content === "article");
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `${SITE_URL}${physioArticle.path}`);
  const article = await page.locator('script[type="application/ld+json"]').textContent();
  assert.ok(JSON.parse(article)["@graph"].some((item) => item["@type"] === "BlogPosting"));
  await page.getByRole("navigation", { name: "Breadcrumb", exact: true }).getByRole("link", { name: "Health notes", exact: true }).click();
  await page.waitForURL(`${origin}/blog`);
  await page.waitForFunction(() => document.querySelector('meta[property="og:type"]')?.content === "website");
  assert.equal(await page.locator(".blog-card").count(), 6, "Existing preview cards remain available");
  console.log("PASS hydrated navigation and metadata/schema updates");
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(`${origin}/`);
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Physio", exact: true }).click();
  await page.waitForURL(`${origin}${physioPath}`);
  assert.equal(await page.getByRole("button", { name: "Open menu", exact: true }).getAttribute("aria-expanded"), "false");
  assert.equal(await page.locator('a[href="tel:+353858678192"]').count() > 0, true);
  assert.deepEqual(errors, [], "No hydration or runtime errors");
  console.log(`PASS mobile navigation, contact links and no runtime errors; screenshots: ${screenshotDir}`);
} finally {
  await browser.close();
}
