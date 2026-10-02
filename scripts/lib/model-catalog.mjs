import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { escapeHtml, renderModelCatalog } from "../../src/site/_resources/js/model-catalog-view.js";
export { escapeHtml, formatContext } from "../../src/site/_resources/js/model-catalog-view.js";

// The docs service owns the simplified, current-model view. This snapshot keeps
// the table usable before JavaScript loads and during an API outage.
export const CATALOG_JSON = path.resolve("content/models/catalog.json");
export const CATALOG_MARKDOWN = path.resolve("content/pages/build-landing.md");
export const MODEL_CATALOG_BASE_URL = process.env.MODEL_CATALOG_BASE_URL || "https://docs.tritonai.ucsd.edu/";
export const MODELS_ENDPOINT = new URL("/api/model-catalog", MODEL_CATALOG_BASE_URL).href;
export const MODEL_EXPLORER_URL = new URL("/models", MODEL_CATALOG_BASE_URL).href;
export const SECTION_START = "<!-- AGENT_SECTION: model-catalog -->";
export const SECTION_END = "<!-- END_AGENT_SECTION -->";

export async function fetchCatalog() {
  const response = await fetch(MODELS_ENDPOINT, {
    headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Model catalog request failed: HTTP ${response.status}`);
  const payload = await response.json();
  if (!payload || !Array.isArray(payload.models) || !payload.models.length
    || !Number.isFinite(Date.parse(payload.fetchedAt))
    || payload.models.some((model) => !model || typeof model.id !== "string" || !model.id
      || typeof model.displayName !== "string" || typeof model.type !== "string"
      || !["UC-hosted", "Approved enterprise cloud"].includes(model.hosting)
      || (model.maxInputTokens !== null && !Number.isFinite(model.maxInputTokens)))) {
    throw new Error("Model catalog returned invalid or empty data");
  }
  return { lastSynced: payload.fetchedAt, source: MODELS_ENDPOINT, models: payload.models };
}

export async function loadCatalog() {
  return JSON.parse(await readFile(CATALOG_JSON, "utf8"));
}

export function renderSection(catalog) {
  const refreshed = escapeHtml(catalog.lastSynced.slice(0, 10));
  return `${SECTION_START}
<section class="hub-section" id="model-catalog" aria-labelledby="model-catalog-heading" data-model-catalog-endpoint="${escapeHtml(MODELS_ENDPOINT)}">
<div class="hub-heading"><p class="home-kicker">Models and routes</p><h2 id="model-catalog-heading">Models available through the Gateway</h2><p>This view highlights the Gateway's most recent model series; it does not include every available model. Expand a family for request IDs and route limits. See the <a href="${MODEL_EXPLORER_URL}">full model list and details</a> for capabilities and rates.</p></div>
<div data-model-catalog-list>${renderModelCatalog(catalog.models, MODELS_ENDPOINT)}</div>
<p class="model-catalog-refreshed" data-model-catalog-status role="status">Saved model list from ${refreshed}. Checking for updates.</p>
<script type="module" src="/_resources/js/model-catalog.js"></script>
</section>
${SECTION_END}`;
}

export async function renderAndWrite(catalog) {
  const markdown = await readFile(CATALOG_MARKDOWN, "utf8");
  const start = markdown.indexOf(SECTION_START);
  const end = markdown.indexOf(SECTION_END);
  if (start === -1 || end === -1) {
    throw new Error(`Model catalog markers missing from ${CATALOG_MARKDOWN}`);
  }
  const next =
    markdown.slice(0, start) + renderSection(catalog) + markdown.slice(end + SECTION_END.length);
  await writeFile(CATALOG_MARKDOWN, next);
}
