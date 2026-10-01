import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

import {
  CANVAS_SELECTOR,
  CHROME_REGIONS,
  CONTRACT_JSON,
  buildContract,
  checkCrossPageConsistency,
  checkGoldenFingerprint,
  checkStructuralRules,
  extractChrome,
  foldByRule,
  formatFindings,
  loadChromeContract,
  loadChromeSelectors,
  regionElements,
} from "./lib/chrome-contract.mjs";
import {
  collectTokens,
  deriveProtectedTokens,
  loadStylingPolicy,
  scanScript,
  scanStylesheet,
} from "./lib/chrome-styling.mjs";

// Standalone runner for the chrome integrity gate. `npm run validate` runs the
// same checks as part of the full suite; this exists so an agent that trips the
// gate can iterate in under a second instead of waiting on validate's remote
// dependency fetches.
//
//   --check    run all three tiers, exit 1 on failure (default)
//   --accept   rewrite config/chrome-contract.json, refusing while tier 1 or
//              tier 3 is failing
//   --explain  print the protected boundary

const DIST_DIR = path.resolve("dist");
const SITE_BASE_PATH = (process.env.SITE_BASE_PATH || "").replace(/^\/+|\/+$/g, "");
const STANDALONE_ROUTES = new Set([
  "/presentations/managing-the-tritonai-website.html",
  "/tritongpt/bgpt-chat-generator/index.html",
  "/training/harness/index.html",
]);
// Tier 4 reads the sources rather than dist, so a finding points at the file to
// edit. The copies under dist/_resources are byte-identical.
const SITE_CSS_DIR = path.resolve("src/site/_resources/css");
const SITE_JS_DIR = path.resolve("src/site/_resources/js");

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

async function listFiles(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(absolute, base)));
    else files.push(path.relative(base, absolute));
  }
  return files;
}

/**
 * Parse every non-standalone route once and return both the canonical region
 * trees (for tiers 1 and 2) and the tier 3 findings, which need the live
 * cheerio nodes and so must be collected during the same pass.
 */
export async function collectChrome(distDir = DIST_DIR, basePath = SITE_BASE_PATH) {
  const { rules, expired } = await loadChromeSelectors();
  const files = (await listFiles(distDir)).filter((file) => file.endsWith(".html"));
  const regionsByRoute = new Map();
  const structural = [...expired];
  const chromeTokens = new Set();
  const canvasTokens = new Set();

  for (const file of files) {
    const route = file === "index.html" ? "/" : `/${file}`;
    if (STANDALONE_ROUTES.has(route)) continue;
    const $ = load(await readFile(path.join(distDir, file), "utf8"));
    regionsByRoute.set(route, extractChrome($, { route, basePath }));
    for (const finding of checkStructuralRules($, regionElements($), rules, { route, basePath })) {
      structural.push({ page: route, ...finding });
    }
    for (const node of Object.values(regionElements($))) collectTokens($, node, chromeTokens);
    const canvas = $(CANVAS_SELECTOR).first();
    if (canvas.length) collectTokens($, canvas, canvasTokens);
  }
  return { regionsByRoute, structural, ruleCount: rules.length, chromeTokens, canvasTokens };
}

/**
 * Tier 4: no site-authored stylesheet or script may reach into the shell.
 * Derives the protected token set from what the pages actually render, so it
 * tracks the Decorator instead of a hand-maintained list.
 */
export async function collectStyling({ chromeTokens, canvasTokens }) {
  const { allow, expired, widgetTokens } = await loadStylingPolicy();
  const tokens = deriveProtectedTokens({ chromeTokens, canvasTokens, widgetTokens });
  const findings = [...expired];

  for (const file of (await readdir(SITE_CSS_DIR)).filter((name) => name.endsWith(".css"))) {
    const relative = `src/site/_resources/css/${file}`;
    findings.push(...scanStylesheet(await readFile(path.join(SITE_CSS_DIR, file), "utf8"), relative, tokens, allow));
  }
  for (const file of (await readdir(SITE_JS_DIR)).filter((name) => name.endsWith(".js") && !name.endsWith(".min.js"))) {
    const relative = `src/site/_resources/js/${file}`;
    findings.push(...scanScript(await readFile(path.join(SITE_JS_DIR, file), "utf8"), relative, tokens, allow));
  }
  return { findings, tokenCount: tokens.size };
}

export async function runTiers(distDir = DIST_DIR, basePath = SITE_BASE_PATH) {
  const { regionsByRoute, structural, ruleCount, chromeTokens, canvasTokens } = await collectChrome(distDir, basePath);
  const contract = await loadChromeContract();
  const styling = await collectStyling({ chromeTokens, canvasTokens });
  return {
    regionsByRoute,
    ruleCount,
    tokenCount: styling.tokenCount,
    tier1: checkCrossPageConsistency(regionsByRoute),
    tier2: checkGoldenFingerprint(regionsByRoute, contract),
    tier3: foldByRule(structural),
    tier4: styling.findings,
  };
}

