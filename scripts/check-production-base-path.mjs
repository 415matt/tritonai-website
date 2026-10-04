import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const leakedPath = /\/tritonai-website(?=[/?#\s"'<>`)]|$)/;
const textExtensions = new Set([".html", ".css", ".js", ".json", ".xml", ".txt", ".svg"]);

export function hasProductionBasePathLeak(text) {
  let officialLeak = false;
  // External links may legitimately contain the GitHub Pages project path.
  // Absolute links to our own production host still need the root-path check.
  const localText = text.replace(/(?:https?:)?\/\/[^\s"'<>`]+/g, (value) => {
    try {
      const url = new URL(value.startsWith("//") ? `https:${value}` : value);
      if (url.hostname === "tritonai.ucsd.edu" && leakedPath.test(url.pathname)) officialLeak = true;
    } catch { /* The remaining local-path scan still runs. */ }
    return "";
  });
  return officialLeak || leakedPath.test(localText);
}

export async function findProductionBasePathLeaks(directory) {
  const failures = [];
  async function walk(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const filename = path.join(folder, entry.name);
      if (entry.isDirectory()) await walk(filename);
      else if (textExtensions.has(path.extname(filename)) && hasProductionBasePathLeak(await readFile(filename, "utf8"))) failures.push(filename);
    }
  }
  await walk(directory);
  return failures;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const failures = await findProductionBasePathLeaks(path.resolve(process.argv[2] || "dist"));
  if (failures.length) {
    console.error("Production paths contain the GitHub Pages base path:");
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else console.log("Production base path check passed.");
}
