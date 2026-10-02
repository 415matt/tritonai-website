import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

// Flags editorial patterns using docs/voice-and-language.md.
//
// This reads content/ source rather than dist/ so a finding names the file an
// editor would open. Structural and accessibility rules stay in validate.mjs;
// nothing here inspects rendered markup.
//
// Style findings are advisory: each pattern can be appropriate in context.
// Run with --strict to exit non-zero on technical errors such as metadata length.

const CONTENT_DIR = path.resolve("content");
const REPORT_DIR = path.resolve("reports");
const STRICT = process.argv.includes("--strict");
const markdown = new MarkdownIt({ html: true, linkify: false, typographer: false });

const BOOSTERS = [
  "practical", "trusted", "meaningful", "thoughtful", "durable", "robust",
  "seamless", "powerful", "cutting-edge", "leverage", "leveraging", "holistic",
  "empower", "empowers", "empowering", "unlock", "unlocks", "vibrant",
];

// Governance vocabulary. These qualify a real control and must never be
// flagged as filler or swapped for a synonym.
const PRECISION_TERMS = [
  "approved", "governed", "bounded", "supervised", "named", "supported",
  "Production", "Shipped", "Pilot", "In development", "Exploring",
];

const ANTITHESIS = /(,\s*not\s)|(\bnot\s+(only|just|merely)\b)|(\brather than\b)|(\binstead of\b)/i;
const COUNT_HEADING = /\b(Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)\s+[a-z]/;
const SENTENCE_BREAK = /[.!?]\s+\S/;
const LONG_LIST = /(\b[\w-]+\b,\s+){4,}(and|or)\s/i;
const EM_DASH = /[—–]/;
const DESCRIPTION_MAX = 155;

const findings = [];

function report(severity, rule, source, line, role, text, note) {
  findings.push({ severity, rule, source, line, role, text: text.slice(0, 160), note });
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /^[a-z0-9][a-z0-9-]*\.md$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

// Blank out HTML comment bodies so a `lang-ok` note quoting the string it
// suppresses cannot be mistaken for the occurrence being located. Lengths are
// preserved so offsets still map to the right line.
function maskComments(raw) {
  return raw.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, " "));
}

function lineOf(masked, needle) {
  const index = masked.indexOf(needle);
  if (index < 0) return null;
  return masked.slice(0, index).split("\n").length;
}

// An `<!-- lang-ok: reason -->` comment suppresses findings on the following
// line. The reason is required so suppressions stay reviewable in a diff.
function suppressedLines(raw) {
  const suppressed = new Set();
  raw.split("\n").forEach((text, index) => {
    if (/<!--\s*lang-ok:\s*\S/.test(text)) suppressed.add(index + 2);
  });
  return suppressed;
}

function checkText(role, value, source, raw, suppressed, options = {}) {
  const line = lineOf(raw, value);
  if (line && suppressed.has(line)) return;
  const isHeadline = role === "heading" || role === "kicker";

  if (isHeadline && SENTENCE_BREAK.test(value)) {
    report("warn", "heading-sentence-break", source, line, role, value,
      "Review whether the two-part heading is easy to scan and fits the section's purpose.");
  }
  if (isHeadline && COUNT_HEADING.test(value)) {
    report("warn", "count-in-heading", source, line, role, value,
      "Keep the count if it helps readers navigate a guide or recognize a framework.");
  }
  if (isHeadline && ANTITHESIS.test(value)) {
    report("warn", "antithesis-in-heading", source, line, role, value,
      "Review whether the contrast explains a real distinction or adds useful emphasis.");
  }
  if (!isHeadline && ANTITHESIS.test(value)) {
    report("warn", "manufactured-contrast", source, line, role, value,
      "Review whether the contrast adds meaning; repeated contrasts can distract from the point.");
  }
  if (options.checkLists && LONG_LIST.test(value)) {
    report("warn", "long-comma-list", source, line, role, value,
      "Consider a list element if readers need to scan or act on these items separately.");
  }
  const dashCheckValue = value.replace(/\b\d+\s*[—–]\s*\d+\b/g, "");
  if (options.checkEmDash && EM_DASH.test(dashCheckValue)) {
    report("warn", "em-dash", source, line, role, value,
      "Review whether the dash helps clarity or rhythm, especially alongside other dashes.");
  }
  for (const booster of BOOSTERS) {
    if (new RegExp(`\\b${booster}\\b`, "i").test(value)) {
      report("warn", "booster-adjective", source, line, role, value,
        `Consider what "${booster}" adds in context. Keep it if it conveys meaning or suits the invitation; claims need support.`);
      break;
    }
  }
}

