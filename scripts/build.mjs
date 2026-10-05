import { build } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";

await build();
await build({
  build: {
    ssr: "src/entry-server.jsx",
    outDir: "dist-ssr",
    copyPublicDir: false,
  },
});

const { render, pages, discoveryFiles } = await import(pathToFileURL(resolve("dist-ssr/entry-server.js")).href);
const template = await readFile("dist/index.html", "utf8");
const sharedHead = template.match(/<head>([\s\S]*?)<\/head>/)[1];
const scripts = [...template.matchAll(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g)].map(([tag]) => tag).join("\n");
// Vite places module scripts in the template head; keep exactly one copy in body.
const head = sharedHead.replace(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g, "");

for (const page of [...pages, { path: "/404" }]) {
  const html = `<!doctype html>\n${render(page.path)}`
    .replace("<head>", `<head>${head}`)
    .replace("</body>", `${scripts}</body>`);
  const file = page.path === "/" ? "dist/index.html" : page.path === "/404" ? "dist/404.html" : `dist${page.path}/index.html`;
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log(`Prerendered ${page.path}`);
}

for (const [name, content] of Object.entries(discoveryFiles())) {
  // Also refresh public/ so development and the deployed build use the same files.
  await writeFile(resolve("public", name), content);
  await writeFile(resolve("dist", name), content);
}
console.log("Generated robots.txt, sitemap.xml, llms.txt, llms-full.txt and page Markdown summaries.");
