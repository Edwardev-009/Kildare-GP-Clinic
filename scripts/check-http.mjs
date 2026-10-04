import assert from "node:assert/strict";
import { pages, SITE_URL } from "../src/data/seo.js";
import { discoveryFiles } from "../src/data/discovery.js";

const origin = process.argv[2] || "http://127.0.0.1:4173";
for (const page of pages) {
  const response = await fetch(new URL(page.path, origin), { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, page.path);
  assert.match(response.headers.get("content-type"), /text\/html/);
  const html = await response.text();
  assert.ok(html.includes(`rel="canonical" href="${SITE_URL}${page.path}"`), `${page.path}: correct page is served`);
  assert.ok(html.includes('data-prerendered="true"'), `${page.path}: static content is served`);
  console.log(`PASS HTTP 200 ${page.path}: correct static page and canonical`);
}
for (const [name, expected] of Object.entries(discoveryFiles())) {
  const response = await fetch(new URL(`/${name}`, origin), { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, name);
  const type = response.headers.get("content-type") || "";
  assert.match(type, name.endsWith(".xml") ? /(?:application|text)\/xml/ : name.endsWith(".md") ? /text\/(?:plain|markdown)/ : /text\/plain/);
  assert.equal(await response.text(), expected, `${name}: exact generated content, not a fallback HTML page`);
  console.log(`PASS HTTP 200 /${name}: ${type}`);
}
const missing = await fetch(new URL('/seo-check-missing-page', origin), { signal: AbortSignal.timeout(15000) });
assert.equal(missing.status, 404, 'Missing page must return an actual 404, not a soft 404');
assert.ok((await missing.text()).includes('content="noindex, follow"'));
console.log('PASS HTTP 404 missing page with noindex');
