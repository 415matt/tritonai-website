import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checkNewsletterLink, extractNewsletterLinks } from "../scripts/lib/newsletter-links.mjs";

const workflowUrl = new URL("../.github/workflows/sync-ai-news.yml", import.meta.url);

test("extracts unique HTTP links, resolves local routes, and ignores fragments and email", () => {
  const links = extractNewsletterLinks(`
[Local route](/about/ai-updates.html#2026-08-10)
[Same route](https://tritonai.ucsd.edu/about/ai-updates.html)
[External](https://today.ucsd.edu/story/example#details)
[Email](mailto:tritonai@ucsd.edu)
<a href="javascript:alert('unsafe')">Unsafe</a>
`);

  assert.deepEqual(links, [
    "https://tritonai.ucsd.edu/about/ai-updates.html",
    "https://today.ucsd.edu/story/example",
  ]);
});

test("falls back to GET when a server rejects HEAD", async () => {
  const methods = [];
  const result = await checkNewsletterLink("https://example.com/article", {
    fetchImpl: async (_url, options) => {
      methods.push(options.method);
      return new Response("", { status: options.method === "HEAD" ? 405 : 200 });
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
  assert.deepEqual(methods, ["HEAD", "GET"]);
});

test("fails closed after repeated HTTP errors", async () => {
  const result = await checkNewsletterLink("https://example.com/missing", {
    fetchImpl: async () => new Response("", { status: 404 }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 404);
  assert.equal(result.attempts.length, 3);
});

test("the scheduled sync checks changed newsletter links before site validation", async () => {
  const workflow = await readFile(workflowUrl, "utf8");
  const linkCheck = workflow.indexOf("name: Check links in updated newsletters");
  const siteValidation = workflow.indexOf("name: Validate the updated site");

  assert.ok(linkCheck >= 0, "sync-ai-news.yml must check newsletter links");
  assert.ok(siteValidation > linkCheck, "link checks must run before the full site validation");
  assert.match(workflow, /git diff --name-only --diff-filter=ACM -- content\/newsletters/);
  assert.match(workflow, /npm run check:newsletter-links -- "\$\{newsletters\[@\]\}"/);
});
