import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import matter from "gray-matter";
import {
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
import { collectTokens } from "./lib/chrome-styling.mjs";
import { collectStyling } from "./chrome-contract.mjs";
import { loadSkillsSource } from "./lib/skills-source.mjs";

const DIST_DIR = path.resolve("dist");
const REPORT_DIR = path.resolve("reports");
const CONTENT_DIR = path.resolve("content");
const SITE_BASE_PATH = (process.env.SITE_BASE_PATH || "").replace(/^\/+|\/+$/g, "");
const OFFICIAL_ORIGIN = "https://tritonai.ucsd.edu";
const inheritedProductionFailures = new Set();
const standaloneRoutes = new Set([
  "/presentations/managing-the-tritonai-website.html",
  "/tritongpt/bgpt-chat-generator/index.html",
]);
const renderedProvenancePatterns = [
  { pattern: /\bSource:\s*[^<\n]*\.md\b/i, label: "internal content filename" },
  { pattern: /\bcurrent public (?:deck|presentation|version)\b/i, label: "public-version framing" },
  { pattern: /\bthis public view\b/i, label: "public-view framing" },
  { pattern: /\btritonai public architecture\b/i, label: "public-version architecture framing" },
  { pattern: /\bdescriptions summarize\b[^.]*\b(?:deck|presentation)\b/i, label: "presentation attribution" },
  { pattern: /\bcurrent capabilities reflect\b[^.]*\b(?:demonstration|meeting|presentation)\b/i, label: "meeting attribution" },
  { pattern: /\breported in the\b[^.]*\bpresentation\b/i, label: "presentation attribution" },
];
const ignoredLegacyAssets = new Set([
  "/_resources/cross-domain/respond.proxy.gif",
  "/_resources/cross-domain/respond.proxy.js",
]);
const requiredRemoteDependencies = [
  "https://cdn.ucsd.edu/cms/decorator-5/styles/bootstrap.min.css",
  "https://cdn.ucsd.edu/cms/decorator-5/styles/base.min.css",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/base.min.js",
  "https://www.ucsd.edu/common/_emergency-broadcast/message.js",
  "https://cdn.ucsd.edu/cms/search/js/search-api.js",
  "https://cdn.ucsd.edu/tritongpt/widget/js/tgpt-loader.js",
  "https://today.ucsd.edu/news-and-features-api?category=190&limit=3",
];
const preconnectOrigins = [
  "https://cdn.ucsd.edu",
  "https://www.ucsd.edu",
  "https://tritongpt-deck.vercel.app",
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
];
const afterRenderDecoratorScripts = [
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/modernizr.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/jquery.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/bootstrap.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/vendor.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/base.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/decorator.js",
];
const requiredDecoratorStylesheets = [
  "https://cdn.ucsd.edu/cms/decorator-5/styles/bootstrap.min.css",
  "https://cdn.ucsd.edu/cms/decorator-5/styles/base.min.css",
];
const emergencyBroadcastScript = "https://www.ucsd.edu/common/_emergency-broadcast/message.js";
const tritonGptWidgetScript = "https://cdn.ucsd.edu/tritongpt/widget/js/tgpt-loader.js";
// Must match GOOGLE_ANALYTICS_ID in build.mjs, which injects the tag on every route.
const googleAnalyticsId = "G-CSQGMG6EFP";
const imageBudgetBytes = 320_000;

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

async function exists(filename) {
  try {
    await access(filename);
    return true;
  } catch {
    return false;
  }
}

function isoDate(value) {
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString().slice(0, 10);
}

function normalizeRoute(route) {
  return route === "/index.html" ? "/" : route;
}

function navigationOwner(items, route) {
  // The navigation data decides which section a page belongs to. The URL
  // prefix is only a fallback for pages that no menu lists.
  const listed = items.find((item) => item.href === route || item.items?.some((child) => child.href === route));
  if (listed) return listed;
  const section = route.split("/").filter(Boolean)[0] || "";
  if (!section) return null;
  return items.find((item) => (item.href.split("/").filter(Boolean)[0] || "") === section) || null;
}

function sidebarChildren(item) {
  return (item?.items || []).filter((child) => child.href !== item.href);
}

function missingFields(object, fields) {
  return fields.filter((field) => object[field] === undefined || object[field] === null || object[field] === "");
}

async function loadMarkdownContent(directory, requiredFields, type) {
  const entries = [];
  const findings = [];
  const filenames = (await readdir(directory))
    .filter((name) => name.endsWith(".md") && !/ \d+\.md$/i.test(name))
    .sort();
  for (const filename of filenames) {
    const parsed = matter(await readFile(path.join(directory, filename), "utf8"));
    const missing = missingFields(parsed.data, requiredFields);
    if (missing.length) findings.push({ source: `${type}/${filename}`, issue: `Missing fields: ${missing.join(", ")}` });
    entries.push({ filename, ...parsed.data, lastReviewed: isoDate(parsed.data.lastReviewed) });
  }
  return { entries, findings };
}

function toLocalPath(raw, pagePath) {
  if (!raw || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(raw) || raw.startsWith("//")) return null;
  let url;
  try {
    url = new URL(raw, `https://local.invalid/${pagePath}`);
  } catch {
    return null;
  }
  if (url.origin !== "https://local.invalid") return null;
  let pathname = decodeURIComponent(url.pathname);
  if (SITE_BASE_PATH && pathname.startsWith(`/${SITE_BASE_PATH}/`)) {
    pathname = pathname.slice(SITE_BASE_PATH.length + 1) || "/";
  }
  return pathname;
}

async function resolveLocalTarget(pathname) {
  const candidates = [];
  const clean = pathname.replace(/^\//, "");
  if (!clean || pathname.endsWith("/")) candidates.push(path.join(DIST_DIR, clean, "index.html"));
  else {
    candidates.push(path.join(DIST_DIR, clean));
    if (!path.extname(clean)) candidates.push(path.join(DIST_DIR, clean, "index.html"));
  }
  for (const candidate of candidates) if (await exists(candidate)) return true;
  return false;
}

const files = await listFiles(DIST_DIR);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const missing = [];
const inherited = [];
const accessibility = [];
const metadata = [];
const metadataTitles = new Map();
const performance = [];
const navigation = [];
const decorator = [];
const analytics = [];
const webMcp = [];

// Page chrome integrity. `decorator` holds stylistic conformance findings;
// these are shaped differently (rule, diff, markup, remedy) and pin the shared
// Decorator shell itself. See scripts/lib/chrome-contract.mjs.
const chrome = [];
const chromeByRoute = new Map();
// Tier 4 needs the class and id tokens each route renders inside the shell and
// inside the canvas, so they are collected in the same pass as tier 3.
const chromeTokens = new Set();
const canvasTokens = new Set();
const { rules: chromeSelectorRules, expired: expiredChromeExceptions } = await loadChromeSelectors();
chrome.push(...expiredChromeExceptions);

const skillsSource = await loadSkillsSource();

const assetSizeCache = new Map();
async function localAssetSize(raw, pagePath) {
  const target = toLocalPath(raw, pagePath);
  if (!target || !/^\/_images\/.+\.(?:jpe?g|png|webp)$/i.test(target)) return null;
  if (assetSizeCache.has(target)) return assetSizeCache.get(target);
  const filename = path.join(DIST_DIR, target.replace(/^\//, ""));
  const size = await stat(filename).then((entry) => entry.size).catch(() => null);
  assetSizeCache.set(target, size);
  return size;
}

const pageContent = await loadMarkdownContent(
  path.join(CONTENT_DIR, "pages"),
  ["title", "path", "description", "lastReviewed", "audiences", "source", "canonicalUrl", "relatedSlides"],
  "pages",
);
const useCaseContent = await loadMarkdownContent(
  path.join(CONTENT_DIR, "use-cases"),
  ["title", "slug", "summary", "status", "owner", "lastReviewed", "audiences", "source", "measurementPeriod", "dataClassification", "canonicalUrl", "relatedSlides", "humanOversight", "measurableOutcome"],
  "use-cases",
);
const contentFindings = [...pageContent.findings, ...useCaseContent.findings];
for (const asset of files.filter((file) => file.endsWith(".svg"))) {
  const renderedAsset = await readFile(path.join(DIST_DIR, asset), "utf8");
  for (const { pattern, label } of renderedProvenancePatterns) {
    if (pattern.test(renderedAsset)) {
      contentFindings.push({ source: `/${asset}`, issue: `Rendered asset exposes ${label}` });
    }
  }
}
const roadmapContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "roadmap/milestones.json"), "utf8"));
const factsContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "facts/public-facts.json"), "utf8"));
const gatewayUsageContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "facts/gateway-usage.json"), "utf8"));
const harnessInstallerContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "harness/installer.json"), "utf8"));
const modelCatalogContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "models/catalog.json"), "utf8"));
const skillsContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "skills/library.json"), "utf8"));
const homeHeroContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "home/hero.json"), "utf8"));
const siteContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "site.json"), "utf8"));
const seoContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "seo.json"), "utf8"));
const tritonAiUpdatesContent = JSON.parse(await readFile(path.join(CONTENT_DIR, "updates/tritonai-updates.json"), "utf8"));
for (const [route, settings] of Object.entries(seoContent.routes || {})) {
  if (settings.schemaAbout !== undefined && (!Array.isArray(settings.schemaAbout) || !settings.schemaAbout.length || settings.schemaAbout.some((name) => typeof name !== "string" || !name.trim()))) {
    contentFindings.push({ source: `seo.json#${route}`, issue: "schemaAbout must contain one or more non-empty topic names" });
  }
}
const roadmapRequired = ["title", "description", "owner", "lastReviewed", "source", "canonicalUrl", "items"];
const roadmapMissing = missingFields(roadmapContent, roadmapRequired);
if (roadmapMissing.length) contentFindings.push({ source: "roadmap/milestones.json", issue: `Missing fields: ${roadmapMissing.join(", ")}` });
const factRequired = ["id", "claim", "status", "owner", "lastReviewed", "source", "measurementPeriod", "dataClassification", "canonicalUrl", "relatedSlides"];
for (const [index, fact] of (factsContent.facts || []).entries()) {
  const factMissing = missingFields(fact, factRequired);
  if (factMissing.length) contentFindings.push({ source: `facts/public-facts.json#${fact.id || index + 1}`, issue: `Missing fields: ${factMissing.join(", ")}` });
}
const gatewayRequired = ["schemaVersion", "title", "summary", "owner", "source", "measurementPeriod", "generatedAt", "lastReviewed", "dataClassification", "canonicalUrl", "relatedSlides", "metrics", "monthly", "notes"];
const gatewayMissing = missingFields(gatewayUsageContent, gatewayRequired);
if (gatewayMissing.length) contentFindings.push({ source: "facts/gateway-usage.json", issue: `Missing fields: ${gatewayMissing.join(", ")}` });
const gatewayPeriodMissing = missingFields(gatewayUsageContent.measurementPeriod || {}, ["start", "end", "label"]);
if (gatewayPeriodMissing.length) contentFindings.push({ source: "facts/gateway-usage.json#measurementPeriod", issue: `Missing fields: ${gatewayPeriodMissing.join(", ")}` });
const harnessInstallerMissing = missingFields(harnessInstallerContent, ["schemaVersion", "product", "version", "publishedAt", "owner", "source", "lastReviewed", "dataClassification", "canonicalUrl", "releaseUrl", "platforms"]);
if (harnessInstallerMissing.length) contentFindings.push({ source: "harness/installer.json", issue: `Missing fields: ${harnessInstallerMissing.join(", ")}` });
if (
  harnessInstallerContent.schemaVersion !== 2 ||
  harnessInstallerContent.releaseUrl !== "https://github.com/dbalders/TritonAI-Harness/releases/latest" ||
  harnessInstallerContent.source !== harnessInstallerContent.releaseUrl
) {
  contentFindings.push({ source: "harness/installer.json", issue: "Harness installer metadata must use the latest Harness release page" });
}
for (const platformId of ["mac", "windows"]) {
  const platform = harnessInstallerContent.platforms?.[platformId] || {};
  const platformMissing = missingFields(platform, ["label", "architecture", "format", "filename", "sizeBytes", "sha256", "downloadUrl"]);
  if (platformMissing.length) contentFindings.push({ source: `harness/installer.json#${platformId}`, issue: `Missing fields: ${platformMissing.join(", ")}` });
  const expectedFilename = `TritonAI-Harness-${harnessInstallerContent.version}-${platformId === "mac" ? "arm64.dmg" : "x64.exe"}`;
  const expectedDownloadUrl = `https://github.com/dbalders/TritonAI-Harness/releases/download/v${harnessInstallerContent.version}/${expectedFilename}`;
  if (platform.filename !== expectedFilename || platform.downloadUrl !== expectedDownloadUrl) {
    contentFindings.push({ source: `harness/installer.json#${platformId}`, issue: "Harness downloads must point directly to the matching platform installer" });
  }
  if (!Number.isInteger(platform.sizeBytes) || platform.sizeBytes <= 0 || !/^[a-f0-9]{64}$/.test(platform.sha256 || "")) {
    contentFindings.push({ source: `harness/installer.json#${platformId}`, issue: "Installer size and SHA-256 must identify the published artifact" });
  }
}
const updateFeedRequired = ["schemaVersion", "title", "description", "owner", "source", "lastReviewed", "streams", "areas", "updates"];
const updateFeedMissing = missingFields(tritonAiUpdatesContent, updateFeedRequired);
if (updateFeedMissing.length) contentFindings.push({ source: "updates/tritonai-updates.json", issue: `Missing fields: ${updateFeedMissing.join(", ")}` });
const updateStreamIds = new Set();
for (const [index, stream] of (tritonAiUpdatesContent.streams || []).entries()) {
  const streamMissing = missingFields(stream, ["id", "title", "introKicker", "introHeading", "introDescription", "feedKicker", "feedHeading", "feedDescription", "searchPlaceholder"]);
  if (streamMissing.length) contentFindings.push({ source: `updates/tritonai-updates.json#stream-${index + 1}`, issue: `Missing fields: ${streamMissing.join(", ")}` });
  if (updateStreamIds.has(stream.id)) contentFindings.push({ source: `updates/tritonai-updates.json#stream-${index + 1}`, issue: `Duplicate stream id: ${stream.id}` });
  updateStreamIds.add(stream.id);
}
const updateAreaIds = new Set();
for (const [index, area] of (tritonAiUpdatesContent.areas || []).entries()) {
  const areaMissing = missingFields(area, ["id", "label", "icon"]);
  if (areaMissing.length) contentFindings.push({ source: `updates/tritonai-updates.json#area-${index + 1}`, issue: `Missing fields: ${areaMissing.join(", ")}` });
  if (updateAreaIds.has(area.id)) contentFindings.push({ source: `updates/tritonai-updates.json#area-${index + 1}`, issue: `Duplicate area id: ${area.id}` });
  updateAreaIds.add(area.id);
}
const updateIds = new Set();
let previousUpdateDate = "9999-99-99";
for (const [index, update] of (tritonAiUpdatesContent.updates || []).entries()) {
  const updateMissing = missingFields(update, ["id", "stream", "date", "displayDate", "area", "title", "details"]);
  if (updateMissing.length) contentFindings.push({ source: `updates/tritonai-updates.json#update-${index + 1}`, issue: `Missing fields: ${updateMissing.join(", ")}` });
  if (updateIds.has(update.id)) contentFindings.push({ source: `updates/tritonai-updates.json#${update.id}`, issue: "Duplicate update id" });
  updateIds.add(update.id);
  if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(update.date || "")) contentFindings.push({ source: `updates/tritonai-updates.json#${update.id || index + 1}`, issue: `Invalid date: ${update.date}` });
  if ((update.date || "") > previousUpdateDate) contentFindings.push({ source: `updates/tritonai-updates.json#${update.id || index + 1}`, issue: "Updates are not sorted newest first" });
  previousUpdateDate = update.date || previousUpdateDate;
  if (!updateStreamIds.has(update.stream)) contentFindings.push({ source: `updates/tritonai-updates.json#${update.id || index + 1}`, issue: `Unknown stream: ${update.stream}` });
  if (!updateAreaIds.has(update.area)) contentFindings.push({ source: `updates/tritonai-updates.json#${update.id || index + 1}`, issue: `Unknown area: ${update.area}` });
  if (/<\/?(?:script|style|iframe|object|embed|form)\b/i.test(update.details || "")) contentFindings.push({ source: `updates/tritonai-updates.json#${update.id || index + 1}`, issue: "Disallowed HTML in update details" });
}
for (const [index, metric] of (gatewayUsageContent.metrics || []).entries()) {
  const metricMissing = missingFields(metric, ["id", "displayValue", "label", "definition", "value"]);
  if (metricMissing.length) contentFindings.push({ source: `facts/gateway-usage.json#metric-${index + 1}`, issue: `Missing fields: ${metricMissing.join(", ")}` });
}
for (const [index, month] of (gatewayUsageContent.monthly || []).entries()) {
  const monthMissing = missingFields(month, ["month", "label", "selfHostedTokens", "cloudTokens"]);
  if (monthMissing.length) contentFindings.push({ source: `facts/gateway-usage.json#month-${index + 1}`, issue: `Missing fields: ${monthMissing.join(", ")}` });
}
const gatewayMetricById = new Map((gatewayUsageContent.metrics || []).map((metric) => [metric.id, metric]));
const gatewayMonths = gatewayUsageContent.monthly || [];
const gatewaySelfHostedTotal = gatewayMonths.reduce((total, month) => total + Number(month.selfHostedTokens || 0), 0);
const gatewayCloudTotal = gatewayMonths.reduce((total, month) => total + Number(month.cloudTokens || 0), 0);
const gatewayTokenTotal = gatewaySelfHostedTotal + gatewayCloudTotal;
const gatewaySelfHostedShare = gatewayTokenTotal ? (gatewaySelfHostedTotal / gatewayTokenTotal) * 100 : 0;
const gatewayLatestMonth = gatewayMonths.at(-1);
const gatewayLatestMonthTotal = gatewayLatestMonth
  ? Number(gatewayLatestMonth.selfHostedTokens || 0) + Number(gatewayLatestMonth.cloudTokens || 0)
  : 0;
