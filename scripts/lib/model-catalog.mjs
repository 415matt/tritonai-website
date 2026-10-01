import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Shared helpers for the public model catalog. The JSON file
// content/models/catalog.json is the source of truth; this module renders it
// into the HTML that lives inside content/pages/build-landing.md so the daily
// sync job can refresh the list without hand-editing markup.

export const CATALOG_JSON = path.resolve("content/models/catalog.json");
export const CATALOG_MARKDOWN = path.resolve("content/pages/build-landing.md");
export const MODELS_ENDPOINT = "https://tritonai-api.ucsd.edu/public/model_hub";

export const SECTION_START = "<!-- AGENT_SECTION: model-catalog -->";
export const SECTION_END = "<!-- END_AGENT_SECTION -->";

// Entries that never belong in the public list: test and template
// registrations, dev fallbacks, and the TritonGPT-internal serving variants.
export function isPublicModel(id) {
  if (!id) return false;
  return !/^(?:onyx-|dev-|templ|test-)/.test(id) && !id.includes("-test-");
}

export function isVisiblePublicModel(model) {
  return (
    model?.is_public_model_group === true &&
    model?.visible === true &&
    isPublicModel(model.model_group)
  );
}

const CLOUD_PROVIDERS = new Set(["azure", "azure_ai", "bedrock", "vertex_ai", "gemini", "anthropic"]);

// Keep publishers in a stable, reviewable order. A model can be served by a
// different infrastructure provider (for example, Anthropic through Vertex AI
// or Bedrock), so the public model id is the reliable publisher signal here.
const MODEL_PUBLISHERS = [
  ["Anthropic", /^claude-/],
  ["Google", /^(?:gemini-|api-gemma-)/],
  ["OpenAI", /^(?:gpt-|api-gpt-oss-)/],
  ["Moonshot AI", /^(?:kimi-|moonshotai\.kimi-)/],
  ["MiniMax", /^minimax\./],
  ["Mistral AI", /^(?:mistral\.|api-mistral-)/],
  ["Amazon", /^us\.amazon\.nova-/],
  ["TritonAI", /^(?:api-)?tgpt-embeddings$/],
  ["DeepSeek", /^api-deepseek-/],
  ["Z.ai", /^api-glm-/],
  ["LightOn", /^api-lighton/],
  ["Cohere", /^api-cohere-/],
];

// Relative launch sequence within each publisher. These values only establish
// order; they are not dates. Review this map when a sync PR introduces a new
// model so a newly added family is placed correctly against existing families.
const MODEL_RECENCY = new Map([
  ["claude-opus-5", 700],
  ["claude-sonnet-5", 690],
  ["claude-opus-4-8", 680],
  ["claude-opus-4-7", 670],
  ["claude-sonnet-4-6", 660],
  ["claude-opus-4-6", 650],
  ["claude-opus-4-6-v1", 640],
  ["gemini-3.6-flash", 700],
  ["gemini-3.5-flash", 690],
  ["gemini-3.5-flash-lite", 680],
  ["api-gemma-4-31b", 670],
  ["api-gemma-4-26b", 660],
  ["gpt-5.6-luna", 700],
  ["gpt-5.6-sol", 700],
  ["gpt-5.6-terra", 700],
  ["gpt-5.5", 690],
  ["gpt-5.4", 680],
  ["api-gpt-oss-120b", 670],
  ["kimi-k2.6", 700],
  ["moonshotai.kimi-k2.5", 690],
  ["us.amazon.nova-2-lite-v1:0", 700],
  ["us.amazon.nova-premier-v1:0", 690],
  ["api-tgpt-embeddings", 700],
  ["tgpt-embeddings", 690],
]);

export function modelPublisher(id) {
  const match = MODEL_PUBLISHERS.find(([, pattern]) => pattern.test(id));
  return match?.[0] ?? "Other";
}

