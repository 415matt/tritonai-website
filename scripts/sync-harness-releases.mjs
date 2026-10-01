import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { HARNESS_REPOSITORY, GUIDED_INSTALLER_REPOSITORY, installerFromRelease, guidedInstallerFromRelease, releaseSnapshot, releaseSummaryIssues } from "./lib/harness-releases.mjs";

const check = process.argv.includes("--check");
const candidateIndex = process.argv.indexOf("--candidate-dir");
const candidateDir = candidateIndex < 0 ? null : process.argv[candidateIndex + 1];
if (candidateIndex >= 0 && (!candidateDir || candidateDir.startsWith("--"))) throw new Error("--candidate-dir requires a directory.");
if (candidateDir && check) throw new Error("Choose --check or --candidate-dir.");
const token = process.env.HARNESS_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
const headers = { Accept: "application/vnd.github+json", "User-Agent": "tritonai-website-harness-sync", "X-GitHub-Api-Version": "2026-03-10" };
if (token) headers.Authorization = `Bearer ${token}`;
async function github(endpoint, repository = HARNESS_REPOSITORY) {
  const response = await fetch(`https://api.github.com/repos/${repository}${endpoint}`, { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Harness release API returned ${response.status}; saved notes and downloads were preserved.`);
  return response.json();
}
const installerFile = "content/harness/installer.json";
const releasesFile = "content/harness/releases.json";
const summariesFile = "content/harness/release-summaries.json";
const installer = JSON.parse(await readFile(installerFile, "utf8"));
const current = JSON.parse(await readFile(releasesFile, "utf8").catch((error) => { if (error.code === "ENOENT") return "null"; throw error; }));
const summaries = JSON.parse(await readFile(summariesFile, "utf8"));
const releases = [];
let complete = false;
for (let page = 1; page <= 10; page++) {
  const batch = await github(`/releases?per_page=100&page=${page}`);
  if (!Array.isArray(batch)) throw new Error("Unexpected Harness release API response.");
  releases.push(...batch);
  if (batch.length < 100) { complete = true; break; }
}
if (!complete) throw new Error("Release history exceeded the pagination limit; saved content was preserved.");
const latest = await github("/releases/latest");
const date = new Date().toISOString().slice(0, 10);
const snapshot = releaseSnapshot(releases, latest.tag_name, current?.lastReviewed || date);
const changed = JSON.stringify(current) !== JSON.stringify(snapshot);
if (changed) snapshot.lastReviewed = date;
let nextInstaller = installerFromRelease(latest, installer, installer.lastReviewed);
const guidedRelease = await github("/releases/latest", GUIDED_INSTALLER_REPOSITORY);
nextInstaller.guided = guidedInstallerFromRelease(guidedRelease, installer.guided, installer.guided.lastReviewed);
if (JSON.stringify(nextInstaller.guided) !== JSON.stringify(installer.guided)) nextInstaller.guided.lastReviewed = date;
const installerChanged = JSON.stringify(installer) !== JSON.stringify(nextInstaller);
if (installerChanged) nextInstaller.lastReviewed = date;
const issues = releaseSummaryIssues(snapshot, summaries, nextInstaller);
if (candidateDir) {
  // The local Harness job stages candidates away from the website checkout.
  const directory = path.resolve(candidateDir);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const files = { "releases.json": snapshot, "installer.json": nextInstaller, "release-summaries.json": summaries, "source-notes.json": releases.filter((release) => snapshot.releases.some((saved) => saved.tag === release.tag_name)).map((release) => ({ tag: release.tag_name, body: release.body || "" })) };
  for (const [filename, value] of Object.entries(files)) await writeFile(path.join(directory, filename), `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({ latestTag: snapshot.latestTag, stableReleases: snapshot.releases.length, changed, installerChanged, reviewIssues: issues }));
} else if (check) {
  console.log(JSON.stringify({ latestTag: snapshot.latestTag, stableReleases: snapshot.releases.length, changed, installerChanged, reviewIssues: issues }, null, 2));
  if (changed || installerChanged || issues.length) process.exitCode = 1;
} else {
  // Complete source and artifact validation before writing either saved file.
  if (changed) await writeFile(releasesFile, `${JSON.stringify(snapshot, null, 2)}\n`);
  if (installerChanged) await writeFile(installerFile, `${JSON.stringify(nextInstaller, null, 2)}\n`);
  console.log(`Synced ${snapshot.releases.length} stable Harness releases; latest is ${snapshot.latestTag}. Drafts and prereleases excluded.`);
  if (issues.length) {
    console.error(issues.join("\n"));
    console.error("Review the linked source notes and update release-summaries.json before building or publishing.");
    process.exitCode = 1;
  }
}
