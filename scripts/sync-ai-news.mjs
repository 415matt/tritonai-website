import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import TurndownService from "turndown";

const DEFAULT_SOURCE_URL = "https://brettcpollak.com/ucsd-ai-news";
const DEFAULT_OUTPUT_DIR = path.resolve("content/newsletters");
const NEWSLETTER_FILENAME = /^ucsd-ai-newsletter-(\d{4}-\d{2}-\d{2})\.md$/;

function getArg(name, fallback = null) {
  const prefix = `--${name}=`;
  const found = process.argv.find((argument) => argument.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function decodeCloudflareEmail(value) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length < 4 || value.length % 2 !== 0) return null;
  const key = Number.parseInt(value.slice(0, 2), 16);
  let decoded = "";
  for (let index = 2; index < value.length; index += 2) {
    decoded += String.fromCharCode(Number.parseInt(value.slice(index, index + 2), 16) ^ key);
  }
  return decoded.includes("@") ? decoded : null;
}

function safeUrl(value, baseUrl) {
  try {
    const parsed = new URL(value, baseUrl);
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return null;
    if (
      parsed.hostname === "tritonai.ucsd.edu" &&
      parsed.pathname === "/tritongpt/release-notes/5-1-2026-release.html"
    ) {
      parsed.pathname = "/about/tritonai-updates.html";
    }
    return parsed.href;
  } catch {
    return null;
  }
}

function sanitizeBody($, body, sourceUrl) {
  body.find("script, style, iframe, object, embed, form, input, button").remove();
  body.find("*").each((_, element) => {
    for (const attribute of Object.keys(element.attribs || {})) {
      if (/^on/i.test(attribute)) $(element).removeAttr(attribute);
    }
  });

  body.find("a").each((_, element) => {
    const link = $(element);
    const href = link.attr("href");
    const encodedEmail = link.find("[data-cfemail]").first().attr("data-cfemail");
    const encodedEmailFromHref = href?.match(/\/cdn-cgi\/l\/email-protection#([0-9a-f]+)/i)?.[1];
    const decodedEmail = decodeCloudflareEmail(encodedEmail || encodedEmailFromHref || "");
    if (decodedEmail) {
      link.attr("href", `mailto:${decodedEmail}`).text(decodedEmail);
      return;
    }

    const normalized = href ? safeUrl(href, sourceUrl) : null;
    if (normalized) {
      link.attr("href", normalized);
    } else {
      link.replaceWith(link.text());
    }
  });

  body.find("img").each((_, element) => {
    const image = $(element);
    const src = image.attr("src");
    const normalized = src ? safeUrl(src, sourceUrl) : null;
    if (normalized) {
      image.attr("src", normalized);
    } else {
      image.remove();
    }
  });
}

async function readSource(sourceUrl, sourceFile) {
  if (sourceFile) return readFile(path.resolve(sourceFile), "utf8");

  const response = await fetch(sourceUrl, {
    headers: {
      Accept: "text/html",
      "User-Agent": "TritonAI-Website-Newsletter-Sync/1.0",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Newsletter source returned HTTP ${response.status}`);

  const finalUrl = new URL(response.url);
  if (finalUrl.protocol !== "https:" || finalUrl.hostname !== "brettcpollak.com") {
    throw new Error(`Newsletter source redirected to an unexpected host: ${finalUrl.hostname}`);
  }
  return response.text();
}

function editionUrl(sourceUrl, date) {
  const base = new URL(sourceUrl);
  return `${base.origin}/ucsd-ai-news/${date}`;
}

async function fetchEdition(sourceUrl, date) {
  const url = editionUrl(sourceUrl, date);
  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "TritonAI-Website-Newsletter-Sync/1.1",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Edition ${date} returned HTTP ${response.status}`);
  return response.text();
}

function extractEditionList(html) {
  const $ = load(html, { decodeEntities: false });
  const dates = [];
  for (const article of $("article.editorial-panel").toArray()) {
    const id = $(article).attr("id") || "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(id)) dates.push(id);
  }
  if (!dates.length) throw new Error("No newsletter editions were found in the source page");
  return dates;
}

function extractEdition(html, sourceUrl, date) {
  const $ = load(html, { decodeEntities: false });
  const turndown = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    headingStyle: "atx",
    strongDelimiter: "**",
  });

  turndown.addRule("preserveInlineCode", {
    filter: ["code"],
    replacement(content) {
      return `\`${content}\``;
    },
  });

  const filename = `ucsd-ai-newsletter-${date}.md`;
  const article = $("article.reading-copy").first();
  const body = article.clone();
  if (!body.length) throw new Error(`Incomplete newsletter markup for ${filename}`);
  const items = body.find("li").length;
  if (!Number.isInteger(items) || items < 1) {
    throw new Error(`Newsletter edition ${filename} reports no items; refusing to synchronize an empty edition`);
  }

  const headings = body.find("h2").map((_, element) => $(element).text().trim()).get();
  if (!headings.includes("What's New in Your AI Tools") || !headings.includes("TritonAI News")) {
    throw new Error(`Required newsletter sections are missing from ${filename}`);
  }

  body.find("p").each((_, element) => {
    const text = $(element).text().trim();
    if (/^Have feedback on this newsletter\?/.test(text)) $(element).remove();
  });

  sanitizeBody($, body, sourceUrl);
  const markdown = turndown.turndown(body.html() || "").trim();
  const title = `UC San Diego AI Weekly · ${new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}`;
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `date: ${date}`,
    `source: ${JSON.stringify(filename)}`,
    `items: ${items}`,
    "---",
    "",
  ].join("\n");

  return {
    filename,
    content: `${frontmatter}${markdown}\n`,
  };
}

async function main() {
  const sourceUrl = getArg("source-url", DEFAULT_SOURCE_URL);
  const sourceFile = getArg("source-file");
  const editionFile = getArg("edition-file");
  const outputDir = path.resolve(getArg("output-dir", DEFAULT_OUTPUT_DIR));
  const checkOnly = hasFlag("check");
  const listHtml = await readSource(sourceUrl, sourceFile);
  const dates = extractEditionList(listHtml);

  const changes = [];
  await mkdir(outputDir, { recursive: true });
  let editions = 0;
  for (const date of dates) {
    let editionHtml;
    if (editionFile) {
      // Local fixture mode: one edition file stands in for every date (tests).
      editionHtml = await readFile(editionFile, "utf8");
    } else if (sourceFile) {
      // Source-file mode without an edition file: the source itself is one edition page.
      editionHtml = listHtml;
    } else {
      editionHtml = await fetchEdition(sourceUrl, date);
    }
    const edition = extractEdition(editionHtml, sourceUrl, date);
    editions += 1;
    const destination = path.join(outputDir, edition.filename);
    let current = null;
    try {
      current = await readFile(destination, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (current === edition.content) continue;
    changes.push(edition.filename);
    if (!checkOnly) await writeFile(destination, edition.content);
  }

  process.stdout.write(
    `${checkOnly ? "Checked" : "Synchronized"} ${editions} editions from ${sourceUrl}; ${changes.length} ${checkOnly ? "pending" : "written"}.\n`,
  );
  for (const filename of changes) process.stdout.write(`- ${filename}\n`);
  if (checkOnly && changes.length) process.exitCode = 1;
}

await main();
