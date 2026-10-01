import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimePath = path.join(repositoryRoot, "src/site/_resources/js/webmcp.js");

test("registers bounded, read-only WebMCP tools for public page content", async (context) => {
  const browser = await chromium.launch({ headless: true });
  context.after(() => browser.close());
  const page = await browser.newPage();

  const html = `<!doctype html>
    <html><head>
      <title>TritonAI test page</title>
      <meta name="description" content="Public test description">
      <link rel="canonical" href="https://tritonai.ucsd.edu/test.html">
    </head><body>
      <main id="main-content">
        <h1>Test heading</h1>
        <p>Public page content.</p>
        <p hidden>Hidden content.</p>
        <a href="/about/index.html">About TritonAI</a>
        <a href="https://today.ucsd.edu/">Today at UC San Diego</a>
      </main>
    </body></html>`;
  await page.route("https://tritonai.ucsd.edu/test.html", (route) => route.fulfill({ contentType: "text/html", body: html }));
  await page.goto("https://tritonai.ucsd.edu/test.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.__webMcpTools = [];
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        async registerTool(tool) {
          window.__webMcpTools.push(tool);
        },
      },
    });
  });
  await page.addScriptTag({ path: runtimePath });

  const result = await page.evaluate(() => {
    const pageTool = window.__webMcpTools.find((tool) => tool.name === "get-tritonai-page");
    const linksTool = window.__webMcpTools.find((tool) => tool.name === "list-tritonai-page-links");
    return {
      count: window.__webMcpTools.length,
      annotations: window.__webMcpTools.map((tool) => tool.annotations),
      page: pageTool.execute({}),
      internalLinks: linksTool.execute({ scope: "internal" }),
      allLinks: linksTool.execute({ scope: "all" }),
    };
  });

  assert.equal(result.count, 2);
  assert.deepEqual(result.annotations, [
    { readOnlyHint: true, untrustedContentHint: true },
    { readOnlyHint: true, untrustedContentHint: true },
  ]);
  assert.equal(result.page.title, "TritonAI test page");
  assert.equal(result.page.description, "Public test description");
  assert.equal(result.page.url, "https://tritonai.ucsd.edu/test.html");
  assert.match(result.page.text, /Public page content/);
  assert.doesNotMatch(result.page.text, /Hidden content/);
  assert.deepEqual(result.page.headings, [{ level: 1, text: "Test heading" }]);
  assert.equal(result.internalLinks.links.length, 1);
  assert.equal(result.internalLinks.links[0].external, false);
  assert.equal(result.allLinks.links.length, 2);
  assert.equal(result.allLinks.links[1].external, true);
});

test("does nothing when the browser does not support WebMCP", async (context) => {
  const browser = await chromium.launch({ headless: true });
  context.after(() => browser.close());
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent("<!doctype html><title>No WebMCP</title><main>Public content</main>");
  await page.addScriptTag({ path: runtimePath });
  assert.deepEqual(errors, []);
});