// Repeated openings can feel mechanical, while parallel wording can help
// readers compare related items. Flag sets for an editor to assess together.
function checkRepeatedFrames(label, entries) {
  const frames = new Map();
  for (const { source, value } of entries) {
    const frame = value.toLowerCase().split(/\s+/).slice(0, 3).join(" ");
    if (!frames.has(frame)) frames.set(frame, []);
    frames.get(frame).push({ source, value });
  }
  const threshold = Math.max(2, Math.ceil(entries.length / 3));
  for (const [frame, group] of frames) {
    if (group.length < threshold) continue;
    for (const { source, value } of group) {
      report("warn", "repeated-opening-frame", source, null, label, value,
        `${group.length} of ${entries.length} ${label} strings open with "${frame}". Review whether the parallel wording helps comparison or feels repetitive.`);
    }
  }
}

async function scan(directory, type) {
  const files = await listFiles(path.join(CONTENT_DIR, directory));
  const descriptions = [];
  const summaries = [];

  for (const filename of files) {
    const source = `${directory}/${filename}`;
    const fileText = await readFile(path.join(CONTENT_DIR, directory, filename), "utf8");
    const raw = maskComments(fileText);
    const suppressed = suppressedLines(fileText);
    const parsed = matter(fileText);

    const description = parsed.data.description;
    if (description) {
      descriptions.push({ source, value: description });
      if (description.length > DESCRIPTION_MAX) {
        report("error", "description-too-long", source, lineOf(raw, description), "description", description,
          `${description.length} characters. Search results truncate near ${DESCRIPTION_MAX}.`);
      }
      checkText("description", description, source, raw, suppressed, { checkLists: true, checkEmDash: true });
    }

    const summary = parsed.data.summary;
    if (summary) {
      summaries.push({ source, value: summary });
      if (/^(A|An|The)\s/.test(summary)) {
        report("warn", "summary-noun-phrase", source, lineOf(raw, summary), "summary", summary,
          "Check that this opening is specific and reads well across the page, meta description, and card.");
      }
      checkText("summary", summary, source, raw, suppressed, { checkLists: true, checkEmDash: true });
    }

    const primaryGuidance = parsed.data.primaryGuidance;
    if (primaryGuidance) {
      checkText("kicker", primaryGuidance.kicker, source, raw, suppressed);
      checkText("heading", primaryGuidance.title, source, raw, suppressed);
      checkText("lede", primaryGuidance.description, source, raw, suppressed, { checkLists: true, checkEmDash: true });
      for (const link of primaryGuidance.links || []) {
        checkText("link", link.label, source, raw, suppressed);
      }
    }

    const rendered = markdown.render(parsed.content);
    const $ = load(`<div data-language-check>${rendered}</div>`, { decodeEntities: false });
    $("[data-language-check] h1, [data-language-check] h2, [data-language-check] h3, [data-language-check] h4").each((_, element) => {
      checkText("heading", $(element).text().trim(), source, raw, suppressed);
    });
    $("[data-language-check] .home-kicker").each((_, element) => {
      checkText("kicker", $(element).text().trim(), source, raw, suppressed);
    });
    for (const element of $("[data-language-check] p.lead, [data-language-check] p.hub-lede").toArray()) {
      checkText("lede", $(element).text().trim(), source, raw, suppressed, { checkLists: true, checkEmDash: true });
    }
    const bodySelector = [
      "[data-language-check] p:not(.lead):not(.hub-lede)",
      "[data-language-check] li:not(:has(p)):not(:has(li))",
      "[data-language-check] dd",
      "[data-language-check] td",
    ].join(", ");
    for (const element of $(bodySelector).toArray()) {
      let value = $(element).text().replace(/\s+/g, " ").trim();
      if (!value) continue;

      // Newsletter entries conventionally lead with a linked title and dash.
      // The guide allows that dash; inspect the editor-authored description.
      if (directory === "newsletters") {
        const linkedTitle = $(element).find("strong").first().text().replace(/\s+/g, " ").trim();
        const titleIndex = linkedTitle ? value.indexOf(linkedTitle) : -1;
        if (titleIndex >= 0 && titleIndex < 8) {
          value = value.slice(titleIndex + linkedTitle.length).replace(/^\s*[—–:-]\s*/, "").trim();
        }
      }

      checkText("body", value, source, raw, suppressed, { checkLists: true, checkEmDash: true });
    }
  }

  checkRepeatedFrames(`${type} description`, descriptions);
  if (summaries.length) checkRepeatedFrames(`${type} summary`, summaries);
}