export function sortModelsByPublisherAndRecency(models) {
  const publisherOrder = new Map(MODEL_PUBLISHERS.map(([publisher], index) => [publisher, index]));
  return [...models].sort((a, b) => {
    const publisherA = modelPublisher(a.id);
    const publisherB = modelPublisher(b.id);
    const publisherDifference =
      (publisherOrder.get(publisherA) ?? MODEL_PUBLISHERS.length) -
      (publisherOrder.get(publisherB) ?? MODEL_PUBLISHERS.length);
    if (publisherDifference !== 0) return publisherDifference;

    const recencyDifference = (MODEL_RECENCY.get(b.id) ?? 0) - (MODEL_RECENCY.get(a.id) ?? 0);
    if (recencyDifference !== 0) return recencyDifference;

    return a.id.localeCompare(b.id, "en", { numeric: true });
  });
}

export function hostingFor(providers = []) {
  return providers.some((provider) => CLOUD_PROVIDERS.has(provider))
    ? "Approved enterprise cloud"
    : "UC-hosted";
}

// Common names for the current catalog. Unknown ids fall back to
// deriveDisplayName; the daily sync PR is the review point for new entries.
const DISPLAY_NAMES = {
  "gpt-5.4": "GPT-5.4",
  "gpt-5.5": "GPT-5.5",
  "gpt-5.6-luna": "GPT-5.6 Luna",
  "gpt-5.6-sol": "GPT-5.6 Sol",
  "gpt-5.6-terra": "GPT-5.6 Terra",
  "kimi-k2.6": "Kimi K2.6",
  "claude-opus-4-6-v1": "Claude Opus 4.6",
  "claude-opus-4-6": "Claude Opus 4.6",
  "claude-opus-4-7": "Claude Opus 4.7",
  "claude-opus-4-8": "Claude Opus 4.8",
  "claude-opus-5": "Claude Opus 5",
  "claude-sonnet-4-6": "Claude Sonnet 4.6",
  "claude-sonnet-5": "Claude Sonnet 5",
  "gemini-3.5-flash": "Gemini 3.5 Flash",
  "gemini-3.5-flash-lite": "Gemini 3.5 Flash Lite",
  "gemini-3.6-flash": "Gemini 3.6 Flash",
  "minimax.minimax-m2": "MiniMax M2",
  "mistral.mistral-large-3-675b-instruct": "Mistral Large 3",
  "moonshotai.kimi-k2.5": "Kimi K2.5",
  "us.amazon.nova-2-lite-v1:0": "Amazon Nova 2 Lite",
  "us.amazon.nova-premier-v1:0": "Amazon Nova Premier",
  "api-glm-5.2": "GLM 5.2",
  "api-glm-5.3": "GLM 5.3",
  "api-deepseek-v4-flash": "DeepSeek V4 Flash",
  "api-gemma-4-26b": "Gemma 4 26B",
  "api-gemma-4-31b": "Gemma 4 31B",
  "api-gpt-oss-120b": "GPT-OSS 120B",
  "api-mistral-small-3.2-2506": "Mistral Small 3.2",
  "api-lightonocr-1b": "LightOn OCR 1B",
  "api-cohere-transcribe": "Cohere Transcribe",
  "api-tgpt-embeddings": "TritonGPT Embeddings",
};

export function deriveDisplayName(id) {
  if (DISPLAY_NAMES[id]) return DISPLAY_NAMES[id];
  return id
    .replace(/^api-/, "")
    .replace(/^us\./, "")
    .replace(/^[a-z]+\./, "")
    .replace(/-v\d+(?::\d+)?$/, "")
    .replace(/:\d+$/, "")
    .split("-")
    .map((token) => (/^\d/.test(token) ? token : token.charAt(0).toUpperCase() + token.slice(1)))
    .join(" ");
}

const TYPE_RULES = [
  [/embed/i, "Embeddings"],
  [/ocr/i, "Document OCR"],
  [/transcribe|whisper/i, "Speech to text"],
  [/tts/i, "Text to speech"],
];

export function modelType(id, mode) {
  if (mode === "embedding") return "Embeddings";
  if (mode === "audio_transcription") return "Speech to text";
  if (mode === "audio_speech") return "Text to speech";
  for (const [pattern, label] of TYPE_RULES) {
    if (pattern.test(id)) return label;
  }
  return "Chat and reasoning";
}

