import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { load } from "cheerio";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const SOURCE_DIR = path.resolve("src/site");
const CONTENT_DIR = path.resolve("content");
const ROOT_DIR = path.resolve(".");
const PAGE_DIR = path.join(CONTENT_DIR, "pages");
const USE_CASE_DIR = path.join(CONTENT_DIR, "use-cases");
const TRAINING_VIDEO_DIR = path.join(CONTENT_DIR, "training-videos");
const NEWSLETTER_DIR = path.join(CONTENT_DIR, "newsletters");
const SKILLS_FILE = path.join(CONTENT_DIR, "skills/library.json");
const HOME_HERO_FILE = path.join(CONTENT_DIR, "home/hero.json");
const GATEWAY_USAGE_FILE = path.join(CONTENT_DIR, "facts/gateway-usage.json");
const SEO_FILE = path.join(CONTENT_DIR, "seo.json");
const TRITONAI_UPDATES_FILE = path.join(CONTENT_DIR, "updates/tritonai-updates.json");
const PRESENTATION_DIR = path.resolve("presentations");
// Overridable so a test can build into a scratch directory instead of clobbering
// dist/. Everything else about the build is identical.
const OUTPUT_DIR = path.resolve(process.env.OUTPUT_DIR || "dist");
const AGENT_SITE_CSS_VERSION = createHash("sha256")
  .update(await readFile(path.join(SOURCE_DIR, "_resources/css/agent-site.css")))
  .digest("hex")
  .slice(0, 12);
const LANDING_HUBS_CSS_VERSION = createHash("sha256")
  .update(await readFile(path.join(SOURCE_DIR, "_resources/css/landing-hubs.css")))
  .digest("hex")
  .slice(0, 12);
const VIDEO_PROGRESS_JS_VERSION = createHash("sha256")
  .update(await readFile(path.join(SOURCE_DIR, "_resources/js/video-progress.js")))
  .digest("hex")
  .slice(0, 12);
const VIDEO_QUIZ_JS_VERSION = createHash("sha256").update(await readFile(path.join(SOURCE_DIR, "_resources/js/video-quiz.js"))).digest("hex").slice(0, 12);
const OFFICIAL_ORIGIN = "https://tritonai.ucsd.edu";
const SITE_BASE_PATH = normalizeBasePath(process.env.SITE_BASE_PATH || "");
// Cascade serves the site at a domain root, so a production build carries no
// base path. Anything with one is the playground on GitHub Pages, which must
// not be indexed — it would compete with tritonai.ucsd.edu for its own content.
const IS_PRODUCTION_BUILD = SITE_BASE_PATH === "";
const UNLISTED_ROUTES = new Set([
  "/presentations/managing-the-tritonai-website.html",
  "/training/harness/index.html",
]);
const AFTER_RENDER_SCRIPTS = new Set([
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/modernizr.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/jquery.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/bootstrap.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/vendor.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/base.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/decorator.js",
  "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.runtime.min.js",
  "https://cdn.ucsd.edu/cms/search/js/templates.js",
  "https://cdn.ucsd.edu/cms/search/js/search-api.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/datatables.min.js",
  "https://cdn.ucsd.edu/cms/decorator-5/scripts/datatables-loader.js",
]);
const EMERGENCY_BROADCAST_SCRIPT = "https://www.ucsd.edu/common/_emergency-broadcast/message.js";
const TRITONGPT_WIDGET_SCRIPT = "https://cdn.ucsd.edu/tritongpt/widget/js/tgpt-loader.js";
// The build owns the analytics tag. Pages must not carry their own copy; every
// route gets this one injected below. `validate.mjs` fails the build if a route
// is missing it or carries a different measurement ID.
const GOOGLE_ANALYTICS_ID = "G-CSQGMG6EFP";
const GOOGLE_ANALYTICS_COOKIE_DOMAIN = "tritonai.ucsd.edu";
const PRECONNECT_ORIGINS = [
  "https://cdn.ucsd.edu",
  "https://www.ucsd.edu",
  "https://tritongpt-deck.vercel.app",
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
];

function normalizeBasePath(value) {
  if (!value || value === "/") return "";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function asDate(value) {
  if (value instanceof Date) return value;
  return new Date(`${value}T12:00:00Z`);
}

function isoDate(value) {
  const date = asDate(value);
  if (Number.isNaN(date.valueOf())) throw new Error(`Invalid date: ${value}`);
  return date.toISOString().slice(0, 10);
}

function requireFields(object, fields, source) {
  const missing = fields.filter((field) => object[field] === undefined || object[field] === null || object[field] === "");
  if (missing.length) throw new Error(`${source} is missing required fields: ${missing.join(", ")}`);
}

const markdown = new MarkdownIt({ html: true, linkify: false, typographer: true });
const defaultLinkOpen =
  markdown.renderer.rules.link_open || ((tokens, index, options, env, self) => self.renderToken(tokens, index, options));
markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  const href = tokens[index].attrGet("href") || "";
  if (/^https?:\/\//i.test(href)) {
    tokens[index].attrSet("target", "_blank");
    tokens[index].attrSet("rel", "noopener noreferrer");
  }
  return defaultLinkOpen(tokens, index, options, env, self);
};

async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

// `<!-- lang-ok: reason -->` markers are editorial notes for
// scripts/language-check.mjs. They are not published.
function stripLanguageCheckComments(body) {
  return body.replace(/^[ \t]*<!--\s*lang-ok:[\s\S]*?-->[ \t]*\n?/gm, "");
}

function isCanonicalMarkdownFilename(name) {
  return name.endsWith(".md") && !/ \d+\.md$/i.test(name);
}

async function loadMarkdownDirectory(directory, requiredFields) {
  const filenames = (await readdir(directory)).filter(isCanonicalMarkdownFilename).sort();
  const entries = [];
  for (const filename of filenames) {
    const parsed = matter(await readFile(path.join(directory, filename), "utf8"));
    requireFields(parsed.data, requiredFields, path.relative(process.cwd(), path.join(directory, filename)));
    parsed.data.lastReviewed = isoDate(parsed.data.lastReviewed);
    const body = stripLanguageCheckComments(parsed.content);
    entries.push({ filename, ...parsed.data, body, html: markdown.render(body) });
  }
  return entries;
}

async function loadNewsletters() {
  const filenames = (await readdir(NEWSLETTER_DIR)).filter(isCanonicalMarkdownFilename);
  const newsletters = [];
  for (const filename of filenames) {
    const parsed = matter(await readFile(path.join(NEWSLETTER_DIR, filename), "utf8"));
    requireFields(parsed.data, ["title", "date", "items"], `content/newsletters/${filename}`);
    const date = asDate(parsed.data.date);
    if (Number.isNaN(date.valueOf())) throw new Error(`Invalid newsletter date in ${filename}`);
    const items = Number(parsed.data.items);
    if (!Number.isInteger(items) || items < 1) {
      throw new Error(`Newsletter ${filename} must contain at least one item`);
    }
    newsletters.push({
      filename,
      title: parsed.data.title,
      date,
      source: parsed.data.source || filename,
      items,
      html: markdown.render(parsed.content),
    });
  }
  newsletters.sort((a, b) => b.date - a.date);
  return newsletters;
}

function renderNewsletter(newsletter) {
  const plural = newsletter.items === 1 ? "item" : "items";
  const dateId = newsletter.date.toISOString().slice(0, 10);
  return `<article class="panel panel-default agent-newsletter" id="${dateId}"><div class="panel-heading"><h2>${escapeHtml(newsletter.title)}</h2><p>${newsletter.items} ${plural}</p></div><div class="panel-body">${newsletter.html}</div></article>`;
}

function renderDeliveryPathway(current) {
  const steps = [
    { id: "roadmap", label: "Roadmap", href: "/about/roadmap.html", description: "Approved direction and delivery status" },
    { id: "updates", label: "TritonAI Updates", href: "/about/tritonai-updates.html", description: "Verified program launches and milestones" },
    { id: "features", label: "TritonGPT Feature Updates", href: "/tritongpt/release-notes/index.html", description: "Deployed product changes for users" },
  ];
  const items = steps
    .map((step, index) => `<li${step.id === current ? ' class="delivery-pathway-current"' : ""}><a href="${step.href}"${step.id === current ? ' aria-current="page"' : ""}><span class="delivery-pathway-number" aria-hidden="true">${index + 1}</span><span><strong>${escapeHtml(step.label)}</strong><small>${escapeHtml(step.description)}</small></span></a></li>`)
    .join("");
  return `<nav class="delivery-pathway" aria-labelledby="delivery-pathway-heading"><div class="delivery-pathway-heading"><p class="home-kicker">From direction to delivery</p><h2 id="delivery-pathway-heading">Follow the work at each stage</h2><p>The roadmap shows approved work. Program updates record delivery. Feature updates explain changes available in TritonGPT.</p></div><ol>${items}</ol></nav>`;
}

