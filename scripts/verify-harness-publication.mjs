import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { readPublicPage } from "./lib/public-page-fetch.mjs";
import { HARNESS_PUBLIC_ROUTES, harnessPublicationIssues } from "./lib/harness-publication.mjs";

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
const routes = HARNESS_PUBLIC_ROUTES;
let lastIssues = [];
while (Date.now() < deadline) {
  const issues = [];
  for (const route of routes) {
    const html = await readPublicPage(`https://tritonai.ucsd.edu${route}?release=${sha.slice(0, 12)}`);
    if (html === null) {
      issues.push(`${route}: connection interrupted`);
      continue;
    }
    issues.push(...harnessPublicationIssues(route, html, releases, currentSummary, installer).map((issue) => `${route}: ${issue}`));
  }
  if (!issues.length) {
    console.log(`Verified ${releases.latestTag} on all ${routes.length} public pages for ${sha}.`);
    process.exit(0);
  }
  if (JSON.stringify(issues) !== JSON.stringify(lastIssues)) console.warn(`Public verification pending:\n${issues.join("\n")}`);
  lastIssues = issues;
  await sleep(20000);
}
throw new Error(`Public pages did not match the saved release:\n${lastIssues.join("\n")}`);