// The homepage hero is the most-read copy on the site and lives in JSON rather
// than a page file, so it needs its own pass.
async function scanHero() {
  const source = "home/hero.json";
  const fileText = await readFile(path.join(CONTENT_DIR, "home", "hero.json"), "utf8");
  const raw = maskComments(fileText);
  const suppressed = suppressedLines(fileText);
  for (const slide of JSON.parse(fileText).slides || []) {
    const heading = [slide.title, slide.accent].filter(Boolean).join(" ");
    if (heading) checkText("heading", heading, source, raw, suppressed);
    if (slide.description) {
      checkText("lede", slide.description, source, raw, suppressed, { checkLists: true, checkEmDash: true });
    }
    if (slide.linkLabel) checkText("kicker", slide.linkLabel, source, raw, suppressed);
  }
}

await scan("pages", "page");
await scan("use-cases", "use-case");
await scan("newsletters", "newsletter");
await scanHero();

async function scanRoadmap() {
  const source = "roadmap/milestones.json";
  const fileText = await readFile(path.join(CONTENT_DIR, "roadmap", "milestones.json"), "utf8");
  const raw = maskComments(fileText);
  const suppressed = suppressedLines(fileText);
  const roadmap = JSON.parse(fileText);
  const values = [
    roadmap.description,
    ...(roadmap.items || []).flatMap((item) => [item.summary, ...(item.details || [])]),
  ].filter(Boolean);

  for (const value of values) {
    checkText("roadmap narrative", value, source, raw, suppressed, { checkLists: true, checkEmDash: false });
  }
}

await scanRoadmap();

const errors = findings.filter((finding) => finding.severity === "error");
const warnings = findings.filter((finding) => finding.severity === "warn");
const byRule = {};
for (const finding of findings) byRule[finding.rule] = (byRule[finding.rule] || 0) + 1;

const report_ = {
  checkedAt: new Date().toISOString(),
  guide: "docs/voice-and-language.md",
  precisionTerms: PRECISION_TERMS,
  counts: { errors: errors.length, warnings: warnings.length, byRule },
  findings,
};

await mkdir(REPORT_DIR, { recursive: true });
await writeFile(path.join(REPORT_DIR, "language.json"), `${JSON.stringify(report_, null, 2)}\n`);

process.stdout.write(`${JSON.stringify(report_.counts, null, 2)}\n`);
for (const finding of findings.slice(0, 30)) {
  process.stdout.write(`${finding.severity === "error" ? "ERROR" : " warn"}  ${finding.source}${finding.line ? `:${finding.line}` : ""}  [${finding.rule}] ${finding.text}\n`);
}
if (findings.length > 30) process.stdout.write(`…and ${findings.length - 30} more. See reports/language.json.\n`);

if (errors.length && STRICT) {
  process.stderr.write(`Language check failed with ${errors.length} errors. See reports/language.json.\n`);
  process.exit(1);
}
process.stdout.write(errors.length ? "Language check finished with errors (not blocking).\n" : "Language check passed.\n");
