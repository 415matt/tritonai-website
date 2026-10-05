import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import * as cheerio from "cheerio";
import { readPublicPage } from "./lib/public-page-fetch.mjs";

const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const installer = JSON.parse(await readFile("content/harness/installer.json", "utf8"));
const releases = JSON.parse(await readFile("content/harness/releases.json", "utf8"));
const summaries = JSON.parse(await readFile("content/harness/release-summaries.json", "utf8"));
const currentSummary = summaries.releases[releases.latestTag];
const deadline = Date.now() + 25 * 60 * 1000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let published = process.argv.includes("--public-only");
while (!published && Date.now() < deadline) {
  const response = await fetch(`https://api.github.com/repos/bpollak/tritonai-website/actions/workflows/cascade-upload.yml/runs?head_sha=${sha}&event=push&per_page=10`, { headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Publication status request failed (${response.status}).`);
  const run = (await response.json()).workflow_runs.find((entry) => entry.head_sha === sha && entry.head_branch === "main");
  if (run?.status === "completed") {
    if (run.conclusion !== "success") throw new Error(`Cascade publication failed: ${run.html_url}`);
    published = true;
    break;
  }
  await sleep(20000);
}
if (!published) throw new Error("Timed out waiting for this commit's Cascade publication.");
const routes = ["/developer-apis/start.html", "/developer-apis/harness.html", "/developer-apis/harness-release-notes.html", "/developer-apis/faq.html", "/developer-apis/harness-privacy.html", "/developer-apis/citizen-developer.html", "/developer-apis/index.html", "/skills/index.html"];
while (Date.now() < deadline) {
  let current = true;
  for (const route of routes) {
    const html = await readPublicPage(`https://tritonai.ucsd.edu${route}?release=${sha.slice(0, 12)}`);
    if (html === null) {
      current = false;
      break;
    }
    const $ = cheerio.load(html);
    if (route.endsWith("harness-release-notes.html")) {
      if (!$("main#main-content").text().includes(releases.latestTag)) current = false;
    } else {
      const versions = $("main#main-content [data-harness-version]").toArray();
      if (!versions.length || versions.some((element) => $(element).text().trim() !== releases.latestTag.slice(1))) current = false;
    }
    $("main#main-content [data-harness-guidance]").each((_, element) => {
      const topic = $(element).attr("data-harness-guidance");
      const expected = currentSummary.guidance[topic].map((text) => topic === "setup" ? text.replace(/(?<!TritonAI )\bHarness\b/g, "TritonAI Harness") : text);
      const actual = $(element).find("li").toArray().map((item) => $(item).text().trim());
      if (JSON.stringify(actual) !== JSON.stringify(expected)) current = false;
    });
    $("main#main-content [data-harness-current-highlights]").each((_, element) => {
      const actual = $(element).find("li").toArray().map((item) => $(item).text().trim());
      if (JSON.stringify(actual) !== JSON.stringify(currentSummary.highlights)) current = false;
    });
    if (route.endsWith("harness-release-notes.html") && currentSummary.highlights.some((text) => !$("main#main-content").text().includes(text))) current = false;
    if (route.endsWith("start.html") && (!html.includes(installer.guided.platforms.mac.downloadUrl) || !html.includes(installer.guided.platforms.windows.downloadUrl))) current = false;
  }
  if (current) {
    console.log(`Verified ${releases.latestTag} on all ${routes.length} public pages for ${sha}.`);
    process.exit(0);
  }
  await sleep(20000);
}
throw new Error("Cascade completed, but the public pages did not finish updating.");