const gatewayStart = gatewayUsageContent.measurementPeriod?.start?.match(/^(\d{4})-(\d{2})/);
const gatewayEnd = gatewayUsageContent.measurementPeriod?.end?.match(/^(\d{4})-(\d{2})/);
const gatewayExpectedMonths = [];
if (gatewayStart && gatewayEnd) {
  const startIndex = Number(gatewayStart[1]) * 12 + Number(gatewayStart[2]) - 1;
  const endIndex = Number(gatewayEnd[1]) * 12 + Number(gatewayEnd[2]) - 1;
  for (let index = startIndex; index <= endIndex; index += 1) {
    gatewayExpectedMonths.push(`${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`);
  }
}
if (
  gatewayExpectedMonths.length === 0 ||
  gatewayMonths.length !== gatewayExpectedMonths.length ||
  gatewayMonths.some((month, index) => month.month !== gatewayExpectedMonths[index])
) {
  contentFindings.push({ source: "facts/gateway-usage.json", issue: "Gateway usage monthly records must uniquely cover the stated measurement period in chronological order" });
}
if (gatewayMetricById.get("tokens-processed")?.value !== gatewayTokenTotal) {
  contentFindings.push({ source: "facts/gateway-usage.json#tokens-processed", issue: "Token headline does not equal the monthly self-hosted and cloud totals" });
}
if (Math.abs(Number(gatewayMetricById.get("self-hosted-share")?.value || 0) - gatewaySelfHostedShare) > 0.001) {
  contentFindings.push({ source: "facts/gateway-usage.json#self-hosted-share", issue: "Self-hosted percentage does not reconcile with monthly token totals" });
}
if (gatewayMetricById.get("latest-month")?.value !== gatewayLatestMonthTotal) {
  contentFindings.push({ source: "facts/gateway-usage.json#latest-month", issue: "Latest-month headline does not match the final monthly record" });
}
const skillsRequired = ["schemaVersion", "syncedAt", "source", "collections", "skills"];
const skillsMissing = missingFields(skillsContent, skillsRequired);
if (skillsMissing.length) contentFindings.push({ source: "skills/library.json", issue: `Missing fields: ${skillsMissing.join(", ")}` });
const skillsSourceMissing = missingFields(skillsContent.source || {}, ["repository", "url", "defaultBranch", "commitSha", "commitUrl", "commitDate"]);
if (skillsSourceMissing.length) contentFindings.push({ source: "skills/library.json#source", issue: `Missing fields: ${skillsSourceMissing.join(", ")}` });
if (skillsContent.source?.repository !== skillsSource.slug) {
  contentFindings.push({
    source: "skills/library.json#source",
    issue: `Snapshot came from ${skillsContent.source?.repository || "(missing)"}, but config/skills-source.json expects ${skillsSource.slug}. Re-run \`npm run sync:skills\` after changing the configured repository.`,
  });
}
if (!(skillsContent.skills || []).length) contentFindings.push({ source: "skills/library.json", issue: "No public skills found" });
const allowedSkillCollections = new Set(skillsSource.collections);
const skillNames = new Set();
const skillPaths = new Set();
for (const [index, skill] of (skillsContent.skills || []).entries()) {
  const skillMissing = missingFields(skill, ["name", "description", "collection", "collectionLabel", "path", "directory", "sourceUrl", "directoryUrl", "resources"]);
  if (skillMissing.length) contentFindings.push({ source: `skills/library.json#${skill.name || index + 1}`, issue: `Missing fields: ${skillMissing.join(", ")}` });
  if (!allowedSkillCollections.has(skill.collection)) contentFindings.push({ source: `skills/library.json#${skill.name || index + 1}`, issue: `Unknown collection: ${skill.collection}` });
  if (skill.collection === "community" && !skill.maintainer) contentFindings.push({ source: `skills/library.json#${skill.name || index + 1}`, issue: "Community skill is missing a maintainer" });
  if (skillNames.has(skill.name)) contentFindings.push({ source: `skills/library.json#${skill.name || index + 1}`, issue: "Duplicate skill name" });
  if (skillPaths.has(skill.path)) contentFindings.push({ source: `skills/library.json#${skill.name || index + 1}`, issue: "Duplicate skill path" });
  skillNames.add(skill.name);
  skillPaths.add(skill.path);
}
const homeHeroMissing = missingFields(homeHeroContent, ["schemaVersion", "owner", "source", "lastReviewed", "rotationIntervalMs", "slides"]);
if (homeHeroMissing.length) contentFindings.push({ source: "home/hero.json", issue: `Missing fields: ${homeHeroMissing.join(", ")}` });
if ((homeHeroContent.slides || []).length < 1) contentFindings.push({ source: "home/hero.json", issue: "Homepage hero needs at least one slide" });
const heroSlideIds = new Set();
for (const [index, slide] of (homeHeroContent.slides || []).entries()) {
  const slideMissing = missingFields(slide, ["id", "title", "description", "image", "imageAlt", "link", "linkLabel"]);
  if (slideMissing.length) contentFindings.push({ source: `home/hero.json#${slide.id || index + 1}`, issue: `Missing fields: ${slideMissing.join(", ")}` });
  if (heroSlideIds.has(slide.id)) contentFindings.push({ source: `home/hero.json#${slide.id || index + 1}`, issue: "Duplicate slide id" });
  heroSlideIds.add(slide.id);
}
const generatedPaths = new Set([
  ...pageContent.entries.map((entry) => entry.path),
  ...useCaseContent.entries.map((entry) => entry.canonicalUrl),
  "/use-cases/index.html",
  "/about/roadmap.html",
  "/404.html",
].map(normalizeRoute));
const useCaseByRoute = new Map(useCaseContent.entries.map((entry) => [normalizeRoute(entry.canonicalUrl), entry]));
const landingHubPaths = new Set([
  "/",
  "/use-cases/index.html",
  ...pageContent.entries.filter((entry) => entry.landingHub === true).map((entry) => entry.path),
].map(normalizeRoute));

