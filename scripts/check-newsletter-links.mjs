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

const results = await checkNewsletterLinks([...sourcesByUrl.keys()]);
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
