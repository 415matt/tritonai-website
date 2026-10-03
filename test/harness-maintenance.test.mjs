import test from "node:test";
import assert from "node:assert/strict";
import { load } from "cheerio";
import { applyHarnessPageMetadata } from "../scripts/lib/harness-page-metadata.mjs";
import { DOCUMENTS, validateSynthesis } from "../scripts/maintain-harness-release.mjs";

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
