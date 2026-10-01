import { writeFile } from "node:fs/promises";
import {
  CATALOG_JSON,
  MODELS_ENDPOINT,
  fetchCatalog,
  loadCatalog,
  renderAndWrite,
} from "./lib/model-catalog.mjs";

// Refresh the public model catalog from the TritonAI Model Hub.
//   node scripts/sync-model-hub.mjs           fetch, update JSON, re-render page
//   node scripts/sync-model-hub.mjs --check   fetch and report drift, write nothing
//
// Uses the unauthenticated public Model Hub endpoint, which lists the full
// catalog: approved enterprise cloud models and UC-hosted open models.

const checkOnly = process.argv.includes("--check");

const models = await fetchCatalog();
if (models.length === 0) {
  console.error("Gateway returned no public models; refusing to write an empty catalog.");
  process.exit(1);
}

let previous = { models: [] };
try {
  previous = await loadCatalog();
} catch {
  // First run: no catalog yet.
}

const before = JSON.stringify(previous.models);
const after = JSON.stringify(models);
const changed = before !== after;

if (checkOnly) {
  console.log(
    changed
      ? `Drift: gateway lists ${models.length} public models; stored catalog has ${previous.models.length}.`
      : `Catalog is current (${models.length} public models).`,
  );
  process.exit(0);
}

const catalog = { lastSynced: new Date().toISOString(), source: MODELS_ENDPOINT, models };
await writeFile(CATALOG_JSON, `${JSON.stringify(catalog, null, 2)}\n`);
await renderAndWrite(catalog);
console.log(
  changed
    ? `Updated catalog: ${models.length} public models.`
    : `Re-rendered catalog without changes (${models.length} public models).`,
);