function renderTritonAiUpdates(feed, streamId) {
  const stream = feed.streams.find((entry) => entry.id === streamId);
  if (!stream) throw new Error(`Unknown TritonAI update stream: ${streamId}`);
  const updates = feed.updates.filter((update) => update.stream === streamId);
  const areaById = new Map(feed.areas.map((area) => [area.id, area]));
  const representedAreas = new Set(updates.map((update) => update.area));
  const areas = feed.areas.filter((area) => representedAreas.has(area.id));
  const years = [...new Set(updates.map((update) => update.date.slice(0, 4)))];
  const areaCards = areas
    .map((area) => `<li><span class="glyphicon glyphicon-${escapeHtml(area.icon)}" aria-hidden="true"></span><span>${escapeHtml(area.label)}</span></li>`)
    .join("");
  const yearOptions = years.map((year) => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`).join("");
  const areaOptions = areas
    .map((area) => `<option value="${escapeHtml(area.id)}">${escapeHtml(area.label)}</option>`)
    .join("");
  const groups = years
    .map((year) => {
      const items = updates
        .filter((update) => update.date.startsWith(year))
        .map((update) => {
          const area = areaById.get(update.area);
          const searchText = load(`<div>${update.title}${update.details}</div>`).text().replace(/\s+/g, " ").trim().toLowerCase();
          return `<li class="triton-update-item" data-update-card data-update-area="${escapeHtml(update.area)}" data-update-search="${escapeHtml(searchText)}"><article id="${escapeHtml(update.id)}" class="triton-update-card"><div class="triton-update-date"><time datetime="${escapeHtml(update.date)}">${escapeHtml(update.displayDate)}</time></div><div class="triton-update-body"><p class="triton-update-area"><span class="glyphicon glyphicon-${escapeHtml(area.icon)}" aria-hidden="true"></span>${escapeHtml(area.label)}</p><h3>${escapeHtml(update.title)}</h3>${update.details}</div></article></li>`;
        })
        .join("");
      return `<section class="triton-update-year" aria-labelledby="updates-${escapeHtml(year)}" data-update-year-group data-update-year="${escapeHtml(year)}"><div class="triton-update-year-heading"><h2 id="updates-${escapeHtml(year)}">${escapeHtml(year)}</h2><span aria-hidden="true"></span></div><ol class="triton-update-list">${items}</ol></section>`;
    })
    .join("");

  const pathwayCurrent = streamId === "program" ? "updates" : "features";
  return `<div class="triton-updates-experience" data-update-stream="${escapeHtml(streamId)}">${renderDeliveryPathway(pathwayCurrent)}<section class="triton-updates-intro" aria-labelledby="triton-updates-intro-heading"><div class="container"><div class="triton-updates-intro-grid"><div><p class="home-kicker">${escapeHtml(stream.introKicker)}</p><h2 id="triton-updates-intro-heading">${escapeHtml(stream.introHeading)}</h2><p class="hub-lede">${escapeHtml(stream.introDescription)}</p></div><ul class="triton-updates-area-key" aria-label="Update areas">${areaCards}</ul></div></div></section><section class="triton-updates-feed" aria-labelledby="triton-updates-feed-heading"><div class="container"><div class="triton-updates-heading"><div><p class="home-kicker">${escapeHtml(stream.feedKicker)}</p><h2 id="triton-updates-feed-heading">${escapeHtml(stream.feedHeading)}</h2></div><p>${escapeHtml(stream.feedDescription)}</p></div><form class="triton-updates-filter" role="search" aria-label="Filter ${escapeHtml(stream.title)}" data-updates-filter><div class="triton-updates-filter-grid"><div><label for="updates-search">Search updates</label><div class="input-group"><span class="input-group-addon"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></span><input class="form-control" id="updates-search" type="search" autocomplete="off" placeholder="${escapeHtml(stream.searchPlaceholder)}" data-updates-search></div></div><div><label for="updates-year">Year</label><select class="form-control" id="updates-year" data-updates-year><option value="">All years</option>${yearOptions}</select></div><div><label for="updates-area">Area</label><select class="form-control" id="updates-area" data-updates-area><option value="">All areas</option>${areaOptions}</select></div><div class="triton-updates-filter-action"><button class="btn btn-default" type="reset" data-updates-reset>Clear filters</button></div></div><p class="triton-updates-status" data-updates-status aria-live="polite"></p></form><div data-updates-results>${groups}<div class="triton-updates-empty alert alert-info" data-updates-empty hidden><h2 class="h3">No updates match those filters</h2><p>Try a broader search, another year, or all areas.</p></div></div></div></section></div>`;
}

function findFirstNewsletterStory($newsletter, firstStoryHeading) {
  let candidate = firstStoryHeading.next();
  while (candidate.length && !candidate.is("h2, h3")) {
    const storyElement = candidate.is("p, li") ? candidate : candidate.find("p, li").first();
    const storyText = storyElement.text().trim();
    if (storyText) return storyText;
    candidate = candidate.next();
  }
  return $newsletter("li, p").first().text().trim();
}

function renderLatestNewsletters(newsletters) {
  if (!newsletters.length) return '<div class="alert alert-info">No AI updates are available yet.</div>';
  const [latest, ...recent] = newsletters.slice(0, 3);
  const $latest = load(latest.html, { decodeEntities: false });
  const topics = [];
  $latest("h2").each((_, element) => {
    const topic = $latest(element).text().trim();
    if (topic && !/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i.test(topic) && !topics.includes(topic) && topics.length < 3) topics.push(topic);
  });
  const firstTopicHeading = $latest("h3").first();
  const firstStory = findFirstNewsletterStory($latest, firstTopicHeading);
  const normalizedFirstStory = firstStory.replace(/\s+/g, " ").trim();
  const excerpt =
    normalizedFirstStory.length > 280
      ? normalizedFirstStory.slice(0, 280).replace(/\s+\S*$/, "")
      : normalizedFirstStory;
  const excerptWasTruncated = excerpt.length < normalizedFirstStory.length;
  const dateId = latest.date.toISOString().slice(0, 10);
  const topicBadges = topics.map((topic) => `<span class="label label-default">${escapeHtml(topic)}</span>`).join(" ");
  const recentCards = recent
    .map(
      (newsletter) =>
        `<div class="col-sm-6"><article class="panel panel-default home-update-card"><div class="panel-body"><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span><p class="home-kicker">Recent update</p><h3>${escapeHtml(newsletter.title)}</h3><p>${newsletter.items} ${newsletter.items === 1 ? "item" : "items"} on campus AI tools, training, and news.</p><a href="/about/ai-updates.html#${escapeHtml(newsletter.date.toISOString().slice(0, 10))}">Read this update <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></a></div></article></div>`,
    )
    .join("");
  return `<article class="panel panel-default home-latest-update"><div class="panel-heading"><div><p class="home-kicker">This week</p><h3>${escapeHtml(latest.title)}</h3></div><span class="home-update-count">${latest.items} ${latest.items === 1 ? "item" : "items"}</span></div><div class="panel-body"><p class="home-update-topics">${topicBadges}</p><p>${escapeHtml(excerpt)}${excerptWasTruncated ? "…" : ""}</p><p><a class="btn btn-primary" href="/about/ai-updates.html#${dateId}">Read the latest update</a></p></div></article>${recentCards ? `<div class="row agent-card-grid home-recent-updates">${recentCards}</div>` : ""}`;
}

function statusClass(status) {
  if (status === "Shipped" || status === "Production") return "agent-status-shipped";
  if (status === "Pilot") return "agent-status-pilot";
  if (status === "In development") return "agent-status-development";
  return "agent-status-exploring";
}

function renderStatus(status) {
  return `<span class="agent-status ${statusClass(status)}">${escapeHtml(status)}</span>`;
}

const USE_CASE_ICON_MAP = {
  "contract-review": "file",
  "transcript-matching": "education",
  "dissertation-formatter": "book",
  "pdf-remediation": "eye-open",
  biobib: "list-alt",
  "ai-use-case-meeting": "comment",
  "instructional-ai": "blackboard",
  "research-alignment": "search",
  "class-planner": "calendar",
  "class-planner-app": "calendar",
  "voice-agent": "earphone",
  "passport-app": "check",
};

const USE_CASE_MEDIA = {
  "contract-review": {
    src: "/_images/use-cases/contract-review-public.webp",
    alt: "Open contract with original clauses beside tracked revisions as a reviewer completes the final approval",
  },
  "transcript-matching": {
    src: "/_images/use-cases/transcript-matching-public.webp",
    alt: "Two sets of academic records connected by course-equivalency paths, with an uncertain match routed for review",
  },
  "instructional-ai": {
    src: "/_images/use-cases/instructional-ai-public.webp",
    alt: "Student in a guided dialogue connected to instructor-selected books, notes, and course materials",
  },
  "ai-use-case-meeting": {
    src: "/_images/use-cases/ai-use-case-meeting-public.webp",
    alt: "Staff hands arranging users, data boundaries, risks, and outcomes on a collaborative use-case canvas",
  },
  biobib: {
    src: "/_images/use-cases/biobib-public.webp",
    alt: "Faculty publications, teaching, service, and awards branching into a review-ready academic portfolio",
  },
  "class-planner": {
    src: "/_images/use-cases/class-planner-public.webp",
    alt: "Color-coded course blocks arranged on a weekly planner, with unavailable times and three schedule options for comparison",
  },
  "class-planner-app": {
    src: "/_images/use-cases/class-planner-public.webp",
    alt: "Weekly planner grid of color-coded course sections compared across schedule options before enrollment",
  },
  "dissertation-formatter": {
    src: "/_images/use-cases/dissertation-formatter-public.webp",
    alt: "Dissertation page on a technical drafting table with margin, hierarchy, and alignment guides",
  },
  "passport-app": {
    src: "/_images/use-cases/passport-app-public.webp",
    alt: "Visitor checking in at a kiosk before following a privacy-safe queue path to a staffed service counter",
  },
  "pdf-remediation": {
    src: "/_images/use-cases/pdf-remediation-public.webp",
    alt: "Document separated into transparent semantic layers while a human remediator inspects an unresolved issue",
  },
  "research-alignment": {
    src: "/_images/use-cases/research-alignment-public.webp",
    alt: "Research profile constellation linked through traceable publication, funding, method, and collaborator clusters",
  },
  "voice-agent": {
    src: "/_images/use-cases/voice-agent-public.webp",
    alt: "Staff conversation waveform with protected segments becoming a human-reviewed evidence map",
  },
};

function renderUseCaseCards(useCases) {
  return `<div class="row agent-card-grid">${useCases
    .map((useCase) => {
      const image = USE_CASE_MEDIA[useCase.slug];
      const imageHtml = image
        ? `<a class="use-case-card-image" href="${escapeHtml(useCase.canonicalUrl)}"><img alt="${escapeHtml(image.alt)}" class="img-responsive" src="${escapeHtml(useCaseCardSource(image.src))}" width="768" height="432"></a>`
        : "";
      return `<div class="col-sm-6 col-md-4"><article class="panel panel-default agent-card use-case-card">${imageHtml}<div class="panel-body"><span class="glyphicon glyphicon-${USE_CASE_ICON_MAP[useCase.slug] || "star"} use-case-card-icon" aria-hidden="true"></span>${renderStatus(useCase.status)}<h2 class="h3"><a href="${escapeHtml(useCase.canonicalUrl)}">${escapeHtml(useCase.title)}</a></h2><p>${escapeHtml(useCase.summary)}</p><p><strong>Measure:</strong> ${escapeHtml(useCase.measurableOutcome)}</p></div></article></div>`;
    })
    .join("")}</div>`;
}

const FEATURED_USE_CASE_SLUGS = ["contract-review", "transcript-matching", "instructional-ai"];

function featuredUseCases(useCases) {
  return FEATURED_USE_CASE_SLUGS.map((slug) => useCases.find((entry) => entry.slug === slug)).filter(Boolean);
}

function useCaseCardSource(source) {
  return source.replace(/\.webp$/i, "-768.webp");
}

function renderUseCaseIndex(useCases) {
  const featured = featuredUseCases(useCases);
  const remaining = useCases.filter((entry) => !FEATURED_USE_CASE_SLUGS.includes(entry.slug));
  const featuredHtml = featured
    .map((entry) => {
      const image = USE_CASE_MEDIA[entry.slug];
      return `<div class="col-md-4"><article class="panel panel-default cms-news-card cms-use-case-card"><a class="cms-news-image" href="${escapeHtml(entry.canonicalUrl)}"><img alt="${escapeHtml(image.alt)}" class="img-responsive" src="${escapeHtml(useCaseCardSource(image.src))}" width="768" height="432"></a><div class="panel-body">${renderStatus(entry.status)}<h3><a href="${escapeHtml(entry.canonicalUrl)}">${escapeHtml(entry.title)}</a></h3><p>${escapeHtml(entry.summary)}</p><p><a class="text-link" href="${escapeHtml(entry.canonicalUrl)}">Explore ${escapeHtml(entry.title)}</a></p></div></article></div>`;
    })
    .join("");
  const remainingHtml = remaining
    .map((entry) => {
      const image = USE_CASE_MEDIA[entry.slug];
      return `<div class="col-sm-6 col-md-4"><article class="panel panel-default cms-news-card cms-use-case-card"><a class="cms-news-image" href="${escapeHtml(entry.canonicalUrl)}"><img alt="${escapeHtml(image.alt)}" class="img-responsive" src="${escapeHtml(useCaseCardSource(image.src))}" width="768" height="432"></a><div class="panel-body">${renderStatus(entry.status)}<h3><a href="${escapeHtml(entry.canonicalUrl)}">${escapeHtml(entry.title)}</a></h3><p>${escapeHtml(entry.summary)}</p><p><a class="text-link" href="${escapeHtml(entry.canonicalUrl)}">Explore ${escapeHtml(entry.title)}</a></p></div></article></div>`;
    })
    .join("");
  const anatomyHtml = `<section aria-labelledby="use-case-anatomy-heading" class="landing-section use-case-anatomy-section"><div class="container"><div class="landing-section-heading"><p class="home-kicker">A shared operating pattern</p><h2 id="use-case-anatomy-heading">Anatomy of a supervised workflow</h2><p>Each service solves a different problem. Supported workflows still share the same accountability points.</p></div><figure class="triton-graphic triton-workflow-anatomy" aria-describedby="use-case-anatomy-caption"><ol><li><span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span><strong>Campus need</strong><small>A bounded problem with a named owner</small></li><li><span class="glyphicon glyphicon-lock" aria-hidden="true"></span><strong>Approved inputs</strong><small>Data and sources cleared for the task</small></li><li><span class="glyphicon glyphicon-cog" aria-hidden="true"></span><strong>AI-supported work</strong><small>Models, rules, skills, or automation</small></li><li><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span><strong>Human review</strong><small>A person checks consequential results or actions</small></li><li><span class="glyphicon glyphicon-stats" aria-hidden="true"></span><strong>Outcome and evidence</strong><small>Measure quality, usefulness, and exceptions</small></li></ol><figcaption id="use-case-anatomy-caption">The service owner remains responsible from the first need through review of the measured outcome.</figcaption></figure></div></section>`;
  return `${anatomyHtml}<section aria-labelledby="featured-use-cases-heading" class="landing-section cms-news-module"><div class="container"><div class="landing-section-heading"><p class="home-kicker">Featured</p><h2 id="featured-use-cases-heading">Featured use cases</h2><p>These three cover the range, from a service running in production to a bounded instructional pilot.</p></div><div class="row cms-news-grid">${featuredHtml}</div></div></section><section aria-labelledby="all-use-cases-heading" class="landing-section landing-section-sand cms-tiles-module"><div class="container"><div class="landing-section-heading"><p class="home-kicker">Explore the portfolio</p><h2 id="all-use-cases-heading">More campus workflows</h2><p>The status label on each one tells you whether you can use it today or whether we are still working on it.</p></div><div class="row cms-tile-grid">${remainingHtml}</div></div></section><section aria-labelledby="propose-use-case-heading" class="jumbotron jumbotron-callout-image-small-inset"><div class="container"><div class="row"><div class="col-md-7"><div class="panel panel-default"><div class="panel-body"><h2 id="propose-use-case-heading">Bring a recurring problem</h2><p class="panel-text">Tell us the workflow, who owns it, what data it uses, and what should get better.</p><p><a class="btn btn-default" href="/about/get-involved.html">Start a use-case conversation</a></p></div></div></div></div></div></section>`;
}

function renderUseCaseNarrative(html, slug) {
  const $ = load(`<div data-use-case-narrative-source>${html}</div>`, { decodeEntities: false });
  const sections = [];
  let current = null;
  $("[data-use-case-narrative-source]").children().each((_, element) => {
    if ($(element).is("h2")) {
      if (current) sections.push(current);
      current = { title: $(element).text().trim(), body: [] };
      return;
    }
    if (current) current.body.push($(element).toString());
  });
  if (current) sections.push(current);
  const steps = sections.map((section, index) => {
    const id = `${slug}-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    return `<section class="use-case-narrative-step" aria-labelledby="${escapeHtml(id)}"><span class="use-case-narrative-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><div><h3 id="${escapeHtml(id)}">${escapeHtml(section.title)}</h3>${section.body.join("")}</div></section>`;
  }).join("");
  return `<section class="use-case-story" aria-labelledby="${escapeHtml(slug)}-story-heading"><div class="use-case-section-heading"><p class="home-kicker">How it works</p><h2 id="${escapeHtml(slug)}-story-heading">How the workflow fits</h2><p>The problem it addresses, what it actually does, and how far along it is.</p></div><div class="use-case-narrative">${steps}</div></section>`;
}

function renderUseCasePage(useCase) {
  const useCaseIcon = USE_CASE_ICON_MAP[useCase.slug] || "star";
  const statsHtml = useCase.stats && useCase.stats.length
    ? `<ul class="use-case-stats" aria-label="${escapeHtml(useCase.title)} impact at a glance">${useCase.stats.map((stat) => `<li><strong class="use-case-stat-value">${escapeHtml(stat.value)}</strong><span class="use-case-stat-label">${escapeHtml(stat.label)}</span>${stat.sub ? `<span class="use-case-stat-sub">${escapeHtml(stat.sub)}</span>` : ""}</li>`).join("")}</ul>`
    : "";
  const videoHtml = useCase.videoSrc
    ? `<div class="use-case-demo"><div class="use-case-demo-frame"><video class="img-responsive" controls muted playsinline preload="metadata"${useCase.videoPoster ? ` poster="${escapeHtml(useCase.videoPoster)}"` : ""} aria-label="${escapeHtml(useCase.videoLabel || useCase.title + " demo")}"${useCase.videoDescription ? ` aria-describedby="${useCase.slug}-demo-description"` : ""}${useCase.videoCaptionsSrc ? "" : ` data-silent-demo="true"`}><source src="${escapeHtml(useCase.videoSrc)}" type="video/mp4">${useCase.videoCaptionsSrc ? `<track kind="captions" src="${escapeHtml(useCase.videoCaptionsSrc)}" srclang="en" label="${escapeHtml(useCase.videoCaptionsLabel || "English")}" default>` : ""}Your browser does not support the video element.</video></div>${useCase.videoDescription ? `<p id="${useCase.slug}-demo-description" class="use-case-demo-caption"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span> ${escapeHtml(useCase.videoDescription)}</p>` : ""}</div>`
    : "";
  const screenshotsHtml = useCase.screenshots && useCase.screenshots.length
    ? `<div class="use-case-media-grid">${useCase.screenshots.map((screenshot) => `<figure class="panel panel-default use-case-screenshot"><img class="img-responsive" src="${escapeHtml(screenshot.src)}" alt="${escapeHtml(screenshot.alt)}"><figcaption>${escapeHtml(screenshot.caption)}</figcaption></figure>`).join("")}</div>`
    : "";
  const toolsHtml = useCase.toolHighlights && useCase.toolHighlights.length
    ? `<ul class="use-case-tools" aria-label="${escapeHtml(useCase.title)} workflow elements">${useCase.toolHighlights.map((tool) => `<li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>${escapeHtml(tool)}</li>`).join("")}</ul>`
    : "";
  const resourcesHtml = useCase.resourceLinks && useCase.resourceLinks.length
    ? `<div class="row agent-card-grid">${useCase.resourceLinks.map((resource) => `<div class="col-sm-6"><article class="panel panel-default agent-card"><div class="panel-body"><h3 class="h4"><a href="${escapeHtml(resource.href)}">${escapeHtml(resource.label)}</a></h3>${resource.description ? `<p>${escapeHtml(resource.description)}</p>` : ""}</div></article></div>`).join("")}</div>`
    : "";
  const governanceHtml = `<section class="use-case-governance" aria-labelledby="${escapeHtml(useCase.slug)}-governance-heading"><div class="use-case-section-heading"><span class="glyphicon glyphicon-lock" aria-hidden="true"></span><div><p class="home-kicker">Accountability</p><h2 id="${escapeHtml(useCase.slug)}-governance-heading">How this use case is governed</h2></div></div><dl class="use-case-governance-grid"><div><dt>Service owner</dt><dd>${escapeHtml(useCase.owner)}</dd></div><div><dt>Human oversight</dt><dd>${escapeHtml(useCase.humanOversight)}</dd></div><div><dt>Measurement plan</dt><dd>${escapeHtml(useCase.measurableOutcome)}</dd></div><div><dt>Data boundary</dt><dd>${escapeHtml(useCase.dataClassification)}</dd></div></dl><p class="use-case-governance-meta"><span><strong>Measurement period</strong> ${escapeHtml(useCase.measurementPeriod)}</span><span><strong>Last reviewed</strong> ${escapeHtml(useCase.lastReviewed)}</span></p></section>`;
  const overviewHtml = `<section class="use-case-overview" aria-label="${escapeHtml(useCase.title)} overview"><div class="use-case-overview-copy"><span class="glyphicon glyphicon-${escapeHtml(useCaseIcon)}" aria-hidden="true"></span><div><p class="home-kicker">Campus AI workflow</p>${renderStatus(useCase.status)}<p class="lead">${escapeHtml(useCase.summary)}</p></div></div>${statsHtml}</section>`;
  const mediaHtml = `${videoHtml}${screenshotsHtml}`;
  const evidenceHtml = mediaHtml || resourcesHtml || toolsHtml
    ? `<section class="use-case-evidence" aria-labelledby="${escapeHtml(useCase.slug)}-demo-heading"><div class="use-case-section-heading"><p class="home-kicker">${mediaHtml ? "Product media" : resourcesHtml ? "Related service" : "Workflow elements"}</p><h2 id="${escapeHtml(useCase.slug)}-demo-heading">${mediaHtml ? "See the workflow in action" : resourcesHtml ? "Where to read more" : "What the workflow uses"}</h2></div>${mediaHtml}${toolsHtml}${resourcesHtml}</section>`
    : "";
  const actionsHtml = `<nav class="use-case-actions" aria-label="Use case next steps"><a href="/use-cases/index.html"><span aria-hidden="true">←</span> Explore all use cases</a><a href="/about/get-involved.html">Start a use-case conversation <span aria-hidden="true">→</span></a></nav>`;
  return `${overviewHtml}${governanceHtml}${evidenceHtml}${renderUseCaseNarrative(useCase.html, useCase.slug)}${actionsHtml}`;
}

