import test from "node:test";
import assert from "node:assert/strict";
import { load } from "cheerio";
import { applyHarnessPageMetadata } from "../scripts/lib/harness-page-metadata.mjs";
import { DOCUMENTS, validateSynthesis } from "../scripts/maintain-harness-release.mjs";
import { readPublicPage } from "../scripts/lib/public-page-fetch.mjs";
import { harnessPublicationIssues } from "../scripts/lib/harness-publication.mjs";

test("publication verifies the redesigned Build hub while rejecting missing product versions and stale content", () => {
  const releases = { latestTag: "v0.3.6" };
  const summary = { highlights: ["New sign-in option."], guidance: { privacy: ["Memory is optional."] } };
  const installer = { guided: { platforms: { mac: { downloadUrl: "https://example.com/mac.dmg" }, windows: { downloadUrl: "https://example.com/windows.exe" } } } };
  const hub = '<main id="main-content"><a href="/developer-apis/harness.html">Harness</a><a href="/developer-apis/harness-release-notes.html">Release notes</a><a href="/developer-apis/start.html#harness">Set up</a></main>';
  const check = (route, html) => harnessPublicationIssues(route, html, releases, summary, installer);
  assert.deepEqual(check("/developer-apis/index.html", hub), []);
  assert.match(check("/developer-apis/index.html", hub.replace('/developer-apis/harness.html', '/other.html')).join(), /missing Harness resource link/);
  assert.match(check("/developer-apis/harness.html", hub).join(), /missing current version/);
  const current = '<main id="main-content"><span data-harness-version>0.3.6</span><ul data-harness-guidance="privacy"><li>Memory is optional.</li></ul></main>';
  assert.deepEqual(check("/developer-apis/harness.html", current), []);
  assert.match(check("/developer-apis/harness.html", current.replace('0.3.6', '0.3.5')).join(), /version differs/);
  assert.match(check("/developer-apis/harness.html", current.replace('optional', 'required')).join(), /privacy guidance differs/);
  assert.match(check("/developer-apis/start.html", current).join(), /guided installer link differs/);
  const history = '<main id="main-content"><article id="harness-v0-3-6">New sign-in option.</article></main>';
  assert.deepEqual(check("/developer-apis/harness-release-notes.html", history), []);
  assert.match(check("/developer-apis/harness-release-notes.html", history.replace('harness-v0-3-6', 'harness-v0-3-5')).join(), /missing current release/);
});

test("public verification retries interrupted connections but fails on HTTP errors", async () => {
  const url = "https://tritonai.ucsd.edu/developer-apis/harness-release-notes.html";
  assert.equal(await readPublicPage(url, async () => { throw new TypeError("fetch failed"); }), null);
  assert.equal(await readPublicPage(url, async () => ({ ok: true, text: async () => { throw new TypeError("terminated"); } })), null);
  assert.equal(await readPublicPage(url, async () => ({ ok: true, text: async () => "published text" })), "published text");
  await assert.rejects(readPublicPage(url, async () => ({ ok: false, status: 404 })), /returned 404/);
});

test("a new stable release updates related page markers without changing chrome", () => {
  const $ = load('<header><span data-harness-version>old chrome</span></header><main id="main-content"><strong data-harness-version>old</strong><a data-harness-doc="docs/user/memory.md">Memory</a><a data-harness-release>History</a><ul data-harness-current-highlights></ul></main>');
  applyHarnessPageMetadata($, { latestTag: "v2.3.4", lastReviewed: "2026-10-03", releases: [{ tag: "v2.3.4", notesUrl: "https://github.com/dbalders/TritonAI-Harness/releases/tag/v2.3.4" }] }, { releases: { "v2.3.4": { highlights: ['Text <script>alert(1)</script>'] } } });
  assert.equal($("main strong").text(), "2.3.4");
  assert.equal($("header span").text(), "old chrome");
  assert.match($("[data-harness-doc]").attr("href"), /\/v2\.3\.4\/docs\/user\/memory.md$/);
  assert.match($("main [data-harness-release]").attr("href"), /#harness-v2-3-4$/);
  assert.equal($("main script").length, 0);
});

test("automatic claims require exact official-source evidence and every related page", () => {
  const source = "https://github.com/dbalders/TritonAI-Harness/releases/tag/v2.3.4";
  const sources = { [source]: "Memory is enabled by default, but OneDrive sync is optional." };
  const item = { text: "Memory is enabled by default.", evidence: [{ source, quote: "Memory is enabled by default" }] };
  const value = { version: "v2.3.4", highlights: [item, item, item], guidance: Object.fromEntries(Object.keys(DOCUMENTS).map((key) => [key, [item]])) };
  assert.equal(validateSynthesis(value, "v2.3.4", sources), value);
  assert.throws(() => validateSynthesis({ ...value, version: "v2.3.5" }, "v2.3.4", sources), /shape/);
  assert.throws(() => validateSynthesis(value, "v2.3.4", {}), /absent/);
  assert.throws(() => validateSynthesis({ ...value, guidance: {} }, "v2.3.4", sources), /related page/);
  assert.throws(() => validateSynthesis({ ...value, highlights: [{ ...item, text: '<script>' }, item, item] }, "v2.3.4", sources), /Invalid public/);
});


test("release highlights reject engineering language while preserving source checks", () => {
  const source = "https://github.com/dbalders/TritonAI-Harness/releases/tag/v2.3.4";
  const quote = "The managed Codex engine updates automatically when no session is running.";
  const evidence = [{ source, quote }];
  const friendly = { text: "Background software for the AI assistant updates when you are not using it.", evidence };
  const value = { version: "v2.3.4", highlights: [friendly, friendly, friendly], guidance: Object.fromEntries(Object.keys(DOCUMENTS).map((key) => [key, [friendly]])) };
  assert.equal(validateSynthesis(value, "v2.3.4", { [source]: quote }), value);
  for (const text of ["The managed Codex engine updates automatically.", "Credentials stay fresh while threads are idle.", "Runtime backfill is improved.", "The built-in Codex helper updates itself."]) {
    assert.throws(() => validateSynthesis({ ...value, highlights: [{ text, evidence }, friendly, friendly] }, "v2.3.4", { [source]: quote }), /nontechnical reader/);
  }
});