const allowedStatuses = new Set(["Shipped", "Production", "Pilot", "In development", "Exploring"]);
for (const useCase of useCaseContent.entries) {
  const source = `use-cases/${useCase.filename}`;
  if (!allowedStatuses.has(useCase.status)) contentFindings.push({ source, issue: `Unknown status: ${useCase.status}` });
  if (useCase.videoSrc) {
    const missingVideoFields = missingFields(useCase, ["videoPoster", "videoLabel", "videoDescription"]);
    if (missingVideoFields.length) contentFindings.push({ source, issue: `Video is missing fields: ${missingVideoFields.join(", ")}` });
    if (useCase.videoCaptionsSrc && !useCase.videoCaptionsLabel) {
      contentFindings.push({ source, issue: "Captioned video is missing videoCaptionsLabel" });
    }
  }
  for (const [index, screenshot] of (useCase.screenshots || []).entries()) {
    const missingScreenshotFields = missingFields(screenshot, ["src", "alt", "caption"]);
    if (missingScreenshotFields.length) {
      contentFindings.push({ source: `${source}#screenshot-${index + 1}`, issue: `Screenshot is missing fields: ${missingScreenshotFields.join(", ")}` });
    }
  }
  for (const mediaUrl of [
    useCase.videoSrc,
    useCase.videoPoster,
    ...(useCase.screenshots || []).map((screenshot) => screenshot.src),
  ].filter((url) => /^https?:\/\//i.test(url || ""))) {
    if (!requiredRemoteDependencies.includes(mediaUrl)) requiredRemoteDependencies.push(mediaUrl);
  }
}
for (const [index, milestone] of (roadmapContent.items || []).entries()) {
  const milestoneMissing = missingFields(milestone, ["period", "title", "status", "summary", "owner", "lastReviewed", "source"]);
  if (milestoneMissing.length) contentFindings.push({ source: `roadmap/milestones.json#${index + 1}`, issue: `Missing fields: ${milestoneMissing.join(", ")}` });
  if (!allowedStatuses.has(milestone.status)) contentFindings.push({ source: `roadmap/milestones.json#${index + 1}`, issue: `Unknown status: ${milestone.status}` });
  if (/2026/.test(milestone.period)) {
    if (!Array.isArray(milestone.details) || milestone.details.length < 3 || milestone.details.some((detail) => typeof detail !== "string" || detail.trim().length < 20)) {
      contentFindings.push({ source: `roadmap/milestones.json#${index + 1}`, issue: "2026 roadmap milestones need at least three useful public detail points" });
    }
    if (!Array.isArray(milestone.links) || milestone.links.length < 2 || milestone.links.some((link) => missingFields(link, ["label", "href"]).length)) {
      contentFindings.push({ source: `roadmap/milestones.json#${index + 1}`, issue: "2026 roadmap milestones need at least two related public resources" });
    }
  }
}

const freshnessWarnings = [];
const freshnessFailures = [];
const today = new Date();
const skillsSyncedAt = new Date(skillsContent.syncedAt);
if (Number.isNaN(skillsSyncedAt.valueOf())) {
  freshnessFailures.push({ source: "skills/library.json", issue: "Invalid syncedAt date" });
} else {
  const ageHours = Math.floor((today - skillsSyncedAt) / 3600000);
  if (ageHours > 336) freshnessFailures.push({ source: "skills/library.json", syncedAt: skillsContent.syncedAt, ageHours });
  else if (ageHours > 48) freshnessWarnings.push({ source: "skills/library.json", syncedAt: skillsContent.syncedAt, ageHours });
}
const freshnessEntries = [
  ...pageContent.entries,
  ...useCaseContent.entries,
  { filename: "roadmap/milestones.json", lastReviewed: isoDate(roadmapContent.lastReviewed) },
  ...(roadmapContent.items || []).map((item, index) => ({ filename: `roadmap/milestones.json#${index + 1}`, lastReviewed: isoDate(item.lastReviewed) })),
  ...(factsContent.facts || []).map((fact, index) => ({ filename: `facts/public-facts.json#${fact.id || index + 1}`, lastReviewed: isoDate(fact.lastReviewed) })),
  { filename: "facts/gateway-usage.json", lastReviewed: isoDate(gatewayUsageContent.lastReviewed) },
  { filename: "harness/installer.json", lastReviewed: isoDate(harnessInstallerContent.lastReviewed) },
  { filename: "home/hero.json", lastReviewed: isoDate(homeHeroContent.lastReviewed) },
  { filename: "updates/tritonai-updates.json", lastReviewed: isoDate(tritonAiUpdatesContent.lastReviewed) },
];
for (const entry of freshnessEntries) {
  if (!entry.lastReviewed) {
    freshnessFailures.push({ source: entry.filename, issue: "Invalid lastReviewed date" });
    continue;
  }
  const ageDays = Math.floor((today - new Date(`${entry.lastReviewed}T12:00:00Z`)) / 86400000);
  if (ageDays > 365) freshnessFailures.push({ source: entry.filename, lastReviewed: entry.lastReviewed, ageDays });
  else if (ageDays > 120) freshnessWarnings.push({ source: entry.filename, lastReviewed: entry.lastReviewed, ageDays });
}

const retiredReferencePatterns = [
  /AI\s+Development\s+Work\s*group/i,
  /AI\s+in\s+Administration\s+Work\s*group/i,
];

for (const page of htmlFiles) {
  const renderedHtml = await readFile(path.join(DIST_DIR, page), "utf8");
  const $ = load(renderedHtml);
  const route = page === "index.html" ? "/" : `/${page}`;
  const standalone = standaloneRoutes.has(route);
  for (const pattern of retiredReferencePatterns) {
    if (pattern.test(renderedHtml)) {
      contentFindings.push({ source: `dist/${page}`, issue: "Retired AI workgroup reference remains in rendered content" });
    }
  }
  $("a[href]").each((_, element) => {
    const target = normalizeRoute(toLocalPath($(element).attr("href"), page) || "");
    if (target === "/about/workgroup.html") {
      contentFindings.push({ source: `dist/${page}`, issue: "Rendered page still links to the retired workgroup route" });
    }
  });
  if (!standalone) {
    for (const stylesheet of requiredDecoratorStylesheets) {
      if ($(`link[rel~='stylesheet'][href='${stylesheet}']`).length !== 1) {
        decorator.push({ page: route, issue: `Missing official Decorator 5 stylesheet: ${stylesheet}` });
      }
    }
    // Tier 3 needs the live cheerio nodes, so it runs here; tiers 1 and 2 need
    // the whole corpus and run after the loop.
    chromeByRoute.set(route, extractChrome($, { route, basePath: SITE_BASE_PATH }));
    const regions = regionElements($);
    for (const finding of checkStructuralRules($, regions, chromeSelectorRules, { route, basePath: SITE_BASE_PATH })) {
      chrome.push({ page: route, ...finding });
    }
    for (const node of Object.values(regions)) collectTokens($, node, chromeTokens);
    const canvas = $("main#main-content").first();
    if (canvas.length) collectTokens($, canvas, canvasTokens);
  }
  if (!$("body").hasClass("agent-page")) {
    decorator.push({ page: route, issue: "Page is missing the shared Decorator extension class" });
  }
  $("[style]").each((_, element) => {
    if (/font-family\s*:/i.test($(element).attr("style") || "")) {
      decorator.push({ page: route, issue: "Inline font-family overrides the Decorator 5 type system" });
    }
  });
  $(".hub-action-card, .hub-story-card").each((_, element) => {
    const component = $(element);
    if (!component.hasClass("panel") || !component.hasClass("panel-default")) {
      decorator.push({ page: route, issue: "Custom landing card must extend the Decorator panel component" });
    }
  });
  const ids = new Map();
  $("[id]").each((_, element) => {
    const id = $(element).attr("id");
    ids.set(id, (ids.get(id) || 0) + 1);
  });
  for (const [id, count] of ids) {
    if (count > 1) navigation.push({ page: route, issue: `Duplicate id: ${id}` });
  }
  $("[tabindex]").each((_, element) => {
    const value = Number($(element).attr("tabindex"));
    if (Number.isFinite(value) && value > 0) accessibility.push({ page: route, issue: `Positive tabindex: ${value}` });
  });
  $("label[for]").each((_, element) => {
    const label = $(element);
    const targetId = label.attr("for");
    const target = $(`#${targetId}`);
    if (target.length !== 1) {
      accessibility.push({ page: route, issue: `Label target is missing or duplicated: ${targetId}` });
      return;
    }
    if (label.closest("form").get(0) !== target.closest("form").get(0)) {
      accessibility.push({ page: route, issue: `Label and control are not in the same form: ${targetId}` });
    }
  });
  $("a[href*='tritongpt-deck.vercel.app']").each((_, element) => {
    contentFindings.push({ source: route, issue: `Public pages must not link to the presentation deck: ${$(element).attr("href")}` });
  });
  const renderedCopy = `${$("main#main-content").text()} ${$("meta[name='description']").attr("content") || ""}`;
  for (const { pattern, label } of renderedProvenancePatterns) {
    if (pattern.test(renderedCopy)) {
      contentFindings.push({ source: route, issue: `Rendered page exposes ${label}` });
    }
  }

  // A standalone page renders no Decorator navigation, so it has no active state
  // to assert. The whole block is skipped rather than just the missing-navbar
  // check: an absent navbar otherwise reads as one missing its active item, which
  // fires for any standalone route that sits under a section in the nav tree.
  if (!standalone) {
    const primaryNav = $("#navbar > .navbar-nav-list").first();
    if (!primaryNav.length) {
      navigation.push({ page: route, issue: "Primary navigation is missing" });
    } else {
      const primaryItems = primaryNav.children("li").toArray();
      const activeItems = primaryItems.filter((item) => $(item).hasClass("active"));
      const expectedOwner = navigationOwner(siteContent.navigation || [], route);
      if (!expectedOwner && activeItems.length) {
        navigation.push({ page: route, issue: "Primary navigation should not have an active item" });
      }
      if (expectedOwner) {
        const expectedItem = primaryItems.find(
          (item) => normalizeRoute(toLocalPath($(item).children("a").attr("href"), page) || "") === normalizeRoute(expectedOwner.href),
        );
        if (!expectedItem || activeItems.length !== 1 || activeItems[0] !== expectedItem) {
          navigation.push({ page: route, issue: `Incorrect active primary navigation; expected ${expectedOwner.label}` });
        }
      }
    }
  }

  $("[data-tritonai-nav-dropdown]").each((_, element) => {
    const trigger = $(element);
    const controls = trigger.attr("aria-controls");
    if (
      trigger.attr("aria-haspopup") !== "true" ||
      !["true", "false"].includes(trigger.attr("aria-expanded")) ||
      !controls ||
      ids.get(controls) !== 1
    ) {
      navigation.push({ page: route, issue: "Desktop dropdown is missing a valid ARIA relationship" });
    }
  });
  const mobileToggle = $("[data-tritonai-mobile-toggle]");
  if (
    !standalone &&
    (mobileToggle.length !== 1 ||
      mobileToggle.attr("aria-controls") !== "mobile-navigation" ||
      !["true", "false"].includes(mobileToggle.attr("aria-expanded")) ||
      ids.get("mobile-navigation") !== 1)
  ) {
    navigation.push({ page: route, issue: "Mobile navigation toggle is missing a valid ARIA relationship" });
  }
  const searchToggle = $("[data-tritonai-search-toggle]");
  if (
    !standalone &&
    (searchToggle.length !== 1 ||
      !["true", "false"].includes(searchToggle.attr("aria-expanded")) ||
      ids.get(searchToggle.attr("aria-controls")) !== 1)
  ) {
    navigation.push({ page: route, issue: "Desktop search toggle is missing a valid ARIA relationship" });
  }

  const expectedTwoColumnLayout = (generatedPaths.has(route) && !landingHubPaths.has(route)) || route === "/search/index.html";
  if (expectedTwoColumnLayout) {
    const mainSection = $("main#main-content .main-section").first();
    const sidebar = $("main#main-content .sidebar-section").first();
    if (!mainSection.length || !sidebar.length) {
      navigation.push({ page: route, issue: "Expected main content and sidebar sections" });
    } else {
      for (const requiredClass of ["col-xs-9", "main-section", "pull-right"]) {
        if (!mainSection.hasClass(requiredClass)) navigation.push({ page: route, issue: `Main section is missing ${requiredClass}` });
      }
      for (const requiredClass of ["col-xs-12", "col-md-3", "sidebar-section"]) {
        if (!sidebar.hasClass(requiredClass)) navigation.push({ page: route, issue: `Sidebar is missing ${requiredClass}` });
      }
      const contentOrder = $("main#main-content .main-section, main#main-content .sidebar-section").toArray();
      if (contentOrder.indexOf(mainSection.get(0)) > contentOrder.indexOf(sidebar.get(0))) {
        navigation.push({ page: route, issue: "Sidebar precedes main content in DOM order" });
      }

      const owner = navigationOwner(siteContent.navigation || [], route);
      const sidebarNavigation = sidebar.find(".main-content-nav").first();
      if (owner && sidebarNavigation.length) {
        const sidebarItems = sidebarNavigation.children("ul.navbar-list").children("li").toArray();
        const children = sidebarChildren(owner);
        const activeChild = children.find((child) => child.href === route);
        const sidebarHref = (element) => normalizeRoute(toLocalPath($(element).attr("href"), page) || "");

        if (activeChild) {
          const heading = sidebarNavigation.children("h2").first();
          const headingLink = heading.children("a").first();
          if (
            headingLink.length !== 1 ||
            headingLink.text().trim() !== owner.label ||
            sidebarHref(headingLink) !== normalizeRoute(owner.href)
          ) {
            navigation.push({ page: route, issue: `Sidebar child page must link its heading to ${owner.label}` });
          }
          if (sidebarItems.length !== children.length) {
            navigation.push({ page: route, issue: "Sidebar child page must show only sibling entries" });
          }
          for (const [index, child] of children.entries()) {
            const item = $(sidebarItems[index]);
            if (!item.length) continue;
            const directLink = item.children("a").first();
            if (child.href === route) {
              if (!item.hasClass("active") || directLink.length || item.text().trim() !== child.label) {
                navigation.push({ page: route, issue: `Sidebar current child must be plain active text: ${child.label}` });
              }
            } else if (item.hasClass("active") || directLink.length !== 1 || sidebarHref(directLink) !== normalizeRoute(child.href)) {
              navigation.push({ page: route, issue: `Sidebar sibling link is incorrect: ${child.label}` });
            }
          }
        } else if (route === owner.href) {
          const headingLink = sidebarNavigation.children("h2").children("a").first();
          if (headingLink.length !== 1 || headingLink.text().trim() !== "TritonAI" || sidebarHref(headingLink) !== "/") {
            navigation.push({ page: route, issue: "Sidebar section landing must link its heading to TritonAI home" });
          }
          if (sidebarItems.length !== (siteContent.navigation || []).length) {
            navigation.push({ page: route, issue: "Sidebar section landing must show the root navigation" });
          }
          for (const [index, itemDefinition] of (siteContent.navigation || []).entries()) {
            const item = $(sidebarItems[index]);
            if (!item.length) continue;
            const directLink = item.children("a").first();
            if (itemDefinition === owner) {
              const expectedClass = children.length ? "expanded" : "active";
              if (!item.hasClass("active") || (children.length && !item.hasClass(expectedClass)) || directLink.length) {
                navigation.push({ page: route, issue: `Sidebar section landing must render ${owner.label} as plain active text` });
              }
              const nestedItems = item.children("ul").children("li").toArray();
              if (nestedItems.length !== children.length) {
                navigation.push({ page: route, issue: `Sidebar section landing has incorrect ${owner.label} children` });
              }
              for (const [childIndex, child] of children.entries()) {
                const nestedLink = $(nestedItems[childIndex]).children("a").first();
                if (nestedLink.length !== 1 || sidebarHref(nestedLink) !== normalizeRoute(child.href)) {
                  navigation.push({ page: route, issue: `Sidebar section child link is incorrect: ${child.label}` });
                }
              }
            } else if (!item.hasClass("collapsed") || directLink.length !== 1 || sidebarHref(directLink) !== normalizeRoute(itemDefinition.href)) {
              navigation.push({ page: route, issue: `Sidebar root link is incorrect: ${itemDefinition.label}` });
            }
          }
        }
      }
    }
  } else if (landingHubPaths.has(route)) {
    const mainSection = $("main#main-content .main-section").first();
    if (!mainSection.length || !mainSection.hasClass("col-xs-12")) {
      navigation.push({ page: route, issue: "Landing hub must use a full-width main section" });
    }
    if ($("main#main-content .sidebar-section").length) {
      navigation.push({ page: route, issue: "Landing hub must not render a sidebar" });
    }

    const owner = navigationOwner(siteContent.navigation || [], route);
    if (owner?.items?.length) {
      const sectionNavigation = $("main#main-content .landing-mobile-section-nav");
      if (sectionNavigation.length !== 1) {
        navigation.push({ page: route, issue: "Landing hub must include one mobile section navigation" });
      } else {
        const hasOverview = owner.items.some((item) => normalizeRoute(item.href) === normalizeRoute(owner.href));
        const expectedItems = hasOverview
          ? owner.items
          : [{ label: `${owner.label} Overview`, href: owner.href }, ...owner.items];
        const renderedItems = sectionNavigation.find("ul").first().children("li").toArray();
        if (renderedItems.length !== expectedItems.length) {
          navigation.push({ page: route, issue: `Mobile ${owner.label} navigation has the wrong number of links` });
        }
        for (const [index, expectedItem] of expectedItems.entries()) {
          const item = $(renderedItems[index]);
          if (!item.length) continue;
          const link = item.children("a").first();
          const current = item.children("[aria-current='page']").first();
          if (normalizeRoute(expectedItem.href) === route) {
            if (!item.hasClass("active") || current.length !== 1 || current.text().trim() !== expectedItem.label || link.length) {
              navigation.push({ page: route, issue: `Mobile section navigation must mark ${expectedItem.label} as the current page` });
            }
          } else if (
            item.hasClass("active") ||
            link.length !== 1 ||
            link.text().trim() !== expectedItem.label ||
            normalizeRoute(toLocalPath(link.attr("href"), page) || "") !== normalizeRoute(expectedItem.href)
          ) {
            navigation.push({ page: route, issue: `Mobile section link is incorrect: ${expectedItem.label}` });
          }
        }
      }
    }
  }
  for (const attr of ["href", "src", "action", "poster", "data-src", "data-poster", "data-fallback-src", "data-after-render-src", "data-idle-src"]) {
    for (const element of $(`[${attr}]`).toArray()) {
      const raw = $(element).attr(attr);
      const target = toLocalPath(raw, page);
      if (!target || ignoredLegacyAssets.has(target)) continue;
      if (await resolveLocalTarget(target)) continue;
      const finding = { page: `/${page}`, attribute: attr, target };
      if (inheritedProductionFailures.has(target)) inherited.push(finding);
      else missing.push(finding);
    }
  }

  $("video").each((_, element) => {
    const video = $(element);
    if (video.attr("controls") === undefined) accessibility.push({ page: route, issue: "Video missing controls" });
    if (video.attr("data-autoplay-when-visible") !== "true") accessibility.push({ page: route, issue: "Video must autoplay when visible" });
    if (video.attr("muted") === undefined) accessibility.push({ page: route, issue: "Autoplay video must be muted" });
    if (video.attr("playsinline") === undefined) accessibility.push({ page: route, issue: "Autoplay video must play inline" });
    if (video.attr("autoplay") !== undefined) performance.push({ page: route, issue: "Video must not load through eager autoplay" });
    if (video.attr("preload") !== "none") performance.push({ page: route, issue: "Deferred video must use preload=none" });
    if (video.attr("src") || video.find("source[src]").length) performance.push({ page: route, issue: "Video source must be deferred to data-src" });
    const descriptionId = video.attr("aria-describedby");
    const described = descriptionId && $(`#${descriptionId}`).length === 1;
    const silentDemo = video.attr("data-silent-demo") === "true" && video.attr("muted") !== undefined && described;
    if (!video.find("track[kind='captions']").length && !silentDemo) {
      accessibility.push({ page: route, issue: "Video needs captions or an identified silent-demo description" });
    }
  });

  $("iframe[data-src*='youtube.com/embed']").each((_, element) => {
    const iframe = $(element);
    const iframeUrl = new URL(iframe.attr("data-src"));
    if (iframeUrl.searchParams.get("autoplay") !== "1" || iframeUrl.searchParams.get("mute") !== "1") {
      accessibility.push({ page: route, issue: "YouTube video must autoplay muted" });
    }
    if (iframe.attr("loading") !== "lazy" || iframe.attr("data-autoplay-when-visible") !== "true") {
      performance.push({ page: route, issue: "YouTube video must load only when it approaches the viewport" });
    }
    if (iframe.attr("src") !== "about:blank") performance.push({ page: route, issue: "YouTube embed has an eager source" });
  });

  const preconnects = new Set($("link[rel='preconnect']").map((_, element) => $(element).attr("href")).get());
  for (const origin of preconnectOrigins) {
    if (!preconnects.has(origin)) performance.push({ page: route, issue: `Missing preconnect for ${origin}` });
  }
  const performanceRuntime = $("script[src$='/_resources/js/site-performance.js'][defer]");
  if (performanceRuntime.length !== 1) performance.push({ page: route, issue: "Performance runtime is missing or not deferred" });
  const webMcpRuntime = $("script[src$='/_resources/js/webmcp.js'][defer]");
  if (webMcpRuntime.length !== 1) webMcp.push({ page: route, issue: "WebMCP runtime is missing or not deferred" });
  if ($("body").hasClass("agent-page")) {
    const agentStylesheet = $("link[href*='/agent-site.css']").attr("href") || "";
    if (!/[?&]v=[a-f0-9]{12}(?:$|&)/.test(agentStylesheet)) {
      performance.push({ page: route, issue: "Agent page stylesheet is missing its content cache key" });
    }
  }
  if ($("body").hasClass("landing-hub-page")) {
    const landingStylesheet = $("link[href*='/landing-hubs.css']").attr("href") || "";
    if (!/[?&]v=[a-f0-9]{12}(?:$|&)/.test(landingStylesheet)) {
      performance.push({ page: route, issue: "Landing hub stylesheet is missing its content cache key" });
    }
  }
  const protocolRelativeUcsdAssets = [
    ...$("link[rel~='stylesheet'][href^='//cdn.ucsd.edu/']").map((_, element) => $(element).attr("href")).get(),
    ...$("script[src^='//cdn.ucsd.edu/']").map((_, element) => $(element).attr("src")).get(),
    ...$("img[src^='//cdn.ucsd.edu/']").map((_, element) => $(element).attr("src")).get(),
    ...$("source[src^='//cdn.ucsd.edu/']").map((_, element) => $(element).attr("src")).get(),
  ];
  for (const asset of protocolRelativeUcsdAssets) {
    performance.push({ page: route, issue: `UCSD CDN asset must use HTTPS explicitly: ${asset}` });
  }
  if (!standalone) {
    for (const source of afterRenderDecoratorScripts) {
      const script = $(`script[data-after-render-src='${source}']`);
      if (script.length !== 1 || script.attr("src")) {
        performance.push({ page: route, issue: `Decorator dependency is not postponed until after render: ${source}` });
      }
    }
  }
  $("script[src^='http']").each((_, element) => {
    const script = $(element);
    const source = script.attr("src") || "";
    if (script.attr("async") !== undefined || source.includes("googletagmanager.com")) return;
    performance.push({ page: route, issue: `External script blocks initial rendering: ${source}` });
  });
  const emergencyScript = $(`script[src='${emergencyBroadcastScript}']`);
  if (!standalone && (emergencyScript.length !== 1 || emergencyScript.attr("async") === undefined)) {
    performance.push({ page: route, issue: "Emergency broadcast must remain live without blocking rendering" });
  }
  const idleWidget = $(`script[data-idle-src='${tritonGptWidgetScript}']`);
  if (!standalone && (idleWidget.length !== 1 || idleWidget.attr("src"))) {
    performance.push({ page: route, issue: "TritonGPT widget must initialize during browser idle time" });
  }
  const analyticsLoader = $("script[data-tritonai-analytics][src]");
  const analyticsConfig = $("script[data-tritonai-analytics]:not([src])");
  const strayAnalytics = $("script[src*='googletagmanager.com']:not([data-tritonai-analytics])");
  if (analyticsLoader.length !== 1 || analyticsConfig.length !== 1) {
    analytics.push({ page: route, issue: "Page must carry exactly one build-injected Google Analytics tag" });
  } else if (analyticsLoader.attr("src") !== `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`) {
    analytics.push({ page: route, issue: `Analytics loader does not use measurement ID ${googleAnalyticsId}` });
  } else if (!(analyticsConfig.html() || "").includes(`gtag('config','${googleAnalyticsId}'`)) {
    analytics.push({ page: route, issue: `Analytics configuration does not use measurement ID ${googleAnalyticsId}` });
  } else if (analyticsLoader.attr("async") === undefined) {
    analytics.push({ page: route, issue: "Analytics loader must stay asynchronous" });
  }
  if (strayAnalytics.length) {
    analytics.push({ page: route, issue: "Page carries a hand-authored analytics tag; the build owns this tag" });
  }
  for (const element of $("img").toArray()) {
    const image = $(element);
    const localImagePath = toLocalPath(image.attr("src"), page);
    if (localImagePath?.startsWith("/_images/") && !image.hasClass("first-slide")) {
      if (image.attr("loading") !== "lazy") performance.push({ page: route, issue: `Local image must load lazily: ${localImagePath}` });
      if (image.attr("decoding") !== "async") performance.push({ page: route, issue: `Local image must decode asynchronously: ${localImagePath}` });
    }
    const fallback = image.attr("data-fallback-src") || image.attr("src");
    const fallbackSize = await localAssetSize(fallback, page);
    if (!fallbackSize || fallbackSize <= imageBudgetBytes) continue;
    const source = image.attr("src") || "";
    const optimizedSource = image.attr("data-src") || (/\.webp(?:$|[?#])/i.test(source) ? source : null) || image.parent("picture").find("source[type='image/webp']").attr("srcset");
    const optimizedSize = await localAssetSize(optimizedSource, page);
    if (!optimizedSource || !optimizedSize) {
      performance.push({ page: route, issue: `Oversized image lacks a WebP source: ${fallback}` });
    } else if (optimizedSize > imageBudgetBytes) {
      performance.push({ page: route, issue: `Optimized image exceeds ${imageBudgetBytes} bytes: ${optimizedSource}` });
    }
  }
  for (const element of $("[style*='background-image']").toArray()) {
    const style = $(element).attr("style") || "";
    const urls = [...style.matchAll(/url\((['\"]?)([^'\")]+)\1\)/gi)].map((match) => match[2]);
    if (SITE_BASE_PATH) {
      for (const url of urls) {
        if (url.startsWith("/") && !url.startsWith(`/${SITE_BASE_PATH}/`)) {
          missing.push({ page: route, attribute: "style", target: url, issue: "Inline background URL is missing the site base path" });
        }
      }
    }
    const fallback = urls.find((url) => /\.(?:jpe?g|png)(?:$|[?#])/i.test(url));
    if (!fallback) continue;
    const optimized = urls.find((url) => /\.webp(?:$|[?#])/i.test(url));
    const fallbackSize = await localAssetSize(fallback, page);
    if (!fallbackSize || fallbackSize <= imageBudgetBytes) continue;
    const optimizedSize = await localAssetSize(optimized, page);
    if (!optimized || !optimizedSize) performance.push({ page: route, issue: `Oversized background lacks a WebP source: ${fallback}` });
    else if (optimizedSize > imageBudgetBytes) performance.push({ page: route, issue: `Optimized background exceeds ${imageBudgetBytes} bytes: ${optimized}` });
  }

  if (generatedPaths.has(route)) {
    if ($("main#main-content").length !== 1) accessibility.push({ page: route, issue: "Expected one main landmark" });
    if ($("h1").length !== 1) accessibility.push({ page: route, issue: `Expected one h1; found ${$("h1").length}` });
    $("img").each((_, element) => {
      if ($(element).attr("alt") === undefined) accessibility.push({ page: route, issue: "Image missing alt attribute" });
    });
  }
  const title = $("title").text().trim();
  const robots = $("meta[name='robots']").attr("content") || "";
  const canonical = $("link[rel='canonical']").attr("href");
  if (!canonical) metadata.push({ page: route, issue: "Missing canonical URL" });
  else if (!canonical.startsWith("https://tritonai.ucsd.edu/")) metadata.push({ page: route, issue: `Canonical URL is not absolute: ${canonical}` });
  if (!title) metadata.push({ page: route, issue: "Missing title" });
  else if (!/noindex/i.test(robots)) {
    if (!metadataTitles.has(title)) metadataTitles.set(title, []);
    metadataTitles.get(title).push(route);
    if (title.length > 65) metadata.push({ page: route, issue: `Indexable title exceeds 65 characters: ${title.length}` });
  }
  const metaDescription = $("meta[name='description']").attr("content") || "";
  if (!metaDescription) metadata.push({ page: route, issue: "Missing description" });
  else if (!/noindex/i.test(robots) && metaDescription.length > 155) metadata.push({ page: route, issue: `Indexable description exceeds 155 characters: ${metaDescription.length}` });
  if (!$("meta[property='og:title']").attr("content")) metadata.push({ page: route, issue: "Missing Open Graph title" });
  if (!$("meta[property='og:description']").attr("content")) metadata.push({ page: route, issue: "Missing Open Graph description" });
  if (!$("meta[property='og:url']").attr("content")) metadata.push({ page: route, issue: "Missing Open Graph URL" });
  if (!$("meta[property='og:site_name']").attr("content")) metadata.push({ page: route, issue: "Missing Open Graph site name" });
  if (!$("meta[property='og:image']").attr("content")) metadata.push({ page: route, issue: "Missing Open Graph image" });
  if (!$("meta[property='og:image:alt']").attr("content")) metadata.push({ page: route, issue: "Missing Open Graph image alternative" });
  if ($("meta[name='twitter:card']").attr("content") !== "summary_large_image") metadata.push({ page: route, issue: "Missing large-image Twitter card" });
  for (const name of ["twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"]) {
    if (!$(`meta[name='${name}']`).attr("content")) metadata.push({ page: route, issue: `Missing ${name}` });
  }
  if (/noarchive/i.test(robots)) metadata.push({ page: route, issue: "Obsolete noarchive directive remains" });
  const schemaSource = $("script[type='application/ld+json'][data-tritonai-schema]").first().text();
  if (!schemaSource) metadata.push({ page: route, issue: "Missing JSON-LD" });
  else {
    try {
      const parsedSchema = JSON.parse(schemaSource);
      const schemaNodes = Array.isArray(parsedSchema) ? parsedSchema : [parsedSchema];
      const pageSchema = schemaNodes.find((node) => node?.["@type"] === "WebSite" || node?.["@type"] === "WebPage");
      if (!pageSchema) metadata.push({ page: route, issue: "JSON-LD is missing a WebSite or WebPage node" });
      else {
        if (pageSchema.inLanguage !== "en-US") metadata.push({ page: route, issue: "JSON-LD must identify en-US content" });
        if (pageSchema.publisher?.["@id"] !== `${OFFICIAL_ORIGIN}/#organization`) metadata.push({ page: route, issue: "JSON-LD publisher must reference UC San Diego" });
        const expectedTopics = seoContent.routes?.[route]?.schemaAbout || [];
        const renderedTopics = (pageSchema.about || []).map((entry) => entry?.name).filter(Boolean);
        if (expectedTopics.some((topic) => !renderedTopics.includes(topic))) metadata.push({ page: route, issue: "JSON-LD is missing configured search topics" });
      }
      if (route === "/") {
        const website = schemaNodes.find((node) => node?.["@type"] === "WebSite");
        const organization = schemaNodes.find((node) => node?.["@type"] === "Organization");
        if (website?.name !== siteContent.name || website?.["@id"] !== `${OFFICIAL_ORIGIN}/#website`) metadata.push({ page: route, issue: "Homepage WebSite schema must identify TritonAI" });
        if (organization?.["@id"] !== `${OFFICIAL_ORIGIN}/#organization` || organization?.name !== "University of California San Diego") metadata.push({ page: route, issue: "Homepage schema must identify UC San Diego as publisher" });
      }
    } catch (error) {
      metadata.push({ page: route, issue: `Invalid JSON-LD: ${error.message}` });
    }
  }
  if (useCaseByRoute.has(route)) {
    const useCase = useCaseByRoute.get(route);
    const requiredSections = [".use-case-overview", ".use-case-governance", ".use-case-evidence", ".use-case-story", ".use-case-actions"];
    for (const selector of requiredSections) {
      if ($(selector).length !== 1) accessibility.push({ page: route, issue: `Expected one ${selector.slice(1)} section` });
    }
    const expectedPrimaryGuidance = useCase.primaryGuidance ? 1 : 0;
    const primaryGuidance = $(".use-case-primary-guidance");
    if (primaryGuidance.length !== expectedPrimaryGuidance) {
      contentFindings.push({ source: route, issue: "Rendered primary guidance does not match use-case content" });
    }
    if (useCase.primaryGuidance && primaryGuidance.length === 1) {
      if (primaryGuidance.find("h2").text().trim() !== useCase.primaryGuidance.title) {
        contentFindings.push({ source: route, issue: "Primary guidance heading does not match use-case content" });
      }
      const renderedResourceHrefs = primaryGuidance.find("nav a[href]").map((_, element) => $(element).attr("href")).get();
      const expectedResourceHrefs = useCase.primaryGuidance.links.map((link) => link.href);
      if (JSON.stringify(renderedResourceHrefs) !== JSON.stringify(expectedResourceHrefs)) {
        contentFindings.push({ source: route, issue: "Primary guidance resources do not match use-case content" });
      }
      if (primaryGuidance.next(".use-case-overview").length !== 1) {
        contentFindings.push({ source: route, issue: "Primary guidance must appear before the use-case overview" });
      }
    }
    if ($(".use-case-governance-grid > div").length !== 4) {
      contentFindings.push({ source: route, issue: "Use-case accountability summary must contain four fields" });
    }
    if ($(".use-case-stats li").length !== (useCase.stats || []).length) {
      contentFindings.push({ source: route, issue: "Rendered impact measures do not match use-case content" });
    }
    if ($(".use-case-tools li").length !== (useCase.toolHighlights || []).length) {
      contentFindings.push({ source: route, issue: "Rendered workflow elements do not match use-case content" });
    }
    if ($(".use-case-demo").length !== (useCase.videoSrc ? 1 : 0)) {
      contentFindings.push({ source: route, issue: "Rendered video does not match use-case content" });
    }
    if ($(".use-case-demo track[kind='captions']").length !== (useCase.videoCaptionsSrc ? 1 : 0)) {
      accessibility.push({ page: route, issue: "Rendered video captions do not match use-case content" });
    }
    if ($(".use-case-screenshot").length !== (useCase.screenshots || []).length) {
      contentFindings.push({ source: route, issue: "Rendered screenshots do not match use-case content" });
    }
    $(".use-case-screenshot").each((_, element) => {
      const screenshot = $(element);
      if (!screenshot.find("img[alt]").attr("alt") || !screenshot.find("figcaption").text().trim()) {
        accessibility.push({ page: route, issue: "Use-case screenshot needs alternative text and a visible caption" });
      }
    });
    if ($(".use-case-narrative-step").length !== 3 || $(".use-case-narrative-step h3").length !== 3) {
      accessibility.push({ page: route, issue: "Use-case narrative must contain three labeled workflow stages" });
    }
  }
  if (route === "/about/strategy.html") {
    const metricGrid = $(".agent-metric-grid");
    const metricCards = metricGrid.children("li").children(".agent-metric-card");
    if (metricGrid.length !== 1 || metricCards.length !== 4) {
      contentFindings.push({ source: route, issue: "Campus impact must use one four-card metric grid" });
    }
    metricCards.each((_, element) => {
      const card = $(element);
      if (card.children(".agent-metric-value").length !== 1 || card.children(".agent-metric-label").length !== 1 || card.children(".agent-metric-note").length !== 1) {
        accessibility.push({ page: route, issue: "Campus impact card is missing its value, label, or context" });
      }
    });
    if ($(".use-case-stat").length) {
      contentFindings.push({ source: route, issue: "Campus impact must use the reusable equal-height metric component" });
    }
  }
  if (route === "/about/trust-architecture.html") {
    const requiredSections = ["#trust-layers", "#trust-surfaces"];
    for (const selector of requiredSections) {
      if ($(selector).length !== 1) contentFindings.push({ source: route, issue: `Trust page is missing ${selector}` });
    }
    if ($(".trust-service-map > ol > li").length !== 5) {
      contentFindings.push({ source: route, issue: "Trust service map must contain five stages" });
    }
    if ($(".trust-layer-grid > article").length !== 4) {
      contentFindings.push({ source: route, issue: "Trust foundation must contain four layers" });
    }
    if ($(".trust-surface-grid > article").length !== 5) {
      contentFindings.push({ source: route, issue: "Trust delivery surfaces must contain five examples" });
    }
    const trustText = $("main#main-content").text();
    for (const requiredName of ["AWS", "Microsoft Azure", "Google Cloud Vertex AI", "San Diego Supercomputer Center"]) {
      if (!trustText.includes(requiredName)) {
        contentFindings.push({ source: route, issue: `Trust page is missing public hosting detail: ${requiredName}` });
      }
    }
  }
  if (route === "/developer-apis/index.html") {
    const architecture = $(".build-architecture");
    if (
      architecture.length !== 1 ||
      architecture.find(".build-architecture-flow > li").length !== 4 ||
      $(".hub-section-intro img[src*='tritonai-architecture-public.svg']").length !== 0
    ) {
      contentFindings.push({ source: route, issue: "Build landing page must use the four-stage semantic service model" });
    }
    const narrativeOrder = $(".landing-hub-content").children("section, nav").map((_, element) => $(element).attr("id")).get().filter(Boolean);
    const expectedNarrativeOrder = [
      "builder-entry-points",
      "what-it-costs",
      "api-gateway",
      "model-catalog",
      "tritonai-harness",
      "workflow-automation",
      "built-on-tritonai",
      "gateway-usage",
      "service-ladder",
      "builder-resources",
      "build-start"
    ];
    const narrativePositions = expectedNarrativeOrder.map((id) => narrativeOrder.indexOf(id));
    if (narrativePositions.some((position) => position === -1) || narrativePositions.some((position, index) => index > 0 && position <= narrativePositions[index - 1])) {
      contentFindings.push({ source: route, issue: "Build landing page sections must follow the path, cost, model, client, workflow, evidence, usage, ladder, and resource narrative" });
    }
    const pathCards = $("#builder-entry-points .builder-track-card");
    if (
      pathCards.length !== 3 ||
      pathCards.filter((_, element) => $(element).find(`a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/developer-apis/harness.html']`).length === 1).length !== 1 ||
      pathCards.filter((_, element) => $(element).find(`a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/developer-apis/start.html#n8n']`).length === 1).length !== 1 ||
      pathCards.filter((_, element) => $(element).find(`a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/developer-apis/start.html']`).length === 1).length !== 1
    ) {
      contentFindings.push({ source: route, issue: "Build landing page must offer the TritonAI Harness, n8n, and API paths the homepage promises" });
    }
    const costSection = $("#what-it-costs");
    if (
      costSection.length !== 1 ||
      costSection.find(".hub-number-grid article").length !== 4 ||
      costSection.text().includes("Recharge is the campus term") === false ||
      /\$\d|per token|per month/.test(costSection.text())
    ) {
      contentFindings.push({ source: route, issue: "Build landing page cost summary must define recharge, list the four funding cases, and leave rates to the Model Hub" });
    }
    const gatewayMap = $("#api-gateway .api-gateway-map");
    if (
      gatewayMap.length !== 1 ||
      gatewayMap.find(".api-gateway-builders .api-gateway-node-list > li").length !== 4 ||
      gatewayMap.find(".api-gateway-workspaces .api-gateway-node-list > li").length !== 3 ||
      gatewayMap.find(".api-gateway-core").length !== 1 ||
      gatewayMap.find(".api-gateway-routes .api-gateway-node-list > li").length !== 2 ||
      gatewayMap.find(".api-gateway-capabilities li").length !== 6 ||
      gatewayMap.find(".api-gateway-node-preferred").text().includes("TritonAI Harness") === false ||
      gatewayMap.find(".api-gateway-core ul").length !== 0 ||
      gatewayMap.text().includes("UC-hosted") === false ||
      /harness(es)?\b(?!.*TritonAI)/i.test(gatewayMap.find(".api-gateway-workspaces").text().replace(/TritonAI Harness/g, ""))
    ) {
      contentFindings.push({ source: route, issue: "API gateway diagram must show four builder groups, three client tiers with TritonAI Harness preferred, one endpoint, two routes named UC-hosted and enterprise cloud, and six capabilities" });
    }
    const modelSection = $("#model-catalog");
    if (
      modelSection.length !== 1 ||
      modelSection.find("table.model-catalog-table tbody tr").length !== (modelCatalogContent.models || []).length ||
      modelSection.find("a[href='https://tritonai-api.ucsd.edu/ui/model_hub_table/']").length < 1 ||
      modelSection.text().includes("UC-hosted") === false
    ) {
      contentFindings.push({ source: route, issue: "Build landing page model catalog must match the synced catalog and point to the Model Hub" });
    }
    const harnessSection = $("#tritonai-harness");
    const harnessText = harnessSection.text().replace(/\s+/g, " ");
    if (
      harnessSection.length !== 1 ||
      harnessSection.find(".build-tool-grid > article").length !== 3 ||
      harnessSection.find(".build-tool-preferred").text().includes("TritonAI Harness") === false ||
      harnessSection.find(`a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/developer-apis/harness.html']`).length !== 1 ||
      harnessSection.find(`a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/developer-apis/start.html#harness']`).length !== 1 ||
      harnessSection.find("a[href*='github.com/dbalders/TritonAI-Installer']").length !== 0 ||
      /in pilot/i.test(harnessText) === false ||
      harnessText.includes("Mac (Apple Silicon) and Windows") === false ||
      /An active TritonAI access key is a prerequisite|Supported packages:|Check access & install|Open TritonAI Harness|releases\/tag\/v\d|hand over full access|whatever the task and your nerves/.test(harnessText)
    ) {
      contentFindings.push({ source: route, issue: "Build page must compare API clients, state TritonAI Harness pilot status and platforms, and hand installation to the setup page" });
    }
    const apiClientGuidance = `${$(".hub-section-intro").text()} ${$("#api-gateway").text()} ${modelSection.text()} ${harnessText} ${$("#build-start").text()}`.replace(/\s+/g, " ");
    for (const requiredTerm of ["primary supported client", "Claude Code and Codex", "Hermes, OpenCode", "Gateway endpoint and key"]) {
      if (apiClientGuidance.includes(requiredTerm) === false) {
        contentFindings.push({ source: route, issue: `Build page API client guidance is missing: ${requiredTerm}` });
      }
    }
    if (/OpenAI[- ]compatible/i.test($("main#main-content").text())) {
      contentFindings.push({ source: route, issue: "Build page must not describe the Gateway as OpenAI-compatible" });
    }
    if (/campus administrative work|not recharged|current Model Hub rates|Research projects charge|grant or approved research project chartstring|inter-campus recharge|chartstring|budget owner|spending limit/.test(apiClientGuidance)) {
      contentFindings.push({ source: route, issue: "Build page must leave detailed eligibility, funding, and billing guidance on the access page" });
    }
    if ($(`#workflow-automation a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/developer-apis/start.html#n8n']`).length !== 1 || $("#workflow-automation a[href='https://n8n.tritonai.ucsd.edu/']").length !== 1) {
      contentFindings.push({ source: route, issue: "Workflow automation section must hand n8n access to the setup page and link the n8n workspace" });
    }
    if (
      $("#built-on-tritonai .use-case-card").length !== 3 ||
      $(`#built-on-tritonai a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/use-cases/class-planner-app.html']`).length < 1 ||
      $(`#built-on-tritonai a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/use-cases/passport-app.html']`).length < 1 ||
      $(`#built-on-tritonai a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/use-cases/ai-use-case-meeting.html']`).length < 1 ||
      $(`#built-on-tritonai a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/use-cases/index.html']`).length !== 1
    ) {
      contentFindings.push({ source: route, issue: "Build landing page must show the featured use cases and link to the portfolio" });
    }
    if ($(`.hub-link-columns a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/developer-apis/start.html']`).length !== 1 || $(`.hub-link-columns a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/developer-apis/citizen-developer.html']`).length !== 1) {
      accessibility.push({ page: route, issue: "Builder resources must link to Get Started and the first-project guide" });
    }
    const serviceLadder = $("#service-ladder");
    if (
      serviceLadder.length !== 1 ||
      serviceLadder.find(".hosting-lanes > .hosting-lane").length !== 4 ||
      serviceLadder.find(".hosting-lane-escalation").length !== 0 ||
      serviceLadder.find(".hosting-lane-triggers li").length !== 3 ||
      serviceLadder.find(`a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/about/team.html']`).length !== 1 ||
      serviceLadder.find(`a[href='${SITE_BASE_PATH ? `/${SITE_BASE_PATH}` : ""}/about/strategy.html']`).length !== 1
    ) {
      contentFindings.push({ source: route, issue: "Build landing page must include the four-rung service ladder, three triggers, and the ownership and lifecycle handoffs" });
    }
    if (
      serviceLadder.text().includes("~1000") ||
      serviceLadder.text().includes("*.apps.ucsd.edu") ||
      serviceLadder.text().includes("*.tritonai.ucsd.edu")
    ) {
      contentFindings.push({ source: route, issue: "Public service ladder must not include internal volume estimates or tentative hosting domains" });
    }
    const gatewayUsage = $("#gateway-usage");
    if (gatewayUsage.length !== 1 || gatewayUsage.find(".gateway-usage-metrics > li").length !== (gatewayUsageContent.metrics || []).length) {
      contentFindings.push({ source: route, issue: "Gateway usage summary does not match structured metrics" });
    }
    if (gatewayUsage.find(".gateway-usage-month").length !== gatewayMonths.length || gatewayUsage.find("tbody tr").length !== gatewayMonths.length) {
      contentFindings.push({ source: route, issue: "Gateway usage chart or table does not match structured monthly data" });
    }
  }
  if (route === "/developer-apis/start.html") {
    const setupPage = $(".developer-start-page");
    const setupText = setupPage.text().replace(/\s+/g, " ").trim();
    const setupSteps = setupPage.find(".developer-start-step, .workbench-card");
    const requestLink = setupPage.find("a[href='https://ucsd.kualibuild.com/app/6979392e4f46f40289d22645/run']");
    const macDownload = setupPage.find("a[data-harness-download='mac']");
    const windowsDownload = setupPage.find("a[data-harness-download='windows']");
    if (
      $("main#main-content h1").first().text().trim() !== "Get Started" ||
      setupSteps.length < 3 ||
      requestLink.length < 1 ||
      /managed runtime|model routing|model route|API token|LLM Gateway|SHA-256/.test(setupText)
    ) {
      contentFindings.push({ source: route, issue: "Gateway access and Harness setup page must preserve the onboarding workbench" });
    }
    if (
      macDownload.length !== 1 ||
      windowsDownload.length !== 1 ||
      macDownload.attr("href") !== harnessInstallerContent.platforms.mac.downloadUrl ||
      windowsDownload.attr("href") !== harnessInstallerContent.platforms.windows.downloadUrl ||
      macDownload.attr("href") === harnessInstallerContent.releaseUrl ||
      windowsDownload.attr("href") === harnessInstallerContent.releaseUrl ||
      setupPage.find("[data-harness-release]").attr("href") !== harnessInstallerContent.releaseUrl
    ) {
      contentFindings.push({ source: route, issue: "Harness setup buttons must download the platform installers directly and preserve the latest release notes link" });
    }
    if (
      !macDownload.find("[data-harness-download-detail]").text().includes(`Version ${harnessInstallerContent.version}`) ||
      !windowsDownload.find("[data-harness-download-detail]").text().includes(`Version ${harnessInstallerContent.version}`) ||
      setupText.includes("Choose the installer for your operating system under Assets on GitHub")
    ) {
      contentFindings.push({ source: route, issue: "Harness setup page must identify the installer version without directing users to select release assets" });
    }
    if (
      setupPage.find("a[href='mailto:tritonai@ucsd.edu']").length < 1 ||
      setupPage.find("a[href='https://pulse.ucsd.edu/departments/is/AI/Pages/default.aspx']").length !== 1 ||
      setupText.includes("Keep the key private") === false
    ) {
      contentFindings.push({ source: route, issue: "Harness setup page is missing key-safety, support, model, or shared-service handoffs" });
    }
    for (const requiredTerm of [
      "Campus and Health Sciences",
      "monthly caps",
      "Other UC campuses",
      "Health System patient care",
      "TritonAI Harness",
      "Claude Code and Codex",
      "grant or project chartstring"
    ]) {
      if (setupText.includes(requiredTerm) === false) {
        contentFindings.push({ source: route, issue: `Harness setup intake guidance is missing: ${requiredTerm}` });
      }
    }
    const catalogIds = new Set((modelCatalogContent.models || []).map((model) => model.id));
    setupPage.find("code").each((_, element) => {
      const value = $(element).text().trim();
      if (/^api-[a-z0-9.-]+$/.test(value) && !catalogIds.has(value)) {
        contentFindings.push({ source: route, issue: `Get Started page names a model route missing from the synced catalog: ${value}` });
      }
    });
    if (/OpenAI[- ]compatible/i.test(setupText)) {
      contentFindings.push({ source: route, issue: "Harness setup page must not describe the Gateway as OpenAI-compatible" });
    }
    if (/(?<!TritonAI )\bHarness\b/.test(setupText)) {
      contentFindings.push({ source: route, issue: "Get Started page must use the full TritonAI Harness name" });
    }
  }
  if (route === "/developer-apis/faq.html") {
    const faqText = $("main#main-content").text().replace(/\s+/g, " ").trim();
    for (const requiredTerm of ["campus administrative work", "not recharged", "current market rate published", "Research projects charge both UC-hosted and cloud model use", "grant or approved research project chartstring", "inter-campus recharge agreement", "recharged for both UC-hosted and cloud model use", "chartstring", "named budget owner", "spend limit", "P4 data is not approved", "patient-care operations", "approval response"]) {
      if (faqText.includes(requiredTerm) === false) {
        contentFindings.push({ source: route, issue: `Developer FAQ access guidance is missing: ${requiredTerm}` });
      }
    }
  }
  if (route === "/about/roadmap.html") {
    const currentItems = (roadmapContent.items || []).filter((item) => /2026/.test(item.period));
    const historyItems = (roadmapContent.items || []).filter((item) => !/2026/.test(item.period));
    const expectedDetails = currentItems.reduce((total, item) => total + (item.details || []).length, 0);
    const expectedLinks = (roadmapContent.items || []).reduce((total, item) => total + (item.links || []).length, 0);
    if ($(".roadmap-status-key").length !== 1 || $(".roadmap-status-key li").length !== 4) {
      accessibility.push({ page: route, issue: "Roadmap status guidance is incomplete" });
    }
    if ($(".agent-roadmap-item-current").length !== currentItems.length || $(".agent-roadmap-item-history").length !== historyItems.length) {
      contentFindings.push({ source: route, issue: "Rendered roadmap milestone counts do not match structured content" });
    }
    if ($(".roadmap-detail-list li").length !== expectedDetails || $(".roadmap-item-links a").length !== expectedLinks) {
      contentFindings.push({ source: route, issue: "Rendered roadmap details or related resources do not match structured content" });
    }
    if ($(".roadmap-current h2, .roadmap-history h2").length !== 2 || $(".agent-roadmap-item h3").length !== (roadmapContent.items || []).length) {
      accessibility.push({ page: route, issue: "Roadmap section and milestone heading hierarchy is incomplete" });
    }
  }
  const updateStreamId = route === "/about/tritonai-updates.html"
    ? "program"
    : route === "/tritongpt/release-notes/index.html"
      ? "product"
      : null;
  if (updateStreamId) {
    const expectedUpdates = (tritonAiUpdatesContent.updates || []).filter((update) => update.stream === updateStreamId);
    if ($(`[data-update-stream='${updateStreamId}']`).length !== 1 || $("[data-update-card]").length !== expectedUpdates.length) {
      contentFindings.push({ source: route, issue: `Rendered ${updateStreamId} update count does not match structured content` });
    }
    if ($("[data-update-year-group]").length !== new Set(expectedUpdates.map((update) => update.date.slice(0, 4))).size) {
      contentFindings.push({ source: route, issue: `Rendered ${updateStreamId} update years do not match structured content` });
    }
    if ($("[data-updates-search]").length !== 1 || $("[data-updates-year]").length !== 1 || $("[data-updates-area]").length !== 1) {
      accessibility.push({ page: route, issue: "TritonAI update filters are missing" });
    }
    if ($("[data-update-card] article[id]").length !== expectedUpdates.length) {
      accessibility.push({ page: route, issue: `${updateStreamId} updates need unique fragment targets` });
    }
  }
  if (["/about/roadmap.html", "/about/tritonai-updates.html", "/tritongpt/release-notes/index.html"].includes(route)) {
    if ($(".delivery-pathway a").length !== 3 || $(".delivery-pathway a[aria-current='page']").length !== 1) {
      accessibility.push({ page: route, issue: "Delivery pathway links or current-page context are incomplete" });
    }
  }
  if (route === "/skills/index.html") {
    const renderedSkills = $("[data-skill-card]");
    if (renderedSkills.length !== (skillsContent.skills || []).length) {
      contentFindings.push({ source: route, issue: `Rendered skill count does not match catalog (${renderedSkills.length} vs ${(skillsContent.skills || []).length})` });
    }
    renderedSkills.each((_, element) => {
      const card = $(element);
      const skillName = card.find(".skills-entry-id code").first().text().trim() || "unknown skill";
      if (card.find(".skills-entry h3").length !== 1) {
        accessibility.push({ page: route, issue: `${skillName} is missing its capability heading` });
      }
      if (card.find(".skills-entry-summary").first().text().trim().length < 20) {
        contentFindings.push({ source: route, issue: `${skillName} is missing a useful capability summary` });
      }
      if (card.find(".skills-entry-action a").length !== 1 || card.find(".skills-details").length !== 1) {
        accessibility.push({ page: route, issue: `${skillName} is missing instructions or usage details` });
      }
    });
    if ($("[data-skills-search]").length !== 1) {
      accessibility.push({ page: route, issue: "Skills search is missing" });
    }
    if ($("[data-skills-collection]").length !== 0) {
      contentFindings.push({ source: route, issue: "TritonAI-only catalog should not render a collection filter" });
    }
  }
  if (route === "/training-resources/pathways.html") {
    const pathwayCards = $(".learning-pathway-card");
    const programCards = $(".learning-program");
    if (pathwayCards.length !== 5) {
      contentFindings.push({ source: route, issue: `Expected 5 role pathways; found ${pathwayCards.length}` });
    }
    pathwayCards.each((_, element) => {
      const card = $(element);
      const label = card.find("h3").first().text().trim() || "Unnamed pathway";
      if (card.find("h3").length !== 1 || card.find(".learning-pathway-action").length !== 1) {
        accessibility.push({ page: route, issue: `${label} is missing a heading or next step` });
      }
      if (card.find(".learning-pathway-steps li").length !== 3) {
        contentFindings.push({ source: route, issue: `${label} does not contain 3 learning steps` });
      }
    });
    if (programCards.length !== 6) {
      contentFindings.push({ source: route, issue: `Expected 6 training programs; found ${programCards.length}` });
    }
    programCards.each((_, element) => {
      const card = $(element);
      const label = card.find("h3").first().text().trim() || "Unnamed program";
      if (card.find("h3").length !== 1 || card.find("a").length !== 1) {
        accessibility.push({ page: route, issue: `${label} is missing a heading or destination` });
      }
    });
    if ($(".learning-access-standard h2").length !== 1 || $(".learning-access-standard a").length !== 1) {
      accessibility.push({ page: route, issue: "Accessible media guidance is incomplete" });
    }
  }
  if (route === "/") {
    const multipleHeroSlides = (homeHeroContent.slides || []).length > 1;
    if ($("#heroslider").length !== 1) accessibility.push({ page: route, issue: "Homepage hero rotator is missing" });
    if ($("#heroslider .item").length !== (homeHeroContent.slides || []).length) {
      contentFindings.push({ source: route, issue: `Rendered hero slide count does not match content (${$("#heroslider .item").length} vs ${(homeHeroContent.slides || []).length})` });
    }
    if ($("#heroslider h1").length || $("#heroslider .hero-slide-heading").length !== (homeHeroContent.slides || []).length) {
      accessibility.push({ page: route, issue: "Homepage carousel must use one h2 heading per slide and no h1 headings" });
    }
    if ($("h1").length !== 1 || !$("#home-feature-heading").is("h1")) {
      accessibility.push({ page: route, issue: "Homepage must have exactly one h1 in the feature section" });
    }
    if ($("#heroslider [data-module='hero-homepage']").first().text().trim() !== homeHeroContent.slides?.[0]?.linkLabel) {
      contentFindings.push({ source: route, issue: "Homepage hero CTA does not match structured content" });
    }
    if (multipleHeroSlides && $("[data-home-hero-toggle]").length !== 1) accessibility.push({ page: route, issue: "Homepage hero pause control is missing" });
    if (!multipleHeroSlides && $("[data-home-hero-toggle], #heroslider .carousel-control").length) accessibility.push({ page: route, issue: "Single-slide homepage hero must not render carousel controls" });
    const inactiveHeroImages = $("#heroslider .item:not(.active) img.first-slide");
    if (multipleHeroSlides && (!inactiveHeroImages.length || inactiveHeroImages.filter("[data-src$='.webp']").length !== inactiveHeroImages.length)) {
      performance.push({ page: route, issue: "Inactive hero images must use deferred optimized sources" });
    }
    const activeHeroImage = $("#heroslider .item.active img.first-slide");
    const desktopHeroSource = $("#heroslider .item.active picture source[media='(min-width: 768px)']");
    if (!/TritonAI_Hero_828\.webp(?:$|[?#])/.test(activeHeroImage.attr("src") || "") || activeHeroImage.attr("fetchpriority") !== "high") {
      performance.push({ page: route, issue: "Homepage must prioritize the mobile-sized hero image" });
    }
    if (!/TritonAI_Hero_2500\.webp(?:$|[?#])/.test(desktopHeroSource.attr("srcset") || "")) {
      performance.push({ page: route, issue: "Homepage hero must provide the full-width source at the desktop breakpoint" });
    }
    if ($("[data-today-news]").length !== 1 || $("[data-today-news-cards]").length !== 1 || $("[data-today-news-status]").length !== 1) {
      contentFindings.push({ source: route, issue: "Today@UCSD news module is missing required hooks" });
    }
    if ($("script[src$='/_resources/js/today-news.js'][defer]").length !== 1) {
      performance.push({ page: route, issue: "Today@UCSD lazy loader is missing or not deferred" });
    }
    if ($("[data-home-subscribe]").length !== 1 || $("[data-home-subscribe] .btn-primary").length !== 1) {
      contentFindings.push({ source: route, issue: "Homepage subscription CTA is missing" });
    }
    if (/background-image/i.test($(".home-feature").attr("style") || "")) {
      performance.push({ page: route, issue: "Homepage feature background must be managed by responsive CSS" });
    }
  }
}

for (const [title, routes] of metadataTitles) {
  if (routes.length > 1) metadata.push({ page: routes.join(", "), issue: `Duplicate indexable title: ${title}` });
}

// Chrome tiers 1 and 2 compare routes against each other and against the
// recorded contract, so they need every route collected first. Tier 3 findings
// are folded here because one shell edit otherwise reports on every route.
{
  const structural = chrome.splice(0, chrome.length);
  chrome.push(...foldByRule(structural));
  chrome.push(...checkCrossPageConsistency(chromeByRoute));
  chrome.push(...checkGoldenFingerprint(chromeByRoute, await loadChromeContract()));
  // Tier 4 reads the site's own stylesheets and scripts rather than the routes:
  // the shell's markup can be intact while site CSS restyles it and site JS
  // rewrites its ids.
  chrome.push(...(await collectStyling({ chromeTokens, canvasTokens })).findings);
}

for (const filename of files.filter((file) => file.startsWith("_resources/css/") && file.endsWith(".css"))) {
  const source = await readFile(path.join(DIST_DIR, filename), "utf8");
  for (const match of source.matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
    const family = match[1].trim();
    if (!/\b(?:Roboto|Teko-SemiBold)\b/i.test(family)) {
      decorator.push({ page: `/${filename}`, issue: `Non-Decorator font-family declaration: ${family}` });
    }
  }
}

const performanceRuntimeSource = await readFile(path.join(DIST_DIR, "_resources/js/site-performance.js"), "utf8").catch(() => "");
for (const behavior of ["IntersectionObserver", "requestIdleCallback", "data-after-render-src", 'document.addEventListener("pointerover"', 'document.addEventListener("touchstart"']) {
  if (!performanceRuntimeSource.includes(behavior)) performance.push({ page: "/_resources/js/site-performance.js", issue: `Missing runtime behavior: ${behavior}` });
}

const webMcpRuntimeSource = await readFile(path.join(DIST_DIR, "_resources/js/webmcp.js"), "utf8").catch(() => "");
for (const behavior of ["document.modelContext", "registerTool", "get-tritonai-page", "list-tritonai-page-links", "readOnlyHint", "untrustedContentHint"]) {
  if (!webMcpRuntimeSource.includes(behavior)) webMcp.push({ page: "/_resources/js/webmcp.js", issue: `Missing WebMCP behavior: ${behavior}` });
}

let routeManifest = null;
try {
  routeManifest = JSON.parse(await readFile(path.join(DIST_DIR, "_data/routes.json"), "utf8"));
} catch (error) {
  contentFindings.push({ source: "dist/_data/routes.json", issue: error.message });
}
const sitemap = await readFile(path.join(DIST_DIR, "sitemap.xml"), "utf8").catch(() => "");
const routeFindings = [];
const listedHtmlFiles = htmlFiles.filter((file) => !standaloneRoutes.has(normalizeRoute(`/${file}`)));
if (!routeManifest || routeManifest.routes?.length !== listedHtmlFiles.length) {
  routeFindings.push({ issue: `Route manifest count does not match listed HTML count (${routeManifest?.routes?.length || 0} vs ${listedHtmlFiles.length})` });
} else {
  for (const route of routeManifest.routes) {
    const included = sitemap.includes(`<loc>${route.canonicalUrl}</loc>`);
    if (route.indexable && !included) routeFindings.push({ path: route.path, issue: "Indexable route is missing from sitemap" });
    if (!route.indexable && !route.redirectTo && included) routeFindings.push({ path: route.path, issue: "Non-indexable route appears in sitemap" });
  }
}
for (const route of standaloneRoutes) {
  if (routeManifest?.routes?.some((entry) => entry.path === route)) {
    routeFindings.push({ path: route, issue: "Unlisted standalone route appears in the public route manifest" });
  }
  if (sitemap.includes(`<loc>${OFFICIAL_ORIGIN}${route}</loc>`)) {
    routeFindings.push({ path: route, issue: "Unlisted standalone route appears in the sitemap" });
  }
}
if (!(await exists(path.join(DIST_DIR, "404.html")))) routeFindings.push({ path: "/404.html", issue: "Custom 404 is missing" });
if (!(await exists(path.join(DIST_DIR, "robots.txt")))) routeFindings.push({ path: "/robots.txt", issue: "robots.txt is missing" });

const remoteChecks = [];
for (const url of requiredRemoteDependencies) {
  const attempts = [];
  for (const [attemptIndex, method] of ["HEAD", "GET", "GET"].entries()) {
    try {
      const response = await fetch(url, {
        method,
        headers: { "User-Agent": "tritonai-website-validator" },
        signal: AbortSignal.timeout(15000),
      });
      attempts.push({ attempt: attemptIndex + 1, method, status: response.status, ok: response.ok });
      if (response.ok) break;
    } catch (error) {
      attempts.push({ attempt: attemptIndex + 1, method, status: "FETCH_ERROR", ok: false, error: error.message });
    }
  }
  const successfulAttempt = attempts.find((attempt) => attempt.ok);
  const finalAttempt = successfulAttempt || attempts.at(-1);
  remoteChecks.push({ url, ...finalAttempt, attempts });
}

const newsletterCount = htmlFiles.includes("about/ai-updates.html")
  ? load(await readFile(path.join(DIST_DIR, "about/ai-updates.html"), "utf8"))("article.agent-newsletter").length
  : 0;
const report = {
  checkedAt: new Date().toISOString(),
  counts: {
    files: files.length,
    htmlFiles: htmlFiles.length,
    newsletters: newsletterCount,
    tritonAiUpdates: (tritonAiUpdatesContent.updates || []).length,
    skills: (skillsContent.skills || []).length,
    missingInternalTargets: missing.length,
    inheritedProductionFailures: inherited.length,
    remoteDependencyFailures: remoteChecks.filter((check) => !check.ok).length,
    contentSchemaFailures: contentFindings.length,
    freshnessWarnings: freshnessWarnings.length,
    freshnessFailures: freshnessFailures.length,
    accessibilityFailures: accessibility.length,
    navigationFailures: navigation.length,
    metadataFailures: metadata.length,
    routeFailures: routeFindings.length,
    performanceFailures: performance.length,
    decoratorFailures: decorator.length,
    chromeFailures: chrome.length,
    analyticsFailures: analytics.length,
    webMcpFailures: webMcp.length,
  },
  missing,
  inherited,
  remoteChecks,
  contentFindings,
  freshnessWarnings,
  freshnessFailures,
  accessibility,
  navigation,
  metadata,
  routeFindings,
  performance,
  decorator,
  chrome,
  analytics,
  webMcp,
};
await mkdir(REPORT_DIR, { recursive: true });
await writeFile(path.join(REPORT_DIR, "validation.json"), `${JSON.stringify(report, null, 2)}\n`);

process.stdout.write(`${JSON.stringify(report.counts, null, 2)}\n`);
const remoteFailures = remoteChecks.filter((check) => !check.ok);
if (remoteFailures.length) {
  process.stdout.write(`::warning::${remoteFailures.length} remote dependency check(s) failed\n`);
  for (const check of remoteFailures) {
    process.stdout.write(`  ${check.url} (${check.attempts} attempts)\n`);
  }
}
if (inherited.length) process.stdout.write(`Preserved ${inherited.length} inherited broken-link occurrences.\n`);
if (
  missing.length ||
  newsletterCount < 1 ||
  contentFindings.length ||
  freshnessFailures.length ||
  accessibility.length ||
  navigation.length ||
  metadata.length ||
  routeFindings.length ||
  performance.length ||
  decorator.length ||
  chrome.length ||
  analytics.length ||
  webMcp.length
) {
  // Chrome findings carry the markup and the source of truth, so print them in
  // full rather than making the reader open the JSON report to self-correct.
  if (chrome.length) process.stderr.write(`${formatFindings(chrome)}\n\n`);
  process.stderr.write("Validation failed. See reports/validation.json.\n");
  process.exit(1);
} else {
  process.stdout.write("Validation passed.\n");
}