function explain(ruleCount, tokenCount) {
  const lines = [
    "Protected page chrome — these regions are shared by every route and are not editable as content:",
    "",
  ];
  for (const { id, label, selector } of CHROME_REGIONS) {
    lines.push(`  ${id.padEnd(14)} ${label}`);
    lines.push(`  ${" ".repeat(14)} ${selector}`);
  }
  lines.push("");
  lines.push(`Writable canvas: ${CANVAS_SELECTOR}`);
  lines.push("");
  lines.push("Everything a page says belongs inside the canvas. The chrome comes from the");
  lines.push("shared UC San Diego Decorator shell and is pinned by four checks:");
  lines.push("");
  lines.push("  chrome/consistent/*  every route must carry identical chrome");
  lines.push("  chrome/golden/*      the chrome must match config/chrome-contract.json");
  lines.push(`  chrome/structure/*   the chrome must satisfy ${ruleCount} selector rules derived`);
  lines.push("                       from the pristine templates in vendor/decorator-5/");
  lines.push(`  chrome/styling/*     no site CSS or JS may target the shell (${tokenCount} protected`);
  lines.push("                       class and id tokens, derived from the built pages)");
  lines.push("");
  lines.push("A golden mismatch can be accepted with `npm run chrome:accept` once a human");
  lines.push("has reviewed the diff. A structural or styling violation cannot — restore the");
  lines.push("markup from the vendor template, or move the rule inside the canvas.");
  lines.push("");
  lines.push("CSS and JS for main#main-content are yours. The shell carries its own");
  lines.push("presentation and its own responsive behavior from cdn.ucsd.edu; an override");
  lines.push("here does not follow it across a breakpoint. Record a reviewed exception in");
  lines.push("config/chrome-styling.json only when a rule repairs layout rather than");
  lines.push("restyling the shell.");
  lines.push("");
  lines.push("If a task genuinely requires a chrome change, say so and stop. Do not edit the");
  lines.push("shell to make a content change fit.");
  return lines.join("\n");
}

async function main() {
  if (hasFlag("explain")) {
    const { rules } = await loadChromeSelectors();
    const { chromeTokens, canvasTokens } = await collectChrome();
    const { tokenCount } = await collectStyling({ chromeTokens, canvasTokens });
    console.log(explain(rules.length, tokenCount));
    return;
  }

  const { regionsByRoute, tier1, tier2, tier3, tier4, ruleCount, tokenCount } = await runTiers();

  if (hasFlag("accept")) {
    const blocking = [...tier1, ...tier3, ...tier4];
    if (blocking.length) {
      console.error(formatFindings(blocking));
      console.error("");
      console.error("Refusing to write config/chrome-contract.json.");
      console.error(
        tier1.length
          ? "Routes disagree about the chrome. Accepting now would bake one route's drift into the contract."
          : tier3.length
            ? "The chrome violates a structural rule. Accepting now would record the regression as the new baseline."
            : "Site CSS or JS targets the shell. The golden records markup, so accepting would not make that rule legitimate — move it inside the canvas.",
      );
      process.exitCode = 1;
      return;
    }
    const vendorLock = await readFile(path.resolve("vendor/decorator-5/decorator.lock.json"), "utf8")
      .then((raw) => {
        const lock = JSON.parse(raw);
        return { decoratorVersion: lock.version ?? null, fetchedAt: lock.fetchedAt ?? null };
      })
      .catch(() => null);
    const contract = buildContract(regionsByRoute, { siteBasePath: SITE_BASE_PATH, vendor: vendorLock });
    await mkdir(path.dirname(CONTRACT_JSON), { recursive: true });
    await writeFile(CONTRACT_JSON, `${JSON.stringify(contract, null, 2)}\n`);
    console.log(
      `Recorded ${Object.keys(contract.regions).length} chrome regions from ${regionsByRoute.size} routes into ${path.relative(process.cwd(), CONTRACT_JSON)}.`,
    );
    console.log("Review the diff before committing — it is the record of what the shell is allowed to be.");
    return;
  }

  const findings = [...tier1, ...tier2, ...tier3, ...tier4];
  if (!findings.length) {
    console.log(
      `Chrome integrity gate passed: ${regionsByRoute.size} routes, ${CHROME_REGIONS.length} protected regions, ${ruleCount} structural rules, ${tokenCount} protected style tokens.`,
    );
    return;
  }
  console.error(formatFindings(findings));
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