export function formatContext(tokens) {
  if (!Number.isFinite(tokens) || tokens <= 0) return "See Model Hub";
  if (tokens >= 1000000) {
    // 1,048,576 and 1,050,000 both read as "1M" to a builder choosing a route.
    const millions = tokens / 1000000;
    const rounded = millions < 1.1 ? 1 : Number.parseFloat(millions.toFixed(1));
    return `${rounded}M tokens`;
  }
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}K tokens`;
  return `${tokens} tokens`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function fetchCatalog() {
  const response = await fetch(MODELS_ENDPOINT);
  if (!response.ok) {
    throw new Error(`Model Hub request failed: HTTP ${response.status}`);
  }
  const payload = await response.json();
  const models = (Array.isArray(payload) ? payload : [])
    .filter(isVisiblePublicModel)
    .map((model) => ({
      id: model.model_group,
      displayName: deriveDisplayName(model.model_group),
      type: modelType(model.model_group, model.mode),
      hosting: hostingFor(model.providers),
      maxInputTokens: Number.isFinite(model.max_input_tokens) ? model.max_input_tokens : null,
    }));
  return sortModelsByPublisherAndRecency(models);
}

export async function loadCatalog() {
  return JSON.parse(await readFile(CATALOG_JSON, "utf8"));
}

// UC-hosted routes come first: they carry no recharge for campus
// administrative work and are the default suggestion on the Get Started page.
export function sortModelsByHosting(models) {
  const rank = (model) => (model.hosting === "UC-hosted" ? 0 : 1);
  return [...models].sort((a, b) => rank(a) - rank(b));
}

// The route the Get Started page uses in its setup examples. Keep this list
// and src/site/developer-apis/start.html in step; validate.mjs checks that
// every request ID on that page still exists in the synced catalog.
const PREFERRED_DEFAULT_ROUTES = ["api-glm-5.3", "api-glm-5.2"];

export function defaultRoute(models) {
  for (const id of PREFERRED_DEFAULT_ROUTES) {
    const match = models.find((model) => model.id === id);
    if (match) return match;
  }
  return models.find((model) => model.hosting === "UC-hosted" && model.type === "Chat and reasoning") ?? null;
}

export function renderSection(catalog) {
  const models = sortModelsByHosting(catalog.models);
  const suggested = defaultRoute(models);
  const suggestion = suggested
    ? ` Start with a UC-hosted route such as <strong>${escapeHtml(suggested.displayName || suggested.id)}</strong> (<code class="model-catalog-request-id">${escapeHtml(suggested.id)}</code>). Move to a cloud route when a task needs it.`
    : "";
  const rows = models
    .map(
      (model) =>
        `<tr><td><strong>${escapeHtml(model.displayName || model.id)}</strong><br><code class="model-catalog-request-id">${escapeHtml(model.id)}</code></td><td>${escapeHtml(model.hosting)}</td><td>${escapeHtml(model.type)}</td><td>${escapeHtml(
          formatContext(model.maxInputTokens),
        )}</td></tr>`,
    )
    .join("\n");
  const refreshed = escapeHtml(catalog.lastSynced.slice(0, 10));
  return `${SECTION_START}
<section class="hub-section" id="model-catalog" aria-labelledby="model-catalog-heading">
<div class="hub-heading"><p class="home-kicker">Models and routes</p><h2 id="model-catalog-heading">Models available through the Gateway</h2><p>The Gateway lists these models today. UC-hosted open models appear first, followed by approved enterprise cloud models.${suggestion} The code under each name is the request ID to use through the Gateway, and context length is the amount of input a request can carry. Rates and full details stay in the <a href="https://tritonai-api.ucsd.edu/ui/model_hub_table/">Model Hub</a>.</p></div>
<div class="table-responsive" role="region" aria-label="Current model catalog" tabindex="0"><table class="table table-striped model-catalog-table">
<caption class="sr-only">Models currently listed by the TritonAI gateway with their hosting, type, and context length</caption>
<thead><tr><th scope="col">Model</th><th scope="col">Hosting</th><th scope="col">Type</th><th scope="col">Context length</th></tr></thead>
<tbody>
${rows}
</tbody>
</table></div>
<p class="model-catalog-refreshed">List refreshed from the public Model Hub on ${refreshed}. Test registrations and TritonGPT-internal serving entries are excluded.</p>
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