async function parseVttCues(sitePath) {
  try {
    const file = sitePath.startsWith("/presentations/")
      ? path.join(ROOT_DIR, sitePath.slice(1))
      : path.join(SOURCE_DIR, sitePath.replace(/^\//, ""));
    const raw = await readFile(file, "utf8");
    const cues = [];
    const blocks = raw.replace(/\r/g, "").split("\n\n");
    for (const block of blocks) {
      const match = block.match(/((?:\d{1,2}:)?\d{1,2}:\d{2})[.,]\d{3}\s*-->/);
      if (!match) continue;
      const parts = match[1].split(":").map(Number);
      const seconds = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
      const text = block
        .split("\n")
        .filter((line) => !line.includes("-->") && !/^\d+$/.test(line.trim()) && line.trim() !== "WEBVTT")
        .join(" ")
        .trim();
      if (text) cues.push({ seconds, text });
    }
    return cues;
  } catch {
    return [];
  }
}

function formatCueTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

const TRAINING_VIDEO_SERIES_ORDER = ["Foundations", "Using the Tools", "Building"];

// Swap for the updated team-training intake form URL when it is ready.
const TRAINING_INTAKE_URL = "/about/get-involved.html";

const TRAINING_VIDEO_SERIES_DESCRIPTIONS = {
  Foundations:
    "Start here for shared ground. Before using AI tools, understand the vision and the concepts around data, privacy, and ethics of AI use.",
  "Using the Tools":
    "Hands-on walkthroughs of the approved tools, from TritonGPT to Gemini, NotebookLM, Copilot, and Zoom. Each video pairs one tool with campus use cases you can repeat at your own desk.",
  Building:
    "The move from using AI to building with it. These videos cover the strategy of when to build and how, from harnesses and automation to the review path that turns an idea into a supported service.",
};

function trainingVideoSeriesRank(name) {
  const index = TRAINING_VIDEO_SERIES_ORDER.indexOf(name);
  return index === -1 ? TRAINING_VIDEO_SERIES_ORDER.length : index;
}

function formatAudiences(audiences) {
  const joined = audiences.join(", ");
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

function renderInteractiveTranscript(video, cues) {
  // Follow-along transcript beneath the player: the transcript reads as
  // paragraphs, the sentence being spoken is highlighted as playback
  // advances, and selecting any sentence plays the video from that point.
  const sentences = cues
    .map(
      (cue, index) =>
        `<button type="button" class="training-video-sentence" data-seek="${cue.seconds}" data-cue-index="${index}" data-seek-target="${escapeHtml(video.slug)}" aria-label="Play from ${formatCueTime(cue.seconds)}">${escapeHtml(cue.text)}</button>`,
    )
    .join(" ");
  return `<div class="training-video-follow" data-follow-for="${escapeHtml(video.slug)}" role="region" aria-label="Follow-along transcript. The current sentence is highlighted during playback, and any sentence plays the video from that point." tabindex="0">${sentences}</div>`;
}

function renderTrainingVideoBlock(video) {
  return `<div class="use-case-demo" data-video-progress><div class="use-case-demo-frame"><video class="img-responsive" controls playsinline preload="metadata" data-progress-slug="${escapeHtml(video.slug)}" data-progress-title="${escapeHtml(video.title)}"${video.videoPoster ? ` poster="${escapeHtml(video.videoPoster)}"` : ""} aria-label="${escapeHtml(video.videoLabel || video.title)}"><source src="${escapeHtml(video.videoSrc)}" type="video/mp4">${video.videoCaptionsSrc ? `<track kind="captions" src="${escapeHtml(video.videoCaptionsSrc)}" srclang="en" label="${escapeHtml(video.videoCaptionsLabel || "English")}">` : ""}${video.videoChaptersSrc ? `<track kind="chapters" src="${escapeHtml(video.videoChaptersSrc)}" srclang="en" label="Chapters">` : ""}Your browser does not support the video element.</video><button type="button" class="video-play-overlay" data-video-play hidden><span class="glyphicon glyphicon-play" aria-hidden="true"></span><span data-video-play-label>Play video</span></button><div class="video-resume-host" data-resume-for="${escapeHtml(video.slug)}"></div></div></div>`;
}

function splitTrainingVideoBody(html) {
  const marker = /<h2[^>]*>\s*Transcript\s*<\/h2>/i;
  const match = html.match(marker);
  if (!match) return { learn: html, transcript: "" };
  const index = html.indexOf(match[0]);
  return { learn: html.slice(0, index), transcript: html.slice(index + match[0].length) };
}

function videoAvailability(video) {
  return video.status === "Coming soon" ? "Video coming soon" : `${escapeHtml(String(video.durationMinutes))} min`;
}

function renderVideoPresenters(video) {
  const presenters = video.presenters || (video.presenter ? [{ name: video.presenter, title: video.presenterTitle, image: video.presenterImage }] : []);
  return presenters.map((presenter) => `<div class="discovery-presenter">${presenter.image ? `<img src="${escapeHtml(presenter.image)}" alt="" loading="lazy">` : '<span class="discovery-photo-placeholder" aria-hidden="true">Photo<br>to come</span>'}<span><span class="discovery-presenter-name">${escapeHtml(presenter.name)}</span>${presenter.title ? `<span class="discovery-presenter-title">${escapeHtml(presenter.title)}</span>` : ""}</span></div>`).join("");
}

function renderTrainingVideoQuiz(video) {
  if (!video.quiz?.length) return "";
  const version = createHash("sha256").update(JSON.stringify(video.quiz)).digest("hex").slice(0, 12);
  const questions = video.quiz.map((item, qIndex) => {
    const options = item.options.map((option, oIndex) => `<li><button type="button" class="video-quiz-option" data-quiz-question="${qIndex}" data-quiz-option="${oIndex}" data-quiz-correct="${oIndex === item.answer}" aria-pressed="false"><span aria-hidden="true">${String.fromCharCode(65 + oIndex)}. </span>${escapeHtml(option)}</button></li>`).join("");
    return `<fieldset class="video-quiz-question" data-quiz-block="${qIndex}"><legend>${qIndex + 1}. ${escapeHtml(item.question)}</legend><ul class="video-quiz-options">${options}</ul><p class="video-quiz-result" data-quiz-result></p><p class="video-quiz-explanation" data-quiz-explanation hidden>${escapeHtml(item.explanation)}</p></fieldset>`;
  }).join("");
  return `<section class="landing-section video-quiz-section" data-video-quiz="${escapeHtml(video.slug)}" data-quiz-version="${version}" aria-labelledby="${escapeHtml(video.slug)}-quiz-heading"><div class="container video-theater-about-inner"><div class="landing-section-heading"><h2 id="${escapeHtml(video.slug)}-quiz-heading">Test your knowledge</h2><p>Select an answer to see Correct or Incorrect and an explanation. Dismiss the popup to continue. Your score counts your first answer to each question; you can try again.</p><p data-quiz-storage>Your answers and progress are saved only in this browser. Clearing browser data removes them.</p><noscript><p>Turn on JavaScript to take this quiz and see your results.</p></noscript></div>${questions}<p class="video-quiz-score" data-quiz-score role="status"></p><button type="button" class="btn btn-default" data-quiz-reset>Restart quiz</button><dialog class="video-quiz-dialog" aria-labelledby="quiz-feedback-heading" aria-describedby="quiz-feedback-explanation"><h2 id="quiz-feedback-heading" data-dialog-result tabindex="-1"></h2><p id="quiz-feedback-explanation" data-dialog-explanation></p><button type="button" class="btn btn-primary" data-dialog-close>Continue</button></dialog></div></section>`;
}

function renderTrainingVideoDiscussion(video) {
  if (!video.discussionPoints?.length) return "";
  return `<section class="landing-section landing-section-sand video-discussion-section" aria-labelledby="${escapeHtml(video.slug)}-discussion-heading"><div class="container video-theater-about-inner"><div class="landing-section-heading"><p class="home-kicker">For team meetings</p><h2 id="${escapeHtml(video.slug)}-discussion-heading">Discussion topics</h2></div><ul class="video-discussion-list">${video.discussionPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul></div></section>`;
}

function renderTrainingVideoCta(video, { nextVideo } = {}) {
  const headingId = `${escapeHtml(video.slug)}-cta-heading`;
  if (nextVideo) return `<section class="landing-section video-training-cta" aria-labelledby="${headingId}"><div class="container video-theater-about-inner"><div class="video-training-cta-panel"><div><p class="home-kicker">Up next</p><h2 id="${headingId}">${escapeHtml(nextVideo.title)}</h2><p>${escapeHtml(nextVideo.summary)}</p><p class="video-training-cta-meta">${escapeHtml(nextVideo.series)} · ${videoAvailability(nextVideo)}</p></div><a class="btn btn-primary btn-lg" href="${escapeHtml(nextVideo.canonicalUrl)}">Go to next lesson</a></div></div></section>`;
  return `<section class="landing-section video-training-cta" aria-labelledby="${headingId}"><div class="container video-theater-about-inner"><div class="video-training-cta-panel"><div><p class="home-kicker">Keep learning</p><h2 id="${headingId}">Explore more training</h2><p>Find learning paths and training for your team.</p></div><a class="btn btn-primary btn-lg" href="/training-resources/index.html">Explore TritonAI Learn</a></div></div></section>`;
}

async function renderTrainingVideoPage(video, siblings = []) {
  const pending = video.status === "Coming soon";
  const { transcript } = splitTrainingVideoBody(video.html);
  const cues = !pending && video.videoCaptionsSrc ? await parseVttCues(video.videoCaptionsSrc) : [];
  const transcriptHtml = pending ? "" : cues.length
    ? `<details class="training-video-transcript-details training-video-follow-details"><summary>Show transcript</summary><div class="training-video-follow-wrap">${renderInteractiveTranscript(video, cues)}</div></details>`
    : transcript.trim() ? `<details class="training-video-transcript-details"><summary>Full transcript</summary>${transcript}</details>` : "";
  const progression = siblings.filter((entry) => entry.discoverySeries === true).sort((a, b) => a.order - b.order);
  const position = progression.findIndex((entry) => entry.slug === video.slug);
  const upcoming = position >= 0 ? progression.slice(position + 1, position + 6) : [];
  const railCards = upcoming.map((entry, index) => `<li><a class="video-rail-card${index === 0 ? " video-rail-card-next" : ""}" href="${escapeHtml(entry.canonicalUrl)}"><span class="discovery-rail-number" aria-hidden="true">${String(entry.order).padStart(2, "0")}</span><span class="video-rail-card-copy">${index === 0 ? '<span class="video-rail-card-flag">Up next</span>' : ""}<span class="video-rail-card-title">${escapeHtml(entry.title)}</span><span class="video-rail-card-meta">${escapeHtml(entry.series)} · ${videoAvailability(entry)}</span></span></a></li>`).join("");
  const railHtml = `<aside class="video-theater-rail" aria-label="Series navigation"><p class="video-theater-rail-heading">In this series</p>${position >= 0 ? `<p class="video-theater-rail-position">Lesson ${position + 1} of ${progression.length}</p>` : ""}${railCards ? `<ul class="video-rail-list">${railCards}</ul>` : ""}<a class="video-theater-rail-all" href="/training-resources/videos/index.html">TritonAI Discovery Series <span aria-hidden="true">→</span></a></aside>`;
  const media = pending ? `<div class="discovery-video-pending"><span class="glyphicon glyphicon-film" aria-hidden="true"></span><h2>Video coming soon</h2><p>The recording, captions, and transcript will be added when available.</p><a href="#${escapeHtml(video.slug)}-quiz-heading">Explore the knowledge check</a></div>` : renderTrainingVideoBlock(video);
  const theaterHtml = `<section class="video-theater" aria-label="${escapeHtml(video.title)} viewing area"><div class="video-theater-layout"><div class="video-theater-primary"><div class="discovery-lesson-header"><div class="discovery-lesson-copy"><p class="video-theater-kicker">${escapeHtml(video.series)} · ${videoAvailability(video)}</p><h1 class="video-theater-title">${escapeHtml(video.title)}</h1><p class="video-theater-description">${escapeHtml(video.summary)}</p></div><div class="discovery-presenters">${renderVideoPresenters(video)}</div></div>${media}${transcriptHtml}</div>${railHtml}</div></section>`;
  return `${theaterHtml}${renderTrainingVideoQuiz(video)}${renderTrainingVideoDiscussion(video)}${renderTrainingVideoCta(video, { nextVideo: position >= 0 ? progression[position + 1] : undefined })}`;
}

function renderTrainingVideoIndex(allVideos) {
  const videos = allVideos.filter((video) => video.discoverySeries === true).sort((a, b) => a.order - b.order);
  const seriesHtml = TRAINING_VIDEO_SERIES_ORDER.map((series, index) => {
    const cards = videos.filter((video) => video.series === series).map((video) => `<div class="col-sm-6 col-md-4"><article class="panel panel-default cms-news-card cms-use-case-card discovery-card" data-video-card="${escapeHtml(video.slug)}" data-video-available="${video.status === "Published"}" data-quiz-version="${createHash("sha256").update(JSON.stringify(video.quiz)).digest("hex").slice(0, 12)}"><div class="panel-body"><p class="training-video-card-meta">${String(video.order).padStart(2, "0")} · ${videoAvailability(video)}<span class="training-video-card-state" data-video-state hidden></span></p>${video.videoPoster ? `<a class="cms-news-image" href="${escapeHtml(video.canonicalUrl)}"><img src="${escapeHtml(video.videoPoster)}" alt="${escapeHtml(video.title)} video poster" loading="lazy"></a>` : ""}<h3><a href="${escapeHtml(video.canonicalUrl)}">${escapeHtml(video.title)}</a></h3><p>${escapeHtml(video.summary)}</p><div class="discovery-presenters">${renderVideoPresenters(video)}</div><p class="discovery-card-link"><a class="text-link" href="${escapeHtml(video.canonicalUrl)}">Explore lesson <span class="sr-only">${String(video.order)}: ${escapeHtml(video.title)}</span><span aria-hidden="true">→</span></a></p><p class="discovery-quiz-state" data-quiz-card-state hidden></p></div></article></div>`).join("");
    const sectionId = `series-${series.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    return `<section aria-labelledby="${sectionId}" class="landing-section cms-news-module${index % 2 ? " landing-section-sand" : ""}"><div class="container"><div class="landing-section-heading"><p class="home-kicker">Series</p><h2 id="${sectionId}">${escapeHtml(series)}</h2><p>${escapeHtml(TRAINING_VIDEO_SERIES_DESCRIPTIONS[series])}</p></div><div class="row cms-news-grid">${cards}</div></div></section>`;
  }).join("");
  const continueHtml = `<section class="landing-section training-video-continue-strip" data-continue-watching data-video-progress hidden aria-label="Continue watching"><div class="container"><div class="training-video-continue-bar"><span class="training-video-continue-label" data-continue-label>Continue watching</span><ul class="training-video-continue-list"></ul></div></div></section>`;
  const intro = `<section class="landing-section training-video-journey-intro" aria-labelledby="video-journey-heading"><div class="container"><div class="training-video-journey-panel"><div class="landing-section-heading"><p class="home-kicker">How to use this series</p><h2 id="video-journey-heading">Learn your way</h2><ul class="training-video-pace-list"><li><strong>Learn at your own pace</strong><p>Work through the videos in order, and test your knowledge with the questions at the end of each video.</p></li><li><strong>Learn together</strong><p>The series works well as a team activity. Watch one video per meeting and use each video’s discussion points to spark a wider conversation.</p></li><li><strong>Pick up where you left off</strong><p>Your progress is saved automatically in your browser, so you can leave and come back at any time.</p></li></ul><p class="discovery-storage-note">Progress stays in this browser on this device. Private browsing or blocked storage may prevent saving.</p></div></div></div></section>`;
  return `${continueHtml}${intro}${seriesHtml}<section class="landing-section training-video-completion" aria-labelledby="video-completion-heading"><div class="container"><div class="video-training-cta-panel"><div><p class="home-kicker">After the series</p><h2 id="video-completion-heading">Continue learning with your team</h2><p>Explore the <a href="/training-resources/certificate.html">certificate</a> or request a session around your team’s work.</p></div><a class="btn btn-primary btn-lg" href="${escapeHtml(TRAINING_INTAKE_URL)}">Start the team training intake</a></div></div></section>`;
}

function renderRoadmap(roadmap) {
  const currentItems = roadmap.items.filter((item) => /2026/.test(item.period));
  const historyItems = roadmap.items.filter((item) => !/2026/.test(item.period));
  const renderLinks = (links = []) => links.length
    ? `<nav class="roadmap-item-links" aria-label="Related resources">${links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)} <span aria-hidden="true">→</span></a>`).join("")}</nav>`
    : "";
  const currentHtml = currentItems.map((item, index) => {
    const headingId = `roadmap-current-${index + 1}`;
    const details = item.details?.length
      ? `<ul class="roadmap-detail-list">${item.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>`
      : "";
    return `<article class="agent-roadmap-item agent-roadmap-item-current" aria-labelledby="${headingId}"><header><p class="roadmap-period">${escapeHtml(item.period)}</p>${renderStatus(item.status)}</header><h3 id="${headingId}">${escapeHtml(item.title)}</h3><p class="roadmap-summary">${escapeHtml(item.summary)}</p>${details}${renderLinks(item.links)}<p class="roadmap-item-meta"><span><strong>Owner</strong> ${escapeHtml(item.owner)}</span><span><strong>Reviewed</strong> ${escapeHtml(item.lastReviewed)}</span></p></article>`;
  }).join("");
  const historyHtml = historyItems.map((item, index) => {
    const headingId = `roadmap-history-${index + 1}`;
    return `<article class="agent-roadmap-item agent-roadmap-item-history" aria-labelledby="${headingId}"><div><p class="roadmap-period">${escapeHtml(item.period)}</p>${renderStatus(item.status)}</div><h3 id="${headingId}">${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p>${renderLinks(item.links)}<p class="roadmap-item-meta"><strong>Owner</strong> ${escapeHtml(item.owner)}</p></article>`;
  }).join("");
  return `<p class="lead roadmap-lead">${escapeHtml(roadmap.description)}</p>${renderDeliveryPathway("roadmap")}<section class="roadmap-status-key" aria-labelledby="roadmap-status-heading"><div><p class="home-kicker">How to read this page</p><h2 id="roadmap-status-heading">What each status means</h2></div><ul><li>${renderStatus("Shipped")}<span>Publicly available</span></li><li>${renderStatus("Pilot")}<span>Bounded testing with oversight</span></li><li>${renderStatus("In development")}<span>Active work without a committed launch date</span></li><li>${renderStatus("Exploring")}<span>Discovery only; no delivery commitment</span></li></ul></section><section class="roadmap-current" aria-labelledby="roadmap-current-heading"><div class="roadmap-section-heading"><p class="home-kicker">Current horizon</p><h2 id="roadmap-current-heading">2026 delivery detail</h2><p>Each quarter groups supervised solutions, the reusable pieces underneath them, and the work of getting prototypes to supported services. A quarter's status covers the group as a whole, so an individual service linked below may be further along.</p></div><div class="roadmap-current-list">${currentHtml}</div></section><section class="roadmap-history" aria-labelledby="roadmap-history-heading"><div class="roadmap-section-heading"><p class="home-kicker">Foundation</p><h2 id="roadmap-history-heading">How we got here</h2><p>Earlier milestones, from opening up broad access to building the shared infrastructure and the first focused campus workflows.</p></div><div class="roadmap-history-grid">${historyHtml}</div></section><nav class="roadmap-actions" aria-label="Roadmap next steps"><a class="btn btn-primary" href="/about/tritonai-updates.html">View delivered updates</a><a class="btn btn-default" href="/use-cases/index.html">Explore current use cases</a><a class="btn btn-default" href="/about/get-involved.html">Bring a campus workflow</a></nav>`;
}

function renderPublicFacts(facts) {
  return `<div class="panel panel-default public-facts"><div class="panel-heading"><h2 class="panel-title">Evidence details</h2></div><div class="panel-body"><ul class="list-unstyled">${facts
    .filter((fact) => fact.status === "public")
    .map((fact) => `<li><p><strong>${escapeHtml(fact.claim)}</strong></p><dl class="public-fact-meta"><div><dt>Owner</dt><dd>${escapeHtml(fact.owner)}</dd></div><div><dt>Measurement period</dt><dd>${escapeHtml(fact.measurementPeriod)}</dd></div><div><dt>Data classification</dt><dd>${escapeHtml(fact.dataClassification)}</dd></div><div><dt>Last reviewed</dt><dd>${escapeHtml(fact.lastReviewed)}</dd></div></dl><p><a href="${escapeHtml(fact.canonicalUrl)}">View the related service</a></p></li>`)
    .join("")}</ul></div></div>`;
}

function formatBillions(value) {
  return `${(Number(value) / 1_000_000_000).toFixed(1)}B`;
}

function renderGatewayUsage(usage) {
  const maxMonthlyTotal = Math.max(...usage.monthly.map((month) => month.selfHostedTokens + month.cloudTokens));
  const peakMonth = usage.monthly.reduce((peak, month) => {
    const total = month.selfHostedTokens + month.cloudTokens;
    return !peak || total > peak.total ? { ...month, total } : peak;
  }, null);
  const latestMonth = usage.monthly.at(-1);
  const metrics = usage.metrics
    .map(
      (metric) =>
        `<li><strong>${escapeHtml(metric.displayValue)}</strong><span>${escapeHtml(metric.label)}</span><small>${escapeHtml(metric.definition)}</small></li>`,
    )
    .join("");
  const monthRows = usage.monthly
    .map((month) => {
      const total = month.selfHostedTokens + month.cloudTokens;
      const totalWidth = (total / maxMonthlyTotal) * 100;
      const selfHostedWidth = (month.selfHostedTokens / total) * 100;
      const cloudWidth = (month.cloudTokens / total) * 100;
      return `<li class="gateway-usage-month"><span class="gateway-usage-month-label">${escapeHtml(month.label)}</span><div class="gateway-usage-bar-track" role="img" aria-label="${escapeHtml(month.label)}: ${formatBillions(total)} total tokens; ${formatBillions(month.selfHostedTokens)} self-hosted and internal and ${formatBillions(month.cloudTokens)} cloud"><span class="gateway-usage-bar-total" style="width:${totalWidth.toFixed(4)}%"><span class="gateway-usage-bar-self-hosted" style="width:${selfHostedWidth.toFixed(4)}%"></span><span class="gateway-usage-bar-cloud" style="width:${cloudWidth.toFixed(4)}%"></span></span></div><strong>${formatBillions(total)}</strong></li>`;
    })
    .join("");
  const tableRows = usage.monthly
    .map((month) => {
      const total = month.selfHostedTokens + month.cloudTokens;
      return `<tr><th scope="row">${escapeHtml(month.label)} ${escapeHtml(month.month.slice(0, 4))}</th><td>${formatBillions(month.selfHostedTokens)}</td><td>${formatBillions(month.cloudTokens)}</td><td>${formatBillions(total)}</td></tr>`;
    })
    .join("");
  const hasMonthlyDrivers = usage.monthly.some((month) => month.note || month.description);
  const monthlyDrivers = hasMonthlyDrivers
    ? `<div class="gateway-usage-monthly-drivers"><h3>Monthly drivers</h3><p class="gateway-usage-monthly-drivers-intro">${escapeHtml(usage.monthlyDriversIntro || "")}</p><ul>${usage.monthly
        .map((month) => {
          const total = month.selfHostedTokens + month.cloudTokens;
          return `<li><strong>${escapeHtml(month.label)}: ${formatBillions(total)} tokens</strong><p>${escapeHtml(month.note || month.description || "")}</p></li>`;
        })
        .join("")}</ul></div>`
    : "";
  return `<div class="hub-heading gateway-usage-heading"><p class="home-kicker">Gateway usage</p><h2 id="gateway-usage-heading">${escapeHtml(usage.title)}</h2><p>${escapeHtml(usage.summary)}</p></div><ul class="gateway-usage-metrics" aria-label="Gateway usage summary">${metrics}</ul><div class="gateway-usage-trend"><div class="gateway-usage-trend-heading"><div><h3>Monthly token volume</h3><p>${escapeHtml(peakMonth.label)} was the highest-volume month through ${escapeHtml(latestMonth.label)}.</p></div><ul class="gateway-usage-legend" aria-label="Chart legend"><li><span class="gateway-usage-key-self-hosted" aria-hidden="true"></span>Self-hosted and internal</li><li><span class="gateway-usage-key-cloud" aria-hidden="true"></span>Cloud</li></ul></div><ol class="gateway-usage-months">${monthRows}</ol></div><details class="gateway-usage-details"><summary>View monthly data and measurement notes</summary><div class="table-responsive"><table class="table"><caption>Gateway token volume by model route, ${escapeHtml(usage.measurementPeriod.label)}</caption><thead><tr><th scope="col">Month</th><th scope="col">Self-hosted and internal</th><th scope="col">Cloud</th><th scope="col">Total tokens</th></tr></thead><tbody>${tableRows}</tbody></table></div>${monthlyDrivers}<dl class="gateway-usage-meta"><div><dt>Measurement period</dt><dd>${escapeHtml(usage.measurementPeriod.label)}</dd></div><div><dt>Owner</dt><dd>${escapeHtml(usage.owner)}</dd></div><div><dt>Data classification</dt><dd>${escapeHtml(usage.dataClassification)}</dd></div><div><dt>Last reviewed</dt><dd>${escapeHtml(usage.lastReviewed)}</dd></div></dl><ul class="gateway-usage-notes">${usage.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul></details>`;
}

function renderHomeHero(hero) {
  const multipleSlides = hero.slides.length > 1;
  const indicators = multipleSlides ? hero.slides
    .map(
      (_, index) =>
        `<li aria-hidden="true" class="${index === 0 ? "active" : ""}" data-slide-to="${index}" data-target="#heroslider"></li>`,
    )
    .join("") : "";
  const slides = hero.slides
    .map((slide, index) => {
      const accent = slide.accent ? `<br><span>${escapeHtml(slide.accent)}</span>` : "";
      const imageSource = slide.optimizedImage || slide.image;
      const imageAttributes =
        index === 0
          ? `src="${escapeHtml(imageSource)}" fetchpriority="high"`
          : `src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="${escapeHtml(imageSource)}" loading="lazy"`;
      const fallback = slide.optimizedImage ? ` data-fallback-src="${escapeHtml(slide.image)}"` : "";
      const mobileSource = slide.mobileImage && index === 0
        ? `<source media="(min-width: 768px)" srcset="${escapeHtml(imageSource)}">`
        : "";
      const responsiveImageAttributes = slide.mobileImage && index === 0
        ? `src="${escapeHtml(slide.mobileImage)}" fetchpriority="high"`
        : imageAttributes;
      const heroImage = mobileSource
        ? `<picture class="home-hero-media">${mobileSource}<img alt="${escapeHtml(slide.imageAlt)}" class="first-slide" ${responsiveImageAttributes}${fallback} decoding="async"></picture>`
        : `<img alt="${escapeHtml(slide.imageAlt)}" class="first-slide" ${imageAttributes}${fallback} decoding="async">`;
      return `<div aria-label="${index + 1} out of ${hero.slides.length}" aria-roledescription="slide" aria-hidden="${index === 0 ? "false" : "true"}" class="item${index === 0 ? " active" : ""}" role="group">${heroImage}<div class="container"><div class="cr-item-container"><div class="row"><div class="col-sm-12"><div class="animated fadeInUp herotextbg-dark-opaque"><h2 class="rt-text-light hero-slide-heading" tabindex="${index === 0 ? "0" : "-1"}">${escapeHtml(slide.title)}${accent}</h2><p class="rt-text-light" tabindex="${index === 0 ? "0" : "-1"}">${escapeHtml(slide.description)}</p><a class="btn btn-lg btn-default" data-module="hero-homepage" href="${escapeHtml(slide.link)}" role="button" tabindex="${index === 0 ? "0" : "-1"}">${escapeHtml(slide.linkLabel)}</a></div></div></div></div></div></div>`;
    })
    .join("");
  const controls = multipleSlides
    ? `<div id="indicators-container"><button aria-label="carousel is playing, click to pause" data-home-hero-toggle id="toggleCarousel" type="button"><span aria-hidden="true" class="glyphicon glyphicon-pause"></span></button><ol aria-hidden="true" class="carousel-indicators">${indicators}</ol></div><a aria-controls="heroslider" aria-label="previous slide" class="left carousel-control" data-home-hero-direction="prev" data-slide="prev" href="#heroslider" role="button" tabindex="0"><span aria-hidden="true" class="glyphicon glyphicon-chevron-left"></span><span class="sr-only">Previous</span></a><a aria-controls="heroslider" aria-label="next slide" class="right carousel-control" data-home-hero-direction="next" data-slide="next" href="#heroslider" role="button" tabindex="0"><span aria-hidden="true" class="glyphicon glyphicon-chevron-right"></span><span class="sr-only">Next</span></a>`
    : "";
  const carouselAttributes = multipleSlides ? ` data-interval="${hero.rotationIntervalMs}" data-ride="carousel"` : "";
  return `<div class="carousel slide jumbotron jumbotron-hero hm"${carouselAttributes} id="heroslider"><div aria-label="${multipleSlides ? `Revolving Banners with ${hero.slides.length} items` : "TritonAI introduction"}" class="carousel-inner" role="region" tabindex="0">${controls}${slides}</div></div>${multipleSlides ? '<script defer src="/_resources/js/home-hero.js"></script>' : ""}`;
}

const SKILL_PRESENTATION = {
  "tritonai-autoreview": {
    title: "TritonAI Auto Review",
    category: "Quality and review",
    icon: "glyphicon-check",
    summary: "Run a second-model code review and test closeout before a commit, merge, release, or ship.",
  },
  "tritonai-feedback": {
    title: "TritonAI Feedback",
    category: "Support and feedback",
    icon: "glyphicon-comment",
    summary: "Send feedback, bug reports, support requests, or improvement ideas to the TritonAI team.",
  },
  "tritonai-harness-config": {
    title: "TritonAI Harness Configuration",
    category: "Platform operations",
    icon: "glyphicon-cog",
    summary: "Investigate the live TritonAI Harness environment using sanitized runtime and source evidence.",
  },
  "ucsd-accessibility-compliance": {
    title: "UC San Diego Accessibility Compliance",
    category: "Accessibility",
    icon: "glyphicon-eye-open",
    summary: "Audit and remediate UC San Diego websites, documents, media, and communications for digital accessibility.",
  },
  "ucsd-branding": {
    title: "UC San Diego Branding",
    category: "Web and design",
    icon: "glyphicon-picture",
    summary: "Apply the UC San Diego Developer and Decorator 5 visual system to web pages.",
  },
  "ucsd-cms": {
    title: "UC San Diego CMS",
    category: "Content publishing",
    icon: "glyphicon-edit",
    summary: "Author, review, and publish Cascade CMS content with the right templates, metadata, accessibility, and SEO practices.",
  },
  "ucsd-data-classification": {
    title: "UC San Diego Data Classification",
    category: "Data governance",
    icon: "glyphicon-lock",
    summary: "Classify application data under UC IS-3 Protection Levels and apply the appropriate handling controls.",
  },
  "ucsd-memory": {
    title: "UC San Diego Memory",
    category: "Agent memory",
    icon: "glyphicon-book",
    summary: "Search, use, and maintain an existing local TritonAI memory vault.",
  },
  "ucsd-memory-create": {
    title: "UC San Diego Memory Setup",
    category: "Agent memory",
    icon: "glyphicon-plus-sign",
    summary: "Create a local TritonAI memory vault with conversation sync and maintenance workflows.",
  },
};

function defaultSkillPresentation(skill) {
  const title = skill.name
    .split("-")
    .map((part) => ({ ucsd: "UC San Diego", tritonai: "TritonAI", cms: "CMS" })[part] || `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
  const firstSentence = skill.description.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || skill.description;
  return { title, category: "Agent capability", icon: "glyphicon-wrench", summary: firstSentence };
}

function renderSkillsLibrary(library) {
  const collectionOptions = library.collections
    .map((collection) => `<option value="${escapeHtml(collection.id)}">${escapeHtml(collection.label)} (${collection.count})</option>`)
    .join("");
  const activeCollectionCount = library.collections.filter((collection) => collection.count > 0).length;
  const cards = library.skills
    .map((skill) => {
      const presentation = SKILL_PRESENTATION[skill.name] || defaultSkillPresentation(skill);
      const resourceParts = Object.entries(skill.resources)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => `${count} ${count === 1 ? type.replace(/s$/, "") : type}`);
      const resourceLabel = resourceParts.length ? resourceParts.join(" · ") : "Self-contained";
      const searchable = `${skill.name} ${presentation.title} ${presentation.category} ${presentation.summary} ${skill.description} ${skill.collectionLabel} ${skill.maintainer || ""}`.toLowerCase();
      return `<div class="col-xs-12" data-skill-card data-skill-collection="${escapeHtml(skill.collection)}" data-skill-search="${escapeHtml(searchable)}"><article class="skills-entry"><div class="skills-entry-icon"><span class="glyphicon ${escapeHtml(presentation.icon)}" aria-hidden="true"></span></div><div class="skills-entry-main"><span class="skills-collection">${escapeHtml(skill.collectionLabel)}</span><h3>${escapeHtml(presentation.title)}</h3><p class="skills-entry-id"><code>${escapeHtml(skill.name)}</code></p><p class="skills-entry-summary">${escapeHtml(presentation.summary)}</p><div class="skills-entry-meta"><span>${escapeHtml(presentation.category)}</span><span>${escapeHtml(resourceLabel)}</span>${skill.maintainer ? `<span>Maintained by ${escapeHtml(skill.maintainer)}</span>` : ""}</div><details class="skills-details"><summary>When to use this skill</summary><p>${escapeHtml(skill.description)}</p><p class="skills-path"><code>${escapeHtml(skill.directory)}</code></p><p><a href="${escapeHtml(skill.directoryUrl)}">Browse source files</a></p></details></div><div class="skills-entry-action"><a href="${escapeHtml(skill.sourceUrl)}" aria-label="Open instructions for ${escapeHtml(presentation.title)}">Open instructions <span aria-hidden="true">→</span></a></div></article></div>`;
    })
    .join("");
  return `<div data-skills-catalog><ul class="skills-summary" aria-label="Skills Library summary"><li><strong>${library.skills.length}</strong><span>skills ready to use</span></li><li><strong>${activeCollectionCount}</strong><span>active ${activeCollectionCount === 1 ? "collection" : "collections"}</span></li><li><strong>Automated</strong><span>source refresh</span></li></ul><div class="skills-sync-notice"><span class="glyphicon glyphicon-refresh" aria-hidden="true"></span><p><strong>Live from <a href="${escapeHtml(library.source.url)}">${escapeHtml(library.source.repository)}</a>.</strong> Synced at commit <a href="${escapeHtml(library.source.commitUrl)}"><code>${escapeHtml(library.source.commitSha.slice(0, 12))}</code></a>, committed ${escapeHtml(library.source.commitDate.slice(0, 10))}.</p></div><div class="skills-section-heading"><p class="home-kicker">Available now</p><h2>Find a skill for the work in front of you</h2><p>Search by outcome or browse the maintained collection. Open a skill when you are ready to give its instructions to an agent.</p></div><form class="skills-filter" role="search" aria-label="Filter skills" onsubmit="return false"><div class="row"><div class="col-sm-7"><label for="skills-search">What do you need help with?</label><div class="input-group"><span class="input-group-addon"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></span><input class="form-control" id="skills-search" type="search" autocomplete="off" placeholder="Try accessibility, data, review, or memory" data-skills-search></div></div><div class="col-sm-5"><label for="skills-collection">Collection</label><select class="form-control" id="skills-collection" data-skills-collection><option value="">All collections (${library.skills.length})</option>${collectionOptions}</select></div></div><p class="skills-status" data-skills-status aria-live="polite"></p></form><div class="row skills-grid">${cards}</div><div class="panel panel-default skills-install"><div class="panel-heading"><span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span><h2 class="panel-title">Install a skill</h2></div><div class="panel-body"><p>Clone the source repository, then copy an individual skill directory—not its <code>tritonai/</code> or <code>community/</code> wrapper—into the skills directory used by your agent.</p><pre><code>git clone https://github.com/${escapeHtml(library.source.repository)}.git
mkdir -p ~/.agents/skills
cp -R UCSD-Skills-Library/tritonai/skill-name ~/.agents/skills/</code></pre><p>Review the skill and its supporting files before installation. The public library excludes restricted operational procedures and credentials.</p><p><a class="btn btn-default" href="${escapeHtml(library.source.url)}#installing-a-skill">Read the repository instructions</a></p></div></div></div>`;
}

function navigationOwner(items, route) {
  const section = route.split("/").filter(Boolean)[0] || "";
  if (!section) return null;
  const sectionOwner = items.find((item) => (item.href.split("/").filter(Boolean)[0] || "") === section);
  if (sectionOwner) return sectionOwner;
  return items.find((item) => item.items?.some((child) => child.href === route)) || null;
}

function renderNavigation(items, route, mobile = false) {
  const owner = navigationOwner(items, route);
  return items
    .map((item, index) => {
      const active = item === owner;
      const current = route === item.href ? ' aria-current="page"' : "";
      if (!item.items?.length) {
        return `<li class="${active ? "active" : ""}"><a href="${escapeHtml(item.href)}"${current}>${escapeHtml(item.label)}</a></li>`;
      }
      const submenu = item.items
        .map((child) => {
          const childCurrent = route === child.href ? ' aria-current="page"' : "";
          return `<li${route === child.href ? ' class="active"' : ""}><a href="${escapeHtml(child.href)}"${childCurrent}>${escapeHtml(child.label)}</a></li>`;
        })
        .join("");
      if (mobile) {
        return `<li class="dropdown open ${active ? "active" : ""}"><a href="${escapeHtml(item.href)}"${current}>${escapeHtml(item.label)} <span class="caret"></span></a><ul class="dropdown-menu navmenu-nav">${submenu}</ul></li>`;
      }
      const submenuId = `nav-submenu-${index}`;
      return `<li class="dropdown ${active ? "active" : ""}"><a aria-controls="${submenuId}" aria-expanded="false" aria-haspopup="true" class="dropdown-toggle" data-close-others="true" data-hover="dropdown" data-tritonai-nav-dropdown href="${escapeHtml(item.href)}"${current}>${escapeHtml(item.label)} <span class="caret"></span></a><ul class="dropdown-menu" id="${submenuId}">${submenu}</ul></li>`;
    })
    .join("");
}

function renderSidebarItems(navigation, route) {
  const owner = navigationOwner(navigation, route);
  if (!owner) {
    return navigation
      .map((item) => `<li class="collapsed"><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`)
      .join("");
  }

  // The canonical TritonAI sidebar is contextual after a child page is chosen:
  // it keeps only siblings in view and makes the current page plain active text.
  // A top-level landing page instead remains in the root menu with its section
  // expanded. Do not repeat a child that merely aliases the section landing.
  const children = (owner.items || []).filter((child) => child.href !== owner.href);
  const activeChild = children.find((child) => child.href === route);
  if (activeChild) {
    return children
      .map((child) => {
        if (child.href === route) return `<li class="active">${escapeHtml(child.label)}</li>`;
        return `<li><a href="${escapeHtml(child.href)}">${escapeHtml(child.label)}</a></li>`;
      })
      .join("");
  }

  return navigation
    .map((item) => {
      const isActive = item === owner;
      if (isActive) {
        const submenu = children
          .map((child) => `<li><a href="${escapeHtml(child.href)}">${escapeHtml(child.label)}</a></li>`)
          .join("");
        const classes = submenu ? "expanded active" : "active";
        return `<li class="${classes}">${escapeHtml(item.label)}${submenu ? `<ul>${submenu}</ul>` : ""}</li>`;
      }
      return `<li class="collapsed"><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`;
    })
    .join("");
}

function renderSidebarInner(navigation, route) {
  const owner = navigationOwner(navigation, route);
  const children = owner ? (owner.items || []).filter((child) => child.href !== owner.href) : [];
  const activeChild = children.find((child) => child.href === route);
  const heading = activeChild && owner
    ? `<a href="${escapeHtml(owner.href)}">${escapeHtml(owner.label)}</a>`
    : '<a href="/index.html">TritonAI</a>';
  return `<h2>${heading}</h2><ul class="navbar-list">${renderSidebarItems(navigation, route)}</ul>`;
}

function renderSidebar(navigation, route) {
  return `<section aria-label="Sidebar" class="col-xs-12 col-md-3 sidebar-section" role="complementary"><article aria-label="Sidebar Nav" class="main-content-nav" role="navigation">${renderSidebarInner(navigation, route)}</article></section>`;
}

function renderAboutMobileNav(navigation, route) {
  return `<nav aria-label="About section navigation" class="about-mobile-section-nav"><details><summary>More in About</summary><ul class="navbar-list">${renderSidebarItems(navigation, route)}</ul></details></nav>`;
}

function renderLandingMobileSectionNav(navigation, route) {
  const owner = navigationOwner(navigation, route);
  if (!owner?.items?.length) return "";

  const hasOverview = owner.items.some((item) => item.href === owner.href);
  const items = hasOverview
    ? owner.items
    : [{ label: `${owner.label} Overview`, href: owner.href }, ...owner.items];
  const sectionSlug = owner.href.split("/").filter(Boolean)[0] || "site";
  const headingId = `mobile-section-nav-${sectionSlug}`;
  const links = items
    .map((item) => {
      if (item.href === route) {
        return `<li class="active"><span aria-current="page">${escapeHtml(item.label)}</span></li>`;
      }
      return `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`;
    })
    .join("");

  return `<nav aria-labelledby="${headingId}" class="landing-mobile-section-nav"><div class="container"><h2 id="${headingId}">More in ${escapeHtml(owner.label)}</h2><ul>${links}</ul></div></nav>`;
}

function routeForRelativePath(relativePath) {
  if (relativePath === "index.html") return "/";
  return `/${relativePath.replaceAll(path.sep, "/")}`;
}

function relativePathForRoute(route) {
  if (route === "/") return "index.html";
  return route.replace(/^\//, "");
}

function breadcrumbFor(page) {
  if (page.path === "/training-resources/videos/index.html") return `<li><a href="/">TritonAI</a></li><li><a href="/training-resources/index.html">Learn</a></li><li aria-current="page">${escapeHtml(page.title)}</li>`;
  const pieces = page.path.split("/").filter(Boolean);
  if (pieces.length <= 1) return "";
  if (pieces.at(-1) === "index.html") {
    return `<li><a href="/">TritonAI</a></li><li aria-current="page">${escapeHtml(page.title)}</li>`;
  }
  const section = pieces[0];
  const sectionLabels = {
    about: "About",
    "developer-apis": "Build",
    tritongpt: "TritonGPT",
    "training-resources": "Learn",
    "use-cases": "Use Cases",
    skills: "Skills Library",
  };
  const sectionHref = section === "use-cases" ? "/use-cases/index.html" : `/${section}/index.html`;
  return `<li><a href="/">TritonAI</a></li><li><a href="${sectionHref}">${escapeHtml(sectionLabels[section] || section)}</a></li><li aria-current="page">${escapeHtml(page.title)}</li>`;
}

function renderGeneratedPage(shellHtml, page, bodyHtml, homeHero) {
  const $ = load(shellHtml, { decodeEntities: false });
  $("body").addClass("agent-page");
  const landingHub = page.path === "/index.html" || page.landingHub === true;
  const videoTheater = page.videoTheater === true;
  const aboutSubpage = page.path.startsWith("/about/") && page.path !== "/about/index.html";
  if (landingHub) $("body").addClass("landing-hub-page");
  if (videoTheater) $("body").addClass("video-theater-page");
  if (aboutSubpage) $("body").addClass("about-subpage");
  const bannerImage = page.bannerImage || "https://cdn.ucsd.edu/cms/decorator-5/img/blue-grit.jpg";
  const bannerPosition = page.bannerPosition || "center";
  const bannerClass = page.bannerMode === "abstract" ? " landing-hub-hero--abstract" : "";
  const subpageHero = aboutSubpage
    ? `<div class="jumbotron jumbotron-fluid intro-banner about-subpage-hero" style="background-image:url('${escapeHtml(bannerImage)}');background-position:${escapeHtml(bannerPosition)};"><div class="container"><div class="about-subpage-title animated fadeInUp">${page.eyebrow ? `<p>${escapeHtml(page.eyebrow)}</p>` : ""}<h1 class="intro-banner-heading">${escapeHtml(page.title)}</h1></div></div></div>`
    : `<div class="jumbotron jumbotron-fluid intro-banner" style="background-image:url(https://cdn.ucsd.edu/cms/decorator-5/img/blue-grit.jpg);"><div class="container"><div class="cr-item-container hr-banner-two-col"><div class="row"><div class="col-sm-12"><div class="text-indent text-indent-h1 animated fadeInUp"><h1 class="intro-banner-heading" style="  text-align:left !important; float: left; margin-left: 0 !important;">${escapeHtml(page.title)}</h1></div></div></div></div></div></div>`;
  const subpageLayoutClass = aboutSubpage ? " about-subpage-layout" : "";
  const mobileAboutNav = aboutSubpage ? renderAboutMobileNav(site.navigation, page.path) : "";
  const mainContent =
    page.path === "/index.html"
      ? `${renderHomeHero(homeHero)}<div class="container home-main-content"><section aria-label="Main Content" class="col-xs-12 main-section">${bodyHtml}</section></div>`
      : videoTheater
        ? `<section aria-label="Main Content" class="col-xs-12 main-section video-theater-main">${bodyHtml}</section>`
      : landingHub
        ? `<div class="jumbotron jumbotron-fluid intro-banner landing-hub-hero${bannerClass}" style="background-image:url('${escapeHtml(bannerImage)}');background-position:${escapeHtml(bannerPosition)};"><div class="container"><div class="cr-item-container"><div class="row"><div class="col-sm-12"><div class="landing-hub-title animated fadeInUp">${page.eyebrow ? `<p>${escapeHtml(page.eyebrow)}</p>` : ""}<h1 class="intro-banner-heading">${escapeHtml(page.title)}</h1>${page.heroDescription ? `<p class="discovery-hero-description">${escapeHtml(page.heroDescription)}</p>` : ""}</div></div></div></div></div></div><div class="container landing-hub-breadcrumbs"><div class="row"><ol aria-label="Breadcrumb" class="breadcrumb breadcrumbs-list">${breadcrumbFor(page)}</ol></div></div><section aria-label="Main Content" class="col-xs-12 main-section landing-hub-content">${bodyHtml}</section>${renderLandingMobileSectionNav(site.navigation, page.path)}`
      : `${subpageHero}<div class="container"><div class="row"><ol aria-label="Breadcrumb" class="breadcrumb breadcrumbs-list">${breadcrumbFor(page)}</ol></div><div class="row${subpageLayoutClass}">${mobileAboutNav}<section aria-label="Main Content" class="col-xs-9 main-section pull-right">${bodyHtml}</section>${renderSidebar(site.navigation, page.path)}</div></div>`;
  $("main#main-content").html(mainContent);
  if (!$("#datatable-ns").length) $("script[src*='datatables']").remove();
  return $.html();
}

function decodeCloudflareEmail(value) {
  if (!value || value.length < 4) return null;
  const key = Number.parseInt(value.slice(0, 2), 16);
  let result = "";
  for (let index = 2; index < value.length; index += 2) {
    result += String.fromCharCode(Number.parseInt(value.slice(index, index + 2), 16) ^ key);
  }
  return result;
}

function prefixInternalUrl(value, relativePath) {
  if (!value || /^(?:#|mailto:|tel:|javascript:|data:|about:|blob:)/i.test(value) || value.startsWith("//")) return value;
  let candidate = value;
  try {
    const parsed = new URL(value, OFFICIAL_ORIGIN);
    if (/^https?:\/\//i.test(value) && parsed.origin !== OFFICIAL_ORIGIN) return value;
    if (/^https?:\/\//i.test(value) && parsed.origin === OFFICIAL_ORIGIN) {
      candidate = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return value;
  }
  if (SITE_BASE_PATH && !candidate.startsWith("/")) {
    try {
      const resolved = new URL(candidate, `https://local.invalid/${relativePath}`);
      candidate = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    } catch {
      return value;
    }
  }
  if (!candidate.startsWith("/") || !SITE_BASE_PATH) return candidate;
  if (candidate === SITE_BASE_PATH || candidate.startsWith(`${SITE_BASE_PATH}/`)) return candidate;
  return `${SITE_BASE_PATH}${candidate}`;
}

function prefixInlineStyleUrls(value, relativePath) {
  if (!value || !SITE_BASE_PATH || !/url\(/i.test(value)) return value;
  return value.replace(/url\((['"]?)([^'")]+)\1\)/gi, (_, quote, url) => {
    const rewritten = prefixInternalUrl(url, relativePath);
    const delimiter = quote || "'";
    return `url(${delimiter}${rewritten}${delimiter})`;
  });
}

function upsertMeta($, selector, attributes) {
  let element = $(selector).first();
  if (!element.length) {
    element = $("<meta>");
    $("head").append(element);
  }
  element.attr(attributes);
}

function breadcrumbSchema($, canonicalUrl) {
  const items = $("ol[aria-label='Breadcrumb'] li")
    .toArray()
    .map((element, index, elements) => {
      const item = $(element);
      const link = item.find("a[href]").first();
      const name = item.text().replace(/\s+/g, " ").trim();
      if (!name) return null;
      const entry = {
        "@type": "ListItem",
        position: index + 1,
        name,
      };
      if (link.length) entry.item = new URL(link.attr("href"), OFFICIAL_ORIGIN).href;
      else if (index === elements.length - 1) entry.item = canonicalUrl;
      return entry;
    })
    .filter(Boolean);
  if (items.length < 2) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

function localAssetPath(value, relativePath) {
  if (!value || /^(?:data:|https?:|\/\/|#)/i.test(value)) return null;
  try {
    return new URL(value, `https://local.invalid/${relativePath}`).pathname;
  } catch {
    return null;
  }
}

function optimizedImageFor(value, relativePath, optimizedImages) {
  const localPath = localAssetPath(value, relativePath);
  if (!localPath || !/\.(?:jpe?g|png)$/i.test(localPath)) return null;
  const optimizedPath = localPath.replace(/\.(?:jpe?g|png)$/i, ".webp");
  if (!optimizedImages.has(optimizedPath)) return null;
  return value.replace(/\.(?:jpe?g|png)(?=$|[?#])/i, ".webp");
}

function optimizeLocalImages($, relativePath, optimizedImages) {
  $("img[src]").each((_, element) => {
    const image = $(element);
    if (image.hasClass("first-slide")) return;
    const source = image.attr("src");
    if (!localAssetPath(source, relativePath)) return;
    image.attr("loading", "lazy").attr("decoding", "async");
    if (image.parent("picture").length) return;
    const optimized = optimizedImageFor(source, relativePath, optimizedImages);
    if (!optimized) return;
    image.wrap('<picture class="tritonai-optimized-image"></picture>');
    image.before(`<source srcset="${escapeHtml(optimized)}" type="image/webp">`);
  });

  $("[style*='background-image']").each((_, element) => {
    const target = $(element);
    const style = target.attr("style") || "";
    const match = style.match(/background-image\s*:\s*url\((['\"]?)([^'\")]+)\1\)\s*;?/i);
    if (!match) return;
    const optimized = optimizedImageFor(match[2], relativePath, optimizedImages);
    if (!optimized) return;
    const fallbackDeclaration = `background-image:url('${match[2]}');`;
    const fallbackType = /\.png(?:$|[?#])/i.test(match[2]) ? "png" : "jpeg";
    const optimizedDeclaration = `background-image:image-set(url('${optimized}') type('image/webp'), url('${match[2]}') type('image/${fallbackType}'));`;
    target.attr("style", style.replace(match[0], `${fallbackDeclaration}${optimizedDeclaration}`));
  });
}

function applyGoogleAnalytics($) {
  $("script[src*='googletagmanager.com']").remove();
  $("script:not([src])").each((_, element) => {
    if (/gtag\s*\(/.test($(element).html() || "")) $(element).remove();
  });
  $("head").append(
    `<script async data-tritonai-analytics src="https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}"></script>` +
      `<script data-tritonai-analytics>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GOOGLE_ANALYTICS_ID}',{'cookie_domain':'${GOOGLE_ANALYTICS_COOKIE_DOMAIN}'});</script>`,
  );
}

function optimizeScriptLoading($) {
  $("script[src]").each((_, element) => {
    const script = $(element);
    const source = script.attr("src") || "";
    if (AFTER_RENDER_SCRIPTS.has(source) || /(?:^|\/)datatables\.min\.js(?:[?#]|$)/i.test(source)) {
      script.attr("data-after-render-src", source).attr("type", "application/x-tritonai-after-render-script").removeAttr("src");
    } else if (source === EMERGENCY_BROADCAST_SCRIPT) {
      script.attr("async", "");
    } else if (source === TRITONGPT_WIDGET_SCRIPT) {
      script.attr("data-idle-src", source).attr("type", "application/x-tritonai-idle-script").removeAttr("src");
    }
  });

  $("script:not([src])").each((_, element) => {
    const script = $(element);
    if (script.attr("type") && script.attr("type") !== "text/javascript") return;
    const source = script.html() || "";
    if (!/\$\(document\)\.ready|initCopyright\(\)/.test(source)) return;
    const guardedSource = source
      .replace("$('.js-activated').dropdownHover().dropdown();", "if (window.jQuery && jQuery.fn.dropdownHover && jQuery.fn.dropdown) $('.js-activated').dropdownHover().dropdown();")
      .replace("initCopyright();", "if (typeof initCopyright === 'function') initCopyright();");
    script.attr("type", "application/x-tritonai-after-render-inline");
    script.html(`if (window.jQuery) {\n${guardedSource}\n}`);
  });
}

function normalizeRemoteAssetProtocols($) {
  const remoteAssetAttributes = [
    ["link[rel~='stylesheet'][href^='//cdn.ucsd.edu/']", "href"],
    ["script[src^='//cdn.ucsd.edu/']", "src"],
    ["img[src^='//cdn.ucsd.edu/']", "src"],
    ["source[src^='//cdn.ucsd.edu/']", "src"],
  ];
  for (const [selector, attribute] of remoteAssetAttributes) {
    $(selector).each((_, element) => {
      const asset = $(element);
      asset.attr(attribute, `https:${asset.attr(attribute)}`);
    });
  }
}

function normalizeNavigationMarkup($) {
  $(".skip-to-main").removeAttr("tabindex");
  $("[autofocus]").removeAttr("autofocus");

  const mobileNavigation = $(".navmenu.navmenu-default.navmenu-fixed-left.offcanvas").not(".offcanvas-clone").first();
  if (mobileNavigation.length) {
    mobileNavigation.attr({ id: "mobile-navigation", "aria-hidden": "true", "aria-label": "Site navigation" });
    mobileNavigation.find(".navbar-toggle[data-toggle='offcanvas']").attr({
      "aria-controls": "mobile-navigation",
      "aria-label": "Close navigation",
      "data-tritonai-mobile-close": "",
    });
  }

  const mobileToggle = $("nav.navbar .navbar-toggle[data-toggle='offcanvas']").first();
  if (mobileToggle.length) {
    mobileToggle.attr({
      "aria-controls": "mobile-navigation",
      "aria-expanded": "false",
      "data-tritonai-mobile-toggle": "",
    });
  }

  $("form").each((_, element) => {
    const form = $(element);
    const scope = form.find("select.search-scope").first();
    const term = form.find("input.search-term").first();
    if (!scope.length || !term.length) return;
    const mobile = form.closest(".navmenu").length > 0;
    const suffix = mobile ? "mobile" : "desktop";
    const scopeId = `search-scope-${suffix}`;
    const termId = `search-term-${suffix}`;
    scope.attr("id", scopeId);
    term.attr("id", termId);
    form.find("label[for]").remove();
    scope.before(`<label class="sr-only" for="${scopeId}">Search scope</label>`);
    term.before(`<label class="sr-only" for="${termId}">Search term</label>`);
  });

  const desktopSearch = $("nav.navbar .search").first();
  if (desktopSearch.length) {
    const toggle = desktopSearch.find(".search-toggle").first();
    const panel = desktopSearch.find(".search-content").first();
    if (toggle.length && panel.length) {
      const panelId = panel.attr("id") || "search";
      panel.attr({ id: panelId, "aria-hidden": "true" });
      toggle.attr({
        "aria-controls": panelId,
        "aria-expanded": "false",
        "data-tritonai-search-toggle": "",
      });
    }
  }
}

function transformHtml(html, relativePath, context) {
  const $ = load(html, { decodeEntities: false });
  const route = routeForRelativePath(relativePath);
  $("body").addClass("agent-page");
  const aboutSubpage = relativePath.startsWith("about/") && relativePath !== "about/index.html";
  if (aboutSubpage) $("body").addClass("about-subpage");
  if (relativePath === "about/ai-updates.html") $("body").addClass("about-updates-page");
  const generated = context.generatedByPath.get(relativePath);
  const seo = context.seo.routes[route] || {};
  const title = seo.title || generated?.title || $("meta[name='PAGETITLE']").attr("content") || $("title").text().trim() || context.site.name;
  const description = seo.description || generated?.description || $("meta[name='DESCRIPTION']").attr("content") || context.site.description;
  const canonicalPath = generated?.canonicalUrl || route;
  const canonicalUrl = new URL(canonicalPath, OFFICIAL_ORIGIN).href;
  const useCaseImage = generated?.slug ? USE_CASE_MEDIA[generated.slug]?.src : null;
  const socialImagePath = seo.socialImage || generated?.socialImage || generated?.bannerImage || useCaseImage || context.seo.defaultSocialImage;
  const socialImageUrl = new URL(socialImagePath, OFFICIAL_ORIGIN).href;
  const socialImageAlt = seo.socialImageAlt || generated?.imageAlt || context.seo.defaultSocialImageAlt;

  $("title").text(title === context.site.name ? title : `${title} | ${context.site.name}`);
  upsertMeta($, "meta[name='description'], meta[name='DESCRIPTION']", { name: "description", content: description });
  upsertMeta($, "meta[name='PAGETITLE']", { name: "PAGETITLE", content: title });
  upsertMeta($, "meta[property='og:title']", { property: "og:title", content: title });
  upsertMeta($, "meta[property='og:description']", { property: "og:description", content: description });
  upsertMeta($, "meta[property='og:type']", { property: "og:type", content: "website" });
  upsertMeta($, "meta[property='og:url']", { property: "og:url", content: canonicalUrl });
  upsertMeta($, "meta[property='og:site_name']", { property: "og:site_name", content: context.site.name });
  upsertMeta($, "meta[property='og:image']", { property: "og:image", content: socialImageUrl });
  upsertMeta($, "meta[property='og:image:alt']", { property: "og:image:alt", content: socialImageAlt });
  upsertMeta($, "meta[name='twitter:card']", { name: "twitter:card", content: "summary_large_image" });
  upsertMeta($, "meta[name='twitter:title']", { name: "twitter:title", content: title });
  upsertMeta($, "meta[name='twitter:description']", { name: "twitter:description", content: description });
  upsertMeta($, "meta[name='twitter:image']", { name: "twitter:image", content: socialImageUrl });
  upsertMeta($, "meta[name='twitter:image:alt']", { name: "twitter:image:alt", content: socialImageAlt });
  upsertMeta($, "meta[name='robots']", { name: "robots", content: seo.robots || "index,follow" });
  if (relativePath === "404.html") upsertMeta($, "meta[name='robots']", { name: "robots", content: "noindex,follow" });
  // The playground build is served from a public GitHub Pages URL. Without this
  // it competes with tritonai.ucsd.edu for the same queries. The canonical tag
  // below points at production, but a canonical is a hint a search engine may
  // ignore; noindex is a directive. Applied last so nothing above re-enables it.
  if (!IS_PRODUCTION_BUILD) {
    upsertMeta($, "meta[name='robots']", { name: "robots", content: "noindex,nofollow" });
  }
  $("link[rel='canonical']").remove();
  $("head").append(`<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`);
  if (generated?.redirectTo) {
    const redirectTarget = prefixInternalUrl(generated.redirectTo, relativePath);
    $("meta[http-equiv='refresh']").remove();
    $("head").append(`<meta http-equiv="refresh" content="0; url=${escapeHtml(redirectTarget)}">`);
    upsertMeta($, "meta[name='robots']", { name: "robots", content: "noindex,follow" });
  }
  if (!$("link[rel~='icon']").length) $("head").append('<link rel="icon" href="https://www.ucsd.edu/favicon.ico">');
  if (!$("link[href*='/agent-site.css']").length) {
    $("head").append(`<link rel="stylesheet" href="/_resources/css/agent-site.css?v=${AGENT_SITE_CSS_VERSION}">`);
  }
  if (
    ($("body").hasClass("landing-hub-page")
      || $("body").hasClass("about-subpage")
      || $("main#main-content").find(".hub-full-bleed").length)
    && !$("link[href*='/landing-hubs.css']").length
  ) {
    $("head").append(`<link rel="stylesheet" href="/_resources/css/landing-hubs.css?v=${LANDING_HUBS_CSS_VERSION}">`);
  }
  const connectionHints = PRECONNECT_ORIGINS.map(
    (origin) => `<link rel="preconnect" href="${origin}" crossorigin><link rel="dns-prefetch" href="//${new URL(origin).host}">`,
  ).join("");
  $("head").prepend(`${connectionHints}<script data-tritonai-js-class>document.documentElement.className=document.documentElement.className.replace(/\\bno-js\\b/g,'js');</script>`);
  $("script[data-tritonai-schema]").remove();
  const websiteId = `${OFFICIAL_ORIGIN}/#website`;
  const organizationId = `${OFFICIAL_ORIGIN}/#organization`;
  const isWebsite = relativePath === "index.html";
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": isWebsite ? "WebSite" : "WebPage",
    "@id": isWebsite ? websiteId : `${canonicalUrl}#webpage`,
    name: isWebsite ? context.site.name : title,
    description,
    url: canonicalUrl,
    image: socialImageUrl,
    inLanguage: "en-US",
    publisher: { "@id": organizationId },
    dateModified: seo.lastModified || generated?.lastReviewed || context.site.lastReviewed,
  };
  if (Array.isArray(seo.schemaAbout) && seo.schemaAbout.length) {
    pageSchema.about = seo.schemaAbout.map((name) => ({ "@type": "Thing", name }));
  }
  if (isWebsite) pageSchema.alternateName = ["Triton AI", "UC San Diego TritonAI"];
  else pageSchema.isPartOf = { "@type": "WebSite", "@id": websiteId, name: context.site.name, url: OFFICIAL_ORIGIN };
  const organizationSchema = isWebsite
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": organizationId,
        name: "University of California San Diego",
        alternateName: ["UC San Diego", "UCSD"],
        url: "https://ucsd.edu/",
      }
    : null;
  const breadcrumb = breadcrumbSchema($, canonicalUrl);
  const schemaNodes = [pageSchema];
  if (organizationSchema) schemaNodes.push(organizationSchema);
  if (breadcrumb) schemaNodes.push({ "@context": "https://schema.org", ...breadcrumb });
  const schema = JSON.stringify(schemaNodes.length > 1 ? schemaNodes : pageSchema)
    .replaceAll("</script", "<\\/script");
  $("head").append(`<script type="application/ld+json" data-tritonai-schema>${schema}</script>`);
  applyGoogleAnalytics($);

  $(".navbar-nav-list").first().html(renderNavigation(context.site.navigation, route, false));
  $("ul.nav.navmenu-nav").first().html(renderNavigation(context.site.navigation, route, true));
  $("article.main-content-nav").each((_, element) => {
    $(element).html(renderSidebarInner(context.site.navigation, route));
  });
  if (aboutSubpage && !$(".about-mobile-section-nav").length) {
    $(".about-subpage-layout").first().prepend(renderAboutMobileNav(context.site.navigation, route));
  }
  normalizeNavigationMarkup($);

  $("[data-newsletters='latest']").html(renderLatestNewsletters(context.newsletters));
  $("[data-newsletters='all']").html(context.newsletters.map(renderNewsletter).join(""));
  const legacyNewsletterContainer = $(".space-y-12.md\\:space-y-14").first();
  if (legacyNewsletterContainer.length) legacyNewsletterContainer.html(context.newsletters.map(renderNewsletter).join(""));
  $("[data-featured-use-cases='true']").html(renderUseCaseCards(featuredUseCases(context.useCases)));
  $("[data-public-facts='true']").html(renderPublicFacts(context.facts.facts));
  $("[data-gateway-usage='true']").html(renderGatewayUsage(context.gatewayUsage));
  $("[data-skills-library='true']").html(renderSkillsLibrary(context.skills));
  $("[data-tritonai-updates]").each((_, element) => {
    const target = $(element);
    target.html(renderTritonAiUpdates(context.tritonAiUpdates, target.attr("data-tritonai-updates")));
  });

  // Training-video players (data-progress-slug) keep sound, posters, inline
  // sources, and user-initiated playback; only decorative demos get the
  // muted autoplay-when-visible treatment.
  $("video").not("[data-progress-slug]").each((_, element) => {
    const video = $(element);
    video
      .removeAttr("autoplay")
      .attr("data-autoplay-when-visible", "true")
      .attr("preload", "none")
      .attr("muted", "muted")
      .attr("playsinline", "playsinline");
    if (video.attr("poster")) video.attr("data-poster", video.attr("poster")).removeAttr("poster");
    if (video.attr("src")) video.attr("data-src", video.attr("src")).removeAttr("src");
    video.find("source[src]").each((__, sourceElement) => {
      const source = $(sourceElement);
      source.attr("data-src", source.attr("src")).removeAttr("src");
    });
  });
  $("iframe[src*='youtube.com/embed']").each((_, element) => {
    const iframe = $(element);
    const url = new URL(iframe.attr("src"));
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("mute", "1");
    url.searchParams.set("playsinline", "1");
    iframe
      .attr("data-src", url.href)
      .attr("src", "about:blank")
      .attr("loading", "lazy")
      .attr("data-autoplay-when-visible", "true");
  });

  optimizeLocalImages($, relativePath, context.optimizedImages);
  normalizeRemoteAssetProtocols($);
  optimizeScriptLoading($);
  if (!$("script[src$='site-navigation.js']").length) $("body").append('<script defer src="/_resources/js/site-navigation.js"></script>');
  if ($(".drawer").length && !$("script[src$='site-drawers.js']").length) {
    $("body").append('<script defer src="/_resources/js/site-drawers.js"></script>');
  }
  if (relativePath === "index.html" && $("[data-today-news]").length && !$("script[src$='today-news.js']").length) {
    $("body").append('<script defer src="/_resources/js/today-news.js"></script>');
  }
  if ($("[data-updates-results]").length && !$("script[src$='tritonai-updates.js']").length) {
    $("body").append('<script defer src="/_resources/js/tritonai-updates.js"></script>');
  }
  if (!$("script[src$='site-performance.js']").length) $("body").append('<script defer src="/_resources/js/site-performance.js"></script>');
  if ($("[data-video-progress]").length && !$("script[src*='/video-progress.js']").length) {
    $("body").append(`<script defer src="/_resources/js/video-progress.js?v=${VIDEO_PROGRESS_JS_VERSION}"></script>`);
  }
  if ($("[data-video-quiz], [data-quiz-card-state]").length && !$("script[src*='/video-quiz.js']").length) {
    $("body").append(`<script defer src="/_resources/js/video-quiz.js?v=${VIDEO_QUIZ_JS_VERSION}"></script>`);
  }

  $("a[href^='/cdn-cgi/l/email-protection#']").each((_, element) => {
    const anchor = $(element);
    const email = decodeCloudflareEmail((anchor.attr("href") || "").split("#")[1]);
    if (!email) return;
    anchor.attr("href", `mailto:${email}`).removeAttr("target").removeAttr("rel");
    if (/email\s*protected/i.test(anchor.text())) anchor.text(email);
  });
  $("span.__cf_email__").each((_, element) => {
    const span = $(element);
    const email = decodeCloudflareEmail(span.attr("data-cfemail"));
    if (!email) return;
    const anchor = span.closest("a");
    if (anchor.length) anchor.attr("href", `mailto:${email}`).removeAttr("target").removeAttr("rel");
    span.replaceWith(email);
  });

  $("a[href]").each((_, element) => {
    const anchor = $(element);
    const href = anchor.attr("href") || "";
    if (/^https?:\/\//i.test(href) && new URL(href).origin !== OFFICIAL_ORIGIN) {
      anchor.attr("target", "_blank").attr("rel", "noopener noreferrer");
    }
  });

  for (const attr of ["href", "src", "action", "poster", "data-src", "data-poster", "data-fallback-src", "data-after-render-src", "data-idle-src"]) {
    $(`[${attr}]`).each((_, element) => {
      if (attr === "href" && element.tagName === "link" && $(element).attr("rel") === "canonical") return;
      $(element).attr(attr, prefixInternalUrl($(element).attr(attr), relativePath));
    });
  }
  $("[style*='url(']").each((_, element) => {
    const target = $(element);
    target.attr("style", prefixInlineStyleUrls(target.attr("style") || "", relativePath));
  });
  $("[srcset]").each((_, element) => {
    const rewritten = ($(element).attr("srcset") || "")
      .split(",")
      .map((candidate) => {
        const parts = candidate.trim().split(/\s+/);
        parts[0] = prefixInternalUrl(parts[0], relativePath);
        return parts.join(" ");
      })
      .join(", ");
    $(element).attr("srcset", rewritten);
  });

  if (relativePath === "search/index.html") {
    const searchScript = $("script[data-after-render-src='https://cdn.ucsd.edu/cms/search/js/search-api.js']").first();
    if (searchScript.length) {
      searchScript.after("<script>/* Keep staging searches scoped to the production TritonAI index. */\ndocument.addEventListener('tritonai:decorator-ready', function () { if (typeof search === 'function') { const tritonAiSearch = search; search = function(data, back) { if (data && data.siteSearch && data.siteSearch !== 'tritonai.ucsd.edu') data.siteSearch = 'tritonai.ucsd.edu'; return tritonAiSearch(data, back); }; } }, { once: true });\n</script>");
    }
  }

  return $.html();
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

async function writeGeneratedPage(shellHtml, page, bodyHtml, generatedByPath, homeHero) {
  const relativePath = relativePathForRoute(page.path);
  const filename = path.join(OUTPUT_DIR, relativePath);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, renderGeneratedPage(shellHtml, page, bodyHtml, homeHero));
  generatedByPath.set(relativePath, page);
}

const site = await readJson(path.join(CONTENT_DIR, "site.json"));
const roadmap = await readJson(path.join(CONTENT_DIR, "roadmap/milestones.json"));
const facts = await readJson(path.join(CONTENT_DIR, "facts/public-facts.json"));
const skills = await readJson(SKILLS_FILE);
const homeHero = await readJson(HOME_HERO_FILE);
const gatewayUsage = await readJson(GATEWAY_USAGE_FILE);
const seo = await readJson(SEO_FILE);
const tritonAiUpdates = await readJson(TRITONAI_UPDATES_FILE);
requireFields(roadmap, ["title", "description", "owner", "lastReviewed", "source", "canonicalUrl", "items"], "content/roadmap/milestones.json");
roadmap.lastReviewed = isoDate(roadmap.lastReviewed);
for (const [index, item] of roadmap.items.entries()) {
  requireFields(item, ["period", "title", "status", "summary", "owner", "lastReviewed", "source"], `roadmap item ${index + 1}`);
  item.lastReviewed = isoDate(item.lastReviewed);
}
for (const fact of facts.facts) {
  requireFields(fact, ["id", "claim", "status", "owner", "lastReviewed", "source", "measurementPeriod", "dataClassification", "canonicalUrl", "relatedSlides"], `public fact ${fact.id || "unknown"}`);
  fact.lastReviewed = isoDate(fact.lastReviewed);
}
requireFields(skills, ["schemaVersion", "syncedAt", "source", "collections", "skills"], "content/skills/library.json");
requireFields(skills.source, ["repository", "url", "defaultBranch", "commitSha", "commitUrl", "commitDate"], "content/skills/library.json source");
for (const [index, skill] of skills.skills.entries()) {
  requireFields(skill, ["name", "description", "collection", "collectionLabel", "path", "directory", "sourceUrl", "directoryUrl", "resources"], `skill ${index + 1}`);
}
requireFields(homeHero, ["schemaVersion", "owner", "source", "lastReviewed", "rotationIntervalMs", "slides"], "content/home/hero.json");
homeHero.lastReviewed = isoDate(homeHero.lastReviewed);
for (const [index, slide] of homeHero.slides.entries()) {
  requireFields(slide, ["id", "title", "description", "image", "imageAlt", "link", "linkLabel"], `homepage hero slide ${index + 1}`);
}
requireFields(gatewayUsage, ["schemaVersion", "title", "summary", "owner", "source", "measurementPeriod", "generatedAt", "lastReviewed", "dataClassification", "canonicalUrl", "relatedSlides", "metrics", "monthly", "notes"], "content/facts/gateway-usage.json");
requireFields(gatewayUsage.measurementPeriod, ["start", "end", "label"], "content/facts/gateway-usage.json measurement period");
gatewayUsage.lastReviewed = isoDate(gatewayUsage.lastReviewed);
requireFields(seo, ["schemaVersion", "defaultSocialImage", "defaultSocialImageAlt", "routes"], "content/seo.json");
for (const [route, entry] of Object.entries(seo.routes)) {
  if (!route.startsWith("/")) throw new Error(`content/seo.json route must start with /: ${route}`);
  if (entry.lastModified) entry.lastModified = isoDate(entry.lastModified);
}
requireFields(tritonAiUpdates, ["schemaVersion", "title", "description", "owner", "source", "lastReviewed", "streams", "areas", "updates"], "content/updates/tritonai-updates.json");
tritonAiUpdates.lastReviewed = isoDate(tritonAiUpdates.lastReviewed);
const updateStreamIds = new Set();
for (const [index, stream] of tritonAiUpdates.streams.entries()) {
  requireFields(stream, ["id", "title", "introKicker", "introHeading", "introDescription", "feedKicker", "feedHeading", "feedDescription", "searchPlaceholder"], `TritonAI update stream ${index + 1}`);
  if (updateStreamIds.has(stream.id)) throw new Error(`Duplicate TritonAI update stream: ${stream.id}`);
  updateStreamIds.add(stream.id);
}
const updateAreaIds = new Set();
for (const [index, area] of tritonAiUpdates.areas.entries()) {
  requireFields(area, ["id", "label", "icon"], `TritonAI update area ${index + 1}`);
  if (updateAreaIds.has(area.id)) throw new Error(`Duplicate TritonAI update area: ${area.id}`);
  updateAreaIds.add(area.id);
}
const updateIds = new Set();
let previousUpdateDate = "9999-99-99";
for (const [index, update] of tritonAiUpdates.updates.entries()) {
  requireFields(update, ["id", "stream", "date", "displayDate", "area", "title", "details"], `TritonAI update ${index + 1}`);
  if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(update.date)) throw new Error(`Invalid TritonAI update date: ${update.date}`);
  if (update.date > previousUpdateDate) throw new Error(`TritonAI updates must be newest first: ${update.id}`);
  previousUpdateDate = update.date;
  if (updateIds.has(update.id)) throw new Error(`Duplicate TritonAI update id: ${update.id}`);
  updateIds.add(update.id);
  if (!updateStreamIds.has(update.stream)) throw new Error(`Unknown TritonAI update stream for ${update.id}: ${update.stream}`);
  if (!updateAreaIds.has(update.area)) throw new Error(`Unknown TritonAI update area for ${update.id}: ${update.area}`);
  if (/<\/?(?:script|style|iframe|object|embed|form)\b/i.test(update.details)) throw new Error(`Disallowed HTML in TritonAI update: ${update.id}`);
}
for (const [index, metric] of gatewayUsage.metrics.entries()) {
  requireFields(metric, ["id", "displayValue", "label", "definition", "value"], `gateway usage metric ${index + 1}`);
}
for (const [index, month] of gatewayUsage.monthly.entries()) {
  requireFields(month, ["month", "label", "selfHostedTokens", "cloudTokens"], `gateway usage month ${index + 1}`);
}

const pages = await loadMarkdownDirectory(PAGE_DIR, ["title", "path", "description", "lastReviewed", "audiences", "source", "canonicalUrl", "relatedSlides"]);
const useCases = await loadMarkdownDirectory(USE_CASE_DIR, ["title", "slug", "summary", "status", "owner", "lastReviewed", "audiences", "source", "measurementPeriod", "dataClassification", "canonicalUrl", "relatedSlides", "humanOversight", "measurableOutcome"]);
const trainingVideosAll = await loadMarkdownDirectory(TRAINING_VIDEO_DIR, ["title", "slug", "summary", "series", "status", "owner", "lastReviewed", "audiences", "source", "dataClassification", "canonicalUrl", "relatedSlides"]);
const trainingVideos = trainingVideosAll.filter((video) => ["Published", "Coming soon"].includes(video.status));
for (const video of trainingVideos) {
  if (video.status === "Published") requireFields(video, ["videoSrc", "videoCaptionsSrc", "durationMinutes"], video.filename);
  for (const question of video.quiz || []) {
    if (!question.question || !Array.isArray(question.options) || question.options.length < 2 || !Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.options.length || !question.explanation) {
      throw new Error(`${video.filename}: invalid quiz question or answer key`);
    }
  }
}

const newsletters = await loadNewsletters();
// Generated pages can live at any directory depth, so parent-relative asset
// references in the shell must be site-absolute before reuse.
const shellHtml = (await readFile(path.join(SOURCE_DIR, "about/index.html"), "utf8")).replaceAll('src="../_resources/', 'src="/_resources/');
const homeShellHtml = await readFile(path.join(SOURCE_DIR, "index.html"), "utf8");

await rm(OUTPUT_DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
await mkdir(OUTPUT_DIR, { recursive: true });
await cp(SOURCE_DIR, OUTPUT_DIR, { recursive: true });
await cp(PRESENTATION_DIR, path.join(OUTPUT_DIR, "presentations"), { recursive: true });

const generatedByPath = new Map();
for (const page of pages) {
  await writeGeneratedPage(page.path === "/index.html" ? homeShellHtml : shellHtml, page, page.html, generatedByPath, homeHero);
}

const useCaseIndex = {
  title: "AI Use Cases",
  path: "/use-cases/index.html",
  description: "Campus workflows TritonAI has built, what stage each one is at, who reviews the output, and what gets measured.",
  eyebrow: "TritonAI portfolio",
  lastReviewed: site.lastReviewed,
  canonicalUrl: "/use-cases/index.html",
  landingHub: true,
  bannerImage: "/_images/hero-abstract/use-cases.webp",
  bannerPosition: "center",
  bannerMode: "abstract",
};
await writeGeneratedPage(shellHtml, useCaseIndex, renderUseCaseIndex(useCases), generatedByPath, homeHero);
for (const useCase of useCases) {
  await writeGeneratedPage(
    shellHtml,
    { ...useCase, path: useCase.canonicalUrl, eyebrow: "AI use case", description: useCase.summary },
    renderUseCasePage(useCase),
    generatedByPath,
  );
}

const trainingVideoIndex = {
  title: "TritonAI Discovery Series",
  path: "/training-resources/videos/index.html",
  description: "Explore the TritonAI ecosystem, use campus tools, and build with AI through short lessons and browser-based knowledge checks.",
  heroDescription: "Where many TritonAI learning journeys begin. The series builds from understanding the TritonAI ecosystem, to using campus tools, to creating with them, and each short video is designed to be watched in order.",
  eyebrow: "Start here",
  lastReviewed: site.lastReviewed,
  canonicalUrl: "/training-resources/videos/index.html",
  landingHub: true,
  bannerImage: "/_images/hero-abstract/learn.webp",
  bannerPosition: "center",
  bannerMode: "abstract",
};
await writeGeneratedPage(shellHtml, trainingVideoIndex, renderTrainingVideoIndex(trainingVideos), generatedByPath, homeHero);
for (const video of trainingVideos) {
  await writeGeneratedPage(
    shellHtml,
    { ...video, path: video.canonicalUrl, eyebrow: "AI learning video", description: video.description || video.summary, videoTheater: true },
    await renderTrainingVideoPage(video, trainingVideos),
    generatedByPath,
  );
}
await mkdir(path.join(OUTPUT_DIR, "training-resources/videos"), { recursive: true });
await writeFile(
  path.join(OUTPUT_DIR, "training-resources/videos/transcripts.json"),
  `${JSON.stringify(
    trainingVideos.filter((video) => video.status === "Published").map((video) => ({
      slug: video.slug,
      title: video.title,
      canonicalUrl: video.canonicalUrl,
      series: video.series,
      transcript: splitTrainingVideoBody(video.html)
        .transcript.replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    })),
    null,
    2,
  )}\n`,
);

await writeGeneratedPage(shellHtml, { ...roadmap, path: roadmap.canonicalUrl, eyebrow: "About TritonAI" }, renderRoadmap(roadmap), generatedByPath);
await writeGeneratedPage(
  shellHtml,
  {
    title: "Page Not Found",
    path: "/404.html",
    description: "We could not find that TritonAI page.",
    eyebrow: "404",
    lastReviewed: site.lastReviewed,
    canonicalUrl: "/404.html",
  },
  '<p class="lead">The page may have moved, or the address may be incomplete.</p><p><a class="btn btn-primary" href="/">Go to the TritonAI home page</a> <a class="btn btn-default" href="/search/index.html">Search the site</a></p>',
  generatedByPath,
);

let htmlFiles = (await listFiles(OUTPUT_DIR)).filter((file) => file.endsWith(".html"));
const optimizedImages = new Set(
  (await listFiles(path.join(SOURCE_DIR, "_images")))
    .filter((file) => file.endsWith(".webp"))
    .map((file) => `/_images/${file.replaceAll(path.sep, "/")}`),
);
const context = { site, newsletters, useCases, facts, gatewayUsage, skills, seo, tritonAiUpdates, generatedByPath, optimizedImages };
for (const relativePath of htmlFiles) {
  const filename = path.join(OUTPUT_DIR, relativePath);
  await writeFile(filename, transformHtml(await readFile(filename, "utf8"), relativePath, context));
}

htmlFiles = (await listFiles(OUTPUT_DIR)).filter((file) => file.endsWith(".html")).sort();
const routes = htmlFiles
  .map((relativePath) => ({
    path: routeForRelativePath(relativePath),
    canonicalUrl: new URL(generatedByPath.get(relativePath)?.canonicalUrl || routeForRelativePath(relativePath), OFFICIAL_ORIGIN).href,
    redirectTo: generatedByPath.get(relativePath)?.redirectTo || null,
    source: generatedByPath.has(relativePath) ? "structured-content" : "cascade-snapshot",
    lastModified: seo.routes[routeForRelativePath(relativePath)]?.lastModified || generatedByPath.get(relativePath)?.lastReviewed || site.lastReviewed,
    indexable: relativePath !== "404.html"
      && !generatedByPath.get(relativePath)?.redirectTo
      && !/noindex/i.test(seo.routes[routeForRelativePath(relativePath)]?.robots || ""),
  }))
  .filter((route) => !UNLISTED_ROUTES.has(route.path));
const sitemapEntries = routes
  .filter((route) => route.indexable)
  .map((route) => `<url><loc>${escapeHtml(route.canonicalUrl)}</loc><lastmod>${escapeHtml(route.lastModified)}</lastmod></url>`)
  .join("");
await mkdir(path.join(OUTPUT_DIR, "_data"), { recursive: true });
await writeFile(path.join(OUTPUT_DIR, "_data/routes.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), routes }, null, 2)}\n`);
await writeFile(
  path.join(OUTPUT_DIR, "_data/public-content.json"),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      lastReviewed: site.lastReviewed,
      facts: facts.facts.filter((fact) => fact.status === "public"),
      gatewayUsage,
      roadmap,
      useCases: useCases.map(({ html, body, filename, ...entry }) => entry),
      skillsLibrary: skills,
      homeHero,
      tritonAiUpdates,
    },
    null,
    2,
  )}\n`,
);
await writeFile(path.join(OUTPUT_DIR, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}</urlset>\n`);
// Production advertises its sitemap. The playground deliberately still allows
// crawling: `Disallow: /` would stop a crawler fetching the pages, and a page it
// cannot fetch is a page whose noindex it cannot read — which is how disallowed
// URLs end up listed anyway, as a bare link with no description. Letting the
// crawler in to be told noindex is what actually keeps it out of the index. It
// also must not point at production's sitemap, which would invite crawling of
// the very URLs this build is trying to keep separate.
await writeFile(
  path.join(OUTPUT_DIR, "robots.txt"),
  IS_PRODUCTION_BUILD
    ? `User-agent: *\nAllow: /\nSitemap: ${OFFICIAL_ORIGIN}/sitemap.xml\n`
    : `# Playground build. Every page carries <meta name="robots" content="noindex,nofollow">.\n# Crawling stays allowed so that directive can be read.\nUser-agent: *\nAllow: /\n`,
);
await writeFile(path.join(OUTPUT_DIR, ".nojekyll"), "");

process.stdout.write(`Built ${htmlFiles.length} HTML files, ${useCases.length} structured use cases, ${skills.skills.length} public skills, ${tritonAiUpdates.updates.length} TritonAI updates, and ${newsletters.length} newsletters for base path ${SITE_BASE_PATH || "/"}.\n`);
