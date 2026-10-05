import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pages, SITE_URL, ROBOTS, markdownPath } from "../src/data/seo.js";
import { clinic, openingSchedule, hoursSummary, faqs } from "../src/data/content.js";

const sitemap = await readFile("dist/sitemap.xml", "utf8");
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]), pages.map((page) => `${SITE_URL}${page.path}`));

for (const page of pages) {
  const file = page.path === "/" ? "dist/index.html" : `dist${page.path}/index.html`;
  const html = await readFile(file, "utf8");
  const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
  const meta = (name, attribute = "name") => {
    const matches = [...head.matchAll(new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"`, "g"))];
    assert.equal(matches.length, 1, `${page.path}: exactly one ${name} tag`);
    return matches[0][1];
  };
  assert.equal((head.match(/<title>/g) || []).length, 1, `${page.path}: one title`);
  assert.ok(head.includes(`${page.title.replaceAll("&", "&amp;")} | ${clinic.name}</title>`));
  assert.equal(meta("description"), page.description);
  assert.equal(meta("robots"), ROBOTS);
  assert.equal(meta("og:url", "property"), `${SITE_URL}${page.path}`);
  assert.equal(meta("twitter:card"), "summary_large_image");
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(head.includes(`rel="canonical" href="${SITE_URL}${page.path}"`));
  assert.ok(head.includes(`href="${SITE_URL}${markdownPath(page.path)}"`));
  assert.ok(head.includes(`href="${SITE_URL}/llms.txt"`));
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${page.path}: readable primary heading`);
  assert.ok(html.includes('data-prerendered="true"'));
  assert.equal((html.match(/<script type="module"/g) || []).length, 1);
  assert.ok(html.includes(hoursSummary.replaceAll("&", "&amp;")));
  assert.ok(!/open (?:7|seven) days a week/i.test(html));

  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(schemas.length, 1, `${page.path}: one schema graph`);
  const graph = JSON.parse(schemas[0][1])["@graph"];
  const clinicSchema = graph.find((node) => node["@type"] === "MedicalClinic");
  assert.equal(clinicSchema.telephone, clinic.phoneHref.slice(4));
  assert.deepEqual(clinicSchema.address, { "@type": "PostalAddress", ...clinic.structuredAddress });
  const expected = openingSchedule.flatMap(({ day, sessions }) =>
    (sessions.length ? sessions : [{ opens: "00:00", closes: "00:00" }]).map((session) => ({ day, ...session })),
  );
  assert.deepEqual(clinicSchema.openingHoursSpecification.map(({ dayOfWeek, opens, closes }) => ({ day: dayOfWeek.split("/").at(-1), opens, closes })), expected);
  if (page.path === "/") {
    const faqSchema = graph.find((node) => node["@type"] === "FAQPage");
    assert.deepEqual(faqSchema.mainEntity.map(({ name, acceptedAnswer }) => ({ question: name, answer: acceptedAnswer.text })), faqs);
  }
  assert.ok(!graph.some((node) => node["@type"] === "Article"), "Do not mark preview cards as full medical articles");
  for (const [, asset] of html.matchAll(/(?:src|href)="(\/(?:assets\/[^"?#]+|favicon\.svg))"/g)) {
    await access(resolve("dist", asset.slice(1)));
  }
  console.log(`PASS ${page.path}: static content, metadata, schema, hours and assets`);
}

const robots = await readFile("dist/robots.txt", "utf8");
assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
for (const agent of ["*", "Googlebot", "Bingbot", "OAI-SearchBot", "PerplexityBot", "Claude-SearchBot", "GPTBot", "ClaudeBot"]) {
  assert.ok(robots.includes(`User-agent: ${agent}\nAllow: /`));
}
assert.ok(!/^Disallow:\s*\//m.test(robots));

const llms = await readFile("dist/llms.txt", "utf8");
assert.ok(llms.startsWith(`# ${clinic.name}\n\n> `));
for (const [, target] of llms.matchAll(/\]\((https:\/\/[^)]+)\)/g)) {
  const url = new URL(target);
  assert.equal(url.origin, SITE_URL);
  const content = await readFile(resolve("dist", url.pathname.slice(1)), "utf8");
  assert.ok(content.length > 0);
}
for (const name of ["robots.txt", "sitemap.xml", "llms.txt", "llms-full.txt", ...pages.map((page) => markdownPath(page.path).slice(1))]) {
  assert.equal(await readFile(`dist/${name}`, "utf8"), await readFile(`public/${name}`, "utf8"));
}
assert.ok((await readFile("dist/contact.md", "utf8")).includes(hoursSummary));
assert.ok((await readFile("dist/404.html", "utf8")).includes('content="noindex, follow"'));
console.log("PASS crawler access, sitemap, AI discovery links, public/build parity and noindex 404");
