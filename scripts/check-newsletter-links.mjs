import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { checkNewsletterLinks, extractNewsletterLinks } from "./lib/newsletter-links.mjs";

const DEFAULT_NEWSLETTER_DIR = path.resolve("content/newsletters");
const requestedFiles = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
const files = requestedFiles.length
  ? requestedFiles.map((filename) => path.resolve(filename))
  : (await readdir(DEFAULT_NEWSLETTER_DIR))
      .filter((filename) => filename.endsWith(".md"))
      .sort()
      .map((filename) => path.join(DEFAULT_NEWSLETTER_DIR, filename));

if (!files.length) throw new Error("No newsletter Markdown files were provided or found");

const sourcesByUrl = new Map();
for (const filename of files) {
  const source = await readFile(filename, "utf8");
  for (const url of extractNewsletterLinks(source)) {
    const sources = sourcesByUrl.get(url) || [];
    sources.push(path.relative(process.cwd(), filename));
    sourcesByUrl.set(url, sources);
  }
}

import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);

// Some UCSD hosts (calendar.ucsd.edu) serve an incomplete certificate chain that
// Node's bundled CA store cannot verify, while the macOS system trust store can.
// Fall back to curl for hosts whose verification fails only under Node.
const curlFetch = async (url, { method, timeoutMs = 15_000 } = {}) => {
  try {
    const { stdout, stderr } = await execFileAsync(
      "/usr/bin/curl",
      ["-s", "-o", "/dev/null", "-w", "%{http_code}", "-L", "--max-time", String(Math.ceil(timeoutMs / 1000)), "-X", method, url],
      { timeout: timeoutMs + 5_000 },
    );
    const status = Number.parseInt(stdout.trim(), 10);
    return { ok: status >= 200 && status < 400, status };
  } catch (error) {
    return { ok: false, status: "FETCH_ERROR", error: error.message };
  }
};

const nodeResults = await checkNewsletterLinks([...sourcesByUrl.keys()]);
const results = [];
for (const result of nodeResults) {
  if (result.ok || !/\.ucsd\.edu$|\.ucsd\.edu\//.test(result.url)) {
    results.push(result);
    continue;
  }
  const curlResult = await curlFetch(result.url, { method: "GET" });
  if (curlResult.ok) {
    results.push({ ...result, ok: true, status: curlResult.status, attempts: [...result.attempts, { method: "GET (curl)", status: curlResult.status, ok: true }] });
  } else {
    results.push(result);
  }
}
const failures = results.filter((result) => !result.ok);

process.stdout.write(
  `Checked ${results.length} unique HTTP(S) link${results.length === 1 ? "" : "s"} in ${files.length} newsletter file${files.length === 1 ? "" : "s"}; ${failures.length} failed.\n`,
);

for (const failure of failures) {
  const attempts = failure.attempts
    .map((attempt) => `${attempt.method} ${attempt.status}${attempt.error ? ` (${attempt.error})` : ""}`)
    .join(", ");
  process.stderr.write(
    `::error file=${sourcesByUrl.get(failure.url)[0]}::Broken newsletter link: ${failure.url} [${attempts}]\n`,
  );
}

if (failures.length) process.exitCode = 1;
