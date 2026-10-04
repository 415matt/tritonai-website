import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = path.resolve("scripts/sync-ai-news.mjs");

function runSync(sourceFile, editionFile, outputDir, ...extra) {
  return spawnSync(
    process.execPath,
    [script, `--source-file=${sourceFile}`, `--edition-file=${editionFile}`, `--output-dir=${outputDir}`, ...extra],
    { encoding: "utf8" },
  );
}

function archiveFixture(...dates) {
  const articles = dates
    .map((date) => `<article id="${date}" class="editorial-panel p-6"><h3><a href="/ucsd-ai-news/${date}">${date}</a></h3></article>`)
    .join("\n");
  return `<html><body><section id="ai-updates">${articles}</section></body></html>`;
}

function editionFixture(bodyHtml) {
  return `<html><body><main id="main-content"><article class="reading-copy mx-auto max-w-4xl px-6 py-8">${bodyHtml}</article></main></body></html>`;
}

const validBody = `
  <h2>What's New in Your AI Tools</h2>
  <h3>TritonGPT</h3>
  <ul><li><a href="/ucsd-ai-news">A campus update</a> is available.</li>
  <li><a href="https://tritonai.ucsd.edu/tritongpt/release-notes/5-1-2026-release.html">Release notes</a></li></ul>
  <p>Contact the <a href="/cdn-cgi/l/email-protection#5c282e352833323d351c293f2f3872393829">TritonAI team</a>.</p>
  <script>alert("unsafe")</script>
  <h2>Coming Up: Trainings &amp; Workshops</h2>
  <p>No upcoming events.</p>
  <h2>TritonAI News</h2>
  <p>No new releases.</p>`;

test("syncs validated newsletter markup and sanitizes links", async () => {
  const workDir = await mkdtemp(path.join(tmpdir(), "tritonai-news-sync-"));
  const archiveFile = path.join(workDir, "archive.html");
  const editionFile = path.join(workDir, "edition.html");
  const outputDir = path.join(workDir, "newsletters");

  try {
    await writeFile(archiveFile, archiveFixture("2026-07-27"));
    await writeFile(editionFile, editionFixture(validBody));
    const result = runSync(archiveFile, editionFile, outputDir);
    assert.equal(result.status, 0, result.stderr);
    const output = await readFile(path.join(outputDir, "ucsd-ai-newsletter-2026-07-27.md"), "utf8");
    assert.match(output, /date: 2026-07-27/);
    assert.match(output, /\[A campus update\]\(https:\/\/brettcpollak\.com\/ucsd-ai-news\)/);
    assert.match(output, /\[Release notes\]\(https:\/\/tritonai\.ucsd\.edu\/about\/tritonai-updates\.html\)/);
    assert.match(output, /\[tritonai@ucsd\.edu\]\(mailto:tritonai@ucsd\.edu\)/);
    assert.doesNotMatch(output, /unsafe|script/i);

    const check = runSync(archiveFile, editionFile, outputDir, "--check");
    assert.equal(check.status, 0, check.stderr);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
});

test("rejects a source edition that reports zero items", async () => {
  const workDir = await mkdtemp(path.join(tmpdir(), "tritonai-news-check-"));
  const archiveFile = path.join(workDir, "archive.html");
  const editionFile = path.join(workDir, "edition.html");
  const outputDir = path.join(workDir, "newsletters");

  const emptyBody = `
  <h2>What's New in Your AI Tools</h2><p>No new updates this week.</p>
  <h2>Coming Up: Trainings &amp; Workshops</h2><p>No upcoming events.</p>
  <h2>TritonAI News</h2><p>No new releases.</p>`;

  try {
    await writeFile(archiveFile, archiveFixture("2026-07-27"));
    await writeFile(editionFile, editionFixture(emptyBody));
    const result = runSync(archiveFile, editionFile, outputDir, "--check");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /reports no items; refusing to synchronize an empty edition/);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
});
